"""Employee filtering and query service."""

from ninebox.models.employee import Employee, PerformanceLevel, PotentialLevel

# European country codes (ISO 3166-1 alpha-3)
EUROPEAN_COUNTRIES = {
    "GBR",
    "FRA",
    "DEU",
    "ITA",
    "ESP",
    "NLD",
    "BEL",
    "SWE",
    "NOR",
    "DNK",
    "FIN",
    "POL",
    "AUT",
    "CHE",
    "IRL",
    "PRT",
    "GRC",
    "CZE",
    "HUN",
    "ROU",
    "BGR",
    "HRV",
    "SVK",
    "SVN",
    "LTU",
    "LVA",
    "EST",
    "LUX",
    "MLT",
    "CYP",
}

LOCATION_MAP = {
    "AUS": "Australia",
    "IND": "India",
    "USA": "USA",
    "CAN": "Canada",
}


def map_location_to_display(location_code: str) -> str:
    """Map location code to display name."""
    if location_code in EUROPEAN_COUNTRIES:
        return "Europe"
    return LOCATION_MAP.get(location_code, location_code)


class EmployeeService:
    """Filter and query employees."""

    def filter_employees(
        self,
        employees: list[Employee],
        levels: list[str] | None = None,
        job_profiles: list[str] | None = None,
        job_functions: list[str] | None = None,
        locations: list[str] | None = None,
        managers: list[str] | None = None,
        exclude_ids: list[int] | None = None,
        performance: list[str] | None = None,
        potential: list[str] | None = None,
    ) -> list[Employee]:
        """Apply filters to employee list."""
        filtered = employees

        # Filter by level (e.g., ["MT2", "MT4"])
        if levels:
            filtered = [e for e in filtered if any(level in e.job_level for level in levels)]

        # Filter by job profile (legacy - kept for backward compatibility)
        if job_profiles:
            filtered = [e for e in filtered if e.job_profile in job_profiles]

        # Filter by job function
        if job_functions:
            filtered = [e for e in filtered if e.job_function in job_functions]

        # Filter by location (map to display names for comparison)
        if locations:
            filtered = [e for e in filtered if map_location_to_display(e.location) in locations]

        # Filter by manager
        if managers:
            filtered = [e for e in filtered if e.manager in managers]

        # Exclude specific employees (e.g., managers in the room)
        if exclude_ids:
            filtered = [e for e in filtered if e.employee_id not in exclude_ids]

        # Filter by performance level
        if performance:
            perf_levels = [PerformanceLevel(p) for p in performance]
            filtered = [e for e in filtered if e.performance in perf_levels]

        # Filter by potential level
        if potential:
            pot_levels = [PotentialLevel(p) for p in potential]
            filtered = [e for e in filtered if e.potential in pot_levels]

        return filtered

    def get_filter_options(self, employees: list[Employee]) -> dict:
        """Extract unique filter options from employee list."""
        # Extract unique job levels
        levels = sorted({e.job_level for e in employees})

        # Extract unique job profiles (legacy - kept for backward compatibility)
        job_profiles = sorted({e.job_profile for e in employees if e.job_profile})

        # Extract unique job functions
        job_functions = sorted({e.job_function for e in employees if e.job_function})

        # Extract unique locations and map to display names
        locations = sorted({map_location_to_display(e.location) for e in employees if e.location})

        # Extract unique managers (exclude None and literal string "None")
        managers = sorted({e.manager for e in employees if e.manager and e.manager != "None"})

        # List all employees for exclusion selector
        employee_list = [
            {"id": e.employee_id, "name": e.name, "level": e.job_level, "title": e.business_title}
            for e in sorted(employees, key=lambda x: x.name)
        ]

        return {
            "levels": levels,
            "job_profiles": job_profiles,
            "job_functions": job_functions,
            "locations": locations,
            "managers": managers,
            "employees": employee_list,
        }
