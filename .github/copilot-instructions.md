# GitHub Copilot Instructions for 9Boxer

This file provides GitHub Copilot with context about the 9Boxer repository.

## Automated Environment Setup

**GitHub Copilot will automatically set up your environment** using `.github/workflows/copilot-setup-steps.yml`, which:

1. ✅ Sets up Python 3.13 with system-wide dependencies via `uv`
2. ✅ Installs all Python backend dependencies
3. ✅ Installs all Node.js frontend dependencies
4. ✅ Installs Playwright browsers for E2E testing
5. ✅ Configures pre-commit hooks
6. ✅ Validates the complete environment

**You do NOT need to manually run setup commands** - Copilot handles this automatically in its ephemeral environment.

> **Note:** The custom setup workflow does NOT include `actions/checkout@v4` because Copilot automatically clones the repository before running the setup. Including a checkout step causes "repository not found" errors due to permissions conflicts.

## Project Overview

9Boxer is a **standalone Electron desktop application** (NOT a web app) for employee performance visualization using the 9-box talent grid methodology.

**Key Architecture:**
- **Desktop**: Electron 35 wrapper around React 18 + TypeScript
- **Frontend**: React 18 + Vite + Material-UI + Zustand
- **Backend**: FastAPI (Python 3.10+) bundled with PyInstaller as executable
- **Database**: SQLite in user's app data directory
- **Communication**: Backend runs as subprocess, HTTP over localhost:38000
- **Deployment**: Windows/macOS/Linux installers (~300MB each)

## Critical: Monorepo Structure

This is a **monorepo** with two separate ecosystems:

### Python Backend
- Location: `backend/`
- Dependencies: `pyproject.toml` (project root)
- Virtual environment: `.venv/` (project root)
- **ALWAYS activate venv**: `. .venv/bin/activate` before Python work

### Node.js Frontend
- Location: `frontend/`
- Dependencies: `frontend/package.json`
- Node modules: `frontend/node_modules/`

## Build Order (CRITICAL)

**Must build backend BEFORE frontend:**
```
1. Backend (PyInstaller) → backend/dist/ninebox/ninebox.exe
2. Frontend (Electron Builder) → frontend/release/*.exe/*.dmg/*.AppImage
```

## Platform: Windows Development

Primary development on **Windows**. Critical constraints:

### File Operations
- ❌ NEVER use `rm`, `touch`, `cp`, `mv` in Bash
- ✅ Use `git rm`, `git mv` for tracked files
- ✅ Use View/Edit/Create tools for file operations
- ❌ NEVER use Windows absolute paths in Bash (`c:\...`)
- ✅ Use relative paths from working directory

### Windows Reserved Names
Never use as filenames: `CON`, `PRN`, `AUX`, `NUL`, `COM1-9`, `LPT1-9`

## Virtual Environment (MOST IMPORTANT)

**#1 Cause of Errors**: Forgetting to activate Python virtual environment

```bash
# ALWAYS run this first for Python work (from project root)
. .venv/bin/activate      # Linux/macOS
.venv\Scripts\activate    # Windows
```

If you see "module not found" errors, the venv is not activated.

## Testing

### Backend (Python)
```bash
# Activate venv first!
. .venv/bin/activate

# Run tests
pytest                           # All 372 tests
pytest backend/tests/unit        # Fast unit tests (~293)
pytest -m "not slow"             # Skip slow tests
pytest --cov=backend/src         # With coverage
```

### Frontend (TypeScript)
```bash
cd frontend

# Component tests
npm test                         # Vitest (watch mode)
npm run test:run                 # Run once

# E2E tests
npm run test:e2e:pw              # Playwright
```

## Code Quality

### Backend
```bash
# Activate venv first!
. .venv/bin/activate

make check-all                   # All checks at once
make fix                         # Auto-fix format + lint

# Or individually:
ruff format .                    # Format
ruff check .                     # Lint
mypy backend/src/                # Type check (mypy)
pyright                          # Type check (pyright)
bandit -r backend/src/           # Security scan
```

### Frontend
```bash
cd frontend
npm run lint                     # ESLint
npm run type-check               # TypeScript
npm run format                   # Prettier
```

## Type Annotations (REQUIRED)

All Python functions MUST have type annotations:
- ALL parameters must be typed
- ALL returns must be typed
- Use modern typing: `list[str]`, `dict[str, int]`, `Optional[T]`

```python
def process_employees(
    employee_ids: list[str],
    max_count: Optional[int] = None
) -> dict[str, int]:
    """Process employees and return count mapping."""
    pass
```

## Running the Application

### Development Mode (Electron)
```bash
# 1. Build backend (first time only)
cd backend
. .venv/bin/activate
./scripts/build_executable.sh    # or .bat on Windows

# 2. Run Electron
cd ../frontend
npm run electron:dev
```

### Separate Frontend/Backend
```bash
# Terminal 1: Backend
cd backend/dist/ninebox
./ninebox  # or ninebox.exe

# Terminal 2: Frontend
cd frontend
npm run dev  # http://localhost:5173
```

## File Organization

| Folder | Purpose | Git |
|--------|---------|-----|
| `agent-tmp/` | Temporary workspace, auto-cleaned after 7 days | ❌ No (gitignored) |
| `agent-projects/<name>/` | Active project plans (<21 days) | ✅ Yes |
| `internal-docs/` | Permanent documentation | ✅ Yes |
| `internal-docs/_generated/` | Auto-generated documentation | ✅ Yes |

**Rules:**
- DO NOT create analysis reports in project root
- DO use `agent-tmp/` for temporary work
- DO create structured plans in `agent-projects/<name>/`

## Documentation

**Primary references:**
1. **internal-docs/facts.json** - Source of truth (HIGHEST AUTHORITY)
2. **GITHUB_AGENT.md** - Quick onboarding guide
3. **CLAUDE_INDEX.md** - Quick start index with task-based navigation
4. **AGENTS.md** - Development workflow
5. **internal-docs/CONTEXT.md** - Comprehensive project context

**Trust hierarchy when information conflicts:**
1. `internal-docs/facts.json` (highest authority)
2. Permanent content in `internal-docs/`
3. Active plans (hints only)

## Common Commands

```bash
# Setup
python3 -m venv .venv
. .venv/bin/activate
pip install -e '.[dev]'
pre-commit install

# Testing
pytest                           # Backend tests
cd frontend && npm test          # Frontend tests

# Quality
make check-all                   # All backend checks
make fix                         # Auto-fix issues

# Build
cd backend && ./scripts/build_executable.sh
cd frontend && npm run electron:build

# Development
cd frontend && npm run electron:dev
```

## Pre-Commit Hooks

Pre-commit hooks run automatically on commit:
- ruff format (formatting)
- ruff check (linting)
- mypy (type checking)
- bandit (security scanning)

If pre-commit fails:
```bash
make fix                         # Auto-fix issues
pre-commit run --all-files       # Re-check
```

## Common Issues

### "Module not found" (Python)
→ Activate virtual environment: `. .venv/bin/activate`

### Tests failing on import
→ Install in dev mode: `pip install -e '.[dev]'`

### Electron app won't start
→ Build backend first: `cd backend && ./scripts/build_executable.sh`

### Frontend can't connect to backend
→ Check backend running on port 38000

## Custom Agent Profiles

Specialized guidance in `.github/agents/`:
- `test.md` - Testing strategies
- `architecture.md` - System design
- `debug.md` - Debugging techniques
- `documentation.md` - Technical writing

## Success Criteria

Before making changes:
- [ ] Activate Python venv (if working with Python)
- [ ] Run existing tests to establish baseline
- [ ] Understand monorepo structure
- [ ] Know platform constraints (Windows)
- [ ] Check facts.json for source of truth

## Pro Tips

1. **Always activate venv first** - prevents 90% of errors
2. **Test in Electron app** - don't just test in web mode
3. **Use `make check-all`** - runs all quality checks
4. **Trust facts.json** - highest authority
5. **Use View/Edit/Create tools** - safer than Bash on Windows

---

For complete onboarding, see [GITHUB_AGENT.md](../GITHUB_AGENT.md)
