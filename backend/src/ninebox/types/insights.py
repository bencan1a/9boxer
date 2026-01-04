"""Shared type definitions for insights.

This module contains TypedDict definitions for insights and related data structures.
These types are shared across multiple services to avoid circular import dependencies.

Moving these types to a shared module follows the best practice of:
- Importing types at module level (not inside functions)
- Breaking circular dependencies between service modules
- Making type checking more effective with mypy/pyright
"""

from typing import TypedDict


class InsightSourceData(TypedDict, total=False):
    """Source data for an insight, used for LLM context.

    This TypedDict uses total=False to make all fields optional, allowing
    different insight types to include only the relevant source data fields.

    Attributes:
        z_score: Statistical z-score indicating deviation strength
        p_value: Statistical p-value for significance testing
        observed_pct: Observed percentage in the data
        expected_pct: Expected percentage under null hypothesis
        center_count: Count of employees in center box (position 5)
        center_pct: Percentage of employees in center box
        recommended_max_pct: Recommended maximum percentage threshold
        total_minutes: Total minutes for time allocation
        by_level: Minutes breakdown by job level
        category: Category name for the insight
        categories_affected: List of affected category names
    """

    z_score: float
    p_value: float
    observed_pct: float
    expected_pct: float
    center_count: int
    center_pct: float
    recommended_max_pct: float
    total_minutes: int
    by_level: dict[str, int]
    category: str
    categories_affected: list[str]


class InsightRequired(TypedDict):
    """Required fields for an Insight.

    This base TypedDict defines all required fields. The Insight TypedDict
    inherits from this and adds optional fields using total=False.

    Attributes:
        id: Unique identifier for the insight
        type: Type of insight (anomaly, focus_area, recommendation, time_allocation)
        category: Category of insight (location, function, level, tenure, distribution, time)
        priority: Priority level (high, medium, low)
        title: Short, descriptive title
        description: Detailed description of the insight
        affected_count: Number of employees affected
        source_data: Raw data that generated this insight
    """

    id: str
    type: str  # anomaly, focus_area, recommendation, time_allocation
    category: str  # location, function, level, tenure, distribution, time
    priority: str  # high, medium, low
    title: str
    description: str
    affected_count: int
    source_data: InsightSourceData


class Insight(InsightRequired, total=False):
    """A discrete, selectable insight for meeting preparation.

    This TypedDict uses inheritance to make clustering fields optional.
    All fields from InsightRequired are required, while fields defined
    here (cluster_id, cluster_title) are optional.

    The optional fields support clustering of related insights, which is
    used by the LLM agent to group related issues together for better
    presentation and analysis.

    Attributes:
        id: Unique identifier for the insight
        type: Type of insight (anomaly, focus_area, recommendation, time_allocation)
        category: Category of insight (location, function, level, tenure, distribution, time)
        priority: Priority level (high, medium, low)
        title: Short, descriptive title
        description: Detailed description of the insight
        affected_count: Number of employees affected
        source_data: Raw data that generated this insight
        cluster_id: Optional ID of the cluster this insight belongs to
        cluster_title: Optional title of the cluster this insight belongs to
    """

    cluster_id: str | None
    cluster_title: str | None
