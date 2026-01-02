"""Integration tests for organization hierarchy API endpoints."""

import pytest
from fastapi.testclient import TestClient

pytestmark = [pytest.mark.integration]


@pytest.fixture
def sample_session_with_org_hierarchy(test_client: TestClient) -> dict:
    """Create a sample session with organizational hierarchy for testing."""
    # Generate sample data with default settings (200 employees)
    response = test_client.post(
        "/api/employees/generate-sample",
        json={"size": 200, "seed": 42},
    )
    assert response.status_code == 200
    data = response.json()
    return data


def test_get_managers_when_default_params_then_returns_all_managers(
    test_client: TestClient,
    sample_session_with_org_hierarchy: dict,
) -> None:
    """Test GET /api/org-hierarchy/managers returns all managers with min_team_size=1."""
    response = test_client.get("/api/org-hierarchy/managers")

    assert response.status_code == 200
    data = response.json()
    assert "managers" in data
    assert "total_count" in data
    assert isinstance(data["managers"], list)
    assert data["total_count"] == len(data["managers"])
    assert data["total_count"] > 0  # Should have at least one manager

    # Verify manager structure
    if data["managers"]:
        manager = data["managers"][0]
        assert "employee_id" in manager
        assert "name" in manager
        assert "team_size" in manager
        assert isinstance(manager["employee_id"], int)
        assert isinstance(manager["name"], str)
        assert isinstance(manager["team_size"], int)
        assert manager["team_size"] >= 1  # Manager should have at least 1 report


def test_get_managers_when_min_team_size_10_then_filters_small_teams(
    test_client: TestClient,
    sample_session_with_org_hierarchy: dict,
) -> None:
    """Test min_team_size parameter filters managers by team size."""
    # Get all managers
    response_all = test_client.get("/api/org-hierarchy/managers?min_team_size=1")
    assert response_all.status_code == 200
    all_managers = response_all.json()

    # Get managers with min team size 10
    response_large = test_client.get("/api/org-hierarchy/managers?min_team_size=10")
    assert response_large.status_code == 200
    large_team_managers = response_large.json()

    # Large team managers should be a subset of all managers
    assert large_team_managers["total_count"] <= all_managers["total_count"]

    # All returned managers should have team_size >= 10
    for manager in large_team_managers["managers"]:
        assert manager["team_size"] >= 10


def test_get_managers_when_no_session_then_returns_404(
    test_client: TestClient,
) -> None:
    """Test GET /api/org-hierarchy/managers returns 404 when no session exists."""
    # Create a fresh client with no session
    from ninebox.main import app

    fresh_client = TestClient(app)
    response = fresh_client.get("/api/org-hierarchy/managers")

    assert response.status_code == 404
    data = response.json()
    assert "detail" in data
    assert "No active session" in data["detail"]


def test_get_managers_sorted_by_team_size_descending(
    test_client: TestClient,
    sample_session_with_org_hierarchy: dict,
) -> None:
    """Test managers are sorted by team size (largest first), then by name."""
    response = test_client.get("/api/org-hierarchy/managers")

    assert response.status_code == 200
    data = response.json()
    managers = data["managers"]

    # Verify sorting
    if len(managers) > 1:
        for i in range(len(managers) - 1):
            current = managers[i]
            next_mgr = managers[i + 1]
            # Either current team_size > next, or equal and name sorted
            assert (
                current["team_size"] > next_mgr["team_size"]
                or (
                    current["team_size"] == next_mgr["team_size"]
                    and current["name"] <= next_mgr["name"]
                )
            )


def test_get_all_reports_when_valid_manager_then_returns_team(
    test_client: TestClient,
    sample_session_with_org_hierarchy: dict,
) -> None:
    """Test GET /api/org-hierarchy/reports/{employee_id} returns all reports."""
    # First, get a manager
    managers_response = test_client.get("/api/org-hierarchy/managers?min_team_size=5")
    assert managers_response.status_code == 200
    managers = managers_response.json()["managers"]
    assert len(managers) > 0

    # Get reports for first manager
    manager_id = managers[0]["employee_id"]
    expected_team_size = managers[0]["team_size"]

    response = test_client.get(f"/api/org-hierarchy/reports/{manager_id}")

    assert response.status_code == 200
    data = response.json()
    assert "manager_id" in data
    assert "manager_name" in data
    assert "direct_reports_count" in data
    assert "total_reports_count" in data
    assert "all_reports" in data

    assert data["manager_id"] == manager_id
    assert isinstance(data["manager_name"], str)
    assert data["total_reports_count"] == expected_team_size
    assert len(data["all_reports"]) == expected_team_size
    assert data["direct_reports_count"] <= data["total_reports_count"]

    # Verify report structure
    if data["all_reports"]:
        report = data["all_reports"][0]
        assert "employee_id" in report
        assert "name" in report
        assert "job_title" in report
        assert "job_level" in report
        assert "job_function" in report
        assert "manager" in report


def test_get_all_reports_when_invalid_employee_id_then_returns_404(
    test_client: TestClient,
    sample_session_with_org_hierarchy: dict,
) -> None:
    """Test GET /api/org-hierarchy/reports/{employee_id} returns 404 for invalid ID."""
    # Use an employee ID that doesn't exist
    invalid_id = 999999
    response = test_client.get(f"/api/org-hierarchy/reports/{invalid_id}")

    assert response.status_code == 404
    data = response.json()
    assert "detail" in data
    assert "not found" in data["detail"].lower()


def test_get_all_reports_when_employee_not_manager_then_returns_empty_list(
    test_client: TestClient,
    sample_session_with_org_hierarchy: dict,
) -> None:
    """Test getting reports for an employee who is not a manager returns empty list."""
    # Get all employees
    employees_response = test_client.get("/api/employees")
    assert employees_response.status_code == 200
    employees = employees_response.json()["employees"]

    # Get managers
    managers_response = test_client.get("/api/org-hierarchy/managers")
    assert managers_response.status_code == 200
    manager_ids = {m["employee_id"] for m in managers_response.json()["managers"]}

    # Find an employee who is not a manager
    non_manager = None
    for emp in employees:
        if emp["employee_id"] not in manager_ids:
            non_manager = emp
            break

    if non_manager:
        response = test_client.get(f"/api/org-hierarchy/reports/{non_manager['employee_id']}")
        assert response.status_code == 200
        data = response.json()
        assert data["total_reports_count"] == 0
        assert len(data["all_reports"]) == 0


def test_get_reporting_chain_when_valid_employee_then_returns_chain(
    test_client: TestClient,
    sample_session_with_org_hierarchy: dict,
) -> None:
    """Test GET /api/org-hierarchy/reporting-chain/{employee_id} returns upward chain."""
    # Get all employees
    employees_response = test_client.get("/api/employees")
    assert employees_response.status_code == 200
    employees = employees_response.json()["employees"]

    # Find an employee with a manager (not CEO)
    employee_with_manager = None
    for emp in employees:
        if emp.get("manager") and emp["manager"] != "None":
            employee_with_manager = emp
            break

    if employee_with_manager:
        employee_id = employee_with_manager["employee_id"]
        response = test_client.get(f"/api/org-hierarchy/reporting-chain/{employee_id}")

        assert response.status_code == 200
        data = response.json()
        assert "employee_id" in data
        assert "employee_name" in data
        assert "reporting_chain" in data

        assert data["employee_id"] == employee_id
        assert isinstance(data["reporting_chain"], list)

        # Verify chain structure
        if data["reporting_chain"]:
            manager = data["reporting_chain"][0]
            assert "employee_id" in manager
            assert "name" in manager
            assert "team_size" in manager


def test_get_reporting_chain_when_ceo_then_returns_empty_chain(
    test_client: TestClient,
    sample_session_with_org_hierarchy: dict,
) -> None:
    """Test CEO (no manager) has empty reporting chain."""
    # Get all employees
    employees_response = test_client.get("/api/employees")
    assert employees_response.status_code == 200
    employees = employees_response.json()["employees"]

    # Find CEO (employee with no manager or manager="None")
    ceo = None
    for emp in employees:
        if not emp.get("manager") or emp["manager"] == "None":
            ceo = emp
            break

    if ceo:
        response = test_client.get(f"/api/org-hierarchy/reporting-chain/{ceo['employee_id']}")
        assert response.status_code == 200
        data = response.json()
        assert data["reporting_chain"] == []


def test_get_reporting_chain_when_invalid_employee_id_then_returns_404(
    test_client: TestClient,
    sample_session_with_org_hierarchy: dict,
) -> None:
    """Test GET /api/org-hierarchy/reporting-chain/{employee_id} returns 404 for invalid ID."""
    invalid_id = 999999
    response = test_client.get(f"/api/org-hierarchy/reporting-chain/{invalid_id}")

    assert response.status_code == 404
    data = response.json()
    assert "detail" in data
    assert "not found" in data["detail"].lower()


def test_org_hierarchy_endpoints_consistency(
    test_client: TestClient,
    sample_session_with_org_hierarchy: dict,
) -> None:
    """Test consistency between different org hierarchy endpoints."""
    # Get managers
    managers_response = test_client.get("/api/org-hierarchy/managers?min_team_size=5")
    assert managers_response.status_code == 200
    managers = managers_response.json()["managers"]
    assert len(managers) > 0

    manager = managers[0]
    manager_id = manager["employee_id"]
    expected_team_size = manager["team_size"]

    # Get reports for this manager
    reports_response = test_client.get(f"/api/org-hierarchy/reports/{manager_id}")
    assert reports_response.status_code == 200
    reports_data = reports_response.json()

    # Team size from managers endpoint should match total_reports_count
    assert reports_data["total_reports_count"] == expected_team_size

    # If manager has direct reports, verify one of them has this manager in their chain
    if reports_data["direct_reports_count"] > 0:
        direct_report_id = reports_data["all_reports"][0]["employee_id"]
        chain_response = test_client.get(f"/api/org-hierarchy/reporting-chain/{direct_report_id}")
        assert chain_response.status_code == 200
        chain_data = chain_response.json()

        # Manager should be in the reporting chain
        manager_ids_in_chain = [m["employee_id"] for m in chain_data["reporting_chain"]]
        assert manager_id in manager_ids_in_chain


def test_managers_endpoint_handles_large_teams(
    test_client: TestClient,
) -> None:
    """Test managers endpoint with large dataset (300 employees)."""
    # Generate larger dataset (max is typically 300-400 for sample data)
    response = test_client.post(
        "/api/employees/generate-sample",
        json={"size": 300, "seed": 123},
    )
    assert response.status_code == 200

    # Get managers
    managers_response = test_client.get("/api/org-hierarchy/managers")
    assert managers_response.status_code == 200
    data = managers_response.json()

    assert data["total_count"] > 0
    # With 300 employees, we should have multiple managers
    assert data["total_count"] > 10  # Reasonable assumption for org structure


def test_org_hierarchy_api_performance(
    test_client: TestClient,
    sample_session_with_org_hierarchy: dict,
) -> None:
    """Test org hierarchy API endpoints complete in reasonable time."""
    import time

    # Test managers endpoint performance
    start = time.time()
    response = test_client.get("/api/org-hierarchy/managers")
    duration = time.time() - start

    assert response.status_code == 200
    assert duration < 2.0  # Should complete in under 2 seconds for 200 employees

    # Test reports endpoint performance
    managers = response.json()["managers"]
    if managers:
        manager_id = managers[0]["employee_id"]

        start = time.time()
        response = test_client.get(f"/api/org-hierarchy/reports/{manager_id}")
        duration = time.time() - start

        assert response.status_code == 200
        assert duration < 1.0  # Should complete in under 1 second
