"""Tests for database manager service."""

import sqlite3
from collections.abc import Generator
from pathlib import Path

import pytest

from ninebox.services.database import DatabaseManager



pytestmark = pytest.mark.unit


@pytest.fixture
def db_manager(tmp_path: Path) -> Generator[DatabaseManager, None, None]:
    """Create a database manager with a temporary database.

    Uses the db_path setter to override the database location.
    Each test gets a fresh database.
    """
    manager = DatabaseManager()
    # Set db_path directly to tmp_path (uses setter designed for testing)
    manager.db_path = tmp_path / "ninebox.db"

    yield manager

    # Cleanup: Force garbage collection to close any lingering connections
    import gc
    gc.collect()


def test_init_when_first_run_then_creates_database(db_manager: DatabaseManager) -> None:
    """Test that database is created on first initialization."""
    # Trigger database creation by opening a connection
    with db_manager.get_connection():
        pass
    assert db_manager.db_path.exists()
    assert db_manager.db_path.is_file()


def test_init_when_first_run_then_creates_schema(db_manager: DatabaseManager) -> None:
    """Test that database schema is initialized on first run."""
    with db_manager.get_connection() as conn:
        cursor = conn.execute("SELECT name FROM sqlite_master WHERE type='table'")
        tables = [row[0] for row in cursor.fetchall()]

    assert "sessions" in tables


def test_get_connection_when_called_then_returns_connection(db_manager: DatabaseManager) -> None:
    """Test that get_connection returns a valid database connection."""
    with db_manager.get_connection() as conn:
        assert isinstance(conn, sqlite3.Connection)
        assert conn.row_factory == sqlite3.Row


def test_get_connection_when_query_executes_then_commits(db_manager: DatabaseManager) -> None:
    """Test that successful queries are committed."""
    # Insert test data
    with db_manager.get_connection() as conn:
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
                "test_user",
                "test_session",
                "2025-12-18T10:00:00",
                "test.xlsx",
                "/tmp/test.xlsx",
                "Sheet1",
                0,
                None,
                "[]",
                "[]",
                "[]",
                "2025-12-18T10:00:00",
                "[]",
                0,
            ),
        )

    # Verify data was committed
    with db_manager.get_connection() as conn:
        cursor = conn.execute("SELECT user_id FROM sessions WHERE user_id = ?", ("test_user",))
        row = cursor.fetchone()

    assert row is not None
    assert row["user_id"] == "test_user"


def test_get_connection_when_exception_occurs_then_rolls_back(
    db_manager: DatabaseManager,
) -> None:
    """Test that exceptions trigger rollback."""
    # Attempt to insert invalid data (will fail due to PRIMARY KEY constraint)
    with db_manager.get_connection() as conn:
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
                "rollback_test",
                "session1",
                "2025-12-18T10:00:00",
                "test.xlsx",
                "/tmp/test.xlsx",
                "Sheet1",
                0,
                None,
                "[]",
                "[]",
                "[]",
                "2025-12-18T10:00:00",
                "[]",
                0,
            ),
        )

    # Try to insert duplicate (should raise and rollback)
    with pytest.raises(sqlite3.IntegrityError), db_manager.get_connection() as conn:
        # This should fail due to PRIMARY KEY constraint
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
                "rollback_test",  # Duplicate user_id
                "session2",
                "2025-12-18T11:00:00",
                "test2.xlsx",
                "/tmp/test2.xlsx",
                "Sheet1",
                0,
                None,
                "[]",
                "[]",
                "[]",
                "2025-12-18T11:00:00",
                "[]",
                0,
            ),
        )

    # Verify only the first record exists
    with db_manager.get_connection() as conn:
        cursor = conn.execute(
            "SELECT session_id FROM sessions WHERE user_id = ?", ("rollback_test",)
        )
        row = cursor.fetchone()

    assert row is not None
    assert row["session_id"] == "session1"  # First insert succeeded


def test_sessions_table_when_queried_then_has_correct_schema(
    db_manager: DatabaseManager,
) -> None:
    """Test that sessions table has all required columns."""
    with db_manager.get_connection() as conn:
        cursor = conn.execute("PRAGMA table_info(sessions)")
        columns = {row["name"]: row["type"] for row in cursor.fetchall()}

    # Verify all required columns exist with correct types
    assert columns["user_id"] == "TEXT"
    assert columns["session_id"] == "TEXT"
    assert columns["created_at"] == "TIMESTAMP"
    assert columns["original_filename"] == "TEXT"
    assert columns["original_file_path"] == "TEXT"
    assert columns["sheet_name"] == "TEXT"
    assert columns["sheet_index"] == "INTEGER"
    assert columns["job_function_config"] == "TEXT"
    assert columns["original_employees"] == "TEXT"
    assert columns["current_employees"] == "TEXT"
    assert columns["events"] == "TEXT"
    assert columns["updated_at"] == "TIMESTAMP"
    assert columns["donut_events"] == "TEXT"
    assert columns["donut_mode_active"] == "INTEGER"


def test_sessions_table_when_queried_then_has_indexes(db_manager: DatabaseManager) -> None:
    """Test that sessions table has appropriate indexes."""
    with db_manager.get_connection() as conn:
        cursor = conn.execute("PRAGMA index_list(sessions)")
        indexes = {row["name"] for row in cursor.fetchall()}

    # Verify indexes exist
    assert "idx_sessions_session_id" in indexes
    assert "idx_sessions_user_id" in indexes


def test_multiple_connections_when_opened_then_work_independently(
    db_manager: DatabaseManager,
) -> None:
    """Test that multiple connections work correctly."""
    # First connection: insert data
    with db_manager.get_connection() as conn1:
        conn1.execute(
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
                "multi_test",
                "session1",
                "2025-12-18T10:00:00",
                "test.xlsx",
                "/tmp/test.xlsx",
                "Sheet1",
                0,
                None,
                "[]",
                "[]",
                "[]",
                "2025-12-18T10:00:00",
                "[]",
                0,
            ),
        )

    # Second connection: verify data exists
    with db_manager.get_connection() as conn2:
        cursor = conn2.execute("SELECT user_id FROM sessions WHERE user_id = ?", ("multi_test",))
        row = cursor.fetchone()

    assert row is not None
    assert row["user_id"] == "multi_test"
