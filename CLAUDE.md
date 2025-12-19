# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**9Boxer is a standalone desktop application** built with Electron that embeds a FastAPI backend bundled with PyInstaller. It visualizes and manages employee performance using the 9-box talent grid methodology.

**Key Architecture Points:**
- **Deployment**: Standalone Electron desktop app (Windows/macOS/Linux installers)
- **Frontend**: React 18 + TypeScript + Vite + Material-UI wrapped in Electron
- **Backend**: FastAPI (Python 3.10+) bundled as executable with PyInstaller
- **Communication**: Backend runs as subprocess, frontend communicates via HTTP (localhost:8000)
- **Database**: SQLite stored in user's app data directory
- **No external dependencies**: Everything bundled, no Python/Node.js installation required for end users

**Legacy Note**: Docker-based web deployment configuration exists but is dormant and not actively maintained. The primary deployment target is the standalone Electron application.

## Critical: Virtual Environment

**This is a monorepo with backend (Python) and frontend (Node.js).**

**For Python/Backend work, ALWAYS activate the root virtual environment:**
```bash
# From project root
. .venv/bin/activate   # Linux/macOS
# or
.venv\Scripts\activate  # Windows
```

If you see "module not found" errors, the venv is not activated. This is the #1 cause of issues.

## Project Structure

This is a consolidated monorepo for a standalone Electron desktop application:

```
9boxer/
  .venv/              ← Single Python venv (backend deps + quality tools)
  pyproject.toml      ← Backend dependencies + comprehensive quality config
  backend/            ← FastAPI backend
    src/ninebox/      ← Backend source code
    tests/            ← Backend tests
    build_config/     ← PyInstaller configuration (ninebox.spec)
    scripts/          ← Build scripts (build_executable.sh/bat)
    dist/ninebox/     ← PyInstaller output (bundled backend executable)
  frontend/           ← React + Electron frontend
    node_modules/     ← Frontend deps (separate from Python)
    src/              ← React components
    electron/         ← Electron wrapper
      main/index.ts   ← Main process (backend lifecycle, window management)
      preload/index.ts← IPC bridge (secure contextBridge API)
      renderer/       ← Splash screen
    release/          ← Electron Builder output (platform-specific installers)
  USER_GUIDE.html     ← Bundled user documentation
```

**Backend Lifecycle (Electron Integration):**
1. Electron main process spawns backend executable from `resources/backend/`
2. Waits for health check at http://localhost:8000/health
3. Frontend loads and communicates with backend via HTTP
4. Backend killed when app closes

**Build Outputs:**
- Backend: `backend/dist/ninebox/` (PyInstaller executable, ~225MB)
- Frontend: `frontend/release/` (Platform installers, ~300MB each)
  - Windows: NSIS installer (.exe)
  - macOS: DMG installer (.dmg)
  - Linux: AppImage (.AppImage)

## Common Commands

### Development Setup
```bash
# First time setup (from project root)
python3 -m venv .venv
. .venv/bin/activate
pip install --upgrade pip
pip install -e '.[dev]'
pre-commit install
```

### Testing (Backend)
```bash
# Always activate venv first: . .venv/bin/activate

pytest                                  # Run all backend tests
pytest backend/tests/test_auth.py       # Run specific test file
pytest -k "test_login"                  # Run tests matching pattern
pytest -v                               # Verbose output
pytest --cov=backend/src                # Run with coverage
```

### Code Quality (Backend)
```bash
# Run all quality checks at once
make check-all

# Individual checks
ruff format .                  # Format code
ruff format --check .          # Check formatting
ruff check .                   # Lint code
ruff check --fix .             # Auto-fix linting issues
mypy backend/src/              # Type check with mypy
pyright                        # Type check with pyright
bandit -r backend/src/         # Security scan

# Quick fix
make fix                       # Auto-fix formatting and linting
```

### Frontend Commands
```bash
cd frontend
npm install                    # Install dependencies
npm run dev                    # Vite dev server (for web development)
npm run electron:dev           # Run Electron in dev mode (full app)
npm test                       # Run Vitest component tests
npm run test:e2e:pw            # Run Playwright E2E tests
```

### Build Commands (Standalone Application)

**Important**: The backend must be built BEFORE building the frontend/Electron app.

```bash
# Step 1: Build backend executable (from project root)
cd backend
.venv\Scripts\activate         # Windows
# or
. .venv/bin/activate           # Linux/macOS
.\scripts\build_executable.bat # Windows
# or
./scripts/build_executable.sh  # Linux/macOS

# Verify backend build
ls dist/ninebox/               # Should see ninebox.exe or ninebox executable

# Step 2: Build Electron application
cd ../frontend
npm run electron:build         # Validates backend exists, then builds

# Output in frontend/release/
# - Windows: 9Boxer-1.0.0-Windows-x64.exe
# - macOS: 9Boxer-1.0.0-macOS-x64.dmg
# - Linux: 9Boxer-1.0.0-Linux-x64.AppImage
```

### Makefile Targets
- `make test` - Run tests
- `make coverage` - Run tests with HTML coverage report
- `make check-all` - Run all quality checks (format, lint, type, security, test)
- `make fix` - Auto-fix formatting and linting issues
- `make clean` - Clean up generated files
- `make dev` - Set up development environment

## Architecture Overview

### Backend Package Structure
The backend uses the standard Python `src/` layout:
- **`backend/src/ninebox/`** - FastAPI backend application
  - All functions require type annotations
  - Comprehensive docstrings with examples
  - API routes in `routers/`
  - Business logic in `services/`
  - Data models in `models/`
- **`backend/tests/`** - Test files following pytest conventions
  - Named `test_*.py`
  - Test functions named `test_function_when_condition_then_expected`
  - No conditional assertions in test bodies

### Frontend Structure
- **`frontend/src/`** - React application (TypeScript)
- **`frontend/electron/`** - Electron wrapper
  - `main/` - Main process
  - `preload/` - Preload scripts
  - `renderer/` - Renderer utilities

### File Organization Conventions
The project has strict conventions for where files belong (see [AGENT_DOCS_CONTRACT.md](AGENT_DOCS_CONTRACT.md)):

| Folder | Purpose | Persistence | Git |
|--------|---------|-------------|-----|
| `agent-tmp/` | Scratch/debug/intermediates | Ephemeral (7 days) | ❌ No |
| `agent-projects/<project>/` | Ephemeral plans for refactors/features | Short-lived (21 days active) | ✅ Yes |
| `docs/` | Permanent documentation | Persistent | ✅ Yes |
| `docs/_generated/` | Auto-generated docs | Auto-updated | ✅ Yes |

**Rules:**
- **DO NOT** create analysis reports or planning documents in the project root
- **DO NOT** manually edit files in `docs/_generated/` (auto-generated)
- **DO** use `agent-tmp/` for all temporary work
- **DO** create structured plans in `agent-projects/<project-name>/` with required metadata

### Custom Agent Profiles
Specialized agent profiles exist in `.github/agents/`:
- `architecture.md` - System design and architectural decisions
- `test.md` - Test writing strategies and comprehensive testing guidance
- `debug.md` - Debugging and troubleshooting
- `documentation.md` - Technical writing and documentation

These can be referenced when working on specialized tasks.

### Type Checking
This project uses **both mypy and pyright** for comprehensive type checking:
- **mypy**: Configured via `[tool.mypy]` in `pyproject.toml`
- **pyright**: Configured via `pyrightconfig.json`

All code must have type annotations:
- ALL function parameters must be typed
- ALL function returns must be typed
- Use modern Python typing: `list[str]`, `dict[str, int]`, `Optional[T]`
- `self` in classes is untyped; all other parameters must be typed
- Run both checkers: `make type-check` (runs mypy + pyright)

**Why both tools?**
- Different type checkers can catch different issues
- mypy is the "official" Python type checker
- pyright/Pylance is used by VSCode for real-time type checking
- Both passing ensures consistency between CLI and IDE

### Testing Approach
1. **Run existing tests first** to establish baseline
2. Follow TDD approach when practical
3. Test naming: `test_function_when_condition_then_expected`
4. No conditional logic in test bodies (no `if` statements)
5. Avoid testing types - test behavior instead
6. Avoid over-mocking (don't mock business logic)
7. Aim for >80% coverage

See `.github/agents/test.md` for comprehensive testing guidance.

### Frontend Testing

**Test Frameworks:**
- **Component Tests:** Vitest + React Testing Library
- **E2E Tests:** Playwright

**Running Tests:**
```bash
# Navigate to frontend directory
cd frontend

# Component tests (watch mode)
npm test

# Component tests (run once)
npm run test:run

# Component tests with coverage
npm run test:coverage

# Component tests with UI
npm run test:ui

# E2E tests - Playwright
npm run test:e2e:pw              # Run all Playwright E2E tests
npm run test:e2e:pw:ui           # Run with Playwright UI mode
npm run test:e2e:pw:debug        # Run in debug mode
npx playwright test upload-flow.spec.ts  # Run specific test file
```

**Playwright Features:**
- Automatically starts both backend (FastAPI) and frontend (Vite) servers
- No manual server setup required
- Tests run in isolation with automatic cleanup
- Superior ARM compatibility and performance
- All 12 E2E tests passing

**Writing Component Tests:**
- Test framework: React Testing Library with Vitest
- Location: `frontend/src/components/__tests__/` or colocated `ComponentName.test.tsx`
- Follow user-visible behavior, not implementation details
- Use `data-testid` attributes for reliable element selection
- Use `render` from `@/test/utils` (includes test providers)
- Mock user events with `fireEvent` or `userEvent`
- Test async behavior with `waitFor`

Example pattern:
```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@/test/utils';
import Button from '@/components/Button';

describe('Button', () => {
  it('displays label when rendered', () => {
    render(<Button label="Click me" />);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick handler when clicked', () => {
    const handleClick = vi.fn();
    render(<Button label="Click" onClick={handleClick} />);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalled();
  });
});
```

**Writing E2E Tests with Playwright:**
- Test framework: Playwright
- Location: `frontend/playwright/e2e/` with naming pattern `feature-flow.spec.ts`
- Helpers: `frontend/playwright/helpers/` (uploadFile, navigation, assertions)
- Fixtures: `frontend/playwright/fixtures/` (Excel test files)
- Configuration: `frontend/playwright.config.ts`
- Test complete user workflows end-to-end
- Use `page.goto()` to navigate, helper functions from `playwright/helpers/`
- Use `data-testid` attributes for reliable element selection
- Verify both UI updates and data consistency
- Servers auto-start (no manual setup required)

Example pattern:
```typescript
import { test, expect } from '@playwright/test';
import { uploadExcelFile } from '../helpers/upload';

test.describe('Employee Upload Flow', () => {
  test('allows user to upload Excel file and view employees', async ({ page }) => {
    await page.goto('/');

    // Upload file using helper function
    await uploadExcelFile(page, 'sample-employees.xlsx');

    // Verify grid displays with employees
    await expect(page.getByTestId('nine-box-grid')).toBeVisible();
    const employeeCards = page.getByTestId('employee-card');
    await expect(employeeCards).toHaveCount(await employeeCards.count());
  });
});
```

**Playwright Test Files:**
- `upload-flow.spec.ts` - File upload workflows (3 tests)
- `employee-movement.spec.ts` - Drag and drop functionality (2 tests)
- `filter-flow.spec.ts` - Search and filtering (3 tests)
- `export-flow.spec.ts` - Excel export functionality (2 tests)
- `intelligence-flow.spec.ts` - AI insights features (2 tests)

**Test Data & Fixtures:**
- Component test mock data: `frontend/src/test/mockData.ts`
- E2E test fixtures: `frontend/playwright/fixtures/`
- Use factory functions for variations on test data
- Keep test data realistic and representative

See `agent-projects/test-automation-investment/test-principles.md` for comprehensive testing principles and best practices.

### CI/CD Pipeline
GitHub Actions workflows in `.github/workflows/`:
- **`ci.yml`** - Main CI pipeline:
  - Lint, format, type check, security scan
  - Tests across multiple OS (Ubuntu, Windows, macOS) and Python versions (3.10, 3.11, 3.12)
  - Smart test selection based on changed files
  - Coverage enforcement on changed files (70% threshold)
- **`nightly.yml`** - Nightly regression testing
- **`docs.yml`** - Documentation updates

The CI uses smart test selection via `.github/scripts/smart_test_selection.py` to only run relevant tests for PRs.

## Documentation System

This project has an automated documentation generation system that creates a "self-healing documentation loop."

### Documentation Command
```bash
# Regenerate all documentation
python tools/build_context.py
```

This happens automatically via GitHub Actions on push and nightly at 2 AM UTC.

### What Gets Generated
The `tools/build_context.py` script automatically:
1. **Generates API docs** from Python docstrings using pdoc3 → `docs/_generated/api/`
2. **Collects active plans** from `agent-projects/` (status=active, <21 days old)
3. **Builds CONTEXT.md** - Comprehensive project context for AI agents
4. **Updates SUMMARY.md** - Quick index of all documentation components
5. **Updates CHANGELOG.md** - Appends entry with timestamp and changes
6. **Cleans agent-tmp/** - Removes files older than 7 days

### Key Documentation Files

**For AI Agents to Read:**
- **`docs/CONTEXT.md`** - Main entry point; comprehensive project context (~150KB)
- **`docs/facts.json`** - Stable, hand-maintained project truths (highest authority)
- **`docs/SUMMARY.md`** - Quick index of all documentation
- **`docs/_generated/plans_index.md`** - Summary of active plans
- **`docs/_generated/api/`** - Auto-generated API documentation

**Trust Hierarchy** (when information conflicts):
1. `docs/facts.json` (highest authority)
2. Permanent content in `docs/`
3. Active plans summaries (hints only)

### Working with Documentation

**When writing permanent documentation:**
- Create/update files in `docs/` directory
- Use clear, descriptive filenames
- Update existing docs rather than duplicating

**When creating project plans:**
- Create `agent-projects/<project-name>/plan.md`
- Include required metadata:
  ```yaml
  status: active|paused|done
  owner: <name>
  created: YYYY-MM-DD
  summary:
    - short bullet point
    - another bullet point
  ```

**When doing temporary work:**
- Use `agent-tmp/` for all scratch work
- Files auto-deleted after 7 days
- Never commit these files (gitignored)

### Configuration
Environment variables for `tools/build_context.py`:
- `CONTEXT_MAX_CHARS` - Max size of CONTEXT.md (default: 150000)
- `PLANS_MAX_AGE_DAYS` - Max age for active plans (default: 21)
- `CLEAN_TMP_AGE_DAYS` - Max age for agent-tmp files (default: 7)

### Automation
- **Trigger**: Push to main affecting `src/`, `docs/`, `agent-plans/`, or `tools/build_context.py`
- **Schedule**: Nightly at 2 AM UTC
- **Action**: Auto-generates docs and commits changes via GitHub Actions

See [AGENT_DOCS_CONTRACT.md](AGENT_DOCS_CONTRACT.md) for complete documentation system rules.

## Code Quality Standards

All code must pass these checks before commit:
1. **Formatting**: ruff format (100 char line length)
2. **Linting**: ruff check (pycodestyle, pyflakes, isort, bugbear, etc.)
3. **Type Checking**: Both mypy and pyright (relaxed for tests)
4. **Security**: bandit security scanner
5. **Testing**: All tests pass with >80% coverage

Use `make check-all` to run all checks at once.

### Handling Exceptions
For unavoidable warnings:
- `# noqa: <code>` for linting false positives (add justification comment)
- `# type: ignore[<error>]` for typing false positives (add justification)
- `# nosec` for security false positives (add explanation)

## Important Files to Review
- **`AGENTS.md`** - Comprehensive development workflow guidance
- **`AGENT_DOCS_CONTRACT.md`** - Documentation system rules and folder structure
- **`README.md`** - Project overview, features, and quick start
- **`CONTRIBUTING.md`** - Contribution guidelines
- **`docs/CONTEXT.md`** - Main documentation context for AI agents
- **`docs/facts.json`** - Stable project truths (highest authority)
- **`pyproject.toml`** - All tool configurations and dependencies
- **`.github/agents/test.md`** - Comprehensive testing guidance
