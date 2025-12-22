# Change Tracker Feature Implementation Plan

```yaml
status: done
owner: Claude
created: 2025-12-18
completed: 2025-12-21
summary:
  - Add Change Tracker tab to right panel (2nd position)
  - Track one entry per employee showing net change from original position
  - Add editable notes field with auto-save on blur
  - Export notes to Excel in "9Boxer Change Notes" column
completion_notes: |
  Feature fully implemented. Git commit 8bca369: "feat: implement Change
  Tracker tab to display employee movement history with editable notes"
```

## Overview
Implement a change tracking system that maintains one entry per employee showing their movement from original position to current position, with editable notes that export to Excel.

## Requirements
1. **Single Entry Per Employee**: Maintain one change entry per employee showing net change
2. **Auto-Remove on Revert**: Remove entry if employee moved back to original position
3. **Editable Notes**: TextField with auto-save on blur
4. **Tab Position**: Second tab in right panel (after Details, before Statistics)
5. **Excel Export**: Add "9Boxer Change Notes" column with notes for modified employees

## Implementation Chunks

### Chunk 1: Backend Models & Session Logic
**Files:** `backend/src/ninebox/models/session.py`, `backend/src/ninebox/services/session_manager.py`
**Tasks:** Add notes field, implement one-entry-per-employee logic, update/remove on moves

### Chunk 2: Backend API & Export
**Files:** `backend/src/ninebox/api/session.py`, `backend/src/ninebox/services/excel_exporter.py`
**Tasks:** Add notes update endpoint, add Excel notes column

### Chunk 3: Frontend Types & API Service
**Files:** `frontend/src/types/employee.ts`, `frontend/src/services/api.ts`
**Tasks:** Add notes to EmployeeMove interface, add updateChangeNotes API method

### Chunk 4: Frontend Store
**Files:** `frontend/src/store/sessionStore.ts`
**Tasks:** Add updateChangeNotes action with optimistic updates

### Chunk 5: Frontend Components
**Files:** `frontend/src/components/panel/ChangeTrackerTab.tsx`, `frontend/src/components/panel/RightPanel.tsx`
**Tasks:** Create ChangeTrackerTab component, add as 2nd tab

### Chunk 6-8: Testing
**Files:** Backend tests, component tests, E2E tests
**Tasks:** Comprehensive test coverage for all new functionality

## Execution Phases
- Phase 1-5: Sequential (backend → frontend)
- Phase 6: Parallel (all tests together)

## Success Criteria
- [ ] Changes tab appears as 2nd tab
- [ ] One entry per employee
- [ ] Entry removed on revert to original
- [ ] Notes auto-save on blur
- [ ] Excel export includes notes column
- [ ] All tests pass (>80% coverage)
