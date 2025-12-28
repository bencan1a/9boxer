# GitHub Actions Workflows

This document describes all GitHub Actions workflows in the 9Boxer repository.

## Table of Contents
- [Workflow Overview](#workflow-overview)
- [CI/CD Workflows](#cicd-workflows)
- [Build Workflows](#build-workflows)
- [Documentation Workflows](#documentation-workflows)
- [Testing Workflows](#testing-workflows)
- [Development Workflows](#development-workflows)
- [Environment Setup](#environment-setup)
- [Configuration & Troubleshooting](#configuration--troubleshooting)

## Workflow Overview

**Total Workflows:** 13

| Category | Workflows | Purpose |
|----------|-----------|---------|
| CI/CD | ci.yml, pr.yml, weekly.yml, release.yml | Testing, validation, releases |
| Build | build-electron.yml | Desktop application builds |
| Documentation | docs.yml, docs-audit.yml, docs-auto-update.yml, screenshots.yml | Doc generation and maintenance |
| Testing | visual-regression.yml, update-visual-baselines.yml | Visual regression testing |
| Development | feature-checklist.yml | PR validation |
| Environment | copilot-setup-steps.yml | GitHub Copilot setup |

---

## CI/CD Workflows

### CI Workflow (`ci.yml`)

**Purpose:** Continuous integration for pushes to main/develop branches

**Triggers:**
- Push to `main` or `develop` branches
- Manual trigger via workflow_dispatch

**Key Steps:**
- Change detection (determines which tests to run)
- Linting and formatting (ruff)
- Type checking (mypy, pyright)
- Security scanning (bandit)
- Testing (pytest for backend, Vitest for frontend)
- Coverage reporting

**Features:**
- Smart change detection (skips tests for docs-only changes)
- Concurrency control (cancels in-progress runs)
- Caching (pip, pre-commit, pytest)
- Auto-fix step (runs `make fix` before validation)

**Configuration:**
- Runs on: windows-latest, ubuntu-latest
- Python versions: 3.12, 3.13
- Timeout: Varies by job

**Troubleshooting:**
- If tests fail after docs-only changes, verify change detection logic
- Check workflow run logs for specific job failures
- Ensure pre-commit hooks pass locally before pushing

---

### PR Validation Workflow (`pr.yml`)

**Purpose:** Validates pull requests targeting main branch

**Triggers:**
- Pull request events: opened, synchronize, reopened
- Manual trigger via workflow_dispatch

**Key Steps:**
- Change detection (similar to ci.yml)
- Python linting, formatting, type checking
- Security scanning
- Backend tests (if Python files changed)
- Frontend tests (if frontend files changed)

**Features:**
- Optimized for PR speed (reduced matrix)
- Smart test selection based on changed files
- Concurrency per PR (cancels in-progress runs)

**Configuration:**
- Runs on: windows-latest
- Faster than ci.yml (optimized for quick PR feedback)

---

### Weekly Comprehensive Testing (`weekly.yml`)

**Purpose:** Comprehensive weekly regression testing across all platforms

**Triggers:**
- Schedule: Every Sunday at 2 AM UTC (`0 2 * * 0`)
- Manual trigger (can select specific OS)

**Key Steps:**
- Full test suite on all platforms
- Security scanning with SBOM generation
- Dependency auditing (pip-audit + safety)
- Issue creation if regressions detected

**Features:**
- Parameterized manual trigger (select OS)
- Comprehensive artifact uploads (coverage, SBOM, security reports)
- Smart issue management (doesn't spam duplicate issues)
- Enhanced summaries with job status tables

**Configuration:**
- Runs on: ubuntu-latest, windows-latest, macos-latest
- Full test matrix (not optimized for speed)

**Troubleshooting:**
- Check existing regression issues before creating new ones
- Review security scan artifacts if vulnerabilities detected
- Use manual trigger to debug platform-specific issues

---

### Release Workflow (`release.yml`)

**Purpose:** Automated release process with validation

**Triggers:**
- Push tags matching `v*.*.*` (e.g., v1.0.0)
- Manual trigger with version input

**Key Steps:**
1. **Validation:** Run full test suite, security checks, version verification
2. **Build:** Create distribution packages (wheel + sdist)
3. **Release:** Create GitHub release with artifacts
4. **Publish:** (Optional) Publish to PyPI

**Features:**
- Pre-release flag support
- Automated changelog extraction
- Artifact validation (twine check)
- Multiple stages with dependencies

**Configuration:**
- PyPI publishing disabled by default (set `if: true` to enable)
- Requires PYPI_API_TOKEN secret if publishing

**Troubleshooting:**
- Verify tag format matches `v*.*.*`
- Check version consistency between tag and package
- Review validation logs if release creation fails

---

## Build Workflows

### Build Electron App (`build-electron.yml`)

**Purpose:** Build standalone desktop installers for all platforms

**Triggers:**
- Manual trigger only (workflow_dispatch)

**Platforms:**
- **Linux:** AppImage (.AppImage)
- **Windows:** NSIS installer (.exe)
- **macOS:** DMG disk image (.dmg)

**Key Steps:**
1. Setup Python 3.13 and Node.js 20
2. Build backend executable with PyInstaller
3. Build frontend with Vite
4. Package with Electron Builder
5. Upload platform-specific artifacts

**Build Times:**
- Linux: ~5-8 minutes
- Windows: ~6-10 minutes
- macOS: ~8-12 minutes

**Artifacts:**
- Retention: 90 days
- Names: `9boxer-{platform}-{sha}.zip`

**Troubleshooting:**
- **Missing backend executable:** Check PyInstaller build step logs
- **Windows build fails:** Verify `signAndEditExecutable: false` in electron-builder.json
- **macOS issues:** Builds both x64 and ARM64, no code signing by default

See [BUILD.md](../BUILD.md) for complete build documentation.

---

## Documentation Workflows

### Documentation Generation (`docs.yml`)

**Purpose:** Generate and validate documentation from source code

**Triggers:**
- Push to main affecting docs, src, or tools
- Manual trigger (can force rebuild)

**Key Steps:**
- Run `tools/build_context.py` to generate:
  - API docs from Python docstrings (pdoc3)
  - CONTEXT.md (comprehensive project context)
  - SUMMARY.md (documentation index)
  - Active plans index
- Validate generated files (check size, existence)
- Commit and push changes

**Features:**
- Documentation caching
- Validation step (ensures critical files generated)
- Auto-commit with [skip ci]

**Configuration:**
- Runs on: ubuntu-latest
- Uses `uv` for fast dependency installation

**Troubleshooting:**
- If docs don't update, check `tools/build_context.py` logs
- Verify ANTHROPIC_API_KEY is set (if AI features used)
- Check file size limits (CONTEXT.md <150KB)

---

### AI Documentation Audit (`docs-audit.yml`)

**Purpose:** AI-powered audit of documentation for drift, conflicts, staleness

**Triggers:**
- Schedule: Weekly on Monday at 2 AM UTC (`0 2 * * 1`)
- Manual trigger (can set days to look back, dry run)

**Key Steps:**
1. Analyze git commits in last N days (default: 7)
2. Detect file changes in documentation directories
3. Use Anthropic Claude Sonnet 4.5 to analyze:
   - **Internal docs** (developer/agent documentation)
     - Conflicting recommendations
     - Stale content
     - Missing documentation
     - Outdated examples
     - New docs needing consolidation
   - **User docs** (end-user documentation)
     - Screenshot staleness
     - Workflow accuracy
     - Translation completeness
     - Accessibility compliance
4. Create separate GitHub issues for findings (internal vs user docs)

**Features:**
- Uses git history for change detection
- Separate issue labels: `internal-documentation` vs `user-documentation`
- Consolidated issues (groups related findings)
- Dry run mode for testing
- Configurable lookback period

**Configuration:**
- Requires ANTHROPIC_API_KEY secret
- Default: 7 days lookback
- Input parameters:
  - `days`: Number of days to look back (default: 7)
  - `dry_run`: Preview findings without creating issues (default: false)

**Artifacts:**
- **`docs-audit-report.json`:** Complete audit report with findings
- **Retention:** 30 days
- **Summary comment:** Posted to workflow run with statistics

**Troubleshooting:**
- **API failures:** Check ANTHROPIC_API_KEY secret is valid
- **High costs:** Review lookback period (shorter = cheaper)
- **No issues created:** Check dry_run mode, review audit report artifact
- **Duplicate issues:** Script prevents duplicates based on existing issue titles
- **JSON parsing errors:** Check report artifact for malformed JSON

**Cost Monitoring:**
- Typical weekly run: ~$2.20/month
- 7-day lookback: ~15KB context + ~10KB analysis = ~25KB total
- Uses Claude Sonnet 4.5 (cost-effective model)
- Budget: $2-4/month

---

### Documentation Auto-Update (`docs-auto-update.yml`)

**Purpose:** Detect documentation impact from component changes

**Triggers:**
- Pull requests affecting:
  - `frontend/src/components/**`
  - `frontend/src/pages/**`
  - `frontend/src/theme/**`
  - `.github/component-screenshot-map.json`

**Key Steps:**
- Analyze changed components
- Determine affected screenshots
- Report documentation impact
- Create issue if manual updates needed

**Features:**
- Component-to-screenshot mapping
- Impact analysis with counts
- PR comments with affected items

**Configuration:**
- Runs on: ubuntu-latest
- Requires `.github/component-screenshot-map.json`

**Troubleshooting:**
- Verify mapping file exists and is valid JSON
- Check `detect-doc-impact.js` script for errors

---

### Generate Documentation Screenshots (`screenshots.yml`)

**Purpose:** Automated generation of user documentation screenshots

**Triggers:**
- Schedule: Weekly on Monday at 2 AM UTC (`0 2 * * 1`)
- Manual trigger via workflow_dispatch

**Key Steps:**
1. Setup Node.js and Python environments
2. Install frontend dependencies and Playwright
3. Build backend executable
4. Generate screenshots using Playwright
5. Commit and push updated screenshots

**Features:**
- Automated weekly updates
- Reuses E2E test helpers
- Auto-commit with [skip ci]

**Configuration:**
- Runs on: ubuntu-latest (for consistency)
- Uses Chromium browser only

**Troubleshooting:**
- Verify backend build succeeds
- Check Playwright logs for screenshot failures
- Ensure screenshots directory writable

See [internal-docs/contributing/screenshot-guide.md](contributing/screenshot-guide.md) for technical standards.

---

## Testing Workflows

### Visual Regression Tests (`visual-regression.yml`)

**Purpose:** Detect unintended visual changes in UI components

**Triggers:**
- Pull requests affecting:
  - `frontend/src/**`
  - `frontend/.storybook/**`
  - `frontend/playwright/visual/**`
- Manual trigger

**Key Steps:**
- Setup environment (Python, Node.js, Playwright)
- Run visual regression tests
- Compare screenshots to baselines
- Report differences

**Features:**
- Pixel-perfect comparison
- Diff image generation
- Artifact upload for review

**Configuration:**
- Runs on: ubuntu-latest
- Timeout: 15 minutes

**Troubleshooting:**
- Review diff images in artifacts
- Use `update-visual-baselines.yml` for intentional changes
- Ensure consistent rendering environment

---

### Update Visual Regression Baselines (`update-visual-baselines.yml`)

**Purpose:** Update baseline screenshots when intentional UI changes are made

**Triggers:**
- Manual trigger only (workflow_dispatch)
- Requires reason input

**Key Steps:**
- Generate new baseline screenshots
- Commit and push updated baselines

**Features:**
- Reason tracking (commit message)
- Manual approval required
- Prevents accidental baseline updates

**Configuration:**
- Runs on: ubuntu-latest
- Timeout: 20 minutes

**Troubleshooting:**
- Only use for intentional UI changes
- Document reason clearly
- Review changes before committing

---

## Development Workflows

### Feature Development Checklist (`feature-checklist.yml`)

**Purpose:** Validate feature development checklist in PRs

**Triggers:**
- Pull request events: opened, synchronize, reopened, edited
- Issue comment events (for PR updates)

**Key Steps:**
- Extract linked issues from PR body
- Validate checklist items
- Comment on PR with validation results

**Features:**
- Extracts issue numbers from PR body
- Multiple pattern matching (closes, fixes, related to)
- Automated PR comments

**Configuration:**
- Runs on: ubuntu-latest

**Troubleshooting:**
- Ensure PR body links issues properly
- Check pattern matching in script

---

## Environment Setup

### Copilot Environment Setup (`copilot-setup-steps.yml`)

**Purpose:** Automated environment setup for GitHub Copilot coding agent

**Triggers:**
- Automatically invoked by GitHub Copilot when coding agent starts

**Key Steps:**
1. Setup Python 3.13 with `uv`
2. Install backend dependencies
3. Setup Node.js 20 with npm
4. Install frontend dependencies
5. Install Playwright browsers
6. Configure pre-commit hooks
7. Validate environment

**Features:**
- Comprehensive caching (uv, npm, Playwright)
- Environment validation
- Fast setup (~5-10 minutes with cache)

**Important:**
- NO `actions/checkout@v4` step (Copilot handles checkout)
- NO `on:` trigger section (custom setup workflow)

**Troubleshooting:**
- **"repository not found" error:** Verify no checkout step
- **Slow setup:** Check cache hit rates
- **Missing dependencies:** Review install logs

See [COPILOT_SETUP.md](COPILOT_SETUP.md) for complete details.

---

## Configuration & Troubleshooting

### Common Configuration

**Caching Strategy:**
- **pip packages:** `~/.cache/uv` (uv cache)
- **npm packages:** `~/.npm` (npm cache)
- **Playwright:** `~/.cache/ms-playwright`
- **pre-commit:** `~/.cache/pre-commit`

**Secrets Required:**
- `ANTHROPIC_API_KEY` - For AI documentation audit (docs-audit.yml)
- `PYPI_API_TOKEN` - For PyPI publishing (release.yml, optional)
- `GITHUB_TOKEN` - Auto-provided by GitHub Actions

### Performance Optimizations

1. **`uv` Package Manager:** ~10x faster than pip for Python installs
2. **Smart Caching:** Multi-level caching for dependencies
3. **Change Detection:** Skip unnecessary jobs for docs-only changes
4. **Concurrency Control:** Cancel in-progress runs for same workflow
5. **Job Dependencies:** Tests wait for lint/type-check to pass

### Artifact Management

**Retention Periods:**
- Build artifacts (Electron installers): 90 days
- Test artifacts (coverage, logs): 7 days
- Security scans: 30 days
- Documentation: 14 days

### Manual Triggers

All workflows support manual triggering via workflow_dispatch. To trigger:
1. Go to **Actions** tab in GitHub
2. Select workflow from left sidebar
3. Click **Run workflow**
4. Fill in inputs (if required)
5. Click **Run workflow** button

### Common Issues

**Workflow doesn't trigger:**
- Check trigger conditions (branch, paths, schedule)
- Verify permissions are correct
- Check concurrency settings (may be cancelled)

**Tests fail unexpectedly:**
- Review change detection logic
- Check if environment matches local
- Verify dependencies installed correctly

**Cache misses:**
- Check cache key hash values
- Verify cache paths are correct
- Review cache expiration (7-day limit)

**Permission errors:**
- Verify workflow permissions section
- Check GITHUB_TOKEN permissions
- Verify secrets are set correctly

---

## Related Documentation

- [BUILD.md](../BUILD.md) - Complete build instructions
- [DEPLOYMENT.md](../DEPLOYMENT.md) - Deployment guide
- [COPILOT_SETUP.md](COPILOT_SETUP.md) - Copilot environment setup details
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Workflow Syntax Reference](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)
