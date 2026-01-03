# CI/CD Reliability Guide

This guide documents the CI/CD architecture patterns for 9Boxer, ensuring consistency between local development and CI environments.

---

## Overview: Makefile as Single Source of Truth

The 9Boxer CI/CD system follows a **Makefile-centric architecture** where the Makefile serves as the single source of truth for all code quality checks.

```
                    +------------------+
                    |     Makefile     |
                    |  (Source of Truth)|
                    +--------+---------+
                             |
         +-------------------+-------------------+
         |                   |                   |
         v                   v                   v
+----------------+  +----------------+  +----------------+
|  Pre-commit    |  |   Pre-push     |  |  CI Workflows  |
|    Hooks       |  |    Hooks       |  | (.github/      |
| (.pre-commit-  |  | (wrapper       |  |  workflows/)   |
|  config.yaml)  |  |  scripts)      |  |                |
+----------------+  +----------------+  +----------------+
```

### Why This Matters

1. **Version Drift Prevention** - Same commands run locally and in CI
2. **Consistency** - Developer experience matches CI failures
3. **Maintainability** - Update one place, changes propagate everywhere
4. **Reproducibility** - `make check-all` locally reproduces CI checks

### Current Make Targets

| Target | Purpose | CI Workflow |
|--------|---------|-------------|
| `make lint` | Run ruff linting | pr.yml, ci.yml |
| `make format-check` | Check code formatting | pr.yml |
| `make type-check` | Run mypy type checking | pr.yml, ci.yml |
| `make security` | Run bandit security scan | pr.yml, ci.yml |
| `make check-yaml` | Validate YAML syntax | pr.yml, ci.yml |
| `make test` | Run pytest | pr.yml, ci.yml |
| `make check-all` | Run all checks (format, lint, type, security, test) | - |
| `make fix` | Auto-fix linting and formatting issues | - |

---

## Adding New Checks

Follow this step-by-step process when adding a new code quality check:

### Step 1: Add Make Target to Makefile

Add the new target to `/workspaces/9boxer/Makefile`:

```makefile
new-check:  ## Description of what this check does
	your-tool-command --with-flags
```

**Requirements:**
- Add `new-check` to `.PHONY` declaration at top of file
- Include `## Description` for `make help` output
- Use actual tool commands, not wrapper scripts

### Step 2: Create Wrapper Script (Optional)

For pre-commit/pre-push hooks that need enhanced error messaging, create a wrapper script in `/workspaces/9boxer/tools/`:

```bash
#!/bin/bash
# tools/run-new-check.sh
# Wrapper for running new-check with clearer error messages

echo ""
echo "================================================================"
echo "  Running New Check"
echo "================================================================"
echo ""

# Run the actual check
make new-check

CHECK_EXIT_CODE=$?

if [ $CHECK_EXIT_CODE -ne 0 ]; then
    echo ""
    echo "================================================================"
    echo "  ❌ PUSH BLOCKED: New check failed!"
    echo "================================================================"
    echo ""
    echo "  To run this check locally:"
    echo "    make new-check"
    echo ""
    echo "  To skip this check (not recommended):"
    echo "    git push --no-verify"
    echo ""
    echo "================================================================"
    exit $CHECK_EXIT_CODE
fi

echo ""
echo "✅ New check passed!"
echo ""
exit 0
```

### Step 3: Add Hook to .pre-commit-config.yaml

Add the hook to `/workspaces/9boxer/.pre-commit-config.yaml`:

```yaml
  - repo: local
    hooks:
      - id: new-check
        name: description of new check
        entry: bash tools/run-new-check.sh
        language: system
        files: ^pattern/to/match/.*\.ext$
        pass_filenames: false  # or true if check needs file list
        stages: [pre-commit]   # or [pre-push] for longer checks
        verbose: true
```

**Stage Guidelines:**
- `pre-commit` - Fast checks (<5 seconds)
- `pre-push` - Slower checks (tests, bundle size)

### Step 4: Add Step to Workflows

Add the check to relevant workflow files:

**For PR validation** (`/workspaces/9boxer/.github/workflows/pr.yml`):
```yaml
      - name: Run new check
        run: make new-check
```

**For CI** (`/workspaces/9boxer/.github/workflows/ci.yml`):
```yaml
      - name: Run new check (via pre-commit)
        run: pre-commit run new-check --all-files
```

### Step 5: Verify Integration

```bash
# Test locally
make new-check

# Test pre-commit hook
pre-commit run new-check --all-files

# Test full check suite
make check-all
```

---

## Wrapper Script Pattern

### Template

All wrapper scripts in `tools/` follow this pattern:

```bash
#!/bin/bash
# tools/run-<check-name>.sh
# Wrapper for running <check-name> with clearer error messages
#
# PURPOSE: [Brief description of what this check validates]
# USAGE: Called by pre-commit hook or manually via `bash tools/run-<check-name>.sh`
# EXIT CODES: 0 = success, non-zero = check failed

echo ""
echo "================================================================"
echo "  Running <Check Name> (estimated time: ~X seconds)"
echo "================================================================"
echo ""

# Change to appropriate directory if needed
cd frontend || exit 1

# Run the actual check command
npm run <command>

CHECK_EXIT_CODE=$?

if [ $CHECK_EXIT_CODE -ne 0 ]; then
    echo ""
    echo "================================================================"
    echo "  ❌ <STAGE> BLOCKED: <Check Name> failed!"
    echo "================================================================"
    echo ""
    echo "  <Specific guidance about what failed>"
    echo ""
    echo "  To run this check locally:"
    echo "    <exact command to reproduce>"
    echo ""
    echo "  To skip this check (not recommended):"
    echo "    git <commit/push> --no-verify"
    echo ""
    echo "================================================================"
    exit $CHECK_EXIT_CODE
fi

echo ""
echo "✅ <Check Name> passed!"
echo ""
exit 0
```

### Requirements

1. **Clear Header** - Purpose, usage, and exit codes documented
2. **Visual Separators** - `====` lines for readability
3. **Error Messages** - Explain what failed and why
4. **Remediation Hints** - Exact commands to fix or reproduce locally
5. **Skip Instructions** - How to bypass (with warning)

### Existing Wrapper Scripts

| Script | Purpose | Stage |
|--------|---------|-------|
| `tools/hooks/run-lint.sh` | Lint checks (ruff) | pre-commit |
| `tools/hooks/run-format-check.sh` | Format checks (ruff) | pre-commit |
| `tools/hooks/run-type-check.sh` | Type checks (mypy) | pre-commit |
| `tools/hooks/run-security.sh` | Security scan (bandit) | pre-commit |
| `tools/run-tests-with-message.sh` | Frontend unit tests | pre-push |
| `tools/run-bundle-check-with-message.sh` | Bundle size check | pre-push |
| `tools/run-prettier.sh` | Prettier formatting | pre-commit |
| `tools/generate-docs-tokens-hook.sh` | Design token generation | pre-commit |

---

## Environment Setup Actions

### Composite Actions

The project uses composite GitHub Actions for standardized environment setup:

| Action | Location | Purpose |
|--------|----------|---------|
| `setup-python-env` | `.github/actions/setup-python-env/` | Python + uv setup |
| `setup-frontend-env` | `.github/actions/setup-frontend-env/` | Node.js + npm + Playwright setup |

### setup-python-env

Use for jobs requiring Python:

```yaml
- uses: ./.github/actions/setup-python-env
  with:
    python-version: '3.13'  # optional, defaults to 3.13
    install-command: "uv pip install --system -e '.[dev]'"  # optional, customize install
```

**What it does:**
1. Sets up Python (specified version)
2. Caches uv packages
3. Installs uv package manager
4. Installs project dependencies (customizable via `install-command`)

### setup-frontend-env

Use for jobs requiring Node.js/frontend:

```yaml
- uses: ./.github/actions/setup-frontend-env
  with:
    node-version: '20'  # optional, defaults to 20
    working-directory: 'frontend'  # optional, defaults to frontend
    skip-npm-install: 'false'  # optional, skip npm ci
    skip-playwright-install: 'true'  # optional, skip browser install
    playwright-browsers: 'chromium'  # optional, browsers to install
```

**What it does:**
1. Sets up Node.js (specified version) with npm caching
2. Caches node_modules
3. Installs npm dependencies (`npm ci --legacy-peer-deps`)
4. Optionally caches and installs Playwright browsers

### Manual Setup (When Actions Not Suitable)

For full-stack jobs requiring both Python and Node:

```yaml
# Python setup
- uses: actions/setup-python@v5
  with:
    python-version: '3.13'

- name: Cache uv
  uses: actions/cache@v4
  with:
    path: |
      ~/.cache/uv
      ~/AppData/Local/uv/cache
    key: ${{ runner.os }}-uv-${{ hashFiles('pyproject.toml') }}
    restore-keys: |
      ${{ runner.os }}-uv-

- name: Install Python dependencies
  run: |
    pip install uv
    uv pip install --system -e '.[dev]'

# Node setup
- uses: actions/setup-node@v4
  with:
    node-version: '20'
    cache: 'npm'
    cache-dependency-path: frontend/package-lock.json

- name: Install frontend dependencies
  working-directory: frontend
  run: npm ci --legacy-peer-deps
```

### Version Standards

| Tool | Version | Notes |
|------|---------|-------|
| Python | 3.13 | Specified in pyproject.toml |
| Node.js | 20 | LTS version |
| uv | latest | Installed via pip |

### Cache Key Conventions

| Cache Type | Key Pattern |
|------------|-------------|
| uv packages | `${{ runner.os }}-uv-${{ hashFiles('pyproject.toml') }}` |
| npm packages | Built-in with setup-node cache |
| pre-commit | `pre-commit-${{ runner.os }}-${{ hashFiles('.pre-commit-config.yaml') }}` |
| ruff | `${{ runner.os }}-ruff-${{ hashFiles('backend/src/**/*.py', 'pyproject.toml') }}` |
| mypy | `${{ runner.os }}-mypy-${{ hashFiles('backend/src/**/*.py') }}` |
| pytest | `pytest-cache-${{ runner.os }}-3.13-${{ hashFiles('backend/tests/**/*.py') }}` |
| Playwright | `${{ runner.os }}-playwright-${{ hashFiles('frontend/package-lock.json') }}` |
| node_modules | `node-modules-${{ runner.os }}-${{ hashFiles('frontend/package-lock.json') }}` |

---

## Troubleshooting Guide

### "Works locally, fails in CI"

**Symptoms:** Tests or checks pass on your machine but fail in GitHub Actions.

**Root Causes & Solutions:**

| Cause | Solution |
|-------|----------|
| Different command being run | Verify CI uses same make target: `make <target>` |
| Missing environment setup | Check CI job has all required setup steps |
| Cache staleness | Clear caches by incrementing cache key version |
| OS differences | CI runs on Windows; check for path separators (`/` vs `\`) |
| Timing issues | Add explicit waits in E2E tests; avoid arbitrary timeouts |

**Reproduce CI locally:**
```bash
# Run exact CI check sequence
make check-all

# Or run individual checks
make lint
make type-check
make security
make test
```

### Cache Misses

**Symptoms:** CI taking longer than expected; "Cache not found" messages.

**Debugging:**
1. Check cache key hash inputs exist and are correct
2. Verify `restore-keys` fallback patterns
3. Look for path differences (Unix vs Windows paths)

**Solution patterns:**
```yaml
# Add version suffix to force cache invalidation
key: ${{ runner.os }}-uv-v2-${{ hashFiles('pyproject.toml') }}

# Use multiple restore-keys for better hit rate
restore-keys: |
  ${{ runner.os }}-uv-v2-
  ${{ runner.os }}-uv-
```

### Pre-commit Failures

**Symptoms:** `git commit` or `git push` rejected by hooks.

**Quick fixes:**
```bash
# See what would fail
pre-commit run --all-files

# Run specific hook
pre-commit run ruff --all-files

# Reproduce full CI check suite
make check-all

# Auto-fix formatting issues
make fix

# Skip hooks (use sparingly)
git commit --no-verify
git push --no-verify
```

### Common Failure Patterns

| Pattern | Cause | Solution |
|---------|-------|----------|
| `ruff check` fails | Linting errors | Run `make fix` or fix manually |
| `ruff format` fails | Formatting issues | Run `make format` |
| `mypy` type errors | Type annotations | Fix type hints or add `# type: ignore` |
| `bandit` security | Security issues | Review and fix or configure skip in pyproject.toml |
| E2E flaky tests | Timing issues | Use state-based waits, not timeouts |
| Bundle size exceeded | Large dependencies | Review imports; consider code splitting |

### Workflow-Specific Issues

**PR workflow (`pr.yml`):**
- Runs comprehensive tests (unit, integration, performance)
- Enforces 80% coverage on changed files
- Code complexity check is blocking

**CI workflow (`ci.yml`):**
- Runs on push to main/develop
- Lint failures are warnings (non-blocking)
- Faster feedback than PR workflow

**When CI succeeds but PR fails:**
- PR has additional checks (integration, performance, code complexity)
- PR enforces coverage on changed files

---

## Success Metrics

### What to Track

| Metric | Description | Target |
|--------|-------------|--------|
| CI Pass Rate | % of CI runs that succeed | >95% |
| Average CI Duration | Time from push to completion | <10 min |
| Cache Hit Rate | % of cache hits vs misses | >80% |
| Flaky Test Rate | % of tests that fail intermittently | <1% |
| Time to First Failure | How quickly CI identifies issues | <3 min |

### Current Targets

| Workflow | Target Duration | Current |
|----------|-----------------|---------|
| pr.yml (full) | <15 min | ~12 min |
| ci.yml (fast) | <10 min | ~8 min |
| Pre-commit hooks | <30 sec | ~15 sec |
| Pre-push hooks | <60 sec | ~45 sec |

### Monitoring

Track CI health via:
1. GitHub Actions workflow run history
2. Branch protection status checks
3. Weekly CI reliability review (manual)

---

## Quick Reference

### Commands

```bash
# Run all checks locally (same as CI)
make check-all

# Auto-fix issues
make fix

# Run specific checks
make lint
make format-check
make type-check
make security
make test

# Pre-commit hooks
pre-commit run --all-files
pre-commit run <hook-id> --all-files

# Frontend checks
cd frontend && npm run lint
cd frontend && npm run test:run
cd frontend && npm run check:bundle
```

### File Locations

| File | Purpose |
|------|---------|
| `Makefile` | Single source of truth for checks |
| `.pre-commit-config.yaml` | Pre-commit hook configuration |
| `.github/workflows/pr.yml` | PR validation workflow |
| `.github/workflows/ci.yml` | Post-merge CI workflow |
| `.github/actions/setup-python-env/` | Reusable Python setup |
| `.github/actions/setup-frontend-env/` | Reusable Node.js/frontend setup |
| `tools/hooks/*.sh` | Wrapper scripts for pre-commit hooks |
| `tools/*.sh` | Other wrapper scripts |
| `pyproject.toml` | Python tool configurations (ruff, mypy, bandit) |

---

## Related Documentation

- **[Makefile](../../Makefile)** - All make targets
- **[.pre-commit-config.yaml](../../.pre-commit-config.yaml)** - Hook definitions
- **[pr.yml](../../.github/workflows/pr.yml)** - PR workflow
- **[ci.yml](../../.github/workflows/ci.yml)** - CI workflow
- **[testing/README.md](../testing/README.md)** - Testing documentation
- **[AGENTS.md](../../AGENTS.md)** - Developer command reference

---

*Last Updated: January 2025*
*Maintained by: 9Boxer Development Team*
