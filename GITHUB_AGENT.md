# GITHUB AGENT ONBOARDING GUIDE

**Welcome to 9Boxer!** This guide helps GitHub Agent (and GitHub Copilot) work efficiently with this repository.

> **Quick Links:**
> 📖 [CLAUDE_INDEX.md](CLAUDE_INDEX.md) - Quick start index (task-based navigation)
> 📋 [AGENTS.md](AGENTS.md) - Development workflow and best practices
> 📚 [internal-docs/CONTEXT.md](internal-docs/CONTEXT.md) - Comprehensive project context
> 🎯 [internal-docs/facts.json](internal-docs/facts.json) - Source of truth (highest authority)

---

## 🤖 Automated Setup (GitHub Copilot)

**If you're using GitHub Copilot's coding agent**, the environment is automatically set up! The repository uses GitHub's official Copilot environment customization feature to automatically configure everything.

### How It Works

**Custom Instructions**: `.github/copilot-instructions.md` provides context about the repository
**Automated Workflow**: `.github/workflows/copilot-setup-steps.yml` runs automatically when Copilot starts a coding session

### What Gets Installed

**Python Backend:**
- Python 3.13 with `uv` (fast package installer)
- Virtual environment at `.venv/`
- All backend dependencies from `pyproject.toml`
- Development tools: pytest, ruff, mypy, pyright, bandit

**Node.js Frontend:**
- Node.js 20 with npm caching
- All frontend dependencies from `frontend/package.json`
- React, Electron, Material-UI, TypeScript, Vite

**Playwright E2E Testing:**
- Chromium browser with system dependencies
- Cached for faster subsequent runs

**Pre-commit Hooks:**
- Code quality checks configured automatically

### Benefits

- **Consistency**: Every Copilot session starts with the exact same environment
- **Speed**: Dependencies are cached, making setup fast (~5-10 minutes with cache)
- **Correctness**: Eliminates common errors like forgetting to activate venv
- **Zero Manual Steps**: No need to remember setup commands

### Troubleshooting

| Issue | Solution |
|-------|----------|
| Python packages not found | Workflow activates venv automatically; for manual commands: `. .venv/bin/activate` |
| Frontend dependencies not found | Workflow uses `npm ci` for clean install |
| Playwright browsers not found | Workflow installs and caches automatically |
| E2E tests fail | Ensure Playwright cache isn't corrupted; workflow rebuilds if needed |

### Technical Details

**Why `uv pip install --system`?**
- 10x faster than pip
- Installs directly into GitHub Actions' system Python (isolated per job)
- Matches pattern used in CI workflows

**Why `npm ci` instead of `npm install`?**
- Faster installation from package-lock.json
- Ensures exact versions match lock file
- Better for CI/CD environments

**Cache Strategy:**
- Python: `cache: 'pip'` in `setup-python` action
- Node.js: `cache: 'npm'` in `setup-node` action
- Playwright: Cached at `~/.cache/ms-playwright`

**Skip to [Common Tasks](#-common-tasks)** if using Copilot.

---

## 🚀 60-Second Orientation

**9Boxer is a standalone Electron desktop app** (NOT a web app) for employee performance visualization using the 9-box talent grid.

### Critical Facts
- **Architecture**: Electron wrapper + React frontend + FastAPI backend (bundled with PyInstaller)
- **Monorepo**: Python backend (`.venv/`) + Node.js frontend (`frontend/node_modules/`)
- **Database**: SQLite in user's app data directory
- **Communication**: Backend runs as subprocess, HTTP over localhost:38000
- **Platform**: Primary development on **Windows** (see platform constraints below)
- **Deployment**: Windows/macOS/Linux installers (~300MB each), fully offline

### Build Order (CRITICAL)
```
1. Backend (PyInstaller) → backend/dist/ninebox/ninebox.exe
2. Frontend (Vite + Electron Builder) → frontend/release/*.exe/*.dmg/*.AppImage
```
**Must build backend BEFORE frontend!**

---

## ⚡ Quick Start (5 Minutes)

### 1. Activate Python Virtual Environment (ALWAYS FIRST!)

```bash
# From project root - DO THIS FIRST, EVERY TIME
. .venv/bin/activate      # Linux/macOS
# or
.venv\Scripts\activate    # Windows

# Verify activation
which python              # Should show .venv/bin/python
```

> ⚠️ **#1 Cause of Errors**: Forgetting to activate venv. If you see "module not found", activate venv!

### 2. Run Tests (Establish Baseline)

```bash
# Backend tests (from project root, venv activated)
pytest                           # All 372 tests
pytest backend/tests/unit        # Fast unit tests only (~293 tests)
pytest -k "test_login"           # Specific test pattern

# Frontend tests (from frontend/ directory)
cd frontend
npm test                         # Component tests (Vitest)
npm run test:e2e:pw              # E2E tests (Playwright)
```

### 3. Run the Application

**Option A: Full Electron App (Recommended)**
```bash
# 1. Build backend (first time only)
cd backend
. .venv/bin/activate
./scripts/build_executable.sh    # Linux/macOS
# or
.\scripts\build_executable.bat   # Windows

# 2. Run Electron app
cd ../frontend
npm run electron:dev
```

**Option B: Separate Frontend/Backend (Faster iteration)**
```bash
# Terminal 1: Run backend
cd backend/dist/ninebox
./ninebox                        # or ninebox.exe

# Terminal 2: Run frontend
cd frontend
npm run dev                      # Opens http://localhost:5173
```

### 4. Code Quality Checks

```bash
# Backend (from project root, venv activated)
make check-all                   # Run all checks at once
# or individually:
ruff format .                    # Format
ruff check .                     # Lint
mypy backend/src/                # Type check (mypy)
pyright                          # Type check (pyright)
bandit -r backend/src/           # Security scan

# Quick fix
make fix                         # Auto-fix format + lint

# Frontend (from frontend/ directory)
npm run lint                     # ESLint
npm run type-check               # TypeScript
npm run format                   # Prettier
```

---

## 📁 Repository Structure

```
9boxer/                          ← Project root
├── .venv/                       ← Python virtual environment (ACTIVATE FIRST!)
├── pyproject.toml               ← Python dependencies + quality tool config
├── backend/                     ← FastAPI backend
│   ├── src/ninebox/             ← Backend source code
│   │   ├── main.py              ← FastAPI entry point
│   │   ├── routers/             ← API endpoints
│   │   ├── services/            ← Business logic
│   │   └── models/              ← Data models
│   ├── tests/                   ← Backend tests (372 tests)
│   │   ├── unit/                ← Fast unit tests (~293)
│   │   ├── integration/         ← Integration tests (~39)
│   │   ├── e2e/                 ← E2E tests (~16)
│   │   └── performance/         ← Performance tests (~24)
│   ├── build_config/            ← PyInstaller configuration
│   │   └── ninebox.spec         ← PyInstaller spec file
│   ├── scripts/                 ← Build scripts
│   │   ├── build_executable.sh  ← Linux/macOS build
│   │   └── build_executable.bat ← Windows build
│   └── dist/ninebox/            ← PyInstaller output (~225MB)
│       └── ninebox.exe          ← Bundled backend executable
├── frontend/                    ← React + Electron frontend
│   ├── node_modules/            ← Node.js dependencies (separate from Python)
│   ├── package.json             ← Frontend dependencies
│   ├── src/                     ← React components
│   ├── electron/                ← Electron wrapper
│   │   ├── main/index.ts        ← Main process (spawns backend)
│   │   └── preload/index.ts     ← IPC bridge
│   ├── playwright/              ← E2E tests (12 tests)
│   ├── dist/                    ← Vite build output
│   └── release/                 ← Electron Builder output (installers)
├── internal-docs/               ← Permanent documentation
│   ├── facts.json               ← Source of truth (HIGHEST AUTHORITY)
│   ├── CONTEXT.md               ← Comprehensive project context
│   └── _generated/              ← Auto-generated docs
├── agent-projects/              ← Active project plans (ephemeral, <21 days)
├── agent-tmp/                   ← Temporary workspace (gitignored, auto-cleaned)
├── tools/                       ← Build and automation scripts
├── GITHUB_AGENT.md              ← This file
├── CLAUDE_INDEX.md              ← Quick start index (task-based navigation)
└── AGENTS.md                    ← Development workflow guide
```

---

## 🎯 Common Tasks

### Add a New Feature

1. **Activate venv**: `. .venv/bin/activate`
2. **Run existing tests**: `pytest` (establish baseline)
3. **Create feature branch**: `git checkout -b feature/name`
4. **Write tests first** (TDD approach)
5. **Implement feature**
6. **Run quality checks**: `make check-all`
7. **Test in Electron**: `cd frontend && npm run electron:dev`
8. **Commit**: Use descriptive commit messages

### Fix a Bug

1. **Activate venv**: `. .venv/bin/activate`
2. **Reproduce bug**: Run app or tests
3. **Write failing test** (captures the bug)
4. **Fix code** (make test pass)
5. **Run tests**: `pytest` (all tests pass)
6. **Quality checks**: `make check-all`
7. **Verify fix**: Test in Electron app

### Add a New API Endpoint

1. **Create route** in `backend/src/ninebox/routers/`
2. **Add service logic** in `backend/src/ninebox/services/`
3. **Write tests** in `backend/tests/unit/api/`
4. **Add type annotations** (required for all functions)
5. **Run tests**: `pytest backend/tests/unit/api/`
6. **Type check**: `mypy backend/src/ && pyright`
7. **Test manually**: Use Swagger UI at http://localhost:38000/docs

### Update Documentation

**User Documentation:**
- Edit markdown files in `resources/user-guide-vitepress/docs/`
- Follow voice & tone guide: `internal-docs/contributing/voice-and-tone-guide.md`
- Preview: `npm run docs:dev:vitepress` (opens at http://localhost:38081)
- Build: `npm run docs:build:vitepress`
- See [VitePress README](resources/user-guide-vitepress/README.md) for details

**Developer Documentation:**
- Permanent docs → `internal-docs/` directory
- Temporary work → `agent-tmp/` (gitignored)
- Project plans → `agent-projects/<project-name>/`

### Build Production Release

```bash
# Step 1: Build backend (from project root)
cd backend
. .venv/bin/activate
./scripts/build_executable.sh    # Linux/macOS
# or
.\scripts\build_executable.bat   # Windows

# Verify: ls backend/dist/ninebox/  (should see executable)

# Step 2: Build Electron app
cd ../frontend
npm run electron:build

# Output in frontend/release/
# - Windows: 9Boxer-1.0.0-Windows-x64.exe
# - macOS: 9Boxer-1.0.0-macOS-x64.dmg
# - Linux: 9Boxer-1.0.0-Linux-x64.AppImage
```

See [BUILD.md](BUILD.md) for complete build instructions.

---

## ⚠️ Critical Platform Constraints (Windows Development)

This project is developed on **Windows**. The Bash tool runs in Git Bash/WSL but operates on Windows filesystem.

### ❌ NEVER DO THESE

1. **NEVER use `rm` to remove files**
   - ✅ Use: `git rm` for tracked files
   - ✅ Use: View/Edit/Create tools for file operations

2. **NEVER use `touch` to create files**
   - ✅ Use: Create tool

3. **NEVER write to `/dev/null`**
   - Creates a file called `dev` in root

4. **NEVER use `> "nul"` with quotes**
   - Creates phantom `nul` file that can't be deleted normally
   - ✅ Use: `>nul` (no quotes) or `2>/dev/null`

5. **NEVER use Windows absolute paths in Bash**
   - ❌ `c:\Git_Repos\9boxer\file.txt` gets mangled
   - ✅ Use relative paths: `agent-tmp/file.txt`
   - ✅ Use View/Edit/Create tools (handle paths correctly)

### ✅ CORRECT FILE OPERATIONS

```bash
# File operations
git rm file.txt                   # Remove tracked file
git mv oldfile.txt newfile.txt   # Move/rename file

# Check file existence
[ -f "file.txt" ] && echo "exists"
git ls-files "file.txt"

# Redirect output (no quotes around nul!)
command >nul 2>&1                 # Windows redirect
command 2>/dev/null               # Unix redirect
```

### Windows Reserved Names (NEVER use as filenames)
`CON`, `PRN`, `AUX`, `NUL`, `COM1-9`, `LPT1-9` (case-insensitive)

**If you create `nul` file by mistake:**
```powershell
# From PowerShell (admin)
del "\\.\C:\Git_Repos\9boxer\nul"
```

---

## 🧪 Testing Guide

### Test Organization

Tests are organized by suite type:
- **`backend/tests/unit/`** - Fast unit tests (~293 tests, <10s)
- **`backend/tests/integration/`** - Integration tests (~39 tests)
- **`backend/tests/e2e/`** - End-to-end frozen executable tests (~16 tests)
- **`backend/tests/performance/`** - Benchmark tests (~24 tests)

### Running Tests

```bash
# Backend (activate venv first!)
pytest                                 # All tests (372)
pytest backend/tests/unit              # Fast unit tests only
pytest -m unit                         # Alternative: by marker
pytest -m "not slow"                   # Skip slow tests
pytest -k "test_login"                 # Pattern matching
pytest --cov=backend/src               # With coverage
pytest -v                              # Verbose output

# Frontend component tests (from frontend/)
npm test                               # Watch mode
npm run test:run                       # Run once
npm run test:coverage                  # With coverage

# Frontend E2E tests (Playwright)
npm run test:e2e:pw                    # Run all E2E tests
npm run test:e2e:pw:ui                 # With UI
npx playwright test upload-flow.spec.ts  # Specific test
```

### Test Naming Convention

Backend: `test_function_when_condition_then_expected`
```python
def test_create_employee_when_valid_data_then_returns_employee(): ...
```

Frontend: User-visible behavior
```typescript
it('displays error message when login fails', () => {
    ...
});
```

### Test Anti-Patterns to AVOID

- ❌ Conditional assertions (if statements in test bodies)
- ❌ Testing types instead of behavior
- ❌ Over-mocking (don't mock business logic)
- ❌ Multiple outcomes in one test

### Coverage Standards

- Target: >80% coverage
- CI enforces: 70% threshold on changed files
- Run with coverage: `pytest --cov=backend/src`

See `.github/agents/test.md` for comprehensive testing guidance.

---

## 🔧 Development Workflow

### Before Starting Work

```bash
# 1. Activate virtual environment
. .venv/bin/activate

# 2. Run existing tests (establish baseline)
pytest

# 3. Check code quality baseline
make check-all
```

### During Development

```bash
# Run tests frequently
pytest backend/tests/unit              # Fast feedback

# Check formatting/linting
make fix                               # Auto-fix issues
ruff format .                          # Format
ruff check .                           # Lint

# Type checking
mypy backend/src/
pyright
```

### Before Committing

```bash
# 1. Run all quality checks
make check-all

# 2. Verify all tests pass
pytest

# 3. Check frontend (if changed)
cd frontend
npm run lint
npm run type-check
npm test

# 4. Test in Electron app
npm run electron:dev

# 5. Stage and commit
cd ..
git status
git add .
git commit -m "feat: descriptive message"
```

### Pre-Commit Hooks

Pre-commit hooks run automatically on `git commit`:
- ruff format (formatting)
- ruff check (linting)
- mypy (type checking)
- bandit (security scanning)

**If pre-commit fails:**
```bash
# Auto-fix issues
make fix

# Re-run pre-commit
pre-commit run --all-files

# Then commit
git add .
git commit -m "message"
```

---

## 📚 Key Documentation Files

### For Quick Reference
| File | Purpose | When to Use |
|------|---------|-------------|
| **GITHUB_AGENT.md** | This file | First stop, quick reference |
| **internal-docs/facts.json** | Source of truth | When information conflicts (highest authority) |
| **AGENTS.md** | Development workflow | Detailed development guidance |
| **CLAUDE_INDEX.md** | Quick start index | Task-based navigation to detailed docs |

### For Deep Dives
| File | Purpose |
|------|---------|
| **internal-docs/CONTEXT.md** | Comprehensive project context (~150KB) |
| **BUILD.md** | Complete build instructions |
| **DEPLOYMENT.md** | Distribution and deployment guide |
| **USER_GUIDE.md** | End user documentation |
| **CONTRIBUTING.md** | Contribution guidelines |

### For Specialized Tasks
| File | Purpose |
|------|---------|
| **.github/agents/test.md** | Testing strategies and guidance |
| **.github/agents/architecture.md** | System design and decisions |
| **.github/agents/debug.md** | Debugging techniques |
| **.github/agents/documentation.md** | Technical writing guide |

### Trust Hierarchy (when information conflicts)
1. **internal-docs/facts.json** (HIGHEST AUTHORITY)
2. Permanent documentation in `internal-docs/`
3. Active plans in `agent-projects/` (hints only)

---

## 🔍 Common Issues & Solutions

### "Module not found" Error (Python)
**Cause**: Virtual environment not activated
**Solution**: `. .venv/bin/activate` from project root

### Tests Failing on Import
**Cause**: Package not installed in development mode
**Solution**:
```bash
. .venv/bin/activate
pip install -e '.[dev]'
```

### Type Checking Errors
**Cause**: Missing type annotations
**Solution**: Add type hints to all function parameters and returns

### Backend Executable Won't Run
**Cause**: Missing hidden imports in PyInstaller spec
**Solution**: Add missing modules to `backend/build_config/ninebox.spec` hiddenimports

### Electron App Won't Start
**Cause**: Backend executable not found or not built
**Solution**: Build backend first with `backend/scripts/build_executable.{sh,bat}`

### Frontend Can't Connect to Backend
**Cause**: Backend not running or wrong port
**Solution**: Check backend is running on port 38000, check logs

### Pre-commit Hooks Failing
**Cause**: Code quality issues
**Solution**:
```bash
make fix                    # Auto-fix format/lint
pre-commit run --all-files  # Re-check
```

### Git Tracking Unexpected Files
**Cause**: Created files in wrong location or used wrong commands
**Solution**: Use `.gitignore`, clean up with `git rm`, use proper file tools

---

## 📖 Additional Resources

### Documentation System

This project uses automated documentation generation:
```bash
# Regenerate all documentation
python tools/build_context.py
```

Runs automatically:
- On push (affecting source/docs)
- Nightly at 2 AM UTC

### File Organization Rules

| Folder | Purpose | Persistence | Git |
|--------|---------|-------------|-----|
| `agent-tmp/` | Scratch/debug/intermediates | Ephemeral (7 days) | ❌ No (gitignored) |
| `agent-projects/<project>/` | Active project plans | Short-lived (<21 days) | ✅ Yes |
| `internal-docs/` | Permanent documentation | Persistent | ✅ Yes |
| `internal-docs/_generated/` | Auto-generated docs | Auto-updated | ✅ Yes |

**Rules:**
- **DO NOT** create analysis reports in project root
- **DO** use `agent-tmp/` for temporary work
- **DO** create structured plans in `agent-projects/<name>/` with metadata

### Custom Agent Profiles

Specialized agents in `.github/agents/`:
- `architecture.md` - System design
- `test.md` - Testing strategies
- `debug.md` - Debugging
- `documentation.md` - Technical writing

---

## 🎯 Success Checklist

Before considering yourself onboarded:

- [ ] Can activate Python venv without errors
- [ ] Can run backend tests successfully (`pytest`)
- [ ] Can run frontend tests successfully (`npm test`)
- [ ] Understand monorepo structure (Python + Node.js)
- [ ] Know platform constraints (Windows development, file operations)
- [ ] Know how to build backend executable
- [ ] Know how to run Electron app in dev mode
- [ ] Know where to find documentation (facts.json, CONTEXT.md)
- [ ] Know testing workflow (unit → integration → E2E)
- [ ] Know code quality workflow (format, lint, type-check, security)

---

## 💡 Pro Tips

1. **Always activate venv first** - saves 90% of common errors
2. **Run tests early and often** - establish baseline before changes
3. **Use `make check-all`** - runs all quality checks at once
4. **Test in Electron app** - don't just test in web mode
5. **Trust facts.json** - highest authority when docs conflict
6. **Use View/Edit/Create tools** - safer than Bash file operations on Windows
7. **Read error messages** - they usually point to the exact problem
8. **Check `.github/agents/*.md`** - specialized guidance for deep tasks

---

## 📞 Need Help?

1. Check [internal-docs/facts.json](internal-docs/facts.json) - source of truth
2. Review [CLAUDE_INDEX.md](CLAUDE_INDEX.md) - quick start index
3. Check [AGENTS.md](AGENTS.md) - workflow guidance
4. Search [internal-docs/CONTEXT.md](internal-docs/CONTEXT.md) - comprehensive context
5. Review [agent-projects/](agent-projects/) - recent work and patterns

---

**Ready to contribute? Great! Activate your venv and start coding! 🚀**
