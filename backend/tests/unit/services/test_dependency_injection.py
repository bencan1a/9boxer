"""Tests demonstrating dependency injection for DatabaseManager.

This test module demonstrates how the refactored SessionManager can be used
with dependency injection for testing and production scenarios.
"""

import tempfile
from pathlib import Path
from unittest.mock import MagicMock

import pytest

from ninebox.models.employee import Employee, PerformanceLevel, PotentialLevel
from ninebox.services.database import DatabaseManager
from ninebox.services.session_manager import SessionManager

pytestmark = pytest.mark.unit


def test_session_manager_when_no_db_provided_then_creates_own_instance() -> None:
    """Test backward compatibility: SessionManager() creates its own DatabaseManager."""
    manager = SessionManager()
    assert manager._db is not None
    assert isinstance(manager._db, DatabaseManager)


def test_session_manager_when_db_injected_then_uses_provided_instance() -> None:
    """Test dependency injection: SessionManager accepts DatabaseManager."""
    # Create a specific database manager
    db = DatabaseManager()

    # Inject it into SessionManager
    manager = SessionManager(db=db)

    # Verify the injected instance is used
    assert manager._db is db


def test_session_manager_when_mock_db_injected_then_can_test_without_real_db() -> None:
    """Test that SessionManager can be tested with a mocked DatabaseManager."""
    # Create a mock DatabaseManager
    mock_db = MagicMock()
    mock_conn = MagicMock()
    mock_conn.__enter__ = MagicMock(return_value=mock_conn)
    mock_conn.__exit__ = MagicMock(return_value=False)

    # Configure mock to return empty sessions
    mock_cursor = MagicMock()
    mock_cursor.fetchall.return_value = []
    mock_conn.execute.return_value = mock_cursor
    mock_db.get_connection.return_value = mock_conn

    # Inject mock into SessionManager
    manager = SessionManager(db=mock_db)

    # Trigger lazy loading (should call mocked database)
    sessions = manager.sessions

    # Verify mock was used
    assert sessions == {}
    mock_db.get_connection.assert_called()


def test_session_manager_when_custom_db_path_then_uses_correct_database() -> None:
    """Test that SessionManager can work with custom database paths."""
    # Create a temporary database
    with tempfile.NamedTemporaryFile(suffix=".db", delete=False) as tmp_file:
        temp_db_path = Path(tmp_file.name)

    try:
        # Create DatabaseManager with custom path
        db = DatabaseManager()
        db.db_path = temp_db_path
        db._ensure_schema()

        # Create SessionManager with injected database
        manager = SessionManager(db=db)

        # Create a test session
        employees = [
            Employee(
                employee_id=1,
                name="Test Employee",
                business_title="Engineer",
                job_title="Software Engineer",
                job_profile="Engineering",
                job_level="L4",
                job_function="Engineering",
                location="USA",
                direct_manager="Manager",
                hire_date="2020-01-01",
                tenure_category="3-5 years",
                time_in_job_profile="2 years",
                performance=PerformanceLevel.HIGH,
                potential=PotentialLevel.HIGH,
                grid_position=9,
                talent_indicator="High Potential",
            )
        ]

        session_id = manager.create_session(
            user_id="test_user",
            employees=employees,
            filename="test.xlsx",
            file_path="/tmp/test.xlsx",
            sheet_name="Data",
            sheet_index=0,
        )

        # Verify session was created
        session = manager.get_session("test_user")
        assert session is not None
        assert session.session_id == session_id
        assert len(session.current_employees) == 1

        # Verify data was persisted to our custom database
        assert temp_db_path.exists()

    finally:
        # Cleanup
        if temp_db_path.exists():
            temp_db_path.unlink()


def test_multiple_session_managers_when_share_db_then_share_data() -> None:
    """Test that multiple SessionManagers can share the same DatabaseManager."""
    # Create a temporary database
    with tempfile.NamedTemporaryFile(suffix=".db", delete=False) as tmp_file:
        temp_db_path = Path(tmp_file.name)

    try:
        # Create a shared DatabaseManager
        shared_db = DatabaseManager()
        shared_db.db_path = temp_db_path
        shared_db._ensure_schema()

        # Create first SessionManager
        manager1 = SessionManager(db=shared_db)

        employees = [
            Employee(
                employee_id=1,
                name="Test Employee",
                business_title="Engineer",
                job_title="Software Engineer",
                job_profile="Engineering",
                job_level="L4",
                job_function="Engineering",
                location="USA",
                direct_manager="Manager",
                hire_date="2020-01-01",
                tenure_category="3-5 years",
                time_in_job_profile="2 years",
                performance=PerformanceLevel.HIGH,
                potential=PotentialLevel.HIGH,
                grid_position=9,
                talent_indicator="High Potential",
            )
        ]

        session_id = manager1.create_session(
            user_id="user1",
            employees=employees,
            filename="test.xlsx",
            file_path="/tmp/test.xlsx",
            sheet_name="Data",
            sheet_index=0,
        )

        # Create second SessionManager with same database
        manager2 = SessionManager(db=shared_db)

        # Manager2 should be able to see Manager1's session
        session = manager2.get_session("user1")
        assert session is not None
        assert session.session_id == session_id

    finally:
        # Cleanup
        if temp_db_path.exists():
            temp_db_path.unlink()
