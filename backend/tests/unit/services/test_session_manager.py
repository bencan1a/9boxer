"""Tests for session manager service."""

from datetime import datetime

import pytest

from ninebox.models.employee import Employee, PerformanceLevel, PotentialLevel
from ninebox.models.events import GridMoveEvent
from ninebox.models.grid_positions import calculate_grid_position, get_position_label
from ninebox.services.session_manager import SessionManager



pytestmark = pytest.mark.unit

@pytest.fixture
def session_manager() -> SessionManager:
    """Create a fresh session manager for each test."""
    return SessionManager()


def test_create_session_when_valid_data_then_creates_new_session(
    session_manager: SessionManager, sample_employees: list[Employee]
) -> None:
    """Test creating a new session."""
    session_id = session_manager.create_session(
        user_id="user1",
        employees=sample_employees,
        filename="test.xlsx",
        file_path="/tmp/test.xlsx",
        sheet_name="Employee Data",
        sheet_index=1,
    )

    assert session_id is not None
    assert len(session_id) > 0

    session = session_manager.get_session("user1")
    assert session is not None
    assert session.session_id == session_id
    assert session.user_id == "user1"
    assert len(session.original_employees) == 5
    assert len(session.current_employees) == 5


def test_get_session_when_exists_then_retrieves_session(
    session_manager: SessionManager, sample_employees: list[Employee]
) -> None:
    """Test retrieving an existing session."""
    session_id = session_manager.create_session(
        user_id="user1",
        employees=sample_employees,
        filename="test.xlsx",
        file_path="/tmp/test.xlsx",
        sheet_name="Employee Data",
        sheet_index=1,
    )

    session = session_manager.get_session("user1")

    assert session is not None
    assert session.session_id == session_id
    assert session.original_filename == "test.xlsx"
    assert isinstance(session.created_at, datetime)


def test_get_session_when_not_exists_then_returns_none(session_manager: SessionManager) -> None:
    """Test retrieving non-existent session."""
    session = session_manager.get_session("nonexistent")
    assert session is None


def test_move_employee_when_valid_then_updates_employee_position(
    session_manager: SessionManager, sample_employees: list[Employee]
) -> None:
    """Test moving an employee to a new position."""
    session_manager.create_session(
        user_id="user1",
        employees=sample_employees,
        filename="test.xlsx",
        file_path="/tmp/test.xlsx",
        sheet_name="Employee Data",
        sheet_index=1,
    )

    # Move first employee from H,H to M,M
    event = session_manager.move_employee(
        user_id="user1",
        employee_id=1,
        new_performance=PerformanceLevel.MEDIUM,
        new_potential=PotentialLevel.MEDIUM,
    )

    # Verify event details
    assert event.employee_id == 1
    assert event.old_performance == PerformanceLevel.HIGH
    assert event.old_potential == PotentialLevel.HIGH
    assert event.new_performance == PerformanceLevel.MEDIUM
    assert event.new_potential == PotentialLevel.MEDIUM
    assert event.old_position == 9
    assert event.new_position == 5

    # Verify employee was updated
    session = session_manager.get_session("user1")
    assert session is not None
    emp = session.current_employees[0]
    assert emp.performance == PerformanceLevel.MEDIUM
    assert emp.potential == PotentialLevel.MEDIUM
    assert emp.grid_position == 5
    assert emp.modified_in_session is True
    assert emp.last_modified is not None


def test_move_employee_when_valid_then_tracks_changes(
    session_manager: SessionManager, sample_employees: list[Employee]
) -> None:
    """Test that employee moves are tracked in session."""
    session_manager.create_session(
        user_id="user1",
        employees=sample_employees,
        filename="test.xlsx",
        file_path="/tmp/test.xlsx",
        sheet_name="Employee Data",
        sheet_index=1,
    )

    # Make multiple moves
    session_manager.move_employee(
        user_id="user1",
        employee_id=1,
        new_performance=PerformanceLevel.MEDIUM,
        new_potential=PotentialLevel.LOW,
    )
    session_manager.move_employee(
        user_id="user1",
        employee_id=2,
        new_performance=PerformanceLevel.HIGH,
        new_potential=PotentialLevel.HIGH,
    )

    session = session_manager.get_session("user1")
    assert len(session.events) == 2
    assert session.events[0].employee_id == 1
    assert session.events[1].employee_id == 2


def test_move_employee_when_moved_back_to_original_position_then_modified_status_removed(
    session_manager: SessionManager, sample_employees: list[Employee]
) -> None:
    """Test that moving an employee back to original position removes modified status."""
    session_manager.create_session(
        user_id="user1",
        employees=sample_employees,
        filename="test.xlsx",
        file_path="/tmp/test.xlsx",
        sheet_name="Employee Data",
        sheet_index=1,
    )

    session = session_manager.get_session("user1")
    original_performance = session.original_employees[0].performance
    original_potential = session.original_employees[0].potential

    # Move employee away from original position
    session_manager.move_employee(
        user_id="user1",
        employee_id=1,
        new_performance=PerformanceLevel.MEDIUM,
        new_potential=PotentialLevel.MEDIUM,
    )

    # Verify employee is marked as modified
    session = session_manager.get_session("user1")
    emp = session.current_employees[0]
    assert emp.modified_in_session is True

    # Move employee back to original position
    session_manager.move_employee(
        user_id="user1",
        employee_id=1,
        new_performance=original_performance,
        new_potential=original_potential,
    )

    # Verify employee is no longer marked as modified
    session = session_manager.get_session("user1")
    emp = session.current_employees[0]
    assert emp.modified_in_session is False
    assert emp.performance == original_performance
    assert emp.potential == original_potential


def test_move_employee_when_no_session_then_raises_error(session_manager: SessionManager) -> None:
    """Test moving employee without active session."""
    with pytest.raises(ValueError, match="No active session"):
        session_manager.move_employee(
            user_id="nonexistent",
            employee_id=1,
            new_performance=PerformanceLevel.MEDIUM,
            new_potential=PotentialLevel.MEDIUM,
        )


def test_move_employee_when_invalid_employee_id_then_raises_error(
    session_manager: SessionManager, sample_employees: list[Employee]
) -> None:
    """Test moving non-existent employee."""
    session_manager.create_session(
        user_id="user1",
        employees=sample_employees,
        filename="test.xlsx",
        file_path="/tmp/test.xlsx",
        sheet_name="Employee Data",
        sheet_index=1,
    )

    with pytest.raises(ValueError, match="Employee 999 not found"):
        session_manager.move_employee(
            user_id="user1",
            employee_id=999,
            new_performance=PerformanceLevel.MEDIUM,
            new_potential=PotentialLevel.MEDIUM,
        )


def test_delete_session_when_exists_then_removes_session(
    session_manager: SessionManager, sample_employees: list[Employee]
) -> None:
    """Test deleting a session."""
    session_manager.create_session(
        user_id="user1",
        employees=sample_employees,
        filename="test.xlsx",
        file_path="/tmp/test.xlsx",
        sheet_name="Employee Data",
        sheet_index=1,
    )

    result = session_manager.delete_session("user1")
    assert result is True

    session = session_manager.get_session("user1")
    assert session is None


def test_delete_session_when_not_exists_then_returns_false(session_manager: SessionManager) -> None:
    """Test deleting non-existent session."""
    result = session_manager.delete_session("nonexistent")
    assert result is False


def test_position_calculation_when_all_9_grid_positions_then_correct() -> None:
    """Test position calculation for all 9 grid positions.

    Standard 9-box grid layout:
        Performance (columns): Low=1, Medium=2, High=3
        Potential (rows): Low=1-3, Medium=4-6, High=7-9
    """
    # Low performance (column 1)
    assert calculate_grid_position(PerformanceLevel.LOW, PotentialLevel.LOW) == 1
    assert calculate_grid_position(PerformanceLevel.LOW, PotentialLevel.MEDIUM) == 4
    assert calculate_grid_position(PerformanceLevel.LOW, PotentialLevel.HIGH) == 7

    # Medium performance (column 2)
    assert calculate_grid_position(PerformanceLevel.MEDIUM, PotentialLevel.LOW) == 2
    assert calculate_grid_position(PerformanceLevel.MEDIUM, PotentialLevel.MEDIUM) == 5
    assert calculate_grid_position(PerformanceLevel.MEDIUM, PotentialLevel.HIGH) == 8

    # High performance (column 3)
    assert calculate_grid_position(PerformanceLevel.HIGH, PotentialLevel.LOW) == 3
    assert calculate_grid_position(PerformanceLevel.HIGH, PotentialLevel.MEDIUM) == 6
    assert calculate_grid_position(PerformanceLevel.HIGH, PotentialLevel.HIGH) == 9


def test_position_label_generation_when_all_combinations_then_correct() -> None:
    """Test position label generation for all combinations."""
    labels = {
        (PerformanceLevel.HIGH, PotentialLevel.HIGH): "Star [H,H]",
        (PerformanceLevel.HIGH, PotentialLevel.MEDIUM): "High Impact [H,M]",
        (PerformanceLevel.HIGH, PotentialLevel.LOW): "Workhorse [H,L]",
        (PerformanceLevel.MEDIUM, PotentialLevel.HIGH): "Growth [M,H]",
        (PerformanceLevel.MEDIUM, PotentialLevel.MEDIUM): "Core Talent [M,M]",
        (PerformanceLevel.MEDIUM, PotentialLevel.LOW): "Effective Pro [M,L]",
        (PerformanceLevel.LOW, PotentialLevel.HIGH): "Enigma [L,H]",
        (PerformanceLevel.LOW, PotentialLevel.MEDIUM): "Inconsistent [L,M]",
        (PerformanceLevel.LOW, PotentialLevel.LOW): "Underperformer [L,L]",
    }

    for (perf, pot), expected_label in labels.items():
        assert get_position_label(perf, pot) == expected_label


def test_create_session_when_called_then_deep_copies_employees(
    session_manager: SessionManager, sample_employees: list[Employee]
) -> None:
    """Test that session creates deep copies of employee data."""
    session_manager.create_session(
        user_id="user1",
        employees=sample_employees,
        filename="test.xlsx",
        file_path="/tmp/test.xlsx",
        sheet_name="Employee Data",
        sheet_index=1,
    )

    session = session_manager.get_session("user1")

    # Modify current employee
    session.current_employees[0].performance = PerformanceLevel.LOW

    # Original should not be affected
    assert session.original_employees[0].performance == PerformanceLevel.HIGH
    # Input list should not be affected
    assert sample_employees[0].performance == PerformanceLevel.HIGH


def test_move_employee_when_moved_twice_then_single_entry_with_net_change(
    session_manager: SessionManager, sample_employees: list[Employee]
) -> None:
    """Test that moving same employee twice results in single entry (most recent move)."""
    session_manager.create_session(
        user_id="user1",
        employees=sample_employees,
        filename="test.xlsx",
        file_path="/tmp/test.xlsx",
        sheet_name="Employee Data",
        sheet_index=1,
    )

    # Employee 1 starts at H,H (position 9)
    # Move 1: H,H -> M,M (position 5)
    first_change = session_manager.move_employee(
        user_id="user1",
        employee_id=1,
        new_performance=PerformanceLevel.MEDIUM,
        new_potential=PotentialLevel.MEDIUM,
    )

    # Verify first change
    session = session_manager.get_session("user1")
    assert session is not None
    assert len(session.events) == 1
    assert first_change.old_position == 9  # H,H
    assert first_change.new_position == 5  # M,M

    # Move 2: M,M -> L,L (position 1)
    second_change = session_manager.move_employee(
        user_id="user1",
        employee_id=1,
        new_performance=PerformanceLevel.LOW,
        new_potential=PotentialLevel.LOW,
    )

    # Should still be only one entry, showing the most recent move (M,M -> L,L)
    session = session_manager.get_session("user1")
    assert session is not None
    assert len(session.events) == 1
    assert second_change.old_position == 5  # M,M (position before this move)
    assert second_change.new_position == 1  # L,L (final position)
    assert second_change.old_performance == PerformanceLevel.MEDIUM
    assert second_change.old_potential == PerformanceLevel.MEDIUM
    assert second_change.new_performance == PerformanceLevel.LOW
    assert second_change.new_potential == PotentialLevel.LOW


def test_move_employee_when_moved_back_to_original_then_entry_removed(
    session_manager: SessionManager, sample_employees: list[Employee]
) -> None:
    """Test that moving employee back to original position removes change entry entirely."""
    session_manager.create_session(
        user_id="user1",
        employees=sample_employees,
        filename="test.xlsx",
        file_path="/tmp/test.xlsx",
        sheet_name="Employee Data",
        sheet_index=1,
    )

    # Employee 1 starts at H,H
    original_performance = sample_employees[0].performance
    original_potential = sample_employees[0].potential

    # Move away from original
    session_manager.move_employee(
        user_id="user1",
        employee_id=1,
        new_performance=PerformanceLevel.MEDIUM,
        new_potential=PotentialLevel.MEDIUM,
    )

    # Verify change was tracked
    session = session_manager.get_session("user1")
    assert len(session.events) == 1
    assert session.events[0].employee_id == 1

    # Move back to original position
    session_manager.move_employee(
        user_id="user1",
        employee_id=1,
        new_performance=original_performance,
        new_potential=original_potential,
    )

    # Change entry should be completely removed
    session = session_manager.get_session("user1")
    assert session is not None
    assert len(session.events) == 0
    assert session.current_employees[0].modified_in_session is False


def test_move_employee_when_multiple_employees_moved_then_tracks_all_changes(
    session_manager: SessionManager, sample_employees: list[Employee]
) -> None:
    """Test that multiple employees can have change entries tracked simultaneously."""
    session_manager.create_session(
        user_id="user1",
        employees=sample_employees,
        filename="test.xlsx",
        file_path="/tmp/test.xlsx",
        sheet_name="Employee Data",
        sheet_index=1,
    )

    # Move three different employees
    session_manager.move_employee(
        user_id="user1",
        employee_id=1,
        new_performance=PerformanceLevel.MEDIUM,
        new_potential=PotentialLevel.LOW,
    )
    session_manager.move_employee(
        user_id="user1",
        employee_id=2,
        new_performance=PerformanceLevel.HIGH,
        new_potential=PotentialLevel.HIGH,
    )
    session_manager.move_employee(
        user_id="user1",
        employee_id=3,
        new_performance=PerformanceLevel.MEDIUM,
        new_potential=PotentialLevel.MEDIUM,
    )

    session = session_manager.get_session("user1")
    assert session is not None
    assert len(session.events) == 3

    # Verify each employee has exactly one entry
    employee_ids = {c.employee_id for c in session.events}
    assert employee_ids == {1, 2, 3}


def test_move_employee_when_moved_multiple_times_then_preserves_original_position(
    session_manager: SessionManager, sample_employees: list[Employee]
) -> None:
    """Test that multiple moves result in single event showing most recent move."""
    session_manager.create_session(
        user_id="user1",
        employees=sample_employees,
        filename="test.xlsx",
        file_path="/tmp/test.xlsx",
        sheet_name="Employee Data",
        sheet_index=1,
    )

    # Employee 2 starts at M,M (position 5)
    # Move through several positions
    session_manager.move_employee(
        user_id="user1", employee_id=2, new_performance=PerformanceLevel.HIGH, new_potential=PotentialLevel.HIGH
    )
    session_manager.move_employee(
        user_id="user1", employee_id=2, new_performance=PerformanceLevel.LOW, new_potential=PotentialLevel.LOW
    )
    final_event = session_manager.move_employee(
        user_id="user1", employee_id=2, new_performance=PerformanceLevel.HIGH, new_potential=PotentialLevel.MEDIUM
    )

    # Verify only one event exists showing the most recent move (L,L -> H,M)
    session = session_manager.get_session("user1")
    assert session is not None
    assert len(session.events) == 1
    change = session.events[0]
    assert isinstance(change, GridMoveEvent)
    assert change.employee_id == 2
    assert change.old_position == 1  # L,L (position before final move)
    assert change.old_performance == PerformanceLevel.LOW
    assert change.old_potential == PotentialLevel.LOW
    assert change.new_position == 6  # Final H,M
    assert change.new_performance == PerformanceLevel.HIGH
    assert change.new_potential == PotentialLevel.MEDIUM


def test_update_change_notes_when_valid_employee_then_updates_notes(
    session_manager: SessionManager, sample_employees: list[Employee]
) -> None:
    """Test updating notes for an employee with a change entry."""
    session_manager.create_session(
        user_id="user1",
        employees=sample_employees,
        filename="test.xlsx",
        file_path="/tmp/test.xlsx",
        sheet_name="Employee Data",
        sheet_index=1,
    )

    # Move employee to create change entry
    session_manager.move_employee(
        user_id="user1",
        employee_id=1,
        new_performance=PerformanceLevel.MEDIUM,
        new_potential=PotentialLevel.MEDIUM,
    )

    # Verify no notes initially
    session = session_manager.get_session("user1")
    assert session is not None
    assert session.events[0].notes is None

    # Update notes
    test_notes = "Promoted to team lead due to excellent Q4 performance"
    updated_change = session_manager.update_change_notes(
        user_id="user1",
        employee_id=1,
        notes=test_notes,
    )

    # Verify notes were updated
    assert updated_change is not None
    assert updated_change.notes == test_notes
    assert updated_change.employee_id == 1

    # Verify notes persist in session
    session = session_manager.get_session("user1")
    assert session is not None
    assert session.events[0].notes == test_notes


def test_update_change_notes_when_notes_updated_multiple_times_then_overwrites(
    session_manager: SessionManager, sample_employees: list[Employee]
) -> None:
    """Test that updating notes multiple times overwrites previous value."""
    session_manager.create_session(
        user_id="user1",
        employees=sample_employees,
        filename="test.xlsx",
        file_path="/tmp/test.xlsx",
        sheet_name="Employee Data",
        sheet_index=1,
    )

    # Move employee and add initial notes
    session_manager.move_employee(
        user_id="user1",
        employee_id=1,
        new_performance=PerformanceLevel.MEDIUM,
        new_potential=PotentialLevel.MEDIUM,
    )
    session_manager.update_change_notes(user_id="user1", employee_id=1, notes="Initial notes")

    # Update notes again
    final_notes = "Updated notes after review"
    updated_change = session_manager.update_change_notes(
        user_id="user1",
        employee_id=1,
        notes=final_notes,
    )

    # Verify only final notes are stored
    assert updated_change is not None
    assert updated_change.notes == final_notes
    session = session_manager.get_session("user1")
    assert session is not None
    assert session.events[0].notes == final_notes


def test_update_change_notes_when_no_session_then_raises_error(
    session_manager: SessionManager,
) -> None:
    """Test updating notes without active session raises error."""
    with pytest.raises(ValueError, match="No active session"):
        session_manager.update_change_notes(
            user_id="nonexistent",
            employee_id=1,
            notes="Some notes",
        )


def test_update_change_notes_when_no_change_entry_then_raises_error(
    session_manager: SessionManager, sample_employees: list[Employee]
) -> None:
    """Test updating notes for employee without change entry returns None."""
    session_manager.create_session(
        user_id="user1",
        employees=sample_employees,
        filename="test.xlsx",
        file_path="/tmp/test.xlsx",
        sheet_name="Employee Data",
        sheet_index=1,
    )

    # Don't move employee (no change entry exists)
    result = session_manager.update_change_notes(
        user_id="user1",
        employee_id=1,
        notes="Some notes",
    )

    # Should return None when no grid move event exists
    assert result is None


def test_update_change_notes_when_employee_moved_back_then_raises_error(
    session_manager: SessionManager, sample_employees: list[Employee]
) -> None:
    """Test updating notes after employee moved back to original returns None."""
    session_manager.create_session(
        user_id="user1",
        employees=sample_employees,
        filename="test.xlsx",
        file_path="/tmp/test.xlsx",
        sheet_name="Employee Data",
        sheet_index=1,
    )

    original_performance = sample_employees[0].performance
    original_potential = sample_employees[0].potential

    # Move employee away then back
    session_manager.move_employee(
        user_id="user1",
        employee_id=1,
        new_performance=PerformanceLevel.MEDIUM,
        new_potential=PotentialLevel.MEDIUM,
    )
    session_manager.move_employee(
        user_id="user1",
        employee_id=1,
        new_performance=original_performance,
        new_potential=original_potential,
    )

    # Change entry should be removed, so updating notes should return None
    result = session_manager.update_change_notes(
        user_id="user1",
        employee_id=1,
        notes="Some notes",
    )

    assert result is None


def test_move_employee_when_notes_exist_then_creates_new_event(
    session_manager: SessionManager, sample_employees: list[Employee]
) -> None:
    """Test that moving employee again creates new event without preserving notes."""
    session_manager.create_session(
        user_id="user1",
        employees=sample_employees,
        filename="test.xlsx",
        file_path="/tmp/test.xlsx",
        sheet_name="Employee Data",
        sheet_index=1,
    )

    # Move employee and add notes
    session_manager.move_employee(
        user_id="user1",
        employee_id=1,
        new_performance=PerformanceLevel.MEDIUM,
        new_potential=PotentialLevel.MEDIUM,
    )
    test_notes = "Performance improvement plan completed"
    session_manager.update_change_notes(user_id="user1", employee_id=1, notes=test_notes)

    # Verify notes were added
    session = session_manager.get_session("user1")
    assert session is not None
    assert session.events[0].notes == test_notes

    # Move employee again to a different position
    session_manager.move_employee(
        user_id="user1",
        employee_id=1,
        new_performance=PerformanceLevel.LOW,
        new_potential=PotentialLevel.LOW,
    )

    # New event is created without notes (notes are not preserved across moves)
    session = session_manager.get_session("user1")
    assert session is not None
    assert len(session.events) == 1
    change = session.events[0]
    assert isinstance(change, GridMoveEvent)
    assert change.notes is None  # Notes are NOT preserved when creating new event
    # Verify this is a new event showing the most recent move (M,M -> L,L)
    assert change.new_position == 1  # L,L
    assert change.old_position == 5  # M,M (not original H,H)


# ========== Donut Mode Tests ==========


def test_move_employee_donut_when_called_then_updates_employee(
    session_manager: SessionManager, sample_employees: list[Employee]
) -> None:
    """Test SessionManager.move_employee_donut() updates employee donut fields."""
    session_manager.create_session(
        user_id="user1",
        employees=sample_employees,
        filename="test.xlsx",
        file_path="/tmp/test.xlsx",
        sheet_name="Employee Data",
        sheet_index=1,
    )

    # Employee 1 starts at H,H (position 9)
    # Move in donut mode to H,M (position 6)
    change = session_manager.move_employee_donut(
        user_id="user1",
        employee_id=1,
        new_performance=PerformanceLevel.HIGH,
        new_potential=PotentialLevel.MEDIUM,
    )

    # Verify change entry
    assert change.employee_id == 1
    assert change.old_performance == PerformanceLevel.HIGH
    assert change.old_potential == PerformanceLevel.HIGH
    assert change.new_performance == PerformanceLevel.HIGH
    assert change.new_potential == PotentialLevel.MEDIUM
    assert change.old_position == 9
    assert change.new_position == 6

    # Verify employee was updated
    session = session_manager.get_session("user1")
    assert session is not None
    emp = session.current_employees[0]
    assert emp.donut_performance == PerformanceLevel.HIGH
    assert emp.donut_potential == PotentialLevel.MEDIUM
    assert emp.donut_position == 6
    assert emp.donut_modified is True
    assert emp.donut_last_modified is not None

    # Original grid position should be unchanged
    assert emp.performance == PerformanceLevel.HIGH
    assert emp.potential == PerformanceLevel.HIGH
    assert emp.grid_position == 9


def test_move_employee_donut_when_multiple_moves_then_tracks_final(
    session_manager: SessionManager, sample_employees: list[Employee]
) -> None:
    """Test that moving employee in donut mode multiple times shows most recent move."""
    session_manager.create_session(
        user_id="user1",
        employees=sample_employees,
        filename="test.xlsx",
        file_path="/tmp/test.xlsx",
        sheet_name="Employee Data",
        sheet_index=1,
    )

    # Employee 1 starts at H,H (position 9)
    # Move 1: H,H -> H,M (position 6)
    first_change = session_manager.move_employee_donut(
        user_id="user1",
        employee_id=1,
        new_performance=PerformanceLevel.HIGH,
        new_potential=PotentialLevel.MEDIUM,
    )

    # Verify first change
    session = session_manager.get_session("user1")
    assert session is not None
    assert len(session.donut_events) == 1
    assert first_change.old_position == 9
    assert first_change.new_position == 6

    # Move 2: H,M -> L,L (position 1)
    second_change = session_manager.move_employee_donut(
        user_id="user1",
        employee_id=1,
        new_performance=PerformanceLevel.LOW,
        new_potential=PotentialLevel.LOW,
    )

    # Should still be only one entry, showing movement from original to final
    session = session_manager.get_session("user1")
    assert session is not None
    assert len(session.donut_events) == 1
    assert second_change.old_position == 6  # H,M (position before this move)
    assert second_change.new_position == 1  # L,L (final position)
    assert second_change.old_performance == PerformanceLevel.HIGH
    assert second_change.old_potential == PotentialLevel.MEDIUM
    assert second_change.new_performance == PerformanceLevel.LOW
    assert second_change.new_potential == PerformanceLevel.LOW


def test_move_employee_donut_when_return_to_5_then_clears_data(
    session_manager: SessionManager, sample_employees: list[Employee]
) -> None:
    """Test moving back to position 5 clears donut fields and removes entry."""
    session_manager.create_session(
        user_id="user1",
        employees=sample_employees,
        filename="test.xlsx",
        file_path="/tmp/test.xlsx",
        sheet_name="Employee Data",
        sheet_index=1,
    )

    # Move employee away from position (employee 1: H,H -> H,M)
    session_manager.move_employee_donut(
        user_id="user1",
        employee_id=1,
        new_performance=PerformanceLevel.HIGH,
        new_potential=PotentialLevel.MEDIUM,
    )

    # Verify change was tracked
    session = session_manager.get_session("user1")
    assert session is not None
    assert len(session.donut_events) == 1
    assert session.current_employees[0].donut_modified is True

    # Move back to position 5 (M,M)
    session_manager.move_employee_donut(
        user_id="user1",
        employee_id=1,
        new_performance=PerformanceLevel.MEDIUM,
        new_potential=PotentialLevel.MEDIUM,
    )

    # Change entry should be completely removed
    session = session_manager.get_session("user1")
    assert session is not None
    assert len(session.donut_events) == 0

    # Donut fields should be cleared
    emp = session.current_employees[0]
    assert emp.donut_modified is False
    assert emp.donut_performance is None
    assert emp.donut_potential is None
    assert emp.donut_position is None
    assert emp.donut_last_modified is None
    assert emp.donut_notes is None


def test_toggle_donut_mode_when_enabled_then_sets_flag(
    session_manager: SessionManager, sample_employees: list[Employee]
) -> None:
    """Test toggling donut mode on sets the flag."""
    session_manager.create_session(
        user_id="user1",
        employees=sample_employees,
        filename="test.xlsx",
        file_path="/tmp/test.xlsx",
        sheet_name="Employee Data",
        sheet_index=1,
    )

    # Verify initially off
    session = session_manager.get_session("user1")
    assert session is not None
    assert session.donut_mode_active is False

    # Toggle on
    updated_session = session_manager.toggle_donut_mode(user_id="user1", enabled=True)

    assert updated_session.donut_mode_active is True

    # Verify persisted
    session = session_manager.get_session("user1")
    assert session is not None
    assert session.donut_mode_active is True


def test_toggle_donut_mode_when_disabled_then_clears_flag(
    session_manager: SessionManager, sample_employees: list[Employee]
) -> None:
    """Test toggling donut mode off clears the flag."""
    session_manager.create_session(
        user_id="user1",
        employees=sample_employees,
        filename="test.xlsx",
        file_path="/tmp/test.xlsx",
        sheet_name="Employee Data",
        sheet_index=1,
    )

    # Enable donut mode first
    session_manager.toggle_donut_mode(user_id="user1", enabled=True)

    # Verify it's on
    session = session_manager.get_session("user1")
    assert session is not None
    assert session.donut_mode_active is True

    # Toggle off
    updated_session = session_manager.toggle_donut_mode(user_id="user1", enabled=False)

    assert updated_session.donut_mode_active is False

    # Verify persisted
    session = session_manager.get_session("user1")
    assert session is not None
    assert session.donut_mode_active is False


def test_toggle_donut_mode_when_no_session_then_raises_error(
    session_manager: SessionManager,
) -> None:
    """Test toggling donut mode without active session raises error."""
    with pytest.raises(ValueError, match="No active session"):
        session_manager.toggle_donut_mode(user_id="nonexistent", enabled=True)


def test_move_employee_donut_when_no_session_then_raises_error(
    session_manager: SessionManager,
) -> None:
    """Test moving employee in donut mode without active session raises error."""
    with pytest.raises(ValueError, match="No active session"):
        session_manager.move_employee_donut(
            user_id="nonexistent",
            employee_id=1,
            new_performance=PerformanceLevel.MEDIUM,
            new_potential=PotentialLevel.MEDIUM,
        )


def test_move_employee_donut_when_invalid_employee_then_raises_error(
    session_manager: SessionManager, sample_employees: list[Employee]
) -> None:
    """Test moving non-existent employee in donut mode raises error."""
    session_manager.create_session(
        user_id="user1",
        employees=sample_employees,
        filename="test.xlsx",
        file_path="/tmp/test.xlsx",
        sheet_name="Employee Data",
        sheet_index=1,
    )

    with pytest.raises(ValueError, match="Employee 999 not found"):
        session_manager.move_employee_donut(
            user_id="user1",
            employee_id=999,
            new_performance=PerformanceLevel.MEDIUM,
            new_potential=PotentialLevel.MEDIUM,
        )
