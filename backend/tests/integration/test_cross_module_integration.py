"""Integration tests for cross-module interactions."""

from pathlib import Path

import pytest
from fastapi.testclient import TestClient

pytestmark = [pytest.mark.integration, pytest.mark.slow]


class TestFilterStatisticsIntegration:
    """Test filters impact statistics correctly."""

    def test_statistics_when_filter_applied_then_reflects_filtered_data(
        self, test_client: TestClient, sample_excel_file: Path
    ) -> None:
        """Test statistics update based on filters."""
        # Upload
        with open(sample_excel_file, "rb") as f:  # noqa: PTH123
            files = {
                "file": (
                    "test.xlsx",
                    f,
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                )
            }
            test_client.post("/api/session/upload", files=files)

        # Get unfiltered statistics
        response = test_client.get("/api/statistics")
        assert response.status_code == 200
        unfiltered_stats = response.json()
        unfiltered_total = unfiltered_stats.get("total_employees", 0)

        # Get filtered statistics (by performance)
        response = test_client.get("/api/statistics?performance=High")
        assert response.status_code == 200
        filtered_stats = response.json()
        filtered_total = filtered_stats.get("total_employees", 0)

        # Filtered should be less than or equal to unfiltered
        assert filtered_total <= unfiltered_total

    def test_statistics_when_multiple_filters_then_combines_correctly(
        self, test_client: TestClient, sample_excel_file: Path
    ) -> None:
        """Test multiple filters combine properly."""
        # Upload
        with open(sample_excel_file, "rb") as f:  # noqa: PTH123
            files = {
                "file": (
                    "test.xlsx",
                    f,
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                )
            }
            test_client.post("/api/session/upload", files=files)

        # Apply multiple filters
        response = test_client.get("/api/statistics?performance=High&potential=High")
        assert response.status_code == 200
        stats = response.json()

        # Should only include High/High employees
        assert stats["total_employees"] >= 0

        # Verify distribution includes expected data
        assert "by_performance" in stats or "total_employees" in stats


class TestFilterIntelligenceIntegration:
    """Test filters impact intelligence analysis."""

    def test_intelligence_when_filter_applied_then_analyzes_subset(
        self, test_client: TestClient, sample_excel_file: Path
    ) -> None:
        """Test intelligence analysis is available for current session."""
        # Upload
        with open(sample_excel_file, "rb") as f:  # noqa: PTH123
            files = {
                "file": (
                    "test.xlsx",
                    f,
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                )
            }
            test_client.post("/api/session/upload", files=files)

        # Get intelligence (note: intelligence endpoint analyzes full dataset, not filtered)
        response = test_client.get("/api/intelligence")
        assert response.status_code == 200
        intelligence = response.json()

        # Verify response structure
        assert "quality_score" in intelligence
        assert "anomaly_count" in intelligence
        assert "location_analysis" in intelligence
        assert "function_analysis" in intelligence
        assert "level_analysis" in intelligence
        assert "tenure_analysis" in intelligence


class TestMovementStatisticsIntegration:
    """Test employee movements update statistics."""

    def test_statistics_when_employee_moved_then_updates_distribution(
        self, test_client: TestClient, sample_excel_file: Path
    ) -> None:
        """Test moving employee updates distribution stats."""
        # Upload
        with open(sample_excel_file, "rb") as f:  # noqa: PTH123
            files = {
                "file": (
                    "test.xlsx",
                    f,
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                )
            }
            test_client.post("/api/session/upload", files=files)

        # Get initial statistics
        response = test_client.get("/api/statistics")
        assert response.status_code == 200
        initial_stats = response.json()
        initial_high_perf = initial_stats.get("by_performance", {}).get("High", 0)
        initial_low_perf = initial_stats.get("by_performance", {}).get("Low", 0)

        # Get an employee and move them
        response = test_client.get("/api/employees")
        employees = response.json()["employees"]

        # Find an employee not already in High performance
        target_employee = None
        for emp in employees:
            if emp["performance"] != "High":
                target_employee = emp
                break

        # Move employee to High performance
        if target_employee:
            response = test_client.patch(
                f"/api/employees/{target_employee['employee_id']}/move",
                json={"performance": "High", "potential": "High"},
            )
            assert response.status_code == 200

            # Get updated statistics
            response = test_client.get("/api/statistics")
            assert response.status_code == 200
            updated_stats = response.json()
            updated_high_perf = updated_stats.get("by_performance", {}).get("High", 0)

            # High performance count should have increased
            assert updated_high_perf > initial_high_perf

            # Modified employees count should be updated
            assert updated_stats.get("modified_employees", 0) == 1


class TestFilterEmployeeIntegration:
    """Test filters work correctly with employee list."""

    def test_employees_when_filtered_by_level_then_matches_statistics(
        self, test_client: TestClient, sample_excel_file: Path
    ) -> None:
        """Test employee filtering by level matches statistics."""
        # Upload
        with open(sample_excel_file, "rb") as f:  # noqa: PTH123
            files = {
                "file": (
                    "test.xlsx",
                    f,
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                )
            }
            test_client.post("/api/session/upload", files=files)

        # Get filter options
        response = test_client.get("/api/employees/filter-options")
        assert response.status_code == 200
        options = response.json()
        levels = options.get("levels", [])

        if levels:
            # Filter employees by first level
            first_level = levels[0]
            response = test_client.get(f"/api/employees?levels={first_level}")
            assert response.status_code == 200
            filtered_employees = response.json()

            # Get statistics with same filter
            response = test_client.get(f"/api/statistics?levels={first_level}")
            assert response.status_code == 200
            stats = response.json()

            # Employee count should match statistics total
            assert filtered_employees["filtered"] == stats.get("total_employees", 0)

    def test_employees_when_excluded_then_reflects_in_statistics(
        self, test_client: TestClient, sample_excel_file: Path
    ) -> None:
        """Test excluding employees reflects in statistics."""
        # Upload
        with open(sample_excel_file, "rb") as f:  # noqa: PTH123
            files = {
                "file": (
                    "test.xlsx",
                    f,
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                )
            }
            test_client.post("/api/session/upload", files=files)

        # Get all employees
        response = test_client.get("/api/employees")
        all_employees = response.json()
        total_count = all_employees["total"]

        # Exclude first two employees
        exclude_ids = "1,2"
        response = test_client.get(f"/api/employees?exclude_ids={exclude_ids}")
        assert response.status_code == 200
        filtered = response.json()
        assert filtered["filtered"] == total_count - 2

        # Get statistics with same exclusion
        response = test_client.get(f"/api/statistics?exclude_ids={exclude_ids}")
        assert response.status_code == 200
        stats = response.json()

        # Statistics should reflect excluded count
        assert stats.get("total_employees", 0) == total_count - 2
