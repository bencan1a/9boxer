"""Tests for session manager service."""

from datetime import datetime

import pytest

from ninebox.models.employee import Employee, PerformanceLevel, PotentialLevel
from ninebox.services.session_manager import SessionManager


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
    change = session_manager.move_employee(
        user_id="user1",
        employee_id=1,
        new_performance=PerformanceLevel.MEDIUM,
        new_potential=PotentialLevel.MEDIUM,
    )

    assert change.employee_id == 1
    assert change.old_performance == PerformanceLevel.HIGH
    assert change.old_potential == PotentialLevel.HIGH
    assert change.new_performance == PerformanceLevel.MEDIUM
    assert change.new_potential == PotentialLevel.MEDIUM
    assert change.old_position == 9
    assert change.new_position == 5

    # Verify employee was updated
    session = session_manager.get_session("user1")
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
    assert len(session.changes) == 2
    assert session.changes[0].employee_id == 1
    assert session.changes[1].employee_id == 2


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


def test_position_calculation_when_all_9_grid_positions_then_correct(
    session_manager: SessionManager,
) -> None:
    """Test position calculation for all 9 grid positions.

    Standard 9-box grid layout:
        Performance (columns): Low=1, Medium=2, High=3
        Potential (rows): Low=1-3, Medium=4-6, High=7-9
    """
    # Low performance (column 1)
    assert session_manager._calculate_position(PerformanceLevel.LOW, PotentialLevel.LOW) == 1
    assert session_manager._calculate_position(PerformanceLevel.LOW, PotentialLevel.MEDIUM) == 4
    assert session_manager._calculate_position(PerformanceLevel.LOW, PotentialLevel.HIGH) == 7

    # Medium performance (column 2)
    assert session_manager._calculate_position(PerformanceLevel.MEDIUM, PotentialLevel.LOW) == 2
    assert session_manager._calculate_position(PerformanceLevel.MEDIUM, PotentialLevel.MEDIUM) == 5
    assert session_manager._calculate_position(PerformanceLevel.MEDIUM, PotentialLevel.HIGH) == 8

    # High performance (column 3)
    assert session_manager._calculate_position(PerformanceLevel.HIGH, PotentialLevel.LOW) == 3
    assert session_manager._calculate_position(PerformanceLevel.HIGH, PotentialLevel.MEDIUM) == 6
    assert session_manager._calculate_position(PerformanceLevel.HIGH, PotentialLevel.HIGH) == 9


def test_position_label_generation_when_all_combinations_then_correct(
    session_manager: SessionManager,
) -> None:
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
        assert session_manager._get_position_label(perf, pot) == expected_label


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
