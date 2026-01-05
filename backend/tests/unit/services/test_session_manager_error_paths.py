"""Error path tests for session manager service.

This test module covers error handling scenarios:
- No active session errors
- Employee not found errors
- Original employee not found errors
- Database error handling
"""

import sqlite3
from datetime import date
from unittest.mock import MagicMock, patch

import pytest

from ninebox.models.employee import Employee, PerformanceLevel, PotentialLevel
from ninebox.services.session_manager import SessionManager


pytestmark = pytest.mark.unit


@pytest.fixture
def session_manager() -> SessionManager:
    """Create a fresh session manager for each test."""
    return SessionManager()


@pytest.fixture
def sample_employees() -> list[Employee]:
    """Create sample employees for testing."""
    return [
        Employee(
            employee_id=1,
            name="Alice Smith",
            business_title="Engineer",
            job_title="Senior Engineer",
            job_profile="Engineer-USA",
            job_level="L4",
            job_function="Engineer",
            location="USA",
            direct_manager="Bob Manager",
            hire_date=date(2020, 1, 1),
            tenure_category="1-2 years",
            time_in_job_profile="1 year",
            performance=PerformanceLevel.HIGH,
            potential=PotentialLevel.HIGH,
            grid_position=9,
            talent_indicator="High Potential",
        ),
        Employee(
            employee_id=2,
            name="Bob Jones",
            business_title="Designer",
            job_title="UX Designer",
            job_profile="Designer-UK",
            job_level="L3",
            job_function="Designer",
            location="UK",
            direct_manager="Carol Manager",
            hire_date=date(2021, 6, 15),
            tenure_category="0-1 years",
            time_in_job_profile="6 months",
            performance=PerformanceLevel.MEDIUM,
            potential=PotentialLevel.MEDIUM,
            grid_position=5,
            talent_indicator="",
        ),
    ]


class TestNoActiveSessionErrors:
    """Test error handling when no active session exists."""

    def test_move_employee_when_no_session_then_raises_value_error(
        self, session_manager: SessionManager
    ) -> None:
        """Test that move_employee raises ValueError when no session exists."""
        with pytest.raises(ValueError, match="No active session"):
            session_manager.move_employee(
                user_id="nonexistent_user",
                employee_id=1,
                new_performance=PerformanceLevel.HIGH,
                new_potential=PotentialLevel.MEDIUM,
            )

    def test_update_change_notes_when_no_session_then_raises_value_error(
        self, session_manager: SessionManager
    ) -> None:
        """Test that update_change_notes raises ValueError when no session exists."""
        with pytest.raises(ValueError, match="No active session"):
            session_manager.update_change_notes(
                user_id="nonexistent_user", employee_id=1, notes="Test notes"
            )

    def test_update_donut_change_notes_when_no_session_then_raises_value_error(
        self, session_manager: SessionManager
    ) -> None:
        """Test that update_donut_change_notes raises ValueError when no session exists."""
        with pytest.raises(ValueError, match="No active session"):
            session_manager.update_donut_change_notes(
                user_id="nonexistent_user", employee_id=1, notes="Donut notes"
            )

    def test_move_employee_donut_when_no_session_then_raises_value_error(
        self, session_manager: SessionManager
    ) -> None:
        """Test that move_employee_donut raises ValueError when no session exists."""
        with pytest.raises(ValueError, match="No active session"):
            session_manager.move_employee_donut(
                user_id="nonexistent_user",
                employee_id=1,
                new_performance=PerformanceLevel.HIGH,
                new_potential=PotentialLevel.MEDIUM,
            )

    def test_toggle_donut_mode_when_no_session_then_raises_value_error(
        self, session_manager: SessionManager
    ) -> None:
        """Test that toggle_donut_mode raises ValueError when no session exists."""
        with pytest.raises(ValueError, match="No active session"):
            session_manager.toggle_donut_mode(user_id="nonexistent_user", enabled=True)

    def test_update_employee_flags_when_no_session_then_raises_value_error(
        self, session_manager: SessionManager
    ) -> None:
        """Test that update_employee_flags raises ValueError when no session exists."""
        with pytest.raises(ValueError, match="No active session"):
            session_manager.update_employee_flags(
                user_id="nonexistent_user", employee_id=1, new_flags=["flag1"]
            )


class TestEmployeeNotFoundErrors:
    """Test error handling when employee is not found in session."""

    def test_move_employee_when_employee_not_found_then_raises_value_error(
        self, session_manager: SessionManager, sample_employees: list[Employee]
    ) -> None:
        """Test that move_employee raises ValueError when employee not found."""
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
                employee_id=999,  # Non-existent employee
                new_performance=PerformanceLevel.HIGH,
                new_potential=PotentialLevel.MEDIUM,
            )

    def test_move_employee_donut_when_employee_not_found_then_raises_value_error(
        self, session_manager: SessionManager, sample_employees: list[Employee]
    ) -> None:
        """Test that move_employee_donut raises ValueError when employee not found."""
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
                employee_id=999,  # Non-existent employee
                new_performance=PerformanceLevel.HIGH,
                new_potential=PotentialLevel.MEDIUM,
            )

    def test_update_employee_flags_when_employee_not_found_then_raises_value_error(
        self, session_manager: SessionManager, sample_employees: list[Employee]
    ) -> None:
        """Test that update_employee_flags raises ValueError when employee not found."""
        session_manager.create_session(
            user_id="user1",
            employees=sample_employees,
            filename="test.xlsx",
            file_path="/tmp/test.xlsx",
            sheet_name="Employee Data",
            sheet_index=1,
        )

        with pytest.raises(ValueError, match="Employee 999 not found"):
            session_manager.update_employee_flags(
                user_id="user1", employee_id=999, new_flags=["flag1"]
            )


class TestOriginalEmployeeNotFoundErrors:
    """Test error handling when original employee is not found."""

    def test_move_employee_when_original_not_found_then_raises_value_error(
        self, session_manager: SessionManager, sample_employees: list[Employee]
    ) -> None:
        """Test that move_employee raises ValueError when original employee missing."""
        # Create session
        session_manager.create_session(
            user_id="user1",
            employees=sample_employees,
            filename="test.xlsx",
            file_path="/tmp/test.xlsx",
            sheet_name="Employee Data",
            sheet_index=1,
        )

        # Manually remove original employee to simulate corruption
        session = session_manager.get_session("user1")
        assert session is not None
        session.original_employees = [
            e for e in session.original_employees if e.employee_id != 1
        ]

        # Attempt to move employee that has no original
        with pytest.raises(ValueError, match="Original employee 1 not found"):
            session_manager.move_employee(
                user_id="user1",
                employee_id=1,
                new_performance=PerformanceLevel.HIGH,
                new_potential=PotentialLevel.MEDIUM,
            )

    def test_move_employee_donut_when_original_not_found_then_raises_value_error(
        self, session_manager: SessionManager, sample_employees: list[Employee]
    ) -> None:
        """Test that move_employee_donut raises ValueError when original employee missing."""
        # Create session
        session_manager.create_session(
            user_id="user1",
            employees=sample_employees,
            filename="test.xlsx",
            file_path="/tmp/test.xlsx",
            sheet_name="Employee Data",
            sheet_index=1,
        )

        # Manually remove original employee
        session = session_manager.get_session("user1")
        assert session is not None
        session.original_employees = [
            e for e in session.original_employees if e.employee_id != 1
        ]

        # Attempt to move in donut mode
        with pytest.raises(ValueError, match="Original employee 1 not found"):
            session_manager.move_employee_donut(
                user_id="user1",
                employee_id=1,
                new_performance=PerformanceLevel.HIGH,
                new_potential=PotentialLevel.MEDIUM,
            )

    def test_update_employee_flags_when_original_not_found_then_raises_value_error(
        self, session_manager: SessionManager, sample_employees: list[Employee]
    ) -> None:
        """Test that update_employee_flags raises ValueError when original employee missing."""
        # Create session
        session_manager.create_session(
            user_id="user1",
            employees=sample_employees,
            filename="test.xlsx",
            file_path="/tmp/test.xlsx",
            sheet_name="Employee Data",
            sheet_index=1,
        )

        # Manually remove original employee
        session = session_manager.get_session("user1")
        assert session is not None
        session.original_employees = [
            e for e in session.original_employees if e.employee_id != 1
        ]

        # Attempt to update flags
        with pytest.raises(ValueError, match="Original employee 1 not found"):
            session_manager.update_employee_flags(
                user_id="user1", employee_id=1, new_flags=["flag1"]
            )


class TestDatabaseErrorHandling:
    """Test database error handling during persistence and restoration."""

    def test_persist_session_when_database_error_then_raises_sqlite_error(
        self, session_manager: SessionManager, sample_employees: list[Employee]
    ) -> None:
        """Test that database errors during persistence are raised."""
        # Create session
        session_manager.create_session(
            user_id="user1",
            employees=sample_employees,
            filename="test.xlsx",
            file_path="/tmp/test.xlsx",
            sheet_name="Employee Data",
            sheet_index=1,
        )

        session = session_manager.get_session("user1")
        assert session is not None

        # Mock the _db instance attribute to raise error
        mock_conn = MagicMock()
        mock_conn.__enter__ = MagicMock(return_value=mock_conn)
        mock_conn.__exit__ = MagicMock(return_value=False)
        mock_conn.execute.side_effect = sqlite3.Error("Database is locked")

        mock_db = MagicMock()
        mock_db.get_connection.return_value = mock_conn
        session_manager._db = mock_db

        # Attempt to persist - should raise sqlite3.Error
        with pytest.raises(sqlite3.Error, match="Database is locked"):
            session_manager._persist_session(session)

    def test_restore_sessions_when_database_error_then_logs_and_continues(
        self, session_manager: SessionManager
    ) -> None:
        """Test that database errors during restoration are logged but don't crash."""
        # Mock the _db instance attribute to raise error
        mock_conn = MagicMock()
        mock_conn.__enter__ = MagicMock(return_value=mock_conn)
        mock_conn.__exit__ = MagicMock(return_value=False)
        mock_conn.execute.side_effect = sqlite3.Error("Database connection failed")

        mock_db = MagicMock()
        mock_db.get_connection.return_value = mock_conn
        session_manager._db = mock_db

        # Restoration should not raise - errors are logged
        session_manager._restore_sessions()

        # Session manager should be empty but functional
        assert len(session_manager._sessions) == 0

    def test_restore_sessions_when_corrupt_session_then_skips_and_continues(
        self, session_manager: SessionManager, sample_employees: list[Employee]
    ) -> None:
        """Test that corrupt sessions are skipped during restoration."""
        # First, create a valid session
        session_manager.create_session(
            user_id="user1",
            employees=sample_employees,
            filename="test.xlsx",
            file_path="/tmp/test.xlsx",
            sheet_name="Employee Data",
            sheet_index=1,
        )

        # Create a fresh session manager with mocked database
        fresh_manager = SessionManager()

        # Mock the _db instance to return corrupt data
        mock_conn = MagicMock()
        mock_conn.__enter__ = MagicMock(return_value=mock_conn)
        mock_conn.__exit__ = MagicMock(return_value=False)

        # Create mock cursor with one corrupt row
        mock_cursor = MagicMock()
        # Return corrupt JSON that will fail to deserialize
        mock_cursor.fetchall.return_value = [
            {
                "user_id": "user_corrupt",
                "session_id": "session123",
                "created_at": "invalid_date",  # This will cause deserialization error
                "original_employees": "invalid_json",
                "current_employees": "invalid_json",
                "events": "[]",
            }
        ]
        mock_conn.execute.return_value = mock_cursor

        mock_db = MagicMock()
        mock_db.get_connection.return_value = mock_conn
        fresh_manager._db = mock_db

        # Restore sessions
        fresh_manager._restore_sessions()

        # Corrupt session should be skipped, manager should still be functional
        # (no sessions restored due to corrupt data)
        assert len(fresh_manager._sessions) == 0

    def test_delete_session_from_db_when_database_error_then_logs_but_continues(
        self, session_manager: SessionManager, sample_employees: list[Employee]
    ) -> None:
        """Test that database errors during deletion are logged but don't crash."""
        # Create session
        session_manager.create_session(
            user_id="user1",
            employees=sample_employees,
            filename="test.xlsx",
            file_path="/tmp/test.xlsx",
            sheet_name="Employee Data",
            sheet_index=1,
        )

        # Mock the _db instance attribute to raise error during deletion
        mock_conn = MagicMock()
        mock_conn.__enter__ = MagicMock(return_value=mock_conn)
        mock_conn.__exit__ = MagicMock(return_value=False)
        mock_conn.execute.side_effect = sqlite3.Error("Delete failed")

        mock_db = MagicMock()
        mock_db.get_connection.return_value = mock_conn
        session_manager._db = mock_db

        # Delete should not raise - error is logged
        session_manager._delete_session_from_db("user1")

        # Session is already removed from memory (this is just DB cleanup)
        # So the method completes without raising


class TestEdgeCaseErrorCombinations:
    """Test combinations of error conditions."""

    def test_session_operations_after_deletion_then_raise_no_session_error(
        self, session_manager: SessionManager, sample_employees: list[Employee]
    ) -> None:
        """Test that operations fail appropriately after session deletion."""
        # Create and then delete session
        session_manager.create_session(
            user_id="user1",
            employees=sample_employees,
            filename="test.xlsx",
            file_path="/tmp/test.xlsx",
            sheet_name="Employee Data",
            sheet_index=1,
        )

        # Delete the session
        result = session_manager.delete_session("user1")
        assert result is True

        # Operations should now fail with "No active session"
        with pytest.raises(ValueError, match="No active session"):
            session_manager.move_employee(
                "user1", 1, PerformanceLevel.HIGH, PotentialLevel.HIGH
            )

        # Verify get_session returns None
        session = session_manager.get_session("user1")
        assert session is None
