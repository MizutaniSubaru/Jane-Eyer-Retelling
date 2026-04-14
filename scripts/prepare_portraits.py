from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "source"
TARGET = ROOT / "src" / "assets" / "portraits"

ASSETS = {
    "jane-bright-neutral": "a3960cf66d2af49f2d7cebd9556241c1.jpg",
    "jane-bright-warm": "54600352304f761f0a44f73eccd0ef1d.jpg",
    "jane-bright-sad": "fc433f2c43f64adc1ffa48278913d8c6.jpg",
    "jane-bright-angry": "b509ad9165916e48ab5e73a64d73215a.jpg",
    "jane-dim-neutral": "ba729e916aab413fd78ebbea1f43ca46.jpg",
    "jane-dim-warm": "0765a5de6d038d6eda0cbc01b05e5a1d.jpg",
    "jane-dim-sad": "9fa20ba27cc803da1f0e723834e39aaa.jpg",
    "rochester-bright-neutral": "5322ddb19aca8aa31820d7dfcf7a3858.jpg",
    "rochester-bright-sad": "60a76bf81d4b5ad1cc87095d5468db52.jpg",
    "rochester-bright-angry": "2dc3a4290940b1e43e0ca80287edf8fa.jpg",
    "rochester-dim-neutral": "8fd6f8a7b2c9d5496449cc5ddb10147b.jpg",
    "rochester-dim-sad": "c2a48acfcfc30fd072e8464b0250f72c.jpg",
    "rochester-dim-angry": "f61f3c8089de105065df85a67928084d.jpg",
}

EXTRA_ASSETS = {
    "rochester-back": ROOT / "fcbd07990e282c247907af0d4b9befa2.jpg",
}


def is_background(r: int, g: int, b: int) -> bool:
    return max(r, g, b) < 18 or min(r, g, b) > 245


def convert_to_png(source_path: Path, target_path: Path) -> None:
    image = Image.open(source_path).convert("RGBA")
    pixels = image.load()
    width, height = image.size
    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            pixels[x, y] = (r, g, b, 0 if is_background(r, g, b) else a)
    image.save(target_path)


def main() -> None:
    TARGET.mkdir(parents=True, exist_ok=True)
    for name, filename in ASSETS.items():
        convert_to_png(SOURCE / filename, TARGET / f"{name}.png")
    for name, source_path in EXTRA_ASSETS.items():
        convert_to_png(source_path, TARGET / f"{name}.png")


if __name__ == "__main__":
    main()
