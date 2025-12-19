# Building 9-Box Electron Application

## Prerequisites

1. Backend must be built first:
   ```bash
   cd ../backend
   make build-exe
   # Verify: ls -lh dist/ninebox/
   ```

2. Install dependencies:
   ```bash
   cd ../frontend
   npm install
   ```

## Build Process

### Windows
```bash
npm run electron:build:win
# Output: release/9-Box Performance Review-1.0.0-Windows-x64.exe
```

### macOS
```bash
npm run electron:build:mac
# Output: release/9-Box Performance Review-1.0.0-macOS-x64.dmg
```

### Linux
```bash
npm run electron:build:linux
# Output: release/9-Box Performance Review-1.0.0-Linux-x64.AppImage
```

### All Platforms (if on macOS)
```bash
npm run electron:build
# Builds for current platform
```

## Build Output

The installers will be in `frontend/release/`:
- **Windows**: NSIS installer (.exe)
- **macOS**: DMG disk image (.dmg)
- **Linux**: AppImage (.AppImage)

## Build Size Estimates

- **Windows installer**: ~250-300 MB
- **macOS DMG**: ~250-300 MB
- **Linux AppImage**: ~250-300 MB

(Includes Electron runtime + backend executable + dependencies)

## Icon Customization

Replace placeholder icons in `frontend/build/`:
- `icon.ico` - Windows icon (256x256)
- `icon.icns` - macOS icon (16x16 to 512x512)
- `icon.png` - Linux icon (512x512 PNG)

Use tools like:
- **png2icons**: Convert PNG to .ico and .icns
- **electron-icon-builder**: Generate all formats from one PNG

## Signing (Production)

For production releases, add code signing:

**Windows**: Requires code signing certificate
```json
"win": {
  "certificateFile": "path/to/cert.pfx",
  "certificatePassword": "password"
}
```

**macOS**: Requires Apple Developer ID
```json
"mac": {
  "identity": "Developer ID Application: Your Name (TEAM_ID)"
}
```

## Troubleshooting

**Backend not found**:
- Ensure backend is built: `cd ../backend && make build-exe`
- Check path in electron-builder.json: `extraResources[0].from`

**Build fails on Linux**:
- Install dependencies: `sudo apt-get install -y libarchive-tools`

**Large file size**:
- Expected: Backend is ~225MB + Electron runtime ~150MB
- Can't reduce significantly without removing features

## CI/CD

For automated builds, see `.github/workflows/build-electron.yml` (if created).

## Testing Build Configuration

Before running a full build, test the configuration:

```bash
# Validate configuration
npx electron-builder --help

# Test build (unpacked, faster)
npm run build
npx tsc -p electron/tsconfig.json
npx electron-builder --dir

# Check output
ls -lh release/linux-unpacked/
ls -lh release/linux-unpacked/resources/backend/

# Should see:
# - release/linux-unpacked/ directory
# - release/linux-unpacked/resources/backend/ninebox (executable)
# - release/linux-unpacked/resources/backend/_internal/ (dependencies)
```

## Build Steps Explained

1. **`npm run build`** - Build React app (Vite) → `dist/`
2. **`tsc -p electron/tsconfig.json`** - Compile Electron main process → `dist-electron/`
3. **`electron-builder`** - Package everything into installer
   - Copies `dist/` (React app)
   - Copies `dist-electron/` (Electron main)
   - Copies `../backend/dist/ninebox/` (FastAPI backend)
   - Bundles Electron runtime
   - Creates installer

## Platform Requirements

- **Windows builds**: Require Windows (or Wine on Linux/macOS)
- **macOS builds**: Require macOS
- **Linux builds**: Work on all platforms

## First Build Checklist

- [ ] Backend built: `ls -lh ../backend/dist/ninebox/ninebox`
- [ ] Frontend dependencies installed: `npm install`
- [ ] Configuration valid: `cat electron-builder.json`
- [ ] Icons exist (placeholders OK): `ls build/`
- [ ] Test build runs: `npx electron-builder --dir`
- [ ] Backend included: `ls release/linux-unpacked/resources/backend/`

## Production Deployment

For distributing to end users:

1. Replace placeholder icons with real icons
2. Set up code signing (Windows/macOS)
3. Test installer on clean system
4. Create GitHub release with installers
5. Document installation instructions
