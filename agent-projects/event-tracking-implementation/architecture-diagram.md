# Event Tracking Architecture Diagram

## Current Flow (Missing Events) ❌

```
PATCH /api/employees/{id} with {performance: "HIGH", potential: "MEDIUM"}
    ↓
update_employee() endpoint
    ↓
Extract flags → update_employee_flags() → ✅ Creates FlagAdd/FlagRemove events
    ↓
Process remaining fields (performance, potential, notes, etc.)
    ↓
for field, value in update_data.items():
    setattr(employee, field, value)  ← ❌ NO EVENT CREATED!
    ↓
session_mgr._persist_session(session)
    ↓
Return {"employee": {...}, "success": True}
```

**Result**: Employee position changes, but NO GridMoveEvent is created

## Desired Flow (With Events) ✅

```
PATCH /api/employees/{id} with {performance: "HIGH", potential: "MEDIUM"}
    ↓
update_employee() endpoint
    ↓
Extract flags → update_employee_flags() → ✅ Creates FlagAdd/FlagRemove events
    ↓
Extract performance/potential → move_employee() → ✅ Creates GridMoveEvent
    │                                                    ↓
    │                                           EventManager.track_event()
    │                                                    ↓
    │                                           Check event.is_net_zero()
    │                                                    ↓
    │                                           Add to session.events OR remove if net-zero
    │                                                    ↓
    │                                           Persist to database
    ↓
Process remaining fields (notes, development_focus, etc.)
    ↓
for field, value in remaining_update_data.items():
    setattr(employee, field, value)
    ↓
session_mgr._persist_session(session)
    ↓
Return {"employee": {...}, "success": True}
```

**Result**: Employee position changes AND GridMoveEvent is created/updated

## Event Lifecycle

### Creating Events

1. **Grid Move**:
   ```python
   session_mgr.move_employee(user_id, employee_id, new_performance, new_potential)
   → Creates GridMoveEvent
   → Calls event_manager.track_event()
   ```

2. **Flag Changes**:
   ```python
   session_mgr.update_employee_flags(user_id, employee_id, new_flags)
   → Creates FlagAddEvent for each added flag
   → Creates FlagRemoveEvent for each removed flag
   → Calls event_manager.track_event() for each
   ```

### Net-Zero Logic

EventManager.track_event() checks `event.is_net_zero(original_employee)`:

- **GridMoveEvent**: `new_performance == original.performance AND new_potential == original.potential`
- **FlagAddEvent**: `flag in original.flags` (re-adding an original flag)
- **FlagRemoveEvent**: `flag not in original.flags` (removing a flag that wasn't there)
- **DonutMoveEvent**: `new_position == 5` (center position)

If net-zero → Remove event from session.events
If not net-zero → Add/update event in session.events

## Code Comparison

### Current (Broken)

```python
# backend/src/ninebox/api/employees.py lines 187-213

# Handle other fields (promotion_readiness, development_focus, development_action, notes)
if update_data:
    employee = next(
        (e for e in session.current_employees if e.employee_id == employee_id), None
    )
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    # Update fields
    for field, value in update_data.items():
        setattr(employee, field, value)  # ← PROBLEM: performance/potential set without events

    # Persist
    session_mgr._persist_session(session)
```

### Fixed

```python
# backend/src/ninebox/api/employees.py (proposed)

# Handle performance/potential changes with event tracking
if "performance" in update_data or "potential" in update_data:
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

    # Persist
    session_mgr._persist_session(session)
```

## Testing Flow

### Test Scenario: Move Employee + Add Flag

```python
# Test code (from test_employees_events.py)
test_client.patch(
    "/api/employees/1",
    json={
        "performance": "MEDIUM",
        "potential": "MEDIUM",
        "flags": ["promotion_ready", "flight_risk"],
    },
)

# Expected events in session.events:
# 1. GridMoveEvent (HIGH/HIGH → MEDIUM/MEDIUM)
# 2. FlagAddEvent (flight_risk) - promotion_ready was already there
```

**Current Result**: Only FlagAddEvent created (GridMoveEvent missing)
**After Fix**: Both events created ✅

### Test Scenario: Revert Changes

```python
# First change
test_client.patch("/api/employees/1", json={"performance": "MEDIUM"})
# → Creates GridMoveEvent (HIGH → MEDIUM)

# Revert
test_client.patch("/api/employees/1", json={"performance": "HIGH"})
# → GridMoveEvent removed (net-zero)
```

**Expected**: session.events should be empty after revert
**Current Result**: Event not created in first place, so nothing to remove
**After Fix**: Event created then removed on revert ✅

## Database Schema

Events are stored in the `sessions` table as JSON:

```sql
CREATE TABLE sessions (
    user_id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    created_at TEXT NOT NULL,
    session_data TEXT NOT NULL  -- JSON containing events array
);
```

Example session_data JSON:
```json
{
  "session_id": "abc-123",
  "user_id": "user1",
  "events": [
    {
      "event_type": "grid_move",
      "event_id": "evt-456",
      "employee_id": 1,
      "employee_name": "Alice",
      "old_position": 9,
      "new_position": 5,
      "old_performance": "HIGH",
      "new_performance": "MEDIUM",
      "old_potential": "HIGH",
      "new_potential": "MEDIUM",
      "timestamp": "2024-12-25T10:00:00",
      "notes": null
    },
    {
      "event_type": "flag_add",
      "event_id": "evt-789",
      "employee_id": 2,
      "employee_name": "Bob",
      "flag": "flight_risk",
      "timestamp": "2024-12-25T10:01:00",
      "notes": "Retention concern"
    }
  ],
  "donut_events": [],
  "current_employees": [...],
  "original_employees": [...]
}
```

## API Response Format

After implementation, the response should include event information:

```json
{
  "employee": {
    "employee_id": 1,
    "name": "Alice",
    "performance": "MEDIUM",
    "potential": "MEDIUM",
    "grid_position": 5,
    "modified_in_session": true,
    ...
  },
  "success": true
}
```

The events can be retrieved separately via:
```
GET /api/session/status
{
  "session_id": "abc-123",
  "events": [...],  ← GridMoveEvent will be here
  "donut_events": [],
  ...
}
```
