"""Employee filtering and query service."""

from datetime import date
from enum import Enum

from ninebox.models.employee import Employee, PerformanceLevel, PotentialLevel


class PerformanceTier(str, Enum):
    """Performance tier for big mover detection.

    Tiers group grid positions to identify significant performance changes.
    Big movers are identified when employees cross from Low to High tier or vice versa.
    """

    LOW = "Low"  # Boxes 1, 2, 3, 4
    MIDDLE = "Middle"  # Boxes 5, 7
    HIGH = "High"  # Boxes 6, 8, 9


# European country codes (ISO 3166-1 alpha-3)
EUROPEAN_COUNTRIES = {
    "GBR",
    "FRA",
    "DEU",
    "ITA",
    "ESP",
    "NLD",
    "BEL",
    "SWE",
    "NOR",
    "DNK",
    "FIN",
    "POL",
    "AUT",
    "CHE",
    "IRL",
    "PRT",
    "GRC",
    "CZE",
    "HUN",
    "ROU",
    "BGR",
    "HRV",
    "SVK",
    "SVN",
    "LTU",
    "LVA",
    "EST",
    "LUX",
    "MLT",
    "CYP",
}

LOCATION_MAP = {
    "AUS": "Australia",
    "IND": "India",
    "USA": "USA",
    "CAN": "Canada",
}


def map_location_to_display(location_code: str) -> str:
    """Map location code to display name."""
    if location_code in EUROPEAN_COUNTRIES:
        return "Europe"
    return LOCATION_MAP.get(location_code, location_code)


def get_tier_from_position(position: int) -> PerformanceTier:
    """Get performance tier from grid position.

    Args:
        position: Grid position (1-9)

    Returns:
        Performance tier (Low, Middle, or High)

    Examples:
        >>> get_tier_from_position(1)
        PerformanceTier.LOW
        >>> get_tier_from_position(5)
        PerformanceTier.MIDDLE
        >>> get_tier_from_position(9)
        PerformanceTier.HIGH
    """
    if position in {1, 2, 3, 4}:
        return PerformanceTier.LOW
    if position in {5, 7}:
        return PerformanceTier.MIDDLE
    if position in {6, 8, 9}:
        return PerformanceTier.HIGH
    raise ValueError(f"Invalid grid position: {position}")


def get_tier_from_historical_rating(rating: str) -> PerformanceTier:
    """Get performance tier from historical rating.

    Maps prior year ratings to performance tiers for big mover detection.

    Args:
        rating: Historical rating (Low, Solid, Strong, Leading)

    Returns:
        Performance tier (Low, Middle, or High)

    Examples:
        >>> get_tier_from_historical_rating("Low")
        PerformanceTier.LOW
        >>> get_tier_from_historical_rating("Solid")
        PerformanceTier.MIDDLE
        >>> get_tier_from_historical_rating("Strong")
        PerformanceTier.HIGH
        >>> get_tier_from_historical_rating("Leading")
        PerformanceTier.HIGH
    """
    rating_lower = rating.lower()
    if rating_lower == "low":
        return PerformanceTier.LOW
    if rating_lower == "solid":
        return PerformanceTier.MIDDLE
    if rating_lower in {"strong", "leading"}:
        return PerformanceTier.HIGH
    raise ValueError(f"Invalid historical rating: {rating}")


def is_tier_crossing(from_tier: PerformanceTier, to_tier: PerformanceTier) -> bool:
    """Check if moving between tiers represents a big mover.

    Big movers are identified by crossing from Low tier to High tier or vice versa.
    Movements within tiers or to/from Middle tier are not considered big moves.

    Args:
        from_tier: Starting performance tier
        to_tier: Ending performance tier

    Returns:
        True if movement crosses from Low to High or High to Low

    Examples:
        >>> is_tier_crossing(PerformanceTier.LOW, PerformanceTier.HIGH)
        True
        >>> is_tier_crossing(PerformanceTier.HIGH, PerformanceTier.LOW)
        True
        >>> is_tier_crossing(PerformanceTier.LOW, PerformanceTier.MIDDLE)
        False
        >>> is_tier_crossing(PerformanceTier.MIDDLE, PerformanceTier.HIGH)
        False
    """
    return (from_tier == PerformanceTier.LOW and to_tier == PerformanceTier.HIGH) or (
        from_tier == PerformanceTier.HIGH and to_tier == PerformanceTier.LOW
    )


def get_most_recent_prior_year_rating(employee: Employee) -> str | None:
    """Get the rating from the most recent *completed* review year.

    Ratings for the current calendar year (or later) are excluded: the current
    cycle's rating describes the same period as the employee's current grid
    position, so comparing the two would report movement where none happened.
    This matters because history is imported for any year present in the file,
    not just the two hardcoded years it used to be limited to.

    Args:
        employee: Employee whose ratings history to inspect

    Returns:
        Rating string from the latest completed year, or None if there is none
    """
    current_year = date.today().year
    completed = [entry for entry in employee.ratings_history if entry.year < current_year]
    if not completed:
        return None
    return max(completed, key=lambda entry: entry.year).rating


def is_big_mover(employee: Employee, original_employee: Employee | None = None) -> bool:
    """Determine if employee is a big mover.

    Checks for three types of big moves:
    1. Calibration-to-calibration: Prior calibration position tier → current position
       tier crosses Low↔High
    2. Year-over-year: Latest completed year's rating tier → current position tier
       crosses Low↔High
    3. In-session: Original position tier → current position tier crosses Low↔High

    Args:
        employee: Current employee data
        original_employee: Original employee data from file upload (for in-session detection)

    Returns:
        True if employee crossed from Low to High tier or vice versa

    Examples:
        >>> # Year-over-year: Low → High
        >>> emp = Employee(
        ...     employee_id=1,
        ...     grid_position=9,
        ...     ratings_history=[{"year": 2023, "rating": "Low"}],
        ...     ...
        ... )
        >>> is_big_mover(emp)
        True

        >>> # In-session: High → Low
        >>> current = Employee(employee_id=1, grid_position=2, ...)
        >>> original = Employee(employee_id=1, grid_position=9, ...)
        >>> is_big_mover(current, original)
        True

        >>> # Middle → High (not a big mover)
        >>> emp = Employee(
        ...     employee_id=1,
        ...     grid_position=9,
        ...     ratings_history=[{"year": 2023, "rating": "Solid"}],
        ...     ...
        ... )
        >>> is_big_mover(emp)
        False
    """
    current_tier = get_tier_from_position(employee.grid_position)

    # Check movement since the previous calibration (if a prior position is known)
    if employee.prior_grid_position:
        prior_calibration_tier = get_tier_from_position(employee.prior_grid_position)
        if is_tier_crossing(prior_calibration_tier, current_tier):
            return True

    # Check year-over-year movement (if a completed prior year rating exists)
    most_recent_rating = get_most_recent_prior_year_rating(employee)
    if most_recent_rating is not None:
        try:
            prior_tier = get_tier_from_historical_rating(most_recent_rating)
            if is_tier_crossing(prior_tier, current_tier):
                return True
        except ValueError:
            # Invalid historical rating, skip year-over-year check
            pass

    # Check in-session movement (if original position available)
    if original_employee is not None and original_employee.grid_position:
        original_tier = get_tier_from_position(original_employee.grid_position)
        if is_tier_crossing(original_tier, current_tier):
            return True

    return False


def get_axis_distance(from_position: int, to_position: int) -> int:
    """Total steps moved across the performance and potential axes.

    The grid is a 3x3 of Low/Medium/High on each axis, so a move is measured as
    the sum of the steps taken on each axis independently. This captures diagonal
    movement that a tier comparison alone treats as a single step.

    Args:
        from_position: Starting grid position (1-9)
        to_position: Ending grid position (1-9)

    Returns:
        Combined number of axis steps (0-4)

    Examples:
        >>> get_axis_distance(5, 5)  # Core Talent -> Core Talent
        0
        >>> get_axis_distance(5, 9)  # Core [M,M] -> Star [H,H]
        2
        >>> get_axis_distance(1, 9)  # Underperformer [L,L] -> Star [H,H]
        4
        >>> get_axis_distance(5, 6)  # Core [M,M] -> High Impact [H,M]
        1
    """
    for position in (from_position, to_position):
        if not 1 <= position <= 9:
            raise ValueError(f"Invalid grid position: {position}")

    from_performance, from_potential = (from_position - 1) % 3, (from_position - 1) // 3
    to_performance, to_potential = (to_position - 1) % 3, (to_position - 1) // 3
    return abs(to_performance - from_performance) + abs(to_potential - from_potential)


# Total axis steps at or above which a move is considered notable but not extreme
MEDIUM_MOVER_THRESHOLD = 2


def is_medium_mover(employee: Employee, original_employee: Employee | None = None) -> bool:
    """Determine if employee moved a notable but sub-Low/High distance.

    Complements is_big_mover: where that flags reversals across the Low/High
    tiers, this catches employees who shifted at least MEDIUM_MOVER_THRESHOLD
    steps across the two axes without crossing tiers - for example Core Talent
    [M,M] to Star [H,H], which moves on both axes but never leaves the middle
    and high tiers.

    The two are mutually exclusive: an employee who qualifies as a big mover is
    not also reported as a medium mover, so the flags partition cleanly for
    filtering.

    Note that the two flags measure different things rather than two levels of
    one thing, so "big" does not always mean "further". Expert [H,L] to High
    Impact [H,M] is one axis step but crosses Low to High tier, so it is big;
    Expert [H,L] to Emerging [L,H] is the maximum four steps but stays out of
    that crossing, so it is medium. This is intentional - a tier reversal is the
    signal worth surfacing loudest - but it makes the pair worth reading as
    "reversed" versus "shifted", not "more" versus "less".

    Args:
        employee: Current employee data
        original_employee: Original employee data from file upload (for in-session detection)

    Returns:
        True if the largest available move is at least the medium threshold and
        the employee is not already a big mover
    """
    if is_big_mover(employee, original_employee):
        return False

    comparison_positions = []
    if employee.prior_grid_position:
        comparison_positions.append(employee.prior_grid_position)
    if original_employee is not None and original_employee.grid_position:
        comparison_positions.append(original_employee.grid_position)

    return any(
        get_axis_distance(position, employee.grid_position) >= MEDIUM_MOVER_THRESHOLD
        for position in comparison_positions
    )


class EmployeeService:
    """Filter and query employees."""

    def filter_employees(
        self,
        employees: list[Employee],
        levels: list[str] | None = None,
        job_profiles: list[str] | None = None,
        job_functions: list[str] | None = None,
        locations: list[str] | None = None,
        managers: list[str] | None = None,
        exclude_ids: list[int] | None = None,
        performance: list[str] | None = None,
        potential: list[str] | None = None,
    ) -> list[Employee]:
        """Apply filters to employee list."""
        filtered = employees

        # Filter by level (e.g., ["MT2", "MT4"])
        if levels:
            filtered = [e for e in filtered if any(level in e.job_level for level in levels)]

        # Filter by job profile (legacy - kept for backward compatibility)
        if job_profiles:
            filtered = [e for e in filtered if e.job_profile in job_profiles]

        # Filter by job function
        if job_functions:
            filtered = [e for e in filtered if e.job_function in job_functions]

        # Filter by location (map to display names for comparison)
        if locations:
            filtered = [e for e in filtered if map_location_to_display(e.location) in locations]

        # Filter by manager
        if managers:
            filtered = [e for e in filtered if e.direct_manager in managers]

        # Exclude specific employees (e.g., managers in the room)
        if exclude_ids:
            filtered = [e for e in filtered if e.employee_id not in exclude_ids]

        # Filter by performance level
        if performance:
            perf_levels = [PerformanceLevel(p) for p in performance]
            filtered = [e for e in filtered if e.performance in perf_levels]

        # Filter by potential level
        if potential:
            pot_levels = [PotentialLevel(p) for p in potential]
            filtered = [e for e in filtered if e.potential in pot_levels]

        return filtered

    def get_filter_options(self, employees: list[Employee]) -> dict:
        """Extract unique filter options from employee list."""
        # Extract unique job levels
        levels = sorted({e.job_level for e in employees})

        # Extract unique job profiles (legacy - kept for backward compatibility)
        job_profiles = sorted({e.job_profile for e in employees if e.job_profile})

        # Extract unique job functions
        job_functions = sorted({e.job_function for e in employees if e.job_function})

        # Extract unique locations and map to display names
        locations = sorted({map_location_to_display(e.location) for e in employees if e.location})

        # Extract unique managers (exclude None and literal string "None")
        managers = sorted(
            {e.direct_manager for e in employees if e.direct_manager and e.direct_manager != "None"}
        )

        # List all employees for exclusion selector
        employee_list = [
            {"id": e.employee_id, "name": e.name, "level": e.job_level, "title": e.business_title}
            for e in sorted(employees, key=lambda x: x.name)
        ]

        return {
            "levels": levels,
            "job_profiles": job_profiles,
            "job_functions": job_functions,
            "locations": locations,
            "managers": managers,
            "employees": employee_list,
        }
