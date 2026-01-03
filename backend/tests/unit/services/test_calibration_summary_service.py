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
        result = service.calculate_summary([], use_agent=False)

        assert result["data_overview"]["total_employees"] == 0
        assert result["time_allocation"]["estimated_duration_minutes"] == 0
        assert result["insights"] == []

    def test_calculate_summary_single_employee(
        self, service: CalibrationSummaryService
    ) -> None:
        """Test summary with single employee edge case."""
        employees = [create_employee(1, grid_position=5)]

        result = service.calculate_summary(employees, use_agent=False)

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

        result = service.calculate_summary(employees, use_agent=False)
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

        result = service.calculate_summary(employees, use_agent=False)
        overview = result["data_overview"]

        assert overview["lower_performers_count"] == 3
        assert overview["lower_performers_percentage"] == 75.0

    def test_time_allocation_minimum_bound(
        self, service: CalibrationSummaryService
    ) -> None:
        """Test that time allocation has minimum bound of 30 minutes."""
        employees = [create_employee(1)]

        result = service.calculate_summary(employees, use_agent=False)

        assert result["time_allocation"]["estimated_duration_minutes"] >= 30

    def test_time_allocation_maximum_bound(
        self, service: CalibrationSummaryService
    ) -> None:
        """Test that time allocation has maximum bound of 480 minutes."""
        # Create many employees to exceed max
        employees = [create_employee(i) for i in range(1000)]

        result = service.calculate_summary(employees, use_agent=False)

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

        result = service.calculate_summary(employees, use_agent=False)
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

        result = service.calculate_summary(employees, use_agent=False)
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

        result = service.calculate_summary(employees, use_agent=False)
        insights = result["insights"]

        # Should have at least one focus_area insight about crowded center
        focus_insights = [i for i in insights if i["type"] == "focus_area"]
        assert len(focus_insights) > 0

    def test_insights_have_required_fields(
        self, service: CalibrationSummaryService
    ) -> None:
        """Test that all insights have required fields."""
        employees = [create_employee(i, grid_position=i % 9 + 1) for i in range(50)]

        result = service.calculate_summary(employees, use_agent=False)
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

        result = service.calculate_summary(employees, use_agent=False)
        insights = result["insights"]

        ids = [i["id"] for i in insights]
        assert len(ids) == len(set(ids)), "Insight IDs should be unique"

    def test_insight_id_format(
        self, service: CalibrationSummaryService
    ) -> None:
        """Test that insight IDs follow expected format."""
        import re

        employees = [create_employee(i, grid_position=i % 9 + 1) for i in range(50)]

        result = service.calculate_summary(employees, use_agent=False)
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

        result = service.calculate_summary(employees, use_agent=False)
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

        result = service.calculate_summary(employees, use_agent=False)
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

        result = service.calculate_summary(employees, use_agent=False)
        overview = result["data_overview"]

        assert "by_location" in overview
        assert overview["by_location"].get("USA", 0) == 2
        assert overview["by_location"].get("India", 0) == 1

    def test_suggested_sequence_not_empty(
        self, service: CalibrationSummaryService
    ) -> None:
        """Test that suggested sequence is provided when employees exist."""
        employees = [create_employee(i, level=f"MT{i % 5 + 1}") for i in range(10)]

        result = service.calculate_summary(employees, use_agent=False)

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

        result = service.calculate_summary(employees, use_agent=False)
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

        result = service.calculate_summary(employees, use_agent=False)

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
        result = service.calculate_summary([employee], use_agent=False)

        assert result["data_overview"]["total_employees"] == 1

    def test_all_same_grid_position(
        self, service: CalibrationSummaryService
    ) -> None:
        """Test with all employees at same position."""
        employees = [create_employee(i, grid_position=9) for i in range(20)]

        result = service.calculate_summary(employees, use_agent=False)

        assert result["data_overview"]["stars_count"] == 20
        assert result["data_overview"]["stars_percentage"] == 100.0

    def test_large_employee_count(
        self, service: CalibrationSummaryService
    ) -> None:
        """Test with large number of employees."""
        employees = [create_employee(i, grid_position=i % 9 + 1) for i in range(500)]

        result = service.calculate_summary(employees, use_agent=False)

        assert result["data_overview"]["total_employees"] == 500
        # Should hit max time bound
        assert result["time_allocation"]["estimated_duration_minutes"] <= 480


class TestInsightIDDeterminism:
    """Tests for deterministic insight ID generation."""

    @pytest.fixture
    def service(self) -> CalibrationSummaryService:
        """Create a calibration summary service instance."""
        return CalibrationSummaryService()

    def test_insight_ids_are_deterministic(
        self, service: CalibrationSummaryService
    ) -> None:
        """Test that same input produces same insight IDs."""
        employees = [
            create_employee(i, grid_position=5) for i in range(60)
        ]  # Will trigger center box warning

        # Generate summary twice
        result1 = service.calculate_summary(employees, use_agent=False)
        result2 = service.calculate_summary(employees, use_agent=False)

        # Extract IDs from both results
        ids1 = {insight["id"] for insight in result1["insights"]}
        ids2 = {insight["id"] for insight in result2["insights"]}

        # IDs should be identical
        assert ids1 == ids2, "Insight IDs should be deterministic"

    def test_different_data_produces_different_ids(
        self, service: CalibrationSummaryService
    ) -> None:
        """Test that different input produces different insight IDs."""
        employees1 = [create_employee(i, grid_position=5) for i in range(60)]
        employees2 = [create_employee(i, grid_position=5) for i in range(70)]

        result1 = service.calculate_summary(employees1)
        result2 = service.calculate_summary(employees2)

        # Find center box insights (should exist in both)
        center_insights1 = [i for i in result1["insights"] if "center box" in i["title"].lower()]
        center_insights2 = [i for i in result2["insights"] if "center box" in i["title"].lower()]

        # IDs should be different (different affected counts)
        if center_insights1 and center_insights2:
            assert center_insights1[0]["id"] != center_insights2[0]["id"]

    def test_generate_insight_id_uses_all_components(
        self, service: CalibrationSummaryService
    ) -> None:
        """Test that insight ID generation uses all provided components."""
        # Generate ID with same prefix but different components
        id1 = service._generate_insight_id("test", "component1", 100)
        id2 = service._generate_insight_id("test", "component1", 200)
        id3 = service._generate_insight_id("test", "component2", 100)

        # All IDs should be different
        assert id1 != id2, "Different numerical components should produce different IDs"
        assert id1 != id3, "Different string components should produce different IDs"
        assert id2 != id3, "Different components should produce different IDs"

        # All should start with prefix
        assert id1.startswith("test-")
        assert id2.startswith("test-")
        assert id3.startswith("test-")

    def test_insight_id_format_is_consistent(
        self, service: CalibrationSummaryService
    ) -> None:
        """Test that insight IDs follow consistent format."""
        import re

        employees = [create_employee(i, grid_position=i % 9 + 1) for i in range(50)]
        result = service.calculate_summary(employees, use_agent=False)

        # Pattern: prefix (can have dashes) followed by 8 hex chars
        # Examples: "focus-a1b2c3d4", "rec-time-allocation-73c1ab20"
        pattern = re.compile(r"^[a-z]+(?:-[a-z0-9]+)*-[a-f0-9]{8}$")

        for insight in result["insights"]:
            assert pattern.match(
                insight["id"]
            ), f"Insight ID '{insight['id']}' doesn't match expected format"


class TestInsightTransformation:
    """Tests for insight transformation and structure."""

    @pytest.fixture
    def service(self) -> CalibrationSummaryService:
        """Create a calibration summary service instance."""
        return CalibrationSummaryService()

    def test_insights_have_required_structure(
        self, service: CalibrationSummaryService
    ) -> None:
        """Test that all insights have required fields with correct types."""
        employees = [create_employee(i, grid_position=5) for i in range(60)]
        result = service.calculate_summary(employees, use_agent=False)

        for insight in result["insights"]:
            # Required string fields
            assert isinstance(insight["id"], str) and len(insight["id"]) > 0
            assert isinstance(insight["type"], str) and len(insight["type"]) > 0
            assert isinstance(insight["category"], str) and len(insight["category"]) > 0
            assert isinstance(insight["priority"], str) and insight["priority"] in ["high", "medium", "low"]
            assert isinstance(insight["title"], str) and len(insight["title"]) > 0
            assert isinstance(insight["description"], str) and len(insight["description"]) > 0

            # Required numerical fields
            assert isinstance(insight["affected_count"], int) and insight["affected_count"] >= 0

            # Required dict field
            assert isinstance(insight["source_data"], dict)

    def test_distribution_insights_priority_mapping(
        self, service: CalibrationSummaryService
    ) -> None:
        """Test that distribution insights are assigned correct priorities."""
        # Create employees to trigger various distribution insights
        employees = [
            *[create_employee(i, grid_position=9) for i in range(3)],  # 3 stars (3%)
            *[create_employee(i + 100, grid_position=5) for i in range(52)],  # 52 center (52%)
            *[create_employee(i + 200, grid_position=1) for i in range(45)],  # 45 lower
        ]  # Total: 100

        result = service.calculate_summary(employees, use_agent=False)

        # Find specific insights - check title patterns
        low_stars = [i for i in result["insights"] if "Star" in i["title"] and "3%" in i["title"]]
        crowded_center = [i for i in result["insights"] if "center box" in i["title"].lower()]

        # Low stars should be high priority
        if low_stars:
            # Should be flagged as high priority (succession risk)
            assert any(i["priority"] == "high" for i in low_stars)

        # Crowded center should be medium priority
        if crowded_center:
            assert crowded_center[0]["priority"] == "medium"

    def test_anomaly_insights_include_statistical_data(
        self, service: CalibrationSummaryService
    ) -> None:
        """Test that anomaly insights include statistical source data."""
        # Create distribution that will trigger anomaly detection
        employees = [create_employee(i, grid_position=i % 9 + 1) for i in range(100)]

        result = service.calculate_summary(employees, use_agent=False)

        # Find anomaly insights
        anomalies = [i for i in result["insights"] if i["type"] == "anomaly"]

        for anomaly in anomalies:
            source = anomaly["source_data"]
            # Should have statistical measures (at least one of these)
            has_stats = (
                "z_score" in source
                or "p_value" in source
                or "observed_pct" in source
                or "expected_pct" in source
            )
            assert has_stats, f"Anomaly insight missing statistical data: {anomaly['id']}"


class TestTimeAllocationEdgeCases:
    """Tests for time allocation calculation edge cases."""

    @pytest.fixture
    def service(self) -> CalibrationSummaryService:
        """Create a calibration summary service instance."""
        return CalibrationSummaryService()

    def test_time_allocation_with_all_lower_performers(
        self, service: CalibrationSummaryService
    ) -> None:
        """Test time allocation when all employees are lower performers."""
        # All at position 1 (highest multiplier 1.5x)
        employees = [create_employee(i, level="MT5", grid_position=1) for i in range(20)]

        result = service.calculate_summary(employees, use_agent=False)

        # Should allocate more time due to higher multiplier
        base_time = 20 * 2 * 0.8  # If they were all center box (0.8x)
        actual_time = result["time_allocation"]["estimated_duration_minutes"]

        assert actual_time > base_time, "Lower performers should get more time"

    def test_time_allocation_breakdown_sums_correctly(
        self, service: CalibrationSummaryService
    ) -> None:
        """Test that time breakdown minutes sum to near total (accounting for intelligence sweep)."""
        employees = [
            *[create_employee(i, level="MT3") for i in range(10)],
            *[create_employee(i + 20, level="MT5") for i in range(15)],
            *[create_employee(i + 40, level="MT7") for i in range(8)],
        ]

        result = service.calculate_summary(employees, use_agent=False)

        breakdown_total = sum(item["minutes"] for item in result["time_allocation"]["breakdown_by_level"])
        estimated_total = result["time_allocation"]["estimated_duration_minutes"]

        # Breakdown should be less than total (intelligence sweep adds time)
        assert breakdown_total < estimated_total
        # But should be close (within 20 minutes typically)
        assert abs(estimated_total - breakdown_total) < 30

    def test_suggested_sequence_includes_all_levels(
        self, service: CalibrationSummaryService
    ) -> None:
        """Test that suggested sequence includes all levels present in data."""
        employees = [
            *[create_employee(i, level="MT3") for i in range(5)],  # IC
            *[create_employee(i + 10, level="MT5") for i in range(5)],  # Manager
            *[create_employee(i + 20, level="MT7") for i in range(5)],  # Director
        ]

        result = service.calculate_summary(employees, use_agent=False)

        sequence = result["time_allocation"]["suggested_sequence"]

        # Should include all normalized levels
        assert "IC" in sequence
        assert "Manager" in sequence
        assert "Director" in sequence
        # Should always end with Intelligence Sweep
        assert sequence[-1] == "Intelligence Sweep"


class TestDataOverviewCalculations:
    """Tests for data overview calculation accuracy."""

    @pytest.fixture
    def service(self) -> CalibrationSummaryService:
        """Create a calibration summary service instance."""
        return CalibrationSummaryService()

    def test_data_overview_percentages_are_accurate(
        self, service: CalibrationSummaryService
    ) -> None:
        """Test that all percentage calculations are mathematically accurate."""
        employees = [
            *[create_employee(i, grid_position=9) for i in range(15)],  # Stars
            *[create_employee(i + 20, grid_position=5) for i in range(50)],  # Center
            *[create_employee(i + 100, grid_position=1) for i in range(10)],  # Lower (pos 1)
            *[create_employee(i + 120, grid_position=2) for i in range(15)],  # Lower (pos 2)
            *[create_employee(i + 140, grid_position=4) for i in range(10)],  # Lower (pos 4)
        ]  # Total: 100

        result = service.calculate_summary(employees, use_agent=False)
        overview = result["data_overview"]

        # Verify counts
        assert overview["stars_count"] == 15
        assert overview["center_box_count"] == 50
        assert overview["lower_performers_count"] == 35  # 10 + 15 + 10

        # Verify percentages
        assert overview["stars_percentage"] == 15.0
        assert overview["center_box_percentage"] == 50.0
        assert overview["lower_performers_percentage"] == 35.0

    def test_data_overview_groupings_are_complete(
        self, service: CalibrationSummaryService
    ) -> None:
        """Test that all employees are counted in groupings."""
        employees = [
            create_employee(1, level="MT3", function="Engineering", location="NYC"),
            create_employee(2, level="MT3", function="Sales", location="SF"),
            create_employee(3, level="MT5", function="Engineering", location="NYC"),
        ]

        result = service.calculate_summary(employees, use_agent=False)
        overview = result["data_overview"]

        # Verify level grouping
        assert sum(overview["by_level"].values()) == 3
        assert overview["by_level"]["MT3"] == 2
        assert overview["by_level"]["MT5"] == 1

        # Verify function grouping
        assert sum(overview["by_function"].values()) == 3
        assert overview["by_function"]["Engineering"] == 2
        assert overview["by_function"]["Sales"] == 1

        # Verify location grouping
        assert sum(overview["by_location"].values()) == 3
        assert overview["by_location"]["NYC"] == 2
        assert overview["by_location"]["SF"] == 1

    def test_high_performers_includes_correct_positions(
        self, service: CalibrationSummaryService
    ) -> None:
        """Test that high performers count includes positions 3, 6, and 9."""
        employees = [
            create_employee(1, grid_position=3),  # High performer
            create_employee(2, grid_position=6),  # High performer
            create_employee(3, grid_position=9),  # High performer (star)
            create_employee(4, grid_position=5),  # Not high performer
            create_employee(5, grid_position=1),  # Not high performer
        ]

        result = service.calculate_summary(employees, use_agent=False)
        overview = result["data_overview"]

        assert overview["high_performers_count"] == 3
        assert overview["high_performers_percentage"] == 60.0  # 3/5 = 60%
