"""Integration tests for Session → Employees → Statistics workflow.

Tests the complete data flow from session creation through statistics generation.
Integration points tested:
- Session creation → Employee storage → Statistics aggregation
- Filter application → Employee queries → Statistics updates
- Grid movements → Employee updates → Statistics recalculation
"""

import pytest
from fastapi.testclient import TestClient

pytestmark = pytest.mark.integration


class TestSessionToStatisticsFlow:
    """Test session creation flows directly to statistics generation."""

    def test_generate_sample_then_get_statistics_when_valid_data_then_returns_aggregated_stats(
        self, test_client: TestClient
    ) -> None:
        """Test full workflow: generate sample → session created → statistics available."""
        # Generate sample data (creates session automatically)
        response = test_client.post(
            "/api/employees/generate-sample",
            json={"size": 50, "include_bias": False, "seed": 42},
        )
        assert response.status_code == 200
        data = response.json()
        assert len(data["employees"]) == 50
        assert data["session_id"]

        # Get statistics (uses same session)
        stats_response = test_client.get("/api/statistics")
        assert stats_response.status_code == 200
        stats = stats_response.json()
        assert stats["total_employees"] == 50
        assert "by_performance" in stats
        assert "by_potential" in stats

    def test_generate_sample_then_get_employees_when_session_created_then_data_persists(
        self, test_client: TestClient
    ) -> None:
        """Test session persistence: generate → query employees → data still there."""
        # Generate sample data
        response = test_client.post(
            "/api/employees/generate-sample",
            json={"size": 50, "include_bias": False, "seed": 42},
        )
        assert response.status_code == 200

        # Query employees
        emp_response = test_client.get("/api/employees")
        assert emp_response.status_code == 200
        emp_data = emp_response.json()
        assert len(emp_data["employees"]) == 50
        assert emp_data["total"] == 50

    def test_session_created_when_get_status_then_shows_correct_employee_count(
        self, test_client: TestClient, session_with_employees: dict[str, str]
    ) -> None:
        """Test session status reflects employee count correctly."""
        # Session already created via fixture
        response = test_client.get("/api/session/status", headers=session_with_employees)
        assert response.status_code == 200
        status = response.json()
        assert status["active"] is True
        assert status["employee_count"] == 50


class TestFilteredStatisticsFlow:
    """Test filtered employee queries flow to filtered statistics."""

    def test_filter_employees_then_statistics_when_same_filter_then_counts_match(
        self, test_client: TestClient, session_with_employees: dict[str, str]
    ) -> None:
        """Test filtered employee count matches filtered statistics count."""
        # Filter employees by performance
        emp_response = test_client.get(
            "/api/employees?performance=High", headers=session_with_employees
        )
        assert emp_response.status_code == 200
        emp_data = emp_response.json()
        filtered_count = emp_data["filtered"]

        # Get statistics with same filter
        stats_response = test_client.get(
            "/api/statistics?performance=High", headers=session_with_employees
        )
        assert stats_response.status_code == 200
        stats = stats_response.json()
        assert stats["total_employees"] == filtered_count

    def test_filter_by_multiple_criteria_then_statistics_when_combined_then_reflects_intersection(
        self, test_client: TestClient, session_with_employees: dict[str, str]
    ) -> None:
        """Test multiple filters combine correctly across employees and statistics."""
        # Apply multiple filters (performance + potential)
        filter_params = "performance=High&potential=High"
        emp_response = test_client.get(
            f"/api/employees?{filter_params}", headers=session_with_employees
        )
        assert emp_response.status_code == 200
        emp_count = emp_response.json()["filtered"]

        # Statistics with same filters
        stats_response = test_client.get(
            f"/api/statistics?{filter_params}", headers=session_with_employees
        )
        assert stats_response.status_code == 200
        stats = stats_response.json()

        # Counts should match
        assert stats["total_employees"] == emp_count
        # Verify distribution includes position 9 (High/High)
        position_9 = next((d for d in stats["distribution"] if d["grid_position"] == 9), None)
        assert position_9 is not None

    def test_exclude_employees_then_statistics_when_excluded_then_not_counted(
        self, test_client: TestClient, session_with_employees: dict[str, str]
    ) -> None:
        """Test excluded employees don't appear in statistics."""
        # Get all employees first
        all_response = test_client.get("/api/employees", headers=session_with_employees)
        total_count = all_response.json()["total"]

        # Exclude first 5 employees
        exclude_ids = "1,2,3,4,5"
        stats_response = test_client.get(
            f"/api/statistics?exclude_ids={exclude_ids}", headers=session_with_employees
        )
        assert stats_response.status_code == 200
        stats = stats_response.json()
        assert stats["total_employees"] == total_count - 5


class TestEmployeeMovementStatisticsFlow:
    """Test employee grid movements flow to statistics updates."""

    def test_move_employee_then_statistics_when_performance_changes_then_distribution_updates(
        self, test_client: TestClient, session_with_employees: dict[str, str]
    ) -> None:
        """Test moving employee updates performance distribution in statistics."""
        # Get initial statistics
        initial_response = test_client.get("/api/statistics", headers=session_with_employees)
        initial_stats = initial_response.json()
        initial_high = initial_stats["by_performance"].get("High", 0)

        # Get an employee not in High performance
        emp_response = test_client.get("/api/employees", headers=session_with_employees)
        employees = emp_response.json()["employees"]
        target_emp = next((e for e in employees if e["performance"] != "High"), None)
        assert target_emp is not None

        # Move to High performance
        move_response = test_client.patch(
            f"/api/employees/{target_emp['employee_id']}/move",
            json={"performance": "High", "potential": target_emp["potential"]},
            headers=session_with_employees,
        )
        assert move_response.status_code == 200

        # Get updated statistics
        updated_response = test_client.get("/api/statistics", headers=session_with_employees)
        updated_stats = updated_response.json()
        updated_high = updated_stats["by_performance"].get("High", 0)

        # High count should have increased
        assert updated_high == initial_high + 1

    def test_move_multiple_employees_then_statistics_when_grid_positions_change_then_distribution_updates(
        self, test_client: TestClient, session_with_employees: dict[str, str]
    ) -> None:
        """Test moving multiple employees updates grid position distribution."""
        # Get initial statistics
        initial_response = test_client.get("/api/statistics", headers=session_with_employees)
        initial_stats = initial_response.json()
        # Get position 5 count from distribution array
        pos5_data = next((d for d in initial_stats["distribution"] if d["grid_position"] == 5), None)
        initial_pos5 = pos5_data["count"] if pos5_data else 0

        # Get employees
        emp_response = test_client.get("/api/employees", headers=session_with_employees)
        employees = emp_response.json()["employees"][:3]  # Move first 3

        # Move all to position 5 (Medium/Medium)
        for emp in employees:
            test_client.patch(
                f"/api/employees/{emp['employee_id']}/move",
                json={"performance": "Medium", "potential": "Medium"},
                headers=session_with_employees,
            )

        # Get updated statistics
        updated_response = test_client.get("/api/statistics", headers=session_with_employees)
        updated_stats = updated_response.json()
        # Get position 5 count from distribution array
        pos5_updated = next(
            (d for d in updated_stats["distribution"] if d["grid_position"] == 5), None
        )
        updated_pos5 = pos5_updated["count"] if pos5_updated else 0

        # Position 5 count should be at least 3 more (may already have some)
        assert updated_pos5 >= initial_pos5 + 3

    def test_move_employee_then_session_status_when_tracked_then_changes_count_increments(
        self, test_client: TestClient, session_with_employees: dict[str, str]
    ) -> None:
        """Test employee movement increments changes count in session status."""
        # Get initial status
        initial_status = test_client.get("/api/session/status", headers=session_with_employees)
        initial_changes = initial_status.json()["changes_count"]

        # Move an employee
        emp_response = test_client.get("/api/employees", headers=session_with_employees)
        first_emp = emp_response.json()["employees"][0]
        test_client.patch(
            f"/api/employees/{first_emp['employee_id']}/move",
            json={"performance": "High", "potential": "Low"},
            headers=session_with_employees,
        )

        # Get updated status
        updated_status = test_client.get("/api/session/status", headers=session_with_employees)
        updated_changes = updated_status.json()["changes_count"]

        # Changes count should increment
        assert updated_changes == initial_changes + 1


class TestStatisticsConsistencyFlow:
    """Test statistics remain consistent across different query methods."""

    def test_statistics_by_performance_when_summed_then_equals_total_employees(
        self, test_client: TestClient, session_with_employees: dict[str, str]
    ) -> None:
        """Test performance distribution sums to total employee count."""
        response = test_client.get("/api/statistics", headers=session_with_employees)
        assert response.status_code == 200
        stats = response.json()

        # Sum all performance levels
        total_by_performance = sum(stats["by_performance"].values())
        assert total_by_performance == stats["total_employees"]

    def test_statistics_by_potential_when_summed_then_equals_total_employees(
        self, test_client: TestClient, session_with_employees: dict[str, str]
    ) -> None:
        """Test potential distribution sums to total employee count."""
        response = test_client.get("/api/statistics", headers=session_with_employees)
        assert response.status_code == 200
        stats = response.json()

        # Sum all potential levels
        total_by_potential = sum(stats["by_potential"].values())
        assert total_by_potential == stats["total_employees"]

    def test_statistics_by_grid_position_when_summed_then_equals_total_employees(
        self, test_client: TestClient, session_with_employees: dict[str, str]
    ) -> None:
        """Test grid position distribution sums to total employee count."""
        response = test_client.get("/api/statistics", headers=session_with_employees)
        assert response.status_code == 200
        stats = response.json()

        # Sum all grid positions from distribution array
        total_by_grid = sum(d["count"] for d in stats["distribution"])
        assert total_by_grid == stats["total_employees"]
