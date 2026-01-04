"""Tests for optional TypedDict fields in calibration summary service.

This test module validates that the optional clustering fields (cluster_id, cluster_title)
and the optional summary field work correctly with the TypedDict definitions.
"""

from datetime import date

import pytest

from ninebox.models.employee import Employee, PerformanceLevel, PotentialLevel
from ninebox.services.calibration_summary_service import (
    CalibrationSummaryResponse,
    CalibrationSummaryService,
    Insight,
    InsightSourceData,
)

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


class TestInsightOptionalClusterFields:
    """Tests for optional cluster_id and cluster_title fields in Insight TypedDict."""

    def test_insight_without_cluster_fields(self) -> None:
        """Test that Insight can be created without cluster fields."""
        # Create insight without cluster_id or cluster_title (should be valid)
        insight: Insight = {
            "id": "test-1",
            "type": "anomaly",
            "category": "level",
            "priority": "high",
            "title": "Test Insight",
            "description": "Test description",
            "affected_count": 10,
            "source_data": InsightSourceData(),
        }

        assert insight["id"] == "test-1"
        assert insight["type"] == "anomaly"
        assert "cluster_id" not in insight
        assert "cluster_title" not in insight

    def test_insight_with_cluster_fields(self) -> None:
        """Test that Insight can include optional cluster fields."""
        # Create insight with cluster fields
        insight: Insight = {
            "id": "test-2",
            "type": "anomaly",
            "category": "level",
            "priority": "high",
            "title": "Test Insight",
            "description": "Test description",
            "affected_count": 10,
            "source_data": InsightSourceData(),
            "cluster_id": "cluster-123",
            "cluster_title": "Performance Distribution Issues",
        }

        assert insight["id"] == "test-2"
        assert insight["cluster_id"] == "cluster-123"
        assert insight["cluster_title"] == "Performance Distribution Issues"

    def test_insight_with_null_cluster_fields(self) -> None:
        """Test that Insight cluster fields can be None."""
        # Create insight with None cluster fields
        insight: Insight = {
            "id": "test-3",
            "type": "focus_area",
            "category": "distribution",
            "priority": "medium",
            "title": "Test Focus Area",
            "description": "Test description",
            "affected_count": 20,
            "source_data": InsightSourceData(),
            "cluster_id": None,
            "cluster_title": None,
        }

        assert insight["cluster_id"] is None
        assert insight["cluster_title"] is None

    def test_insight_with_only_cluster_id(self) -> None:
        """Test that Insight can have cluster_id without cluster_title."""
        insight: Insight = {
            "id": "test-4",
            "type": "recommendation",
            "category": "time",
            "priority": "low",
            "title": "Test Recommendation",
            "description": "Test description",
            "affected_count": 5,
            "source_data": InsightSourceData(),
            "cluster_id": "cluster-456",
        }

        assert insight["cluster_id"] == "cluster-456"
        assert "cluster_title" not in insight

    def test_insight_with_only_cluster_title(self) -> None:
        """Test that Insight can have cluster_title without cluster_id."""
        insight: Insight = {
            "id": "test-5",
            "type": "focus_area",
            "category": "location",
            "priority": "medium",
            "title": "Test Focus",
            "description": "Test description",
            "affected_count": 15,
            "source_data": InsightSourceData(),
            "cluster_title": "Geographic Distribution",
        }

        assert insight["cluster_title"] == "Geographic Distribution"
        assert "cluster_id" not in insight


class TestCalibrationSummaryResponseOptionalFields:
    """Tests for optional summary field in CalibrationSummaryResponse TypedDict."""

    @pytest.fixture
    def service(self) -> CalibrationSummaryService:
        """Create a calibration summary service instance."""
        return CalibrationSummaryService()

    def test_response_without_summary_field(
        self, service: CalibrationSummaryService
    ) -> None:
        """Test that CalibrationSummaryResponse works with None summary (no LLM)."""
        employees = [create_employee(i, grid_position=5) for i in range(5)]

        # Call with use_agent=False to skip LLM and get None summary
        result = service.calculate_summary(employees, use_agent=False)

        # Should have required fields
        assert "data_overview" in result
        assert "time_allocation" in result
        assert "insights" in result

        # Summary field should be None when not using agent
        assert "summary" in result
        assert result["summary"] is None

    def test_response_with_summary_field(self) -> None:
        """Test that CalibrationSummaryResponse can include summary field."""
        # Manually create a response with summary field
        service = CalibrationSummaryService()
        employees = [create_employee(i, grid_position=5) for i in range(5)]

        # Get the base result (with use_agent=False for predictable output)
        base_result = service.calculate_summary(employees, use_agent=False)

        # Modify summary field to simulate successful AI generation
        result_with_summary: CalibrationSummaryResponse = {
            **base_result,
            "summary": "AI-generated summary of all insights",
        }

        assert result_with_summary["summary"] == "AI-generated summary of all insights"
        assert "data_overview" in result_with_summary
        assert "time_allocation" in result_with_summary
        assert "insights" in result_with_summary

    def test_response_with_null_summary(self) -> None:
        """Test that CalibrationSummaryResponse summary field can be None."""
        service = CalibrationSummaryService()
        employees = [create_employee(i, grid_position=5) for i in range(5)]

        # Call with use_agent=False, which returns None for summary
        result = service.calculate_summary(employees, use_agent=False)

        # Verify summary is None
        assert result["summary"] is None

    def test_response_structure_matches_typeddict(
        self, service: CalibrationSummaryService
    ) -> None:
        """Test that response structure matches CalibrationSummaryResponse TypedDict."""
        employees = [create_employee(i, grid_position=i % 9 + 1) for i in range(10)]

        result = service.calculate_summary(employees, use_agent=False)

        # Type check - this should not raise any type errors
        typed_result: CalibrationSummaryResponse = result

        assert typed_result["data_overview"]["total_employees"] == 10
        assert len(typed_result["insights"]) > 0
        # Summary field is present but None when use_agent=False
        assert "summary" in typed_result


class TestTypeCompatibility:
    """Tests for type compatibility and backwards compatibility."""

    @pytest.fixture
    def service(self) -> CalibrationSummaryService:
        """Create a calibration summary service instance."""
        return CalibrationSummaryService()

    def test_existing_code_works_without_optional_fields(
        self, service: CalibrationSummaryService
    ) -> None:
        """Test that existing code continues to work without using optional fields."""
        employees = [create_employee(i, grid_position=i % 9 + 1) for i in range(20)]

        result = service.calculate_summary(employees, use_agent=False)

        # All insights should work without cluster fields
        for insight in result["insights"]:
            assert "id" in insight
            assert "type" in insight
            assert "category" in insight
            assert "priority" in insight
            assert "title" in insight
            assert "description" in insight
            assert "affected_count" in insight
            assert "source_data" in insight
            # cluster_id and cluster_title are optional and won't be present
            # in current implementation (legacy mode)

    def test_future_code_can_add_cluster_fields(
        self, service: CalibrationSummaryService
    ) -> None:
        """Test that future code can add cluster fields to insights."""
        employees = [create_employee(i, grid_position=i % 9 + 1) for i in range(10)]

        result = service.calculate_summary(employees, use_agent=False)

        # Simulate future clustering logic adding cluster fields
        clustered_insights: list[Insight] = []
        for insight in result["insights"]:
            clustered_insight: Insight = {
                **insight,
                "cluster_id": "cluster-001",
                "cluster_title": "Test Cluster",
            }
            clustered_insights.append(clustered_insight)

        # All clustered insights should have cluster fields
        for insight in clustered_insights:
            # Use .get() to avoid type checker warnings about optional fields
            assert insight.get("cluster_id") == "cluster-001"
            assert insight.get("cluster_title") == "Test Cluster"
