# CLAUDE.md

This file provides comprehensive guidance to Claude Code (claude.ai/code) when working with code in this repository.

> **For GitHub Agent/Copilot**: See [GITHUB_AGENT.md](GITHUB_AGENT.md) for a streamlined onboarding guide.
> **For Quick Reference**: See [AGENTS.md](AGENTS.md) for command cheatsheet and workflows.
> **For API Documentation**: See [internal-docs/_generated/api/](internal-docs/_generated/api/) for auto-generated API docs.

## Read This First

This document is organized by category for quick navigation:

1. [Project Overview](#project-overview) - Architecture, deployment, key facts
2. [Critical Environment Setup](#critical-virtual-environment) - Virtual environment (MUST READ!)
3. [Windows Constraints](#️-critical-windows-environment---bash-tool-usage) - Platform-specific rules (CRITICAL!)
4. [Project Structure](#project-structure) - File organization and build outputs
5. [Common Commands](#common-commands) - Development, testing, building, quality checks
6. [Architecture](#architecture-overview) - Backend, frontend, design system
7. [Testing](#testing-approach) - Backend and frontend testing strategies
8. [Documentation System](#documentation-system) - How docs are generated and organized
9. [Code Quality](#code-quality-standards) - Standards and tools
10. [Important Files](#important-files-to-review) - Key documentation references

## Project Overview

**9Boxer is a standalone desktop application** built with Electron that embeds a FastAPI backend bundled with PyInstaller. It visualizes and manages employee performance using the 9-box talent grid methodology.

**Key Architecture Points:**
- **Deployment**: Standalone Electron desktop app (Windows/macOS/Linux installers)
- **Frontend**: React 18 + TypeScript + Vite + Material-UI wrapped in Electron
- **Backend**: FastAPI (Python 3.10+) bundled as executable with PyInstaller
- **Communication**: Backend runs as subprocess, frontend communicates via HTTP (localhost:38000)
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

## ⚠️ CRITICAL: Windows Environment - Bash Tool Usage

**🚨 ABSOLUTE REQUIREMENT FOR CLAUDE CODE AGENTS 🚨**

This project is developed on **Windows**. The Bash tool runs in a Unix-like environment (Git Bash/WSL), but operates on a Windows filesystem. You **MUST** follow these rules:

### ❌ NEVER DO THESE THINGS ❌

1. **NEVER use `rm` to remove files** - Use `git rm` for tracked files, or ask the user
2. **NEVER use `touch` to create files** - Use the Write tool
3. **NEVER write to `/dev/null`** - It will create a file called `dev` in root
4. **NEVER redirect to `nul` with quotes** - `> "nul"` creates a permanent phantom file
5. **NEVER use `cp` or `mv` directly** - Prefer git commands or ask user

### ✅ CORRECT APPROACHES ✅

**For file operations:**
```bash
# ✅ CORRECT - Use git commands
git rm file.txt
git mv oldfile.txt newfile.txt

# ✅ CORRECT - Use Write tool for new files
# Use the Write tool instead of touch or echo >

# ✅ CORRECT - Discard output (no quotes around nul)
command >nul 2>&1        # Windows redirect (no quotes!)
command 2>/dev/null      # Will work in Git Bash
```

**For checking file existence:**
```bash
# ✅ CORRECT - Use test operators
if [ -f "file.txt" ]; then echo "exists"; fi

# ✅ CORRECT - Use git
git ls-files "file.txt"
```

### 🔥 THE `nul` FILE CATASTROPHE 🔥

**If you create a file called `nul` by mistake:**
- It CANNOT be deleted with normal commands
- It CANNOT be removed via git
- It CANNOT be manipulated in Windows Explorer
- It requires **administrator PowerShell** to remove
- It will permanently appear in `git status`

**Why this happens:**
- `nul` is a Windows reserved device name (like `CON`, `PRN`, `AUX`)
- Writing `> "nul"` treats it as a filename, not a device
- Windows creates a special file that breaks normal file operations

**How to avoid:**
- NEVER use `> "nul"` or `>> "nul"`
- ALWAYS use `>nul` (no quotes) for Windows redirects
- ALWAYS use `2>/dev/null` for Unix-style redirects
- BETTER: Use `os.devnull` in Python scripts

### 🚨 CRITICAL: Windows Path Handling 🚨

**ABSOLUTE PATHS BREAK IN BASH ON WINDOWS!**

When using the Bash tool on Windows, Git Bash misinterprets Windows absolute paths like `c:\Git_Repos\9boxer\agent-tmp\file.txt`, causing catastrophic failures:
- The colon `:` gets encoded as UTF-8 (`\357\200\272`)
- Backslashes disappear
- Result: File created as `cGit_Repos9boxeragent-tmpfile.txt` in the wrong location

**❌ NEVER DO THIS:**
```bash
# ❌ WRONG - Windows absolute path in Bash
echo "content" > c:\Git_Repos\9boxer\agent-tmp\file.txt
cat c:\Git_Repos\9boxer\backend\src\ninebox\models.py
```

**✅ ALWAYS DO THIS:**
```bash
# ✅ CORRECT - Relative paths only
echo "content" > agent-tmp/file.txt
cat backend/src/ninebox/models.py

# ✅ BETTER - Use Write/Read/Edit tools for file operations
# Use Write tool to create agent-tmp/file.txt
# Use Read tool to read backend/src/ninebox/models.py
```

**For File Operations - Strict Priority Order:**
1. **FIRST CHOICE**: Use Write/Read/Edit tools (they handle paths correctly)
2. **SECOND CHOICE**: Use relative paths from working directory in Bash
3. **NEVER**: Use Windows absolute paths (C:\...) in Bash commands

**If You Create Malformed Path Files:**
- Symptom: Files like `cGit_Repos9boxeragent-tmpfile.txt` appear in git status
- Cause: Used absolute Windows path in Bash tool
- Fix: Ask user to clean up via PowerShell or Windows Explorer

### When in Doubt

**ASK THE USER** before performing file system operations that:
- Delete files (use git rm for tracked files)
- Move files (use git mv for tracked files)
- Redirect output to special files
- Create files in unusual locations

## Critical: Windows Reserved Names

**IMPORTANT**: This project is developed on Windows. Avoid creating files with Windows reserved device names.

### Reserved Names to NEVER Use as Filenames
Windows reserves these names (case-insensitive, with or without extensions):
- `CON`, `PRN`, `AUX`, `NUL`
- `COM1` through `COM9`
- `LPT1` through `LPT9`

**Common Issue: `nul` Files**
If you see phantom `nul` files that cannot be deleted/moved/renamed:
- **Cause**: Using `"nul"` as a filename parameter instead of as a device redirect
- **Symptom**: Zero-byte files appearing in git status but cannot be manipulated in Windows Explorer or git
- **Fix**: Use PowerShell with device path syntax:
  ```powershell
  # From PowerShell (adjust paths as needed)
  del "\\.\C:\Git_Repos\9boxer\nul"
  del "\\.\C:\Git_Repos\9boxer\backend\nul"
  del "\\.\C:\Git_Repos\9boxer\frontend\nul"
  ```
  Alternative: `Remove-Item -Path "\\?\C:\full\path\to\nul" -Force`

### Proper Null Device Usage

**In Python code:**
```python
import os
import subprocess

# ✅ CORRECT - Cross-platform null device
with open(os.devnull, 'w') as devnull:
    subprocess.run(['command'], stdout=devnull, stderr=devnull)

# ❌ WRONG - Creates phantom file on Windows
with open('nul', 'w') as f:
    f.write('data')
```

**In shell commands:**
```bash
# ✅ CORRECT - Proper redirect syntax
command 2>nul          # Windows (stderr to null)
command >nul 2>&1      # Windows (stdout and stderr to null)
command 2>/dev/null    # Unix (stderr to null)

# ❌ WRONG - Treats nul as filename
command > "nul"        # Creates file
echo data > nul        # Creates file
```

**In Bash tool usage:**
- Never use `nul` as a command or filename parameter
- Always use proper shell redirect syntax (`>nul`, `2>nul`)
- For cross-platform scripts, use conditional logic or `os.devnull`

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
  resources/          ← Bundled application resources
    USER_GUIDE.html   ← User documentation (bundled with app)
    Sample_People_List.xlsx ← Sample data file (bundled with app)
  tools/              ← Build and utility scripts
    convert_user_guide.py ← Generates USER_GUIDE.html from .md
```

**Backend Lifecycle (Electron Integration):**
1. Electron main process spawns backend executable from `resources/backend/`
2. Waits for health check at http://localhost:38000/health
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
pip install uv
uv pip install --system -e '.[dev]'
pre-commit install
```

### Testing (Backend)
```bash
# Always activate venv first: . .venv/bin/activate

# Run all tests
pytest                                  # Run all backend tests (372 tests)

# Run specific test suites (organized by folder)
pytest backend/tests/unit               # Unit tests only (~293 tests, fast)
pytest backend/tests/integration        # Integration tests (~39 tests, medium)
pytest backend/tests/e2e                # E2E tests (~16 tests, slow, requires built exe)
pytest backend/tests/performance        # Performance tests (~24 tests, slow)

# Run by marker (alternative to folder paths)
pytest -m unit                          # Unit tests only
pytest -m integration                   # Integration tests only
pytest -m e2e                           # E2E tests only
pytest -m performance                   # Performance tests only
pytest -m "not slow"                    # Fast tests only (for quick checks)

# Run specific test file
pytest backend/tests/unit/api/test_employees.py
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

### 🚨 Pre-Commit Hooks (REQUIRED FOR ALL COMMITS) 🚨

**CRITICAL: All code changes MUST pass pre-commit hooks before being committed.**

Pre-commit hooks are configured to run the exact same checks as CI pipeline to prevent CI failures.

#### For Claude Code Agents

**MANDATORY WORKFLOW:**
1. **BEFORE running `git add`**, ALWAYS run pre-commit checks first
2. Fix any issues found by pre-commit
3. Only after pre-commit passes, proceed with `git add` and `git commit`

```bash
# REQUIRED before any git operations
.venv/Scripts/activate              # Windows (activate venv first!)
# or
. .venv/bin/activate                # Linux/macOS

# Run pre-commit on files you're about to commit
pre-commit run --files <file1> <file2> ...

# Or run on all files (slower but comprehensive)
pre-commit run --all-files

# If checks pass, proceed with git operations
git add <files>
git commit -m "message"
```

#### What Pre-Commit Checks

The pre-commit hooks run the same checks as CI:
- **Ruff format**: Code formatting (matches `make format-check`)
- **Ruff lint**: Code linting (matches `make lint`)
- **Mypy**: Type checking (matches `make type-check`)
- **Bandit**: Security scanning (matches `make security`)
- **ESLint**: Frontend TypeScript/JavaScript linting (accessibility, design tokens, React best practices)
- **Prettier**: Frontend code formatting
- **YAML/JSON validation**: File syntax checks
- **Basic checks**: Trailing whitespace, end-of-file fixers, merge conflicts

#### Fixing Pre-Commit Failures

```bash
# Backend: Auto-fix formatting and linting issues
make fix

# Frontend: Run ESLint to check for issues
cd frontend
npm run lint

# Note: ESLint only blocks on errors, not warnings

# Re-run pre-commit to verify
pre-commit run --all-files

# If still failing, manually fix remaining issues
# Then proceed with git add/commit
```

#### Installation (One-Time Setup)

Pre-commit hooks should already be installed. If not:
```bash
.venv/Scripts/activate              # Windows
# or
. .venv/bin/activate                # Linux/macOS

pre-commit install
```

#### Why This Matters

- **Prevents CI failures**: Pre-commit runs the exact same checks as CI
- **Faster feedback**: Catch issues locally before pushing
- **Saves time**: No need to wait for CI to fail and fix later
- **Better code quality**: Enforces consistent standards

**REMEMBER: No commit should ever bypass pre-commit checks!**

#### ESLint Configuration

ESLint enforces frontend code quality with comprehensive rules:
- **Accessibility**: jsx-a11y plugin enforces WCAG 2.1 Level AA standards
- **Design tokens**: Warns on hardcoded colors (encourages using theme tokens)
- **TypeScript**: Best practices and type safety
- **React**: Hooks rules and component patterns

**Note**: The pre-commit hook only blocks on ESLint **errors**, not warnings. This allows development to proceed while still catching critical issues. Warnings are informative and should be addressed when practical.

### Frontend Commands
```bash
cd frontend
npm install                    # Install dependencies
npm run dev                    # Vite dev server (for web development)
npm run electron:dev           # Run Electron in dev mode (full app)
npm test                       # Run Vitest component tests
npm run test:e2e:pw            # Run Playwright E2E tests
npm run screenshots:generate   # Generate documentation screenshots
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
npm run electron:build         # Generates USER_GUIDE.html, validates backend, then builds

# The build automatically:
# - Converts USER_GUIDE.md → resources/USER_GUIDE.html
# - Validates backend executable exists
# - Builds and packages the application

# Output in frontend/release/
# - Windows: 9Boxer-1.0.0-Windows-x64.exe
# - macOS: 9Boxer-1.0.0-macOS-x64.dmg
# - Linux: 9Boxer-1.0.0-Linux-x64.AppImage
```

**Manual USER_GUIDE regeneration** (optional):
```bash
# From project root
.venv/Scripts/python.exe tools/convert_user_guide.py  # Windows
# or
.venv/bin/python tools/convert_user_guide.py          # Linux/macOS

# Or from frontend directory
npm run generate:guide
```

### Documentation Screenshot Generation

Documentation screenshots are generated using TypeScript and Playwright, sharing the same helpers as E2E tests for consistency.

**Generate Screenshots:**
```bash
cd frontend

# Generate all automated screenshots (31 automated + 8 manual)
npm run screenshots:generate

# Generate specific screenshots
npm run screenshots:generate grid-normal changes-tab

# Run in headed mode (show browser)
HEADLESS=false npm run screenshots:generate
```

**Architecture:**
- **Implementation**: `frontend/playwright/screenshots/`
  - `generate.ts` - Main CLI entry point
  - `config.ts` - Screenshot registry with metadata
  - `workflows/` - Screenshot generation functions by feature area
  - `MANUAL_SCREENSHOTS.md` - Documentation for 8 manual screenshots
- **Reuses E2E helpers**: Same helper functions from `frontend/playwright/helpers/`
- **Output**: `resources/user-guide/docs/images/screenshots/`

**Adding New Screenshots:**
1. Add entry to `config.ts` with metadata (workflow, function, path, description)
2. Create workflow function in `workflows/<workflow>.ts`
3. Use shared helpers from E2E tests (uploadFile, clickTab, etc.)
4. Test with `npm run screenshots:generate <screenshot-name>`

**Automation:**
- GitHub Actions workflow `.github/workflows/screenshots.yml`
- Runs weekly on Mondays at 2 AM UTC
- Manual trigger via workflow_dispatch
- Auto-commits updated screenshots with [skip ci]

**Manual Screenshots (8 total):**
Some screenshots require manual creation due to:
- Excel file views (requires Excel/LibreOffice)
- Multi-panel compositions (requires image editing)
- Annotations and callouts (requires image editing)

See `frontend/playwright/screenshots/MANUAL_SCREENSHOTS.md` for complete list and instructions.

### Makefile Targets
- `make test` - Run tests
- `make coverage` - Run tests with HTML coverage report
- `make check-all` - Run all quality checks (format, lint, type, security, test)
- `make fix` - Auto-fix formatting and linting issues
- `make clean` - Clean up generated files
- `make dev` - Set up development environment

## Architecture Overview

### Architecture Documentation (Agent-Optimized)

**CRITICAL:** Before implementing features or reviewing code, consult the architecture documentation. These docs are optimized for AI agents with pattern catalogs, decision matrices, and quick rules.

**Core Architecture Docs** (in [internal-docs/architecture/](internal-docs/architecture/)):
- **[ERROR_HANDLING.md](internal-docs/architecture/ERROR_HANDLING.md)** - Error handling patterns, HTTP status codes, logging requirements
- **[SECURITY_MODEL.md](internal-docs/architecture/SECURITY_MODEL.md)** - Security boundaries, threat model, IPC patterns, input validation
- **[PERFORMANCE.md](internal-docs/architecture/PERFORMANCE.md)** - Performance targets, scale constraints, optimization patterns
- **[MIGRATIONS.md](internal-docs/architecture/MIGRATIONS.md)** - Database schema evolution patterns and testing
- **[OBSERVABILITY.md](internal-docs/architecture/OBSERVABILITY.md)** - Logging patterns, debugging tools, log file locations
- **[decisions/](internal-docs/architecture/decisions/)** - Architecture Decision Records (ADRs) documenting key decisions
- **[ARCHITECTURE_QUICK_REFERENCE.md](internal-docs/architecture/ARCHITECTURE_QUICK_REFERENCE.md)** - Quick lookup index for all architecture docs

**When to Use:**
- **Implementing API endpoint?** → Read [ERROR_HANDLING.md](internal-docs/architecture/ERROR_HANDLING.md) for API error patterns
- **Adding security feature?** → Read [SECURITY_MODEL.md](internal-docs/architecture/SECURITY_MODEL.md) for security boundaries
- **Optimizing performance?** → Read [PERFORMANCE.md](internal-docs/architecture/PERFORMANCE.md) for targets and constraints
- **Changing database schema?** → Read [MIGRATIONS.md](internal-docs/architecture/MIGRATIONS.md) for migration patterns
- **Adding logging?** → Read [OBSERVABILITY.md](internal-docs/architecture/OBSERVABILITY.md) for log levels and patterns
- **Understanding past decisions?** → Read [decisions/README.md](internal-docs/architecture/decisions/README.md) for ADR index

**Format:** All architecture docs use agent-optimized format with:
- Quick Rules (ALWAYS/NEVER statements)
- Pattern Catalogs (copy-paste ready code)
- Decision Matrices (if/then tables)
- Anti-patterns explicitly shown (❌)
- Tags for searchability (`#api-endpoint`, `#ipc`, etc.)

### Backend Package Structure
The backend uses the standard Python `src/` layout:
- **`backend/src/ninebox/`** - FastAPI backend application
  - All functions require type annotations
  - Comprehensive docstrings with examples
  - API routes in `routers/`
  - Business logic in `services/`
  - Data models in `models/`
- **`backend/tests/`** - Test files organized by suite type
  - **`unit/`** - Fast isolated tests (~293 tests)
    - `api/` - API endpoint tests (using TestClient)
    - `core/` - Core functionality tests
    - `models/` - Data model tests
    - `services/` - Service layer tests
    - `utils/` - Utility function tests
  - **`integration/`** - Multi-component tests (~39 tests)
  - **`e2e/`** - End-to-end frozen executable tests (~16 tests)
  - **`performance/`** - Benchmark tests (~24 tests)
  - Test naming: `test_function_when_condition_then_expected`
  - No conditional assertions in test bodies

### Frontend Structure
- **`frontend/src/`** - React application (TypeScript)
- **`frontend/electron/`** - Electron wrapper
  - `main/` - Main process
  - `preload/` - Preload scripts
  - `renderer/` - Renderer utilities

### Design System

**CRITICAL:** 9Boxer has a comprehensive design system to ensure visual consistency. Before creating or modifying ANY UI component, read [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md).

**Key Rules:**
- ❌ NEVER hardcode colors, spacing, or dimensions - use `theme.tokens.*` or `theme.palette.*`
- ✅ ALWAYS support light/dark modes, add `data-testid`, use i18n, include ARIA labels

**Key Files:**
- **[DESIGN_SYSTEM.md](DESIGN_SYSTEM.md)** - Complete UI guidelines
- **[frontend/src/theme/tokens.ts](frontend/src/theme/tokens.ts)** - Design constants
- **[internal-docs/design-system/](internal-docs/design-system/)** - Detailed documentation

**UI Zones:**
- Top Toolbar → Global actions | Grid Area → Employee manipulation | Filter Drawer → Search/filtering
- Right Panel → Details/Changes/Stats/Intelligence tabs | Settings Dialog → User preferences

**Quality Assurance:**
- Linting enforces accessibility (WCAG 2.1 AA) and token usage: `npm run lint`
- Visual regression: Storybook + Playwright (`npm run test:visual`)
- Design review checklist: `.github/PULL_REQUEST_TEMPLATE/design-review.md`

### File Organization Conventions
The project has strict conventions for where files belong (see [AGENT_DOCS_CONTRACT.md](AGENT_DOCS_CONTRACT.md)):

| Folder | Purpose | Persistence | Git |
|--------|---------|-------------|-----|
| `agent-tmp/` | Scratch/debug/intermediates | Ephemeral (7 days) | ❌ No |
| `agent-projects/<project>/` | Ephemeral plans for refactors/features | Short-lived (21 days active) | ✅ Yes |
| `internal-docs/` | Permanent documentation | Persistent | ✅ Yes |
| `internal-docs/_generated/` | Auto-generated docs | Auto-updated | ✅ Yes |

**Rules:**
- **DO NOT** create analysis reports or planning documents in the project root
- **DO NOT** manually edit files in `internal-docs/_generated/` (auto-generated)
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
3. **Test suite organization** - Tests organized by suite type in folders:
   - `backend/tests/unit/` - Fast isolated tests (use for most new tests)
   - `backend/tests/integration/` - Multi-component integration tests
   - `backend/tests/e2e/` - Full frozen executable tests
   - `backend/tests/performance/` - Benchmark tests
4. Test naming: `test_function_when_condition_then_expected`
5. No conditional logic in test bodies (no `if` statements)
6. Avoid testing types - test behavior instead
7. Avoid over-mocking (don't mock business logic)
8. Aim for >80% coverage

See `.github/agents/test.md` for comprehensive testing guidance and `internal-docs/testing/` for detailed test suite documentation.

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

**Comprehensive Testing Documentation:**
- **`internal-docs/testing/`** - Complete testing guides and templates
  - `test-principles.md` - Core testing philosophy and best practices
  - `quick-reference.md` - Fast lookup for common patterns and commands
  - `testing-checklist.md` - Pre-commit testing checklist
  - `templates/` - Test templates for backend, component, and E2E tests

See `internal-docs/testing/` for comprehensive testing principles and best practices.

### CI/CD Pipeline

GitHub Actions workflows in `.github/workflows/` automate testing, builds, documentation, and releases.

#### Workflow Overview

**Total Workflows:** 13

| Category | Workflows | Purpose |
|----------|-----------|---------|
| CI/CD | ci.yml, pr.yml, weekly.yml, release.yml | Testing, validation, releases |
| Build | build-electron.yml | Desktop application builds |
| Documentation | docs.yml, docs-audit.yml, docs-auto-update.yml, screenshots.yml | Doc generation and maintenance |
| Testing | visual-regression.yml, update-visual-baselines.yml | Visual regression testing |
| Development | feature-checklist.yml | PR validation |
| Environment | copilot-setup-steps.yml | GitHub Copilot setup |

#### Key CI/CD Workflows

**CI Workflow (`ci.yml`)** - Main continuous integration:
- **Triggers:** Push to `main` or `develop` branches
- **Key steps:** Lint, format, type check, security scan, tests (pytest + Vitest)
- **Features:** Smart change detection, concurrency control, caching, auto-fix step
- **Platform matrix:** Windows + Ubuntu, Python 3.12-3.13
- **Smart test selection:** Skips tests for docs-only changes

**PR Validation (`pr.yml`)** - Fast feedback for pull requests:
- **Triggers:** PR events (opened, synchronize, reopened)
- **Optimized:** Runs on Windows only for speed, reduced matrix
- **Smart selection:** Tests only affected files
- **Concurrency:** Cancels in-progress runs per PR

**Weekly Testing (`weekly.yml`)** - Comprehensive regression testing:
- **Schedule:** Every Sunday at 2 AM UTC
- **Platform matrix:** Ubuntu, Windows, macOS (full coverage)
- **Features:** Security scanning, dependency auditing, SBOM generation
- **Issue creation:** Auto-creates issues for detected regressions

**Release Workflow (`release.yml`)** - Automated releases:
- **Triggers:** Push tags matching `v*.*.*` (e.g., v1.0.0)
- **Steps:** Validation → Build → GitHub Release → (Optional) PyPI publish
- **Artifacts:** Distribution packages (wheel + sdist)

#### Build Workflows

**Electron App Builder (`build-electron.yml`)** - Platform-specific installers:
- **Platforms:** Linux (AppImage), Windows (NSIS .exe), macOS (DMG)
- **Trigger:** Manual only (workflow_dispatch)
- **Build times:** 5-12 minutes depending on platform
- **Artifacts:** Retained 90 days
- **Build order:** PyInstaller backend → Vite frontend → Electron Builder

#### Documentation Workflows

**Documentation Generation (`docs.yml`)** - Auto-generate docs from source:
- **Generates:** API docs (pdoc3), CONTEXT.md, SUMMARY.md, plans index
- **Triggers:** Push to main affecting docs/src/tools
- **Auto-commit:** Commits changes with [skip ci]

**AI Documentation Audit (`docs-audit.yml`)** - Automated documentation quality:
- **Schedule:** Weekly Monday 2 AM UTC
- **Uses:** Anthropic Claude Sonnet 4.5
- **Analyzes:** Internal docs (agent guidance) + User docs (end-user content)
- **Creates:** Consolidated GitHub issues per documentation type
- **Detection:** Conflicts, staleness, missing docs, consolidation opportunities
- **Cost:** ~$2-4/month

**Screenshot Generation (`screenshots.yml`)** - Automated screenshot updates:
- **Schedule:** Weekly Monday 2 AM UTC
- **Trigger:** Manual dispatch with `regenerate_all` option
- **Uses:** Playwright + E2E test helpers
- **Auto-commit:** Updates screenshots with [skip ci]

**Documentation Impact Detection (`docs-auto-update.yml`)** - Component change tracking:
- **Triggers:** PRs affecting components, pages, theme
- **Analyzes:** Which screenshots need updating
- **Reports:** PR comments with impact analysis

#### Testing Workflows

**Visual Regression (`visual-regression.yml`)** - Detect unintended UI changes:
- **Triggers:** PRs affecting frontend/src
- **Features:** Pixel-perfect comparison, diff image generation
- **Artifacts:** Diff images uploaded for review

**Update Visual Baselines (`update-visual-baselines.yml`)** - Intentional UI changes:
- **Trigger:** Manual only (requires reason input)
- **Purpose:** Update baseline screenshots when UI intentionally changes
- **Safety:** Manual approval prevents accidental updates

#### Development Workflows

**Feature Checklist (`feature-checklist.yml`)** - PR validation:
- **Triggers:** PR events, issue comments
- **Validates:** Feature checklist items in PR body
- **Auto-comments:** Validation results on PR

**Copilot Setup (`copilot-setup-steps.yml`)** - GitHub Copilot environment:
- **Automatic:** Invoked by GitHub Copilot coding agent
- **Setup:** Python 3.13 + Node.js 20 + Playwright + pre-commit
- **Fast:** ~5-10 minutes with caching
- **Important:** NO checkout step (Copilot handles it)

#### Configuration & Troubleshooting

**Caching Strategy:**
- `~/.cache/uv` - uv package cache (~10x faster than pip)
- `~/.npm` - npm package cache
- `~/.cache/ms-playwright` - Playwright browsers
- `~/.cache/pre-commit` - Pre-commit hooks

**Required Secrets:**
- `ANTHROPIC_API_KEY` - AI documentation audit
- `PYPI_API_TOKEN` - PyPI publishing (optional)
- `GITHUB_TOKEN` - Auto-provided by GitHub

**Performance Optimizations:**
1. **uv package manager:** ~10x faster Python installs
2. **Smart caching:** Multi-level dependency caching
3. **Change detection:** Skip unnecessary jobs for docs-only changes
4. **Concurrency control:** Cancel in-progress runs
5. **Job dependencies:** Tests wait for lint/type-check

**Common Issues:**
- **Tests fail after docs-only changes:** Check change detection logic
- **Workflow doesn't trigger:** Verify branch, paths, schedule conditions
- **Cache misses:** Check cache key hash values, 7-day expiration
- **Permission errors:** Verify workflow permissions, GITHUB_TOKEN, secrets

**Manual Triggers:**
All workflows support manual dispatch via Actions tab → Select workflow → Run workflow

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
1. **Generates API docs** from Python docstrings using pdoc3 → `internal-docs/_generated/api/`
2. **Collects active plans** from `agent-projects/` (status=active, <21 days old)
3. **Builds CONTEXT.md** - Comprehensive project context for AI agents
4. **Updates SUMMARY.md** - Quick index of all documentation components
5. **Updates CHANGELOG.md** - Appends entry with timestamp and changes
6. **Cleans agent-tmp/** - Removes files older than 7 days

### Key Documentation Files

**For AI Agents to Read:**
- **`internal-docs/CONTEXT.md`** - Main entry point; comprehensive project context (~150KB)
- **`internal-docs/facts.json`** - Stable, hand-maintained project truths (highest authority)
- **`internal-docs/SUMMARY.md`** - Quick index of all documentation
- **`internal-docs/_generated/plans_index.md`** - Summary of active plans
- **`internal-docs/_generated/api/`** - Auto-generated API documentation

**Trust Hierarchy** (when information conflicts):
1. `internal-docs/facts.json` (highest authority)
2. Permanent content in `internal-docs/`
3. Active plans summaries (hints only)

### Working with Documentation

**When writing permanent documentation:**
- Create/update files in `internal-docs/` directory
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

**When updating plan status:**
- **Mark as `done`** when:
  - All planned work is complete
  - Feature is merged and deployed
  - No further work is planned for this project
- **Mark as `paused`** when:
  - Work is blocked or waiting for external dependencies
  - Temporarily deprioritized but will resume later
- **Keep as `active`** only when:
  - Actively working on the project
  - Ready to work and unblocked
- **Note**: Plans older than 21 days are automatically excluded from documentation, regardless of status

**When doing temporary work:**
- Use `agent-tmp/` for all scratch work
- Files auto-deleted after 7 days
- Never commit these files (gitignored)

**Choosing between agent-projects/ and agent-tmp/:**
- **Use `agent-projects/`** for:
  - Long-running features (multi-day/week efforts)
  - Significant refactors that change architecture
  - Work that needs to be tracked and referenced by multiple agents
  - Projects with multiple phases or milestones
  - Examples: New major features, architectural changes, large-scale refactors
- **Use `agent-tmp/`** for:
  - Quick bug fixes and small improvements
  - Exploratory analysis and debugging
  - One-off scripts and temporary utilities
  - Work that doesn't change core architecture
  - Examples: Bug investigations, performance profiling, code cleanup

**When writing or revising user documentation:**
- Follow the comprehensive writing standards in `internal-docs/contributing/`
- Read **[Voice & Tone Guide](internal-docs/contributing/voice-and-tone-guide.md)** for writing style (second person, active voice, contractions)
- Follow **[Documentation Writing Guide](internal-docs/contributing/documentation-writing-guide.md)** for structure patterns and best practices
- Use **[Screenshot Guide](internal-docs/contributing/screenshot-guide.md)** for visual content standards
- Test all workflows in the actual application before documenting
- Validate accessibility (WCAG 2.1 Level AA): alt text, heading hierarchy, descriptive link text
- Target readability: Flesch Reading Ease >60 (conversational)
- Quality bar: Voice & Tone 95%+, Technical Accuracy 95%+

### Configuration
Environment variables for `tools/build_context.py`:
- `CONTEXT_MAX_CHARS` - Max size of CONTEXT.md (default: 150000)
- `PLANS_MAX_AGE_DAYS` - Max age for active plans (default: 21)
- `CLEAN_TMP_AGE_DAYS` - Max age for agent-tmp files (default: 7)

### Automation
- **Trigger**: Push to main affecting `src/`, `internal-docs/`, `agent-plans/`, or `tools/build_context.py`
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

### Core Documentation
- **`AGENTS.md`** - Comprehensive development workflow guidance
- **`AGENT_DOCS_CONTRACT.md`** - Documentation system rules and folder structure
- **`README.md`** - Project overview, features, and quick start
- **`CONTRIBUTING.md`** - Contribution guidelines
- **`internal-docs/CONTEXT.md`** - Main documentation context for AI agents
- **`internal-docs/facts.json`** - Stable project truths (highest authority)
- **`pyproject.toml`** - All tool configurations and dependencies

### Architecture Documentation (Agent-Optimized)
- **`internal-docs/architecture/ARCHITECTURE_QUICK_REFERENCE.md`** - Quick lookup index for all architecture docs
- **`internal-docs/architecture/ERROR_HANDLING.md`** - Error handling patterns and decision matrices
- **`internal-docs/architecture/SECURITY_MODEL.md`** - Security boundaries and threat model
- **`internal-docs/architecture/PERFORMANCE.md`** - Performance targets and optimization patterns
- **`internal-docs/architecture/MIGRATIONS.md`** - Database migration patterns
- **`internal-docs/architecture/OBSERVABILITY.md`** - Logging and debugging guidance
- **`internal-docs/architecture/decisions/`** - Architecture Decision Records (ADRs)

### Testing Documentation
- **`.github/agents/test.md`** - Backend testing strategies (agent profile)
- **`internal-docs/testing/`** - Comprehensive testing documentation
  - `test-principles.md` - Testing philosophy and best practices
  - `quick-reference.md` - Quick lookup for testing patterns
  - `testing-checklist.md` - Pre-commit testing checklist
  - `templates/` - Test templates for all test types

### Design System & User Documentation
- **`internal-docs/contributing/`** - User documentation writing standards
  - `README.md` - Overview of documentation contributing guidelines
  - `voice-and-tone-guide.md` - Writing style quick reference (DO's and DON'Ts)
  - `documentation-writing-guide.md` - Comprehensive documentation standards and patterns
  - `screenshot-guide.md` - Screenshot technical specs and annotation standards
