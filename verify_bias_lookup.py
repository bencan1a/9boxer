#!/usr/bin/env python3
"""Verification script: Check that bias patterns still work after the manager name fix."""

from collections import Counter

from ninebox.models.employee import PerformanceLevel
from ninebox.services.sample_data_generator import RichDatasetConfig, generate_rich_dataset


def verify_bias_patterns():
    """Verify that manager bias patterns are correctly applied."""
    config = RichDatasetConfig(size=200, seed=42, include_bias=True)
    employees = generate_rich_dataset(config)

    print("=" * 80)
    print("PHASE 1 VERIFICATION: Bias Patterns After Manager Name Fix")
    print("=" * 80)

    # Find managers by their employee names and check their teams' ratings
    manager_teams = {}

    for emp in employees:
        manager_name = emp.direct_manager
        if manager_name and manager_name != "None":
            if manager_name not in manager_teams:
                manager_teams[manager_name] = []
            manager_teams[manager_name].append(emp)

    # Find managers with specific titles that should show bias
    target_managers = {"Engineering Manager": None, "VP Product": None, "Director Sales": None}

    # Find these managers in the dataset
    for emp in employees:
        for target_title in target_managers:
            if target_title in emp.business_title:
                target_managers[target_title] = emp.name
                break

    print(f"\nDataset Size: {len(employees)} employees")
    print(f"Total Managers: {len(manager_teams)} managers with teams")
    print("\nTarget Managers Found:")
    for title, name in target_managers.items():
        team_size = len(manager_teams.get(name, [])) if name else 0
        print(f"  - {title}: {name} (team size: {team_size})")

    # Check performance distribution for each target manager
    print("\n" + "=" * 80)
    print("Performance Distribution by Target Manager:")
    print("=" * 80)

    for title, manager_name in target_managers.items():
        if manager_name and manager_name in manager_teams:
            team = manager_teams[manager_name]
            perf_counts = Counter(emp.performance for emp in team)

            total = len(team)
            high_pct = (perf_counts[PerformanceLevel.HIGH] / total * 100) if total > 0 else 0
            med_pct = (perf_counts[PerformanceLevel.MEDIUM] / total * 100) if total > 0 else 0
            low_pct = (perf_counts[PerformanceLevel.LOW] / total * 100) if total > 0 else 0

            print(f"\n{title} ({manager_name}):")
            print(f"  Team Size: {total}")
            print(f"  High:   {perf_counts[PerformanceLevel.HIGH]:2d} ({high_pct:5.1f}%)")
            print(f"  Medium: {perf_counts[PerformanceLevel.MEDIUM]:2d} ({med_pct:5.1f}%)")
            print(f"  Low:    {perf_counts[PerformanceLevel.LOW]:2d} ({low_pct:5.1f}%)")

            # Check if bias pattern is applied correctly
            expected_patterns = {
                "Engineering Manager": {"high": 50, "medium": 40, "low": 10},
                "VP Product": {"high": 5, "medium": 75, "low": 20},
                "Director Sales": {"high": 35, "medium": 60, "low": 5},
            }

            if title in expected_patterns:
                expected = expected_patterns[title]
                # Allow 20% tolerance for small sample sizes
                high_ok = abs(high_pct - expected["high"]) < 20

                status = "OK" if high_ok else "FAIL"
                print(
                    f"  Expected: ~{expected['high']}% high, ~{expected['medium']}% medium, ~{expected['low']}% low"
                )
                print(f"  Status: {status}")

    # Overall baseline check
    print("\n" + "=" * 80)
    print("Overall Dataset Distribution (for comparison):")
    print("=" * 80)

    all_perf = Counter(emp.performance for emp in employees)
    total = len(employees)
    print(
        f"  High:   {all_perf[PerformanceLevel.HIGH]:3d} ({all_perf[PerformanceLevel.HIGH] / total * 100:5.1f}%)"
    )
    print(
        f"  Medium: {all_perf[PerformanceLevel.MEDIUM]:3d} ({all_perf[PerformanceLevel.MEDIUM] / total * 100:5.1f}%)"
    )
    print(
        f"  Low:    {all_perf[PerformanceLevel.LOW]:3d} ({all_perf[PerformanceLevel.LOW] / total * 100:5.1f}%)"
    )


if __name__ == "__main__":
    verify_bias_patterns()
