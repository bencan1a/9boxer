# Claude Code Quick Start Index

**9Boxer Standalone Desktop Application**

> **Primary entry point for Claude Code.** For workflows → [AGENTS.md](AGENTS.md) | GitHub Agent → [GITHUB_AGENT.md](GITHUB_AGENT.md) | Full context → [internal-docs/CONTEXT.md](internal-docs/CONTEXT.md)

---

## ⚠️ Top 5 Critical Rules

**Read these first. They prevent 90% of issues.**

### 1. CHECK YOUR ENVIRONMENT FIRST (prevents 90% of issues)

**Before running any Python commands:**

```bash
# Quick environment check
python -c "import sys; print('✓ VENV active' if sys.prefix != sys.base_prefix else '✗ System Python')"
uname -s 2>/dev/null || echo "Windows"
```

**Then choose your path:**
- **VENV active + deps missing?** → `pip install -e '.[dev]'`
- **System Python?** → `. .venv/bin/activate` (Linux/macOS) or `.venv\Scripts\activate` (Windows) first
- **Container/DevContainer?** → `pip install -e '.[dev]'` directly (no venv needed)
- **Windows detected?** → See [internal-docs/PLATFORM_CONSTRAINTS.md](internal-docs/PLATFORM_CONSTRAINTS.md) for file operation rules

**Full environment guide:** [internal-docs/ENVIRONMENT_SETUP.md](internal-docs/ENVIRONMENT_SETUP.md)

### 2. Build backend BEFORE frontend

```bash
# Step 1: Build backend (PyInstaller)
cd backend && ./scripts/build_executable.sh  # Linux/macOS
cd backend && .\scripts\build_executable.bat # Windows

# Step 2: Build frontend (Electron)
cd frontend && npm run electron:build
```

**Why:** Electron packaging includes backend executable → must exist first.

### 3. Use Read/Write/Edit tools for file operations (NOT bash commands)

```bash
# ❌ WRONG - Windows compatibility issues
rm file.txt
touch newfile.txt
cp file1.txt file2.txt

# ✅ CORRECT - Use Claude Code tools
# - Use Write tool to create files
# - Use Edit tool to modify files
# - Use Read tool to read files
# - Use git rm/git mv for tracked files
```

**Why:** Windows + Git Bash has path mangling issues. Tools work everywhere.

**Details:** [internal-docs/PLATFORM_CONSTRAINTS.md#2-file-operations---use-tools-not-bash-commands](internal-docs/PLATFORM_CONSTRAINTS.md#2-file-operations---use-tools-not-bash-commands)

### 4. Use relative paths only in Bash tool (NO absolute Windows paths)

```bash
# ❌ WRONG - Gets mangled on Windows
cat C:\Git_Repos\9boxer\backend\src\file.py

# ✅ CORRECT - Relative paths work everywhere
cat backend/src/file.py
```

**Why:** Git Bash on Windows mangles `C:\` paths → file ends up in wrong location.

**Details:** [internal-docs/PLATFORM_CONSTRAINTS.md#1-bash-tool---absolute-path-handling](internal-docs/PLATFORM_CONSTRAINTS.md#1-bash-tool---absolute-path-handling)

### 5. Trust facts.json as highest authority

**When documentation conflicts:**
1. **[internal-docs/facts.json](internal-docs/facts.json)** ← Highest authority
2. Permanent docs in `internal-docs/` ← Established guidance
3. Active plans in `agent-projects/` ← Hints only

**Why:** Single source of truth for core project facts.

---

## 🎯 Task Navigation - "I want to..."

**Find what you need in 2 clicks max.**

### Implement Features

| I want to... | Read this |
|--------------|-----------|
| **Implement an API endpoint** | [internal-docs/architecture/ERROR_HANDLING.md#pattern-api-endpoint-error-handling-api-endpoint](internal-docs/architecture/ERROR_HANDLING.md#pattern-api-endpoint-error-handling-api-endpoint) |
| **Add an IPC handler** (Electron ↔ React) | [internal-docs/architecture/SECURITY_MODEL.md#pattern-ipc-handler-with-input-validation-ipc](internal-docs/architecture/SECURITY_MODEL.md#pattern-ipc-handler-with-input-validation-ipc) |
| **Change database schema** (add column, etc.) | [internal-docs/architecture/MIGRATIONS.md](internal-docs/architecture/MIGRATIONS.md) |
| **Optimize performance** | [internal-docs/architecture/PERFORMANCE.md](internal-docs/architecture/PERFORMANCE.md) |
| **Create/modify UI component** | [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) |
| **Generate sample data** | [internal-docs/architecture/SAMPLE_DATA_GENERATION.md](internal-docs/architecture/SAMPLE_DATA_GENERATION.md) |
| **Handle file upload/download** | [internal-docs/architecture/FILE_HANDLING.md](internal-docs/architecture/FILE_HANDLING.md) |
| **Add logging/debugging** | [internal-docs/architecture/OBSERVABILITY.md](internal-docs/architecture/OBSERVABILITY.md) |

### Test Code

| I want to... | Read this |
|--------------|-----------|
| **Run backend tests** (pytest) | [internal-docs/testing/quick-reference.md](internal-docs/testing/quick-reference.md) |
| **Write backend tests** | [internal-docs/testing/test-principles.md](internal-docs/testing/test-principles.md) |
| **Run frontend component tests** | [internal-docs/testing/README.md#component-tests](internal-docs/testing/README.md#component-tests) |
| **Write E2E tests** (Playwright) | [internal-docs/testing/README.md#e2e-tests](internal-docs/testing/README.md#e2e-tests) |
| **Understand testing strategy** | [internal-docs/testing/test-principles.md](internal-docs/testing/test-principles.md) |
| **Visual regression testing** | [internal-docs/testing/README.md#visual-regression-testing](internal-docs/testing/README.md#visual-regression-testing) |

### Build & Deploy

| I want to... | Read this |
|--------------|-----------|
| **Build the application** | [BUILD.md](BUILD.md) |
| **Create platform installers** | [DEPLOYMENT.md](DEPLOYMENT.md) |
| **Understand GitHub Actions** | [.github/workflows/README.md](.github/workflows/README.md) |
| **Run in development mode** | [AGENTS.md#-development-workflow](AGENTS.md#-development-workflow) |

### Debug Issues

| I want to... | Read this |
|--------------|-----------|
| **Backend won't start** | [internal-docs/architecture/OBSERVABILITY.md#common-debugging-scenarios](internal-docs/architecture/OBSERVABILITY.md#common-debugging-scenarios) |
| **Performance problem** | [internal-docs/architecture/PERFORMANCE.md#scale-constraints](internal-docs/architecture/PERFORMANCE.md#scale-constraints) |
| **Security error** | [internal-docs/architecture/SECURITY_MODEL.md#threat-model-matrix](internal-docs/architecture/SECURITY_MODEL.md#threat-model-matrix) |
| **Database migration fails** | [internal-docs/architecture/MIGRATIONS.md#migration-failure-recovery](internal-docs/architecture/MIGRATIONS.md#migration-failure-recovery) |
| **Platform-specific issue** | [internal-docs/PLATFORM_CONSTRAINTS.md](internal-docs/PLATFORM_CONSTRAINTS.md) |
| **Environment/dependency issue** | [internal-docs/ENVIRONMENT_SETUP.md](internal-docs/ENVIRONMENT_SETUP.md) |

### Understand Architecture

| I want to... | Read this |
|--------------|-----------|
| **Quick architecture lookup** | [internal-docs/architecture/ARCHITECTURE_QUICK_REFERENCE.md](internal-docs/architecture/ARCHITECTURE_QUICK_REFERENCE.md) |
| **System architecture overview** | [internal-docs/architecture/SYSTEM_ARCHITECTURE.md](internal-docs/architecture/SYSTEM_ARCHITECTURE.md) |
| **Understand past decisions** (ADRs) | [internal-docs/architecture/decisions/](internal-docs/architecture/decisions/) |
| **Get complete project context** | [internal-docs/CONTEXT.md](internal-docs/CONTEXT.md) |

---

## 🚀 Quick Commands

**Most common operations - copy/paste ready.**

### Development

```bash
# FIRST: Check/activate virtual environment
python -c "import sys; print('VENV' if sys.prefix != sys.base_prefix else 'SYSTEM')"
. .venv/bin/activate              # Linux/macOS
.venv\Scripts\activate            # Windows

# Run backend tests
pytest                            # All tests
pytest backend/tests/unit         # Fast tests only (~30s)
pytest -v -k "test_employees"     # Specific test

# Run frontend tests
cd frontend
npm test                          # Component tests (watch mode)
npm run test:run                  # Component tests (run once)
npm run test:e2e:pw              # E2E tests (Playwright)

# Code quality
make check-all                    # All backend checks (format, lint, type, security)
make fix                          # Auto-fix format + lint issues
cd frontend && npm run lint       # Frontend linting

# Run application
cd frontend && npm run electron:dev  # Full Electron app (recommended)
```

### Building

```bash
# Step 1: Build backend (REQUIRED FIRST)
cd backend
. .venv/bin/activate              # Activate venv
./scripts/build_executable.sh    # Linux/macOS
.\scripts\build_executable.bat   # Windows
# Output: backend/dist/ninebox/

# Step 2: Build frontend + Electron
cd ../frontend
npm run electron:build
# Output: frontend/release/ (platform installers)
```

**Full command reference:** [AGENTS.md#-common-tasks](AGENTS.md#-common-tasks)

---

## 🏗️ Project Structure

**Monorepo: Python backend + Node.js frontend**

```
9boxer/
  .venv/              ← Python venv (ACTIVATE FIRST!)
  backend/            ← FastAPI → PyInstaller executable
    src/ninebox/      ← Backend source
    tests/            ← unit/integration/e2e/performance
    dist/ninebox/     ← Built executable
  frontend/           ← React + Electron → Platform installers
    src/              ← React components
    electron/         ← Electron wrapper (main/preload)
    release/          ← Built installers
  internal-docs/      ← Permanent docs (canonical)
    facts.json        ← Source of truth (highest authority)
    ENVIRONMENT_SETUP.md, PLATFORM_CONSTRAINTS.md
    architecture/, testing/, design-system/
```

**Build:** Backend (PyInstaller) → Frontend (Electron Builder)
**Deploy:** Standalone installers (.exe, .dmg, .AppImage)
**Runtime:** Backend subprocess + HTTP localhost:38000

---

## 📚 Documentation Structure

### Trust Hierarchy (when information conflicts)

1. **[internal-docs/facts.json](internal-docs/facts.json)** ← Highest authority
2. Permanent docs in `internal-docs/` ← Established guidance
3. Active plans in `agent-projects/` ← Hints only

### Key Documentation Files

| File | Purpose | When to Use |
|------|---------|-------------|
| **This file (CLAUDE_INDEX.md)** | Quick start + navigation | Starting point, finding what you need |
| **[AGENTS.md](AGENTS.md)** | Workflows & commands | Daily development tasks |
| **[GITHUB_AGENT.md](GITHUB_AGENT.md)** | GitHub Agent onboarding | First-time setup with GitHub Copilot |
| **[internal-docs/ENVIRONMENT_SETUP.md](internal-docs/ENVIRONMENT_SETUP.md)** | Environment detection | Dependency/venv issues |
| **[internal-docs/PLATFORM_CONSTRAINTS.md](internal-docs/PLATFORM_CONSTRAINTS.md)** | Platform-specific rules | File operations, Windows issues |
| **[internal-docs/facts.json](internal-docs/facts.json)** | Structured source of truth | Verify core facts |
| **[internal-docs/CONTEXT.md](internal-docs/CONTEXT.md)** | Comprehensive context | Need full picture |

### Architecture Documentation (Agent-Optimized)

All architecture docs in `internal-docs/architecture/` use agent-friendly format:
- **Quick Rules** (ALWAYS/NEVER statements)
- **Pattern Catalogs** (copy-paste ready code)
- **Decision Matrices** (if/then tables)
- **Anti-patterns** (❌ explicitly shown)

**Quick lookup:** [internal-docs/architecture/ARCHITECTURE_QUICK_REFERENCE.md](internal-docs/architecture/ARCHITECTURE_QUICK_REFERENCE.md)

---

## 🔍 Common Issues

| Symptom | Likely Cause | Quick Fix |
|---------|--------------|-----------|
| **"Module not found" (Python)** | Venv not activated | `. .venv/bin/activate` (check with `python -c "import sys; print(sys.prefix)"`) |
| **Electron won't start** | Backend not built | `cd backend && ./scripts/build_executable.sh` |
| **Phantom `nul` files** | Used `> "nul"` in Bash | See [PLATFORM_CONSTRAINTS.md#3-reserved-device-names-critical](internal-docs/PLATFORM_CONSTRAINTS.md#3-reserved-device-names-critical) |
| **Paths mangled in Bash** | Used `C:\...` absolute path | Use relative paths only or Read/Write/Edit tools |
| **Type check errors** | Missing type annotations | Add types to all function params/returns |
| **Pre-commit fails** | Code quality issues | `make fix` then `pre-commit run --all-files` |
| **Frontend can't connect** | Backend not running | Check http://localhost:38000/health |
| **Test import errors** | Dev mode not installed | `. .venv/bin/activate` then `pip install -e '.[dev]'` |
| **Agent tries to install deps but fails** | Wrong environment | Check environment first (see Critical Rule #1) |

**Full troubleshooting:** [AGENTS.md#-common-issues-and-solutions](AGENTS.md#-common-issues-and-solutions)

---

## 📖 Where to Learn More

**Quick orientation:**
- **60-second overview** → [GITHUB_AGENT.md](GITHUB_AGENT.md)
- **Development workflow** → [AGENTS.md](AGENTS.md)
- **This file** (comprehensive entry point)

**Deep dives:**
- **Architecture patterns** → [internal-docs/architecture/](internal-docs/architecture/)
- **Testing strategies** → [internal-docs/testing/](internal-docs/testing/)
- **Design system** → [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) + [internal-docs/design-system/](internal-docs/design-system/)
- **Build process** → [BUILD.md](BUILD.md)
- **Deployment** → [DEPLOYMENT.md](DEPLOYMENT.md)

**Reference:**
- **Source of truth** → [internal-docs/facts.json](internal-docs/facts.json)
- **Comprehensive context** → [internal-docs/CONTEXT.md](internal-docs/CONTEXT.md)
- **ADRs** (past decisions) → [internal-docs/architecture/decisions/](internal-docs/architecture/decisions/)
- **Environment setup** → [internal-docs/ENVIRONMENT_SETUP.md](internal-docs/ENVIRONMENT_SETUP.md)
- **Platform constraints** → [internal-docs/PLATFORM_CONSTRAINTS.md](internal-docs/PLATFORM_CONSTRAINTS.md)

---

**Philosophy:** This file provides navigation. For detailed content, follow the links to canonical documentation in `internal-docs/`. Don't load everything upfront—just what you need, when you need it.

**Total size of this file:** ~14 KB (optimized for fast loading)
