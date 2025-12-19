"""Tests for employees API endpoints."""

from pathlib import Path

import pytest
from fastapi.testclient import TestClient

pytestmark = pytest.mark.unit


@pytest.fixture
def session_with_data(
    test_client: TestClient, auth_headers: dict[str, str], sample_excel_file: Path
) -> dict[str, str]:
    """Create a session with uploaded data."""
    with open(sample_excel_file, "rb") as f:  # noqa: PTH123
        files = {
            "file": (
                "test.xlsx",
                f,
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            )
        }
        test_client.post("/api/session/upload", files=files, headers=auth_headers)
    return auth_headers


def test_get_employees_when_session_exists_then_returns_all_employees(
    test_client: TestClient, session_with_data: dict[str, str]
) -> None:
    """Test GET /api/employees returns all employees with 200."""
    response = test_client.get("/api/employees", headers=session_with_data)

    assert response.status_code == 200
    data = response.json()
    assert "employees" in data
    assert "total" in data
    assert "filtered" in data
    assert len(data["employees"]) == 5
    assert data["total"] == 5
    assert data["filtered"] == 5


def test_get_employees_when_filter_by_level_then_filters_correctly(
    test_client: TestClient, session_with_data: dict[str, str]
) -> None:
    """Test GET /api/employees with level filter."""
    response = test_client.get("/api/employees?levels=MT4", headers=session_with_data)

    assert response.status_code == 200
    data = response.json()
    assert data["filtered"] == 2
    assert all(emp["job_level"] == "MT4" for emp in data["employees"])


def test_get_employees_when_filter_by_manager_then_filters_correctly(
    test_client: TestClient, session_with_data: dict[str, str]
) -> None:
    """Test GET /api/employees with manager filter."""
    response = test_client.get("/api/employees?managers=Bob Manager", headers=session_with_data)

    assert response.status_code == 200
    data = response.json()
    assert data["filtered"] == 2
    assert all(emp["manager"] == "Bob Manager" for emp in data["employees"])


def test_get_employees_when_exclude_ids_then_excludes_correctly(
    test_client: TestClient, session_with_data: dict[str, str]
) -> None:
    """Test GET /api/employees with exclude_ids."""
    response = test_client.get("/api/employees?exclude_ids=1,3", headers=session_with_data)

    assert response.status_code == 200
    data = response.json()
    assert data["filtered"] == 3
    assert all(emp["employee_id"] not in [1, 3] for emp in data["employees"])


def test_get_employees_when_no_session_then_returns_404(
    test_client: TestClient, auth_headers: dict[str, str]
) -> None:
    """Test GET /api/employees with no session returns 404."""
    response = test_client.get("/api/employees", headers=auth_headers)

    assert response.status_code == 404
    assert "No active session" in response.json()["detail"]


def test_get_employee_by_id_when_exists_then_returns_employee(
    test_client: TestClient, session_with_data: dict[str, str]
) -> None:
    """Test GET /api/employees/{id} returns single employee with 200."""
    response = test_client.get("/api/employees/1", headers=session_with_data)

    assert response.status_code == 200
    data = response.json()
    assert data["employee_id"] == 1
    assert data["name"] == "Alice Smith"


def test_get_employee_by_id_when_not_exists_then_returns_404(
    test_client: TestClient, session_with_data: dict[str, str]
) -> None:
    """Test GET /api/employees/{id} with invalid ID returns 404."""
    response = test_client.get("/api/employees/999", headers=session_with_data)

    assert response.status_code == 404
    assert "Employee 999 not found" in response.json()["detail"]


def test_move_employee_when_valid_then_updates_position(
    test_client: TestClient, session_with_data: dict[str, str]
) -> None:
    """Test PATCH /api/employees/{id}/move updates position with 200."""
    move_data = {"performance": "Medium", "potential": "Low"}

    response = test_client.patch("/api/employees/1/move", json=move_data, headers=session_with_data)

    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["employee"]["performance"] == "Medium"
    assert data["employee"]["potential"] == "Low"
    assert data["employee"]["modified_in_session"] is True


def test_move_employee_when_invalid_performance_then_returns_400(
    test_client: TestClient, session_with_data: dict[str, str]
) -> None:
    """Test PATCH with invalid performance returns 400."""
    move_data = {"performance": "Invalid", "potential": "Medium"}

    response = test_client.patch("/api/employees/1/move", json=move_data, headers=session_with_data)

    assert response.status_code == 400
    assert "Invalid performance or potential value" in response.json()["detail"]


def test_move_employee_when_invalid_potential_then_returns_400(
    test_client: TestClient, session_with_data: dict[str, str]
) -> None:
    """Test PATCH with invalid potential returns 400."""
    move_data = {"performance": "High", "potential": "Invalid"}

    response = test_client.patch("/api/employees/1/move", json=move_data, headers=session_with_data)

    assert response.status_code == 400
    assert "Invalid performance or potential value" in response.json()["detail"]


def test_move_employee_when_employee_not_exists_then_returns_404(
    test_client: TestClient, session_with_data: dict[str, str]
) -> None:
    """Test PATCH with non-existent employee returns 404."""
    move_data = {"performance": "Medium", "potential": "Medium"}

    response = test_client.patch(
        "/api/employees/999/move", json=move_data, headers=session_with_data
    )

    assert response.status_code == 404


def test_get_filter_options_when_session_exists_then_returns_options(
    test_client: TestClient, session_with_data: dict[str, str]
) -> None:
    """Test GET /api/employees/filter-options returns 200."""
    response = test_client.get("/api/employees/filter-options", headers=session_with_data)

    assert response.status_code == 200
    data = response.json()
    assert "levels" in data
    assert "job_profiles" in data
    assert "managers" in data
    assert "employees" in data

    assert len(data["levels"]) > 0
    assert len(data["managers"]) > 0


def test_get_filter_options_when_no_session_then_returns_404(
    test_client: TestClient, auth_headers: dict[str, str]
) -> None:
    """Test GET /api/employees/filter-options with no session returns 404."""
    response = test_client.get("/api/employees/filter-options", headers=auth_headers)

    assert response.status_code == 404


def test_get_employees_when_multiple_filters_then_applies_all(
    test_client: TestClient, session_with_data: dict[str, str]
) -> None:
    """Test GET /api/employees with multiple filters applies all."""
    response = test_client.get(
        "/api/employees?levels=MT4,MT5&performance=High", headers=session_with_data
    )

    assert response.status_code == 200
    data = response.json()
    # Should match employees that are (MT4 or MT5) AND High performance
    assert data["filtered"] == 2
    for emp in data["employees"]:
        assert emp["job_level"] in ["MT4", "MT5"]
        assert emp["performance"] == "High"


def test_move_employee_when_called_then_tracks_change(
    test_client: TestClient, session_with_data: dict[str, str]
) -> None:
    """Test that moving employee tracks the change."""
    move_data = {"performance": "Low", "potential": "Low"}

    response = test_client.patch("/api/employees/1/move", json=move_data, headers=session_with_data)

    assert response.status_code == 200
    data = response.json()

    # Check change record
    assert "change" in data
    assert data["change"]["employee_id"] == 1
    assert data["change"]["old_performance"] == "High"
    assert data["change"]["old_potential"] == "High"
    assert data["change"]["new_performance"] == "Low"
    assert data["change"]["new_potential"] == "Low"


def test_get_employees_when_invalid_exclude_ids_then_returns_400(
    test_client: TestClient, session_with_data: dict[str, str]
) -> None:
    """Test that invalid exclude_ids returns 400 (not 500)."""
    response = test_client.get(
        "/api/employees?exclude_ids=1,invalid,3", headers=session_with_data
    )

    assert response.status_code == 400
    data = response.json()
    assert "Invalid employee ID" in data["detail"]
    assert "must be comma-separated integers" in data["detail"]


# NOTE: test_get_employees_when_no_auth_then_returns_401 removed
# This app is local-only without authentication


def test_move_employee_when_updates_grid_position_then_position_correct(
    test_client: TestClient, session_with_data: dict[str, str]
) -> None:
    """Test that moving employee updates grid position correctly."""
    # Move to M,M (position 5)
    move_data = {"performance": "Medium", "potential": "Medium"}

    response = test_client.patch("/api/employees/1/move", json=move_data, headers=session_with_data)

    assert response.status_code == 200
    data = response.json()
    assert data["employee"]["grid_position"] == 5
    assert "Core Talent" in data["employee"]["position_label"]
