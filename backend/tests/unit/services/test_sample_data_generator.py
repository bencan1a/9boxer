"""Unit tests for rich sample data generator."""

from datetime import date

import pytest
from scipy.stats import chi2_contingency

from ninebox.models.constants import ALLOWED_FLAGS
from ninebox.models.employee import Employee, PerformanceLevel
from ninebox.services.sample_data_generator import (
    ManagementChainBuilder,
    PerformanceHistoryGenerator,
    RichDatasetConfig,
    RichEmployeeGenerator,
    generate_rich_dataset,
)


class TestRichDatasetConfig:
    """Test configuration defaults and validation."""

    def test_default_config_when_created_then_has_expected_values(self) -> None:
        """Test default configuration values."""
        config = RichDatasetConfig()

        assert config.size == 200
        assert config.include_bias is True
        assert config.seed is None
        assert config.locations == ["USA", "CAN", "GBR", "DEU", "FRA", "IND", "AUS", "SGP"]
        assert config.job_functions == [
            "Engineering",
            "Product Manager",
            "Sales",
            "Marketing",
            "Operations",
            "Designer",
            "Data Analyst",
            "HR",
        ]

    def test_custom_config_when_created_then_has_custom_values(self) -> None:
        """Test custom configuration values."""
        config = RichDatasetConfig(
            size=100,
            include_bias=False,
            seed=42,
            locations=["USA", "CAN"],
            job_functions=["Engineering", "Sales"],
        )

        assert config.size == 100
        assert config.include_bias is False
        assert config.seed == 42
        assert config.locations == ["USA", "CAN"]
        assert config.job_functions == ["Engineering", "Sales"]


class TestManagementChainBuilder:
    """Test organization hierarchy building."""

    def test_build_org_hierarchy_when_small_org_then_has_all_levels(self) -> None:
        """Test small organization has all 6 levels."""
        builder = ManagementChainBuilder()
        hierarchy = builder.build_org_hierarchy(size=50, seed=42)

        # Get all unique levels
        levels = {node.level for node in hierarchy.values()}
        assert levels == {"MT1", "MT2", "MT3", "MT4", "MT5", "MT6"}

    def test_build_org_hierarchy_when_built_then_no_orphans(self) -> None:
        """Test all employees have managers except CEO."""
        builder = ManagementChainBuilder()
        hierarchy = builder.build_org_hierarchy(size=100, seed=42)

        # Find CEO (MT6)
        ceo = [node for node in hierarchy.values() if node.level == "MT6"]
        assert len(ceo) == 1
        assert ceo[0].manager is None

        # All others must have managers
        non_ceos = [node for node in hierarchy.values() if node.level != "MT6"]
        for node in non_ceos:
            assert node.manager is not None
            assert node.manager in hierarchy

    def test_build_org_hierarchy_when_built_then_no_cycles(self) -> None:
        """Test no circular reporting relationships."""
        builder = ManagementChainBuilder()
        hierarchy = builder.build_org_hierarchy(size=100, seed=42)

        # Check each employee's chain doesn't loop back
        for emp_id, node in hierarchy.items():
            visited = {emp_id}
            current = node.manager

            while current is not None:
                if current in visited:
                    pytest.fail(f"Cycle detected for employee {emp_id}")
                visited.add(current)
                current = hierarchy[current].manager if current in hierarchy else None

    def test_build_org_hierarchy_when_built_then_span_of_control_valid(self) -> None:
        """Test span of control is reasonable for managers."""
        builder = ManagementChainBuilder()
        hierarchy = builder.build_org_hierarchy(size=200, seed=42)

        # Count direct reports for each manager
        direct_reports: dict[str, int] = {}
        for node in hierarchy.values():
            if node.manager:
                direct_reports[node.manager] = direct_reports.get(node.manager, 0) + 1

        # Check managers have reasonable number of direct reports
        for manager_id, count in direct_reports.items():
            manager_level = hierarchy[manager_id].level
            # All managers should have at least 1 direct report
            assert count >= 1, f"Manager {manager_id} ({manager_level}) has {count} reports"
            # Most managers should have <= 20 direct reports (reasonable upper bound)
            assert count <= 20, f"Manager {manager_id} ({manager_level}) has {count} reports (too many)"

    def test_build_org_hierarchy_when_built_then_complete_chain(self) -> None:
        """Test all employees have appropriate management chains."""
        builder = ManagementChainBuilder()
        hierarchy = builder.build_org_hierarchy(size=100, seed=42)

        for emp_id, node in hierarchy.items():
            # CEO has no chain
            if node.level == "MT6":
                assert all(
                    getattr(node, f"chain_{i:02d}") is None for i in range(1, 7)
                ), f"CEO {emp_id} should have null chains"
            else:
                # All non-CEOs should have at least one chain entry (their manager)
                has_chain = any(getattr(node, f"chain_{i:02d}") is not None for i in range(1, 7))
                assert has_chain, f"{emp_id} ({node.level}) has no management chain"

                # Verify chain entries point to valid employees
                for i in range(1, 7):
                    chain_val = getattr(node, f"chain_{i:02d}")
                    if chain_val is not None:
                        assert chain_val in hierarchy, f"{emp_id} chain_{i:02d} points to non-existent {chain_val}"

    def test_build_org_hierarchy_when_built_then_realistic_titles(self) -> None:
        """Test titles are realistic for each level."""
        builder = ManagementChainBuilder()
        hierarchy = builder.build_org_hierarchy(size=100, seed=42)

        title_patterns = {
            "MT6": ["CEO", "Chief"],
            "MT5": ["VP", "Vice President", "SVP"],
            "MT4": ["Director"],
            "MT3": ["Manager", "Lead"],
            "MT2": ["Senior", "Staff", "Principal"],
            "MT1": ["Engineer", "Analyst", "Associate", "Specialist", "Designer", "Sales", "Marketing", "Operations"],
        }

        for node in hierarchy.values():
            patterns = title_patterns[node.level]
            assert any(
                pattern.lower() in node.title.lower() for pattern in patterns
            ), f"Title '{node.title}' doesn't match patterns for {node.level}"


class TestPerformanceHistoryGenerator:
    """Test performance history generation."""

    def test_generate_history_when_long_tenure_then_three_years(self) -> None:
        """Test employees with long tenure get 3 years of history."""
        generator = PerformanceHistoryGenerator(seed=42)
        hire_date = date(2020, 1, 1)  # 5 years ago
        current_rating = "Strong"

        history = generator.generate_history(1, hire_date, current_rating)

        assert len(history) == 3
        assert {h["year"] for h in history} == {2023, 2024, 2025}

    def test_generate_history_when_new_hire_then_partial_history(self) -> None:
        """Test new hires have partial or no history."""
        generator = PerformanceHistoryGenerator(seed=42)
        hire_date = date(2024, 6, 1)  # Less than 2 years
        current_rating = "Solid"

        history = generator.generate_history(1, hire_date, current_rating)

        # Should have 1-2 years max
        assert len(history) <= 2

    def test_generate_history_when_generated_then_has_variance(self) -> None:
        """Test ratings vary over time (not all the same)."""
        generator = PerformanceHistoryGenerator(seed=42)
        hire_date = date(2020, 1, 1)

        # Generate for multiple employees
        all_histories = [
            generator.generate_history(i, hire_date, "Strong") for i in range(1, 21)
        ]

        # At least some should have varying ratings
        has_variance = False
        for history in all_histories:
            if len(history) >= 2:
                ratings = [h["rating"] for h in history]
                if len(set(ratings)) > 1:
                    has_variance = True
                    break

        assert has_variance, "No variance in ratings detected"

    def test_generate_history_when_generated_then_valid_ratings(self) -> None:
        """Test all ratings are valid."""
        generator = PerformanceHistoryGenerator(seed=42)
        hire_date = date(2020, 1, 1)
        valid_ratings = {"Low", "Solid", "Strong", "Leading"}

        history = generator.generate_history(1, hire_date, "Strong")

        for rating_dict in history:
            assert rating_dict["rating"] in valid_ratings


class TestRichEmployeeGenerator:
    """Test dataset generation."""

    def test_generate_dataset_when_generated_then_correct_size(self) -> None:
        """Test dataset has correct number of employees."""
        config = RichDatasetConfig(size=100, seed=42)
        generator = RichEmployeeGenerator()

        employees = generator.generate_dataset(config)

        assert len(employees) == 100

    def test_generate_dataset_when_generated_then_all_columns_populated(self) -> None:
        """Test all 28 required columns are populated."""
        config = RichDatasetConfig(size=50, seed=42)
        generator = RichEmployeeGenerator()

        employees = generator.generate_dataset(config)

        # Check first employee has all required fields
        emp = employees[0]
        required_fields = [
            "employee_id",
            "name",
            "business_title",
            "job_title",
            "job_profile",
            "job_level",
            "job_function",
            "location",
            "manager",
            "hire_date",
            "tenure_category",
            "time_in_job_profile",
            "performance",
            "potential",
            "grid_position",
            "talent_indicator",
        ]

        for field in required_fields:
            assert hasattr(emp, field), f"Missing field: {field}"
            assert getattr(emp, field) is not None, f"Field {field} is None"

        # Management chain fields (at least some should be populated)
        has_chain = any(
            getattr(emp, f"management_chain_{i:02d}") is not None for i in range(1, 7)
        )
        assert has_chain or emp.job_level == "MT6", "No management chain found for non-CEO"

    def test_generate_dataset_when_generated_then_locations_distributed(self) -> None:
        """Test locations are distributed across config.locations."""
        config = RichDatasetConfig(size=200, seed=42)
        generator = RichEmployeeGenerator()

        employees = generator.generate_dataset(config)

        locations = [emp.location for emp in employees]
        unique_locations = set(locations)

        # All configured locations should be present
        assert unique_locations == set(config.locations)

        # Should be roughly even distribution (within 20% of expected)
        expected_per_location = len(employees) / len(config.locations)
        for location in config.locations:
            count = locations.count(location)
            assert 0.8 * expected_per_location <= count <= 1.2 * expected_per_location

    def test_generate_dataset_when_generated_then_functions_distributed(self) -> None:
        """Test job functions are distributed across config.job_functions."""
        config = RichDatasetConfig(size=200, seed=42)
        generator = RichEmployeeGenerator()

        employees = generator.generate_dataset(config)

        functions = [emp.job_function for emp in employees]
        unique_functions = set(functions)

        # All configured functions should be present
        assert unique_functions == set(config.job_functions)

        # Should be roughly even distribution
        expected_per_function = len(employees) / len(config.job_functions)
        for function in config.job_functions:
            count = functions.count(function)
            assert 0.8 * expected_per_function <= count <= 1.2 * expected_per_function

    def test_generate_dataset_when_generated_then_levels_pyramid(self) -> None:
        """Test job levels follow pyramid distribution."""
        config = RichDatasetConfig(size=200, seed=42)
        generator = RichEmployeeGenerator()

        employees = generator.generate_dataset(config)

        levels = [emp.job_level for emp in employees]
        level_counts = {level: levels.count(level) for level in ["MT1", "MT2", "MT3", "MT4", "MT5", "MT6"]}

        # Expected: 40% MT1, 25% MT2, 20% MT3, 10% MT4, 4% MT5, 1% MT6
        expected = {
            "MT1": 0.40 * 200,
            "MT2": 0.25 * 200,
            "MT3": 0.20 * 200,
            "MT4": 0.10 * 200,
            "MT5": 0.04 * 200,
            "MT6": 0.01 * 200,
        }

        # Allow 30% variance for small samples
        for level, exp_count in expected.items():
            actual_count = level_counts[level]
            assert 0.7 * exp_count <= actual_count <= 1.3 * exp_count, (
                f"Level {level}: expected ~{exp_count}, got {actual_count}"
            )

    def test_generate_dataset_when_generated_then_all_grid_positions_covered(self) -> None:
        """Test all 9 grid positions are represented."""
        config = RichDatasetConfig(size=200, seed=42)
        generator = RichEmployeeGenerator()

        employees = generator.generate_dataset(config)

        positions = {emp.grid_position for emp in employees}

        assert positions == {1, 2, 3, 4, 5, 6, 7, 8, 9}

    def test_generate_dataset_when_generated_then_all_flag_types_present(self) -> None:
        """Test all 8 flag types are distributed."""
        config = RichDatasetConfig(size=200, seed=42)
        generator = RichEmployeeGenerator()

        employees = generator.generate_dataset(config)

        # Collect all flags
        all_flags = set()
        for emp in employees:
            if emp.flags:
                all_flags.update(emp.flags)

        # All flag types should appear
        assert all_flags == ALLOWED_FLAGS

        # 10-20% of employees should have flags
        employees_with_flags = [emp for emp in employees if emp.flags]
        assert 0.10 * 200 <= len(employees_with_flags) <= 0.20 * 200

    def test_generate_dataset_when_generated_then_grid_position_matches_perf_pot(self) -> None:
        """Test grid position matches performance and potential levels."""
        config = RichDatasetConfig(size=100, seed=42)
        generator = RichEmployeeGenerator()

        employees = generator.generate_dataset(config)

        for emp in employees:
            perf_val = {"Low": 1, "Medium": 2, "High": 3}[emp.performance.value]
            pot_val = {"Low": 1, "Medium": 2, "High": 3}[emp.potential.value]
            expected_position = (pot_val - 1) * 3 + perf_val

            assert emp.grid_position == expected_position, (
                f"Employee {emp.employee_id}: performance={emp.performance}, "
                f"potential={emp.potential}, expected position={expected_position}, "
                f"actual={emp.grid_position}"
            )


class TestBiasPatterns:
    """Test statistical bias patterns."""

    def test_bias_when_usa_location_then_higher_performance(self) -> None:
        """Test USA location has higher proportion of high performers."""
        config = RichDatasetConfig(size=400, include_bias=True, seed=42)
        generator = RichEmployeeGenerator()

        employees = generator.generate_dataset(config)

        # Split by location
        usa_employees = [emp for emp in employees if emp.location == "USA"]
        non_usa_employees = [emp for emp in employees if emp.location != "USA"]

        # Count high performers
        usa_high = sum(1 for emp in usa_employees if emp.performance == PerformanceLevel.HIGH)
        non_usa_high = sum(1 for emp in non_usa_employees if emp.performance == PerformanceLevel.HIGH)

        # Chi-square test for independence
        usa_low_med = len(usa_employees) - usa_high
        non_usa_low_med = len(non_usa_employees) - non_usa_high

        contingency_table = [[usa_high, usa_low_med], [non_usa_high, non_usa_low_med]]
        _, p_value, _, _ = chi2_contingency(contingency_table)

        # Bias should be statistically significant (p < 0.05)
        assert p_value < 0.05, f"USA bias not significant: p={p_value}"

        # USA should have higher proportion of high performers
        usa_high_pct = usa_high / len(usa_employees)
        non_usa_high_pct = non_usa_high / len(non_usa_employees)
        assert usa_high_pct > non_usa_high_pct, (
            f"USA high performers: {usa_high_pct:.2%}, Non-USA: {non_usa_high_pct:.2%}"
        )

    def test_bias_when_sales_function_then_higher_performance(self) -> None:
        """Test Sales function has +20% high performers (chi-square test)."""
        config = RichDatasetConfig(size=300, include_bias=True, seed=42)
        generator = RichEmployeeGenerator()

        employees = generator.generate_dataset(config)

        # Split by function
        sales_employees = [emp for emp in employees if emp.job_function == "Sales"]
        non_sales_employees = [emp for emp in employees if emp.job_function != "Sales"]

        # Count high performers
        sales_high = sum(1 for emp in sales_employees if emp.performance == PerformanceLevel.HIGH)
        non_sales_high = sum(1 for emp in non_sales_employees if emp.performance == PerformanceLevel.HIGH)

        # Chi-square test
        sales_low_med = len(sales_employees) - sales_high
        non_sales_low_med = len(non_sales_employees) - non_sales_high

        contingency_table = [[sales_high, sales_low_med], [non_sales_high, non_sales_low_med]]
        _, p_value, _, _ = chi2_contingency(contingency_table)

        # Bias should be statistically significant
        assert p_value < 0.05, f"Sales bias not significant: p={p_value}"

        # Sales should have higher proportion of high performers
        sales_high_pct = sales_high / len(sales_employees)
        non_sales_high_pct = non_sales_high / len(non_sales_employees)
        assert sales_high_pct > non_sales_high_pct, (
            f"Sales high performers: {sales_high_pct:.2%}, Non-Sales: {non_sales_high_pct:.2%}"
        )

    def test_no_bias_when_disabled_then_even_distribution(self) -> None:
        """Test bias patterns are absent when include_bias=False."""
        config = RichDatasetConfig(size=300, include_bias=False, seed=42)
        generator = RichEmployeeGenerator()

        employees = generator.generate_dataset(config)

        # Check USA location
        usa_employees = [emp for emp in employees if emp.location == "USA"]
        non_usa_employees = [emp for emp in employees if emp.location != "USA"]

        usa_high = sum(1 for emp in usa_employees if emp.performance == PerformanceLevel.HIGH)
        non_usa_high = sum(1 for emp in non_usa_employees if emp.performance == PerformanceLevel.HIGH)

        usa_high_pct = usa_high / len(usa_employees) if usa_employees else 0
        non_usa_high_pct = non_usa_high / len(non_usa_employees) if non_usa_employees else 0

        # Should be roughly equal (within 10%)
        assert abs(usa_high_pct - non_usa_high_pct) < 0.10


class TestReproducibility:
    """Test seed reproducibility."""

    def test_reproducibility_when_same_seed_then_identical_datasets(self) -> None:
        """Test same seed produces identical datasets."""
        config1 = RichDatasetConfig(size=100, seed=42)
        config2 = RichDatasetConfig(size=100, seed=42)

        generator1 = RichEmployeeGenerator()
        generator2 = RichEmployeeGenerator()

        employees1 = generator1.generate_dataset(config1)
        employees2 = generator2.generate_dataset(config2)

        # Should be identical
        assert len(employees1) == len(employees2)

        for emp1, emp2 in zip(employees1, employees2, strict=True):
            assert emp1.employee_id == emp2.employee_id
            assert emp1.name == emp2.name
            assert emp1.job_level == emp2.job_level
            assert emp1.location == emp2.location
            assert emp1.job_function == emp2.job_function
            assert emp1.performance == emp2.performance
            assert emp1.potential == emp2.potential

    def test_reproducibility_when_different_seed_then_different_datasets(self) -> None:
        """Test different seeds produce different datasets."""
        config1 = RichDatasetConfig(size=100, seed=42)
        config2 = RichDatasetConfig(size=100, seed=123)

        generator1 = RichEmployeeGenerator()
        generator2 = RichEmployeeGenerator()

        employees1 = generator1.generate_dataset(config1)
        employees2 = generator2.generate_dataset(config2)

        # Should be different
        differences = 0
        for emp1, emp2 in zip(employees1, employees2, strict=True):
            if (
                emp1.job_level != emp2.job_level
                or emp1.location != emp2.location
                or emp1.performance != emp2.performance
            ):
                differences += 1

        assert differences > 20, "Datasets too similar despite different seeds"


class TestPublicAPI:
    """Test public API function."""

    def test_generate_rich_dataset_when_no_config_then_uses_defaults(self) -> None:
        """Test public API uses default config when none provided."""
        employees = generate_rich_dataset()

        assert len(employees) == 200  # Default size
        assert all(isinstance(emp, Employee) for emp in employees)

    def test_generate_rich_dataset_when_custom_config_then_uses_config(self) -> None:
        """Test public API respects custom config."""
        config = RichDatasetConfig(size=50, seed=42)
        employees = generate_rich_dataset(config)

        assert len(employees) == 50

    def test_generate_rich_dataset_when_called_then_returns_valid_employees(self) -> None:
        """Test public API returns valid Employee objects."""
        config = RichDatasetConfig(size=100, seed=42)
        employees = generate_rich_dataset(config)

        # All should be valid Employee objects
        assert all(isinstance(emp, Employee) for emp in employees)

        # Spot check one employee
        emp = employees[0]
        assert emp.employee_id > 0
        assert emp.name
        assert emp.job_level in ["MT1", "MT2", "MT3", "MT4", "MT5", "MT6"]
        assert emp.performance in [PerformanceLevel.LOW, PerformanceLevel.MEDIUM, PerformanceLevel.HIGH]
        assert 1 <= emp.grid_position <= 9
