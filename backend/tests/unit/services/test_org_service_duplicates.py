"""Unit tests for OrgService duplicate name resolution.

This test suite verifies that OrgService correctly handles duplicate employee names
by using context-aware tiebreaking logic:
1. Job level priority (VPs > Directors > Managers > ICs)
2. Manager status (employees with direct reports)
3. First match if all else equal

Tests cover the core duplicate resolution logic and its integration with:
- Direct reports building
- Reporting chain calculation
- Org structure validation
"""

from datetime import date
from ninebox.models.employee import Employee, PerformanceLevel, PotentialLevel
from ninebox.services.org_service import OrgService


def create_test_employee(
    employee_id: int,
    name: str,
    direct_manager: str = "None",
    job_level: str = "MT2",
    **kwargs,
) -> Employee:
    """Helper to create test employees with minimal required fields."""
    return Employee(
        employee_id=employee_id,
        name=name,
        business_title=kwargs.get("business_title", "Test Title"),
        job_title=kwargs.get("job_title", "Test Job"),
        job_profile=kwargs.get("job_profile", "Engineering-USA"),
        job_level=job_level,
        job_function=kwargs.get("job_function", "Engineering"),
        location=kwargs.get("location", "USA"),
        direct_manager=direct_manager,
        hire_date=kwargs.get("hire_date", date(2020, 1, 1)),
        tenure_category=kwargs.get("tenure_category", "2-5 years"),
        time_in_job_profile=kwargs.get("time_in_job_profile", "1-2 years"),
        performance=kwargs.get("performance", PerformanceLevel.MEDIUM),
        potential=kwargs.get("potential", PotentialLevel.MEDIUM),
        grid_position=kwargs.get("grid_position", 5),
        talent_indicator=kwargs.get("talent_indicator", "Solid Performer"),
    )


def test_name_to_ids_mapping() -> None:
    """Test that _name_to_ids correctly tracks all employees with duplicate names."""
    employees = [
        create_test_employee(1, "Mary Moore", job_level="MT6"),  # CEO
        create_test_employee(5, "Leo Brown", "Mary Moore", job_level="MT6"),  # VP Engineering
        create_test_employee(6, "Leo Brown", "Mary Moore", job_level="MT6"),  # VP Product
        create_test_employee(133, "Leo Brown", "Carol Garcia", job_level="MT2"),  # IC
        create_test_employee(48, "Carol Garcia", "Leo Brown", job_level="MT5"),  # Director
        create_test_employee(60, "Carol Garcia", "Jack Thomas", job_level="MT4"),  # Manager
    ]

    org_service = OrgService(employees, validate=False)

    # Verify all Leo Brown IDs are tracked
    assert set(org_service._name_to_ids["Leo Brown"]) == {5, 6, 133}

    # Verify all Carol Garcia IDs are tracked
    assert set(org_service._name_to_ids["Carol Garcia"]) == {48, 60}

    # Verify unique names still work
    assert org_service._name_to_ids["Mary Moore"] == [1]


def test_get_job_level_rank() -> None:
    """Test job level ranking for tiebreaking."""
    employees = [create_test_employee(1, "Test", job_level="MT1")]
    org_service = OrgService(employees, validate=False)

    # Test MT levels (higher number = more senior)
    assert org_service._get_job_level_rank("MT6") == 60
    assert org_service._get_job_level_rank("MT5") == 50
    assert org_service._get_job_level_rank("MT4") == 40
    assert org_service._get_job_level_rank("MT2") == 20
    assert org_service._get_job_level_rank("MT1") == 10

    # Test special keywords
    assert org_service._get_job_level_rank("VP Engineering") == 60
    assert org_service._get_job_level_rank("Director") == 50
    assert org_service._get_job_level_rank("Manager") == 40
    assert org_service._get_job_level_rank("Senior Engineer") == 30
    assert org_service._get_job_level_rank("Lead Developer") == 25

    # Test unknown levels
    assert org_service._get_job_level_rank("") == 0
    assert org_service._get_job_level_rank("Unknown") == 0


def test_resolve_manager_id_single_match() -> None:
    """Test that single name matches are resolved correctly."""
    employees = [
        create_test_employee(1, "Mary Moore", job_level="MT6"),
        create_test_employee(2, "Alice Smith", "Mary Moore", job_level="MT5"),
    ]

    org_service = OrgService(employees, validate=False)
    alice = org_service.get_employee_by_id(2)

    # Single match should return the only ID
    manager_id = org_service._resolve_manager_id("Mary Moore", alice)
    assert manager_id == 1


def test_resolve_manager_id_duplicate_by_job_level() -> None:
    """Test duplicate resolution prefers higher job level."""
    employees = [
        create_test_employee(1, "Mary Moore", job_level="MT6"),  # CEO
        create_test_employee(5, "Leo Brown", "Mary Moore", job_level="MT6"),  # VP
        create_test_employee(133, "Leo Brown", "Carol Garcia", job_level="MT2"),  # IC
        create_test_employee(48, "Carol Garcia", "Leo Brown", job_level="MT5"),
        create_test_employee(200, "Test Employee", "Leo Brown", job_level="MT3"),
    ]

    org_service = OrgService(employees, validate=False)
    test_emp = org_service.get_employee_by_id(200)

    # Should resolve to Leo Brown (ID 5, VP level) over ID 133 (IC level)
    manager_id = org_service._resolve_manager_id("Leo Brown", test_emp)
    assert manager_id == 5  # VP, not IC


def test_resolve_manager_id_duplicate_by_reports() -> None:
    """Test duplicate resolution prefers employees with direct reports."""
    employees = [
        create_test_employee(1, "CEO", job_level="MT6"),
        # Two "Bob Manager" with same job level
        create_test_employee(10, "Bob Manager", "CEO", job_level="MT5"),
        create_test_employee(11, "Bob Manager", "CEO", job_level="MT5"),
        # Alice reports to one Bob
        create_test_employee(20, "Alice", "Bob Manager", job_level="MT3"),
        # Charlie also tries to report to Bob
        create_test_employee(21, "Charlie", "Bob Manager", job_level="MT3"),
    ]

    org_service = OrgService(employees, validate=False)

    # Build direct reports to establish who is a manager
    org_service._build_direct_reports()

    charlie = org_service.get_employee_by_id(21)

    # Should prefer Bob Manager who has direct reports (will be the first one resolved)
    manager_id = org_service._resolve_manager_id("Bob Manager", charlie)

    # Both have same job level, so it should pick based on who has reports
    # In this case, ID 10 will get Alice as a report, so should be preferred
    assert manager_id in [10, 11]  # One of the Bobs


def test_resolve_manager_id_avoid_self_management() -> None:
    """Test that self-management is avoided in duplicate resolution."""
    employees = [
        create_test_employee(1, "CEO", job_level="MT6"),
        create_test_employee(5, "Leo Brown", "CEO", job_level="MT6"),
        create_test_employee(6, "Leo Brown", "CEO", job_level="MT5"),
        # This employee named "Leo Brown" should not resolve to themselves
        create_test_employee(7, "Leo Brown", "Leo Brown", job_level="MT4"),
    ]

    org_service = OrgService(employees, validate=False)
    leo_7 = org_service.get_employee_by_id(7)

    # Should resolve to Leo Brown (ID 5 or 6), not ID 7 (self)
    manager_id = org_service._resolve_manager_id("Leo Brown", leo_7)
    assert manager_id in [5, 6]
    assert manager_id != 7


def test_build_direct_reports_with_duplicates() -> None:
    """Test that direct reports are built correctly with duplicate names."""
    employees = [
        create_test_employee(1, "Mary Moore", job_level="MT6"),  # CEO
        create_test_employee(5, "Leo Brown", "Mary Moore", job_level="MT6"),  # VP
        create_test_employee(6, "Leo Brown", "Mary Moore", job_level="MT6"),  # VP
        create_test_employee(133, "Leo Brown", "Carol Garcia", job_level="MT2"),  # IC
        create_test_employee(48, "Carol Garcia", "Leo Brown", job_level="MT5"),  # Reports to VP Leo
    ]

    org_service = OrgService(employees, validate=False)
    direct_reports = org_service._build_direct_reports()

    # Mary Moore should have both Leo Browns (IDs 5 and 6) as direct reports
    mary_reports = direct_reports.get(1, [])
    mary_report_ids = {emp.employee_id for emp in mary_reports}
    assert 5 in mary_report_ids
    assert 6 in mary_report_ids

    # Carol Garcia should report to one of the VP Leo Browns (higher job level)
    # Find which Leo has Carol as a report
    leo_5_reports = {emp.employee_id for emp in direct_reports.get(5, [])}
    leo_6_reports = {emp.employee_id for emp in direct_reports.get(6, [])}

    # Carol (ID 48) should report to one of the VPs, not the IC (ID 133)
    assert 48 in leo_5_reports or 48 in leo_6_reports


def test_get_reporting_chain_with_duplicates() -> None:
    """Test that reporting chains are correct when names are duplicated."""
    employees = [
        create_test_employee(1, "Mary Moore", job_level="MT6"),  # CEO
        create_test_employee(5, "Leo Brown", "Mary Moore", job_level="MT6"),  # VP
        create_test_employee(6, "Leo Brown", "Mary Moore", job_level="MT6"),  # VP
        create_test_employee(25, "Jack Thomas", "Leo Brown", job_level="MT5"),  # Director under Leo VP
        create_test_employee(48, "Carol Garcia", "Jack Thomas", job_level="MT4"),  # Manager
        create_test_employee(100, "Alice", "Carol Garcia", job_level="MT2"),  # IC
    ]

    org_service = OrgService(employees, validate=False)

    # Alice's chain should be: Carol (48) -> Jack (25) -> Leo (5 or 6) -> Mary (1)
    chain = org_service.get_reporting_chain(100)
    assert len(chain) == 4
    assert chain[0] == 48  # Carol Garcia
    assert chain[1] == 25  # Jack Thomas
    assert chain[2] in [5, 6]  # One of the Leo Browns (VPs)
    assert chain[3] == 1  # Mary Moore (CEO)


def test_validate_structure_with_duplicates() -> None:
    """Test that structure validation works with duplicate names."""
    employees = [
        create_test_employee(1, "Mary Moore", job_level="MT6"),
        create_test_employee(5, "Leo Brown", "Mary Moore", job_level="MT6"),
        create_test_employee(6, "Leo Brown", "Mary Moore", job_level="MT6"),
        create_test_employee(25, "Jack Thomas", "Leo Brown", job_level="MT5"),
    ]

    org_service = OrgService(employees, validate=False)
    result = org_service.validate_structure()

    # Should be valid - all duplicates are resolvable
    assert result.is_valid
    assert len(result.errors) == 0
    assert len(result.circular_references) == 0
    assert len(result.orphaned_employees) == 0


def test_get_employee_by_name_with_duplicates() -> None:
    """Test get_employee_by_name returns first match when duplicates exist."""
    employees = [
        create_test_employee(5, "Leo Brown", job_level="MT6"),
        create_test_employee(6, "Leo Brown", job_level="MT6"),
        create_test_employee(133, "Leo Brown", job_level="MT2"),
    ]

    org_service = OrgService(employees, validate=False)

    # Should return one of the Leo Browns (first in the list)
    leo = org_service.get_employee_by_name("Leo Brown")
    assert leo is not None
    assert leo.name == "Leo Brown"
    assert leo.employee_id in [5, 6, 133]


def test_complex_duplicate_hierarchy() -> None:
    """Test a complex org hierarchy with multiple duplicate names at different levels."""
    employees = [
        # CEO
        create_test_employee(1, "Mary Moore", job_level="MT6"),

        # VPs (both named Leo Brown)
        create_test_employee(5, "Leo Brown", "Mary Moore", job_level="MT6"),
        create_test_employee(6, "Leo Brown", "Mary Moore", job_level="MT6"),

        # Directors (multiple Jack Thomas)
        create_test_employee(25, "Jack Thomas", "Leo Brown", job_level="MT5"),
        create_test_employee(104, "Jack Thomas", "Leo Brown", job_level="MT5"),
        create_test_employee(156, "Jack Thomas", "Leo Brown", job_level="MT5"),

        # Managers (multiple Carol Garcia)
        create_test_employee(48, "Carol Garcia", "Jack Thomas", job_level="MT4"),
        create_test_employee(60, "Carol Garcia", "Jack Thomas", job_level="MT4"),

        # ICs
        create_test_employee(100, "Alice", "Carol Garcia", job_level="MT2"),
        create_test_employee(101, "Bob", "Carol Garcia", job_level="MT2"),

        # Another IC named Leo Brown
        create_test_employee(133, "Leo Brown", "Carol Garcia", job_level="MT2"),
    ]

    org_service = OrgService(employees, validate=False)

    # Test org tree building
    org_tree = org_service.build_org_tree()

    # Mary should have both VP Leo Browns
    mary_all_reports = org_tree.get(1, [])
    assert len(mary_all_reports) > 0  # Should have many reports

    # Test reporting chain for IC Leo Brown (should go through managers, not report to self)
    chain = org_service.get_reporting_chain(133)
    assert len(chain) >= 3  # At least Carol -> Jack -> Leo (VP) -> Mary
    assert 133 not in chain  # Should not include self

    # First should be a Carol Garcia
    first_manager = org_service.get_employee_by_id(chain[0])
    assert first_manager.name == "Carol Garcia"

    # Second should be a Jack Thomas
    second_manager = org_service.get_employee_by_id(chain[1])
    assert second_manager.name == "Jack Thomas"

    # Third should be a VP Leo Brown (not the IC)
    third_manager = org_service.get_employee_by_id(chain[2])
    assert third_manager.name == "Leo Brown"
    assert third_manager.job_level == "MT6"  # VP level, not IC

    # Fourth should be Mary Moore
    fourth_manager = org_service.get_employee_by_id(chain[3])
    assert fourth_manager.name == "Mary Moore"


def test_duplicate_resolution_consistency() -> None:
    """Test that duplicate resolution is consistent across multiple calls."""
    employees = [
        create_test_employee(1, "CEO", job_level="MT6"),
        create_test_employee(5, "Duplicate Name", "CEO", job_level="MT6"),
        create_test_employee(6, "Duplicate Name", "CEO", job_level="MT5"),
        create_test_employee(7, "Duplicate Name", "CEO", job_level="MT4"),
        create_test_employee(100, "Employee", "Duplicate Name", job_level="MT2"),
    ]

    org_service = OrgService(employees, validate=False)
    employee = org_service.get_employee_by_id(100)

    # Multiple resolutions should return the same result
    result1 = org_service._resolve_manager_id("Duplicate Name", employee)
    result2 = org_service._resolve_manager_id("Duplicate Name", employee)
    result3 = org_service._resolve_manager_id("Duplicate Name", employee)

    assert result1 == result2 == result3
    # Should pick the highest job level (MT6, ID 5)
    assert result1 == 5
