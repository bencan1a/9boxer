"""Shared test utilities and helper functions."""

from datetime import date

from ninebox.models.employee import Employee, PerformanceLevel, PotentialLevel


def create_test_employee(
    employee_id: int = 1,
    name: str = "Alice",
    performance: PerformanceLevel = PerformanceLevel.MEDIUM,
    potential: PotentialLevel = PotentialLevel.MEDIUM,
    flags: list[str] | None = None,
    grid_position: int = 5,
) -> Employee:
    """Create a minimal Employee for testing with all required fields.

    Args:
        employee_id: Employee ID (default: 1)
        name: Employee name (default: "Alice")
        performance: Performance level (default: MEDIUM)
        potential: Potential level (default: MEDIUM)
        flags: Employee flags, must be from ALLOWED_FLAGS (default: None)
        grid_position: Grid position 1-9 (default: 5)

    Returns:
        Employee object with all required fields populated
    """
    return Employee(
        employee_id=employee_id,
        name=name,
        business_title="Test Title",
        job_title="Test Job",
        job_profile="Test ProfileUSA",
        job_level="MT4",
        job_function="Other",
        location="USA",
        manager="Test Manager",
        hire_date=date(2020, 1, 1),
        tenure_category="3-5 years",
        time_in_job_profile="2 years",
        performance=performance,
        potential=potential,
        grid_position=grid_position,
        talent_indicator="Solid Contributor",
        flags=flags,
    )
