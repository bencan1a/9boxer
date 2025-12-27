# Project Consolidation Plan

## Current Problems

1. **Two separate Python projects** with different venvs and configs
2. **Backend missing quality tools** from root template (bandit, better ruff, coverage config, etc.)
3. **Confusing structure** - unclear what's what
4. **Build scripts reference wrong venv path** for Windows users

## Proposed Structure

```
9boxer/                    # Root container (not a Python package)
  .venv/                   # Single shared venv for backend dev
  pyproject.toml          # Backend deps + all quality tooling
  backend/
    src/ninebox/          # Backend source code
    tests/                # Backend tests
    data/                 # Backend data
    build_config/         # PyInstaller config
    scripts/              # Build scripts
  frontend/
    src/                  # React source
    electron/             # Electron main/preload
    scripts/              # Build scripts
  .github/                # CI/CD workflows
  internal-docs/                   # Documentation
  docker/                 # Docker configs
```

## Migration Steps

### 1. Merge pyproject.toml
- Combine backend dependencies with root template quality tools
- Keep all the strict ruff, mypy, bandit, coverage configs
- Update paths to point to `backend/src` instead of `src`

### 2. Update Build Scripts
- Change `backend/venv` → `.venv` (root level)
- Update activation: `. ../../.venv/bin/activate` (from backend/scripts)
- Or better: use absolute paths

### 3. Update ninebox.spec
- Already uses dynamic paths ✅
- Just ensure venv packages are found from root `.venv`

### 4. Clean Up
- Remove `src/python_template/` (unused template code)
- Remove `backend/venv/` (use root `.venv` instead)
- Remove `backend/pyproject.toml` (merged into root)

### 5. Update CLAUDE.md and Docs
- Document the monorepo structure
- Clarify single venv at root for backend
- Frontend has node_modules (separate)

## Benefits

✅ Single source of truth for quality tooling
✅ Clearer structure (root is just container)
✅ Windows users have one venv path to understand
✅ All template benefits (bandit, strict typing, coverage) available to backend
✅ Simpler CI/CD (one set of quality checks)

## Implementation Notes

- Keep backend/ as subdirectory (not separate package)
- Root pyproject.toml has backend as editable install from `backend/`
- Build scripts can activate root `.venv` from anywhere
- PyInstaller builds from root `.venv` which has all backend deps
