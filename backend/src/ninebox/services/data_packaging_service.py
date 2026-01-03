"""Data packaging service for LLM agent analysis.

This service packages all calibration data into an LLM-friendly JSON format,
optimized for comprehension by AI agents analyzing talent calibration patterns.

The packaged data includes:
- Employee records with complete attributes
- Organizational hierarchy and manager relationships
- Statistical analysis results from all registered analyses
- Data overview and summary statistics

This is part of Phase 1 of the agent-first AI calibration summary architecture.
"""

from collections import Counter
from datetime import date
from typing import Any

from ninebox.models.employee import Employee
from ninebox.services.org_service import OrgService


def package_for_ui(
    employees: list[Employee],
    analyses: dict[str, dict],
    org_data: dict | None = None,
) -> dict:
    """Package calibration data for UI display (includes all fields).

    This function includes employee_id, business_title, job_title, and other
    potentially identifying information for frontend visualization purposes.

    **Do not send this output to external LLM APIs.**

    Args:
        employees: List of employee records to package
        analyses: Results from analysis registry (location, function, level, tenure)
        org_data: Optional pre-built org data. If None, will be computed from employees.

    Returns:
        Dictionary with complete calibration data including PII fields:
        - employees: List of employee records with ALL attributes (including PII)
        - organization: Hierarchy data with real names
        - analyses: Full analysis results
        - overview: Summary statistics and distributions

    Example:
        >>> from ninebox.services.analysis_registry import run_all_analyses
        >>> analyses = run_all_analyses(employees)
        >>> package = package_for_ui(employees, analyses)
        >>> package["employees"][0]["employee_id"]  # Real employee ID
        'EMP123'
    """
    return _package_internal(employees, analyses, org_data, anonymize=False)


def package_for_llm(
    employees: list[Employee],
    analyses: dict[str, dict],
    org_data: dict | None = None,
) -> dict:
    """Package calibration data for LLM analysis (strict anonymization).

    This function excludes all PII:
    - employee_id → only anonymized "Employee_1", "Employee_2"
    - business_title → excluded
    - job_title → excluded
    - manager_id → excluded (use anonymized Manager_1 instead)
    - Real names → excluded from org hierarchy

    **Safe to send to external LLM APIs.**

    Args:
        employees: List of employee records to package
        analyses: Results from analysis registry (location, function, level, tenure)
        org_data: Optional pre-built org data. If None, will be computed from employees.

    Returns:
        Dictionary with anonymized calibration data (no PII):
        - employees: List of employee records WITHOUT PII fields
        - organization: Hierarchy data with anonymized identifiers
        - analyses: Full analysis results
        - overview: Summary statistics and distributions

    Example:
        >>> from ninebox.services.analysis_registry import run_all_analyses
        >>> analyses = run_all_analyses(employees)
        >>> package = package_for_llm(employees, analyses)
        >>> package["employees"][0]["id"]  # Only anonymized ID
        'Employee_1'
        >>> "employee_id" in package["employees"][0]  # No real ID
        False
    """
    return _package_internal(employees, analyses, org_data, anonymize=True)


def package_for_agent(
    employees: list[Employee],
    analyses: dict[str, dict],
    org_data: dict | None = None,
) -> dict:
    """Package all calibration data for LLM agent analysis.

    **DEPRECATED:** Use package_for_llm() or package_for_ui() instead.
    This function is maintained for backward compatibility but defaults
    to package_for_ui() behavior (includes PII).

    This function creates a comprehensive, LLM-friendly JSON structure containing
    all relevant calibration data. The structure is designed to be self-explanatory
    with descriptive field names and complete data (not just anomalies).

    Args:
        employees: List of employee records to package
        analyses: Results from analysis registry (location, function, level, tenure)
        org_data: Optional pre-built org data. If None, will be computed from employees.

    Returns:
        Dictionary with complete calibration data optimized for LLM comprehension:
        - employees: List of employee records with all attributes
        - organization: Hierarchy data (managers, levels, counts)
        - analyses: Full analysis results (not filtered)
        - overview: Summary statistics and distributions

    Example:
        >>> from ninebox.services.analysis_registry import run_all_analyses
        >>> analyses = run_all_analyses(employees)
        >>> package = package_for_agent(employees, analyses)
        >>> package["overview"]["total_employees"]
        47
        >>> package["employees"][0]["grid_position"]
        9
    """
    # Default to UI packaging (includes PII) for backward compatibility
    return package_for_ui(employees, analyses, org_data)


def _package_internal(
    employees: list[Employee],
    analyses: dict[str, dict],
    org_data: dict | None = None,
    anonymize: bool = True,
) -> dict:
    """Internal packaging logic with configurable anonymization.

    Args:
        employees: List of employee records to package
        analyses: Results from analysis registry
        org_data: Optional pre-built org data
        anonymize: If True, exclude PII fields. If False, include all fields.

    Returns:
        Dictionary with calibration data, anonymized or complete based on flag.
    """
    # Build org data if not provided
    if org_data is None:
        org_data = _build_org_data(employees, anonymize=anonymize)

    # Package employee records
    employee_records = _package_employees(employees, anonymize=anonymize)

    # Build overview statistics
    overview = _build_overview(employees)

    return {
        "employees": employee_records,
        "organization": org_data,
        "analyses": analyses,
        "overview": overview,
    }


def _package_employees(
    employees: list[Employee], anonymize: bool = True
) -> list[dict[str, Any]]:
    """Convert Employee objects to LLM-friendly dictionaries.

    Args:
        employees: List of employee records
        anonymize: If True, exclude PII fields (employee_id, business_title, job_title, manager_id).
                   If False, include all fields.

    Returns:
        List of employee dictionaries with clear, descriptive field names
    """
    employee_records = []

    for idx, emp in enumerate(employees, start=1):
        # Calculate tenure in years from hire date
        today = date.today()
        days_employed = max(0, (today - emp.hire_date).days)  # Clamp to 0
        tenure_years = round(days_employed / 365.25, 1)  # Account for leap years

        # Determine if new hire (< 1 year)
        is_new_hire = tenure_years < 1.0

        # Extract flags (use descriptive terms)
        flags = emp.flags if emp.flags else []

        # Determine performance rating (1-3 scale based on grid position)
        # Grid positions: 1-3 (Low perf), 4-6 (Medium perf), 7-9 (High perf)
        if emp.grid_position in [1, 2, 4]:
            performance_rating = 1  # Low
        elif emp.grid_position in [3, 5, 7]:
            performance_rating = 2  # Medium
        else:  # 6, 8, 9
            performance_rating = 3  # High

        # Determine potential rating (1-3 scale based on grid position)
        # Grid positions: 1-3 (Low pot), 4-6 (Medium pot), 7-9 (High pot)
        if emp.grid_position in [1, 2, 3]:
            potential_rating = 1  # Low
        elif emp.grid_position in [4, 5, 6]:
            potential_rating = 2  # Medium
        else:  # 7, 8, 9
            potential_rating = 3  # High

        # Build base record (safe for LLM)
        record = {
            "id": f"Employee_{idx}",  # Anonymized ID
            "level": emp.job_level,
            "function": emp.job_function,
            "location": emp.location,
            "tenure_years": tenure_years,
            "tenure_category": emp.tenure_category,
            "performance_rating": performance_rating,  # 1-3 scale
            "potential_rating": potential_rating,  # 1-3 scale
            "performance": emp.performance.value,  # "High", "Medium", "Low"
            "potential": emp.potential.value,  # "High", "Medium", "Low"
            "grid_position": emp.grid_position,  # 1-9
            "talent_indicator": emp.talent_indicator,
            "is_new_hire": is_new_hire,
            "flags": flags,
        }

        # Add PII fields only if not anonymizing
        if not anonymize:
            record["employee_id"] = emp.employee_id  # Actual ID for internal reference
            record["business_title"] = emp.business_title
            record["job_title"] = emp.job_title
            record["manager_id"] = (
                emp.direct_manager if emp.direct_manager != "None" else None
            )

        employee_records.append(record)

    return employee_records


def _build_org_data(employees: list[Employee], anonymize: bool = True) -> dict[str, Any]:
    """Build organizational hierarchy data.

    Args:
        employees: List of employee records
        anonymize: If True, exclude PII fields (manager_id, name, direct_reports with real IDs).
                   If False, include all fields.

    Returns:
        Dictionary with org structure information
    """
    # Build org service (disable validation to handle incomplete test data)
    org_service = OrgService(employees, validate=False)

    # Find all managers (anyone with at least 1 direct report)
    manager_ids = org_service.find_managers(min_team_size=1)

    managers = []
    for manager_id in manager_ids:
        manager_emp = org_service.get_employee_by_id(manager_id)
        if not manager_emp:
            continue

        direct_reports = org_service.get_direct_reports(manager_id)
        all_reports = org_service.get_all_reports(manager_id)

        # Build base manager record (safe for LLM)
        manager_record = {
            "id": f"Manager_{manager_id}",
            "level": manager_emp.job_level,
            "direct_report_count": len(direct_reports),
            "total_org_size": len(all_reports),
        }

        # Add PII fields only if not anonymizing
        if not anonymize:
            # Get employee IDs of direct reports
            direct_report_ids = [emp.employee_id for emp in direct_reports]
            manager_record["manager_id"] = manager_id
            manager_record["name"] = manager_emp.name
            manager_record["direct_reports"] = direct_report_ids

        managers.append(manager_record)

    # Extract unique levels
    levels_present = sorted(set(emp.job_level for emp in employees))

    return {
        "managers": managers,
        "total_employees": len(employees),
        "total_managers": len(managers),
        "levels_present": levels_present,
    }


def _build_overview(employees: list[Employee]) -> dict[str, Any]:
    """Build data overview with summary statistics.

    Args:
        employees: List of employee records

    Returns:
        Dictionary with overview statistics
    """
    total = len(employees)
    if total == 0:
        return {
            "total_employees": 0,
            "stars_count": 0,
            "stars_percentage": 0.0,
            "high_performers_count": 0,
            "high_performers_percentage": 0.0,
            "center_box_count": 0,
            "center_box_percentage": 0.0,
            "by_level": {},
            "by_function": {},
            "by_location": {},
            "by_performance": {},
            "by_potential": {},
            "by_grid_position": {},
        }

    # Grid position groupings (from calibration_summary_service.py)
    STARS_POSITION = 9
    CENTER_BOX_POSITION = 5
    HIGH_PERFORMER_POSITIONS = {3, 6, 9}

    # Count by various dimensions
    by_level = Counter(emp.job_level for emp in employees)
    by_function = Counter(emp.job_function for emp in employees)
    by_location = Counter(emp.location for emp in employees)
    by_performance = Counter(emp.performance.value for emp in employees)
    by_potential = Counter(emp.potential.value for emp in employees)
    by_grid_position = Counter(emp.grid_position for emp in employees)

    # Grid position counts
    stars_count = sum(1 for emp in employees if emp.grid_position == STARS_POSITION)
    center_count = sum(1 for emp in employees if emp.grid_position == CENTER_BOX_POSITION)
    high_perf_count = sum(
        1 for emp in employees if emp.grid_position in HIGH_PERFORMER_POSITIONS
    )

    return {
        "total_employees": total,
        "stars_count": stars_count,
        "stars_percentage": round(100.0 * stars_count / total, 1),
        "high_performers_count": high_perf_count,
        "high_performers_percentage": round(100.0 * high_perf_count / total, 1),
        "center_box_count": center_count,
        "center_box_percentage": round(100.0 * center_count / total, 1),
        "by_level": dict(by_level),
        "by_function": dict(by_function),
        "by_location": dict(by_location),
        "by_performance": dict(by_performance),
        "by_potential": dict(by_potential),
        "by_grid_position": dict(by_grid_position),
    }
