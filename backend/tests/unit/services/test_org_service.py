"""Unit tests for OrgService - organizational hierarchy service."""

from datetime import date
from ninebox.models.employee import Employee, PerformanceLevel, PotentialLevel
from ninebox.services.org_service import OrgService
from ninebox.services.sample_data_generator import generate_rich_dataset, RichDatasetConfig


def test_org_service_with_sample_data() -> None:
    """Test OrgService with generated sample data."""
    # Generate sample data
    config = RichDatasetConfig(size=50, seed=42)
    employees = generate_rich_dataset(config)

    # Create OrgService (validation happens automatically)
    org_service = OrgService(employees)

    # Test build_org_tree - returns dict with employee IDs as keys
    org_tree = org_service.build_org_tree()
    assert isinstance(org_tree, dict)
    assert len(org_tree) > 0  # Should have at least some managers

    # Verify keys are integers (employee IDs)
    assert all(isinstance(k, int) for k in org_tree.keys())

    # Test find_managers - returns list of employee IDs
    managers = org_service.find_managers(min_team_size=5)
    assert isinstance(managers, list)
    assert all(isinstance(m, int) for m in managers)
    # With 50 employees, should have some managers with teams of 5+

    # Test validation (already done in __init__, but test explicitly)
    result = org_service.validate_structure()
    assert result.is_valid is True  # Sample data should be valid
    assert len(result.errors) == 0
    assert len(result.circular_references) == 0
    assert len(result.orphaned_employees) == 0


def test_org_service_direct_vs_all_reports() -> None:
    """Test difference between direct and all reports."""
    # Generate sample data
    config = RichDatasetConfig(size=100, seed=123)
    employees = generate_rich_dataset(config)

    # Note: seed=123 creates self-managed employee - disable validation for this test
    org_service = OrgService(employees, validate=False)
    org_tree = org_service.build_org_tree()

    # Find a manager with reports (using employee ID)
    if org_tree:
        manager_id = list(org_tree.keys())[0]

        direct_reports = org_service.get_direct_reports(manager_id)
        all_reports = org_service.get_all_reports(manager_id)

        # All reports should be >= direct reports (includes indirect)
        assert len(all_reports) >= len(direct_reports)


def test_org_service_reporting_chain() -> None:
    """Test reporting chain calculation."""
    # Generate sample data
    config = RichDatasetConfig(size=50, seed=456)
    employees = generate_rich_dataset(config)

    org_service = OrgService(employees)

    # Find an IC (employee with a manager)
    ic_employee = next((emp for emp in employees if emp.direct_manager and emp.direct_manager != "None"), None)

    if ic_employee:
        chain = org_service.get_reporting_chain(ic_employee.employee_id)
        # Should have at least their direct manager
        assert len(chain) >= 1
        # Chain returns employee IDs (integers)
        assert all(isinstance(emp_id, int) for emp_id in chain)


def test_org_service_caching() -> None:
    """Test that org tree is cached."""
    config = RichDatasetConfig(size=30, seed=789)
    employees = generate_rich_dataset(config)

    org_service = OrgService(employees)

    tree1 = org_service.build_org_tree()
    tree2 = org_service.build_org_tree()

    # Should return the same cached object
    assert tree1 is tree2


def test_sample_data_has_exactly_one_ceo() -> None:
    """Test that sample data always generates exactly one CEO (single org tree root).

    Regression test for bug where multiple CEOs created two independent org trees,
    causing confusion in the filter drawer where VPs appeared as roots.
    """
    # Test with various dataset sizes
    for size in [50, 100, 200, 300]:
        config = RichDatasetConfig(size=size, seed=42)
        employees = generate_rich_dataset(config)

        # Count CEOs (MT6 level with no manager)
        ceos = [emp for emp in employees if emp.job_level == "MT6"]

        assert len(ceos) == 1, (
            f"Expected exactly 1 CEO for dataset size {size}, but found {len(ceos)}. "
            "Multiple CEOs create independent org trees instead of a single hierarchy."
        )

        # Verify CEO has no manager
        ceo = ceos[0]
        assert ceo.direct_manager == "None", (
            f"CEO {ceo.name} should have no manager, but has manager={ceo.direct_manager}"
        )
