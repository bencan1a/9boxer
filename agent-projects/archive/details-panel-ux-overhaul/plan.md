# Details Panel UX Overhaul

```yaml
status: done
owner: Claude Code
created: 2025-12-24
updated: 2025-12-25
completed: 2025-12-25
summary:
  - Comprehensive UX improvements to the Details panel ✅
  - Enhanced Current Assessment with box info and changes display ✅
  - Flags UI for employee tagging and filtering (backend already complete) ✅
  - Reporting Chain interactive filtering ✅
  - Bug fixes for promotion checkbox and performance history layout ✅
  - All component tests passing (100%) ✅
  - E2E test selectors fixed (strict mode violations resolved) ✅
  - Documentation tasks consolidated in issue #36 ✅
dependencies:
  - TrackableEvent architecture (✅ complete - provides flags backend)
estimated_time: 12-16 hours
actual_time: ~10 hours (implementation + testing)
```

## Overview

Overhaul the Details panel (right sidebar) to provide better visibility into employee status, changes, and enable more powerful filtering and tagging capabilities.

## Problem Statement

Current Details panel has several UX issues:
1. Current Assessment doesn't show full grid information (box name, performance/potential ratings)
2. Changes only shown as a badge - no details about what changed
3. Performance History layout is misaligned (content too far right)
4. Promotion Ready is limited - need broader tagging capabilities
5. Promotion checkbox bug - unchecking doesn't clear modified flag
6. Reporting Chain is static - clicking managers should enable filtering

## Requirements

### 1. Enhanced Current Assessment Display
- Show box name (e.g., "High Performer")
- Show performance rating (H/M/L) with grid color coding
- Show potential rating (H/M/L) with grid color coding
- Show grid coordinates (e.g., [H,H])
- Match visual style with grid boxes

### 2. Changes Display in Current Assessment
- Reuse the changes table component from ChangeTrackerTab
- Show all changes for selected employee (normal + donut + future change types)
- Display in Current Assessment section (not separate section)
- Include movement arrows and notes

### 3. Flags System
**Backend Status:** ✅ **COMPLETE** (implemented with TrackableEvent architecture)
- Predefined flags defined in `backend/src/ninebox/models/constants.py`:
  - promotion_ready, flagged_for_discussion, flight_risk, new_hire
  - succession_candidate, pip, high_retention_priority, ready_for_lateral_move
- Employee model has `flags: list[str] | None` field with validation
- Event tracking with FlagAddEvent and FlagRemoveEvent
- Persist with session (in-memory) ✅
- Export to Excel (needs UI implementation)

**UI:**
- Show only set flags (not all possible flags)
- Add picker/dropdown to add new flags
- Remove flags by clicking X on chip
- Display flag badges on employee tiles in grid
- Add flag filters in FilterDrawer

### 4. Performance History Layout Fix
- Remove `position="right"` from Timeline
- Use default left alignment
- Ensure proper spacing and readability

### 5. Promotion Checkbox Bug Fix
- When unchecking, clear `modified_in_session` flag if no other changes exist
- Properly track promotion_readiness changes in change history

### 6. Reporting Chain Interactive Filtering
- Make manager names clickable in reporting chain
- Clicking a manager filters grid to show employees with that person in management chain
- Add visual indicator when reporting chain filter is active
- Provide clear button to remove filter
- Filter adds to existing filters (doesn't replace)

## Design Decisions

### Current Assessment Section Structure

```
┌─────────────────────────────────────────┐
│ Current Assessment                      │
│                                         │
│ Box: High Performer [H,H]              │
│ Performance: High  |  Potential: High  │
│ [High color badge] [High color badge]  │
│                                         │
│ ─────────────────────────────────────── │
│                                         │
│ Recent Changes (2)                      │
│ ┌─────────────────────────────────────┐ │
│ │ Movement:                           │ │
│ │ [Solid M,M] → [High H,H]           │ │
│ │ Notes: Promoted based on Q4...     │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ Donut Movement:                     │ │
│ │ [Inner Ring] → [Outer Ring]        │ │
│ │ Notes: High retention priority     │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

### Flags Section Structure

```
┌─────────────────────────────────────────┐
│ Flags                                   │
│                                         │
│ [Promotion Ready ×] [Flight Risk ×]    │
│ [+ Add Flag ▾]                         │
└─────────────────────────────────────────┘
```

### Reporting Chain Enhancement

```
┌─────────────────────────────────────────┐
│ Reporting Chain                         │
│                                         │
│ Henry Anderson (You)                    │
│         ↑                               │
│ [Sarah Johnson] ← Clickable            │
│         ↑                               │
│ [Bill Thompson] ← Clickable            │
└─────────────────────────────────────────┘

Active Filter Badge (in FilterDrawer):
[Reporting to: Bill Thompson ×]
```

## Implementation Plan

### Phase 1: Quick Fixes (Bug Fixes + Layout)
**Estimated: 1-2 hours**

1. **Fix Performance History Layout**
   - File: `frontend/src/components/panel/RatingsTimeline.tsx`
   - Change: Remove `position="right"` from Timeline (line 33)
   - Test: Verify layout looks correct

2. **Fix Promotion Checkbox Bug**
   - File: `frontend/src/components/panel/EmployeeDetails.tsx`
   - Logic: When unchecking, check if employee has other changes; if not, clear `modified_in_session`
   - Test: Check/uncheck promotion checkbox, verify badge behavior

### Phase 2: Current Assessment Enhancements
**Estimated: 3-4 hours**

3. **Enhance Current Assessment Display**
   - File: `frontend/src/components/panel/EmployeeDetails.tsx`
   - Add box name display with grid color
   - Show performance/potential ratings with color-coded chips
   - Add grid coordinates display [X,Y]
   - Use design tokens for colors (match grid)

4. **Add Changes Display to Current Assessment**
   - Create new component: `frontend/src/components/panel/EmployeeChangesSummary.tsx`
   - Reuse change row logic from ChangeTrackerTab
   - Filter changes to show only selected employee
   - Display in Current Assessment section
   - Handle empty state (no changes for this employee)

### Phase 3: Flags System (Frontend Only - Backend Complete)
**Estimated: 4-5 hours**

**Note:** Backend flags implementation ✅ complete via TrackableEvent architecture:
- `backend/src/ninebox/models/constants.py` - ALLOWED_FLAGS defined
- `backend/src/ninebox/models/employee.py` - flags field with validation
- `backend/src/ninebox/api/employees.py` - API endpoints handle flags via update_employee()
- `backend/src/ninebox/models/events.py` - FlagAddEvent and FlagRemoveEvent for tracking

5. **Frontend: Flags Type & Constants**
   - File: `frontend/src/types/employee.ts`
   - Add `flags?: string[]` to Employee type
   - File: `frontend/src/constants/flags.ts`
   - Define predefined flags list with display names and colors

6. **Frontend: Flags UI Component**
   - File: `frontend/src/components/panel/EmployeeFlags.tsx`
   - Display set flags as chips with remove button
   - Add flag picker dropdown
   - Call API to add/remove flags (triggers FlagAddEvent/FlagRemoveEvent)
   - Integrate into EmployeeDetails

7. **Frontend: Flag Badges on Employee Tiles**
   - File: `frontend/src/components/grid/EmployeeTile.tsx`
   - Show flag count badge (e.g., "🏷️ 2" or first flag icon)
   - Tooltip on hover showing all flags
   - Ensure badges don't interfere with drag-and-drop

8. **Frontend: Flag Filtering**
   - File: `frontend/src/components/dashboard/FilterDrawer.tsx`
   - Add "Flags" filter section
   - Multi-select checkboxes for each flag type
   - Update filtering logic in session store

### Phase 4: Reporting Chain Filtering
**Estimated: 2-3 hours**

9. **Make Reporting Chain Clickable**
   - File: `frontend/src/components/panel/ManagementChain.tsx`
   - Convert manager Papers to clickable buttons
   - Add onClick handler to set reporting chain filter
   - Visual feedback (hover state, underline)

10. **Implement Reporting Chain Filter Logic**
    - File: `frontend/src/store/sessionStore.ts`
    - Add `reportingChainFilter: string | null` state
    - Update employee filtering to check management chain fields
    - Add clear filter action

11. **Show Active Reporting Chain Filter**
    - File: `frontend/src/components/dashboard/FilterDrawer.tsx`
    - Display active reporting chain filter as chip
    - Add clear button

### Phase 5: Excel Export Enhancement
**Estimated: 1-2 hours**

12. **Add Flags to Excel Export**
    - File: `backend/src/ninebox/services/excel_exporter.py`
    - Add "Flags" column to exported Excel
    - Format flags as comma-separated list or individual columns

### Phase 6: Testing
**Estimated: 4-6 hours**

13. **Component Tests**
    - Test file: `frontend/src/components/panel/EmployeeDetails.test.tsx`
      - Current Assessment display with box info
      - Promotion checkbox bug fix
      - Flags add/remove functionality
    - Test file: `frontend/src/components/panel/EmployeeChangesSummary.test.tsx`
      - Changes filtering for selected employee
      - Empty state
    - Test file: `frontend/src/components/panel/ManagementChain.test.tsx`
      - Clickable manager names
      - Filter activation
    - Test file: `frontend/src/components/panel/RatingsTimeline.test.tsx`
      - Layout fix verification

14. **E2E Playwright Tests**
    - Test file: `frontend/playwright/e2e/details-panel-enhancements.spec.ts`
      - Upload file, select employee
      - Verify current assessment shows box info
      - Add/remove flags
      - Click manager to filter
      - Export Excel with flags
      - Verify flag badges on tiles

### Phase 7: Documentation
**Estimated: 1-2 hours**

15. **Update User Documentation**
    - File: `resources/user-guide/internal-docs/using-the-details-panel.md`
    - Document new Current Assessment features
    - Document Flags system
    - Document Reporting Chain filtering

16. **Generate Screenshots**
    - Add screenshot workflows to `frontend/playwright/screenshots/workflows/`
    - Generate screenshots for:
      - Enhanced Current Assessment
      - Flags section
      - Reporting Chain filtering

## Technical Considerations

### Design System Compliance

Following design principles from `internal-docs/design-system/`:

1. **Clarity Over Cleverness**
   - Clear labels for all flags
   - Obvious interaction affordances (clickable managers)
   - Predictable behavior

2. **Data Integrity**
   - Color coding consistent with grid
   - All flags explicitly shown
   - No hidden functionality

3. **Efficiency**
   - Inline flag editing (no modal)
   - Quick filtering via reporting chain clicks
   - Bulk operations where appropriate

4. **Accessibility**
   - All interactive elements keyboard accessible
   - Screen reader labels for flags and filters
   - Color + text/icons for status

5. **Consistency**
   - Reuse ChangeTrackerTab component
   - Match grid color scheme
   - Follow existing spacing patterns

### Component Reusability

- Extract change row rendering to shared component
- Create reusable FlagChip component
- Ensure flag picker can be used elsewhere if needed

### Performance

- Flags filtering should be efficient (indexed search)
- Reporting chain filter should use existing management chain fields
- No additional API calls for filtering (client-side)

### State Management

- Flags stored in session store (in-memory)
- Persist flags with session export/import
- Reporting chain filter in session store (ephemeral)

## Testing Strategy

### Component Tests (Vitest + React Testing Library)

1. **EmployeeDetails.test.tsx**
   - Renders box name and coordinates
   - Shows performance/potential with correct colors
   - Promotion checkbox clears modified flag when unchecked (no other changes)
   - Promotion checkbox keeps modified flag when other changes exist
   - Flags add/remove functionality
   - Flags picker opens and closes

2. **EmployeeChangesSummary.test.tsx**
   - Filters changes for selected employee
   - Shows both normal and donut changes
   - Displays empty state when no changes
   - Renders change rows correctly

3. **ManagementChain.test.tsx**
   - Renders reporting chain correctly
   - Manager names are clickable
   - Clicking manager calls filter function
   - Hover states work

4. **RatingsTimeline.test.tsx**
   - Timeline renders with left alignment
   - Content not pushed to right
   - Spacing is correct

### E2E Tests (Playwright)

1. **details-panel-enhancements.spec.ts**
   - **Test: Enhanced Current Assessment**
     - Upload employee file
     - Select employee
     - Verify box name displayed
     - Verify performance/potential chips with colors
     - Verify grid coordinates shown

   - **Test: Changes Display**
     - Upload file
     - Move employee to different box
     - Select employee
     - Verify change displayed in Current Assessment
     - Verify notes displayed

   - **Test: Flags System**
     - Select employee
     - Add flag via picker
     - Verify flag chip appears
     - Remove flag
     - Verify flag removed
     - Verify flag badge on tile in grid

   - **Test: Flag Filtering**
     - Add flags to multiple employees
     - Open FilterDrawer
     - Select flag filter
     - Verify only employees with flag shown

   - **Test: Reporting Chain Filtering**
     - Select employee with manager
     - Click manager in reporting chain
     - Verify filter applied
     - Verify only employees under that manager shown
     - Clear filter
     - Verify all employees shown again

   - **Test: Excel Export with Flags**
     - Add flags to employees
     - Export to Excel
     - Verify flags column in exported file
     - Verify flags formatted correctly

### Manual Testing Checklist

- [ ] Current Assessment displays correctly for all box types
- [ ] Changes display shows all change types (normal + donut)
- [ ] Flags can be added and removed
- [ ] Flag badges appear on tiles in grid
- [ ] Flag filtering works correctly
- [ ] Reporting chain filtering works correctly
- [ ] Excel export includes flags
- [ ] Performance history layout is correct
- [ ] Promotion checkbox bug is fixed
- [ ] All features work in light and dark modes
- [ ] Keyboard navigation works for all features
- [ ] Screen reader announces all interactive elements

## Files to Modify

### Backend
- `backend/src/ninebox/services/excel_exporter.py` - Export flags (only remaining backend task)

### Frontend Components
- `frontend/src/components/panel/EmployeeDetails.tsx` - Enhance Current Assessment, add flags
- `frontend/src/components/panel/RatingsTimeline.tsx` - Fix layout
- `frontend/src/components/panel/ManagementChain.tsx` - Add click handlers
- `frontend/src/components/dashboard/FilterDrawer.tsx` - Add flag filters, reporting chain filter
- `frontend/src/components/grid/EmployeeTile.tsx` - Add flag badges

### New Components
- `frontend/src/components/panel/EmployeeChangesSummary.tsx` - Changes display
- `frontend/src/components/panel/EmployeeFlags.tsx` - Flags UI
- `frontend/src/components/common/FlagChip.tsx` - Reusable flag chip (optional)

### Types & Constants
- `frontend/src/types/employee.ts` - Add flags field
- `frontend/src/constants/flags.ts` - Flag definitions

### Store
- `frontend/src/store/sessionStore.ts` - Add reporting chain filter, flag filtering logic

### Tests
- `frontend/src/components/panel/EmployeeDetails.test.tsx` - New tests
- `frontend/src/components/panel/EmployeeChangesSummary.test.tsx` - New file
- `frontend/src/components/panel/ManagementChain.test.tsx` - New tests
- `frontend/src/components/panel/RatingsTimeline.test.tsx` - New tests
- `frontend/playwright/e2e/details-panel-enhancements.spec.ts` - New file

### Documentation
- `resources/user-guide/internal-docs/using-the-details-panel.md` - Update

## Dependencies

No new dependencies required. Using existing:
- Material-UI components (Chip, Autocomplete for flag picker)
- React Testing Library (component tests)
- Playwright (E2E tests)

## Risks & Mitigations

### Risk: Flags data model changes
**Mitigation:** Flags are optional field, backward compatible with existing sessions

### Risk: Performance with many flags
**Mitigation:** Client-side filtering is efficient, flags are simple string arrays

### Risk: Complex reporting chain filtering logic
**Mitigation:** Leverage existing management_chain_01-06 fields, no new data needed

### Risk: Reusing ChangeTrackerTab component
**Mitigation:** Extract shared logic to new component, don't tightly couple

## Success Criteria

- [ ] Current Assessment shows box name, performance, potential with grid colors
- [ ] Changes for selected employee visible in Details tab
- [ ] Flags can be added, removed, and filtered
- [ ] Flag badges appear on employee tiles
- [ ] Clicking managers in reporting chain filters grid
- [ ] Promotion checkbox bug is fixed
- [ ] Performance history layout is corrected
- [ ] All component tests pass
- [ ] All E2E tests pass
- [ ] User documentation updated with screenshots
- [ ] Design system principles followed

## Future Enhancements (Out of Scope)

- Custom flags (user-defined)
- Flag history (who added/removed when)
- Bulk flag operations (add flag to multiple employees)
- Flag templates (preset combinations)
- Advanced reporting chain visualization (tree view)

---

## Execution Plan

### Prerequisites (✅ Complete)
- [x] TrackableEvent architecture implemented
- [x] Flags backend data model complete
- [x] FlagAddEvent and FlagRemoveEvent implemented
- [x] ALLOWED_FLAGS constants defined

### Ready to Execute
This plan is now **execution-ready**. All dependencies are complete.

**Recommended Execution Order:**
1. **Phase 1** (Quick Fixes) - Low risk, high impact
2. **Phase 2** (Current Assessment) - Visual improvements
3. **Phase 3** (Flags UI) - Connect to existing backend
4. **Phase 4** (Reporting Chain) - Filter enhancement
5. **Phase 5** (Excel Export) - Data export completion
6. **Phase 6** (Testing) - Comprehensive validation
7. **Phase 7** (Documentation) - User-facing docs

**Parallel Work Opportunities:**
- Phase 1 and Phase 2 can run in parallel (different files)
- Phase 3 tasks 5-7 can run in parallel (different components)
- Phase 6 component tests can run in parallel with E2E test development

**Critical Success Factors:**
- Follow design system tokens (no hardcoded colors/spacing)
- Reuse existing components where possible (ChangeTrackerTab logic)
- Test both light and dark modes
- Ensure keyboard accessibility
- Verify flag events appear in Change Tracker tab
