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
    filtered = employee_service.filter_employees(sample_employees, levels=["MT4"])

    assert len(filtered) == 2
    assert all(emp.job_level == "MT4" for emp in filtered)


def test_filter_employees_when_multiple_levels_then_filters_correctly(
    employee_service: EmployeeService, sample_employees: list[Employee]
) -> None:
    """Test filtering by multiple job levels."""
    filtered = employee_service.filter_employees(sample_employees, levels=["MT2", "MT4"])

    assert len(filtered) == 3
    assert all(emp.job_level in ["MT2", "MT4"] for emp in filtered)


def test_filter_employees_when_by_manager_then_filters_correctly(
    employee_service: EmployeeService, sample_employees: list[Employee]
) -> None:
    """Test filtering by manager."""
    filtered = employee_service.filter_employees(sample_employees, managers=["Bob Manager"])

    assert len(filtered) == 2
    assert all(emp.manager == "Bob Manager" for emp in filtered)


def test_filter_employees_when_exclude_ids_then_excludes_correctly(
    employee_service: EmployeeService, sample_employees: list[Employee]
) -> None:
    """Test excluding employees by ID."""
    filtered = employee_service.filter_employees(sample_employees, exclude_ids=[1, 3])

    assert len(filtered) == 3
    assert all(emp.employee_id not in [1, 3] for emp in filtered)
    assert [emp.employee_id for emp in filtered] == [2, 4, 5]


def test_filter_employees_when_combined_filters_then_applies_and_logic(
    employee_service: EmployeeService, sample_employees: list[Employee]
) -> None:
    """Test combined filters with AND logic."""
    filtered = employee_service.filter_employees(
        sample_employees, levels=["MT4"], managers=["Bob Manager"]
    )

    # Should only match employees that are MT4 AND managed by Bob Manager
    assert len(filtered) == 1
    assert filtered[0].job_level == "MT4"
    assert filtered[0].manager == "Bob Manager"


def test_filter_employees_when_by_performance_then_filters_correctly(
    employee_service: EmployeeService, sample_employees: list[Employee]
) -> None:
    """Test filtering by performance level."""
    filtered = employee_service.filter_employees(sample_employees, performance=["High"])

    assert len(filtered) == 2
    assert all(emp.performance == PerformanceLevel.HIGH for emp in filtered)


def test_filter_employees_when_by_potential_then_filters_correctly(
    employee_service: EmployeeService, sample_employees: list[Employee]
) -> None:
    """Test filtering by potential level."""
    filtered = employee_service.filter_employees(sample_employees, potential=["High"])

    assert len(filtered) == 3
    assert all(emp.potential == PotentialLevel.HIGH for emp in filtered)


def test_filter_employees_when_by_multiple_performance_levels_then_filters_correctly(
    employee_service: EmployeeService, sample_employees: list[Employee]
) -> None:
    """Test filtering by multiple performance levels."""
    filtered = employee_service.filter_employees(sample_employees, performance=["High", "Medium"])

    assert len(filtered) == 4
    assert all(
        emp.performance in [PerformanceLevel.HIGH, PerformanceLevel.MEDIUM] for emp in filtered
    )


def test_filter_employees_when_empty_list_then_returns_all(
    employee_service: EmployeeService, sample_employees: list[Employee]
) -> None:
    """Test filtering with empty filter lists returns all employees."""
    filtered = employee_service.filter_employees(sample_employees, levels=[])

    assert len(filtered) == 5


def test_filter_employees_when_no_filters_then_returns_all(
    employee_service: EmployeeService, sample_employees: list[Employee]
) -> None:
    """Test filtering with no filters returns all employees."""
    filtered = employee_service.filter_employees(sample_employees)

    assert len(filtered) == 5


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

    # Check levels
    assert set(options["levels"]) == {"MT1", "MT2", "MT4", "MT5"}

    # Check job functions (categorized)
    assert set(options["job_functions"]) == {"Other", "Product Management"}

    # Check locations (mapped to display names)
    assert set(options["locations"]) == {"Canada", "Europe", "USA"}

    # Check managers
    assert set(options["managers"]) == {"Bob Manager", "Dave Lead", "Eve VP", "Frank Director"}


def test_get_filter_options_when_called_then_returns_employee_list(
    employee_service: EmployeeService, sample_employees: list[Employee]
) -> None:
    """Test get_filter_options returns employee list for exclusion."""
    options = employee_service.get_filter_options(sample_employees)

    assert len(options["employees"]) == 5

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
    filtered = employee_service.filter_employees(sample_employees, job_functions=["Other"])

    assert len(filtered) == 4
    assert all(emp.job_function == "Other" for emp in filtered)


def test_filter_employees_when_by_location_then_filters_by_display_name(
    employee_service: EmployeeService, sample_employees: list[Employee]
) -> None:
    """Test filtering by location using display names (e.g., 'Europe' groups GBR)."""
    # Filter by Europe (should include GBR)
    filtered = employee_service.filter_employees(sample_employees, locations=["Europe"])

    assert len(filtered) == 1
    assert filtered[0].location == "GBR"

    # Filter by USA
    filtered = employee_service.filter_employees(sample_employees, locations=["USA"])

    assert len(filtered) == 3
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
    filtered = employee_service.filter_employees(
        sample_employees,
        levels=["MT4", "MT5"],
        performance=["High"],
        exclude_ids=[4],
    )

    # Should match: MT4 or MT5, High performance, not employee 4
    assert len(filtered) == 1
    assert filtered[0].employee_id == 1
    assert filtered[0].job_level == "MT4"
    assert filtered[0].performance == PerformanceLevel.HIGH
