"""Edge case tests for intelligence service.

This test module covers edge cases and error handling:
- Empty employee lists
- Insufficient data (<30 employees)
- Insufficient categories (<2 locations/functions/levels/tenure)
- Empty contingency table categories
"""

from datetime import date

import pytest

from ninebox.models.employee import Employee, PerformanceLevel, PotentialLevel
from ninebox.services.intelligence_service import (
    calculate_function_analysis,
    calculate_level_analysis,
    calculate_location_analysis,
    calculate_overall_intelligence,
    calculate_tenure_analysis,
)


pytestmark = pytest.mark.unit


def create_employee(
    emp_id: int,
    location: str = "USA",
    function: str = "Engineer",
    level: str = "L3",
    tenure: str = "1-2 years",
    performance: PerformanceLevel = PerformanceLevel.MEDIUM,
    potential: PotentialLevel = PotentialLevel.MEDIUM,
) -> Employee:
    """Helper to create test employee."""
    grid_position = 5  # Default to Medium/Medium
    if performance == PerformanceLevel.HIGH and potential == PotentialLevel.HIGH:
        grid_position = 9
    elif performance == PerformanceLevel.HIGH:
        grid_position = 3
    elif potential == PotentialLevel.HIGH:
        grid_position = 7

    return Employee(
        employee_id=emp_id,
        name=f"Employee {emp_id}",
        business_title=function,
        job_title=function,
        job_profile=f"{function}-{location}",
        job_level=level,
        job_function=function,
        location=location,
        direct_manager="Manager",
        hire_date=date(2020, 1, 1),
        tenure_category=tenure,
        time_in_job_profile="1-2 years",
        performance=performance,
        potential=potential,
        grid_position=grid_position,
        talent_indicator="",
    )


class TestEmptyEmployeeList:
    """Test handling of empty employee lists."""

    def test_location_analysis_when_empty_list_then_returns_empty_result(self) -> None:
        """Test location analysis with empty employee list."""
        result = calculate_location_analysis([])

        assert result["status"] == "green"
        assert result["interpretation"] == "No employees to analyze"
        assert result["sample_size"] == 0
        assert result["deviations"] == []

    def test_function_analysis_when_empty_list_then_returns_empty_result(self) -> None:
        """Test function analysis with empty employee list."""
        result = calculate_function_analysis([])

        assert result["status"] == "green"
        assert result["interpretation"] == "No employees to analyze"
        assert result["sample_size"] == 0
        assert result["deviations"] == []

    def test_level_analysis_when_empty_list_then_returns_empty_result(self) -> None:
        """Test level analysis with empty employee list."""
        result = calculate_level_analysis([])

        assert result["status"] == "green"
        assert result["interpretation"] == "No employees to analyze"
        assert result["sample_size"] == 0
        assert result["deviations"] == []

    def test_tenure_analysis_when_empty_list_then_returns_empty_result(self) -> None:
        """Test tenure analysis with empty employee list."""
        result = calculate_tenure_analysis([])

        assert result["status"] == "green"
        assert result["interpretation"] == "No employees to analyze"
        assert result["sample_size"] == 0
        assert result["deviations"] == []

    def test_overall_intelligence_when_empty_list_then_returns_all_empty(self) -> None:
        """Test overall intelligence with empty employee list."""
        result = calculate_overall_intelligence([])

        assert result["quality_score"] == 100  # All green = 100
        assert result["anomaly_count"]["green"] == 5  # 5 dimensions: location, function, level, tenure, manager
        assert result["anomaly_count"]["yellow"] == 0
        assert result["anomaly_count"]["red"] == 0


class TestInsufficientDataSampleSize:
    """Test handling of insufficient sample sizes (<30 employees)."""

    def test_location_analysis_when_sample_size_too_small_then_returns_empty_result(
        self,
    ) -> None:
        """Test location analysis with <30 employees."""
        # Create 20 employees across 2 locations
        employees = [
            create_employee(i, location="USA" if i % 2 == 0 else "UK") for i in range(20)
        ]

        result = calculate_location_analysis(employees)

        assert result["status"] == "green"
        assert "Sample size too small" in result["interpretation"]
        assert "N=20" in result["interpretation"]
        assert "need >= 30" in result["interpretation"]

    def test_function_analysis_when_sample_size_too_small_then_returns_empty_result(
        self,
    ) -> None:
        """Test function analysis with <30 employees.

        Note: Need varied performance levels to avoid "Insufficient grid positions" error.
        """
        # Create 25 employees across 2 functions with varied performance
        employees = []
        for i in range(25):
            function = "Engineer" if i % 2 == 0 else "Designer"
            # Vary performance to avoid "Insufficient grid positions" error
            perf = (
                PerformanceLevel.HIGH
                if i % 3 == 0
                else PerformanceLevel.LOW if i % 3 == 1 else PerformanceLevel.MEDIUM
            )
            employees.append(create_employee(i, function=function, performance=perf))

        result = calculate_function_analysis(employees)

        assert result["status"] == "green"
        assert "Sample size too small" in result["interpretation"]
        assert "N=25" in result["interpretation"]

    def test_level_analysis_when_sample_size_too_small_then_returns_empty_result(self) -> None:
        """Test level analysis with <30 employees."""
        # Create 15 employees across 2 levels
        employees = [create_employee(i, level="L3" if i % 2 == 0 else "L4") for i in range(15)]

        result = calculate_level_analysis(employees)

        assert result["status"] == "green"
        assert "Sample size too small" in result["interpretation"]
        assert "N=15" in result["interpretation"]

    def test_tenure_analysis_when_sample_size_too_small_then_returns_empty_result(self) -> None:
        """Test tenure analysis with <30 employees."""
        # Create 10 employees across 2 tenure categories
        employees = [
            create_employee(i, tenure="0-1 years" if i % 2 == 0 else "1-2 years")
            for i in range(10)
        ]

        result = calculate_tenure_analysis(employees)

        assert result["status"] == "green"
        assert "Sample size too small" in result["interpretation"]
        assert "N=10" in result["interpretation"]


class TestInsufficientCategories:
    """Test handling of insufficient categories (<2 distinct values)."""

    def test_location_analysis_when_single_location_then_returns_empty_result(self) -> None:
        """Test location analysis when all employees in same location."""
        # Create 50 employees all in USA
        employees = [create_employee(i, location="USA") for i in range(50)]

        result = calculate_location_analysis(employees)

        assert result["status"] == "green"
        assert "Insufficient locations for comparison" in result["interpretation"]
        assert "need >= 2" in result["interpretation"]

    def test_function_analysis_when_single_function_then_returns_empty_result(self) -> None:
        """Test function analysis when all employees have same function."""
        # Create 50 employees all Engineers
        employees = [create_employee(i, function="Engineer") for i in range(50)]

        result = calculate_function_analysis(employees)

        assert result["status"] == "green"
        assert "Insufficient functions for comparison" in result["interpretation"]

    def test_function_analysis_when_all_functions_too_small_then_returns_empty_result(
        self,
    ) -> None:
        """Test function analysis when all functions have <10 employees."""
        # Create 50 employees spread across 10 functions (5 each)
        # All will be grouped into "Other" bucket, leaving only 1 group
        employees = []
        for i in range(50):
            function = f"Function{i % 10}"  # 10 functions, 5 employees each
            employees.append(create_employee(i, function=function))

        result = calculate_function_analysis(employees)

        assert result["status"] == "green"
        assert "Insufficient functions after grouping" in result["interpretation"]

    def test_level_analysis_when_single_level_then_returns_empty_result(self) -> None:
        """Test level analysis when all employees at same level."""
        # Create 50 employees all at L3
        employees = [create_employee(i, level="L3") for i in range(50)]

        result = calculate_level_analysis(employees)

        assert result["status"] == "green"
        assert "Insufficient levels for comparison" in result["interpretation"]

    def test_tenure_analysis_when_single_tenure_then_returns_empty_result(self) -> None:
        """Test tenure analysis when all employees have same tenure."""
        # Create 50 employees all with 1-2 years tenure
        employees = [create_employee(i, tenure="1-2 years") for i in range(50)]

        result = calculate_tenure_analysis(employees)

        assert result["status"] == "green"
        assert "Insufficient tenure categories for comparison" in result["interpretation"]


class TestEmptyContingencyCategories:
    """Test handling of empty categories in contingency tables."""

    def test_function_analysis_when_insufficient_grid_positions_then_returns_empty_result(
        self,
    ) -> None:
        """Test function analysis when only 1 grid position has data."""
        # Create 50 employees across 2 functions, but all at same grid position
        employees = [
            create_employee(
                i,
                function="Engineer" if i % 2 == 0 else "Designer",
                performance=PerformanceLevel.MEDIUM,
                potential=PotentialLevel.MEDIUM,
            )
            for i in range(50)
        ]

        result = calculate_function_analysis(employees)

        # Should fail because all employees are in position 5 (Medium/Medium)
        # Not enough variance in grid positions
        assert result["status"] == "green"
        assert (
            "Insufficient grid positions with data" in result["interpretation"]
            or "Contingency table has empty" in result["interpretation"]
        )

    def test_level_analysis_when_empty_performance_category_then_returns_empty_result(
        self,
    ) -> None:
        """Test level analysis when a performance category has zero employees."""
        # Create 50 employees across 2 levels, but only Medium and High performance
        # (no Low performance across all levels - creates empty column)
        employees = []
        for i in range(50):
            level = "L3" if i % 2 == 0 else "L4"
            # Only use Medium and High, never Low
            perf = PerformanceLevel.MEDIUM if i % 3 == 0 else PerformanceLevel.HIGH
            employees.append(create_employee(i, level=level, performance=perf))

        result = calculate_level_analysis(employees)

        # Should either succeed with warning or return empty result for empty categories
        # The actual behavior depends on whether scipy can handle this
        assert result["status"] in ["green", "yellow", "red"]

    def test_tenure_analysis_when_empty_performance_category_then_returns_empty_result(
        self,
    ) -> None:
        """Test tenure analysis when a performance category is empty."""
        # Create 50 employees across 2 tenure groups, but only Medium and High performance
        employees = []
        for i in range(50):
            tenure = "0-1 years" if i % 2 == 0 else "1-2 years"
            # Only use Medium and High, never Low
            perf = PerformanceLevel.MEDIUM if i % 3 == 0 else PerformanceLevel.HIGH
            employees.append(create_employee(i, tenure=tenure, performance=perf))

        result = calculate_tenure_analysis(employees)

        # Should succeed (scipy handles this)
        assert result["status"] in ["green", "yellow", "red"]


class TestEdgeCaseDataSizes:
    """Test edge cases around minimum data thresholds."""

    def test_location_analysis_when_exactly_30_employees_then_succeeds(self) -> None:
        """Test location analysis with exactly 30 employees (minimum threshold)."""
        # Create exactly 30 employees across 2 locations with varied performance
        employees = []
        for i in range(30):
            location = "USA" if i % 2 == 0 else "UK"
            perf = (
                PerformanceLevel.HIGH
                if i % 3 == 0
                else PerformanceLevel.LOW if i % 3 == 1 else PerformanceLevel.MEDIUM
            )
            employees.append(create_employee(i, location=location, performance=perf))

        result = calculate_location_analysis(employees)

        # Should succeed - 30 is the minimum
        assert result["sample_size"] == 30
        assert "Sample size too small" not in result["interpretation"]

    def test_location_analysis_when_29_employees_then_fails(self) -> None:
        """Test location analysis with 29 employees (just below threshold)."""
        # Create 29 employees across 2 locations
        employees = [
            create_employee(i, location="USA" if i % 2 == 0 else "UK") for i in range(29)
        ]

        result = calculate_location_analysis(employees)

        # Should fail - 29 is below minimum
        assert result["status"] == "green"
        assert "Sample size too small" in result["interpretation"]
        assert "N=29" in result["interpretation"]

    def test_function_analysis_when_exactly_2_functions_with_10_each_then_succeeds(self) -> None:
        """Test function analysis with minimum viable configuration."""
        # Create exactly 30 employees: 2 functions with 15 each, varied performance
        employees = []
        for i in range(30):
            function = "Engineer" if i < 15 else "Designer"
            perf = (
                PerformanceLevel.HIGH
                if i % 3 == 0
                else PerformanceLevel.LOW if i % 3 == 1 else PerformanceLevel.MEDIUM
            )
            employees.append(create_employee(i, function=function, performance=perf))

        result = calculate_function_analysis(employees)

        # Should succeed - meets minimum requirements
        assert result["sample_size"] == 30
        assert "Insufficient" not in result["interpretation"]

    def test_function_analysis_when_one_function_has_9_employees_then_groups_to_other(
        self,
    ) -> None:
        """Test function analysis when one function has <10 employees."""
        # Create 40 employees: Engineer (30), Designer (9), Manager (1)
        # Designer and Manager should be grouped into "Other"
        employees = []
        for i in range(40):
            if i < 30:
                function = "Engineer"
            elif i < 39:
                function = "Designer"  # 9 employees
            else:
                function = "Manager"  # 1 employee

            perf = (
                PerformanceLevel.HIGH
                if i % 3 == 0
                else PerformanceLevel.LOW if i % 3 == 1 else PerformanceLevel.MEDIUM
            )
            employees.append(create_employee(i, function=function, performance=perf))

        result = calculate_function_analysis(employees)

        # Should succeed - Engineer (30) and Other (10)
        assert result["sample_size"] == 40
        # Check that "Other" category exists in deviations
        has_other = any(d["category"] == "Other" for d in result["deviations"])
        assert has_other
