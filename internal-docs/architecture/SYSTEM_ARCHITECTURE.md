# System Architecture

This document describes the complete system architecture of the 9Boxer standalone desktop application.

## System Overview

9Boxer is a **standalone Electron desktop application** that visualizes and manages employee performance using the 9-box talent grid methodology.

**Key Characteristics:**
- **Deployment Model**: Standalone desktop application with platform-specific installers
- **Architecture**: Electron wrapper with embedded FastAPI backend
- **Data Storage**: SQLite database in user's app data directory
- **Communication**: Backend runs as subprocess, frontend communicates via HTTP (localhost:38000)
- **No External Dependencies**: Everything bundled - no Python, Node.js, or server installation required
- **Offline-First**: All features work without internet connection

**Legacy Note**: Docker-based web deployment configuration exists but is dormant and not actively maintained. The primary deployment target is the standalone Electron application.

## Component Architecture

### 1. Frontend Layer (Electron Renderer Process)

**Technology Stack:**
- React 18.3.1 (UI library)
- TypeScript 5.x (type safety)
- Vite 6.0 (build tool, dev server with hot reload)
- Material-UI (MUI) 6.x (component library)
- Zustand (lightweight state management)
- React Router 7.x (client-side routing)

**Location**: `frontend/src/`

**Key Components:**
- **React Application**: User interface with drag-and-drop grid, filters, statistics
- **API Client**: HTTP client (axios) communicating with backend at localhost:38000
- **State Management**: Zustand stores for employees, session, filters, UI state
- **Theme System**: MUI theme with design tokens (`frontend/src/theme/tokens.ts`)
- **Internationalization**: i18next with English and Spanish translations

**Renderer Process Isolation:**
- Runs in Chromium renderer process (sandboxed)
- No direct Node.js access (context isolation enabled)
- Communicates with main process via IPC bridge (preload script)
- Communicates with backend via HTTP (not IPC)

### 2. Electron Main Process

**Technology Stack:**
- Electron 35.x (cross-platform desktop framework)
- Node.js (main process runtime)
- TypeScript (compiled to JavaScript)

**Location**: `frontend/electron/main/index.ts`

**Responsibilities:**
1. **Backend Lifecycle Management**:
   - Spawns backend executable as subprocess on app startup
   - Waits for backend health check before showing UI
   - Monitors backend health (30-second intervals)
   - Kills backend on app shutdown
2. **Window Management**:
   - Creates BrowserWindow (main window)
   - Displays splash screen during backend startup
   - Handles window state (position, size, maximize)
3. **Native Features**:
   - File dialogs (open Excel, save Excel)
   - System theme detection
   - OS-specific paths (user data directory)
4. **IPC Communication**:
   - Bridges renderer requests to main process capabilities
   - Exposes safe APIs via preload script

**Backend Startup Flow:**
1. Main process starts backend executable from `resources/backend/`
2. Backend spawns on dynamic port (default 38000, may use alternative if occupied)
3. Backend emits JSON message with port: `{"port": 38000, "status": "ready"}`
4. Main process captures port from stdout
5. Main process polls `/health` endpoint until ready (max 30 seconds)
6. Main process broadcasts backend URL to renderer via IPC
7. Renderer initializes API client with correct backend URL

### 3. Electron Preload Script

**Technology Stack:**
- TypeScript
- Electron contextBridge API

**Location**: `frontend/electron/preload/index.ts`

**Purpose**: Secure IPC bridge between renderer and main process

**Exposed APIs:**
```typescript
window.electronAPI = {
  // File dialogs
  openFileDialog: () => Promise<string | null>
  saveFileDialog: (defaultName: string) => Promise<string | null>
  readFile: (filePath: string) => Promise<{buffer, fileName, success, error}>

  // Theme detection
  theme: {
    getSystemTheme: () => Promise<'light' | 'dark'>
    onSystemThemeChange: (callback) => cleanup function
  }

  // Backend configuration
  backend: {
    getPort: () => Promise<number>
    getUrl: () => Promise<string>
    onConnectionStatusChange: (callback) => cleanup function
  }

  // Help & logging
  openUserGuide: () => Promise<{success, error}>
  showLogs: () => Promise<{success}>
}
```

**Security:**
- Context isolation enabled (renderer cannot access Node.js APIs)
- Sandbox enabled for renderer process
- Only safe, minimal APIs exposed
- All IPC calls validated

### 4. Backend Layer (FastAPI)

**Technology Stack:**
- FastAPI 0.115.x (async web framework)
- Python 3.10+ (runtime)
- Uvicorn (ASGI server)
- Pydantic (data validation)
- SQLAlchemy (ORM)
- SQLite (database)
- openpyxl (Excel file processing)
- pandas (data manipulation)
- scipy (statistical analysis)

**Location**: `backend/src/ninebox/`

**Architecture**: Standard Python src/ layout with service layer pattern

**Directory Structure:**
```
backend/src/ninebox/
├── main.py              # FastAPI application entry point
├── core/                # Core functionality
│   ├── config.py        # Application configuration
│   ├── database.py      # SQLAlchemy setup
│   └── dependencies.py  # FastAPI dependency injection
├── api/                 # API endpoints (routers)
│   ├── auth.py          # Authentication endpoints
│   ├── employees.py     # Employee CRUD operations
│   ├── session.py       # Session management (upload/export)
│   ├── statistics.py    # Statistics and analytics
│   └── intelligence.py  # AI-powered insights
├── models/              # SQLAlchemy models (database tables)
│   ├── employee.py      # Employee model
│   ├── change.py        # Change tracking model
│   └── session.py       # Session model
├── services/            # Business logic layer
│   ├── employee_service.py
│   ├── excel_service.py
│   ├── statistics_service.py
│   └── intelligence_service.py
└── utils/               # Utilities
    └── path_utils.py    # Path resolution for PyInstaller
```

**Key Features:**
- **Dependency Injection**: FastAPI's DI system for database sessions, configuration
- **Type Safety**: All functions have type annotations (enforced by mypy + pyright)
- **Async I/O**: Async/await throughout for non-blocking operations
- **Automatic API Docs**: Swagger UI at `/docs`, ReDoc at `/redoc`

**API Endpoints:**
- `GET /health` - Health check (used by Electron main process)
- `POST /auth/login` - User login (JWT tokens)
- `POST /session/upload` - Upload Excel file
- `GET /employees` - Get employees with filters
- `PATCH /employees/{id}/move` - Move employee to new grid position
- `POST /session/export` - Export modified Excel file
- `GET /statistics` - Distribution statistics and analytics

### 5. Data Layer (SQLite)

**Technology**: SQLite 3.x

**Location**: `{UserDataDir}/ninebox.db`
- Windows: `C:\Users\{user}\AppData\Roaming\9Boxer\ninebox.db`
- macOS: `~/Library/Application Support/9Boxer/ninebox.db`
- Linux: `~/.config/9Boxer/ninebox.db`

**Schema** (managed via SQLAlchemy models):
- **employees** - Employee records (id, name, performance, potential, box position)
- **changes** - Change history (employee movements, timestamps)
- **sessions** - Session metadata (uploaded files, export history)
- **users** - User accounts (for authentication)

**Access Pattern**:
- Backend accesses SQLite via SQLAlchemy ORM
- Frontend never directly accesses database (always via backend HTTP API)
- Database created on first run if not exists

## Data Flow

### Application Startup Sequence

1. **User launches 9Boxer application**
   - Clicks desktop shortcut or app icon
   - OS launches Electron main process

2. **Main process initialization** (`frontend/electron/main/index.ts`):
   - Logs environment info (development vs production mode)
   - Creates splash screen (frameless, transparent window)
   - Determines backend executable path:
     - Production: `resources/backend/ninebox.exe` (or `ninebox` on Unix)
     - Development: `backend/dist/ninebox/ninebox.exe`

3. **Backend subprocess startup**:
   - Main process spawns backend with `child_process.spawn()`
   - Environment variables set:
     - `APP_DATA_DIR`: User data directory path
     - `PORT`: Requested port (38000 by default)
   - Backend executable starts FastAPI server
   - Backend selects port (38000 or alternative if occupied)
   - Backend emits JSON to stdout: `{"port": 38000, "status": "ready"}`

4. **Port discovery**:
   - Main process listens to backend stdout
   - Parses JSON message to extract actual port
   - Updates `BACKEND_URL` variable: `http://localhost:{port}`
   - Times out after 5 seconds if no port reported

5. **Health check**:
   - Main process polls `GET /health` endpoint
   - Retries every 1 second for up to 30 seconds
   - Proceeds when backend returns 200 OK

6. **Frontend initialization**:
   - Main process creates BrowserWindow
   - Loads frontend from:
     - Development: Vite dev server (http://localhost:5173)
     - Production: Bundled files (`resources/app/dist/index.html`)
   - Closes splash screen when window ready
   - Shows and focuses main window

7. **Frontend-backend handshake**:
   - Renderer process requests backend URL via IPC: `window.electronAPI.backend.getUrl()`
   - Main process responds with actual backend URL
   - Frontend initializes axios API client with backend URL
   - Frontend makes initial API calls (login, load session)

8. **Health monitoring**:
   - Main process starts health check interval (every 30 seconds)
   - Monitors backend connection status
   - Broadcasts status changes to renderer via IPC: `backend:connection-status`

### File Upload Flow

1. **User clicks "Upload" button** in frontend
2. **Frontend requests file dialog** via IPC: `window.electronAPI.openFileDialog()`
3. **Main process shows native file dialog** (OS-specific)
4. **User selects Excel file** (.xlsx or .xls)
5. **Main process returns file path** to renderer
6. **Frontend sends file to backend**:
   - Creates FormData with file
   - `POST /session/upload` with multipart/form-data
7. **Backend processes file** (`services/excel_service.py`):
   - Validates Excel format
   - Parses employee data (id, name, performance, potential)
   - Saves employees to SQLite database
   - Returns employee list
8. **Frontend updates UI**:
   - Stores employees in Zustand state
   - Renders 9-box grid with employee cards
   - Updates statistics

### Drag-and-Drop Movement Flow

1. **User drags employee card** to new grid position
2. **Frontend React DnD** handles drag events
3. **Frontend updates local state** immediately (optimistic update)
4. **Frontend sends API request**:
   - `PATCH /employees/{id}/move`
   - Body: `{box: 3, performance: 8, potential: 7}`
5. **Backend updates database**:
   - Updates employee record in SQLite
   - Creates change history record
   - Returns updated employee
6. **Frontend confirms update**:
   - If success: Keep optimistic update
   - If error: Revert to previous state, show error toast

### Export Flow

1. **User clicks "Export" button**
2. **Frontend requests save dialog** via IPC: `window.electronAPI.saveFileDialog('export.xlsx')`
3. **Main process shows native save dialog**
4. **User selects save location**
5. **Frontend requests export** from backend:
   - `POST /session/export`
6. **Backend generates Excel file**:
   - Fetches current employee data from SQLite
   - Generates Excel using openpyxl
   - Returns file as blob
7. **Frontend saves file**:
   - Receives blob from backend
   - Writes to file path from dialog
8. **User receives success notification**

### Application Shutdown

1. **User closes window** or quits app
2. **Main process receives quit event**
3. **Graceful shutdown** (`frontend/electron/main/index.ts:gracefulShutdown()`):
   - Stops health monitoring interval
   - Sends SIGTERM to backend process (polite kill)
   - Waits 2 seconds for backend to save session data
   - Force kills backend if still running (SIGKILL)
   - Cleans up any processes on ports 38000 and 5173
4. **Backend receives SIGTERM**:
   - FastAPI shutdown handlers run
   - Database connections closed
   - Temp files cleaned up
5. **Main process exits**

## Directory Structure

```
9boxer/                           # Project root (monorepo)
├── .venv/                        # Python virtual environment (backend deps + quality tools)
├── pyproject.toml                # Backend dependencies + comprehensive quality config
│
├── backend/                      # FastAPI backend
│   ├── src/ninebox/              # Backend source code
│   │   ├── main.py               # FastAPI application entry point
│   │   ├── core/                 # Core functionality (database, config)
│   │   ├── api/                  # API endpoints (routers)
│   │   ├── models/               # SQLAlchemy models
│   │   ├── services/             # Business logic
│   │   └── utils/                # Utilities (path resolution)
│   ├── tests/                    # Backend tests (pytest)
│   │   ├── unit/                 # Fast isolated tests (~293 tests)
│   │   ├── integration/          # Multi-component tests (~39 tests)
│   │   ├── e2e/                  # Full frozen executable tests (~16 tests)
│   │   └── performance/          # Benchmark tests (~24 tests)
│   ├── build_config/             # PyInstaller configuration
│   │   └── ninebox.spec          # PyInstaller spec file
│   ├── scripts/                  # Build scripts
│   │   ├── build_executable.sh   # Linux/macOS build script
│   │   └── build_executable.bat  # Windows build script
│   └── dist/ninebox/             # PyInstaller output (bundled backend executable, ~225MB)
│
├── frontend/                     # React + Electron frontend
│   ├── src/                      # React application
│   │   ├── components/           # React components
│   │   ├── hooks/                # Custom React hooks
│   │   ├── services/             # API client (axios)
│   │   ├── store/                # Zustand state management
│   │   ├── theme/                # MUI theme with design tokens
│   │   ├── i18n/                 # Internationalization (i18next)
│   │   └── types/                # TypeScript types
│   ├── electron/                 # Electron wrapper
│   │   ├── main/                 # Main process (backend lifecycle, window management)
│   │   │   └── index.ts          # Main entry point
│   │   ├── preload/              # Preload scripts (IPC bridge)
│   │   │   └── index.ts          # Secure contextBridge API
│   │   └── renderer/             # Splash screen
│   ├── playwright/               # E2E tests (Playwright)
│   ├── dist/                     # Vite build output (React app)
│   ├── dist-electron/            # Compiled Electron code
│   ├── release/                  # Electron Builder output (platform installers, ~300MB each)
│   │   ├── 9Boxer-Setup-1.0.0.exe          # Windows NSIS installer
│   │   ├── 9Boxer-1.0.0.dmg                # macOS DMG installer
│   │   └── 9Boxer-1.0.0.AppImage           # Linux AppImage
│   ├── electron-builder.json     # Electron packaging config
│   └── package.json              # Frontend dependencies
│
├── resources/                    # Bundled application resources
│   ├── USER_GUIDE.html           # User documentation (bundled with app)
│   └── Sample_People_List.xlsx   # Sample data file (bundled with app)
│
└── tools/                        # Build and utility scripts
    └── convert_user_guide.py     # Generates USER_GUIDE.html from .md
```

**Build Outputs:**
- Backend: `backend/dist/ninebox/` (PyInstaller executable, ~225MB)
  - Contains Python interpreter, all dependencies, FastAPI app
  - Single executable file (ninebox.exe or ninebox)
- Frontend: `frontend/release/` (Platform installers, ~300MB each)
  - Windows: NSIS installer (.exe)
  - macOS: DMG installer (.dmg)
  - Linux: AppImage (.AppImage)

**Deployment:**
- Backend executable copied to `resources/backend/` during Electron build
- USER_GUIDE.html generated and copied to `resources/`
- Electron Builder packages everything into platform installers

## Technology Stack

### Backend

**Core Framework:**
- **FastAPI 0.115.x** - High-performance async web framework
- **Uvicorn 0.32.x** - ASGI server
- **Python 3.10+** - Runtime (3.10, 3.11, 3.12 supported)

**Data & Persistence:**
- **SQLAlchemy 2.0.x** - ORM
- **SQLite 3.x** - Embedded database
- **Pydantic 2.x** - Data validation and serialization
- **openpyxl 3.x** - Excel file reading/writing
- **pandas 2.x** - Data manipulation
- **scipy 1.x** - Statistical analysis

**Security & Auth:**
- **python-jose** - JWT token handling
- **passlib** - Password hashing (bcrypt)
- **python-multipart** - File upload handling

**Development & Testing:**
- **pytest 8.x** - Testing framework (372 tests total)
- **pytest-cov** - Coverage reporting (>80% coverage)
- **pytest-asyncio** - Async test support
- **httpx** - Async HTTP client for tests

**Code Quality:**
- **ruff 0.x** - Linting and formatting (replaces black, isort, flake8)
- **mypy 1.x** - Static type checking
- **pyright 1.x** - Additional type checking (VSCode Pylance)
- **bandit 1.x** - Security scanning
- **pre-commit 4.x** - Git hooks for quality checks

**Build & Packaging:**
- **PyInstaller 6.x** - Python executable bundler

### Frontend

**Core Framework:**
- **React 18.3.1** - UI library
- **TypeScript 5.x** - Type-safe JavaScript
- **Vite 6.0.x** - Build tool and dev server

**UI & Styling:**
- **Material-UI (MUI) 6.x** - Component library
- **@mui/icons-material** - Icon set
- **@emotion/react & @emotion/styled** - CSS-in-JS (MUI dependency)
- **react-beautiful-dnd** - Drag-and-drop library

**State & Routing:**
- **Zustand 5.x** - Lightweight state management
- **React Router 7.x** - Client-side routing
- **axios 1.x** - HTTP client

**Internationalization:**
- **i18next 23.x** - i18n framework
- **react-i18next 15.x** - React bindings
- **i18next-browser-languagedetector** - Language detection

**Data Visualization:**
- **recharts 2.x** - Charts and graphs

**Desktop Integration:**
- **Electron 35.x** - Cross-platform desktop framework
- **electron-builder 25.x** - Packaging and installers

**Development & Testing:**
- **Vitest 2.x** - Unit testing framework (Vite-native)
- **@testing-library/react** - Component testing utilities
- **@testing-library/user-event** - User interaction simulation
- **Playwright 1.x** - E2E testing framework
- **ESLint 9.x** - Linting (TypeScript, React, accessibility)
- **Prettier 3.x** - Code formatting

## Build and Packaging

### Backend Build Process (PyInstaller)

**Command:**
```bash
cd backend
. .venv/bin/activate  # or .venv\Scripts\activate on Windows
./scripts/build_executable.sh  # or .\scripts\build_executable.bat on Windows
```

**Steps:**
1. Activates Python virtual environment
2. Installs dependencies from `pyproject.toml`
3. Runs PyInstaller with `build_config/ninebox.spec`
4. Bundles Python interpreter, all dependencies, and application code
5. Outputs standalone executable to `backend/dist/ninebox/`

**Configuration** (`backend/build_config/ninebox.spec`):
- Entry point: `backend/src/ninebox/main.py`
- Console mode: Enabled (shows backend logs in development)
- Hidden imports: FastAPI, uvicorn, pandas, all ninebox modules
- Data files: None (all code bundled)
- Output: Single executable (~225MB)

**PyInstaller Challenges:**
- **Dynamic imports**: Some modules require explicit `hiddenimports` in spec file
- **Path resolution**: Uses `utils/path_utils.py` to handle PyInstaller's `_MEIPASS` directory
- **Database location**: Uses `APP_DATA_DIR` environment variable to locate SQLite file

### Frontend Build Process (Electron Builder)

**Command:**
```bash
cd frontend
npm run electron:build
```

**Steps:**
1. **Generate USER_GUIDE.html** (`scripts/generate-user-guide.cjs`):
   - Converts `USER_GUIDE.md` to `resources/USER_GUIDE.html`
   - Ensures bundled documentation is up-to-date

2. **Pre-build validation** (`scripts/ensure-backend.cjs`):
   - Checks if `backend/dist/ninebox/ninebox.exe` (or `ninebox`) exists
   - Exits with error if backend not built

3. **Frontend build** (`npm run build`):
   - Compiles React app with Vite
   - TypeScript → JavaScript
   - Tree-shaking and minification
   - Outputs to `frontend/dist/`

4. **Electron compilation**:
   - Compiles TypeScript in `frontend/electron/` to JavaScript
   - Outputs to `frontend/dist-electron/`

5. **Electron packaging** (`electron-builder`):
   - Packages Electron runtime (~150MB)
   - Includes React app from `frontend/dist/`
   - Includes Electron code from `frontend/dist-electron/`
   - Includes backend from `backend/dist/ninebox/`
   - Includes resources from `resources/` (USER_GUIDE.html, Sample_People_List.xlsx)
   - Creates platform-specific installer

**Configuration** (`frontend/electron-builder.json`):
```json
{
  "appId": "com.yourcompany.ninebox",
  "productName": "9Boxer",
  "extraResources": [
    {
      "from": "../backend/dist/ninebox",
      "to": "backend"
    },
    {
      "from": "../resources/USER_GUIDE.html",
      "to": "USER_GUIDE.html"
    },
    {
      "from": "../resources/Sample_People_List.xlsx",
      "to": "Sample_People_List.xlsx"
    }
  ],
  "win": { "target": "nsis" },
  "mac": { "target": "dmg" },
  "linux": { "target": "AppImage" }
}
```

**Platform-Specific Installers:**
- **Windows**: NSIS installer with wizard, shortcuts, uninstaller
- **macOS**: DMG disk image with drag-to-Applications UI
- **Linux**: AppImage (portable, no installation required)

### Multi-Platform Build

**Build outputs are platform-specific:**
- Must build on Windows to create .exe installer
- Must build on macOS to create .dmg installer
- Can build Linux AppImage on any platform

**Cross-platform considerations:**
- Backend: PyInstaller creates platform-specific executables
- Frontend: Electron Builder handles platform differences
- Icons: Requires .ico (Windows), .icns (macOS), .png (Linux)

## Legacy Notes

### Docker Deployment (Dormant)

The project originally supported Docker-based web deployment but has migrated to standalone Electron desktop app.

**Legacy files** (archived to `legacy/` directory):
- `docker-compose.yml` - Docker orchestration
- `Dockerfile` (backend) - Backend container
- `frontend/Dockerfile` - Frontend container
- `.env.example` - Environment variables

**Why migration occurred:**
- Simpler deployment: No server setup required
- Offline-first: No internet dependency
- Native desktop features: File dialogs, OS integration
- Better user experience: No browser, dedicated app

**Current stance:**
- Docker files not maintained
- Primary deployment is Electron desktop app
- Legacy files kept for historical reference only

## Related Documentation

- [BUILD.md](../../BUILD.md) - Complete build instructions
- [DEPLOYMENT.md](../../DEPLOYMENT.md) - Deployment and distribution guide
- [GUIDELINES.md](GUIDELINES.md) - Architectural decisions and patterns
- [internal-docs/design-system/](../design-system/) - UI component architecture
- [internal-docs/testing/](../testing/) - Testing architecture and strategies
