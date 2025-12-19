# Testing Quick Reference

Quick lookup guide for common testing patterns and commands. For detailed guidance, see `test-principles.md`.

---

## Running Tests

### Backend (Python)

```bash
# Activate virtual environment first!
. .venv/bin/activate  # Linux/macOS
# or
.venv\Scripts\activate  # Windows

# Run all tests
pytest

# Run specific file
pytest backend/tests/test_services/test_employee.py

# Run tests matching pattern
pytest -k "test_move"

# Verbose output
pytest -v

# Stop on first failure
pytest -x

# Run with coverage report
pytest --cov=backend/src --cov-report=html

# Run specific test
pytest backend/tests/test_services/test_employee.py::TestEmployeeService::test_move_employee_when_valid_position_then_updates_grid_position
```

### Frontend (JavaScript/TypeScript)

```bash
cd frontend

# Component tests - watch mode (best for development)
npm test

# Component tests - run once
npm run test:run

# Component tests with coverage
npm run test:coverage

# Component tests with UI dashboard
npm run test:ui

# Run specific test file
npm run test:run -- src/components/__tests__/Button.test.tsx

# E2E tests - run headless
npm run test:e2e:pw

# E2E tests - run with UI (interactive)
npm run test:e2e:pw:ui

# E2E tests - run in debug mode
npm run test:e2e:pw:debug

# Run specific E2E test
npx playwright test upload-flow.spec.ts
```

---

## Common Test Patterns

### Backend (Pytest)

#### Basic Test Structure

```python
def test_function_when_condition_then_expected():
    # Arrange: Set up test data
    employee = Employee(id=1, name="Test", performance=4, potential=3)

    # Act: Execute the behavior
    result = calculate_status(employee)

    # Assert: Verify outcome
    assert result == "high_performer"
```

#### With Fixtures

```python
def test_get_employees(sample_employees, test_client):
    """Test GET /api/employees returns employee list."""
    response = test_client.get("/api/employees")

    assert response.status_code == 200
    assert len(response.json()) == len(sample_employees)
```

#### Testing Errors

```python
def test_move_when_invalid_position_then_raises_error():
    """Test that invalid position raises ValueError."""
    with pytest.raises(ValueError, match="position.*valid"):
        move_employee(employee_id=1, position=99)
```

#### Mocking External Services

```python
from unittest.mock import patch

def test_upload_file(test_client):
    """Test file upload with mocked parser."""
    with patch("ninebox.services.parser.parse_excel") as mock_parse:
        mock_parse.return_value = [Employee(id=1, name="Test")]

        response = test_client.post("/api/upload", files={"file": "test.xlsx"})

        assert response.status_code == 200
        mock_parse.assert_called_once()
```

#### Parametrized Tests (use sparingly)

```python
import pytest

@pytest.mark.parametrize("performance,potential,expected", [
    (4, 4, "high_performer"),
    (3, 3, "standard"),
    (2, 2, "low_performer"),
])
def test_status_determination(performance, potential, expected):
    employee = Employee(id=1, performance=performance, potential=potential)
    assert calculate_status(employee) == expected
```

### Frontend (Vitest + React Testing Library)

#### Basic Component Test

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/utils';
import Button from '@/components/Button';

describe('Button', () => {
  it('displays label when rendered', () => {
    render(<Button label="Click me" />);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
});
```

#### Testing User Interactions

```typescript
import { render, screen, fireEvent } from '@/test/utils';
import { vi } from 'vitest';

it('calls onClick handler when clicked', () => {
  const handleClick = vi.fn();
  render(<Button onClick={handleClick} label="Click" />);

  fireEvent.click(screen.getByRole('button'));
  expect(handleClick).toHaveBeenCalled();
});
```

#### Testing Async Behavior

```typescript
import { render, screen, waitFor } from '@/test/utils';

it('displays data after loading', async () => {
  render(<DataList />);

  // Initially shows loading
  expect(screen.getByText(/loading/i)).toBeInTheDocument();

  // Eventually shows data
  await waitFor(() => {
    expect(screen.getByText('Item 1')).toBeInTheDocument();
  });
});
```

#### Mocking Functions

```typescript
import { vi } from 'vitest';

const mockCallback = vi.fn();
const mockCallback2 = vi.fn().mockReturnValue('mocked result');

// Verify calls
expect(mockCallback).toHaveBeenCalled();
expect(mockCallback).toHaveBeenCalledWith(arg1, arg2);
expect(mockCallback).toHaveBeenCalledTimes(3);
expect(mockCallback2).toHaveBeenCalledOnce();
```

#### Testing Props Variations

```typescript
it('displays different text for different props', () => {
  const { rerender } = render(<Component status="success" />);
  expect(screen.getByText('Success!')).toBeInTheDocument();

  rerender(<Component status="error" />);
  expect(screen.getByText('Error occurred!')).toBeInTheDocument();
});
```

### E2E Tests (Playwright)

#### Basic E2E Test

```typescript
import { test, expect } from '@playwright/test';
import * as path from 'path';

test.describe('Upload Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('uploads file and displays employees', async ({ page }) => {
    // Upload
    const fixturePath = path.join(__dirname, '..', 'fixtures', 'employees.xlsx');
    await page.getByTestId('upload-button').click();
    await page.locator('#file-upload-input').setInputFiles(fixturePath);
    await page.getByTestId('upload-submit-button').click();

    // Verify success
    await expect(page.getByText('Upload successful')).toBeVisible();

    // Verify grid displays
    await expect(page.getByTestId('nine-box-grid')).toBeVisible();
    const cards = page.locator('[data-testid^="employee-card-"]');
    expect(await cards.count()).toBeGreaterThan(0);
  });
});
```

#### Testing User Interactions

```typescript
test('allows dragging employee', async ({ page }) => {
  // Setup: Upload file
  const fixturePath = path.join(__dirname, '..', 'fixtures', 'employees.xlsx');
  await page.getByTestId('upload-button').click();
  await page.locator('#file-upload-input').setInputFiles(fixturePath);
  await page.getByTestId('upload-submit-button').click();

  // Get employee from box 1
  const employeeCard = page.getByTestId('grid-box-1')
    .locator('[data-testid^="employee-card-"]')
    .first();

  const employeeName = await employeeCard.getByTestId('employee-name').textContent();

  // Drag employee to box 5
  await employeeCard.dragTo(page.getByTestId('grid-box-5'));

  // Verify moved
  await expect(page.getByTestId('grid-box-5').getByText(employeeName as string)).toBeVisible();
});
```

#### Testing Forms

```typescript
test('filters by department', async ({ page }) => {
  // Upload data first
  const fixturePath = path.join(__dirname, '..', 'fixtures', 'employees.xlsx');
  await page.getByTestId('upload-button').click();
  await page.locator('#file-upload-input').setInputFiles(fixturePath);
  await page.getByTestId('upload-submit-button').click();

  // Select filter
  await page.getByTestId('dept-filter').selectOption('Engineering');
  await page.getByTestId('apply-btn').click();

  // Verify results - all cards should show Engineering
  const cards = page.locator('[data-testid^="employee-card-"]');
  const count = await cards.count();

  for (let i = 0; i < count; i++) {
    await expect(cards.nth(i)).toContainText('Engineering');
  }
});
```

#### Waiting for Elements

```typescript
test('waits for dynamic content', async ({ page }) => {
  await page.goto('/');

  // Wait for element to appear (auto-waits)
  await expect(page.getByTestId('loading')).toBeVisible();

  // Wait for element to disappear
  await expect(page.getByTestId('loading')).not.toBeVisible();

  // Wait for element with specific content
  await expect(page.getByText('Data loaded')).toBeVisible();
});
```

---

## Common Assertions

### Backend (Pytest)

```python
# Equality
assert value == expected
assert employee.name == "John"

# None checking
assert employee is not None
assert result is None

# Collections
assert len(employees) == 5
assert employee in employees
assert "Engineering" in departments

# String operations
assert "error" in error_message.lower()
assert name.startswith("John")

# Boolean
assert employee.is_active is True
assert not employee.is_deleted

# Ranges
assert 1 <= performance <= 5
assert 0.99 < percentage < 1.01

# Types
assert isinstance(employee, Employee)
assert isinstance(grid_data, dict)

# Exception checking
with pytest.raises(ValueError, match="Invalid"):
    function_that_fails()
```

### Frontend (React Testing Library)

```typescript
// Element presence
expect(element).toBeInTheDocument()
expect(element).not.toBeInTheDocument()

// Text content
expect(element).toHaveTextContent('Expected text')
expect(screen.getByText('Button')).toBeInTheDocument()

// Visibility
expect(element).toBeVisible()
expect(element).not.toBeVisible()

// Attributes
expect(element).toHaveAttribute('data-testid', 'button')
expect(element).toHaveClass('active')
expect(element).toHaveStyle('color: red')

// Form elements
expect(input).toHaveValue('typed text')
expect(checkbox).toBeChecked()
expect(button).toBeEnabled()

// Mock functions
expect(mockFn).toHaveBeenCalled()
expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2')
expect(mockFn).toHaveBeenCalledTimes(3)
expect(mockFn).toHaveBeenCalledOnce()
```

### E2E (Playwright)

```typescript
// Element visibility
await expect(page.getByTestId('btn')).toBeVisible()
await expect(page.getByTestId('btn')).not.toBeVisible()

// Text content
await expect(page.getByTestId('msg')).toHaveText('exact text')
await expect(page.getByTestId('msg')).toContainText('partial text')
await expect(page.getByText('Button text')).toBeVisible()

// Attributes and states
await expect(page.locator('input')).toHaveValue('entered text')
await expect(page.locator('input')).toBeEnabled()
await expect(page.locator('input')).toBeDisabled()
await expect(page.locator('input')).toBeFocused()
await expect(page.locator('input')).toBeChecked()

// Collections
const items = page.getByTestId('item');
await expect(items).toHaveCount(5)
expect(await items.count()).toBeGreaterThan(3)

// Custom checks
await expect(page.locator('element')).toBeVisible()  // Exists and visible
await expect(page.locator('element')).toBeHidden()   // Hidden or not in DOM
const count = await page.locator('element').count();
expect(count).toBe(0)  // Doesn't exist
```

---

## Test Data & Fixtures

### Creating Test Data

```python
# Python - using fixtures
@pytest.fixture
def sample_employee():
    return Employee(
        id=1,
        name="Alice",
        performance=4,
        potential=4,
    )

# Using in test
def test_something(sample_employee):
    assert sample_employee.name == "Alice"
```

```typescript
// TypeScript - using mockData
import { mockEmployees } from '@/test/mockData';

test('renders employees', () => {
  render(<EmployeeList employees={mockEmployees} />);
  expect(screen.getByText('Alice')).toBeInTheDocument();
});
```

### Factory Functions

```python
# Python factory
def create_employee(
    id=1,
    name="Test Employee",
    performance=3,
    potential=3,
    **kwargs
):
    return Employee(
        id=id,
        name=name,
        performance=performance,
        potential=potential,
        **kwargs
    )

# Usage
high_performer = create_employee(performance=5, potential=5)
low_performer = create_employee(performance=1, potential=1)
```

```typescript
// TypeScript factory
function createEmployee(overrides: Partial<Employee> = {}) {
  return {
    id: 1,
    name: 'Test Employee',
    performance: 3,
    potential: 3,
    ...overrides,
  };
}

// Usage
const alice = createEmployee({ name: 'Alice', performance: 5 });
const bob = createEmployee({ name: 'Bob', performance: 2 });
```

---

## Common Commands Summary

### Python Setup

```bash
# Activate venv
. .venv/bin/activate

# Run all tests
pytest

# Run with coverage
pytest --cov=backend/src

# Run specific file
pytest backend/tests/test_file.py
```

### NPM/Frontend Setup

```bash
# Install dependencies
npm install

# Run component tests
npm test

# Run E2E tests
npm run cy:run

# Open Cypress UI
npm run cy:open
```

### Code Quality

```bash
# Format code
make fix

# Run all checks
make check-all

# Type check
make type-check
```

---

## Naming Convention Reference

### Test Naming Pattern
`test_<what>_when_<condition>_then_<expected>`

### Examples

**Good:**
- `test_move_employee_when_valid_position_then_updates_grid_position`
- `test_upload_file_when_invalid_format_then_shows_error`
- `test_calculate_statistics_when_empty_dataset_then_returns_zeros`
- `test_filter_employees_when_department_selected_then_displays_filtered_list`
- `test_export_data_when_modifications_exist_then_includes_changes`

**Poor (avoid):**
- `test_move()` - Too vague
- `test_functionality()` - Doesn't explain what
- `test_error()` - Doesn't say which error
- `test_1()` - Not descriptive at all

---

## Troubleshooting

### Test Won't Run

**Python:**
```bash
# Make sure venv is activated
. .venv/bin/activate

# Check imports
python -c "import ninebox"

# Check test file exists
ls backend/tests/test_module/test_file.py
```

**Frontend:**
```bash
# Make sure dependencies installed
npm install

# Check test file exists
ls frontend/src/components/__tests__/Component.test.tsx

# Clear node_modules if issues
rm -rf node_modules
npm install
```

### Test Failing

1. **Read the error message** - It usually tells you exactly what's wrong
2. **Run test with verbose output** - `pytest -v` or `npm test -- --reporter=verbose`
3. **Check test data** - Are fixtures returning correct data?
4. **Verify assertions** - Is assertion testing the right thing?
5. **Check dependencies** - Are all required mocks set up?

### Test Flakiness

**Usually caused by:**
- Timing issues (use `waitFor` instead of `sleep`)
- Random data (use fixtures with fixed data)
- Shared state (use fresh data per test)
- External dependencies (mock them)

**Solutions:**
- Run test multiple times: `pytest --count 10`
- Check for timing: Look for `sleep()` calls
- Verify isolation: Run test in isolation
- Check mocks: Ensure all external calls mocked

### Coverage Not Updating

```bash
# Python - clear coverage cache
rm -rf .coverage htmlcov/

# Frontend - clear cache
rm -rf coverage/

# Re-run with coverage
pytest --cov --cov-report=html
npm run test:coverage
```

---

## Performance Targets

| Test Type | Target | Max |
|-----------|--------|-----|
| Unit (Python) | <0.5s | 1s |
| Unit (TypeScript) | <0.5s | 1s |
| Integration | <2s | 5s |
| API endpoint | <1s | 5s |
| E2E (Playwright) | <20s | 60s |
| Full suite (backend) | <2m | 5m |
| Full suite (frontend) | <1m | 2m |

If tests exceed these targets, optimize by:
- Using mocks for slow operations
- Running tests in parallel
- Reducing test data size
- Eliminating unnecessary setup/teardown

---

## Getting Help

- **Unsure of test type?** See "Test Type Selection Guide" in testing-checklist.md
- **Can't find assertion you need?** Check the assertions section above
- **Test too complex?** Break into multiple simpler tests
- **Don't know what to test?** Ask: "What would break this feature?"
- **Need detailed guidance?** See `test-principles.md`

---

## Links to Detailed Documentation

- **Test Principles**: `test-principles.md` - Comprehensive testing philosophy
- **Testing Checklist**: `testing-checklist.md` - Pre-writing and pre-commit checklists
- **Test Templates**: `templates/` directory - Code examples for all test types
- **Project Testing Guide**: `.github/agents/test.md` - Detailed backend testing strategies
- **CLAUDE.md**: Root file - General project testing commands

**Remember:** Good tests are an investment in reliability and maintainability. Take time to write them well!
