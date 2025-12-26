# Event Tracking Implementation Plan

**status**: done
**owner**: Claude Code
**created**: 2024-12-25

## summary
- Complete event tracking by adding GridMoveEvent creation to general employee update endpoint
- Fix 8 failing tests in test_employees_events.py that expect events from PATCH /api/employees/{id}
- Simple 20-line refactor to route performance/potential updates through existing move_employee() method

## Problem

The event tracking architecture is 90% complete but has one missing piece: the general employee update endpoint (`PATCH /api/employees/{employee_id}`) doesn't create GridMoveEvents when performance or potential fields are updated. It just sets the fields directly via `setattr()`, bypassing the event tracking system.

This causes 8 tests to fail in `backend/tests/unit/api/test_employees_events.py` because they use the general update endpoint and expect events to be created.

## Solution

Modify `backend/src/ninebox/api/employees.py` function `update_employee()` (lines 165-224) to:

1. Detect when `performance` or `potential` are in the update request
2. Extract them from `update_data` before processing other fields
3. Call `session_mgr.move_employee()` instead of using `setattr()`
4. Let the existing event tracking infrastructure handle the rest

## Current Status

- ✅ Event models complete (GridMoveEvent, FlagAddEvent, FlagRemoveEvent, DonutMoveEvent)
- ✅ EventManager complete (track_event, net-zero logic, persistence)
- ✅ SessionManager.move_employee() complete (creates events)
- ✅ SessionManager.update_employee_flags() complete (creates events)
- ❌ **General update endpoint needs to route to move_employee() when performance/potential change**

## Files to Modify

- `backend/src/ninebox/api/employees.py` - update_employee() function (lines 187-213)

## Expected Impact

- 8 failing tests → passing
- No breaking changes (same API contract)
- Consistent event tracking across all update methods

## Verification

```bash
cd backend
../.venv/Scripts/python.exe -m pytest tests/unit/api/test_employees_events.py -v
```

Expected: All 16 tests pass (currently 8 passing, 8 failing)

## References

- See [implementation-guide.md](implementation-guide.md) for detailed pseudocode and architecture notes
- Related issue: 8 test failures in test_employees_events.py
