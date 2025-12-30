# Devcontainer vs CI Environment Comparison

This document explains how the devcontainer environment mirrors the CI/CD environment and why certain design decisions were made.

## Environment Parity

The devcontainer is designed to **exactly match** the CI environment to ensure:
- What works locally will work in CI
- No "works on my machine" issues
- Consistent dependency resolution
- Identical Python package installation

## Key Design Principles

### 1. No Virtual Environment (venv)

**Decision**: Install Python packages system-wide with `uv pip install --system`

**Rationale**:
- ✅ **Already isolated**: Container provides complete environment isolation
- ✅ **Matches CI**: CI workflows use `--system` flag (see `.github/workflows/ci.yml`)
- ✅ **Simpler**: Fewer steps, faster container startup
- ✅ **Less overhead**: No venv directory consuming disk space
- ✅ **Clearer**: No confusion about which Python/pip to use

**CI Comparison**:
```yaml
# .github/workflows/ci.yml (line 118, 183, 303, 394)
- name: Install dependencies
  run: uv pip install --system -e '.[dev]'
```

**Devcontainer**:
```json
// .devcontainer/devcontainer.json (line 89)
"postCreateCommand": "... uv pip install --system -e '.[dev]' ..."
```

### 2. Python Interpreter Path

**Decision**: Use system Python at `/usr/local/bin/python`

**Before** (with venv): `${workspaceFolder}/.venv/bin/python`
**After** (system): `/usr/local/bin/python`

**Why**: Matches CI where Python is installed directly, not in a venv.

### 3. Terminal Environment

**Decision**: Disable automatic venv activation

**Setting**: `"python.terminal.activateEnvironment": false`

**Why**: There's no venv to activate. All packages are system-wide.

## Environment Comparison Matrix

| Component | CI (ci.yml) | Devcontainer | Match? |
|-----------|-------------|--------------|--------|
| **Python Install** | `uv pip install --system` | `uv pip install --system` | ✅ |
| **Python Path** | System Python | `/usr/local/bin/python` | ✅ |
| **Venv** | None | None | ✅ |
| **Node.js Version** | 20 | 20 | ✅ |
| **Python Version** | 3.13 | 3.13 | ✅ |
| **npm install** | `npm ci --legacy-peer-deps` | `npm install --legacy-peer-deps` | ⚠️ See note |
| **Playwright** | `--with-deps chromium` | `--with-deps` | ⚠️ See note |
| **Display** | Headless (implicit) | Xvfb :99 | ✅ |

### Notes on Differences

#### npm ci vs npm install

- **CI**: Uses `npm ci` (clean install from lock file)
- **Devcontainer**: Uses `npm install` (more forgiving for development)

**Why different**:
- `npm ci` requires exact lock file match, fails if out of sync
- `npm install` is more flexible for development workflow
- Both use `--legacy-peer-deps` for compatibility

**Recommendation**: Use `npm ci --legacy-peer-deps` in devcontainer to match CI exactly

#### Playwright Browser Installation

- **CI**: Installs only Chromium (`npx playwright install --with-deps chromium`)
- **Devcontainer**: Installs all browsers (`npx playwright install --with-deps`)

**Why different**:
- CI optimizes for speed (Chromium only)
- Devcontainer provides flexibility (all browsers for testing)

**Impact**: Minimal - tests only use Chromium anyway (see `playwright.config.ts`)

## Additional Devcontainer Features

These features are **devcontainer-specific** and don't have CI equivalents:

### X11 / Display Server

**Purpose**: Enable headless GUI testing and remote Electron interaction

**Components**:
- Xvfb (virtual framebuffer)
- x11vnc (VNC server)
- noVNC (web-based VNC client)

**Why needed**:
- Playwright tests require a display (even headless)
- Electron apps require X11 to render
- VNC enables remote GUI interaction from Windows

**CI Equivalent**:
- Windows runners have implicit display support
- GitHub Actions provides headless Chromium automatically

### Port Forwarding

**Ports**:
- 5900: VNC server
- 6080: noVNC web interface

**Why needed**: Enable remote GUI access from developer's Windows laptop

**CI Equivalent**: N/A (CI doesn't need remote GUI access)

### Shared Memory

**Setting**: `--shm-size=2gb`

**Why needed**: Chromium/Electron require larger shared memory than default 64MB

**CI Equivalent**: GitHub Actions runners provide adequate shared memory by default

## Testing Parity

### Unit Tests

```bash
# CI
pytest backend/tests/unit/ -v

# Devcontainer
pytest backend/tests/unit/ -v
```
✅ **Identical**

### Frontend Tests

```bash
# CI
npm run test:run

# Devcontainer
npm run test:run
```
✅ **Identical**

### E2E Tests (Playwright)

```bash
# CI
npx playwright test --project=e2e

# Devcontainer
npm run test:e2e:pw
```
✅ **Functionally identical** (devcontainer script wraps Playwright)

## Dependency Installation Flow

### CI Workflow
```
1. Set up Python 3.13 (via actions/setup-python)
2. Install uv: pip install uv
3. Install deps: uv pip install --system -e '.[dev]'
4. Pre-commit hooks installed separately
```

### Devcontainer Workflow
```
1. Build container with Python 3.13 (via Dockerfile)
2. Start Xvfb display
3. Install uv: pip install uv
4. Install deps: uv pip install --system -e '.[dev]'
5. Install pre-commit hooks
6. Install frontend deps
7. Install Playwright browsers
```

**Key difference**: Devcontainer does more upfront (Xvfb, frontend, Playwright) for developer convenience.

## Cache Strategy

### CI Caching
```yaml
- uses: actions/cache@v4
  with:
    path: ~/AppData/Local/uv/cache
    key: ${{ runner.os }}-uv-${{ hashFiles('pyproject.toml') }}
```

### Devcontainer Caching
- Docker layer caching for base image
- Node modules cached by Docker volume
- Playwright browsers cached in `/home/vscode/.cache/ms-playwright`

**Result**: Both optimize for rebuild speed, different mechanisms

## Recommendations

### Keep Devcontainer Aligned with CI

When updating CI workflows, also update devcontainer:

1. **Python version change**: Update both Dockerfile and CI
2. **Dependency changes**: Both use `pyproject.toml`, so automatic
3. **Node version change**: Update both devcontainer.json and CI
4. **New system dependencies**: Add to Dockerfile AND document in CI (if needed)

### Testing Strategy

Before pushing code:

```bash
# In devcontainer, run CI-equivalent commands
make format-check  # CI lint job
make lint          # CI lint job
make type-check    # CI type-check job
pytest backend/tests/unit/ -v  # CI unit-tests job
npm run test:run   # CI frontend-tests job
```

This ensures your code will pass CI.

## Migration Notes

### If You Have an Existing .venv

After rebuilding the container with the new configuration:

```bash
# In devcontainer terminal
rm -rf .venv  # Remove old venv
which python  # Should show /usr/local/bin/python
pip list      # Should show installed packages
```

### VS Code Python Extension

The extension should automatically detect the system Python. If it doesn't:

1. Press `Ctrl+Shift+P`
2. Type "Python: Select Interpreter"
3. Choose `/usr/local/bin/python`

## Summary

The devcontainer is now a **superset** of the CI environment:
- ✅ Same Python installation method
- ✅ Same package installation method
- ✅ Same language/runtime versions
- ➕ Additional GUI support (Xvfb, VNC)
- ➕ Additional developer tools
- ➕ Port forwarding for remote access

This ensures **maximum compatibility** while providing a **superior developer experience**.
