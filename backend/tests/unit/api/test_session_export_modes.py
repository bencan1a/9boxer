"""Tests for session export with mode parameter."""

from pathlib import Path

import pytest
from fastapi.testclient import TestClient

pytestmark = pytest.mark.unit


def test_export_when_mode_update_original_then_writes_to_original_path(
    test_client: TestClient, auth_headers: dict[str, str], sample_excel_file: Path, tmp_path: Path
) -> None:
    """Test export with mode='update_original' writes to original file path."""
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

    # Get original file path from session
    from ninebox.core.dependencies import get_session_manager  # noqa: PLC0415

    session = get_session_manager().get_session("local-user")
    assert session is not None
    original_path = session.original_file_path

    # Export with mode='update_original'
    response = test_client.post(
        "/api/session/export",
        json={"mode": "update_original"},
        headers=auth_headers,
    )

    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["file_path"] == original_path
    assert "message" in data
    assert Path(original_path).exists()


def test_export_when_mode_save_new_then_writes_to_new_path(
    test_client: TestClient, auth_headers: dict[str, str], sample_excel_file: Path
) -> None:
    """Test export with mode='save_new' writes to new file path."""
    import tempfile  # noqa: PLC0415

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

    # Export with mode='save_new' to a new path (use home dir for security validation)
    # Create a temp file within home directory to pass path validation
    with tempfile.NamedTemporaryFile(
        suffix=".xlsx", dir=Path.home(), delete=False
    ) as tmp_file:
        new_path = tmp_file.name

    try:
        response = test_client.post(
            "/api/session/export",
            json={"mode": "save_new", "new_path": new_path},
            headers=auth_headers,
        )

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["file_path"] == new_path
        assert "message" in data
        assert Path(new_path).exists()
    finally:
        # Clean up temp file
        Path(new_path).unlink(missing_ok=True)


def test_export_when_mode_save_new_without_new_path_then_returns_error(
    test_client: TestClient, auth_headers: dict[str, str], sample_excel_file: Path
) -> None:
    """Test export with mode='save_new' but no new_path returns error."""
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

    # Export with mode='save_new' but no new_path
    response = test_client.post(
        "/api/session/export",
        json={"mode": "save_new"},
        headers=auth_headers,
    )

    assert response.status_code == 200
    data = response.json()
    assert data["success"] is False
    assert "error" in data
    assert "new_path is required" in data["error"]


def test_export_when_success_then_returns_success_response(
    test_client: TestClient, auth_headers: dict[str, str], sample_excel_file: Path
) -> None:
    """Test export returns success response with all expected fields."""
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

    # Export with default mode
    response = test_client.post(
        "/api/session/export",
        json={},
        headers=auth_headers,
    )

    assert response.status_code == 200
    data = response.json()
    assert "success" in data
    assert "file_path" in data
    assert "message" in data


def test_export_response_format_includes_file_path_and_message(
    test_client: TestClient, auth_headers: dict[str, str], sample_excel_file: Path
) -> None:
    """Test export response includes file_path and descriptive message."""
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
    response = test_client.post(
        "/api/session/export",
        json={"mode": "update_original"},
        headers=auth_headers,
    )

    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert isinstance(data["file_path"], str)
    assert len(data["file_path"]) > 0
    assert isinstance(data["message"], str)
    assert len(data["message"]) > 0
    # Message should include display name (not internal filename with session ID)
    assert "test.xlsx" in data["message"]


def test_export_when_no_session_then_returns_404(
    test_client: TestClient, auth_headers: dict[str, str]
) -> None:
    """Test export without active session returns 404."""
    response = test_client.post(
        "/api/session/export",
        json={"mode": "update_original"},
        headers=auth_headers,
    )

    assert response.status_code == 404
    assert "No active session" in response.json()["detail"]


def test_export_when_mode_defaults_to_update_original(
    test_client: TestClient, auth_headers: dict[str, str], sample_excel_file: Path
) -> None:
    """Test export with no mode parameter defaults to 'update_original'."""
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

    # Get original file path
    from ninebox.core.dependencies import get_session_manager  # noqa: PLC0415

    session = get_session_manager().get_session("local-user")
    assert session is not None
    original_path = session.original_file_path

    # Export without specifying mode
    response = test_client.post(
        "/api/session/export",
        json={},
        headers=auth_headers,
    )

    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["file_path"] == original_path


def test_export_when_invalid_mode_then_returns_422(
    test_client: TestClient, auth_headers: dict[str, str], sample_excel_file: Path
) -> None:
    """Test invalid mode is rejected."""
    # Upload first
    with open(sample_excel_file, "rb") as f:  # noqa: PTH123
        files = {
            "file": (
                "test.xlsx",
                f,
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            )
        }
        test_client.post("/api/session/upload", files=files, headers=auth_headers)

    # Try invalid mode
    response = test_client.post(
        "/api/session/export",
        json={"mode": "invalid_mode"},
        headers=auth_headers,
    )

    assert response.status_code == 422  # Unprocessable Entity (validation error)


def test_export_when_non_excel_extension_then_returns_422(
    test_client: TestClient, auth_headers: dict[str, str], sample_excel_file: Path
) -> None:
    """Test non-Excel extension is rejected."""
    # Upload first
    with open(sample_excel_file, "rb") as f:  # noqa: PTH123
        files = {
            "file": (
                "test.xlsx",
                f,
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            )
        }
        test_client.post("/api/session/upload", files=files, headers=auth_headers)

    # Try non-Excel path
    response = test_client.post(
        "/api/session/export",
        json={"mode": "save_new", "new_path": "/home/user/file.txt"},
        headers=auth_headers,
    )

    assert response.status_code == 422
    assert "Excel" in response.json()["detail"][0]["msg"]


def test_export_when_path_too_long_then_returns_422(
    test_client: TestClient, auth_headers: dict[str, str], sample_excel_file: Path
) -> None:
    """Test path exceeding max length is rejected."""
    # Upload first
    with open(sample_excel_file, "rb") as f:  # noqa: PTH123
        files = {
            "file": (
                "test.xlsx",
                f,
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            )
        }
        test_client.post("/api/session/upload", files=files, headers=auth_headers)

    # Create 501-character path
    long_path = "/" + "a" * 495 + ".xlsx"  # 501 chars total

    response = test_client.post(
        "/api/session/export",
        json={"mode": "save_new", "new_path": long_path},
        headers=auth_headers,
    )

    assert response.status_code == 422
    assert "500" in response.json()["detail"][0]["msg"]  # Max length 500


def test_export_when_valid_xlsx_extension_then_accepts(
    test_client: TestClient, auth_headers: dict[str, str], sample_excel_file: Path
) -> None:
    """Test .xlsx extension is accepted."""
    import tempfile  # noqa: PLC0415

    # Upload first
    with open(sample_excel_file, "rb") as f:  # noqa: PTH123
        files = {
            "file": (
                "test.xlsx",
                f,
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            )
        }
        test_client.post("/api/session/upload", files=files, headers=auth_headers)

    # Valid path with .xlsx (use home dir for security validation)
    with tempfile.NamedTemporaryFile(
        suffix=".xlsx", dir=Path.home(), delete=False
    ) as tmp_file:
        new_path = tmp_file.name

    try:
        response = test_client.post(
            "/api/session/export",
            json={"mode": "save_new", "new_path": new_path},
            headers=auth_headers,
        )

        # Should not get validation error (might get other errors, but not 422)
        assert response.status_code != 422
    finally:
        # Clean up temp file
        Path(new_path).unlink(missing_ok=True)


def test_export_when_valid_xls_extension_then_accepts(
    test_client: TestClient, auth_headers: dict[str, str], sample_excel_file: Path
) -> None:
    """Test .xls extension is accepted."""
    import tempfile  # noqa: PLC0415

    # Upload first
    with open(sample_excel_file, "rb") as f:  # noqa: PTH123
        files = {
            "file": (
                "test.xlsx",
                f,
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            )
        }
        test_client.post("/api/session/upload", files=files, headers=auth_headers)

    # Valid path with .xls (use home dir for security validation)
    with tempfile.NamedTemporaryFile(
        suffix=".xls", dir=Path.home(), delete=False
    ) as tmp_file:
        new_path = tmp_file.name

    try:
        response = test_client.post(
            "/api/session/export",
            json={"mode": "save_new", "new_path": new_path},
            headers=auth_headers,
        )

        # Should not get validation error
        assert response.status_code != 422
    finally:
        # Clean up temp file
        Path(new_path).unlink(missing_ok=True)


def test_export_when_path_traversal_attack_then_returns_error(
    test_client: TestClient, auth_headers: dict[str, str], sample_excel_file: Path
) -> None:
    """Test path traversal is blocked in export."""
    # Upload first
    with open(sample_excel_file, "rb") as f:  # noqa: PTH123
        files = {
            "file": (
                "test.xlsx",
                f,
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            )
        }
        test_client.post("/api/session/upload", files=files, headers=auth_headers)

    # Try to export with path traversal (use .xlsx extension to pass validation)
    response = test_client.post(
        "/api/session/export",
        json={"mode": "save_new", "new_path": "../../../../../../etc/passwd.xlsx"},
        headers=auth_headers,
    )

    assert response.status_code == 200
    data = response.json()
    assert data["success"] is False
    # Verify error message mentions path restrictions
    error_lower = data["error"].lower()
    assert "within" in error_lower or "directory" in error_lower or "allowed" in error_lower


def test_export_when_absolute_path_outside_allowed_dirs_then_returns_error(
    test_client: TestClient, auth_headers: dict[str, str], sample_excel_file: Path
) -> None:
    """Test absolute paths outside allowed directories are blocked."""
    # Upload first
    with open(sample_excel_file, "rb") as f:  # noqa: PTH123
        files = {
            "file": (
                "test.xlsx",
                f,
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            )
        }
        test_client.post("/api/session/upload", files=files, headers=auth_headers)

    # Try to export with path outside allowed directories (use .xlsx extension)
    response = test_client.post(
        "/api/session/export",
        json={"mode": "save_new", "new_path": "/etc/malicious.xlsx"},
        headers=auth_headers,
    )

    assert response.status_code == 200
    data = response.json()
    assert data["success"] is False
    assert "allowed" in data["error"].lower() or "directory" in data["error"].lower()
