"""Tests for calibration summary service."""

from datetime import date

import pytest

from ninebox.models.employee import Employee, PerformanceLevel, PotentialLevel
from ninebox.services.calibration_summary_service import CalibrationSummaryService

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
) -> Employee:
    """Create a test employee with specified attributes."""
    return Employee(
        employee_id=emp_id,
        name=f"Employee {emp_id}",
        business_title="Test Title",
        job_title="Test Job",
        job_profile=f"{function}-{location}",
        job_level=level,
        job_function=function,
        location=location,
        direct_manager="Test Manager",
        hire_date=date(2020, 1, 1),
        tenure_category=tenure,
        time_in_job_profile="1-2 years",
        performance=performance,
        potential=potential,
        grid_position=grid_position,
        talent_indicator="Test Indicator",
    )


class TestCalibrationSummaryService:
    """Tests for CalibrationSummaryService."""

    @pytest.fixture
    def service(self) -> CalibrationSummaryService:
        """Create a calibration summary service instance."""
        return CalibrationSummaryService()

    def test_calculate_summary_empty_employees(
        self, service: CalibrationSummaryService
    ) -> None:
        """Test that empty employee list returns empty structure."""
        result = service.calculate_summary([])

        assert result["data_overview"]["total_employees"] == 0
        assert result["time_allocation"]["estimated_duration_minutes"] == 0
        assert result["insights"] == []

    def test_calculate_summary_single_employee(
        self, service: CalibrationSummaryService
    ) -> None:
        """Test summary with single employee edge case."""
        employees = [create_employee(1, grid_position=5)]

        result = service.calculate_summary(employees)

        assert result["data_overview"]["total_employees"] == 1
        assert result["data_overview"]["center_box_count"] == 1
        assert result["time_allocation"]["estimated_duration_minutes"] >= 30  # Min bound

    def test_data_overview_counts_stars(
        self, service: CalibrationSummaryService
    ) -> None:
        """Test that stars (position 9) are counted correctly."""
        employees = [
            create_employee(1, grid_position=9),  # Star
            create_employee(2, grid_position=9),  # Star
            create_employee(3, grid_position=5),  # Center box
        ]

        result = service.calculate_summary(employees)
        overview = result["data_overview"]

        assert overview["stars_count"] == 2
        assert overview["stars_percentage"] == pytest.approx(66.67, rel=0.1)
        assert overview["center_box_count"] == 1

    def test_data_overview_counts_lower_performers(
        self, service: CalibrationSummaryService
    ) -> None:
        """Test that lower performers (positions 1, 2, 4) are counted correctly."""
        employees = [
            create_employee(1, grid_position=1),  # Underperformer (lower)
            create_employee(2, grid_position=2),  # Effective Pro (lower)
            create_employee(3, grid_position=4),  # Inconsistent (lower)
            create_employee(4, grid_position=5),  # Center box (not lower)
        ]

        result = service.calculate_summary(employees)
        overview = result["data_overview"]

        assert overview["lower_performers_count"] == 3
        assert overview["lower_performers_percentage"] == 75.0

    def test_time_allocation_minimum_bound(
        self, service: CalibrationSummaryService
    ) -> None:
        """Test that time allocation has minimum bound of 30 minutes."""
        employees = [create_employee(1)]

        result = service.calculate_summary(employees)

        assert result["time_allocation"]["estimated_duration_minutes"] >= 30

    def test_time_allocation_maximum_bound(
        self, service: CalibrationSummaryService
    ) -> None:
        """Test that time allocation has maximum bound of 480 minutes."""
        # Create many employees to exceed max
        employees = [create_employee(i) for i in range(1000)]

        result = service.calculate_summary(employees)

        assert result["time_allocation"]["estimated_duration_minutes"] <= 480

    def test_time_allocation_breakdown_by_level(
        self, service: CalibrationSummaryService
    ) -> None:
        """Test that time breakdown is provided by job level."""
        employees = [
            create_employee(1, level="MT3"),
            create_employee(2, level="MT3"),
            create_employee(3, level="MT5"),
        ]

        result = service.calculate_summary(employees)
        breakdown = result["time_allocation"]["breakdown_by_level"]

        # Should have at least one level breakdown
        assert len(breakdown) > 0

        # Each breakdown item should have required fields
        for item in breakdown:
            assert "level" in item
            assert "employee_count" in item
            assert "minutes" in item
            assert "percentage" in item

    def test_time_allocation_percentages_sum_correctly(
        self, service: CalibrationSummaryService
    ) -> None:
        """Test that time breakdown percentages are calculated correctly."""
        employees = [
            create_employee(1, level="MT3", grid_position=5),
            create_employee(2, level="MT3", grid_position=5),
            create_employee(3, level="MT5", grid_position=5),
            create_employee(4, level="MT5", grid_position=5),
        ]

        result = service.calculate_summary(employees)
        breakdown = result["time_allocation"]["breakdown_by_level"]

        if breakdown:
            # Percentages should not exceed 100%
            total_pct = sum(item["percentage"] for item in breakdown)
            assert total_pct <= 100.0

    def test_time_allocation_lower_performers_get_more_time(
        self, service: CalibrationSummaryService
    ) -> None:
        """Test that lower performers (position 1) get more time than center box.

        Uses enough employees to exceed the minimum time bound (30 minutes)
        so the difference in time multipliers becomes visible.
        """
        # Create 30 employees at position 1 (underperformers) - multiplier 1.5x
        lower_performers = [
            create_employee(i, level="MT5", grid_position=1) for i in range(30)
        ]

        # Create 30 employees at position 5 (center box) - multiplier 0.8x
        center_box = [
            create_employee(i + 100, level="MT5", grid_position=5) for i in range(30)
        ]

        result_lower = service.calculate_summary(lower_performers)
        result_center = service.calculate_summary(center_box)

        # Lower performers should get more time total
        # (Both exceed min bound so multipliers apply)
        assert result_lower["time_allocation"]["estimated_duration_minutes"] > \
               result_center["time_allocation"]["estimated_duration_minutes"]

    def test_insights_generated_for_crowded_center_box(
        self, service: CalibrationSummaryService
    ) -> None:
        """Test that insight is generated when center box is too crowded."""
        # Create 60% center box employees
        employees = [
            create_employee(i, grid_position=5) for i in range(60)
        ] + [
            create_employee(i + 100, grid_position=9) for i in range(40)
        ]

        result = service.calculate_summary(employees)
        insights = result["insights"]

        # Should have at least one focus_area insight about crowded center
        focus_insights = [i for i in insights if i["type"] == "focus_area"]
        assert len(focus_insights) > 0

    def test_insights_have_required_fields(
        self, service: CalibrationSummaryService
    ) -> None:
        """Test that all insights have required fields."""
        employees = [create_employee(i, grid_position=i % 9 + 1) for i in range(50)]

        result = service.calculate_summary(employees)
        insights = result["insights"]

        for insight in insights:
            assert "id" in insight
            assert "type" in insight
            assert "category" in insight
            assert "priority" in insight
            assert "title" in insight
            assert "description" in insight
            assert "affected_count" in insight
            assert "source_data" in insight

    def test_insight_ids_are_unique(
        self, service: CalibrationSummaryService
    ) -> None:
        """Test that all insight IDs are unique."""
        employees = [create_employee(i, grid_position=i % 9 + 1) for i in range(100)]

        result = service.calculate_summary(employees)
        insights = result["insights"]

        ids = [i["id"] for i in insights]
        assert len(ids) == len(set(ids)), "Insight IDs should be unique"

    def test_insight_id_format(
        self, service: CalibrationSummaryService
    ) -> None:
        """Test that insight IDs follow expected format."""
        import re

        employees = [create_employee(i, grid_position=i % 9 + 1) for i in range(50)]

        result = service.calculate_summary(employees)
        insights = result["insights"]

        # Expected format: type-description-hexid
        pattern = re.compile(r"^[a-z]+-[a-z0-9-]+-[a-f0-9]{8}$")

        for insight in insights:
            assert pattern.match(insight["id"]), f"Invalid insight ID format: {insight['id']}"

    def test_by_level_grouping(
        self, service: CalibrationSummaryService
    ) -> None:
        """Test that employees are correctly grouped by level."""
        employees = [
            create_employee(1, level="MT1"),
            create_employee(2, level="MT1"),
            create_employee(3, level="MT5"),
        ]

        result = service.calculate_summary(employees)
        overview = result["data_overview"]

        assert "by_level" in overview
        assert overview["by_level"].get("MT1", 0) == 2
        assert overview["by_level"].get("MT5", 0) == 1

    def test_by_function_grouping(
        self, service: CalibrationSummaryService
    ) -> None:
        """Test that employees are correctly grouped by function."""
        employees = [
            create_employee(1, function="Engineering"),
            create_employee(2, function="Engineering"),
            create_employee(3, function="Sales"),
        ]

        result = service.calculate_summary(employees)
        overview = result["data_overview"]

        assert "by_function" in overview
        assert overview["by_function"].get("Engineering", 0) == 2
        assert overview["by_function"].get("Sales", 0) == 1

    def test_by_location_grouping(
        self, service: CalibrationSummaryService
    ) -> None:
        """Test that employees are correctly grouped by location."""
        employees = [
            create_employee(1, location="USA"),
            create_employee(2, location="USA"),
            create_employee(3, location="India"),
        ]

        result = service.calculate_summary(employees)
        overview = result["data_overview"]

        assert "by_location" in overview
        assert overview["by_location"].get("USA", 0) == 2
        assert overview["by_location"].get("India", 0) == 1

    def test_suggested_sequence_not_empty(
        self, service: CalibrationSummaryService
    ) -> None:
        """Test that suggested sequence is provided when employees exist."""
        employees = [create_employee(i, level=f"MT{i % 5 + 1}") for i in range(10)]

        result = service.calculate_summary(employees)

        assert len(result["time_allocation"]["suggested_sequence"]) > 0
        assert "Intelligence Sweep" in result["time_allocation"]["suggested_sequence"]


class TestLevelNormalization:
    """Tests for level normalization logic."""

    @pytest.fixture
    def service(self) -> CalibrationSummaryService:
        """Create a calibration summary service instance."""
        return CalibrationSummaryService()

    def test_normalize_mt_levels(
        self, service: CalibrationSummaryService
    ) -> None:
        """Test normalization of MT-prefixed levels."""
        employees = [
            create_employee(1, level="MT1"),
            create_employee(2, level="mt2"),  # lowercase
            create_employee(3, level="MT10"),
        ]

        result = service.calculate_summary(employees)
        breakdown = result["time_allocation"]["breakdown_by_level"]

        # Should have some breakdown entries
        assert len(breakdown) > 0

    def test_normalize_keyword_levels(
        self, service: CalibrationSummaryService
    ) -> None:
        """Test normalization of keyword-based levels."""
        employees = [
            create_employee(1, level="Senior Director"),
            create_employee(2, level="VP of Engineering"),
            create_employee(3, level="Manager"),
        ]

        result = service.calculate_summary(employees)

        # Should complete without error
        assert result["data_overview"]["total_employees"] == 3


class TestEdgeCases:
    """Tests for edge cases and error handling."""

    @pytest.fixture
    def service(self) -> CalibrationSummaryService:
        """Create a calibration summary service instance."""
        return CalibrationSummaryService()

    def test_employee_with_empty_string_values(
        self, service: CalibrationSummaryService
    ) -> None:
        """Test handling of employees with empty string values."""
        employee = Employee(
            employee_id=1,
            name="Test Employee",
            business_title="",
            job_title="",
            job_profile="",
            job_level="",
            job_function="",
            location="",
            direct_manager="",
            hire_date=date(2020, 1, 1),
            tenure_category="",
            time_in_job_profile="",
            performance=PerformanceLevel.MEDIUM,
            potential=PotentialLevel.MEDIUM,
            grid_position=5,
            talent_indicator="",
        )

        # Should not raise an error
        result = service.calculate_summary([employee])

        assert result["data_overview"]["total_employees"] == 1

    def test_all_same_grid_position(
        self, service: CalibrationSummaryService
    ) -> None:
        """Test with all employees at same position."""
        employees = [create_employee(i, grid_position=9) for i in range(20)]

        result = service.calculate_summary(employees)

        assert result["data_overview"]["stars_count"] == 20
        assert result["data_overview"]["stars_percentage"] == 100.0

    def test_large_employee_count(
        self, service: CalibrationSummaryService
    ) -> None:
        """Test with large number of employees."""
        employees = [create_employee(i, grid_position=i % 9 + 1) for i in range(500)]

        result = service.calculate_summary(employees)

        assert result["data_overview"]["total_employees"] == 500
        # Should hit max time bound
        assert result["time_allocation"]["estimated_duration_minutes"] <= 480
