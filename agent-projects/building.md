# 9-Box Performance Review - Build & Launch Guide

This guide provides step-by-step instructions for building and running the 9-Box Performance Review desktop application on Windows, macOS, or Linux.

---

## Prerequisites

Before building, ensure you have:

- **Python 3.10+** installed ([python.org](https://python.org))
- **Node.js 18+** and **npm** installed ([nodejs.org](https://nodejs.org))
- **Git** (to clone the repository)

**Verify installations:**
```bash
python --version    # or python3 --version on Linux/macOS
node --version
npm --version
```

---

## Project Structure

This is a monorepo with separate backend and frontend:

```
9boxer/
  .venv/              ← Single Python venv for backend (shared)
  pyproject.toml      ← Backend deps + quality tools
  backend/            ← FastAPI backend
    src/ninebox/      ← Backend source code
    tests/            ← Backend tests
    scripts/          ← Build scripts
  frontend/           ← React + Electron frontend
    node_modules/     ← Frontend deps (separate)
    src/              ← React source
    electron/         ← Electron main/preload
```

---

## Quick Start (First-Time Setup)

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd 9boxer
```

### Step 2: Set Up Python Environment (Root)

**Windows:**
```cmd
python -m venv .venv
.venv\Scripts\activate
pip install --upgrade pip
pip install -e .[dev]
```

**Linux/macOS:**
```bash
python3 -m venv .venv
. .venv/bin/activate
pip install --upgrade pip
pip install -e '.[dev]'
```

This installs:
- All backend dependencies (FastAPI, pandas, etc.)
- Quality tools (ruff, mypy, bandit, pytest, etc.)

### Step 3: Build Backend Executable

**Option A: Using Makefile (Recommended - Linux/macOS):**
```bash
make build-backend
```

**Option B: Using build scripts directly:**

**Windows:**
```cmd
cd backend
scripts\build_executable.bat
cd ..
```

**Linux/macOS:**
```bash
cd backend
./scripts/build_executable.sh
cd ..
```

**Expected output:**
- Backend executable: `backend/dist/ninebox/ninebox` (or `ninebox.exe` on Windows)
- Size: ~15-20 MB

### Step 3: Set Up Frontend
```bash
cd frontend
npm install
```

### Step 4: Launch the Application

**Development Mode (Recommended for testing):**
```bash
cd frontend
npm run electron:dev
```

This will:
- Start Vite dev server on port 5173
- Launch Electron with hot reload enabled
- Open DevTools automatically
- Start backend server on port 38000

**The app should launch with a splash screen, then open the main window.**

---

## Quick Build with Makefile (Linux/macOS)

For convenience, you can use the Makefile to build everything in one command:

```bash
# Build everything (backend + frontend + installer)
make build-all
# or just: make build

# Build only backend executable
make build-backend

# Build only frontend (no installer)
make build-frontend

# Build complete Electron installer
make build-electron

# Clean all build artifacts
make clean
```

**Note:** Makefile commands work on Linux/macOS. On Windows, use the manual steps above.

---

## Build Options

### Option A: Development Mode
**Use when:** Actively developing, testing features, debugging

```bash
cd frontend
npm run electron:dev
```

**Features:**
- ✅ Hot reload for frontend changes
- ✅ DevTools open by default
- ✅ Backend logs visible in terminal
- ✅ Fast iteration cycle

---

### Option B: Production Build (Unpacked)
**Use when:** Testing production bundle without creating installer

**Windows:**
```cmd
cd frontend
npm run build
npx tsc -p electron/tsconfig.json
npx electron-builder --dir

REM Run the unpacked app:
release\win-unpacked\9-Box Performance Review.exe
```

**Linux/macOS:**
```bash
cd frontend
npm run build
npx tsc -p electron/tsconfig.json
npx electron-builder --dir

# Run the unpacked app:
./release/linux-unpacked/9boxer-electron    # Linux
./release/mac/9boxer-electron.app/Contents/MacOS/9boxer-electron  # macOS
```

**Output:** `frontend/release/<platform>-unpacked/`

---

### Option C: Full Installer (For Distribution)
**Use when:** Creating installer for end users

**Windows:**
```cmd
cd frontend
npm run electron:build:win
```

**macOS:**
```bash
cd frontend
npm run electron:build:mac
```

**Linux:**
```bash
cd frontend
npm run electron:build:linux
```

**Outputs:**
- **Windows:** `release/9-Box Performance Review-1.0.0-Windows-x64.exe`
- **macOS:** `release/9-Box Performance Review-1.0.0-macOS-x64.dmg`
- **Linux:** `release/9-Box Performance Review-1.0.0-Linux-x64.AppImage`

**To install:**
- **Windows:** Double-click `.exe` and follow installer
- **macOS:** Open `.dmg` and drag to Applications folder
- **Linux:** `chmod +x *.AppImage && ./9-Box*.AppImage`

---

## Rebuilding After Code Changes

### Backend Changes
If you modify backend code:

**Windows:**
```cmd
cd backend
venv\Scripts\activate
scripts\build_executable.bat
```

**Linux/macOS:**
```bash
cd backend
. venv/bin/activate
./scripts/build_executable.sh
```

### Frontend Changes
If you modify frontend code:
```bash
cd frontend
npm run build
npx tsc -p electron/tsconfig.json
```

---

## Verification

### Verify Backend Build
**Windows:**
```cmd
cd backend
dir dist\ninebox\ninebox.exe
```

**Linux/macOS:**
```bash
cd backend
ls -lh dist/ninebox/ninebox
```

Should show executable (~15-20 MB).

### Verify Integration
```bash
cd frontend
node scripts/verify-integration.cjs
```

Expected output: `📊 Results: 12 passed, 0 failed`

---

## Troubleshooting

### "Backend not found" error
**Cause:** Backend executable wasn't built

**Fix:**
```bash
# Windows
cd backend
scripts\build_executable.bat

# Linux/macOS
cd backend
./scripts/build_executable.sh
```

### "Virtual environment not found"
**Cause:** Python venv wasn't created at root

**Fix:**
```bash
# Windows (from project root)
python -m venv .venv
.venv\Scripts\activate
pip install -e .[dev]

# Linux/macOS (from project root)
python3 -m venv .venv
. .venv/bin/activate
pip install -e '.[dev]'
```

### "PyInstaller not found" or dependency errors
**Cause:** Dependencies not installed in root venv

**Fix:**
```bash
# Windows
.venv\Scripts\activate
pip install -e .[dev]

# Linux/macOS
. .venv/bin/activate
pip install -e '.[dev]'
```

### "npm install" fails
**Cause:** Node.js/npm version too old or corrupted cache

**Fix:**
```bash
cd frontend
rm -rf node_modules package-lock.json  # or: rmdir /s /q node_modules & del package-lock.json on Windows
npm cache clean --force
npm install
```

### Blank screen when launching Electron
**Cause:** Vite dev server not running or port conflict

**Fix:**
1. Check if something else is using port 5173
2. Try `npm run dev` separately first to verify Vite works
3. Check browser console (F12) for errors
4. Verify backend is running: `curl http://localhost:38000/health`

### Backend doesn't start
**Cause:** Port 38000 already in use or executable permissions

**Fix:**
```bash
# Check what's using port 38000
# Windows: netstat -ano | findstr :8000
# Linux/macOS: lsof -i :8000

# Test backend manually
cd backend/dist/ninebox
./ninebox    # or: ninebox.exe on Windows
```

### WSL/Headless Environment Issues
**Cause:** No display server for GUI

**Fix - Option A: Use Windows X Server**
1. Install [VcXsrv](https://sourceforge.net/projects/vcxsrv/) or [X410](https://x410.dev/) on Windows
2. In WSL:
   ```bash
   export DISPLAY=:0
   npm run electron:dev
   ```

**Fix - Option B: Build on WSL, Run on Windows**
```bash
# In WSL, build the Windows executable
cd frontend
npm run electron:build:win

# Copy to Windows and run from PowerShell
# \\wsl$\Ubuntu\home\<user>\9boxer\frontend\release\win-unpacked\9-Box Performance Review.exe
```

---

## Platform-Specific Notes

### Windows
- Use `\` for paths in commands
- Virtual environment: `.venv\Scripts\activate.bat` (at root level)
- Executable: `ninebox.exe`
- May need to allow app through Windows Defender

### Linux/macOS
- Use `/` for paths in commands
- Virtual environment: `. .venv/bin/activate` (at root level)
- Executable: `ninebox`
- On macOS, may need to allow app in Security & Privacy settings
- On Linux, AppImage may need: `chmod +x *.AppImage`

---

## Clean Build (Start Fresh)

If you encounter persistent issues:

**Backend:**
```bash
# From project root
rm -rf .venv backend/build backend/dist  # Windows: rmdir /s /q .venv backend\build backend\dist
python -m venv .venv     # or: python3 -m venv .venv
# Then follow "Step 2: Set Up Python Environment" above
```

**Frontend:**
```bash
cd frontend
rm -rf node_modules dist dist-electron release
npm install
```

---

## Summary of Key Commands

| Task | Windows | Linux/macOS |
|------|---------|-------------|
| Activate venv (root) | `.venv\Scripts\activate` | `. .venv/bin/activate` |
| Build backend | `cd backend && scripts\build_executable.bat` | `cd backend && ./scripts/build_executable.sh` |
| Dev mode | `cd frontend && npm run electron:dev` | `cd frontend && npm run electron:dev` |
| Production build | `cd frontend && npm run electron:build:win` | `cd frontend && npm run electron:build:linux` or `:mac` |
| Verify integration | `cd frontend && node scripts\verify-integration.cjs` | `cd frontend && node scripts/verify-integration.cjs` |

---

## Additional Resources

- **Backend API:** Runs on `http://localhost:38000` when app is running
- **Frontend Dev Server:** `http://localhost:5173` (dev mode only)
- **Backend Source:** `backend/src/ninebox/`
- **Frontend Source:** `frontend/src/`
- **Electron Source:** `frontend/electron/`
- **Build Configs:** `backend/build_config/`, `frontend/electron-builder.json`
