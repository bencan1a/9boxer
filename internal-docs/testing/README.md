# Testing Documentation

This directory contains comprehensive testing guidance, templates, and best practices for the 9Boxer project.

## Overview

9Boxer uses multiple testing frameworks to ensure code quality:

- **Backend**: pytest for Python/FastAPI testing
- **Frontend Component Tests**: Vitest + React Testing Library
- **Frontend E2E Tests**: Playwright for end-to-end workflows
  - **e2e-core suite**: Atomic UX validation with state-based waits (23 tests, 0 flakiness)
  - Replaces comprehensive e2e suite with focused, reliable tests

**Scope Note:** This documentation covers internal developer testing (backend, frontend components, E2E application tests). User-facing documentation is maintained separately in `user-docs/` using VitePress with its own validation workflow.

## Documentation Files

### Core Principles

**[test-principles.md](test-principles.md)** - Fundamental testing philosophy and best practices
- The Four Pillars: Simple, Isolated, Reliable, Integration-Focused
- Test naming conventions
- Arrange-Act-Assert structure
- What to test (and what not to test)
- Mocking guidelines
- Coverage guidelines
- Debugging strategies

**Read this first** to understand the project's testing philosophy.

### Quick Reference

**[quick-reference.md](quick-reference.md)** - Fast lookup for common patterns
- Running tests (all frameworks)
- Common test patterns (backend, frontend, E2E)
- Common assertions
- Test data & fixtures
- Troubleshooting guide
- Performance targets

**Use this** when you need to quickly find a specific command or pattern.

### Testing Checklist

**[testing-checklist.md](testing-checklist.md)** - Comprehensive pre-commit checklist
- Before writing tests
- Writing tests (structure, naming, data)
- Backend tests (pytest)
- Frontend tests (Vitest)
- E2E tests (Playwright)
- Before committing
- Common mistakes to avoid

**Follow this** when writing new tests to ensure completeness.

### Playwright Architecture & Best Practices

**[PLAYWRIGHT_REVIEW_SUMMARY.md](PLAYWRIGHT_REVIEW_SUMMARY.md)** - Executive summary and action items
- Current test suite health scorecard (7/10)
- Immediate fixes for 5 failing tests (~20 min)
- Week 1 improvements (config, helpers, test splitting)
- Long-term best practices and principles

**Start here** for Playwright-specific guidance and quick wins.

**[playwright-architecture-review.md](playwright-architecture-review.md)** - Comprehensive architectural analysis
- Detailed analysis of test design patterns
- Anti-patterns to avoid (with code examples)
- Async handling best practices
- Helper function design guidelines
- Configuration recommendations
- Before/after refactoring examples

**Reference this** for deep understanding of Playwright testing patterns.

**[playwright-best-practices-checklist.md](playwright-best-practices-checklist.md)** - Quick reference for daily use
- Pre-commit checklist
- Test design decision tree
- Selector strategy guide
- Common failure patterns and fixes
- Debugging checklist

**Use this** as your daily Playwright testing companion.

### Visual Regression Testing

**[frontend/playwright/visual-regression/README.md](../../frontend/playwright/visual-regression/README.md)** - Documentation screenshot quality validation

Documentation screenshots are automatically validated using visual regression testing to ensure quality and catch unintended changes:

- **Baseline comparison** - Screenshots compared against approved baselines (5% pixel difference tolerance)
- **Dimension validation** - Ensures screenshots meet expected size constraints
- **Metadata validation** - Verifies all required configuration is present
- **CI integration** - Runs automatically on PRs affecting frontend components

**Running visual regression tests:**
```bash
cd frontend

# Run all documentation visual regression tests
npm run test:docs-visual

# Run with UI mode (recommended for debugging)
npm run test:docs-visual:ui

# Update baselines (after approving visual changes)
npm run test:docs-visual:update
```

**When to update baselines:**
- ✅ After intentionally changing component UI
- ✅ After approved design changes
- ✅ When fixing design inconsistencies
- ❌ Never when tests fail unexpectedly
- ❌ Never without reviewing the visual diff

**Workflow:**
1. Developer changes component → Change detected (Phase 2.2)
2. Affected screenshots regenerated → Visual regression tests run (Phase 3.1)
3. Differences highlighted in report → Review and approve/fix
4. Documentation PR created with validated screenshots

See the [complete guide](../../frontend/playwright/visual-regression/README.md) for troubleshooting, best practices, and CI integration details.

## Test Templates

The [templates/](templates/) directory contains starter templates for all test types:

### Backend Tests

**[backend-test-template.py](templates/backend-test-template.py)** - Pytest template
- Complete pytest test file structure
- Fixtures and test data setup
- Unit test examples
- Service/business logic tests
- API endpoint tests
- Error handling tests
- Common patterns and best practices

Location for actual tests: `backend/tests/test_module/test_feature.py`

### Component Tests

**[component-test-template.tsx](templates/component-test-template.tsx)** - Vitest + RTL template
- React Testing Library setup
- Component rendering tests
- User interaction tests
- Async behavior tests
- Edge case handling
- Common patterns

Location for actual tests: `frontend/src/components/__tests__/ComponentName.test.tsx`

### E2E Tests

**[e2e-test-template.spec.ts](templates/e2e-test-template.spec.ts)** - Playwright template
- Playwright test structure
- Complete workflow tests
- Error handling tests
- Data persistence tests
- Multi-step workflows
- Common patterns and helpers

Location for actual tests: `frontend/playwright/e2e/feature-flow.spec.ts`

## Quick Start

### For New Tests

1. **Choose the right test type**:
   - Testing a single function? → Unit test (pytest or Vitest)
   - Testing multiple components working together? → Integration test
   - Testing complete user workflow? → E2E test (Playwright)

2. **Copy the appropriate template**:
   ```bash
   # Backend
   cp docs/testing/templates/backend-test-template.py backend/tests/test_module/test_feature.py

   # Component
   cp docs/testing/templates/component-test-template.tsx frontend/src/components/__tests__/MyComponent.test.tsx

   # E2E
   cp docs/testing/templates/e2e-test-template.spec.ts frontend/playwright/e2e/my-workflow.spec.ts
   ```

3. **Follow the naming convention**:
   - Pattern: `test_<what>_when_<condition>_then_<expected>`
   - Example: `test_move_employee_when_valid_position_then_updates_grid_position`

4. **Run the checklist** ([testing-checklist.md](testing-checklist.md)) before committing

### Running Tests

```bash
# Backend (from project root)
. .venv/bin/activate  # or .venv\Scripts\activate on Windows
pytest

# Frontend Component Tests (from frontend directory)
npm test

# E2E Core Tests - Atomic UX validation (RECOMMENDED)
cd frontend
npm run test:e2e:pw -- --project=e2e-core

# E2E Core Tests with UI (for debugging)
npm run test:e2e:pw:ui -- --project=e2e-core

# All E2E tests
npm run test:e2e:pw
```

## CI/CD Integration

The 9Boxer project uses a **Makefile-centric architecture** where the Makefile serves as the single source of truth for all code quality checks, ensuring consistency between local development and CI environments.

### Why This Matters

- **Version Drift Prevention** - Same commands run locally and in CI
- **Consistency** - Developer experience matches CI failures
- **Maintainability** - Update one place, changes propagate everywhere
- **Reproducibility** - `make check-all` locally reproduces CI checks

### Make Targets for Testing

| Target | Purpose | Use Case |
|--------|---------|----------|
| `make test` | Run pytest | Backend tests |
| `make lint` | Run ruff linting | Code quality |
| `make format-check` | Check code formatting | Pre-commit validation |
| `make type-check` | Run mypy type checking | Static analysis |
| `make security` | Run bandit security scan | Security validation |
| `make check-all` | Run all checks (format, lint, type, security, test) | Local CI reproduction |
| `make fix` | Auto-fix linting and formatting issues | Quick fixes |

### Pre-commit Hooks

All commits must pass pre-commit hooks (same checks as CI):

```bash
# From project root
. .venv/bin/activate

# Run pre-commit checks on files you're committing
pre-commit run --files <file1> <file2> ...

# Or run on all files (comprehensive)
pre-commit run --all-files

# If checks pass, proceed with commit
git add <files>
git commit -m "message"
```

**What pre-commit checks:**
- Ruff format & lint (Python)
- Mypy & Pyright type checking (Python)
- Bandit security scan (Python)
- ESLint & Prettier (TypeScript/JavaScript)
- Doc size validation (CLAUDE_INDEX.md, AGENTS.md, GITHUB_AGENT.md)
- i18n translation validation

### Troubleshooting CI Failures

**"Works locally, fails in CI"**

| Cause | Solution |
|-------|----------|
| Different command being run | Verify CI uses same make target: `make <target>` |
| Missing environment setup | Check CI job has all required setup steps |
| Cache staleness | Clear caches by incrementing cache key version |
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

**Pre-commit failures:**
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

### CI Workflows

**pr.yml (PR validation):**
- Runs comprehensive tests (unit, integration, performance)
- Enforces 80% coverage on changed files
- Code complexity check is blocking

**ci.yml (Post-merge CI):**
- Runs on push to main/develop
- Lint failures are warnings (non-blocking)
- Faster feedback than PR workflow

### Key Files

| File | Purpose |
|------|---------|
| `Makefile` | Single source of truth for checks |
| `.pre-commit-config.yaml` | Pre-commit hook configuration |
| `.github/workflows/pr.yml` | PR validation workflow |
| `.github/workflows/ci.yml` | Post-merge CI workflow |
| `tools/hooks/*.sh` | Wrapper scripts for pre-commit hooks |
| `pyproject.toml` | Python tool configurations (ruff, mypy, bandit) |

**See also:** [AGENTS.md](../../AGENTS.md) for complete developer command reference

## Key Testing Principles

1. **Simple** - No conditional logic in tests
2. **Isolated** - Each test is independent
3. **Reliable** - Deterministic results every time (use state-based waits in E2E)
4. **Behavior-focused** - Test what users see, not implementation details
5. **Integration-first** - Prefer integration tests over unit tests when practical
6. **State-based waits** - NO arbitrary timeouts; wait for observable state changes (E2E tests)

## Coverage Goals

| Category | Target | Notes |
|----------|--------|-------|
| Services | 90%+ | Core business logic |
| API Endpoints | 80%+ | Request/response handling |
| Utilities | 80%+ | Helper functions |
| Overall | 75%+ | Project-wide target |

## Parallel Test Execution

The backend uses **pytest-xdist** for parallel test execution to speed up test runs.

### Configuration

Pytest is configured in `pyproject.toml` to run tests in parallel:

```toml
[tool.pytest.ini_options]
addopts = """
    -n 4                  # Run with 4 worker processes
    --dist=loadscope      # Distribute tests by test scope
    --cov=backend/src     # Coverage collection
"""
```

### How It Works

- **Workers:** Tests run across 4 parallel processes
- **Distribution:** `loadscope` groups tests by scope (class, module) to minimize overhead
- **Coverage:** Coverage data is automatically combined from all workers
- **Isolation:** Each worker gets its own database file (`test_db_{worker_id}.sqlite`)

### Performance Impact

| Test Suite | Sequential | Parallel (4 workers) | Speedup |
|------------|-----------|---------------------|---------|
| Unit tests | ~60s | ~20s | 3x |
| Integration tests | ~120s | ~40s | 3x |
| Full suite | ~300s | ~90s | 3.3x |

### Tradeoffs

**Advantages:**
- ✅ Faster feedback (3x speedup)
- ✅ Better CI utilization
- ✅ Encourages writing more tests

**Considerations:**
- ⚠️ Slightly higher complexity (worker coordination)
- ⚠️ Tests must be truly isolated (no shared state)
- ⚠️ Coverage collection requires combination step

### Troubleshooting

**If tests fail only in parallel:**
- Check for shared state between tests (global variables, file system, database)
- Verify fixtures properly handle worker isolation
- Use `pytest -n 0` to disable parallel execution for debugging

**If coverage seems incorrect:**
- Coverage data is automatically combined by pytest-cov
- Verify `.coverage` file includes data from all workers
- Check that `--cov-report` flags are set in `pyproject.toml`

**Performance tests run sequentially:**
Performance tests in `backend/tests/performance/` automatically disable xdist to ensure accurate benchmarking. See `backend/tests/performance/conftest.py` for implementation.

## Additional Resources

- **.github/agents/test.md** - Backend testing strategies (agent profile)
- **[CLAUDE_INDEX.md](../../CLAUDE_INDEX.md)** - Project-wide testing commands and architecture
- **[pytest documentation](https://docs.pytest.org/)** - Official pytest docs
- **[React Testing Library](https://testing-library.com/react)** - RTL docs
- **[Playwright documentation](https://playwright.dev/)** - Playwright docs

## Contributing

When adding new testing patterns or guidance:

1. Update the relevant documentation file
2. Add examples that follow the project conventions
3. Ensure consistency across all three frameworks
4. Update this README if adding new files

## Questions?

- Can't find the right assertion? Check [quick-reference.md](quick-reference.md)
- Unsure about test structure? See [test-principles.md](test-principles.md)
- Need to verify completeness? Use [testing-checklist.md](testing-checklist.md)
- Need a starting point? Copy from [templates/](templates/)

**Remember**: Good tests are an investment in reliability and maintainability. Take time to write them well!
