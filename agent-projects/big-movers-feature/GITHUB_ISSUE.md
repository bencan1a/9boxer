# GitHub Issue Content

**Copy the content below and paste it into GitHub's issue creation form**

---

## Title
```
Feature: Implement Big Movers Badge and Filter
```

## Body

```markdown
## Overview

Implement a "Big Movers" feature to identify and highlight employees who have made substantial position changes (3+ grid positions) during the current session. This includes visual badges on employee tiles and filtering capabilities.

## Business Requirements

**Detection Logic:**
- Employee is a "big mover" if moved **3 or more positions** from their original placement in the 9-box grid
- Examples:
  - Position 1 (L,L) → Position 9 (H,H) = 8 positions = **Big Mover** ✓
  - Position 1 (L,L) → Position 5 (M,M) = 4 positions = **Big Mover** ✓
  - Position 5 (M,M) → Position 8 (M,H) = 3 positions = **Big Mover** ✓
  - Position 5 (M,M) → Position 6 (H,M) = 1 position = Not a big mover ✗

**User-Facing Features:**
1. **Visual Badge**: Display orange "Big Mover" badge with 📈 icon on employee tiles
2. **Filtering**: Add "Show Big Movers Only" checkbox in filter drawer
3. **Dynamic Updates**: Badge appears/disappears in real-time as employees are moved via drag-and-drop
4. **Filter Combination**: Big movers filter works with existing filters (levels, job functions, etc.)

## Implementation Plan

📋 **Detailed Plan Document**: `agent-projects/big-movers-feature/plan.md`

The implementation is broken down into **15 agent-scoped tasks** across **6 phases**:

### Phase 1: Backend Foundation (1.25 hours)
- [ ] Task 1.1: Create movement calculation utility function
- [ ] Task 1.2: Add comprehensive backend unit tests

### Phase 2: Frontend Utilities (1 hour)
- [ ] Task 2.1: Create frontend movement calculation utility
- [ ] Task 2.2: Add frontend unit tests

### Phase 3: Badge Display (1 hour)
- [ ] Task 3.1: Add "Big Mover" badge to EmployeeTile component
- [ ] Task 3.2: Add component tests for badge rendering

### Phase 4: Filtering System (2 hours)
- [ ] Task 4.1: Add filter state management (Zustand store)
- [ ] Task 4.2: Update filter application logic
- [ ] Task 4.3: Add filter UI controls in FilterDrawer
- [ ] Task 4.4: Add filter functionality tests

### Phase 5: Integration Testing (3 hours)
- [ ] Task 5.1: Add Playwright E2E tests for complete workflows
- [ ] Task 5.2: Complete manual testing checklist

### Phase 6: Documentation (1 hour)
- [ ] Task 6.1: Update USER_GUIDE.md with big movers feature
- [ ] Task 6.2: Create developer documentation (internal-docs/features/big-movers.md)
- [ ] Task 6.3: Update CHANGELOG.md

## Technical Approach

**Data Source**: Uses existing `session.changes` data (no database schema changes needed!)
- `EmployeeMove.old_position` - Original position before any session changes
- `EmployeeMove.new_position` - Current position
- Movement distance: `abs(new_position - old_position)`

**Key Files to Modify**:
- Backend: `backend/src/ninebox/services/employee_service.py`
- Frontend: `frontend/src/components/grid/EmployeeTile.tsx`
- Frontend: `frontend/src/store/filterStore.ts`
- Frontend: `frontend/src/hooks/useFilters.ts`
- Frontend: `frontend/src/components/dashboard/FilterDrawer.tsx`

**Testing Strategy**:
- Unit tests for calculation utilities (backend + frontend)
- Component tests for badge rendering
- E2E tests for complete user workflows (drag-and-drop, filtering)
- Manual testing checklist for edge cases

## Acceptance Criteria

### Functional
- [ ] Badge displays on employee tiles when moved 3+ positions from original
- [ ] Badge does not display when moved <3 positions
- [ ] "Show Big Movers Only" filter checkbox works correctly
- [ ] Filter shows only big movers when enabled
- [ ] Filter combines with other filters (levels, job functions, locations, managers)
- [ ] Badge updates dynamically when employees moved via drag-and-drop
- [ ] Badge removed when employee moved back within 2 positions of original
- [ ] "Clear All Filters" button resets big movers filter

### Technical
- [ ] All unit tests pass (backend + frontend)
- [ ] All component tests pass
- [ ] All E2E tests pass
- [ ] Code coverage >80% for new code
- [ ] TypeScript strict mode passes
- [ ] All linting/formatting checks pass
- [ ] No breaking changes to existing functionality
- [ ] No performance degradation

### Quality
- [ ] User guide documentation complete
- [ ] Developer documentation complete
- [ ] Changelog updated
- [ ] Accessibility requirements met (keyboard navigation, ARIA labels)
- [ ] Manual testing checklist completed

## Estimated Effort

**Total**: 9.25 hours (2-3 work sessions)

## Labels to Add

- `enhancement` - New feature implementation
- `needs-testing` - Requires comprehensive testing
- `documentation` - Includes documentation updates
- `good first issue` - Well-scoped with clear plan (for Phase 1-2 tasks)

## Related Files

- Plan: `agent-projects/big-movers-feature/plan.md`
- Existing session tracking: `backend/src/ninebox/services/session_manager.py`
- Existing badge pattern: `frontend/src/components/grid/EmployeeTile.tsx` (Modified indicator)
- Existing filter pattern: `frontend/src/components/dashboard/FilterDrawer.tsx`
```

---

## Instructions

1. Go to https://github.com/YOUR_USERNAME/9boxer/issues/new
2. Copy the **Title** above into the title field
3. Copy the **Body** markdown above into the description field
4. Add the suggested labels
5. **Assign to yourself** using the "Assignees" dropdown on the right sidebar
6. Click "Submit new issue"

### Alternative: Using GitHub CLI (if installed)

If you have `gh` CLI installed, you can create and assign the issue in one command:

```bash
gh issue create \
  --title "Feature: Implement Big Movers Badge and Filter" \
  --body-file agent-projects/big-movers-feature/GITHUB_ISSUE.md \
  --label "enhancement,needs-testing,documentation,good first issue" \
  --assignee @me
```
