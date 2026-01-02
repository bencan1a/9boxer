"""Tests for chi-square goodness-of-fit implementation in manager analysis."""

from datetime import date

import pytest

from ninebox.models.employee import Employee, PerformanceLevel, PotentialLevel
from ninebox.services.intelligence_service import (
    _calculate_manager_chi_square,
    calculate_manager_analysis,
)

pytestmark = pytest.mark.unit


def create_employee_with_manager(
    emp_id: int,
    name: str,
    manager: str,
    performance: PerformanceLevel,
    potential: PotentialLevel = PotentialLevel.MEDIUM,
) -> Employee:
    """Create a test employee with specified manager and performance."""
    # Calculate grid position from performance and potential
    perf_val = {"Low": 0, "Medium": 1, "High": 2}[performance.value]
    pot_val = {"Low": 0, "Medium": 1, "High": 2}[potential.value]
    grid_position = (pot_val * 3) + (perf_val + 1)

    return Employee(
        employee_id=emp_id,
        name=name,
        business_title="Test Title",
        job_title="Test Job",
        job_profile="Engineering-USA",
        job_level="MT5",
        job_function="Engineering",
        location="USA",
        direct_manager=manager,
        hire_date=date(2020, 1, 1),
        tenure_category="2-5 years",
        time_in_job_profile="1-2 years",
        performance=performance,
        potential=potential,
        grid_position=grid_position,
        talent_indicator="Standard",
    )


def test_calculate_manager_chi_square_perfect_fit() -> None:
    """Test chi-square GOF with perfect 20/70/10 distribution."""
    # Perfect distribution: 2 high, 7 medium, 1 low out of 10
    observed = [2, 7, 1]
    expected_pct = [20.0, 70.0, 10.0]
    team_size = 10

    chi2, p_value = _calculate_manager_chi_square(observed, expected_pct, team_size)

    # Perfect fit should have chi2 = 0 and p_value = 1.0
    assert chi2 == pytest.approx(0.0, abs=0.01)
    assert p_value == pytest.approx(1.0, abs=0.01)


def test_calculate_manager_chi_square_significant_deviation() -> None:
    """Test chi-square GOF with significant deviation from baseline."""
    # Highly biased: 8 high, 2 medium, 0 low out of 10
    # Expected: 2 high, 7 medium, 1 low
    observed = [8, 2, 0]
    expected_pct = [20.0, 70.0, 10.0]
    team_size = 10

    chi2, p_value = _calculate_manager_chi_square(observed, expected_pct, team_size)

    # This should be highly significant (p < 0.01)
    assert chi2 > 10.0  # Very large chi-square
    assert p_value < 0.01  # Highly significant


def test_calculate_manager_chi_square_moderate_deviation() -> None:
    """Test chi-square GOF with moderate deviation from baseline."""
    # Moderate bias: 4 high, 5 medium, 1 low out of 10
    # Expected: 2 high, 7 medium, 1 low
    observed = [4, 5, 1]
    expected_pct = [20.0, 70.0, 10.0]
    team_size = 10

    chi2, p_value = _calculate_manager_chi_square(observed, expected_pct, team_size)

    # This should be borderline significant or not significant
    assert 2.0 < chi2 < 10.0
    assert 0.01 < p_value < 0.50  # May or may not be significant


def test_manager_analysis_returns_chi_square_values() -> None:
    """Test that manager analysis returns chi-square statistics."""
    employees = []

    # Create a biased manager with 50% high performers
    employees.append(
        create_employee_with_manager(1, "Biased Manager", "VP", PerformanceLevel.HIGH)
    )
    for i in range(2, 12):
        if i <= 6:  # 5 high = 50%
            perf = PerformanceLevel.HIGH
            pot = PotentialLevel.HIGH
        elif i <= 10:  # 4 medium = 40%
            perf = PerformanceLevel.MEDIUM
            pot = PotentialLevel.MEDIUM
        else:  # 1 low = 10%
            perf = PerformanceLevel.LOW
            pot = PotentialLevel.LOW

        employees.append(
            create_employee_with_manager(i, f"Emp {i}", "Biased Manager", perf, pot)
        )

    result = calculate_manager_analysis(employees, min_team_size=10)

    # Verify result structure
    assert "deviations" in result
    assert len(result["deviations"]) > 0

    # Verify first deviation has chi-square fields
    dev = result["deviations"][0]
    assert "chi_square" in dev
    assert "p_value" in dev
    assert "z_score" in dev  # For backward compatibility
    assert "is_significant" in dev

    # For 50% high vs 20% expected, chi-square should be elevated
    # With small sample (n=10), may not reach p < 0.05 threshold
    assert dev["chi_square"] > 3.0  # Should show deviation
    assert dev["p_value"] < 0.15  # Should be trending toward significance


def test_manager_analysis_significance_threshold() -> None:
    """Test that is_significant uses p < 0.05 threshold."""
    employees = []

    # Manager 1: Slightly biased (30% high vs 20% expected)
    employees.append(
        create_employee_with_manager(1, "Slightly Biased", "VP", PerformanceLevel.HIGH)
    )
    for i in range(2, 12):
        if i <= 4:  # 3 high = 30%
            perf = PerformanceLevel.HIGH
            pot = PotentialLevel.HIGH
        elif i <= 10:  # 6 medium = 60%
            perf = PerformanceLevel.MEDIUM
            pot = PotentialLevel.MEDIUM
        else:  # 1 low = 10%
            perf = PerformanceLevel.LOW
            pot = PotentialLevel.LOW

        employees.append(
            create_employee_with_manager(i, f"Emp {i}", "Slightly Biased", perf, pot)
        )

    result = calculate_manager_analysis(employees, min_team_size=10)

    dev = result["deviations"][0]

    # Verify significance is based on p-value, not arbitrary z-score threshold
    if dev["p_value"] < 0.05:
        assert dev["is_significant"] is True
    else:
        assert dev["is_significant"] is False


def test_manager_analysis_overall_p_value() -> None:
    """Test that overall p_value is minimum across managers."""
    employees = []

    # Manager 1: Very biased (50% high)
    employees.append(create_employee_with_manager(1, "Manager A", "VP", PerformanceLevel.HIGH))
    for i in range(2, 12):
        perf = PerformanceLevel.HIGH if i <= 6 else PerformanceLevel.MEDIUM
        pot = PotentialLevel.HIGH if i <= 6 else PotentialLevel.MEDIUM
        employees.append(create_employee_with_manager(i, f"Emp A{i}", "Manager A", perf, pot))

    # Manager 2: Less biased (30% high)
    employees.append(
        create_employee_with_manager(20, "Manager B", "VP", PerformanceLevel.HIGH)
    )
    for i in range(21, 31):
        perf = PerformanceLevel.HIGH if i <= 23 else PerformanceLevel.MEDIUM
        pot = PotentialLevel.HIGH if i <= 23 else PotentialLevel.MEDIUM
        employees.append(create_employee_with_manager(i, f"Emp B{i}", "Manager B", perf, pot))

    result = calculate_manager_analysis(employees, min_team_size=10)

    # Overall p_value should be minimum (most significant) across managers
    manager_p_values = [d["p_value"] for d in result["deviations"]]
    assert result["p_value"] == pytest.approx(min(manager_p_values), abs=0.0001)


def test_manager_analysis_degrees_of_freedom() -> None:
    """Test that degrees of freedom is correctly set to 2."""
    employees = []
    employees.append(create_employee_with_manager(1, "Manager", "VP", PerformanceLevel.HIGH))
    for i in range(2, 12):
        employees.append(
            create_employee_with_manager(i, f"Emp {i}", "Manager", PerformanceLevel.HIGH)
        )

    result = calculate_manager_analysis(employees, min_team_size=10)

    # df = k - 1 = 3 - 1 = 2 for goodness-of-fit with 3 categories (H/M/L)
    assert result["degrees_of_freedom"] == 2


def test_z_score_equivalent_from_chi_square() -> None:
    """Test that z_score is calculated from chi-square for backward compatibility."""
    employees = []

    # Create manager with known distribution
    employees.append(create_employee_with_manager(1, "Manager", "VP", PerformanceLevel.HIGH))
    for i in range(2, 12):
        if i <= 6:  # 5 high = 50%
            perf = PerformanceLevel.HIGH
            pot = PotentialLevel.HIGH
        else:  # 5 medium = 50%
            perf = PerformanceLevel.MEDIUM
            pot = PotentialLevel.MEDIUM

        employees.append(create_employee_with_manager(i, f"Emp {i}", "Manager", perf, pot))

    result = calculate_manager_analysis(employees, min_team_size=10)
    dev = result["deviations"][0]

    # z_score should be approximately sqrt(chi_square)
    # For chi2 with df=2: chi2 ≈ 5.99 at p=0.05 → z ≈ 2.45
    # For chi2 with df=2: chi2 ≈ 9.21 at p=0.01 → z ≈ 3.03
    import math

    expected_z = math.sqrt(dev["chi_square"])
    assert dev["z_score"] == pytest.approx(expected_z, abs=0.01)
