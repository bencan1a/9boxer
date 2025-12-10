"""Create a multi-resolution Windows ICO file from PNG sources."""
from pathlib import Path
from PIL import Image

def create_ico():
    """Create a multi-resolution ICO file from PNG sources."""
    build_dir = Path(__file__).parent.parent / "build"

    # Icon sizes to include in the ICO (in order of importance)
    sizes = [256, 128, 64, 48, 32, 16]

    # Load all available PNG files
    images = []
    for size in sizes:
        png_path = build_dir / f"icon_{size}x{size}.png"
        if png_path.exists():
            img = Image.open(png_path)
            print(f"[OK] Loaded {size}x{size} PNG")
            images.append(img)
        else:
            print(f"[SKIP] Missing {size}x{size} PNG, skipping")

    if not images:
        print("ERROR: No PNG files found!")
        return False

    # Ensure we have at least 256x256
    if not (build_dir / "icon_256x256.png").exists():
        print("ERROR: 256x256 PNG is required!")
        return False

    # Save as multi-resolution ICO
    ico_path = build_dir / "icon.ico"
    images[0].save(
        ico_path,
        format='ICO',
        sizes=[(img.width, img.height) for img in images]
    )

    print(f"\n[SUCCESS] Created {ico_path}")
    print(f"  File size: {ico_path.stat().st_size:,} bytes")
    print(f"  Resolutions included: {len(images)}")
    return True

if __name__ == "__main__":
    import sys
    success = create_ico()
    sys.exit(0 if success else 1)
