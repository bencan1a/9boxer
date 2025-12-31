# 9-Box Testing Architecture

## Overview

This document defines the testing strategy and architecture for the 9-Box application, designed to be **anti-fragile** in a multi-agent development environment where AI agents independently implement features with minimal human coordination.

## Core Testing Philosophy

### Anti-Fragile Testing Principles

Tests should **survive**:
- ✅ Design system changes (colors, spacing, fonts)
- ✅ UI string changes (button labels, error messages)
- ✅ Component refactoring (internal structure changes)
- ✅ Minor API response format changes
- ✅ CSS class name changes
- ✅ Library updates

Tests should **fail on**:
- ❌ Breaking behavior changes
- ❌ Business logic errors
- ❌ Data integrity issues
- ❌ Security vulnerabilities
- ❌ Performance regressions
- ❌ Accessibility violations

### The Multi-Agent Environment Challenge

**Context**: This codebase has multiple AI agents working independently:
- Agents implement features without reviewing existing patterns
- High velocity changes across backend (Python) and frontend (React)
- Tests are written by different agents at different times
- Minimal human coordination between implementation efforts

**Solution**: Design a testing system that:
1. **Guides agents to correct patterns** through excellent documentation
2. **Survives agent mistakes** through robust test design
3. **Self-corrects over time** through architectural reviews
4. **Provides fast feedback** through intelligent test segmentation

## Test Pyramid & Speed Segmentation

### Fast Check-In Tests (Target: <60s total)
**Purpose**: Run on every save, pre-commit hook
- **Frontend Unit**: <30s (component logic, utilities, hooks)
- **Backend Unit**: <30s (isolated, no database, mocked I/O)
- **Coverage**: Core business logic, edge cases, utilities

### Comprehensive Tests (Target: <10 min total)
**Purpose**: Run in CI on every PR
- **Backend Integration**: <2 min (real database, services)
- **Backend E2E**: <3 min (full application flow)
- **Frontend E2E**: <5 min (Playwright, full user workflows)
- **Coverage**: Integration points, user workflows, regression

### Performance Tests (Target: <5 min)
**Purpose**: Run weekly, before releases
- Load testing (100+ employees per box)
- Memory profiling
- Response time benchmarks
- Bundle size analysis

## Critical Anti-Patterns to Prevent

### 1. ❌ Hardcoded Strings
```typescript
// WRONG: Test breaks when button text changes
expect(button).toHaveTextContent("Submit Form");

// RIGHT: Use test IDs or semantic queries
expect(button).toHaveAttribute('data-testid', 'submit-button');
```

### 2. ❌ Design System Specifics
```typescript
// WRONG: Test breaks when theme changes
expect(element).toHaveStyle({ backgroundColor: '#1976d2' });

// RIGHT: Test semantic intent
expect(element).toHaveAttribute('data-state', 'selected');
```

### 3. ❌ Hardcoded Test Data
```typescript
// WRONG: Test breaks when sample data changes
expect(employees[0].name).toBe("John Doe");

// RIGHT: Use factories or fixtures
const employee = createMockEmployee({ name: "Test User" });
expect(employee.name).toBe("Test User");
```

### 4. ❌ Mixed Responsibilities
```typescript
// WRONG: Drag-drop test also checks unrelated UI
test('drag employee to new box', async () => {
  await dragEmployee();
  expect(fileMenu).toContainText('Save'); // Unrelated!
  expect(newBox).toContainEmployee(employee);
});

// RIGHT: Single responsibility
test('drag employee to new box', async () => {
  await dragEmployee();
  expect(newBox).toContainEmployee(employee);
});
```

### 5. ❌ Arbitrary Timeouts
```typescript
// WRONG: Flaky timing
await page.waitForTimeout(5000);

// RIGHT: Wait for specific condition
await page.waitForSelector('[data-testid="employee-card"]');
```

### 6. ❌ Over-Mocking
```typescript
// WRONG: Mocking business logic
mockService.calculateSortOrder.mockReturnValue([...]);

// RIGHT: Use real implementation, mock I/O boundaries
const employees = [createMockEmployee(), ...];
const sorted = sortEmployees(employees);
```

### 7. ❌ Brittle Array Position Testing
```typescript
// WRONG: Test breaks when sort order changes
expect(employees[0].name).toBe("Alice");
expect(employees[1].name).toBe("Bob");

// RIGHT: Test the sorting logic, not specific positions
const names = employees.map(e => e.name);
expect(names).toEqual(expect.arrayContaining(["Alice", "Bob"]));
// Or test the sorting criteria
expect(employees[0].modified_in_session).toBe(true);
```

## Test Organization

```
frontend/
├── src/
│   ├── utils/__tests__/        # Utility function tests
│   ├── hooks/__tests__/        # Hook tests
│   └── components/
│       └── */__tests__/        # Component tests
└── playwright/
    ├── e2e/                    # E2E user workflow tests
    ├── fixtures/               # Test data and page objects
    └── helpers/                # Shared test utilities

backend/
├── tests/
│   ├── unit/                   # Fast, isolated tests
│   ├── integration/            # Multi-component tests
│   └── e2e/                    # Full application tests
└── conftest.py                 # Shared pytest fixtures
```

## Technology Stack

### Frontend Testing
- **Framework**: Vitest
- **Component Testing**: React Testing Library
- **E2E Testing**: Playwright
- **Mocking**: Vitest mocks
- **Factories**: Custom factory functions
- **Assertions**: Vitest expect + Testing Library queries

### Backend Testing
- **Framework**: Pytest
- **Coverage**: pytest-cov
- **Mocking**: pytest-mock
- **Async**: pytest-asyncio
- **Fixtures**: pytest fixtures + factory_boy
- **Fake Data**: faker

## Key Testing Patterns

### 1. Data-TestId Pattern
All interactive elements must have stable test IDs:
```typescript
<button data-testid="submit-button">Submit</button>
```

### 2. Factory Pattern for Test Data
```typescript
const employee = createMockEmployee({
  modified_in_session: true,
  flags: ['promotion_ready']
});
```

### 3. Page Object Pattern (E2E)
```typescript
class GridPage {
  async dragEmployeeToBox(employeeId: string, boxNumber: number) {
    // Implementation
  }
}
```

### 4. Semantic Queries
```typescript
// Prefer semantic queries over implementation details
screen.getByRole('button', { name: /submit/i });
screen.getByLabelText('Employee Name');
```

## Metrics & Health Monitoring

### Execution Time Metrics
- **Fast tests**: Target <60s, Alert >90s
- **Comprehensive tests**: Target <10min, Alert >15min

### Robustness Metrics
- **False positives**: <5% of test runs
- **Bugs caught**: <2 bugs per month escape to production

### Maintenance Metrics
- **Test changes per feature**: <50% lines changed ratio
- **Test debt**: <10 outstanding TODOs/skipped tests

### Coverage Metrics
- **Unit test coverage**: >80% line coverage
- **Critical path coverage**: 100% for core features
- **New code coverage**: 100% (never decrease)

## Implementation Guidelines for AI Agents

### When Writing Tests

1. **Always use data-testid** for element selection
2. **Never hardcode** strings, colors, or positions
3. **Create reusable fixtures** for test data
4. **Test behavior**, not implementation
5. **Keep tests focused** on single responsibility
6. **Use semantic waits**, not arbitrary timeouts
7. **Mock only I/O boundaries**, not business logic

### Test File Naming

- Unit tests: `*.test.ts` or `*.test.tsx`
- E2E tests: `*.spec.ts`
- Test utilities: `test-utils.ts` or `helpers.ts`
- Fixtures: `fixtures/*.ts`

### Commit Message Format

When updating tests:
```
test: add sorting validation for employee tiles
test(e2e): verify drag-drop maintains sort order
fix(test): update assertions to use data-testid
```

## Review Checklist

Before merging test changes:
- [ ] Tests use `data-testid` for element selection
- [ ] No hardcoded strings or magic values
- [ ] Tests have single responsibility
- [ ] No arbitrary timeouts
- [ ] Appropriate mocking (I/O only)
- [ ] Tests run in <60s (unit) or <10min (E2E)
- [ ] Coverage maintained or increased
- [ ] Tests pass in CI

## Related Documents

- [PRINCIPLES.md](./PRINCIPLES.md) - Detailed anti-fragile testing principles
- [PATTERNS.md](./PATTERNS.md) - Common testing patterns and examples
- [METRICS.md](./METRICS.md) - Metric definitions and tracking
