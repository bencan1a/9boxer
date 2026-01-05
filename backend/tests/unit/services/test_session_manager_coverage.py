"""Additional tests to improve coverage for SessionManager dependency injection changes.

This test module specifically targets uncovered code paths in the refactored SessionManager
to meet the 80% coverage requirement for changed files.
"""

from unittest.mock import MagicMock

import pytest

from ninebox.models.employee import Employee, PerformanceLevel, PotentialLevel
from ninebox.services.database import DatabaseManager
from ninebox.services.session_manager import SessionManager

pytestmark = pytest.mark.unit


@pytest.fixture
def test_employee() -> Employee:
    """Create a single test employee."""
    return Employee(
        employee_id=1,
        name="Test Employee",
        business_title="Engineer",
        job_title="Software Engineer",
        job_profile="Engineering",
        job_level="L4",
        job_function="Engineering",
        location="USA",
        direct_manager="Manager",
        hire_date="2020-01-01",  # Use string format for date
        tenure_category="3-5 years",
        time_in_job_profile="2 years",
        performance=PerformanceLevel.MEDIUM,
        potential=PotentialLevel.MEDIUM,
        grid_position=5,
        talent_indicator="Solid Contributor",
        flags=["promotion_ready", "high_retention_priority"],  # Use valid flags
    )


def test_update_donut_change_notes_when_event_exists_then_updates_notes(
    test_employee: Employee,
) -> None:
    """Test updating donut change notes when event exists."""
    manager = SessionManager()

    # Create session
    manager.create_session(
        user_id="user1",
        employees=[test_employee],
        filename="test.xlsx",
        file_path="/tmp/test.xlsx",
        sheet_name="Data",
        sheet_index=0,
    )

    # Move employee in donut mode
    manager.move_employee_donut(
        user_id="user1",
        employee_id=1,
        new_performance=PerformanceLevel.HIGH,
        new_potential=PotentialLevel.HIGH,
    )

    # Update notes
    result = manager.update_donut_change_notes(
        user_id="user1",
        employee_id=1,
        notes="Test donut notes"
    )

    assert result is not None
    assert result.notes == "Test donut notes"


def test_update_donut_change_notes_when_no_event_then_returns_none(
    test_employee: Employee,
) -> None:
    """Test updating donut change notes when no event exists."""
    manager = SessionManager()

    # Create session
    manager.create_session(
        user_id="user1",
        employees=[test_employee],
        filename="test.xlsx",
        file_path="/tmp/test.xlsx",
        sheet_name="Data",
        sheet_index=0,
    )

    # Try to update notes without moving employee first
    result = manager.update_donut_change_notes(
        user_id="user1",
        employee_id=1,
        notes="Test notes"
    )

    assert result is None


def test_update_donut_change_notes_when_no_session_then_raises_error() -> None:
    """Test updating donut change notes when no session exists."""
    manager = SessionManager()

    with pytest.raises(ValueError, match="No active session"):
        manager.update_donut_change_notes(
            user_id="nonexistent",
            employee_id=1,
            notes="Test notes"
        )


def test_update_employee_flags_when_flags_added_then_creates_events(
    test_employee: Employee,
) -> None:
    """Test updating employee flags creates add events."""
    manager = SessionManager()

    # Create session
    manager.create_session(
        user_id="user1",
        employees=[test_employee],
        filename="test.xlsx",
        file_path="/tmp/test.xlsx",
        sheet_name="Data",
        sheet_index=0,
    )

    # Add new flags
    events = manager.update_employee_flags(
        user_id="user1",
        employee_id=1,
        new_flags=["promotion_ready", "high_retention_priority", "new_hire", "succession_candidate"]
    )

    # Should have events for new flags
    assert len(events) >= 2
    session = manager.get_session("user1")
    assert session is not None
    employee = next(e for e in session.current_employees if e.employee_id == 1)
    assert "new_hire" in employee.flags
    assert "succession_candidate" in employee.flags


def test_update_employee_flags_when_flags_removed_then_creates_events(
    test_employee: Employee,
) -> None:
    """Test updating employee flags creates remove events."""
    manager = SessionManager()

    # Create session
    manager.create_session(
        user_id="user1",
        employees=[test_employee],
        filename="test.xlsx",
        file_path="/tmp/test.xlsx",
        sheet_name="Data",
        sheet_index=0,
    )

    # Remove flags
    events = manager.update_employee_flags(
        user_id="user1",
        employee_id=1,
        new_flags=["promotion_ready"]  # Remove high_retention_priority
    )

    # Should have events for removed flags
    assert len(events) >= 1
    session = manager.get_session("user1")
    assert session is not None
    employee = next(e for e in session.current_employees if e.employee_id == 1)
    assert "promotion_ready" in employee.flags
    assert "high_retention_priority" not in employee.flags


def test_update_employee_flags_when_no_session_then_raises_error() -> None:
    """Test updating employee flags when no session exists."""
    manager = SessionManager()

    with pytest.raises(ValueError, match="No active session"):
        manager.update_employee_flags(
            user_id="nonexistent",
            employee_id=1,
            new_flags=[]
        )


def test_update_employee_flags_when_employee_not_found_then_raises_error(
    test_employee: Employee,
) -> None:
    """Test updating employee flags when employee not found."""
    manager = SessionManager()

    manager.create_session(
        user_id="user1",
        employees=[test_employee],
        filename="test.xlsx",
        file_path="/tmp/test.xlsx",
        sheet_name="Data",
        sheet_index=0,
    )

    with pytest.raises(ValueError, match="Employee 999 not found"):
        manager.update_employee_flags(
            user_id="user1",
            employee_id=999,
            new_flags=[]
        )


def test_session_manager_with_injected_db_uses_that_db(
    test_employee: Employee,
) -> None:
    """Test that SessionManager uses injected database manager."""
    # Create a mock database manager
    mock_db = MagicMock(spec=DatabaseManager)
    mock_conn = MagicMock()
    mock_conn.__enter__ = MagicMock(return_value=mock_conn)
    mock_conn.__exit__ = MagicMock(return_value=False)

    # Configure mock to return empty sessions on restore
    mock_cursor = MagicMock()
    mock_cursor.fetchall.return_value = []
    mock_conn.execute.return_value = mock_cursor
    mock_db.get_connection.return_value = mock_conn

    # Create SessionManager with injected mock
    manager = SessionManager(db=mock_db)

    # Trigger lazy loading
    _ = manager.sessions

    # Verify mock was called
    mock_db.get_connection.assert_called()
