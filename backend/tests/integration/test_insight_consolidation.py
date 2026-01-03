"""Integration test to verify that the shared InsightGenerator produces consistent results.

This test verifies that consolidating the insight generation logic didn't change
the behavior of the calibration_summary_service.
"""

from datetime import date

import pytest

from ninebox.models.employee import Employee, PerformanceLevel, PotentialLevel
from ninebox.services.calibration_summary_service import CalibrationSummaryService
from ninebox.services.insight_generator import InsightGenerator

pytestmark = pytest.mark.integration


def create_test_employee(
    emp_id: int,
    location: str = "New York",
    function: str = "Engineering",
    level: str = "MT3",
    tenure: str = "2-5 years",
    performance: PerformanceLevel = PerformanceLevel.MEDIUM,
    potential: PotentialLevel = PotentialLevel.MEDIUM,
    grid_position: int = 5,
) -> Employee:
    """Create a test employee with specified parameters."""
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


def test_calibration_summary_service_uses_shared_generator():
    """Test that CalibrationSummaryService uses the shared InsightGenerator."""
    service = CalibrationSummaryService()

    # Verify that the service has an insight_generator attribute
    assert hasattr(service, "insight_generator")
    assert isinstance(service.insight_generator, InsightGenerator)


def test_insights_consistent_with_shared_generator():
    """Test that insights generated use the shared generator consistently."""
    # Create a dataset with clear anomalies
    employees = []

    # Austin location: 80% high performers (should trigger red flag)
    for i in range(40):
        employees.append(
            create_test_employee(
                emp_id=i,
                location="Austin",
                performance=PerformanceLevel.HIGH,
                grid_position=9,
            )
        )
    for i in range(40, 50):
        employees.append(
            create_test_employee(
                emp_id=i,
                location="Austin",
                performance=PerformanceLevel.MEDIUM,
                grid_position=5,
            )
        )

    # Seattle location: 10% high performers (balanced)
    for i in range(50, 55):
        employees.append(
            create_test_employee(
                emp_id=i,
                location="Seattle",
                performance=PerformanceLevel.HIGH,
                grid_position=9,
            )
        )
    for i in range(55, 90):
        employees.append(
            create_test_employee(
                emp_id=i,
                location="Seattle",
                performance=PerformanceLevel.MEDIUM,
                grid_position=5,
            )
        )
    for i in range(90, 100):
        employees.append(
            create_test_employee(
                emp_id=i,
                location="Seattle",
                performance=PerformanceLevel.LOW,
                grid_position=1,
            )
        )

    # Calculate summary with legacy mode (use_agent=False) to test shared generator
    service = CalibrationSummaryService()
    summary = service.calculate_summary(employees, use_agent=False)

    # Verify insights were generated
    insights = summary["insights"]
    assert len(insights) > 0

    # Check that anomaly insights exist (from shared generator)
    anomaly_insights = [i for i in insights if i["type"] == "anomaly"]
    assert len(anomaly_insights) > 0

    # Verify the anomaly insights have the expected structure from shared generator
    for insight in anomaly_insights:
        assert "id" in insight
        assert "type" in insight
        assert "category" in insight
        assert "priority" in insight
        assert "title" in insight
        assert "description" in insight
        assert "affected_count" in insight
        assert "source_data" in insight

        # Check that source_data has statistical fields
        if insight["category"] in ["location", "function", "level", "tenure", "manager"]:
            # These should have statistical data from analyses
            source_data = insight["source_data"]
            # At minimum, should have p_value (some may have z_score too)
            assert "p_value" in source_data or "z_score" in source_data


def test_shared_generator_produces_deterministic_ids():
    """Test that the shared generator produces deterministic insight IDs."""
    # Create identical datasets
    employees1 = [
        create_test_employee(
            emp_id=i,
            location="Austin" if i < 50 else "Seattle",
            performance=PerformanceLevel.HIGH if i < 40 else PerformanceLevel.MEDIUM,
            grid_position=9 if i < 40 else 5,
        )
        for i in range(100)
    ]

    employees2 = [
        create_test_employee(
            emp_id=i,
            location="Austin" if i < 50 else "Seattle",
            performance=PerformanceLevel.HIGH if i < 40 else PerformanceLevel.MEDIUM,
            grid_position=9 if i < 40 else 5,
        )
        for i in range(100)
    ]

    # Calculate summaries
    service = CalibrationSummaryService()
    summary1 = service.calculate_summary(employees1, use_agent=False)
    summary2 = service.calculate_summary(employees2, use_agent=False)

    # Extract anomaly insight IDs
    ids1 = sorted([i["id"] for i in summary1["insights"] if i["type"] == "anomaly"])
    ids2 = sorted([i["id"] for i in summary2["insights"] if i["type"] == "anomaly"])

    # IDs should be identical for identical input
    assert ids1 == ids2


def test_no_duplicate_anomaly_insights():
    """Test that duplicate insight generation logic has been removed."""
    # Create a simple dataset
    employees = [
        create_test_employee(
            emp_id=i,
            location="Boston",
            performance=PerformanceLevel.HIGH,
            grid_position=9,
        )
        for i in range(50)
    ]

    service = CalibrationSummaryService()

    # Verify that the old _generate_anomaly_insights method no longer exists
    assert not hasattr(service, "_generate_anomaly_insights"), (
        "The duplicate _generate_anomaly_insights method should have been removed. "
        "It has been consolidated into the shared InsightGenerator class."
    )


def test_insight_generator_handles_multiple_analyses():
    """Test that InsightGenerator correctly handles multiple analysis types."""
    from ninebox.services.analysis_registry import run_all_analyses

    # Create employees with various distributions to trigger multiple analysis types
    employees = []

    # Location bias: Austin high, Seattle low
    for i in range(30):
        employees.append(
            create_test_employee(
                emp_id=i,
                location="Austin",
                function="Engineering",
                level="MT3",
                performance=PerformanceLevel.HIGH,
                grid_position=9,
            )
        )

    for i in range(30, 60):
        employees.append(
            create_test_employee(
                emp_id=i,
                location="Seattle",
                function="Sales",
                level="MT4",
                performance=PerformanceLevel.MEDIUM,
                grid_position=5,
            )
        )

    # Run analyses
    analyses = run_all_analyses(employees)

    # Generate insights using shared generator
    generator = InsightGenerator()
    insights = generator.generate_from_analyses(analyses)

    # Should have insights from multiple dimensions
    categories = {insight["category"] for insight in insights}
    assert len(categories) > 0  # At least one category should have insights

    # All insights should be properly structured
    for insight in insights:
        assert insight["type"] == "anomaly"
        assert insight["priority"] in ["high", "medium", "low"]
        assert len(insight["id"]) == 16  # MD5 hash truncated to 16 chars
