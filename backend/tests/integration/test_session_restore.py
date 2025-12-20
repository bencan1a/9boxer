"""Integration tests for session restore after backend restart."""

from datetime import datetime, timezone
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from ninebox.core.dependencies import get_db_manager, get_session_manager
from ninebox.services.database import DatabaseManager
from ninebox.services.session_manager import SessionManager

pytestmark = [pytest.mark.integration, pytest.mark.slow]

class TestSessionRestore:
    """Test session restoration after backend restart."""

    def test_session_when_backend_restarts_then_session_restored(
        self, test_client: TestClient, sample_excel_file: Path
    ) -> None:
        """Test: Upload file → create session → simulate restart → verify session restored."""
        # Upload file to create session
        with open(sample_excel_file, "rb") as f:  # noqa: PTH123
            files = {
                "file": (
                    "test.xlsx",
                    f,
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                )
            }
            response = test_client.post("/api/session/upload", files=files)

        assert response.status_code == 200
        upload_data = response.json()
        original_count = upload_data["employee_count"]

        # Verify session is active and get filename from status
        response = test_client.get("/api/session/status")
        assert response.status_code == 200
        assert response.json()["active"] is True
        original_filename = response.json()["uploaded_filename"]

        # Simulate backend restart by creating new SessionManager
        get_session_manager.cache_clear()  # Clear in-memory cache
        new_manager = SessionManager()  # This should restore from database

        # Verify session was restored
        assert len(new_manager.sessions) == 1
        restored_session = list(new_manager.sessions.values())[0]
        assert len(restored_session.original_employees) == original_count
        assert len(restored_session.current_employees) == original_count
        assert restored_session.original_filename == original_filename

    def test_session_when_employee_moved_and_restart_then_changes_persisted(
        self, test_client: TestClient, sample_excel_file: Path
    ) -> None:
        """Test: Upload file → move employee → restart → verify changes persisted."""
        # Upload file
        with open(sample_excel_file, "rb") as f:  # noqa: PTH123
            files = {
                "file": (
                    "test.xlsx",
                    f,
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                )
            }
            test_client.post("/api/session/upload", files=files)

        # Get first employee and move them
        response = test_client.get("/api/employees")
        employees = response.json()["employees"]
        employee_id = employees[0]["employee_id"]
        original_perf = employees[0]["performance"]
        original_pot = employees[0]["potential"]

        # Move to a different position
        new_perf = "Low" if original_perf != "Low" else "High"
        new_pot = "High" if original_pot != "High" else "Medium"

        response = test_client.patch(
            f"/api/employees/{employee_id}/move",
            json={"performance": new_perf, "potential": new_pot},
        )
        assert response.status_code == 200

        # Verify change was recorded
        response = test_client.get("/api/session/status")
        assert response.json()["changes_count"] == 1

        # Simulate backend restart
        get_session_manager.cache_clear()
        new_manager = SessionManager()

        # Verify changes were persisted
        restored_session = list(new_manager.sessions.values())[0]
        assert len(restored_session.changes) == 1

        # Verify employee position was persisted
        restored_employee = next(
            e for e in restored_session.current_employees if e.employee_id == employee_id
        )
        assert restored_employee.performance.value == new_perf
        assert restored_employee.potential.value == new_pot
        assert restored_employee.modified_in_session is True

    def test_session_when_notes_added_and_restart_then_notes_persisted(
        self, test_client: TestClient, sample_excel_file: Path
    ) -> None:
        """Test: Upload file → add notes → restart → verify notes persisted."""
        # Upload file
        with open(sample_excel_file, "rb") as f:  # noqa: PTH123
            files = {
                "file": (
                    "test.xlsx",
                    f,
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                )
            }
            test_client.post("/api/session/upload", files=files)

        # Move employee to create a change entry (ensure it's a DIFFERENT position)
        response = test_client.get("/api/employees")
        first_employee = response.json()["employees"][0]
        employee_id = first_employee["employee_id"]
        original_perf = first_employee["performance"]

        # Move to a different performance level
        new_perf = "Low" if original_perf != "Low" else "High"

        test_client.patch(
            f"/api/employees/{employee_id}/move",
            json={"performance": new_perf, "potential": "Medium"},
        )

        # Add notes to the change
        notes_text = "Promoted due to exceptional Q4 performance"
        response = test_client.patch(
            f"/api/session/changes/{employee_id}/notes",
            json={"notes": notes_text},
        )
        assert response.status_code == 200

        # Simulate backend restart
        get_session_manager.cache_clear()
        new_manager = SessionManager()

        # Verify notes were persisted
        restored_session = list(new_manager.sessions.values())[0]
        change_entry = restored_session.changes[0]
        assert change_entry.notes == notes_text

    def test_session_when_deleted_and_restart_then_not_restored(
        self, test_client: TestClient, sample_excel_file: Path
    ) -> None:
        """Test: Upload file → delete session → restart → verify session not restored."""
        # Upload file
        with open(sample_excel_file, "rb") as f:  # noqa: PTH123
            files = {
                "file": (
                    "test.xlsx",
                    f,
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                )
            }
            test_client.post("/api/session/upload", files=files)

        # Verify session exists
        response = test_client.get("/api/session/status")
        assert response.status_code == 200

        # Delete session
        response = test_client.delete("/api/session/clear")
        assert response.status_code == 200

        # Verify session is gone from memory
        response = test_client.get("/api/session/status")
        assert response.status_code == 404

        # Simulate backend restart
        get_session_manager.cache_clear()
        new_manager = SessionManager()

        # Verify no sessions were restored
        assert len(new_manager.sessions) == 0

    def test_session_when_multiple_uploads_and_restart_then_latest_restored(
        self, test_client: TestClient, sample_excel_file: Path
    ) -> None:
        """Test: Multiple uploads → restart → verify latest session restored.

        Note: In local-only mode, there's only one user_id, so only one session
        can exist at a time. Multiple uploads replace the previous session.
        """
        # First upload
        with open(sample_excel_file, "rb") as f:  # noqa: PTH123
            files = {
                "file": (
                    "upload1.xlsx",
                    f,
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                )
            }
            test_client.post("/api/session/upload", files=files)

        # Second upload (replaces first)
        with open(sample_excel_file, "rb") as f:  # noqa: PTH123
            files = {
                "file": (
                    "upload2.xlsx",
                    f,
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                )
            }
            response = test_client.post("/api/session/upload", files=files)

        assert response.status_code == 200

        # Simulate backend restart
        get_session_manager.cache_clear()
        new_manager = SessionManager()

        # Verify only latest session was restored
        assert len(new_manager.sessions) == 1
        restored_session = list(new_manager.sessions.values())[0]
        assert restored_session.original_filename == "upload2.xlsx"


class TestDatabaseIntegrity:
    """Test database state and integrity during session operations."""

    def test_database_when_session_created_then_row_inserted(
        self, test_client: TestClient, sample_excel_file: Path
    ) -> None:
        """Test that creating a session inserts a database row."""
        # Count database rows before upload
        db_mgr = get_db_manager()
        with db_mgr.get_connection() as conn:
            cursor = conn.execute("SELECT COUNT(*) FROM sessions")
            initial_count = cursor.fetchone()[0]

        # Upload file
        with open(sample_excel_file, "rb") as f:  # noqa: PTH123
            files = {
                "file": (
                    "test.xlsx",
                    f,
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                )
            }
            test_client.post("/api/session/upload", files=files)

        # Count database rows after upload
        db_mgr = get_db_manager()
        with db_mgr.get_connection() as conn:
            cursor = conn.execute("SELECT COUNT(*) FROM sessions")
            final_count = cursor.fetchone()[0]

        assert final_count == initial_count + 1

    def test_database_when_employee_moved_then_row_updated(
        self, test_client: TestClient, sample_excel_file: Path
    ) -> None:
        """Test that moving an employee updates the database row."""
        # Upload file
        with open(sample_excel_file, "rb") as f:  # noqa: PTH123
            files = {
                "file": (
                    "test.xlsx",
                    f,
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                )
            }
            test_client.post("/api/session/upload", files=files)

        # Get updated_at timestamp before move
        db_mgr = get_db_manager()
        with db_mgr.get_connection() as conn:
            cursor = conn.execute("SELECT updated_at FROM sessions LIMIT 1")
            row = cursor.fetchone()
            initial_updated_at = row["updated_at"] if row else None

        assert initial_updated_at is not None

        # Move employee
        response = test_client.get("/api/employees")
        employee_id = response.json()["employees"][0]["employee_id"]

        test_client.patch(
            f"/api/employees/{employee_id}/move",
            json={"performance": "High", "potential": "High"},
        )

        # Get updated_at timestamp after move
        db_mgr = get_db_manager()
        with db_mgr.get_connection() as conn:
            cursor = conn.execute("SELECT updated_at FROM sessions LIMIT 1")
            row = cursor.fetchone()
            final_updated_at = row["updated_at"] if row else None

        # Verify updated_at was updated
        assert final_updated_at is not None
        assert final_updated_at != initial_updated_at

    def test_database_when_session_deleted_then_row_removed(
        self, test_client: TestClient, sample_excel_file: Path
    ) -> None:
        """Test that deleting a session removes the database row."""
        # Upload file
        with open(sample_excel_file, "rb") as f:  # noqa: PTH123
            files = {
                "file": (
                    "test.xlsx",
                    f,
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                )
            }
            test_client.post("/api/session/upload", files=files)

        # Verify database row exists
        db_mgr = get_db_manager()
        with db_mgr.get_connection() as conn:
            cursor = conn.execute("SELECT COUNT(*) FROM sessions")
            count_before = cursor.fetchone()[0]

        assert count_before > 0

        # Delete session
        test_client.delete("/api/session/clear")

        # Verify database row was removed
        db_mgr = get_db_manager()
        with db_mgr.get_connection() as conn:
            cursor = conn.execute("SELECT COUNT(*) FROM sessions")
            count_after = cursor.fetchone()[0]

        assert count_after == count_before - 1


class TestErrorHandling:
    """Test error handling during session restoration."""

    def test_restore_when_corrupted_data_then_skips_session(self) -> None:
        """Test that corrupted sessions are skipped during restore."""
        # Insert corrupted session data directly into database
        db_mgr = get_db_manager()
        with db_mgr.get_connection() as conn:
            conn.execute(
                """
                INSERT INTO sessions (
                    user_id, session_id, created_at, original_filename,
                    original_file_path, sheet_name, sheet_index,
                    job_function_config, original_employees,
                    current_employees, changes, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    "corrupt_user",
                    "corrupt_session",
                    datetime.now(timezone.utc).isoformat(),
                    "test.xlsx",
                    "/tmp/test.xlsx",
                    "Sheet1",
                    0,
                    None,
                    "INVALID_JSON",  # Corrupted JSON
                    "[]",
                    "[]",
                    datetime.now(timezone.utc).isoformat(),
                ),
            )

        # Create new SessionManager (should skip corrupted session)
        get_session_manager.cache_clear()
        new_manager = SessionManager()

        # Verify corrupted session was skipped
        assert "corrupt_user" not in new_manager.sessions

    def test_restore_when_database_error_then_starts_with_empty_state(self) -> None:
        """Test that database errors during restore don't prevent startup.

        This test verifies graceful degradation - if the database has issues
        during restore, the SessionManager still initializes (with empty state)
        rather than crashing the application.
        """
        # Insert data that will cause deserialization errors
        db_mgr = get_db_manager()
        with db_mgr.get_connection() as conn:
            conn.execute(
                """
                INSERT INTO sessions (
                    user_id, session_id, created_at, original_filename,
                    original_file_path, sheet_name, sheet_index,
                    job_function_config, original_employees,
                    current_employees, changes, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    "error_user",
                    "error_session",
                    "INVALID_DATE",  # Invalid date format
                    "test.xlsx",
                    "/tmp/test.xlsx",
                    "Sheet1",
                    0,
                    None,
                    "[]",
                    "[]",
                    "[]",
                    datetime.now(timezone.utc).isoformat(),
                ),
            )

        # Clear and create new SessionManager
        get_session_manager.cache_clear()
        new_manager = SessionManager()

        # Verify manager starts, but skips the bad session
        assert "error_user" not in new_manager.sessions
