#!/usr/bin/env python3
"""Create macOS .icns file from PNG sources.

This script creates a multi-resolution .icns file for macOS builds using pillow.
Note: This is a simplified version that works on most platforms.
For production use on macOS, consider using iconutil for best results.
"""

import subprocess
import sys
from pathlib import Path

from PIL import Image


def create_iconset():
    """Create macOS iconset directory structure."""
    build_dir = Path(__file__).parent.parent / "build"
    iconset_dir = build_dir / "icon.iconset"

    # Create iconset directory
    iconset_dir.mkdir(exist_ok=True)

    # macOS icon sizes - must match specific names for iconutil
    # Each tuple contains: source_size, iconset_name
    icon_mappings = [
        (16, "icon_16x16.png"),
        (32, "icon_16x16@2x.png"),
        (32, "icon_32x32.png"),
        (64, "icon_32x32@2x.png"),
        (128, "icon_128x128.png"),
        (256, "icon_128x128@2x.png"),
        (256, "icon_256x256.png"),
        (512, "icon_256x256@2x.png"),
        (512, "icon_512x512.png"),
        (1024, "icon_512x512@2x.png"),
    ]

    print("Creating macOS iconset...")
    print("=" * 50)

    created_count = 0
    for source_size, iconset_name in icon_mappings:
        source_file = build_dir / f"icon_{source_size}x{source_size}.png"

        if not source_file.exists():
            print(f"[SKIP] Missing source: icon_{source_size}x{source_size}.png")
            continue

        # Copy/resize to iconset
        img = Image.open(source_file)
        target_file = iconset_dir / iconset_name
        img.save(target_file, "PNG")
        print(f"[OK] Created: {iconset_name}")
        created_count += 1

    if created_count == 0:
        print("\n[ERROR] No icon files created!")
        return False

    print(f"\n[OK] Created {created_count} iconset files in {iconset_dir}")

    # Try to create .icns using iconutil (macOS only)
    icns_path = build_dir / "icon.icns"

    try:
        # Check if iconutil is available (macOS only)
        result = subprocess.run(
            ["iconutil", "--version"],
            capture_output=True,
            text=True,
            check=False,
        )

        if result.returncode == 0:
            # iconutil is available, use it
            print("\n[INFO] iconutil detected, creating .icns file...")
            subprocess.run(
                ["iconutil", "-c", "icns", str(iconset_dir), "-o", str(icns_path)],
                check=True,
            )
            print(f"[SUCCESS] Created {icns_path}")
            print(f"  File size: {icns_path.stat().st_size:,} bytes")
            return True
        else:
            raise FileNotFoundError("iconutil not available")

    except (FileNotFoundError, subprocess.CalledProcessError):
        print("\n[INFO] iconutil not available (not on macOS)")
        print("[INFO] The iconset directory has been created for manual conversion.")
        print("\nOptions to create icon.icns:")
        print("  1. On macOS: iconutil -c icns icon.iconset")
        print("  2. Online: Upload icon.iconset folder to https://cloudconvert.com/")
        print("  3. electron-builder will auto-convert from icon.png during build")
        print("\nFor now, electron-builder will handle .icns creation automatically")
        return True


def main():
    """Create macOS iconset and optionally .icns file."""
    success = create_iconset()
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
