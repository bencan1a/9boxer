#!/usr/bin/env python3
"""Verification script: Check for duplicate names and reverse lookup edge cases."""

from collections import Counter

from ninebox.services.sample_data_generator import RichDatasetConfig, generate_rich_dataset


def verify_name_uniqueness():
    """Check if employee names are unique (they might not be)."""
    config = RichDatasetConfig(size=200, seed=42, include_bias=True)
    employees = generate_rich_dataset(config)

    print("=" * 80)
    print("PHASE 1 VERIFICATION: Name Uniqueness and Reverse Lookup Edge Cases")
    print("=" * 80)

    # Check for duplicate names
    names = [emp.name for emp in employees]
    name_counts = Counter(names)
    duplicates = {name: count for name, count in name_counts.items() if count > 1}

    print(f"\nDataset Size: {len(employees)} employees")
    print(f"Unique Names: {len(name_counts)}")
    print(f"Duplicate Names: {len(duplicates)}")

    if duplicates:
        print("\nDuplicate Names Found:")
        for name, count in sorted(duplicates.items(), key=lambda x: -x[1])[:10]:
            print(f"  - '{name}': {count} employees")

        # Find employees with duplicate names
        print("\n" + "=" * 80)
        print("Impact Analysis: Employees with Duplicate Names")
        print("=" * 80)

        for dup_name in list(duplicates.keys())[:3]:  # Show first 3 duplicate names
            matching_employees = [emp for emp in employees if emp.name == dup_name]
            print(f"\nName: '{dup_name}' ({len(matching_employees)} employees)")
            for emp in matching_employees:
                print(
                    f"  - ID: {emp.employee_id:4d}, Title: {emp.business_title}, "
                    f"Manager: {emp.direct_manager}"
                )

        print("\n" + "=" * 80)
        print("POTENTIAL ISSUE DETECTED:")
        print("=" * 80)
        print("The _apply_bias() method creates a reverse mapping: name -> employee_id")
        print("If multiple employees have the same name, only ONE will be in the mapping.")
        print("This could cause bias patterns to:")
        print("  1. Miss some managers (if manager has a duplicate name)")
        print("  2. Apply bias to wrong manager (if wrong employee_id is selected)")
        print("\nThis is a CORRECTNESS BUG in the reverse lookup logic.")

    else:
        print("\nNo duplicate names found - reverse lookup is safe.")

    # Check if managers have unique names
    print("\n" + "=" * 80)
    print("Manager Name Uniqueness Check:")
    print("=" * 80)

    managers = set()
    for emp in employees:
        if emp.direct_manager and emp.direct_manager != "None":
            managers.add(emp.direct_manager)

    print(f"Unique Manager Names: {len(managers)}")

    # Find which managers are employees
    employee_names_set = {emp.name for emp in employees}
    managers_who_are_employees = managers.intersection(employee_names_set)

    print(f"Managers who are also employees: {len(managers_who_are_employees)}")

    # Check if any manager names appear multiple times in employee list
    manager_duplicates = []
    for manager_name in managers_who_are_employees:
        matching = [emp for emp in employees if emp.name == manager_name]
        if len(matching) > 1:
            manager_duplicates.append((manager_name, len(matching)))

    if manager_duplicates:
        print(f"\nManager names with duplicates: {len(manager_duplicates)}")
        for name, count in manager_duplicates[:5]:
            print(f"  - '{name}': {count} employees with this name")
    else:
        print("\nAll manager names are unique among employees - reverse lookup is safe.")


if __name__ == "__main__":
    verify_name_uniqueness()
