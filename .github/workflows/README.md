# GitHub Actions Workflows

## Build Electron App

**Workflow:** `build-electron.yml`

### What it does

Automatically builds the 9-Box Performance Review Electron application for all platforms:
- **Windows**: `.exe` installer (NSIS)
- **macOS**: `.dmg` disk image (x64 + ARM64/Apple Silicon)
- **Linux**: `.AppImage` portable executable

### When it runs

- **Automatic**: On every push to `main` or `standalone_app` branches
- **Pull Requests**: On PRs targeting `main` or `standalone_app`
- **Manual**: Via "Actions" tab → "Build Electron App" → "Run workflow"

### How to download builds

1. Go to **Actions** tab in GitHub
2. Click the latest workflow run (green ✓ = success)
3. Scroll to **Artifacts** section
4. Download:
   - `9boxer-linux-<sha>.zip` - Contains AppImage
   - `9boxer-windows-<sha>.zip` - Contains .exe installer
   - `9boxer-macos-<sha>.zip` - Contains .dmg

### Build process

Each platform runs independently:

1. **Backend**: Builds PyInstaller executable
   - Python 3.12
   - PyInstaller packages FastAPI + dependencies
   - Output: `backend/dist/ninebox/ninebox(.exe)`

2. **Frontend**: Builds Electron app
   - Node.js 20
   - Vite builds React app
   - TypeScript compiles Electron main/preload
   - electron-builder packages everything
   - Output: `frontend/release/`

### Build times

- **Linux**: ~5-8 minutes
- **Windows**: ~6-10 minutes
- **macOS**: ~8-12 minutes (builds both x64 and ARM64)

### Artifact retention

Artifacts are kept for **90 days** after the workflow run.

### Troubleshooting

**Build fails on Windows:**
- Check that `signAndEditExecutable: false` is in `frontend/electron-builder.json`
- Windows builds use native tools (no Wine issues)

**Build fails on macOS:**
- macOS builds both x64 and ARM64 (Apple Silicon)
- No code signing by default (users will see "unidentified developer" warning)

**Missing backend executable:**
- Check backend build step completed successfully
- Verify PyInstaller spec at `backend/build_config/ninebox.spec`

**Artifacts not uploaded:**
- Check "List build outputs" step for file paths
- Verify artifact path patterns match actual output

### Local testing

Test the workflow locally with [act](https://github.com/nektos/act):

```bash
# Install act
brew install act  # macOS
# or
curl https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash  # Linux

# Run workflow locally
act -j build
```

### Adding code signing (production)

For production releases with proper code signing:

1. **Windows**: Get a code signing certificate
   ```yaml
   - name: Sign Windows executable
     env:
       CERTIFICATE: ${{ secrets.WINDOWS_CERTIFICATE }}
       CERTIFICATE_PASSWORD: ${{ secrets.CERTIFICATE_PASSWORD }}
     run: |
       # Add signing steps
   ```

2. **macOS**: Get Apple Developer certificate
   ```yaml
   - name: Sign macOS app
     env:
       APPLE_ID: ${{ secrets.APPLE_ID }}
       APPLE_PASSWORD: ${{ secrets.APPLE_APP_PASSWORD }}
     run: |
       # Add notarization steps
   ```

3. Update `electron-builder.json`:
   ```json
   {
     "win": {
       "signAndEditExecutable": true,
       "certificateFile": "path/to/cert.pfx"
     }
   }
   ```

### Creating releases

To automatically create GitHub Releases with builds attached:

1. Create and push a tag:
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

2. Add release step to workflow:
   ```yaml
   - name: Create Release
     if: startsWith(github.ref, 'refs/tags/')
     uses: softprops/action-gh-release@v1
     with:
       files: frontend/release/**/*.{AppImage,exe,dmg}
   ```

## Support

For issues with the build workflow, check:
- [electron-builder docs](https://www.electron.build/)
- [PyInstaller docs](https://pyinstaller.org/)
- [GitHub Actions docs](https://docs.github.com/actions)
