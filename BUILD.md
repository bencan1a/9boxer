# Build Guide

This guide explains how to build 9Boxer standalone desktop installers for Windows, macOS, and Linux.

## Overview

9Boxer uses a two-stage build process:

1. **Backend Build**: Python FastAPI backend bundled into executable with PyInstaller
2. **Frontend Build**: React frontend + Electron wrapper + bundled backend packaged with Electron Builder

**Build outputs:**
- Windows: NSIS installer (.exe, ~300MB)
- macOS: DMG installer (.dmg, ~300MB)
- Linux: AppImage (.AppImage, ~300MB)

## Prerequisites

### For All Platforms

- **Python 3.10+**
- **Node.js 18+**
- **Git**

### Platform-Specific Requirements

**Windows:**
- Visual Studio Build Tools (for some Python packages)
- Windows SDK (included with VS Build Tools)

**macOS:**
- Xcode Command Line Tools (`xcode-select --install`)
- Code signing certificate (optional, for distribution)

**Linux:**
- `fuse` for AppImage support
- Build essentials (`build-essential` on Debian/Ubuntu)

## Initial Setup

Clone the repository and install dependencies:

```bash
# Clone repository
git clone <repository-url>
cd 9boxer

# Create Python virtual environment (from project root)
python3 -m venv .venv

# Activate virtual environment
. .venv/bin/activate        # Linux/macOS
# or
.venv\Scripts\activate      # Windows

# Install Python dependencies
pip install --upgrade pip
pip install -e '.[dev]'

# Install frontend dependencies
cd frontend
npm install
cd ..
```

## Build Process

### Step 1: Build Backend Executable

The backend must be built first, as the Electron build process validates its existence.

#### Windows

```bash
# From project root, with .venv activated
cd backend
.\scripts\build_executable.bat
```

The script will:
1. Activate `.venv` from project root
2. Install dependencies from root `pyproject.toml`
3. Run PyInstaller with `build_config/ninebox.spec`
4. Output to `backend/dist/ninebox/`

**Output:**
- `backend/dist/ninebox/ninebox.exe` (~225MB)
- All dependencies bundled (FastAPI, pandas, openpyxl, scipy, numpy, etc.)

#### macOS / Linux

```bash
# From project root, with .venv activated
cd backend
./scripts/build_executable.sh
```

The script will:
1. Activate `.venv` from project root
2. Install dependencies from root `pyproject.toml`
3. Run PyInstaller with `build_config/ninebox.spec`
4. Output to `backend/dist/ninebox/`

**Output:**
- `backend/dist/ninebox/ninebox` (~225MB)
- All dependencies bundled

### Step 2: Verify Backend Build

Test the backend executable before building Electron:

```bash
# From backend/dist/ninebox/
./ninebox          # macOS/Linux
# or
ninebox.exe        # Windows

# Should start server on http://localhost:8000
# Press Ctrl+C to stop
```

Visit http://localhost:8000/docs to verify the API is working.

### Step 3: Build Electron Application

```bash
# From project root
cd frontend
npm run electron:build
```

The build process will:

1. **Generate USER_GUIDE.html** (`scripts/generate-user-guide.cjs`):
   - Converts `USER_GUIDE.md` to `resources/USER_GUIDE.html`
   - Ensures bundled documentation is up-to-date

2. **Pre-build validation** (`scripts/ensure-backend.cjs`):
   - Checks if `backend/dist/ninebox/ninebox.exe` (or `ninebox`) exists
   - Exits with error if backend not found

3. **Frontend build** (`npm run build`):
   - Compiles React app with Vite
   - Outputs to `frontend/dist/`

4. **Electron compilation**:
   - Compiles TypeScript (`frontend/electron/`) to JavaScript
   - Outputs to `frontend/dist-electron/`

5. **Electron packaging** (`electron-builder`):
   - Packages Electron runtime (~150MB)
   - Includes React app from `frontend/dist/`
   - Includes Electron code from `frontend/dist-electron/`
   - Includes backend from `backend/dist/ninebox/`
   - Includes resources from `resources/` (USER_GUIDE.html, Sample_People_List.xlsx)
   - Creates platform-specific installer

**Output:**

Platform-specific installers in `frontend/release/`:

- **Windows**: `9Boxer-Setup-1.0.0.exe` (NSIS installer)
- **macOS**: `9Boxer-1.0.0.dmg` (DMG image)
- **Linux**: `9Boxer-1.0.0.AppImage` (AppImage)

## Build Configuration

### PyInstaller Configuration

Location: `backend/build_config/ninebox.spec`

Key settings:
- **Entry point**: `backend/src/ninebox/main.py`
- **Name**: `ninebox`
- **Console**: `True` (shows backend logs in development)
- **Hidden imports**: All FastAPI, uvicorn, pandas, and ninebox modules
- **Data files**: None (all code bundled)

To modify:
```python
# In ninebox.spec
a = Analysis(
    ['../src/ninebox/main.py'],
    pathex=[],
    binaries=[],
    datas=[],  # Add data files here if needed
    hiddenimports=[...],  # Add hidden imports here
    ...
)
```

### Electron Builder Configuration

Location: `frontend/electron-builder.json`

Key settings:
```json
{
  "appId": "com.yourcompany.ninebox",
  "productName": "9Boxer",
  "extraResources": [
    {
      "from": "../backend/dist/ninebox",  // Backend executable
      "to": "backend"
    },
    {
      "from": "dist",                     // React app
      "to": "app/dist"
    },
    {
      "from": "../resources/USER_GUIDE.html",  // User documentation
      "to": "USER_GUIDE.html"
    },
    {
      "from": "../resources/Sample_People_List.xlsx",  // Sample data
      "to": "Sample_People_List.xlsx"
    }
  ],
  "win": {
    "target": "nsis",
    "icon": "build/icon.ico"
  },
  "mac": {
    "target": "dmg",
    "icon": "build/icon.icns"
  },
  "linux": {
    "target": "AppImage",
    "icon": "build/icon.png"
  }
}
```

To modify app ID, product name, or icons, edit this file.

### Version Numbers

Update version in multiple places for consistency:

1. **Frontend package.json**: `frontend/package.json`
   ```json
   {
     "version": "1.0.0"
   }
   ```

2. **Backend pyproject.toml**: `pyproject.toml`
   ```toml
   [project]
   version = "1.0.0"
   ```

3. **Electron Builder** uses version from `frontend/package.json`

## Platform-Specific Build Notes

### Windows

**Installer Type**: NSIS (Nullsoft Scriptable Install System)

**Output**: `9Boxer-Setup-1.0.0.exe`

**Features:**
- Installer wizard
- Start menu shortcuts
- Desktop shortcut (optional)
- Uninstaller
- Per-user installation (no admin required)

**Code Signing (Optional):**
```json
// In electron-builder.json
{
  "win": {
    "certificateFile": "path/to/cert.pfx",
    "certificatePassword": "password"
  }
}
```

### macOS

**Installer Type**: DMG (Disk Image)

**Output**: `9Boxer-1.0.0.dmg`

**Features:**
- Drag-to-Applications UI
- Background image (customizable)
- Code signing support

**Code Signing (Required for Distribution):**

1. Get Apple Developer certificate
2. Set environment variables:
   ```bash
   export APPLE_ID="your@email.com"
   export APPLE_ID_PASSWORD="app-specific-password"
   ```
3. Update `electron-builder.json`:
   ```json
   {
     "mac": {
       "identity": "Developer ID Application: Your Name (TEAM_ID)"
     }
   }
   ```

**Notarization (Required for macOS 10.15+):**
```json
{
  "afterSign": "scripts/notarize.js"
}
```

See [Electron Builder docs](https://www.electron.build/configuration/mac) for details.

### Linux

**Installer Type**: AppImage

**Output**: `9Boxer-1.0.0.AppImage`

**Features:**
- Single executable file
- No installation required
- Portable
- Works on most Linux distributions

**Usage:**
```bash
chmod +x 9Boxer-1.0.0.AppImage
./9Boxer-1.0.0.AppImage
```

**Alternative Formats:**

To build .deb or .rpm instead:
```json
// In electron-builder.json
{
  "linux": {
    "target": ["deb", "rpm"]
  }
}
```

## Troubleshooting

### Backend Build Issues

**Error: `ModuleNotFoundError: No module named 'X'`**

Solution: Add missing module to hidden imports in `backend/build_config/ninebox.spec`:
```python
hiddenimports=[
    ...,
    'missing_module',
]
```

**Error: Backend executable won't start**

Solution: Test PyInstaller build directly:
```bash
cd backend/dist/ninebox
./ninebox  # or ninebox.exe

# Check output for errors
```

**Error: Import errors at runtime**

Solution: Some modules need explicit import. Add to `ninebox.spec`:
```python
hiddenimports=[
    'uvicorn.logging',
    'uvicorn.loops',
    'uvicorn.loops.auto',
    'uvicorn.protocols',
    'uvicorn.protocols.http',
    'uvicorn.protocols.http.auto',
    'uvicorn.protocols.websockets',
    'uvicorn.protocols.websockets.auto',
    'uvicorn.lifespan',
    'uvicorn.lifespan.on',
]
```

### Frontend Build Issues

**Error: `Backend executable not found!`**

Solution: Build backend first (Step 1).

**Error: `Electron Builder failed`**

Solution: Check `frontend/release/` for build logs. Common issues:
- Missing icon files (add to `frontend/build/`)
- Incorrect paths in `electron-builder.json`
- Platform-specific dependencies

**Error: `Application won't start after install`**

Solution:
1. Check Electron main process logs (enable DevTools in production)
2. Verify backend path in `frontend/electron/main/index.ts`
3. Test backend executable separately

### Runtime Issues

**Error: Backend doesn't start when app launches**

Solution:
1. Check `frontend/electron/main/index.ts` for correct backend path
2. Verify `getBackendPath()` returns correct path for your platform
3. Check backend logs (in production, saved to `{userData}/backend.log`)

**Error: Frontend can't connect to backend**

Solution:
1. Verify backend health check at http://localhost:8000/health
2. Check if port 8000 is already in use
3. Ensure backend process is spawned correctly in main process

**Error: Database errors**

Solution:
1. Check app data directory has write permissions
2. Verify `APP_DATA_DIR` environment variable is set correctly
3. Check backend logs for SQLite errors

## Advanced Topics

### Custom Build Scripts

Create custom build scripts in `package.json`:

```json
{
  "scripts": {
    "build:win": "electron-builder --win",
    "build:mac": "electron-builder --mac",
    "build:linux": "electron-builder --linux",
    "build:all": "electron-builder -mwl"
  }
}
```

### Continuous Integration

GitHub Actions example (`.github/workflows/build.yml`):

```yaml
name: Build Installers

on:
  push:
    tags:
      - 'v*'

jobs:
  build:
    strategy:
      matrix:
        os: [windows-latest, macos-latest, ubuntu-latest]

    runs-on: ${{ matrix.os }}

    steps:
      - uses: actions/checkout@v3

      - name: Setup Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.10'

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install Python dependencies
        run: |
          python -m venv .venv
          source .venv/bin/activate  # Windows: .venv\Scripts\activate
          pip install -e '.[dev]'

      - name: Build backend
        run: |
          source .venv/bin/activate
          cd backend
          ./scripts/build_executable.sh  # Windows: .\scripts\build_executable.bat

      - name: Build Electron app
        run: |
          cd frontend
          npm ci
          npm run electron:build

      - name: Upload artifacts
        uses: actions/upload-artifact@v3
        with:
          name: installers-${{ matrix.os }}
          path: frontend/release/*
```

### Reducing Build Size

**Backend:**
- Remove unused dependencies from `pyproject.toml`
- Use `--exclude-module` in PyInstaller for large unused modules
- Enable UPX compression (may cause issues with some modules)

**Frontend:**
- Enable tree-shaking in Vite
- Use production builds (already default)
- Optimize images and assets
- Consider code splitting for large dependencies

**Electron:**
- Use `asar` packaging (already default)
- Exclude dev dependencies from bundle
- Use `electron-builder` file filters

## Distribution

### GitHub Releases

1. Create a new release on GitHub
2. Upload installers from `frontend/release/`
3. Write release notes
4. Publish release

### Internal Distribution

Host installers on:
- Internal web server
- Network drive
- Cloud storage (S3, Google Drive, etc.)

### Update Mechanism

Consider implementing auto-updates with [electron-updater](https://www.electron.build/auto-update):

```bash
npm install electron-updater
```

Then configure in `electron/main/index.ts`:

```typescript
import { autoUpdater } from 'electron-updater';

autoUpdater.checkForUpdatesAndNotify();
```

## Support

For build issues:
1. Check this guide's Troubleshooting section
2. Review build logs in `frontend/release/`
3. Check backend executable separately
4. Open an issue on GitHub with build logs

## References

- [PyInstaller Documentation](https://pyinstaller.org/)
- [Electron Builder Documentation](https://www.electron.build/)
- [Electron Documentation](https://www.electronjs.org/docs/)
- [Vite Documentation](https://vitejs.dev/)
