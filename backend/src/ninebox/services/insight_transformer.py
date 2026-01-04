"""Transform LLM agent outputs to application Insight objects.

This module provides a single responsibility class for transforming raw LLM agent
issue outputs (JSON) into structured Insight objects used by the application.

This separation follows the Single Responsibility Principle (SRP) and makes the
transformation logic independently testable and reusable across different LLM
integrations.
"""

import hashlib
import logging
from typing import Any

logger = logging.getLogger(__name__)


# =============================================================================
# InsightTransformer Class
# =============================================================================


class InsightTransformer:
    """Transforms LLM agent outputs to application Insight objects.

    This class handles the transformation of raw JSON data from LLM agents
    into structured Insight TypedDict objects that conform to the application's
    data model.

    Responsibilities:
    - Transform agent issue dictionaries to Insight objects
    - Generate deterministic IDs for insights
    - Map agent field names to application field names
    - Handle missing/optional fields with appropriate defaults
    - Validate and sanitize agent outputs

    Example:
        transformer = InsightTransformer()

        agent_issues = [
            {
                "type": "anomaly",
                "category": "location",
                "priority": "high",
                "title": "Seattle office rates higher",
                "description": "Seattle has 75% high performers vs 60% expected",
                "affected_count": 25,
                "source_data": {"z_score": 2.5},
                "cluster_id": "cluster-1",
                "cluster_title": "Geographic Patterns"
            }
        ]

        insights = transformer.transform_agent_issues(agent_issues)
    """

    @staticmethod
    def transform_agent_issues(agent_issues: list[dict[str, Any]]) -> list[Any]:
        """Transform agent issues into Insight objects with deterministic IDs.

        Takes a list of issue dictionaries from an LLM agent and converts them
        into Insight objects. Each insight gets a deterministic ID generated
        from its content.

        Args:
            agent_issues: List of issue dictionaries from LLM agent with fields:
                - type: str (anomaly, recommendation, time_allocation)
                - category: str (location, function, level, tenure, etc.)
                - priority: str (high, medium, low)
                - title: str
                - description: str
                - affected_count: int
                - source_data: dict (optional)
                - cluster_id: str | None (optional)
                - cluster_title: str | None (optional)

        Returns:
            List of Insight objects with deterministic IDs and all required fields

        Example:
            >>> transformer = InsightTransformer()
            >>> issues = [{"type": "anomaly", "category": "location", ...}]
            >>> insights = transformer.transform_agent_issues(issues)
            >>> len(insights)
            1
            >>> insights[0]["id"]
            'agent-a1b2c3d4'
        """
        # Import here to avoid circular dependency
        from ninebox.services.calibration_summary_service import Insight

        insights: list[Any] = []

        for issue in agent_issues:
            # Generate deterministic ID from issue content
            insight_id = InsightTransformer._generate_insight_id(
                "agent",
                issue.get("category", "unknown"),
                issue.get("title", ""),
                str(issue.get("affected_count", 0)),
            )

            # Create Insight object with all fields
            insights.append(
                Insight(
                    id=insight_id,
                    type=issue.get("type", "focus_area"),
                    category=issue.get("category", "organizational"),
                    priority=issue.get("priority", "medium"),
                    title=issue.get("title", ""),
                    description=issue.get("description", ""),
                    affected_count=issue.get("affected_count", 0),
                    source_data=issue.get("source_data", {}),
                    cluster_id=issue.get("cluster_id"),
                    cluster_title=issue.get("cluster_title"),
                )
            )

        return insights

    @staticmethod
    def _generate_insight_id(prefix: str, *components: Any) -> str:
        """Generate a deterministic insight ID from components.

        Creates a unique identifier by hashing the input components. This ensures
        that the same issue content always produces the same ID, which is important
        for:
        - Deduplication
        - Consistent references across API calls
        - Stable UI elements (React keys, etc.)

        The hash uses 16 hex characters (64 bits) from SHA256 to provide strong
        collision resistance:
        - 16 hex chars = 2^64 possible values
        - Birthday paradox collision probability: ~50% at ~4.3 billion insights
        - Compared to previous 8 chars (32 bits): ~65,000 insights

        Args:
            prefix: ID prefix to categorize the insight source (e.g., "agent", "legacy")
            *components: Variable components to include in the hash (category, title, count, etc.)

        Returns:
            Deterministic insight ID in format "{prefix}-{hash}"

        Example:
            >>> InsightTransformer._generate_insight_id("agent", "location", "Seattle rates high", "25")
            'agent-a1b2c3d4e5f6g7h8'
        """
        # Create a stable hash from all components
        content = "-".join(str(c) for c in components)
        hash_suffix = hashlib.sha256(content.encode()).hexdigest()[:16]
        return f"{prefix}-{hash_suffix}"
