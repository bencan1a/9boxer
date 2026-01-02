"""Performance tests for manager analysis with deep org hierarchies.

Tests the performance of recursive org tree building in calculate_manager_analysis()
with large, deeply nested organizations to ensure it scales appropriately.
"""

import random
from datetime import date
from typing import Any

import pytest

from ninebox.models.employee import Employee, PerformanceLevel, PotentialLevel
from ninebox.services.intelligence_service import calculate_manager_analysis

# Check if pytest-benchmark is available
try:
    import pytest_benchmark  # noqa: F401

    BENCHMARK_AVAILABLE = True
except ImportError:
    BENCHMARK_AVAILABLE = False

pytestmark = [
    pytest.mark.performance,
    pytest.mark.slow,
    pytest.mark.skipif(
        not BENCHMARK_AVAILABLE,
        reason="pytest-benchmark not installed. Install with: pip install pytest-benchmark",
    ),
]


def _calculate_level_distribution(
    total_employees: int, levels: int, avg_span_of_control: int
) -> list[int]:
    """Calculate distribution of employees across org levels.

    Args:
        total_employees: Total number of employees to generate
        levels: Number of management levels
        avg_span_of_control: Average number of direct reports per manager

    Returns:
        List of employee counts per level
    """
    employees_per_level = []
    remaining = total_employees

    for level in range(levels):
        if level == 0:
            count = 1  # CEO level - always 1
        elif level == levels - 1:
            count = remaining  # Bottom level - assign all remaining
        else:
            expected_count = int(avg_span_of_control**level)
            count = min(expected_count, remaining // (levels - level))

        employees_per_level.append(count)
        remaining -= count

    # Distribute any remaining employees to bottom levels
    if remaining > 0:
        employees_per_level[-1] += remaining

    return employees_per_level


def _generate_performance(rng: random.Random) -> PerformanceLevel:
    """Generate a performance rating following 20/70/10 distribution.

    Args:
        rng: Random number generator

    Returns:
        Performance level
    """
    rand_val = rng.random()
    if rand_val < 0.20:
        return PerformanceLevel.HIGH
    elif rand_val < 0.90:
        return PerformanceLevel.MEDIUM
    else:
        return PerformanceLevel.LOW


def _generate_potential(rng: random.Random) -> PotentialLevel:
    """Generate a potential rating following 20/70/10 distribution.

    Args:
        rng: Random number generator

    Returns:
        Potential level
    """
    rand_val = rng.random()
    if rand_val < 0.20:
        return PotentialLevel.HIGH
    elif rand_val < 0.90:
        return PotentialLevel.MEDIUM
    else:
        return PotentialLevel.LOW


def generate_deep_org_hierarchy(
    total_employees: int,
    levels: int,
    avg_span_of_control: int = 5,
    seed: int = 42,
) -> list[Employee]:
    """Generate a deep organizational hierarchy for performance testing.

    Creates a realistic org tree with specified depth and employee count.
    Each manager has approximately `avg_span_of_control` direct reports.

    Args:
        total_employees: Total number of employees to generate
        levels: Number of management levels (e.g., 6 for CEO down to IC)
        avg_span_of_control: Average number of direct reports per manager
        seed: Random seed for reproducibility

    Returns:
        List of Employee objects with realistic org hierarchy

    Example:
        >>> employees = generate_deep_org_hierarchy(1000, 6, 5, seed=42)
        >>> len(employees)
        1000
    """
    rng = random.Random(seed)  # nosec B311 - Sample data generation, not security
    employees = []

    # Calculate distribution across levels (pyramid structure)
    employees_per_level = _calculate_level_distribution(
        total_employees, levels, avg_span_of_control
    )

    # Create employees level by level
    emp_id = 1
    level_employees: list[list[Employee]] = []

    for level_idx, count in enumerate(employees_per_level):
        level_emps = []

        for i in range(count):
            # Determine manager (from previous level)
            if level_idx == 0:
                manager_name = "Board of Directors"  # CEO has no manager
            else:
                # Distribute reports evenly across managers in previous level
                manager_idx = i % len(level_employees[level_idx - 1])
                manager_name = level_employees[level_idx - 1][manager_idx].name

            # Generate performance/potential distribution (20/70/10)
            performance = _generate_performance(rng)
            potential = _generate_potential(rng)

            # Calculate grid position
            perf_val = {"Low": 1, "Medium": 2, "High": 3}[performance.value]
            pot_val = {"Low": 1, "Medium": 2, "High": 3}[potential.value]
            grid_position = (pot_val - 1) * 3 + perf_val

            # Create employee
            emp = Employee(
                employee_id=emp_id,
                name=f"Employee {emp_id:04d}",
                business_title=f"Level {level_idx + 1} Position",
                job_title=f"Job {level_idx + 1}",
                job_profile="Engineering-USA",
                job_level=f"MT{levels - level_idx}",
                job_function="Engineering",
                location="USA" if emp_id % 2 == 0 else "CAN",
                direct_manager=manager_name,
                hire_date=date(2020, 1, 1),
                tenure_category="2-5 years",
                time_in_job_profile="1-2 years",
                performance=performance,
                potential=potential,
                grid_position=grid_position,
                talent_indicator="Standard",
            )

            level_emps.append(emp)
            employees.append(emp)
            emp_id += 1

        level_employees.append(level_emps)

    return employees


class TestManagerAnalysisPerformance:
    """Performance tests for manager analysis with deep hierarchies."""

    def test_manager_analysis_deep_hierarchy_performance(
        self,
        benchmark: Any,
    ) -> None:
        """Test manager analysis with deep org hierarchy (1000 employees, 6 levels).

        Performance target: <1 second for 1000 employees

        This test validates that the recursive org tree building in
        calculate_manager_analysis() scales appropriately with:
        - Large employee counts (1000+)
        - Deep management levels (6+)
        - Complex reporting structures

        The test uses a realistic org structure with:
        - 6 management levels (CEO to IC)
        - ~5 average span of control
        - 1000 total employees
        - Realistic 20/70/10 performance distribution
        """
        employees = generate_deep_org_hierarchy(
            total_employees=1000,
            levels=6,
            avg_span_of_control=5,
            seed=42,
        )

        def run_analysis() -> dict:
            return calculate_manager_analysis(employees, min_team_size=10)

        result = benchmark(run_analysis)

        # Validate results are reasonable
        assert result["status"] in ["green", "yellow", "red"]
        assert result["sample_size"] == 1000
        assert len(result["deviations"]) >= 0  # May have 0-10 managers above threshold

        # Performance assertion: Should complete in < 1 second
        assert benchmark.stats["mean"] < 1.0, (
            f"Manager analysis took {benchmark.stats['mean']:.3f}s, "
            f"expected < 1.0s for 1000 employees"
        )

    def test_manager_analysis_very_deep_hierarchy_performance(
        self,
        benchmark: Any,
    ) -> None:
        """Test manager analysis with very deep org hierarchy (1000 employees, 10 levels).

        Performance target: <1.5 seconds for 1000 employees at 10 levels

        This test validates performance with extreme depth scenarios:
        - 10 management levels (unusual but possible)
        - 1000 employees
        - Lower span of control (more hierarchy depth)

        This represents a worst-case scenario for recursive traversal.
        """
        employees = generate_deep_org_hierarchy(
            total_employees=1000,
            levels=10,
            avg_span_of_control=3,  # Lower span = deeper hierarchy
            seed=42,
        )

        def run_analysis() -> dict:
            return calculate_manager_analysis(employees, min_team_size=10)

        result = benchmark(run_analysis)

        # Validate results are reasonable
        assert result["status"] in ["green", "yellow", "red"]
        assert result["sample_size"] == 1000

        # Performance assertion: Should complete in < 1.5 seconds even with 10 levels
        assert benchmark.stats["mean"] < 1.5, (
            f"Manager analysis took {benchmark.stats['mean']:.3f}s, "
            f"expected < 1.5s for 1000 employees at 10 levels"
        )

    def test_manager_analysis_wide_hierarchy_performance(
        self,
        benchmark: Any,
    ) -> None:
        """Test manager analysis with wide org hierarchy (2000 employees, 4 levels).

        Performance target: <1.5 seconds for 2000 employees

        This test validates performance with wide but shallow hierarchies:
        - 4 management levels only
        - 2000 employees (2x normal)
        - Higher span of control (flatter org)

        This tests the impact of employee count rather than depth.
        """
        employees = generate_deep_org_hierarchy(
            total_employees=2000,
            levels=4,
            avg_span_of_control=10,  # Higher span = flatter hierarchy
            seed=42,
        )

        def run_analysis() -> dict:
            return calculate_manager_analysis(employees, min_team_size=10)

        result = benchmark(run_analysis)

        # Validate results are reasonable
        assert result["status"] in ["green", "yellow", "red"]
        assert result["sample_size"] == 2000

        # Performance assertion: Should complete in < 1.5 seconds even with 2000 employees
        assert benchmark.stats["mean"] < 1.5, (
            f"Manager analysis took {benchmark.stats['mean']:.3f}s, "
            f"expected < 1.5s for 2000 employees"
        )
