"""Intelligence service for statistical anomaly detection.

This module provides statistical analysis functions to detect anomalous patterns
in employee rating distributions across various dimensions (location, function, level, tenure).
"""

import logging
from typing import Any, cast

import numpy as np

from ninebox.models.employee import Employee


def _chi_square_test(contingency_table: np.ndarray) -> tuple[float, float, int, np.ndarray]:
    """Perform chi-square test of independence.

    Args:
        contingency_table: 2D array of observed frequencies

    Returns:
        Tuple of (chi2_statistic, p_value, degrees_of_freedom, expected_frequencies)
    """
    from scipy.stats import chi2_contingency

    chi2, p_value, dof, expected = chi2_contingency(contingency_table)
    return float(chi2), float(p_value), int(dof), expected


def _calculate_z_scores(observed: np.ndarray, expected: np.ndarray) -> np.ndarray:
    """Calculate standardized residuals (z-scores) for each cell.

    Z-score formula: (observed - expected) / sqrt(expected)

    Args:
        observed: Array of observed frequencies
        expected: Array of expected frequencies

    Returns:
        Array of z-scores (standardized residuals)
    """
    # Avoid division by zero
    with np.errstate(divide="ignore", invalid="ignore"):
        z_scores = (observed - expected) / np.sqrt(expected)
        z_scores = np.nan_to_num(z_scores, nan=0.0, posinf=0.0, neginf=0.0)
    return cast("np.ndarray[Any, Any]", z_scores)


def _cramers_v(chi2: float, n: int, rows: int, cols: int) -> float:
    """Calculate Cramér's V effect size.

    Cramér's V formula: sqrt(chi2 / (n * min(r-1, c-1)))

    Args:
        chi2: Chi-square statistic
        n: Total sample size
        rows: Number of rows in contingency table
        cols: Number of columns in contingency table

    Returns:
        Cramér's V (0-1 scale, where 0.1=small, 0.3=medium, 0.5=large)
    """
    if n == 0 or min(rows, cols) <= 1:
        return 0.0
    return float(np.sqrt(chi2 / (n * min(rows - 1, cols - 1))))


def _safe_sample_size_check(counts: np.ndarray) -> bool:
    """Check if all expected counts are >= 5 for chi-square test validity.

    Args:
        counts: Array of expected frequencies

    Returns:
        True if all expected counts >= 5, False otherwise
    """
    return bool(np.all(counts >= 5))


def _get_status(
    p_value: float,
    effect_size: float,
    deviations: list[dict[str, Any]],
    is_uniformity_test: bool = False,  # noqa: ARG001
) -> str:
    """Determine traffic light status based on p-value, effect size, and individual deviations.

    CRITICAL: This function now considers BOTH overall statistics AND individual deviations.
    A category can be flagged even if the overall p-value is not significant, if:
    - Individual z-scores are significant (|z| > 2.0)
    - Effect size is medium or large (Cramér's V > 0.3)

    Args:
        p_value: Statistical significance level
        effect_size: Cramér's V effect size (0-1 scale)
        deviations: List of deviation dicts with 'is_significant' and 'z_score' keys
        is_uniformity_test: Kept for API compatibility; the threshold logic is the same for both
            uniformity tests (level analysis) and deviation tests (location/function/tenure)

    Returns:
        Status string: "green", "yellow", or "red"
    """
    # Check for significant individual deviations FIRST
    # This catches cases where overall p-value is not significant but individual cells are
    significant_devs = [d for d in deviations if d.get("is_significant", False)]

    # DEBUG: Log to verify new code is running
    logger = logging.getLogger(__name__)
    logger.info(
        f"[NEW CODE] _get_status called: p={p_value:.4f}, effect={effect_size:.3f}, "
        f"significant_devs={len(significant_devs)}/{len(deviations)}"
    )

    if significant_devs:
        # We have at least one category with significant deviation (|z| > 2)
        max_z = max(abs(float(d["z_score"])) for d in significant_devs)

        # Combine z-score magnitude with effect size for severity
        if max_z > 3.0 or (max_z > 2.5 and effect_size > 0.4):
            # Very strong deviation or strong deviation with large effect
            return "red"
        # Strong deviation or moderate deviation with medium effect
        return "yellow"

    # No significant individual deviations (all z < 2.0)
    # BUT: Check effect size - medium/large effect should still be flagged
    # This catches cases where sample sizes are too small for significant z-scores
    # but the overall pattern shows a meaningful difference
    if effect_size >= 0.5 or effect_size >= 0.3:  # Large effect
        return "yellow"

    # No significant deviations and small effect size - check p-value
    if p_value > 0.05:
        return "green"
    elif p_value > 0.01:
        return "yellow"
    return "red"


def calculate_location_analysis(employees: list[Employee]) -> dict[str, Any]:
    """Analyze performance distribution across job locations.

    Tests whether the distribution of performance ratings (High/Medium/Low)
    differs significantly across locations using chi-square test.

    Args:
        employees: List of employee records

    Returns:
        Dictionary containing:
        - chi_square: Chi-square statistic
        - p_value: Statistical significance level
        - effect_size: Cramér's V effect size
        - degrees_of_freedom: Degrees of freedom for test
        - sample_size: Total sample size
        - status: Traffic light indicator ("green", "yellow", "red")
        - deviations: List of significant deviations by location
        - interpretation: Human-readable summary
    """
    if not employees:
        return _empty_analysis("No employees to analyze")

    # Group by location and performance
    locations = {}
    for emp in employees:
        loc = emp.location
        perf = emp.performance.value
        if loc not in locations:
            locations[loc] = {"High": 0, "Medium": 0, "Low": 0}
        locations[loc][perf] += 1

    if len(locations) < 2:
        return _empty_analysis("Insufficient locations for comparison (need >= 2)")

    # Build contingency table: rows=locations, cols=performance levels
    location_names = sorted(locations.keys())
    perf_levels = ["High", "Medium", "Low"]
    contingency = np.array(
        [[locations[loc][perf] for perf in perf_levels] for loc in location_names]
    )

    # Check sample size FIRST (more important than checking for empty categories)
    n = len(employees)
    if n < 30:
        return _empty_analysis(f"Sample size too small (N={n}, need >= 30)")

    # Perform chi-square test
    try:
        chi2, p_value, dof, expected = _chi_square_test(contingency)
        z_scores = _calculate_z_scores(contingency, expected)
    except ValueError as e:
        # Chi-square test failed (likely due to zero expected frequencies)
        return _empty_analysis(f"Statistical test failed: {e!s}")

    # Check if chi-square test is valid
    if not _safe_sample_size_check(expected):  # noqa: SIM102
        # Use Fisher's exact test for 2x2 tables
        if contingency.shape == (2, 2):
            from scipy.stats import fisher_exact

            _, p_value = fisher_exact(contingency)
            chi2 = 0.0  # Fisher's exact doesn't have chi2 statistic

    # Calculate effect size
    effect_size = _cramers_v(chi2, n, len(location_names), len(perf_levels))

    # Calculate deviations
    deviations = []
    for i, loc in enumerate(location_names):
        total_in_loc = sum(contingency[i])
        observed_high = contingency[i][0]  # High performance
        expected_high = expected[i][0]
        z_score = z_scores[i][0]

        observed_high_pct = (observed_high / total_in_loc * 100) if total_in_loc > 0 else 0
        expected_high_pct = (expected_high / total_in_loc * 100) if total_in_loc > 0 else 0

        deviations.append(
            {
                "category": loc,
                "observed_high_pct": round(observed_high_pct, 1),
                "expected_high_pct": round(expected_high_pct, 1),
                "z_score": round(float(z_score), 2),
                "sample_size": int(total_in_loc),
                "is_significant": bool(abs(z_score) >= 2.0),
            }
        )

    # Sort by absolute z-score
    deviations.sort(key=lambda x: abs(float(x["z_score"])), reverse=True)

    # Generate status (considers p-value, effect size, AND individual deviations)
    status = _get_status(p_value, effect_size, deviations, is_uniformity_test=False)
    interpretation = _generate_location_interpretation(status, p_value, effect_size, deviations)

    return {
        "chi_square": round(chi2, 3),
        "p_value": round(p_value, 4),
        "effect_size": round(effect_size, 3),
        "degrees_of_freedom": dof,
        "sample_size": n,
        "status": status,
        "deviations": deviations,
        "interpretation": interpretation,
    }


def calculate_function_analysis(employees: list[Employee]) -> dict[str, Any]:  # noqa: PLR0911, PLR0912
    """Analyze grid position distribution across job functions.

    Tests whether the 9-box distribution differs significantly across job functions.

    Args:
        employees: List of employee records

    Returns:
        Dictionary with statistical analysis results (same structure as location_analysis)

    Note:
        Complexity warnings suppressed - multiple return statements and branches are needed
        for proper validation and error handling of various edge cases.
    """
    if not employees:
        return _empty_analysis("No employees to analyze")

    # Group by function and grid position
    functions = {}
    for emp in employees:
        func = emp.job_function
        pos = emp.grid_position
        if func not in functions:
            functions[func] = dict.fromkeys(range(1, 10), 0)
        functions[func][pos] += 1

    if len(functions) < 2:
        return _empty_analysis("Insufficient functions for comparison (need >= 2)")

    # Group rare functions (< 10 employees) into "Other" to avoid sparse contingency table
    MIN_FUNCTION_SIZE = 10
    grouped_functions = {}
    other_function = dict.fromkeys(range(1, 10), 0)
    other_count = 0

    for func, positions_dict in functions.items():
        total = sum(positions_dict.values())
        if total >= MIN_FUNCTION_SIZE:
            grouped_functions[func] = positions_dict
        else:
            # Add to "Other" group
            other_count += total
            for pos, count in positions_dict.items():
                other_function[pos] += count

    # Add "Other" group if it has employees
    if other_count > 0:
        grouped_functions["Other"] = other_function

    # Check if we still have enough functions after grouping
    if len(grouped_functions) < 2:
        return _empty_analysis(
            f"Insufficient functions after grouping rare functions (need >= 2, have {len(grouped_functions)}). "
            f"Consider adding more employees or ensuring more diverse job functions."
        )

    # Build contingency table: rows=functions, cols=grid positions (1-9)
    function_names = sorted(grouped_functions.keys())
    all_positions = list(range(1, 10))

    # Filter out positions that have zero employees across all functions
    positions_with_data = []
    for pos in all_positions:
        if any(grouped_functions[func][pos] > 0 for func in function_names):
            positions_with_data.append(pos)

    # Check if we have enough positions after filtering
    if len(positions_with_data) < 2:
        return _empty_analysis(
            f"Insufficient grid positions with data (need >= 2, have {len(positions_with_data)})"
        )

    # Build contingency table with only positions that have data
    contingency = np.array(
        [[grouped_functions[func][pos] for pos in positions_with_data] for func in function_names]
    )

    # Check sample size
    n = len(employees)
    if n < 30:
        return _empty_analysis(f"Sample size too small (N={n}, need >= 30)")

    # Check if contingency table has any zero rows (all functions should have employees)
    row_sums = contingency.sum(axis=1)
    if np.any(row_sums == 0):
        return _empty_analysis("Contingency table has empty function categories")

    # Perform chi-square test
    try:
        chi2, p_value, dof, expected = _chi_square_test(contingency)
        z_scores = _calculate_z_scores(contingency, expected)
    except ValueError as e:
        # Chi-square test failed (likely due to zero expected frequencies)
        return _empty_analysis(f"Statistical test failed: {e!s}")

    # Calculate effect size
    effect_size = _cramers_v(chi2, n, len(function_names), len(positions_with_data))

    # Calculate deviations (focus on high performers: positions 7-9)
    # Find which column indices correspond to positions 7, 8, 9
    high_performer_indices = [
        idx for idx, pos in enumerate(positions_with_data) if pos in [7, 8, 9]
    ]

    deviations = []
    for i, func in enumerate(function_names):
        total_in_func = sum(contingency[i])

        # Calculate high performer stats if we have those positions
        if high_performer_indices:
            observed_high = sum(contingency[i][idx] for idx in high_performer_indices)
            expected_high = sum(expected[i][idx] for idx in high_performer_indices)
            z_scores_high = [z_scores[i][idx] for idx in high_performer_indices]
            z_score_high = np.mean(z_scores_high) if z_scores_high else 0.0
        else:
            # No high performer positions in data, use all positions
            observed_high = total_in_func
            expected_high = sum(expected[i])
            z_score_high = np.mean(z_scores[i])

        observed_high_pct = (observed_high / total_in_func * 100) if total_in_func > 0 else 0
        expected_high_pct = (expected_high / total_in_func * 100) if total_in_func > 0 else 0

        deviations.append(
            {
                "category": func,
                "observed_high_pct": round(observed_high_pct, 1),
                "expected_high_pct": round(expected_high_pct, 1),
                "z_score": round(float(z_score_high), 2),
                "sample_size": int(total_in_func),
                "is_significant": bool(abs(z_score_high) >= 2.0),
            }
        )

    # Sort by absolute z-score
    deviations.sort(key=lambda x: abs(float(x["z_score"])), reverse=True)

    # Generate status (considers p-value, effect size, AND individual deviations)
    status = _get_status(p_value, effect_size, deviations, is_uniformity_test=False)
    interpretation = _generate_function_interpretation(status, p_value, effect_size, deviations)

    return {
        "chi_square": round(chi2, 3),
        "p_value": round(p_value, 4),
        "effect_size": round(effect_size, 3),
        "degrees_of_freedom": dof,
        "sample_size": n,
        "status": status,
        "deviations": deviations,
        "interpretation": interpretation,
    }


def calculate_level_analysis(employees: list[Employee]) -> dict[str, Any]:
    """Analyze performance uniformity across job levels.

    CRITICAL: This is a UNIFORMITY test - we WANT p > 0.05.
    Ratings should be calibrated within each level, so distributions should be similar.

    Args:
        employees: List of employee records

    Returns:
        Dictionary with statistical analysis results (same structure as location_analysis)
    """
    if not employees:
        return _empty_analysis("No employees to analyze")

    # Group by level and performance
    levels = {}
    for emp in employees:
        level = emp.job_level
        perf = emp.performance.value
        if level not in levels:
            levels[level] = {"High": 0, "Medium": 0, "Low": 0}
        levels[level][perf] += 1

    if len(levels) < 2:
        return _empty_analysis("Insufficient levels for comparison (need >= 2)")

    # Build contingency table: rows=levels, cols=performance
    level_names = sorted(levels.keys())
    perf_levels = ["High", "Medium", "Low"]
    contingency = np.array([[levels[lvl][perf] for perf in perf_levels] for lvl in level_names])

    # Check sample size
    n = len(employees)
    if n < 30:
        return _empty_analysis(f"Sample size too small (N={n}, need >= 30)")

    # Check if contingency table has any zero rows or columns (which would cause chi-square to fail)
    row_sums = contingency.sum(axis=1)
    col_sums = contingency.sum(axis=0)
    if np.any(row_sums == 0) or np.any(col_sums == 0):
        return _empty_analysis("Contingency table has empty categories")

    # Perform chi-square test
    try:
        chi2, p_value, dof, expected = _chi_square_test(contingency)
        z_scores = _calculate_z_scores(contingency, expected)
    except ValueError as e:
        # Chi-square test failed (likely due to zero expected frequencies)
        return _empty_analysis(f"Statistical test failed: {e!s}")

    # Calculate effect size
    effect_size = _cramers_v(chi2, n, len(level_names), len(perf_levels))

    # Calculate deviations
    deviations = []
    for i, lvl in enumerate(level_names):
        total_in_level = sum(contingency[i])
        observed_high = contingency[i][0]  # High performance
        expected_high = expected[i][0]
        z_score = z_scores[i][0]

        observed_high_pct = (observed_high / total_in_level * 100) if total_in_level > 0 else 0
        expected_high_pct = (expected_high / total_in_level * 100) if total_in_level > 0 else 0

        deviations.append(
            {
                "category": lvl,
                "observed_high_pct": round(observed_high_pct, 1),
                "expected_high_pct": round(expected_high_pct, 1),
                "z_score": round(float(z_score), 2),
                "sample_size": int(total_in_level),
                "is_significant": bool(abs(z_score) >= 2.0),
            }
        )

    # Sort by absolute z-score
    deviations.sort(key=lambda x: abs(float(x["z_score"])), reverse=True)

    # Generate status (UNIFORMITY TEST - p > 0.05 is GOOD, but still check individual deviations)
    status = _get_status(p_value, effect_size, deviations, is_uniformity_test=True)
    interpretation = _generate_level_interpretation(status, p_value, effect_size, deviations)

    return {
        "chi_square": round(chi2, 3),
        "p_value": round(p_value, 4),
        "effect_size": round(effect_size, 3),
        "degrees_of_freedom": dof,
        "sample_size": n,
        "status": status,
        "deviations": deviations,
        "interpretation": interpretation,
    }


def calculate_tenure_analysis(employees: list[Employee]) -> dict[str, Any]:
    """Analyze performance distribution across tenure categories.

    Tests whether performance ratings differ significantly by tenure.

    Args:
        employees: List of employee records

    Returns:
        Dictionary with statistical analysis results (same structure as location_analysis)
    """
    if not employees:
        return _empty_analysis("No employees to analyze")

    # Group by tenure and performance
    tenures = {}
    for emp in employees:
        tenure = emp.tenure_category
        perf = emp.performance.value
        if tenure not in tenures:
            tenures[tenure] = {"High": 0, "Medium": 0, "Low": 0}
        tenures[tenure][perf] += 1

    if len(tenures) < 2:
        return _empty_analysis("Insufficient tenure categories for comparison (need >= 2)")

    # Build contingency table: rows=tenure categories, cols=performance
    tenure_names = sorted(tenures.keys())
    perf_levels = ["High", "Medium", "Low"]
    contingency = np.array([[tenures[ten][perf] for perf in perf_levels] for ten in tenure_names])

    # Check sample size
    n = len(employees)
    if n < 30:
        return _empty_analysis(f"Sample size too small (N={n}, need >= 30)")

    # Check if contingency table has any zero rows or columns (which would cause chi-square to fail)
    row_sums = contingency.sum(axis=1)
    col_sums = contingency.sum(axis=0)
    if np.any(row_sums == 0) or np.any(col_sums == 0):
        return _empty_analysis("Contingency table has empty categories")

    # Perform chi-square test
    try:
        chi2, p_value, dof, expected = _chi_square_test(contingency)
        z_scores = _calculate_z_scores(contingency, expected)
    except ValueError as e:
        # Chi-square test failed (likely due to zero expected frequencies)
        return _empty_analysis(f"Statistical test failed: {e!s}")

    # Calculate effect size
    effect_size = _cramers_v(chi2, n, len(tenure_names), len(perf_levels))

    # Calculate deviations
    deviations = []
    for i, ten in enumerate(tenure_names):
        total_in_tenure = sum(contingency[i])
        observed_high = contingency[i][0]  # High performance
        expected_high = expected[i][0]
        z_score = z_scores[i][0]

        observed_high_pct = (observed_high / total_in_tenure * 100) if total_in_tenure > 0 else 0
        expected_high_pct = (expected_high / total_in_tenure * 100) if total_in_tenure > 0 else 0

        deviations.append(
            {
                "category": ten,
                "observed_high_pct": round(observed_high_pct, 1),
                "expected_high_pct": round(expected_high_pct, 1),
                "z_score": round(float(z_score), 2),
                "sample_size": int(total_in_tenure),
                "is_significant": bool(abs(z_score) >= 2.0),
            }
        )

    # Sort by absolute z-score
    deviations.sort(key=lambda x: abs(float(x["z_score"])), reverse=True)

    # Generate status (considers p-value, effect size, AND individual deviations)
    status = _get_status(p_value, effect_size, deviations, is_uniformity_test=False)
    interpretation = _generate_tenure_interpretation(status, p_value, effect_size, deviations)

    return {
        "chi_square": round(chi2, 3),
        "p_value": round(p_value, 4),
        "effect_size": round(effect_size, 3),
        "degrees_of_freedom": dof,
        "sample_size": n,
        "status": status,
        "deviations": deviations,
        "interpretation": interpretation,
    }


def calculate_overall_intelligence(employees: list[Employee]) -> dict[str, Any]:
    """Calculate overall intelligence analysis across all dimensions.

    Aggregates all individual analyses and computes overall data quality score.

    Args:
        employees: List of employee records

    Returns:
        Dictionary containing:
        - quality_score: Overall data quality score (0-100)
        - anomaly_count: Dict with green/yellow/red counts
        - location_analysis: Location analysis results
        - function_analysis: Function analysis results
        - level_analysis: Level analysis results
        - tenure_analysis: Tenure analysis results
    """
    # Run all analyses
    location = calculate_location_analysis(employees)
    function = calculate_function_analysis(employees)
    level = calculate_level_analysis(employees)
    tenure = calculate_tenure_analysis(employees)

    # Count anomalies by severity
    analyses = [location, function, level, tenure]
    anomaly_count = {
        "green": sum(1 for a in analyses if a.get("status") == "green"),
        "yellow": sum(1 for a in analyses if a.get("status") == "yellow"),
        "red": sum(1 for a in analyses if a.get("status") == "red"),
    }

    # Calculate quality score (0-100)
    # Green = 100 points, Yellow = 50 points, Red = 0 points
    total_points = anomaly_count["green"] * 100 + anomaly_count["yellow"] * 50
    quality_score = total_points // len(analyses) if analyses else 0

    return {
        "quality_score": quality_score,
        "anomaly_count": anomaly_count,
        "location_analysis": location,
        "function_analysis": function,
        "level_analysis": level,
        "tenure_analysis": tenure,
    }


def _empty_analysis(reason: str) -> dict[str, Any]:
    """Return empty analysis result with explanation.

    Args:
        reason: Explanation for why analysis cannot be performed

    Returns:
        Dictionary with default values and explanation
    """
    return {
        "chi_square": 0.0,
        "p_value": 1.0,
        "effect_size": 0.0,
        "degrees_of_freedom": 0,
        "sample_size": 0,
        "status": "green",
        "deviations": [],
        "interpretation": reason,
    }


def _generate_location_interpretation(
    status: str, p_value: float, effect_size: float, deviations: list[dict[str, Any]]
) -> str:
    """Generate human-readable interpretation for location analysis.

    CRITICAL: Check for significant individual deviations FIRST, regardless of overall p-value.
    """
    # Check for significant individual deviations FIRST
    significant_devs = [d for d in deviations if d.get("is_significant", False)]

    if significant_devs:
        # Report the most significant deviation
        top_dev = significant_devs[0]
        category = top_dev["category"]
        obs_pct = top_dev["observed_high_pct"]
        exp_pct = top_dev["expected_high_pct"]
        z_score = top_dev["z_score"]

        direction = "higher" if obs_pct > exp_pct else "lower"
        effect_desc = "small" if effect_size < 0.3 else "medium" if effect_size < 0.5 else "large"

        # Include count of significant deviations if multiple
        count_msg = ""
        if len(significant_devs) > 1:
            count_msg = f" ({len(significant_devs)} locations with significant deviations)"

        return (
            f"Significant location bias detected{count_msg} (p={p_value:.4f}, {effect_desc} effect). "
            f"{category}: {obs_pct:.1f}% high performers vs {exp_pct:.1f}% expected "
            f"(z={z_score:.2f}, {direction} than baseline)."
        )

    # No significant individual deviations (all z < 2.0)
    # BUT: If effect size is medium/large, report the largest deviation anyway
    if effect_size >= 0.3 and deviations:
        top_dev = deviations[0]  # Already sorted by |z-score|
        category = top_dev["category"]
        obs_pct = top_dev["observed_high_pct"]
        exp_pct = top_dev["expected_high_pct"]
        z_score = top_dev["z_score"]

        direction = "higher" if obs_pct > exp_pct else "lower"
        effect_desc = "medium" if effect_size < 0.5 else "large"

        return (
            f"Notable location pattern detected (p={p_value:.4f}, {effect_desc} effect). "
            f"{category}: {obs_pct:.1f}% high performers vs {exp_pct:.1f}% expected "
            f"(z={z_score:.2f}, {direction} than baseline). Small sample sizes limit statistical significance."
        )

    # No significant deviations and small effect size
    if status == "green":
        return "Performance ratings are evenly distributed across locations. No significant anomalies detected."

    # Rare edge case
    return f"Anomaly detected (p={p_value:.4f}) but no specific deviations identified."


def _generate_function_interpretation(
    status: str, p_value: float, effect_size: float, deviations: list[dict[str, Any]]
) -> str:
    """Generate human-readable interpretation for function analysis.

    CRITICAL: Check for significant individual deviations FIRST, regardless of overall p-value.
    """
    # Check for significant individual deviations FIRST
    significant_devs = [d for d in deviations if d.get("is_significant", False)]

    if significant_devs:
        # Report the most significant deviation
        top_dev = significant_devs[0]
        category = top_dev["category"]
        obs_pct = top_dev["observed_high_pct"]
        exp_pct = top_dev["expected_high_pct"]
        z_score = top_dev["z_score"]

        direction = "higher" if obs_pct > exp_pct else "lower"
        effect_desc = "small" if effect_size < 0.3 else "medium" if effect_size < 0.5 else "large"

        # Include count of significant deviations if multiple
        count_msg = ""
        if len(significant_devs) > 1:
            count_msg = f" ({len(significant_devs)} functions with significant deviations)"

        return (
            f"Significant function bias detected{count_msg} (p={p_value:.4f}, {effect_desc} effect). "
            f"{category}: {obs_pct:.1f}% high performers vs {exp_pct:.1f}% expected "
            f"(z={z_score:.2f}, {direction} than baseline)."
        )

    # No significant individual deviations (all z < 2.0)
    # BUT: If effect size is medium/large, report the largest deviation anyway
    if effect_size >= 0.3 and deviations:
        top_dev = deviations[0]  # Already sorted by |z-score|
        category = top_dev["category"]
        obs_pct = top_dev["observed_high_pct"]
        exp_pct = top_dev["expected_high_pct"]
        z_score = top_dev["z_score"]

        direction = "higher" if obs_pct > exp_pct else "lower"
        effect_desc = "medium" if effect_size < 0.5 else "large"

        return (
            f"Notable function pattern detected (p={p_value:.4f}, {effect_desc} effect). "
            f"{category}: {obs_pct:.1f}% high performers vs {exp_pct:.1f}% expected "
            f"(z={z_score:.2f}, {direction} than baseline). Small sample sizes limit statistical significance."
        )

    # No significant deviations and small effect size
    if status == "green":
        return "Performance ratings are evenly distributed across functions. No significant anomalies detected."

    # Rare edge case
    return f"Anomaly detected (p={p_value:.4f}) but no specific deviations identified."


def _generate_level_interpretation(
    status: str, p_value: float, effect_size: float, deviations: list[dict[str, Any]]
) -> str:
    """Generate human-readable interpretation for level analysis (UNIFORMITY TEST).

    CRITICAL: Check for significant individual deviations FIRST, regardless of overall p-value.
    """
    # Check for significant individual deviations FIRST
    significant_devs = [d for d in deviations if d.get("is_significant", False)]

    if significant_devs:
        # Report the most significant deviation
        top_dev = significant_devs[0]
        category = top_dev["category"]
        obs_pct = top_dev["observed_high_pct"]
        exp_pct = top_dev["expected_high_pct"]
        z_score = top_dev["z_score"]

        direction = "leniency" if obs_pct > exp_pct else "severity"
        effect_desc = "small" if effect_size < 0.3 else "medium" if effect_size < 0.5 else "large"

        # Include count of significant deviations if multiple
        count_msg = ""
        if len(significant_devs) > 1:
            count_msg = f" ({len(significant_devs)} levels with significant deviations)"

        return (
            f"Warning: Level calibration issue detected{count_msg} (p={p_value:.4f}, {effect_desc} effect). "
            f"{category}: {obs_pct:.1f}% rated High vs {exp_pct:.1f}% baseline - "
            f"possible {direction} bias (z={z_score:.2f})."
        )

    # No significant individual deviations (all z < 2.0)
    # BUT: If effect size is medium/large, report the pattern anyway
    if effect_size >= 0.3 and deviations:
        top_dev = deviations[0]  # Already sorted by |z-score|
        category = top_dev["category"]
        obs_pct = top_dev["observed_high_pct"]
        exp_pct = top_dev["expected_high_pct"]
        z_score = top_dev["z_score"]

        direction = "leniency" if obs_pct > exp_pct else "severity"
        effect_desc = "medium" if effect_size < 0.5 else "large"

        return (
            f"Notable level calibration pattern detected (p={p_value:.4f}, {effect_desc} effect). "
            f"{category}: {obs_pct:.1f}% rated High vs {exp_pct:.1f}% baseline - "
            f"possible {direction} bias (z={z_score:.2f}). Small sample sizes limit statistical significance."
        )

    # No significant deviations and small effect size
    if status == "green":
        return (
            f"Level calibration looks good (p={p_value:.4f}). "
            "Performance ratings are properly calibrated across job levels."
        )

    # Rare edge case
    return f"Warning: Calibration issue detected (p={p_value:.4f})."


def _generate_tenure_interpretation(
    status: str, p_value: float, effect_size: float, deviations: list[dict[str, Any]]
) -> str:
    """Generate human-readable interpretation for tenure analysis.

    CRITICAL: Check for significant individual deviations FIRST, regardless of overall p-value.
    """
    # Check for significant individual deviations FIRST
    significant_devs = [d for d in deviations if d.get("is_significant", False)]

    if significant_devs:
        # Report the most significant deviation
        top_dev = significant_devs[0]
        category = top_dev["category"]
        obs_pct = top_dev["observed_high_pct"]
        exp_pct = top_dev["expected_high_pct"]
        z_score = top_dev["z_score"]

        direction = "higher" if obs_pct > exp_pct else "lower"
        effect_desc = "small" if effect_size < 0.3 else "medium" if effect_size < 0.5 else "large"

        # Include count of significant deviations if multiple
        count_msg = ""
        if len(significant_devs) > 1:
            count_msg = f" ({len(significant_devs)} tenure groups with significant deviations)"

        return (
            f"Significant tenure bias detected{count_msg} (p={p_value:.4f}, {effect_desc} effect). "
            f"{category}: {obs_pct:.1f}% high performers vs {exp_pct:.1f}% expected "
            f"(z={z_score:.2f}, {direction} than baseline)."
        )

    # No significant individual deviations (all z < 2.0)
    # BUT: If effect size is medium/large, report the largest deviation anyway
    if effect_size >= 0.3 and deviations:
        top_dev = deviations[0]  # Already sorted by |z-score|
        category = top_dev["category"]
        obs_pct = top_dev["observed_high_pct"]
        exp_pct = top_dev["expected_high_pct"]
        z_score = top_dev["z_score"]

        direction = "higher" if obs_pct > exp_pct else "lower"
        effect_desc = "medium" if effect_size < 0.5 else "large"

        return (
            f"Notable tenure pattern detected (p={p_value:.4f}, {effect_desc} effect). "
            f"{category}: {obs_pct:.1f}% high performers vs {exp_pct:.1f}% expected "
            f"(z={z_score:.2f}, {direction} than baseline). Small sample sizes limit statistical significance."
        )

    # No significant deviations and small effect size
    if status == "green":
        return "Performance ratings are evenly distributed across tenure groups. No significant anomalies detected."

    # Rare edge case
    return f"Anomaly detected (p={p_value:.4f}) but no specific deviations identified."


# Global intelligence service instance
class IntelligenceService:
    """Service class for intelligence analysis operations."""

    def calculate_overall(self, employees: list[Employee]) -> dict[str, Any]:
        """Calculate overall intelligence analysis.

        Args:
            employees: List of employee records

        Returns:
            Dictionary with all intelligence analysis results
        """
        return calculate_overall_intelligence(employees)

    def calculate_location(self, employees: list[Employee]) -> dict[str, Any]:
        """Calculate location-specific analysis.

        Args:
            employees: List of employee records

        Returns:
            Dictionary with location analysis results
        """
        return calculate_location_analysis(employees)

    def calculate_function(self, employees: list[Employee]) -> dict[str, Any]:
        """Calculate function-specific analysis.

        Args:
            employees: List of employee records

        Returns:
            Dictionary with function analysis results
        """
        return calculate_function_analysis(employees)

    def calculate_level(self, employees: list[Employee]) -> dict[str, Any]:
        """Calculate level-specific analysis.

        Args:
            employees: List of employee records

        Returns:
            Dictionary with level analysis results
        """
        return calculate_level_analysis(employees)

    def calculate_tenure(self, employees: list[Employee]) -> dict[str, Any]:
        """Calculate tenure-specific analysis.

        Args:
            employees: List of employee records

        Returns:
            Dictionary with tenure analysis results
        """
        return calculate_tenure_analysis(employees)


intelligence_service = IntelligenceService()
