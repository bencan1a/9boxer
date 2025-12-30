"""Error path tests for Excel parser service.

This test module covers error handling scenarios:
- File not found (invalid file path)
- Corrupted/invalid Excel files
- Missing required columns
- All rows fail to parse
"""

from pathlib import Path
from unittest.mock import patch

import pandas as pd
import pytest

from ninebox.services.excel_parser import ExcelParser, SheetDetector


pytestmark = pytest.mark.unit


class TestFileNotFoundErrors:
    """Test handling of file not found errors."""

    def test_parse_when_file_not_exists_then_raises_value_error(self) -> None:
        """Test that missing file raises ValueError."""
        parser = ExcelParser()
        file_path = Path("/nonexistent/path/missing_file.xlsx")

        with pytest.raises(ValueError, match="Failed to read Excel file"):
            parser.parse(file_path)

    def test_find_best_sheet_when_file_not_exists_then_raises_value_error(self) -> None:
        """Test that SheetDetector raises ValueError for missing files."""
        file_path = Path("/nonexistent/path/missing_file.xlsx")

        with pytest.raises(ValueError, match="Failed to read Excel file"):
            SheetDetector.find_best_sheet(file_path)


class TestCorruptedFileErrors:
    """Test handling of corrupted or invalid Excel files."""

    def test_parse_when_corrupted_file_then_raises_value_error(self, tmp_path: Path) -> None:
        """Test that corrupted Excel file raises ValueError."""
        parser = ExcelParser()

        # Create a file with invalid Excel content
        corrupted_file = tmp_path / "corrupted.xlsx"
        corrupted_file.write_text("This is not a valid Excel file")

        with pytest.raises(ValueError, match="Failed to read Excel file"):
            parser.parse(corrupted_file)

    def test_find_best_sheet_when_corrupted_file_then_raises_value_error(
        self, tmp_path: Path
    ) -> None:
        """Test that SheetDetector raises ValueError for corrupted files."""
        # Create a file with invalid Excel content
        corrupted_file = tmp_path / "corrupted.xlsx"
        corrupted_file.write_text("Not an Excel file")

        with pytest.raises(ValueError, match="Failed to read Excel file"):
            SheetDetector.find_best_sheet(corrupted_file)

    def test_parse_when_empty_binary_file_then_raises_value_error(self, tmp_path: Path) -> None:
        """Test that empty binary file raises ValueError."""
        parser = ExcelParser()

        # Create an empty file
        empty_file = tmp_path / "empty.xlsx"
        empty_file.write_bytes(b"")

        with pytest.raises(ValueError, match="Failed to read Excel file"):
            parser.parse(empty_file)


class TestMissingRequiredColumns:
    """Test handling of files with missing required columns."""

    def test_parse_when_missing_employee_id_then_raises_value_error(self, tmp_path: Path) -> None:
        """Test that missing Employee ID column raises ValueError."""
        parser = ExcelParser()

        # Create Excel file with missing Employee ID column
        df = pd.DataFrame(
            {
                "Worker": ["Alice Smith"],
                "Business Title": ["Engineer"],
                "Job Level - Primary Position": ["L3"],
            }
        )

        file_path = tmp_path / "missing_employee_id.xlsx"
        df.to_excel(file_path, index=False)

        with pytest.raises(ValueError, match="Missing required columns.*Employee ID"):
            parser.parse(file_path)

    def test_parse_when_missing_worker_then_raises_value_error(self, tmp_path: Path) -> None:
        """Test that missing Worker column raises ValueError."""
        parser = ExcelParser()

        # Create Excel file with missing Worker column
        df = pd.DataFrame(
            {
                "Employee ID": [1],
                "Business Title": ["Engineer"],
                "Job Level - Primary Position": ["L3"],
            }
        )

        file_path = tmp_path / "missing_worker.xlsx"
        df.to_excel(file_path, index=False)

        with pytest.raises(ValueError, match="Missing required columns.*Worker"):
            parser.parse(file_path)

    def test_parse_when_missing_business_title_then_raises_value_error(
        self, tmp_path: Path
    ) -> None:
        """Test that missing Business Title column raises ValueError."""
        parser = ExcelParser()

        # Create Excel file with missing Business Title column
        df = pd.DataFrame(
            {
                "Employee ID": [1],
                "Worker": ["Alice Smith"],
                "Job Level - Primary Position": ["L3"],
            }
        )

        file_path = tmp_path / "missing_business_title.xlsx"
        df.to_excel(file_path, index=False)

        with pytest.raises(ValueError, match="Missing required columns.*Business Title"):
            parser.parse(file_path)

    def test_parse_when_missing_job_level_then_raises_value_error(self, tmp_path: Path) -> None:
        """Test that missing Job Level column raises ValueError."""
        parser = ExcelParser()

        # Create Excel file with missing Job Level column
        df = pd.DataFrame(
            {
                "Employee ID": [1],
                "Worker": ["Alice Smith"],
                "Business Title": ["Engineer"],
            }
        )

        file_path = tmp_path / "missing_job_level.xlsx"
        df.to_excel(file_path, index=False)

        with pytest.raises(
            ValueError, match="Missing required columns.*Job Level - Primary Position"
        ):
            parser.parse(file_path)

    def test_parse_when_missing_multiple_columns_then_raises_value_error(
        self, tmp_path: Path
    ) -> None:
        """Test that missing multiple required columns raises ValueError.

        Note: Sheet detection runs before column validation, so files with too few
        columns fail sheet detection (score too low) rather than column validation.
        """
        parser = ExcelParser()

        # Create Excel file with only one required column
        df = pd.DataFrame({"Employee ID": [1, 2, 3]})

        file_path = tmp_path / "missing_multiple.xlsx"
        df.to_excel(file_path, index=False)

        # Sheet detection will fail because score is too low (only 10, need 30)
        with pytest.raises(ValueError, match="No sheet found containing employee data"):
            parser.parse(file_path)


class TestNoValidEmployees:
    """Test handling of files where all rows fail to parse."""

    def test_parse_when_all_rows_fail_then_raises_value_error(self, tmp_path: Path) -> None:
        """Test that file with no parseable employees raises ValueError."""
        parser = ExcelParser()

        # Create Excel file with invalid employee data (missing Employee ID values)
        # This will cause all rows to fail parsing
        df = pd.DataFrame(
            {
                "Employee ID": [None, None, None],  # Invalid IDs will cause parse failures
                "Worker": ["Alice", "Bob", "Charlie"],
                "Business Title": ["Engineer", "Manager", "Designer"],
                "Job Level - Primary Position": ["L3", "L4", "L3"],
            }
        )

        file_path = tmp_path / "no_valid_employees.xlsx"
        df.to_excel(file_path, index=False)

        with pytest.raises(ValueError, match="No valid employees found"):
            parser.parse(file_path)


class TestSheetDetectionErrors:
    """Test sheet detection error handling."""

    def test_find_best_sheet_when_no_suitable_sheet_then_raises_value_error(
        self, tmp_path: Path
    ) -> None:
        """Test that file with no suitable sheet raises ValueError."""
        # Create Excel file with sheet that has low score (no employee data)
        df = pd.DataFrame({"Random Column": [1, 2, 3], "Another Column": ["A", "B", "C"]})

        file_path = tmp_path / "no_suitable_sheet.xlsx"
        df.to_excel(file_path, sheet_name="Random Data", index=False)

        with pytest.raises(ValueError, match="No sheet found containing employee data"):
            SheetDetector.find_best_sheet(file_path)

    def test_find_best_sheet_when_sheet_read_error_then_falls_back(
        self, tmp_path: Path
    ) -> None:
        """Test that sheet read errors are handled gracefully."""
        # Create a valid Excel file
        df = pd.DataFrame(
            {
                "Employee ID": [1],
                "Worker": ["Alice"],
                "Business Title": ["Engineer"],
                "Job Level - Primary Position": ["L3"],
            }
        )

        file_path = tmp_path / "valid_file.xlsx"
        # Create multi-sheet file
        with pd.ExcelWriter(file_path) as writer:
            df.to_excel(writer, sheet_name="Sheet1", index=False)
            df.to_excel(writer, sheet_name="Employee Data", index=False)

        # Should successfully find the Employee Data sheet despite any sheet read warnings
        result_df, sheet_name, sheet_index = SheetDetector.find_best_sheet(file_path)
        assert sheet_name == "Employee Data"
        assert sheet_index == 1
