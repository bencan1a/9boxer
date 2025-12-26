"""Centralized event tracking service.

This service provides a unified interface for tracking all employee events.
It handles adding new events, removing events when properties return to
original state, querying events for an employee, and persisting events to
session storage.
"""

from datetime import datetime
from typing import TYPE_CHECKING

from ninebox.models.employee import Employee
from ninebox.models.events import Event, FlagAddEvent, FlagRemoveEvent
from ninebox.models.session import SessionState

if TYPE_CHECKING:
    from ninebox.services.session_manager import SessionManager


class EventManager:
    """Centralized event tracking logic.

    This service provides a unified interface for tracking all employee events.
    It handles:
    - Adding new events
    - Removing events when properties return to original state
    - Querying events for an employee
    - Persisting events to session storage
    """

    def __init__(self, session_manager: "SessionManager") -> None:
        """Initialize with reference to session manager for persistence.

        Args:
            session_manager: SessionManager instance for _persist_session() calls
        """
        self.session_manager = session_manager

    def track_event(
        self,
        session: SessionState,
        event: Event,
        original_employee: Employee,
        is_donut: bool = False,
    ) -> None:
        """Track an event, removing it if net-zero.

        Algorithm:
        1. Remove existing events of same type for this employee/property
        2. Check if event is net-zero (back to original state)
        3. If not net-zero, add event to session
        4. Persist session

        For flag events, we match on both event_type AND flag value to allow
        multiple different flag events for the same employee. For other events,
        we match only on event_type.

        Args:
            session: Current session state
            event: Event to track
            original_employee: Employee from original uploaded data
            is_donut: True if this is a donut mode event
        """
        event_list = session.donut_events if is_donut else session.events

        # Remove existing events of same type for this employee
        # For flags, match on flag value (removes both add/remove for same flag)
        if isinstance(event, FlagAddEvent | FlagRemoveEvent):
            event_list[:] = [
                e
                for e in event_list
                if not (
                    e.employee_id == event.employee_id
                    and isinstance(e, FlagAddEvent | FlagRemoveEvent)
                    and hasattr(e, "flag")
                    and e.flag == event.flag  # type: ignore[attr-defined]
                )
            ]
        else:
            event_list[:] = [
                e
                for e in event_list
                if not (e.employee_id == event.employee_id and e.event_type == event.event_type)
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
