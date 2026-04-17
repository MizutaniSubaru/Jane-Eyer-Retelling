from __future__ import annotations

from collections import deque
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
TARGET = ROOT / "src" / "assets" / "portraits"

# The current replacement set lives at the repo root. The horizontal duo image
# is intentionally skipped for now.
ASSETS = {
    "jane-bright-neutral": ROOT / "photo_7_2026-04-17_16-46-40.jpg",
    "jane-dim-neutral": ROOT / "photo_9_2026-04-17_16-46-40.jpg",
    "jane-bright-sad": ROOT / "photo_6_2026-04-17_16-46-40.jpg",
    "jane-dim-sad": ROOT / "photo_6_2026-04-17_16-46-40.jpg",
    "jane-bright-angry": ROOT / "photo_8_2026-04-17_16-46-40.jpg",
    "jane-dim-angry": ROOT / "photo_8_2026-04-17_16-46-40.jpg",
    "jane-bright-warm": ROOT / "photo_11_2026-04-17_16-46-40.jpg",
    "jane-dim-warm": ROOT / "photo_11_2026-04-17_16-46-40.jpg",
    "rochester-bright-neutral": ROOT / "photo_4_2026-04-17_16-46-40.jpg",
    "rochester-dim-neutral": ROOT / "photo_4_2026-04-17_16-46-40.jpg",
    "rochester-bright-sad": ROOT / "photo_3_2026-04-17_16-46-40.jpg",
    "rochester-dim-sad": ROOT / "photo_3_2026-04-17_16-46-40.jpg",
    "rochester-bright-angry": ROOT / "photo_5_2026-04-17_16-46-40.jpg",
    "rochester-dim-angry": ROOT / "photo_5_2026-04-17_16-46-40.jpg",
    "rochester-bright-warm": ROOT / "photo_2_2026-04-17_16-46-40.jpg",
    "rochester-dim-warm": ROOT / "photo_2_2026-04-17_16-46-40.jpg",
    "rochester-back": ROOT / "photo_1_2026-04-17_16-46-40.jpg",
}


def average_corner_color(image: Image.Image, sample_size: int = 24) -> tuple[int, int, int]:
    width, height = image.size
    boxes = [
        (0, 0, sample_size, sample_size),
        (width - sample_size, 0, width, sample_size),
        (
            max(0, width // 2 - sample_size // 2),
            0,
            min(width, width // 2 + sample_size // 2),
            sample_size,
        ),
    ]
    totals = [0, 0, 0]
    pixels = 0
    for left, top, right, bottom in boxes:
        region = image.crop((left, top, right, bottom)).convert("RGB")
        for r, g, b in region.getdata():
            totals[0] += r
            totals[1] += g
            totals[2] += b
            pixels += 1
    return tuple(channel // pixels for channel in totals)


def is_background_pixel(
    rgb: tuple[int, int, int],
    background: tuple[int, int, int],
    tolerance: int = 84,
    min_brightness: int = 208,
) -> bool:
    distance = sum(abs(channel - base) for channel, base in zip(rgb, background))
    brightness = sum(rgb) // 3
    return brightness >= min_brightness and distance <= tolerance


def keep_largest_foreground_component(image: Image.Image) -> Image.Image:
    width, height = image.size
    alpha = image.getchannel("A")
    visited = [[False] * width for _ in range(height)]
    largest_component: set[tuple[int, int]] = set()

    for y in range(height):
        for x in range(width):
            if visited[y][x] or alpha.getpixel((x, y)) == 0:
                continue

            component: set[tuple[int, int]] = set()
            queue: deque[tuple[int, int]] = deque([(x, y)])
            visited[y][x] = True

            while queue:
                current_x, current_y = queue.popleft()
                component.add((current_x, current_y))
                for next_x, next_y in (
                    (current_x - 1, current_y),
                    (current_x + 1, current_y),
                    (current_x, current_y - 1),
                    (current_x, current_y + 1),
                ):
                    if (
                        0 <= next_x < width
                        and 0 <= next_y < height
                        and not visited[next_y][next_x]
                        and alpha.getpixel((next_x, next_y)) > 0
                    ):
                        visited[next_y][next_x] = True
                        queue.append((next_x, next_y))

            if len(component) > len(largest_component):
                largest_component = component

    pixels = image.load()
    for y in range(height):
        for x in range(width):
            if alpha.getpixel((x, y)) > 0 and (x, y) not in largest_component:
                r, g, b, _ = pixels[x, y]
                pixels[x, y] = (r, g, b, 0)

    return image


def remove_background(source_path: Path) -> Image.Image:
    image = Image.open(source_path).convert("RGBA")
    rgb = image.convert("RGB")
    width, height = image.size
    background = average_corner_color(rgb)
    background_mask = [[False] * width for _ in range(height)]
    queue: deque[tuple[int, int]] = deque()

    def try_enqueue(x: int, y: int) -> None:
        if background_mask[y][x]:
            return
        if not is_background_pixel(rgb.getpixel((x, y)), background):
            return
        background_mask[y][x] = True
        queue.append((x, y))

    for x in range(width):
        try_enqueue(x, 0)
        try_enqueue(x, height - 1)
    for y in range(height):
        try_enqueue(0, y)
        try_enqueue(width - 1, y)

    while queue:
        x, y = queue.popleft()
        for next_x, next_y in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
            if 0 <= next_x < width and 0 <= next_y < height:
                try_enqueue(next_x, next_y)

    pixels = image.load()
    for y in range(height):
        for x in range(width):
            if background_mask[y][x]:
                r, g, b, _ = pixels[x, y]
                pixels[x, y] = (r, g, b, 0)

    image = keep_largest_foreground_component(image)

    bbox = image.getbbox()
    if bbox is None:
        raise RuntimeError(f"Portrait became empty after masking: {source_path}")

    padding = 10
    left = max(0, bbox[0] - padding)
    top = max(0, bbox[1] - padding)
    right = min(width, bbox[2] + padding)
    bottom = min(height, bbox[3] + padding)
    return image.crop((left, top, right, bottom))


def main() -> None:
    TARGET.mkdir(parents=True, exist_ok=True)
    for name, source_path in ASSETS.items():
        remove_background(source_path).save(TARGET / f"{name}.png")


if __name__ == "__main__":
    main()
