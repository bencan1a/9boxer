"""Tests for intelligence service."""

from datetime import date

import numpy as np
import pytest

from ninebox.models.employee import Employee, PerformanceLevel, PotentialLevel
from ninebox.services.intelligence_service import (
    _calculate_z_scores,
    _chi_square_test,
    _cramers_v,
    _safe_sample_size_check,
    calculate_function_analysis,
    calculate_level_analysis,
    calculate_location_analysis,
    calculate_overall_intelligence,
    calculate_tenure_analysis,
)

pytestmark = pytest.mark.unit

# Test helper functions


def test_chi_square_test_with_known_values() -> None:
    """Test chi-square calculation with known values."""
    # Known contingency table with expected results
    # Example: Test independence of two categories
    contingency = np.array([[10, 10, 20], [20, 20, 10]])

    chi2, p_value, dof, expected = _chi_square_test(contingency)

    assert chi2 > 0
    assert 0 <= p_value <= 1
    assert dof == 2  # (rows-1) * (cols-1) = (2-1) * (3-1) = 2
    assert expected.shape == contingency.shape


def test_calculate_z_scores() -> None:
    """Test z-score calculation."""
    observed = np.array([10, 20, 30])
    expected = np.array([15, 15, 30])

    z_scores = _calculate_z_scores(observed, expected)

    # Z-score formula: (observed - expected) / sqrt(expected)
    # For first element: (10 - 15) / sqrt(15) ≈ -1.29
    assert z_scores[0] < 0
    assert z_scores[1] > 0
    assert abs(z_scores[2]) < 0.1  # Should be ~0


def test_cramers_v_calculation() -> None:
    """Test Cramér's V calculation."""
    chi2 = 10.0
    n = 100
    rows = 3
    cols = 3

    v = _cramers_v(chi2, n, rows, cols)

    # Cramér's V = sqrt(chi2 / (n * min(r-1, c-1)))
    # = sqrt(10 / (100 * min(2, 2))) = sqrt(10 / 200) = sqrt(0.05) ≈ 0.224
    assert 0.2 < v < 0.25


def test_cramers_v_edge_cases() -> None:
    """Test Cramér's V with edge cases."""
    # Zero sample size
    assert _cramers_v(10, 0, 3, 3) == 0.0

    # Single row or column
    assert _cramers_v(10, 100, 1, 3) == 0.0
    assert _cramers_v(10, 100, 3, 1) == 0.0


def test_safe_sample_size_check() -> None:
    """Test sample size validation."""
    # All counts >= 5
    assert _safe_sample_size_check(np.array([5, 10, 15])) is True

    # Some counts < 5
    assert _safe_sample_size_check(np.array([4, 10, 15])) is False
    assert _safe_sample_size_check(np.array([0, 5, 10])) is False


# Test analysis functions with sample data


def create_employee(
    emp_id: int,
    location: str,
    function: str,
    level: str,
    tenure: str,
    performance: PerformanceLevel,
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


def test_location_analysis_with_uniform_distribution() -> None:
    """Test location analysis with perfectly uniform distribution."""
    # Create 60 employees: 3 locations x 20 each, evenly distributed performance
    employees = []
    emp_id = 1
    for loc in ["USA", "UK", "IN"]:
        for perf in [PerformanceLevel.HIGH, PerformanceLevel.MEDIUM, PerformanceLevel.LOW]:
            for _ in range(7):  # 7 of each performance level per location
                employees.append(
                    create_employee(emp_id, loc, "Engineering", "MT5", "2-5 years", perf)
                )
                emp_id += 1

    result = calculate_location_analysis(employees)

    # With perfect uniformity, p-value should be very high (close to 1)
    assert result["p_value"] > 0.5
    assert result["status"] == "green"
    assert result["sample_size"] == 63  # 3 locations x 21 employees


def test_location_analysis_with_bias() -> None:
    """Test location analysis with clear bias."""
    # Create 90 employees with bias: USA has mostly high performers
    employees = []
    emp_id = 1

    # USA: 25 high, 2 medium, 3 low
    for _ in range(25):
        employees.append(
            create_employee(emp_id, "USA", "Engineering", "MT5", "2-5 years", PerformanceLevel.HIGH)
        )
        emp_id += 1
    for _ in range(2):
        employees.append(
            create_employee(
                emp_id, "USA", "Engineering", "MT5", "2-5 years", PerformanceLevel.MEDIUM
            )
        )
        emp_id += 1
    for _ in range(3):
        employees.append(
            create_employee(emp_id, "USA", "Engineering", "MT5", "2-5 years", PerformanceLevel.LOW)
        )
        emp_id += 1

    # UK: 10 high, 10 medium, 10 low (balanced)
    for perf in [PerformanceLevel.HIGH, PerformanceLevel.MEDIUM, PerformanceLevel.LOW]:
        for _ in range(10):
            employees.append(create_employee(emp_id, "UK", "Engineering", "MT5", "2-5 years", perf))
            emp_id += 1

    # IN: 10 high, 10 medium, 10 low (balanced)
    for perf in [PerformanceLevel.HIGH, PerformanceLevel.MEDIUM, PerformanceLevel.LOW]:
        for _ in range(10):
            employees.append(create_employee(emp_id, "IN", "Engineering", "MT5", "2-5 years", perf))
            emp_id += 1

    result = calculate_location_analysis(employees)

    # With clear bias, p-value should be very low (significant)
    assert result["p_value"] < 0.05
    assert result["status"] in ["yellow", "red"]
    assert result["sample_size"] == 90

    # USA should show as a significant deviation
    usa_deviation = next((d for d in result["deviations"] if d["category"] == "USA"), None)
    assert usa_deviation is not None
    assert usa_deviation["is_significant"] is True
    assert usa_deviation["observed_high_pct"] > usa_deviation["expected_high_pct"]


def test_location_analysis_with_small_sample() -> None:
    """Test location analysis with insufficient sample size."""
    # Create only 20 employees across 2 locations (below threshold of 30)
    # Need variety in performance levels to avoid "empty categories" error
    employees = []
    for i in range(7):
        employees.append(
            create_employee(i, "USA", "Engineering", "MT5", "2-5 years", PerformanceLevel.HIGH)
        )
    for i in range(7, 10):
        employees.append(
            create_employee(i, "USA", "Engineering", "MT5", "2-5 years", PerformanceLevel.MEDIUM)
        )
    for i in range(10, 17):
        employees.append(
            create_employee(i, "UK", "Engineering", "MT5", "2-5 years", PerformanceLevel.HIGH)
        )
    for i in range(17, 20):
        employees.append(
            create_employee(i, "UK", "Engineering", "MT5", "2-5 years", PerformanceLevel.LOW)
        )

    result = calculate_location_analysis(employees)

    # Should return empty analysis with explanation
    # Note: empty analysis returns sample_size=0, but we have 20 employees
    assert len(employees) == 20
    assert result["sample_size"] == 0  # Empty analysis returns 0
    assert "too small" in result["interpretation"].lower()


def test_location_analysis_with_single_location() -> None:
    """Test location analysis with only one location."""
    employees = []
    for i in range(50):
        employees.append(
            create_employee(i, "USA", "Engineering", "MT5", "2-5 years", PerformanceLevel.HIGH)
        )

    result = calculate_location_analysis(employees)

    # Should return empty analysis
    assert "insufficient" in result["interpretation"].lower()


def test_function_analysis_with_uniform_distribution() -> None:
    """Test function analysis with uniform distribution."""
    # Create 90 employees: 3 functions x 30 each, evenly distributed
    employees = []
    emp_id = 1
    for func in ["Engineering", "Sales", "Marketing"]:
        for pos in range(1, 10):  # Grid positions 1-9
            for _ in range(3):  # 3 employees per position
                perf = (
                    PerformanceLevel.HIGH
                    if pos >= 7
                    else PerformanceLevel.MEDIUM
                    if pos >= 4
                    else PerformanceLevel.LOW
                )
                employees.append(
                    create_employee(
                        emp_id, "USA", func, "MT5", "2-5 years", perf, grid_position=pos
                    )
                )
                emp_id += 1

    result = calculate_function_analysis(employees)

    # With perfect uniformity, p-value should be high
    assert result["p_value"] > 0.5
    assert result["status"] == "green"


def test_function_analysis_with_bias() -> None:
    """Test function analysis with skewed distribution."""
    # Test setup: Engineering has mostly high performers, Sales has mostly medium performers,
    # and Marketing has a balanced distribution across performance levels
    employees = []
    emp_id = 1

    # Engineering: 25 in positions 7-9, 5 in others
    for _ in range(25):
        employees.append(
            create_employee(
                emp_id,
                "USA",
                "Engineering",
                "MT5",
                "2-5 years",
                PerformanceLevel.HIGH,
                grid_position=9,
            )
        )
        emp_id += 1
    for _ in range(5):
        employees.append(
            create_employee(
                emp_id,
                "USA",
                "Engineering",
                "MT5",
                "2-5 years",
                PerformanceLevel.LOW,
                grid_position=1,
            )
        )
        emp_id += 1

    # Sales: 25 in positions 4-6, 5 in high positions
    for _ in range(25):
        employees.append(
            create_employee(
                emp_id, "USA", "Sales", "MT5", "2-5 years", PerformanceLevel.MEDIUM, grid_position=5
            )
        )
        emp_id += 1
    for _ in range(5):
        employees.append(
            create_employee(
                emp_id, "USA", "Sales", "MT5", "2-5 years", PerformanceLevel.HIGH, grid_position=9
            )
        )
        emp_id += 1

    # Marketing department: Create employees with balanced distribution across all positions
    for pos in range(1, 10):
        for _ in range(3):
            perf = (
                PerformanceLevel.HIGH
                if pos >= 7
                else PerformanceLevel.MEDIUM
                if pos >= 4
                else PerformanceLevel.LOW
            )
            employees.append(
                create_employee(
                    emp_id, "USA", "Marketing", "MT5", "2-5 years", perf, grid_position=pos
                )
            )
            emp_id += 1

    result = calculate_function_analysis(employees)

    # Should detect bias
    assert result["p_value"] < 0.05
    assert result["status"] in ["yellow", "red"]


def test_level_analysis_uniformity_is_good() -> None:
    """Test level analysis where uniformity is the desired outcome."""
    # Create employees across 3 levels with similar distributions
    # This should result in p > 0.05, which is GOOD for level analysis
    employees = []
    emp_id = 1

    for level in ["MT4", "MT5", "MT6"]:
        # Each level: 7 high, 7 medium, 6 low
        for _ in range(7):
            employees.append(
                create_employee(
                    emp_id, "USA", "Engineering", level, "2-5 years", PerformanceLevel.HIGH
                )
            )
            emp_id += 1
        for _ in range(7):
            employees.append(
                create_employee(
                    emp_id, "USA", "Engineering", level, "2-5 years", PerformanceLevel.MEDIUM
                )
            )
            emp_id += 1
        for _ in range(6):
            employees.append(
                create_employee(
                    emp_id, "USA", "Engineering", level, "2-5 years", PerformanceLevel.LOW
                )
            )
            emp_id += 1

    result = calculate_level_analysis(employees)

    # High p-value is GOOD for level analysis (uniformity desired)
    assert result["p_value"] > 0.05
    assert result["status"] == "green"
    assert "looks good" in result["interpretation"].lower()


def test_level_analysis_calibration_issue() -> None:
    """Test level analysis detecting calibration problem."""
    # MT6 has leniency bias: mostly high ratings
    # MT4 has severity bias: mostly low ratings
    # This should result in p < 0.05, which is BAD for level analysis
    employees = []
    emp_id = 1

    # MT6: 18 high, 2 medium, 0 low (leniency bias)
    for _ in range(18):
        employees.append(
            create_employee(emp_id, "USA", "Engineering", "MT6", "2-5 years", PerformanceLevel.HIGH)
        )
        emp_id += 1
    for _ in range(2):
        employees.append(
            create_employee(
                emp_id, "USA", "Engineering", "MT6", "2-5 years", PerformanceLevel.MEDIUM
            )
        )
        emp_id += 1

    # MT4: 2 high, 2 medium, 16 low (severity bias)
    for _ in range(2):
        employees.append(
            create_employee(emp_id, "USA", "Engineering", "MT4", "2-5 years", PerformanceLevel.HIGH)
        )
        emp_id += 1
    for _ in range(2):
        employees.append(
            create_employee(
                emp_id, "USA", "Engineering", "MT4", "2-5 years", PerformanceLevel.MEDIUM
            )
        )
        emp_id += 1
    for _ in range(16):
        employees.append(
            create_employee(emp_id, "USA", "Engineering", "MT4", "2-5 years", PerformanceLevel.LOW)
        )
        emp_id += 1

    # MT5 level: Create balanced distribution with 7 high, 7 medium, 6 low performers
    for _ in range(7):
        employees.append(
            create_employee(emp_id, "USA", "Engineering", "MT5", "2-5 years", PerformanceLevel.HIGH)
        )
        emp_id += 1
    for _ in range(7):
        employees.append(
            create_employee(
                emp_id, "USA", "Engineering", "MT5", "2-5 years", PerformanceLevel.MEDIUM
            )
        )
        emp_id += 1
    for _ in range(6):
        employees.append(
            create_employee(emp_id, "USA", "Engineering", "MT5", "2-5 years", PerformanceLevel.LOW)
        )
        emp_id += 1

    result = calculate_level_analysis(employees)

    # Low p-value is BAD for level analysis (calibration issue)
    assert result["p_value"] < 0.05
    assert result["status"] in ["yellow", "red"]
    assert (
        "warning" in result["interpretation"].lower() or "issue" in result["interpretation"].lower()
    )


def test_tenure_analysis_with_uniform_distribution() -> None:
    """Test tenure analysis with uniform distribution."""
    employees = []
    emp_id = 1

    for tenure in ["0-1 years", "2-5 years", "6-10 years"]:
        for _ in range(7):
            employees.append(
                create_employee(emp_id, "USA", "Engineering", "MT5", tenure, PerformanceLevel.HIGH)
            )
            emp_id += 1
        for _ in range(7):
            employees.append(
                create_employee(
                    emp_id, "USA", "Engineering", "MT5", tenure, PerformanceLevel.MEDIUM
                )
            )
            emp_id += 1
        for _ in range(6):
            employees.append(
                create_employee(emp_id, "USA", "Engineering", "MT5", tenure, PerformanceLevel.LOW)
            )
            emp_id += 1

    result = calculate_tenure_analysis(employees)

    assert result["p_value"] > 0.5
    assert result["status"] == "green"


def test_tenure_analysis_with_bias() -> None:
    """Test tenure analysis with tenure-based bias."""
    # New hires (0-1 years): mostly high ratings
    # Long tenure (6-10 years): mostly low ratings
    employees = []
    emp_id = 1

    # 0-1 years: 18 high, 2 medium, 0 low
    for _ in range(18):
        employees.append(
            create_employee(emp_id, "USA", "Engineering", "MT5", "0-1 years", PerformanceLevel.HIGH)
        )
        emp_id += 1
    for _ in range(2):
        employees.append(
            create_employee(
                emp_id, "USA", "Engineering", "MT5", "0-1 years", PerformanceLevel.MEDIUM
            )
        )
        emp_id += 1

    # 6-10 years: 2 high, 2 medium, 16 low
    for _ in range(2):
        employees.append(
            create_employee(
                emp_id, "USA", "Engineering", "MT5", "6-10 years", PerformanceLevel.HIGH
            )
        )
        emp_id += 1
    for _ in range(2):
        employees.append(
            create_employee(
                emp_id, "USA", "Engineering", "MT5", "6-10 years", PerformanceLevel.MEDIUM
            )
        )
        emp_id += 1
    for _ in range(16):
        employees.append(
            create_employee(emp_id, "USA", "Engineering", "MT5", "6-10 years", PerformanceLevel.LOW)
        )
        emp_id += 1

    # 2-5 years: balanced
    for _ in range(7):
        employees.append(
            create_employee(emp_id, "USA", "Engineering", "MT5", "2-5 years", PerformanceLevel.HIGH)
        )
        emp_id += 1
    for _ in range(7):
        employees.append(
            create_employee(
                emp_id, "USA", "Engineering", "MT5", "2-5 years", PerformanceLevel.MEDIUM
            )
        )
        emp_id += 1
    for _ in range(6):
        employees.append(
            create_employee(emp_id, "USA", "Engineering", "MT5", "2-5 years", PerformanceLevel.LOW)
        )
        emp_id += 1

    result = calculate_tenure_analysis(employees)

    assert result["p_value"] < 0.05
    assert result["status"] in ["yellow", "red"]


def test_overall_intelligence_aggregation() -> None:
    """Test overall intelligence calculation."""
    # Create dataset with diversity across all dimensions
    employees = []
    emp_id = 1

    # Create diverse but biased dataset (USA has more high performers)
    functions = ["Engineering", "Sales", "Marketing"]
    levels = ["MT4", "MT5", "MT6"]
    tenures = ["0-1 years", "2-5 years", "6-10 years"]

    # USA biased high
    for func in functions:
        for level in levels:
            for tenure in tenures:
                employees.append(
                    create_employee(
                        emp_id, "USA", func, level, tenure, PerformanceLevel.HIGH, grid_position=9
                    )
                )
                emp_id += 1

    # UK balanced
    for func in functions:
        for level in levels:
            for tenure in tenures:
                for perf in [PerformanceLevel.HIGH, PerformanceLevel.MEDIUM, PerformanceLevel.LOW]:
                    grid_pos = (
                        9
                        if perf == PerformanceLevel.HIGH
                        else 5
                        if perf == PerformanceLevel.MEDIUM
                        else 1
                    )
                    employees.append(
                        create_employee(
                            emp_id, "UK", func, level, tenure, perf, grid_position=grid_pos
                        )
                    )
                    emp_id += 1

    # IN balanced
    for func in functions:
        for level in levels:
            for tenure in tenures:
                for perf in [PerformanceLevel.HIGH, PerformanceLevel.MEDIUM, PerformanceLevel.LOW]:
                    grid_pos = (
                        9
                        if perf == PerformanceLevel.HIGH
                        else 5
                        if perf == PerformanceLevel.MEDIUM
                        else 1
                    )
                    employees.append(
                        create_employee(
                            emp_id, "IN", func, level, tenure, perf, grid_position=grid_pos
                        )
                    )
                    emp_id += 1

    result = calculate_overall_intelligence(employees)

    # Verify structure
    assert "quality_score" in result
    assert "anomaly_count" in result
    assert "location_analysis" in result
    assert "function_analysis" in result
    assert "level_analysis" in result
    assert "tenure_analysis" in result

    # Quality score should be 0-100
    assert 0 <= result["quality_score"] <= 100

    # Anomaly counts should sum to 4 (one per dimension)
    total_analyses = (
        result["anomaly_count"]["green"]
        + result["anomaly_count"]["yellow"]
        + result["anomaly_count"]["red"]
    )
    assert total_analyses == 4


def test_quality_score_calculation() -> None:
    """Test quality score calculation logic."""
    # Create perfectly uniform dataset with enough samples in each category
    employees = []
    emp_id = 1

    # Create 5 copies of each combination to ensure sufficient sample size
    for _ in range(5):
        for loc in ["USA", "UK", "IN"]:
            for func in ["Engineering", "Sales"]:
                for level in ["MT4", "MT5"]:
                    for tenure in ["0-1 years", "2-5 years"]:
                        for perf in [
                            PerformanceLevel.HIGH,
                            PerformanceLevel.MEDIUM,
                            PerformanceLevel.LOW,
                        ]:
                            # Assign appropriate grid position based on performance
                            grid_pos = (
                                9
                                if perf == PerformanceLevel.HIGH
                                else 5
                                if perf == PerformanceLevel.MEDIUM
                                else 1
                            )
                            employees.append(
                                create_employee(
                                    emp_id, loc, func, level, tenure, perf, grid_position=grid_pos
                                )
                            )
                            emp_id += 1

    result = calculate_overall_intelligence(employees)

    # With uniform distribution, all should be green
    assert result["anomaly_count"]["green"] == 4
    assert result["quality_score"] == 100


def test_empty_employee_list() -> None:
    """Test all analysis functions with empty employee list."""
    employees: list[Employee] = []

    location = calculate_location_analysis(employees)
    function = calculate_function_analysis(employees)
    level = calculate_level_analysis(employees)
    tenure = calculate_tenure_analysis(employees)

    # All should return empty analysis
    for result in [location, function, level, tenure]:
        assert result["sample_size"] == 0
        assert result["p_value"] == 1.0
        assert result["status"] == "green"
        assert len(result["deviations"]) == 0
