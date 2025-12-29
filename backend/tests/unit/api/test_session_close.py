"""Tests for session close endpoint."""

from pathlib import Path

import pytest
from fastapi.testclient import TestClient

pytestmark = pytest.mark.unit


def test_close_session_when_active_then_clears_state(
    test_client: TestClient, sample_excel_file: Path
) -> None:
    """Test closing an active session clears the session state."""
    # Arrange - Create a session first by uploading a file
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

    # Verify session exists
    status_response = test_client.get("/api/session/status")
    assert status_response.status_code == 200
    assert status_response.json()["active"] is True

    # Act - Close the session
    close_response = test_client.post("/api/session/close")

    # Assert - Session is closed
    assert close_response.status_code == 200
    data = close_response.json()
    assert data["success"] is True
    assert "closed" in data["message"].lower()

    # Verify session no longer exists
    status_response = test_client.get("/api/session/status")
    assert status_response.status_code == 200
    assert status_response.json()["active"] is False


def test_close_session_when_no_session_then_returns_error(test_client: TestClient) -> None:
    """Test closing when no session exists returns an error."""
    # Arrange - Ensure no session exists
    test_client.delete("/api/session/clear")

    # Act - Try to close non-existent session
    response = test_client.post("/api/session/close")

    # Assert - Returns error
    assert response.status_code == 200  # Should not raise HTTP error
    data = response.json()
    assert data["success"] is False
    assert "error" in data


def test_close_session_when_success_then_returns_success_response(
    test_client: TestClient, sample_excel_file: Path
) -> None:
    """Test successful close returns proper success response structure."""
    # Arrange - Create a session
    with sample_excel_file.open("rb") as f:
        test_client.post(
            "/api/session/upload",
            files={
                "file": (
                    "test.xlsx",
                    f,
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                )
            },
        )

    # Act - Close session
    response = test_client.post("/api/session/close")

    # Assert - Response has expected structure
    assert response.status_code == 200
    data = response.json()
    assert "success" in data
    assert "message" in data
    assert data["success"] is True
    assert isinstance(data["message"], str)
    assert len(data["message"]) > 0
