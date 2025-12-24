# GitHub Copilot Environment Setup

This document explains how GitHub Copilot's coding agent automatically sets up the development environment for the 9Boxer repository.

## Overview

The 9Boxer repository uses GitHub's official Copilot environment customization feature to automatically configure the development environment when you use GitHub Copilot's coding agent. This ensures consistency across different development scenarios and eliminates manual setup steps.

## How It Works

### 1. Custom Instructions File

**Location**: `.github/copilot-instructions.md`

This file provides GitHub Copilot with context-specific information about the repository, including:
- Project architecture and structure
- Monorepo organization (Python backend + Node.js frontend)
- Build order requirements
- Platform constraints (Windows development)
- Testing conventions
- Code quality standards
- Common commands and workflows

### 2. Automated Setup Workflow

**Location**: `.github/workflows/copilot-setup-steps.yml`

This workflow is automatically executed by GitHub Copilot's coding agent in its ephemeral environment. The workflow performs the following setup steps:

#### Python Backend Setup
1. Sets up Python 3.13 with pip caching
2. Creates a virtual environment at `.venv/`
3. Installs `uv` (fast Python package installer)
4. Installs all backend dependencies from `pyproject.toml`
5. Verifies the Python installation

#### Node.js Frontend Setup
1. Sets up Node.js 20 with npm caching
2. Installs all frontend dependencies from `frontend/package.json`
3. Verifies the Node.js installation

#### Playwright Setup
1. Caches Playwright browsers for performance
2. Installs Chromium browser with system dependencies
3. Verifies Playwright installation

#### Pre-commit Hooks
1. Installs pre-commit hooks for code quality checks

#### Environment Validation
1. Validates all components are correctly installed
2. Displays environment summary with versions

## What Gets Installed

### Python Backend Dependencies

**Runtime Dependencies:**
- FastAPI 0.104.0+
- Uvicorn 0.24.0+ (with standard extras)
- Pandas 2.1.0+
- openpyxl 3.1.0+ (Excel processing)
- Pydantic 2.4.0+
- NumPy 1.24.0+
- SciPy 1.11.0+

**Development Dependencies:**
- Testing: pytest, pytest-cov, pytest-asyncio, pytest-mock, pytest-xdist, httpx
- Code Quality: ruff, black, mypy, bandit, pyright
- Type Stubs: types-requests, pandas-stubs, types-openpyxl, scipy-stubs
- Development Tools: ipython, ipdb, pre-commit
- Documentation: mkdocs-material

### Frontend Dependencies

**Production Dependencies:**
- React ^18.2.0
- React DOM ^18.2.0
- Electron ^35.7.5
- Material-UI ^5.14.20
- Axios ^1.13.2
- Zustand ^4.4.7 (state management)
- React Router DOM ^6.20.0

**Development Dependencies:**
- TypeScript ^5.2.2
- Vite ^7.2.7
- Vitest ^4.0.16 (testing)
- Playwright ^1.57.0 (E2E testing)
- ESLint ^8.55.0
- Electron Builder ^26.0.12

**Playwright Browsers:**
- Chromium (with system dependencies)
- Installed via `npx playwright install --with-deps chromium`
- Cached for faster subsequent runs

## Benefits of Automated Setup

1. **Consistency**: Every Copilot coding session starts with the exact same environment
2. **Speed**: Dependencies are cached, making setup fast
3. **Correctness**: Eliminates common setup errors like:
   - Forgetting to activate virtual environment
   - Installing in wrong Python/Node version
   - Missing development dependencies
   - Incorrect package versions
4. **Documentation as Code**: The setup workflow serves as executable documentation
5. **Zero Manual Steps**: No need to remember setup commands

## For Developers

### Using GitHub Copilot

When you use GitHub Copilot's coding agent (in GitHub.com, GitHub Mobile, or VS Code), the environment is automatically set up. You don't need to do anything manually.

### Local Development

For local development without Copilot, follow the manual setup instructions in [GITHUB_AGENT.md](../GITHUB_AGENT.md):

```bash
# 1. Create virtual environment
python3 -m venv .venv
. .venv/bin/activate

# 2. Install backend dependencies into the virtual environment
pip install uv
uv pip install -e '.[dev]'

# 3. Install frontend dependencies
cd frontend
npm install

# 4. Install pre-commit hooks (from project root, venv still active)
cd ..
pre-commit install
```

## Workflow Triggers

The `copilot-setup-steps.yml` workflow runs:

1. **Automatically**: When GitHub Copilot starts a coding session
2. **On workflow_dispatch**: Can be manually triggered from GitHub Actions UI
3. **On push**: When the workflow file itself is modified
4. **On pull_request**: When the workflow file is changed in a PR

## Troubleshooting

### Issue: Copilot can't find Python packages

**Cause**: Virtual environment not activated in shell commands

**Solution**: The workflow already handles this. If you're running commands manually, ensure you activate the venv:
```bash
source .venv/bin/activate  # Linux/macOS
.venv\Scripts\activate     # Windows
```

### Issue: Frontend dependencies not found

**Cause**: npm install hasn't completed

**Solution**: The workflow handles this automatically. For manual setup:
```bash
cd frontend
npm ci  # Use npm ci for clean install
```

### Issue: Workflow fails on Python version

**Cause**: Repository requires Python 3.13+

**Solution**: The workflow uses Python 3.13. For local development, ensure you have the correct version:
```bash
python --version  # Should be 3.13+
```

### Issue: Playwright browsers not found

**Cause**: Playwright browsers not installed or cache corrupted

**Solution**: The workflow handles this automatically with caching. For manual setup:
```bash
cd frontend
npx playwright install --with-deps chromium
```

### Issue: E2E tests fail in Copilot environment

**Cause**: Playwright browsers not preinstalled

**Solution**: The workflow now automatically installs and caches Playwright browsers. If issues persist, the cache may need to be cleared and rebuilt.

## Related Documentation

- [GitHub Documentation: Customize the agent environment](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/coding-agent/customize-the-agent-environment)
- [GITHUB_AGENT.md](../GITHUB_AGENT.md) - Comprehensive onboarding guide
- [CONTRIBUTING.md](../CONTRIBUTING.md) - Contribution guidelines
- [README.md](../README.md) - Project overview and quick start

## Technical Details

### Why `uv pip install --system`?

We use `uv` for faster package installation. The `--system` flag is used because we want to install packages into the virtual environment (not user site-packages), and `uv` defaults to user-level installs when in a venv.

### Why `npm ci` instead of `npm install`?

`npm ci` provides:
- Faster installation from package-lock.json
- Ensures exact versions match lock file
- Cleans node_modules before install
- Better for CI/CD environments

### Cache Strategy

Both Python and Node.js setups use action-level caching:
- **Python**: `cache: 'pip'` in `setup-python` action
- **Node.js**: `cache: 'npm'` in `setup-node` action with explicit lock file path

This significantly speeds up subsequent workflow runs.

## Maintenance

### Updating Dependencies

When you update dependencies:

1. **Python**: Update `pyproject.toml`, no workflow changes needed
2. **Node.js**: Update `frontend/package.json`, no workflow changes needed

The workflow automatically picks up the latest versions from these files.

### Updating Python Version

If you need to update the Python version:

1. Update `python-version` in `.github/workflows/copilot-setup-steps.yml`
2. Update `requires-python` in `pyproject.toml`
3. Test locally to ensure compatibility

### Updating Node.js Version

If you need to update the Node.js version:

1. Update `node-version` in `.github/workflows/copilot-setup-steps.yml`
2. Update `engines.node` in `frontend/package.json`
3. Update `.nvmrc` at project root
4. Test locally to ensure compatibility

## Best Practices

1. **Keep instructions updated**: When you change project conventions or add new tools, update `.github/copilot-instructions.md`

2. **Test the workflow**: Before merging changes to the workflow, trigger it manually to ensure it works

3. **Document breaking changes**: If you make breaking changes to the environment setup, document them in the PR and update this guide

4. **Version pins**: Use specific version constraints in `pyproject.toml` and `package.json` to ensure reproducible builds

5. **Minimal scope**: The setup workflow should only install dependencies and configure the environment, not run tests or builds

## See Also

- [BUILD.md](../BUILD.md) - Complete build instructions
- [docs/CONTEXT.md](CONTEXT.md) - Comprehensive project context
- [CLAUDE.md](../CLAUDE.md) - Technical details and architecture
