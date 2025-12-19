# AGENT GUIDANCE FOR 9BOXER PROJECT

This file provides critical guidance for all agents (human and AI) working on this project.

## 📱 PROJECT OVERVIEW

**9Boxer is a standalone desktop application** built with Electron that embeds a FastAPI backend bundled with PyInstaller.

**Key Facts:**
- **Deployment**: Electron desktop app (Windows/macOS/Linux installers)
- **Architecture**: React frontend + Electron wrapper + embedded PyInstaller backend
- **Communication**: Backend runs as subprocess, HTTP over localhost:8000
- **Database**: SQLite in user's app data directory
- **No external dependencies**: Everything bundled in installer

**This is NOT a web application.** Docker deployment configuration exists but is legacy.

## 🔧 ENVIRONMENT SETUP

### Virtual Environment - CRITICAL REQUIREMENT

**⚠️ ALWAYS ACTIVATE THE VIRTUAL ENVIRONMENT BEFORE RUNNING PYTHON TOOLS**

```bash
# Activate venv - do this FIRST in every session (from project root)
. .venv/bin/activate      # Linux/macOS
# or
.venv\Scripts\activate    # Windows

# Verify activation (should show .venv/bin/python or .venv\Scripts\python.exe)
which python              # Linux/macOS
where python              # Windows
```

**Common Issue:** If a Python module appears to not be installed, this is usually because the venv has not been activated. Always activate the venv first!

### Initial Setup

```bash
# From project root
python3 -m venv .venv
. .venv/bin/activate      # Windows: .venv\Scripts\activate

# Install dependencies
pip install --upgrade pip
pip install -e '.[dev]'

# Set up pre-commit hooks (optional but recommended)
pre-commit install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

## 🏗️ ARCHITECTURE UNDERSTANDING

### Monorepo Structure

This is a monorepo with **two separate ecosystems**:

**Backend (Python):**
- FastAPI application
- Bundled into standalone executable with PyInstaller
- Dependencies managed via root `pyproject.toml`
- Virtual environment at `.venv/` (project root)

**Frontend (TypeScript/JavaScript):**
- React application + Electron wrapper
- Dependencies managed via `frontend/package.json`
- Node modules at `frontend/node_modules/`

**They are separate but integrated:**
- Backend built FIRST with PyInstaller
- Frontend packaging includes backend executable
- Electron spawns backend as subprocess
- Communication via HTTP (localhost:8000)

### Build Flow

```
1. Backend Build (PyInstaller)
   backend/src/ninebox/main.py → backend/dist/ninebox/ninebox.exe

2. Frontend Build (Vite + Electron Builder)
   frontend/src/ → frontend/dist/ (React app)
   frontend/electron/ → frontend/dist-electron/ (Electron code)

3. Electron Packaging (Electron Builder)
   Combines: Electron + React app + Electron code + Backend executable
   → frontend/release/ (platform installers)
```

### Key Files

**Backend:**
- `backend/src/ninebox/main.py` - FastAPI entry point
- `backend/build_config/ninebox.spec` - PyInstaller configuration
- `backend/scripts/build_executable.{sh,bat}` - Build scripts

**Electron:**
- `frontend/electron/main/index.ts` - Main process (backend lifecycle)
- `frontend/electron/preload/index.ts` - IPC bridge
- `frontend/electron-builder.json` - Packaging configuration

**Documentation:**
- `CLAUDE.md` - Claude Code guidance (you are reading this type of file)
- `BUILD.md` - Complete build instructions
- `DEPLOYMENT.md` - Distribution and deployment guide
- `docs/facts.json` - Highest authority source of truth

## 📁 FILE ORGANIZATION

**CRITICAL: Follow these conventions when creating files:**

### Temporary/Debug Files → `agent-tmp/`
- Debugging scripts
- Temporary analysis files
- Work-in-progress experiments
- Test data samples
- **Note:** This directory is gitignored, auto-cleaned after 7 days

### Project Documentation → `agent-projects/`
- Active project folders (e.g., `agent-projects/feature-name/`)
- Refactoring plans
- Code analysis reports
- Each project should have its own subdirectory with a `plan.md`
- Required metadata in `plan.md`:
  ```yaml
  status: active|paused|done
  owner: <name>
  created: YYYY-MM-DD
  summary:
    - short bullet point
  ```

### Permanent Documentation → `docs/`
- API documentation
- Architecture guides
- Deployment guides
- Testing guides
- Decision records (ADRs)

### Configuration Files → Root Directory
- README.md
- This file (AGENTS.md)
- CLAUDE.md
- pyproject.toml
- Other project-level configuration

**DO NOT** create analysis reports, planning documents, or temporary files in the project root.

## 🔨 DEVELOPMENT WORKFLOW

### Running the Application in Development

**Full Electron App (Recommended for testing):**

```bash
# 1. Build backend (required first time)
cd backend
. .venv/bin/activate
.\scripts\build_executable.bat  # Windows
# or
./scripts/build_executable.sh   # Linux/macOS

# 2. Run Electron in dev mode
cd ../frontend
npm run electron:dev
```

**Separate Frontend/Backend (Faster for frontend development):**

```bash
# Terminal 1: Run backend executable
cd backend/dist/ninebox
./ninebox  # or ninebox.exe

# Terminal 2: Run Vite dev server
cd frontend
npm run dev

# Access at http://localhost:5173 (web mode, no Electron features)
```

### Building Production Releases

```bash
# 1. Build backend (from project root)
cd backend
. .venv/bin/activate
.\scripts\build_executable.bat  # Windows
# or
./scripts/build_executable.sh   # Linux/macOS

# Verify: ls backend/dist/ninebox/  (should see executable)

# 2. Build Electron application
cd ../frontend
npm run electron:build

# Output in frontend/release/
```

See [BUILD.md](BUILD.md) for complete build instructions.

## 🧪 TESTING WORKFLOW

### Pre-Testing Checklist
1. ✅ Activate virtual environment (`. .venv/bin/activate`)
2. ✅ Ensure dependencies are installed
3. ✅ Understand the code being tested

### Backend Testing

```bash
# From project root
. .venv/bin/activate

pytest                     # Run all tests
pytest --cov               # Run with coverage
pytest -k "test_name"      # Run specific tests
pytest -v                  # Verbose output
```

Current coverage: 92% (119 tests)

### Frontend Testing

**Component Tests (Vitest + React Testing Library):**

```bash
cd frontend

npm test                   # Watch mode
npm run test:run           # Run once
npm run test:coverage      # With coverage
npm run test:ui            # Interactive UI
```

**E2E Tests (Cypress):**

```bash
cd frontend

npm run cy:open            # Interactive mode
npm run cy:run             # Headless mode
```

### Testing Sequence

1. **Run existing tests first** to establish baseline
2. **Write tests for new functionality**
   - Backend: `test_function_when_condition_then_expected`
   - Frontend: User-visible behavior, not implementation
3. **Run tests during development**
4. **Before completing work, run full test suite**

### Testing Anti-Patterns to Avoid
- ❌ Conditional assertions (if statements in test bodies)
- ❌ Testing types instead of behavior
- ❌ Over-mocking (mocking business logic)
- ❌ Accepting multiple outcomes in one test
- ❌ Tests that don't fail when production code breaks

See `.github/agents/test.md` for comprehensive testing guidance.

## 📋 CODE QUALITY REQUIREMENTS

**All code must pass quality checks before commit:**

### Backend (Python)

```bash
# From project root
. .venv/bin/activate

# Run all checks at once
make check-all

# Or run individually:
ruff format .              # Format code
ruff check .               # Lint code
mypy backend/src/          # Type check with mypy
pyright                    # Type check with pyright
bandit -r backend/src/     # Security scan
pytest                     # Run tests

# Quick fix
make fix                   # Auto-fix formatting and linting
```

### Frontend (TypeScript)

```bash
cd frontend

npm run lint               # ESLint
npm run format             # Prettier
npm run type-check         # TypeScript
npm test                   # Vitest tests
npm run cy:run             # Cypress E2E tests
```

### Quality Standards
1. **Formatting**: ruff format (Python), Prettier (TypeScript)
2. **Linting**: ruff check, ESLint
3. **Type Checking**: mypy + pyright (Python), TypeScript (frontend)
4. **Security**: bandit (backend)
5. **Testing**: All tests pass with >80% coverage

### Handling Unavoidable Warnings
- `# noqa: <code>` for linting false positives (add justification comment)
- `# type: ignore[<error>]` for typing false positives (add justification)
- `# nosec` for security false positives (add explanation)

## 🎯 TYPE ANNOTATIONS

**Required for all Python code:**
- ALL function parameters must be typed
- ALL function returns must be typed
- Use modern typing: `list[str]`, `dict[str, int]`, `Optional[T]`
- In classes: `self` is untyped, all other parameters must be typed

Example:
```python
from typing import Optional

def process_employees(
    employee_ids: list[str],
    max_count: Optional[int] = None
) -> dict[str, int]:
    """Process employees and return count mapping.

    Args:
        employee_ids: List of employee IDs to process
        max_count: Optional maximum number to process

    Returns:
        Dictionary mapping employee IDs to their counts
    """
    # implementation
    pass
```

## 🤖 CUSTOM AGENT PROFILES

This project includes specialized agent profiles in `.github/agents/`:

- **Architecture Agent** (`architecture.md`): System design and architectural decisions
- **Test Agent** (`test.md`): Test writing and testing strategies
- **Debug Agent** (`debug.md`): Debugging and troubleshooting
- **Documentation Agent** (`documentation.md`): Technical writing and documentation

### Using Custom Agents
```
@workspace /agent test.md Write tests for the employee service
@workspace /agent architecture.md Design a caching strategy
@workspace /agent debug.md Help debug the file upload issue
```

See `.github/agents/README.md` for detailed usage instructions.

## 🚀 COMMON TASKS

### Starting a New Feature

1. Activate venv: `. .venv/bin/activate`
2. Create feature branch: `git checkout -b feature/name`
3. Run existing tests to ensure baseline: `pytest`
4. Implement feature with TDD approach
5. Run quality checks: `make check-all`
6. Test in Electron app: `cd frontend && npm run electron:dev`
7. Commit with descriptive message

### Before Committing

```bash
# Activate venv
. .venv/bin/activate

# Run all backend quality checks
make check-all

# Run frontend checks
cd frontend
npm run lint
npm run type-check
npm test

# Verify all checks pass before committing
cd ..
git status
git add .
git commit -m "Descriptive commit message"
```

### Pull Request Checklist
- [ ] Virtual environment activated during development
- [ ] All tests pass (backend and frontend)
- [ ] Code coverage maintained/improved (>80%)
- [ ] All quality checks pass (format, lint, type, security)
- [ ] Documentation updated if needed
- [ ] No temporary files in commit
- [ ] Tested in Electron app (not just web mode)

## 🔍 COMMON ISSUES AND SOLUTIONS

### "Module not found" Error (Python)
**Cause:** Virtual environment not activated
**Solution:** Run `. .venv/bin/activate` from project root

### Tests Failing on Import
**Cause:** Package not installed in development mode
**Solution:**
```bash
. .venv/bin/activate
pip install -e '.[dev]'
```

### Type Checking Errors
**Cause:** Missing type annotations
**Solution:** Add type hints to all function parameters and returns

### Backend Executable Won't Run
**Cause:** Missing hidden imports in PyInstaller spec
**Solution:** Add missing modules to `backend/build_config/ninebox.spec` hiddenimports

### Electron App Won't Start
**Cause:** Backend executable not found
**Solution:** Build backend first with build scripts in `backend/scripts/`

### Frontend Can't Connect to Backend
**Cause:** Backend not running or wrong port
**Solution:** Check backend is running on port 8000, check logs

## 📚 DOCUMENTATION SYSTEM

This project uses an automated documentation generation system.

### Folder Structure and Rules

| Folder | Purpose | Persistence | Committed to Git |
|--------|---------|-------------|------------------|
| `agent-tmp/` | Scratch / debug / intermediates | Ephemeral (auto-cleaned) | ❌ No (gitignored) |
| `agent-projects/<project>/` | Ephemeral plan docs for refactors, experiments | Short-lived | ✅ Yes |
| `docs/` | Permanent, canonical documentation | Persistent | ✅ Yes |
| `docs/_generated/` | Auto-generated documentation | Auto-updated | ✅ Yes (auto-committed) |

### Primary Documentation Files for Agents

- **`docs/CONTEXT.md`** - Single canonical context file; main entry point
- **`docs/facts.json`** - Stable, hand-maintained truths (HIGHEST AUTHORITY)
- **`docs/SUMMARY.md`** - Quick index of all documentation components
- **`docs/_generated/`** - Auto-generated API docs, schemas, and active plans

### Trust Hierarchy (when information conflicts)
1. `docs/facts.json` (highest authority)
2. Permanent content in `docs/`
3. Active plans summaries (hints only)

### Documentation Command
```bash
# Regenerate all documentation
python tools/build_context.py
```

This happens automatically via GitHub Actions on push and nightly at 2 AM UTC.

## 📖 ADDITIONAL RESOURCES

- [CLAUDE.md](CLAUDE.md) - Claude Code guidance with architecture details
- [BUILD.md](BUILD.md) - Complete build instructions
- [DEPLOYMENT.md](DEPLOYMENT.md) - Distribution and deployment guide
- [README.md](README.md) - Project overview and quick start
- [USER_GUIDE.md](USER_GUIDE.md) - End user guide
- [CONTRIBUTING.md](CONTRIBUTING.md) - Contribution guidelines
- [docs/facts.json](docs/facts.json) - Highest authority source of truth
- [.github/agents/test.md](.github/agents/test.md) - Comprehensive testing guidance

## 🎓 PROJECT PHILOSOPHY

- **Standalone First**: Design for standalone desktop app, not web deployment
- **User Experience**: Native OS integration (file dialogs, app data directories)
- **Offline First**: Everything works offline, no cloud dependencies
- **Quality over Speed**: Take time to write good tests and clean code
- **Type Safety**: Leverage Python's type system and TypeScript
- **Test-Driven Development**: Write tests first when practical
- **Clear Communication**: Use descriptive names and comprehensive docstrings
- **Continuous Improvement**: Refactor as you go

---

**Remember:**
1. Always activate the virtual environment first! (`. .venv/bin/activate`)
2. This is a standalone desktop app, not a web app
3. Build backend BEFORE building Electron app
4. Test in Electron app, not just web mode
5. Trust `docs/facts.json` as highest authority
