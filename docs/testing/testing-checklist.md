# Testing Checklist

This checklist helps ensure comprehensive and high-quality test coverage. Use it when writing tests or reviewing test PRs.

## Before Writing Tests

### Planning Phase
- [ ] **Read the requirements** - Understand what you're testing
- [ ] **Identify the behavior** - What is the feature supposed to do?
- [ ] **List edge cases** - What could go wrong? What are boundary conditions?
- [ ] **Choose test type** - Unit, integration, or E2E?
  - Unit: Single function/component in isolation
  - Integration: Multiple components working together
  - E2E: Complete user workflow across the app
- [ ] **Review existing tests** - Don't duplicate; follow established patterns
- [ ] **Check test principles** - Reference `test-principles.md`

### Type Selection Guide
- **Component tests** - Use React Testing Library for individual components
- **Service tests** - Use pytest for business logic
- **API tests** - Use test_client to verify endpoint behavior
- **E2E tests** - Use Playwright for complete user workflows
- **Performance** - Use pytest benchmarks or Playwright performance tools

---

## Writing Tests

### Test Structure
- [ ] **Uses Arrange-Act-Assert** - Clear three-part structure
  - Arrange: Set up test data and preconditions
  - Act: Execute the code being tested
  - Assert: Verify expected outcome
- [ ] **Single logical purpose** - One thing tested per test
- [ ] **No conditional logic** - No if/else, for loops, or while loops in test body
- [ ] **Deterministic** - Same result every time
- [ ] **Independent** - Doesn't depend on other tests or state

### Naming Convention
- [ ] **Follows pattern**: `test_<function>_when_<condition>_then_<expected>`
- [ ] **Descriptive name** - Test name explains what's being tested
- [ ] **Clear condition** - What specific scenario is being tested?
- [ ] **Clear expectation** - What should happen?

Examples:
- `test_move_employee_when_valid_position_then_updates_grid_position`
- `test_upload_file_when_invalid_format_then_shows_error_message`
- `test_calculate_statistics_when_empty_dataset_then_returns_zeros`

### Test Data
- [ ] **Uses fixtures** - Reusable test data via @pytest.fixture or @vitest
- [ ] **Realistic data** - Test data represents real scenarios
- [ ] **Minimal setup** - Only data needed for this specific test
- [ ] **No magic numbers** - Use named constants or fixtures
- [ ] **Factory functions** - For variations of test data

### Assertions
- [ ] **At least one assertion** - Every test must verify something
- [ ] **Clear assertion messages** - Should read like requirements
- [ ] **Multiple assertions OK** - If testing same concept
- [ ] **Specific assertions** - Assert exact values, not just "truthy"
- [ ] **Error message assertions** - When testing errors, verify the message

Examples of good assertions:
```python
# Good: Specific and clear
assert employee.status == "high_performer"
assert len(employees) == 5
assert "invalid input" in error_message.lower()

# Avoid: Too vague
assert employee is not None
assert result  # Too generic
```

---

## Backend Tests (Pytest)

### Test Organization
- [ ] **File location** - `backend/tests/test_module/test_feature.py`
- [ ] **Uses test classes** - Group related tests
- [ ] **Proper imports** - All necessary modules imported
- [ ] **Follows project structure** - Mirrors backend package structure

### Test Implementation
- [ ] **Uses fixtures** - `conftest.py` for shared fixtures
- [ ] **Handles database state** - Clean state before/after tests
- [ ] **Uses mocks for external** - Mock APIs, file I/O, network calls
- [ ] **Type hints** - Use type hints for parameters
- [ ] **Docstrings** - Every test has a clear docstring

### Specific Test Types

**Unit Tests:**
- [ ] **Tests single function** - Isolated from other code
- [ ] **Fast execution** - Completes in <1 second
- [ ] **No database calls** - Use mocks for data access

**Integration Tests:**
- [ ] **Tests module interaction** - Multiple components together
- [ ] **Uses real database** - Or in-memory equivalent
- [ ] **Reasonable speed** - Completes in <5 seconds

**API Tests:**
- [ ] **Uses test_client** - FastAPI test client
- [ ] **Verifies status codes** - Correct HTTP responses
- [ ] **Checks response format** - JSON structure is correct
- [ ] **Tests error cases** - 404, 400, 500 scenarios
- [ ] **Verifies database updates** - Data persists correctly

---

## Frontend Tests (Vitest + React Testing Library)

### Test Organization
- [ ] **File location** - `frontend/src/components/__tests__/ComponentName.test.tsx` or colocated
- [ ] **Proper imports** - `render`, `screen` from `@/test/utils`
- [ ] **Mock data** - Use `mockData.ts` for test data
- [ ] **Uses describe blocks** - Group related tests by component

### Component Test Guidelines
- [ ] **Tests behavior, not implementation** - Not testing React internals
- [ ] **Renders component** - Using `render()` from test utils
- [ ] **Queries by role/testid** - Using accessible selectors
- [ ] **Avoids testing types** - No type annotation tests
- [ ] **Mocks callbacks** - Uses `vi.fn()` for handlers
- [ ] **Uses translation keys** - NO hardcoded English strings in assertions

### Internationalization (i18n)
- [ ] **Uses getTranslatedText()** - Import from `@/test/i18nTestUtils`
- [ ] **No hardcoded strings** - All UI strings use translation keys
- [ ] **Tests pluralization** - Tests with different count values (1, 2, 5, 0)
- [ ] **Tests aria-labels** - Uses translated aria-label values
- [ ] **Validates keys exist** - Test fails if translation key is missing

Example:
```typescript
// ✓ GOOD: Uses translation helper
import { getTranslatedText } from '@/test/i18nTestUtils';

test('displays employee count', () => {
  render(<EmployeeCount totalCount={5} />);
  const expected = `5 ${getTranslatedText('grid.employeeCount.employee', { count: 5 })}`;
  expect(screen.getByText(expected)).toBeInTheDocument();
});

// ❌ BAD: Hardcoded English string
test('displays employee count', () => {
  render(<EmployeeCount totalCount={5} />);
  expect(screen.getByText('5 employees')).toBeInTheDocument(); // Will break!
});
```

### User Interaction
- [ ] **Tests user perspective** - How users see the component
- [ ] **Includes click tests** - User interactions via `fireEvent`
- [ ] **Tests form inputs** - User text input and selection
- [ ] **Tests keyboard** - Keyboard navigation and shortcuts
- [ ] **Tests async behavior** - Loading states and data fetching

### Mocking Strategy
- [ ] **Mocks external APIs** - Don't call real APIs
- [ ] **Mocks children** - Complex child components if needed
- [ ] **Mocks context** - Global state if needed
- [ ] **Keeps mocks minimal** - Mock only what's necessary

Example:
```typescript
const mockCallback = vi.fn();
render(<Button onClick={mockCallback} label="Click" />);
fireEvent.click(screen.getByRole('button'));
expect(mockCallback).toHaveBeenCalled();
```

---

## E2E Tests (Playwright)

### Test Organization
- [ ] **File location** - `frontend/playwright/e2e/feature-flow.spec.ts`
- [ ] **Clear feature name** - Describes workflow being tested
- [ ] **Uses test.describe block** - Groups related tests
- [ ] **beforeEach hook** - Common setup (navigation, login, etc.)
- [ ] **Uses helper functions** - Located in `frontend/playwright/helpers/`

### Workflow Testing
- [ ] **Tests complete workflow** - Full user journey, not just UI
- [ ] **Realistic user actions** - Mimics how users interact
- [ ] **Multiple steps** - Navigate → Act → Verify
- [ ] **Verifies data consistency** - Both UI and backend state
- [ ] **Tests error paths** - What happens on failure?
- [ ] **Auto-started servers** - Backend and frontend start automatically

### Selector Strategy
- [ ] **Uses getByTestId()** - Primary selector method (preferred)
- [ ] **Avoids brittle selectors** - Not CSS classes (likely to change)
- [ ] **Accessible selectors** - Uses getByRole() when appropriate
- [ ] **NO text selectors for structure** - Don't use getByText() for buttons/navigation (breaks with i18n)
- [ ] **Text selectors ONLY for language tests** - Exception: testing language switching

Example:
```typescript
// ✓ GOOD: Uses data-testid (stable across languages)
await page.getByTestId('upload-button').click();
await page.getByTestId('file-input').setInputFiles('test.xlsx');

// ✓ GOOD: Text selector for language-switching test
test('switches to Spanish', async ({ page }) => {
  await expect(page.getByText('Details')).toBeVisible(); // English
  await switchLanguage(page, 'es');
  await expect(page.getByText('Detalles')).toBeVisible(); // Spanish
});

// ❌ BAD: Text selector for structural element
await page.getByText('Filter employees').click(); // Breaks with translations!

// ❌ BAD: Brittle CSS selectors
await page.locator('.btn.btn-primary.mt-3').click();
```

### Assertions
- [ ] **Verifies UI updates** - Elements appear/disappear
- [ ] **Verifies navigation** - Correct page/view shown
- [ ] **Verifies data** - Correct data displayed
- [ ] **Verifies success** - Success messages or confirmations
- [ ] **Uses auto-waiting** - Playwright auto-waits for elements (no manual waits needed)

---

## Component Tests Checklist

### Happy Path
- [ ] **Renders correctly** - Component displays with expected content
- [ ] **Displays data** - Data props are rendered correctly
- [ ] **Shows correct state** - Initial/default state is correct

### User Interactions
- [ ] **Handles clicks** - Click handlers are called
- [ ] **Handles input** - Text input and selection work
- [ ] **Handles forms** - Form submission works
- [ ] **Disables when needed** - Disabled states work correctly

### Props Variations
- [ ] **Tests required props** - Component works with required props
- [ ] **Tests optional props** - Default values work when props omitted
- [ ] **Tests different prop values** - Various combinations tested
- [ ] **Tests prop types** - Correct rendering for different types

### Error States
- [ ] **Handles missing data** - Graceful handling of undefined/null
- [ ] **Shows error messages** - Errors are displayed
- [ ] **Doesn't crash** - Component continues to work
- [ ] **Provides recovery** - User can recover from errors

### Accessibility
- [ ] **Semantic HTML** - Using correct HTML elements
- [ ] **ARIA labels** - Labels for screen readers
- [ ] **Keyboard navigation** - Can interact via keyboard
- [ ] **Sufficient contrast** - Text is readable

---

## E2E Tests Checklist

### Primary Workflow
- [ ] **Happy path tested** - Main user journey works
- [ ] **All steps complete** - Complete workflow from start to finish
- [ ] **Data integrity** - Data persists and displays correctly
- [ ] **Navigation works** - Users can navigate through app

### Error Handling
- [ ] **Invalid input caught** - Bad data shows error
- [ ] **Error messages clear** - User understands what went wrong
- [ ] **User can recover** - Can try again or use alternative
- [ ] **Error doesn't break app** - Graceful error handling

### Multiple Workflows
- [ ] **Upload flow** - File upload to display works
- [ ] **Filter flow** - Filtering employees works
- [ ] **Edit flow** - Modifying data persists changes
- [ ] **Export flow** - Exporting data works
- [ ] **Cross-feature interactions** - Features work together

### Performance
- [ ] **Tests complete reasonably** - <30 seconds per test
- [ ] **No unnecessary waits** - Not sleeping or waiting unnecessarily
- [ ] **Responsive interactions** - App responds to user actions
- [ ] **Handles large data** - Works with realistic data volumes

---

## Before Committing Tests

### Code Quality
- [ ] **No commented-out code** - Remove all debug code
- [ ] **Proper formatting** - Follows project style (ruff for Python, prettier for TS)
- [ ] **All imports used** - No unused imports
- [ ] **Type checking passes** - `mypy` and `pyright` (Python only)
- [ ] **No linting errors** - `ruff check` passes
- [ ] **Documentation clear** - Docstrings and comments explain purpose

### Test Execution
- [ ] **All tests pass** - Run locally before committing
  - Backend: `pytest`
  - Frontend: `npm test -- --run`
  - E2E: `npm run test:e2e:pw`
- [ ] **No flaky tests** - Run 3+ times to verify consistency
- [ ] **Fast enough** - Completes in reasonable time
- [ ] **Coverage sufficient** - At least 70% on changed files

### Integration
- [ ] **Follows naming patterns** - Consistent with project
- [ ] **Uses project utilities** - `@/test/utils`, fixtures, etc.
- [ ] **Handles CI requirements** - Will pass in CI pipeline
- [ ] **No skipped tests** - Remove `.skip` or `.only`
- [ ] **No temporary code** - No debugging code left in

### Documentation
- [ ] **Test name explains purpose** - No need to read test to understand
- [ ] **Docstrings included** - Clear description of what's tested
- [ ] **Complex logic commented** - Non-obvious parts explained
- [ ] **Links to related** - References other related tests if applicable

---

## Quick Verification

Before you commit, ask yourself:

**Test Quality:**
- [ ] Is it **simple**? (No conditional logic, straightforward flow)
- [ ] Is it **isolated**? (No dependencies on other tests)
- [ ] Is it **reliable**? (Same result every time)
- [ ] Does it test **behavior**, not implementation details?

**Test Coverage:**
- [ ] Does it test the **happy path**?
- [ ] Does it test **error cases**?
- [ ] Does it test **edge cases**?
- [ ] Does it verify the **actual outcome**, not just that code ran?

**Professional Standards:**
- [ ] Does the test **name clearly describe** what's being tested?
- [ ] Is the test **fast enough** (<1s unit, <5s integration, <30s E2E)?
- [ ] Are tests **independent** and can run in any order?
- [ ] Will **future developers** understand what this test does?

If you can answer **YES** to all these questions, you're writing great tests! ✓

---

## Common Mistakes to Avoid

❌ **Testing implementation, not behavior**
- Testing private methods or internal state
- Testing React hooks directly
- Testing that variables equal certain values instead of user-visible outcomes

❌ **Over-mocking**
- Mocking business logic
- Mocking everything when you should test interactions
- Making tests test the mocks instead of the code

❌ **Flaky tests**
- Using `sleep()` or timeouts instead of waiting for elements
- Using random test data
- Not cleaning up between tests
- Timing-dependent assertions

❌ **Brittle tests**
- Using CSS classes for selectors (change frequently)
- Testing exact error message text instead of content
- Depending on specific markup structure
- Hard-coding pixel values or exact positioning

❌ **Poor test organization**
- Mixing unit, integration, and E2E in same test
- Tests that do too many things
- No clear setup/execution/verification
- Difficult to understand what's being tested

❌ **Skipping important cases**
- Only testing happy path
- Ignoring error scenarios
- Not testing edge cases
- No tests for critical functionality

---

## Resources

- **Test Principles**: See `test-principles.md` in this directory
- **Test Templates**: See `templates/` directory for code examples
- **Backend Docs**: `.github/agents/test.md` for comprehensive guidance
- **Frontend Frameworks**:
  - [Vitest Docs](https://vitest.dev/)
  - [React Testing Library](https://testing-library.com/react)
  - [Playwright Docs](https://playwright.dev/)
- **Python Testing**:
  - [Pytest Docs](https://docs.pytest.org/)
  - [Unittest Mock](https://docs.python.org/3/library/unittest.mock.html)

---

## Getting Help

- **Stuck on naming?** Use the template: `test_<what>_when_<condition>_then_<expected>`
- **Don't know how to test?** Look for similar tests in the codebase
- **Test is too complex?** Break it into multiple simpler tests
- **Test is flaky?** Review the principles on reliability and isolation
- **Not sure what to test?** Ask: "What would break the feature?"

Good luck with your tests! Remember: **Quality tests are an investment in your product's reliability.**
