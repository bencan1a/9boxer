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
