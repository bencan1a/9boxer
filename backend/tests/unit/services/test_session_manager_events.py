"""Tests for session manager event tracking with new TrackableEvent architecture.

This file contains tests for the new event system added to SessionManager.
It complements the existing test_session_manager.py by focusing on:
- FlagAddEvent and FlagRemoveEvent
- GridMoveEvent and DonutMoveEvent
- EventManager integration
- Net-zero event behavior
"""

from datetime import date

import pytest

from ninebox.models.employee import Employee, PerformanceLevel, PotentialLevel
from ninebox.models.events import (
    DonutMoveEvent,
    FlagAddEvent,
    FlagRemoveEvent,
    GridMoveEvent,
)
from ninebox.services.session_manager import SessionManager

pytestmark = pytest.mark.unit

# Test flag constant - must be valid from ALLOWED_FLAGS
TEST_FLAG = "promotion_ready"


def _create_test_employee_with_flags(
    employee_id: int,
    name: str,
    performance: PerformanceLevel,
    potential: PotentialLevel,
    flags: list[str] | None,
) -> Employee:
    """Create a minimal Employee for testing with all required fields."""
    return Employee(
        employee_id=employee_id,
        name=name,
        business_title="Test Title",
        job_title="Test Job",
        job_profile="Test ProfileUSA",
        job_level="MT4",
        job_function="Other",
        location="USA",
        manager="Test Manager",
        hire_date=date(2020, 1, 1),
        tenure_category="3-5 years",
        time_in_job_profile="2 years",
        performance=performance,
        potential=potential,
        grid_position=5,
        talent_indicator="Solid Contributor",
        flags=flags,
    )


@pytest.fixture
def session_manager() -> SessionManager:
    """Create a fresh session manager for each test."""
    return SessionManager()


@pytest.fixture
def sample_employees_with_flags() -> list:
    """Create sample employees with flags for testing."""
    return [
        _create_test_employee_with_flags(
            employee_id=1,
            name="Alice",
            performance=PerformanceLevel.HIGH,
            potential=PotentialLevel.HIGH,
            flags=["promotion_ready"],
        ),
        _create_test_employee_with_flags(
            employee_id=2,
            name="Bob",
            performance=PerformanceLevel.MEDIUM,
            potential=PotentialLevel.MEDIUM,
            flags=None,
        ),
        _create_test_employee_with_flags(
            employee_id=3,
            name="Charlie",
            performance=PerformanceLevel.LOW,
            potential=PotentialLevel.LOW,
            flags=["promotion_ready", "flagged_for_discussion"],
        ),
    ]


class TestMoveEmployeeWithEvents:
    """Tests for move_employee using new GridMoveEvent."""

    def test_move_employee_when_called_then_creates_grid_move_event(
        self,
        session_manager: SessionManager,
        sample_employees_with_flags: list,
    ) -> None:
        """Test that move_employee creates a GridMoveEvent."""
        session_manager.create_session(
            user_id="user1",
            employees=sample_employees_with_flags,
            filename="test.xlsx",
            file_path="/tmp/test.xlsx",
            sheet_name="Employee Data",
            sheet_index=1,
        )

        event = session_manager.move_employee(
            user_id="user1",
            employee_id=1,
            new_performance=PerformanceLevel.MEDIUM,
            new_potential=PotentialLevel.MEDIUM,
        )

        assert isinstance(event, GridMoveEvent)
        assert event.employee_id == 1
        assert event.employee_name == "Alice"
        assert event.old_performance == PerformanceLevel.HIGH
        assert event.old_potential == PerformanceLevel.HIGH
        assert event.new_performance == PerformanceLevel.MEDIUM
        assert event.new_potential == PotentialLevel.MEDIUM
        assert event.event_type == "grid_move"

    def test_move_employee_when_called_then_adds_event_to_session(
        self,
        session_manager: SessionManager,
        sample_employees_with_flags: list,
    ) -> None:
        """Test that move_employee adds event to session.events."""
        session_manager.create_session(
            user_id="user1",
            employees=sample_employees_with_flags,
            filename="test.xlsx",
            file_path="/tmp/test.xlsx",
            sheet_name="Employee Data",
            sheet_index=1,
        )

        session_manager.move_employee(
            user_id="user1",
            employee_id=1,
            new_performance=PerformanceLevel.MEDIUM,
            new_potential=PotentialLevel.MEDIUM,
        )

        session = session_manager.get_session("user1")
        assert session is not None
        assert len(session.events) == 1
        assert isinstance(session.events[0], GridMoveEvent)

    def test_move_employee_when_back_to_original_then_removes_event(
        self,
        session_manager: SessionManager,
        sample_employees_with_flags: list,
    ) -> None:
        """Test that moving back to original position removes the event."""
        session_manager.create_session(
            user_id="user1",
            employees=sample_employees_with_flags,
            filename="test.xlsx",
            file_path="/tmp/test.xlsx",
            sheet_name="Employee Data",
            sheet_index=1,
        )

        # Move away from original
        session_manager.move_employee(
            user_id="user1",
            employee_id=1,
            new_performance=PerformanceLevel.MEDIUM,
            new_potential=PotentialLevel.MEDIUM,
        )

        session = session_manager.get_session("user1")
        assert len(session.events) == 1

        # Move back to original (HIGH, HIGH)
        session_manager.move_employee(
            user_id="user1",
            employee_id=1,
            new_performance=PerformanceLevel.HIGH,
            new_potential=PotentialLevel.HIGH,
        )

        session = session_manager.get_session("user1")
        assert len(session.events) == 0  # Event removed (net-zero)

    def test_move_employee_when_moved_twice_then_single_event(
        self,
        session_manager: SessionManager,
        sample_employees_with_flags: list,
    ) -> None:
        """Test that multiple moves result in a single event with latest position."""
        session_manager.create_session(
            user_id="user1",
            employees=sample_employees_with_flags,
            filename="test.xlsx",
            file_path="/tmp/test.xlsx",
            sheet_name="Employee Data",
            sheet_index=1,
        )

        # First move
        session_manager.move_employee(
            user_id="user1",
            employee_id=1,
            new_performance=PerformanceLevel.MEDIUM,
            new_potential=PotentialLevel.MEDIUM,
        )

        # Second move
        session_manager.move_employee(
            user_id="user1",
            employee_id=1,
            new_performance=PerformanceLevel.LOW,
            new_potential=PotentialLevel.LOW,
        )

        session = session_manager.get_session("user1")
        assert len(session.events) == 1
        event = session.events[0]
        assert event.new_performance == PerformanceLevel.LOW
        assert event.new_potential == PotentialLevel.LOW


class TestMoveEmployeeDonutWithEvents:
    """Tests for move_employee_donut using new DonutMoveEvent."""

    def test_move_employee_donut_when_called_then_creates_donut_move_event(
        self,
        session_manager: SessionManager,
        sample_employees_with_flags: list,
    ) -> None:
        """Test that move_employee_donut creates a DonutMoveEvent."""
        session_manager.create_session(
            user_id="user1",
            employees=sample_employees_with_flags,
            filename="test.xlsx",
            file_path="/tmp/test.xlsx",
            sheet_name="Employee Data",
            sheet_index=1,
        )

        event = session_manager.move_employee_donut(
            user_id="user1",
            employee_id=1,
            new_performance=PerformanceLevel.LOW,
            new_potential=PotentialLevel.LOW,
        )

        assert isinstance(event, DonutMoveEvent)
        assert event.employee_id == 1
        assert event.new_performance == PerformanceLevel.LOW
        assert event.event_type == "donut_move"

    def test_move_employee_donut_when_return_to_5_then_removes_event(
        self,
        session_manager: SessionManager,
        sample_employees_with_flags: list,
    ) -> None:
        """Test that returning to position 5 (center) removes the donut event."""
        session_manager.create_session(
            user_id="user1",
            employees=sample_employees_with_flags,
            filename="test.xlsx",
            file_path="/tmp/test.xlsx",
            sheet_name="Employee Data",
            sheet_index=1,
        )

        # Move Alice (originally HIGH/HIGH, position 9) to LOW/LOW (position 1)
        # This should create a donut event
        session_manager.move_employee_donut(
            user_id="user1",
            employee_id=1,
            new_performance=PerformanceLevel.LOW,
            new_potential=PotentialLevel.LOW,
        )

        session = session_manager.get_session("user1")
        assert len(session.donut_events) == 1

        # Move back to position 5 (MEDIUM/MEDIUM - the center position)
        # This should remove the donut event (net-zero)
        session_manager.move_employee_donut(
            user_id="user1",
            employee_id=1,
            new_performance=PerformanceLevel.MEDIUM,
            new_potential=PotentialLevel.MEDIUM,
        )

        session = session_manager.get_session("user1")
        assert len(session.donut_events) == 0  # Event removed (net-zero)


class TestUpdateEmployeeFlags:
    """Tests for update_employee_flags method."""

    def test_update_employee_flags_when_adding_new_flag_then_creates_flag_add_event(
        self,
        session_manager: SessionManager,
        sample_employees_with_flags: list,
    ) -> None:
        """Test that adding a new flag creates a FlagAddEvent."""
        session_manager.create_session(
            user_id="user1",
            employees=sample_employees_with_flags,
            filename="test.xlsx",
            file_path="/tmp/test.xlsx",
            sheet_name="Employee Data",
            sheet_index=1,
        )

        # Add a new flag to Bob (who has no flags originally)
        session_manager.update_employee_flags(
            user_id="user1",
            employee_id=2,
            new_flags=["promotion_ready"],
        )

        session = session_manager.get_session("user1")
        assert len(session.events) == 1
        event = session.events[0]
        assert isinstance(event, FlagAddEvent)
        assert event.employee_id == 2
        assert event.employee_name == "Bob"
        assert event.flag == "promotion_ready"

    def test_update_employee_flags_when_removing_flag_from_original_then_creates_flag_remove_event(
        self,
        session_manager: SessionManager,
        sample_employees_with_flags: list,
    ) -> None:
        """Test that removing a flag that was in original creates FlagRemoveEvent."""
        session_manager.create_session(
            user_id="user1",
            employees=sample_employees_with_flags,
            filename="test.xlsx",
            file_path="/tmp/test.xlsx",
            sheet_name="Employee Data",
            sheet_index=1,
        )

        # Remove promotion_ready flag from Alice (was in original)
        session_manager.update_employee_flags(
            user_id="user1",
            employee_id=1,
            new_flags=[],  # Remove all flags
        )

        session = session_manager.get_session("user1")
        assert len(session.events) == 1
        event = session.events[0]
        assert isinstance(event, FlagRemoveEvent)
        assert event.employee_id == 1
        assert event.flag == "promotion_ready"

    def test_update_employee_flags_when_removing_added_flag_then_removes_add_event(
        self,
        session_manager: SessionManager,
        sample_employees_with_flags: list,
    ) -> None:
        """Test that removing a flag that wasn't in original removes the FlagAddEvent."""
        session_manager.create_session(
            user_id="user1",
            employees=sample_employees_with_flags,
            filename="test.xlsx",
            file_path="/tmp/test.xlsx",
            sheet_name="Employee Data",
            sheet_index=1,
        )

        # Add a new flag
        session_manager.update_employee_flags(
            user_id="user1",
            employee_id=2,
            new_flags=["promotion_ready"],
        )

        session = session_manager.get_session("user1")
        assert len(session.events) == 1

        # Remove the flag
        session_manager.update_employee_flags(
            user_id="user1",
            employee_id=2,
            new_flags=[],
        )

        session = session_manager.get_session("user1")
        assert len(session.events) == 0  # FlagAddEvent removed (net-zero)

    def test_update_employee_flags_when_adding_back_removed_flag_then_removes_remove_event(
        self,
        session_manager: SessionManager,
        sample_employees_with_flags: list,
    ) -> None:
        """Test that adding back a removed flag removes the FlagRemoveEvent."""
        session_manager.create_session(
            user_id="user1",
            employees=sample_employees_with_flags,
            filename="test.xlsx",
            file_path="/tmp/test.xlsx",
            sheet_name="Employee Data",
            sheet_index=1,
        )

        # Remove flag
        session_manager.update_employee_flags(
            user_id="user1",
            employee_id=1,
            new_flags=[],
        )

        session = session_manager.get_session("user1")
        assert len(session.events) == 1
        assert isinstance(session.events[0], FlagRemoveEvent)

        # Add flag back
        session_manager.update_employee_flags(
            user_id="user1",
            employee_id=1,
            new_flags=["promotion_ready"],
        )

        session = session_manager.get_session("user1")
        assert len(session.events) == 0  # FlagRemoveEvent removed (back to original)

    def test_update_employee_flags_when_multiple_flags_then_creates_multiple_events(
        self,
        session_manager: SessionManager,
        sample_employees_with_flags: list,
    ) -> None:
        """Test that adding multiple new flags creates multiple FlagAddEvents."""
        session_manager.create_session(
            user_id="user1",
            employees=sample_employees_with_flags,
            filename="test.xlsx",
            file_path="/tmp/test.xlsx",
            sheet_name="Employee Data",
            sheet_index=1,
        )

        # Add two new flags to Bob
        session_manager.update_employee_flags(
            user_id="user1",
            employee_id=2,
            new_flags=["promotion_ready", "flagged_for_discussion"],
        )

        session = session_manager.get_session("user1")
        assert len(session.events) == 2
        flag_values = {event.flag for event in session.events}
        assert flag_values == {"promotion_ready", "flagged_for_discussion"}

    def test_update_employee_flags_when_partial_change_then_tracks_diff(
        self,
        session_manager: SessionManager,
        sample_employees_with_flags: list,
    ) -> None:
        """Test that changing some flags tracks only the differences."""
        session_manager.create_session(
            user_id="user1",
            employees=sample_employees_with_flags,
            filename="test.xlsx",
            file_path="/tmp/test.xlsx",
            sheet_name="Employee Data",
            sheet_index=1,
        )

        # Charlie originally has ["promotion_ready", "flagged_for_discussion"]
        # Remove promotion_ready, keep flagged_for_discussion, add flight_risk
        session_manager.update_employee_flags(
            user_id="user1",
            employee_id=3,
            new_flags=["flagged_for_discussion", "flight_risk"],
        )

        session = session_manager.get_session("user1")
        assert len(session.events) == 2

        # Should have one remove and one add
        event_types = {type(event) for event in session.events}
        assert FlagRemoveEvent in event_types
        assert FlagAddEvent in event_types

    def test_update_employee_flags_when_no_changes_then_no_events(
        self,
        session_manager: SessionManager,
        sample_employees_with_flags: list,
    ) -> None:
        """Test that setting flags to same value creates no events."""
        session_manager.create_session(
            user_id="user1",
            employees=sample_employees_with_flags,
            filename="test.xlsx",
            file_path="/tmp/test.xlsx",
            sheet_name="Employee Data",
            sheet_index=1,
        )

        # Set to same flags as original
        session_manager.update_employee_flags(
            user_id="user1",
            employee_id=1,
            new_flags=["promotion_ready"],
        )

        session = session_manager.get_session("user1")
        assert len(session.events) == 0

    def test_update_employee_flags_when_multiple_changes_then_preserves_other_flags(
        self,
        session_manager: SessionManager,
        sample_employees_with_flags: list,
    ) -> None:
        """Test that changing one flag doesn't affect events for other flags."""
        session_manager.create_session(
            user_id="user1",
            employees=sample_employees_with_flags,
            filename="test.xlsx",
            file_path="/tmp/test.xlsx",
            sheet_name="Employee Data",
            sheet_index=1,
        )

        # Add two flags
        session_manager.update_employee_flags(
            user_id="user1",
            employee_id=2,
            new_flags=["promotion_ready", "flagged_for_discussion"],
        )

        session = session_manager.get_session("user1")
        assert len(session.events) == 2

        # Remove one flag
        session_manager.update_employee_flags(
            user_id="user1",
            employee_id=2,
            new_flags=["promotion_ready"],  # Keep only one
        )

        session = session_manager.get_session("user1")
        # Should only have one FlagAddEvent left
        assert len(session.events) == 1
        assert session.events[0].flag == "promotion_ready"


class TestMixedEventTypes:
    """Tests for scenarios with mixed event types."""

    def test_when_grid_move_and_flag_change_then_both_events_exist(
        self,
        session_manager: SessionManager,
        sample_employees_with_flags: list,
    ) -> None:
        """Test that grid moves and flag changes can coexist."""
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
            new_flags=["promotion_ready", "flagged_for_discussion"],
        )

        session = session_manager.get_session("user1")
        assert len(session.events) == 2

        event_types = {type(event) for event in session.events}
        assert GridMoveEvent in event_types
        assert FlagAddEvent in event_types

    def test_when_reverting_grid_move_then_only_flag_events_remain(
        self,
        session_manager: SessionManager,
        sample_employees_with_flags: list,
    ) -> None:
        """Test that reverting a move leaves flag events intact."""
        session_manager.create_session(
            user_id="user1",
            employees=sample_employees_with_flags,
            filename="test.xlsx",
            file_path="/tmp/test.xlsx",
            sheet_name="Employee Data",
            sheet_index=1,
        )

        # Move and flag change
        session_manager.move_employee(
            user_id="user1",
            employee_id=1,
            new_performance=PerformanceLevel.MEDIUM,
            new_potential=PotentialLevel.MEDIUM,
        )
        session_manager.update_employee_flags(
            user_id="user1",
            employee_id=1,
            new_flags=["promotion_ready", "flagged_for_discussion"],
        )

        # Revert move
        session_manager.move_employee(
            user_id="user1",
            employee_id=1,
            new_performance=PerformanceLevel.HIGH,
            new_potential=PotentialLevel.HIGH,
        )

        session = session_manager.get_session("user1")
        assert len(session.events) == 1
        assert isinstance(session.events[0], FlagAddEvent)

    def test_when_multiple_employees_with_different_event_types_then_all_tracked(
        self,
        session_manager: SessionManager,
        sample_employees_with_flags: list,
    ) -> None:
        """Test that different employees can have different event types."""
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

        # Remove flag from Charlie
        session_manager.update_employee_flags(
            user_id="user1",
            employee_id=3,
            new_flags=["flagged_for_discussion"],  # Remove promotion_ready
        )

        session = session_manager.get_session("user1")
        assert len(session.events) == 3

        event_types = {type(event) for event in session.events}
        assert GridMoveEvent in event_types
        assert FlagAddEvent in event_types
        assert FlagRemoveEvent in event_types
