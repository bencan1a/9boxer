# Agent Workflows for 9Boxer

**Practical workflows and command reference** for AI agents working on this project.

> **Quick Start:** [CLAUDE_INDEX.md](CLAUDE_INDEX.md) | **Critical Rules:** [CLAUDE_INDEX.md#critical-rules](CLAUDE_INDEX.md#⚠️-top-5-critical-rules) | **Environment Help:** [internal-docs/ENVIRONMENT_SETUP.md](internal-docs/ENVIRONMENT_SETUP.md)

---

## 📱 PROJECT OVERVIEW

**9Boxer** is a standalone Electron desktop application with an embedded PyInstaller backend.

**Key Architecture:**
- **Frontend**: React 18 + TypeScript + Vite + Electron wrapper
- **Backend**: FastAPI (Python 3.10+) bundled as executable with PyInstaller
- **Communication**: Backend runs as subprocess, HTTP over localhost:38000
- **Database**: SQLite in user's app data directory
- **Deployment**: Platform-specific installers (Windows .exe, macOS .dmg, Linux .AppImage)

**Monorepo Structure:**
```
9boxer/
  .venv/              ← Python venv (backend deps + tools)
  pyproject.toml      ← Backend dependencies
  backend/            ← FastAPI backend → PyInstaller executable
  frontend/           ← React + Electron → Platform installers
```

**This is NOT a web app.** Docker config exists but is legacy (not maintained).

---

## 🏗️ ARCHITECTURE QUICK REFERENCE

**Before implementing features, consult architecture docs:**

| Task | Documentation |
|------|---------------|
| **API endpoint** | [ERROR_HANDLING.md](internal-docs/architecture/ERROR_HANDLING.md) - Error patterns, HTTP status codes |
| **IPC handler** | [SECURITY_MODEL.md](internal-docs/architecture/SECURITY_MODEL.md) - Security boundaries, IPC validation |
| **Database schema** | [MIGRATIONS.md](internal-docs/architecture/MIGRATIONS.md) - Migration patterns, version compatibility |
| **Performance** | [PERFORMANCE.md](internal-docs/architecture/PERFORMANCE.md) - Performance targets, scale constraints |
| **Logging** | [OBSERVABILITY.md](internal-docs/architecture/OBSERVABILITY.md) - Log levels, debugging tools |
| **UI component** | [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) - Design tokens, accessibility, i18n |
| **Past decisions** | [architecture/decisions/](internal-docs/architecture/decisions/) - Architecture Decision Records |

**Full index:** [internal-docs/architecture/ARCHITECTURE_QUICK_REFERENCE.md](internal-docs/architecture/ARCHITECTURE_QUICK_REFERENCE.md)

---

## 📁 FILE ORGANIZATION

**Where to put files:**
- `agent-tmp/` → Temporary/debug files (gitignored, auto-cleaned after 7 days)
- `agent-projects/<name>/` → Active project plans (requires `plan.md` with status/owner/date)
- `internal-docs/` → Permanent documentation (canonical location)
- Root → Configuration files only (pyproject.toml, README.md, etc.)

**DO NOT** create analysis reports or planning documents in project root. See [AGENT_DOCS_CONTRACT.md](AGENT_DOCS_CONTRACT.md) for complete rules.

---

## 🔨 DEVELOPMENT WORKFLOW

### Running the Application in Development

**Option 1: Full Electron App (Recommended for testing)**

```bash
# 1. Build backend (required first time)
cd backend
. .venv/bin/activate           # Windows: .venv\Scripts\activate
./scripts/build_executable.sh  # Windows: .\scripts\build_executable.bat

# 2. Run Electron in dev mode
cd ../frontend
npm run electron:dev
```

**Option 2: Separate Frontend/Backend (Faster for frontend development)**

```bash
# Terminal 1: Run backend executable
cd backend/dist/ninebox
./ninebox  # Windows: ninebox.exe

# Terminal 2: Run Vite dev server
cd frontend
npm run dev

# Access at http://localhost:5173 (web mode - no Electron features)
```

### Building Production Releases

```bash
# Step 1: Build backend (from project root)
cd backend
. .venv/bin/activate           # Activate venv FIRST
./scripts/build_executable.sh  # Windows: .\scripts\build_executable.bat

# Verify output exists
ls dist/ninebox/  # Should see executable

# Step 2: Build Electron application
cd ../frontend

# IMPORTANT: Set ANTHROPIC_API_KEY for AI features
export ANTHROPIC_API_KEY="your-api-key"  # Linux/macOS
# or: set ANTHROPIC_API_KEY=your-api-key # Windows

npm run electron:build

# Output in frontend/release/
# - Windows: 9Boxer-Setup-1.0.0.exe
# - macOS: 9Boxer-1.0.0.dmg
# - Linux: 9Boxer-1.0.0.AppImage
```

**Environment variables:**
- `ANTHROPIC_API_KEY` - Required for AI features (calibration summaries, intelligent insights)
  - Get API key from: https://console.anthropic.com/
  - If not set: Build succeeds, but AI features disabled at runtime
  - Validated in CI (see `.github/workflows/build-electron.yml`)

**Complete build guide:** [BUILD.md](BUILD.md) | **API key details:** [internal-docs/architecture/build-process.md](internal-docs/architecture/build-process.md)

---

## 🧪 TESTING WORKFLOW

### Backend Testing

```bash
# From project root
. .venv/bin/activate

# Run tests by suite (organized by folder)
pytest backend/tests/unit               # Fast unit tests (~30s)
pytest backend/tests/integration        # Integration tests (~2min)
pytest backend/tests/e2e                # E2E frozen exe tests (~3min)
pytest backend/tests/performance        # Benchmark tests (~5min)

# Run tests by marker (alternative)
pytest -m unit                  # Unit tests only
pytest -m "not slow"            # Fast tests only

# Run specific tests
pytest backend/tests/unit/api/test_employees.py
pytest -k "test_login"          # Tests matching pattern
pytest -v                       # Verbose output
pytest --cov                    # With coverage
```

**Current coverage:** 92% (372 tests)

### Frontend Testing

```bash
cd frontend

# Component tests (Vitest + React Testing Library)
npm test                        # Watch mode
npm run test:run                # Run once
npm run test:coverage           # With coverage
npm run test:ui                 # Interactive UI

# E2E tests (Playwright - preferred)
npm run test:e2e:pw             # Run all E2E tests
npm run test:e2e:pw:ui          # Run with Playwright UI
npm run test:e2e:pw:debug       # Debug mode
npx playwright test upload-flow.spec.ts  # Specific test file

# Visual regression tests (Playwright)
npm run test:visual             # Run visual regression tests
npm run test:visual:update      # Update baseline snapshots
```

### Testing Best Practices

**DO:**
- ✅ Run existing tests first to establish baseline
- ✅ Write tests for new functionality (TDD approach)
- ✅ Test behavior, not implementation details
- ✅ Use `data-testid` for reliable element selection (frontend)
- ✅ Mock I/O boundaries (HTTP, DB, filesystem), NOT business logic

**DON'T:**
- ❌ Conditional assertions (if statements in test bodies)
- ❌ Over-mocking (mocking business logic)
- ❌ Hardcoded strings in tests (use data-testid)
- ❌ Arbitrary timeouts (use event-driven waits)

**Comprehensive testing guide:** [internal-docs/testing/](internal-docs/testing/) | **Testing agents:** [.github/agents/README-TESTING-AGENTS.md](.github/agents/README-TESTING-AGENTS.md)

---

## 📋 CODE QUALITY WORKFLOW

### Pre-Commit Checks (REQUIRED)

**ALL commits must pass pre-commit hooks** (same checks as CI):

```bash
# From project root
. .venv/bin/activate

# Run pre-commit checks on files you're committing
pre-commit run --files <file1> <file2> ...

# Or run on all files (comprehensive)
pre-commit run --all-files

# If checks pass, proceed with commit
git add <files>
git commit -m "message"
```

**What pre-commit checks:**
- Ruff format & lint (Python)
- Mypy & Pyright type checking (Python)
- Bandit security scan (Python)
- ESLint & Prettier (TypeScript/JavaScript)
- Doc size validation (CLAUDE_INDEX.md, AGENTS.md, GITHUB_AGENT.md)
- i18n translation validation

### Backend Quality Checks

```bash
# From project root
. .venv/bin/activate

# Run all checks at once (recommended)
make check-all

# Or run individually
make fix                        # Auto-fix formatting and linting
ruff format .                   # Format code
ruff check .                    # Lint code
mypy backend/src/               # Type check (mypy)
pyright                         # Type check (pyright)
bandit -r backend/src/          # Security scan
pytest                          # Run tests
```

### Frontend Quality Checks

```bash
cd frontend

npm run lint                    # ESLint (blocks on errors only)
npm run format                  # Prettier
npm run type-check              # TypeScript compiler
npm test                        # Vitest component tests
npm run test:e2e:pw             # Playwright E2E tests
```

### Type Annotation Requirements

**Python:** ALL function parameters and returns must be typed.

```python
from typing import Optional

def process_employees(
    employee_ids: list[str],
    max_count: Optional[int] = None
) -> dict[str, int]:
    """Process employees and return count mapping."""
    # implementation
```

**TypeScript:** Use strict mode. All functions and variables should have explicit types.

---

## 🚀 COMMON TASKS

### Starting a New Feature

```bash
# 1. Check environment
python -c "import sys; print('VENV' if sys.prefix != sys.base_prefix else 'SYSTEM')"
. .venv/bin/activate  # If showing SYSTEM

# 2. Create feature branch
git checkout -b feature/your-feature-name

# 3. Run existing tests (establish baseline)
pytest

# 4. Implement feature with TDD approach
# - Write test first
# - Implement feature
# - Refactor

# 5. Run quality checks
make check-all

# 6. Test in Electron app
cd frontend && npm run electron:dev

# 7. Commit with descriptive message
git add .
git commit -m "feat: Add feature description"
```

### Before Committing

```bash
# 1. Activate venv
. .venv/bin/activate

# 2. Run backend quality checks
make check-all

# 3. Run frontend checks (if changed)
cd frontend
npm run lint
npm run type-check
npm test

# 4. Run pre-commit hooks
cd ..
pre-commit run --all-files

# 5. Commit if all checks pass
git add .
git commit -m "feat|fix|docs|test|refactor: Description"
```

### Pull Request Checklist

- [ ] Virtual environment activated during development
- [ ] All tests pass (backend and frontend)
- [ ] Code coverage maintained/improved (>80%)
- [ ] All quality checks pass (format, lint, type, security)
- [ ] Pre-commit hooks pass
- [ ] Documentation updated if needed
- [ ] No temporary files in commit
- [ ] Tested in Electron app (not just web mode)

### Creating Documentation Screenshots

```bash
cd frontend

# Generate all automated screenshots
npm run screenshots:generate

# Generate specific screenshots
npm run screenshots:generate grid-normal changes-tab

# Run in headed mode (show browser)
HEADLESS=false npm run screenshots:generate
```

**Screenshot architecture:** `frontend/playwright/screenshots/` - shares helpers with E2E tests for consistency.

---

## 🤖 CUSTOM AGENT PROFILES

Specialized agent profiles in `.github/agents/`:

- **test-architect**, **test-backend-expert**, **test-frontend-expert**, **test-e2e-expert** - Testing specialists
- **architecture** - System design and architectural decisions
- **debug** - Debugging and troubleshooting
- **documentation** - Technical writing and documentation

**Slash commands:**
```bash
/test-review          # Weekly test architecture review
/test-backend         # Backend testing consultation
/test-frontend        # Frontend testing consultation
/test-e2e             # E2E testing consultation
```

See `.github/agents/README.md` for detailed usage.

---

## 🔍 COMMON ISSUES AND SOLUTIONS

| Issue | Likely Cause | Solution |
|-------|--------------|----------|
| **"Module not found" (Python)** | Venv not activated | `. .venv/bin/activate` (verify with `which python`) |
| **Tests fail on import** | Dev mode not installed | `pip install -e '.[dev]'` |
| **Electron won't start** | Backend not built | `cd backend && ./scripts/build_executable.sh` |
| **Type checking errors** | Missing type annotations | Add types to all function params/returns |
| **Pre-commit fails** | Code quality issues | `make fix` then `pre-commit run --all-files` |
| **Frontend can't connect** | Backend not running | Check http://localhost:38000/health |
| **Backend exe won't run** | Missing modules | Add to `backend/build_config/ninebox.spec` hiddenimports |
| **Phantom `nul` files** | Used `> "nul"` in Bash | See [PLATFORM_CONSTRAINTS.md](internal-docs/PLATFORM_CONSTRAINTS.md) |
| **Paths mangled in Bash** | Used `C:\...` absolute path | Use relative paths only or Read/Write/Edit tools |
| **Agent tries to install but fails** | Wrong environment | Check environment first (see [CLAUDE_INDEX.md](CLAUDE_INDEX.md)) |

**Full troubleshooting:** [CLAUDE_INDEX.md#common-issues](CLAUDE_INDEX.md#🔍-common-issues)

---

## 🔍 QUICK REFERENCE

### Essential Commands

```bash
# Environment check
python -c "import sys; print('VENV' if sys.prefix != sys.base_prefix else 'SYSTEM')"
. .venv/bin/activate

# Quality checks
make check-all              # All backend checks
make fix                    # Auto-fix formatting and linting

# Testing
pytest                      # All backend tests
pytest -m unit              # Fast tests only
cd frontend && npm test     # Frontend component tests
cd frontend && npm run test:e2e:pw  # E2E tests

# Building
cd backend && ./scripts/build_executable.sh
cd frontend && npm run electron:build

# Running
cd frontend && npm run electron:dev  # Full Electron app
```

### Search Commands

```bash
# Find files
git ls-files "*.py"
git ls-files "*.ts" "*.tsx"

# Search code
git grep "def process_"
git grep -n "useState" -- "*.tsx"

# Recent changes
git log --oneline -10
git diff HEAD~1
```

### Documentation Lookup

```bash
# Task-based navigation
cat CLAUDE_INDEX.md          # Quick start index
cat BUILD.md                 # Build instructions
cat DEPLOYMENT.md            # Distribution guide

# Architecture docs
ls internal-docs/architecture/  # All architecture docs
cat internal-docs/facts.json    # Highest authority source of truth

# Testing docs
ls internal-docs/testing/       # Testing guides
cat .github/agents/README-TESTING-AGENTS.md  # Testing agent system
```

---

## 💡 PRO TIPS

- **Save time**: Use `make check-all` for all quality checks at once
- **Fast feedback**: Run `pytest -m unit` (fast tests) before full suite
- **Avoid errors**: Always activate venv first (prevents 90% of issues)
- **Platform safe**: Use Read/Edit/Write tools, not Bash commands (`rm`, `touch`, `cp`, `mv`)
- **Trust hierarchy**: When docs conflict → `internal-docs/facts.json` (highest) → `internal-docs/` → active plans
- **Test in Electron**: Don't just test in web mode - Electron has different bugs
- **Check environment first**: Run environment detection before installing dependencies (see [ENVIRONMENT_SETUP.md](internal-docs/ENVIRONMENT_SETUP.md))

---

**For complete project context:** [internal-docs/CONTEXT.md](internal-docs/CONTEXT.md)
**For quick task navigation:** [CLAUDE_INDEX.md](CLAUDE_INDEX.md)
