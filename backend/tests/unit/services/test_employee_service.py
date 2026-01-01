"""Tests for employee service."""

import pytest

from ninebox.models.employee import Employee, HistoricalRating, PerformanceLevel, PotentialLevel
from ninebox.services.employee_service import (
    EmployeeService,
    PerformanceTier,
    get_tier_from_historical_rating,
    get_tier_from_position,
    is_big_mover,
    is_tier_crossing,
)
from tests.conftest import create_simple_test_employee

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
    test_manager = (
        sample_employees[10].direct_manager if len(sample_employees) > 10 else sample_employees[0].direct_manager
    )
    expected_count = sum(1 for emp in sample_employees if emp.direct_manager == test_manager)

    filtered = employee_service.filter_employees(sample_employees, managers=[test_manager])

    assert len(filtered) == expected_count
    assert len(filtered) > 0  # Should have at least one employee
    assert all(emp.direct_manager == test_manager for emp in filtered)


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
    test_manager = mt4_employees[0].direct_manager
    expected_count = sum(
        1 for emp in sample_employees if emp.job_level == "MT4" and emp.direct_manager == test_manager
    )

    filtered = employee_service.filter_employees(
        sample_employees, levels=["MT4"], managers=[test_manager]
    )

    # Should only match employees that are MT4 AND managed by test_manager
    assert len(filtered) == expected_count
    assert len(filtered) > 0  # Should have at least one match
    assert all(emp.job_level == "MT4" and emp.direct_manager == test_manager for emp in filtered)


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
        1
        for emp in sample_employees
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
    actual_managers = {
        emp.direct_manager for emp in sample_employees if emp.direct_manager and emp.direct_manager != "None"
    }

    # Check levels - should match what's in sample data
    assert set(options["levels"]) == actual_levels

    # Check job functions - should match what's in sample data
    assert set(options["job_functions"]) == actual_functions

    # Check locations - should match what's in sample data (USA and CAN)
    assert "USA" in options["locations"]
    assert "Canada" in options["locations"]
    # sample_employees fixture only contains USA and CAN locations (no GBR/Europe)

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
        1
        for emp in sample_employees
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


# ==================== Big Mover Detection Tests ====================


def test_get_tier_from_position_when_low_tier_positions_then_returns_low() -> None:
    """Test positions 1-4 map to LOW tier."""
    assert get_tier_from_position(1) == PerformanceTier.LOW
    assert get_tier_from_position(2) == PerformanceTier.LOW
    assert get_tier_from_position(3) == PerformanceTier.LOW
    assert get_tier_from_position(4) == PerformanceTier.LOW


def test_get_tier_from_position_when_middle_tier_positions_then_returns_middle() -> None:
    """Test positions 5 and 7 map to MIDDLE tier."""
    assert get_tier_from_position(5) == PerformanceTier.MIDDLE
    assert get_tier_from_position(7) == PerformanceTier.MIDDLE


def test_get_tier_from_position_when_high_tier_positions_then_returns_high() -> None:
    """Test positions 6, 8, 9 map to HIGH tier."""
    assert get_tier_from_position(6) == PerformanceTier.HIGH
    assert get_tier_from_position(8) == PerformanceTier.HIGH
    assert get_tier_from_position(9) == PerformanceTier.HIGH


def test_get_tier_from_position_when_invalid_position_then_raises_error() -> None:
    """Test invalid grid position raises ValueError."""
    with pytest.raises(ValueError, match="Invalid grid position"):
        get_tier_from_position(0)

    with pytest.raises(ValueError, match="Invalid grid position"):
        get_tier_from_position(10)


def test_get_tier_from_historical_rating_when_low_then_returns_low() -> None:
    """Test 'Low' rating maps to LOW tier."""
    assert get_tier_from_historical_rating("Low") == PerformanceTier.LOW
    assert get_tier_from_historical_rating("low") == PerformanceTier.LOW
    assert get_tier_from_historical_rating("LOW") == PerformanceTier.LOW


def test_get_tier_from_historical_rating_when_solid_then_returns_middle() -> None:
    """Test 'Solid' rating maps to MIDDLE tier."""
    assert get_tier_from_historical_rating("Solid") == PerformanceTier.MIDDLE
    assert get_tier_from_historical_rating("solid") == PerformanceTier.MIDDLE
    assert get_tier_from_historical_rating("SOLID") == PerformanceTier.MIDDLE


def test_get_tier_from_historical_rating_when_strong_then_returns_high() -> None:
    """Test 'Strong' rating maps to HIGH tier."""
    assert get_tier_from_historical_rating("Strong") == PerformanceTier.HIGH
    assert get_tier_from_historical_rating("strong") == PerformanceTier.HIGH
    assert get_tier_from_historical_rating("STRONG") == PerformanceTier.HIGH


def test_get_tier_from_historical_rating_when_leading_then_returns_high() -> None:
    """Test 'Leading' rating maps to HIGH tier."""
    assert get_tier_from_historical_rating("Leading") == PerformanceTier.HIGH
    assert get_tier_from_historical_rating("leading") == PerformanceTier.HIGH
    assert get_tier_from_historical_rating("LEADING") == PerformanceTier.HIGH


def test_get_tier_from_historical_rating_when_invalid_rating_then_raises_error() -> None:
    """Test invalid historical rating raises ValueError."""
    with pytest.raises(ValueError, match="Invalid historical rating"):
        get_tier_from_historical_rating("Excellent")

    with pytest.raises(ValueError, match="Invalid historical rating"):
        get_tier_from_historical_rating("Unknown")


def test_is_tier_crossing_when_low_to_high_then_returns_true() -> None:
    """Test crossing from LOW to HIGH tier is a big move."""
    assert is_tier_crossing(PerformanceTier.LOW, PerformanceTier.HIGH) is True


def test_is_tier_crossing_when_high_to_low_then_returns_true() -> None:
    """Test crossing from HIGH to LOW tier is a big move."""
    assert is_tier_crossing(PerformanceTier.HIGH, PerformanceTier.LOW) is True


def test_is_tier_crossing_when_low_to_middle_then_returns_false() -> None:
    """Test moving from LOW to MIDDLE is not a big move."""
    assert is_tier_crossing(PerformanceTier.LOW, PerformanceTier.MIDDLE) is False


def test_is_tier_crossing_when_middle_to_high_then_returns_false() -> None:
    """Test moving from MIDDLE to HIGH is not a big move."""
    assert is_tier_crossing(PerformanceTier.MIDDLE, PerformanceTier.HIGH) is False


def test_is_tier_crossing_when_middle_to_low_then_returns_false() -> None:
    """Test moving from MIDDLE to LOW is not a big move."""
    assert is_tier_crossing(PerformanceTier.MIDDLE, PerformanceTier.LOW) is False


def test_is_tier_crossing_when_high_to_middle_then_returns_false() -> None:
    """Test moving from HIGH to MIDDLE is not a big move."""
    assert is_tier_crossing(PerformanceTier.HIGH, PerformanceTier.MIDDLE) is False


def test_is_tier_crossing_when_same_tier_then_returns_false() -> None:
    """Test staying in same tier is not a big move."""
    assert is_tier_crossing(PerformanceTier.LOW, PerformanceTier.LOW) is False
    assert is_tier_crossing(PerformanceTier.MIDDLE, PerformanceTier.MIDDLE) is False
    assert is_tier_crossing(PerformanceTier.HIGH, PerformanceTier.HIGH) is False


def test_is_big_mover_when_year_over_year_low_to_high_then_returns_true() -> None:
    """Test year-over-year move from Low rating to High position."""
    employee = create_simple_test_employee(
        grid_position=9,  # HIGH tier
    )
    employee.ratings_history = [HistoricalRating(year=2023, rating="Low")]  # LOW tier

    assert is_big_mover(employee) is True


def test_is_big_mover_when_year_over_year_high_to_low_then_returns_true() -> None:
    """Test year-over-year move from Leading rating to Low position."""
    employee = create_simple_test_employee(
        grid_position=1,  # LOW tier
    )
    employee.ratings_history = [HistoricalRating(year=2023, rating="Leading")]  # HIGH tier

    assert is_big_mover(employee) is True


def test_is_big_mover_when_year_over_year_low_to_middle_then_returns_false() -> None:
    """Test year-over-year move from Low to Solid is not a big move."""
    employee = create_simple_test_employee(
        grid_position=5,  # MIDDLE tier
    )
    employee.ratings_history = [HistoricalRating(year=2023, rating="Low")]  # LOW tier

    assert is_big_mover(employee) is False


def test_is_big_mover_when_year_over_year_middle_to_high_then_returns_false() -> None:
    """Test year-over-year move from Solid to High position is not a big move."""
    employee = create_simple_test_employee(
        grid_position=9,  # HIGH tier
    )
    employee.ratings_history = [HistoricalRating(year=2023, rating="Solid")]  # MIDDLE tier

    assert is_big_mover(employee) is False


def test_is_big_mover_when_in_session_low_to_high_then_returns_true() -> None:
    """Test in-session move from position 2 (LOW) to position 9 (HIGH)."""
    current = create_simple_test_employee(grid_position=9)  # HIGH tier
    original = create_simple_test_employee(grid_position=2)  # LOW tier

    assert is_big_mover(current, original) is True


def test_is_big_mover_when_in_session_high_to_low_then_returns_true() -> None:
    """Test in-session move from position 8 (HIGH) to position 1 (LOW)."""
    current = create_simple_test_employee(grid_position=1)  # LOW tier
    original = create_simple_test_employee(grid_position=8)  # HIGH tier

    assert is_big_mover(current, original) is True


def test_is_big_mover_when_in_session_low_to_middle_then_returns_false() -> None:
    """Test in-session move from position 1 (LOW) to position 5 (MIDDLE)."""
    current = create_simple_test_employee(grid_position=5)  # MIDDLE tier
    original = create_simple_test_employee(grid_position=1)  # LOW tier

    assert is_big_mover(current, original) is False


def test_is_big_mover_when_in_session_middle_to_high_then_returns_false() -> None:
    """Test in-session move from position 5 (MIDDLE) to position 9 (HIGH)."""
    current = create_simple_test_employee(grid_position=9)  # HIGH tier
    original = create_simple_test_employee(grid_position=5)  # MIDDLE tier

    assert is_big_mover(current, original) is False


def test_is_big_mover_when_no_movement_then_returns_false() -> None:
    """Test employee with no movement is not a big mover."""
    employee = create_simple_test_employee(grid_position=5)
    employee.ratings_history = []

    assert is_big_mover(employee) is False


def test_is_big_mover_when_both_year_over_year_and_in_session_then_returns_true() -> None:
    """Test big mover when both year-over-year and in-session movements cross tiers."""
    # Year-over-year: Low → position 9 (HIGH)
    # In-session: position 2 (LOW) → position 9 (HIGH)
    current = create_simple_test_employee(grid_position=9)  # HIGH tier
    current.ratings_history = [HistoricalRating(year=2023, rating="Low")]  # LOW tier
    original = create_simple_test_employee(grid_position=2)  # LOW tier

    assert is_big_mover(current, original) is True


def test_is_big_mover_when_invalid_historical_rating_then_checks_in_session() -> None:
    """Test invalid historical rating is ignored and in-session check still works."""
    current = create_simple_test_employee(grid_position=9)  # HIGH tier
    current.ratings_history = [HistoricalRating(year=2023, rating="Invalid")]
    original = create_simple_test_employee(grid_position=1)  # LOW tier

    # Should still be detected as big mover via in-session check
    assert is_big_mover(current, original) is True


def test_is_big_mover_when_multiple_historical_ratings_then_uses_most_recent() -> None:
    """Test most recent historical rating is used for year-over-year check."""
    employee = create_simple_test_employee(grid_position=9)  # HIGH tier
    employee.ratings_history = [
        HistoricalRating(year=2022, rating="Strong"),  # Older rating (HIGH)
        HistoricalRating(year=2023, rating="Low"),  # Most recent (LOW)
    ]

    # Should use 2023 "Low" rating → Big mover (LOW to HIGH)
    assert is_big_mover(employee) is True
