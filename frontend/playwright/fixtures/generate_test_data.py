"""
Generate a test fixture Excel file for Playwright E2E tests.

Creates sample-employees.xlsx with all required fields and enough employee data
to pass the backend's sheet detection algorithm (score threshold: 30).
"""

from pathlib import Path

import pandas as pd

# Define test employees across all 9 boxes
# Column names match what the backend expects (see excel_parser.py)
employees = [
    # Stars (High Performance, High Potential) - Box 9
    {
        "Employee ID": "001",
        "Worker": "Alice Smith",
        "Performance": "High",
        "Potential": "High",
        "Job Level - Primary Position": "IC",
        "Business Title": "Senior Engineer",
        "Manager": "David Chen",
        "Organization Name - Level 01": "Engineering",
    },
    {
        "Employee ID": "002",
        "Worker": "Bob Johnson",
        "Performance": "High",
        "Potential": "High",
        "Job Level - Primary Position": "Manager",
        "Business Title": "Engineering Manager",
        "Manager": "David Chen",
        "Organization Name - Level 01": "Engineering",
    },
    # High Potential (Medium Performance, High Potential) - Box 8
    {
        "Employee ID": "003",
        "Worker": "Carol Williams",
        "Performance": "Medium",
        "Potential": "High",
        "Job Level - Primary Position": "IC",
        "Business Title": "Product Manager",
        "Manager": "Emily Rodriguez",
        "Organization Name - Level 01": "Product",
    },
    {
        "Employee ID": "004",
        "Worker": "David Lee",
        "Performance": "Medium",
        "Potential": "High",
        "Job Level - Primary Position": "IC",
        "Business Title": "Designer",
        "Manager": "Emily Rodriguez",
        "Organization Name - Level 01": "Product",
    },
    # Enigma/Question Mark (Low Performance, High Potential) - Box 7
    {
        "Employee ID": "005",
        "Worker": "Emma Davis",
        "Performance": "Low",
        "Potential": "High",
        "Job Level - Primary Position": "IC",
        "Business Title": "Junior Engineer",
        "Manager": "David Chen",
        "Organization Name - Level 01": "Engineering",
    },
    # High Performer (High Performance, Medium Potential) - Box 6
    {
        "Employee ID": "006",
        "Worker": "Frank Martinez",
        "Performance": "High",
        "Potential": "Medium",
        "Job Level - Primary Position": "IC",
        "Business Title": "Staff Engineer",
        "Manager": "David Chen",
        "Organization Name - Level 01": "Engineering",
    },
    {
        "Employee ID": "007",
        "Worker": "Grace Taylor",
        "Performance": "High",
        "Potential": "Medium",
        "Job Level - Primary Position": "Manager",
        "Business Title": "Sales Manager",
        "Manager": "Henry Kim",
        "Organization Name - Level 01": "Sales",
    },
    # Core Performer (Medium Performance, Medium Potential) - Box 5
    {
        "Employee ID": "008",
        "Worker": "Henry Anderson",
        "Performance": "Medium",
        "Potential": "Medium",
        "Job Level - Primary Position": "IC",
        "Business Title": "Account Executive",
        "Manager": "Henry Kim",
        "Organization Name - Level 01": "Sales",
    },
    {
        "Employee ID": "009",
        "Worker": "Iris Thomas",
        "Performance": "Medium",
        "Potential": "Medium",
        "Job Level - Primary Position": "IC",
        "Business Title": "Marketing Specialist",
        "Manager": "Jessica Wang",
        "Organization Name - Level 01": "Marketing",
    },
    {
        "Employee ID": "010",
        "Worker": "Jack Wilson",
        "Performance": "Medium",
        "Potential": "Medium",
        "Job Level - Primary Position": "IC",
        "Business Title": "Data Analyst",
        "Manager": "David Chen",
        "Organization Name - Level 01": "Engineering",
    },
    # Under-Performer (Low Performance, Medium Potential) - Box 4
    {
        "Employee ID": "011",
        "Worker": "Karen Moore",
        "Performance": "Low",
        "Potential": "Medium",
        "Job Level - Primary Position": "IC",
        "Business Title": "Associate",
        "Manager": "Henry Kim",
        "Organization Name - Level 01": "Sales",
    },
    # Strong Performer (High Performance, Low Potential) - Box 3
    {
        "Employee ID": "012",
        "Worker": "Leo Jackson",
        "Performance": "High",
        "Potential": "Low",
        "Job Level - Primary Position": "IC",
        "Business Title": "Senior Specialist",
        "Manager": "Jessica Wang",
        "Organization Name - Level 01": "Marketing",
    },
    # Solid Performer (Medium Performance, Low Potential) - Box 2
    {
        "Employee ID": "013",
        "Worker": "Maria Garcia",
        "Performance": "Medium",
        "Potential": "Low",
        "Job Level - Primary Position": "IC",
        "Business Title": "Coordinator",
        "Manager": "Jessica Wang",
        "Organization Name - Level 01": "Marketing",
    },
    {
        "Employee ID": "014",
        "Worker": "Nathan White",
        "Performance": "Medium",
        "Potential": "Low",
        "Job Level - Primary Position": "IC",
        "Business Title": "Administrator",
        "Manager": "Emily Rodriguez",
        "Organization Name - Level 01": "Operations",
    },
    # Too New/Problem (Low Performance, Low Potential) - Box 1
    {
        "Employee ID": "015",
        "Worker": "Olivia Harris",
        "Performance": "Low",
        "Potential": "Low",
        "Job Level - Primary Position": "IC",
        "Business Title": "Intern",
        "Manager": "David Chen",
        "Organization Name - Level 01": "Engineering",
    },
]

# Create DataFrame
df = pd.DataFrame(employees)

# Save to Excel
output_path = Path(__file__).parent / "sample-employees.xlsx"
df.to_excel(output_path, index=False, sheet_name="Employees")

print(f"Created test fixture: {output_path}")
print(f"   - {len(employees)} employees")
print("   - All required columns present")
print("   - Covers all 9 boxes in the grid")
