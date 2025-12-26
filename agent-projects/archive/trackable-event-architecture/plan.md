# TrackableEvent Architecture Implementation Plan

**Status:** done
**Owner:** Claude Code
**Created:** 2025-12-25
**Completed:** 2025-12-25
**Summary:**
- Replaced EmployeeMove with unified TrackableEvent architecture ✅
- Implemented polymorphic event types (GridMove, DonutMove, FlagAdd, FlagRemove) ✅
- Created EventManager service with net-zero detection ✅
- Fixed all test fixtures and achieved 100% test pass rate ✅
- Established clean extensibility pattern for future event types ✅

---

## Problem Statement

Current implementation has inconsistent change tracking:
- **Grid moves**: Use EmployeeMove model, tracked correctly, undo works
- **Flags**: Use EmployeeMove with text notes, no undo, missing persistence
- **No unified pattern**: Each property type requires custom logic

### Current Issues

1. ❌ Flag changes tracked as text notes instead of discrete events
2. ❌ Removing flags doesn't remove events (unlike grid moves)
3. ❌ Missing `_persist_session()` calls in update_employee()
4. ❌ Box moves don't show initially in UI
5. ❌ No consistent pattern for adding new tracked properties

## Proposed Architecture

### Core Design Principle

**Abstract to TrackableEvent base class** where:
- Box moves, flag operations, and future property changes are all instances of TrackableEvent
- Backend knows how to store any TrackableEvent
- Frontend knows how to render any TrackableEvent polymorphically
- Adding new event types requires minimal changes

### Data Model

```python
# backend/src/ninebox/models/events.py

from abc import ABC, abstractmethod
from datetime import datetime
from uuid import uuid4
from pydantic import BaseModel, Field
from ninebox.models.employee import Employee, PerformanceLevel, PotentialLevel


class TrackableEvent(BaseModel, ABC):
    """Base class for all trackable employee events.

    All employee property changes are tracked as discrete events that can be
    added, removed, and displayed. Each event type implements is_net_zero()
    to determine if the event represents a return to the original state.
    """

    event_id: str = Field(default_factory=lambda: str(uuid4()))
    employee_id: int
    employee_name: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    event_type: str  # Discriminator for polymorphism
    notes: str | None = None

    @abstractmethod
    def is_net_zero(self, original_employee: Employee) -> bool:
        """Check if this event represents a return to original state.

        Args:
            original_employee: Employee data from original file upload

        Returns:
            True if event is net-zero (should be removed), False otherwise
        """
        pass

    class Config:
        # Enable discriminated union based on event_type
        discriminator = 'event_type'


class GridMoveEvent(TrackableEvent):
    """Grid position change event."""

    event_type: str = Field(default="grid_move", const=True)
    old_position: int
    new_position: int
    old_performance: PerformanceLevel
    new_performance: PerformanceLevel
    old_potential: PotentialLevel
    new_potential: PotentialLevel

    def is_net_zero(self, original_employee: Employee) -> bool:
        """Check if employee is back to original grid position."""
        return (
            self.new_performance == original_employee.performance
            and self.new_potential == original_employee.potential
        )


class DonutMoveEvent(TrackableEvent):
    """Donut mode position change event."""

    event_type: str = Field(default="donut_move", const=True)
    old_position: int
    new_position: int
    old_performance: PerformanceLevel
    new_performance: PerformanceLevel
    old_potential: PotentialLevel
    new_potential: PotentialLevel

    def is_net_zero(self, original_employee: Employee) -> bool:
        """Donut moves are always net-zero when back to position 5."""
        return self.new_position == 5


class FlagAddEvent(TrackableEvent):
    """Flag added to employee event."""

    event_type: str = Field(default="flag_add", const=True)
    flag: str  # Flag key (e.g., "promotion_ready")

    def is_net_zero(self, original_employee: Employee) -> bool:
        """Check if flag was in original data (net-zero when re-added)."""
        original_flags = original_employee.flags or []
        return self.flag in original_flags


class FlagRemoveEvent(TrackableEvent):
    """Flag removed from employee event."""

    event_type: str = Field(default="flag_remove", const=True)
    flag: str  # Flag key (e.g., "promotion_ready")

    def is_net_zero(self, original_employee: Employee) -> bool:
        """Check if flag is back in current state (net-zero when re-removed)."""
        original_flags = original_employee.flags or []
        return self.flag not in original_flags


# Type alias for all event types
Event = GridMoveEvent | DonutMoveEvent | FlagAddEvent | FlagRemoveEvent
```

### Session Model

```python
# backend/src/ninebox/models/session.py (updated)

from pydantic import BaseModel
from ninebox.models.employee import Employee
from ninebox.models.events import Event


class SessionState(BaseModel):
    """User session state."""

    session_id: str
    user_id: str
    created_at: datetime
    last_accessed: datetime
    uploaded_filename: str
    original_employees: list[Employee]
    current_employees: list[Employee]

    # Unified event tracking
    events: list[Event] = []  # All trackable events (grid moves, flags, etc.)
    donut_events: list[Event] = []  # Donut mode events

    donut_mode_active: bool = False
```

### EventManager Service

```python
# backend/src/ninebox/services/event_manager.py

from datetime import datetime
from ninebox.models.events import TrackableEvent, Event
from ninebox.models.employee import Employee
from ninebox.models.session import SessionState


class EventManager:
    """Centralized event tracking logic.

    This service provides a unified interface for tracking all employee events.
    It handles:
    - Adding new events
    - Removing events when properties return to original state
    - Querying events for an employee
    - Persisting events to session storage
    """

    def __init__(self, session_manager):
        """Initialize with reference to session manager for persistence.

        Args:
            session_manager: SessionManager instance for _persist_session()
        """
        self.session_manager = session_manager

    def track_event(
        self,
        session: SessionState,
        event: TrackableEvent,
        original_employee: Employee,
        is_donut: bool = False,
    ) -> None:
        """Track an event, removing it if net-zero.

        Algorithm:
        1. Remove existing events of same type for this employee/property
        2. Check if event is net-zero (back to original state)
        3. If not net-zero, add event to session
        4. Persist session

        Args:
            session: Current session state
            event: Event to track
            original_employee: Employee from original uploaded data
            is_donut: True if this is a donut mode event
        """
        event_list = session.donut_events if is_donut else session.events

        # Remove existing events of same type for this employee
        # For flags, match on both event_type AND flag value
        if isinstance(event, (FlagAddEvent, FlagRemoveEvent)):
            event_list[:] = [
                e for e in event_list
                if not (
                    e.employee_id == event.employee_id
                    and e.event_type == event.event_type
                    and hasattr(e, 'flag')
                    and e.flag == event.flag
                )
            ]
        else:
            event_list[:] = [
                e for e in event_list
                if not (
                    e.employee_id == event.employee_id
                    and e.event_type == event.event_type
                )
            ]

        # Add event only if not net-zero
        if not event.is_net_zero(original_employee):
            event_list.append(event)

        # Always persist
        self.session_manager._persist_session(session)

    def get_employee_events(
        self,
        session: SessionState,
        employee_id: int,
        is_donut: bool = False,
    ) -> list[Event]:
        """Get all events for an employee.

        Args:
            session: Current session state
            employee_id: Employee to get events for
            is_donut: True to get donut events, False for regular events

        Returns:
            List of events sorted by timestamp (most recent first)
        """
        event_list = session.donut_events if is_donut else session.events
        events = [e for e in event_list if e.employee_id == employee_id]
        return sorted(events, key=lambda e: e.timestamp, reverse=True)

    def remove_event(
        self,
        session: SessionState,
        event_id: str,
        is_donut: bool = False,
    ) -> None:
        """Remove an event by ID.

        Args:
            session: Current session state
            event_id: Event ID to remove
            is_donut: True if this is a donut mode event
        """
        event_list = session.donut_events if is_donut else session.events
        event_list[:] = [e for e in event_list if e.event_id != event_id]
        self.session_manager._persist_session(session)

    def update_event_notes(
        self,
        session: SessionState,
        event_id: str,
        notes: str,
        is_donut: bool = False,
    ) -> Event | None:
        """Update notes for an event.

        Args:
            session: Current session state
            event_id: Event ID to update
            notes: New notes text
            is_donut: True if this is a donut mode event

        Returns:
            Updated event if found, None otherwise
        """
        event_list = session.donut_events if is_donut else session.events
        event = next((e for e in event_list if e.event_id == event_id), None)

        if event:
            event.notes = notes
            event.timestamp = datetime.utcnow()
            self.session_manager._persist_session(session)

        return event
```

### Frontend Types

```typescript
// frontend/src/types/events.ts

export interface BaseEvent {
  event_id: string;
  employee_id: number;
  employee_name: string;
  timestamp: string;
  notes?: string | null;
}

export interface GridMoveEvent extends BaseEvent {
  event_type: "grid_move";
  old_position: number;
  new_position: number;
  old_performance: string;
  new_performance: string;
  old_potential: string;
  new_potential: string;
}

export interface DonutMoveEvent extends BaseEvent {
  event_type: "donut_move";
  old_position: number;
  new_position: number;
  old_performance: string;
  new_performance: string;
  old_potential: string;
  new_potential: string;
}

export interface FlagAddEvent extends BaseEvent {
  event_type: "flag_add";
  flag: string;
}

export interface FlagRemoveEvent extends BaseEvent {
  event_type: "flag_remove";
  flag: string;
}

// Discriminated union for type safety
export type TrackableEvent =
  | GridMoveEvent
  | DonutMoveEvent
  | FlagAddEvent
  | FlagRemoveEvent;

// Type guard helpers
export function isGridMoveEvent(event: TrackableEvent): event is GridMoveEvent {
  return event.event_type === "grid_move";
}

export function isDonutMoveEvent(event: TrackableEvent): event is DonutMoveEvent {
  return event.event_type === "donut_move";
}

export function isFlagAddEvent(event: TrackableEvent): event is FlagAddEvent {
  return event.event_type === "flag_add";
}

export function isFlagRemoveEvent(event: TrackableEvent): event is FlagRemoveEvent {
  return event.event_type === "flag_remove";
}
```

### Frontend SessionState

```typescript
// frontend/src/types/session.ts (updated)

import { TrackableEvent } from "./events";

export interface SessionState {
  sessionId: string | null;
  employees: Employee[];
  originalEmployees: Employee[];
  events: TrackableEvent[];  // Unified event list
  donutEvents: TrackableEvent[];
  filename: string | null;
  filePath: string | null;
  isLoading: boolean;
  error: string | null;
  selectedEmployeeId: number | null;
  donutModeActive: boolean;
}
```

## Implementation Tasks

### Agent 1: Backend Data Models

**File:** `backend/src/ninebox/models/events.py` (new)

**Tasks:**
1. Create TrackableEvent base class with event_id, employee_id, timestamp, event_type, notes
2. Add abstract is_net_zero() method
3. Implement GridMoveEvent class
4. Implement DonutMoveEvent class
5. Implement FlagAddEvent class
6. Implement FlagRemoveEvent class
7. Add Pydantic discriminated union configuration
8. Add type alias Event = GridMoveEvent | DonutMoveEvent | ...

**File:** `backend/src/ninebox/models/session.py` (update)

**Tasks:**
1. Import Event from events.py
2. Replace `changes: list[EmployeeMove]` with `events: list[Event]`
3. Replace `donut_changes: list[EmployeeMove]` with `donut_events: list[Event]`
4. Remove EmployeeMove class (deprecated)

**Tests:** `backend/tests/unit/models/test_events.py`

---

### Agent 2: Backend EventManager

**File:** `backend/src/ninebox/services/event_manager.py` (new)

**Tasks:**
1. Create EventManager class
2. Implement track_event() method with net-zero logic
3. Implement get_employee_events() method
4. Implement remove_event() method
5. Implement update_event_notes() method
6. Add proper event list filtering for flags (match flag value)

**Tests:** `backend/tests/unit/services/test_event_manager.py`

---

### Agent 3: Backend Session Manager Migration

**File:** `backend/src/ninebox/services/session_manager.py` (update)

**Tasks:**
1. Add EventManager as dependency
2. Refactor move_employee() to create GridMoveEvent and use event_manager.track_event()
3. Refactor move_employee_donut() to create DonutMoveEvent and use event_manager.track_event()
4. Create update_employee_flags() method using FlagAddEvent/FlagRemoveEvent
5. Remove old change tracking logic
6. Update _persist_session() for new event model
7. Update load_session() to deserialize events correctly

**Tests:** `backend/tests/unit/services/test_session_manager.py` (update existing tests)

---

### Agent 4: Backend API Endpoints

**File:** `backend/src/ninebox/api/employees.py` (update)

**Tasks:**
1. Update update_employee() endpoint:
   - Call session_mgr.update_employee_flags() for flag changes
   - Remove old flag change tracking logic
   - Ensure _persist_session() is called

2. Update move_employee() endpoint:
   - Ensure it uses new event model
   - Return event in response

3. Update move_employee_donut() endpoint:
   - Ensure it uses new event model
   - Return event in response

**File:** `backend/src/ninebox/api/session.py` (update)

**Tasks:**
1. Update get_session_status() to return events instead of changes
2. Update response model to use Event instead of EmployeeMove
3. Add event count to session status

**Tests:** `backend/tests/unit/api/test_employees.py` (update existing tests)

---

### Agent 5: Frontend Types & Store

**File:** `frontend/src/types/events.ts` (new)

**Tasks:**
1. Define BaseEvent interface
2. Define GridMoveEvent interface
3. Define DonutMoveEvent interface
4. Define FlagAddEvent interface
5. Define FlagRemoveEvent interface
6. Create TrackableEvent discriminated union type
7. Add type guard functions

**File:** `frontend/src/types/api.ts` (update)

**Tasks:**
1. Update SessionStatusResponse to use events instead of changes
2. Update MoveResponse to return TrackableEvent

**File:** `frontend/src/store/sessionStore.ts` (update)

**Tasks:**
1. Replace changes: EmployeeMove[] with events: TrackableEvent[]
2. Replace donutChanges: EmployeeMove[] with donutEvents: TrackableEvent[]
3. Update moveEmployee() to handle new event response
4. Update updateEmployee() to handle events
5. Remove old EmployeeMove references
6. Update restoreSession() to load events

**Tests:** `frontend/src/store/__tests__/sessionStore.test.ts`

---

### Agent 6: Frontend Components

**File:** `frontend/src/components/events/EventDisplay.tsx` (new)

**Tasks:**
1. Create EventDisplay component with polymorphic rendering
2. Add switch statement for event_type
3. Render GridMoveEvent
4. Render DonutMoveEvent
5. Render FlagAddEvent
6. Render FlagRemoveEvent
7. Add notes editing functionality
8. Add timestamp display

**File:** `frontend/src/components/panel/EmployeeChangesSummary.tsx` (update)

**Tasks:**
1. Replace EmployeeMove references with TrackableEvent
2. Use EventDisplay component for rendering
3. Update empty state messaging
4. Update filtering logic

**File:** `frontend/src/components/panel/ChangeTrackerTab.tsx` (update)

**Tasks:**
1. Replace EmployeeMove references with TrackableEvent
2. Use EventDisplay component for rendering
3. Update table columns if needed
4. Update sorting/filtering logic

**Tests:** `frontend/src/components/events/__tests__/EventDisplay.test.tsx`

---

### Agent 7: Testing

**Backend Unit Tests:**
- `backend/tests/unit/models/test_events.py`
  - Test TrackableEvent base class
  - Test each event type
  - Test is_net_zero() logic for each event type
  - Test Pydantic validation

- `backend/tests/unit/services/test_event_manager.py`
  - Test track_event() adds/removes events correctly
  - Test get_employee_events() filtering
  - Test update_event_notes()
  - Test remove_event()

- `backend/tests/unit/services/test_session_manager.py` (update)
  - Update existing tests to use new event model
  - Test update_employee_flags() creates correct events
  - Test flag add/remove undo behavior

**Frontend Component Tests:**
- `frontend/src/components/events/__tests__/EventDisplay.test.tsx`
  - Test rendering of each event type
  - Test notes editing
  - Test timestamp formatting

**Integration Tests:**
- Test complete flag add/remove workflow
- Test grid move workflow
- Test mixed events for one employee
- Test persistence and reload

**E2E Tests:**
- Test flag add shows event immediately
- Test flag remove when not in original removes event
- Test flag remove when in original creates remove event
- Test flag re-add removes remove event
- Test grid move undo behavior still works

---

## Extensibility Guide

### Adding a New Event Type

**Example:** Track promotion_readiness changes

**Step 1: Define Event Class**

```python
# backend/src/ninebox/models/events.py

class PromotionReadinessEvent(TrackableEvent):
    """Promotion readiness change event."""

    event_type: str = Field(default="promotion_readiness_change", const=True)
    old_value: bool
    new_value: bool

    def is_net_zero(self, original_employee: Employee) -> bool:
        """Check if value is back to original."""
        return self.new_value == original_employee.promotion_readiness

# Add to Event type alias
Event = (
    GridMoveEvent
    | DonutMoveEvent
    | FlagAddEvent
    | FlagRemoveEvent
    | PromotionReadinessEvent
)
```

**Step 2: Add SessionManager Method**

```python
# backend/src/ninebox/services/session_manager.py

def update_employee_promotion_readiness(
    self,
    user_id: str,
    employee_id: int,
    new_value: bool,
) -> PromotionReadinessEvent | None:
    """Update promotion readiness and track event."""
    session = self.sessions.get(user_id)
    employee = self._get_employee(session, employee_id)
    original_employee = self._get_original_employee(session, employee_id)

    old_value = employee.promotion_readiness
    employee.promotion_readiness = new_value

    event = PromotionReadinessEvent(
        employee_id=employee_id,
        employee_name=employee.name,
        old_value=old_value,
        new_value=new_value,
    )

    self.event_manager.track_event(session, event, original_employee)

    return event
```

**Step 3: Update API Endpoint**

```python
# backend/src/ninebox/api/employees.py

if "promotion_readiness" in update_data:
    new_value = update_data.pop("promotion_readiness")
    session_mgr.update_employee_promotion_readiness(
        LOCAL_USER_ID,
        employee_id,
        new_value,
    )
```

**Step 4: Add Frontend Type**

```typescript
// frontend/src/types/events.ts

export interface PromotionReadinessEvent extends BaseEvent {
  event_type: "promotion_readiness_change";
  old_value: boolean;
  new_value: boolean;
}

export type TrackableEvent =
  | GridMoveEvent
  | DonutMoveEvent
  | FlagAddEvent
  | FlagRemoveEvent
  | PromotionReadinessEvent;
```

**Step 5: Add Frontend Rendering**

```typescript
// frontend/src/components/events/EventDisplay.tsx

case "promotion_readiness_change":
  const prEvent = event as PromotionReadinessEvent;
  return (
    <Box>
      <Typography variant="body2" fontWeight="medium">
        Promotion Readiness Changed
      </Typography>
      <Stack direction="row" spacing={1} alignItems="center">
        <Chip label={prEvent.old_value ? "Ready" : "Not Ready"} variant="outlined" />
        <TrendingFlatIcon />
        <Chip label={prEvent.new_value ? "Ready" : "Not Ready"} color="primary" />
      </Stack>
    </Box>
  );
```

**That's it!** The new event type is fully integrated.

---

## Migration Notes

### Breaking Changes

- `changes` → `events` (field name change in session)
- `donut_changes` → `donut_events`
- `EmployeeMove` → specific event types (GridMoveEvent, FlagAddEvent, etc.)

### No Backward Compatibility

Per user request, we're not maintaining backward compatibility. All existing sessions will need to be cleared or migrated manually.

### Database Impact

SQLite session storage will automatically handle new schema through JSON serialization.

---

## Success Criteria

✅ All property changes tracked as TrackableEvent instances
✅ Flags work like grid moves (add/remove/undo behavior)
✅ Clean extensibility pattern documented
✅ Polymorphic UI rendering works correctly
✅ All unit tests passing
✅ All integration tests passing
✅ All E2E tests passing
✅ No regressions in existing functionality

---

## Timeline

**Phase 1: Documentation** (30 mins) - COMPLETE
**Phase 2: Parallel Implementation** (2-3 hours) - 7 agents running concurrently
**Phase 3: Integration** (1 hour) - Ensure all pieces work together
**Phase 4: Testing & Validation** (1 hour) - Full test suite

**Total Estimated Time:** 4-5 hours
