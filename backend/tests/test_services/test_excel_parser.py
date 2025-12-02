"""Tests for Excel parser service."""

from datetime import date
from pathlib import Path

import openpyxl
import pytest

from ninebox.models.employee import PerformanceLevel, PotentialLevel
from ninebox.services.excel_parser import ExcelParser


def test_parse_when_valid_file_then_returns_employees(sample_excel_file: Path) -> None:
    """Test parsing a valid Excel file."""
    parser = ExcelParser()
    employees = parser.parse(sample_excel_file)

    assert len(employees) == 5
    assert all(emp.employee_id > 0 for emp in employees)
    assert all(emp.name for emp in employees)


def test_parse_when_valid_file_then_extracts_employee_data_correctly(sample_excel_file: Path) -> None:
    """Test that employee data is extracted correctly."""
    parser = ExcelParser()
    employees = parser.parse(sample_excel_file)

    # Check first employee
    emp = employees[0]
    assert emp.employee_id == 1
    assert emp.name == "Alice Smith"
    assert emp.business_title == "Senior Engineer"
    assert emp.job_level == "MT4"
    assert emp.manager == "Bob Manager"
    assert emp.performance == PerformanceLevel.HIGH
    assert emp.potential == PotentialLevel.HIGH


def test_parse_when_valid_file_then_handles_historical_ratings(sample_excel_file: Path) -> None:
    """Test that historical ratings are parsed correctly."""
    parser = ExcelParser()
    employees = parser.parse(sample_excel_file)

    # First employee has 2 ratings
    emp = employees[0]
    assert len(emp.ratings_history) == 2
    assert emp.ratings_history[0].year == 2023
    assert emp.ratings_history[0].rating == "Strong"
    assert emp.ratings_history[1].year == 2024
    assert emp.ratings_history[1].rating == "Leading"

    # Second employee has 1 rating
    emp = employees[1]
    assert len(emp.ratings_history) == 1
    assert emp.ratings_history[0].year == 2024


def test_parse_when_valid_file_then_calculates_grid_positions_correctly(sample_excel_file: Path) -> None:
    """Test grid position calculation."""
    parser = ExcelParser()
    employees = parser.parse(sample_excel_file)

    # H,H = 9
    assert employees[0].grid_position == 9
    # M,M = 5
    assert employees[1].grid_position == 5
    # L,H = 3
    assert employees[2].grid_position == 3
    # H,M = 8
    assert employees[3].grid_position == 8
    # M,H = 6
    assert employees[4].grid_position == 6


def test_parse_when_valid_file_then_handles_optional_fields_gracefully(tmp_path: Path) -> None:
    """Test handling of missing optional fields."""
    # Create minimal Excel file
    file_path = tmp_path / "minimal.xlsx"
    workbook = openpyxl.Workbook()
    workbook.active.title = "Summary"
    data_sheet = workbook.create_sheet("Employee Data")

    headers = ["Employee ID", "Worker", "Business Title", "Job Level - Primary Position"]
    for col_idx, header in enumerate(headers, start=1):
        data_sheet.cell(1, col_idx, header)

    # Minimal employee data
    data_sheet.cell(2, 1, 1)
    data_sheet.cell(2, 2, "Test User")
    data_sheet.cell(2, 3, "Test Title")
    data_sheet.cell(2, 4, "MT1")

    workbook.save(file_path)

    parser = ExcelParser()
    employees = parser.parse(file_path)

    assert len(employees) == 1
    emp = employees[0]
    assert emp.employee_id == 1
    assert emp.name == "Test User"
    assert emp.development_focus is None
    assert emp.notes is None


def test_parse_when_invalid_file_format_then_raises_error(tmp_path: Path) -> None:
    """Test error on invalid file format."""
    # Create a text file instead of Excel
    file_path = tmp_path / "invalid.txt"
    file_path.write_text("This is not an Excel file")

    parser = ExcelParser()
    with pytest.raises(ValueError, match="Failed to read Excel file"):
        parser.parse(file_path)


def test_parse_when_missing_required_columns_then_raises_error(tmp_path: Path) -> None:
    """Test error when required columns are missing."""
    file_path = tmp_path / "missing_columns.xlsx"
    workbook = openpyxl.Workbook()
    workbook.active.title = "Summary"
    data_sheet = workbook.create_sheet("Employee Data")

    # Only add some headers
    data_sheet.cell(1, 1, "Employee ID")
    data_sheet.cell(1, 2, "Worker")
    # Missing "Business Title" and "Job Level - Primary Position"

    workbook.save(file_path)

    parser = ExcelParser()
    with pytest.raises(ValueError, match="Missing required columns"):
        parser.parse(file_path)


def test_parse_when_no_valid_employees_then_raises_error(tmp_path: Path) -> None:
    """Test error when no valid employees can be parsed."""
    file_path = tmp_path / "no_employees.xlsx"
    workbook = openpyxl.Workbook()
    workbook.active.title = "Summary"
    data_sheet = workbook.create_sheet("Employee Data")

    # Add headers but no data
    headers = ["Employee ID", "Worker", "Business Title", "Job Level - Primary Position"]
    for col_idx, header in enumerate(headers, start=1):
        data_sheet.cell(1, col_idx, header)

    workbook.save(file_path)

    parser = ExcelParser()
    with pytest.raises(ValueError, match="No valid employees found"):
        parser.parse(file_path)


def test_calculate_position_when_all_combinations_then_returns_correct_positions() -> None:
    """Test all 9 position calculations."""
    parser = ExcelParser()

    # Test all 9 combinations
    assert parser._calculate_position(PerformanceLevel.LOW, PotentialLevel.LOW) == 1
    assert parser._calculate_position(PerformanceLevel.LOW, PotentialLevel.MEDIUM) == 2
    assert parser._calculate_position(PerformanceLevel.LOW, PotentialLevel.HIGH) == 3
    assert parser._calculate_position(PerformanceLevel.MEDIUM, PotentialLevel.LOW) == 4
    assert parser._calculate_position(PerformanceLevel.MEDIUM, PotentialLevel.MEDIUM) == 5
    assert parser._calculate_position(PerformanceLevel.MEDIUM, PotentialLevel.HIGH) == 6
    assert parser._calculate_position(PerformanceLevel.HIGH, PotentialLevel.LOW) == 7
    assert parser._calculate_position(PerformanceLevel.HIGH, PotentialLevel.MEDIUM) == 8
    assert parser._calculate_position(PerformanceLevel.HIGH, PotentialLevel.HIGH) == 9


def test_get_position_label_when_all_combinations_then_returns_correct_labels() -> None:
    """Test position label generation."""
    parser = ExcelParser()

    assert parser._get_position_label(PerformanceLevel.HIGH, PotentialLevel.HIGH) == "Top Talent [H,H]"
    assert (
        parser._get_position_label(PerformanceLevel.HIGH, PotentialLevel.MEDIUM)
        == "High Impact Talent [H,M]"
    )
    assert parser._get_position_label(PerformanceLevel.HIGH, PotentialLevel.LOW) == "High/Low [H,L]"
    assert (
        parser._get_position_label(PerformanceLevel.MEDIUM, PotentialLevel.HIGH) == "Growth Talent [M,H]"
    )
    assert (
        parser._get_position_label(PerformanceLevel.MEDIUM, PotentialLevel.MEDIUM)
        == "Core Talent [M,M]"
    )
    assert parser._get_position_label(PerformanceLevel.MEDIUM, PotentialLevel.LOW) == "Med/Low [M,L]"
    assert (
        parser._get_position_label(PerformanceLevel.LOW, PotentialLevel.HIGH)
        == "Emerging Talent [L,H]"
    )
    assert (
        parser._get_position_label(PerformanceLevel.LOW, PotentialLevel.MEDIUM)
        == "Inconsistent Talent [L,M]"
    )
    assert parser._get_position_label(PerformanceLevel.LOW, PotentialLevel.LOW) == "Low/Low [L,L]"
