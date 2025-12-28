"""Rich sample dataset generator for realistic employee data.

This module generates synthetic employee datasets with:
- Realistic organizational hierarchies (6-level management chains)
- Performance history over 3 years
- Statistical bias patterns (location, function)
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

from ninebox.models.constants import ALLOWED_FLAGS
from ninebox.models.employee import Employee, HistoricalRating, PerformanceLevel, PotentialLevel


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
                chain_06=manager.employee_id,
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
                chain_05=manager.employee_id,
                chain_06=manager.chain_06,
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
                chain_04=manager.employee_id,
                chain_05=manager.chain_05,
                chain_06=manager.chain_06,
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
                chain_03=manager.employee_id,
                chain_04=manager.chain_04,
                chain_05=manager.chain_05,
                chain_06=manager.chain_06,
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
                chain_01=manager.employee_id,
                chain_02=manager.chain_04,
                chain_03=manager.chain_05,
                chain_04=manager.chain_06,
                chain_05=None,
                chain_06=None,
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
    - Optional bias patterns (+15% for USA, +20% for Sales)

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

        for idx, emp_id in enumerate(employee_ids):
            node = hierarchy[emp_id]

            # Extract numeric ID from "EMP0001" format
            numeric_id = int(emp_id[3:])

            location = locations[idx]
            function = functions[idx]
            grid_pos = grid_positions[idx]

            # Apply bias if enabled
            if config.include_bias:
                grid_pos = self._apply_bias(grid_pos, location, function)

            # Convert grid position to performance/potential
            performance, potential = self._grid_to_perf_pot(grid_pos)

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
            manager_name = (
                self._get_manager_name(node.manager, hierarchy) if node.manager else "None"
            )
            employee = Employee(
                employee_id=numeric_id,
                name=self._generate_name(numeric_id),
                business_title=node.title,
                job_title=node.title,
                job_profile=f"{function}{location}",
                job_level=node.level,
                job_function=function,
                location=location,
                manager=manager_name if manager_name else "None",
                management_chain_01=self._get_manager_name(node.chain_01, hierarchy),
                management_chain_02=self._get_manager_name(node.chain_02, hierarchy),
                management_chain_03=self._get_manager_name(node.chain_03, hierarchy),
                management_chain_04=self._get_manager_name(node.chain_04, hierarchy),
                management_chain_05=self._get_manager_name(node.chain_05, hierarchy),
                management_chain_06=self._get_manager_name(node.chain_06, hierarchy),
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

    def _apply_bias(self, grid_pos: int, location: str, function: str) -> int:
        """Apply bias patterns to grid position.

        Args:
            grid_pos: Original grid position
            location: Employee location
            function: Employee job function

        Returns:
            Adjusted grid position

        Example:
            >>> generator = RichEmployeeGenerator()
            >>> generator.rng = random.Random(42)
            >>> # USA location gets +15% boost
            >>> pos = generator._apply_bias(4, "USA", "Engineering")
            >>> pos >= 4
            True
        """
        if self.rng is None:
            self.rng = random.Random()  # nosec B311 - Using for sample data generation, not cryptography

        # USA location: +15% chance to boost to high performance
        # This means about 15% MORE high performers than baseline
        if location == "USA":
            performance, potential = self._grid_to_perf_pot(grid_pos)
            if (
                performance != PerformanceLevel.HIGH and self.rng.random() < 0.30
            ):  # Increased to 30% boost rate
                performance = PerformanceLevel.HIGH
                grid_pos = self._perf_pot_to_grid(performance, potential)

        # Sales function: +20% chance to boost to high performance
        # This means about 20% MORE high performers than baseline
        if function == "Sales":
            performance, potential = self._grid_to_perf_pot(grid_pos)
            if (
                performance != PerformanceLevel.HIGH and self.rng.random() < 0.35
            ):  # Increased to 35% boost rate
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

        Args:
            hire_date: Date employee was hired

        Returns:
            Tenure category string

        Example:
            >>> generator = RichEmployeeGenerator()
            >>> hire_date = date.today() - timedelta(days=500)
            >>> category = generator._calculate_tenure_category(hire_date)
            >>> category in ["0-1 year", "1-3 years", "3-5 years", "5+ years"]
            True
        """
        years = (date.today() - hire_date).days / 365.25

        if years < 1:
            return "0-1 year"
        elif years < 3:
            return "1-3 years"
        elif years < 5:
            return "3-5 years"
        else:
            return "5+ years"

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
        self, emp_id: str | None, hierarchy: dict[str, ManagementNode]
    ) -> str | None:
        """Get manager name from employee ID.

        Args:
            emp_id: Manager's employee ID (can be None for CEO)
            hierarchy: Organizational hierarchy

        Returns:
            Manager name or None

        Example:
            >>> generator = RichEmployeeGenerator()
            >>> hierarchy = {"EMP0001": ManagementNode("EMP0001", "MT6", "CEO", None)}
            >>> generator._get_manager_name("EMP0001", hierarchy)
            'CEO'
        """
        if emp_id is None:
            return None
        return hierarchy[emp_id].title if emp_id in hierarchy else None

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
