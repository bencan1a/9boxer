"""Tests for PII anonymization in data packaging service.

These tests verify that package_for_llm() properly excludes PII while
package_for_ui() includes all fields for frontend display.
"""

import json
from datetime import date

import pytest

from ninebox.models.employee import Employee, PerformanceLevel, PotentialLevel


pytestmark = pytest.mark.unit


def create_employee(
    emp_id: int,
    location: str = "USA",
    function: str = "Engineering",
    level: str = "MT5",
    tenure: str = "2-5 years",
    performance: PerformanceLevel = PerformanceLevel.MEDIUM,
    potential: PotentialLevel = PotentialLevel.MEDIUM,
    grid_position: int = 5,
    manager: str = "Test Manager",
    flags: list[str] | None = None,
) -> Employee:
    """Create a test employee with specified attributes."""
    return Employee(
        employee_id=emp_id,
        name=f"Employee {emp_id}",
        business_title="Test Title",
        job_title="Test Job",
        job_profile=f"{function}-{location}",
        job_level=level,
        job_function=function,
        location=location,
        direct_manager=manager,
        hire_date=date(2020, 1, 1),
        tenure_category=tenure,
        time_in_job_profile="1-2 years",
        performance=performance,
        potential=potential,
        grid_position=grid_position,
        talent_indicator="Test Indicator",
        flags=flags,
    )


class TestPIIAnonymizationLLM:
    """Tests for PII exclusion in package_for_llm()."""

    def test_package_for_llm_excludes_employee_id(self) -> None:
        """Test that package_for_llm() excludes employee_id field."""
        from ninebox.services.data_packaging_service import package_for_llm

        employees = [
            create_employee(1001, location="USA", flags=["promotion_ready"]),
            create_employee(2002, location="UK", flags=["flight_risk"]),
        ]

        result = package_for_llm(employees, {})

        # package_for_llm returns flagged_employees, not all employees
        # Check that employee_id is NOT present in flagged employee records
        for emp in result["flagged_employees"]:
            assert "employee_id" not in emp, "employee_id should be excluded from LLM package"
            assert "id" in emp, "Anonymized id should be present"
            assert emp["id"].startswith("Employee_"), "ID should be anonymized"

    def test_package_for_llm_excludes_business_title(self) -> None:
        """Test that package_for_llm() excludes business_title field."""
        from ninebox.services.data_packaging_service import package_for_llm

        employees = [create_employee(1, location="USA", flags=["promotion_ready"])]

        result = package_for_llm(employees, {})

        # Check that business_title is NOT present in flagged employees
        for emp in result["flagged_employees"]:
            assert "business_title" not in emp, "business_title should be excluded from LLM package"

    def test_package_for_llm_excludes_job_title(self) -> None:
        """Test that package_for_llm() excludes job_title field."""
        from ninebox.services.data_packaging_service import package_for_llm

        employees = [create_employee(1, location="USA", flags=["promotion_ready"])]

        result = package_for_llm(employees, {})

        # Check that job_title is NOT present in flagged employees
        for emp in result["flagged_employees"]:
            assert "job_title" not in emp, "job_title should be excluded from LLM package"

    def test_package_for_llm_excludes_manager_id(self) -> None:
        """Test that package_for_llm() excludes manager_id field from employee records."""
        from ninebox.services.data_packaging_service import package_for_llm

        employees = [create_employee(1, manager="Alice", flags=["promotion_ready"])]

        result = package_for_llm(employees, {})

        # Check that manager_id is NOT present in flagged employees
        for emp in result["flagged_employees"]:
            assert "manager_id" not in emp, "manager_id should be excluded from LLM package"

    def test_package_for_llm_excludes_manager_names_in_org(self) -> None:
        """Test that package_for_llm() excludes real manager names from org hierarchy."""
        from ninebox.services.data_packaging_service import package_for_llm

        # Create employees with manager relationships
        employees = [
            create_employee(1, manager="Alice"),
            create_employee(2, manager="Alice"),
            create_employee(3, manager="Alice"),
        ]

        result = package_for_llm(employees, {})

        # Check that manager names are NOT present in org data
        if "organization" in result and "managers" in result["organization"]:
            for manager in result["organization"]["managers"]:
                assert "name" not in manager, "Real manager names should be excluded from LLM package"

    def test_package_for_llm_excludes_manager_id_in_org(self) -> None:
        """Test that package_for_llm() excludes real manager IDs from org hierarchy."""
        from ninebox.services.data_packaging_service import package_for_llm

        employees = [
            create_employee(1, manager="Alice"),
            create_employee(2, manager="Alice"),
        ]

        result = package_for_llm(employees, {})

        # Check that real manager_id is NOT present
        if "organization" in result and "managers" in result["organization"]:
            for manager in result["organization"]["managers"]:
                assert "manager_id" not in manager, "Real manager IDs should be excluded from LLM package"

    def test_package_for_llm_excludes_direct_report_ids(self) -> None:
        """Test that package_for_llm() excludes real direct report IDs from org hierarchy."""
        from ninebox.services.data_packaging_service import package_for_llm

        employees = [
            create_employee(1, manager="Alice"),
            create_employee(2, manager="Alice"),
        ]

        result = package_for_llm(employees, {})

        # Check that direct_reports with real IDs are NOT present
        if "organization" in result and "managers" in result["organization"]:
            for manager in result["organization"]["managers"]:
                assert (
                    "direct_reports" not in manager
                ), "Real direct report IDs should be excluded from LLM package"

    def test_package_for_llm_includes_safe_fields(self) -> None:
        """Test that package_for_llm() includes safe, non-PII fields in flagged employees."""
        from ninebox.services.data_packaging_service import package_for_llm

        employees = [
            create_employee(
                1,
                location="USA",
                function="Engineering",
                level="MT5",
                performance=PerformanceLevel.HIGH,
                grid_position=9,
                flags=["promotion_ready"],
            )
        ]

        result = package_for_llm(employees, {})

        # package_for_llm only includes flagged employees individually
        emp = result["flagged_employees"][0]

        # These fields SHOULD be present (safe for LLM)
        assert "id" in emp
        assert "level" in emp
        assert "function" in emp
        assert "location" in emp
        assert "grid_position" in emp
        assert "tenure_years" in emp

    def test_anonymized_ids_are_consistent(self) -> None:
        """Test that anonymized employee IDs are deterministic and consistent in flagged employees."""
        from ninebox.services.data_packaging_service import package_for_llm

        employees = [
            create_employee(1001, flags=["promotion_ready"]),
            create_employee(2002, flags=["flight_risk"]),
            create_employee(3003, flags=["succession_candidate"]),
        ]

        result = package_for_llm(employees, {})

        # IDs should be Employee_1, Employee_2, Employee_3 for flagged employees
        assert result["flagged_employees"][0]["id"] == "Employee_1"
        assert result["flagged_employees"][1]["id"] == "Employee_2"
        assert result["flagged_employees"][2]["id"] == "Employee_3"

    def test_no_pii_leakage_in_json_string(self) -> None:
        """Test that real employee IDs don't leak into JSON serialization."""
        from ninebox.services.data_packaging_service import package_for_llm

        employees = [create_employee(123456)]

        result = package_for_llm(employees, {})

        json_str = json.dumps(result)

        # Real employee ID should not appear in JSON
        assert "123456" not in json_str, "Real employee ID should not appear in LLM package JSON"
        # package_for_llm uses level_breakdown, so we check for structure instead
        assert "level_breakdown" in json_str, "Level breakdown should appear in LLM package"


class TestPIIInclusionUI:
    """Tests for PII inclusion in package_for_ui()."""

    def test_package_for_ui_includes_employee_id(self) -> None:
        """Test that package_for_ui() includes employee_id field."""
        from ninebox.services.data_packaging_service import package_for_ui

        employees = [create_employee(1001)]

        result = package_for_ui(employees, {})

        # Check that employee_id IS present
        emp = result["employees"][0]
        assert "employee_id" in emp, "employee_id should be included in UI package"
        assert emp["employee_id"] == 1001

    def test_package_for_ui_includes_business_title(self) -> None:
        """Test that package_for_ui() includes business_title field."""
        from ninebox.services.data_packaging_service import package_for_ui

        employees = [create_employee(1)]

        result = package_for_ui(employees, {})

        emp = result["employees"][0]
        assert "business_title" in emp, "business_title should be included in UI package"
        assert emp["business_title"] == "Test Title"

    def test_package_for_ui_includes_job_title(self) -> None:
        """Test that package_for_ui() includes job_title field."""
        from ninebox.services.data_packaging_service import package_for_ui

        employees = [create_employee(1)]

        result = package_for_ui(employees, {})

        emp = result["employees"][0]
        assert "job_title" in emp, "job_title should be included in UI package"
        assert emp["job_title"] == "Test Job"

    def test_package_for_ui_includes_manager_id(self) -> None:
        """Test that package_for_ui() includes manager_id field."""
        from ninebox.services.data_packaging_service import package_for_ui

        employees = [create_employee(1, manager="Alice")]

        result = package_for_ui(employees, {})

        emp = result["employees"][0]
        assert "manager_id" in emp, "manager_id should be included in UI package"
        assert emp["manager_id"] == "Alice"

    def test_package_for_ui_includes_manager_names_in_org(self) -> None:
        """Test that package_for_ui() includes real manager names in org hierarchy."""
        from ninebox.services.data_packaging_service import package_for_ui

        employees = [
            create_employee(1, manager="Alice"),
            create_employee(2, manager="Alice"),
        ]

        result = package_for_ui(employees, {})

        # Check that manager names ARE present
        if "organization" in result and "managers" in result["organization"]:
            for manager in result["organization"]["managers"]:
                assert "name" in manager, "Real manager names should be included in UI package"
                assert "manager_id" in manager, "Real manager IDs should be included in UI package"

    def test_package_for_ui_includes_direct_report_ids(self) -> None:
        """Test that package_for_ui() includes real direct report IDs in org hierarchy."""
        from ninebox.services.data_packaging_service import package_for_ui

        employees = [
            create_employee(1, manager="Alice"),
            create_employee(2, manager="Alice"),
        ]

        result = package_for_ui(employees, {})

        # Check that direct_reports ARE present
        if "organization" in result and "managers" in result["organization"]:
            for manager in result["organization"]["managers"]:
                assert "direct_reports" in manager, "Direct reports should be included in UI package"
