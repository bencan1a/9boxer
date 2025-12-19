"""Generate modern 9-box grid icons matching the splash screen design."""

import sys
from pathlib import Path

from PIL import Image, ImageDraw


def interpolate_color(color1, color2, factor):
    """Interpolate between two RGB colors."""
    return tuple(int(c1 + (c2 - c1) * factor) for c1, c2 in zip(color1, color2, strict=False))


def create_gradient_background(width, height):
    """Create a diagonal gradient background matching the splash screen."""
    # Colors from splash screen: #1e3c72 -> #2a5298 -> #7e22ce
    color1 = (30, 60, 114)  # #1e3c72 (dark blue)
    color2 = (42, 82, 152)  # #2a5298 (medium blue)
    color3 = (126, 34, 206)  # #7e22ce (purple)

    img = Image.new("RGBA", (width, height), (255, 255, 255, 0))
    draw = ImageDraw.Draw(img)

    # Create diagonal gradient
    for y in range(height):
        # Calculate position (0-1) along the diagonal
        factor = y / height

        # Interpolate through three colors
        if factor < 0.5:
            # First half: color1 -> color2
            color = interpolate_color(color1, color2, factor * 2)
        else:
            # Second half: color2 -> color3
            color = interpolate_color(color2, color3, (factor - 0.5) * 2)

        draw.line([(0, y), (width, y)], fill=(*color, 255))

    return img


def create_9box_icon(size):
    """Create a 9-box grid icon at the specified size."""
    # Create gradient background
    img = create_gradient_background(size, size)
    draw = ImageDraw.Draw(img)

    # Calculate grid dimensions
    padding = size // 8  # 12.5% padding
    grid_size = size - (2 * padding)
    gap = max(2, size // 40)  # Minimum 2px gap, scaled for larger sizes

    # Adjusted cell size to account for gaps
    adjusted_cell_size = (grid_size - (2 * gap)) // 3

    # Draw 9 cells
    for row in range(3):
        for col in range(3):
            x = padding + (col * (adjusted_cell_size + gap))
            y = padding + (row * (adjusted_cell_size + gap))

            # Center cell is brighter with glow
            if row == 1 and col == 1:
                # Draw glow effect (multiple layers)
                glow_layers = 5
                for i in range(glow_layers, 0, -1):
                    glow_offset = i * 2
                    glow_alpha = int(50 * (1 - i / glow_layers))
                    draw.rounded_rectangle(
                        [
                            x - glow_offset,
                            y - glow_offset,
                            x + adjusted_cell_size + glow_offset,
                            y + adjusted_cell_size + glow_offset,
                        ],
                        radius=max(2, size // 50),
                        fill=(255, 255, 255, glow_alpha),
                    )

                # Center cell - brighter
                draw.rounded_rectangle(
                    [x, y, x + adjusted_cell_size, y + adjusted_cell_size],
                    radius=max(2, size // 50),
                    fill=(255, 255, 255, 180),
                )
            else:
                # Regular cells - semi-transparent white
                draw.rounded_rectangle(
                    [x, y, x + adjusted_cell_size, y + adjusted_cell_size],
                    radius=max(2, size // 50),
                    fill=(255, 255, 255, 100),
                )

    return img


def generate_all_icons():
    """Generate all required icon sizes."""
    build_dir = Path(__file__).parent.parent / "build"
    build_dir.mkdir(exist_ok=True)

    # Icon sizes needed for Windows, macOS, and Linux
    sizes = [16, 32, 48, 64, 128, 256, 512]

    print("Generating modern 9-box grid icons...")
    print("=" * 50)

    images_for_ico = []

    for size in sizes:
        print(f"Creating {size}x{size} icon...")
        icon = create_9box_icon(size)

        # Save PNG
        png_path = build_dir / f"icon_{size}x{size}.png"
        icon.save(png_path, "PNG")
        print(f"   [OK] Saved: {png_path.name}")

        # Store for ICO creation (256 and below)
        if size <= 256:
            images_for_ico.append(icon)

    # Save main icon.png (512x512)
    main_icon = create_9box_icon(512)
    main_icon_path = build_dir / "icon.png"
    main_icon.save(main_icon_path, "PNG")
    print(f"\n[OK] Saved main icon: {main_icon_path.name}")

    # Create Windows ICO file (multi-resolution)
    print("\nCreating Windows ICO file...")
    ico_path = build_dir / "icon.ico"
    images_for_ico.reverse()  # Largest first
    images_for_ico[0].save(
        ico_path, format="ICO", sizes=[(img.width, img.height) for img in images_for_ico]
    )
    print(f"   [OK] Created: {ico_path.name}")
    print(f"   File size: {ico_path.stat().st_size:,} bytes")
    print(f"   Resolutions: {len(images_for_ico)}")

    # Create macOS ICNS would require additional tools
    # For now, electron-builder will handle ICNS creation from PNG

    print("\n" + "=" * 50)
    print("All icons generated successfully!")
    print(f"Output directory: {build_dir}")
    print("\nNote: For macOS .icns files, electron-builder will")
    print("   automatically convert from icon.png during build.")


if __name__ == "__main__":
    try:
        generate_all_icons()
    except Exception as e:
        print(f"\n[ERROR] {e}")
        import traceback

        traceback.print_exc()
        sys.exit(1)
