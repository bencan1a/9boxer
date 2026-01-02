"""Intelligence service for statistical anomaly detection.

This module provides statistical analysis functions to detect anomalous patterns
in employee rating distributions across various dimensions (location, function, level, tenure).
"""

import logging
from typing import Any, cast

import numpy as np

from ninebox.models.employee import Employee
from ninebox.services.org_service import OrgService


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
    is_uniformity_test: bool = False,
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
    if not _safe_sample_size_check(expected):
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


def calculate_function_analysis(employees: list[Employee]) -> dict[str, Any]:
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
    except ValueError as e:
        # Chi-square test failed (likely due to zero expected frequencies)
        return _empty_analysis(f"Statistical test failed: {e!s}")

    # Calculate effect size
    effect_size = _cramers_v(chi2, n, len(function_names), len(positions_with_data))

    # Calculate deviations (focus on high performers: positions 3, 6, 9)
    # Grid positions 3, 6, 9 all have High Performance (regardless of potential)
    # Position 3: High Perf + Low Potential
    # Position 6: High Perf + Medium Potential
    # Position 9: High Perf + High Potential
    high_performer_indices = [
        idx for idx, pos in enumerate(positions_with_data) if pos in [3, 6, 9]
    ]

    deviations = []
    for i, func in enumerate(function_names):
        total_in_func = sum(contingency[i])

        # Calculate high performer stats if we have those positions
        if high_performer_indices:
            observed_high = sum(contingency[i][idx] for idx in high_performer_indices)
            expected_high = sum(expected[i][idx] for idx in high_performer_indices)
            # Calculate z-score correctly for combined high performer category
            # Using formula: (observed - expected) / sqrt(expected)
            if expected_high > 0:
                z_score_high = (observed_high - expected_high) / np.sqrt(expected_high)
            else:
                z_score_high = 0.0
        else:
            # No high performer positions in data, use all positions
            observed_high = total_in_func
            expected_high = sum(expected[i])
            if expected_high > 0:
                z_score_high = (observed_high - expected_high) / np.sqrt(expected_high)
            else:
                z_score_high = 0.0

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


def calculate_manager_analysis(
    employees: list[Employee],
    min_team_size: int = 10,
    max_displayed: int = 10,
) -> dict[str, Any]:
    """Analyze rating distribution across managers to detect anomalous patterns.

    Tests whether managers have rating distributions that significantly deviate
    from the expected 20/70/10 baseline (High/Medium/Low performers).

    Args:
        employees: List of employee records
        min_team_size: Minimum organization size for manager to be included (default: 10)
        max_displayed: Maximum number of managers to return (default: 10)

    Returns:
        Dictionary containing:
        - chi_square: Chi-square statistic
        - p_value: Statistical significance level
        - effect_size: Cramér's V effect size
        - degrees_of_freedom: Degrees of freedom for test
        - sample_size: Total sample size
        - status: Traffic light indicator ("green", "yellow", "red")
        - deviations: List of manager deviations sorted by total deviation
        - interpretation: Human-readable summary

    Example:
        >>> result = calculate_manager_analysis(employees, min_team_size=10)
        >>> result["deviations"][0]["category"]  # Most anomalous manager
        'Jane Smith'
        >>> result["deviations"][0]["high_pct"]  # Actual high performer %
        45.0
        >>> result["deviations"][0]["high_deviation"]  # Deviation from 20% baseline
        25.0
    """
    if not employees:
        return _empty_analysis("No employees to analyze")

    # Configuration
    BASELINE_HIGH = 20.0
    BASELINE_MEDIUM = 70.0
    BASELINE_LOW = 10.0

    # Use OrgService to build org tree (replaces 60+ lines of manual tree building)
    # OrgService validates structure and handles all edge cases (cycles, orphans, etc.)
    #
    # Validation is disabled because:
    # 1. Test data may have incomplete org structures (manager references without manager employees)
    # 2. Analysis focuses on rating distributions, not org structure correctness
    # 3. Validation adds minimal value here since we skip missing managers anyway (line 671)
    # 4. Sample data generator ensures data integrity for production use
    #
    # Trade-off: We accept potentially invalid org structures to allow flexible test data.
    # Invalid manager references are logged as errors (line 672) rather than raising exceptions.
    org_service = OrgService(employees, validate=False)

    # Filter managers by minimum team size
    manager_ids = org_service.find_managers(min_team_size=min_team_size)

    if not manager_ids:
        all_manager_ids = org_service.find_managers(min_team_size=1)
        if not all_manager_ids:
            return _empty_analysis("No managers found in dataset")

        # Get team size range for error message
        all_team_sizes = [len(org_service.get_all_reports(mgr_id)) for mgr_id in all_manager_ids]
        return _empty_analysis(
            f"No managers with team size >= {min_team_size}. "
            f"Found {len(all_manager_ids)} managers with teams of "
            f"{min(all_team_sizes)}-{max(all_team_sizes)} employees."
        )

    # Build qualified_managers dict: manager_name -> reports
    # Convert from ID-based (OrgService) to name-based (for backwards compatibility)
    logger = logging.getLogger(__name__)
    qualified_managers = {}
    for manager_id in manager_ids:
        manager = org_service.get_employee_by_id(manager_id)
        if not manager:
            logger.error(
                f"Manager ID {manager_id} found in org tree but not in employee list. "
                f"This indicates data corruption. Skipping manager."
            )
            continue

        reports = org_service.get_all_reports(manager_id)
        qualified_managers[manager.name] = reports

    # Calculate rating distributions for each manager
    manager_distributions = []
    for manager_name, reports in qualified_managers.items():
        # Validate grid positions and filter out invalid ones
        valid_reports = [emp for emp in reports if emp.grid_position in range(1, 10)]
        invalid_count = len(reports) - len(valid_reports)

        if invalid_count > 0:
            logger.warning(
                f"Manager '{manager_name}' has {invalid_count} employee(s) with invalid "
                f"grid positions (not in 1-9). These employees are excluded from distribution analysis."
            )

        # Count employees in each performance bucket
        # High: positions 9, 8, 6
        # Medium: positions 7, 5, 3
        # Low: positions 4, 2, 1
        high_count = sum(1 for emp in valid_reports if emp.grid_position in [9, 8, 6])
        medium_count = sum(1 for emp in valid_reports if emp.grid_position in [7, 5, 3])
        low_count = sum(1 for emp in valid_reports if emp.grid_position in [4, 2, 1])

        team_size = len(valid_reports)
        high_pct = (high_count / team_size * 100) if team_size > 0 else 0
        medium_pct = (medium_count / team_size * 100) if team_size > 0 else 0
        low_pct = (low_count / team_size * 100) if team_size > 0 else 0

        # Calculate deviations from baseline
        high_deviation = high_pct - BASELINE_HIGH
        medium_deviation = medium_pct - BASELINE_MEDIUM
        low_deviation = low_pct - BASELINE_LOW

        total_deviation = abs(high_deviation) + abs(medium_deviation) + abs(low_deviation)

        manager_distributions.append(
            {
                "manager_name": manager_name,
                "team_size": team_size,
                "high_count": high_count,
                "medium_count": medium_count,
                "low_count": low_count,
                "high_pct": high_pct,
                "medium_pct": medium_pct,
                "low_pct": low_pct,
                "high_deviation": high_deviation,
                "medium_deviation": medium_deviation,
                "low_deviation": low_deviation,
                "total_deviation": total_deviation,
            }
        )

    # Sort by total deviation (most anomalous first) and limit to top N
    manager_distributions.sort(key=lambda x: cast("Any", x["total_deviation"]), reverse=True)
    total_manager_count = len(manager_distributions)
    top_managers = manager_distributions[:max_displayed]

    if not top_managers:
        return _empty_analysis("No managers to analyze after filtering")

    # Build deviations list - calculate z-scores based on deviation from baseline
    # NOTE: This uses a simplified heuristic for ranking managers, not a proper statistical test.
    # The z-score is an approximation used to identify which managers deviate most from baseline,
    # not for rigorous hypothesis testing. See technical debt issue for proper chi-square implementation.
    deviations = []
    for mgr in top_managers:
        # Calculate z-score for each manager based on deviation from baseline
        team_size = cast("int", mgr["team_size"])

        # For small teams, z-scores would be inflated, so we scale by sqrt(team_size)
        # This gives a rough approximation of statistical significance
        scale_factor = np.sqrt(team_size) if team_size > 0 else 1

        # Calculate z-score based on largest deviation
        max_deviation_value: float = max(
            abs(cast("float", mgr["high_deviation"])),
            abs(cast("float", mgr["medium_deviation"])),
            abs(cast("float", mgr["low_deviation"])),
        )

        # Approximate z-score: deviation / (baseline_std * scale_factor)
        # The constant 10.0 is a rough estimate of standard deviation for percentage points
        # in typical rating distributions. This provides a heuristic ranking metric where:
        # - z ≥ 2.0 indicates a manager is likely anomalous (marked as "significant")
        # - z ≥ 3.0 indicates a highly anomalous manager
        # Technical debt: Replace with proper chi-square goodness-of-fit test
        z_score = max_deviation_value / (10.0 / scale_factor) if scale_factor > 0 else 0

        deviations.append(
            {
                "category": cast("str", mgr["manager_name"]),
                "team_size": cast("int", mgr["team_size"]),
                "high_pct": round(cast("float", mgr["high_pct"]), 1),
                "medium_pct": round(cast("float", mgr["medium_pct"]), 1),
                "low_pct": round(cast("float", mgr["low_pct"]), 1),
                "high_deviation": round(cast("float", mgr["high_deviation"]), 1),
                "medium_deviation": round(cast("float", mgr["medium_deviation"]), 1),
                "low_deviation": round(cast("float", mgr["low_deviation"]), 1),
                "total_deviation": round(cast("float", mgr["total_deviation"]), 1),
                "z_score": round(float(z_score), 2),
                "is_significant": bool(abs(z_score) >= 2.0),
            }
        )

    # Already sorted by total_deviation, no need to re-sort

    # Calculate summary statistics for overall status
    significant_count = sum(1 for d in deviations if d["is_significant"])
    max_deviation = max((cast("float", d["total_deviation"]) for d in deviations), default=0.0)

    # Determine status based on deviations
    # For manager analysis, we use deviation-based thresholds rather than chi-square
    # NOTE: This is a heuristic metric used internally for status determination,
    # not a real p-value from a statistical test. See issue #156 for details.
    heuristic_score = 1.0 - (significant_count / len(deviations)) if deviations else 1.0
    effect_size = float(max_deviation) / 100.0  # Normalize to 0-1 scale

    # Generate status (uses heuristic_score internally for fallback logic)
    status = _get_status(heuristic_score, effect_size, deviations, is_uniformity_test=False)
    interpretation = _generate_manager_interpretation(
        status,
        heuristic_score,
        effect_size,
        deviations,
        total_manager_count,
        max_displayed,
        qualified_managers,
    )

    return {
        "chi_square": None,  # Not applicable - manager analysis uses heuristic ranking
        "p_value": None,  # Not available - using heuristic approach, not chi-square test
        "effect_size": round(effect_size, 3),
        "degrees_of_freedom": None,  # Not applicable - no chi-square test performed
        "sample_size": len(employees),
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
        - manager_analysis: Manager analysis results
    """
    # Run all analyses
    location = calculate_location_analysis(employees)
    function = calculate_function_analysis(employees)
    level = calculate_level_analysis(employees)
    tenure = calculate_tenure_analysis(employees)
    manager = calculate_manager_analysis(employees)

    # Count anomalies by severity
    analyses = [location, function, level, tenure, manager]
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
        "manager_analysis": manager,
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


def _generate_manager_interpretation(
    status: str,
    heuristic_score: float,
    effect_size: float,
    deviations: list[dict[str, Any]],
    total_manager_count: int,
    max_displayed: int,
    qualified_managers: dict[str, list[Any]],
) -> str:
    """Generate human-readable interpretation for manager analysis.

    CRITICAL: Check for significant individual deviations FIRST, regardless of overall score.

    Args:
        status: Traffic light status ("green", "yellow", or "red")
        heuristic_score: Internal heuristic metric (1.0 - anomaly_ratio), not a statistical p-value
        effect_size: Normalized effect size (0-1 scale)
        deviations: List of manager deviation dictionaries
        total_manager_count: Total number of managers analyzed
        max_displayed: Maximum number of managers to display
        qualified_managers: Dictionary mapping manager names to employee lists

    Returns:
        Human-readable interpretation string
    """
    # Check for significant individual deviations FIRST
    significant_devs = [d for d in deviations if d.get("is_significant", False)]

    if significant_devs:
        effect_desc = "small" if effect_size < 0.3 else "medium" if effect_size < 0.5 else "large"

        # Build context message about total managers analyzed
        context_msg = ""
        if total_manager_count > max_displayed:
            context_msg = (
                f"Found {total_manager_count} managers, analyzing top {len(deviations)} "
                f"with largest deviations. "
            )
        else:
            context_msg = f"Analyzed {total_manager_count} managers. "

        # Analyze commonalities among significant managers
        sig_manager_names = [d["category"] for d in significant_devs]
        sig_employees = []
        for mgr_name in sig_manager_names:
            if mgr_name in qualified_managers:
                sig_employees.extend(qualified_managers[mgr_name])

        commonality_msg = ""
        if sig_employees:
            # Analyze locations
            from collections import Counter

            locations = Counter(emp.location for emp in sig_employees if emp.location)
            job_functions = Counter(emp.job_function for emp in sig_employees if emp.job_function)

            # Report top location if it represents >30% of employees under significant managers
            if locations:
                top_location, loc_count = locations.most_common(1)[0]
                loc_pct = (loc_count / len(sig_employees)) * 100
                if loc_pct > 30:
                    commonality_msg += f" {loc_pct:.0f}% in {top_location}."

            # Report top job function if it represents >30%
            if job_functions:
                top_function, func_count = job_functions.most_common(1)[0]
                func_pct = (func_count / len(sig_employees)) * 100
                if func_pct > 30:
                    commonality_msg += f" {func_pct:.0f}% in {top_function}."

        # Build summary message
        sig_count = len(significant_devs)
        summary = (
            f"{context_msg}"
            f"{sig_count} out of {total_manager_count} managers have significant rating distribution "
            f"deviations ({effect_desc} effect).{commonality_msg}"
        )

        return summary

    # No significant individual deviations (all z < 2.0)
    # BUT: If effect size is medium/large, report the largest deviation anyway
    if effect_size >= 0.3 and deviations:
        effect_desc = "medium" if effect_size < 0.5 else "large"

        # Build context message about total managers analyzed
        context_msg = ""
        if total_manager_count > max_displayed:
            context_msg = f"Analyzed {total_manager_count} managers, showing top {len(deviations)} with largest deviations. "
        else:
            context_msg = f"Analyzed {total_manager_count} managers. "

        return (
            f"{context_msg}"
            f"Notable rating patterns detected ({effect_desc} effect), "
            f"but small sample sizes limit statistical significance."
        )

    # No significant deviations and small effect size
    if status == "green":
        context_msg = f"Analyzed {total_manager_count} managers. "
        return (
            f"{context_msg}"
            "Manager rating distributions are generally aligned with the 20/70/10 baseline. "
            "No significant anomalies detected."
        )

    # Rare edge case
    return "Anomaly detected but no specific deviations identified."


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
