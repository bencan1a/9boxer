#!/usr/bin/env python3
"""Generate app icon with 3x3 grid for Nine Box application."""

from pathlib import Path

from PIL import Image, ImageDraw


def create_ninebox_icon(size: int = 512) -> Image.Image:
    """Create a 3x3 grid icon.

    Args:
        size: Size of the square icon in pixels

    Returns:
        PIL Image with 3x3 grid
    """
    # Create image with white background
    img = Image.new("RGBA", (size, size), (255, 255, 255, 255))
    draw = ImageDraw.Draw(img)

    # Colors
    bg_color = (255, 255, 255, 255)  # White background
    grid_color = (33, 33, 33, 255)  # Dark gray/black lines

    # Calculate grid dimensions with padding
    padding = int(size * 0.1)  # 10% padding on each side
    grid_size = size - (2 * padding)
    cell_size = grid_size // 3
    line_width = max(2, int(size * 0.02))  # 2% of size, minimum 2px

    # Draw cells (3x3 grid)
    for row in range(3):
        for col in range(3):
            x = padding + col * cell_size
            y = padding + row * cell_size

            # Draw cell border
            draw.rectangle(
                [x, y, x + cell_size, y + cell_size], outline=grid_color, width=line_width
            )

    return img


def save_icon_formats(base_img: Image.Image, output_dir: Path) -> None:
    """Save icon in multiple formats and sizes.

    Args:
        base_img: Base image to convert
        output_dir: Directory to save icons
    """
    output_dir.mkdir(parents=True, exist_ok=True)

    # Save high-res PNG
    base_img.save(output_dir / "icon.png", "PNG")
    print("[OK] Saved icon.png (512x512)")

    # Save standard sizes for Linux
    linux_sizes = [16, 32, 48, 64, 128, 256, 512]
    for size in linux_sizes:
        resized = base_img.resize((size, size), Image.Resampling.LANCZOS)
        resized.save(output_dir / f"icon_{size}x{size}.png", "PNG")
        print(f"[OK] Saved icon_{size}x{size}.png")

    # Save ICO for Windows (multi-resolution, up to 512x512 for electron-builder)
    ico_sizes = [(16, 16), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256), (512, 512)]
    ico_images = [base_img.resize(size, Image.Resampling.LANCZOS) for size in ico_sizes]
    ico_images[0].save(output_dir / "icon.ico", format="ICO", sizes=ico_sizes)
    print("[OK] Saved icon.ico (multi-resolution, up to 512x512)")

    print(f"\n[OK] All icons saved to {output_dir}")
    print("\nNote: For macOS .icns generation, you'll need to run:")
    print("  iconutil -c icns icon.iconset")
    print("after creating an icon.iconset directory with properly sized images.")


def main() -> None:
    """Generate Nine Box application icon."""
    # Determine output directory
    script_dir = Path(__file__).parent
    project_root = script_dir.parent
    output_dir = project_root / "frontend" / "build"

    print("Generating Nine Box icon (3x3 grid)...\n")

    # Create base icon at high resolution
    icon_img = create_ninebox_icon(size=512)

    # Save in multiple formats
    save_icon_formats(icon_img, output_dir)


if __name__ == "__main__":
    main()
