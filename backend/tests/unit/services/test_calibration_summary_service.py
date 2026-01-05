"""Tests for calibration summary service."""

from datetime import date
from unittest.mock import MagicMock, patch

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

        # Expected format: type-description-hexid (16 hex chars for 64-bit collision resistance)
        pattern = re.compile(r"^[a-z]+-[a-z0-9-]+-[a-f0-9]{16}$")

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

        # Pattern: prefix (can have dashes) followed by 16 hex chars (64-bit collision resistance)
        # Examples: "focus-a1b2c3d4e5f6g7h8", "rec-time-allocation-73c1ab20a1b2c3d4"
        pattern = re.compile(r"^[a-z]+(?:-[a-z0-9]+)*-[a-f0-9]{16}$")

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
        """Test that high performers count includes positions 6, 8, and 9 (top 20% tier).

        Note: Position 3 (Workhorse - High Performance, Low Potential) is NOT
        considered a high performer for succession planning purposes.
        """
        employees = [
            create_employee(1, grid_position=6),  # High performer (High Impact)
            create_employee(2, grid_position=8),  # High performer (Growth)
            create_employee(3, grid_position=9),  # High performer (Star)
            create_employee(4, grid_position=3),  # NOT high performer (Workhorse)
            create_employee(5, grid_position=5),  # Not high performer (Core Talent)
            create_employee(6, grid_position=1),  # Not high performer (Underperformer)
        ]

        result = service.calculate_summary(employees, use_agent=False)
        overview = result["data_overview"]

        assert overview["high_performers_count"] == 3
        assert overview["high_performers_percentage"] == 50.0  # 3/6 = 50%


# =============================================================================
# AGENT MODE TESTS (Issue #202)
# Tests for use_agent=True path - LLM-powered insight generation
# =============================================================================


class TestAgentModeHappyPath:
    """Tests for agent mode happy path (use_agent=True)."""

    @pytest.fixture
    def mock_llm_service(self) -> MagicMock:
        """Create a mock LLM service."""
        return MagicMock()

    @pytest.fixture
    def service(self, mock_llm_service: MagicMock) -> CalibrationSummaryService:
        """Create a calibration summary service instance with mock LLM."""
        return CalibrationSummaryService(llm_service=mock_llm_service)

    @pytest.fixture
    def mock_llm_response(self) -> dict:
        """Create a realistic LLM response fixture."""
        return {
            "summary": "The calibration data shows 3 key findings: "
            "high concentration in center box, low star percentage, "
            "and significant location-based rating variance.",
            "issues": [
                {
                    "type": "anomaly",
                    "category": "location",
                    "priority": "high",
                    "title": "Seattle office shows significantly higher ratings",
                    "description": "Seattle has 78% high performers vs 62% org average (z=2.8)",
                    "affected_count": 25,
                    "source_data": {
                        "z_score": 2.8,
                        "percentage": 78.0,
                        "expected": 62.0,
                        "segment": "Seattle",
                    },
                    "cluster_id": "geo-patterns",
                    "cluster_title": "Geographic Rating Patterns",
                },
                {
                    "type": "recommendation",
                    "category": "distribution",
                    "priority": "medium",
                    "title": "Consider Donut Mode for center box differentiation",
                    "description": "52% in center box may indicate avoidance of differentiation",
                    "affected_count": 130,
                    "source_data": {
                        "percentage": 52.0,
                        "count": 130,
                    },
                    "cluster_id": None,
                    "cluster_title": None,
                },
            ],
        }

    @patch("ninebox.services.data_packaging_service.package_for_llm")
    def test_calculate_summary_with_agent_mode_success(
        self,
        mock_package: MagicMock,
        mock_llm_service: MagicMock,
        service: CalibrationSummaryService,
        mock_llm_response: dict,
    ) -> None:
        """Test that agent mode successfully calls LLM and returns results."""
        # Setup
        employees = [create_employee(i, grid_position=i % 9 + 1) for i in range(50)]

        mock_package.return_value = {"employees": [], "analyses": {}}
        mock_llm_service.generate_calibration_analysis.return_value = mock_llm_response

        # Execute
        result = service.calculate_summary(employees, use_agent=True)

        # Verify LLM was called
        mock_llm_service.generate_calibration_analysis.assert_called_once()

        # Verify response structure
        assert "data_overview" in result
        assert "time_allocation" in result
        assert "insights" in result
        assert "summary" in result

        # Verify agent-generated content is present
        assert result["summary"] is not None
        assert len(result["insights"]) > 0

    # Removed patch - using mock_llm_service fixture instead
    @patch("ninebox.services.data_packaging_service.package_for_llm")
    def test_agent_mode_returns_agent_insights(
        self,
        mock_package: MagicMock,
        mock_llm_service: MagicMock,
        service: CalibrationSummaryService,
        mock_llm_response: dict,
    ) -> None:
        """Test that agent mode returns insights from the LLM agent."""
        # Setup
        employees = [create_employee(i) for i in range(20)]

        mock_package.return_value = {"employees": [], "analyses": {}}
        mock_llm_service.generate_calibration_analysis.return_value = mock_llm_response

        # Execute
        result = service.calculate_summary(employees, use_agent=True)

        # Verify insights were transformed correctly
        insights = result["insights"]
        assert len(insights) == 2  # From mock_llm_response

        # Verify first insight (anomaly)
        assert insights[0]["type"] == "anomaly"
        assert insights[0]["category"] == "location"
        assert insights[0]["priority"] == "high"
        assert insights[0]["affected_count"] == 25
        assert "id" in insights[0]
        assert insights[0]["id"].startswith("agent-")

        # Verify second insight (recommendation)
        assert insights[1]["type"] == "recommendation"
        assert insights[1]["category"] == "distribution"
        assert insights[1]["priority"] == "medium"

    # Removed patch - using mock_llm_service fixture instead
    @patch("ninebox.services.data_packaging_service.package_for_llm")
    def test_agent_mode_includes_summary_text(
        self,
        mock_package: MagicMock,
        mock_llm_service: MagicMock,
        service: CalibrationSummaryService,
        mock_llm_response: dict,
    ) -> None:
        """Test that agent mode includes AI-generated summary text."""
        # Setup
        employees = [create_employee(i) for i in range(30)]

        mock_package.return_value = {"employees": [], "analyses": {}}
        mock_llm_service.generate_calibration_analysis.return_value = mock_llm_response

        # Execute
        result = service.calculate_summary(employees, use_agent=True)

        # Verify summary is present and matches LLM response
        assert result["summary"] == mock_llm_response["summary"]
        assert "high concentration in center box" in result["summary"]
        assert isinstance(result["summary"], str)
        assert len(result["summary"]) > 0

    # Removed patch - using mock_llm_service fixture instead
    @patch("ninebox.services.data_packaging_service.package_for_llm")
    @patch("ninebox.services.analysis_registry.run_all_analyses")
    def test_agent_mode_calls_llm_service_with_correct_data(
        self,
        mock_analyses: MagicMock,
        mock_package: MagicMock,
        mock_llm_service: MagicMock,
        service: CalibrationSummaryService,
        mock_llm_response: dict,
    ) -> None:
        """Test that agent mode calls LLM service with properly packaged data."""
        # Setup
        employees = [create_employee(i) for i in range(25)]

        mock_analyses.return_value = {"location": {"test": "data"}}
        mock_package_result = {
            "employees": [{"id": 1}],
            "analyses": {"location": {"test": "data"}},
            "org_data": {"total_employees": 25},
        }
        mock_package.return_value = mock_package_result
        mock_llm_service.generate_calibration_analysis.return_value = mock_llm_response

        # Execute
        result = service.calculate_summary(employees, use_agent=True)

        # Verify package_for_llm was called with correct arguments
        mock_package.assert_called_once()
        call_args = mock_package.call_args
        assert len(call_args[0]) == 3  # employees, analyses, org_data
        assert len(call_args[0][0]) == 25  # Employee count

        # Verify LLM was called with the packaged data
        mock_llm_service.generate_calibration_analysis.assert_called_once_with(mock_package_result)

        # Verify result includes insights
        assert len(result["insights"]) > 0


class TestAgentModeFallbackBehavior:
    """Tests for agent mode fallback to legacy when LLM fails."""

    @pytest.fixture
    def mock_llm_service(self) -> MagicMock:
        """Create a mock LLM service."""
        return MagicMock()

    @pytest.fixture
    def service(self, mock_llm_service: MagicMock) -> CalibrationSummaryService:
        """Create a calibration summary service instance with mock LLM."""
        return CalibrationSummaryService(llm_service=mock_llm_service)

    # Removed patch - using mock_llm_service fixture instead
    @patch("ninebox.services.data_packaging_service.package_for_llm")
    def test_agent_mode_fallback_to_legacy_on_llm_error(
        self,
        mock_package: MagicMock,
        mock_llm_service: MagicMock,
        service: CalibrationSummaryService,
    ) -> None:
        """Test that agent mode falls back to legacy when LLM raises an error."""
        # Setup
        employees = [create_employee(i, grid_position=5) for i in range(60)]

        mock_package.return_value = {"employees": [], "analyses": {}}
        mock_llm_service.generate_calibration_analysis.side_effect = RuntimeError("LLM service unavailable")

        # Execute
        result = service.calculate_summary(employees, use_agent=True)

        # Verify fallback occurred - should still return results
        assert "insights" in result
        assert len(result["insights"]) > 0  # Legacy insights generated

        # Verify summary is None (legacy doesn't provide summary)
        assert result["summary"] is None

        # Verify we got legacy insights (e.g., center box warning)
        insight_titles = [i["title"] for i in result["insights"]]
        center_box_insights = [title for title in insight_titles if "center box" in title.lower()]
        assert len(center_box_insights) > 0

    # Removed patch - using mock_llm_service fixture instead
    @patch("ninebox.services.data_packaging_service.package_for_llm")
    def test_agent_mode_fallback_on_malformed_response(
        self,
        mock_package: MagicMock,
        mock_llm_service: MagicMock,
        service: CalibrationSummaryService,
    ) -> None:
        """Test fallback when LLM returns malformed response."""
        # Setup
        employees = [create_employee(i) for i in range(30)]

        mock_package.return_value = {"employees": [], "analyses": {}}
        # Simulate malformed response (missing required fields)
        mock_llm_service.generate_calibration_analysis.side_effect = KeyError("issues")

        # Execute
        result = service.calculate_summary(employees, use_agent=True)

        # Verify fallback to legacy
        assert result["summary"] is None
        assert len(result["insights"]) > 0

    # Removed patch - using mock_llm_service fixture instead
    @patch("ninebox.services.data_packaging_service.package_for_llm")
    def test_agent_mode_fallback_on_package_error(
        self,
        mock_package: MagicMock,
        mock_llm_service: MagicMock,
        service: CalibrationSummaryService,
    ) -> None:
        """Test fallback when data packaging fails."""
        # Setup
        employees = [create_employee(i) for i in range(20)]

        # Simulate packaging error
        mock_package.side_effect = Exception("Packaging failed")

        # Execute
        result = service.calculate_summary(employees, use_agent=True)

        # Verify fallback to legacy
        assert result["summary"] is None
        assert len(result["insights"]) > 0

        # Verify LLM was never called
        mock_llm_service.generate_calibration_analysis.assert_not_called()

    @patch("ninebox.services.data_packaging_service.package_for_llm")
    @patch("ninebox.services.calibration_summary_service.logger")
    def test_fallback_logs_error_message(
        self,
        mock_logger: MagicMock,
        mock_package: MagicMock,
        mock_llm_service: MagicMock,
        service: CalibrationSummaryService,
    ) -> None:
        """Test that fallback logs appropriate error messages."""
        # Setup
        employees = [create_employee(i) for i in range(15)]

        mock_package.return_value = {"employees": [], "analyses": {}}
        error_msg = "API rate limit exceeded"
        mock_llm_service.generate_calibration_analysis.side_effect = RuntimeError(error_msg)

        # Execute
        result = service.calculate_summary(employees, use_agent=True)

        # Verify error was logged
        mock_logger.error.assert_called_once()
        log_call = mock_logger.error.call_args[0][0]
        assert "LLM agent failed" in log_call
        assert "falling back to legacy" in log_call

        # Verify result is still valid
        assert result["summary"] is None
        assert len(result["insights"]) > 0


class TestAgentModeDataPackaging:
    """Tests for data packaging integration in agent mode."""

    @pytest.fixture
    def mock_llm_service(self) -> MagicMock:
        """Create a mock LLM service."""
        return MagicMock()

    @pytest.fixture
    def service(self, mock_llm_service: MagicMock) -> CalibrationSummaryService:
        """Create a calibration summary service instance with mock LLM."""
        return CalibrationSummaryService(llm_service=mock_llm_service)

    # Removed patch - using mock_llm_service fixture instead
    @patch("ninebox.services.data_packaging_service.package_for_llm")
    @patch("ninebox.services.analysis_registry.run_all_analyses")
    def test_agent_mode_calls_package_for_llm(
        self,
        mock_analyses: MagicMock,
        mock_package: MagicMock,
        mock_llm_service: MagicMock,
        service: CalibrationSummaryService,
    ) -> None:
        """Test that agent mode calls package_for_llm to prepare data."""
        # Setup
        employees = [create_employee(i) for i in range(20)]

        mock_analyses.return_value = {"location": {}}
        mock_package.return_value = {"employees": [], "analyses": {}}
        mock_llm_service.generate_calibration_analysis.return_value = {
            "summary": "Test summary",
            "issues": [],
        }

        # Execute
        service.calculate_summary(employees, use_agent=True)

        # Verify package_for_llm was called
        mock_package.assert_called_once()

    # Removed patch - using mock_llm_service fixture instead
    @patch("ninebox.services.data_packaging_service.package_for_llm")
    @patch("ninebox.services.analysis_registry.run_all_analyses")
    def test_agent_mode_passes_employees_to_packager(
        self,
        mock_analyses: MagicMock,
        mock_package: MagicMock,
        mock_llm_service: MagicMock,
        service: CalibrationSummaryService,
    ) -> None:
        """Test that employee data is passed to the packager."""
        # Setup
        employees = [
            create_employee(1, location="Seattle"),
            create_employee(2, location="NYC"),
            create_employee(3, location="Seattle"),
        ]

        mock_analyses.return_value = {}
        mock_package.return_value = {"employees": [], "analyses": {}}
        mock_llm_service.generate_calibration_analysis.return_value = {
            "summary": "Test",
            "issues": [],
        }

        # Execute
        service.calculate_summary(employees, use_agent=True)

        # Verify package_for_llm received the employees
        call_args = mock_package.call_args[0]
        passed_employees = call_args[0]
        assert len(passed_employees) == 3
        assert passed_employees[0].location == "Seattle"
        assert passed_employees[1].location == "NYC"

    # Removed patch - using mock_llm_service fixture instead
    @patch("ninebox.services.data_packaging_service.package_for_llm")
    @patch("ninebox.services.analysis_registry.run_all_analyses")
    def test_agent_mode_includes_analyses_in_package(
        self,
        mock_analyses: MagicMock,
        mock_package: MagicMock,
        mock_llm_service: MagicMock,
        service: CalibrationSummaryService,
    ) -> None:
        """Test that analysis results are included in the package."""
        # Setup
        employees = [create_employee(i) for i in range(25)]

        analysis_results = {
            "location": {"anomalies": []},
            "function": {"anomalies": []},
            "level": {"anomalies": []},
        }
        mock_analyses.return_value = analysis_results
        mock_package.return_value = {"employees": [], "analyses": {}}
        mock_llm_service.generate_calibration_analysis.return_value = {
            "summary": "Test",
            "issues": [],
        }

        # Execute
        service.calculate_summary(employees, use_agent=True)

        # Verify analyses were passed to packager
        call_args = mock_package.call_args[0]
        passed_analyses = call_args[1]
        assert "location" in passed_analyses
        assert "function" in passed_analyses
        assert "level" in passed_analyses

    # Removed patch - using mock_llm_service fixture instead
    @patch("ninebox.services.data_packaging_service.package_for_llm")
    @patch("ninebox.services.analysis_registry.run_all_analyses")
    def test_agent_mode_includes_org_data_in_package(
        self,
        mock_analyses: MagicMock,
        mock_package: MagicMock,
        mock_llm_service: MagicMock,
        service: CalibrationSummaryService,
    ) -> None:
        """Test that org-level data is included in the package."""
        # Setup
        employees = [create_employee(i) for i in range(30)]

        mock_analyses.return_value = {}
        mock_package.return_value = {"employees": [], "analyses": {}}
        mock_llm_service.generate_calibration_analysis.return_value = {
            "summary": "Test",
            "issues": [],
        }

        # Execute
        service.calculate_summary(employees, use_agent=True)

        # Verify org_data was passed to packager
        call_args = mock_package.call_args[0]
        org_data = call_args[2]
        assert "total_employees" in org_data
        assert org_data["total_employees"] == 30
        assert "total_managers" in org_data


class TestAgentModeInsightTransformation:
    """Tests for insight transformation in agent mode."""

    @pytest.fixture
    def mock_llm_service(self) -> MagicMock:
        """Create a mock LLM service."""
        return MagicMock()

    @pytest.fixture
    def service(self, mock_llm_service: MagicMock) -> CalibrationSummaryService:
        """Create a calibration summary service instance with mock LLM."""
        return CalibrationSummaryService(llm_service=mock_llm_service)

    # Removed patch - using mock_llm_service fixture instead
    @patch("ninebox.services.data_packaging_service.package_for_llm")
    def test_agent_insights_have_deterministic_ids(
        self,
        mock_package: MagicMock,
        mock_llm_service: MagicMock,
        service: CalibrationSummaryService,
    ) -> None:
        """Test that agent-generated insights get deterministic IDs."""
        # Setup
        employees = [create_employee(i) for i in range(20)]

        mock_package.return_value = {"employees": [], "analyses": {}}
        llm_response = {
            "summary": "Test summary",
            "issues": [
                {
                    "type": "anomaly",
                    "category": "location",
                    "priority": "high",
                    "title": "Test anomaly",
                    "description": "Test description",
                    "affected_count": 10,
                }
            ],
        }
        mock_llm_service.generate_calibration_analysis.return_value = llm_response

        # Execute twice with same input
        result1 = service.calculate_summary(employees, use_agent=True)

        # Reset mocks
        mock_package.reset_mock()
        mock_llm_service.reset_mock()
        mock_package.return_value = {"employees": [], "analyses": {}}
        mock_llm_service.generate_calibration_analysis.return_value = llm_response

        result2 = service.calculate_summary(employees, use_agent=True)

        # Verify IDs are deterministic
        assert result1["insights"][0]["id"] == result2["insights"][0]["id"]

    # Removed patch - using mock_llm_service fixture instead
    @patch("ninebox.services.data_packaging_service.package_for_llm")
    def test_agent_insights_preserve_cluster_information(
        self,
        mock_package: MagicMock,
        mock_llm_service: MagicMock,
        service: CalibrationSummaryService,
    ) -> None:
        """Test that cluster_id and cluster_title are preserved from LLM response."""
        # Setup
        employees = [create_employee(i) for i in range(15)]

        mock_package.return_value = {"employees": [], "analyses": {}}
        mock_llm_service.generate_calibration_analysis.return_value = {
            "summary": "Test",
            "issues": [
                {
                    "type": "anomaly",
                    "category": "location",
                    "priority": "high",
                    "title": "Issue 1",
                    "description": "Description 1",
                    "affected_count": 10,
                    "cluster_id": "cluster-geo-001",
                    "cluster_title": "Geographic Patterns",
                },
                {
                    "type": "recommendation",
                    "category": "distribution",
                    "priority": "medium",
                    "title": "Issue 2",
                    "description": "Description 2",
                    "affected_count": 20,
                    "cluster_id": None,
                    "cluster_title": None,
                },
            ],
        }

        # Execute
        result = service.calculate_summary(employees, use_agent=True)

        # Verify cluster information is preserved
        assert result["insights"][0]["cluster_id"] == "cluster-geo-001"
        assert result["insights"][0]["cluster_title"] == "Geographic Patterns"
        assert result["insights"][1]["cluster_id"] is None
        assert result["insights"][1]["cluster_title"] is None
