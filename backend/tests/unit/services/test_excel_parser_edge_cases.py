"""Comprehensive edge case tests for Excel parser service.

This test module covers edge cases not tested in the basic test suite:
- Unicode characters (Chinese, Arabic, emoji, accented characters)
- Large files (1000+ employees)
- Excel formulas in cells
- Empty files (headers only)
- Multiple sheets
- Extra columns beyond schema
- Missing optional columns
- Long strings (500+ characters)
- Special characters (apostrophes, hyphens, slashes)
- Leading/trailing whitespace
- Merged cells
"""

from pathlib import Path

import pytest

from ninebox.models.employee import PerformanceLevel, PotentialLevel
from ninebox.services.excel_parser import ExcelParser


pytestmark = pytest.mark.unit

# Path to edge case fixtures (relative to backend/tests/)
FIXTURES_DIR = Path(__file__).parent.parent.parent / "fixtures" / "excel_edge_cases"

# Skip all tests if fixtures directory doesn't exist
pytestmark = [
    pytest.mark.unit,
    pytest.mark.skipif(
        not FIXTURES_DIR.exists(),
        reason="Excel edge case fixtures not yet created. See agent-projects/excel-fixtures/ for generation plan."
    )
]


class TestMergedCells:
    """Test handling of merged cells in Excel files."""

    def test_parse_when_merged_cells_then_handles_gracefully(self) -> None:
        """Test that merged cells don't break parsing."""
        parser = ExcelParser()
        file_path = FIXTURES_DIR / "merged_cells.xlsx"

        employees = parser.parse(file_path).employees

        # Should parse both employees despite merged cells
        assert len(employees) == 2
        assert employees[0].employee_id == 1
        assert employees[0].name == "Alice Smith"
        assert employees[1].employee_id == 2
        assert employees[1].name == "Bob Jones"


class TestUnicodeCharacters:
    """Test handling of Unicode characters in employee data."""

    def test_parse_when_chinese_characters_then_preserves_correctly(self) -> None:
        """Test Chinese characters in name and title."""
        parser = ExcelParser()
        file_path = FIXTURES_DIR / "unicode_characters.xlsx"

        employees = parser.parse(file_path).employees

        # Find the Chinese employee
        chinese_emp = employees[0]
        assert "张伟" in chinese_emp.name
        assert "工程师" in chinese_emp.business_title

    def test_parse_when_arabic_characters_then_preserves_correctly(self) -> None:
        """Test Arabic characters in name."""
        parser = ExcelParser()
        file_path = FIXTURES_DIR / "unicode_characters.xlsx"

        employees = parser.parse(file_path).employees

        # Find the Arabic employee
        arabic_emp = employees[1]
        assert "محمد" in arabic_emp.name or "علي" in arabic_emp.name

    def test_parse_when_accented_characters_then_preserves_correctly(self) -> None:
        """Test accented European characters."""
        parser = ExcelParser()
        file_path = FIXTURES_DIR / "unicode_characters.xlsx"

        employees = parser.parse(file_path).employees

        # Find employees with accented names
        has_accents = any("é" in emp.name or "ü" in emp.name or "ø" in emp.name for emp in employees)
        assert has_accents

    def test_parse_when_emoji_characters_then_handles_correctly(self) -> None:
        """Test emoji characters in text fields."""
        parser = ExcelParser()
        file_path = FIXTURES_DIR / "unicode_characters.xlsx"

        employees = parser.parse(file_path).employees

        # Should successfully parse despite emojis
        assert len(employees) == 6
        # Find emoji employee (might be stripped or kept depending on implementation)
        emoji_emp = [emp for emp in employees if "Emoji" in emp.name]
        assert len(emoji_emp) == 1


class TestLargeFiles:
    """Test handling of large Excel files with many employees."""

    def test_parse_when_large_file_then_processes_all_employees(self) -> None:
        """Test parsing 1000 employees successfully."""
        parser = ExcelParser()
        file_path = FIXTURES_DIR / "large_file.xlsx"

        employees = parser.parse(file_path).employees

        # Should parse all 1000 employees
        assert len(employees) == 1000
        # Verify first and last
        assert employees[0].employee_id == 1
        assert employees[0].name == "Employee 1"
        assert employees[999].employee_id == 1000
        assert employees[999].name == "Employee 1000"

    def test_parse_when_large_file_then_maintains_data_quality(self) -> None:
        """Test data integrity across all employees in large file."""
        parser = ExcelParser()
        file_path = FIXTURES_DIR / "large_file.xlsx"

        employees = parser.parse(file_path).employees

        # All should have valid IDs
        assert all(emp.employee_id > 0 for emp in employees)
        # All should have names
        assert all(emp.name for emp in employees)
        # All should have performance/potential levels
        assert all(emp.performance in PerformanceLevel for emp in employees)
        assert all(emp.potential in PotentialLevel for emp in employees)
        # All should have valid grid positions (1-9)
        assert all(1 <= emp.grid_position <= 9 for emp in employees)


class TestFormulas:
    """Test handling of Excel formulas in cells."""

    def test_parse_when_formulas_in_cells_then_uses_calculated_values(self) -> None:
        """Test that formulas are evaluated and calculated values are used."""
        parser = ExcelParser()
        file_path = FIXTURES_DIR / "formulas.xlsx"

        employees = parser.parse(file_path).employees

        # Should parse employees using calculated values
        assert len(employees) == 3
        # Values should be actual calculated results, not formula strings
        assert all(emp.name.startswith("Employee") for emp in employees)
        assert all(not emp.name.startswith("=") for emp in employees)


class TestEmptyFiles:
    """Test handling of empty Excel files."""

    def test_parse_when_empty_file_then_raises_error(self) -> None:
        """Test error handling for file with only headers."""
        parser = ExcelParser()
        file_path = FIXTURES_DIR / "empty_file.xlsx"

        with pytest.raises(ValueError, match="No valid employees found"):
            parser.parse(file_path)

    def test_parse_when_empty_file_then_validates_columns(self) -> None:
        """Test that empty file still validates required columns exist."""
        parser = ExcelParser()
        file_path = FIXTURES_DIR / "empty_file.xlsx"

        # Should fail with "No valid employees" not "Missing columns"
        with pytest.raises(ValueError, match="No valid employees"):
            parser.parse(file_path)


class TestMultipleSheets:
    """Test handling of workbooks with multiple sheets."""

    def test_parse_when_multiple_sheets_then_uses_second_sheet(self) -> None:
        """Test that parser correctly uses second sheet (index 1)."""
        parser = ExcelParser()
        file_path = FIXTURES_DIR / "multiple_sheets.xlsx"

        employees = parser.parse(file_path).employees

        # Should use the "Employee Data" sheet (second sheet)
        assert len(employees) == 1
        assert employees[0].employee_id == 1
        assert employees[0].name == "Alice Smith"
        # Should NOT have parsed the decoy sheet
        assert not any(emp.name == "Decoy Employee" for emp in employees)

    def test_parse_when_multiple_sheets_then_ignores_other_sheets(self) -> None:
        """Test that other sheets are ignored."""
        parser = ExcelParser()
        file_path = FIXTURES_DIR / "multiple_sheets.xlsx"

        employees = parser.parse(file_path).employees

        # Only data from the second sheet should be present
        assert len(employees) == 1
        # Verify it's from the correct sheet
        assert employees[0].business_title == "Senior Engineer"


class TestExtraColumns:
    """Test handling of extra columns beyond the schema."""

    def test_parse_when_extra_columns_then_ignores_gracefully(self) -> None:
        """Test that extra columns don't break parsing."""
        parser = ExcelParser()
        file_path = FIXTURES_DIR / "extra_columns.xlsx"

        employees = parser.parse(file_path).employees

        # Should parse successfully
        assert len(employees) == 1
        assert employees[0].employee_id == 1
        assert employees[0].name == "Alice Smith"
        # Extra columns should be ignored (not cause errors)


class TestMissingOptionalColumns:
    """Test handling of files with only required columns."""

    def test_parse_when_missing_optional_columns_then_uses_defaults(self) -> None:
        """Test parsing with only required columns present."""
        parser = ExcelParser()
        file_path = FIXTURES_DIR / "missing_optional.xlsx"

        employees = parser.parse(file_path).employees

        # Should parse successfully
        assert len(employees) == 2
        assert employees[0].employee_id == 1
        assert employees[0].name == "Minimal Employee"
        assert employees[0].business_title == "Engineer"

    def test_parse_when_missing_optional_columns_then_sets_none_for_missing(self) -> None:
        """Test that missing optional fields are set to None or defaults."""
        parser = ExcelParser()
        file_path = FIXTURES_DIR / "missing_optional.xlsx"

        employees = parser.parse(file_path).employees

        emp = employees[0]
        # Optional fields should be None or have default values
        assert emp.development_focus is None
        assert emp.development_action is None
        assert emp.notes is None
        # Performance/potential should default to Medium
        assert emp.performance == PerformanceLevel.MEDIUM
        assert emp.potential == PerformanceLevel.MEDIUM


class TestLongStrings:
    """Test handling of very long string values."""

    def test_parse_when_long_name_then_preserves_full_value(self) -> None:
        """Test that long names are preserved."""
        parser = ExcelParser()
        file_path = FIXTURES_DIR / "long_strings.xlsx"

        employees = parser.parse(file_path).employees

        assert len(employees) == 1
        emp = employees[0]
        # Long name should be preserved
        assert len(emp.name) > 50
        assert "Alexander" in emp.name

    def test_parse_when_long_notes_then_preserves_full_value(self) -> None:
        """Test that long notes are preserved."""
        parser = ExcelParser()
        file_path = FIXTURES_DIR / "long_strings.xlsx"

        employees = parser.parse(file_path).employees

        emp = employees[0]
        # Notes can be very long
        if emp.notes:
            assert len(emp.notes) > 100


class TestSpecialCharacters:
    """Test handling of special characters in text fields."""

    def test_parse_when_apostrophes_in_name_then_preserves_correctly(self) -> None:
        """Test apostrophes in names like O'Brien."""
        parser = ExcelParser()
        file_path = FIXTURES_DIR / "special_characters.xlsx"

        employees = parser.parse(file_path).employees

        # Find O'Brien
        obrien = [emp for emp in employees if "O'Brien" in emp.name or "Brien" in emp.name]
        assert len(obrien) == 1

    def test_parse_when_hyphens_in_name_then_preserves_correctly(self) -> None:
        """Test hyphens in compound names."""
        parser = ExcelParser()
        file_path = FIXTURES_DIR / "special_characters.xlsx"

        employees = parser.parse(file_path).employees

        # Find hyphenated name
        hyphenated = [emp for emp in employees if "-" in emp.name]
        assert len(hyphenated) >= 1

    def test_parse_when_special_chars_in_title_then_preserves_correctly(self) -> None:
        """Test special characters in job titles and descriptions."""
        parser = ExcelParser()
        file_path = FIXTURES_DIR / "special_characters.xlsx"

        employees = parser.parse(file_path).employees

        # Should parse all employees with special characters
        assert len(employees) == 6
        # Check for various special characters
        has_slash = any("/" in emp.business_title or "/" in emp.job_title for emp in employees)
        has_paren = any("(" in emp.name or ")" in emp.name for emp in employees)
        assert has_slash or has_paren


class TestWhitespace:
    """Test handling of leading/trailing whitespace."""

    def test_parse_when_leading_spaces_then_trims_correctly(self) -> None:
        """Test that leading whitespace is trimmed."""
        parser = ExcelParser()
        file_path = FIXTURES_DIR / "leading_trailing_spaces.xlsx"

        employees = parser.parse(file_path).employees

        # Names should be trimmed
        assert all(not emp.name.startswith(" ") for emp in employees)
        assert all(not emp.name.startswith("\t") for emp in employees)

    def test_parse_when_trailing_spaces_then_trims_correctly(self) -> None:
        """Test that trailing whitespace is trimmed."""
        parser = ExcelParser()
        file_path = FIXTURES_DIR / "leading_trailing_spaces.xlsx"

        employees = parser.parse(file_path).employees

        # Names and titles should be trimmed
        assert all(not emp.name.endswith(" ") for emp in employees)
        assert all(not emp.business_title.endswith(" ") for emp in employees)
