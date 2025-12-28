"""Tests for statistics service."""

import pytest

from ninebox.models.employee import Employee, PerformanceLevel, PotentialLevel
from ninebox.models.grid_positions import get_position_label_by_number
from ninebox.services.statistics_service import StatisticsService



pytestmark = pytest.mark.unit

@pytest.fixture
def statistics_service() -> StatisticsService:
    """Create statistics service instance."""
    return StatisticsService()


def test_calculate_distribution_when_called_then_returns_all_9_boxes(
    statistics_service: StatisticsService, sample_employees: list[Employee]
) -> None:
    """Test that distribution includes all 9 boxes."""
    stats = statistics_service.calculate_distribution(sample_employees)

    assert "distribution" in stats
    assert len(stats["distribution"]) == 9

    # Check all boxes 1-9 are present
    positions = {item["grid_position"] for item in stats["distribution"]}
    assert positions == set(range(1, 10))


def test_calculate_distribution_when_called_then_counts_correctly(
    statistics_service: StatisticsService, sample_employees: list[Employee]
) -> None:
    """Test that employee counts are correct.

    MIGRATION NOTE (2025-12-28):
    Updated to work with rich sample data (50 employees) instead of hard-coded 5.
    Tests now validate that counts match employee attributes instead of hard-coded values.
    """
    stats = statistics_service.calculate_distribution(sample_employees)

    dist = {item["grid_position"]: item for item in stats["distribution"]}

    # Calculate expected counts from actual data
    expected_counts = {}
    for pos in range(1, 10):
        expected_counts[pos] = sum(1 for e in sample_employees if e.grid_position == pos)

    # Verify counts match actual employee distribution
    for pos in range(1, 10):
        assert dist[pos]["count"] == expected_counts[pos], (
            f"Position {pos} count mismatch: expected {expected_counts[pos]}, "
            f"got {dist[pos]['count']}"
        )

    # Total count should match number of employees
    total_count = sum(item["count"] for item in stats["distribution"])
    assert total_count == len(sample_employees)


def test_calculate_distribution_when_called_then_percentages_sum_to_100(
    statistics_service: StatisticsService, sample_employees: list[Employee]
) -> None:
    """Test that percentages sum to 100%."""
    stats = statistics_service.calculate_distribution(sample_employees)

    total_percentage = sum(item["percentage"] for item in stats["distribution"])

    # Allow for small rounding errors
    assert abs(total_percentage - 100.0) < 0.1


def test_calculate_distribution_when_called_then_aggregates_by_performance(
    statistics_service: StatisticsService, sample_employees: list[Employee]
) -> None:
    """Test aggregation by performance level.

    MIGRATION NOTE (2025-12-28):
    Updated to work with rich sample data by calculating expected counts from data.
    """
    stats = statistics_service.calculate_distribution(sample_employees)

    by_perf = stats["by_performance"]

    # Calculate expected counts from actual data
    expected_high = sum(1 for e in sample_employees if e.performance == PerformanceLevel.HIGH)
    expected_medium = sum(1 for e in sample_employees if e.performance == PerformanceLevel.MEDIUM)
    expected_low = sum(1 for e in sample_employees if e.performance == PerformanceLevel.LOW)

    assert by_perf["High"] == expected_high
    assert by_perf["Medium"] == expected_medium
    assert by_perf["Low"] == expected_low

    # Total should match number of employees
    assert by_perf["High"] + by_perf["Medium"] + by_perf["Low"] == len(sample_employees)


def test_calculate_distribution_when_called_then_aggregates_by_potential(
    statistics_service: StatisticsService, sample_employees: list[Employee]
) -> None:
    """Test aggregation by potential level.

    MIGRATION NOTE (2025-12-28):
    Updated to work with rich sample data by calculating expected counts from data.
    """
    stats = statistics_service.calculate_distribution(sample_employees)

    by_pot = stats["by_potential"]

    # Calculate expected counts from actual data
    expected_high = sum(1 for e in sample_employees if e.potential == PotentialLevel.HIGH)
    expected_medium = sum(1 for e in sample_employees if e.potential == PotentialLevel.MEDIUM)
    expected_low = sum(1 for e in sample_employees if e.potential == PotentialLevel.LOW)

    assert by_pot["High"] == expected_high
    assert by_pot["Medium"] == expected_medium
    assert by_pot["Low"] == expected_low

    # Total should match number of employees
    assert by_pot["High"] + by_pot["Medium"] + by_pot["Low"] == len(sample_employees)


def test_calculate_distribution_when_called_then_tracks_modified_count(
    statistics_service: StatisticsService, sample_employees: list[Employee]
) -> None:
    """Test that modified count is tracked."""
    # Mark some employees as modified
    sample_employees[0].modified_in_session = True
    sample_employees[2].modified_in_session = True

    stats = statistics_service.calculate_distribution(sample_employees)

    assert stats["modified_employees"] == 2


def test_calculate_distribution_when_called_then_tracks_high_performers(
    statistics_service: StatisticsService, sample_employees: list[Employee]
) -> None:
    """Test that high performers count is tracked.

    MIGRATION NOTE (2025-12-28):
    Updated to work with rich sample data by calculating expected count from data.
    """
    stats = statistics_service.calculate_distribution(sample_employees)

    # Calculate expected count from actual data
    expected_high_performers = sum(
        1 for e in sample_employees if e.performance == PerformanceLevel.HIGH
    )

    assert stats["high_performers"] == expected_high_performers


def test_calculate_distribution_when_empty_list_then_returns_zero_stats(
    statistics_service: StatisticsService,
) -> None:
    """Test statistics with empty employee list."""
    stats = statistics_service.calculate_distribution([])

    assert stats["total_employees"] == 0
    assert stats["modified_employees"] == 0

    # All boxes should have 0 count and 0%
    dist = {item["grid_position"]: item for item in stats["distribution"]}
    for i in range(1, 10):
        assert dist[i]["count"] == 0
        assert dist[i]["percentage"] == 0


def test_calculate_distribution_when_single_employee_then_returns_100_percent(
    statistics_service: StatisticsService, sample_employees: list[Employee]
) -> None:
    """Test statistics with single employee."""
    single_emp = [sample_employees[0]]

    stats = statistics_service.calculate_distribution(single_emp)

    assert stats["total_employees"] == 1
    dist = {item["grid_position"]: item for item in stats["distribution"]}

    # Find the position of the single employee
    employee_position = sample_employees[0].grid_position

    assert dist[employee_position]["count"] == 1
    assert dist[employee_position]["percentage"] == 100.0



def test_calculate_distribution_when_called_then_includes_total_count(
    statistics_service: StatisticsService, sample_employees: list[Employee]
) -> None:
    """Test that total count is included.

    MIGRATION NOTE (2025-12-28):
    Updated to work with rich sample data by using actual employee count.
    """
    stats = statistics_service.calculate_distribution(sample_employees)

    assert stats["total_employees"] == len(sample_employees)


def test_get_box_label_when_all_positions_then_returns_correct_labels() -> None:
    """Test box label generation for all positions."""
    assert get_position_label_by_number(9) == "Star [H,H]"
    assert get_position_label_by_number(8) == "Growth [M,H]"
    assert get_position_label_by_number(7) == "Enigma [L,H]"
    assert get_position_label_by_number(6) == "High Impact [H,M]"
    assert get_position_label_by_number(5) == "Core Talent [M,M]"
    assert get_position_label_by_number(4) == "Inconsistent [L,M]"
    assert get_position_label_by_number(3) == "Workhorse [H,L]"
    assert get_position_label_by_number(2) == "Effective Pro [M,L]"
    assert get_position_label_by_number(1) == "Underperformer [L,L]"


def test_calculate_distribution_when_percentage_calculation_then_rounds_correctly(
    statistics_service: StatisticsService,
) -> None:
    """Test that percentage calculations round correctly."""
    from datetime import date  # noqa: PLC0415

    # Create 3 employees for non-round percentages
    employees = [
        Employee(
            employee_id=i,
            name=f"Employee {i}",
            business_title="Title",
            job_title="Title",
            job_profile="ProfileUSA",
            job_level="MT1",
            job_function="Other",
            location="USA",
            manager="Manager",
            hire_date=date.today(),
            tenure_category="1-3 years",
            time_in_job_profile="1 year",
            performance=PerformanceLevel.HIGH,
            potential=PotentialLevel.HIGH,
            grid_position=9,
            position_label="Star [H,H]",
            talent_indicator="High",
        )
        for i in range(3)
    ]

    stats = statistics_service.calculate_distribution(employees)

    # 3 employees in position 9 should be 100%
    dist = {item["grid_position"]: item for item in stats["distribution"]}
    assert dist[9]["percentage"] == 100.0
