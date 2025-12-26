# 9Boxer Quick Reference Guide

**For AI Agents and Developers - Fast Command Lookup**

> 📖 **Full guides**: [GITHUB_AGENT.md](../GITHUB_AGENT.md) | [CLAUDE.md](../CLAUDE.md) | [AGENTS.md](../AGENTS.md)

---

## ⚡ Most Used Commands

```bash
# FIRST: Activate Python venv (ALWAYS!)
. .venv/bin/activate              # Linux/macOS
.venv\Scripts\activate            # Windows

# Run tests
pytest                            # All backend tests (372)
pytest backend/tests/unit         # Fast unit tests (~293)
cd frontend && npm test           # Frontend component tests
cd frontend && npm run test:e2e:pw # E2E tests (Playwright)

# Code quality
make check-all                    # All backend checks
make fix                          # Auto-fix format + lint
cd frontend && npm run lint       # Frontend lint

# Run application
cd frontend && npm run electron:dev  # Full Electron app
cd backend/dist/ninebox && ./ninebox # Backend only
cd frontend && npm run dev           # Frontend only (web)

# Build
cd backend && ./scripts/build_executable.sh  # Backend
cd frontend && npm run electron:build        # Full app
```

---

## 🔥 Critical Rules

1. **ALWAYS activate venv first** - `. .venv/bin/activate`
2. **Build backend BEFORE frontend** - PyInstaller → Electron Builder
3. **Never use rm/touch/cp/mv** - Use git commands or View/Edit/Create tools
4. **Test in Electron app** - Not just web mode
5. **Trust facts.json** - Highest authority when docs conflict

---

## 📂 File Structure (Quick)

```
9boxer/
  .venv/           ← Python venv (ACTIVATE FIRST!)
  pyproject.toml   ← Python deps + config
  backend/         ← FastAPI backend
    src/ninebox/   ← Backend source
    tests/         ← Backend tests (372)
    dist/ninebox/  ← Built executable
  frontend/        ← React + Electron
    src/           ← React components
    electron/      ← Electron wrapper
    playwright/    ← E2E tests
    release/       ← Built installers
  docs/
    facts.json     ← SOURCE OF TRUTH
    CONTEXT.md     ← Full project context
  agent-tmp/       ← Temporary (gitignored)
  agent-projects/  ← Active plans
```

---

## 🧪 Testing Commands

```bash
# Backend (activate venv first!)
pytest                                 # All tests
pytest backend/tests/unit              # Unit tests only
pytest -m "not slow"                   # Skip slow tests
pytest -k "test_login"                 # Pattern match
pytest --cov=backend/src               # With coverage
pytest -v                              # Verbose

# Frontend component tests
cd frontend
npm test                               # Watch mode
npm run test:run                       # Run once
npm run test:coverage                  # With coverage
npm run test:ui                        # Interactive UI

# Frontend E2E tests (Playwright)
npm run test:e2e:pw                    # Run all
npm run test:e2e:pw:ui                 # With UI
npx playwright test upload-flow.spec.ts # Specific test
```

---

## 🔧 Quality Commands

```bash
# Backend (activate venv first!)
make check-all                    # All checks at once
make fix                          # Auto-fix format + lint

# Individual checks
ruff format .                     # Format
ruff check .                      # Lint
mypy backend/src/                 # Type check (mypy)
pyright                           # Type check (pyright)
bandit -r backend/src/            # Security scan

# Frontend
cd frontend
npm run lint                      # ESLint
npm run type-check                # TypeScript
npm run format                    # Prettier
```

---

## 🏗️ Build Commands

```bash
# Backend (PyInstaller)
cd backend
. .venv/bin/activate
./scripts/build_executable.sh     # Linux/macOS
.\scripts\build_executable.bat    # Windows
# Output: backend/dist/ninebox/ninebox.exe

# Frontend (Electron Builder)
cd frontend
npm run electron:build
# Output: frontend/release/*.exe/*.dmg/*.AppImage

# IMPORTANT: Build backend FIRST, then frontend!
```

---

## 🚀 Run Application

```bash
# Option 1: Full Electron app (recommended)
cd frontend
npm run electron:dev
# Requires backend to be built first

# Option 2: Separate backend/frontend (faster iteration)
# Terminal 1: Backend
cd backend/dist/ninebox
./ninebox  # or ninebox.exe

# Terminal 2: Frontend
cd frontend
npm run dev  # Opens http://localhost:5173
```

---

## 📝 Type Annotations (Required)

```python
# ✅ CORRECT - All parameters and return typed
def process_employees(
    employee_ids: list[str],
    max_count: Optional[int] = None
) -> dict[str, int]:
    """Process employees and return count mapping."""
    pass

# ❌ WRONG - Missing type annotations
def process_employees(employee_ids, max_count=None):
    pass
```

---

## 🐛 Common Issues

| Issue | Solution |
|-------|----------|
| "Module not found" (Python) | Activate venv: `. .venv/bin/activate` |
| Tests fail on import | Install dev mode: `pip install -e '.[dev]'` |
| Electron won't start | Build backend first: `cd backend && ./scripts/build_executable.sh` |
| Type checking errors | Add type hints to all parameters and returns |
| Pre-commit fails | Run `make fix` then `pre-commit run --all-files` |
| Frontend can't connect | Check backend running on port 38000 |

---

## 📚 Documentation Lookup

| Need | File |
|------|------|
| Quick start | `GITHUB_AGENT.md` |
| Source of truth | `docs/facts.json` |
| Technical details | `CLAUDE.md` |
| Workflow guide | `AGENTS.md` |
| Full context | `docs/CONTEXT.md` |
| Build instructions | `BUILD.md` |
| Testing guide | `.github/agents/test.md` |

---

## 🎯 Before Committing

```bash
# 1. Activate venv (if Python work)
. .venv/bin/activate

# 2. Run quality checks
make check-all                    # Backend
cd frontend && npm run lint       # Frontend

# 3. Run tests
pytest                            # Backend
cd frontend && npm test           # Frontend

# 4. Test in Electron
cd frontend && npm run electron:dev

# 5. Commit
git add .
git commit -m "feat: description"
```

---

## 🔍 Quick Search

```bash
# Find files
git ls-files "*.py"
find . -name "*.ts" -not -path "*/node_modules/*"

# Search code
git grep "def process_"
git grep -n "useState" -- "*.tsx"

# Recent changes
git log --oneline -10
git diff HEAD~1
```

---

## 💡 Pro Tips

- **Save time**: Use `make check-all` for all quality checks
- **Fast feedback**: Run `pytest backend/tests/unit` (fast) before full suite
- **Avoid errors**: Always activate venv first (90% of issues)
- **Platform safe**: Use View/Edit/Create tools, not Bash file commands
- **Trust source**: When docs conflict, trust `docs/facts.json`

---

**Need more detail? See [GITHUB_AGENT.md](../GITHUB_AGENT.md)**
