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
    location: str = "USA",
    function: str = "Engineering",
    level: str = "MT5",
    tenure: str = "3-5 years",
    performance: PerformanceLevel = PerformanceLevel.MEDIUM,
    potential: PotentialLevel = PotentialLevel.MEDIUM,
    grid_position: int | None = None,
) -> Employee:
    """Create a test employee with specified attributes.

    If grid_position is not specified, it's automatically set based on performance level:
    - HIGH -> 9 (Star position)
    - MEDIUM -> 5 (Core Talent position)
    - LOW -> 1 (Underperformer position)
    """
    # Auto-assign grid_position based on performance if not explicitly set
    if grid_position is None:
        if performance == PerformanceLevel.HIGH:
            grid_position = 9  # Star
        elif performance == PerformanceLevel.LOW:
            grid_position = 1  # Underperformer
        else:  # MEDIUM
            grid_position = 5  # Core Talent

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
    assert "manager_analysis" in result

    # Quality score should be 0-100
    assert 0 <= result["quality_score"] <= 100

    # Anomaly counts should sum to 5 (one per dimension: location, function, level, tenure, manager)
    total_analyses = (
        result["anomaly_count"]["green"]
        + result["anomaly_count"]["yellow"]
        + result["anomaly_count"]["red"]
    )
    assert total_analyses == 5


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

    # With uniform distribution across location/function/level/tenure, all analyses should be green
    # Note: Manager analysis is also green because test data doesn't create valid manager relationships
    # (all employees report to "Test Manager" which doesn't exist as an employee)
    assert result["anomaly_count"]["green"] == 5
    assert result["anomaly_count"]["red"] == 0
    assert result["quality_score"] == 100  # 5 out of 5 green = 100%


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


# Tests for calculate_per_level_distribution()
# This is a new analysis function for the agent-first architecture


def test_per_level_distribution_calculates_percentages_correctly() -> None:
    """Test that per-level distribution calculates percentages correctly."""
    try:
        from ninebox.services.intelligence_service import calculate_per_level_distribution
    except ImportError:
        pytest.skip("calculate_per_level_distribution not yet implemented")

    # Create test data: MT3 level with 50% high performers (inflation)
    # Function requires >= 30 employees total
    employees = []
    # MT3: 10 high, 5 medium, 5 low (50% high - inflated)
    for i in range(10):
        employees.append(
            create_employee(i, level="MT3", performance=PerformanceLevel.HIGH)
        )
    for i in range(10, 15):
        employees.append(
            create_employee(i, level="MT3", performance=PerformanceLevel.MEDIUM)
        )
    for i in range(15, 20):
        employees.append(
            create_employee(i, level="MT3", performance=PerformanceLevel.LOW)
        )

    # Add MT5 to meet minimum 30 employees and have 2 levels
    for i in range(20, 25):
        employees.append(
            create_employee(i, level="MT5", performance=PerformanceLevel.HIGH)
        )
    for i in range(25, 30):
        employees.append(
            create_employee(i, level="MT5", performance=PerformanceLevel.MEDIUM)
        )

    result = calculate_per_level_distribution(employees)

    # Should have MT3 in levels
    assert "levels" in result
    assert "MT3" in result["levels"]
    mt3_stats = result["levels"]["MT3"]

    # Check percentages
    assert mt3_stats["high_performers_pct"] == pytest.approx(50.0, rel=0.1)
    assert mt3_stats["medium_performers_pct"] == pytest.approx(25.0, rel=0.1)
    assert mt3_stats["low_performers_pct"] == pytest.approx(25.0, rel=0.1)
    assert mt3_stats["total_count"] == 20


def test_per_level_distribution_computes_z_scores_accurately() -> None:
    """Test that z-scores are computed accurately for per-level distribution."""
    try:
        from ninebox.services.intelligence_service import calculate_per_level_distribution
    except ImportError:
        pytest.skip("calculate_per_level_distribution not yet implemented")

    # Create test data with clear anomaly
    employees = []

    # MT3: 18 high, 1 medium, 1 low (90% high - extreme inflation)
    for i in range(18):
        employees.append(
            create_employee(i, level="MT3", performance=PerformanceLevel.HIGH)
        )
    employees.append(
        create_employee(18, level="MT3", performance=PerformanceLevel.MEDIUM)
    )
    employees.append(
        create_employee(19, level="MT3", performance=PerformanceLevel.LOW)
    )

    # MT5: Balanced - 7 high, 7 medium, 6 low
    for i in range(7):
        employees.append(
            create_employee(20 + i, level="MT5", performance=PerformanceLevel.HIGH)
        )
    for i in range(7):
        employees.append(
            create_employee(27 + i, level="MT5", performance=PerformanceLevel.MEDIUM)
        )
    for i in range(6):
        employees.append(
            create_employee(34 + i, level="MT5", performance=PerformanceLevel.LOW)
        )

    result = calculate_per_level_distribution(employees)

    # MT3 should have high z-score (deviation from expected)
    assert "levels" in result
    assert "MT3" in result["levels"]
    mt3_stats = result["levels"]["MT3"]
    assert "z_scores" in mt3_stats
    # Z-score for high performers should be significantly positive (more high performers than expected)
    assert mt3_stats["z_scores"]["high"] > 2.0, "MT3 should show significant positive deviation"


def test_per_level_distribution_detects_driving_anomaly() -> None:
    """Test that per-level distribution detects which level is driving the anomaly."""
    try:
        from ninebox.services.intelligence_service import calculate_per_level_distribution
    except ImportError:
        pytest.skip("calculate_per_level_distribution not yet implemented")

    employees = []

    # MT6: 15 high, 3 medium, 2 low (75% high - clear anomaly)
    for i in range(15):
        employees.append(
            create_employee(i, level="MT6", performance=PerformanceLevel.HIGH)
        )
    for i in range(3):
        employees.append(
            create_employee(15 + i, level="MT6", performance=PerformanceLevel.MEDIUM)
        )
    for i in range(2):
        employees.append(
            create_employee(18 + i, level="MT6", performance=PerformanceLevel.LOW)
        )

    # MT4: Balanced
    for i in range(7):
        employees.append(
            create_employee(20 + i, level="MT4", performance=PerformanceLevel.HIGH)
        )
    for i in range(7):
        employees.append(
            create_employee(27 + i, level="MT4", performance=PerformanceLevel.MEDIUM)
        )
    for i in range(6):
        employees.append(
            create_employee(34 + i, level="MT4", performance=PerformanceLevel.LOW)
        )

    result = calculate_per_level_distribution(employees)

    # MT6 should be flagged as driving the anomaly (red status with deviations)
    assert "levels" in result
    assert "MT6" in result["levels"]
    mt6_stats = result["levels"]["MT6"]
    # Level with anomaly should have red status and deviations
    assert mt6_stats["status"] in ["red", "yellow"], "MT6 should show anomaly status"
    assert len(mt6_stats["deviations"]) > 0, "MT6 should have deviation messages"


def test_per_level_distribution_returns_correct_status() -> None:
    """Test that per-level distribution returns correct status (red/yellow/green)."""
    try:
        from ninebox.services.intelligence_service import calculate_per_level_distribution
    except ImportError:
        pytest.skip("calculate_per_level_distribution not yet implemented")

    # Create extreme anomaly (should be red)
    # Function requires >= 30 employees total and >= 2 levels
    employees = []
    # MT3: 18 high, 1 medium, 1 low (90% high - extreme inflation)
    for i in range(18):
        employees.append(
            create_employee(i, level="MT3", performance=PerformanceLevel.HIGH)
        )
    employees.append(
        create_employee(18, level="MT3", performance=PerformanceLevel.MEDIUM)
    )
    employees.append(
        create_employee(19, level="MT3", performance=PerformanceLevel.LOW)
    )

    # Add MT5 to meet minimum requirements (balanced to not skew overall)
    for i in range(20, 23):
        employees.append(
            create_employee(i, level="MT5", performance=PerformanceLevel.HIGH)
        )
    for i in range(23, 27):
        employees.append(
            create_employee(i, level="MT5", performance=PerformanceLevel.MEDIUM)
        )
    for i in range(27, 30):
        employees.append(
            create_employee(i, level="MT5", performance=PerformanceLevel.LOW)
        )

    result = calculate_per_level_distribution(employees)

    # Should return overall status (function returns both overall and per-level status)
    assert "status" in result
    assert result["status"] in ["red", "yellow"], "Overall status should indicate anomaly"
    # Also check per-level status
    assert "levels" in result
    assert "MT3" in result["levels"]
    assert result["levels"]["MT3"]["status"] in ["red", "yellow"], "MT3 should have anomaly status"


def test_per_level_distribution_handles_level_with_zero_employees() -> None:
    """Test that per-level distribution handles levels with 0 employees."""
    try:
        from ninebox.services.intelligence_service import calculate_per_level_distribution
    except ImportError:
        pytest.skip("calculate_per_level_distribution not yet implemented")

    # Only create MT3 employees (need >= 30 total to pass min requirement)
    employees = []
    for i in range(30):
        employees.append(
            create_employee(i, level="MT3", performance=PerformanceLevel.HIGH)
        )
    # Add a few MT5 to meet the >= 2 levels requirement
    for i in range(30, 35):
        employees.append(
            create_employee(i, level="MT5", performance=PerformanceLevel.MEDIUM)
        )

    result = calculate_per_level_distribution(employees)

    # Should have both MT3 and MT5 in levels
    assert "levels" in result
    assert "MT3" in result["levels"]
    assert "MT5" in result["levels"]
    # MT6 should not be present (no employees at that level)
    assert "MT6" not in result["levels"], "MT6 should not appear if no employees at that level"


def test_per_level_distribution_handles_single_employee_per_level() -> None:
    """Test that per-level distribution handles edge case of single employee."""
    try:
        from ninebox.services.intelligence_service import calculate_per_level_distribution
    except ImportError:
        pytest.skip("calculate_per_level_distribution not yet implemented")

    # Single employee at MT3 - function requires >= 30 employees and >= 2 levels
    # This test verifies graceful error handling
    employees = [
        create_employee(1, level="MT3", performance=PerformanceLevel.HIGH)
    ]

    result = calculate_per_level_distribution(employees)

    # Should return empty analysis with explanation (insufficient levels)
    assert "status" in result
    assert result["status"] == "green"  # Empty analysis returns green
    assert "interpretation" in result
    # With only 1 employee at 1 level, returns "Insufficient levels" message
    assert "insufficient" in result["interpretation"].lower()


def test_per_level_distribution_example_mt3_with_50_percent_high() -> None:
    """Test the specific example: MT3 with 50% high performers → red status, high z-score."""
    try:
        from ninebox.services.intelligence_service import calculate_per_level_distribution
    except ImportError:
        pytest.skip("calculate_per_level_distribution not yet implemented")

    # Create the exact example from the task
    employees = []

    # MT3: 50% high performers
    for i in range(10):
        employees.append(
            create_employee(i, level="MT3", performance=PerformanceLevel.HIGH)
        )
    for i in range(10, 15):
        employees.append(
            create_employee(i, level="MT3", performance=PerformanceLevel.MEDIUM)
        )
    for i in range(15, 20):
        employees.append(
            create_employee(i, level="MT3", performance=PerformanceLevel.LOW)
        )

    # Add other levels to establish baseline
    for i in range(7):
        employees.append(
            create_employee(20 + i, level="MT5", performance=PerformanceLevel.HIGH)
        )
    for i in range(7):
        employees.append(
            create_employee(27 + i, level="MT5", performance=PerformanceLevel.MEDIUM)
        )
    for i in range(6):
        employees.append(
            create_employee(34 + i, level="MT5", performance=PerformanceLevel.LOW)
        )

    result = calculate_per_level_distribution(employees)

    # Verify MT3 results
    assert "levels" in result
    assert "MT3" in result["levels"]
    mt3 = result["levels"]["MT3"]

    # 50% high performers
    assert mt3["high_performers_pct"] == pytest.approx(50.0, rel=0.1)

    # High z-score (should be > 2.0 for statistical significance)
    assert mt3["z_scores"]["high"] > 2.0, "Z-score should indicate significant deviation"

    # Red status (or yellow at minimum)
    assert mt3["status"] in ["red", "yellow"], "MT3 should have anomaly status"


def test_per_level_distribution_multiple_levels_with_different_distributions() -> None:
    """Test per-level distribution with multiple levels showing different patterns."""
    try:
        from ninebox.services.intelligence_service import calculate_per_level_distribution
    except ImportError:
        pytest.skip("calculate_per_level_distribution not yet implemented")

    employees = []

    # MT3: Inflated (15 high, 3 medium, 2 low)
    for i in range(15):
        employees.append(
            create_employee(i, level="MT3", performance=PerformanceLevel.HIGH)
        )
    for i in range(3):
        employees.append(
            create_employee(15 + i, level="MT3", performance=PerformanceLevel.MEDIUM)
        )
    for i in range(2):
        employees.append(
            create_employee(18 + i, level="MT3", performance=PerformanceLevel.LOW)
        )

    # MT5: Balanced (7 high, 7 medium, 6 low)
    for i in range(7):
        employees.append(
            create_employee(20 + i, level="MT5", performance=PerformanceLevel.HIGH)
        )
    for i in range(7):
        employees.append(
            create_employee(27 + i, level="MT5", performance=PerformanceLevel.MEDIUM)
        )
    for i in range(6):
        employees.append(
            create_employee(34 + i, level="MT5", performance=PerformanceLevel.LOW)
        )

    # MT6: Deflated (2 high, 3 medium, 15 low)
    for i in range(2):
        employees.append(
            create_employee(40 + i, level="MT6", performance=PerformanceLevel.HIGH)
        )
    for i in range(3):
        employees.append(
            create_employee(42 + i, level="MT6", performance=PerformanceLevel.MEDIUM)
        )
    for i in range(15):
        employees.append(
            create_employee(45 + i, level="MT6", performance=PerformanceLevel.LOW)
        )

    result = calculate_per_level_distribution(employees)

    # All levels should be present
    assert "levels" in result
    assert "MT3" in result["levels"]
    assert "MT5" in result["levels"]
    assert "MT6" in result["levels"]

    # MT3 should show positive deviation for high performers (inflated)
    assert result["levels"]["MT3"]["z_scores"]["high"] > 1.0, "MT3 should show positive deviation"

    # MT6 should show negative deviation for high performers (deflated)
    # With 2/20 = 10% high vs 20% expected, z-score for high should be negative
    assert result["levels"]["MT6"]["z_scores"]["high"] <= -1.0, "MT6 should show negative deviation"

    # MT5 should be less extreme than MT3 and MT6
    # MT5 has 7/7/6 distribution which deviates from baseline but less than MT3/MT6
    mt5_z_scores = result["levels"]["MT5"]["z_scores"]
    max_z_mt5 = max(abs(mt5_z_scores["high"]), abs(mt5_z_scores["medium"]), abs(mt5_z_scores["low"]))
    max_z_mt3 = max(abs(result["levels"]["MT3"]["z_scores"][k]) for k in ["high", "medium", "low"])
    max_z_mt6 = max(abs(result["levels"]["MT6"]["z_scores"][k]) for k in ["high", "medium", "low"])
    # MT5 should have smaller deviation than the more extreme MT3 and MT6
    assert max_z_mt5 < max(max_z_mt3, max_z_mt6), "MT5 should be less extreme than MT3/MT6"
