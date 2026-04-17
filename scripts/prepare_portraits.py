from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def main() -> None:
    raise SystemExit(
        "Runtime portraits already live in src/assets/portraits/. "
        "The temporary root photo_*.jpg source images have been removed from git. "
        "If you need to regenerate portraits again, bring your private source images "
        "back locally for that one-off task before updating this script."
    )


if __name__ == "__main__":
    main()
