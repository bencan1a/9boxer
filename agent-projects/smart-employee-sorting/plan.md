# Smart Employee Sorting in Grid Boxes

```yaml
status: active
owner: bencan1a
created: 2025-12-30
summary:
  - Implement three-tier sorting within grid boxes to surface employees needing discussion
  - Modified employees first, flagged employees second, others third
  - Frontend-only change with performance optimization for drag-drop UX
```

## Problem Statement

Currently, employees within each 9-box grid box are displayed in the order they come from the API (loosely alphabetical by default). This causes issues when:
- **Dropping an employee**: They disappear into the alphabetical list, making it hard to find them
- **Flagging for discussion**: Important employees get buried in the list
- **Review meetings**: Hard to quickly identify which employees need discussion

Users need a sorting system that surfaces the most important employees at the top of each box.

## Solution Design

### Three-Tier Sorting Priority

Within each grid box, sort employees by:

1. **Tier 1 (Top)**: Employees with `modified_in_session: true`
   - These are employees who have been moved during the current session
   - Alphabetically sorted within tier

2. **Tier 2 (Middle)**: Employees with flags (`flags.length > 0`)
   - Includes all flag types: promotion_ready, flight_risk, new_hire, etc.
   - Alphabetically sorted within tier

3. **Tier 3 (Bottom)**: Everyone else
   - Standard employees without modifications or flags
   - Alphabetically sorted within tier

**Key Rule**: Modified status trumps flags. If an employee has both `modified_in_session: true` AND flags, they appear in Tier 1.

### Technical Approach

#### 1. Create Sorting Utility (`frontend/src/utils/sortEmployees.ts`)

```typescript
export function sortEmployees(employees: Employee[]): Employee[] {
  return [...employees].sort((a, b) => {
    // Tier 1: Modified employees first
    const aModified = a.modified_in_session ? 0 : 1;
    const bModified = b.modified_in_session ? 0 : 1;
    if (aModified !== bModified) return aModified - bModified;

    // Tier 2: Employees with flags (if not modified)
    const aHasFlags = (a.flags?.length ?? 0) > 0 ? 0 : 1;
    const bHasFlags = (b.flags?.length ?? 0) > 0 ? 0 : 1;
    if (aHasFlags !== bHasFlags) return aHasFlags - bHasFlags;

    // Tier 3: Alphabetical by name
    return a.name.localeCompare(b.name);
  });
}
```

#### 2. Apply in `useEmployees.ts` Hook

Modify the `employeesByPosition` useMemo:

```typescript
const employeesByPosition = useMemo(() => {
  const grouped: Record<number, Employee[]> = {};

  // ... existing grouping logic ...

  // Sort each group using three-tier logic
  Object.keys(grouped).forEach((key) => {
    grouped[parseInt(key)] = sortEmployees(grouped[parseInt(key)]);
  });

  return grouped;
}, [donutFilteredEmployees, donutModeActive]);
```

### Performance Considerations

- **Memoization**: Sorting happens in `useMemo`, only recalculates when employees array changes
- **Immutability**: Uses array copy (`[...employees]`) to avoid mutations
- **Complexity**: O(n log n) per box - negligible even for 100+ employees
- **Drag-Drop**: Drop triggers state update → memo recalculates → re-render with sorted list
- **No Lag**: Expected to feel instant (< 16ms for most cases)

### No Backend Changes Required

All required data already exists:
- `modified_in_session`: boolean (tracks if employee moved in current session)
- `flags`: string[] (array of flag identifiers)

This is purely a frontend display/UX improvement.

## Testing Strategy

### Unit Tests (`frontend/src/utils/__tests__/sortEmployees.test.ts`)

Test the sorting logic in isolation:
- ✅ Modified employees appear before flagged employees
- ✅ Flagged employees appear before unflagged employees
- ✅ Alphabetical sorting within each tier
- ✅ Modified + flagged employees go to Tier 1 (modified trumps flags)
- ✅ Empty arrays, single employee, all same tier
- ✅ Edge cases: null/undefined flags, special characters in names

### Component Tests (Update Existing)

**`EmployeeTileList.test.tsx`**:
- Update "maintains tile order from employees array" test to expect sorted order
- Add test: "sorts employees by three-tier priority"

**`GridBox.test.tsx`**:
- Add test: "re-sorts employees after drag-drop"
- Add test: "re-sorts employees after flag added/removed"

### Integration Tests

**`useEmployees.test.ts`** (if exists):
- Verify `employeesByPosition` returns sorted groups
- Verify sorting updates when employee modified/flagged

### E2E Tests (`frontend/playwright/e2e/`)

- **Drag-drop scenario**: Drag employee to new box → verify they appear at top
- **Flag scenario**: Add flag to employee → verify they move to tier 2
- **Visual regression**: Screenshot of box with mixed employees (modified, flagged, normal)

## Files Modified

### Created
- `frontend/src/utils/sortEmployees.ts` - Sorting utility function
- `frontend/src/utils/__tests__/sortEmployees.test.ts` - Unit tests

### Modified
- `frontend/src/hooks/useEmployees.ts` - Apply sorting to `employeesByPosition`
- `frontend/src/components/grid/__tests__/EmployeeTileList.test.tsx` - Update order tests
- E2E tests as needed

## Success Criteria

- ✅ When employee dropped into box, they appear at top (Tier 1)
- ✅ When employee flagged, they move to Tier 2 (above unflagged)
- ✅ Alphabetical sorting within each tier maintained
- ✅ No performance degradation (drop feels instant)
- ✅ All tests pass (unit, component, integration, E2E)
- ✅ Code review approved by principal-engineer
- ✅ Testing strategy approved by test-architect
- ✅ User validation confirms behavior matches expectations

## Implementation Phases

1. **Phase 1**: Create sorting utility + unit tests
2. **Phase 2**: Apply sorting in useEmployees hook
3. **Phase 3**: Update component tests for new sort order
4. **Phase 4**: Add E2E tests for sorting behavior
5. **Phase 5**: Code review and testing review
6. **Phase 6**: User validation and refinement

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Performance degradation with large datasets | Benchmark with 100+ employees per box; optimize if needed |
| Tests break due to order changes | Update test expectations systematically; ensure tests are anti-fragile |
| Sort feels jarring when employee moves | Consider smooth CSS transitions (optional enhancement) |
| Edge case: donut mode sorting | Verify donut mode respects same sorting rules |

## Open Questions

- ~~Should modified status persist across sessions?~~ → No, purely visual change
- ~~Should sorting be configurable?~~ → No, always-on feature
- ~~How to handle employees with both modified + flags?~~ → Modified trumps flags (Tier 1)

## Related Issues

- TBD: GitHub issue link will be added here

## Notes & Learnings

- Current implementation has no explicit sorting - employees appear in API order
- `EmployeeTileList` is a pass-through component - sorting must happen in parent hook
- Employee data already contains all needed fields (`modified_in_session`, `flags`)
- Drag-drop flow: `handleDragEnd` → `moveEmployee` → state update → memo recalc → re-render
