"""Tests for EventManager service."""

from datetime import datetime
from unittest.mock import Mock

import pytest

from ninebox.models.constants import ALLOWED_FLAGS
from ninebox.models.employee import Employee, PerformanceLevel, PotentialLevel
from ninebox.models.events import (
    DonutMoveEvent,
    FlagAddEvent,
    FlagRemoveEvent,
    GridMoveEvent,
)
from ninebox.models.session import SessionState
from ninebox.services.event_manager import EventManager
from tests.test_utils import create_test_employee

# Use a valid flag from ALLOWED_FLAGS for testing
TEST_FLAG = "promotion_ready"


@pytest.fixture
def mock_session_manager() -> Mock:
    """Create a mock session manager."""
    session_manager = Mock()
    session_manager._persist_session = Mock()
    return session_manager


@pytest.fixture
def event_manager(mock_session_manager: Mock) -> EventManager:
    """Create an EventManager instance with mocked session manager."""
    return EventManager(mock_session_manager)


@pytest.fixture
def sample_session() -> SessionState:
    """Create a sample session state for testing."""
    employee1 = create_test_employee(
        employee_id=1,
        name="Alice",
        performance=PerformanceLevel.MEDIUM,
        potential=PotentialLevel.MEDIUM,
        flags=[TEST_FLAG],
    )
    employee2 = create_test_employee(
        employee_id=2,
        name="Bob",
        performance=PerformanceLevel.LOW,
        potential=PotentialLevel.LOW,
        grid_position=1,
    )

    return SessionState(
        session_id="test-session",
        user_id="test-user",
        created_at=datetime.utcnow(),
        original_filename="test.xlsx",
        original_file_path="/tmp/test.xlsx",
        sheet_name="Employee Data",
        sheet_index=1,
        original_employees=[employee1, employee2],
        current_employees=[
            create_test_employee(
                employee_id=1,
                name="Alice",
                performance=PerformanceLevel.MEDIUM,
                potential=PotentialLevel.MEDIUM,
                flags=[TEST_FLAG],
            ),
            create_test_employee(
                employee_id=2,
                name="Bob",
                performance=PerformanceLevel.LOW,
                potential=PotentialLevel.LOW,
                grid_position=1,
            ),
        ],
        events=[],
        donut_events=[],
    )


@pytest.fixture
def original_employee() -> Employee:
    """Create an original employee for testing."""
    return create_test_employee(
        employee_id=1,
        name="Alice",
        performance=PerformanceLevel.MEDIUM,
        potential=PotentialLevel.MEDIUM,
        flags=[TEST_FLAG],
    )


class TestTrackEvent:
    """Tests for track_event method."""

    def test_track_event_adds_new_event_when_not_net_zero(
        self,
        event_manager: EventManager,
        sample_session: SessionState,
        original_employee: Employee,
        mock_session_manager: Mock,
    ) -> None:
        """Test that track_event adds a new event when it's not net-zero."""
        event = GridMoveEvent(
            employee_id=1,
            employee_name="Alice",
            old_position=5,
            new_position=1,
            old_performance=PerformanceLevel.MEDIUM,
            old_potential=PerformanceLevel.MEDIUM,
            new_performance=PerformanceLevel.LOW,
            new_potential=PotentialLevel.LOW,
        )

        event_manager.track_event(sample_session, event, original_employee)

        assert len(sample_session.events) == 1
        assert sample_session.events[0] == event
        mock_session_manager._persist_session.assert_called_once_with(sample_session)

    def test_track_event_does_not_add_net_zero_event(
        self,
        event_manager: EventManager,
        sample_session: SessionState,
        original_employee: Employee,
        mock_session_manager: Mock,
    ) -> None:
        """Test that track_event does not add event when it's net-zero."""
        # Event that returns employee to original position
        event = GridMoveEvent(
            employee_id=1,
            employee_name="Alice",
            old_position=1,
            new_position=5,
            old_performance=PerformanceLevel.LOW,
            old_potential=PotentialLevel.LOW,
            new_performance=PerformanceLevel.MEDIUM,
            new_potential=PotentialLevel.MEDIUM,
        )

        event_manager.track_event(sample_session, event, original_employee)

        assert len(sample_session.events) == 0
        mock_session_manager._persist_session.assert_called_once_with(sample_session)

    def test_track_event_removes_previous_event_of_same_type(
        self,
        event_manager: EventManager,
        sample_session: SessionState,
        original_employee: Employee,
        mock_session_manager: Mock,
    ) -> None:
        """Test that track_event removes previous events of same type for employee."""
        # Add first event
        event1 = GridMoveEvent(
            employee_id=1,
            employee_name="Alice",
            old_position=5,
            new_position=1,
            old_performance=PerformanceLevel.MEDIUM,
            old_potential=PotentialLevel.MEDIUM,
            new_performance=PerformanceLevel.LOW,
            new_potential=PotentialLevel.LOW,
        )
        sample_session.events.append(event1)

        # Add second event for same employee
        event2 = GridMoveEvent(
            employee_id=1,
            employee_name="Alice",
            old_position=5,
            new_position=9,
            old_performance=PerformanceLevel.MEDIUM,
            old_potential=PotentialLevel.MEDIUM,
            new_performance=PerformanceLevel.HIGH,
            new_potential=PotentialLevel.HIGH,
        )

        event_manager.track_event(sample_session, event2, original_employee)

        # Should only have the second event
        assert len(sample_session.events) == 1
        assert sample_session.events[0] == event2

    def test_track_event_does_not_remove_events_for_different_employees(
        self,
        event_manager: EventManager,
        sample_session: SessionState,
        original_employee: Employee,
        mock_session_manager: Mock,
    ) -> None:
        """Test that track_event only removes events for the same employee."""
        # Add event for employee 1
        event1 = GridMoveEvent(
            employee_id=1,
            employee_name="Alice",
            old_position=5,
            new_position=1,
            old_performance=PerformanceLevel.MEDIUM,
            old_potential=PotentialLevel.MEDIUM,
            new_performance=PerformanceLevel.LOW,
            new_potential=PotentialLevel.LOW,
        )
        sample_session.events.append(event1)

        # Add event for employee 2
        employee2_original = create_test_employee(
            employee_id=2,
            name="Bob",
            performance=PerformanceLevel.LOW,
            potential=PotentialLevel.LOW,
            grid_position=1,
        )
        event2 = GridMoveEvent(
            employee_id=2,
            employee_name="Bob",
            old_position=1,
            new_position=5,
            old_performance=PerformanceLevel.LOW,
            old_potential=PotentialLevel.LOW,
            new_performance=PerformanceLevel.MEDIUM,
            new_potential=PotentialLevel.MEDIUM,
        )

        event_manager.track_event(sample_session, event2, employee2_original)

        # Should have both events
        assert len(sample_session.events) == 2

    def test_track_event_handles_flag_events_with_same_flag_correctly(
        self,
        event_manager: EventManager,
        sample_session: SessionState,
        original_employee: Employee,
        mock_session_manager: Mock,
    ) -> None:
        """Test that track_event removes previous flag events for the same flag."""
        # Add flag add event
        event1 = FlagAddEvent(
            employee_id=1,
            employee_name="Alice",
            flag="promotion_ready",
        )
        sample_session.events.append(event1)

        # Remove the same flag
        event2 = FlagRemoveEvent(
            employee_id=1,
            employee_name="Alice",
            flag="promotion_ready",
        )

        event_manager.track_event(sample_session, event2, original_employee)

        # Should only have the remove event
        assert len(sample_session.events) == 1
        assert isinstance(sample_session.events[0], FlagRemoveEvent)

    def test_track_event_does_not_remove_flag_events_for_different_flags(
        self,
        event_manager: EventManager,
        sample_session: SessionState,
        original_employee: Employee,
        mock_session_manager: Mock,
    ) -> None:
        """Test that track_event preserves flag events for different flags."""
        # Add flag add event for promotion_ready
        event1 = FlagAddEvent(
            employee_id=1,
            employee_name="Alice",
            flag="promotion_ready",
        )
        sample_session.events.append(event1)

        # Add flag add event for key_talent
        event2 = FlagAddEvent(
            employee_id=1,
            employee_name="Alice",
            flag="key_talent",
        )

        event_manager.track_event(sample_session, event2, original_employee)

        # Should have both flag events
        assert len(sample_session.events) == 2

    def test_track_event_handles_donut_events(
        self,
        event_manager: EventManager,
        sample_session: SessionState,
        original_employee: Employee,
        mock_session_manager: Mock,
    ) -> None:
        """Test that track_event handles donut events correctly."""
        event = DonutMoveEvent(
            employee_id=1,
            employee_name="Alice",
            old_position=5,
            new_position=1,
            old_performance=PerformanceLevel.MEDIUM,
            old_potential=PotentialLevel.MEDIUM,
            new_performance=PerformanceLevel.LOW,
            new_potential=PotentialLevel.LOW,
        )

        event_manager.track_event(
            sample_session, event, original_employee, is_donut=True
        )

        assert len(sample_session.donut_events) == 1
        assert sample_session.donut_events[0] == event
        assert len(sample_session.events) == 0

    def test_track_event_removes_net_zero_donut_event(
        self,
        event_manager: EventManager,
        sample_session: SessionState,
        original_employee: Employee,
        mock_session_manager: Mock,
    ) -> None:
        """Test that track_event removes donut event when back to position 5."""
        # Event back to position 5
        event = DonutMoveEvent(
            employee_id=1,
            employee_name="Alice",
            old_position=1,
            new_position=5,
            old_performance=PerformanceLevel.LOW,
            old_potential=PotentialLevel.LOW,
            new_performance=PerformanceLevel.MEDIUM,
            new_potential=PotentialLevel.MEDIUM,
        )

        event_manager.track_event(
            sample_session, event, original_employee, is_donut=True
        )

        assert len(sample_session.donut_events) == 0


class TestGetEmployeeEvents:
    """Tests for get_employee_events method."""

    def test_get_employee_events_returns_events_for_employee(
        self,
        event_manager: EventManager,
        sample_session: SessionState,
    ) -> None:
        """Test that get_employee_events returns all events for an employee."""
        event1 = GridMoveEvent(
            employee_id=1,
            employee_name="Alice",
            old_position=5,
            new_position=1,
            old_performance=PerformanceLevel.MEDIUM,
            old_potential=PotentialLevel.MEDIUM,
            new_performance=PerformanceLevel.LOW,
            new_potential=PotentialLevel.LOW,
        )
        event2 = FlagAddEvent(
            employee_id=1,
            employee_name="Alice",
            flag="promotion_ready",
        )
        event3 = GridMoveEvent(
            employee_id=2,
            employee_name="Bob",
            old_position=1,
            new_position=5,
            old_performance=PerformanceLevel.LOW,
            old_potential=PotentialLevel.LOW,
            new_performance=PerformanceLevel.MEDIUM,
            new_potential=PotentialLevel.MEDIUM,
        )

        sample_session.events = [event1, event2, event3]

        events = event_manager.get_employee_events(sample_session, 1)

        assert len(events) == 2
        assert event1 in events
        assert event2 in events
        assert event3 not in events

    def test_get_employee_events_returns_empty_list_when_no_events(
        self,
        event_manager: EventManager,
        sample_session: SessionState,
    ) -> None:
        """Test that get_employee_events returns empty list when no events exist."""
        events = event_manager.get_employee_events(sample_session, 1)

        assert len(events) == 0

    def test_get_employee_events_sorts_by_timestamp_descending(
        self,
        event_manager: EventManager,
        sample_session: SessionState,
    ) -> None:
        """Test that get_employee_events returns events sorted by timestamp (newest first)."""
        from datetime import timedelta

        now = datetime.utcnow()

        event1 = GridMoveEvent(
            employee_id=1,
            employee_name="Alice",
            old_position=5,
            new_position=1,
            old_performance=PerformanceLevel.MEDIUM,
            old_potential=PotentialLevel.MEDIUM,
            new_performance=PerformanceLevel.LOW,
            new_potential=PotentialLevel.LOW,
            timestamp=now - timedelta(hours=2),
        )
        event2 = FlagAddEvent(
            employee_id=1,
            employee_name="Alice",
            flag="promotion_ready",
            timestamp=now - timedelta(hours=1),
        )
        event3 = FlagAddEvent(
            employee_id=1,
            employee_name="Alice",
            flag="key_talent",
            timestamp=now,
        )

        sample_session.events = [event1, event2, event3]

        events = event_manager.get_employee_events(sample_session, 1)

        # Should be sorted newest to oldest
        assert events[0] == event3
        assert events[1] == event2
        assert events[2] == event1

    def test_get_employee_events_handles_donut_events(
        self,
        event_manager: EventManager,
        sample_session: SessionState,
    ) -> None:
        """Test that get_employee_events returns donut events when is_donut=True."""
        event1 = DonutMoveEvent(
            employee_id=1,
            employee_name="Alice",
            old_position=5,
            new_position=1,
            old_performance=PerformanceLevel.MEDIUM,
            old_potential=PotentialLevel.MEDIUM,
            new_performance=PerformanceLevel.LOW,
            new_potential=PotentialLevel.LOW,
        )
        event2 = GridMoveEvent(
            employee_id=1,
            employee_name="Alice",
            old_position=5,
            new_position=1,
            old_performance=PerformanceLevel.MEDIUM,
            old_potential=PotentialLevel.MEDIUM,
            new_performance=PerformanceLevel.LOW,
            new_potential=PotentialLevel.LOW,
        )

        sample_session.donut_events = [event1]
        sample_session.events = [event2]

        donut_events = event_manager.get_employee_events(sample_session, 1, is_donut=True)
        regular_events = event_manager.get_employee_events(sample_session, 1, is_donut=False)

        assert len(donut_events) == 1
        assert donut_events[0] == event1
        assert len(regular_events) == 1
        assert regular_events[0] == event2


class TestRemoveEvent:
    """Tests for remove_event method."""

    def test_remove_event_removes_event_by_id(
        self,
        event_manager: EventManager,
        sample_session: SessionState,
        mock_session_manager: Mock,
    ) -> None:
        """Test that remove_event removes an event by ID."""
        event1 = GridMoveEvent(
            employee_id=1,
            employee_name="Alice",
            old_position=5,
            new_position=1,
            old_performance=PerformanceLevel.MEDIUM,
            old_potential=PotentialLevel.MEDIUM,
            new_performance=PerformanceLevel.LOW,
            new_potential=PotentialLevel.LOW,
        )
        event2 = FlagAddEvent(
            employee_id=1,
            employee_name="Alice",
            flag="promotion_ready",
        )

        sample_session.events = [event1, event2]

        event_manager.remove_event(sample_session, event1.event_id)

        assert len(sample_session.events) == 1
        assert sample_session.events[0] == event2
        mock_session_manager._persist_session.assert_called_once_with(sample_session)

    def test_remove_event_does_not_error_when_id_not_found(
        self,
        event_manager: EventManager,
        sample_session: SessionState,
        mock_session_manager: Mock,
    ) -> None:
        """Test that remove_event handles non-existent event IDs gracefully."""
        event1 = GridMoveEvent(
            employee_id=1,
            employee_name="Alice",
            old_position=5,
            new_position=1,
            old_performance=PerformanceLevel.MEDIUM,
            old_potential=PotentialLevel.MEDIUM,
            new_performance=PerformanceLevel.LOW,
            new_potential=PotentialLevel.LOW,
        )

        sample_session.events = [event1]

        # Should not raise error
        event_manager.remove_event(sample_session, "non-existent-id")

        # Original event should still be there
        assert len(sample_session.events) == 1

    def test_remove_event_handles_donut_events(
        self,
        event_manager: EventManager,
        sample_session: SessionState,
        mock_session_manager: Mock,
    ) -> None:
        """Test that remove_event removes donut events when is_donut=True."""
        event1 = DonutMoveEvent(
            employee_id=1,
            employee_name="Alice",
            old_position=5,
            new_position=1,
            old_performance=PerformanceLevel.MEDIUM,
            old_potential=PotentialLevel.MEDIUM,
            new_performance=PerformanceLevel.LOW,
            new_potential=PotentialLevel.LOW,
        )

        sample_session.donut_events = [event1]

        event_manager.remove_event(sample_session, event1.event_id, is_donut=True)

        assert len(sample_session.donut_events) == 0


class TestUpdateEventNotes:
    """Tests for update_event_notes method."""

    def test_update_event_notes_updates_notes_and_timestamp(
        self,
        event_manager: EventManager,
        sample_session: SessionState,
        mock_session_manager: Mock,
    ) -> None:
        """Test that update_event_notes updates notes and timestamp."""
        event = GridMoveEvent(
            employee_id=1,
            employee_name="Alice",
            old_position=5,
            new_position=1,
            old_performance=PerformanceLevel.MEDIUM,
            old_potential=PotentialLevel.MEDIUM,
            new_performance=PerformanceLevel.LOW,
            new_potential=PotentialLevel.LOW,
        )

        sample_session.events = [event]
        original_timestamp = event.timestamp

        # Update notes
        updated_event = event_manager.update_event_notes(
            sample_session,
            event.event_id,
            "New notes",
        )

        assert updated_event is not None
        assert updated_event.notes == "New notes"
        assert updated_event.timestamp > original_timestamp
        mock_session_manager._persist_session.assert_called_once_with(sample_session)

    def test_update_event_notes_returns_none_when_event_not_found(
        self,
        event_manager: EventManager,
        sample_session: SessionState,
        mock_session_manager: Mock,
    ) -> None:
        """Test that update_event_notes returns None when event not found."""
        updated_event = event_manager.update_event_notes(
            sample_session,
            "non-existent-id",
            "New notes",
        )

        assert updated_event is None
        mock_session_manager._persist_session.assert_not_called()

    def test_update_event_notes_handles_donut_events(
        self,
        event_manager: EventManager,
        sample_session: SessionState,
        mock_session_manager: Mock,
    ) -> None:
        """Test that update_event_notes updates donut events when is_donut=True."""
        event = DonutMoveEvent(
            employee_id=1,
            employee_name="Alice",
            old_position=5,
            new_position=1,
            old_performance=PerformanceLevel.MEDIUM,
            old_potential=PotentialLevel.MEDIUM,
            new_performance=PerformanceLevel.LOW,
            new_potential=PotentialLevel.LOW,
        )

        sample_session.donut_events = [event]

        updated_event = event_manager.update_event_notes(
            sample_session,
            event.event_id,
            "Donut notes",
            is_donut=True,
        )

        assert updated_event is not None
        assert updated_event.notes == "Donut notes"

    def test_update_event_notes_does_not_update_regular_event_when_is_donut_true(
        self,
        event_manager: EventManager,
        sample_session: SessionState,
        mock_session_manager: Mock,
    ) -> None:
        """Test that update_event_notes doesn't update regular events when is_donut=True."""
        event = GridMoveEvent(
            employee_id=1,
            employee_name="Alice",
            old_position=5,
            new_position=1,
            old_performance=PerformanceLevel.MEDIUM,
            old_potential=PotentialLevel.MEDIUM,
            new_performance=PerformanceLevel.LOW,
            new_potential=PotentialLevel.LOW,
        )

        sample_session.events = [event]

        # Try to update with is_donut=True
        updated_event = event_manager.update_event_notes(
            sample_session,
            event.event_id,
            "New notes",
            is_donut=True,
        )

        # Should not find the event
        assert updated_event is None
        assert event.notes is None  # Original event unchanged
