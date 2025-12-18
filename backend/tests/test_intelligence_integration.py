"""Integration tests for intelligence analysis with controlled sample data.

This module tests the intelligence analysis functions with synthetic data
to verify they correctly detect (or don't detect) anomalies based on
z-scores and effect sizes.
"""

from datetime import date

import pytest

from ninebox.models.employee import Employee, PerformanceLevel, PotentialLevel
from ninebox.services.intelligence_service import (
    calculate_location_analysis,
    calculate_tenure_analysis,
)


def _create_employee(
    emp_id: int,
    location: str,
    performance: PerformanceLevel,
    tenure_category: str = "1-2 Years",
    job_function: str = "Engineering",
    job_level: str = "IC3",
) -> Employee:
    """Create a test employee with specified attributes."""
    return Employee(
        employee_id=emp_id,
        name=f"Employee {emp_id}",
        business_title=f"Title {emp_id}",
        job_title=f"Job {emp_id}",
        job_profile=f"{job_function} - {job_level} - {location}",
        location=location,
        job_function=job_function,
        job_level=job_level,
        manager="Test Manager",
        hire_date=date(2020, 1, 1),
        tenure_category=tenure_category,
        time_in_job_profile="1-2 years",
        performance=performance,
        potential=PotentialLevel.MEDIUM,
        grid_position=5,
        position_label="Core Contributor [M,M]",
        talent_indicator="Core",
    )


class TestIntelligenceNoDeviations:
    """Test intelligence analysis when there are NO significant deviations.

    Expected: Status should be "green", interpretation should say "evenly distributed"
    """

    def test_location_analysis_when_perfectly_uniform_then_green_status(self) -> None:
        """Test location analysis with perfectly uniform distribution across locations."""
        # Create 90 employees: 3 locations x 30 employees each
        # Each location: 33% High, 33% Medium, 33% Low (perfectly uniform)
        employees = []
        emp_id = 1

        for location in ["Location A", "Location B", "Location C"]:
            # 10 High performers
            for _ in range(10):
                employees.append(_create_employee(emp_id, location, PerformanceLevel.HIGH))
                emp_id += 1

            # 10 Medium performers
            for _ in range(10):
                employees.append(_create_employee(emp_id, location, PerformanceLevel.MEDIUM))
                emp_id += 1

            # 10 Low performers
            for _ in range(10):
                employees.append(_create_employee(emp_id, location, PerformanceLevel.LOW))
                emp_id += 1

        # Run analysis
        result = calculate_location_analysis(employees)

        # Verify results
        assert result["status"] == "green", f"Expected green status for uniform distribution, got {result['status']}"
        assert result["p_value"] > 0.99, f"Expected very high p-value for uniform distribution, got {result['p_value']}"
        assert "evenly distributed" in result["interpretation"].lower(), (
            f"Expected 'evenly distributed' in interpretation, got: {result['interpretation']}"
        )

        # Verify no significant deviations
        significant_devs = [d for d in result["deviations"] if d["is_significant"]]
        assert len(significant_devs) == 0, (
            f"Expected no significant deviations for uniform distribution, got {len(significant_devs)}: {significant_devs}"
        )


class TestIntelligenceSmallDeviations:
    """Test intelligence analysis with small, non-significant deviations (z < 2).

    Expected: Status should be "green", interpretation should say "evenly distributed"
    """

    def test_location_analysis_when_small_deviations_then_green_status(self) -> None:
        """Test location analysis with small random variations (not statistically significant)."""
        # Create 90 employees with slight variations from expected distribution
        # Location A: 35% High (instead of 33%), Location B: 33% High, Location C: 31% High
        # These should produce z-scores less than 2.0
        employees = []
        emp_id = 1

        # Location A: 35% High, 33% Medium, 32% Low (30 total)
        for _ in range(11):  # 11/30 = 36.7% High
            employees.append(_create_employee(emp_id, "Location A", PerformanceLevel.HIGH))
            emp_id += 1
        for _ in range(10):  # 10/30 = 33.3% Medium
            employees.append(_create_employee(emp_id, "Location A", PerformanceLevel.MEDIUM))
            emp_id += 1
        for _ in range(9):  # 9/30 = 30% Low
            employees.append(_create_employee(emp_id, "Location A", PerformanceLevel.LOW))
            emp_id += 1

        # Location B: 33% High, 33% Medium, 33% Low (30 total)
        for _ in range(10):
            employees.append(_create_employee(emp_id, "Location B", PerformanceLevel.HIGH))
            emp_id += 1
        for _ in range(10):
            employees.append(_create_employee(emp_id, "Location B", PerformanceLevel.MEDIUM))
            emp_id += 1
        for _ in range(10):
            employees.append(_create_employee(emp_id, "Location B", PerformanceLevel.LOW))
            emp_id += 1

        # Location C: 30% High, 33% Medium, 37% Low (30 total)
        for _ in range(9):  # 9/30 = 30% High
            employees.append(_create_employee(emp_id, "Location C", PerformanceLevel.HIGH))
            emp_id += 1
        for _ in range(10):  # 10/30 = 33.3% Medium
            employees.append(_create_employee(emp_id, "Location C", PerformanceLevel.MEDIUM))
            emp_id += 1
        for _ in range(11):  # 11/30 = 36.7% Low
            employees.append(_create_employee(emp_id, "Location C", PerformanceLevel.LOW))
            emp_id += 1

        # Run analysis
        result = calculate_location_analysis(employees)

        # Verify results
        assert result["status"] == "green", (
            f"Expected green status for small deviations, got {result['status']}. "
            f"P-value: {result['p_value']}, deviations: {result['deviations']}"
        )
        assert "evenly distributed" in result["interpretation"].lower(), (
            f"Expected 'evenly distributed' for small deviations, got: {result['interpretation']}"
        )

        # Verify no significant deviations (all z-scores should be < 2.0)
        significant_devs = [d for d in result["deviations"] if d["is_significant"]]
        assert len(significant_devs) == 0, (
            f"Expected no significant deviations for small variations, got {len(significant_devs)}: {significant_devs}"
        )


class TestIntelligenceLargeDeviations:
    """Test intelligence analysis with large, significant deviations (z > 2).

    Expected: Status should be "yellow" or "red", interpretation should report the deviation
    """

    def test_tenure_analysis_when_large_deviation_then_flagged_status(self) -> None:
        """Test tenure analysis with a clear anomaly in one tenure group.

        This mimics the user's example: 19-24 Months group with 50% high performers
        vs 22% expected (approximately 2x the expected rate).
        """
        # Create 90 employees across 3 tenure categories
        employees = []
        emp_id = 1

        # 0-18 Months: Normal distribution - 20% High, 50% Medium, 30% Low (30 total)
        for _ in range(6):  # 6/30 = 20% High
            employees.append(_create_employee(emp_id, "Location A", PerformanceLevel.HIGH, "0-18 Months"))
            emp_id += 1
        for _ in range(15):  # 15/30 = 50% Medium
            employees.append(_create_employee(emp_id, "Location A", PerformanceLevel.MEDIUM, "0-18 Months"))
            emp_id += 1
        for _ in range(9):  # 9/30 = 30% Low
            employees.append(_create_employee(emp_id, "Location A", PerformanceLevel.LOW, "0-18 Months"))
            emp_id += 1

        # 19-24 Months: ANOMALY - 50% High, 30% Medium, 20% Low (30 total)
        # This is significantly higher than expected (~20% baseline)
        for _ in range(15):  # 15/30 = 50% High ← ANOMALY
            employees.append(_create_employee(emp_id, "Location A", PerformanceLevel.HIGH, "19-24 Months"))
            emp_id += 1
        for _ in range(9):  # 9/30 = 30% Medium
            employees.append(_create_employee(emp_id, "Location A", PerformanceLevel.MEDIUM, "19-24 Months"))
            emp_id += 1
        for _ in range(6):  # 6/30 = 20% Low
            employees.append(_create_employee(emp_id, "Location A", PerformanceLevel.LOW, "19-24 Months"))
            emp_id += 1

        # 2+ Years: Normal distribution - 20% High, 50% Medium, 30% Low (30 total)
        for _ in range(6):  # 6/30 = 20% High
            employees.append(_create_employee(emp_id, "Location A", PerformanceLevel.HIGH, "2+ Years"))
            emp_id += 1
        for _ in range(15):  # 15/30 = 50% Medium
            employees.append(_create_employee(emp_id, "Location A", PerformanceLevel.MEDIUM, "2+ Years"))
            emp_id += 1
        for _ in range(9):  # 9/30 = 30% Low
            employees.append(_create_employee(emp_id, "Location A", PerformanceLevel.LOW, "2+ Years"))
            emp_id += 1

        # Run analysis
        result = calculate_tenure_analysis(employees)

        print(f"\nTenure Analysis Results:")
        print(f"  Status: {result['status']}")
        print(f"  P-value: {result['p_value']}")
        print(f"  Effect size: {result['effect_size']}")
        print(f"  Interpretation: {result['interpretation']}")
        print(f"\nDeviations:")
        for dev in result['deviations']:
            sig = "[SIGNIFICANT]" if dev['is_significant'] else ""
            print(f"  {dev['category']}: {dev['observed_high_pct']:.1f}% vs {dev['expected_high_pct']:.1f}% "
                  f"(z={dev['z_score']:.2f}) {sig}")

        # CRITICAL ASSERTIONS
        # 1. Should have at least one significant deviation
        significant_devs = [d for d in result["deviations"] if d["is_significant"]]
        assert len(significant_devs) > 0, (
            f"Expected at least one significant deviation for 50% vs 20% High performers, got none. "
            f"Deviations: {result['deviations']}"
        )

        # 2. The 19-24 Months group should be the most significant
        top_deviation = result["deviations"][0]  # Sorted by |z-score|
        assert top_deviation["category"] == "19-24 Months", (
            f"Expected '19-24 Months' to be top deviation, got '{top_deviation['category']}'. "
            f"Deviations: {result['deviations']}"
        )

        # 3. Should have |z| >= 2.0 for the anomaly (2.0 is the threshold for significance)
        assert abs(top_deviation["z_score"]) >= 2.0, (
            f"Expected |z| >= 2.0 for 50% vs 20% High performers, got z={top_deviation['z_score']}"
        )

        # 4. Status should be flagged (yellow or red), NOT green
        assert result["status"] in ["yellow", "red"], (
            f"Expected 'yellow' or 'red' status for significant deviation (z={top_deviation['z_score']}), "
            f"got '{result['status']}'"
        )

        # 5. Interpretation should mention the deviation, NOT "evenly distributed"
        assert "evenly distributed" not in result["interpretation"].lower(), (
            f"Expected interpretation to report deviation, not claim 'evenly distributed'. "
            f"Got: {result['interpretation']}"
        )

        # 6. Interpretation should mention "19-24 Months" specifically
        assert "19-24 months" in result["interpretation"].lower(), (
            f"Expected interpretation to mention '19-24 Months' category. "
            f"Got: {result['interpretation']}"
        )

        # 7. Interpretation should report the percentages
        assert "50" in result["interpretation"] or "50.0" in result["interpretation"], (
            f"Expected interpretation to mention 50% observed. Got: {result['interpretation']}"
        )


class TestIntelligenceMediumDeviations:
    """Test intelligence analysis with medium deviations and medium effect size.

    Expected: Should be flagged based on combination of z-score and effect size
    """

    def test_location_analysis_when_medium_deviation_and_medium_effect_then_flagged(self) -> None:
        """Test that overall chi-square detects pattern even when individual z-scores are below threshold."""
        # This test creates a scenario where:
        # - Overall pattern is statistically significant (p < 0.05)
        # - Individual z-scores are moderate (around 1.3)
        # - Effect size is small-to-medium (~0.26)
        # - Should trigger yellow status based on overall chi-square test

        # Create 100 employees across 2 locations with moderate bias
        employees = []
        emp_id = 1

        # Location A: 40% High, 40% Medium, 20% Low (50 total) - higher than baseline
        for _ in range(20):  # 20/50 = 40% High
            employees.append(_create_employee(emp_id, "Location A", PerformanceLevel.HIGH))
            emp_id += 1
        for _ in range(20):  # 20/50 = 40% Medium
            employees.append(_create_employee(emp_id, "Location A", PerformanceLevel.MEDIUM))
            emp_id += 1
        for _ in range(10):  # 10/50 = 20% Low
            employees.append(_create_employee(emp_id, "Location A", PerformanceLevel.LOW))
            emp_id += 1

        # Location B: 20% High, 40% Medium, 40% Low (50 total) - lower than baseline
        for _ in range(10):  # 10/50 = 20% High
            employees.append(_create_employee(emp_id, "Location B", PerformanceLevel.HIGH))
            emp_id += 1
        for _ in range(20):  # 20/50 = 40% Medium
            employees.append(_create_employee(emp_id, "Location B", PerformanceLevel.MEDIUM))
            emp_id += 1
        for _ in range(20):  # 20/50 = 40% Low
            employees.append(_create_employee(emp_id, "Location B", PerformanceLevel.LOW))
            emp_id += 1

        # Run analysis
        result = calculate_location_analysis(employees)

        print(f"\nLocation Analysis Results (Medium Deviation):")
        print(f"  Status: {result['status']}")
        print(f"  P-value: {result['p_value']}")
        print(f"  Effect size: {result['effect_size']}")
        print(f"  Interpretation: {result['interpretation']}")
        print(f"\nDeviations:")
        for dev in result['deviations']:
            sig = "[SIGNIFICANT]" if dev['is_significant'] else ""
            print(f"  {dev['category']}: {dev['observed_high_pct']:.1f}% vs {dev['expected_high_pct']:.1f}% "
                  f"(z={dev['z_score']:.2f}) {sig}")

        # Overall chi-square test should detect the pattern
        assert result["p_value"] < 0.05, (
            f"Expected p-value < 0.05 for 40% vs 20% distribution, got {result['p_value']}"
        )

        # Status should be flagged (yellow) based on overall chi-square, even though individual z-scores are low
        assert result["status"] == "yellow", (
            f"Expected 'yellow' status when p < 0.05 but individual z-scores < 2.0, got '{result['status']}'"
        )

        # Individual z-scores should be below significance threshold (this is the actual behavior)
        assert all(abs(dev["z_score"]) < 2.0 for dev in result["deviations"]), (
            f"Expected all z-scores < 2.0 for this scenario. Got: {result['deviations']}"
        )


if __name__ == "__main__":
    # Allow running tests directly for debugging
    pytest.main([__file__, "-v", "-s"])
