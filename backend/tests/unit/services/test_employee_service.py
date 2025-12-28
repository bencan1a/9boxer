"""Tests for employee service."""

import pytest

from ninebox.models.employee import Employee, PerformanceLevel, PotentialLevel
from ninebox.services.employee_service import EmployeeService

pytestmark = pytest.mark.unit


@pytest.fixture
def employee_service() -> EmployeeService:
    """Create employee service instance."""
    return EmployeeService()


def test_filter_employees_when_single_level_then_filters_correctly(
    employee_service: EmployeeService, sample_employees: list[Employee]
) -> None:
    """Test filtering by single job level."""
    # Find a level that exists in sample data
    expected_count = sum(1 for emp in sample_employees if emp.job_level == "MT4")

    filtered = employee_service.filter_employees(sample_employees, levels=["MT4"])

    assert len(filtered) == expected_count
    assert all(emp.job_level == "MT4" for emp in filtered)


def test_filter_employees_when_multiple_levels_then_filters_correctly(
    employee_service: EmployeeService, sample_employees: list[Employee]
) -> None:
    """Test filtering by multiple job levels."""
    expected_count = sum(1 for emp in sample_employees if emp.job_level in ["MT2", "MT4"])

    filtered = employee_service.filter_employees(sample_employees, levels=["MT2", "MT4"])

    assert len(filtered) == expected_count
    assert all(emp.job_level in ["MT2", "MT4"] for emp in filtered)


def test_filter_employees_when_by_manager_then_filters_correctly(
    employee_service: EmployeeService, sample_employees: list[Employee]
) -> None:
    """Test filtering by manager."""
    # Find a manager that exists in sample data
    test_manager = sample_employees[10].manager if len(sample_employees) > 10 else sample_employees[0].manager
    expected_count = sum(1 for emp in sample_employees if emp.manager == test_manager)

    filtered = employee_service.filter_employees(sample_employees, managers=[test_manager])

    assert len(filtered) == expected_count
    assert len(filtered) > 0  # Should have at least one employee
    assert all(emp.manager == test_manager for emp in filtered)


def test_filter_employees_when_exclude_ids_then_excludes_correctly(
    employee_service: EmployeeService, sample_employees: list[Employee]
) -> None:
    """Test excluding employees by ID."""
    # Get first two employee IDs from sample data
    exclude_ids = [sample_employees[0].employee_id, sample_employees[2].employee_id]
    expected_count = len(sample_employees) - 2

    filtered = employee_service.filter_employees(sample_employees, exclude_ids=exclude_ids)

    assert len(filtered) == expected_count
    assert all(emp.employee_id not in exclude_ids for emp in filtered)


def test_filter_employees_when_combined_filters_then_applies_and_logic(
    employee_service: EmployeeService, sample_employees: list[Employee]
) -> None:
    """Test combined filters with AND logic."""
    # Find employees at MT4 level
    mt4_employees = [emp for emp in sample_employees if emp.job_level == "MT4"]
    assert len(mt4_employees) > 0, "Need MT4 employees in sample data"

    # Use the manager of the first MT4 employee
    test_manager = mt4_employees[0].manager
    expected_count = sum(
        1 for emp in sample_employees
        if emp.job_level == "MT4" and emp.manager == test_manager
    )

    filtered = employee_service.filter_employees(
        sample_employees, levels=["MT4"], managers=[test_manager]
    )

    # Should only match employees that are MT4 AND managed by test_manager
    assert len(filtered) == expected_count
    assert len(filtered) > 0  # Should have at least one match
    assert all(emp.job_level == "MT4" and emp.manager == test_manager for emp in filtered)


def test_filter_employees_when_by_performance_then_filters_correctly(
    employee_service: EmployeeService, sample_employees: list[Employee]
) -> None:
    """Test filtering by performance level."""
    expected_count = sum(1 for emp in sample_employees if emp.performance == PerformanceLevel.HIGH)

    filtered = employee_service.filter_employees(sample_employees, performance=["High"])

    assert len(filtered) == expected_count
    assert len(filtered) > 0  # Should have some high performers
    assert all(emp.performance == PerformanceLevel.HIGH for emp in filtered)


def test_filter_employees_when_by_potential_then_filters_correctly(
    employee_service: EmployeeService, sample_employees: list[Employee]
) -> None:
    """Test filtering by potential level."""
    expected_count = sum(1 for emp in sample_employees if emp.potential == PotentialLevel.HIGH)

    filtered = employee_service.filter_employees(sample_employees, potential=["High"])

    assert len(filtered) == expected_count
    assert len(filtered) > 0  # Should have some high potential employees
    assert all(emp.potential == PotentialLevel.HIGH for emp in filtered)


def test_filter_employees_when_by_multiple_performance_levels_then_filters_correctly(
    employee_service: EmployeeService, sample_employees: list[Employee]
) -> None:
    """Test filtering by multiple performance levels."""
    expected_count = sum(
        1 for emp in sample_employees
        if emp.performance in [PerformanceLevel.HIGH, PerformanceLevel.MEDIUM]
    )

    filtered = employee_service.filter_employees(sample_employees, performance=["High", "Medium"])

    assert len(filtered) == expected_count
    assert len(filtered) > 0  # Should have some matches
    assert all(
        emp.performance in [PerformanceLevel.HIGH, PerformanceLevel.MEDIUM] for emp in filtered
    )


def test_filter_employees_when_empty_list_then_returns_all(
    employee_service: EmployeeService, sample_employees: list[Employee]
) -> None:
    """Test filtering with empty filter lists returns all employees."""
    filtered = employee_service.filter_employees(sample_employees, levels=[])

    assert len(filtered) == len(sample_employees)


def test_filter_employees_when_no_filters_then_returns_all(
    employee_service: EmployeeService, sample_employees: list[Employee]
) -> None:
    """Test filtering with no filters returns all employees."""
    filtered = employee_service.filter_employees(sample_employees)

    assert len(filtered) == len(sample_employees)


def test_get_filter_options_when_called_then_returns_correct_options(
    employee_service: EmployeeService, sample_employees: list[Employee]
) -> None:
    """Test get_filter_options returns correct filter options."""
    options = employee_service.get_filter_options(sample_employees)

    assert "levels" in options
    assert "job_profiles" in options
    assert "job_functions" in options
    assert "locations" in options
    assert "managers" in options
    assert "employees" in options

    # Extract actual values from sample data
    actual_levels = {emp.job_level for emp in sample_employees}
    actual_functions = {emp.job_function for emp in sample_employees}
    actual_managers = {emp.manager for emp in sample_employees if emp.manager and emp.manager != "None"}

    # Check levels - should match what's in sample data
    assert set(options["levels"]) == actual_levels

    # Check job functions - should match what's in sample data
    assert set(options["job_functions"]) == actual_functions

    # Check locations - should have at least the configured locations (USA, CAN, GBR -> USA, Canada, Europe)
    assert "USA" in options["locations"]
    assert "Canada" in options["locations"]
    assert "Europe" in options["locations"]

    # Check managers - should have managers from sample data (options returns list, actual_managers is set)
    assert set(options["managers"]) == actual_managers


def test_get_filter_options_when_called_then_returns_employee_list(
    employee_service: EmployeeService, sample_employees: list[Employee]
) -> None:
    """Test get_filter_options returns employee list for exclusion."""
    options = employee_service.get_filter_options(sample_employees)

    assert len(options["employees"]) == len(sample_employees)

    # Check employee structure
    emp = options["employees"][0]
    assert "id" in emp
    assert "name" in emp
    assert "level" in emp
    assert "title" in emp


def test_filter_employees_when_by_job_profile_then_filters_correctly(
    employee_service: EmployeeService, sample_employees: list[Employee]
) -> None:
    """Test filtering by job function."""
    # Use a function that exists in sample data
    test_function = sample_employees[0].job_function
    expected_count = sum(1 for emp in sample_employees if emp.job_function == test_function)

    filtered = employee_service.filter_employees(sample_employees, job_functions=[test_function])

    assert len(filtered) == expected_count
    assert len(filtered) > 0  # Should have at least one match
    assert all(emp.job_function == test_function for emp in filtered)


def test_filter_employees_when_by_location_then_filters_by_display_name(
    employee_service: EmployeeService, sample_employees: list[Employee]
) -> None:
    """Test filtering by location using display names (e.g., 'Europe' groups GBR)."""
    # Count employees in GBR (Europe)
    gbr_count = sum(1 for emp in sample_employees if emp.location == "GBR")
    if gbr_count > 0:
        # Filter by Europe (should include GBR)
        filtered = employee_service.filter_employees(sample_employees, locations=["Europe"])
        assert len(filtered) == gbr_count
        assert all(emp.location == "GBR" for emp in filtered)

    # Filter by USA
    usa_count = sum(1 for emp in sample_employees if emp.location == "USA")
    if usa_count > 0:
        filtered = employee_service.filter_employees(sample_employees, locations=["USA"])
        assert len(filtered) == usa_count
        assert all(emp.location == "USA" for emp in filtered)


def test_filter_employees_when_no_matches_then_returns_empty(
    employee_service: EmployeeService, sample_employees: list[Employee]
) -> None:
    """Test filtering with no matches returns empty list."""
    filtered = employee_service.filter_employees(sample_employees, levels=["MT99"])

    assert len(filtered) == 0


def test_filter_employees_when_complex_combination_then_applies_all_filters(
    employee_service: EmployeeService, sample_employees: list[Employee]
) -> None:
    """Test complex filter combination."""
    # Find an employee to exclude
    exclude_id = sample_employees[0].employee_id

    # Calculate expected count
    expected_count = sum(
        1 for emp in sample_employees
        if emp.job_level in ["MT4", "MT5"]
        and emp.performance == PerformanceLevel.HIGH
        and emp.employee_id != exclude_id
    )

    filtered = employee_service.filter_employees(
        sample_employees,
        levels=["MT4", "MT5"],
        performance=["High"],
        exclude_ids=[exclude_id],
    )

    # Should match: MT4 or MT5, High performance, not excluded employee
    assert len(filtered) == expected_count
    assert all(emp.job_level in ["MT4", "MT5"] for emp in filtered)
    assert all(emp.performance == PerformanceLevel.HIGH for emp in filtered)
    assert all(emp.employee_id != exclude_id for emp in filtered)
