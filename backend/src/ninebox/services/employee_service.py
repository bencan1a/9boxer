"""Employee filtering and query service."""

from typing import Optional

from ninebox.models.employee import Employee, PerformanceLevel, PotentialLevel


class EmployeeService:
    """Filter and query employees."""

    def filter_employees(
        self,
        employees: list[Employee],
        levels: Optional[list[str]] = None,
        job_profiles: Optional[list[str]] = None,
        managers: Optional[list[str]] = None,
        chain_levels: Optional[list[str]] = None,
        exclude_ids: Optional[list[int]] = None,
        performance: Optional[list[str]] = None,
        potential: Optional[list[str]] = None,
    ) -> list[Employee]:
        """Apply filters to employee list."""
        filtered = employees

        # Filter by level (e.g., ["MT2", "MT4"])
        if levels:
            filtered = [e for e in filtered if any(level in e.job_level for level in levels)]

        # Filter by job profile
        if job_profiles:
            filtered = [e for e in filtered if e.job_profile in job_profiles]

        # Filter by manager
        if managers:
            filtered = [e for e in filtered if e.manager in managers]

        # Filter by management chain
        if chain_levels:
            def has_chain_level(emp: Employee) -> bool:
                if "04" in chain_levels and emp.management_chain_04:
                    return True
                if "05" in chain_levels and emp.management_chain_05:
                    return True
                if "06" in chain_levels and emp.management_chain_06:
                    return True
                return False

            filtered = [e for e in filtered if has_chain_level(e)]

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
        levels = sorted(set(e.job_level for e in employees))

        # Extract unique job profiles
        job_profiles = sorted(set(e.job_profile for e in employees if e.job_profile))

        # Extract unique managers
        managers = sorted(set(e.manager for e in employees if e.manager))

        # Check which chain levels are present
        chain_levels = []
        if any(e.management_chain_04 for e in employees):
            chain_levels.append("04")
        if any(e.management_chain_05 for e in employees):
            chain_levels.append("05")
        if any(e.management_chain_06 for e in employees):
            chain_levels.append("06")

        # List all employees for exclusion selector
        employee_list = [
            {"id": e.employee_id, "name": e.name, "level": e.job_level, "title": e.business_title}
            for e in sorted(employees, key=lambda x: x.name)
        ]

        return {
            "levels": levels,
            "job_profiles": job_profiles,
            "managers": managers,
            "chain_levels": chain_levels,
            "employees": employee_list,
        }


# Global employee service instance
employee_service = EmployeeService()
