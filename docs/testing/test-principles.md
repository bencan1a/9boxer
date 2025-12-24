# Core Testing Principles

This document defines the fundamental principles and best practices for writing tests in the 9boxer application. All test code must adhere to these principles to ensure reliability, maintainability, and effectiveness.

---

## The Four Pillars of Reliable Testing

### 1. Simple ✓

**Principle:** Tests should be straightforward and easy to understand.

**Rules:**
- ❌ **NO conditional logic** in test bodies (no `if`, `else`, `for`, `while`)
- ❌ **NO dynamic test generation** (no parameterization that obscures intent)
- ✓ **YES to clear Arrange-Act-Assert structure**
- ✓ **YES to one logical assertion per test** (multiple assertion calls are fine if testing the same concept)

**Why:** Tests with conditional logic can hide bugs and are hard to debug. When a test fails, you should immediately know what went wrong.

**Example:**

```python
# ❌ BAD: Conditional logic in test
def test_employee_status():
    employees = get_employees()
    for emp in employees:
        if emp.performance > 3:
            assert emp.status == "high_performer"
        else:
            assert emp.status == "standard"

# ✓ GOOD: Simple, explicit tests
def test_employee_when_high_performance_then_high_performer_status():
    employee = Employee(id=1, performance=4)
    assert employee.status == "high_performer"

def test_employee_when_standard_performance_then_standard_status():
    employee = Employee(id=2, performance=2)
    assert employee.status == "standard"
```

---

### 2. Isolated ✓

**Principle:** Each test should be independent and not rely on other tests or shared state.

**Rules:**
- ✓ **Use fixtures** for test data (`conftest.py`)
- ✓ **Create fresh state** for each test
- ❌ **NO shared mutable state** between tests
- ❌ **NO test execution order dependencies**
- ✓ **Clean up after tests** (use pytest fixtures with yield)

**Why:** Isolated tests can run in any order and in parallel. They don't create cascading failures.

**Example:**

```python
# ❌ BAD: Shared state
current_session = None

def test_create_session():
    global current_session
    current_session = SessionManager()
    assert current_session is not None

def test_add_employee():  # Depends on previous test!
    current_session.add_employee(employee)
    assert len(current_session.employees) == 1

# ✓ GOOD: Isolated with fixtures
@pytest.fixture
def session_manager():
    """Fresh session for each test."""
    return SessionManager()

def test_create_session(session_manager):
    assert session_manager is not None

def test_add_employee(session_manager, sample_employees):
    session_manager.add_employee(sample_employees[0])
    assert len(session_manager.employees) == 1
```

---

### 3. Reliable ✓

**Principle:** Tests should produce the same results every time they run.

**Rules:**
- ✓ **Deterministic test data** (no random values unless testing randomness)
- ✓ **Controlled timestamps** (mock `datetime.now()` if needed)
- ✌ **No network calls** (use mocks or fixtures)
- ❌ **NO sleeps or timeouts** (use synchronous testing patterns)
- ✓ **Predictable output** (avoid floating point equality without tolerance)

**Why:** Flaky tests erode confidence in the test suite and waste developer time.

**Example:**

```python
# ❌ BAD: Non-deterministic
def test_employee_creation():
    employee = Employee(id=random.randint(1, 1000), name="Test")
    assert employee.id > 0  # Could fail randomly

# ✓ GOOD: Deterministic
def test_employee_creation():
    employee = Employee(id=1, name="Test Employee")
    assert employee.id == 1
    assert employee.name == "Test Employee"

# ❌ BAD: Time-dependent
def test_session_expiry():
    session = Session(created_at=datetime.now())
    time.sleep(2)  # Flaky!
    assert session.is_expired()

# ✓ GOOD: Controlled time
def test_session_expiry():
    created_at = datetime(2025, 1, 1, 12, 0, 0)
    current_time = datetime(2025, 1, 1, 12, 5, 0)
    session = Session(created_at=created_at)
    assert session.is_expired(current_time=current_time)
```

---

### 4. Integration-Focused ✓

**Principle:** While unit tests are important, integration tests validate that the product actually works.

**Rules:**
- ✓ **Test complete workflows** (upload → display → export)
- ✓ **Test cross-module interactions** (filters → statistics → intelligence)
- ✓ **Test error propagation** (how errors flow through the system)
- ✓ **Test real-world scenarios** (edge cases users will encounter)
- ⚠️ **Use mocking sparingly** (don't mock business logic)

**Why:** Unit tests verify individual components work, but integration tests verify the system works as a whole.

**Example:**

```python
# ✓ GOOD: Integration test for complete workflow
def test_complete_employee_management_workflow(test_client, sample_excel_file):
    # Upload Excel file
    response = test_client.post(
        "/api/session/upload",
        files={"file": sample_excel_file}
    )
    assert response.status_code == 200

    # Verify employees loaded
    response = test_client.get("/api/employees")
    employees = response.json()
    assert len(employees) == 5

    # Move an employee
    response = test_client.put(
        "/api/employees/1/move",
        json={"grid_position": 5}
    )
    assert response.status_code == 200

    # Verify statistics updated
    response = test_client.get("/api/statistics/distribution")
    distribution = response.json()
    assert distribution[4]["count"] == 1  # Employee moved to position 5

    # Export and verify modification tracked
    response = test_client.get("/api/session/export")
    assert response.status_code == 200
    assert "modified" in response.content.decode()
```

---

## Test Naming Convention

**Format:** `test_<function>_when_<condition>_then_<expected>`

**Examples:**
- `test_parse_excel_when_valid_file_then_returns_employees()`
- `test_move_employee_when_invalid_id_then_raises_error()`
- `test_calculate_statistics_when_empty_dataset_then_returns_zeros()`

**Why:** Clear names document the test's purpose and make failures immediately understandable.

---

## Test Structure: Arrange-Act-Assert

Every test should follow this three-part structure:

```python
def test_example():
    # Arrange: Set up test data and preconditions
    employee = Employee(id=1, name="Test", performance=4, potential=3)
    session = SessionManager()

    # Act: Execute the behavior being tested
    session.add_employee(employee)

    # Assert: Verify the expected outcome
    assert len(session.employees) == 1
    assert session.employees[0].name == "Test"
```

**Optional: Cleanup** (use fixtures with `yield` for automatic cleanup)

---

## What to Test (and What Not to Test)

### ✓ DO Test

1. **Business Logic**
   - Calculations (statistics, intelligence, grid positions)
   - Validation rules
   - State transitions
   - Error handling

2. **API Contracts**
   - Request/response formats
   - Status codes
   - Error messages
   - Authentication/authorization

3. **User Workflows**
   - Complete user journeys (E2E)
   - Cross-module interactions
   - Edge cases users will encounter

4. **Error Handling**
   - Invalid inputs
   - Missing data
   - Concurrent operations
   - Resource constraints

### ❌ DON'T Test

1. **Framework Code**
   - Don't test FastAPI's routing
   - Don't test React's rendering
   - Don't test library functionality

2. **Type Checking**
   - Don't write tests for type annotations
   - Use mypy/pyright instead

3. **Implementation Details**
   - Don't test private methods directly
   - Test public interfaces and behaviors

4. **Third-Party Libraries**
   - Don't test pandas, openpyxl, etc.
   - Mock them if needed

---

## Mocking Guidelines

### When to Mock

✓ **External services** (network calls, file system)
✓ **Slow operations** (large file I/O, database queries)
✓ **Non-deterministic sources** (random, current time, external APIs)

### When NOT to Mock

❌ **Business logic** (test the real implementation)
❌ **Data models** (use real instances)
❌ **Simple functions** (don't over-mock)

### How to Mock Effectively

```python
# ✓ GOOD: Mock external dependency
from unittest.mock import patch

def test_upload_employee_data(test_client):
    with patch("ninebox.services.excel_parser.parse_excel") as mock_parse:
        mock_parse.return_value = [Employee(id=1, name="Test")]

        response = test_client.post("/api/session/upload", files={"file": "test.xlsx"})

        assert response.status_code == 200
        mock_parse.assert_called_once()

# ❌ BAD: Over-mocking business logic
def test_calculate_statistics(mock_session, mock_employees, mock_calculator):
    # Too much mocking - you're not testing anything real!
    stats = mock_calculator.calculate(mock_employees)
    assert stats == mock_stats
```

---

## Test Data Management

### Fixtures (Preferred)

Use pytest fixtures for reusable test data:

```python
@pytest.fixture
def sample_employees() -> list[Employee]:
    """Standard set of 5 employees for testing."""
    return [
        Employee(id=1, name="Alice", performance=4, potential=4, grid_position=1),
        Employee(id=2, name="Bob", performance=3, potential=3, grid_position=5),
        Employee(id=3, name="Charlie", performance=2, potential=2, grid_position=9),
        Employee(id=4, name="Diana", performance=4, potential=2, grid_position=3),
        Employee(id=5, name="Eve", performance=2, potential=4, grid_position=7),
    ]
```

### Factory Functions

For variations of test data:

```python
def create_employee(
    id: int = 1,
    name: str = "Test Employee",
    performance: int = 3,
    potential: int = 3,
    **kwargs
) -> Employee:
    """Create employee with sensible defaults."""
    return Employee(
        id=id,
        name=name,
        performance=performance,
        potential=potential,
        **kwargs
    )

def test_high_performer():
    employee = create_employee(performance=5, potential=5)
    assert employee.is_high_performer()
```

---

## Performance Guidelines

### Unit Tests
- **Target:** <1 second per test
- **Max:** 2 seconds per test
- **Total suite:** <2 minutes for all unit tests

### Integration Tests
- **Target:** <5 seconds per test
- **Max:** 10 seconds per test
- **Total suite:** <5 minutes for all integration tests

### E2E Tests
- **Target:** <30 seconds per workflow
- **Max:** 60 seconds per workflow
- **Run in CI:** Not required for local development

**Optimization Tips:**
- Use in-memory databases for tests
- Minimize file I/O
- Avoid unnecessary setup/teardown
- Run tests in parallel (pytest-xdist)

---

## Coverage Guidelines

### Target Coverage

| Category | Target | Notes |
|----------|--------|-------|
| Services | 90%+ | Core business logic |
| API Endpoints | 80%+ | Request/response handling |
| Models | Implicit | Tested via services |
| Utilities | 80%+ | Helper functions |
| Config | 70%+ | Settings and initialization |
| Overall | 75%+ | Project-wide target |

### Coverage is NOT the Goal

**Remember:**
- 100% coverage ≠ good tests
- Test **behavior**, not lines of code
- Focus on critical paths and edge cases
- Quality > Quantity

---

## Frontend Testing Principles

### Component Tests (React Testing Library)

```typescript
// ✓ GOOD: Test user-visible behavior
test('displays employee name when rendered', () => {
  const employee = { id: 1, name: 'Alice', performance: 4, potential: 4 };
  render(<EmployeeCard employee={employee} />);

  expect(screen.getByText('Alice')).toBeInTheDocument();
});

// ❌ BAD: Testing implementation details
test('sets state correctly', () => {
  const { result } = renderHook(() => useState(0));
  // Don't test React internals!
});
```

### Internationalization (i18n) Testing

**Principle:** Tests should use translation keys instead of hardcoded strings to remain valid when translations change.

**Rules:**
- ✓ **Use `getTranslatedText()` helper** for assertions in component tests
- ✓ **Use `data-testid` selectors** for E2E tests instead of text
- ❌ **NO hardcoded English strings** in test assertions
- ✓ **Test pluralization** with multiple count values
- ✓ **Validate translation keys exist** (tests fail if keys are missing)

**Setup:**
```typescript
// Test infrastructure automatically includes I18nTestWrapper
// Import the helper function:
import { getTranslatedText } from '@/test/i18nTestUtils';
```

**Component Test Examples:**

```typescript
// ✓ GOOD: Use translation keys via helper
test('displays employee count with proper pluralization', () => {
  const count = 5;
  render(<EmployeeCount totalCount={count} />);

  const expectedText = `${count} ${getTranslatedText('grid.employeeCount.employee', { count })}`;
  expect(screen.getByText(expectedText)).toBeInTheDocument();
});

// ✓ GOOD: Test pluralization with different counts
test('uses singular form for 1 employee', () => {
  render(<EmployeeCount totalCount={1} />);

  expect(screen.getByText(
    `1 ${getTranslatedText('grid.employeeCount.employee', { count: 1 })}`
  )).toBeInTheDocument();
});

// ✓ GOOD: Test aria-labels with translations
test('has correct accessibility labels', () => {
  render(<ViewModeToggle />);

  const toggleGroup = screen.getByTestId('view-mode-toggle');
  expect(toggleGroup).toHaveAttribute(
    'aria-label',
    getTranslatedText('grid.viewModeToggle.ariaLabelToggle')
  );
});

// ❌ BAD: Hardcoded English strings
test('displays employee count', () => {
  render(<EmployeeCount totalCount={5} />);
  expect(screen.getByText('5 employees')).toBeInTheDocument(); // Will break when translations change!
});
```

**E2E Test Examples:**

```typescript
// ✓ GOOD: Use data-testid for stable selectors
test('uploads file successfully', async ({ page }) => {
  await page.getByTestId('upload-button').click();
  await page.getByTestId('file-input').setInputFiles('test.xlsx');
  await page.getByTestId('submit-button').click();

  await expect(page.getByTestId('success-message')).toBeVisible();
});

// ✓ GOOD: Use text selectors only for language-switching tests
test('switches language from English to Spanish', async ({ page }) => {
  await expect(page.getByText('Details')).toBeVisible(); // English
  await page.getByRole('combobox').click();
  await page.getByRole('option', { name: /Español/i }).click();
  await expect(page.getByText('Detalles')).toBeVisible(); // Spanish
});

// ❌ BAD: Text selectors for non-language tests (brittle!)
test('opens filter drawer', async ({ page }) => {
  await page.getByText('Filter employees').click(); // Will break with translations!
});
```

**Benefits:**
- ✅ Tests remain valid when translations change
- ✅ Easier to add new languages without breaking tests
- ✅ Tests validate that i18n keys exist (catch missing translations early)
- ✅ Consistent with production code patterns
- ✅ Language-switching tests gain more value

**Common Patterns:**

```typescript
// Pattern 1: Simple translation
const text = getTranslatedText('common.ok');

// Pattern 2: With interpolation
const text = getTranslatedText('dashboard.fileMenu.exportChanges', { count: 3 });

// Pattern 3: Pluralization
const text = getTranslatedText('grid.employeeCount.employee', { count: 1 }); // "employee"
const text = getTranslatedText('grid.employeeCount.employee', { count: 5 }); // "employees"

// Pattern 4: Complex string with multiple translations
const expectedText = `${filteredCount} ${getTranslatedText('grid.employeeCount.of')} ${totalCount} ${getTranslatedText('grid.employeeCount.employee', { count: totalCount })}`;
```

### E2E Tests (Playwright)

```typescript
// ✓ GOOD: Test complete user workflows
import { test, expect } from '@playwright/test';
import * as path from 'path';

test('allows user to upload file and view employees', async ({ page }) => {
  await page.goto('/');

  await page.getByTestId('upload-button').click();
  const fixturePath = path.join(__dirname, '..', 'fixtures', 'test-data.xlsx');
  await page.locator('#file-upload-input').setInputFiles(fixturePath);
  await page.getByTestId('upload-submit-button').click();

  await expect(page.getByTestId('employee-grid')).toBeVisible();
  const cards = page.locator('[data-testid^="employee-card-"]');
  expect(await cards.count()).toBe(5);
});
```

---

## Debugging Test Failures

### When a Test Fails

1. **Read the error message** - pytest provides detailed output
2. **Check the assertion** - what was expected vs actual?
3. **Verify test isolation** - does it fail when run alone?
4. **Check fixtures** - is test data correct?
5. **Add debug output** - use `print()` or `pytest -s` for stdout
6. **Use debugger** - `pytest --pdb` drops into debugger on failure

### Common Issues

**Flaky Tests:**
- Usually caused by timing, randomness, or shared state
- Fix by making deterministic or improving isolation

**Slow Tests:**
- Profile with `pytest --durations=10`
- Optimize fixtures and setup/teardown
- Consider parallelization

**Brittle Tests:**
- Often testing implementation details
- Refactor to test behavior instead

---

## Continuous Integration

### Pre-commit Hooks

Tests run automatically before commit:
- Fast unit tests only (<30s)
- Linting and type checking
- Format checking

### CI Pipeline

Full test suite runs on push:
- All unit tests
- All integration tests
- Coverage reporting
- E2E tests (on main branch)

### Coverage Enforcement

- Changed files must have 70%+ coverage
- Overall project coverage must not decrease
- PRs blocked if coverage drops

---

## Resources

- [pytest documentation](https://docs.pytest.org/)
- [React Testing Library](https://testing-library.com/react)
- [Playwright documentation](https://playwright.dev/)
- [Testing Best Practices](https://testingjavascript.com/)
- [Project Testing Guide](.github/agents/test.md)

---

## Summary Checklist

Before writing a test, ask:

- [ ] Is it **simple**? (No conditional logic)
- [ ] Is it **isolated**? (No dependencies on other tests)
- [ ] Is it **reliable**? (Deterministic results)
- [ ] Does it test **behavior**, not implementation?
- [ ] Does it follow **naming convention**?
- [ ] Does it use **Arrange-Act-Assert** structure?
- [ ] Is it **fast**? (<1s for unit, <5s for integration)
- [ ] Does it test something **meaningful**?

If you answered "yes" to all, you're writing great tests! ✓
