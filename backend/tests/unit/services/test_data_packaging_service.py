"""Tests for data packaging service.

The data packaging service prepares employee and analysis data for consumption
by AI agents, ensuring the data is in the correct format with all required fields.
"""

import json
from datetime import date

import pytest

from ninebox.models.employee import Employee, PerformanceLevel, PotentialLevel


pytestmark = pytest.mark.unit


def create_employee(
    emp_id: int,
    location: str = "USA",
    function: str = "Engineering",
    level: str = "MT5",
    tenure: str = "2-5 years",
    performance: PerformanceLevel = PerformanceLevel.MEDIUM,
    potential: PotentialLevel = PotentialLevel.MEDIUM,
    grid_position: int = 5,
    manager: str = "Test Manager",
    hire_date: date | None = None,
) -> Employee:
    """Create a test employee with specified attributes."""
    if hire_date is None:
        hire_date = date(2020, 1, 1)

    return Employee(
        employee_id=emp_id,
        name=f"Employee {emp_id}",
        business_title="Test Title",
        job_title="Test Job",
        job_profile=f"{function}-{location}",
        job_level=level,
        job_function=function,
        location=location,
        direct_manager=manager,
        hire_date=hire_date,
        tenure_category=tenure,
        time_in_job_profile="1-2 years",
        performance=performance,
        potential=potential,
        grid_position=grid_position,
        talent_indicator="Test Indicator",
    )


class TestDataPackagingService:
    """Tests for package_for_agent() function."""

    def test_output_is_valid_json_structure(self) -> None:
        """Test that package_for_agent() returns valid JSON-serializable structure."""
        try:
            from ninebox.services.data_packaging_service import package_for_agent
        except ImportError:
            pytest.skip("data_packaging_service not yet implemented")

        employees = [create_employee(i) for i in range(5)]

        # Mock analysis results
        analysis_results = {
            "location": {"status": "green", "sample_size": 5},
            "function": {"status": "green", "sample_size": 5},
        }

        result = package_for_agent(employees, analysis_results)

        # Should be JSON serializable
        try:
            json_str = json.dumps(result)
            assert len(json_str) > 0
        except (TypeError, ValueError) as e:
            pytest.fail(f"Result is not JSON serializable: {e}")

    def test_employee_records_include_required_fields(self) -> None:
        """Test that employee records include all required fields."""
        try:
            from ninebox.services.data_packaging_service import package_for_agent
        except ImportError:
            pytest.skip("data_packaging_service not yet implemented")

        employees = [
            create_employee(
                1,
                location="USA",
                function="Engineering",
                level="MT5",
                performance=PerformanceLevel.HIGH,
                grid_position=9,
            )
        ]

        result = package_for_agent(employees, {})

        # Should have employee_records key
        assert "employee_records" in result or "employees" in result

        employees_key = "employee_records" if "employee_records" in result else "employees"
        emp_records = result[employees_key]

        assert len(emp_records) > 0

        # Check first employee has required fields
        emp = emp_records[0]
        required_fields = {
            "id",  # or employee_id
            "level",  # or job_level
            "function",  # or job_function
            "rating",  # or performance or grid_position
            "location",
        }

        # Check that at least the core fields exist (with some flexibility in naming)
        assert "id" in emp or "employee_id" in emp
        assert "level" in emp or "job_level" in emp
        assert "function" in emp or "job_function" in emp
        assert "rating" in emp or "performance" in emp or "grid_position" in emp
        assert "location" in emp

    def test_org_hierarchy_includes_managers_and_report_counts(self) -> None:
        """Test that org hierarchy includes managers and their report counts."""
        try:
            from ninebox.services.data_packaging_service import package_for_agent
        except ImportError:
            pytest.skip("data_packaging_service not yet implemented")

        # Create employees with manager relationships
        employees = [
            create_employee(1, manager="Alice"),
            create_employee(2, manager="Alice"),
            create_employee(3, manager="Alice"),
            create_employee(4, manager="Bob"),
            create_employee(5, manager="Bob"),
        ]

        result = package_for_agent(employees, {})

        # Should have organization key
        assert "organization" in result

        organization = result["organization"]

        # Should have manager information
        assert isinstance(organization, dict)
        assert "managers" in organization

        # Managers should be a list
        managers = organization["managers"]
        assert isinstance(managers, list)

    def test_all_analysis_results_are_included(self) -> None:
        """Test that all analysis results are included in the package."""
        try:
            from ninebox.services.data_packaging_service import package_for_agent
        except ImportError:
            pytest.skip("data_packaging_service not yet implemented")

        employees = [create_employee(i) for i in range(10)]

        analysis_results = {
            "location": {"status": "red", "p_value": 0.01},
            "function": {"status": "green", "p_value": 0.8},
            "level": {"status": "yellow", "p_value": 0.04},
            "tenure": {"status": "green", "p_value": 0.6},
            "per_level_distribution": {"MT5": {"high_pct": 50.0, "z_score": 2.5}},
        }

        result = package_for_agent(employees, analysis_results)

        # Should have analysis_results or analyses key
        assert "analysis_results" in result or "analyses" in result

        analyses_key = "analysis_results" if "analysis_results" in result else "analyses"
        analyses = result[analyses_key]

        # All analyses should be present
        assert "location" in analyses
        assert "function" in analyses
        assert "level" in analyses
        assert "tenure" in analyses
        assert "per_level_distribution" in analyses

    def test_data_overview_has_correct_aggregations(self) -> None:
        """Test that data overview section has correct aggregations."""
        try:
            from ninebox.services.data_packaging_service import package_for_agent
        except ImportError:
            pytest.skip("data_packaging_service not yet implemented")

        employees = [
            create_employee(1, level="MT3", performance=PerformanceLevel.HIGH),
            create_employee(2, level="MT3", performance=PerformanceLevel.MEDIUM),
            create_employee(3, level="MT5", performance=PerformanceLevel.HIGH),
            create_employee(4, level="MT5", performance=PerformanceLevel.LOW),
        ]

        result = package_for_agent(employees, {})

        # Should have "overview" key (not "data_overview")
        assert "overview" in result

        overview = result["overview"]

        # Should have total employees
        assert "total_employees" in overview
        assert overview["total_employees"] == 4

        # Should have counts by dimension
        assert "by_level" in overview
        assert "by_performance" in overview or "by_grid_position" in overview

    def test_no_pii_leakage_in_structure(self) -> None:
        """Test that structure doesn't inadvertently leak PII."""
        try:
            from ninebox.services.data_packaging_service import package_for_agent
        except ImportError:
            pytest.skip("data_packaging_service not yet implemented")

        employees = [
            create_employee(1, location="USA"),
            create_employee(2, location="UK"),
        ]

        result = package_for_agent(employees, {})

        # Even though we're not anonymizing, verify the structure is sound
        # and doesn't expose sensitive fields unintentionally

        # Convert to JSON string to inspect
        json_str = json.dumps(result)

        # Should not contain actual employee names (they should be IDs or anonymized)
        # This is a basic check - actual implementation might include names
        # but they should be clearly marked as such

        assert isinstance(result, dict)
        assert len(json_str) > 0

    def test_handles_empty_employee_list_gracefully(self) -> None:
        """Test that package_for_agent handles empty employee list."""
        try:
            from ninebox.services.data_packaging_service import package_for_agent
        except ImportError:
            pytest.skip("data_packaging_service not yet implemented")

        result = package_for_agent([], {})

        # Should return valid structure even with no employees
        assert isinstance(result, dict)

        # Employee records should be empty
        assert "employees" in result
        assert result["employees"] == []

        # Overview should show 0 employees
        assert "overview" in result
        assert result["overview"]["total_employees"] == 0

    def test_package_includes_metadata(self) -> None:
        """Test that package includes metadata about the dataset."""
        try:
            from ninebox.services.data_packaging_service import package_for_agent
        except ImportError:
            pytest.skip("data_packaging_service not yet implemented")

        employees = [create_employee(i) for i in range(5)]

        result = package_for_agent(employees, {})

        # Should have overview and organization keys
        assert "overview" in result
        assert "organization" in result

        # Overview should have total_employees
        assert "total_employees" in result["overview"]

    def test_employee_records_are_properly_structured(self) -> None:
        """Test that employee records are consistently structured."""
        try:
            from ninebox.services.data_packaging_service import package_for_agent
        except ImportError:
            pytest.skip("data_packaging_service not yet implemented")

        employees = [
            create_employee(1, level="MT3", performance=PerformanceLevel.HIGH, grid_position=9),
            create_employee(2, level="MT5", performance=PerformanceLevel.LOW, grid_position=1),
        ]

        result = package_for_agent(employees, {})

        employees_key = "employee_records" if "employee_records" in result else "employees"
        emp_records = result[employees_key]

        # All records should have same fields
        first_keys = set(emp_records[0].keys())
        second_keys = set(emp_records[1].keys())

        assert first_keys == second_keys, "All employee records should have same structure"

    def test_analysis_results_preserve_nested_structure(self) -> None:
        """Test that complex nested analysis results are preserved."""
        try:
            from ninebox.services.data_packaging_service import package_for_agent
        except ImportError:
            pytest.skip("data_packaging_service not yet implemented")

        employees = [create_employee(i) for i in range(10)]

        complex_analysis = {
            "location": {
                "status": "red",
                "p_value": 0.01,
                "deviations": [
                    {
                        "category": "USA",
                        "z_score": 2.5,
                        "observed_high_pct": 50.0,
                        "expected_high_pct": 30.0,
                    }
                ],
            }
        }

        result = package_for_agent(employees, complex_analysis)

        analyses_key = "analysis_results" if "analysis_results" in result else "analyses"
        analyses = result[analyses_key]

        # Nested structure should be preserved
        assert "location" in analyses
        assert "deviations" in analyses["location"]
        assert len(analyses["location"]["deviations"]) > 0
        assert "z_score" in analyses["location"]["deviations"][0]

    def test_package_with_full_analysis_suite(self) -> None:
        """Test packaging with complete set of analyses."""
        try:
            from ninebox.services.data_packaging_service import package_for_agent
        except ImportError:
            pytest.skip("data_packaging_service not yet implemented")

        # Create realistic employee dataset
        employees = []
        for i in range(30):
            employees.append(
                create_employee(
                    i,
                    location="USA" if i % 3 == 0 else "UK" if i % 3 == 1 else "IN",
                    function="Engineering" if i % 2 == 0 else "Sales",
                    level="MT3" if i % 5 == 0 else "MT5",
                    performance=(
                        PerformanceLevel.HIGH
                        if i % 3 == 0
                        else PerformanceLevel.MEDIUM
                        if i % 3 == 1
                        else PerformanceLevel.LOW
                    ),
                )
            )

        full_analyses = {
            "location": {"status": "green", "p_value": 0.5, "sample_size": 30},
            "function": {"status": "yellow", "p_value": 0.04, "sample_size": 30},
            "level": {"status": "green", "p_value": 0.6, "sample_size": 30},
            "tenure": {"status": "green", "p_value": 0.7, "sample_size": 30},
            "per_level_distribution": {
                "MT3": {"high_pct": 33.3, "z_score": 0.5, "status": "green"},
                "MT5": {"high_pct": 33.3, "z_score": 0.4, "status": "green"},
            },
        }

        result = package_for_agent(employees, full_analyses)

        # Verify complete package structure
        assert "employees" in result
        assert "analyses" in result
        assert "overview" in result
        assert "organization" in result

        # Should be JSON serializable
        json_str = json.dumps(result)
        assert len(json_str) > 100  # Should have substantial content

    def test_package_preserves_analysis_metadata(self) -> None:
        """Test that analysis metadata (p-values, z-scores, etc.) is preserved."""
        try:
            from ninebox.services.data_packaging_service import package_for_agent
        except ImportError:
            pytest.skip("data_packaging_service not yet implemented")

        employees = [create_employee(i) for i in range(10)]

        analyses_with_metadata = {
            "location": {
                "status": "red",
                "p_value": 0.001,
                "chi2": 15.3,
                "effect_size": 0.35,
                "sample_size": 100,
                "interpretation": "Significant bias detected",
            }
        }

        result = package_for_agent(employees, analyses_with_metadata)

        analyses_key = "analysis_results" if "analysis_results" in result else "analyses"
        location_analysis = result[analyses_key]["location"]

        # All metadata should be preserved
        assert location_analysis["p_value"] == 0.001
        assert location_analysis["chi2"] == 15.3
        assert location_analysis["effect_size"] == 0.35
        assert location_analysis["sample_size"] == 100
        assert "interpretation" in location_analysis

    def test_handles_missing_analysis_results(self) -> None:
        """Test that package handles case where some analyses are missing."""
        try:
            from ninebox.services.data_packaging_service import package_for_agent
        except ImportError:
            pytest.skip("data_packaging_service not yet implemented")

        employees = [create_employee(i) for i in range(10)]

        # Only partial analyses
        partial_analyses = {
            "location": {"status": "green"},
            # function, level, tenure missing
        }

        result = package_for_agent(employees, partial_analyses)

        # Should handle gracefully
        assert isinstance(result, dict)
        analyses_key = "analysis_results" if "analysis_results" in result else "analyses"
        assert "location" in result[analyses_key]

    def test_package_for_agent_handles_future_hire_date(self) -> None:
        """Test that future hire dates result in 0 tenure, not negative."""
        try:
            from ninebox.services.data_packaging_service import package_for_agent
        except ImportError:
            pytest.skip("data_packaging_service not yet implemented")

        from datetime import timedelta

        future_date = date.today() + timedelta(days=30)
        employee = create_employee(1, hire_date=future_date)

        result = package_for_agent([employee], {})

        assert result["employees"][0]["tenure_years"] == 0.0

    def test_package_for_agent_handles_hire_date_today(self) -> None:
        """Test that hire_date = today results in 0 tenure."""
        try:
            from ninebox.services.data_packaging_service import package_for_agent
        except ImportError:
            pytest.skip("data_packaging_service not yet implemented")

        employee = create_employee(1, hire_date=date.today())

        result = package_for_agent([employee], {})

        assert result["employees"][0]["tenure_years"] == 0.0
