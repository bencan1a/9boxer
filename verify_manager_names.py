#!/usr/bin/env python3
"""Verification script for Phase 1: manager name fix."""

import sys

from ninebox.services.sample_data_generator import RichDatasetConfig, generate_rich_dataset


def verify_manager_names():  # noqa: PLR0912
    """Verify that manager fields contain employee names, not job titles."""
    config = RichDatasetConfig(size=50, seed=42, include_bias=True)
    employees = generate_rich_dataset(config)

    print("=" * 80)
    print("PHASE 1 VERIFICATION: Manager Names (Not Titles)")
    print("=" * 80)

    # Job title patterns to check for
    title_keywords = [
        "Manager",
        "Director",
        "VP",
        "CEO",
        "Engineer",
        "Analyst",
        "Lead",
        "Senior",
        "Staff",
        "Principal",
        "Product",
        "Sales",
    ]

    issues = []
    ceo_count = 0

    for emp in employees:
        # Check direct manager
        if emp.direct_manager and emp.direct_manager != "None":
            for keyword in title_keywords:
                if keyword in emp.direct_manager:
                    issues.append(
                        {
                            "employee": emp.name,
                            "field": "direct_manager",
                            "value": emp.direct_manager,
                            "problem": f"Contains title keyword: {keyword}",
                        }
                    )
                    break
        elif emp.direct_manager == "None" or emp.direct_manager is None:
            ceo_count += 1

        # Check management chain levels
        for level in ["01", "02", "03", "04", "05", "06"]:
            chain_val = getattr(emp, f"management_chain_{level}")
            if chain_val:
                for keyword in title_keywords:
                    if keyword in chain_val:
                        issues.append(
                            {
                                "employee": emp.name,
                                "field": f"management_chain_{level}",
                                "value": chain_val,
                                "problem": f"Contains title keyword: {keyword}",
                            }
                        )
                        break

    # Print results
    print(f"\nDataset Size: {len(employees)} employees")
    print(f"Employees without manager (CEO): {ceo_count}")
    print(f"Issues Found: {len(issues)}")

    if issues:
        print("\n" + "=" * 80)
        print("ISSUES DETECTED (Manager fields contain titles instead of names):")
        print("=" * 80)
        for i, issue in enumerate(issues[:10], 1):  # Show first 10
            print(f"\n{i}. Employee: {issue['employee']}")
            print(f"   Field: {issue['field']}")
            print(f"   Value: {issue['value']}")
            print(f"   Problem: {issue['problem']}")

        if len(issues) > 10:
            print(f"\n... and {len(issues) - 10} more issues")

        return False
    else:
        print("\n" + "=" * 80)
        print("✓ SUCCESS: All manager fields contain employee names (not titles)")
        print("=" * 80)

        # Show sample manager names
        print("\nSample Manager Names (first 10 employees with managers):")
        sample_count = 0
        for emp in employees:
            if emp.direct_manager and emp.direct_manager != "None" and sample_count < 10:
                print(f"  - {emp.name} reports to: {emp.direct_manager}")
                sample_count += 1

        return True


if __name__ == "__main__":
    success = verify_manager_names()
    sys.exit(0 if success else 1)
