# 9Boxer

A standalone desktop application for visualizing and managing employee performance using the 9-box talent grid methodology.

**Built with Electron**, 9Boxer runs entirely on your local machine with no server or cloud dependencies required. Everything is bundled into a single installer for Windows, macOS, and Linux.

## Features

### Core Functionality
- **Interactive 9-Box Grid**: Drag-and-drop interface for positioning employees
- **Excel Integration**: Upload and export Excel files with employee data
- **Real-time Updates**: Instant visual feedback for all changes
- **Change Tracking**: Complete history of all employee movements
- **Advanced Filtering**: Filter by level, manager, job profile, and more
- **Employee Exclusion**: Temporarily hide employees from view
- **Statistics Dashboard**: Visual analytics and distribution charts
- **Native File Dialogs**: OS-native file pickers for better UX
- **Offline First**: Works completely offline, no internet required

### Technical Stack
- **Desktop**: Electron 35 (cross-platform desktop wrapper)
- **Frontend**: React 18 + TypeScript + Vite + Material-UI
- **Backend**: FastAPI (Python 3.10+) bundled with PyInstaller
- **State Management**: Zustand
- **Database**: SQLite (stored in user's app data directory)
- **Excel Processing**: openpyxl
- **Communication**: HTTP over localhost (backend runs as subprocess)

## Quick Start

### Download and Install (End Users)

**Download the latest release for your platform:**

- **Windows**: Download and run `9Boxer-Setup-1.0.0.exe`
- **macOS**: Download and open `9Boxer-1.0.0.dmg`, drag to Applications
- **Linux**: Download `9Boxer-1.0.0.AppImage`, make executable, and run

No Python or Node.js installation required! Everything is bundled in the installer.

### Development Setup (Developers)

**Prerequisites:**
- Python 3.10+ (for backend development)
- Node.js 18+ (for frontend development)
- Git

**Option 1: Run Electron App in Development Mode (Recommended for Full Testing)**

```bash
# 1. Clone the repository
git clone <repository-url>
cd 9boxer

# 2. Set up Python virtual environment (from project root)
python3 -m venv .venv
. .venv/bin/activate     # Windows: .venv\Scripts\activate

# 3. Install Python dependencies
pip install uv
uv pip install --system -e '.[dev]'

# 4. Build backend executable (required for Electron)
cd backend
.\scripts\build_executable.bat  # Windows
# or
./scripts/build_executable.sh   # Linux/macOS

# 5. Install frontend dependencies
cd ../frontend
npm install

# 6. Run Electron app in development mode
npm run electron:dev
```

The app will launch with:
- Backend running from built executable (http://localhost:8000)
- Frontend with Vite hot reload (http://localhost:5173)
- Electron DevTools enabled

**Option 2: Separate Frontend/Backend Development**

For faster frontend development without Electron:

```bash
# Terminal 1: Run backend executable
cd backend/dist/ninebox
./ninebox  # or ninebox.exe on Windows

# Terminal 2: Run Vite dev server
cd frontend
npm run dev
```

Access at http://localhost:5173 (web mode, no Electron features)

## Building Production Releases

To create distributable installers:

```bash
# 1. Build backend (from project root)
cd backend
. .venv/bin/activate  # or .venv\Scripts\activate on Windows
.\scripts\build_executable.bat  # Windows
# or
./scripts/build_executable.sh   # Linux/macOS

# 2. Build Electron app
cd ../frontend
npm run electron:build

# Output in frontend/release/:
# - Windows: 9Boxer-Setup-1.0.0.exe (~300MB)
# - macOS: 9Boxer-1.0.0.dmg (~300MB)
# - Linux: 9Boxer-1.0.0.AppImage (~300MB)
```

See [BUILD.md](BUILD.md) for detailed build instructions and troubleshooting.

## Usage

### 1. Upload Excel File
- Click "Upload" button in the app bar
- Select a 9-box Excel file (.xlsx or .xls) using the native file dialog
- File must contain columns: employee_id, employee_name, performance, potential

### 2. Interact with the Grid
- **Drag employees**: Click and drag employee tiles to new boxes
- **View details**: Click on an employee to see their profile and history
- **Filter**: Use the Filters button to narrow down displayed employees
- **Exclude**: Use the exclusion dialog to temporarily hide employees

### 3. Export Changes
- Make changes by dragging employees
- Click "Export" button
- Save modified Excel file using the native save dialog

### 4. View Statistics
- Click "Statistics" to see distribution charts
- View employee counts per box
- Analyze performance and potential trends

## Project Structure

```
9boxer/
├── backend/                      # FastAPI backend
│   ├── src/ninebox/              # Backend source code
│   │   ├── core/                 # Core functionality (database, config)
│   │   ├── models/               # Pydantic models
│   │   ├── routers/              # API endpoints
│   │   ├── services/             # Business logic
│   │   ├── utils/                # Utilities (path resolution)
│   │   └── main.py               # FastAPI application entry point
│   ├── tests/                    # Backend tests (pytest)
│   ├── build_config/             # PyInstaller configuration
│   │   └── ninebox.spec          # PyInstaller spec file
│   ├── scripts/                  # Build scripts
│   │   ├── build_executable.sh   # Linux/macOS build script
│   │   └── build_executable.bat  # Windows build script
│   └── dist/ninebox/             # Built backend executable (gitignored)
├── frontend/                     # React + Electron frontend
│   ├── src/                      # React application
│   │   ├── components/           # React components
│   │   ├── hooks/                # Custom React hooks
│   │   ├── services/             # API client
│   │   ├── store/                # Zustand state management
│   │   └── types/                # TypeScript types
│   ├── electron/                 # Electron wrapper
│   │   ├── main/                 # Main process (backend lifecycle)
│   │   ├── preload/              # Preload scripts (IPC bridge)
│   │   └── renderer/             # Splash screen
│   ├── cypress/                  # E2E tests
│   ├── release/                  # Built installers (gitignored)
│   ├── electron-builder.json     # Electron packaging config
│   └── package.json              # Frontend dependencies
├── .venv/                        # Python virtual environment
├── pyproject.toml                # Python dependencies + quality config
├── BUILD.md                      # Build instructions
├── DEPLOYMENT.md                 # Deployment guide
└── USER_GUIDE.md                 # User manual
```

## Development

### Backend Testing

```bash
# From project root
. .venv/bin/activate    # Windows: .venv\Scripts\activate
pytest                  # Run all tests
pytest --cov            # Run with coverage
pytest -k "test_name"   # Run specific tests
```

Current coverage: 92% (119 tests)

### Frontend Testing

```bash
cd frontend

# Component tests (Vitest + React Testing Library)
npm test                # Watch mode
npm run test:run        # Run once
npm run test:coverage   # With coverage

# E2E tests (Playwright)
npm run test:e2e:pw     # Run all E2E tests
npm run test:e2e:pw:ui  # Run with UI mode
```

### Screenshot Generation

Documentation screenshots are generated automatically using TypeScript and Playwright:

```bash
cd frontend

# Generate all automated screenshots
npm run screenshots:generate

# Generate specific screenshots
npm run screenshots:generate grid-normal quickstart-file-menu-button

# Run in headed mode (show browser)
HEADLESS=false npm run screenshots:generate
```

Screenshots are automatically regenerated weekly via GitHub Actions. See `frontend/playwright/screenshots/` for implementation details and `frontend/playwright/screenshots/MANUAL_SCREENSHOTS.md` for the 8 screenshots that require manual creation.

### Code Quality

**Backend** (Python):
- ruff for linting and formatting
- mypy + pyright for type checking
- bandit for security scanning
- pytest for testing

```bash
. .venv/bin/activate    # From project root
make check-all          # Run all quality checks
make fix                # Auto-fix formatting and linting
```

**Frontend** (TypeScript):
- ESLint for linting
- Prettier for formatting
- TypeScript compiler for type checking
- Vitest for unit tests, Cypress for E2E

```bash
cd frontend
npm run lint            # Lint code
npm run format          # Format code
npm run type-check      # TypeScript checks
```

## API Documentation

Once the backend is running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### Key Endpoints

**Authentication**
- POST `/auth/login` - Login and get JWT token
- POST `/auth/logout` - Logout
- GET `/auth/me` - Get current user

**Session Management**
- POST `/session/upload` - Upload Excel file
- GET `/session/status` - Get session status
- POST `/session/export` - Export modified Excel file
- DELETE `/session/clear` - Clear session

**Employee Management**
- GET `/employees` - Get all employees (with filters)
- GET `/employees/{id}` - Get employee details
- PATCH `/employees/{id}/move` - Move employee to new box
- GET `/employees/filter-options` - Get available filter options

**Statistics**
- GET `/statistics` - Get distribution statistics

## Configuration

### Application Data

9Boxer stores data in platform-specific directories:

- **Windows**: `C:\Users\{user}\AppData\Roaming\9Boxer\`
- **macOS**: `~/Library/Application Support/9Boxer/`
- **Linux**: `~/.config/9Boxer/`

Contents:
- `ninebox.db` - SQLite database with employees and changes
- `backend.log` - Backend server logs (production mode)
- Uploaded Excel files (temporary)

## Deployment

The primary deployment model is **standalone desktop installers**. See [BUILD.md](BUILD.md) for complete build instructions.

**Distribution:**
1. Build platform-specific installers (see "Building Production Releases" above)
2. Distribute installers to users via:
   - GitHub Releases
   - Internal file sharing
   - Download portal

**User Installation:**
- Windows: Run .exe installer, follow wizard
- macOS: Open .dmg, drag to Applications
- Linux: Make .AppImage executable, run

**Legacy Docker Deployment:**
The project was originally a Docker-based web application but has migrated to a standalone Electron desktop app. Legacy Docker configuration files have been archived to the [`legacy/`](legacy/) directory for historical reference. These files are not actively maintained. See [legacy/README.md](legacy/README.md) for details.

## User Guide

See [USER_GUIDE.md](USER_GUIDE.md) for detailed user instructions with screenshots.

## Contributing

**For AI Agents/Developers**: See [GITHUB_AGENT.md](GITHUB_AGENT.md) for comprehensive onboarding and development workflow.

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make your changes
3. Run tests: `pytest` (backend), `npm test` (frontend)
4. Commit: `git commit -m "feat: Add feature"`
5. Push: `git push origin feature/your-feature`
6. Create a Pull Request

**Development Guides:**
- [GITHUB_AGENT.md](GITHUB_AGENT.md) - Quick start for AI agents and developers
- [docs/COPILOT_SETUP.md](docs/COPILOT_SETUP.md) - GitHub Copilot environment setup (automated)
- [AGENTS.md](AGENTS.md) - Development workflow and best practices
- [CLAUDE.md](CLAUDE.md) - Detailed technical guidance
- [CONTRIBUTING.md](CONTRIBUTING.md) - Contribution guidelines
- [docs/QUICK_REFERENCE.md](docs/QUICK_REFERENCE.md) - Command quick reference
- [docs/design-system/](docs/design-system/) - **Design system documentation** (UI components, patterns, accessibility)

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
1. Check [USER_GUIDE.md](USER_GUIDE.md) for usage help
2. Check [DEPLOYMENT.md](DEPLOYMENT.md) for deployment issues
3. Open an issue on GitHub

## Acknowledgments

Built with:
- Electron - Cross-platform desktop framework
- React - UI library
- FastAPI - High-performance Python web framework
- PyInstaller - Python executable bundler
- Material-UI - React component library
- Zustand - State management
- Vite - Frontend build tool
- openpyxl - Excel file processing
