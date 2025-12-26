# Event Tracking Implementation Guide

**Status**: Implementation needed
**Created**: 2024-12-25
**Affects**: 8 failing tests in `backend/tests/unit/api/test_employees_events.py`

## Executive Summary

The event tracking architecture is **90% complete** but has one critical missing piece: the general employee update endpoint (`PATCH /api/employees/{employee_id}`) doesn't create events when performance/potential are updated. This causes 8 tests to fail because they expect events to be created when using the general update endpoint.

## Current State

### ✅ What's Working

1. **Event Models** (`backend/src/ninebox/models/events.py`)
   - GridMoveEvent, DonutMoveEvent, FlagAddEvent, FlagRemoveEvent
   - All have proper `is_net_zero()` logic
   - Discriminated union for polymorphism
   - **Status**: ✅ COMPLETE

2. **EventManager** (`backend/src/ninebox/services/event_manager.py`)
   - `track_event()` - Adds events and handles net-zero removal
   - `get_employee_events()` - Retrieves events for an employee
   - **Status**: ✅ COMPLETE

3. **SessionManager Methods**
   - `move_employee()` - Creates GridMoveEvent (lines 127-212)
   - `update_employee_flags()` - Creates FlagAdd/FlagRemove events (lines 420-500)
   - Both use EventManager.track_event() correctly
   - **Status**: ✅ COMPLETE

4. **Dedicated Move Endpoint** (`/api/employees/{employee_id}/move`)
   - Calls `session_mgr.move_employee()`
   - Returns GridMoveEvent
   - **Status**: ✅ COMPLETE

### ❌ What's Missing

**Problem**: The general update endpoint (`PATCH /api/employees/{employee_id}`) doesn't create grid move events when performance/potential are updated.

**Location**: `backend/src/ninebox/api/employees.py`, lines 165-224

**Current Behavior** (lines 187-213):
```python
# Handle other fields (promotion_readiness, development_focus, development_action, notes)
if update_data:
    employee = next(
        (e for e in session.current_employees if e.employee_id == employee_id), None
    )
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    # Find original employee for modified status check
    original_employee = next(
        (e for e in session.original_employees if e.employee_id == employee_id), None
    )

    # Update fields
    for field, value in update_data.items():
        setattr(employee, field, value)  # ← PROBLEM: Just sets fields, no events!

    # Update modified status
    has_position_change = original_employee and (
        employee.performance != original_employee.performance
        or employee.potential != original_employee.potential
    )
    has_event = any(e.employee_id == employee_id for e in session.events)
    employee.modified_in_session = has_position_change or has_event

    # Persist
    session_mgr._persist_session(session)
```

**Issue**: When `performance` or `potential` are in `update_data`, they're just set via `setattr()` without creating a GridMoveEvent.

## Implementation Required

### Required Change

**File**: `backend/src/ninebox/api/employees.py`
**Function**: `update_employee()` (lines 165-224)

**Solution**: Detect when performance/potential are being updated and call `session_mgr.move_employee()` instead of using `setattr()`.

### Pseudocode

```python
@router.patch("/{employee_id}")
async def update_employee(
    employee_id: int,
    updates: UpdateEmployeeRequest,
    session_mgr: SessionManager = Depends(get_session_manager),
) -> dict:
    """Update employee fields."""
    session = session_mgr.get_session(LOCAL_USER_ID)
    if not session:
        raise HTTPException(status_code=404, detail="No active session")

    update_data = updates.model_dump(exclude_unset=True)

    # Handle flags separately using new event tracking
    if "flags" in update_data:
        new_flags = update_data.pop("flags")
        session_mgr.update_employee_flags(
            user_id=LOCAL_USER_ID,
            employee_id=employee_id,
            new_flags=new_flags,
        )

    # NEW: Handle performance/potential changes with event tracking
    if "performance" in update_data or "potential" in update_data:
        # Get current employee to determine defaults
        employee = next(
            (e for e in session.current_employees if e.employee_id == employee_id), None
        )
        if not employee:
            raise HTTPException(status_code=404, detail="Employee not found")

        # Use current values as defaults if not provided
        new_performance = update_data.pop("performance", employee.performance)
        new_potential = update_data.pop("potential", employee.potential)

        # Convert strings to enums if needed
        if isinstance(new_performance, str):
            new_performance = PerformanceLevel(new_performance)
        if isinstance(new_potential, str):
            new_potential = PotentialLevel(new_potential)

        # Create GridMoveEvent via session manager
        session_mgr.move_employee(
            user_id=LOCAL_USER_ID,
            employee_id=employee_id,
            new_performance=new_performance,
            new_potential=new_potential,
        )

    # Handle other fields (promotion_readiness, development_focus, development_action, notes)
    if update_data:
        employee = next(
            (e for e in session.current_employees if e.employee_id == employee_id), None
        )
        if not employee:
            raise HTTPException(status_code=404, detail="Employee not found")

        # Update remaining fields
        for field, value in update_data.items():
            setattr(employee, field, value)

        # Update modified status
        has_event = any(e.employee_id == employee_id for e in session.events)
        employee.modified_in_session = has_event

        # Persist
        session_mgr._persist_session(session)

    # Return updated employee
    session = session_mgr.get_session(LOCAL_USER_ID)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    employee = next(
        (e for e in session.current_employees if e.employee_id == employee_id), None
    )
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    return {"employee": employee.model_dump(), "success": True}
```

### Key Points

1. **Extract performance/potential early** - Remove them from `update_data` before processing other fields
2. **Handle partial updates** - If only `performance` is provided, use current `potential` value and vice versa
3. **Handle string or enum values** - The UpdateEmployeeRequest might accept strings that need conversion
4. **Call move_employee()** - This automatically creates the GridMoveEvent and handles all event tracking logic
5. **Process remaining fields** - After handling performance/potential, process other fields normally

## Test Coverage

### Failing Tests (will pass after implementation)

All tests in `backend/tests/unit/api/test_employees_events.py`:

1. **TestSessionStatusEvents** (3 tests):
   - `test_session_status_when_move_then_includes_event` - Expects GridMoveEvent after PATCH with performance/potential
   - `test_session_status_when_mixed_events_then_includes_all` - Expects both GridMoveEvent and FlagAddEvent
   - This will fail because moves via PATCH don't create events

2. **TestFlagUpdateEvents** (2 tests):
   - `test_update_employee_when_removing_original_flag_then_creates_flag_remove_event` - Expects FlagRemoveEvent
   - `test_update_employee_when_adding_back_removed_flag_then_no_event` - Expects event removal on net-zero

3. **TestMixedEventWorkflows** (3 tests):
   - `test_workflow_move_and_flag_change_same_employee` - Expects both move and flag events in single PATCH
   - `test_workflow_revert_all_changes` - Expects events to be removed when reverted
   - `test_workflow_multiple_employees_different_changes` - Expects 3 different event types

4. **TestEventPersistence** (2 tests):
   - `test_events_persist_after_multiple_operations` - Expects events to persist across operations
   - `test_events_update_on_subsequent_changes` - Expects event updates on subsequent moves

### Verification

After implementation, run:
```bash
cd backend
../.venv/Scripts/python.exe -m pytest tests/unit/api/test_employees_events.py -v
```

Expected result: All 16 tests should pass.

## Architecture Notes

### Why Two Endpoints?

The codebase has two ways to move employees:

1. **`PATCH /api/employees/{employee_id}`** - General update endpoint
   - Updates any employee fields (flags, performance, potential, notes, etc.)
   - Used by frontend for most updates
   - **Currently missing event tracking for performance/potential**

2. **`PATCH /api/employees/{employee_id}/move`** - Dedicated move endpoint
   - Only updates performance/potential
   - Returns GridMoveEvent explicitly
   - **Already has event tracking**

The tests expect the general endpoint to also create events when performance/potential change, which makes sense for consistency.

### Event Flow

1. User updates employee via API
2. API endpoint detects performance/potential change
3. Calls `session_mgr.move_employee()`
4. SessionManager creates GridMoveEvent
5. SessionManager calls `event_manager.track_event()`
6. EventManager checks if event is net-zero using `event.is_net_zero(original_employee)`
7. If net-zero, event is removed; otherwise, it's added/updated
8. Session persisted to database
9. Frontend can retrieve events via `/api/session/status` endpoint

### Net-Zero Logic

Events are automatically removed when they represent a return to original state:

- **GridMoveEvent**: Removed when performance AND potential match original values
- **FlagAddEvent**: Removed when flag is removed (back to not having it)
- **FlagRemoveEvent**: Removed when flag is re-added (back to having it)
- **DonutMoveEvent**: Removed when moved to position 5 (center/neutral)

This logic is implemented in each event's `is_net_zero()` method and enforced by EventManager.

## Related Files

- **Event Models**: `backend/src/ninebox/models/events.py`
- **Event Manager**: `backend/src/ninebox/services/event_manager.py`
- **Session Manager**: `backend/src/ninebox/services/session_manager.py`
- **API Endpoint**: `backend/src/ninebox/api/employees.py` ← **NEEDS CHANGES**
- **Tests**: `backend/tests/unit/api/test_employees_events.py`

## Estimated Effort

- **Complexity**: Low (simple refactor, all infrastructure exists)
- **Risk**: Low (well-tested architecture, just routing to existing code)
- **Time**: 30-60 minutes (implementation + testing)
- **LOC**: ~20 lines added/modified

## Next Steps

1. Implement the change in `backend/src/ninebox/api/employees.py`
2. Run `pytest backend/tests/unit/api/test_employees_events.py -v`
3. Verify all 16 tests pass
4. Run full test suite to ensure no regressions
5. Update this document status to "Completed"
