# CLAUDE.md - Comprehensive Technical Reference

This is the complete technical reference for Claude Code agents working with this repository. For quick-start guidance, see [AGENTS.md](AGENTS.md). For GitHub Copilot-specific setup, see [GITHUB_AGENT.md](GITHUB_AGENT.md).

---

## 📖 READ THIS FIRST

**New to this project?** Start here:

1. **[Virtual Environment](#critical-virtual-environment)** - ⚠️ MUST activate before any Python work (#1 cause of errors)
2. **[Windows Platform Constraints](#critical-windows-environment---bash-tool-usage)** - ⚠️ CRITICAL file operation rules (avoid catastrophic failures)
3. **[Project Overview](#project-overview)** - Understand the architecture (Electron + FastAPI + PyInstaller)
4. **[Common Commands](#common-commands)** - Quick reference for testing, building, quality checks
5. **[File Organization](#file-organization-conventions)** - Where to put temporary files and documentation

**Quick Navigation by Task:**
- 🧪 **Testing** → [Testing (Backend)](#testing-backend) | [Frontend Testing](#frontend-testing) | [Testing Approach](#testing-approach)
- 🔨 **Building** → [Build Commands](#build-commands-standalone-application)
- 🎨 **UI Development** → [Design System](#design-system)
- 📋 **Code Quality** → [Pre-Commit Hooks](#-pre-commit-hooks-required-for-all-commits) | [Code Quality Standards](#code-quality-standards)
- 📚 **Documentation** → [Documentation System](#documentation-system) | [File Organization](#file-organization-conventions)
- 🐛 **Debugging** → [Common Issues](#common-issues) (at end of document)

**Trust Hierarchy (when information conflicts):**
1. **[docs/facts.json](docs/facts.json)** - Highest authority, source of truth
2. Permanent documentation in `docs/`
3. This file (CLAUDE.md)
4. Active plans in `agent-projects/` (hints only)

---

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

**CRITICAL:** 9Boxer has a comprehensive design system to ensure visual consistency and guide feature development.

**Before creating or modifying ANY UI component:**

1. ✅ **Read DESIGN_SYSTEM.md** - Complete guidelines for UI development
2. ✅ **Review design tokens** - `frontend/src/theme/tokens.ts`
3. ✅ **Check UI zones** - Know where controls should live (toolbar vs grid vs panel)
4. ✅ **Check existing components** - Don't recreate what exists

**Key Design System Files:**
- **[DESIGN_SYSTEM.md](DESIGN_SYSTEM.md)** - Complete UI guidelines (MUST READ for UI work)
- **[frontend/src/theme/tokens.ts](frontend/src/theme/tokens.ts)** - All design constants
- **[docs/design-system/design-tokens.md](docs/design-system/design-tokens.md)** - Token reference
- **[docs/design-system/](docs/design-system/)** - Detailed design documentation

**Critical Rules for UI Development:**
- ❌ **NEVER hardcode colors** (use `theme.palette.*` or `theme.tokens.colors.*`)
- ❌ **NEVER hardcode spacing** (use `theme.tokens.spacing.*` or `theme.spacing(n)`)
- ❌ **NEVER hardcode dimensions** (use `theme.tokens.dimensions.*`)
- ✅ **ALWAYS support light and dark modes** (test both)
- ✅ **ALWAYS add data-testid** for testing
- ✅ **ALWAYS use i18n** for user-visible text (`useTranslation()`)
- ✅ **ALWAYS include ARIA labels** for accessibility

**UI Zones - Where Controls Should Live:**
- **Top Toolbar** → Global actions (File, Export, Settings, Help)
- **Grid Area** → Employee manipulation (drag-drop, expand/collapse)
- **Filter Drawer** → Search and filtering
- **Right Panel** → Detailed information (Details, Changes, Stats, Intelligence tabs)
- **Settings Dialog** → User preferences and configuration

**Example - Correct Token Usage:**
```tsx
// ❌ Wrong - hardcoded values
<Box sx={{ padding: '16px', color: '#1976d2' }} />

// ✅ Correct - use design tokens
import { useTheme } from '@mui/material/styles';
const theme = useTheme();

<Box sx={{
  padding: theme.tokens.spacing.md,
  color: theme.palette.primary.main,
}} />
```

**Component Anatomy Standards:**
- **EmployeeTile**: Drag handle, name, ID, quick actions (max 3 icons)
- **GridBox**: Position label, count badge, employee list, expand/collapse button
- **Right Panel Tabs**: Header, scrollable content, actions

**Design Governance & Quality Assurance:**
- **Linting Rules:** `frontend/.eslintrc.cjs` enforces accessibility (WCAG 2.1 AA) and design token usage
  - Run `npm run lint` to check for violations
  - See [docs/design-system/linting-rules.md](docs/design-system/linting-rules.md) for complete rule documentation
- **Visual Regression Testing:** Storybook + Playwright visual tests catch unintended UI changes
  - All components have Storybook stories at `localhost:6006`
  - Visual tests automatically compare screenshots against baselines
  - Run `npm run test:visual` to validate visual consistency
- **Design Review Checklist:** Use `.github/PULL_REQUEST_TEMPLATE/design-review.md` for UI PRs
  - Ensures accessibility, theme support, and design token compliance
  - Mandatory for all PRs with visual changes

See [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) for complete UI zone definitions and component patterns.

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

See `.github/agents/test.md` for comprehensive testing guidance and `docs/testing/` for detailed test suite documentation.

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
- **`docs/testing/`** - Complete testing guides and templates
  - `test-principles.md` - Core testing philosophy and best practices
  - `quick-reference.md` - Fast lookup for common patterns and commands
  - `testing-checklist.md` - Pre-commit testing checklist
  - `templates/` - Test templates for backend, component, and E2E tests

See `docs/testing/` for comprehensive testing principles and best practices.

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
- Follow the comprehensive writing standards in `docs/contributing/`
- Read **[Voice & Tone Guide](docs/contributing/voice-and-tone-guide.md)** for writing style (second person, active voice, contractions)
- Follow **[Documentation Writing Guide](docs/contributing/documentation-writing-guide.md)** for structure patterns and best practices
- Use **[Screenshot Guide](docs/contributing/screenshot-guide.md)** for visual content standards
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
- **`.github/agents/test.md`** - Backend testing strategies (agent profile)
- **`docs/testing/`** - Comprehensive testing documentation
  - `test-principles.md` - Testing philosophy and best practices
  - `quick-reference.md` - Quick lookup for testing patterns
  - `testing-checklist.md` - Pre-commit testing checklist
  - `templates/` - Test templates for all test types
- **`docs/contributing/`** - User documentation writing standards
  - `README.md` - Overview of documentation contributing guidelines
  - `voice-and-tone-guide.md` - Writing style quick reference (DO's and DON'Ts)
  - `documentation-writing-guide.md` - Comprehensive documentation standards and patterns
  - `screenshot-guide.md` - Screenshot technical specs and annotation standards

---

## Common Issues

Quick solutions to frequent problems:

### "Module not found" Error (Python)
**Cause:** Virtual environment not activated  
**Solution:** Run `. .venv/bin/activate` from project root (this is #1 cause of errors!)

### Tests Failing on Import
**Cause:** Package not installed in development mode  
**Solution:**
```bash
. .venv/bin/activate
pip install -e '.[dev]'
```

### Type Checking Errors
**Cause:** Missing type annotations  
**Solution:** Add type hints to ALL function parameters and returns (required standard)

### Backend Executable Won't Run
**Cause:** Missing hidden imports in PyInstaller spec  
**Solution:** Add missing modules to `backend/build_config/ninebox.spec` hiddenimports

### Electron App Won't Start
**Cause:** Backend executable not found  
**Solution:** Build backend FIRST: `cd backend && ./scripts/build_executable.sh`

### Frontend Can't Connect to Backend
**Cause:** Backend not running or wrong port  
**Solution:** Verify backend running on port 38000, check logs at backend/logs/

### Pre-commit Hooks Failing
**Cause:** Code quality issues  
**Solution:**
```bash
make fix                    # Auto-fix format/lint
pre-commit run --all-files  # Re-check
```

### Git Tracking Unexpected Files
**Cause:** Created files in wrong location or used wrong bash commands  
**Solution:** Use `.gitignore`, clean up with `git rm`, use View/Edit/Create tools instead of bash file operations

### Phantom `nul` File (Windows)
**Cause:** Used `> "nul"` with quotes (treats as filename, not device)  
**Solution:** Requires PowerShell admin: `del "\\.\C:\Git_Repos\9boxer\nul"`  
**Prevention:** Never use quotes around `nul` - use `>nul` or `2>/dev/null`

### Malformed Path Files (Windows)
**Symptom:** Files like `cGit_Repos9boxeragent-tmpfile.txt` in git status  
**Cause:** Used absolute Windows path in Bash (`c:\...`)  
**Solution:** Ask user to clean up; use relative paths or View/Edit/Create tools only  
**Prevention:** NEVER use Windows absolute paths in Bash commands

---

**For additional help:** Check [docs/facts.json](docs/facts.json) (source of truth), [docs/CONTEXT.md](docs/CONTEXT.md) (comprehensive context), or [.github/agents/](..github/agents/) (specialized profiles).
