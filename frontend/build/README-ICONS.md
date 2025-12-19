# Icon Files

This directory contains platform-specific icon files for the 9Boxer application.

## Current Files

- `icon.png` (512x512) - Source icon used for all platforms
- `icon.ico` - Windows icon file (already generated)
- `icon_*.png` - Various sizes for different use cases

## Missing: icon.icns (macOS)

The `icon.icns` file is required for macOS builds but cannot be auto-generated on Windows due to native dependency issues (sharp/libvips).

### How to Generate icon.icns

**Option 1: On macOS**
```bash
cd frontend
npm install --save-dev icon-gen
npm run generate-icons
```

**Option 2: Online Converter**
1. Go to https://cloudconvert.com/png-to-icns
2. Upload `frontend/build/icon.png`
3. Download the generated `icon.icns`
4. Save it as `frontend/build/icon.icns`

**Option 3: macOS iconutil Command**
```bash
# Create iconset directory
mkdir icon.iconset

# Create required sizes (use ImageMagick or sips)
sips -z 16 16     icon.png --out icon.iconset/icon_16x16.png
sips -z 32 32     icon.png --out icon.iconset/icon_16x16@2x.png
sips -z 32 32     icon.png --out icon.iconset/icon_32x32.png
sips -z 64 64     icon.png --out icon.iconset/icon_32x32@2x.png
sips -z 128 128   icon.png --out icon.iconset/icon_128x128.png
sips -z 256 256   icon.png --out icon.iconset/icon_128x128@2x.png
sips -z 256 256   icon.png --out icon.iconset/icon_256x256.png
sips -z 512 512   icon.png --out icon.iconset/icon_256x256@2x.png
sips -z 512 512   icon.png --out icon.iconset/icon_512x512.png
sips -z 1024 1024 icon.png --out icon.iconset/icon_512x512@2x.png

# Convert iconset to icns
iconutil -c icns icon.iconset -o icon.icns

# Clean up
rm -rf icon.iconset
```

## Usage in Build

The icons are referenced in `electron-builder.json`:
- Windows: `build/icon.ico` ✅
- macOS: `build/icon.icns` ❌ (needs generation)
- Linux: `build/icon.png` ✅
