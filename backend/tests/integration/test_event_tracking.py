"""Integration tests for complete event tracking workflows.

These tests verify the end-to-end behavior of the event tracking system,
including:
- Complete flag workflows (add → remove → add back)
- Grid moves + flag changes on same employee
- Event persistence and reload
- Net-zero behavior across all event types
"""

import pytest

from ninebox.models.employee import PerformanceLevel, PotentialLevel
from ninebox.models.events import (
    DonutMoveEvent,
    FlagAddEvent,
    FlagRemoveEvent,
    GridMoveEvent,
)
from ninebox.services.session_manager import SessionManager
from tests.conftest import create_test_employee

pytestmark = pytest.mark.integration

TEST_FLAG = "promotion_ready"


@pytest.fixture
def session_manager() -> SessionManager:
    """Create a fresh session manager for each test."""
    return SessionManager()


@pytest.fixture
def sample_employees_with_flags() -> list:
    """Create sample employees with flags for testing."""
    return [
        create_test_employee(
            employee_id=1,
            name="Alice",
            performance=PerformanceLevel.HIGH,
            potential=PotentialLevel.HIGH,
            flags=["high_retention_priority"],
        ),
        create_test_employee(
            employee_id=2,
            name="Bob",
            performance=PerformanceLevel.MEDIUM,
            potential=PotentialLevel.MEDIUM,
            flags=None,
        ),
        create_test_employee(
            employee_id=3,
            name="Charlie",
            performance=PerformanceLevel.LOW,
            potential=PotentialLevel.LOW,
            flags=[TEST_FLAG, "flight_risk"],
        ),
    ]


class TestFlagWorkflowComplete:
    """Test complete flag workflows from start to finish."""

    def test_flag_workflow_add_remove_add_back(
        self,
        session_manager: SessionManager,
        sample_employees_with_flags: list,
    ) -> None:
        """Test workflow: add flag → remove flag → add back."""
        session_manager.create_session(
            user_id="user1",
            employees=sample_employees_with_flags,
            filename="test.xlsx",
            file_path="/tmp/test.xlsx",
            sheet_name="Employee Data",
            sheet_index=1,
        )

        # Step 1: Add a new flag
        session_manager.update_employee_flags(
            user_id="user1",
            employee_id=2,  # Bob has no flags originally
            new_flags=["promotion_ready"],
        )

        session = session_manager.get_session("user1")
        assert len(session.events) == 1
        assert isinstance(session.events[0], FlagAddEvent)
        assert session.events[0].flag == "promotion_ready"

        # Step 2: Remove the flag
        session_manager.update_employee_flags(
            user_id="user1",
            employee_id=2,
            new_flags=[],
        )

        session = session_manager.get_session("user1")
        assert len(session.events) == 0  # Net-zero (flag wasn't in original)

        # Step 3: Add flag back
        session_manager.update_employee_flags(
            user_id="user1",
            employee_id=2,
            new_flags=["promotion_ready"],
        )

        session = session_manager.get_session("user1")
        assert len(session.events) == 1
        assert isinstance(session.events[0], FlagAddEvent)

    def test_flag_workflow_remove_original_add_back(
        self,
        session_manager: SessionManager,
        sample_employees_with_flags: list,
    ) -> None:
        """Test workflow: remove original flag → add back."""
        session_manager.create_session(
            user_id="user1",
            employees=sample_employees_with_flags,
            filename="test.xlsx",
            file_path="/tmp/test.xlsx",
            sheet_name="Employee Data",
            sheet_index=1,
        )

        # Step 1: Remove original flag
        session_manager.update_employee_flags(
            user_id="user1",
            employee_id=1,  # Alice has high_retention_priority originally
            new_flags=[],
        )

        session = session_manager.get_session("user1")
        assert len(session.events) == 1
        assert isinstance(session.events[0], FlagRemoveEvent)
        assert session.events[0].flag == "high_retention_priority"

        # Step 2: Add flag back
        session_manager.update_employee_flags(
            user_id="user1",
            employee_id=1,
            new_flags=["high_retention_priority"],
        )

        session = session_manager.get_session("user1")
        assert len(session.events) == 0  # Net-zero (back to original)

    def test_flag_workflow_partial_changes(
        self,
        session_manager: SessionManager,
        sample_employees_with_flags: list,
    ) -> None:
        """Test workflow: change some flags, keep others."""
        session_manager.create_session(
            user_id="user1",
            employees=sample_employees_with_flags,
            filename="test.xlsx",
            file_path="/tmp/test.xlsx",
            sheet_name="Employee Data",
            sheet_index=1,
        )

        # Charlie has [TEST_FLAG, "flight_risk"] originally
        # Remove flight_risk, add high_retention_priority, keep TEST_FLAG
        session_manager.update_employee_flags(
            user_id="user1",
            employee_id=3,
            new_flags=[TEST_FLAG, "high_retention_priority"],
        )

        session = session_manager.get_session("user1")
        assert len(session.events) == 2

        # Should have one remove and one add
        flag_remove_events = [e for e in session.events if isinstance(e, FlagRemoveEvent)]
        flag_add_events = [e for e in session.events if isinstance(e, FlagAddEvent)]

        assert len(flag_remove_events) == 1
        assert flag_remove_events[0].flag == "flight_risk"
        assert len(flag_add_events) == 1
        assert flag_add_events[0].flag == "high_retention_priority"

    def test_flag_workflow_multiple_flags_sequence(
        self,
        session_manager: SessionManager,
        sample_employees_with_flags: list,
    ) -> None:
        """Test workflow: add multiple flags in sequence."""
        session_manager.create_session(
            user_id="user1",
            employees=sample_employees_with_flags,
            filename="test.xlsx",
            file_path="/tmp/test.xlsx",
            sheet_name="Employee Data",
            sheet_index=1,
        )

        # Add first flag
        session_manager.update_employee_flags(
            user_id="user1",
            employee_id=2,
            new_flags=["promotion_ready"],
        )

        # Add second flag (keep first)
        session_manager.update_employee_flags(
            user_id="user1",
            employee_id=2,
            new_flags=["promotion_ready", "key_talent"],
        )

        session = session_manager.get_session("user1")
        assert len(session.events) == 2

        flag_values = {event.flag for event in session.events}
        assert flag_values == {"promotion_ready", "key_talent"}


class TestMixedEventWorkflows:
    """Test workflows combining different event types."""

    def test_grid_move_and_flag_change_same_employee(
        self,
        session_manager: SessionManager,
        sample_employees_with_flags: list,
    ) -> None:
        """Test workflow: grid move + flag change on same employee."""
        session_manager.create_session(
            user_id="user1",
            employees=sample_employees_with_flags,
            filename="test.xlsx",
            file_path="/tmp/test.xlsx",
            sheet_name="Employee Data",
            sheet_index=1,
        )

        # Move employee
        session_manager.move_employee(
            user_id="user1",
            employee_id=1,
            new_performance=PerformanceLevel.MEDIUM,
            new_potential=PotentialLevel.MEDIUM,
        )

        # Add flag
        session_manager.update_employee_flags(
            user_id="user1",
            employee_id=1,
            new_flags=["high_retention_priority", "promotion_ready"],
        )

        session = session_manager.get_session("user1")
        assert len(session.events) == 2

        # Should have grid move and flag add
        grid_moves = [e for e in session.events if isinstance(e, GridMoveEvent)]
        flag_adds = [e for e in session.events if isinstance(e, FlagAddEvent)]

        assert len(grid_moves) == 1
        assert len(flag_adds) == 1

    def test_revert_grid_move_keeps_flag_changes(
        self,
        session_manager: SessionManager,
        sample_employees_with_flags: list,
    ) -> None:
        """Test workflow: revert grid move but keep flag changes."""
        session_manager.create_session(
            user_id="user1",
            employees=sample_employees_with_flags,
            filename="test.xlsx",
            file_path="/tmp/test.xlsx",
            sheet_name="Employee Data",
            sheet_index=1,
        )

        # Move and add flag
        session_manager.move_employee(
            user_id="user1",
            employee_id=1,
            new_performance=PerformanceLevel.MEDIUM,
            new_potential=PotentialLevel.MEDIUM,
        )
        session_manager.update_employee_flags(
            user_id="user1",
            employee_id=1,
            new_flags=["high_retention_priority", "promotion_ready"],
        )

        # Revert move
        session_manager.move_employee(
            user_id="user1",
            employee_id=1,
            new_performance=PerformanceLevel.HIGH,
            new_potential=PotentialLevel.HIGH,
        )

        session = session_manager.get_session("user1")

        # Should only have flag add event
        assert len(session.events) == 1
        assert isinstance(session.events[0], FlagAddEvent)

    def test_multiple_employees_different_changes(
        self,
        session_manager: SessionManager,
        sample_employees_with_flags: list,
    ) -> None:
        """Test workflow: different changes on multiple employees."""
        session_manager.create_session(
            user_id="user1",
            employees=sample_employees_with_flags,
            filename="test.xlsx",
            file_path="/tmp/test.xlsx",
            sheet_name="Employee Data",
            sheet_index=1,
        )

        # Move Alice
        session_manager.move_employee(
            user_id="user1",
            employee_id=1,
            new_performance=PerformanceLevel.MEDIUM,
            new_potential=PotentialLevel.MEDIUM,
        )

        # Add flag to Bob
        session_manager.update_employee_flags(
            user_id="user1",
            employee_id=2,
            new_flags=["promotion_ready"],
        )

        # Change Charlie's flags from ["promotion_ready", "flight_risk"] to ["key_talent"]
        # This should generate: 1 add (key_talent) + 2 removes (promotion_ready, flight_risk)
        session_manager.update_employee_flags(
            user_id="user1",
            employee_id=3,
            new_flags=["key_talent"],
        )

        session = session_manager.get_session("user1")
        # Total events: 1 grid move (Alice) + 1 flag add (Bob) + 3 flag changes (Charlie) = 5
        assert len(session.events) == 5

        # Verify all event types are present
        event_types = {type(event) for event in session.events}
        assert GridMoveEvent in event_types
        assert FlagAddEvent in event_types
        assert FlagRemoveEvent in event_types


class TestDonutModeEventWorkflows:
    """Test donut mode event workflows."""

    def test_donut_move_and_regular_move_separate_tracking(
        self,
        session_manager: SessionManager,
        sample_employees_with_flags: list,
    ) -> None:
        """Test that donut moves and regular moves are tracked separately."""
        session_manager.create_session(
            user_id="user1",
            employees=sample_employees_with_flags,
            filename="test.xlsx",
            file_path="/tmp/test.xlsx",
            sheet_name="Employee Data",
            sheet_index=1,
        )

        # Regular move
        session_manager.move_employee(
            user_id="user1",
            employee_id=1,
            new_performance=PerformanceLevel.MEDIUM,
            new_potential=PotentialLevel.MEDIUM,
        )

        # Donut move (moving to a different donut position)
        session_manager.move_employee_donut(
            user_id="user1",
            employee_id=1,
            new_performance=PerformanceLevel.LOW,
            new_potential=PotentialLevel.HIGH,
        )

        session = session_manager.get_session("user1")

        # Should have one regular event and one donut event
        assert len(session.events) == 1
        assert len(session.donut_events) == 1
        assert isinstance(session.events[0], GridMoveEvent)
        assert isinstance(session.donut_events[0], DonutMoveEvent)

    def test_donut_move_return_to_5_removes_event(
        self,
        session_manager: SessionManager,
        sample_employees_with_flags: list,
    ) -> None:
        """Test that returning to position 5 in donut mode removes event."""
        session_manager.create_session(
            user_id="user1",
            employees=sample_employees_with_flags,
            filename="test.xlsx",
            file_path="/tmp/test.xlsx",
            sheet_name="Employee Data",
            sheet_index=1,
        )

        # Move to donut (different position)
        session_manager.move_employee_donut(
            user_id="user1",
            employee_id=1,
            new_performance=PerformanceLevel.LOW,
            new_potential=PotentialLevel.HIGH,
        )

        session = session_manager.get_session("user1")
        assert len(session.donut_events) == 1

        # Move back to position 5 (MEDIUM, MEDIUM) - this is the neutral/center position in donut mode
        session_manager.move_employee_donut(
            user_id="user1",
            employee_id=1,
            new_performance=PerformanceLevel.MEDIUM,
            new_potential=PotentialLevel.MEDIUM,
        )

        session = session_manager.get_session("user1")
        assert len(session.donut_events) == 0  # Net-zero when back to position 5


class TestEventPersistence:
    """Test event persistence and reload."""

    def test_events_persist_across_session_reload(
        self,
        session_manager: SessionManager,
        sample_employees_with_flags: list,
    ) -> None:
        """Test that events persist when session is reloaded."""
        session_id = session_manager.create_session(
            user_id="user1",
            employees=sample_employees_with_flags,
            filename="test.xlsx",
            file_path="/tmp/test.xlsx",
            sheet_name="Employee Data",
            sheet_index=1,
        )

        # Make changes
        session_manager.move_employee(
            user_id="user1",
            employee_id=1,
            new_performance=PerformanceLevel.MEDIUM,
            new_potential=PotentialLevel.MEDIUM,
        )
        session_manager.update_employee_flags(
            user_id="user1",
            employee_id=2,
            new_flags=["promotion_ready"],
        )

        # Get initial events
        session1 = session_manager.get_session("user1")
        original_events = session1.events.copy()

        # Create new session manager (simulates app restart)
        new_session_manager = SessionManager()

        # Load session
        loaded_session = new_session_manager.get_session("user1")

        # Events should be preserved
        assert loaded_session is not None
        assert len(loaded_session.events) == len(original_events)

        # Verify event types preserved
        loaded_event_types = {type(e) for e in loaded_session.events}
        original_event_types = {type(e) for e in original_events}
        assert loaded_event_types == original_event_types

    def test_event_notes_persist(
        self,
        session_manager: SessionManager,
        sample_employees_with_flags: list,
    ) -> None:
        """Test that event notes persist across operations."""
        session_manager.create_session(
            user_id="user1",
            employees=sample_employees_with_flags,
            filename="test.xlsx",
            file_path="/tmp/test.xlsx",
            sheet_name="Employee Data",
            sheet_index=1,
        )

        # Move with notes
        event = session_manager.move_employee(
            user_id="user1",
            employee_id=1,
            new_performance=PerformanceLevel.MEDIUM,
            new_potential=PotentialLevel.MEDIUM,
        )

        # Add notes
        session = session_manager.get_session("user1")
        event_manager = session_manager.event_manager
        event_manager.update_event_notes(session, event.event_id, "Test notes")

        # Reload session
        session = session_manager.get_session("user1")

        assert len(session.events) == 1
        assert session.events[0].notes == "Test notes"


class TestNetZeroBehaviorEndToEnd:
    """Test net-zero behavior across complete workflows."""

    def test_all_changes_reverted_results_in_empty_events(
        self,
        session_manager: SessionManager,
        sample_employees_with_flags: list,
    ) -> None:
        """Test that reverting all changes results in empty events list."""
        session_manager.create_session(
            user_id="user1",
            employees=sample_employees_with_flags,
            filename="test.xlsx",
            file_path="/tmp/test.xlsx",
            sheet_name="Employee Data",
            sheet_index=1,
        )

        # Make multiple changes
        session_manager.move_employee(
            user_id="user1",
            employee_id=1,
            new_performance=PerformanceLevel.MEDIUM,
            new_potential=PotentialLevel.MEDIUM,
        )
        session_manager.update_employee_flags(
            user_id="user1",
            employee_id=1,
            new_flags=["high_retention_priority", "promotion_ready"],
        )
        session_manager.update_employee_flags(
            user_id="user1",
            employee_id=2,
            new_flags=["key_talent"],
        )

        # Revert all changes
        session_manager.move_employee(
            user_id="user1",
            employee_id=1,
            new_performance=PerformanceLevel.HIGH,
            new_potential=PotentialLevel.HIGH,
        )
        session_manager.update_employee_flags(
            user_id="user1",
            employee_id=1,
            new_flags=["high_retention_priority"],  # Back to original
        )
        session_manager.update_employee_flags(
            user_id="user1",
            employee_id=2,
            new_flags=[],  # Back to original (no flags)
        )

        session = session_manager.get_session("user1")
        assert len(session.events) == 0

    def test_complex_flag_sequence_ends_at_net_zero(
        self,
        session_manager: SessionManager,
        sample_employees_with_flags: list,
    ) -> None:
        """Test complex flag sequence that ends at net-zero."""
        session_manager.create_session(
            user_id="user1",
            employees=sample_employees_with_flags,
            filename="test.xlsx",
            file_path="/tmp/test.xlsx",
            sheet_name="Employee Data",
            sheet_index=1,
        )

        # Complex sequence:
        # 1. Remove original flag
        session_manager.update_employee_flags(
            user_id="user1",
            employee_id=1,
            new_flags=[],
        )

        # 2. Add new flag
        session_manager.update_employee_flags(
            user_id="user1",
            employee_id=1,
            new_flags=["promotion_ready"],
        )

        # 3. Add back original flag
        session_manager.update_employee_flags(
            user_id="user1",
            employee_id=1,
            new_flags=["promotion_ready", "high_retention_priority"],
        )

        # 4. Remove new flag (back to original)
        session_manager.update_employee_flags(
            user_id="user1",
            employee_id=1,
            new_flags=["high_retention_priority"],
        )

        session = session_manager.get_session("user1")
        assert len(session.events) == 0  # Back to original state


class TestErrorConditions:
    """Test error handling in event tracking."""

    def test_update_flags_on_nonexistent_employee_raises_error(
        self,
        session_manager: SessionManager,
        sample_employees_with_flags: list,
    ) -> None:
        """Test that updating flags on non-existent employee raises error."""
        session_manager.create_session(
            user_id="user1",
            employees=sample_employees_with_flags,
            filename="test.xlsx",
            file_path="/tmp/test.xlsx",
            sheet_name="Employee Data",
            sheet_index=1,
        )

        with pytest.raises(ValueError):
            session_manager.update_employee_flags(
                user_id="user1",
                employee_id=999,  # Doesn't exist
                new_flags=["promotion_ready"],
            )

    def test_move_employee_on_nonexistent_session_raises_error(
        self,
        session_manager: SessionManager,
    ) -> None:
        """Test that moving employee on non-existent session raises error."""
        with pytest.raises(ValueError):
            session_manager.move_employee(
                user_id="nonexistent",
                employee_id=1,
                new_performance=PerformanceLevel.MEDIUM,
                new_potential=PotentialLevel.MEDIUM,
            )
