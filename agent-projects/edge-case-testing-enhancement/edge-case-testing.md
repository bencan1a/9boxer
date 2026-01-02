# Edge Case Testing Pattern

## Problem Statement

Component tests often pass with clean mock data but fail in production when encountering real-world edge cases like:
- `undefined` or `null` values in optional fields
- Empty strings
- Missing manager references (CEO level employees)
- Special characters in names
- Incomplete data structures

## Solution: Edge Case Integration Tests

### 1. Dedicated Edge Case Test Files

Create companion test files for critical hooks that process employee data:

```typescript
// Original test file
useFilters.test.ts        // Tests with clean data

// Edge case companion
useFilters.edge-cases.test.ts  // Tests with messy data
```

### 2. Edge Case Factory

Use the `edgeCaseFactory.ts` to generate realistic test data:

```typescript
import { createEdgeCaseEmployee, EdgeCaseScenario, edgeCasePresets } from '../../test/edgeCaseFactory';

// Single edge case employee
const ceo = createEdgeCaseEmployee(EdgeCaseScenario.CEO_NO_MANAGER);

// Preset datasets
const employees = edgeCasePresets.withUndefinedManagers();
```

### 3. Testing Pattern

```typescript
describe('Hook/Component - Edge Cases', () => {
  it('handles undefined managers (CEO level)', () => {
    const employees = [
      createEdgeCaseEmployee(EdgeCaseScenario.CEO_NO_MANAGER),
      // ... more employees
    ];

    const { result } = renderHook(() => useYourHook());

    // Should not crash
    expect(() => {
      result.current.processEmployees(employees);
    }).not.toThrow();
  });
});
```

## When to Use Edge Case Tests

### MUST Test with Edge Cases:
- **Data processing hooks** (`useFilters`, `useStatistics`, `useIntelligence`)
- **Components that directly render employee data** (FilterDrawer, EmployeeTile)
- **Any code that accesses optional fields** (manager, flags, location)

### Can Use Clean Data:
- **Pure UI components** (buttons, dialogs)
- **Layout components** (grids, panels)
- **Utility functions with defined inputs**

## Key Edge Cases to Test

### 1. Undefined/Null Values
```typescript
{
  manager: undefined,      // CEO or orphaned
  location: null,          // Missing data
  flags: undefined,        // Optional array
}
```

### 2. Empty Strings
```typescript
{
  manager: "",            // Blank field
  job_function: "",       // Empty selection
  notes: "",              // No notes
}
```

### 3. Special Characters
```typescript
{
  name: "O'Brien, John",           // Apostrophe, comma
  manager: "María García-López",    // Accents, hyphen
  notes: 'Said: "Ready"',          // Quotes
}
```

### 4. Unicode/International
```typescript
{
  name: "李明 (Li Ming)",          // Chinese characters
  manager: "José António",         // Portuguese
}
```

## Test Execution Speed

Edge case tests should be FAST (< 1 second total):
- Run during `npm test`
- No external dependencies
- No API calls
- Pure data transformation testing

## Example: Complete Edge Case Test

```typescript
import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useFilters } from "../useFilters";
import { edgeCasePresets } from "../../test/edgeCaseFactory";

describe("useFilters - Edge Cases", () => {
  it("survives realistic sample data with all edge cases", () => {
    const employees = edgeCasePresets.comprehensive();
    const { result } = renderHook(() => useFilters());

    // Should process without crashing
    const options = result.current.getAvailableOptions(employees);

    // Should filter out invalid values
    expect(options.managers).not.toContain(undefined);
    expect(options.managers).not.toContain("");
    expect(options.managers).not.toContain(null);

    // Should include valid managers
    expect(options.managers.length).toBeGreaterThan(0);
    options.managers.forEach(manager => {
      expect(typeof manager).toBe("string");
      expect(manager.length).toBeGreaterThan(0);
    });
  });
});
```

## Maintenance

### Monthly Review:
1. Check for new crashes in production
2. Add edge cases that caused crashes
3. Update factory with new scenarios

### Per Feature:
1. If feature touches employee data, add edge case tests
2. Run edge case tests before marking PR ready

## Migration Path

For existing components/hooks without edge case tests:

1. **Priority 1**: Hooks that crashed in production (`useFilters`)
2. **Priority 2**: Data processing hooks (`useStatistics`, `useIntelligence`)
3. **Priority 3**: Components that render employee fields directly
4. **Priority 4**: Everything else (as time permits)

## Success Metrics

- **Zero data-related crashes** in production
- **< 1 second** edge case test execution
- **100% coverage** of data processing hooks with edge cases
- **< 5 minutes** to add edge case tests for new features
