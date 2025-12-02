"""Excel file exporter service."""

from pathlib import Path

import openpyxl

from ninebox.models.employee import Employee


class ExcelExporter:
    """Export modified employee data back to Excel."""

    def export(
        self, original_file: str | Path, employees: list[Employee], output_path: str | Path
    ) -> None:
        """
        Create new Excel file with updated ratings.

        Args:
            original_file: Path to original Excel file
            employees: List of employees with current data
            output_path: Path to save modified Excel file
        """
        # Read original file to preserve formatting
        workbook = openpyxl.load_workbook(original_file)

        # Work with second sheet (index 1)
        if len(workbook.worksheets) < 2:
            raise ValueError("Excel file must have at least 2 sheets")

        sheet = workbook.worksheets[1]

        # Find column indices
        perf_col = self._find_column(sheet, "Aug 2025 Talent Assessment Performance")
        pot_col = self._find_column(sheet, "Aug 2025  Talent Assessment Potential")
        box_col = self._find_column(sheet, "Aug 2025 Talent Assessment 9-Box Label")
        label_col = self._find_column(sheet, "Talent Mapping Position")

        # Add "Modified" columns if they don't exist
        max_col = sheet.max_column
        modified_col = self._find_column(sheet, "Modified in Session", create=True)
        if modified_col > max_col:
            sheet.cell(1, modified_col, "Modified in Session")
            sheet.cell(1, modified_col + 1, "Modification Date")

        # Create employee lookup by ID
        employee_map = {e.employee_id: e for e in employees}

        # Update rows with modified data
        for row_idx in range(2, sheet.max_row + 1):
            emp_id_cell = sheet.cell(row_idx, 1).value
            if emp_id_cell is None:
                continue

            try:
                emp_id = int(emp_id_cell)
            except (ValueError, TypeError):
                continue

            if emp_id in employee_map:
                emp = employee_map[emp_id]

                # Update performance data
                if perf_col:
                    sheet.cell(row_idx, perf_col, emp.performance.value)
                if pot_col:
                    sheet.cell(row_idx, pot_col, emp.potential.value)
                if box_col:
                    sheet.cell(row_idx, box_col, emp.grid_position)
                if label_col:
                    sheet.cell(row_idx, label_col, emp.position_label)

                # Mark as modified
                sheet.cell(row_idx, modified_col, "Yes" if emp.modified_in_session else "No")
                if emp.modified_in_session and emp.last_modified:
                    sheet.cell(row_idx, modified_col + 1, emp.last_modified.isoformat())

        # Save modified workbook
        workbook.save(output_path)

    def _find_column(
        self, sheet: openpyxl.worksheet.worksheet.Worksheet, col_name: str, create: bool = False
    ) -> int | None:
        """Find column index by name."""
        for col_idx in range(1, sheet.max_column + 1):
            cell_value = sheet.cell(1, col_idx).value
            if cell_value and col_name in str(cell_value):
                return col_idx

        # If not found and create=True, return next available column
        if create:
            return sheet.max_column + 1

        return None
