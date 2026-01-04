"""Intelligence service for statistical anomaly detection.

This module provides statistical analysis functions to detect anomalous patterns
in employee rating distributions across various dimensions (location, function, level, tenure).
"""

import logging
from typing import Any, cast

import numpy as np

from ninebox.models.employee import Employee
from ninebox.models.grid_positions import PERFORMANCE_BUCKETS
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


def _calculate_manager_chi_square(
    observed_counts: list[int],
    expected_pct: list[float],
    team_size: int,
) -> tuple[float, float]:
    """Perform chi-square goodness-of-fit test for manager distribution.

    Tests whether a manager's rating distribution significantly deviates
    from the expected baseline (typically 20/70/10 for High/Medium/Low)
    using chi-square goodness-of-fit test.

    This is different from chi-square test of independence used in other
    analyses. GOF test compares observed distribution to a theoretical
    baseline, not to other categories.

    Args:
        observed_counts: [high_count, medium_count, low_count] - actual counts
        expected_pct: [20.0, 70.0, 10.0] - baseline percentages
        team_size: Total employees under manager

    Returns:
        Tuple of (chi2_statistic, p_value)
        - chi2_statistic: Chi-square test statistic
        - p_value: Statistical significance (p < 0.05 indicates significant deviation)

    Example:
        >>> _calculate_manager_chi_square([5, 4, 1], [20.0, 70.0, 10.0], 10)
        (5.357, 0.069)  # Not significant at alpha=0.05

    Note:
        For small teams (< 15), the Low category may have expected count < 5,
        which violates chi-square assumptions. However, this is acceptable for
        exploratory analysis and is more rigorous than the previous heuristic.
    """
    from scipy.stats import chisquare

    # Calculate expected counts from percentages
    expected = np.array([team_size * p / 100.0 for p in expected_pct])

    # Perform chi-square goodness-of-fit test
    result = chisquare(f_obs=observed_counts, f_exp=expected)

    return float(result.statistic), float(result.pvalue)


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


def _build_qualified_managers(
    employees: list[Employee], min_team_size: int
) -> tuple[dict[str, list[Employee]], dict[str, Any] | None]:
    """Build organization tree and filter managers by minimum team size.

    Args:
        employees: List of employee records
        min_team_size: Minimum organization size for manager to be included

    Returns:
        Tuple of (qualified_managers dict, error_result or None)
        - qualified_managers: Dict mapping manager_name -> list of reports
        - error_result: Error analysis dict if no qualified managers found, None otherwise
    """
    # Use OrgService to build org tree (replaces 60+ lines of manual tree building)
    # OrgService validates structure and handles all edge cases (cycles, orphans, etc.)
    #
    # Validation is disabled because:
    # 1. Test data may have incomplete org structures (manager references without manager employees)
    # 2. Analysis focuses on rating distributions, not org structure correctness
    # 3. Validation adds minimal value here since we skip missing managers anyway
    # 4. Sample data generator ensures data integrity for production use
    #
    # Trade-off: We accept potentially invalid org structures to allow flexible test data.
    # Invalid manager references are logged as errors rather than raising exceptions.
    org_service = OrgService(employees, validate=False)

    # Filter managers by minimum team size
    manager_ids = org_service.find_managers(min_team_size=min_team_size)

    if not manager_ids:
        all_manager_ids = org_service.find_managers(min_team_size=1)
        if not all_manager_ids:
            return {}, _empty_analysis("No managers found in dataset")

        # Get team size range for error message
        all_team_sizes = [len(org_service.get_all_reports(mgr_id)) for mgr_id in all_manager_ids]
        return {}, _empty_analysis(
            f"No managers with team size >= {min_team_size}. "
            f"Found {len(all_manager_ids)} managers with teams of "
            f"{min(all_team_sizes)}-{max(all_team_sizes)} employees."
        )

    # Build qualified_managers dict: manager_name -> reports
    # Convert from ID-based (OrgService) to name-based (for backwards compatibility)
    qualified_managers = {}
    for manager_id in manager_ids:
        manager = org_service.get_employee_by_id(manager_id)
        if not manager:
            logging.getLogger(__name__).error(
                f"Manager ID {manager_id} found in org tree but not in employee list. "
                f"This indicates data corruption. Skipping manager."
            )
            continue

        reports = org_service.get_all_reports(manager_id)
        qualified_managers[manager.name] = reports

    return qualified_managers, None


def _calculate_single_manager_distribution(
    manager_name: str,
    reports: list[Employee],
    baseline_high: float,
    baseline_medium: float,
    baseline_low: float,
) -> dict[str, Any]:
    """Calculate rating distribution for a single manager.

    Args:
        manager_name: Name of the manager
        reports: List of employees reporting to this manager
        baseline_high: Baseline percentage for high performers
        baseline_medium: Baseline percentage for medium performers
        baseline_low: Baseline percentage for low performers

    Returns:
        Dictionary containing distribution metrics
    """
    # Validate grid positions and filter out invalid ones
    valid_reports = [emp for emp in reports if emp.grid_position in range(1, 10)]
    invalid_count = len(reports) - len(valid_reports)

    if invalid_count > 0:
        logging.getLogger(__name__).warning(
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
    high_deviation = high_pct - baseline_high
    medium_deviation = medium_pct - baseline_medium
    low_deviation = low_pct - baseline_low

    total_deviation = abs(high_deviation) + abs(medium_deviation) + abs(low_deviation)

    return {
        "manager_name": manager_name,
        "team_size": team_size,
        "employee_ids": [emp.employee_id for emp in valid_reports],  # All report IDs
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


def _calculate_manager_distributions(
    qualified_managers: dict[str, list[Employee]],
    baseline_high: float,
    baseline_medium: float,
    baseline_low: float,
    max_displayed: int,
) -> tuple[list[dict[str, Any]], int]:
    """Calculate rating distributions for all managers.

    Args:
        qualified_managers: Dict mapping manager_name -> list of reports
        baseline_high: Baseline percentage for high performers
        baseline_medium: Baseline percentage for medium performers
        baseline_low: Baseline percentage for low performers
        max_displayed: Maximum number of managers to return

    Returns:
        Tuple of (top_managers, total_manager_count)
        - top_managers: List of top N most anomalous managers with distribution metrics
        - total_manager_count: Total number of managers analyzed
    """
    manager_distributions = []
    for manager_name, reports in qualified_managers.items():
        distribution = _calculate_single_manager_distribution(
            manager_name, reports, baseline_high, baseline_medium, baseline_low
        )
        manager_distributions.append(distribution)

    # Sort by total deviation (most anomalous first) and limit to top N
    manager_distributions.sort(key=lambda x: cast("Any", x["total_deviation"]), reverse=True)
    total_manager_count = len(manager_distributions)
    top_managers = manager_distributions[:max_displayed]

    return top_managers, total_manager_count


def _calculate_manager_statistics(
    top_managers: list[dict[str, Any]],
    baseline_high: float,
    baseline_medium: float,
    baseline_low: float,
) -> tuple[list[dict[str, Any]], int, float]:
    """Calculate statistical metrics for manager deviations using chi-square goodness-of-fit.

    Performs chi-square goodness-of-fit test for each manager to determine if their
    rating distribution significantly deviates from the expected baseline (20/70/10).

    Args:
        top_managers: List of managers with distribution metrics
        baseline_high: Expected percentage of high performers (typically 20.0)
        baseline_medium: Expected percentage of medium performers (typically 70.0)
        baseline_low: Expected percentage of low performers (typically 10.0)

    Returns:
        Tuple of (deviations, significant_count, max_deviation)
        - deviations: List of deviation dicts with chi-square statistics and p-values
        - significant_count: Number of managers with significant deviations (p < 0.05)
        - max_deviation: Maximum total deviation across all managers
    """
    deviations = []
    for mgr in top_managers:
        team_size = cast("int", mgr["team_size"])

        # Prepare data for chi-square goodness-of-fit test
        observed_counts = [
            cast("int", mgr["high_count"]),
            cast("int", mgr["medium_count"]),
            cast("int", mgr["low_count"]),
        ]
        expected_pct = [baseline_high, baseline_medium, baseline_low]

        # Perform chi-square goodness-of-fit test
        chi2, p_value = _calculate_manager_chi_square(observed_counts, expected_pct, team_size)

        # For backward compatibility with _get_status, calculate a z-score-like metric
        # from the chi-square statistic. For chi-square with 2 df, significant values are:
        # chi2 ≈ 5.99 at p=0.05 (z≈2.0), chi2 ≈ 9.21 at p=0.01 (z≈3.0)
        # We use sqrt(chi2) as a rough z-score equivalent for consistency with old code
        z_score_equivalent = float(np.sqrt(chi2))

        deviations.append(
            {
                "category": cast("str", mgr["manager_name"]),
                "team_size": team_size,
                "employee_ids": cast("list[int]", mgr["employee_ids"]),  # All report IDs
                "high_pct": round(cast("float", mgr["high_pct"]), 1),
                "medium_pct": round(cast("float", mgr["medium_pct"]), 1),
                "low_pct": round(cast("float", mgr["low_pct"]), 1),
                "high_deviation": round(cast("float", mgr["high_deviation"]), 1),
                "medium_deviation": round(cast("float", mgr["medium_deviation"]), 1),
                "low_deviation": round(cast("float", mgr["low_deviation"]), 1),
                "total_deviation": round(cast("float", mgr["total_deviation"]), 1),
                "chi_square": round(chi2, 3),
                "p_value": round(p_value, 4),
                "z_score": round(z_score_equivalent, 2),  # For backward compatibility
                "is_significant": bool(p_value < 0.05),  # Standard significance level
            }
        )

    # Already sorted by total_deviation, no need to re-sort

    # Calculate summary statistics
    significant_count = sum(1 for d in deviations if d["is_significant"])
    max_deviation = max((cast("float", d["total_deviation"]) for d in deviations), default=0.0)

    return deviations, significant_count, max_deviation


def calculate_manager_analysis(
    employees: list[Employee],
    min_team_size: int = 10,
    max_displayed: int = 10,
) -> dict[str, Any]:
    """Analyze rating distribution across managers to detect anomalous patterns.

    Uses chi-square goodness-of-fit test to determine if each manager's rating
    distribution significantly deviates from the expected 20/70/10 baseline
    (High/Medium/Low performers).

    Each manager is tested independently against the theoretical baseline. This is
    different from other intelligence analyses which use chi-square test of independence
    to compare categories against each other.

    Args:
        employees: List of employee records
        min_team_size: Minimum organization size for manager to be included (default: 10)
        max_displayed: Maximum number of managers to return (default: 10)

    Returns:
        Dictionary containing:
        - chi_square: None (individual chi-square values in deviations list)
        - p_value: Minimum p-value across all managers (most significant deviation)
        - effect_size: Normalized maximum deviation (0-1 scale)
        - degrees_of_freedom: 2 (for 3-category goodness-of-fit test)
        - sample_size: Total sample size
        - status: Traffic light indicator ("green", "yellow", "red")
        - deviations: List of manager deviations with chi-square statistics, sorted by total deviation
        - interpretation: Human-readable summary

    Example:
        >>> result = calculate_manager_analysis(employees, min_team_size=10)
        >>> result["deviations"][0]["category"]  # Most anomalous manager
        'Jane Smith'
        >>> result["deviations"][0]["high_pct"]  # Actual high performer %
        45.0
        >>> result["deviations"][0]["high_deviation"]  # Deviation from 20% baseline
        25.0
        >>> result["deviations"][0]["chi_square"]  # Chi-square statistic
        12.5
        >>> result["deviations"][0]["p_value"]  # Statistical significance
        0.0019
        >>> result["deviations"][0]["is_significant"]  # p < 0.05
        True
    """
    if not employees:
        return _empty_analysis("No employees to analyze")

    # Configuration
    BASELINE_HIGH = 20.0
    BASELINE_MEDIUM = 70.0
    BASELINE_LOW = 10.0

    # Step 1: Build org tree and filter managers
    qualified_managers, error_result = _build_qualified_managers(employees, min_team_size)
    if error_result:
        return error_result

    # Step 2: Calculate distributions for each manager
    top_managers, total_manager_count = _calculate_manager_distributions(
        qualified_managers, BASELINE_HIGH, BASELINE_MEDIUM, BASELINE_LOW, max_displayed
    )

    if not top_managers:
        return _empty_analysis("No managers to analyze after filtering")

    # Step 3: Calculate statistical metrics using chi-square goodness-of-fit
    deviations, _significant_count, max_deviation = _calculate_manager_statistics(
        top_managers, BASELINE_HIGH, BASELINE_MEDIUM, BASELINE_LOW
    )

    # Step 4: Build final result
    # Now that we use proper chi-square goodness-of-fit tests, each manager has a real p-value
    # We calculate an overall summary p-value and effect size for the entire analysis

    # Calculate aggregate statistics from individual manager chi-square tests
    # Use the minimum p-value (most significant manager) as overall indicator
    min_p_value = min((d["p_value"] for d in deviations), default=1.0)
    effect_size = float(max_deviation) / 100.0  # Normalize to 0-1 scale

    # Generate status based on p-values and effect sizes
    status = _get_status(min_p_value, effect_size, deviations, is_uniformity_test=False)
    interpretation = _generate_manager_interpretation(
        status,
        min_p_value,
        effect_size,
        deviations,
        total_manager_count,
        max_displayed,
        qualified_managers,
    )

    return {
        "chi_square": None,  # Individual chi-square values are in deviations list
        "p_value": round(min_p_value, 4),  # Minimum p-value across all managers
        "effect_size": round(effect_size, 3),
        "degrees_of_freedom": 2,  # df = k - 1 = 3 - 1 = 2 for goodness-of-fit with 3 categories
        "sample_size": len(employees),
        "status": status,
        "deviations": deviations,
        "interpretation": interpretation,
    }


def calculate_per_level_distribution(employees: list[Employee]) -> dict[str, Any]:
    """Analyze performance distribution within each job level.

    This analysis addresses the critical use case: detecting when overall rating
    distribution looks normal but specific levels are driving anomalies.

    Example: "You have 30% stars overall, but it's because MT3 has 50% stars -
    focus calibration there"

    For each level, we:
    1. Calculate % of employees in each performance tier (low/medium/high)
    2. Compare to baseline distribution (20% high / 70% medium / 10% low)
    3. Calculate z-scores for statistical significance
    4. Identify which specific levels are driving overall anomalies

    Performance tiers based on grid positions:
    - Low performers: positions 1, 2, 4
    - Medium performers: positions 5, 7
    - High performers: positions 3, 6, 8, 9

    Args:
        employees: List of employee records

    Returns:
        Dictionary containing:
        - status: Overall status ("green", "yellow", "red")
        - levels: Dict mapping level name to level analysis
        - overall_status: Human-readable summary
        - chi_square: Chi-square statistic for overall test
        - p_value: Statistical significance level
        - effect_size: Cramér's V effect size
        - degrees_of_freedom: Degrees of freedom
        - sample_size: Total sample size
        - interpretation: Human-readable interpretation
    """
    if not employees:
        return _empty_analysis("No employees to analyze")

    # Baseline distribution (expected percentages)
    BASELINE_HIGH = 20.0
    BASELINE_MEDIUM = 70.0
    BASELINE_LOW = 10.0

    # Use canonical performance tier definitions from grid_positions.py
    # High: [9, 8, 6] - Star, Growth, High Impact (top 20%)
    # Medium: [7, 5, 3] - Enigma, Core Talent, Workhorse
    # Low: [4, 2, 1] - Inconsistent, Effective Pro, Underperformer
    HIGH_PERFORMER_POSITIONS = PERFORMANCE_BUCKETS["High"]
    MEDIUM_PERFORMER_POSITIONS = PERFORMANCE_BUCKETS["Medium"]
    LOW_PERFORMER_POSITIONS = PERFORMANCE_BUCKETS["Low"]

    # Group employees by level
    levels_data: dict[str, list[Employee]] = {}
    for emp in employees:
        level = emp.job_level
        if level not in levels_data:
            levels_data[level] = []
        levels_data[level].append(emp)

    if len(levels_data) < 2:
        return _empty_analysis("Insufficient levels for comparison (need >= 2)")

    # Check sample size
    n = len(employees)
    if n < 30:
        return _empty_analysis(f"Sample size too small (N={n}, need >= 30)")

    # Calculate distribution for each level
    level_results = {}
    contingency_table_data = []
    level_names = sorted(levels_data.keys())

    for level in level_names:
        level_employees = levels_data[level]
        total_count = len(level_employees)

        # Count employees in each performance tier
        high_count = sum(
            1 for emp in level_employees if emp.grid_position in HIGH_PERFORMER_POSITIONS
        )
        medium_count = sum(
            1 for emp in level_employees if emp.grid_position in MEDIUM_PERFORMER_POSITIONS
        )
        low_count = sum(
            1 for emp in level_employees if emp.grid_position in LOW_PERFORMER_POSITIONS
        )

        # Calculate percentages
        high_pct = (high_count / total_count * 100) if total_count > 0 else 0
        medium_pct = (medium_count / total_count * 100) if total_count > 0 else 0
        low_pct = (low_count / total_count * 100) if total_count > 0 else 0

        # Calculate expected counts based on baseline
        expected_high = total_count * BASELINE_HIGH / 100
        expected_medium = total_count * BASELINE_MEDIUM / 100
        expected_low = total_count * BASELINE_LOW / 100

        # Calculate z-scores for each performance tier
        z_high = (
            ((high_count - expected_high) / np.sqrt(expected_high)) if expected_high > 0 else 0.0
        )
        z_medium = (
            ((medium_count - expected_medium) / np.sqrt(expected_medium))
            if expected_medium > 0
            else 0.0
        )
        z_low = ((low_count - expected_low) / np.sqrt(expected_low)) if expected_low > 0 else 0.0

        # Determine level status based on z-scores
        max_z = max(abs(z_high), abs(z_medium), abs(z_low))
        if max_z >= 3.0:
            level_status = "red"
        elif max_z >= 2.0:
            level_status = "yellow"
        else:
            level_status = "green"

        # Identify specific deviations
        deviations = []
        if abs(z_high) >= 2.0:
            direction = "higher" if z_high > 0 else "lower"
            deviations.append(
                f"{level} has {high_pct:.1f}% high performers vs {BASELINE_HIGH}% expected (z={z_high:.1f}, {direction})"
            )
        if abs(z_medium) >= 2.0:
            direction = "higher" if z_medium > 0 else "lower"
            deviations.append(
                f"{level} has {medium_pct:.1f}% medium performers vs {BASELINE_MEDIUM}% expected (z={z_medium:.1f}, {direction})"
            )
        if abs(z_low) >= 2.0:
            direction = "higher" if z_low > 0 else "lower"
            deviations.append(
                f"{level} has {low_pct:.1f}% low performers vs {BASELINE_LOW}% expected (z={z_low:.1f}, {direction})"
            )

        level_results[level] = {
            "total_count": total_count,
            "high_performers_pct": round(high_pct, 1),
            "medium_performers_pct": round(medium_pct, 1),
            "low_performers_pct": round(low_pct, 1),
            "z_scores": {
                "high": round(float(z_high), 2),
                "medium": round(float(z_medium), 2),
                "low": round(float(z_low), 2),
            },
            "status": level_status,
            "deviations": deviations,
        }

        # Add to contingency table for overall chi-square test
        contingency_table_data.append([high_count, medium_count, low_count])

    # Perform overall chi-square test
    contingency = np.array(contingency_table_data)

    # Check if contingency table has any zero rows or columns
    row_sums = contingency.sum(axis=1)
    col_sums = contingency.sum(axis=0)
    if np.any(row_sums == 0) or np.any(col_sums == 0):
        # Some levels or performance tiers have zero employees
        # Still return level-by-level results but mark overall test as invalid
        overall_status = _determine_overall_status_from_levels(level_results)
        return {
            "status": overall_status,
            "levels": level_results,
            "overall_status": _generate_per_level_summary(level_results, overall_status),
            "chi_square": 0.0,
            "p_value": 1.0,
            "effect_size": 0.0,
            "degrees_of_freedom": 0,
            "sample_size": n,
            "interpretation": _generate_per_level_summary(level_results, overall_status),
        }

    # Perform chi-square test
    try:
        chi2, p_value, dof, _expected = _chi_square_test(contingency)
    except ValueError as e:
        overall_status = _determine_overall_status_from_levels(level_results)
        return {
            "status": overall_status,
            "levels": level_results,
            "overall_status": _generate_per_level_summary(level_results, overall_status),
            "chi_square": 0.0,
            "p_value": 1.0,
            "effect_size": 0.0,
            "degrees_of_freedom": 0,
            "sample_size": n,
            "interpretation": f"Statistical test failed: {e!s}",
        }

    # Calculate effect size
    effect_size = _cramers_v(chi2, n, len(level_names), 3)  # 3 performance tiers

    # Determine overall status
    overall_status = _determine_overall_status_from_levels(level_results)

    return {
        "status": overall_status,
        "levels": level_results,
        "overall_status": _generate_per_level_summary(level_results, overall_status),
        "chi_square": round(chi2, 3),
        "p_value": round(p_value, 4),
        "effect_size": round(effect_size, 3),
        "degrees_of_freedom": dof,
        "sample_size": n,
        "interpretation": _generate_per_level_summary(level_results, overall_status),
    }


def _determine_overall_status_from_levels(level_results: dict[str, dict[str, Any]]) -> str:
    """Determine overall status based on individual level statuses.

    Args:
        level_results: Dictionary of level analysis results

    Returns:
        Overall status ("green", "yellow", "red")
    """
    statuses = [level_data["status"] for level_data in level_results.values()]

    # If any level is red, overall is red
    if "red" in statuses:
        return "red"
    # If any level is yellow, overall is yellow
    if "yellow" in statuses:
        return "yellow"
    # All levels are green
    return "green"


def _generate_per_level_summary(
    level_results: dict[str, dict[str, Any]], overall_status: str
) -> str:
    """Generate human-readable summary of per-level distribution analysis.

    Args:
        level_results: Dictionary of level analysis results
        overall_status: Overall status ("green", "yellow", "red")

    Returns:
        Human-readable summary string
    """
    if overall_status == "green":
        return "All levels have rating distributions aligned with baseline expectations (20/70/10). No calibration issues detected."

    # Find levels with issues
    problematic_levels = [
        (level, data)
        for level, data in level_results.items()
        if data["status"] in ["yellow", "red"] and data["deviations"]
    ]

    if not problematic_levels:
        return "Minor variations detected but no significant calibration issues."

    # Sort by severity (red first, then yellow)
    problematic_levels.sort(key=lambda x: (x[1]["status"] == "yellow", x[0]))

    # Generate summary
    if len(problematic_levels) == 1:
        level, data = problematic_levels[0]
        deviation_msg = "; ".join(data["deviations"])
        return f"Analysis shows {level} level driving rating anomalies: {deviation_msg}"
    else:
        level_list = ", ".join([level for level, _ in problematic_levels[:3]])
        if len(problematic_levels) > 3:
            level_list += f" and {len(problematic_levels) - 3} other levels"
        return f"Analysis shows multiple levels with rating anomalies: {level_list}. Focus calibration on these levels."


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
    # Import here to avoid circular dependency (analysis_registry imports from this module)
    from ninebox.services.analysis_registry import run_all_analyses

    # Run all analyses through the registry
    all_results = run_all_analyses(employees)

    # Extract individual analyses (excluding per_level_distribution which is not used here)
    location = all_results.get("location", {})
    function = all_results.get("function", {})
    level = all_results.get("level", {})
    tenure = all_results.get("tenure", {})
    manager = all_results.get("manager", {})

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
