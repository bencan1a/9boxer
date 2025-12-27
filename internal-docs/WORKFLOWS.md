# GitHub Actions Workflows

This document describes the GitHub Actions workflows in the 9Boxer repository, covering both automated CI/CD pipelines and development environment setup.

## Table of Contents
- [Development Environment Setup](#development-environment-setup)
- [CI/CD Workflows](#cicd-workflows)
- [Enhanced Features](#enhanced-features)
- [Workflow Reference](#workflow-reference)

## Development Environment Setup

### Copilot Environment Setup

**Workflow:** `.github/workflows/copilot-setup-steps.yml`

Automatically sets up the development environment for GitHub Copilot's coding agent. This ensures the agent has all necessary dependencies installed before it starts working on tasks.

**Key Features:**
- Sets up Python 3.13 with `uv` package manager
- Installs all Python backend dependencies (FastAPI, pytest, ruff, etc.)
- Sets up Node.js 20 with npm
- Installs all frontend dependencies (React, Vite, TypeScript, etc.)
- Installs Playwright browsers for E2E testing
- Configures pre-commit hooks
- Validates the complete environment

**When it runs:**
- Automatically invoked by GitHub Copilot when its coding agent starts
- Manual trigger via workflow_dispatch
- On push/PR when the workflow file itself is modified

**Important Notes:**

⚠️ **This workflow should NOT include:**
- `actions/checkout@v4` - Copilot automatically clones the repository before running the setup.
- `on:` trigger section - Custom setup workflows don't need explicit triggers.

Including these causes "fatal: repository not found" errors due to permissions conflicts with Copilot's automatic checkout process.

**Troubleshooting:**

**Copilot agent fails with "repository not found":**
- Verify the workflow does NOT contain `actions/checkout@v4`.
- Verify the workflow does NOT have an `on:` trigger section.
- Check that the workflow file is named exactly `copilot-setup-steps.yml`.

**Environment setup takes too long:**
- Cache keys are used for uv, npm, and Playwright to speed up installation.
- First run may take 5-10 minutes; subsequent runs should be faster.

For complete details, see [docs/COPILOT_SETUP.md](COPILOT_SETUP.md).

---

## CI/CD Workflows

The repository uses modern CI/CD best practices with the following workflows:

### CI Workflow (`ci.yml`)

**Purpose:** Continuous integration for all PRs and pushes to main

**Enhanced Features:**
- **`uv` Package Installer**: Uses `uv pip install --system` for ~10x faster dependency installation
- **Auto-fix Step**: Runs `make fix` with `continue-on-error: true` before checks to auto-correct issues
- **YAML Validation**: Validates all workflow YAML files as part of linting
- **Smart Change Detection**: Automatically detects if only documentation files changed and skips unnecessary tests
- **Pre-commit Cache**: Caches pre-commit hooks to speed up lint jobs
- **Pytest Cache**: Caches pytest results for faster test execution
- **Enhanced Security Scanning**:
  - Generates JSON security reports for artifacts
  - Uploads security reports as artifacts for later review
- **Improved Artifact Management**: Uploads coverage reports, test results, and selection metadata
- **Job Dependencies**: Tests now depend on lint and type-check passing, saving CI resources
- **Matrix Optimization**: Reduces matrix size for PRs (excludes some OS/Python combinations)
- **Makefile Commands**: Uses `make` commands for consistency (`make lint`, `make format-check`, `make type-check`, `make security-report`)
- **CI Summary Job**: Final summary job renamed to "CI Summary" with improved result checking
- **Manual Trigger**: Added `workflow_dispatch` for manual runs

**Benefits:**
- Significantly faster PR checks (~10x faster dependency install with uv)
- Auto-fixes many common issues before validation
- Better visibility of issues (job summaries, YAML validation)
- Resource savings (job dependencies, smart caching)
- Consistency through Makefile usage

---

### Nightly Regression Workflow (`nightly.yml`)

**Purpose:** Comprehensive nightly testing across all platforms and Python versions

**Enhanced Features:**
- **`uv` Package Installer**: Uses `uv pip install --system` for faster dependency installation
- **Makefile Commands**: Uses `make security-report` and `make type-check` for consistency
- **Parameterized Manual Triggers**: Can select specific OS or Python version to test
- **Enhanced Security Scanning**: Generates JSON security reports
- **SBOM Generation**: Creates Software Bill of Materials using CycloneDX
- **Improved Dependency Auditing**:
  - Uses both `pip-audit` and `safety` for comprehensive scanning
  - Generates JSON reports for programmatic analysis
- **Smart Issue Management**:
  - Checks for existing regression issues before creating new ones
  - Adds comments to existing issues instead of spam
  - Includes detailed job status in notifications
- **Better Artifact Management**: Uploads security scans, coverage, and SBOM
- **Enhanced Summaries**: Detailed job status table in workflow summary

**Benefits:**
- Faster nightly runs with uv
- Comprehensive security monitoring
- Better compliance (SBOM generation)
- Reduced issue spam
- More targeted debugging capabilities
- Consistency with CI workflow through Makefile usage

---

### Documentation Workflow (`docs.yml`)

**Purpose:** Automated documentation generation and validation

**Enhanced Features:**
- **`uv` Package Installer**: Uses `uv pip install --system` for faster dependency installation
- **Documentation Caching**: Caches built documentation to speed up rebuilds
- **Validation Step**: Verifies critical files were generated and checks size limits
- **Parameterized Dispatch**: Can force rebuild all documentation
- **Artifact Upload**: Documentation artifacts available for download
- **Enhanced Dependencies**: Added Sphinx for more comprehensive documentation
- **Better Status Reporting**: Shows whether docs were updated or already current

**Benefits:**
- Faster documentation builds with uv
- Catches documentation generation errors early
- Downloadable documentation for offline review

---

### Dependency Review Workflow (`dependency-review.yml`)

**Purpose:** Automated security review of dependency changes in PRs

**Features:**
- Uses GitHub's native dependency-review-action
- Runs pip-audit and safety checks on new dependencies
- Comments on PRs with vulnerability summaries
- Uploads detailed audit reports as artifacts
- Configurable severity threshold (currently: moderate)

**Benefits:**
- Catches vulnerable dependencies before merge
- Automated security feedback in PRs
- Comprehensive vulnerability scanning

---

### Code Quality Workflow (`code-quality.yml`)

**Purpose:** Automated code quality analysis and metrics

**Features:**
- **Complexity Analysis**: Uses radon to calculate:
  - Cyclomatic complexity
  - Maintainability index
  - Raw metrics (LOC, SLOC, comments, etc.)
- **Dead Code Detection**: Uses vulture to find unused code
- **PR Comments**: Posts quality metrics directly on PRs
- **Trend Tracking**: Artifacts allow tracking metrics over time

**Benefits:**
- Proactive code quality monitoring
- Identifies overly complex code early
- Helps maintain clean codebase

---

### Release Workflow (`release.yml`)

**Purpose:** Automated release process with validation

**Features:**
- **Validation Stage**:
  - Runs full test suite before release
  - Security and type checking
  - Verifies version consistency between tag and package
- **Build Stage**:
  - Creates distribution packages (wheel + sdist)
  - Validates packages with twine
- **Release Stage**:
  - Extracts changelog for release notes
  - Creates GitHub release with artifacts
  - Supports pre-release flag
- **Publish Stage**: Ready for PyPI publishing (currently disabled)

**Benefits:**
- Ensures only validated code is released
- Automated release notes from changelog
- Consistent release process

---

### Build Electron App Workflow (`build-electron.yml`)

**Purpose:** Automatically builds the 9Boxer Electron application for all platforms

Builds standalone desktop installers for:
- **Windows**: `.exe` installer (NSIS)
- **macOS**: `.dmg` disk image (x64 + ARM64/Apple Silicon)
- **Linux**: `.AppImage` portable executable

**When it runs:**
- **Automatic**: On every push to `main` or `standalone_app` branches
- **Pull Requests**: On PRs targeting `main` or `standalone_app`
- **Manual**: Via "Actions" tab → "Build Electron App" → "Run workflow"

**How to download builds:**
1. Go to **Actions** tab in GitHub
2. Click the latest workflow run (green ✓ = success)
3. Scroll to **Artifacts** section
4. Download:
   - `9boxer-linux-<sha>.zip` - Contains AppImage
   - `9boxer-windows-<sha>.zip` - Contains .exe installer
   - `9boxer-macos-<sha>.zip` - Contains .dmg

**Build process:**

Each platform runs independently:

1. **Backend**: Builds PyInstaller executable
   - Python 3.12
   - PyInstaller packages FastAPI + dependencies
   - Output: `backend/dist/ninebox/ninebox(.exe)`

2. **Frontend**: Builds Electron app
   - Node.js 20
   - Vite builds React app
   - TypeScript compiles Electron main/preload
   - electron-builder packages everything
   - Output: `frontend/release/`

**Build times:**
- **Linux**: ~5-8 minutes
- **Windows**: ~6-10 minutes
- **macOS**: ~8-12 minutes (builds both x64 and ARM64)

**Artifact retention:** 90 days

**Troubleshooting:**

**Build fails on Windows:**
- Check that `signAndEditExecutable: false` is in `frontend/electron-builder.json`
- Windows builds use native tools (no Wine issues)

**Build fails on macOS:**
- macOS builds both x64 and ARM64 (Apple Silicon)
- No code signing by default (users will see "unidentified developer" warning)

**Missing backend executable:**
- Check backend build step completed successfully
- Verify PyInstaller spec at `backend/build_config/ninebox.spec`

**Artifacts not uploaded:**
- Check "List build outputs" step for file paths
- Verify artifact path patterns match actual output

---

### Reusable Setup Workflow (`reusable-setup.yml`)

**Purpose:** Reusable workflow for common Python setup tasks

**Features:**
- Parameterized Python version selection
- Optional dev dependencies installation
- Advanced caching with custom keys
- Cache hit detection output

**Benefits:**
- DRY principle for workflow setup
- Consistent environment across workflows
- Easier maintenance

---

## Enhanced Features

### Performance Optimizations

1. **Advanced Caching**:
   - pip packages
   - pre-commit hooks
   - pytest cache
   - documentation builds
   - dependency installations

2. **Smart Execution**:
   - Skip tests for docs-only changes
   - Reduced matrix for PRs
   - Job dependencies to fail fast
   - Parallel job execution where possible

### Security Enhancements

1. **SARIF Integration**: Security results visible in GitHub Security tab
2. **SBOM Generation**: Track all dependencies with bill of materials
3. **Multiple Security Tools**: pip-audit, safety, bandit
4. **Dependency Review**: Automated scanning on dependency changes
5. **Proper Permissions**: Minimal required permissions per job

### Developer Experience

1. **Rich Summaries**: Job summaries with status tables and metrics
2. **PR Comments**: Automated feedback on code quality and dependencies
3. **Manual Triggers**: All workflows support manual execution
4. **Better Artifacts**: Comprehensive artifact uploads with sensible retention
5. **Smart Notifications**: Reduced issue spam, better error messages

### Reliability

1. **Validation Steps**: Verify outputs before committing
2. **Continue on Error**: Non-critical steps don't fail entire workflow
3. **Artifact Retention**: Different retention periods based on importance
4. **Matrix Resilience**: fail-fast: false for comprehensive testing

### Maintainability

1. **Reusable Workflows**: Common setup extracted to reusable workflow
2. **Clear Job Names**: Descriptive names for better readability
3. **Comments**: Inline documentation in workflows
4. **Parameterization**: Flexible workflow execution via inputs

---

## Workflow Reference

### Workflow Comparison

| Feature | Before | After |
|---------|--------|-------|
| Workflows | 3 | 7 |
| Caching | pip only | pip, pre-commit, pytest, docs |
| Security Scanning | Basic bandit | SARIF, pip-audit, safety, SBOM |
| PR Feedback | None | Code quality, dependency review |
| Release Process | Manual | Automated with validation |
| Job Dependencies | None | Optimized for fast failure |
| Matrix Strategy | Full for all | Optimized for PRs |
| Artifact Retention | Fixed | Smart (7-90 days) |
| Manual Triggers | Limited | All workflows |
| Summaries | Basic | Rich with tables and metrics |

### Resource Usage Estimates

**CI Workflow (per PR):**
- **Before**: ~15-20 minutes, 9 jobs (3 OS × 3 Python versions)
- **After**: ~10-15 minutes, 5-7 jobs (reduced matrix, smart skipping)
- **Savings**: ~30-40% CI time for typical PRs

**Nightly Workflow:**
- **Before**: ~20-25 minutes
- **After**: ~25-30 minutes (more comprehensive checks)
- **Trade-off**: Slightly longer but much more thorough

---

## Configuration

### Optional Configuration

1. **PyPI Publishing**: To enable PyPI publishing in release workflow:
   ```yaml
   # In .github/workflows/release.yml, line ~140
   if: false  # Change to: if: true
   ```
   Also add `PYPI_API_TOKEN` to repository secrets.

2. **Codecov Token**: For private repositories, add `CODECOV_TOKEN` secret.

3. **Notification Integrations**: Can add Slack/Discord webhooks to notify job.

### Recommended Actions

1. **Enable Dependabot**: Create `.github/dependabot.yml`:
   ```yaml
   version: 2
   updates:
     - package-ecosystem: "pip"
       directory: "/"
       schedule:
         interval: "weekly"
     - package-ecosystem: "github-actions"
       directory: "/"
       schedule:
         interval: "weekly"
   ```

2. **Branch Protection**: Update branch protection rules to require:
   - CI Success job passing
   - Dependency Review passing (for dependency changes)

3. **CODEOWNERS**: Add `.github/CODEOWNERS` for automatic review assignments

---

## Testing the Workflows

To test the enhanced workflows:

1. **CI Workflow**:
   ```bash
   # Create a PR with code changes
   # Check that all jobs run

   # Create a PR with only docs changes
   # Verify jobs are skipped
   ```

2. **Dependency Review**:
   ```bash
   # Update pyproject.toml with a new dependency
   # Create PR and check for dependency review comments
   ```

3. **Code Quality**:
   ```bash
   # Create PR with code changes
   # Check for complexity metrics in comments
   ```

4. **Release**:
   ```bash
   # Create and push a version tag
   git tag v0.2.0
   git push origin v0.2.0
   # Verify release is created automatically
   ```

5. **Local Testing**: Test workflows locally with [act](https://github.com/nektos/act):
   ```bash
   # Install act
   brew install act  # macOS
   # or
   curl https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash  # Linux

   # Run workflow locally
   act -j build
   ```

---

## Maintenance

### Updating Workflows

When updating workflows:
1. Always validate YAML syntax
2. Test in a fork or feature branch first
3. Review diff carefully for permission changes
4. Update this documentation with changes

### Regular Reviews

Recommend reviewing workflows:
- **Monthly**: Check for action updates (Dependabot helps)
- **Quarterly**: Review cache hit rates and adjust strategies
- **Annually**: Audit security configurations and permissions

---

## Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [GitHub Security Features](https://docs.github.com/en/code-security)
- [Workflow Syntax](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)
- [Reusing Workflows](https://docs.github.com/en/actions/using-workflows/reusing-workflows)
- [BUILD.md](../BUILD.md) - Complete build instructions
- [DEPLOYMENT.md](../DEPLOYMENT.md) - Deployment guide
- [COPILOT_SETUP.md](COPILOT_SETUP.md) - Copilot environment setup details

---

## Support

For issues or questions about these workflows:
1. Check workflow run logs in Actions tab
2. Review this documentation
3. Check [BUILD.md](../BUILD.md) for build issues
4. Open an issue with the `workflow` label
