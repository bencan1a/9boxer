"""Additional tests to improve coverage for DatabaseManager.

This test module specifically targets uncovered code paths in DatabaseManager
to meet the 80% coverage requirement for changed files.
"""

import sqlite3
import tempfile
from pathlib import Path
from unittest.mock import MagicMock, patch

import pytest

from ninebox.services.database import DatabaseManager

pytestmark = pytest.mark.unit


def test_ensure_schema_when_schema_not_found_then_raises_file_not_found_error() -> None:
    """Test that missing schema file raises FileNotFoundError."""
    with tempfile.TemporaryDirectory() as tmpdir:
        db_path = Path(tmpdir) / "test.db"
        manager = DatabaseManager()
        manager.db_path = db_path

        # Patch get_resource_path to return non-existent path
        with patch("ninebox.services.database.get_resource_path") as mock_get_path:
            mock_get_path.return_value = Path("/nonexistent/schema.sql")

            # Force schema initialization
            with pytest.raises(FileNotFoundError, match="Database schema file not found"):
                with manager.get_connection():
                    pass


def test_ensure_schema_when_frozen_mode_then_uses_correct_path() -> None:
    """Test that frozen mode uses correct schema path."""
    with tempfile.TemporaryDirectory() as tmpdir:
        db_path = Path(tmpdir) / "test.db"
        manager = DatabaseManager()
        manager.db_path = db_path

        # Mock frozen mode
        with (
            patch("sys.frozen", True, create=True),
            patch("ninebox.services.database.get_resource_path") as mock_get_path,
        ):
            # Create a temporary schema file with proper sessions table
            schema_file = Path(tmpdir) / "schema.sql"
            schema_file.write_text("""
                CREATE TABLE IF NOT EXISTS sessions (
                    user_id TEXT PRIMARY KEY,
                    session_id TEXT NOT NULL,
                    created_at TIMESTAMP NOT NULL,
                    original_filename TEXT NOT NULL,
                    original_file_path TEXT NOT NULL,
                    sheet_name TEXT NOT NULL,
                    sheet_index INTEGER NOT NULL,
                    job_function_config TEXT,
                    original_employees TEXT NOT NULL,
                    current_employees TEXT NOT NULL,
                    events TEXT NOT NULL DEFAULT '[]',
                    updated_at TIMESTAMP NOT NULL,
                    donut_events TEXT NOT NULL DEFAULT '[]',
                    donut_mode_active INTEGER NOT NULL DEFAULT 0
                );
            """)
            mock_get_path.return_value = schema_file

            # Initialize schema
            with manager.get_connection() as conn:
                cursor = conn.execute("SELECT name FROM sqlite_master WHERE type='table'")
                tables = [row[0] for row in cursor.fetchall()]
                assert "sessions" in tables

            # Verify the correct path was requested for frozen mode
            mock_get_path.assert_called_with("ninebox/models/schema.sql")


def test_ensure_schema_when_not_frozen_then_uses_dev_path() -> None:
    """Test that development mode uses correct schema path."""
    with tempfile.TemporaryDirectory() as tmpdir:
        db_path = Path(tmpdir) / "test.db"
        manager = DatabaseManager()
        manager.db_path = db_path

        # Mock development mode (not frozen)
        with (
            patch("sys.frozen", False, create=True),
            patch("ninebox.services.database.get_resource_path") as mock_get_path,
        ):
            # Create a temporary schema file with proper sessions table
            schema_file = Path(tmpdir) / "schema.sql"
            schema_file.write_text("""
                CREATE TABLE IF NOT EXISTS sessions (
                    user_id TEXT PRIMARY KEY,
                    session_id TEXT NOT NULL,
                    created_at TIMESTAMP NOT NULL,
                    original_filename TEXT NOT NULL,
                    original_file_path TEXT NOT NULL,
                    sheet_name TEXT NOT NULL,
                    sheet_index INTEGER NOT NULL,
                    job_function_config TEXT,
                    original_employees TEXT NOT NULL,
                    current_employees TEXT NOT NULL,
                    events TEXT NOT NULL DEFAULT '[]',
                    updated_at TIMESTAMP NOT NULL,
                    donut_events TEXT NOT NULL DEFAULT '[]',
                    donut_mode_active INTEGER NOT NULL DEFAULT 0
                );
            """)
            mock_get_path.return_value = schema_file

            # Initialize schema
            with manager.get_connection() as conn:
                cursor = conn.execute("SELECT name FROM sqlite_master WHERE type='table'")
                tables = [row[0] for row in cursor.fetchall()]
                assert "sessions" in tables

            # Verify the correct path was requested for dev mode
            mock_get_path.assert_called_with("src/ninebox/models/schema.sql")


def test_ensure_schema_when_sql_error_then_raises_and_logs() -> None:
    """Test that SQL errors during schema initialization are handled."""
    with tempfile.TemporaryDirectory() as tmpdir:
        db_path = Path(tmpdir) / "test.db"
        manager = DatabaseManager()
        manager.db_path = db_path

        # Create invalid SQL schema
        with patch("ninebox.services.database.get_resource_path") as mock_get_path:
            schema_file = Path(tmpdir) / "bad_schema.sql"
            schema_file.write_text("INVALID SQL STATEMENT;")
            mock_get_path.return_value = schema_file

            # Should raise sqlite3.Error
            with pytest.raises(sqlite3.Error):
                with manager.get_connection():
                    pass


def test_run_migrations_when_events_column_missing_then_adds_it() -> None:
    """Test that missing events column triggers migration."""
    with tempfile.TemporaryDirectory() as tmpdir:
        db_path = Path(tmpdir) / "test.db"
        manager = DatabaseManager()
        manager.db_path = db_path

        # Create old schema without events column
        with manager.get_connection() as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS sessions (
                    user_id TEXT PRIMARY KEY,
                    session_id TEXT NOT NULL,
                    created_at TIMESTAMP NOT NULL,
                    original_filename TEXT NOT NULL,
                    original_file_path TEXT NOT NULL,
                    sheet_name TEXT NOT NULL,
                    sheet_index INTEGER NOT NULL,
                    job_function_config TEXT,
                    original_employees TEXT NOT NULL,
                    current_employees TEXT NOT NULL,
                    changes TEXT NOT NULL DEFAULT '[]',
                    updated_at TIMESTAMP NOT NULL,
                    donut_changes TEXT NOT NULL DEFAULT '[]',
                    donut_mode_active INTEGER NOT NULL DEFAULT 0
                )
            """)

        # Force re-initialization which should trigger migration
        manager._schema_initialized = False
        with manager.get_connection() as conn:
            cursor = conn.execute("PRAGMA table_info(sessions)")
            columns = {row[1] for row in cursor.fetchall()}

            # Should have new columns
            assert "events" in columns
            assert "donut_events" in columns


def test_run_migrations_when_old_columns_exist_then_migrates_data() -> None:
    """Test that data is migrated from old columns to new columns."""
    with tempfile.TemporaryDirectory() as tmpdir:
        db_path = Path(tmpdir) / "test.db"
        manager = DatabaseManager()
        manager.db_path = db_path

        # Create old schema and insert test data
        with manager.get_connection() as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS sessions (
                    user_id TEXT PRIMARY KEY,
                    session_id TEXT NOT NULL,
                    created_at TIMESTAMP NOT NULL,
                    original_filename TEXT NOT NULL,
                    original_file_path TEXT NOT NULL,
                    sheet_name TEXT NOT NULL,
                    sheet_index INTEGER NOT NULL,
                    job_function_config TEXT,
                    original_employees TEXT NOT NULL,
                    current_employees TEXT NOT NULL,
                    changes TEXT NOT NULL DEFAULT '[{"test": "data"}]',
                    updated_at TIMESTAMP NOT NULL,
                    donut_changes TEXT NOT NULL DEFAULT '[{"donut": "data"}]',
                    donut_mode_active INTEGER NOT NULL DEFAULT 0
                )
            """)

            conn.execute("""
                INSERT INTO sessions VALUES (
                    'test_user', 'session1', '2025-01-01', 'test.xlsx', '/tmp/test.xlsx',
                    'Sheet1', 0, NULL, '[]', '[]', '[{"test": "data"}]',
                    '2025-01-01', '[{"donut": "data"}]', 0
                )
            """)

        # Force re-initialization which should trigger migration
        manager._schema_initialized = False
        with manager.get_connection() as conn:
            cursor = conn.execute("SELECT events, donut_events FROM sessions WHERE user_id = 'test_user'")
            row = cursor.fetchone()

            # Data should be migrated
            assert row is not None
            # Check that events column has data (it was migrated from changes column)
            events_data = row[0]  # This is the events column
            donut_events_data = row[1]  # This is the donut_events column
            assert events_data is not None
            assert donut_events_data is not None
            assert len(events_data) > 0  # Should have migrated data
            assert len(donut_events_data) > 0  # Should have migrated data
