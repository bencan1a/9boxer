# Big Movers Feature - Implementation Plan

## Metadata
```yaml
status: active
owner: Claude
created: 2025-12-21
summary:
  - Add "big mover" detection for employees who moved significantly between positions
  - Display badge on employee tiles for big movers
  - Add filtering capability to show only big movers
  - Ensure dynamic updates when employees are moved via drag-and-drop
```

---

## Overview

Add a "big movers" feature to identify and highlight employees who have made substantial position changes during the current session. This provides visual feedback and filtering capability for employees with significant movement in the 9-box grid.

### Business Rules

**Big Mover Detection Logic:**
- An employee is a "big mover" if they moved **3 or more positions** in the grid
- Movement is calculated from their **original position** (before any session changes) to their **current position**
- Uses existing `session.changes` data which already tracks `old_position` and `new_position`

**Grid Position Layout:**
```
7=L,H  8=M,H  9=H,H  (High Potential)
4=L,M  5=M,M  6=H,M  (Medium Potential)
1=L,L  2=M,L  3=H,L  (Low Potential)
```

**Examples:**
- 1 (L,L) → 9 (H,H) = 8 positions = **Big Mover** ✓
- 1 (L,L) → 5 (M,M) = 4 positions = **Big Mover** ✓
- 5 (M,M) → 8 (M,H) = 3 positions = **Big Mover** ✓
- 5 (M,M) → 6 (H,M) = 1 position = Not a big mover ✗
- Employee with no changes = Not a big mover ✗

**Dynamic Behavior:**
- Badge appears when employee is moved ≥3 positions from original
- Badge disappears when moved back to within <3 positions of original
- Badge automatically removed if employee moved back to exact original position (change entry is deleted)

---

## Technical Architecture

### Data Source
**Use existing `session.changes` data** (no database schema changes needed):
- `EmployeeMove.old_position` - Original position before any session changes
- `EmployeeMove.new_position` - Current position after moves
- Movement distance: `abs(new_position - old_position)`

### Key Files to Modify

**Backend:**
- `backend/src/ninebox/services/employee_service.py` - Movement calculation utility
- `backend/src/ninebox/models/employee.py` - Add computed property (optional)
- `backend/tests/unit/services/test_employee_service.py` - Unit tests

**Frontend:**
- `frontend/src/utils/employeeUtils.ts` - Movement calculation utility
- `frontend/src/components/grid/EmployeeTile.tsx` - Badge display
- `frontend/src/store/filterStore.ts` - Filter state management
- `frontend/src/hooks/useFilters.ts` - Filter application logic
- `frontend/src/components/dashboard/FilterDrawer.tsx` - Filter UI
- `frontend/src/components/grid/__tests__/EmployeeTile.test.tsx` - Component tests

---

## Task Breakdown

### Phase 1: Backend Foundation

#### Task 1.1: Create Movement Calculation Utility
**File:** `backend/src/ninebox/services/employee_service.py`

**Objective:** Add utility function to calculate if an employee is a big mover.

**Implementation:**
```python
def is_big_mover(
    employee: Employee,
    session_changes: list[EmployeeMove],
    threshold: int = 3
) -> bool:
    """
    Determine if employee is a "big mover" based on session changes.

    Args:
        employee: The employee to check
        session_changes: List of all employee moves in current session
        threshold: Minimum position change to qualify as big mover (default: 3)

    Returns:
        True if employee moved >= threshold positions from original position

    Examples:
        >>> # Employee moved from position 1 to 9 (8 positions)
        >>> is_big_mover(employee, changes, threshold=3)
        True

        >>> # Employee moved from position 5 to 6 (1 position)
        >>> is_big_mover(employee, changes, threshold=3)
        False
    """
    # Find this employee's change entry
    change = next(
        (c for c in session_changes if c.employee_id == employee.employee_id),
        None
    )

    if not change:
        return False  # No change entry = still at original position

    # Calculate movement distance
    distance = abs(change.new_position - change.old_position)

    return distance >= threshold
```

**Acceptance Criteria:**
- [ ] Function correctly identifies big movers with threshold=3
- [ ] Returns False if no change entry exists
- [ ] Handles edge case of employee moved back to original (change entry deleted)
- [ ] Comprehensive docstring with examples
- [ ] Type annotations on all parameters

**Estimated Complexity:** Low (30 minutes)

---

#### Task 1.2: Add Backend Tests for Movement Calculation
**File:** `backend/tests/unit/services/test_employee_service.py`

**Objective:** Comprehensive unit tests for big mover detection.

**Test Cases:**
```python
class TestBigMoverDetection:
    def test_is_big_mover_when_moved_3_positions_then_returns_true(self):
        """Employee moved from position 1 to 4 (3 positions) is big mover"""

    def test_is_big_mover_when_moved_2_positions_then_returns_false(self):
        """Employee moved from position 1 to 3 (2 positions) is not big mover"""

    def test_is_big_mover_when_no_change_entry_then_returns_false(self):
        """Employee with no session changes is not big mover"""

    def test_is_big_mover_when_moved_8_positions_then_returns_true(self):
        """Employee moved from position 1 to 9 (maximum distance) is big mover"""

    def test_is_big_mover_when_custom_threshold_then_uses_threshold(self):
        """Big mover detection respects custom threshold parameter"""

    def test_is_big_mover_when_moved_backward_3_positions_then_returns_true(self):
        """Movement in any direction counts (9 → 6 is big mover)"""
```

**Acceptance Criteria:**
- [ ] All test cases pass
- [ ] Tests follow naming convention: `test_function_when_condition_then_expected`
- [ ] No conditional logic in test bodies
- [ ] Tests cover edge cases (no change, maximum distance, custom threshold)
- [ ] Tests use realistic Employee and EmployeeMove fixtures

**Estimated Complexity:** Low (45 minutes)

---

### Phase 2: Frontend Utilities

#### Task 2.1: Create Frontend Movement Calculation Utility
**File:** `frontend/src/utils/employeeUtils.ts`

**Objective:** Create utility function to calculate if an employee is a big mover (mirrors backend logic).

**Implementation:**
```typescript
import { Employee } from '@/types/employee';
import { useSessionStore } from '@/store/sessionStore';

export interface MovementInfo {
  isBigMover: boolean;
  distance: number;
  oldPosition: number | null;
  newPosition: number | null;
}

/**
 * Calculate if an employee is a "big mover" based on session changes.
 *
 * @param employee - The employee to check
 * @param threshold - Minimum position change to qualify as big mover (default: 3)
 * @returns Movement information including isBigMover flag
 *
 * @example
 * // Employee moved from position 1 to 9 (8 positions)
 * const info = calculateMovementInfo(employee);
 * console.log(info.isBigMover); // true
 * console.log(info.distance); // 8
 */
export function calculateMovementInfo(
  employee: Employee,
  threshold: number = 3
): MovementInfo {
  const sessionStore = useSessionStore.getState();
  const change = sessionStore.changes.find(
    (c) => c.employee_id === employee.employee_id
  );

  if (!change) {
    return {
      isBigMover: false,
      distance: 0,
      oldPosition: null,
      newPosition: null,
    };
  }

  const distance = Math.abs(change.new_position - change.old_position);

  return {
    isBigMover: distance >= threshold,
    distance,
    oldPosition: change.old_position,
    newPosition: change.new_position,
  };
}

/**
 * Check if an employee is a big mover (simplified version).
 */
export function isBigMover(employee: Employee, threshold: number = 3): boolean {
  return calculateMovementInfo(employee, threshold).isBigMover;
}
```

**Acceptance Criteria:**
- [ ] Function mirrors backend logic exactly
- [ ] Returns detailed MovementInfo for debugging/display
- [ ] Handles missing change entries gracefully
- [ ] Comprehensive JSDoc comments with examples
- [ ] TypeScript types properly defined
- [ ] Can be called from React components without hooks issues

**Estimated Complexity:** Low (30 minutes)

---

#### Task 2.2: Add Frontend Unit Tests for Movement Utilities
**File:** `frontend/src/utils/__tests__/employeeUtils.test.ts`

**Objective:** Test frontend movement calculation utilities.

**Test Cases:**
```typescript
describe('calculateMovementInfo', () => {
  it('returns isBigMover true when employee moved 3+ positions', () => {
    // Setup employee with change entry (position 1 → 5)
    // Assert isBigMover === true, distance === 4
  });

  it('returns isBigMover false when employee moved <3 positions', () => {
    // Setup employee with change entry (position 5 → 6)
    // Assert isBigMover === false, distance === 1
  });

  it('returns isBigMover false when no change entry exists', () => {
    // Setup employee with no changes
    // Assert isBigMover === false, distance === 0
  });

  it('calculates distance correctly for backward movement', () => {
    // Setup employee moved backward (position 9 → 5)
    // Assert distance === 4 (absolute value)
  });

  it('respects custom threshold parameter', () => {
    // Test with threshold = 5
    // Assert behavior changes accordingly
  });
});

describe('isBigMover', () => {
  it('returns true when employee is big mover', () => {
    // Simplified check
  });

  it('returns false when employee is not big mover', () => {
    // Simplified check
  });
});
```

**Acceptance Criteria:**
- [ ] All tests pass
- [ ] Tests use Vitest framework
- [ ] Mock session store state appropriately
- [ ] Cover all edge cases
- [ ] Tests are fast (<100ms total)

**Estimated Complexity:** Low (30 minutes)

---

### Phase 3: Frontend Badge Display

#### Task 3.1: Add Big Mover Badge to Employee Tile
**File:** `frontend/src/components/grid/EmployeeTile.tsx`

**Objective:** Display "Big Mover" badge on employee tiles when applicable.

**Implementation:**
```tsx
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { isBigMover } from '@/utils/employeeUtils';

// Inside EmployeeTile component (around line 80-95)
<Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
  <Chip
    label={employee.job_level}
    size="small"
  />

  {employee.modified_in_session && (
    <Chip
      label="Modified"
      size="small"
      color="secondary"
      data-testid="modified-indicator"
    />
  )}

  {isBigMover(employee) && (
    <Chip
      label="Big Mover"
      size="small"
      color="warning"
      icon={<TrendingUpIcon fontSize="small" />}
      data-testid="big-mover-indicator"
    />
  )}
</Box>
```

**Design Considerations:**
- Use `color="warning"` (orange/yellow) to make it visually distinct from "Modified" (purple)
- Use `TrendingUpIcon` to indicate movement/growth
- Add `data-testid` for testing
- Badge appears AFTER "Modified" badge if both present
- Use `flexWrap: "wrap"` to handle multiple badges gracefully

**Acceptance Criteria:**
- [ ] Badge displays correctly when employee is big mover
- [ ] Badge does not display when employee is not big mover
- [ ] Badge updates dynamically when employee is moved via drag-and-drop
- [ ] Badge styling is distinct and visually appealing
- [ ] Badge has proper test ID for E2E testing
- [ ] No performance issues (calculation happens in render efficiently)

**Estimated Complexity:** Low (20 minutes)

---

#### Task 3.2: Add Component Tests for Big Mover Badge
**File:** `frontend/src/components/grid/__tests__/EmployeeTile.test.tsx`

**Objective:** Test badge rendering logic in EmployeeTile component.

**Test Cases:**
```typescript
describe('EmployeeTile - Big Mover Badge', () => {
  it('displays big mover badge when employee moved 3+ positions', () => {
    // Mock employee with change entry (distance >= 3)
    render(<EmployeeTile employee={mockEmployee} />);
    expect(screen.getByTestId('big-mover-indicator')).toBeInTheDocument();
  });

  it('does not display badge when employee moved <3 positions', () => {
    // Mock employee with small change (distance < 3)
    render(<EmployeeTile employee={mockEmployee} />);
    expect(screen.queryByTestId('big-mover-indicator')).not.toBeInTheDocument();
  });

  it('does not display badge when employee has no changes', () => {
    // Mock employee with no change entry
    render(<EmployeeTile employee={mockEmployee} />);
    expect(screen.queryByTestId('big-mover-indicator')).not.toBeInTheDocument();
  });

  it('displays both modified and big mover badges when applicable', () => {
    // Mock employee with modified=true and big mover=true
    render(<EmployeeTile employee={mockEmployee} />);
    expect(screen.getByTestId('modified-indicator')).toBeInTheDocument();
    expect(screen.getByTestId('big-mover-indicator')).toBeInTheDocument();
  });

  it('badge includes trending up icon', () => {
    // Verify icon is present
    render(<EmployeeTile employee={mockEmployee} />);
    const badge = screen.getByTestId('big-mover-indicator');
    expect(badge.querySelector('svg')).toBeInTheDocument();
  });
});
```

**Acceptance Criteria:**
- [ ] All tests pass
- [ ] Tests use React Testing Library
- [ ] Mock session store state correctly
- [ ] Tests cover all badge display scenarios
- [ ] Tests verify visual elements (icon, text, color)

**Estimated Complexity:** Medium (45 minutes)

---

### Phase 4: Filtering System

#### Task 4.1: Add Big Mover Filter State Management
**File:** `frontend/src/store/filterStore.ts`

**Objective:** Add state management for "show big movers only" filter.

**Implementation:**
```typescript
interface FilterState {
  // ... existing state
  selectedLevels: string[];
  selectedJobFunctions: string[];
  selectedLocations: string[];
  selectedManagers: string[];
  excludedEmployeeIds: number[];

  // NEW: Big movers filter
  showBigMoversOnly: boolean;
}

interface FilterActions {
  // ... existing actions
  toggleLevel: (level: string) => void;
  toggleJobFunction: (jobFunction: string) => void;

  // NEW: Big movers actions
  toggleBigMoversFilter: () => void;

  // Update existing actions
  clearAllFilters: () => void;
  hasActiveFilters: () => boolean;
}

// Implementation
export const useFilterStore = create<FilterState & FilterActions>((set, get) => ({
  // ... existing state
  showBigMoversOnly: false,

  // NEW: Toggle big movers filter
  toggleBigMoversFilter: () => {
    set((state) => ({
      showBigMoversOnly: !state.showBigMoversOnly,
    }));
  },

  // UPDATE: Clear all filters (include new filter)
  clearAllFilters: () => {
    set({
      selectedLevels: [],
      selectedJobFunctions: [],
      selectedLocations: [],
      selectedManagers: [],
      excludedEmployeeIds: [],
      showBigMoversOnly: false, // NEW
    });
  },

  // UPDATE: Check if any filters active (include new filter)
  hasActiveFilters: () => {
    const state = get();
    return (
      state.selectedLevels.length > 0 ||
      state.selectedJobFunctions.length > 0 ||
      state.selectedLocations.length > 0 ||
      state.selectedManagers.length > 0 ||
      state.excludedEmployeeIds.length > 0 ||
      state.showBigMoversOnly // NEW
    );
  },
}));
```

**Acceptance Criteria:**
- [ ] `showBigMoversOnly` state added and initialized to false
- [ ] `toggleBigMoversFilter()` action toggles the state
- [ ] `clearAllFilters()` resets big movers filter
- [ ] `hasActiveFilters()` includes big movers filter in check
- [ ] State persists across component re-renders
- [ ] No breaking changes to existing filter functionality

**Estimated Complexity:** Low (15 minutes)

---

#### Task 4.2: Update Filter Application Logic
**File:** `frontend/src/hooks/useFilters.ts`

**Objective:** Apply big movers filter when filtering employee list.

**Implementation:**
```typescript
import { isBigMover } from '@/utils/employeeUtils';

const applyFilters = (employees: Employee[]): Employee[] => {
  const {
    selectedLevels,
    selectedJobFunctions,
    selectedLocations,
    selectedManagers,
    excludedEmployeeIds,
    showBigMoversOnly, // NEW
  } = useFilterStore.getState();

  return employees.filter((emp) => {
    // ... existing filters (levels, job functions, etc.)

    // NEW: Big movers filter
    if (showBigMoversOnly && !isBigMover(emp)) {
      return false;
    }

    // ... existing exclusions filter

    return true;
  });
};
```

**Acceptance Criteria:**
- [ ] Filter correctly excludes non-big-movers when active
- [ ] Filter has no effect when inactive (showBigMoversOnly = false)
- [ ] Filter works in combination with other filters
- [ ] Filter recalculates dynamically when employees are moved
- [ ] No performance degradation with filter active

**Estimated Complexity:** Low (15 minutes)

---

#### Task 4.3: Add Big Movers Filter UI Control
**File:** `frontend/src/components/dashboard/FilterDrawer.tsx`

**Objective:** Add checkbox to filter drawer for big movers filter.

**Implementation:**
```tsx
import { useFilterStore } from '@/store/filterStore';

// Inside FilterDrawer component (add after existing filter sections)
<Accordion>
  <AccordionSummary>
    <Typography variant="subtitle2" fontWeight="bold">
      Movement
      {showBigMoversOnly && (
        <Chip
          label="1"
          size="small"
          sx={{ ml: 1 }}
        />
      )}
    </Typography>
  </AccordionSummary>
  <AccordionDetails>
    <FormGroup>
      <FormControlLabel
        control={
          <Checkbox
            checked={showBigMoversOnly}
            onChange={toggleBigMoversFilter}
            data-testid="big-movers-filter-checkbox"
          />
        }
        label="Show Big Movers Only"
      />
      <Typography variant="caption" color="text.secondary" sx={{ ml: 4 }}>
        Employees who moved 3+ positions from their original placement
      </Typography>
    </FormGroup>
  </AccordionDetails>
</Accordion>
```

**Design Considerations:**
- Add as new accordion section titled "Movement"
- Show count badge when filter is active
- Include helpful description text explaining what "big movers" means
- Use consistent styling with existing filter sections
- Place after existing filters but before "Clear All Filters" button

**Acceptance Criteria:**
- [ ] Checkbox displays correctly in filter drawer
- [ ] Checkbox state syncs with filter store
- [ ] Count badge appears when filter is active
- [ ] Description text is clear and helpful
- [ ] UI matches existing filter section styling
- [ ] Proper test ID for E2E testing
- [ ] Accessible (keyboard navigation, screen readers)

**Estimated Complexity:** Low (20 minutes)

---

#### Task 4.4: Add Tests for Filter Functionality
**File:** `frontend/src/hooks/__tests__/useFilters.test.ts` (create if doesn't exist)

**Objective:** Test big movers filter logic.

**Test Cases:**
```typescript
describe('useFilters - Big Movers Filter', () => {
  it('returns all employees when big movers filter is off', () => {
    // Setup 5 employees, 2 are big movers
    // Assert filtered list has 5 employees
  });

  it('returns only big movers when filter is active', () => {
    // Setup 5 employees, 2 are big movers
    // Enable showBigMoversOnly
    // Assert filtered list has 2 employees
  });

  it('combines big movers filter with other filters', () => {
    // Setup employees with various attributes
    // Enable both level filter and big movers filter
    // Assert filtered list has correct intersection
  });

  it('updates filtered list when employee becomes big mover', () => {
    // Start with employee not being big mover
    // Move employee to become big mover
    // Enable filter
    // Assert employee now appears in filtered list
  });

  it('updates filtered list when employee stops being big mover', () => {
    // Start with employee being big mover
    // Move employee back (no longer big mover)
    // Enable filter
    // Assert employee no longer appears in filtered list
  });
});
```

**Acceptance Criteria:**
- [ ] All tests pass
- [ ] Tests use Vitest framework
- [ ] Mock session store and filter store appropriately
- [ ] Tests verify filter logic in isolation
- [ ] Tests verify filter combination logic
- [ ] Tests verify dynamic updates

**Estimated Complexity:** Medium (45 minutes)

---

### Phase 5: Integration & End-to-End Testing

#### Task 5.1: Add E2E Tests for Big Mover Feature
**File:** `frontend/playwright/e2e/big-mover-flow.spec.ts` (new file)

**Objective:** Test complete big mover workflow end-to-end.

**Test Scenarios:**
```typescript
import { test, expect } from '@playwright/test';
import { uploadExcelFile } from '../helpers/upload';

test.describe('Big Mover Feature', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await uploadExcelFile(page, 'sample-employees.xlsx');
  });

  test('displays big mover badge when employee moved 3+ positions', async ({ page }) => {
    // Find employee in position 1
    // Drag to position 5 (4 positions = big mover)
    // Verify "Big Mover" badge appears on tile
    // Verify "Modified" badge also appears
  });

  test('does not display badge when employee moved <3 positions', async ({ page }) => {
    // Find employee in position 5
    // Drag to position 6 (1 position = not big mover)
    // Verify no "Big Mover" badge
    // Verify "Modified" badge appears (but not big mover)
  });

  test('removes badge when employee moved back near original position', async ({ page }) => {
    // Move employee from 1 → 9 (big mover badge appears)
    // Move employee back to 2 (1 position from original)
    // Verify "Big Mover" badge disappears
  });

  test('big movers filter shows only employees with 3+ position movement', async ({ page }) => {
    // Move 2 employees by 3+ positions
    // Move 2 employees by <3 positions
    // Open filter drawer
    // Enable "Show Big Movers Only" checkbox
    // Verify grid shows only 2 employees
  });

  test('big movers filter updates dynamically when employees moved', async ({ page }) => {
    // Enable "Show Big Movers Only" filter
    // Verify grid is empty (no big movers yet)
    // Move employee 3+ positions
    // Verify employee immediately appears in grid
    // Move employee back
    // Verify employee immediately disappears from grid
  });

  test('big movers filter combines with other filters', async ({ page }) => {
    // Move employees from different levels
    // Enable level filter (e.g., only MT4)
    // Enable big movers filter
    // Verify only MT4 big movers appear
  });

  test('clear all filters resets big movers filter', async ({ page }) => {
    // Enable big movers filter
    // Click "Clear All Filters"
    // Verify checkbox is unchecked
    // Verify all employees visible again
  });
});
```

**Acceptance Criteria:**
- [ ] All E2E tests pass
- [ ] Tests use Playwright framework
- [ ] Tests verify complete user workflows
- [ ] Tests verify visual elements (badges, filters)
- [ ] Tests verify dynamic updates
- [ ] Tests verify filter combinations
- [ ] Tests use helpers from `playwright/helpers/`
- [ ] Tests are reliable (no flakiness)

**Estimated Complexity:** High (2 hours)

---

#### Task 5.2: Manual Testing Checklist
**Objective:** Verify feature works correctly across different scenarios.

**Manual Test Cases:**

**Badge Display:**
- [ ] Badge appears when employee moved 3+ positions
- [ ] Badge does not appear when moved <3 positions
- [ ] Badge appears with trending up icon
- [ ] Badge has distinct color (orange/yellow)
- [ ] Badge and "Modified" badge can coexist
- [ ] Badge is readable and properly sized

**Dynamic Updates:**
- [ ] Moving employee 1→5 shows badge
- [ ] Moving employee 5→6 does not show badge
- [ ] Moving employee 1→9→2 removes badge (back near original)
- [ ] Moving employee 1→9→1 removes badge and "Modified" indicator
- [ ] Badge updates immediately on drag-and-drop (no delay)

**Filtering:**
- [ ] Filter checkbox appears in filter drawer
- [ ] Enabling filter shows only big movers
- [ ] Disabling filter shows all employees
- [ ] Filter count badge appears when active
- [ ] Filter combines with level filter correctly
- [ ] Filter combines with job function filter correctly
- [ ] "Clear All Filters" resets big movers filter
- [ ] Filter updates dynamically when employees moved

**Edge Cases:**
- [ ] No employees moved = filter shows empty grid
- [ ] All employees are big movers = filter shows all
- [ ] Upload new file clears previous big mover badges
- [ ] Session reset clears big mover badges
- [ ] Refresh page preserves session state (if implemented)

**Performance:**
- [ ] No lag when dragging employees
- [ ] Filter applies instantly (<100ms)
- [ ] Badge rendering is fast (no flicker)
- [ ] Large datasets (100+ employees) perform well

**Accessibility:**
- [ ] Filter checkbox is keyboard accessible (Tab + Space)
- [ ] Badge has proper ARIA labels (if needed)
- [ ] Screen reader announces filter state changes
- [ ] Color contrast meets WCAG AA standards

**Estimated Complexity:** Medium (1 hour)

---

### Phase 6: Documentation & Polish

#### Task 6.1: Update User Guide Documentation
**File:** `USER_GUIDE.md`

**Objective:** Document the big movers feature for end users.

**Section to Add:**
```markdown
## Big Movers

The Big Movers feature helps you identify employees who have made significant position changes during your current session.

### What is a Big Mover?

An employee is flagged as a "Big Mover" when they've been moved **3 or more positions** from their original placement in the 9-box grid. This indicates a substantial change in their performance or potential assessment.

**Examples:**
- Moving from **Low/Low (position 1)** to **High/High (position 9)** = 8 positions → **Big Mover** ✓
- Moving from **Low/Low (position 1)** to **Medium/Medium (position 5)** = 4 positions → **Big Mover** ✓
- Moving from **Medium/Medium (position 5)** to **High/Medium (position 6)** = 1 position → Not a big mover

### Visual Indicator

Big Movers are marked with an orange **"Big Mover"** badge with a trending up icon (📈) on their employee tile. This badge appears alongside the "Modified" badge if present.

### Filtering Big Movers

To view only employees who are big movers:

1. Click the **Filter** button in the toolbar
2. Expand the **Movement** section
3. Check **"Show Big Movers Only"**
4. The grid will update to show only employees who moved 3+ positions

The filter works in combination with other filters (e.g., you can filter for "MT4 Big Movers").

### Dynamic Updates

The Big Mover badge updates in real-time as you move employees:
- Moving an employee 3+ positions from their original spot adds the badge
- Moving them back closer to their original position removes the badge
- If you move an employee back to their exact original position, both the "Modified" and "Big Mover" badges disappear

### Tips

- Use the Big Movers filter to review all significant assessment changes before finalizing
- Export your data to track big movers over multiple review periods
- Consider documenting the rationale for significant position changes in the employee notes
```

**Acceptance Criteria:**
- [ ] Documentation is clear and user-friendly
- [ ] Includes concrete examples with position numbers
- [ ] Explains visual indicators (badge, icon, color)
- [ ] Documents filtering functionality
- [ ] Explains dynamic update behavior
- [ ] Includes usage tips
- [ ] Screenshots added (if possible)
- [ ] Integrated into existing USER_GUIDE structure

**Estimated Complexity:** Low (30 minutes)

---

#### Task 6.2: Update Developer Documentation
**File:** `internal-docs/features/big-movers.md` (new file)

**Objective:** Document technical implementation for developers.

**Content:**
```markdown
# Big Movers Feature - Technical Documentation

## Overview
The Big Movers feature identifies employees who have moved 3+ grid positions from their original placement during the current session.

## Architecture

### Data Flow
1. User drags employee to new position
2. `NineBoxGrid.handleDragEnd()` calls `moveEmployee()` API
3. Backend `SessionManager.move_employee()` updates `session.changes`
4. Frontend `sessionStore` updates employee state
5. `EmployeeTile` re-renders, calculates `isBigMover()`, displays badge

### Movement Calculation
- **Distance**: `abs(new_position - old_position)`
- **Threshold**: 3 positions (configurable)
- **Data Source**: `session.changes[].{old_position, new_position}`

### Grid Position Layout
```
7=L,H  8=M,H  9=H,H  (High Potential)
4=L,M  5=M,M  6=H,M  (Medium Potential)
1=L,L  2=M,L  3=H,L  (Low Potential)
```

## Implementation Details

### Backend
**File**: `backend/src/ninebox/services/employee_service.py`
```python
def is_big_mover(employee, session_changes, threshold=3) -> bool:
    change = find_change_for_employee(employee, session_changes)
    if not change:
        return False
    distance = abs(change.new_position - change.old_position)
    return distance >= threshold
```

### Frontend
**File**: `frontend/src/utils/employeeUtils.ts`
```typescript
export function isBigMover(employee: Employee, threshold = 3): boolean {
  const change = sessionStore.changes.find(c => c.employee_id === employee.id);
  if (!change) return false;
  const distance = Math.abs(change.new_position - change.old_position);
  return distance >= threshold;
}
```

### Components
- **Badge**: `EmployeeTile.tsx` - Material-UI Chip with TrendingUpIcon
- **Filter**: `FilterDrawer.tsx` - Checkbox in "Movement" accordion
- **State**: `filterStore.ts` - `showBigMoversOnly` boolean

## Testing

### Unit Tests
- `test_is_big_mover_when_moved_3_positions_then_returns_true`
- `test_is_big_mover_when_moved_2_positions_then_returns_false`
- `test_is_big_mover_when_no_change_entry_then_returns_false`

### E2E Tests
- Badge display on 3+ position movement
- Badge removal on move back
- Filter shows only big movers
- Dynamic updates on drag-and-drop

## Future Enhancements
- [ ] Add threshold configuration in settings
- [ ] Track big movers across sessions (persist to database)
- [ ] Add "prior_performance/prior_potential" fields for period-over-period tracking
- [ ] Show movement direction (up vs. down) with different icons
- [ ] Export big movers list to Excel
```

**Acceptance Criteria:**
- [ ] Technical architecture documented
- [ ] Data flow explained
- [ ] Code examples provided
- [ ] Testing approach documented
- [ ] Future enhancements listed
- [ ] File paths and line numbers referenced

**Estimated Complexity:** Low (30 minutes)

---

#### Task 6.3: Update CHANGELOG.md
**File:** `CHANGELOG.md`

**Objective:** Document new feature in changelog.

**Entry to Add:**
```markdown
## [Unreleased]

### Added
- **Big Movers Feature**: Identify and filter employees who moved 3+ positions from their original placement
  - Visual badge indicator on employee tiles with trending up icon
  - "Show Big Movers Only" filter in filter drawer
  - Real-time badge updates when employees are moved via drag-and-drop
  - Movement distance calculated from original position tracked in session changes
  - Badge automatically removed when employee moved back within 2 positions of original
```

**Acceptance Criteria:**
- [ ] Entry follows existing CHANGELOG format
- [ ] Categorized under "Added"
- [ ] Describes user-facing functionality
- [ ] Mentions key features (badge, filter, dynamic updates)

**Estimated Complexity:** Trivial (5 minutes)

---

## Task Dependencies

```
Phase 1 (Backend)
├── Task 1.1: Movement calculation utility
└── Task 1.2: Backend tests
    ↓
Phase 2 (Frontend Utils)
├── Task 2.1: Frontend movement utility
└── Task 2.2: Frontend utility tests
    ↓
Phase 3 (Badge Display)
├── Task 3.1: Add badge to EmployeeTile
└── Task 3.2: Component tests
    ↓
Phase 4 (Filtering)
├── Task 4.1: Filter state management
├── Task 4.2: Filter application logic
├── Task 4.3: Filter UI control
└── Task 4.4: Filter tests
    ↓
Phase 5 (Integration)
├── Task 5.1: E2E tests
└── Task 5.2: Manual testing
    ↓
Phase 6 (Documentation)
├── Task 6.1: User guide
├── Task 6.2: Developer docs
└── Task 6.3: Changelog
```

---

## Total Estimated Effort

| Phase | Tasks | Estimated Time |
|-------|-------|---------------|
| Phase 1: Backend Foundation | 2 tasks | 1.25 hours |
| Phase 2: Frontend Utilities | 2 tasks | 1 hour |
| Phase 3: Badge Display | 2 tasks | 1 hour |
| Phase 4: Filtering System | 4 tasks | 2 hours |
| Phase 5: Integration Testing | 2 tasks | 3 hours |
| Phase 6: Documentation | 3 tasks | 1 hour |
| **TOTAL** | **15 tasks** | **9.25 hours** |

---

## Success Criteria

### Functional Requirements
- [x] Badge displays on tiles when employee moved 3+ positions
- [x] Badge does not display when moved <3 positions
- [x] Filter checkbox in filter drawer works correctly
- [x] Filter shows only big movers when enabled
- [x] Filter combines with other filters (levels, job functions, etc.)
- [x] Badge updates dynamically on drag-and-drop
- [x] Badge removed when employee moved back near original position
- [x] "Clear All Filters" resets big movers filter

### Technical Requirements
- [x] All unit tests pass (backend + frontend)
- [x] All component tests pass
- [x] All E2E tests pass
- [x] No performance degradation with filter active
- [x] TypeScript types properly defined
- [x] Code follows existing patterns and conventions
- [x] No breaking changes to existing functionality

### Quality Requirements
- [x] Code coverage >80% for new code
- [x] All linting checks pass (ruff, ESLint)
- [x] All type checks pass (mypy, pyright, TypeScript)
- [x] Documentation complete (user guide + developer docs)
- [x] Accessibility requirements met (keyboard nav, ARIA labels)
- [x] Manual testing checklist completed

---

## Rollout Plan

### Phase 1: Development (Tasks 1.1 - 4.4)
1. Implement backend utilities and tests
2. Implement frontend utilities and tests
3. Implement badge display and tests
4. Implement filtering and tests
5. Ensure all unit/component tests pass

### Phase 2: Integration Testing (Tasks 5.1 - 5.2)
1. Write and run E2E tests
2. Perform manual testing
3. Fix any issues discovered
4. Verify all acceptance criteria met

### Phase 3: Documentation (Tasks 6.1 - 6.3)
1. Update user guide
2. Write developer documentation
3. Update changelog
4. Generate updated USER_GUIDE.html

### Phase 4: Review & Deploy
1. Code review by team
2. Final QA pass
3. Merge to main
4. Deploy to production

---

## Risk Assessment

### Low Risk
- **Backend utility function**: Simple calculation, well-tested pattern
- **Frontend utility function**: Mirrors backend, straightforward logic
- **Badge display**: Follows existing "Modified" badge pattern
- **Filter state management**: Extends proven Zustand pattern

### Medium Risk
- **Filter application logic**: Must integrate with existing complex filter chain
- **Dynamic updates**: Ensure re-renders don't cause performance issues
- **E2E tests**: Drag-and-drop tests can be flaky if not written carefully

### Mitigation Strategies
- Follow existing patterns closely (reduces integration risk)
- Add comprehensive unit tests before integration tests
- Use React.memo() if badge calculation causes performance issues
- Use Playwright's auto-wait features for reliable E2E tests
- Manual testing checklist ensures real-world scenarios covered

---

## Open Questions

1. **Threshold Configuration**: Should the "3 positions" threshold be configurable by users, or hard-coded?
   - **Recommendation**: Hard-code for v1, add settings option in future enhancement

2. **Badge Text**: Use "Big Mover" or alternative (e.g., "Major Change", "Significant Move")?
   - **Recommendation**: "Big Mover" - concise, clear, matches business language

3. **Icon Choice**: TrendingUpIcon, ShowChartIcon, or BoltIcon?
   - **Recommendation**: TrendingUpIcon - universally understood as "upward movement"

4. **Color Choice**: warning (orange), error (red), or info (blue)?
   - **Recommendation**: warning (orange) - attention-grabbing but not alarming

5. **Filter Placement**: Separate "Movement" section or add to existing section?
   - **Recommendation**: Separate section - allows room for future movement-related filters

6. **Historical Tracking**: Should big movers persist across sessions or only track current session?
   - **Recommendation**: Current session only for v1 (uses existing data), add persistence later

---

## Future Enhancements (Post-MVP)

### Phase 2 Features
1. **Configurable Threshold**: Allow users to set custom movement threshold in settings
2. **Movement Direction**: Different icons/colors for upward vs. downward movement
3. **Historical Tracking**: Add `prior_performance` and `prior_potential` fields to track period-over-period
4. **Export Enhancement**: Add "Big Movers" column to Excel export
5. **Statistics**: Show big mover count in statistics panel
6. **Movement Heatmap**: Visual overlay showing common movement patterns

### Technical Debt
1. **Performance Optimization**: Memoize `isBigMover()` calculation if performance issues arise
2. **Backend API**: Add `/api/employees/big-movers` endpoint for dedicated queries
3. **Database View**: Create SQL view for big movers to optimize queries

---

## Notes for Implementation

### Agent Handoff Checklist
When starting a task, the assigned agent should:
- [ ] Read this plan document completely
- [ ] Review acceptance criteria for the specific task
- [ ] Check dependencies (previous tasks must be complete)
- [ ] Read referenced files to understand existing patterns
- [ ] Run existing tests to establish baseline
- [ ] Implement feature following existing code style
- [ ] Write tests BEFORE marking task complete
- [ ] Verify all acceptance criteria met
- [ ] Update this plan with any discoveries or deviations

### Code Style Guidelines
- **Backend**: Follow existing FastAPI patterns, comprehensive docstrings, type hints
- **Frontend**: Follow existing React patterns, TypeScript strict mode, Material-UI components
- **Tests**: Follow naming convention `test_function_when_condition_then_expected`
- **Comments**: Explain "why" not "what" - code should be self-documenting

### Testing Philosophy
- Write tests FIRST for backend utilities (TDD approach)
- Test behavior, not implementation details
- No conditional logic in tests
- Aim for >80% coverage on new code
- E2E tests should verify complete user workflows

---

## Sign-off

**Plan Created By**: Claude
**Plan Created Date**: 2025-12-21
**Plan Status**: Active
**Estimated Completion**: 9.25 hours (can be completed in 2-3 work sessions)

**Next Steps**:
1. Review plan with team
2. Assign tasks to agents/developers
3. Begin with Phase 1 (Backend Foundation)
4. Track progress in task management system
5. Update plan if requirements change
