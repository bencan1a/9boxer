"""Integration tests for Filter → Intelligence workflow.

Tests the filter pipeline with intelligence analysis.
Integration points tested:
- FilterService → EmployeeService → Session access
- Filter application → Intelligence analysis (on full dataset)
- Complex filter combinations → Statistics → Intelligence insights
- Filter options generation from session data
"""

import pytest
from fastapi.testclient import TestClient

pytestmark = pytest.mark.integration


class TestFilterOptionsFlow:
    """Test filter options are generated correctly from session data."""

    def test_session_created_then_filter_options_when_queried_then_returns_available_values(
        self, test_client: TestClient, session_with_employees: dict[str, str]
    ) -> None:
        """Test filter options reflect actual data in session."""
        response = test_client.get("/api/employees/filter-options", headers=session_with_employees)
        assert response.status_code == 200
        options = response.json()

        # Should have all filter categories
        assert "levels" in options
        assert "job_profiles" in options
        assert "managers" in options
        assert "locations" in options
        assert "job_functions" in options

        # Each should be a list with at least one option
        assert len(options["levels"]) > 0
        assert len(options["managers"]) > 0

    def test_filter_by_level_then_employees_when_applied_then_only_matching_returned(
        self, test_client: TestClient, session_with_employees: dict[str, str]
    ) -> None:
        """Test filtering by level returns only employees with that level."""
        # Get filter options
        options_response = test_client.get(
            "/api/employees/filter-options", headers=session_with_employees
        )
        levels = options_response.json()["levels"]
        assert len(levels) > 0

        # Filter by first level
        first_level = levels[0]
        filter_response = test_client.get(
            f"/api/employees?levels={first_level}", headers=session_with_employees
        )
        assert filter_response.status_code == 200
        filtered_employees = filter_response.json()["employees"]

        # All returned employees should have the filtered level
        for emp in filtered_employees:
            assert emp["job_level"] == first_level


class TestFilterIntelligenceIntegration:
    """Test filters work alongside intelligence analysis."""

    def test_filter_employees_then_intelligence_when_session_active_then_intelligence_available(
        self, test_client: TestClient, session_with_employees: dict[str, str]
    ) -> None:
        """Test intelligence analysis is available regardless of filters.

        Note: Intelligence analyzes the FULL dataset, not filtered subset.
        """
        # Apply filter to employees
        filter_response = test_client.get(
            "/api/employees?performance=High", headers=session_with_employees
        )
        assert filter_response.status_code == 200

        # Get intelligence (analyzes full dataset)
        intel_response = test_client.get("/api/intelligence", headers=session_with_employees)
        assert intel_response.status_code == 200
        intelligence = intel_response.json()

        # Verify intelligence structure
        assert "quality_score" in intelligence
        assert "anomaly_count" in intelligence
        assert "location_analysis" in intelligence
        assert "function_analysis" in intelligence

    def test_session_with_data_when_intelligence_queried_then_returns_analysis(
        self, test_client: TestClient, session_with_employees: dict[str, str]
    ) -> None:
        """Test intelligence analysis succeeds with valid session data."""
        response = test_client.get("/api/intelligence", headers=session_with_employees)
        assert response.status_code == 200
        intelligence = response.json()

        # Quality score should be between 0-100
        assert 0 <= intelligence["quality_score"] <= 100

        # Anomaly count should have all severity levels
        assert "green" in intelligence["anomaly_count"]
        assert "yellow" in intelligence["anomaly_count"]
        assert "red" in intelligence["anomaly_count"]

    def test_intelligence_location_analysis_when_available_then_includes_statistical_data(
        self, test_client: TestClient, session_with_employees: dict[str, str]
    ) -> None:
        """Test location analysis includes chi-square statistics."""
        response = test_client.get("/api/intelligence", headers=session_with_employees)
        assert response.status_code == 200
        intelligence = response.json()

        location_analysis = intelligence["location_analysis"]
        # Should have statistical measures
        assert "chi_square" in location_analysis
        assert "p_value" in location_analysis
        assert "effect_size" in location_analysis
        assert "status" in location_analysis
        assert location_analysis["status"] in ["green", "yellow", "red"]

    def test_intelligence_function_analysis_when_available_then_includes_deviations(
        self, test_client: TestClient, session_with_employees: dict[str, str]
    ) -> None:
        """Test function analysis includes deviation detection."""
        response = test_client.get("/api/intelligence", headers=session_with_employees)
        assert response.status_code == 200
        intelligence = response.json()

        function_analysis = intelligence["function_analysis"]
        # Should have deviations list (may be empty if no significant deviations)
        assert "deviations" in function_analysis
        assert isinstance(function_analysis["deviations"], list)


class TestComplexFilterFlow:
    """Test complex multi-criteria filter combinations."""

    def test_filter_by_performance_and_potential_when_combined_then_intersection_returned(
        self, test_client: TestClient, session_with_employees: dict[str, str]
    ) -> None:
        """Test combining performance and potential filters returns intersection."""
        # Filter by High performance AND High potential
        filter_response = test_client.get(
            "/api/employees?performance=High&potential=High", headers=session_with_employees
        )
        assert filter_response.status_code == 200
        employees = filter_response.json()["employees"]

        # All employees should be High/High
        for emp in employees:
            assert emp["performance"] == "High"
            assert emp["potential"] == "High"

    def test_filter_by_level_and_location_when_combined_then_both_criteria_applied(
        self, test_client: TestClient, session_with_employees: dict[str, str]
    ) -> None:
        """Test combining level and location filters."""
        # Get all employees to identify a valid level + location combination
        all_emp_response = test_client.get("/api/employees", headers=session_with_employees)
        all_employees = all_emp_response.json()["employees"]

        if all_employees:
            # Pick an employee and use their level and location for filtering
            target_emp = all_employees[0]
            target_level = target_emp["job_level"]
            target_location = target_emp["location"]

            # Apply combined filter
            filter_response = test_client.get(
                f"/api/employees?levels={target_level}&locations={target_location}",
                headers=session_with_employees,
            )
            assert filter_response.status_code == 200
            employees = filter_response.json()["employees"]

            # Should have at least the target employee
            assert len(employees) >= 1

            # All returned employees should match both criteria
            for emp in employees:
                assert emp["job_level"] == target_level
                assert emp["location"] == target_location

    def test_filter_multiple_levels_when_comma_separated_then_returns_union(
        self, test_client: TestClient, session_with_employees: dict[str, str]
    ) -> None:
        """Test filtering by multiple levels (comma-separated) returns union."""
        # Get available levels
        options_response = test_client.get(
            "/api/employees/filter-options", headers=session_with_employees
        )
        levels = options_response.json()["levels"]

        if len(levels) >= 2:
            # Filter by first two levels
            levels_param = f"{levels[0]},{levels[1]}"
            filter_response = test_client.get(
                f"/api/employees?levels={levels_param}", headers=session_with_employees
            )
            assert filter_response.status_code == 200
            employees = filter_response.json()["employees"]

            # All employees should have one of the two levels
            for emp in employees:
                assert emp["job_level"] in [levels[0], levels[1]]


class TestFilterStatisticsConsistency:
    """Test filters maintain consistency between employees and statistics."""

    def test_filter_employees_and_statistics_when_same_filter_then_counts_match(
        self, test_client: TestClient, session_with_employees: dict[str, str]
    ) -> None:
        """Test employee count matches statistics count with same filter."""
        # Filter employees by location
        options_response = test_client.get(
            "/api/employees/filter-options", headers=session_with_employees
        )
        locations = options_response.json()["locations"]

        if locations:
            location = locations[0]

            # Get filtered employees
            emp_response = test_client.get(
                f"/api/employees?locations={location}", headers=session_with_employees
            )
            emp_count = emp_response.json()["filtered"]

            # Get filtered statistics
            stats_response = test_client.get(
                f"/api/statistics?locations={location}", headers=session_with_employees
            )
            stats_count = stats_response.json()["total_employees"]

            # Counts should match
            assert emp_count == stats_count

    def test_exclude_employees_when_applied_then_statistics_and_employees_consistent(
        self, test_client: TestClient, session_with_employees: dict[str, str]
    ) -> None:
        """Test exclusion filter maintains consistency between endpoints."""
        # Get total count
        all_response = test_client.get("/api/employees", headers=session_with_employees)
        total_count = all_response.json()["total"]

        # Exclude specific employees
        exclude_ids = "1,2,3"
        emp_response = test_client.get(
            f"/api/employees?exclude_ids={exclude_ids}", headers=session_with_employees
        )
        emp_count = emp_response.json()["filtered"]

        # Get statistics with same exclusion
        stats_response = test_client.get(
            f"/api/statistics?exclude_ids={exclude_ids}", headers=session_with_employees
        )
        stats_count = stats_response.json()["total_employees"]

        # Both should show 3 fewer employees
        assert emp_count == total_count - 3
        assert stats_count == total_count - 3

    def test_filter_by_manager_when_applied_then_hierarchy_respected(
        self, test_client: TestClient, session_with_employees: dict[str, str]
    ) -> None:
        """Test manager filter returns employees reporting to that manager."""
        # Get available managers
        options_response = test_client.get(
            "/api/employees/filter-options", headers=session_with_employees
        )
        managers = options_response.json()["managers"]

        if managers:
            manager = managers[0]

            # Filter by manager
            filter_response = test_client.get(
                f"/api/employees?managers={manager}", headers=session_with_employees
            )
            assert filter_response.status_code == 200
            employees = filter_response.json()["employees"]

            # All employees should have this manager
            for emp in employees:
                assert emp["direct_manager"] == manager


class TestSessionFilterPersistence:
    """Test filters don't affect underlying session data."""

    def test_apply_filter_then_clear_when_queried_again_then_full_dataset_returned(
        self, test_client: TestClient, session_with_employees: dict[str, str]
    ) -> None:
        """Test filters are request-scoped and don't modify session."""
        # Get total count
        all_response = test_client.get("/api/employees", headers=session_with_employees)
        total_count = all_response.json()["total"]

        # Apply filter
        filter_response = test_client.get(
            "/api/employees?performance=High", headers=session_with_employees
        )
        filtered_count = filter_response.json()["filtered"]
        assert filtered_count < total_count

        # Query again without filter - should return full dataset
        requery_response = test_client.get("/api/employees", headers=session_with_employees)
        requery_count = requery_response.json()["total"]
        assert requery_count == total_count
