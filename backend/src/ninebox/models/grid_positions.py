"""Grid position calculation and label utilities.

This module provides shared logic for calculating grid positions and labels
from performance and potential levels, eliminating duplication across services.
"""

from ninebox.models.employee import PerformanceLevel, PotentialLevel

# Canonical mapping of (performance, potential) -> position label
POSITION_LABELS: dict[tuple[PerformanceLevel, PotentialLevel], str] = {
    (PerformanceLevel.HIGH, PotentialLevel.HIGH): "Star [H,H]",
    (PerformanceLevel.HIGH, PotentialLevel.MEDIUM): "High Impact [H,M]",
    (PerformanceLevel.HIGH, PotentialLevel.LOW): "Workhorse [H,L]",
    (PerformanceLevel.MEDIUM, PotentialLevel.HIGH): "Growth [M,H]",
    (PerformanceLevel.MEDIUM, PotentialLevel.MEDIUM): "Core Talent [M,M]",
    (PerformanceLevel.MEDIUM, PotentialLevel.LOW): "Effective Pro [M,L]",
    (PerformanceLevel.LOW, PotentialLevel.HIGH): "Enigma [L,H]",
    (PerformanceLevel.LOW, PotentialLevel.MEDIUM): "Inconsistent [L,M]",
    (PerformanceLevel.LOW, PotentialLevel.LOW): "Underperformer [L,L]",
}

# Mapping of grid position (1-9) -> position label for statistics
POSITION_LABELS_BY_NUMBER: dict[int, str] = {
    9: "Star [H,H]",
    8: "Growth [M,H]",
    7: "Enigma [L,H]",
    6: "High Impact [H,M]",
    5: "Core Talent [M,M]",
    4: "Inconsistent [L,M]",
    3: "Workhorse [H,L]",
    2: "Effective Pro [M,L]",
    1: "Underperformer [L,L]",
}

# Performance bucket mappings
# These define which grid positions fall into each performance category
PERFORMANCE_BUCKETS: dict[str, list[int]] = {
    "High": [9, 8, 6],
    "Medium": [7, 5, 3],
    "Low": [4, 2, 1],
}

# Reverse mapping: grid position -> performance category
GRID_POSITION_PERFORMANCE_MAP: dict[int, str] = {
    9: "High",
    8: "High",
    6: "High",
    7: "Medium",
    5: "Medium",
    3: "Medium",
    4: "Low",
    2: "Low",
    1: "Low",
}


def get_position_label(perf: PerformanceLevel, pot: PotentialLevel) -> str:
    """Get the human-readable label for a grid position.

    Args:
        perf: Performance level (LOW, MEDIUM, HIGH)
        pot: Potential level (LOW, MEDIUM, HIGH)

    Returns:
        Position label string (e.g., "Star [H,H]")
        Falls back to abbreviated format if combination not found

    Examples:
        >>> get_position_label(PerformanceLevel.HIGH, PotentialLevel.HIGH)
        'Star [H,H]'
        >>> get_position_label(PerformanceLevel.MEDIUM, PotentialLevel.LOW)
        'Effective Pro [M,L]'
    """
    return POSITION_LABELS.get((perf, pot), f"[{perf.value[0]},{pot.value[0]}]")


def get_position_label_by_number(position: int) -> str:
    """Get the human-readable label for a grid position number.

    Args:
        position: Grid position (1-9)

    Returns:
        Position label string (e.g., "Star [H,H]")
        Falls back to "Position {position}" if not found

    Examples:
        >>> get_position_label_by_number(9)
        'Star [H,H]'
        >>> get_position_label_by_number(5)
        'Core Talent [M,M]'
    """
    return POSITION_LABELS_BY_NUMBER.get(position, f"Position {position}")


def calculate_grid_position(perf: PerformanceLevel, pot: PotentialLevel) -> int:
    """Calculate grid position (1-9) from performance and potential.

    Grid layout (standard 9-box):
        Performance (columns): Low=1, Medium=2, High=3
        Potential (rows): Low=1-3, Medium=4-6, High=7-9

        Position = (potential_row * 3) + performance_column

    Args:
        perf: Performance level (LOW, MEDIUM, HIGH)
        pot: Potential level (LOW, MEDIUM, HIGH)

    Returns:
        Grid position (1-9)

    Examples:
        >>> calculate_grid_position(PerformanceLevel.HIGH, PotentialLevel.HIGH)
        9
        >>> calculate_grid_position(PerformanceLevel.HIGH, PotentialLevel.LOW)
        3
        >>> calculate_grid_position(PerformanceLevel.LOW, PotentialLevel.LOW)
        1
    """
    # Performance determines column (1-3)
    perf_map = {
        PerformanceLevel.LOW: 1,
        PerformanceLevel.MEDIUM: 2,
        PerformanceLevel.HIGH: 3,
    }
    # Potential determines row (0, 3, 6)
    pot_map = {
        PotentialLevel.LOW: 0,
        PotentialLevel.MEDIUM: 3,
        PotentialLevel.HIGH: 6,
    }
    return pot_map[pot] + perf_map[perf]


def get_performance_category(grid_position: int) -> str | None:
    """Get performance category (High/Medium/Low) for a grid position.

    Args:
        grid_position: Grid position (1-9)

    Returns:
        Performance category string ("High", "Medium", or "Low")
        Returns None if position is invalid

    Examples:
        >>> get_performance_category(9)
        'High'
        >>> get_performance_category(5)
        'Medium'
        >>> get_performance_category(1)
        'Low'
        >>> get_performance_category(10)
        None
    """
    return GRID_POSITION_PERFORMANCE_MAP.get(grid_position)
