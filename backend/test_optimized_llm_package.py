"""Quick test to verify the optimized LLM package structure and measure token reduction."""

import json
from datetime import date
from pathlib import Path

from ninebox.models.employee import Employee, PerformanceLevel, PotentialLevel
from ninebox.services.data_packaging_service import package_for_llm, package_for_ui


def create_test_employee(emp_id: int, has_flags: bool = False) -> Employee:
    """Create a test employee."""
    flags = []
    if has_flags:
        flags = ["succession_candidate", "promotion_ready"]

    return Employee(
        employee_id=emp_id,
        name=f"Employee {emp_id}",
        business_title=f"Senior Engineer {emp_id}",
        job_title=f"Job Title {emp_id}",
        job_profile="Engineering-USA",
        job_level="MT3" if emp_id % 3 == 0 else "MT5",
        job_function="Engineering" if emp_id % 2 == 0 else "Sales",
        location="USA" if emp_id % 2 == 0 else "London",
        direct_manager=f"MGR{(emp_id % 5) + 1}",
        hire_date=date(2022, 1, 1),
        tenure_category="1-3 years",
        time_in_job_profile="1-2 years",
        performance=PerformanceLevel.HIGH if emp_id % 3 == 0 else PerformanceLevel.MEDIUM,
        potential=PotentialLevel.HIGH if emp_id % 2 == 0 else PotentialLevel.MEDIUM,
        grid_position=9 if emp_id % 5 == 0 else 5,
        talent_indicator="Star" if emp_id % 5 == 0 else "Core",
        flags=flags,
    )


def main():
    """Test the optimized package structure."""
    print("=" * 80)
    print("OPTIMIZED LLM PACKAGE TEST")
    print("=" * 80)

    # Create test employees (120 employees, 20% with flags)
    employees = []
    for i in range(1, 121):
        has_flags = i % 5 == 0  # 20% have flags
        employees.append(create_test_employee(i, has_flags=has_flags))

    # Mock analysis results
    mock_analyses = {
        "location": {
            "status": "red",
            "p_value": 0.001,
            "chi_square": 15.3,
            "effect_size": 0.35,
        },
        "function": {
            "status": "green",
            "p_value": 0.8,
        },
        "level": {
            "status": "yellow",
            "p_value": 0.04,
        },
        "tenure": {
            "status": "green",
            "p_value": 0.6,
        },
    }

    # Package for LLM (optimized)
    llm_package = package_for_llm(employees, mock_analyses)

    # Package for UI (full)
    ui_package = package_for_ui(employees, mock_analyses)

    # Convert to JSON to measure size
    llm_json = json.dumps(llm_package, indent=2)
    ui_json = json.dumps(ui_package, indent=2)

    llm_chars = len(llm_json)
    ui_chars = len(ui_json)

    # Rough token estimate (1 token ≈ 4 characters for JSON)
    llm_tokens = llm_chars // 4
    ui_tokens = ui_chars // 4

    reduction_pct = ((ui_chars - llm_chars) / ui_chars) * 100

    print("\nSIZE COMPARISON:")
    print(f"   UI Package:  {ui_chars:,} characters (~{ui_tokens:,} tokens)")
    print(f"   LLM Package: {llm_chars:,} characters (~{llm_tokens:,} tokens)")
    print(f"   Reduction:   {reduction_pct:.1f}% smaller")

    print("\nLLM PACKAGE STRUCTURE:")
    print(f"   Keys: {list(llm_package.keys())}")

    print("\nLEVEL BREAKDOWN:")
    print(f"   Total levels: {llm_package['level_breakdown']['total_levels']}")
    for level_data in llm_package["level_breakdown"]["levels"]:
        print(
            f"   - {level_data['level']}: {level_data['total_employees']} employees, "
            f"{level_data['flagged_count']} flagged"
        )

    print("\nFLAGGED EMPLOYEES:")
    flagged_count = len(llm_package["flagged_employees"])
    print(f"   Total flagged: {flagged_count} (expected 24)")
    if flagged_count > 0:
        sample = llm_package["flagged_employees"][0]
        print(f"   Sample fields: {list(sample.keys())}")
        print(f"   Sample: {json.dumps(sample, indent=4)}")

    print("\nOVERVIEW:")
    overview = llm_package["overview"]
    print(f"   Total employees: {overview['total_employees']}")
    print(f"   Stars: {overview['stars_count']} ({overview['stars_percentage']}%)")
    print(f"   Center box: {overview['center_box_count']} ({overview['center_box_percentage']}%)")

    print("\nANALYSES INCLUDED:")
    for analysis_name in llm_package["analyses"]:
        print(f"   - {analysis_name}")

    print("\n" + "=" * 80)
    print("TEST COMPLETE - SUCCESS")
    print("=" * 80)

    # Save sample output for inspection
    output_path = Path("test_llm_package_output.json")
    with output_path.open("w") as f:
        json.dump(llm_package, f, indent=2)

    print("\nSample LLM package saved to: backend/test_llm_package_output.json")


if __name__ == "__main__":
    main()
