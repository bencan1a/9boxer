"""Tests for export endpoint error handling."""

from pathlib import Path
from unittest.mock import patch

import pytest
from fastapi.testclient import TestClient

pytestmark = pytest.mark.unit


def _create_session(test_client: TestClient, sample_excel_file: Path) -> None:
    """Helper to create a session for testing."""
    with sample_excel_file.open("rb") as f:
        response = test_client.post(
            "/api/session/upload",
            files={
                "file": (
                    "test.xlsx",
                    f,
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                )
            },
        )
    assert response.status_code == 200


def test_export_when_original_file_missing_then_returns_fallback_error(
    test_client: TestClient, sample_excel_file: Path
) -> None:
    """Test export when original file is missing returns fallback error."""
    # Arrange - Create session
    _create_session(test_client, sample_excel_file)

    # Mock the export to raise FileNotFoundError
    with patch("ninebox.services.excel_exporter.ExcelExporter.export") as mock_export:
        mock_export.side_effect = FileNotFoundError("Original file not found")

        # Act - Try to export
        response = test_client.post("/api/session/export", json={"mode": "update_original"})

        # Assert - Returns fallback error (not HTTP 500)
        assert response.status_code == 200  # Should return success=False, not HTTP error
        data = response.json()
        assert data["success"] is False
        assert "error" in data
        assert "fallback_to_save_new" in data
        assert data["fallback_to_save_new"] is True


def test_export_when_file_readonly_then_returns_fallback_error(
    test_client: TestClient, sample_excel_file: Path
) -> None:
    """Test export when file is read-only returns fallback error."""
    # Arrange - Create session
    _create_session(test_client, sample_excel_file)

    # Mock the export to raise OSError (read-only)
    with patch("ninebox.services.excel_exporter.ExcelExporter.export") as mock_export:
        mock_export.side_effect = OSError("Read-only file system")

        # Act - Try to export
        response = test_client.post("/api/session/export", json={"mode": "update_original"})

        # Assert - Returns fallback error
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is False
        assert "error" in data
        assert "fallback_to_save_new" in data
        assert data["fallback_to_save_new"] is True
        assert "read-only" in data["error"].lower() or "cannot write" in data["error"].lower()


def test_export_when_permission_denied_then_returns_fallback_error(
    test_client: TestClient, sample_excel_file: Path
) -> None:
    """Test export when permission denied returns fallback error."""
    # Arrange - Create session
    _create_session(test_client, sample_excel_file)

    # Mock the export to raise PermissionError
    with patch("ninebox.services.excel_exporter.ExcelExporter.export") as mock_export:
        mock_export.side_effect = PermissionError("Permission denied")

        # Act - Try to export
        response = test_client.post("/api/session/export", json={"mode": "update_original"})

        # Assert - Returns fallback error
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is False
        assert "error" in data
        assert "fallback_to_save_new" in data
        assert data["fallback_to_save_new"] is True
        assert "permission" in data["error"].lower()


def test_export_error_response_includes_fallback_flag(
    test_client: TestClient, sample_excel_file: Path
) -> None:
    """Test that export error responses include the fallback_to_save_new flag."""
    # Arrange - Create session
    _create_session(test_client, sample_excel_file)

    # Test with different error types
    error_scenarios = [
        (FileNotFoundError("File not found"), True),
        (PermissionError("Permission denied"), True),
        (OSError("File locked"), True),
        (ValueError("Invalid data"), False),  # Non-file errors should not trigger fallback
    ]

    for error, should_fallback in error_scenarios:
        with patch("ninebox.services.excel_exporter.ExcelExporter.export") as mock_export:
            mock_export.side_effect = error

            # Act
            response = test_client.post("/api/session/export", json={"mode": "update_original"})

            # Assert
            assert response.status_code == 200
            data = response.json()
            assert "success" in data
            assert data["success"] is False
            assert "fallback_to_save_new" in data
            assert data["fallback_to_save_new"] == should_fallback


def test_export_when_unexpected_error_then_returns_error_without_fallback(
    test_client: TestClient, sample_excel_file: Path
) -> None:
    """Test export with unexpected error returns error without fallback flag."""
    # Arrange - Create session
    _create_session(test_client, sample_excel_file)

    # Mock unexpected error
    with patch("ninebox.services.excel_exporter.ExcelExporter.export") as mock_export:
        mock_export.side_effect = RuntimeError("Unexpected error")

        # Act
        response = test_client.post("/api/session/export", json={"mode": "update_original"})

        # Assert - Returns error but no fallback
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is False
        assert "error" in data
        assert "fallback_to_save_new" in data
        assert data["fallback_to_save_new"] is False
