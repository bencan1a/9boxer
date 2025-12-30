"""Integration tests for export fallback workflow.

This module tests the complete export workflow including error handling
when original files are missing and fallback to save-new mode.
"""

from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from ninebox.core.dependencies import get_session_manager

pytestmark = [pytest.mark.integration, pytest.mark.slow]


class TestExportFallbackFlow:
    """Integration tests for export error handling and fallback workflows."""

    def test_export_when_original_file_missing_then_fallback_suggested(
        self,
        test_client: TestClient,
        sample_excel_file: Path,
    ) -> None:
        """Test that export suggests fallback when original file is missing."""
        # Upload file
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

        # Get session to find the uploaded file path
        response = test_client.get("/api/session/status")
        assert response.status_code == 200
        session_data = response.json()
        assert session_data["active"] is True

        # Delete the original uploaded file to simulate file missing scenario
        # The uploaded file is stored in user data dir with session ID prefix
        session_mgr = test_client.app.dependency_overrides.get(
            get_session_manager, get_session_manager
        )()
        session = session_mgr.get_session("local-user")
        assert session is not None

        original_file = Path(session.original_file_path)
        original_file.unlink(missing_ok=True)
        assert not original_file.exists()

        # Try to export to original (should fail with fallback suggestion)
        export_request = {"mode": "update_original"}
        response = test_client.post("/api/session/export", json=export_request)
        assert response.status_code == 200  # Returns 200 with error in body

        result = response.json()
        assert result["success"] is False
        assert "fallback_to_save_new" in result
        assert result["fallback_to_save_new"] is True
        assert "not found" in result["error"].lower()

    def test_export_when_fallback_to_save_new_then_writes_to_new_path(
        self,
        test_client: TestClient,
        sample_excel_file: Path,
        tmp_path: Path,
    ) -> None:
        """Test that export can fallback to save_new mode with new path."""
        # Upload file
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

        # Delete the original uploaded file
        session_mgr = test_client.app.dependency_overrides.get(
            get_session_manager, get_session_manager
        )()
        session = session_mgr.get_session("local-user")
        assert session is not None

        original_file = Path(session.original_file_path)
        original_file.unlink(missing_ok=True)

        # Export to new path (fallback mode)
        new_file_path = tmp_path / "new_export.xlsx"
        export_request = {"mode": "save_new", "new_path": str(new_file_path)}
        response = test_client.post("/api/session/export", json=export_request)
        assert response.status_code == 200

        result = response.json()
        assert result["success"] is True
        assert result["file_path"] == str(new_file_path)
        assert new_file_path.exists()

    def test_full_workflow_upload_change_export_update_original(
        self,
        test_client: TestClient,
        sample_excel_file: Path,
    ) -> None:
        """Test complete workflow: upload -> make changes -> export to original."""
        # Upload file
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
        upload_result = response.json()
        # Verify we have employees (fixture should provide 50)
        assert upload_result["employee_count"] > 0

        # Get employees to make a change
        response = test_client.get("/api/employees")
        assert response.status_code == 200
        employees = response.json()["employees"]
        # Verify we have employees (fixture should provide 50, but be flexible)
        assert len(employees) > 0

        # Move an employee to a DIFFERENT position (simulate a change)
        first_employee = employees[0]
        employee_id = first_employee["employee_id"]
        original_perf = first_employee["performance"]
        original_pot = first_employee["potential"]

        # Ensure we move to a different position
        new_perf = "Low" if original_perf != "Low" else "High"
        new_pot = "Low" if original_pot != "Low" else "High"

        move_request = {
            "performance": new_perf,
            "potential": new_pot,
        }
        response = test_client.patch(f"/api/employees/{employee_id}/move", json=move_request)
        assert response.status_code == 200

        # Verify change was recorded
        response = test_client.get("/api/session/status")
        assert response.status_code == 200
        status = response.json()
        assert status["changes_count"] > 0

        # Export to original file
        export_request = {"mode": "update_original"}
        response = test_client.post("/api/session/export", json=export_request)
        assert response.status_code == 200

        result = response.json()
        assert result["success"] is True
        assert "Changes applied to" in result["message"]

        # Verify the exported file exists
        file_path = Path(result["file_path"])
        assert file_path.exists()

    def test_full_workflow_upload_change_export_save_new(
        self,
        test_client: TestClient,
        sample_excel_file: Path,
        tmp_path: Path,
    ) -> None:
        """Test complete workflow: upload -> make changes -> export to new file."""
        # Upload file
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

        # Get employees to make a change
        response = test_client.get("/api/employees")
        assert response.status_code == 200
        employees = response.json()["employees"]

        # Move an employee
        employee_id = employees[0]["employee_id"]
        move_request = {
            "performance": "Medium",
            "potential": "High",
        }
        response = test_client.patch(f"/api/employees/{employee_id}/move", json=move_request)
        assert response.status_code == 200

        # Export to new file
        new_file_path = tmp_path / "export_new.xlsx"
        export_request = {"mode": "save_new", "new_path": str(new_file_path)}
        response = test_client.post("/api/session/export", json=export_request)
        assert response.status_code == 200

        result = response.json()
        assert result["success"] is True
        assert result["file_path"] == str(new_file_path)
        assert new_file_path.exists()

        # Verify original file still exists (wasn't modified)
        session_mgr = test_client.app.dependency_overrides.get(
            get_session_manager, get_session_manager
        )()
        session = session_mgr.get_session("local-user")
        assert session is not None

        original_file = Path(session.original_file_path)
        assert original_file.exists()
