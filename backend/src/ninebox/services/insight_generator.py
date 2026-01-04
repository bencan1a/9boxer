"""Centralized insight generation from statistical analysis results.

This module consolidates insight generation logic that was previously duplicated
between intelligence_service.py and calibration_summary_service.py.

It provides a single authoritative implementation for converting analysis results
(from location, function, level, tenure, manager analyses) into actionable Insight objects.
"""

import hashlib
import logging
from typing import Any

from ninebox.types.insights import Insight, InsightSourceData

logger = logging.getLogger(__name__)


# =============================================================================
# InsightGenerator Class
# =============================================================================


class InsightGenerator:
    """Centralized insight generation from analysis results.

    This class provides methods to convert statistical analysis results
    (from intelligence service functions) into structured Insight objects.

    It consolidates logic that was previously duplicated between:
    - intelligence_service.py (interpretation generators)
    - calibration_summary_service.py (_generate_anomaly_insights)
    """

    def generate_from_analyses(self, analyses: dict[str, dict[str, Any]]) -> list[Any]:
        """Generate insights from analysis results.

        Args:
            analyses: Dictionary of analysis results keyed by dimension name
                     (location, function, level, tenure, manager, etc.)

        Returns:
            List of Insight objects sorted by priority (high -> medium -> low)
        """
        insights: list[Any] = []

        for analysis_name, analysis_result in analyses.items():
            dimension_insights = self._generate_insights_for_dimension(
                analysis_name, analysis_result
            )
            insights.extend(dimension_insights)

        # Sort by priority (high first, then medium, then low)
        priority_order = {"high": 0, "medium": 1, "low": 2}
        insights.sort(key=lambda i: priority_order.get(i.get("priority", "low"), 99))

        return insights

    def _generate_insights_for_dimension(
        self, dimension: str, analysis: dict[str, Any]
    ) -> list[Any]:
        """Generate insights for a single dimension (location, function, etc.).

        This method examines the analysis results and creates Insight objects
        for any significant anomalies or patterns detected.

        Args:
            dimension: Analysis dimension name (location, function, level, tenure, manager)
            analysis: Dictionary containing analysis results with fields:
                     - status: Traffic light status (green, yellow, red)
                     - deviations: List of significant deviations
                     - p_value: Statistical significance
                     - interpretation: Human-readable summary
                     - sample_size: Total sample size

        Returns:
            List of Insight objects for this dimension
        """
        insights: list[Any] = []

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
            insights.append(self._create_general_insight(dimension, analysis))
            return insights

        # Create insight for each significant deviation
        for dev in significant_devs:
            insight = self._create_deviation_insight(dimension, dev, analysis)
            insights.append(insight)

        return insights

    def _create_general_insight(self, dimension: str, analysis: dict[str, Any]) -> Insight:
        """Create a general insight when no specific deviations are identified.

        Args:
            dimension: Analysis dimension (location, function, level, tenure)
            analysis: Full analysis results

        Returns:
            General anomaly insight
        """
        status = analysis.get("status", "yellow")

        return Insight(
            id=self._generate_insight_id("anomaly-general", dimension, status),
            type="anomaly",
            category=dimension,
            priority="medium" if status == "yellow" else "high",
            title=f"Rating pattern differences detected across {dimension}s",
            description=analysis.get(
                "interpretation",
                f"Statistical analysis shows significant differences in ratings across {dimension}s.",
            ),
            affected_count=analysis.get("sample_size", 0),
            source_data=InsightSourceData(
                p_value=analysis.get("p_value", 0),
                category=dimension,
            ),
        )

    def _create_deviation_insight(
        self, dimension: str, deviation: dict[str, Any], analysis: dict[str, Any]
    ) -> Insight:
        """Create an insight for a specific significant deviation.

        Args:
            dimension: Analysis dimension (location, function, level, tenure, manager)
            deviation: Deviation details (category, z_score, observed_pct, etc.)
            analysis: Full analysis results

        Returns:
            Specific deviation insight
        """
        category_name = deviation.get("category", "Unknown")
        z_score = deviation.get("z_score", 0)
        observed = deviation.get("observed_high_pct", 0)
        expected = deviation.get("expected_high_pct", 0)
        sample_size = deviation.get("sample_size", 0)

        # Determine direction and priority
        direction = "higher" if z_score > 0 else "lower"
        priority = "high" if abs(z_score) > 3.0 else "medium"

        # For manager analysis, include additional distribution info
        if dimension == "manager":
            medium_pct = deviation.get("medium_pct", 0)
            low_pct = deviation.get("low_pct", 0)
            description = (
                f"{category_name} has {observed:.0f}% high, {medium_pct:.0f}% medium, "
                f"{low_pct:.0f}% low performers (expected: {expected:.0f}% high). "
                f"Statistical deviation: z={z_score:.1f}"
            )
        else:
            description = (
                f"{category_name} has {observed:.0f}% high performers "
                f"vs {expected:.0f}% expected (z={z_score:.1f})"
            )

        return Insight(
            id=self._generate_insight_id("anomaly", dimension, category_name),
            type="anomaly",
            category=dimension,
            priority=priority,
            title=f"{category_name} rates {direction} than average",
            description=description,
            affected_count=sample_size,
            source_data=InsightSourceData(
                z_score=z_score,
                p_value=analysis.get("p_value", 0),
                observed_pct=observed,
                expected_pct=expected,
            ),
        )

    def _generate_insight_id(self, *components: Any) -> str:
        """Generate deterministic insight ID from components.

        Creates a unique identifier by hashing the input components.
        This ensures the same insight always has the same ID.

        Args:
            *components: Variable number of components to hash

        Returns:
            Hexadecimal hash string (first 16 characters)
        """
        # Convert all components to strings and join
        id_string = "-".join(str(c) for c in components)

        # Generate MD5 hash (deterministic)
        # Not used for security - just for generating unique IDs
        hash_obj = hashlib.md5(id_string.encode(), usedforsecurity=False)

        # Return first 16 characters of hex digest
        return hash_obj.hexdigest()[:16]


# =============================================================================
# Global instance for convenience
# =============================================================================

insight_generator = InsightGenerator()
