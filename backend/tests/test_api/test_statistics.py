"""Tests for statistics API endpoints."""

from pathlib import Path

import pytest
from fastapi.testclient import TestClient


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


def test_get_statistics_when_session_exists_then_returns_distribution(
    test_client: TestClient, session_with_data: dict[str, str]
) -> None:
    """Test GET /api/statistics returns distribution with 200."""
    response = test_client.get("/api/statistics", headers=session_with_data)

    assert response.status_code == 200
    data = response.json()

    assert "total_employees" in data
    assert "modified_employees" in data
    assert "high_performers" in data
    assert "distribution" in data
    assert "by_performance" in data
    assert "by_potential" in data

    assert data["total_employees"] == 5
    assert len(data["distribution"]) == 9
    assert isinstance(data["distribution"], list)


def test_get_statistics_when_called_then_distribution_has_all_boxes(
    test_client: TestClient, session_with_data: dict[str, str]
) -> None:
    """Test that statistics includes all 9 boxes."""
    response = test_client.get("/api/statistics", headers=session_with_data)

    assert response.status_code == 200
    data = response.json()

    # Check all boxes 1-9 present
    positions = {item["grid_position"] for item in data["distribution"]}
    assert positions == set(range(1, 10))

    # Check each item has required fields
    for item in data["distribution"]:
        assert "grid_position" in item
        assert "position_label" in item
        assert "count" in item
        assert "percentage" in item


def test_get_statistics_when_with_filters_then_applies_filters(
    test_client: TestClient, session_with_data: dict[str, str]
) -> None:
    """Test GET /api/statistics with filters applied."""
    response = test_client.get("/api/statistics?levels=MT4", headers=session_with_data)

    assert response.status_code == 200
    data = response.json()

    # Should only count MT4 employees (2 in sample data)
    assert data["total_employees"] == 2


def test_get_statistics_when_counts_then_matches_employee_data(
    test_client: TestClient, session_with_data: dict[str, str]
) -> None:
    """Test that statistics match employee data."""
    # Get employees
    emp_response = test_client.get("/api/employees", headers=session_with_data)
    employees = emp_response.json()["employees"]

    # Get statistics
    stats_response = test_client.get("/api/statistics", headers=session_with_data)
    stats = stats_response.json()

    # Total count should match
    assert stats["total_employees"] == len(employees)

    # Count employees by grid position manually
    position_counts = {}
    for emp in employees:
        pos = emp["grid_position"]
        position_counts[pos] = position_counts.get(pos, 0) + 1

    # Compare with statistics (convert array to dict for easier comparison)
    dist = {item["grid_position"]: item for item in stats["distribution"]}
    for pos, count in position_counts.items():
        assert dist[pos]["count"] == count


def test_get_statistics_when_no_session_then_returns_404(
    test_client: TestClient, auth_headers: dict[str, str]
) -> None:
    """Test GET /api/statistics with no session returns 404."""
    response = test_client.get("/api/statistics", headers=auth_headers)

    assert response.status_code == 404
    assert "No active session" in response.json()["detail"]


def test_get_statistics_when_by_performance_then_aggregates_correctly(
    test_client: TestClient, session_with_data: dict[str, str]
) -> None:
    """Test that by_performance aggregation is correct."""
    response = test_client.get("/api/statistics", headers=session_with_data)

    assert response.status_code == 200
    data = response.json()

    by_perf = data["by_performance"]
    assert "High" in by_perf
    assert "Medium" in by_perf
    assert "Low" in by_perf

    # From sample data: 2 High, 2 Medium, 1 Low
    assert by_perf["High"] == 2
    assert by_perf["Medium"] == 2
    assert by_perf["Low"] == 1


def test_get_statistics_when_by_potential_then_aggregates_correctly(
    test_client: TestClient, session_with_data: dict[str, str]
) -> None:
    """Test that by_potential aggregation is correct."""
    response = test_client.get("/api/statistics", headers=session_with_data)

    assert response.status_code == 200
    data = response.json()

    by_pot = data["by_potential"]
    assert "High" in by_pot
    assert "Medium" in by_pot
    assert "Low" in by_pot

    # From sample data: 3 High, 2 Medium, 0 Low
    assert by_pot["High"] == 3
    assert by_pot["Medium"] == 2
    assert by_pot["Low"] == 0


def test_get_statistics_when_employees_modified_then_tracks_count(
    test_client: TestClient, session_with_data: dict[str, str]
) -> None:
    """Test that modified count is tracked after employee moves."""
    # Move an employee
    move_data = {"performance": "Low", "potential": "Low"}
    test_client.patch("/api/employees/1/move", json=move_data, headers=session_with_data)

    # Get statistics
    response = test_client.get("/api/statistics", headers=session_with_data)

    assert response.status_code == 200
    data = response.json()

    assert data["modified_employees"] == 1


def test_get_statistics_when_multiple_filters_then_applies_all(
    test_client: TestClient, session_with_data: dict[str, str]
) -> None:
    """Test statistics with multiple filters."""
    response = test_client.get(
        "/api/statistics?levels=MT4,MT5&performance=High", headers=session_with_data
    )

    assert response.status_code == 200
    data = response.json()

    # Should count only MT4/MT5 with High performance (2 employees)
    assert data["total_employees"] == 2


def test_get_statistics_when_exclude_ids_then_excludes_from_count(
    test_client: TestClient, session_with_data: dict[str, str]
) -> None:
    """Test statistics with exclude_ids filter."""
    response = test_client.get("/api/statistics?exclude_ids=1,2", headers=session_with_data)

    assert response.status_code == 200
    data = response.json()

    # Should exclude 2 employees
    assert data["total_employees"] == 3


def test_get_statistics_when_percentages_then_sum_to_100(
    test_client: TestClient, session_with_data: dict[str, str]
) -> None:
    """Test that percentages sum to 100%."""
    response = test_client.get("/api/statistics", headers=session_with_data)

    assert response.status_code == 200
    data = response.json()

    total_percentage = sum(item["percentage"] for item in data["distribution"])

    # Allow for small rounding errors
    assert abs(total_percentage - 100.0) < 0.1


def test_get_statistics_when_invalid_exclude_ids_then_returns_400(
    test_client: TestClient, session_with_data: dict[str, str]
) -> None:
    """Test that invalid exclude_ids returns 400 (not 500)."""
    response = test_client.get(
        "/api/statistics?exclude_ids=1,invalid,3", headers=session_with_data
    )

    assert response.status_code == 400
    data = response.json()
    assert "Invalid employee ID" in data["detail"]
    assert "must be comma-separated integers" in data["detail"]


# NOTE: test_get_statistics_when_no_auth_then_returns_401 removed
# This app is local-only without authentication
