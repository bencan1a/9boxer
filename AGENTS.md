# AGENTS.md - Quick Start Checklist

**Essential onboarding checklist for AI agents working on 9Boxer.**

> **Detailed guides**: [CLAUDE.md](CLAUDE.md) (comprehensive) | [GITHUB_AGENT.md](GITHUB_AGENT.md) (Copilot-specific)
> **Source of truth**: [docs/facts.json](docs/facts.json) (HIGHEST AUTHORITY)

---

## 🚀 60-Second Setup

**9Boxer = Standalone Electron Desktop App** (NOT a web app)
- React frontend + FastAPI backend (bundled with PyInstaller)
- Monorepo: Python (`.venv/`) + Node.js (`frontend/node_modules/`)
- Backend runs as subprocess, HTTP on localhost:38000

### ⚠️ #1 Critical Rule: Activate Virtual Environment

```bash
# ALWAYS DO THIS FIRST (from project root)
. .venv/bin/activate      # Linux/macOS
.venv\Scripts\activate    # Windows
```

**If you see "module not found"** → venv not activated!

---

## ⚡ Essential Commands

```bash
# Testing
. .venv/bin/activate              # FIRST!
pytest                            # All backend tests (372)
pytest backend/tests/unit         # Fast unit tests (~293)
cd frontend && npm test           # Frontend tests
cd frontend && npm run test:e2e:pw # E2E (Playwright)

# Code Quality
make check-all                    # All backend checks
make fix                          # Auto-fix format + lint
cd frontend && npm run lint       # Frontend lint

# Run App
cd frontend && npm run electron:dev  # Full Electron app
cd backend/dist/ninebox && ./ninebox # Backend only
cd frontend && npm run dev           # Frontend only (web)

# Build
cd backend && ./scripts/build_executable.sh  # Backend FIRST
cd frontend && npm run electron:build        # Then Electron app
```

---

## 📂 File Organization Rules

| Folder | Purpose | Git |
|--------|---------|-----|
| `agent-tmp/` | Temporary/debug work | ❌ No (gitignored) |
| `agent-projects/<name>/` | Active plans | ✅ Yes |
| `docs/` | Permanent docs | ✅ Yes |

**Rules:**
- ❌ NO analysis reports in project root
- ✅ USE `agent-tmp/` for temporary work
- ✅ USE `agent-projects/<name>/` for structured plans

---

## 🔨 Build Order (CRITICAL)

**Must build backend BEFORE frontend:**

```
1. Backend (PyInstaller)    → backend/dist/ninebox/ninebox.exe
2. Frontend (Electron)      → frontend/release/*.exe/*.dmg/*.AppImage
```

---

## 🧪 Testing Workflow

### Pre-Testing Checklist
1. ✅ Activate venv (`. .venv/bin/activate`)
2. ✅ Run existing tests to establish baseline
3. ✅ Understand what you're testing

### Test Organization
```bash
# Backend (from project root, venv activated)
pytest                              # All 372 tests
pytest backend/tests/unit           # ~293 unit tests (fast)
pytest backend/tests/integration    # ~39 integration tests
pytest backend/tests/e2e            # ~16 E2E tests (slow)
pytest -m "not slow"                # Skip slow tests
pytest -k "test_login"              # Pattern match
pytest --cov=backend/src            # With coverage

# Frontend
cd frontend
npm test                            # Vitest (watch mode)
npm run test:run                    # Run once
npm run test:e2e:pw                 # Playwright E2E
```

### Testing Standards
- Run existing tests FIRST to establish baseline
- Write tests for new functionality
- All tests must pass before committing
- Maintain >80% code coverage

---

## 📋 Code Quality Requirements

### Backend (Python)
```bash
. .venv/bin/activate       # FIRST!
make check-all             # All checks at once
make fix                   # Auto-fix format + lint

# Individual checks:
ruff format .              # Format
ruff check .               # Lint
mypy backend/src/          # Type check (mypy)
pyright                    # Type check (pyright)
bandit -r backend/src/     # Security scan
```

### Frontend (TypeScript)
```bash
cd frontend
npm run lint               # ESLint
npm run format             # Prettier
npm run type-check         # TypeScript
```

### Type Annotations (REQUIRED)
All Python functions MUST have type annotations:
```python
def process_employees(
    employee_ids: list[str],
    max_count: Optional[int] = None
) -> dict[str, int]:
    """Process employees and return count mapping."""
    pass
```

---

## 🚀 Common Workflows

### Starting a New Feature
1. Activate venv: `. .venv/bin/activate`
2. Run tests to establish baseline: `pytest`
3. Implement with TDD approach
4. Run quality checks: `make check-all`
5. Test in Electron: `cd frontend && npm run electron:dev`

### Before Committing
```bash
. .venv/bin/activate
make check-all                      # Backend quality
cd frontend && npm run lint         # Frontend lint
cd frontend && npm run type-check   # TypeScript
cd frontend && npm test             # Frontend tests
```

### Pull Request Checklist
- [ ] Venv activated during development
- [ ] All tests pass (backend + frontend)
- [ ] Code coverage maintained (>80%)
- [ ] All quality checks pass
- [ ] Tested in Electron (not just web mode)
- [ ] Documentation updated if needed

---

## 🔍 Common Issues → Solutions

| Issue | Solution |
|-------|----------|
| "Module not found" (Python) | Activate venv: `. .venv/bin/activate` |
| Tests failing on import | `pip install -e '.[dev]'` |
| Type checking errors | Add type hints to all parameters/returns |
| Electron app won't start | Build backend first: `cd backend && ./scripts/build_executable.sh` |
| Frontend can't connect | Check backend running on port 38000 |

---

## 📚 Documentation Hierarchy

**Trust hierarchy when information conflicts:**
1. **docs/facts.json** (HIGHEST AUTHORITY)
2. **CLAUDE.md** - Comprehensive reference with Windows-specific guidance
3. **GITHUB_AGENT.md** - GitHub Copilot onboarding
4. **This file (AGENTS.md)** - Quick-start checklist
5. **docs/CONTEXT.md** - Comprehensive project context

**Additional resources:**
- [BUILD.md](BUILD.md) - Complete build instructions
- [DEPLOYMENT.md](DEPLOYMENT.md) - Distribution guide
- [CONTRIBUTING.md](CONTRIBUTING.md) - Contribution standards
- [.github/agents/](/.github/agents/) - Specialized agent profiles (test, architecture, debug, docs)

---

## 🎯 Key Principles

1. **Always activate venv first** - prevents 90% of errors
2. **This is a desktop app** - not a web app
3. **Build backend BEFORE frontend** - critical order
4. **Test in Electron** - not just web mode
5. **Trust docs/facts.json** - highest authority
6. **Use TDD** - write tests first when practical
7. **Type everything** - leverage Python types + TypeScript
