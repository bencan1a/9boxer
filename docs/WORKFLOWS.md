# GitHub Workflows Documentation

This document provides an overview of the GitHub Actions workflows used in this repository.

> **Note**: For detailed information about specific workflows, see [.github/workflows/README.md](../.github/workflows/README.md).
> For Copilot environment setup, see [COPILOT_SETUP.md](COPILOT_SETUP.md).

## Overview

The 9Boxer repository uses GitHub Actions for continuous integration, testing, deployment, and documentation maintenance. All workflows use modern CI/CD best practices including:

- **Fast dependency installation** with `uv` package manager
- **Smart caching** for pip, npm, and test results
- **Parallel execution** where possible
- **Makefile integration** for consistency with local development

## Active Workflows

### 1. CI Workflow (`ci.yml`)

**Workflow Name**: Continuous Integration

**Purpose**: Primary CI pipeline for all pushes and pull requests

**Key Features:**
- Runs on every push and pull request
- Multi-platform testing (Ubuntu, Windows, macOS)
- Python version matrix (3.10, 3.11, 3.12, 3.13)
- Comprehensive test suite (unit, integration, E2E)
- Code quality checks (ruff, mypy, bandit)
- Coverage reporting

**Jobs:**
- **Lint**: Code formatting and linting
- **Type Check**: Static type analysis with mypy
- **Test**: Run pytest test suites across platforms
- **Security**: Security scanning with bandit
- **Summary**: Consolidate results

**Benefits:**
- Fast feedback on code changes
- Catches issues before merge
- Ensures code quality standards

### 2. PR Workflow (`pr.yml`)

**Workflow Name**: Pull Request Validation

**Purpose**: Extended validation for pull requests

**Key Features:**
- Frontend testing with Vitest
- Playwright E2E tests
- Build verification (backend + frontend)
- Additional quality gates for PRs

**When it runs:**
- On pull request creation/update
- Can be manually triggered

### 3. Weekly Workflow (`weekly.yml`)

**Workflow Name**: Weekly Comprehensive Testing

**Purpose**: Comprehensive testing and maintenance tasks

**Key Features:**
- Full test suite across all platforms
- Dependency updates check
- Security scanning
- Documentation validation
- Runs every Monday at 2 AM UTC

**Benefits:**
- Catches regressions early
- Monitors dependency health
- Regular security audits

### 4. Documentation Workflow (`docs.yml`)

**Workflow Name**: Documentation

**Purpose**: Build and deploy project documentation

**Key Features:**
- Builds documentation with MkDocs
- Generates API documentation
- Updates documentation on changes
- Validates documentation links

**Triggers:**
- Changes to docs/ directory
- Changes to documentation source files
- Manual trigger available

### 5. Release Workflow (`release.yml`)

**Workflow Name**: Release

**Purpose**: Automated release creation

**Key Features:**
- Triggered on version tags (v*.*.*)
- Creates GitHub releases
- Generates release notes from CHANGELOG.md
- Uploads release artifacts

**Usage:**
```bash
git tag v1.0.0
git push origin v1.0.0
```

### 6. Feature Checklist Workflow (`feature-checklist.yml`)

**Workflow Name**: Feature Development Checklist

**Purpose**: Automated checklist for feature development

**Key Features:**
- Validates feature implementation completeness
- Checks documentation updates
- Verifies test coverage
- Ensures changelog updates


### 7. Visual Regression Workflows

**Three related workflows for screenshot testing:**

#### `screenshots.yml`
- Generates screenshots for visual regression testing
- Updates baseline screenshots when UI changes
- Used by Copilot/Claude for automated screenshot generation

#### `visual-regression.yml`
- Compares current screenshots against baselines
- Detects unintended UI changes
- Runs on pull requests

#### `update-visual-baselines.yml`
- Updates baseline screenshots after approved changes
- Manual trigger available
- Ensures baselines stay current

### 8. Copilot Environment Setup (`copilot-setup-steps.yml`)

**Purpose**: Automated environment setup for GitHub Copilot coding agent

**Key Features:**
- Sets up Python 3.13 with `uv` package manager
- Installs all backend dependencies
- Sets up Node.js 20 with npm
- Installs all frontend dependencies
- Installs Playwright browsers for E2E testing
- Configures pre-commit hooks
- Validates complete environment

**When it runs:**
- Automatically when GitHub Copilot starts a coding session
- Can be manually triggered for testing

**Details**: See [COPILOT_SETUP.md](COPILOT_SETUP.md) for comprehensive documentation.

### 9. Build Electron App (`build-electron.yml`)

**Purpose**: Build standalone desktop installers for all platforms

**Key Features:**
- Builds Windows (NSIS .exe)
- Builds macOS (DMG for x64 + ARM64)
- Builds Linux (AppImage)
- Includes PyInstaller backend bundling
- Uploads artifacts for download

**When it runs:**
- On push to main/standalone_app branches
- On pull requests
- Manual trigger available

**Details**: See [.github/workflows/README.md](../.github/workflows/README.md) for build documentation.

## Common Patterns

### Fast Dependency Installation

All workflows use `uv` for faster Python package installation:
```yaml
- name: Install dependencies
  run: |
    pip install uv
    uv pip install --system -e '.[dev]'
```

This provides ~10x faster installation compared to standard pip.

### Caching Strategy

Workflows use multiple caching layers:
- **pip cache**: Python packages
- **npm cache**: Node.js packages
- **Playwright cache**: Browser binaries
- **pre-commit cache**: Pre-commit hooks

### Matrix Testing

CI workflows test across:
- **Platforms**: Ubuntu, Windows, macOS
- **Python versions**: 3.10, 3.11, 3.12, 3.13
- Reduced matrix for PRs to save time

### Makefile Integration

Workflows use Makefile commands for consistency:
```yaml
- run: make lint
- run: make type-check
- run: make test
```

This ensures CI uses the same commands as local development.

## Workflow Triggers

| Workflow | Push | PR | Schedule | Manual | Tags |
|----------|------|----|---------| -------|------|
| CI | ✓ | ✓ | - | ✓ | - |
| PR | - | ✓ | - | ✓ | - |
| Weekly | - | - | Mon 2AM | ✓ | - |
| Docs | ✓ | ✓ | - | ✓ | - |
| Release | - | - | - | - | v*.*.* |
| Build Electron | ✓ | ✓ | - | ✓ | - |
| Visual Regression | - | ✓ | - | ✓ | - |

## Best Practices

### Local Development

Run the same commands locally before pushing:
```bash
# Activate virtual environment
. .venv/bin/activate

# Run checks (same as CI)
make lint
make type-check
make test
make security-check
```

### Adding New Workflows

When creating new workflows:
1. Use `uv` for Python dependencies
2. Add appropriate caching
3. Use Makefile commands where possible
4. Document in this file
5. Add manual trigger (`workflow_dispatch`)

### Debugging Workflow Failures

1. Check workflow run logs in GitHub Actions
2. Look for job summaries with detailed status
3. Download artifacts for detailed reports
4. Reproduce locally with same commands

## Maintenance

### Regular Updates

- **Weekly**: Automated via `weekly.yml`
- **Dependencies**: Dependabot (if configured)
- **Workflows**: Review quarterly for best practices

### Documentation

When updating workflows:
1. Update this file
2. Update [.github/workflows/README.md](../.github/workflows/README.md) if user-facing
3. Update [COPILOT_SETUP.md](COPILOT_SETUP.md) if environment changes

## Related Documentation

- **[.github/workflows/README.md](../.github/workflows/README.md)** - User-facing workflow guide (Copilot setup, builds)
- **[COPILOT_SETUP.md](COPILOT_SETUP.md)** - Detailed Copilot environment documentation
- **[BUILD.md](../BUILD.md)** - Build process documentation
- **[CONTRIBUTING.md](../CONTRIBUTING.md)** - Contribution guidelines

## Support

For workflow issues:
1. Check workflow logs in Actions tab
2. Review this documentation
3. Check related documentation above
4. Open issue with `workflow` label

---

**Last Updated**: 2025-12-27
**Maintained by**: Development Team
