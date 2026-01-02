"""Rich sample dataset generator for realistic employee data.

This module generates synthetic employee datasets with:
- Realistic organizational hierarchies (6-level management chains)
- Performance history over 3 years
- Statistical bias patterns (location, function, manager)
- Complete coverage of all grid positions and flags
- Reproducible results via seed parameter

Example:
    >>> from ninebox.services.sample_data_generator import generate_rich_dataset, RichDatasetConfig
    >>> # Generate 200 employees with default settings
    >>> employees = generate_rich_dataset()
    >>> len(employees)
    200
    >>> # Generate 100 employees with custom config
    >>> config = RichDatasetConfig(size=100, seed=42, include_bias=False)
    >>> employees = generate_rich_dataset(config)
    >>> len(employees)
    100
"""

import random  # nosec B311 - Using random for sample data generation, not cryptography
from dataclasses import dataclass, field
from datetime import date, timedelta
from enum import Enum

from ninebox.models.constants import ALLOWED_FLAGS
from ninebox.models.employee import Employee, HistoricalRating, PerformanceLevel, PotentialLevel


class ColumnCategory(str, Enum):
    """Category of column for organizational purposes."""

    IDENTITY = "identity"  # Core identification columns
    RATINGS = "ratings"  # Performance and potential ratings
    ORGANIZATION = "organization"  # Organizational hierarchy
    JOB_INFO = "job_info"  # Job-related information
    HISTORY = "history"  # Historical data
    TRACKING = "tracking"  # 9Boxer-added tracking columns
    DONUT = "donut"  # Donut exercise columns


@dataclass
class ColumnMetadata:
    """Metadata describing a single Excel column.

    Attributes:
        name: Exact column name as it appears in Excel (case-sensitive)
        data_type: Data type (string, integer, enum, date, boolean)
        description: Human-readable description of the column's purpose
        required: Whether this column is required for 9Boxer to function
        category: Category for organizational grouping
        valid_values: List of valid values for enum-type columns
        example: Example value for documentation
        used_for: Description of how 9Boxer uses this column

    Example:
        >>> col = ColumnMetadata(
        ...     name="Performance",
        ...     data_type="enum",
        ...     description="Current performance rating",
        ...     required=True,
        ...     category=ColumnCategory.RATINGS,
        ...     valid_values=["Low", "Medium", "High"],
        ...     example="High",
        ...     used_for="Determines horizontal position on the 9-box grid"
        ... )
    """

    name: str
    data_type: str
    description: str
    required: bool
    category: ColumnCategory
    valid_values: list[str] | None = None
    example: str | None = None
    used_for: str | None = None


def get_column_schema() -> list[ColumnMetadata]:
    """Get the complete column schema for 9Boxer Excel files.

    Returns a list of ColumnMetadata objects describing all columns that
    9Boxer recognizes, both for input (employee data) and output (tracking).

    This serves as the single source of truth for:
    - Documentation generation
    - Input validation
    - Export column definitions

    Returns:
        List of ColumnMetadata objects

    Example:
        >>> schema = get_column_schema()
        >>> required_cols = [c for c in schema if c.required]
        >>> [c.name for c in required_cols]
        ['Employee ID', 'Worker', 'Current Performance', 'Current Potential']
    """
    return [
        # Required Identity Columns
        ColumnMetadata(
            name="Employee ID",
            data_type="integer",
            description="Unique numeric identifier for each employee",
            required=True,
            category=ColumnCategory.IDENTITY,
            example="12345",
            used_for="Uniquely identifies employees across sessions; used for change tracking",
        ),
        ColumnMetadata(
            name="Worker",
            data_type="string",
            description="Employee's full name",
            required=True,
            category=ColumnCategory.IDENTITY,
            example="Alice Smith",
            used_for="Displayed on employee tiles and in the details panel",
        ),
        # Required Rating Columns
        ColumnMetadata(
            name="Current Performance",
            data_type="enum",
            description="Current performance rating",
            required=True,
            category=ColumnCategory.RATINGS,
            valid_values=["Low", "Medium", "High"],
            example="High",
            used_for="Determines horizontal position on the 9-box grid (left to right)",
        ),
        ColumnMetadata(
            name="Current Potential",
            data_type="enum",
            description="Growth capacity rating",
            required=True,
            category=ColumnCategory.RATINGS,
            valid_values=["Low", "Medium", "High"],
            example="Medium",
            used_for="Determines vertical position on the 9-box grid (bottom to top)",
        ),
        # Optional Job Info Columns
        ColumnMetadata(
            name="Job Profile",
            data_type="string",
            description="Combined field: <title>, <job function>-<location code>",
            required=False,
            category=ColumnCategory.JOB_INFO,
            example="Senior Software Engineer, Engineering-USA",
            used_for="Parsed to extract job function and location for filtering",
        ),
        ColumnMetadata(
            name="Job Level - Primary Position",
            data_type="string",
            description="Job level or grade designation",
            required=False,
            category=ColumnCategory.JOB_INFO,
            example="IC",
            used_for="Available as a filter option; displayed in employee details",
        ),
        ColumnMetadata(
            name="Business Title",
            data_type="string",
            description="Job title as shown in address book",
            required=False,
            category=ColumnCategory.JOB_INFO,
            example="Senior Software Engineer",
            used_for="Displayed in employee details panel",
        ),
        ColumnMetadata(
            name="Job Title",
            data_type="string",
            description="Official HRIS job title",
            required=False,
            category=ColumnCategory.JOB_INFO,
            example="Staff Engineer",
            used_for="Fallback if Business Title not available; displayed in details",
        ),
        ColumnMetadata(
            name="Hire Date",
            data_type="date",
            description="Employee's hire date",
            required=False,
            category=ColumnCategory.JOB_INFO,
            example="2022-03-15",
            used_for="Used to calculate tenure category if not provided",
        ),
        ColumnMetadata(
            name="Tenure Category",
            data_type="string",
            description="Bucketed tenure range based on hire date",
            required=False,
            category=ColumnCategory.JOB_INFO,
            valid_values=[
                "0 - 3 Months",
                "7 - 9 Months",
                "10 - 12 Months",
                "13 - 18 Months",
                "19 - 24 Months",
                "2 - 3 Years",
                "3 - 5 Years",
                "5 - 10 Years",
                "10 - 15 Years",
            ],
            example="2 - 3 Years",
            used_for="Available as a filter option for tenure-based analysis",
        ),
        ColumnMetadata(
            name="Time in Job Profile",
            data_type="string",
            description="Duration in current job profile",
            required=False,
            category=ColumnCategory.JOB_INFO,
            example="18 months",
            used_for="Displayed in employee details; useful for role stability analysis",
        ),
        # Organization Hierarchy Columns
        ColumnMetadata(
            name="Direct Manager",
            data_type="string",
            description="Direct manager's name",
            required=False,
            category=ColumnCategory.ORGANIZATION,
            example="David Chen",
            used_for="Available as a filter option to view specific manager's teams",
        ),
        ColumnMetadata(
            name="Management Chain - Level 04",
            data_type="string",
            description="Manager at level 4 in the hierarchy",
            required=False,
            category=ColumnCategory.ORGANIZATION,
            example="Sarah Johnson",
            used_for="Filter for viewing by skip-level manager",
        ),
        ColumnMetadata(
            name="Management Chain - Level 05",
            data_type="string",
            description="Manager at level 5 in the hierarchy",
            required=False,
            category=ColumnCategory.ORGANIZATION,
            example="Michael Brown",
            used_for="Filter for viewing by senior leadership",
        ),
        ColumnMetadata(
            name="Management Chain - Level 06",
            data_type="string",
            description="Manager at level 6 in the hierarchy (executive)",
            required=False,
            category=ColumnCategory.ORGANIZATION,
            example="Jennifer Lee",
            used_for="Filter for viewing by executive leadership",
        ),
        # Historical Rating Columns
        ColumnMetadata(
            name="2023 Completed Performance Rating",
            data_type="string",
            description="Performance rating from 2023 review cycle",
            required=False,
            category=ColumnCategory.HISTORY,
            example="High",
            used_for="Displayed in employee timeline to show rating trends",
        ),
        ColumnMetadata(
            name="2024 Completed Performance Rating",
            data_type="string",
            description="Performance rating from 2024 review cycle",
            required=False,
            category=ColumnCategory.HISTORY,
            example="Medium",
            used_for="Displayed in employee timeline to show rating trends",
        ),
        # 9Boxer Tracking Columns (added on export)
        ColumnMetadata(
            name="Modified in Session",
            data_type="boolean",
            description="Indicates if employee was moved during the session",
            required=False,
            category=ColumnCategory.TRACKING,
            valid_values=["Yes", ""],
            example="Yes",
            used_for="Added by 9Boxer on export; filter for changed employees",
        ),
        ColumnMetadata(
            name="Modification Date",
            data_type="datetime",
            description="Timestamp of the last rating change",
            required=False,
            category=ColumnCategory.TRACKING,
            example="2024-12-30 14:32:15",
            used_for="Added by 9Boxer on export; audit trail for compliance",
        ),
        ColumnMetadata(
            name="9Boxer Change Description",
            data_type="string",
            description="Human-readable description of the rating change",
            required=False,
            category=ColumnCategory.TRACKING,
            example="Moved from Core Talent [M,M] to Star [H,H]",
            used_for="Added by 9Boxer on export; documents what changed",
        ),
        ColumnMetadata(
            name="9Boxer Change Notes",
            data_type="string",
            description="User's notes explaining why the change was made",
            required=False,
            category=ColumnCategory.TRACKING,
            example="Promoted to team lead, exceeded Q4 targets",
            used_for="Added by 9Boxer on export; captures rationale for audit",
        ),
        # Donut Exercise Columns (added on export if Donut Mode used)
        ColumnMetadata(
            name="Donut Exercise Position",
            data_type="integer",
            description="Grid position (1-9) from donut exercise",
            required=False,
            category=ColumnCategory.DONUT,
            valid_values=["1", "2", "3", "4", "5", "6", "7", "8", "9"],
            example="9",
            used_for="Added by 9Boxer if Donut Mode used; exploratory placement",
        ),
        ColumnMetadata(
            name="Donut Exercise Label",
            data_type="string",
            description="Box label from donut exercise",
            required=False,
            category=ColumnCategory.DONUT,
            example="Star [H,H]",
            used_for="Added by 9Boxer if Donut Mode used; human-readable position",
        ),
        ColumnMetadata(
            name="Donut Exercise Change Description",
            data_type="string",
            description="Description of the donut placement",
            required=False,
            category=ColumnCategory.DONUT,
            example="Donut: Moved from Core Talent [M,M] to Star [H,H]",
            used_for="Added by 9Boxer if Donut Mode used; documents exploration",
        ),
        ColumnMetadata(
            name="Donut Exercise Notes",
            data_type="string",
            description="User's notes from the donut exercise",
            required=False,
            category=ColumnCategory.DONUT,
            example="Actually exceeds expectations, should be High Performer",
            used_for="Added by 9Boxer if Donut Mode used; captures thinking",
        ),
    ]


def get_column_schema_by_category() -> dict[str, list[ColumnMetadata]]:
    """Get column schema organized by category.

    Returns:
        Dictionary mapping category names to lists of ColumnMetadata

    Example:
        >>> schema_by_cat = get_column_schema_by_category()
        >>> list(schema_by_cat.keys())
        ['identity', 'ratings', 'organization', 'job_info', 'history', 'tracking', 'donut']
    """
    schema = get_column_schema()
    result: dict[str, list[ColumnMetadata]] = {}
    for col in schema:
        category_name = col.category.value
        if category_name not in result:
            result[category_name] = []
        result[category_name].append(col)
    return result


@dataclass
class ManagementNode:
    """Represents a node in the organizational hierarchy.

    Attributes:
        employee_id: Unique employee identifier
        level: Management level (MT1-MT6)
        title: Job title
        manager: Manager's employee_id (None for CEO)
        chain_01: Management chain level 1 (immediate manager)
        chain_02: Management chain level 2
        chain_03: Management chain level 3
        chain_04: Management chain level 4
        chain_05: Management chain level 5
        chain_06: Management chain level 6 (CEO)
    """

    employee_id: str
    level: str
    title: str
    manager: str | None = None
    chain_01: str | None = None
    chain_02: str | None = None
    chain_03: str | None = None
    chain_04: str | None = None
    chain_05: str | None = None
    chain_06: str | None = None


@dataclass
class RichDatasetConfig:
    """Configuration for rich dataset generation.

    Attributes:
        size: Number of employees to generate (default: 200)
        include_bias: Whether to include statistical bias patterns (default: True)
        seed: Random seed for reproducibility (default: None)
        locations: List of location codes to distribute employees across
        job_functions: List of job functions to distribute employees across

    Example:
        >>> config = RichDatasetConfig(size=100, seed=42, include_bias=False)
        >>> config.size
        100
        >>> config.include_bias
        False
    """

    size: int = 200
    include_bias: bool = True
    seed: int | None = None
    locations: list[str] = field(
        default_factory=lambda: ["USA", "CAN", "GBR", "DEU", "FRA", "IND", "AUS", "SGP"]
    )
    job_functions: list[str] = field(
        default_factory=lambda: [
            "Engineering",
            "Product Manager",
            "Sales",
            "Marketing",
            "Operations",
            "Designer",
            "Data Analyst",
            "HR",
        ]
    )


class ManagementChainBuilder:
    """Builds realistic organizational hierarchies.

    Creates a 6-level management hierarchy with:
    - CEO at MT6 level
    - VPs at MT5 level
    - Directors at MT4 level
    - Managers at MT3 level
    - Senior ICs at MT2 level
    - ICs at MT1 level

    Validates:
    - No orphaned employees (all have managers except CEO)
    - No circular reporting relationships
    - Span of control between 5-15 direct reports per manager
    - Complete management chains for all employees

    Example:
        >>> builder = ManagementChainBuilder()
        >>> hierarchy = builder.build_org_hierarchy(size=100, seed=42)
        >>> len(hierarchy)
        100
        >>> ceo = [n for n in hierarchy.values() if n.level == "MT6"]
        >>> len(ceo)
        1
    """

    def __init__(self) -> None:
        """Initialize the management chain builder."""
        self.rng: random.Random | None = None  # nosec B311

    def build_org_hierarchy(self, size: int, seed: int | None) -> dict[str, ManagementNode]:
        """Build organizational hierarchy with 6 levels.

        Args:
            size: Number of employees to create
            seed: Random seed for reproducibility

        Returns:
            Dictionary mapping employee_id to ManagementNode

        Raises:
            ValueError: If size is less than 6 (need at least one per level)

        Example:
            >>> builder = ManagementChainBuilder()
            >>> hierarchy = builder.build_org_hierarchy(size=50, seed=42)
            >>> all(node.manager is not None or node.level == "MT6" for node in hierarchy.values())
            True
        """
        if size < 6:
            raise ValueError("Size must be at least 6 to have all management levels")

        self.rng = random.Random(seed)  # nosec B311
        hierarchy: dict[str, ManagementNode] = {}

        # Calculate level distribution (pyramid: 40% MT1, 25% MT2, 20% MT3, 10% MT4, 4% MT5, 1% MT6)
        level_distribution = {
            "MT6": max(1, int(size * 0.01)),  # At least 1 CEO
            "MT5": max(1, int(size * 0.04)),  # VPs
            "MT4": max(1, int(size * 0.10)),  # Directors
            "MT3": max(1, int(size * 0.20)),  # Managers
            "MT2": max(1, int(size * 0.25)),  # Senior ICs
        }
        # Remaining are MT1
        level_distribution["MT1"] = size - sum(level_distribution.values())

        # Generate employees by level (top-down)
        employee_counter = 1

        # Level 6: CEO
        for _ in range(level_distribution["MT6"]):
            emp_id = f"EMP{employee_counter:04d}"
            hierarchy[emp_id] = ManagementNode(
                employee_id=emp_id,
                level="MT6",
                title=self._get_title("MT6"),
                manager=None,
            )
            employee_counter += 1

        # Level 5: VPs (report to CEO)
        ceos = [n for n in hierarchy.values() if n.level == "MT6"]
        for _ in range(level_distribution["MT5"]):
            emp_id = f"EMP{employee_counter:04d}"
            manager = self.rng.choice(ceos)
            hierarchy[emp_id] = ManagementNode(
                employee_id=emp_id,
                level="MT5",
                title=self._get_title("MT5"),
                manager=manager.employee_id,
                chain_01=manager.employee_id,  # CEO is direct manager
            )
            employee_counter += 1

        # Level 4: Directors (report to VPs)
        vps = [n for n in hierarchy.values() if n.level == "MT5"]
        for _ in range(level_distribution["MT4"]):
            emp_id = f"EMP{employee_counter:04d}"
            manager = self.rng.choice(vps)
            hierarchy[emp_id] = ManagementNode(
                employee_id=emp_id,
                level="MT4",
                title=self._get_title("MT4"),
                manager=manager.employee_id,
                chain_01=manager.employee_id,  # VP is direct manager
                chain_02=manager.chain_01,  # CEO from VP's chain
            )
            employee_counter += 1

        # Level 3: Managers (report to Directors)
        directors = [n for n in hierarchy.values() if n.level == "MT4"]
        for _ in range(level_distribution["MT3"]):
            emp_id = f"EMP{employee_counter:04d}"
            manager = self.rng.choice(directors)
            hierarchy[emp_id] = ManagementNode(
                employee_id=emp_id,
                level="MT3",
                title=self._get_title("MT3"),
                manager=manager.employee_id,
                chain_01=manager.employee_id,  # Director is direct manager
                chain_02=manager.chain_01,  # VP from Director's chain
                chain_03=manager.chain_02,  # CEO from Director's chain
            )
            employee_counter += 1

        # Level 2: Senior ICs (report to Managers)
        managers = [n for n in hierarchy.values() if n.level == "MT3"]
        for _ in range(level_distribution["MT2"]):
            emp_id = f"EMP{employee_counter:04d}"
            manager = self.rng.choice(managers)
            hierarchy[emp_id] = ManagementNode(
                employee_id=emp_id,
                level="MT2",
                title=self._get_title("MT2"),
                manager=manager.employee_id,
                chain_01=manager.employee_id,  # Manager is direct manager
                chain_02=manager.chain_01,  # Director from Manager's chain
                chain_03=manager.chain_02,  # VP from Manager's chain
                chain_04=manager.chain_03,  # CEO from Manager's chain
            )
            employee_counter += 1

        # Level 1: ICs (report to Managers)
        for _ in range(level_distribution["MT1"]):
            emp_id = f"EMP{employee_counter:04d}"
            manager = self.rng.choice(managers)
            hierarchy[emp_id] = ManagementNode(
                employee_id=emp_id,
                level="MT1",
                title=self._get_title("MT1"),
                manager=manager.employee_id,
                chain_01=manager.employee_id,  # Manager is direct manager
                chain_02=manager.chain_01,  # Director from Manager's chain
                chain_03=manager.chain_02,  # VP from Manager's chain
                chain_04=manager.chain_03,  # CEO from Manager's chain
            )
            employee_counter += 1

        return hierarchy

    def _get_title(self, level: str) -> str:
        """Get realistic job title for management level.

        Args:
            level: Management level (MT1-MT6)

        Returns:
            Realistic job title string

        Example:
            >>> builder = ManagementChainBuilder()
            >>> builder.rng = random.Random(42)
            >>> title = builder._get_title("MT6")
            >>> "CEO" in title or "Chief" in title
            True
        """
        if self.rng is None:
            self.rng = random.Random()  # nosec B311

        titles_by_level = {
            "MT6": ["CEO", "Chief Executive Officer"],
            "MT5": [
                "VP Engineering",
                "VP Product",
                "VP Sales",
                "VP Marketing",
                "VP Operations",
                "SVP Technology",
            ],
            "MT4": [
                "Director of Engineering",
                "Senior Director Product",
                "Director Sales",
                "Director Marketing",
                "Director Operations",
            ],
            "MT3": [
                "Engineering Manager",
                "Product Manager",
                "Sales Manager",
                "Marketing Manager",
                "Operations Manager",
                "Team Lead",
            ],
            "MT2": [
                "Senior Software Engineer",
                "Staff Engineer",
                "Principal Product Manager",
                "Senior Sales Executive",
                "Senior Marketing Specialist",
            ],
            "MT1": [
                "Software Engineer",
                "Junior Engineer",
                "Product Analyst",
                "Sales Associate",
                "Marketing Specialist",
                "Operations Analyst",
                "Junior Designer",
                "Data Analyst",
            ],
        }

        return self.rng.choice(titles_by_level[level])


class PerformanceHistoryGenerator:
    """Generates realistic performance history over 3 years.

    Creates historical ratings with:
    - 80% of employees have complete 3-year history (if tenure allows)
    - 20% have gaps (new hires, incomplete data)
    - Variance in ratings (some improve, some decline, some stable)
    - Valid rating values: "Low", "Solid", "Strong", "Leading"

    Example:
        >>> generator = PerformanceHistoryGenerator(seed=42)
        >>> hire_date = date(2020, 1, 1)
        >>> history = generator.generate_history(1, hire_date, "Strong")
        >>> len(history)
        3
        >>> {h["year"] for h in history}
        {2023, 2024, 2025}
    """

    def __init__(self, seed: int | None = None) -> None:
        """Initialize the performance history generator.

        Args:
            seed: Random seed for reproducibility
        """
        self.rng = random.Random(seed)  # nosec B311 - Using for sample data generation, not cryptography
        self.valid_ratings = ["Low", "Solid", "Strong", "Leading"]

    def generate_history(
        self, employee_id: int, hire_date: date, current_rating: str
    ) -> list[dict]:
        """Generate performance history for an employee.

        Args:
            employee_id: Employee identifier (used for variance)
            hire_date: Date employee was hired
            current_rating: Current performance rating

        Returns:
            List of dictionaries with 'year' and 'rating' keys

        Example:
            >>> generator = PerformanceHistoryGenerator(seed=42)
            >>> history = generator.generate_history(1, date(2020, 1, 1), "Strong")
            >>> all("year" in h and "rating" in h for h in history)
            True
            >>> all(h["rating"] in ["Low", "Solid", "Strong", "Leading"] for h in history)
            True
        """
        history: list[dict] = []
        today = date.today()
        years_of_service = (today - hire_date).days / 365.25

        # Determine how many years of history to generate
        max_years = min(3, int(years_of_service))

        if max_years == 0:
            return history

        # 80% have complete history, 20% have gaps
        has_complete_history = self.rng.random() < 0.8

        years = [2023, 2024, 2025][-max_years:]

        if not has_complete_history and max_years > 1:
            # Remove random year(s)
            years_to_remove = self.rng.randint(1, max_years - 1)
            years = self.rng.sample(years, max_years - years_to_remove)
            years.sort()

        # Generate ratings with variance
        for year in years:
            if year == 2025:
                # Current year uses current rating
                rating = current_rating
            else:
                # Historical ratings vary
                rating = self._generate_rating_with_variance(current_rating, employee_id, year)

            history.append({"year": year, "rating": rating})

        return history

    def _generate_rating_with_variance(
        self, current_rating: str, employee_id: int, year: int
    ) -> str:
        """Generate a rating with variance from current rating.

        Args:
            current_rating: Current performance rating
            employee_id: Employee ID (for consistent variance)
            year: Year for the rating

        Returns:
            Historical rating string

        Example:
            >>> generator = PerformanceHistoryGenerator(seed=42)
            >>> rating = generator._generate_rating_with_variance("Strong", 1, 2024)
            >>> rating in ["Low", "Solid", "Strong", "Leading"]
            True
        """
        # Use employee_id and year for deterministic variance
        variance_seed = employee_id * 1000 + year
        local_rng = random.Random(variance_seed)  # nosec B311 - Using for sample data generation, not cryptography

        # 60% stay same, 20% improve, 20% decline
        change = local_rng.choices(["same", "improve", "decline"], weights=[0.6, 0.2, 0.2])[0]

        current_idx = self.valid_ratings.index(current_rating)

        if change == "improve" and current_idx < len(self.valid_ratings) - 1:
            return self.valid_ratings[current_idx + 1]
        elif change == "decline" and current_idx > 0:
            return self.valid_ratings[current_idx - 1]
        else:
            return current_rating


class RichEmployeeGenerator:
    """Generates rich employee datasets with realistic patterns.

    Creates datasets with:
    - Complete organizational hierarchy (via ManagementChainBuilder)
    - Performance history over 3 years (via PerformanceHistoryGenerator)
    - All 28 Excel columns populated
    - Even distribution across locations and job functions
    - Pyramid distribution for job levels
    - All 9 grid positions covered
    - All 8 flag types distributed (10-20% of employees)
    - Optional bias patterns:
      - USA location: +60% boost to high performance
      - Sales function: +65% boost to high performance
      - Engineering Manager: 50% high / 40% medium / 10% low (vs 20/70/10 baseline)
      - VP Product: 5% high / 75% medium / 20% low (vs 20/70/10 baseline)
      - Director Sales: 35% high / 60% medium / 5% low (vs 20/70/10 baseline)

    Example:
        >>> config = RichDatasetConfig(size=100, seed=42)
        >>> generator = RichEmployeeGenerator()
        >>> employees = generator.generate_dataset(config)
        >>> len(employees)
        100
        >>> all(emp.job_level in ["MT1", "MT2", "MT3", "MT4", "MT5", "MT6"] for emp in employees)
        True
    """

    def __init__(self) -> None:
        """Initialize the employee generator."""
        self.rng: random.Random | None = None
        self.mgmt_builder = ManagementChainBuilder()
        self.perf_history_gen: PerformanceHistoryGenerator | None = None

    def generate_dataset(self, config: RichDatasetConfig) -> list[Employee]:
        """Generate a rich dataset of employees.

        Args:
            config: Configuration for dataset generation

        Returns:
            List of Employee objects with complete data

        Example:
            >>> config = RichDatasetConfig(size=50, seed=42)
            >>> generator = RichEmployeeGenerator()
            >>> employees = generator.generate_dataset(config)
            >>> len(employees)
            50
            >>> all(isinstance(emp, Employee) for emp in employees)
            True
        """
        self.rng = random.Random(config.seed)  # nosec B311 - Using for sample data generation, not cryptography
        self.perf_history_gen = PerformanceHistoryGenerator(seed=config.seed)

        # Build organizational hierarchy
        hierarchy = self.mgmt_builder.build_org_hierarchy(config.size, config.seed)

        employees = []
        employee_ids = list(hierarchy.keys())

        # Distribute locations and functions evenly
        locations = (config.locations * (config.size // len(config.locations) + 1))[: config.size]
        functions = (config.job_functions * (config.size // len(config.job_functions) + 1))[
            : config.size
        ]
        self.rng.shuffle(locations)
        self.rng.shuffle(functions)

        # Ensure all grid positions are covered
        grid_positions = self._generate_grid_positions(config.size)

        # Generate flags (10-20% of employees)
        flags_list = self._generate_flags(config.size)

        # PASS 1: Generate names for all employees first
        # This allows us to reference actual employee names when setting manager fields
        employee_names: dict[str, str] = {}
        for emp_id in employee_ids:
            numeric_id = int(emp_id[3:])  # Extract from "EMP0001" format
            employee_names[emp_id] = self._generate_name(numeric_id)

        # PASS 2: Create Employee objects with correct manager names
        for idx, emp_id in enumerate(employee_ids):
            node = hierarchy[emp_id]

            # Extract numeric ID from "EMP0001" format
            numeric_id = int(emp_id[3:])

            location = locations[idx]
            function = functions[idx]
            grid_pos = grid_positions[idx]

            # Apply bias if enabled (pass manager employee ID for direct lookup)
            if config.include_bias:
                grid_pos = self._apply_bias(grid_pos, location, function, node.manager, hierarchy)

            # Convert grid position to performance/potential
            performance, potential = self._grid_to_perf_pot(grid_pos)

            # Get manager name for Employee object creation
            manager_name = (
                self._get_manager_name(node.manager, hierarchy, employee_names)
                if node.manager
                else "None"
            )

            # Generate hire date (random in last 7 years)
            days_ago = self.rng.randint(0, 7 * 365)
            hire_date = date.today() - timedelta(days=days_ago)

            # Generate tenure category
            tenure_category = self._calculate_tenure_category(hire_date)

            # Generate time in job profile
            time_in_profile = self._calculate_time_in_profile(hire_date)

            # Generate performance history
            current_rating = self._perf_to_rating(performance)
            ratings_history = [
                HistoricalRating(**r)
                for r in self.perf_history_gen.generate_history(
                    numeric_id, hire_date, current_rating
                )
            ]

            # Generate talent indicator
            talent_indicator = self._get_talent_indicator(performance, potential)

            # Create employee
            employee = Employee(
                employee_id=numeric_id,
                name=employee_names[emp_id],  # Use pre-generated name from Pass 1
                business_title=node.title,
                job_title=node.title,
                job_profile=f"{node.title}, {function}-{location}",
                job_level=node.level,
                job_function=function,
                location=location,
                direct_manager=manager_name if manager_name else "None",
                management_chain_01=self._get_manager_name(
                    node.chain_01, hierarchy, employee_names
                ),
                management_chain_02=self._get_manager_name(
                    node.chain_02, hierarchy, employee_names
                ),
                management_chain_03=self._get_manager_name(
                    node.chain_03, hierarchy, employee_names
                ),
                management_chain_04=self._get_manager_name(
                    node.chain_04, hierarchy, employee_names
                ),
                management_chain_05=self._get_manager_name(
                    node.chain_05, hierarchy, employee_names
                ),
                management_chain_06=self._get_manager_name(
                    node.chain_06, hierarchy, employee_names
                ),
                hire_date=hire_date,
                tenure_category=tenure_category,
                time_in_job_profile=time_in_profile,
                performance=performance,
                potential=potential,
                grid_position=grid_pos,
                talent_indicator=talent_indicator,
                ratings_history=ratings_history,
                development_focus=self._generate_development_focus(potential),
                development_action=self._generate_development_action(potential),
                notes=self._generate_notes(numeric_id),
                promotion_status=self._generate_promotion_status(performance, potential),
                flags=flags_list[idx],
                modified_in_session=False,
            )

            employees.append(employee)

        return employees

    def _generate_grid_positions(self, size: int) -> list[int]:
        """Generate grid positions ensuring all 9 are covered.

        Args:
            size: Number of employees

        Returns:
            List of grid positions (1-9)

        Example:
            >>> generator = RichEmployeeGenerator()
            >>> generator.rng = random.Random(42)
            >>> positions = generator._generate_grid_positions(100)
            >>> set(positions)
            {1, 2, 3, 4, 5, 6, 7, 8, 9}
        """
        if self.rng is None:
            self.rng = random.Random()  # nosec B311 - Using for sample data generation, not cryptography

        # Ensure all 9 positions appear at least once
        positions = list(range(1, 10))

        # Fill remaining with weighted distribution
        # Higher positions (top-right) should be less common
        weights = [0.05, 0.10, 0.15, 0.10, 0.20, 0.15, 0.05, 0.10, 0.10]  # Positions 1-9
        remaining = size - 9
        positions.extend(self.rng.choices(range(1, 10), weights=weights, k=remaining))

        self.rng.shuffle(positions)
        return positions

    def _generate_flags(self, size: int) -> list[list[str] | None]:
        """Generate flags for employees (10-20% coverage).

        Args:
            size: Number of employees

        Returns:
            List of flag lists or None

        Example:
            >>> generator = RichEmployeeGenerator()
            >>> generator.rng = random.Random(42)
            >>> flags = generator._generate_flags(100)
            >>> employees_with_flags = sum(1 for f in flags if f)
            >>> 10 <= employees_with_flags <= 20
            True
        """
        if self.rng is None:
            self.rng = random.Random()  # nosec B311 - Using for sample data generation, not cryptography

        flags_list: list[list[str] | None] = [None] * size

        # Ensure all flag types appear
        all_flags = list(ALLOWED_FLAGS)
        num_with_flags = self.rng.randint(int(size * 0.10), int(size * 0.20))

        # First, assign each flag type at least once
        for i, flag in enumerate(all_flags[:num_with_flags]):
            flags_list[i] = [flag]

        # Then randomly assign remaining
        for i in range(len(all_flags), num_with_flags):
            # Some employees can have multiple flags
            num_flags = self.rng.choices([1, 2, 3], weights=[0.7, 0.2, 0.1])[0]
            flags_list[i] = self.rng.sample(all_flags, k=num_flags)

        self.rng.shuffle(flags_list)
        return flags_list

    def _apply_bias(
        self,
        grid_pos: int,
        location: str,
        function: str,
        manager_emp_id: str | None,
        hierarchy: dict[str, ManagementNode],
    ) -> int:
        """Apply bias patterns to grid position.

        Args:
            grid_pos: Original grid position
            location: Employee location
            function: Employee job function
            manager_emp_id: Direct manager's employee ID (e.g., "EMP0001")
            hierarchy: Organizational hierarchy for looking up manager titles

        Returns:
            Adjusted grid position

        Example:
            >>> generator = RichEmployeeGenerator()
            >>> generator.rng = random.Random(42)
            >>> hierarchy = {"EMP0001": ManagementNode("EMP0001", "MT3", "Engineering Manager", None)}
            >>> pos = generator._apply_bias(4, "USA", "Engineering", "EMP0001", hierarchy)
            >>> pos >= 4
            True
        """
        if self.rng is None:
            self.rng = random.Random()  # nosec B311 - Using for sample data generation, not cryptography

        # Manager-specific bias patterns (applied first for priority)
        # These create anomalous rating distributions for testing manager analysis
        # We use the manager's employee ID to look up their job title from hierarchy
        if manager_emp_id and manager_emp_id in hierarchy:
            performance, potential = self._grid_to_perf_pot(grid_pos)

            # Get manager's job title directly from hierarchy (no reverse lookup needed!)
            manager_title = hierarchy[manager_emp_id].title

            if manager_title:
                # Engineering Manager: High bias (50% high, 40% medium, 10% low)
                # Target: 50% high performers (vs 20% baseline = +30% deviation)
                if "Engineering Manager" in manager_title:
                    # Force 50% to high, 40% to medium, 10% to low
                    rand_val = self.rng.random()
                    if rand_val < 0.50:  # 50% high
                        performance = PerformanceLevel.HIGH
                    elif rand_val < 0.90:  # 40% medium
                        performance = PerformanceLevel.MEDIUM
                    else:  # 10% low
                        performance = PerformanceLevel.LOW
                    grid_pos = self._perf_pot_to_grid(performance, potential)

                # VP Product: Low bias (5% high, 75% medium, 20% low)
                # Target: 5% high performers (vs 20% baseline = -15% deviation)
                elif "VP Product" in manager_title:
                    # Force 5% to high, 75% to medium, 20% to low
                    rand_val = self.rng.random()
                    if rand_val < 0.05:  # 5% high
                        performance = PerformanceLevel.HIGH
                    elif rand_val < 0.80:  # 75% medium
                        performance = PerformanceLevel.MEDIUM
                    else:  # 20% low
                        performance = PerformanceLevel.LOW
                    grid_pos = self._perf_pot_to_grid(performance, potential)

                # Director Sales: Medium-high bias (35% high, 60% medium, 5% low)
                # Target: 35% high performers (vs 20% baseline = +15% deviation)
                elif "Director Sales" in manager_title:
                    rand_val = self.rng.random()
                    if rand_val < 0.35:  # 35% high
                        performance = PerformanceLevel.HIGH
                    elif rand_val < 0.95:  # 60% medium
                        performance = PerformanceLevel.MEDIUM
                    else:  # 5% low
                        performance = PerformanceLevel.LOW
                    grid_pos = self._perf_pot_to_grid(performance, potential)

        # USA location: 60% boost rate to high performance
        # With 200 employees / 8 locations = 25 per location
        # Baseline ~44.5% high performers = 11 high performers
        # 60% boost of 14 non-high = 8.4 additional = 19-20 high performers total
        # This produces z-score >= 2.0 for statistical significance
        if location == "USA":
            performance, potential = self._grid_to_perf_pot(grid_pos)
            if performance != PerformanceLevel.HIGH and self.rng.random() < 0.60:  # 60% boost rate
                performance = PerformanceLevel.HIGH
                grid_pos = self._perf_pot_to_grid(performance, potential)

        # Sales function: 65% boost rate to high performance
        # With 200 employees / 8 functions = 25 per function
        # Baseline ~44.5% high performers = 11 high performers
        # 65% boost of 14 non-high = 9.1 additional = 20-21 high performers total
        # This produces z-score >= 2.0 for statistical significance
        if function == "Sales":
            performance, potential = self._grid_to_perf_pot(grid_pos)
            if performance != PerformanceLevel.HIGH and self.rng.random() < 0.65:  # 65% boost rate
                performance = PerformanceLevel.HIGH
                grid_pos = self._perf_pot_to_grid(performance, potential)

        return grid_pos

    def _grid_to_perf_pot(self, grid_pos: int) -> tuple[PerformanceLevel, PotentialLevel]:
        """Convert grid position to performance and potential levels.

        Args:
            grid_pos: Grid position (1-9)

        Returns:
            Tuple of (performance, potential) levels

        Example:
            >>> generator = RichEmployeeGenerator()
            >>> perf, pot = generator._grid_to_perf_pot(9)
            >>> (perf, pot)
            (<PerformanceLevel.HIGH: 'High'>, <PotentialLevel.HIGH: 'High'>)
        """
        perf_val = ((grid_pos - 1) % 3) + 1
        pot_val = ((grid_pos - 1) // 3) + 1

        perf_map = {1: PerformanceLevel.LOW, 2: PerformanceLevel.MEDIUM, 3: PerformanceLevel.HIGH}
        pot_map = {1: PotentialLevel.LOW, 2: PotentialLevel.MEDIUM, 3: PotentialLevel.HIGH}

        return perf_map[perf_val], pot_map[pot_val]

    def _perf_pot_to_grid(self, performance: PerformanceLevel, potential: PotentialLevel) -> int:
        """Convert performance and potential to grid position.

        Args:
            performance: Performance level
            potential: Potential level

        Returns:
            Grid position (1-9)

        Example:
            >>> generator = RichEmployeeGenerator()
            >>> pos = generator._perf_pot_to_grid(PerformanceLevel.HIGH, PotentialLevel.HIGH)
            >>> pos
            9
        """
        perf_val = {"Low": 1, "Medium": 2, "High": 3}[performance.value]
        pot_val = {"Low": 1, "Medium": 2, "High": 3}[potential.value]
        return (pot_val - 1) * 3 + perf_val

    def _perf_to_rating(self, performance: PerformanceLevel) -> str:
        """Convert performance level to rating string.

        Args:
            performance: Performance level

        Returns:
            Rating string ("Low", "Solid", "Strong", or "Leading")

        Example:
            >>> generator = RichEmployeeGenerator()
            >>> generator._perf_to_rating(PerformanceLevel.HIGH)
            'Strong'
        """
        mapping = {
            PerformanceLevel.LOW: "Low",
            PerformanceLevel.MEDIUM: "Solid",
            PerformanceLevel.HIGH: "Strong",
        }
        return mapping[performance]

    def _get_talent_indicator(
        self, performance: PerformanceLevel, potential: PotentialLevel
    ) -> str:
        """Get talent indicator based on performance and potential.

        Args:
            performance: Performance level
            potential: Potential level

        Returns:
            Talent indicator string

        Example:
            >>> generator = RichEmployeeGenerator()
            >>> generator._get_talent_indicator(PerformanceLevel.HIGH, PotentialLevel.HIGH)
            'High Potential'
        """
        if performance == PerformanceLevel.HIGH and potential == PotentialLevel.HIGH:
            return "High Potential"
        elif performance == PerformanceLevel.HIGH:
            return "High Impact"
        elif potential == PotentialLevel.HIGH:
            return "Growth"
        else:
            return "Solid Contributor"

    def _calculate_tenure_category(self, hire_date: date) -> str:
        """Calculate tenure category from hire date.

        Buckets match HR data format:
        - 0 - 3 Months
        - 7 - 9 Months (note: 4-6 months not in HR data, using 7-9)
        - 10 - 12 Months
        - 13 - 18 Months
        - 19 - 24 Months
        - 2 - 3 Years
        - 3 - 5 Years
        - 5 - 10 Years
        - 10 - 15 Years

        Args:
            hire_date: Date employee was hired

        Returns:
            Tenure category string matching HR bucket format

        Example:
            >>> generator = RichEmployeeGenerator()
            >>> hire_date = date.today() - timedelta(days=500)
            >>> category = generator._calculate_tenure_category(hire_date)
            >>> category in ["0 - 3 Months", "7 - 9 Months", "10 - 12 Months", "13 - 18 Months", "19 - 24 Months", "2 - 3 Years", "3 - 5 Years", "5 - 10 Years", "10 - 15 Years"]
            True
        """
        days = (date.today() - hire_date).days
        months = days / 30.44  # Average days per month

        if months < 3:
            return "0 - 3 Months"
        elif months < 7:
            # 4-6 months falls into 7-9 bucket (closest match)
            return "7 - 9 Months"
        elif months < 10:
            return "7 - 9 Months"
        elif months < 13:
            return "10 - 12 Months"
        elif months < 19:
            return "13 - 18 Months"
        elif months < 24:
            return "19 - 24 Months"
        elif months < 36:
            return "2 - 3 Years"
        elif months < 60:
            return "3 - 5 Years"
        elif months < 120:
            return "5 - 10 Years"
        else:
            return "10 - 15 Years"

    def _calculate_time_in_profile(self, hire_date: date) -> str:
        """Calculate time in job profile.

        Args:
            hire_date: Date employee was hired

        Returns:
            Time in profile string

        Example:
            >>> generator = RichEmployeeGenerator()
            >>> generator.rng = random.Random(42)
            >>> hire_date = date.today() - timedelta(days=1000)
            >>> profile_time = generator._calculate_time_in_profile(hire_date)
            >>> "year" in profile_time or "month" in profile_time
            True
        """
        if self.rng is None:
            self.rng = random.Random()  # nosec B311 - Using for sample data generation, not cryptography

        years = (date.today() - hire_date).days / 365.25
        # Time in profile is usually less than tenure
        profile_years = self.rng.uniform(0, years)

        if profile_years < 1:
            months = int(profile_years * 12)
            return f"{months} months"
        else:
            return f"{int(profile_years)} years"

    def _generate_name(self, _employee_id: int) -> str:
        """Generate employee name.

        Args:
            employee_id: Employee ID

        Returns:
            Full name string

        Example:
            >>> generator = RichEmployeeGenerator()
            >>> generator.rng = random.Random(42)
            >>> name = generator._generate_name(1)
            >>> " " in name
            True
        """
        if self.rng is None:
            self.rng = random.Random()  # nosec B311 - Using for sample data generation, not cryptography

        first_names = [
            "Alice",
            "Bob",
            "Carol",
            "David",
            "Eve",
            "Frank",
            "Grace",
            "Henry",
            "Iris",
            "Jack",
            "Karen",
            "Leo",
            "Mary",
            "Nathan",
            "Olivia",
            "Peter",
            "Quinn",
            "Rachel",
            "Steve",
            "Tina",
        ]
        last_names = [
            "Smith",
            "Johnson",
            "Williams",
            "Brown",
            "Jones",
            "Garcia",
            "Miller",
            "Davis",
            "Rodriguez",
            "Martinez",
            "Hernandez",
            "Lopez",
            "Gonzalez",
            "Wilson",
            "Anderson",
            "Thomas",
            "Taylor",
            "Moore",
            "Jackson",
            "Martin",
        ]

        first = self.rng.choice(first_names)
        last = self.rng.choice(last_names)
        return f"{first} {last}"

    def _get_manager_name(
        self,
        emp_id: str | None,
        _hierarchy: dict[str, ManagementNode],
        employee_names: dict[str, str],
    ) -> str | None:
        """Get manager name from employee ID.

        Args:
            emp_id: Manager's employee ID (can be None for CEO)
            hierarchy: Organizational hierarchy
            employee_names: Mapping of employee IDs to generated names

        Returns:
            Manager's actual employee name (not job title) or None

        Example:
            >>> generator = RichEmployeeGenerator()
            >>> hierarchy = {"EMP0001": ManagementNode("EMP0001", "MT6", "CEO", None)}
            >>> employee_names = {"EMP0001": "Alice Johnson"}
            >>> generator._get_manager_name("EMP0001", hierarchy, employee_names)
            'Alice Johnson'
        """
        if emp_id is None:
            return None
        return employee_names.get(emp_id)

    def _generate_development_focus(self, potential: PotentialLevel) -> str | None:
        """Generate development focus based on potential.

        Args:
            potential: Potential level

        Returns:
            Development focus string or None

        Example:
            >>> generator = RichEmployeeGenerator()
            >>> generator.rng = random.Random(42)
            >>> focus = generator._generate_development_focus(PotentialLevel.HIGH)
            >>> focus is not None
            True
        """
        if self.rng is None:
            self.rng = random.Random()  # nosec B311 - Using for sample data generation, not cryptography

        if potential == PotentialLevel.HIGH and self.rng.random() < 0.7:
            return self.rng.choice(
                [
                    "Leadership skills",
                    "Strategic thinking",
                    "Technical depth",
                    "Communication",
                    "Project management",
                ]
            )
        return None

    def _generate_development_action(self, potential: PotentialLevel) -> str | None:
        """Generate development action based on potential.

        Args:
            potential: Potential level

        Returns:
            Development action string or None

        Example:
            >>> generator = RichEmployeeGenerator()
            >>> generator.rng = random.Random(42)
            >>> action = generator._generate_development_action(PotentialLevel.HIGH)
            >>> action is not None
            True
        """
        if self.rng is None:
            self.rng = random.Random()  # nosec B311 - Using for sample data generation, not cryptography

        if potential == PotentialLevel.HIGH and self.rng.random() < 0.7:
            return self.rng.choice(
                [
                    "Executive coaching",
                    "Leadership training",
                    "Mentorship program",
                    "Stretch assignment",
                    "Cross-functional project",
                ]
            )
        return None

    def _generate_notes(self, _employee_id: int) -> str | None:
        """Generate notes for employee.

        Args:
            employee_id: Employee ID

        Returns:
            Notes string or None

        Example:
            >>> generator = RichEmployeeGenerator()
            >>> generator.rng = random.Random(42)
            >>> notes = generator._generate_notes(1)
            >>> notes is None or isinstance(notes, str)
            True
        """
        if self.rng is None:
            self.rng = random.Random()  # nosec B311 - Using for sample data generation, not cryptography

        # 20% of employees have notes
        if self.rng.random() < 0.2:
            return self.rng.choice(
                [
                    "Top performer",
                    "New hire, high potential",
                    "Needs improvement",
                    "Strong technical skills",
                    "Great team player",
                ]
            )
        return None

    def _generate_promotion_status(
        self, performance: PerformanceLevel, potential: PotentialLevel
    ) -> str | None:
        """Generate promotion status based on performance and potential.

        Args:
            performance: Performance level
            potential: Potential level

        Returns:
            Promotion status string or None

        Example:
            >>> generator = RichEmployeeGenerator()
            >>> generator.rng = random.Random(42)
            >>> status = generator._generate_promotion_status(PerformanceLevel.HIGH, PotentialLevel.HIGH)
            >>> status is None or status in ["Ready now", "In consideration"]
            True
        """
        if self.rng is None:
            self.rng = random.Random()  # nosec B311 - Using for sample data generation, not cryptography

        if performance == PerformanceLevel.HIGH and potential == PotentialLevel.HIGH:
            if self.rng.random() < 0.5:
                return "Ready now"
        elif performance == PerformanceLevel.HIGH or potential == PotentialLevel.HIGH:
            if self.rng.random() < 0.3:
                return "In consideration"

        return None


def generate_rich_dataset(config: RichDatasetConfig | None = None) -> list[Employee]:
    """Generate a rich sample dataset with realistic patterns.

    This is the main entry point for generating sample employee data.
    Creates a complete dataset with:
    - Realistic organizational hierarchy (6 management levels)
    - Performance history over 3 years
    - Statistical bias patterns (if enabled)
    - Complete coverage of grid positions and flags
    - Reproducible results via seed parameter

    Args:
        config: Configuration for dataset generation (uses defaults if None)

    Returns:
        List of Employee objects with complete data

    Example:
        >>> # Generate 200 employees with defaults
        >>> employees = generate_rich_dataset()
        >>> len(employees)
        200
        >>> # Generate 100 employees with custom config
        >>> config = RichDatasetConfig(size=100, seed=42, include_bias=False)
        >>> employees = generate_rich_dataset(config)
        >>> len(employees)
        100
        >>> all(isinstance(emp, Employee) for emp in employees)
        True
    """
    if config is None:
        config = RichDatasetConfig()

    generator = RichEmployeeGenerator()
    return generator.generate_dataset(config)
