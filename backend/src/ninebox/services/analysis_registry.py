"""Analysis registry for intelligence service.

This module provides a centralized registry for all statistical analyses.
It enables dual use: Intelligence tab visualizations AND LLM agent data generation.

The registry makes it easy to add new analyses with one-line registration,
ensuring consistency between UI display and AI calibration summaries.
"""

import logging
from collections.abc import Callable
from typing import Any

from ninebox.models.employee import Employee
from ninebox.services.intelligence_service import (
    calculate_function_analysis,
    calculate_level_analysis,
    calculate_location_analysis,
    calculate_per_level_distribution,
    calculate_tenure_analysis,
)

logger = logging.getLogger(__name__)


# Type alias for analysis functions
AnalysisFunction = Callable[[list[Employee]], dict[str, Any]]

# Central registry of all analyses - list of (name, function) tuples
ANALYSIS_REGISTRY: list[tuple[str, AnalysisFunction]] = [
    ("location", calculate_location_analysis),
    ("function", calculate_function_analysis),
    ("level", calculate_level_analysis),
    ("tenure", calculate_tenure_analysis),
    ("per_level_distribution", calculate_per_level_distribution),
]


def run_all_analyses(employees: list[Employee]) -> dict[str, dict[str, Any]]:
    """Run all registered analyses and return results.

    This function executes all analyses registered in ANALYSIS_REGISTRY,
    making the results available for both:
    - Intelligence tab visualizations (UI display)
    - AI calibration summary generation (LLM data source)

    If an analysis fails, it returns an error status instead of crashing
    the entire pipeline. This allows partial results to be returned.

    Args:
        employees: List of employee records to analyze

    Returns:
        Dictionary mapping analysis names to their results
        Example:
        {
            "location": {"status": "green", "p_value": 0.23, ...},
            "function": {"status": "red", "p_value": 0.001, ...},
            "level": {"status": "green", "p_value": 0.45, ...},
            "tenure": {"status": "yellow", "p_value": 0.03, ...}
        }

        If an analysis fails, it returns an error status:
        {
            "broken_analysis": {
                "status": "error",
                "error": "Analysis failed: ValueError",
                "sample_size": 0
            }
        }
    """
    results = {}
    for name, analysis_fn in ANALYSIS_REGISTRY:
        try:
            results[name] = analysis_fn(employees)
        except Exception as e:
            logger.error(f"Analysis '{name}' failed: {e!s}", exc_info=True)
            results[name] = {
                "status": "error",
                "error": f"Analysis failed: {type(e).__name__}",
                "sample_size": 0,
            }
    return results


def get_registered_analyses() -> list[str]:
    """Get list of all registered analysis names.

    Returns:
        List of analysis names (e.g., ["location", "function", "level", "tenure"])
    """
    return [name for name, _ in ANALYSIS_REGISTRY]


def get_analysis_function(name: str) -> AnalysisFunction | None:
    """Get analysis function by name.

    Args:
        name: Analysis name (e.g., "location", "function")

    Returns:
        Analysis function if found, None otherwise
    """
    for analysis_name, analysis_fn in ANALYSIS_REGISTRY:
        if analysis_name == name:
            return analysis_fn
    return None
