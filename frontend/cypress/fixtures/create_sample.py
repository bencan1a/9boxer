#!/usr/bin/env python3
"""
Create a sample Excel file for Cypress E2E testing.
This matches the format expected by the 9-Box application.
"""

import openpyxl
from datetime import date
from pathlib import Path

def create_sample_excel():
    """Create a sample Excel file with employee data."""
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "Employees"

    # Headers (matching the expected format from backend)
    headers = [
        "employee_id",
        "name",
        "business_title",
        "job_title",
        "job_profile",
        "job_level",
        "job_function",
        "location",
        "manager",
        "management_chain_04",
        "management_chain_05",
        "management_chain_06",
        "hire_date",
        "tenure_category",
        "time_in_job_profile",
        "performance",
        "potential",
        "grid_position",
        "position_label",
        "talent_indicator",
        "ratings_history",
        "development_focus",
        "development_action",
        "notes",
        "promotion_status",
    ]

    ws.append(headers)

    # Sample employee data (15 employees across different grid positions)
    employees = [
        # High performers (position 9 - High Performance, High Potential)
        [1, "Alice Smith", "Senior Engineer", "Software Engineer", "Software Engineering", "MT4", "Engineering", "New York", "Bob Manager", "Bob Manager", "Carol Director", "", date(2020, 1, 15), "3-5 years", "2 years", "High", "High", 9, "Top Talent [H,H]", "High Potential", "2023:Strong;2024:Leading", "Leadership skills", "Executive coaching", "Top performer", "Ready now"],
        [2, "David Chen", "Senior Designer", "UX Designer", "Product Design", "MT4", "Design", "San Francisco", "Eve Manager", "Eve Manager", "Carol Director", "", date(2019, 3, 10), "5+ years", "3 years", "High", "High", 9, "Top Talent [H,H]", "High Potential", "2023:Leading;2024:Leading", "Strategic thinking", "Mentorship program", "Excellent work", "Ready now"],

        # Medium-high performers (position 8 - Medium Performance, High Potential)
        [3, "Emma Wilson", "Product Manager", "Product Manager", "Product Management", "MT3", "Product", "Austin", "Bob Manager", "Bob Manager", "Frank VP", "", date(2021, 6, 1), "1-3 years", "1 year", "Medium", "High", 8, "High Potential [M,H]", "High Potential", "2023:Strong;2024:Strong", "Product strategy", "PM training", "Good potential", "1-2 years"],
        [4, "Frank Johnson", "Marketing Lead", "Marketing Manager", "Marketing", "MT3", "Marketing", "Boston", "Grace Manager", "Grace Manager", "Frank VP", "", date(2020, 9, 20), "3-5 years", "2 years", "Medium", "High", 8, "High Potential [M,H]", "High Potential", "2023:Strong", "Market analysis", "Conference attendance", "Strong contributor", "1-2 years"],

        # Top row, left side (position 7 - Low Performance, High Potential)
        [5, "Grace Park", "Junior Engineer", "Software Engineer", "Software Engineering", "MT2", "Engineering", "Seattle", "Bob Manager", "Bob Manager", "Carol Director", "", date(2023, 1, 5), "<1 year", "6 months", "Low", "High", 7, "Development Needed [L,H]", "High Potential", "", "Technical skills", "Training program", "New hire", "2-3 years"],

        # Middle row, right side (position 6 - High Performance, Medium Potential)
        [6, "Henry Martinez", "Senior Analyst", "Data Analyst", "Data Analytics", "MT3", "Analytics", "Chicago", "Eve Manager", "Eve Manager", "Frank VP", "", date(2019, 7, 15), "5+ years", "4 years", "High", "Medium", 6, "Core Contributor [H,M]", "", "2023:Strong;2024:Leading", "Team leadership", "Lead small projects", "Reliable performer", "Not applicable"],
        [7, "Ivy Lee", "Operations Manager", "Operations Lead", "Operations", "MT3", "Operations", "Denver", "Grace Manager", "Grace Manager", "Carol Director", "", date(2020, 4, 12), "3-5 years", "2 years", "High", "Medium", 6, "Core Contributor [H,M]", "", "2023:Strong;2024:Strong", "Process improvement", "Six Sigma training", "Solid performer", "Not applicable"],

        # Middle center (position 5 - Medium Performance, Medium Potential)
        [8, "Jack Brown", "Engineer", "Software Engineer", "Software Engineering", "MT2", "Engineering", "Portland", "Bob Manager", "Bob Manager", "Carol Director", "", date(2021, 11, 3), "1-3 years", "1 year", "Medium", "Medium", 5, "Solid Performer [M,M]", "", "2023:Developing;2024:Strong", "Code quality", "Pair programming", "Meeting expectations", "Not applicable"],
        [9, "Kate Davis", "Designer", "UI Designer", "Product Design", "MT2", "Design", "Los Angeles", "Eve Manager", "Eve Manager", "Frank VP", "", date(2022, 2, 28), "1-3 years", "1 year", "Medium", "Medium", 5, "Solid Performer [M,M]", "", "2024:Strong", "User research", "Design workshops", "Consistent work", "Not applicable"],

        # Middle left (position 4 - Low Performance, Medium Potential)
        [10, "Liam Garcia", "Analyst", "Business Analyst", "Business Analysis", "MT2", "Analytics", "Miami", "Grace Manager", "Grace Manager", "Frank VP", "", date(2023, 5, 10), "<1 year", "4 months", "Low", "Medium", 4, "Needs Development [L,M]", "", "", "Business acumen", "Mentoring", "Learning curve", "Not applicable"],

        # Bottom right (position 3 - High Performance, Low Potential)
        [11, "Mia Rodriguez", "Specialist", "Support Specialist", "Customer Support", "MT1", "Support", "Phoenix", "Grace Manager", "Grace Manager", "Carol Director", "", date(2018, 8, 22), "5+ years", "5 years", "High", "Low", 3, "Effective Specialist [H,L]", "", "2023:Strong;2024:Strong", "Customer service", "Advanced training", "Expert in role", "Not applicable"],

        # Bottom center (position 2 - Medium Performance, Low Potential)
        [12, "Noah Kim", "Coordinator", "Project Coordinator", "Project Management", "MT1", "Operations", "Atlanta", "Bob Manager", "Bob Manager", "Frank VP", "", date(2021, 3, 18), "1-3 years", "1.5 years", "Medium", "Low", 2, "Steady Contributor [M,L]", "", "2024:Developing", "Organization", "Time management course", "Adequate performance", "Not applicable"],
        [13, "Olivia Taylor", "Assistant", "Admin Assistant", "Administration", "MT1", "Operations", "Dallas", "Eve Manager", "Eve Manager", "Carol Director", "", date(2022, 7, 5), "1-3 years", "1 year", "Medium", "Low", 2, "Steady Contributor [M,L]", "", "2024:Developing", "Administrative skills", "Software training", "Meets standards", "Not applicable"],

        # Bottom left (position 1 - Low Performance, Low Potential)
        [14, "Paul Anderson", "Intern", "Engineering Intern", "Software Engineering", "MT1", "Engineering", "Houston", "Bob Manager", "Bob Manager", "Carol Director", "", date(2024, 6, 1), "<1 year", "2 months", "Low", "Low", 1, "High Risk [L,L]", "", "", "Basic skills", "Training plan", "Requires improvement", "Not applicable"],
        [15, "Quinn White", "Junior Analyst", "Data Analyst", "Data Analytics", "MT1", "Analytics", "Philadelphia", "Grace Manager", "Grace Manager", "Frank VP", "", date(2024, 3, 15), "<1 year", "3 months", "Low", "Low", 1, "High Risk [L,L]", "", "", "Data analysis", "Bootcamp", "New to field", "Not applicable"],
    ]

    for emp in employees:
        ws.append(emp)

    # Save the file
    output_path = Path(__file__).parent / "sample-employees.xlsx"
    wb.save(output_path)
    print(f"Created sample Excel file: {output_path}")

if __name__ == "__main__":
    create_sample_excel()
