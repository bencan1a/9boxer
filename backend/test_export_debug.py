#!/usr/bin/env python3
"""Debug script to test export functionality directly"""

import sys
from datetime import datetime, timezone
from pathlib import Path

# Add backend src to path
sys.path.insert(0, str(Path(__file__).parent / "src"))

import openpyxl

from ninebox.models.session import SessionState
from ninebox.services.excel_exporter import ExcelExporter
from ninebox.services.excel_parser import ExcelParser

# Parse the fixture file
fixture_path = (
    Path(__file__).parent.parent / "frontend" / "playwright" / "fixtures" / "sample-employees.xlsx"
)
parser = ExcelParser()
result = parser.parse(str(fixture_path))

print(f"OK Parsed {len(result.employees)} employees from {fixture_path.name}")
print(f"  Sheet index: {result.metadata.sheet_index}")
print(f"  Sheet name: {result.metadata.sheet_name}")

# Create a session
session = SessionState(
    session_id="test-session",
    user_id="test-user",
    original_filename=fixture_path.name,
    original_file_path=str(fixture_path),
    sheet_name=result.metadata.sheet_name,
    sheet_index=result.metadata.sheet_index,
    original_employees=result.employees.copy(),
    current_employees=result.employees,
    events=[],
    donut_events=[],
    created_at=datetime.now(timezone.utc),
)

# Just export without modifications to see what columns are created
print("Exporting without modifications to inspect column structure...")

# Export
output_path = Path.home() / "test-export-debug.xlsx"
exporter = ExcelExporter()
exporter.export(
    original_file=str(fixture_path),
    employees=session.current_employees,
    output_path=str(output_path),
    sheet_index=session.sheet_index,
    session=session,
)

print(f"OK Exported to {output_path}")

# Inspect the exported file
wb = openpyxl.load_workbook(output_path)
print("\nExported file structure:")
print(f"  Total sheets: {len(wb.worksheets)}")
for i, ws in enumerate(wb.worksheets):
    print(f"    Sheet {i}: {ws.title}")

ws = wb.worksheets[session.sheet_index]
headers = [cell.value for cell in ws[1]]
non_empty_headers = [h for h in headers if h]
print(f"\nSheet {session.sheet_index} ('{ws.title}') has {len(non_empty_headers)} columns:")
for i, h in enumerate(headers):
    if h:
        print(f"  {i + 1}. {h}")

wb.close()
print(f"\nOK Test complete. File saved to: {output_path}")
