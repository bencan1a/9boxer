"""Organization hierarchy service for building and querying org trees.

This service provides centralized functionality for working with organizational
hierarchies as graphs, enabling features like:
- Manager analysis and anomaly detection
- Org hierarchy filtering
- Reporting chain navigation
- Org structure validation

The service extracts and generalizes org tree building logic previously embedded
in intelligence_service.py, making it reusable across the application.

IMPORTANT: This service uses employee_id (int) as the primary key to avoid
duplicate name issues. Employee names can be duplicated in datasets, but
employee IDs are guaranteed unique.
"""

from dataclasses import dataclass

from ninebox.models.employee import Employee


@dataclass
class OrgValidationResult:
    """Result of organizational structure validation.

    Attributes:
        is_valid: Whether the org structure is valid
        circular_references: List of employee IDs involved in circular reporting chains
        orphaned_employees: List of employee IDs with invalid manager references
        errors: List of validation error messages
    """

    is_valid: bool
    circular_references: list[int]
    orphaned_employees: list[int]
    errors: list[str]


class OrgService:
    """Service for building and querying organizational hierarchies.

    This service treats the organizational structure as a directed graph where:
    - Nodes are employees (identified by employee_id)
    - Edges represent "reports to" relationships
    - The CEO is the root node (no manager)

    The service uses employee_id as the primary key to avoid duplicate name issues.
    Employee names can be duplicated, but IDs are guaranteed unique.

    IMPORTANT: This service caches results based on the employee list provided in
    __init__. If employee data changes, create a new OrgService instance. The service
    validates the org structure on initialization to catch data quality issues early.

    Example:
        >>> employees = [...] # List of Employee objects
        >>> org_service = OrgService(employees)
        >>> org_tree = org_service.build_org_tree()
        >>> alice_team = org_service.get_all_reports(alice.employee_id)
        >>> managers = org_service.find_managers(min_team_size=10)
    """

    def __init__(self, employees: list[Employee], validate: bool = True):
        """Initialize the service with a list of employees.

        Args:
            employees: List of Employee objects with manager relationships
            validate: Whether to validate org structure on initialization (default: True)

        Raises:
            ValueError: If validate=True and org structure is invalid

        Example:
            >>> employees = generate_rich_dataset(RichDatasetConfig(size=100))
            >>> org_service = OrgService(employees)
        """
        self._employees = employees

        # Build employee lookup immediately for validation and queries
        self._employee_by_id: dict[int, Employee] = {
            emp.employee_id: emp for emp in self._employees
        }

        # Build name-to-IDs mapping (tracks ALL employees with each name)
        self._name_to_ids: dict[str, list[int]] = {}
        for emp in self._employees:
            if emp.name not in self._name_to_ids:
                self._name_to_ids[emp.name] = []
            self._name_to_ids[emp.name].append(emp.employee_id)

        # Keep old single-ID mapping for backward compatibility
        self._name_to_id: dict[str, int] = {emp.name: emp.employee_id for emp in self._employees}

        # Lazy-loaded caches
        self._org_tree: dict[int, list[Employee]] | None = None
        self._direct_reports: dict[int, list[Employee]] | None = None

        # Validate structure if requested
        if validate:
            result = self.validate_structure()
            if not result.is_valid:
                raise ValueError(
                    f"Invalid org structure: {len(result.errors)} errors found. "
                    f"First error: {result.errors[0] if result.errors else 'Unknown'}"
                )

    def _get_job_level_rank(self, job_level: str) -> int:
        """Extract numeric rank from job level for tiebreaking.

        Higher numbers = higher seniority (VP > Director > Manager > IC)

        Args:
            job_level: Job level string (e.g., "MT6", "VP Engineering", "Director")

        Returns:
            Numeric rank (60=VP, 50=Director, 40=Manager, 30=Senior, 25=Lead, 0=unknown)

        Examples:
            >>> _get_job_level_rank("MT6")
            60
            >>> _get_job_level_rank("VP Engineering")
            60
            >>> _get_job_level_rank("Director Sales")
            50
        """
        import re

        job_level_upper = job_level.upper()

        # Check for keywords first (most reliable)
        if "VP" in job_level_upper or "VICE PRESIDENT" in job_level_upper:
            return 60
        if "DIRECTOR" in job_level_upper:
            return 50
        if "MANAGER" in job_level_upper:
            return 40
        if "SENIOR" in job_level_upper:
            return 30
        if "LEAD" in job_level_upper:
            return 25

        # Try to extract MT number (MT6 = 60, MT5 = 50, etc.)
        match = re.search(r"MT(\d+)", job_level_upper)
        if match:
            level_num = int(match.group(1))
            return level_num * 10

        # Try to extract any number
        match = re.search(r"\d+", job_level)
        if match:
            return int(match.group()) * 10

        return 0  # Unknown level

    def _resolve_manager_id(self, manager_name: str, employee: Employee) -> int | None:
        """Resolve manager name to employee ID with duplicate name handling.

        When multiple employees share the same name, uses tiebreaking logic:
        1. Job level priority (VPs > Directors > Managers > ICs)
        2. Manager status (employees who have direct reports)
        3. First match if all else equal

        Args:
            manager_name: Name of the manager to resolve
            employee: The employee whose manager we're resolving

        Returns:
            Employee ID of the manager, or None if not found

        Examples:
            # Single match - returns immediately
            >>> _resolve_manager_id("Unique Name", employee)
            123

            # Multiple "Leo Brown" employees - picks VP over IC
            >>> _resolve_manager_id("Leo Brown", employee)
            5  # Returns VP (ID 5), not IC (ID 133)
        """
        # Check if manager name exists
        if manager_name not in self._name_to_ids:
            return None

        candidate_ids = self._name_to_ids[manager_name]

        # Fast path: single match
        if len(candidate_ids) == 1:
            candidate_id = candidate_ids[0]
            # Prevent self-management
            if candidate_id == employee.employee_id:
                return None
            return candidate_id

        # Multiple matches - apply tiebreakers
        best_id = None
        best_rank = -1
        best_has_reports = False

        for candidate_id in candidate_ids:
            # Skip self-management
            if candidate_id == employee.employee_id:
                continue

            candidate = self._employee_by_id.get(candidate_id)
            if not candidate:
                continue

            # Tiebreaker 1: Job level rank
            rank = self._get_job_level_rank(candidate.job_level)

            # Tiebreaker 2: Manager status (has direct reports)
            # Check if this candidate has any direct reports
            has_reports = False
            for emp in self._employees:
                if emp.direct_manager == candidate.name and emp.employee_id != candidate_id:
                    # Found at least one report
                    has_reports = True
                    break

            # Determine if this candidate is better than current best
            is_better = False
            if best_id is None:
                is_better = True
            elif rank > best_rank:
                # Higher job level wins
                is_better = True
            elif rank == best_rank and has_reports and not best_has_reports:
                # Same job level, but this one has reports
                is_better = True

            if is_better:
                best_id = candidate_id
                best_rank = rank
                best_has_reports = has_reports

        return best_id

    def build_org_tree(self) -> dict[int, list[Employee]]:
        """Build complete organizational tree with all reports (direct + indirect).

        Returns a dictionary mapping manager employee IDs to all employees reporting
        to them (both directly and indirectly through the hierarchy).

        Returns:
            Dictionary where keys are manager employee_ids and values are lists of
            all employees (direct and indirect reports) under that manager

        Example:
            >>> org_tree = org_service.build_org_tree()
            >>> ceo_org = org_tree[ceo.employee_id]  # All employees under CEO
            >>> len(ceo_org)  # Total employees reporting to CEO
            199

        Implementation:
            1. Build direct reports mapping
            2. Recursively traverse hierarchy to get all indirect reports
            3. Cache results for performance
        """
        if self._org_tree is not None:
            return self._org_tree

        # Build direct reports first
        direct_reports = self._build_direct_reports()

        # Recursively build full org tree (direct + indirect reports)
        org_tree: dict[int, list[Employee]] = {}

        def get_all_reports_recursive(
            manager_id: int, visited: set[int] | None = None
        ) -> list[Employee]:
            """Recursively get all employees under a manager.

            Args:
                manager_id: Employee ID of the manager
                visited: Set of already-visited manager IDs (prevents infinite loops)

            Returns:
                List of all employees (direct + indirect) reporting to this manager
            """
            if visited is None:
                visited = set()

            # Prevent circular references
            if manager_id in visited:
                return []

            visited.add(manager_id)

            all_reports = []

            # Get direct reports
            if manager_id in direct_reports:
                for emp in direct_reports[manager_id]:
                    all_reports.append(emp)
                    # Get their reports (indirect)
                    all_reports.extend(get_all_reports_recursive(emp.employee_id, visited))

            return all_reports

        # Build org tree for each manager
        for manager_id in direct_reports:
            org_tree[manager_id] = get_all_reports_recursive(manager_id)

        # Cache the result
        self._org_tree = org_tree
        return org_tree

    def _build_direct_reports(self) -> dict[int, list[Employee]]:
        """Build mapping of managers to their direct reports only.

        Returns:
            Dictionary mapping manager employee_ids to lists of direct reports

        Implementation:
            Handles manager references that may be employee names (from sample data)
            or employee IDs. Filters out self-managed employees and invalid references.
        """
        if self._direct_reports is not None:
            return self._direct_reports

        direct_reports: dict[int, list[Employee]] = {}

        for emp in self._employees:
            manager_identifier = emp.direct_manager

            # Skip if no manager or invalid manager reference
            if not manager_identifier or manager_identifier == "None":
                continue

            # Resolve manager identifier to employee ID
            # Handle both name-based (sample data) and ID-based references
            manager_id: int | None = None

            # Try to resolve as a name first (sample data uses names)
            if manager_identifier in self._name_to_ids:
                manager_id = self._resolve_manager_id(manager_identifier, emp)
            # If it's already an ID stored as string, convert it
            elif manager_identifier.isdigit():
                manager_id = int(manager_identifier)

            # Skip if we couldn't resolve the manager or manager doesn't exist
            if manager_id is None or manager_id not in self._employee_by_id:
                continue

            # Skip self-managed employees
            if manager_id == emp.employee_id:
                continue

            # Add to direct reports
            if manager_id not in direct_reports:
                direct_reports[manager_id] = []

            direct_reports[manager_id].append(emp)

        # Cache the result
        self._direct_reports = direct_reports
        return direct_reports

    def get_direct_reports(self, employee_id: int) -> list[Employee]:
        """Get only the direct reports of an employee.

        Args:
            employee_id: Employee ID of the manager

        Returns:
            List of employees who directly report to this employee

        Example:
            >>> direct_team = org_service.get_direct_reports(manager.employee_id)
            >>> len(direct_team)  # Number of direct reports
            5
        """
        direct_reports = self._build_direct_reports()
        return direct_reports.get(employee_id, [])

    def get_all_reports(self, employee_id: int) -> list[Employee]:
        """Get all reports (direct + indirect) of an employee.

        Args:
            employee_id: Employee ID of the manager

        Returns:
            List of all employees (direct and indirect) reporting to this employee

        Example:
            >>> all_team = org_service.get_all_reports(manager.employee_id)
            >>> len(all_team)  # Total org size under this manager
            25
        """
        org_tree = self.build_org_tree()
        return org_tree.get(employee_id, [])

    def get_reporting_chain(self, employee_id: int) -> list[int]:
        """Get the upward reporting chain from an employee to the CEO.

        Returns the chain of manager IDs from the employee's direct manager up to
        the CEO (root of the tree).

        Args:
            employee_id: Employee ID to get chain for

        Returns:
            List of manager employee IDs from direct manager to CEO (in order)

        Raises:
            ValueError: If employee_id not found in dataset

        Example:
            >>> chain = org_service.get_reporting_chain(employee.employee_id)
            >>> chain
            [manager_id, director_id, vp_id, ceo_id]
        """
        if employee_id not in self._employee_by_id:
            raise ValueError(f"Employee ID not found: {employee_id}")

        emp = self._employee_by_id[employee_id]

        # Build chain by following manager references
        chain = []
        visited_ids = set()  # Prevent circular references
        visited_names = set()  # Track manager names to detect cycles
        current_employee: Employee | None = emp

        while (
            current_employee
            and current_employee.direct_manager
            and current_employee.direct_manager != "None"
        ):
            # Prevent circular references
            if current_employee.direct_manager in visited_names:
                break
            visited_names.add(current_employee.direct_manager)

            # Resolve manager name to ID using context-aware logic
            manager_id = self._resolve_manager_id(current_employee.direct_manager, current_employee)

            if manager_id is None:
                # Manager not found or couldn't be resolved
                break

            # Prevent circular references by ID
            if manager_id in visited_ids:
                break
            visited_ids.add(manager_id)

            chain.append(manager_id)

            # Move up the chain
            current_employee = self._employee_by_id.get(manager_id)
            if not current_employee:
                break

        return chain

    def find_managers(self, min_team_size: int = 1) -> list[int]:
        """Find all employees who have at least N total employees reporting to them.

        Args:
            min_team_size: Minimum total team size (direct + indirect reports)

        Returns:
            List of employee IDs with team size >= min_team_size

        Example:
            >>> # Find managers with teams of 10+ employees
            >>> large_team_managers = org_service.find_managers(min_team_size=10)
            >>> len(large_team_managers)
            15
        """
        org_tree = self.build_org_tree()
        return [
            manager_id for manager_id, reports in org_tree.items() if len(reports) >= min_team_size
        ]

    def validate_structure(self) -> OrgValidationResult:
        """Validate the organizational structure for consistency and correctness.

        Checks for:
        - Circular references (A reports to B, B reports to A)
        - Orphaned employees (manager doesn't exist in dataset)
        - Self-managed employees (manager is themselves)

        Returns:
            OrgValidationResult with validation status and any issues found

        Example:
            >>> result = org_service.validate_structure()
            >>> if not result.is_valid:
            ...     print(f"Errors: {result.errors}")
        """
        errors = []
        circular_refs = []
        orphaned = []

        # Check each employee
        for emp in self._employees:
            manager = emp.direct_manager

            if not manager or manager == "None":
                continue  # CEO or no manager is valid

            # Resolve manager name to ID
            if manager in self._name_to_ids:
                manager_id = self._resolve_manager_id(manager, emp)
                if manager_id is None:
                    # Could not resolve (e.g., self-management case)
                    errors.append(f"Employee {emp.name} (ID: {emp.employee_id}) is self-managed")
                    circular_refs.append(emp.employee_id)
                    continue
            else:
                # Manager doesn't exist in dataset
                errors.append(
                    f"Employee {emp.name} (ID: {emp.employee_id}) has invalid manager reference: {manager}"
                )
                orphaned.append(emp.employee_id)
                continue

            # Check for circular references by following the chain
            # A cycle exists if any manager appears twice in the chain
            chain = self.get_reporting_chain(emp.employee_id)
            if len(chain) != len(set(chain)):
                # Find duplicate IDs to report in error message
                duplicates = [id for id in set(chain) if chain.count(id) > 1]
                errors.append(
                    f"Circular reference detected: {emp.name} (ID: {emp.employee_id}) "
                    f"has duplicate managers in chain: {duplicates}"
                )
                circular_refs.append(emp.employee_id)

        is_valid = len(errors) == 0

        return OrgValidationResult(
            is_valid=is_valid,
            circular_references=circular_refs,
            orphaned_employees=orphaned,
            errors=errors,
        )

    def get_employee_by_id(self, employee_id: int) -> Employee | None:
        """Get an employee by their ID.

        Args:
            employee_id: Employee ID to look up

        Returns:
            Employee object or None if not found

        Example:
            >>> emp = org_service.get_employee_by_id(123)
            >>> emp.name
            'Alice Smith'
        """
        return self._employee_by_id.get(employee_id)

    def get_employee_by_name(self, name: str) -> Employee | None:
        """Get an employee by their name.

        Note: If multiple employees have the same name, this returns one arbitrary
        employee. Use get_employee_by_id() for unambiguous lookups.

        Args:
            name: Employee name to look up

        Returns:
            Employee object or None if not found

        Example:
            >>> emp = org_service.get_employee_by_name("Alice Smith")
            >>> emp.employee_id
            123
        """
        employee_ids = self._name_to_ids.get(name)
        if employee_ids:
            employee_id = employee_ids[0]
            return self._employee_by_id.get(employee_id)
        return None
