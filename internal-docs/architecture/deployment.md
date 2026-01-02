# Deployment & Distribution

This guide covers deploying and distributing the 9Boxer standalone desktop application.

## Table of Contents
- [Overview](#overview)
- [Building Installers](#building-installers)
- [Distribution Methods](#distribution-methods)
- [User Installation](#user-installation)
- [Application Data](#application-data)
- [Updates](#updates)
- [Troubleshooting](#troubleshooting)
- [Security Considerations](#security-considerations)
- [Monitoring and Support](#monitoring-and-support)
- [Legacy Docker Deployment](#legacy-docker-deployment)

## Overview

9Boxer is distributed as a **standalone desktop application** with platform-specific installers:

- **Windows**: NSIS installer (.exe)
- **macOS**: DMG disk image (.dmg)
- **Linux**: AppImage (.AppImage)

**No server required!** The application runs entirely on the user's local machine:
- Frontend: Electron-wrapped React app
- Backend: FastAPI executable (bundled with PyInstaller)
- Database: SQLite in user's app data directory
- Communication: HTTP over localhost

## Building Installers

See [build-process.md](build-process.md) for complete build instructions.

**Quick build steps:**

```bash
# 1. Build backend executable
cd backend
. .venv/bin/activate  # Windows: .venv\Scripts\activate
.\scripts\build_executable.bat  # Windows
# or
./scripts/build_executable.sh   # Linux/macOS

# 2. Build Electron installer
cd ../frontend
npm run electron:build

# Output in frontend/release/
```

## Distribution Methods

### 1. GitHub Releases (Recommended)

Best for open-source or public distribution:

1. **Create a Release:**
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

2. **Upload Installers:**
   - Go to GitHub → Releases → Draft new release
   - Select tag (v1.0.0)
   - Upload files from `frontend/release/`:
     - `9Boxer-Setup-1.0.0.exe` (Windows)
     - `9Boxer-1.0.0.dmg` (macOS)
     - `9Boxer-1.0.0.AppImage` (Linux)
   - Write release notes
   - Publish release

3. **Users Download:**
   - Visit GitHub Releases page
   - Download installer for their platform
   - Install and run

### 2. Internal File Server

For corporate/internal deployment:

1. **Host installers on internal server:**
   ```
   https://intranet.company.com/downloads/9boxer/
   ├── windows/
   │   └── 9Boxer-Setup-1.0.0.exe
   ├── macos/
   │   └── 9Boxer-1.0.0.dmg
   └── linux/
       └── 9Boxer-1.0.0.AppImage
   ```

2. **Provide download links** via email, intranet, or documentation

3. **Users download and install**

### 3. Cloud Storage

For small teams:

1. Upload to Google Drive, Dropbox, OneDrive, etc.
2. Share download links with users
3. Users download and install

**Note:** Some cloud providers may block executable downloads. Use direct links when possible.

### 4. Package Managers (Advanced)

**Windows (Chocolatey):**
Create a Chocolatey package for automated installation:
```powershell
choco install 9boxer
```

**macOS (Homebrew Cask):**
Create a Homebrew cask:
```bash
brew install --cask 9boxer
```

**Linux (Custom Repository):**
Host .deb or .rpm packages in a package repository.

See [Electron Builder docs](https://www.electron.build/) for package manager integration.

## User Installation

### Windows

1. **Download** `9Boxer-Setup-1.0.0.exe`
2. **Run installer** (double-click)
3. **Follow installation wizard:**
   - Choose installation directory
   - Create desktop shortcut (optional)
   - Add to Start menu (default)
4. **Launch** from Start menu or desktop shortcut

**Installation location:** `C:\Users\{user}\AppData\Local\Programs\9Boxer\`

**Uninstall:** Control Panel → Programs → Uninstall 9Boxer

### macOS

1. **Download** `9Boxer-1.0.0.dmg`
2. **Open DMG** (double-click)
3. **Drag 9Boxer** to Applications folder
4. **Eject DMG**
5. **Launch** from Applications or Spotlight

**First launch:** Right-click → Open (to bypass Gatekeeper if unsigned)

**Installation location:** `/Applications/9Boxer.app`

**Uninstall:** Drag 9Boxer.app to Trash

### Linux

1. **Download** `9Boxer-1.0.0.AppImage`
2. **Make executable:**
   ```bash
   chmod +x 9Boxer-1.0.0.AppImage
   ```
3. **Run:**
   ```bash
   ./9Boxer-1.0.0.AppImage
   ```

**Optional:** Integrate with desktop environment:
```bash
# Install AppImageLauncher for automatic integration
sudo apt install appimagelauncher  # Debian/Ubuntu
```

**Installation location:** User's choice (portable)

**Uninstall:** Delete .AppImage file

## Application Data

9Boxer stores user data in platform-specific directories:

### Windows

**Location:** `C:\Users\{user}\AppData\Roaming\9Boxer\`

**Contents:**
```
C:\Users\{user}\AppData\Roaming\9Boxer\
├── ninebox.db           # SQLite database
├── backend.log          # Backend server logs
└── uploads/             # Temporary Excel files
```

### macOS

**Location:** `~/Library/Application Support/9Boxer/`

**Contents:**
```
~/Library/Application Support/9Boxer/
├── ninebox.db           # SQLite database
├── backend.log          # Backend server logs
└── uploads/             # Temporary Excel files
```

### Linux

**Location:** `~/.config/9Boxer/`

**Contents:**
```
~/.config/9Boxer/
├── ninebox.db           # SQLite database
├── backend.log          # Backend server logs
└── uploads/             # Temporary Excel files
```

### Data Backup

**To backup user data:**

```bash
# Windows
xcopy "C:\Users\{user}\AppData\Roaming\9Boxer" "D:\Backups\9Boxer" /E /I

# macOS
cp -r "~/Library/Application Support/9Boxer" ~/Backups/9Boxer

# Linux
cp -r ~/.config/9Boxer ~/Backups/9Boxer
```

**To restore:**
- Copy backup folder back to original location
- Restart 9Boxer

## Updates

### Manual Updates

1. **Download new installer** (same as initial installation)
2. **Run installer** (overwrites previous version)
3. **Data is preserved** (stored in separate app data directory)

### Automatic Updates (Advanced)

Implement auto-updates with [electron-updater](https://www.electron.build/auto-update):

1. **Install electron-updater:**
   ```bash
   npm install electron-updater
   ```

2. **Configure in main process:**
   ```typescript
   import { autoUpdater } from 'electron-updater';

   app.on('ready', () => {
     autoUpdater.checkForUpdatesAndNotify();
   });
   ```

3. **Host update files:**
   - GitHub Releases (automatic with electron-updater)
   - Custom update server (requires configuration)

4. **Users get notified:**
   - App checks for updates on launch
   - Shows notification when update available
   - Downloads and installs in background

See [electron-updater docs](https://www.electron.build/auto-update) for details.

## Troubleshooting

### Installation Issues

#### Windows: "Windows protected your PC"

**Cause:** Unsigned executable (SmartScreen warning)

**Solution:**
- Click "More info" → "Run anyway"
- OR: Code sign the executable (requires code signing certificate)

#### macOS: "9Boxer cannot be opened because it is from an unidentified developer"

**Cause:** Unsigned app (Gatekeeper protection)

**Solution:**
- Right-click app → Open → Click "Open" in dialog
- OR: Code sign and notarize the app (requires Apple Developer account)

#### Linux: AppImage won't run

**Cause:** Missing FUSE support

**Solution:**
```bash
# Install FUSE
sudo apt install fuse libfuse2  # Debian/Ubuntu
sudo dnf install fuse fuse-libs  # Fedora

# Or extract and run without FUSE
./9Boxer-1.0.0.AppImage --appimage-extract
./squashfs-root/AppRun
```

### Runtime Issues

#### Backend won't start

**Symptoms:** App opens but shows error connecting to backend

**Diagnosis:**
1. Check backend logs:
   - Windows: `%APPDATA%\9Boxer\backend.log`
   - macOS: `~/Library/Application Support/9Boxer/backend.log`
   - Linux: `~/.config/9Boxer/backend.log`

2. Check if port 38000 is in use:
   ```bash
   # Windows
   netstat -ano | findstr :8000

   # macOS/Linux
   lsof -i :8000
   ```

**Solutions:**
- Kill process using port 38000
- Check firewall settings
- Reinstall application

#### Database errors

**Symptoms:** Can't upload files, changes not saving

**Diagnosis:** Check database file exists and has write permissions

**Solutions:**
```bash
# Windows
icacls "%APPDATA%\9Boxer" /grant %username%:F /T

# macOS/Linux
chmod -R u+rw ~/Library/Application Support/9Boxer  # macOS
chmod -R u+rw ~/.config/9Boxer                      # Linux
```

#### App crashes on launch

**Diagnosis:**
1. Enable DevTools in production (temporarily):
   - Edit `frontend/electron/main/index.ts`:
     ```typescript
     const isDev = true;  // Force dev mode
     ```
   - Rebuild and test

2. Check Electron logs (platform-specific)

**Solutions:**
- Check system requirements (Windows 10+, macOS 10.14+, Linux kernel 4.4+)
- Reinstall application
- Clear app data (backup first!)

### Performance Issues

#### App slow to start

**Cause:** Backend startup time (PyInstaller overhead)

**Expected:** 3-5 seconds on first launch, 1-2 seconds on subsequent launches

**Solutions:**
- Normal behavior, no action needed
- Ensure antivirus isn't scanning executable on every launch

#### High memory usage

**Cause:** Large Excel files, many employees

**Expected:** 200-500MB for normal usage

**Solutions:**
- Close other applications
- Filter employees to reduce grid size
- Export and clear session periodically

## Security Considerations

### Code Signing

**Windows:**
- Get code signing certificate (DigiCert, Sectigo, etc.)
- Sign executable with `signtool` (included in Windows SDK)
- Prevents SmartScreen warnings

**macOS:**
- Get Apple Developer account ($99/year)
- Create Developer ID certificate
- Sign app with `codesign`
- Notarize with Apple (required for macOS 10.15+)

**Linux:**
- Code signing not commonly used
- GPG signatures for AppImages (optional)

### Sandboxing

**Current:** Electron sandbox enabled for renderer process

**Main process:** Has full system access (required for spawning backend)

**Renderer process:** Isolated, only accesses backend via HTTP

### User Permissions

**Required permissions:**
- Read/write to user's app data directory
- Network access to localhost (for backend communication)
- File system access (for Excel file upload/export)

**Not required:**
- Admin/root privileges
- Internet access
- System-wide file access

### Data Privacy

**Local-only:**
- All data stored on user's machine
- No cloud sync
- No telemetry or analytics (by default)

**Sensitive data:**
- Employee names and performance ratings stored in SQLite
- Database not encrypted (can be added if needed)
- Consider data protection laws (GDPR, etc.) when distributing

## Monitoring and Support

### Logging

**Backend logs:** `{AppData}/9Boxer/backend.log`

**Contents:**
- API requests and responses
- Database operations
- Errors and warnings

**Log rotation:** Not implemented (manual cleanup required)

### Error Reporting

**Current:** No automatic error reporting

**To implement:**
1. Add error tracking service (Sentry, Rollbar, etc.)
2. Capture errors in main and renderer processes
3. Send to error tracking service (with user consent)

### User Support

**For users:**
1. Check USER_GUIDE.md for usage help
2. Check app logs for errors
3. Contact IT support or developers

**For administrators:**
1. Check this deployment guide
2. Review [build-process.md](build-process.md) for build issues
3. Check GitHub issues for known problems

## Legacy Docker Deployment

**Note:** Docker-based web deployment is legacy and not actively maintained. The primary deployment model is standalone desktop application.

<details>
<summary>Click to expand Docker deployment instructions (legacy)</summary>

### Prerequisites
- Docker 20.10+
- Docker Compose 2.0+

### Steps

1. **Clone repository:**
   ```bash
   git clone <repository-url>
   cd 9boxer
   ```

2. **Create environment file:**
   ```bash
   cp .env.example .env
   ```

   Edit `.env`:
   ```bash
   SECRET_KEY=your-very-long-random-secret-key
   LOG_LEVEL=INFO
   TOKEN_EXPIRE_MINUTES=60
   ```

3. **Build and start:**
   ```bash
   docker-compose up --build -d
   ```

4. **Access application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:38000
   - API Docs: http://localhost:38000/docs

5. **Default credentials:**
   - Username: `bencan`
   - Password: `password`

### Docker Commands

```bash
docker-compose up -d          # Start services
docker-compose down           # Stop services
docker-compose logs -f        # View logs
docker-compose restart        # Restart services
docker-compose down -v        # Remove all data
```

### Production Deployment (Docker)

Use nginx reverse proxy, SSL certificates, and PostgreSQL for production.

See nginx configuration examples in legacy docs.

</details>

## Related Documentation

- [build-process.md](build-process.md) - Complete build instructions
- [ADR-001: Electron Desktop Architecture](decisions/001-electron-desktop-architecture.md) - Why Electron
- [ADR-002: PyInstaller Backend Bundling](decisions/002-pyinstaller-backend-bundling.md) - Why PyInstaller
- [SECURITY_MODEL.md](SECURITY_MODEL.md) - Security architecture

## References

- [Electron Documentation](https://www.electronjs.org/docs/)
- [Electron Builder](https://www.electron.build/)
- [PyInstaller](https://pyinstaller.org/)
