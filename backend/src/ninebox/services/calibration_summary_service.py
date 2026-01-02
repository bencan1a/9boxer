"""Calibration summary service for meeting preparation.

This module provides analysis functions to help calibration managers prepare for
calibration meetings. It generates a data overview, time allocation recommendations,
and actionable insights derived from employee rating distributions.
"""

import hashlib
import logging
from collections import Counter
from typing import Any, TypedDict

from ninebox.models.employee import Employee
from ninebox.services.intelligence_service import (
    calculate_function_analysis,
    calculate_level_analysis,
    calculate_location_analysis,
    calculate_tenure_analysis,
)

logger = logging.getLogger(__name__)


# =============================================================================
# Type Definitions
# =============================================================================


class DataOverview(TypedDict):
    """Data overview statistics for the employee dataset."""

    total_employees: int
    by_level: dict[str, int]
    by_function: dict[str, int]
    by_location: dict[str, int]
    stars_count: int  # Box 9 (High/High)
    stars_percentage: float
    center_box_count: int  # Box 5 (Medium/Medium)
    center_box_percentage: float
    lower_performers_count: int  # Boxes 1, 2, 4
    lower_performers_percentage: float
    high_performers_count: int  # Boxes 3, 6, 9 (High Performance)
    high_performers_percentage: float


class LevelTimeBreakdown(TypedDict):
    """Time allocation breakdown for a single job level."""

    level: str
    employee_count: int
    minutes: int
    percentage: float


class TimeAllocation(TypedDict):
    """Time allocation recommendations for calibration meeting."""

    estimated_duration_minutes: int
    breakdown_by_level: list[LevelTimeBreakdown]
    suggested_sequence: list[str]


class InsightSourceData(TypedDict, total=False):
    """Source data for an insight, used for LLM context."""

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


class Insight(TypedDict):
    """A discrete, selectable insight for meeting preparation."""

    id: str
    type: str  # anomaly, focus_area, recommendation, time_allocation
    category: str  # location, function, level, tenure, distribution, time
    priority: str  # high, medium, low
    title: str
    description: str
    affected_count: int
    source_data: InsightSourceData


class CalibrationSummaryResponse(TypedDict):
    """Complete calibration summary response."""

    data_overview: DataOverview
    time_allocation: TimeAllocation
    insights: list[Insight]


# =============================================================================
# Constants
# =============================================================================

# Time allocation constants (minutes)
BASE_MINUTES_PER_EMPLOYEE = 2.0
MIN_MEETING_MINUTES = 30
MAX_MEETING_MINUTES = 240  # 4 hours

# Time multipliers based on grid position
TIME_MULTIPLIERS: dict[int, float] = {
    1: 1.5,  # Lower performer - more discussion needed
    2: 1.2,  # Solid performer
    3: 1.0,  # Strong performer
    4: 1.5,  # Under performer - more discussion needed
    5: 0.8,  # Core performer - quick review
    6: 1.0,  # High performer
    7: 1.3,  # Enigma - needs discussion
    8: 1.2,  # High potential
    9: 1.3,  # Star - succession planning discussion
}

# Grid position groupings
STARS_POSITION = 9
CENTER_BOX_POSITION = 5
LOWER_PERFORMER_POSITIONS = {1, 2, 4}
HIGH_PERFORMER_POSITIONS = {3, 6, 9}

# Recommended level sequence for calibration
LEVEL_SEQUENCE = ["IC", "Manager", "Director", "VP", "Executive"]

# Thresholds for generating insights
CENTER_BOX_WARNING_THRESHOLD = 50.0  # Warn if > 50% in center box
STARS_LOW_THRESHOLD = 5.0  # Warn if < 5% are stars
STARS_HIGH_THRESHOLD = 25.0  # Warn if > 25% are stars


# =============================================================================
# Service Class
# =============================================================================


class CalibrationSummaryService:
    """Service for generating calibration meeting preparation data."""

    @staticmethod
    def _generate_insight_id(prefix: str, *components: Any) -> str:
        """Generate a deterministic insight ID from components.

        Args:
            prefix: ID prefix (e.g., "focus", "anomaly", "rec")
            *components: Variable components to hash for uniqueness

        Returns:
            Deterministic insight ID
        """
        # Create a stable hash from all components
        content = "-".join(str(c) for c in components)
        hash_suffix = hashlib.sha256(content.encode()).hexdigest()[:8]
        return f"{prefix}-{hash_suffix}"

    def calculate_summary(self, employees: list[Employee]) -> CalibrationSummaryResponse:
        """Calculate complete calibration summary.

        Args:
            employees: List of employee records

        Returns:
            CalibrationSummaryResponse with data overview, time allocation, and insights
        """
        if not employees:
            return CalibrationSummaryResponse(
                data_overview=self._empty_data_overview(),
                time_allocation=self._empty_time_allocation(),
                insights=[],
            )

        # Calculate all components
        data_overview = self.calculate_data_overview(employees)
        time_allocation = self.calculate_time_allocation(employees)

        # Run intelligence analyses to generate insights
        location_analysis = calculate_location_analysis(employees)
        function_analysis = calculate_function_analysis(employees)
        level_analysis = calculate_level_analysis(employees)
        tenure_analysis = calculate_tenure_analysis(employees)

        # Generate insights from all sources
        insights = self.generate_insights(
            employees=employees,
            data_overview=data_overview,
            time_allocation=time_allocation,
            location_analysis=location_analysis,
            function_analysis=function_analysis,
            level_analysis=level_analysis,
            tenure_analysis=tenure_analysis,
        )

        return CalibrationSummaryResponse(
            data_overview=data_overview,
            time_allocation=time_allocation,
            insights=insights,
        )

    def calculate_data_overview(self, employees: list[Employee]) -> DataOverview:
        """Calculate data overview statistics.

        Args:
            employees: List of employee records

        Returns:
            DataOverview with distribution statistics
        """
        total = len(employees)
        if total == 0:
            return self._empty_data_overview()

        # Count by various dimensions
        by_level = Counter(e.job_level for e in employees)
        by_function = Counter(e.job_function for e in employees)
        by_location = Counter(e.location for e in employees)

        # Grid position counts
        stars_count = sum(1 for e in employees if e.grid_position == STARS_POSITION)
        center_count = sum(1 for e in employees if e.grid_position == CENTER_BOX_POSITION)
        lower_count = sum(1 for e in employees if e.grid_position in LOWER_PERFORMER_POSITIONS)
        high_perf_count = sum(1 for e in employees if e.grid_position in HIGH_PERFORMER_POSITIONS)

        return DataOverview(
            total_employees=total,
            by_level=dict(by_level),
            by_function=dict(by_function),
            by_location=dict(by_location),
            stars_count=stars_count,
            stars_percentage=round(100.0 * stars_count / total, 1),
            center_box_count=center_count,
            center_box_percentage=round(100.0 * center_count / total, 1),
            lower_performers_count=lower_count,
            lower_performers_percentage=round(100.0 * lower_count / total, 1),
            high_performers_count=high_perf_count,
            high_performers_percentage=round(100.0 * high_perf_count / total, 1),
        )

    def calculate_time_allocation(self, employees: list[Employee]) -> TimeAllocation:
        """Calculate recommended time allocation for calibration meeting.

        The algorithm:
        1. Base time: 2 minutes per employee
        2. Apply multipliers based on grid position (lower performers need more time)
        3. Group by job level
        4. Suggest review sequence based on best practices

        Args:
            employees: List of employee records

        Returns:
            TimeAllocation with estimated duration and breakdown
        """
        if not employees:
            return self._empty_time_allocation()

        # Group employees by level
        by_level: dict[str, list[Employee]] = {}
        for emp in employees:
            level = self._normalize_level(emp.job_level)
            if level not in by_level:
                by_level[level] = []
            by_level[level].append(emp)

        # Calculate weighted time for each level
        breakdown: list[LevelTimeBreakdown] = []
        total_minutes = 0.0

        for level in LEVEL_SEQUENCE:
            if level not in by_level:
                continue

            level_employees = by_level[level]
            level_minutes = 0.0

            for emp in level_employees:
                multiplier = TIME_MULTIPLIERS.get(emp.grid_position, 1.0)
                level_minutes += BASE_MINUTES_PER_EMPLOYEE * multiplier

            level_minutes_rounded = round(level_minutes)
            total_minutes += level_minutes_rounded

            breakdown.append(
                LevelTimeBreakdown(
                    level=level,
                    employee_count=len(level_employees),
                    minutes=level_minutes_rounded,
                    percentage=0.0,  # Will be calculated after total is known
                )
            )

        # Add any remaining levels not in the standard sequence
        for level, level_employees in by_level.items():
            if level in LEVEL_SEQUENCE:
                continue

            level_minutes = 0.0
            for emp in level_employees:
                multiplier = TIME_MULTIPLIERS.get(emp.grid_position, 1.0)
                level_minutes += BASE_MINUTES_PER_EMPLOYEE * multiplier

            level_minutes_rounded = round(level_minutes)
            total_minutes += level_minutes_rounded

            breakdown.append(
                LevelTimeBreakdown(
                    level=level,
                    employee_count=len(level_employees),
                    minutes=level_minutes_rounded,
                    percentage=0.0,
                )
            )

        # Add time for intelligence sweep at end
        intelligence_sweep_minutes = max(10, int(len(employees) * 0.05))
        total_minutes += intelligence_sweep_minutes

        # Apply bounds
        total_minutes = max(MIN_MEETING_MINUTES, min(MAX_MEETING_MINUTES, total_minutes))

        # Calculate percentages (check outside loop for efficiency)
        if total_minutes > 0:
            for item in breakdown:
                item["percentage"] = round(100.0 * item["minutes"] / total_minutes, 1)

        # Build suggested sequence
        suggested_sequence = [item["level"] for item in breakdown]
        suggested_sequence.append("Intelligence Sweep")

        return TimeAllocation(
            estimated_duration_minutes=int(total_minutes),
            breakdown_by_level=breakdown,
            suggested_sequence=suggested_sequence,
        )

    def generate_insights(
        self,
        employees: list[Employee],  # noqa: ARG002
        data_overview: DataOverview,
        time_allocation: TimeAllocation,
        location_analysis: dict[str, Any],
        function_analysis: dict[str, Any],
        level_analysis: dict[str, Any],
        tenure_analysis: dict[str, Any],
    ) -> list[Insight]:
        """Generate actionable insights from analysis data.

        Args:
            employees: List of employee records
            data_overview: Calculated data overview
            time_allocation: Calculated time allocation
            location_analysis: Intelligence location analysis
            function_analysis: Intelligence function analysis
            level_analysis: Intelligence level analysis
            tenure_analysis: Intelligence tenure analysis

        Returns:
            List of discrete, prioritized insights
        """
        insights: list[Insight] = []

        # 1. Distribution-based insights
        insights.extend(self._generate_distribution_insights(data_overview))

        # 2. Anomaly-based insights from intelligence analyses
        insights.extend(self._generate_anomaly_insights("location", location_analysis))
        insights.extend(self._generate_anomaly_insights("function", function_analysis))
        insights.extend(self._generate_anomaly_insights("level", level_analysis))
        insights.extend(self._generate_anomaly_insights("tenure", tenure_analysis))

        # 3. Time allocation insight
        insights.append(self._generate_time_insight(time_allocation))

        # Sort by priority (high first, then medium, then low)
        priority_order = {"high": 0, "medium": 1, "low": 2}
        insights.sort(key=lambda i: priority_order.get(i["priority"], 99))

        return insights

    def _generate_distribution_insights(self, data_overview: DataOverview) -> list[Insight]:
        """Generate insights based on distribution patterns.

        Args:
            data_overview: Calculated data overview

        Returns:
            List of distribution-related insights
        """
        insights: list[Insight] = []

        # Check for crowded center box
        if data_overview["center_box_percentage"] > CENTER_BOX_WARNING_THRESHOLD:
            insights.append(
                Insight(
                    id=self._generate_insight_id(
                        "focus-crowded-center", data_overview["center_box_count"]
                    ),
                    type="focus_area",
                    category="distribution",
                    priority="medium",
                    title=f"{data_overview['center_box_percentage']:.0f}% of employees in center box",
                    description=(
                        "Consider running a Donut Mode exercise to differentiate Core Performers. "
                        "A crowded center box may indicate managers are avoiding differentiation."
                    ),
                    affected_count=data_overview["center_box_count"],
                    source_data=InsightSourceData(
                        center_count=data_overview["center_box_count"],
                        center_pct=data_overview["center_box_percentage"],
                        recommended_max_pct=CENTER_BOX_WARNING_THRESHOLD,
                    ),
                )
            )

        # Check for too few stars (succession risk)
        if data_overview["stars_percentage"] < STARS_LOW_THRESHOLD:
            insights.append(
                Insight(
                    id=self._generate_insight_id("focus-low-stars", data_overview["stars_count"]),
                    type="focus_area",
                    category="distribution",
                    priority="high",
                    title=f"Only {data_overview['stars_percentage']:.0f}% Stars (Position 9)",
                    description=(
                        "Low percentage of top talent may indicate succession planning risk "
                        "or overly strict rating standards. Review whether high performers "
                        "are being appropriately recognized."
                    ),
                    affected_count=data_overview["stars_count"],
                    source_data=InsightSourceData(
                        observed_pct=data_overview["stars_percentage"],
                        expected_pct=10.0,  # Target ~10-15%
                    ),
                )
            )

        # Check for potential grade inflation (too many stars)
        if data_overview["stars_percentage"] > STARS_HIGH_THRESHOLD:
            insights.append(
                Insight(
                    id=self._generate_insight_id("focus-high-stars", data_overview["stars_count"]),
                    type="focus_area",
                    category="distribution",
                    priority="high",
                    title=f"{data_overview['stars_percentage']:.0f}% rated as Stars",
                    description=(
                        "High percentage of top talent may indicate grade inflation. "
                        "Review whether the bar for 'Star' is consistent across managers."
                    ),
                    affected_count=data_overview["stars_count"],
                    source_data=InsightSourceData(
                        observed_pct=data_overview["stars_percentage"],
                        expected_pct=15.0,  # Target ~10-15%
                    ),
                )
            )

        return insights

    def _generate_anomaly_insights(self, category: str, analysis: dict[str, Any]) -> list[Insight]:
        """Generate insights from intelligence analysis anomalies.

        Args:
            category: Analysis category (location, function, level, tenure)
            analysis: Intelligence analysis result

        Returns:
            List of anomaly-related insights
        """
        insights: list[Insight] = []

        # Only generate insights for yellow or red status
        status = analysis.get("status", "green")
        if status == "green":
            return insights

        # Get significant deviations
        deviations = analysis.get("deviations", [])
        significant_devs = [d for d in deviations if d.get("is_significant", False)]

        if not significant_devs:
            # If flagged but no individual significant deviations,
            # create a general insight
            insights.append(
                Insight(
                    id=self._generate_insight_id("anomaly-general", category, status),
                    type="anomaly",
                    category=category,
                    priority="medium" if status == "yellow" else "high",
                    title=f"Rating pattern differences detected across {category}s",
                    description=analysis.get(
                        "interpretation",
                        f"Statistical analysis shows significant differences in ratings across {category}s.",
                    ),
                    affected_count=analysis.get("sample_size", 0),
                    source_data=InsightSourceData(
                        p_value=analysis.get("p_value", 0),
                        category=category,
                    ),
                )
            )
            return insights

        # Create insight for each significant deviation
        for dev in significant_devs:
            category_name = dev.get("category", "Unknown")
            z_score = dev.get("z_score", 0)
            observed = dev.get("observed_high_pct", 0)
            expected = dev.get("expected_high_pct", 0)
            sample_size = dev.get("sample_size", 0)

            # Determine direction and priority
            direction = "higher" if z_score > 0 else "lower"
            priority = "high" if abs(z_score) > 3.0 else "medium"

            insights.append(
                Insight(
                    id=self._generate_insight_id("anomaly", category, category_name),
                    type="anomaly",
                    category=category,
                    priority=priority,
                    title=f"{category_name} rates {direction} than average",
                    description=(
                        f"{category_name} has {observed:.0f}% high performers "
                        f"vs {expected:.0f}% expected (z={z_score:.1f})"
                    ),
                    affected_count=sample_size,
                    source_data=InsightSourceData(
                        z_score=z_score,
                        p_value=analysis.get("p_value", 0),
                        observed_pct=observed,
                        expected_pct=expected,
                    ),
                )
            )

        return insights

    def _generate_time_insight(self, time_allocation: TimeAllocation) -> Insight:
        """Generate time allocation insight.

        Args:
            time_allocation: Calculated time allocation

        Returns:
            Time allocation insight
        """
        duration = time_allocation["estimated_duration_minutes"]
        hours = duration // 60
        minutes = duration % 60

        if hours > 0:
            time_str = f"{hours}h {minutes}m" if minutes > 0 else f"{hours} hours"
        else:
            time_str = f"{minutes} minutes"

        # Build breakdown description
        breakdown_parts = []
        for item in time_allocation["breakdown_by_level"]:
            level_minutes = item["minutes"]
            if level_minutes >= 60:
                level_time = f"{level_minutes // 60}h{level_minutes % 60}m"
            else:
                level_time = f"{level_minutes}m"
            breakdown_parts.append(f"{level_time} {item['level']}")

        breakdown_str = ", ".join(breakdown_parts)

        total_employees = sum(
            item["employee_count"] for item in time_allocation["breakdown_by_level"]
        )

        return Insight(
            id=self._generate_insight_id("rec-time-allocation", duration, total_employees),
            type="time_allocation",
            category="time",
            priority="low",
            title=f"Estimated {time_str} for full calibration",
            description=f"Suggested breakdown: {breakdown_str}",
            affected_count=total_employees,
            source_data=InsightSourceData(
                total_minutes=duration,
                by_level={
                    item["level"]: item["minutes"] for item in time_allocation["breakdown_by_level"]
                },
            ),
        )

    def _normalize_level(self, job_level: str) -> str:
        """Normalize job level to standard categories.

        Args:
            job_level: Raw job level string (e.g., "MT1", "MT2", etc.)

        Returns:
            Normalized level category (IC, Manager, Director, VP, Executive)
        """
        level_upper = job_level.upper()

        # Map MT levels to categories based on common patterns
        if level_upper in ("MT1", "MT2", "MT3"):
            return "IC"
        elif level_upper in ("MT4", "MT5"):
            return "Manager"
        elif level_upper in ("MT6", "MT7"):
            return "Director"
        elif level_upper in ("MT8", "MT9"):
            return "VP"
        elif level_upper in ("MT10", "EXECUTIVE"):
            return "Executive"

        # Check for common keywords
        if "DIRECTOR" in level_upper or "DIR" in level_upper:
            return "Director"
        elif "VP" in level_upper or "VICE" in level_upper:
            return "VP"
        elif "MANAGER" in level_upper or "MGR" in level_upper:
            return "Manager"
        elif "EXEC" in level_upper or "C-LEVEL" in level_upper or "CHIEF" in level_upper:
            return "Executive"

        # Default to IC for unrecognized levels
        return "IC"

    def _empty_data_overview(self) -> DataOverview:
        """Return empty data overview for edge cases."""
        return DataOverview(
            total_employees=0,
            by_level={},
            by_function={},
            by_location={},
            stars_count=0,
            stars_percentage=0.0,
            center_box_count=0,
            center_box_percentage=0.0,
            lower_performers_count=0,
            lower_performers_percentage=0.0,
            high_performers_count=0,
            high_performers_percentage=0.0,
        )

    def _empty_time_allocation(self) -> TimeAllocation:
        """Return empty time allocation for edge cases."""
        return TimeAllocation(
            estimated_duration_minutes=0,
            breakdown_by_level=[],
            suggested_sequence=[],
        )
