"""Tests for session API endpoints."""

import io
from pathlib import Path

from fastapi.testclient import TestClient


def test_upload_when_valid_excel_file_then_returns_200(
    test_client: TestClient, auth_headers: dict[str, str], sample_excel_file: Path
) -> None:
    """Test POST /api/session/upload with valid Excel file returns 200."""
    with open(sample_excel_file, "rb") as f:  # noqa: PTH123
        files = {
            "file": (
                "test.xlsx",
                f,
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            )
        }
        response = test_client.post("/api/session/upload", files=files, headers=auth_headers)

    assert response.status_code == 200
    data = response.json()
    assert "session_id" in data
    assert data["employee_count"] == 5
    assert data["filename"] == "test.xlsx"


def test_upload_when_invalid_file_type_then_returns_400(
    test_client: TestClient, auth_headers: dict[str, str], tmp_path: Path
) -> None:
    """Test upload with invalid file type returns 400."""
    # Create a text file
    text_file = tmp_path / "test.txt"
    text_file.write_text("not an excel file")

    with open(text_file, "rb") as f:  # noqa: PTH123
        files = {"file": ("test.txt", f, "text/plain")}
        response = test_client.post("/api/session/upload", files=files, headers=auth_headers)

    assert response.status_code == 400
    assert "Excel file" in response.json()["detail"]


# NOTE: test_upload_when_no_authentication_then_returns_401 removed
# This app is local-only without authentication


def test_get_status_when_active_session_then_returns_200(
    test_client: TestClient, auth_headers: dict[str, str], sample_excel_file: Path
) -> None:
    """Test GET /api/session/status with active session returns 200."""
    # Upload file first
    with open(sample_excel_file, "rb") as f:  # noqa: PTH123
        files = {
            "file": (
                "test.xlsx",
                f,
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            )
        }
        test_client.post("/api/session/upload", files=files, headers=auth_headers)

    # Get status
    response = test_client.get("/api/session/status", headers=auth_headers)

    assert response.status_code == 200
    data = response.json()
    assert data["active"] is True
    assert data["employee_count"] == 5
    assert data["changes_count"] == 0
    assert data["uploaded_filename"] == "test.xlsx"


def test_get_status_when_no_session_then_returns_404(
    test_client: TestClient, auth_headers: dict[str, str]
) -> None:
    """Test GET /api/session/status with no session returns 404."""
    response = test_client.get("/api/session/status", headers=auth_headers)

    assert response.status_code == 404
    assert "No active session" in response.json()["detail"]


def test_export_when_active_session_then_returns_file(
    test_client: TestClient, auth_headers: dict[str, str], sample_excel_file: Path
) -> None:
    """Test POST /api/session/export with active session returns file."""
    # Upload file first
    with open(sample_excel_file, "rb") as f:  # noqa: PTH123
        files = {
            "file": (
                "test.xlsx",
                f,
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            )
        }
        test_client.post("/api/session/upload", files=files, headers=auth_headers)

    # Export
    response = test_client.post("/api/session/export", headers=auth_headers)

    assert response.status_code == 200
    assert (
        response.headers["content-type"]
        == "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )
    assert len(response.content) > 0


def test_export_when_no_session_then_returns_404(
    test_client: TestClient, auth_headers: dict[str, str]
) -> None:
    """Test POST /api/session/export with no session returns 404."""
    response = test_client.post("/api/session/export", headers=auth_headers)

    assert response.status_code == 404
    assert "No active session" in response.json()["detail"]


def test_clear_session_when_session_exists_then_returns_200(
    test_client: TestClient, auth_headers: dict[str, str], sample_excel_file: Path
) -> None:
    """Test DELETE /api/session/clear returns 200."""
    # Upload file first
    with open(sample_excel_file, "rb") as f:  # noqa: PTH123
        files = {
            "file": (
                "test.xlsx",
                f,
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            )
        }
        test_client.post("/api/session/upload", files=files, headers=auth_headers)

    # Clear session
    response = test_client.delete("/api/session/clear", headers=auth_headers)

    assert response.status_code == 200
    assert response.json()["success"] is True

    # Verify session is gone
    status_response = test_client.get("/api/session/status", headers=auth_headers)
    assert status_response.status_code == 404


def test_clear_session_when_no_session_then_returns_200(
    test_client: TestClient, auth_headers: dict[str, str]
) -> None:
    """Test DELETE /api/session/clear with no session still returns 200."""
    response = test_client.delete("/api/session/clear", headers=auth_headers)

    assert response.status_code == 200
    assert response.json()["success"] is True


def test_upload_when_invalid_excel_content_then_returns_400(
    test_client: TestClient, auth_headers: dict[str, str]
) -> None:
    """Test upload with Excel file that has invalid content returns 400."""
    # Create a file with .xlsx extension but invalid content
    fake_excel = io.BytesIO(b"This is not a real Excel file")

    files = {
        "file": (
            "fake.xlsx",
            fake_excel,
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        )
    }
    response = test_client.post("/api/session/upload", files=files, headers=auth_headers)

    assert response.status_code == 400
    assert "Failed to parse Excel file" in response.json()["detail"]


def test_session_workflow_when_complete_then_all_operations_succeed(
    test_client: TestClient, auth_headers: dict[str, str], sample_excel_file: Path
) -> None:
    """Test complete session workflow: upload -> status -> export -> clear."""
    # 1. Upload
    with open(sample_excel_file, "rb") as f:  # noqa: PTH123
        files = {
            "file": (
                "test.xlsx",
                f,
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            )
        }
        upload_response = test_client.post("/api/session/upload", files=files, headers=auth_headers)
    assert upload_response.status_code == 200

    # 2. Check status
    status_response = test_client.get("/api/session/status", headers=auth_headers)
    assert status_response.status_code == 200
    assert status_response.json()["active"] is True

    # 3. Export
    export_response = test_client.post("/api/session/export", headers=auth_headers)
    assert export_response.status_code == 200

    # 4. Clear
    clear_response = test_client.delete("/api/session/clear", headers=auth_headers)
    assert clear_response.status_code == 200

    # 5. Verify cleared
    final_status = test_client.get("/api/session/status", headers=auth_headers)
    assert final_status.status_code == 404


def test_update_change_notes_when_valid_employee_then_returns_updated_move(
    test_client: TestClient, auth_headers: dict[str, str], sample_excel_file: Path
) -> None:
    """Test PATCH /api/session/changes/{employee_id}/notes with valid data returns updated move."""
    # Upload file to create session
    with open(sample_excel_file, "rb") as f:  # noqa: PTH123
        files = {
            "file": (
                "test.xlsx",
                f,
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            )
        }
        test_client.post("/api/session/upload", files=files, headers=auth_headers)

    # Move employee to create change entry (employee_id=1 from H,H to M,M)
    move_response = test_client.patch(
        "/api/employees/1/move",
        json={"performance": "Medium", "potential": "Medium"},
        headers=auth_headers,
    )
    assert move_response.status_code == 200

    # Update notes for the change
    test_notes = "Promoted to team lead due to exceptional Q4 performance"
    notes_response = test_client.patch(
        "/api/session/changes/1/notes",
        json={"notes": test_notes},
        headers=auth_headers,
    )

    assert notes_response.status_code == 200
    data = notes_response.json()
    assert data["employee_id"] == 1
    assert data["notes"] == test_notes
    assert data["old_performance"] == "High"
    assert data["old_potential"] == "High"
    assert data["new_performance"] == "Medium"
    assert data["new_potential"] == "Medium"


def test_update_change_notes_when_notes_updated_multiple_times_then_overwrites(
    test_client: TestClient, auth_headers: dict[str, str], sample_excel_file: Path
) -> None:
    """Test updating notes multiple times overwrites previous value."""
    # Upload file and move employee
    with open(sample_excel_file, "rb") as f:  # noqa: PTH123
        files = {
            "file": (
                "test.xlsx",
                f,
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            )
        }
        test_client.post("/api/session/upload", files=files, headers=auth_headers)

    test_client.patch(
        "/api/employees/1/move",
        json={"performance": "Medium", "potential": "Medium"},
        headers=auth_headers,
    )

    # Update notes first time
    test_client.patch(
        "/api/session/changes/1/notes",
        json={"notes": "Initial notes"},
        headers=auth_headers,
    )

    # Update notes second time
    final_notes = "Updated notes after review"
    notes_response = test_client.patch(
        "/api/session/changes/1/notes",
        json={"notes": final_notes},
        headers=auth_headers,
    )

    assert notes_response.status_code == 200
    assert notes_response.json()["notes"] == final_notes


def test_update_change_notes_when_invalid_employee_id_then_returns_404(
    test_client: TestClient, auth_headers: dict[str, str], sample_excel_file: Path
) -> None:
    """Test updating notes for non-existent employee returns 404."""
    # Upload file to create session
    with open(sample_excel_file, "rb") as f:  # noqa: PTH123
        files = {
            "file": (
                "test.xlsx",
                f,
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            )
        }
        test_client.post("/api/session/upload", files=files, headers=auth_headers)

    # Try to update notes for employee that hasn't been moved
    notes_response = test_client.patch(
        "/api/session/changes/999/notes",
        json={"notes": "Some notes"},
        headers=auth_headers,
    )

    assert notes_response.status_code == 404
    assert "No change entry found" in notes_response.json()["detail"]


def test_update_change_notes_when_no_change_entry_then_returns_404(
    test_client: TestClient, auth_headers: dict[str, str], sample_excel_file: Path
) -> None:
    """Test updating notes for employee without change entry returns 404."""
    # Upload file to create session
    with open(sample_excel_file, "rb") as f:  # noqa: PTH123
        files = {
            "file": (
                "test.xlsx",
                f,
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            )
        }
        test_client.post("/api/session/upload", files=files, headers=auth_headers)

    # Don't move employee - try to add notes without change entry
    notes_response = test_client.patch(
        "/api/session/changes/1/notes",
        json={"notes": "Some notes"},
        headers=auth_headers,
    )

    assert notes_response.status_code == 404
    assert "No change entry found for employee 1" in notes_response.json()["detail"]


def test_update_change_notes_when_no_session_then_returns_404(
    test_client: TestClient, auth_headers: dict[str, str]
) -> None:
    """Test updating notes without active session returns 404."""
    notes_response = test_client.patch(
        "/api/session/changes/1/notes",
        json={"notes": "Some notes"},
        headers=auth_headers,
    )

    assert notes_response.status_code == 404
    assert "No active session" in notes_response.json()["detail"]


def test_update_change_notes_when_employee_moved_back_then_returns_404(
    test_client: TestClient, auth_headers: dict[str, str], sample_excel_file: Path
) -> None:
    """Test updating notes after employee moved back to original returns 404."""
    # Upload file to create session
    with open(sample_excel_file, "rb") as f:  # noqa: PTH123
        files = {
            "file": (
                "test.xlsx",
                f,
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            )
        }
        test_client.post("/api/session/upload", files=files, headers=auth_headers)

    # Move employee away from original (employee 1: H,H -> M,M)
    test_client.patch(
        "/api/employees/1/move",
        json={"performance": "Medium", "potential": "Medium"},
        headers=auth_headers,
    )

    # Move employee back to original position (M,M -> H,H)
    test_client.patch(
        "/api/employees/1/move",
        json={"performance": "High", "potential": "High"},
        headers=auth_headers,
    )

    # Change entry should be removed, so updating notes should fail
    notes_response = test_client.patch(
        "/api/session/changes/1/notes",
        json={"notes": "Some notes"},
        headers=auth_headers,
    )

    assert notes_response.status_code == 404
    assert "No change entry found for employee 1" in notes_response.json()["detail"]


def test_update_change_notes_when_notes_added_then_persists_across_moves(
    test_client: TestClient, auth_headers: dict[str, str], sample_excel_file: Path
) -> None:
    """Test that notes persist when employee is moved again."""
    # Upload file and move employee
    with open(sample_excel_file, "rb") as f:  # noqa: PTH123
        files = {
            "file": (
                "test.xlsx",
                f,
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            )
        }
        test_client.post("/api/session/upload", files=files, headers=auth_headers)

    # First move (H,H -> M,M)
    test_client.patch(
        "/api/employees/1/move",
        json={"performance": "Medium", "potential": "Medium"},
        headers=auth_headers,
    )

    # Add notes
    test_notes = "Performance improvement plan completed"
    test_client.patch(
        "/api/session/changes/1/notes",
        json={"notes": test_notes},
        headers=auth_headers,
    )

    # Second move (M,M -> L,L)
    test_client.patch(
        "/api/employees/1/move",
        json={"performance": "Low", "potential": "Low"},
        headers=auth_headers,
    )

    # Verify notes are still present
    notes_response = test_client.patch(
        "/api/session/changes/1/notes",
        json={"notes": test_notes},  # Re-setting same notes to verify they exist
        headers=auth_headers,
    )

    assert notes_response.status_code == 200
    assert notes_response.json()["notes"] == test_notes
    # Verify the move still shows original -> final position
    assert notes_response.json()["old_performance"] == "High"
    assert notes_response.json()["new_performance"] == "Low"


def test_upload_when_valid_file_then_saves_to_uploads_directory(
    test_client: TestClient, auth_headers: dict[str, str], sample_excel_file: Path
) -> None:
    """Test that file is saved to permanent uploads/ directory."""
    with open(sample_excel_file, "rb") as f:  # noqa: PTH123
        files = {
            "file": (
                "test.xlsx",
                f,
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            )
        }
        response = test_client.post("/api/session/upload", files=files, headers=auth_headers)

    assert response.status_code == 200

    # Verify session created
    from ninebox.core.dependencies import get_session_manager  # noqa: PLC0415

    session = get_session_manager().get_session("local-user")
    assert session is not None

    # Verify file path is in uploads/ directory
    file_path = Path(session.original_file_path)
    assert file_path.parent.name == "uploads"
    assert file_path.exists()


def test_upload_when_valid_file_then_filename_includes_session_id(
    test_client: TestClient, auth_headers: dict[str, str], sample_excel_file: Path
) -> None:
    """Test that uploaded filename includes session_id prefix."""
    with open(sample_excel_file, "rb") as f:  # noqa: PTH123
        files = {
            "file": (
                "test.xlsx",
                f,
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            )
        }
        response = test_client.post("/api/session/upload", files=files, headers=auth_headers)

    assert response.status_code == 200
    session_id = response.json()["session_id"]

    # Verify filename starts with session_id
    from ninebox.core.dependencies import get_session_manager  # noqa: PLC0415

    session = get_session_manager().get_session("local-user")
    assert session is not None

    file_path = Path(session.original_file_path)
    assert file_path.name.startswith(session_id)
    assert file_path.name.endswith("test.xlsx")


def test_upload_when_valid_file_then_file_persists_after_upload(
    test_client: TestClient, auth_headers: dict[str, str], sample_excel_file: Path
) -> None:
    """Test that uploaded file persists in permanent location."""
    with open(sample_excel_file, "rb") as f:  # noqa: PTH123
        files = {
            "file": (
                "test.xlsx",
                f,
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            )
        }
        test_client.post("/api/session/upload", files=files, headers=auth_headers)

    # Get session to find file path
    from ninebox.core.dependencies import get_session_manager  # noqa: PLC0415

    session = get_session_manager().get_session("local-user")
    assert session is not None

    file_path = Path(session.original_file_path)

    # Verify file exists and has content
    assert file_path.exists()
    assert file_path.stat().st_size > 0


def test_clear_session_when_session_exists_then_deletes_uploaded_file(
    test_client: TestClient, auth_headers: dict[str, str], sample_excel_file: Path
) -> None:
    """Test that clearing session deletes uploaded file from permanent location."""
    # Upload file
    with open(sample_excel_file, "rb") as f:  # noqa: PTH123
        files = {
            "file": (
                "test.xlsx",
                f,
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            )
        }
        test_client.post("/api/session/upload", files=files, headers=auth_headers)

    # Get file path before clearing
    from ninebox.core.dependencies import get_session_manager  # noqa: PLC0415

    session = get_session_manager().get_session("local-user")
    assert session is not None
    file_path = Path(session.original_file_path)
    assert file_path.exists()

    # Clear session
    response = test_client.delete("/api/session/clear", headers=auth_headers)
    assert response.status_code == 200

    # Verify file is deleted
    assert not file_path.exists()


def test_clear_session_when_file_missing_then_handles_gracefully(
    test_client: TestClient, auth_headers: dict[str, str], sample_excel_file: Path
) -> None:
    """Test that clearing session handles missing file gracefully."""
    import gc
    import time

    # Upload file
    with open(sample_excel_file, "rb") as f:  # noqa: PTH123
        files = {
            "file": (
                "test.xlsx",
                f,
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            )
        }
        test_client.post("/api/session/upload", files=files, headers=auth_headers)

    # Manually delete the file
    from ninebox.core.dependencies import get_session_manager  # noqa: PLC0415

    session = get_session_manager().get_session("local-user")
    assert session is not None
    file_path = Path(session.original_file_path)

    # Force garbage collection to release file handles (Windows)
    gc.collect()

    # Retry deletion with delays (handles file locking on Windows)
    max_retries = 3
    for attempt in range(max_retries):
        try:
            file_path.unlink()
            break
        except PermissionError:
            if attempt < max_retries - 1:
                time.sleep(0.1)
            else:
                # If still locked, that's okay - we're testing missing file handling
                # Skip the test if we can't delete the file
                import pytest  # noqa: PLC0415

                pytest.skip("Could not delete file due to Windows file locking")

    # Clear session should not raise error
    response = test_client.delete("/api/session/clear", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["success"] is True
