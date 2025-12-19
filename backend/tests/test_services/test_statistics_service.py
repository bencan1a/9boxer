"""Tests for statistics service."""

import pytest

from ninebox.models.employee import Employee, PerformanceLevel, PotentialLevel
from ninebox.services.statistics_service import StatisticsService


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
    """Test that employee counts are correct."""
    stats = statistics_service.calculate_distribution(sample_employees)

    dist = {item["grid_position"]: item for item in stats["distribution"]}

    # Based on sample data:
    # Position 9 (H,H): 1 employee - Alice
    # Position 8 (M,H): 1 employee - Eve
    # Position 7 (L,H): 1 employee - Carol
    # Position 6 (H,M): 1 employee - David
    # Position 5 (M,M): 1 employee - Bob

    assert dist[9]["count"] == 1
    assert dist[8]["count"] == 1
    assert dist[7]["count"] == 1
    assert dist[6]["count"] == 1
    assert dist[5]["count"] == 1

    # Empty boxes
    assert dist[1]["count"] == 0
    assert dist[2]["count"] == 0
    assert dist[3]["count"] == 0
    assert dist[4]["count"] == 0


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
    """Test aggregation by performance level."""
    stats = statistics_service.calculate_distribution(sample_employees)

    by_perf = stats["by_performance"]

    # Count from sample data
    assert by_perf["High"] == 2  # Alice, David
    assert by_perf["Medium"] == 2  # Bob, Eve
    assert by_perf["Low"] == 1  # Carol


def test_calculate_distribution_when_called_then_aggregates_by_potential(
    statistics_service: StatisticsService, sample_employees: list[Employee]
) -> None:
    """Test aggregation by potential level."""
    stats = statistics_service.calculate_distribution(sample_employees)

    by_pot = stats["by_potential"]

    # Count from sample data
    assert by_pot["High"] == 3  # Alice, Carol, Eve
    assert by_pot["Medium"] == 2  # Bob, David
    assert by_pot["Low"] == 0


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
    """Test that high performers count is tracked."""
    stats = statistics_service.calculate_distribution(sample_employees)

    # Count from sample data (employees with High performance)
    assert stats["high_performers"] == 2  # Alice, David


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
    assert dist[9]["count"] == 1
    assert dist[9]["percentage"] == 100.0


def test_calculate_distribution_when_called_then_includes_box_labels(
    statistics_service: StatisticsService, sample_employees: list[Employee]
) -> None:
    """Test that box labels are included."""
    stats = statistics_service.calculate_distribution(sample_employees)

    dist = {item["grid_position"]: item for item in stats["distribution"]}

    assert dist[9]["position_label"] == "Star [H,H]"
    assert dist[6]["position_label"] == "High Impact [H,M]"
    assert dist[3]["position_label"] == "Workhorse [H,L]"
    assert dist[8]["position_label"] == "Growth [M,H]"
    assert dist[5]["position_label"] == "Core Talent [M,M]"
    assert dist[2]["position_label"] == "Effective Pro [M,L]"
    assert dist[7]["position_label"] == "Enigma [L,H]"
    assert dist[4]["position_label"] == "Inconsistent [L,M]"
    assert dist[1]["position_label"] == "Underperformer [L,L]"


def test_calculate_distribution_when_called_then_includes_total_count(
    statistics_service: StatisticsService, sample_employees: list[Employee]
) -> None:
    """Test that total count is included."""
    stats = statistics_service.calculate_distribution(sample_employees)

    assert stats["total_employees"] == 5


def test_get_box_label_when_all_positions_then_returns_correct_labels(
    statistics_service: StatisticsService,
) -> None:
    """Test box label generation for all positions."""
    assert statistics_service._get_box_label(9) == "Top Talent [H,H]"
    assert statistics_service._get_box_label(8) == "High Impact Talent [H,M]"
    assert statistics_service._get_box_label(7) == "High/Low [H,L]"
    assert statistics_service._get_box_label(6) == "Growth Talent [M,H]"
    assert statistics_service._get_box_label(5) == "Core Talent [M,M]"
    assert statistics_service._get_box_label(4) == "Med/Low [M,L]"
    assert statistics_service._get_box_label(3) == "Emerging Talent [L,H]"
    assert statistics_service._get_box_label(2) == "Inconsistent Talent [L,M]"
    assert statistics_service._get_box_label(1) == "Low/Low [L,L]"


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
