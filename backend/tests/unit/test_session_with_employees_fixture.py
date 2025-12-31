"""Test the session_with_employees fixture.

This test verifies that the session_with_employees fixture correctly creates
a session with employee data without requiring file upload.
"""

import pytest
from fastapi.testclient import TestClient

pytestmark = pytest.mark.unit


def test_fixture_when_used_then_creates_session(
    test_client: TestClient, session_with_employees: dict[str, str]
) -> None:
    """Test that session_with_employees fixture creates a valid session."""
    # Headers should be a dict (may be empty for local-only app)
    assert isinstance(session_with_employees, dict)


def test_fixture_when_used_then_employees_accessible(
    test_client: TestClient, session_with_employees: dict[str, str]
) -> None:
    """Test that employees are accessible via API after fixture creates session."""
    # Try to fetch employees using the session headers
    response = test_client.get("/api/employees", headers=session_with_employees)

    # Should return 200 with 50 employees (from generate-sample call with size=50)
    assert response.status_code == 200
    data = response.json()
    assert "employees" in data
    assert "total" in data
    assert len(data["employees"]) == 50
    assert data["total"] == 50

    # Verify employee structure
    assert all("employee_id" in emp for emp in data["employees"])
    assert all("name" in emp for emp in data["employees"])


def test_fixture_when_used_then_session_persists(
    test_client: TestClient, session_with_employees: dict[str, str]
) -> None:
    """Test that session persists across multiple API calls."""
    # First call
    response1 = test_client.get("/api/employees", headers=session_with_employees)
    assert response1.status_code == 200
    count1 = len(response1.json()["employees"])

    # Second call should get same data (session persists)
    response2 = test_client.get("/api/employees", headers=session_with_employees)
    assert response2.status_code == 200
    count2 = len(response2.json()["employees"])

    assert count1 == count2 == 50
