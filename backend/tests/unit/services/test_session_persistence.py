"""Tests for session persistence functionality."""

import sqlite3
import tempfile
from datetime import datetime, timezone
from pathlib import Path
from unittest.mock import patch

import pytest

from ninebox.models.employee import Employee, PerformanceLevel, PotentialLevel
from ninebox.services.database import DatabaseManager
from ninebox.services.session_manager import SessionManager

pytestmark = pytest.mark.unit


@pytest.fixture
def temp_db() -> Path:
    """Create a temporary database for testing."""
    with tempfile.NamedTemporaryFile(mode="w", suffix=".db", delete=False) as f:
        db_path = Path(f.name)

    yield db_path

    # Cleanup - ensure database is closed and deleted
    try:
        # Close any open connections
        import gc

        gc.collect()  # Force cleanup of any lingering connection objects

        # Delete the database file
        if db_path.exists():
            db_path.unlink()
    except Exception:
        pass  # Ignore cleanup errors


@pytest.fixture
def test_db_manager(temp_db: Path) -> DatabaseManager:
    """Create a test database manager with temporary database."""
    # Patch db_manager.db_path before creating DatabaseManager
    with patch("ninebox.services.database.get_user_data_dir") as mock_get_dir:
        # Make get_user_data_dir return the temp directory
        mock_get_dir.return_value = temp_db.parent
        # Create a new DatabaseManager instance with patched path
        db_mgr = DatabaseManager()
        db_mgr.db_path = temp_db
        db_mgr._ensure_schema()
        return db_mgr


@pytest.fixture
def isolated_session_manager(temp_db: Path) -> SessionManager:
    """Create an isolated session manager with temporary database."""
    # Clear dependency injection cache before creating manager
    from ninebox.core.dependencies import get_session_manager, get_db_manager

    get_session_manager.cache_clear()
    get_db_manager.cache_clear()

    # Patch get_user_data_dir to use temp db
    with patch("ninebox.services.database.get_user_data_dir") as mock_get_dir:
        mock_get_dir.return_value = temp_db.parent

        # Create a real DatabaseManager with temp path
        db_mgr = DatabaseManager()
        db_mgr.db_path = temp_db
        db_mgr._ensure_schema()

        # Create SessionManager with injected DatabaseManager
        manager = SessionManager(db=db_mgr)

        yield manager

        # Cleanup: Reset session manager state
        manager._sessions_loaded = False
        manager._sessions.clear()

    # Clear caches again after test
    get_session_manager.cache_clear()
    get_db_manager.cache_clear()


def test_create_session_when_called_then_persists_to_database(
    isolated_session_manager: SessionManager, sample_employees: list[Employee], temp_db: Path
) -> None:
    """Test that creating a session persists it to the database."""
    # Create session
    session_id = isolated_session_manager.create_session(
        user_id="user1",
        employees=sample_employees,
        filename="test.xlsx",
        file_path="/tmp/test.xlsx",
        sheet_name="Employee Data",
        sheet_index=1,
    )

    # Verify session exists in memory
    session = isolated_session_manager.get_session("user1")
    assert session is not None
    assert session.session_id == session_id

    # Verify session exists in database
    conn = sqlite3.connect(str(temp_db))
    conn.row_factory = sqlite3.Row
    cursor = conn.execute("SELECT * FROM sessions WHERE user_id = ?", ("user1",))
    row = cursor.fetchone()
    conn.close()

    assert row is not None
    assert dict(row)["user_id"] == "user1"
    assert dict(row)["session_id"] == session_id
    assert dict(row)["original_filename"] == "test.xlsx"


def test_restore_sessions_when_startup_then_loads_from_database(
    sample_employees: list[Employee], temp_db: Path
) -> None:
    """Test that sessions are restored from database on startup."""
    # First, create a session with one manager
    with patch("ninebox.services.database.get_user_data_dir") as mock_get_dir:
        mock_get_dir.return_value = temp_db.parent

        db_mgr = DatabaseManager()
        db_mgr.db_path = temp_db
        db_mgr._ensure_schema()

        manager1 = SessionManager(db=db_mgr)
        session_id = manager1.create_session(
            user_id="user1",
            employees=sample_employees,
            filename="test.xlsx",
            file_path="/tmp/test.xlsx",
            sheet_name="Employee Data",
            sheet_index=1,
        )

    # Now create a NEW manager instance (simulating restart)
    with patch("ninebox.services.database.get_user_data_dir") as mock_get_dir:
        mock_get_dir.return_value = temp_db.parent

        db_mgr = DatabaseManager()
        db_mgr.db_path = temp_db

        manager2 = SessionManager(db=db_mgr)

        # Verify session was restored
        restored_session = manager2.get_session("user1")
        assert restored_session is not None
        assert restored_session.session_id == session_id
        assert restored_session.user_id == "user1"
        assert restored_session.original_filename == "test.xlsx"
        assert len(restored_session.original_employees) == 5
        assert len(restored_session.current_employees) == 5
        assert len(restored_session.events) == 0


def test_move_employee_when_called_then_persists_changes(
    isolated_session_manager: SessionManager, sample_employees: list[Employee], temp_db: Path
) -> None:
    """Test that moving an employee persists the changes to database."""
    # Create session
    isolated_session_manager.create_session(
        user_id="user1",
        employees=sample_employees,
        filename="test.xlsx",
        file_path="/tmp/test.xlsx",
        sheet_name="Employee Data",
        sheet_index=1,
    )

    # Move employee
    change = isolated_session_manager.move_employee(
        user_id="user1",
        employee_id=1,
        new_performance=PerformanceLevel.MEDIUM,
        new_potential=PotentialLevel.MEDIUM,
    )

    assert change.employee_id == 1
    assert change.new_performance == PerformanceLevel.MEDIUM
    assert change.new_potential == PotentialLevel.MEDIUM

    # Verify changes persisted to database
    conn = sqlite3.connect(str(temp_db))
    conn.row_factory = sqlite3.Row
    cursor = conn.execute("SELECT events FROM sessions WHERE user_id = ?", ("user1",))
    row = cursor.fetchone()
    conn.close()

    assert row is not None
    changes_json = dict(row)["events"]
    assert changes_json is not None
    assert "Medium" in changes_json  # Check that the new performance level is in JSON


def test_update_change_notes_when_called_then_persists_notes(
    isolated_session_manager: SessionManager, sample_employees: list[Employee], temp_db: Path
) -> None:
    """Test that updating notes persists the changes to database."""
    # Create session and move employee
    isolated_session_manager.create_session(
        user_id="user1",
        employees=sample_employees,
        filename="test.xlsx",
        file_path="/tmp/test.xlsx",
        sheet_name="Employee Data",
        sheet_index=1,
    )

    isolated_session_manager.move_employee(
        user_id="user1",
        employee_id=1,
        new_performance=PerformanceLevel.MEDIUM,
        new_potential=PotentialLevel.MEDIUM,
    )

    # Update notes
    note_text = "Promoted due to exceptional Q4 performance"
    change = isolated_session_manager.update_change_notes(
        user_id="user1", employee_id=1, notes=note_text
    )

    assert change.notes == note_text

    # Verify notes persisted to database
    conn = sqlite3.connect(str(temp_db))
    conn.row_factory = sqlite3.Row
    cursor = conn.execute("SELECT events FROM sessions WHERE user_id = ?", ("user1",))
    row = cursor.fetchone()
    conn.close()

    assert row is not None
    changes_json = dict(row)["events"]
    assert changes_json is not None
    assert note_text in changes_json


def test_delete_session_when_called_then_removes_from_database(
    isolated_session_manager: SessionManager, sample_employees: list[Employee], temp_db: Path
) -> None:
    """Test that deleting a session removes it from the database."""
    # Create session
    isolated_session_manager.create_session(
        user_id="user1",
        employees=sample_employees,
        filename="test.xlsx",
        file_path="/tmp/test.xlsx",
        sheet_name="Employee Data",
        sheet_index=1,
    )

    # Verify session exists in database
    conn = sqlite3.connect(str(temp_db))
    conn.row_factory = sqlite3.Row
    cursor = conn.execute("SELECT * FROM sessions WHERE user_id = ?", ("user1",))
    row = cursor.fetchone()
    conn.close()
    assert row is not None

    # Delete session
    result = isolated_session_manager.delete_session("user1")
    assert result is True

    # Verify session removed from memory
    session = isolated_session_manager.get_session("user1")
    assert session is None

    # Verify session removed from database
    conn = sqlite3.connect(str(temp_db))
    conn.row_factory = sqlite3.Row
    cursor = conn.execute("SELECT * FROM sessions WHERE user_id = ?", ("user1",))
    row = cursor.fetchone()
    conn.close()
    assert row is None


def test_multiple_sessions_when_restored_then_all_loaded(
    sample_employees: list[Employee], temp_db: Path
) -> None:
    """Test that multiple sessions are all restored from database."""
    # Create multiple sessions with one manager
    with patch("ninebox.services.database.get_user_data_dir") as mock_get_dir:
        mock_get_dir.return_value = temp_db.parent

        db_mgr = DatabaseManager()
        db_mgr.db_path = temp_db
        db_mgr._ensure_schema()

        manager1 = SessionManager(db=db_mgr)

        # Create 3 sessions
        session_id1 = manager1.create_session(
            user_id="user1",
            employees=sample_employees,
            filename="test1.xlsx",
            file_path="/tmp/test1.xlsx",
            sheet_name="Employee Data",
            sheet_index=1,
        )

        session_id2 = manager1.create_session(
            user_id="user2",
            employees=sample_employees,
            filename="test2.xlsx",
            file_path="/tmp/test2.xlsx",
            sheet_name="Employee Data",
            sheet_index=1,
        )

        session_id3 = manager1.create_session(
            user_id="user3",
            employees=sample_employees,
            filename="test3.xlsx",
            file_path="/tmp/test3.xlsx",
            sheet_name="Employee Data",
            sheet_index=1,
        )

    # Create new manager (simulating restart)
    with patch("ninebox.services.database.get_user_data_dir") as mock_get_dir:
        mock_get_dir.return_value = temp_db.parent

        db_mgr = DatabaseManager()
        db_mgr.db_path = temp_db

        manager2 = SessionManager(db=db_mgr)

        # Trigger lazy loading by accessing a session
        session1 = manager2.get_session("user1")

        # Verify all 3 sessions restored
        assert len(manager2.sessions) == 3
        assert session1 is not None
        assert session1.session_id == session_id1
        assert session1.original_filename == "test1.xlsx"

        session2 = manager2.get_session("user2")
        assert session2 is not None
        assert session2.session_id == session_id2
        assert session2.original_filename == "test2.xlsx"

        session3 = manager2.get_session("user3")
        assert session3 is not None
        assert session3.session_id == session_id3
        assert session3.original_filename == "test3.xlsx"


def test_restore_sessions_when_corrupted_session_then_skips_and_continues(
    sample_employees: list[Employee], temp_db: Path
) -> None:
    """Test that corrupted sessions are skipped during restoration."""
    # Manually insert a corrupted session into database
    conn = sqlite3.connect(str(temp_db))

    # First ensure schema exists
    with (
        patch("ninebox.services.database.get_user_data_dir") as mock_get_dir,
    ):
        mock_get_dir.return_value = temp_db.parent
        db_mgr = DatabaseManager()
        db_mgr.db_path = temp_db
        db_mgr._ensure_schema()

    # Insert corrupted data
    conn.execute(
        """
        INSERT INTO sessions (
            user_id, session_id, created_at, original_filename,
            original_file_path, sheet_name, sheet_index,
            job_function_config, original_employees,
            current_employees, events, updated_at,
            donut_events, donut_mode_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            "corrupt_user",
            "session123",
            datetime.now(timezone.utc).isoformat(),
            "test.xlsx",
            "/tmp/test.xlsx",
            "Sheet1",
            0,
            None,
            "INVALID JSON",  # Corrupted JSON
            "[]",
            "[]",
            datetime.now(timezone.utc).isoformat(),
            "[]",
            0,
        ),
    )
    conn.commit()
    conn.close()

    # Create manager - should skip corrupted session and not crash
    with patch("ninebox.services.database.get_user_data_dir") as mock_get_dir:
        mock_get_dir.return_value = temp_db.parent

        db_mgr = DatabaseManager()
        db_mgr.db_path = temp_db

        # Should not raise an exception
        manager = SessionManager(db=db_mgr)

        # Corrupted session should not be loaded
        assert manager.get_session("corrupt_user") is None
