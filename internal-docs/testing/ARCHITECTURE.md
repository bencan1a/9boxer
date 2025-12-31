# Test Architecture

**Status**: Active
**Last Updated**: 2025-12-29
**Owner**: Test Architect

This document defines the ideal testing architecture for 9Boxer, designed to create an anti-fragile test suite that provides confidence without maintenance burden in a multi-agent development environment.

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Application Context](#application-context)
3. [Test Pyramid & Layer Distribution](#test-pyramid--layer-distribution)
4. [Speed Segmentation Strategy](#speed-segmentation-strategy)
5. [Fixture Architecture](#fixture-architecture)
6. [Mock Boundaries](#mock-boundaries)
7. [Parallel Execution](#parallel-execution)
8. [Coverage Strategy](#coverage-strategy)
9. [Technology Stack](#technology-stack)
10. [Architectural Decisions](#architectural-decisions)

---

## Executive Summary

**Goal**: Create a test suite that survives design changes, string changes, and refactors while catching real bugs.

**Key Metrics**:
- **Fast tests**: <60s (unit + component) → Run on every save
- **Comprehensive tests**: <10min (all tests) → Run in CI
- **Coverage**: 80%+ overall, 100% on critical paths
- **Pyramid ratio**: 70% unit, 20% integration, 10% E2E

**Architecture Pillars**:
1. **Anti-Fragility**: Tests survive non-behavioral changes
2. **Speed**: Fast feedback loop for development
3. **Isolation**: Tests run independently in any order
4. **Reusability**: Fixtures and factories reduce duplication

---

## Application Context

### Application Architecture

9Boxer is a standalone Electron desktop application:
- **Backend**: FastAPI (Python 3.10+), SQLite database
- **Frontend**: React 18 + TypeScript + Material-UI
- **Deployment**: Electron wrapper (Windows/macOS/Linux installers)
- **Communication**: HTTP (localhost:38000)
- **Scale**: 1-1000 employees per session

### Core Workflows (Critical Paths)

These workflows MUST have 100% test coverage:

1. **File Upload → Grid Display**
   - Upload Excel file
   - Parse employees (200+ rows)
   - Display in 9-box grid
   - Show statistics

2. **Employee Movement → Change Tracking**
   - Drag employee to new position
   - Track change event
   - Update grid position
   - Mark as modified

3. **Filter → Statistics Update**
   - Apply filters (department, level, manager)
   - Update grid display
   - Recalculate statistics
   - Update intelligence insights

4. **Intelligence Analysis**
   - Detect bias patterns
   - Calculate distribution anomalies
   - Generate insights
   - Display recommendations

5. **Export → File Save**
   - Export to Excel (update original or save new)
   - Preserve formatting
   - Track changes in file
   - Update recent files list

### API Surface

5 API modules with 30+ endpoints:
- **Session**: upload, export, close, sample-data
- **Employees**: list, get, move, update, filter-options
- **Statistics**: distribution, grouping, summary
- **Intelligence**: analyze, insights, bias-detection
- **Preferences**: get, update, recent-files

---

## Test Pyramid & Layer Distribution

### Ideal Distribution

```
        /\         E2E Tests (10%)
       /  \        ~60 tests, <10min total
      /    \       Full user workflows
     /------\
    /        \     Integration Tests (20%)
   /          \    ~120 tests, <3min total
  /            \   Cross-module interactions
 /--------------\
/                \ Unit Tests (70%)
|    420 tests   | <2min total
|   Fast, focused| Single-responsibility
\----------------/
```

**Target Test Counts** (for 600 total tests):
- **Unit**: 420 tests (70%) - Backend: 300, Frontend: 120
- **Integration**: 120 tests (20%) - Backend: 80, Frontend: 40
- **E2E**: 60 tests (10%) - Playwright workflows

**Current State** (637 tests):
- ✅ Unit: 504 tests (79%) - **OVER-indexed** (good!)
- ⚠️ Integration: 86 tests (13%) - **UNDER-indexed** (need +34 tests)
- ✅ E2E: 21 tests (3%) - **UNDER-indexed** but acceptable (Playwright workflows are comprehensive)
- ⚠️ Performance: 26 tests - Consider moving to separate benchmark suite

**Rebalancing Strategy**:
1. Add 34 integration tests for cross-module workflows
2. Add 15 E2E tests for edge cases and error paths
3. Keep unit test count stable (already comprehensive)
4. Move performance tests to separate CI job (not in main pyramid)

---

## Speed Segmentation Strategy

### Two-Tier Execution Model

#### Tier 1: Fast Tests (<60s total)
**When**: Pre-commit hooks, on every save (watch mode)
**What**: Unit tests + component tests
**Target**: <30s backend unit, <30s frontend component

**Backend**:
```bash
pytest tests/unit -x --tb=short  # <30s
```

**Frontend**:
```bash
npm test                          # <30s (Vitest watch mode)
```

#### Tier 2: Comprehensive Tests (<10min total)
**When**: CI pipeline, pre-push, weekly reviews
**What**: All tests (unit + integration + E2E + performance)
**Target**: <10min total

**Backend**:
```bash
pytest tests/unit           # <2min
pytest tests/integration    # <3min
pytest tests/e2e            # <3min
pytest tests/performance    # <2min
```

**Frontend**:
```bash
npm run test:run                  # <1min (all component tests)
npm run test:e2e:pw              # <5min (Playwright)
```

### Performance Budgets

| Test Type | Per-Test Target | Per-Test Max | Suite Total |
|-----------|-----------------|--------------|-------------|
| Backend Unit | <0.1s | 0.5s | <2min |
| Frontend Component | <0.2s | 1s | <1min |
| Backend Integration | <2s | 5s | <3min |
| Backend E2E | <10s | 30s | <3min |
| Frontend E2E (Playwright) | <15s | 45s | <5min |
| Performance Benchmark | <5s | 15s | <2min |

**Enforcement**:
- Fail CI if comprehensive tests exceed 10min
- Flag individual tests exceeding "Max" in weekly reviews
- Use `pytest --durations=10` to identify slow tests

---

## Fixture Architecture

### Design Philosophy

**Goals**:
1. **Reusability**: Common test scenarios defined once
2. **Clarity**: Fixtures document intent (e.g., "star_performer", "flight_risk_employee")
3. **Flexibility**: Easy to customize for specific test cases
4. **Isolation**: Each test gets fresh data

### Backend Fixture Strategy

#### Factory Functions (Preferred for Unit Tests)

**Pattern**: Builder pattern with sensible defaults

```python
# backend/tests/factories.py
def create_employee(
    employee_id: int = 1,
    name: str = "Test Employee",
    performance: PerformanceLevel = PerformanceLevel.MEDIUM,
    potential: PotentialLevel = PotentialLevel.MEDIUM,
    **kwargs
) -> Employee:
    """Create employee with customizable fields.

    Examples:
        >>> star = create_employee(performance=HIGH, potential=HIGH)
        >>> underperformer = create_employee(performance=LOW, potential=LOW)
        >>> custom = create_employee(name="Custom", manager="Custom Manager")
    """
    return Employee(
        employee_id=employee_id,
        name=name,
        performance=performance,
        potential=potential,
        job_level=kwargs.get("job_level", "MT4"),
        # ... all required fields with defaults
        **kwargs
    )

# Semantic constructors (document common test scenarios)
def create_star_performer(**kwargs) -> Employee:
    """High performance, high potential employee."""
    return create_employee(
        performance=PerformanceLevel.HIGH,
        potential=PotentialLevel.HIGH,
        **kwargs
    )

def create_flight_risk(**kwargs) -> Employee:
    """High performer with flight risk flag."""
    return create_employee(
        performance=PerformanceLevel.HIGH,
        potential=PotentialLevel.HIGH,
        flags=["flight_risk"],
        **kwargs
    )
```

#### Pytest Fixtures (Preferred for Integration Tests)

**Pattern**: Scoped fixtures with automatic cleanup

```python
# backend/tests/conftest.py
@pytest.fixture
def sample_employees() -> list[Employee]:
    """Standard dataset: 5 employees covering all grid positions."""
    return [
        create_employee(id=1, name="Star", performance=HIGH, potential=HIGH),
        create_employee(id=2, name="HighImpact", performance=HIGH, potential=MEDIUM),
        create_employee(id=3, name="Core", performance=MEDIUM, potential=MEDIUM),
        create_employee(id=4, name="Enigma", performance=LOW, potential=HIGH),
        create_employee(id=5, name="Under", performance=LOW, potential=LOW),
    ]

@pytest.fixture
def rich_dataset_200() -> list[Employee]:
    """Large dataset: 200 employees with realistic distributions.

    Use for:
    - Performance tests
    - Statistics tests
    - Intelligence/bias detection tests
    """
    return generate_rich_dataset(size=200, include_bias=True, seed=42)

@pytest.fixture
def test_client(test_db_path: str) -> TestClient:
    """FastAPI test client with test database."""
    # ... setup
    yield client
    # ... cleanup
```

### Frontend Fixture Strategy

#### Mock Data Factories (Component Tests)

**Pattern**: TypeScript builder pattern

```typescript
// frontend/src/test/factories.ts
export function createMockEmployee(overrides: Partial<Employee> = {}): Employee {
  return {
    employee_id: 1,
    name: 'Test Employee',
    performance: 'Medium',
    potential: 'Medium',
    grid_position: 5,
    job_level: 'MT4',
    manager: 'Test Manager',
    ...overrides,
  };
}

// Semantic constructors
export function createStarPerformer(overrides: Partial<Employee> = {}): Employee {
  return createMockEmployee({
    performance: 'High',
    potential: 'High',
    grid_position: 9,
    ...overrides,
  });
}

export function createEmployeesByPosition(): Record<number, Employee[]> {
  return {
    1: [createMockEmployee({ id: 1, grid_position: 1 })],
    5: [createMockEmployee({ id: 2, grid_position: 5 })],
    9: [createStarPerformer({ id: 3 })],
  };
}
```

#### E2E Test Data (Playwright)

**Pattern**: Reuse backend sample data API

```typescript
// frontend/playwright/helpers/dataLoading.ts
export async function loadSampleData(page: Page, size: number = 200): Promise<void> {
  /**
   * Load sample data via backend API (PREFERRED for E2E tests).
   *
   * Benefits:
   * - Faster than file upload
   * - Consistent data across tests
   * - Tests backend sample data generation
   */
  await page.goto('/');
  const response = await page.request.post('/api/employees/generate-sample', {
    data: { size, include_bias: true, seed: 42 }
  });
  expect(response.ok()).toBeTruthy();
}

export async function uploadExcelFile(page: Page, filename: string): Promise<void> {
  /**
   * Upload Excel file (USE ONLY for file operation tests).
   */
  const filePath = path.join(__dirname, '..', 'fixtures', filename);
  // ... upload logic
}
```

**When to use each**:
- **`loadSampleData()`**: 95% of E2E tests (grid, filters, intelligence, etc.)
- **`uploadExcelFile()`**: File operation tests only (upload, export, recent files)

---

## Mock Boundaries

### Mocking Philosophy

**ALWAYS Mock** (I/O boundaries):
- ✅ HTTP requests (external APIs, network calls)
- ✅ File system operations (reading/writing Excel files)
- ✅ Database connections (in unit tests only)
- ✅ Time/randomness (for deterministic tests)
- ✅ Electron IPC (in component tests)

**NEVER Mock** (Business logic):
- ❌ Service layer calculations (statistics, intelligence)
- ❌ Data models (Employee, Session)
- ❌ Validation logic (filters, permissions)
- ❌ Grid position calculations
- ❌ Change tracking logic

**STRATEGIC Mocking** (Context-dependent):
- ⚠️ Database (mock in unit, real in integration)
- ⚠️ Session manager (mock in API tests, real in integration)
- ⚠️ React hooks (mock in component tests, real in integration tests)

### Backend Mock Patterns

#### Unit Tests: Mock I/O, Use Real Logic

```python
# ✅ GOOD: Mock file parser, test business logic
def test_upload_when_valid_file_then_creates_session(test_client, mocker):
    mock_parse = mocker.patch("ninebox.services.excel_parser.parse_excel")
    mock_parse.return_value = [create_employee(id=1)]

    response = test_client.post("/api/session/upload", files={"file": "test.xlsx"})

    assert response.status_code == 200
    # Test that session was created with parsed employees
    assert len(session_manager.get_session().current_employees) == 1

# ❌ BAD: Mocking business logic
def test_calculate_statistics(mocker):
    mock_calc = mocker.patch("ninebox.services.statistics.calculate_distribution")
    mock_calc.return_value = {"box_1": 5, "box_9": 10}

    result = calculate_statistics(employees)  # NOT testing anything!
    assert result == {"box_1": 5, "box_9": 10}
```

#### Integration Tests: Real Services, Mock External Calls

```python
# ✅ GOOD: Real services, mock only external boundaries
def test_intelligence_bias_detection_integration(test_client, sample_employees):
    # Use real session manager, employee service, intelligence service
    # No mocking of business logic

    # Upload employees
    test_client.post("/api/session/upload", files={"file": excel_file})

    # Analyze for bias
    response = test_client.get("/api/intelligence/analyze")

    # Verify real calculation results
    assert response.status_code == 200
    insights = response.json()["insights"]
    assert any("gender bias" in i["description"].lower() for i in insights)
```

### Frontend Mock Patterns

#### Component Tests: Mock Hooks, Test UI Behavior

```typescript
// ✅ GOOD: Mock data-fetching hooks, test UI rendering
vi.mock('../../../hooks/useEmployees', () => ({
  useEmployees: () => ({
    employees: mockEmployees,
    loading: false,
    error: null,
  }),
}));

test('displays employee names when data loaded', () => {
  render(<EmployeeList />);

  expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
  expect(screen.getByText('Bob Smith')).toBeInTheDocument();
});

// ❌ BAD: Mocking component internals
test('calls useState correctly', () => {
  const mockSetState = vi.fn();
  vi.spyOn(React, 'useState').mockReturnValue([0, mockSetState]);
  // Don't test React internals!
});
```

#### E2E Tests: No Mocking (Real End-to-End)

```typescript
// ✅ GOOD: No mocks, test real workflow
test('upload file and view employees', async ({ page }) => {
  await page.goto('/');
  await loadSampleData(page);  // Real API call

  await expect(page.locator('[data-testid="nine-box-grid"]')).toBeVisible();
  const cards = page.locator('[data-testid^="employee-card-"]');
  expect(await cards.count()).toBeGreaterThan(0);
});

// ❌ BAD: Mocking in E2E tests
test('displays employees', async ({ page }) => {
  await page.route('**/api/employees', route => {
    route.fulfill({ body: JSON.stringify({ employees: mockData }) });
  });
  // This is not an E2E test, it's a component test!
});
```

---

## Parallel Execution

### Backend: pytest-xdist

**Status**: ✅ Enabled
**Workers**: Auto-detect CPU cores (`-n auto`)

**Configuration** (pytest.ini):
```ini
[pytest]
addopts = -n auto --dist loadfile
```

**Worker Isolation**:
- Each worker gets separate database file (via `test_db_path` fixture)
- Environment variables scoped per worker
- No shared mutable state

**Caveats**:
- Performance benchmarks disabled in parallel mode (by design)
- Visual regression tests run serially (Playwright limitation)

### Frontend: Vitest Native Parallelization

**Status**: ✅ Enabled by default
**Workers**: Auto-detect CPU cores

**Configuration** (vitest.config.ts):
```typescript
export default defineConfig({
  test: {
    threads: true,  // Parallel execution
    isolate: true,  // Isolated test environments
  },
});
```

### E2E: Playwright Parallelization

**Status**: ✅ Enabled
**Workers**: 4 (configurable)

**Configuration** (playwright.config.ts):
```typescript
export default defineConfig({
  workers: process.env.CI ? 2 : 4,
  fullyParallel: true,
});
```

**Isolation**:
- Each worker gets fresh browser context
- Tests use sample data API (idempotent, no shared file state)
- Database cleaned between tests

---

## Coverage Strategy

### Coverage Targets

| Layer | Target | Enforcement |
|-------|--------|-------------|
| **Backend Services** | 90%+ | CI blocks if <90% |
| **Backend API Endpoints** | 85%+ | CI blocks if <85% |
| **Backend Models** | Implicit | Tested via services |
| **Frontend Components** | 80%+ | CI blocks if <80% |
| **Frontend Hooks** | 85%+ | CI blocks if <85% |
| **E2E Critical Paths** | 100% | Manual verification |
| **Overall Project** | 80%+ | CI blocks if <80% |

### Critical Paths (100% Coverage Required)

These workflows MUST be fully covered by E2E tests:

1. ✅ File upload → Grid display
2. ✅ Employee movement → Change tracking
3. ✅ Filter application → Statistics update
4. ✅ Intelligence analysis → Insights display
5. ✅ Export to Excel → File save
6. ⚠️ Error handling (upload failure, export failure, network errors)
7. ⚠️ Edge cases (empty dataset, 1000+ employees, special characters)

### Coverage Enforcement (CI)

**Changed Files**: 70% coverage minimum
```bash
# In CI pipeline
pytest --cov=backend/src --cov-fail-under=70 --cov-report=term-missing
```

**New Code**: 100% coverage (no coverage decrease)
```bash
# Use coverage diff tool
coverage-diff origin/main HEAD --fail-under=100
```

**Exclusions** (Acceptable):
- `if __name__ == "__main__"` blocks
- Defensive assertions (should never execute)
- Type stubs and protocols
- Deprecated code (marked for removal)

---

## Technology Stack

### Backend Testing

| Tool | Purpose | Version |
|------|---------|---------|
| **pytest** | Test runner | 7.4+ |
| **pytest-cov** | Coverage reporting | 4.1+ |
| **pytest-xdist** | Parallel execution | 3.3+ |
| **pytest-asyncio** | Async test support | 0.21+ |
| **pytest-mock** | Mocking utilities | 3.11+ |
| **TestClient** (FastAPI) | API testing | Built-in |
| **factory_boy** | Test data factories | Future |
| **faker** | Fake data generation | 19.6+ |

### Frontend Testing

| Tool | Purpose | Version |
|------|---------|---------|
| **Vitest** | Test runner + assertions | 1.0+ |
| **React Testing Library** | Component testing | 14.0+ |
| **Playwright** | E2E testing | 1.40+ |
| **@testing-library/jest-dom** | DOM matchers | 6.1+ |
| **@testing-library/user-event** | User interactions | 14.5+ |
| **vitest-canvas-mock** | Canvas mocking | 0.3+ |

### Test Data Management

| Tool | Purpose | Notes |
|------|---------|-------|
| **Fixtures** (pytest) | Shared test data | Backend |
| **Mock factories** (TypeScript) | Component data | Frontend |
| **Sample data API** | E2E test data | Backend `/api/employees/generate-sample` |
| **Excel fixtures** | File operation tests | `frontend/playwright/fixtures/` |

---

## Architectural Decisions

### AD-1: Use Sample Data API for E2E Tests (Not File Upload)

**Decision**: E2E tests should use `/api/employees/generate-sample` for data loading, NOT file upload.

**Rationale**:
- **Speed**: API call ~100ms vs file upload ~500ms
- **Reliability**: No file I/O failures, no encoding issues
- **Consistency**: Same data every test (seed=42)
- **Simplicity**: No fixture file management

**Exceptions**: File operation tests MUST use real file upload to test the feature.

**Impact**: 95% of E2E tests faster and more reliable.

---

### AD-2: Factory Functions Over Fixtures for Unit Tests

**Decision**: Backend unit tests should use factory functions (`create_employee()`) instead of pytest fixtures.

**Rationale**:
- **Clarity**: `create_employee(performance=HIGH)` is clearer than `high_performer_fixture`
- **Flexibility**: Easy to customize per-test without fixture explosion
- **Discoverability**: Functions in IDE autocomplete, fixtures are not
- **Less Magic**: No hidden fixture dependencies

**Exceptions**: Use fixtures for expensive setup (database, test client, Excel files).

**Impact**: More readable unit tests, easier for agents to write correct tests.

---

### AD-3: No Hardcoded Strings in Assertions

**Decision**: Tests MUST NOT assert on hardcoded UI strings. Use `data-testid` or semantic queries.

**Rationale**:
- **Anti-Fragility**: Survives string changes, i18n changes
- **Maintainability**: Single source of truth (component code)
- **Clear Intent**: `data-testid="submit-button"` is clearer than "Submit"

**Examples**:
```typescript
// ❌ BAD
expect(screen.getByText('Submit')).toBeVisible();

// ✅ GOOD
expect(screen.getByTestId('submit-button')).toBeVisible();

// ✅ ACCEPTABLE (semantic role)
expect(screen.getByRole('button', { name: /submit/i })).toBeVisible();
```

**Exceptions**: Language-switching tests MUST assert on translated strings.

---

### AD-4: Integration Tests for Cross-Module Interactions

**Decision**: Add 34 integration tests to reach 20% pyramid ratio.

**Target Areas**:
- Session → Employees → Statistics (workflow integration)
- Upload → Parse → Grid → Statistics (data flow)
- Filters → Employees → Intelligence (data transformation)
- Movement → Events → Export (change tracking)

**Rationale**:
- **Gap**: Currently 13% integration tests (target: 20%)
- **Value**: Catch integration bugs that unit tests miss
- **Risk**: Multi-module refactors currently untested

**Implementation**: Create `tests/integration/test_workflow_*.py` files.

---

### AD-5: Performance Tests in Separate CI Job

**Decision**: Move performance benchmarks to separate CI job (not blocking).

**Rationale**:
- **Speed**: Performance tests slow down main CI (2min overhead)
- **Flakiness**: Benchmarks are timing-sensitive, fail in CI under load
- **Focus**: Main CI should focus on correctness, not performance

**Implementation**:
```yaml
# .github/workflows/performance.yml
name: Performance Tests
on:
  schedule:
    - cron: '0 2 * * 1'  # Weekly on Mondays
  workflow_dispatch:
```

---

## Next Steps (Implementation Plan)

Based on this architecture, the implementation roadmap is:

### Phase 1: Foundation (Week 1-2)
- [ ] Create backend fixture factories (`tests/factories.py`)
- [ ] Create frontend mock factories (`frontend/src/test/factories.ts`)
- [ ] Update E2E helpers to prefer `loadSampleData()`
- [ ] Document fixture usage in test templates

### Phase 2: Rebalancing (Week 2-4)
- [ ] Add 34 integration tests for cross-module workflows
- [ ] Add 15 E2E tests for edge cases and error paths
- [ ] Refactor existing tests to use new fixtures
- [ ] Remove hardcoded strings from E2E tests

### Phase 3: Anti-Fragility (Week 4-6)
- [ ] Audit all tests for hardcoded data
- [ ] Replace hardcoded employee names with semantic queries
- [ ] Add `data-testid` attributes where missing
- [ ] Remove arbitrary timeouts, use event-driven waits

### Phase 4: Optimization (Week 6-8)
- [ ] Move performance tests to separate CI job
- [ ] Optimize slow tests (target <1s per unit test)
- [ ] Enable coverage enforcement in CI
- [ ] Create weekly test architecture review automation

---

## Validation Checklist

Before marking this architecture as complete, verify:

- [ ] Test pyramid ratio: 70/20/10 (unit/integration/E2E)
- [ ] Fast tests complete in <60s (unit + component)
- [ ] Comprehensive tests complete in <10min (all tests)
- [ ] Coverage >80% overall, 100% on critical paths
- [ ] No hardcoded strings in assertions
- [ ] Fixtures use factory pattern (not hardcoded data)
- [ ] Parallel execution enabled (pytest-xdist, Vitest, Playwright)
- [ ] No mocking of business logic (only I/O boundaries)
- [ ] E2E tests use sample data API (not file upload)
- [ ] Integration tests cover cross-module workflows

---

## References

- [Test Principles](./test-principles.md) - Core testing philosophy
- [Quick Reference](./quick-reference.md) - Common patterns and commands
- [Testing Checklist](./testing-checklist.md) - Pre-commit checklist
- [Backend Fixtures](./fixtures/backend.md) - Backend fixture patterns (TBD)
- [Frontend Mocks](./fixtures/frontend.md) - Frontend mock patterns (TBD)
- [E2E Helpers](./fixtures/e2e.md) - E2E helper patterns (TBD)

---

**Last Reviewed**: 2025-12-29
**Next Review**: 2026-01-05 (weekly)
**Owner**: Test Architect agent
