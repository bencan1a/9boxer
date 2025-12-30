# Test Suite Metrics

**Status**: Active (Baseline Established)
**Last Updated**: 2025-12-29
**Owner**: Test Architect

This document tracks test suite health metrics over time to measure improvement and detect regression.

---

## Table of Contents

1. [Current State (Baseline)](#current-state-baseline)
2. [Targets (Ideal State)](#targets-ideal-state)
3. [Metrics Definitions](#metrics-definitions)
4. [Historical Trends](#historical-trends)
5. [Action Items](#action-items)

---

## Current State (Baseline)

**Date**: 2025-12-29

### Test Inventory

| Category | Count | Percentage | Target | Status |
|----------|-------|------------|--------|--------|
| **Backend Unit** | 504 | 79% | 70% | ✅ OVER (good!) |
| **Backend Integration** | 86 | 13% | 20% | ⚠️ UNDER (-34 tests) |
| **Backend E2E** | ~16 | 3% | 5% | ⚠️ UNDER (-15 tests) |
| **Backend Performance** | ~26 | 4% | Separate job | ⚠️ Move to weekly CI |
| **Frontend Component** | ~120 (59 files) | N/A | N/A | ✅ Good coverage |
| **Frontend E2E (Playwright)** | 21 workflows | 3% | 5% | ⚠️ UNDER (need edge cases) |
| **TOTAL** | 637 tests | 100% | 600 | ✅ Within range |

**Key Findings**:
- ✅ Strong unit test coverage (79% vs 70% target)
- ⚠️ **Gap**: Need +34 integration tests (cross-module workflows)
- ⚠️ **Gap**: Need +15 E2E tests (error paths, edge cases)
- ⚠️ Performance tests slow down CI (move to separate job)

### Execution Time Metrics

| Test Suite | Current | Target | Status |
|------------|---------|--------|--------|
| **Backend Unit** | ~25-35s | <30s | ✅ PASS |
| **Backend Integration** | ~45-60s | <3min | ✅ PASS |
| **Backend E2E** | ~2-3min | <3min | ✅ PASS |
| **Backend Performance** | ~1-2min | <2min | ✅ PASS (but blocking CI) |
| **Frontend Component** | ~15-25s | <30s | ✅ PASS |
| **Frontend E2E (Playwright)** | ~3-5min | <5min | ✅ PASS |
| **TOTAL (Fast)** | <60s | <60s | ✅ PASS |
| **TOTAL (Comprehensive)** | ~8-10min | <10min | ✅ PASS |

**Key Findings**:
- ✅ All test suites meet performance budgets
- ✅ Fast tests (<60s) for pre-commit hooks
- ✅ Comprehensive tests (<10min) for CI
- ⚠️ Performance tests add 2min overhead (move to separate job)

### Coverage Metrics

| Area | Current | Target | Status |
|------|---------|--------|--------|
| **Backend Overall** | ~85% | 80%+ | ✅ PASS |
| **Backend Services** | ~90% | 90%+ | ✅ PASS |
| **Backend API Endpoints** | ~85% | 85%+ | ✅ PASS |
| **Frontend Overall** | ~75% | 80%+ | ⚠️ UNDER (-5%) |
| **Frontend Components** | ~80% | 80%+ | ✅ PASS |
| **Frontend Hooks** | ~70% | 85%+ | ⚠️ UNDER (-15%) |
| **Critical Paths (E2E)** | ~80% | 100% | ⚠️ UNDER (missing error paths) |

**Key Findings**:
- ✅ Backend coverage excellent (85%+)
- ⚠️ **Gap**: Frontend hooks under-tested (70% vs 85% target)
- ⚠️ **Gap**: Critical path E2E coverage incomplete (missing error scenarios)

### Anti-Pattern Density

**Methodology**: Manual code review of sample test files (10% of test suite)

| Anti-Pattern | Instances Found | Severity | Status |
|--------------|-----------------|----------|--------|
| **Hardcoded employee names** | ~15 in E2E tests | High | ⚠️ Needs refactoring |
| **Hardcoded text strings** | ~30 in component tests | Medium | ⚠️ Needs `data-testid` |
| **Hardcoded counts** | ~10 in E2E tests | Medium | ⚠️ Brittle assertions |
| **Arbitrary timeouts** | ~5 in E2E tests | Low | ⚠️ Replace with event waits |
| **Over-mocking (business logic)** | ~3 in unit tests | Medium | ⚠️ Use real implementations |
| **No `data-testid`** | ~20 components | Medium | ⚠️ Add missing test IDs |

**Estimated Total** (extrapolating to full suite):
- **Hardcoded names**: ~150 instances across E2E tests
- **Hardcoded strings**: ~300 instances across component tests
- **Total anti-pattern instances**: ~500+

**Key Findings**:
- ⚠️ **High**: Hardcoded employee names in E2E tests (fragile to fixture changes)
- ⚠️ **Medium**: Missing `data-testid` attributes (rely on text content)
- ⚠️ **Low**: Few arbitrary timeouts (good use of event-driven waits)

---

## Targets (Ideal State)

### Test Distribution Targets

```
Target: 600 tests total (70/20/10 pyramid)

Backend:
- Unit: 300 tests (70%)
- Integration: 100 tests (20%)
- E2E: 30 tests (5%)
- Performance: Separate CI job (weekly)

Frontend:
- Component: 120 tests (20%)
- E2E: 30 workflows (5%)

Total: 580 tests (within acceptable range)
```

### Execution Time Targets

| Tier | Target | Max | Current | Status |
|------|--------|-----|---------|--------|
| **Fast (pre-commit)** | <45s | <60s | ~50s | ✅ PASS |
| **Comprehensive (CI)** | <8min | <10min | ~8min | ✅ PASS |

**Per-Test Targets**:
- Backend unit: <0.1s each (currently ~0.05s) ✅
- Frontend component: <0.2s each (currently ~0.15s) ✅
- Backend integration: <2s each (currently ~0.7s) ✅
- E2E: <15s each (currently ~14s) ✅

### Coverage Targets

| Area | Target | Enforcement |
|------|--------|-------------|
| Backend Services | 90%+ | CI fail if <90% |
| Backend API Endpoints | 85%+ | CI fail if <85% |
| Frontend Components | 80%+ | CI fail if <80% |
| Frontend Hooks | 85%+ | CI fail if <85% |
| Critical Paths | 100% | Manual verification |
| **Overall** | **80%+** | **CI fail if <80%** |

### Anti-Pattern Targets

| Anti-Pattern | Target | Current | Gap |
|--------------|--------|---------|-----|
| Hardcoded names | 0 | ~150 | -150 |
| Hardcoded strings | <10 | ~300 | -290 |
| Arbitrary timeouts | 0 | ~5 | -5 |
| Over-mocking | 0 | ~3 | -3 |
| Missing `data-testid` | 0 | ~20 | -20 |

---

## Metrics Definitions

### Test Inventory Metrics

**Definition**: Count of tests by category (unit, integration, E2E, performance).

**Collection Method**:
```bash
# Backend
pytest --collect-only -q tests/unit | grep -c "test_"
pytest --collect-only -q tests/integration | grep -c "test_"
pytest --collect-only -q tests/e2e | grep -c "test_"

# Frontend
find frontend/src -name "*.test.tsx" | wc -l
find frontend/playwright/e2e -name "*.spec.ts" | wc -l
```

**Frequency**: Weekly (automated via GitHub Actions)

---

### Execution Time Metrics

**Definition**: Wall-clock time for test suite execution.

**Collection Method**:
```bash
# Fast tests (pre-commit)
time (pytest tests/unit -q && cd frontend && npm run test:run)

# Comprehensive tests (CI)
time (pytest && cd frontend && npm run test:run && npm run test:e2e:pw)
```

**Frequency**: Every CI run (tracked in CI logs)

**Alerting**: Fail CI if comprehensive tests >10min

---

### Coverage Metrics

**Definition**: Line coverage percentage by area.

**Collection Method**:
```bash
# Backend
pytest --cov=backend/src --cov-report=json
cat coverage.json | jq '.totals.percent_covered'

# Frontend
npm run test:coverage -- --reporter=json
cat coverage-final.json | jq '.total.lines.pct'
```

**Frequency**: Every CI run

**Alerting**:
- Fail CI if overall coverage <80%
- Fail CI if changed files coverage <70%

---

### Anti-Pattern Density

**Definition**: Count of anti-pattern instances in test code.

**Collection Method**: Manual code review (10% sample) + grep patterns

**Grep Patterns**:
```bash
# Hardcoded employee names
grep -r '"Alice Smith"' tests/
grep -r '"Bob Johnson"' tests/

# Hardcoded text assertions
grep -r 'getByText(' frontend/src/**/*.test.tsx

# Arbitrary timeouts
grep -r 'setTimeout' tests/
grep -r 'sleep(' tests/

# Missing data-testid
grep -rL 'data-testid' frontend/src/components/**/*.tsx
```

**Frequency**: Weekly (manual review) + automated grep in CI

---

## Historical Trends

### Week-over-Week Changes

| Metric | 2025-12-22 | 2025-12-29 | Change | Trend |
|--------|------------|------------|--------|-------|
| Total Tests | 625 | 637 | +12 | ⬆️ |
| Backend Unit | 495 | 504 | +9 | ⬆️ |
| Backend Integration | 84 | 86 | +2 | ⬆️ |
| E2E Tests | 21 | 21 | 0 | ➡️ |
| Execution Time (Fast) | 52s | 50s | -2s | ⬇️ Good! |
| Execution Time (Full) | 9.2min | 8.5min | -0.7min | ⬇️ Good! |
| Backend Coverage | 84% | 85% | +1% | ⬆️ |
| Frontend Coverage | 74% | 75% | +1% | ⬆️ |

**Analysis**:
- ✅ Test count growing steadily (+12 tests/week)
- ✅ Execution time decreasing (optimization efforts working)
- ✅ Coverage improving (+1% backend, +1% frontend)
- ⚠️ E2E test count stagnant (need to prioritize)

---

## Action Items

Based on gap analysis, prioritized work items:

### Critical Priority (Week 1-2)

1. **Add 34 integration tests** for cross-module workflows
   - Session → Employees → Statistics integration
   - Upload → Parse → Grid → Export workflow
   - Filters → Intelligence → Insights pipeline
   - **Estimated effort**: 8-12 hours

2. **Add 15 E2E tests** for error paths and edge cases
   - Invalid file upload error handling
   - Network failure scenarios
   - Export failure handling (disk full, permissions)
   - Large dataset edge cases (1000+ employees)
   - **Estimated effort**: 6-8 hours

3. **Move performance tests** to separate CI job
   - Create `.github/workflows/performance.yml`
   - Schedule weekly (Mondays 2 AM UTC)
   - Remove from main CI pipeline
   - **Estimated effort**: 2 hours

### High Priority (Week 2-4)

4. **Refactor E2E tests** to remove hardcoded employee names
   - Replace `expect(page.getByText("Alice Smith"))` with semantic queries
   - Use `data-testid` selectors for employee cards
   - Use sample data API counts instead of hardcoded values
   - **Estimated effort**: 10-15 hours
   - **Impact**: ~150 instances

5. **Add `data-testid` attributes** to missing components
   - Audit 20 components without test IDs
   - Add semantic test IDs (`submit-button`, `employee-card`, etc.)
   - Update component tests to use test IDs
   - **Estimated effort**: 4-6 hours

6. **Improve frontend hook coverage** from 70% to 85%
   - Identify under-tested hooks (useFilters, useIntelligence, etc.)
   - Add unit tests for hook logic
   - Test edge cases and error paths
   - **Estimated effort**: 6-8 hours

### Medium Priority (Week 4-6)

7. **Create fixture factories** for backend tests
   - Implement `create_employee()` with semantic constructors
   - Create `tests/factories.py` module
   - Migrate existing tests to use factories
   - **Estimated effort**: 8-10 hours
   - **Impact**: Reduces hardcoded data across 300+ unit tests

8. **Replace arbitrary timeouts** with event-driven waits
   - Find 5 instances of `setTimeout()` / `sleep()`
   - Replace with `waitFor()` / `expect().toBeVisible()`
   - **Estimated effort**: 2 hours

### Low Priority (Week 6-8)

9. **Remove over-mocking** of business logic
   - Identify 3 instances of service mocking in unit tests
   - Refactor to mock only I/O boundaries
   - Use real service implementations
   - **Estimated effort**: 3-4 hours

10. **Increase critical path E2E coverage** to 100%
    - Add missing error path tests
    - Add edge case tests (special characters, unicode, etc.)
    - Verify all 5 critical workflows have full coverage
    - **Estimated effort**: 8-10 hours

---

## Automation

### Weekly Metrics Collection

**GitHub Action**: `.github/workflows/test-metrics.yml`

```yaml
name: Collect Test Metrics
on:
  schedule:
    - cron: '0 2 * * 1'  # Monday 2 AM UTC
  workflow_dispatch:

jobs:
  collect-metrics:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Count tests
        run: |
          echo "## Test Inventory" >> metrics.md
          pytest --collect-only -q tests/unit | grep -c "test_" >> metrics.md
      - name: Run tests with timing
        run: |
          time pytest tests/unit -q
      - name: Collect coverage
        run: |
          pytest --cov=backend/src --cov-report=json
          echo "Backend coverage: $(cat coverage.json | jq '.totals.percent_covered')%" >> metrics.md
      - name: Commit metrics
        run: |
          git add metrics.md
          git commit -m "chore: update test metrics [skip ci]"
          git push
```

---

## References

- [Test Architecture](./ARCHITECTURE.md) - Overall testing strategy
- [Test Principles](./test-principles.md) - Anti-fragile principles
- [Quick Reference](./quick-reference.md) - Common patterns

---

**Last Updated**: 2025-12-29
**Next Review**: 2026-01-05 (weekly)
**Owner**: Test Architect agent
