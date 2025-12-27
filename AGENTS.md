# QUICK-START CHECKLIST FOR AGENTS

> **⚠️ This is a minimal quick-start checklist. For detailed guidance, see [CLAUDE.md](CLAUDE.md).**

**9Boxer** is a standalone Electron desktop app (NOT a web app) with React frontend + FastAPI backend bundled with PyInstaller.

## 🚀 ESSENTIAL FIRST STEPS

### 1. Activate Virtual Environment (ALWAYS FIRST!)
```bash
. .venv/bin/activate      # Linux/macOS
.venv\Scripts\activate    # Windows
```
> ⚠️ **#1 cause of errors**: Forgetting to activate venv. Do this FIRST every session!

### 2. Run Baseline Tests
```bash
pytest                                 # Backend (372 tests)
cd frontend && npm test               # Frontend
```

### 3. Run Quality Checks
```bash
make check-all                        # Backend (from project root)
cd frontend && npm run lint           # Frontend
```

## ✅ DEVELOPMENT WORKFLOW CHECKLIST

### Before Starting Work
- [ ] Activate venv: `. .venv/bin/activate`
- [ ] Run baseline tests: `pytest`
- [ ] Check baseline quality: `make check-all`

### During Development
- [ ] Write tests first (TDD)
- [ ] Run tests frequently: `pytest backend/tests/unit` (fast)
- [ ] Check formatting: `make fix` (auto-fix)

### Before Committing
- [ ] All quality checks pass: `make check-all`
- [ ] All tests pass: `pytest`
- [ ] Frontend checks (if changed): `cd frontend && npm run lint && npm test`
- [ ] Test in Electron app: `cd frontend && npm run electron:dev`

## 🔨 COMMON COMMANDS

```bash
# Setup (one-time)
python3 -m venv .venv && . .venv/bin/activate
pip install -e '.[dev]' && pre-commit install
cd frontend && npm install

# Testing
pytest                                 # All backend tests
pytest backend/tests/unit              # Fast tests only
cd frontend && npm test                # Frontend tests

# Quality
make check-all                        # All checks
make fix                              # Auto-fix format/lint

# Build
cd backend && ./scripts/build_executable.sh  # Backend first
cd frontend && npm run electron:build        # Then frontend

# Run
cd frontend && npm run electron:dev   # Full Electron app
```

## 📁 FILE ORGANIZATION

- **Temporary work** → `agent-tmp/` (gitignored, auto-cleaned)
- **Project plans** → `agent-projects/<name>/` (ephemeral, <21 days)
- **Permanent docs** → `docs/` (persistent)

## 🔍 COMMON ISSUES - QUICK FIXES

| Issue | Fix |
|-------|-----|
| "Module not found" | Activate venv: `. .venv/bin/activate` |
| Tests failing on import | `pip install -e '.[dev]'` |
| Electron won't start | Build backend first: `cd backend && ./scripts/build_executable.sh` |
| Pre-commit failing | `make fix && pre-commit run --all-files` |

## 📚 WHERE TO FIND DETAILS

- **[CLAUDE.md](CLAUDE.md)** - Comprehensive technical reference
- **[GITHUB_AGENT.md](GITHUB_AGENT.md)** - GitHub Copilot-specific guide
- **[docs/facts.json](docs/facts.json)** - Source of truth (highest authority)
- **[docs/CONTEXT.md](docs/CONTEXT.md)** - Complete project context
- **[.github/agents/](..github/agents/)** - Specialized agent profiles

## ⚠️ CRITICAL RULES

1. **Always activate venv first** (90% of errors)
2. **Build backend BEFORE frontend** (required order)
3. **Test in Electron app** (not just web mode)
4. **Use `make fix`** before committing
5. **Trust docs/facts.json** (highest authority)

---

**Ready to code?** Activate venv, run tests, start working! For details, see [CLAUDE.md](CLAUDE.md).
