#!/usr/bin/env python3
"""Test script to verify the new agent-first LLM architecture.

This script demonstrates the new generate_calibration_analysis() method
that replaces the two-step approach.
"""

import json
import sys
from datetime import date
from pathlib import Path

# Add backend/src to Python path
backend_src = Path(__file__).parent / "src"
sys.path.insert(0, str(backend_src))

from ninebox.models.employee import Employee, PerformanceLevel, PotentialLevel
from ninebox.services.analysis_registry import run_all_analyses
from ninebox.services.data_packaging_service import package_for_llm
from ninebox.services.llm_service import LLMService, load_system_prompt


def test_load_system_prompt():
    """Test loading the system prompt from config file."""
    print("=" * 80)
    print("TEST 1: Load System Prompt")
    print("=" * 80)

    try:
        prompt = load_system_prompt()
        print("[OK] System prompt loaded successfully")
        print(f"[OK] Prompt length: {len(prompt)} characters")
        print(f"[OK] First 200 chars: {prompt[:200]}...")
        print()
        return True
    except Exception as e:
        print(f"[FAIL] Failed to load system prompt: {e}")
        print()
        return False


def test_data_packaging():
    """Test packaging data for LLM analysis."""
    print("=" * 80)
    print("TEST 2: Data Packaging")
    print("=" * 80)

    # Create sample employees
    employees = [
        Employee(
            employee_id=1,
            name="Alice Smith",
            business_title="Senior Engineer",
            job_title="Software Engineer III",
            job_profile="Engineering/MT5/USA",
            job_level="MT5",
            job_function="Engineering",
            location="USA",
            direct_manager="MGR001",
            hire_date=date(2020, 1, 15),
            tenure_category="2-5 years",
            time_in_job_profile="3.5 years",
            performance=PerformanceLevel.HIGH,
            potential=PotentialLevel.HIGH,
            grid_position=9,
            talent_indicator="Star",
        ),
        Employee(
            employee_id=2,
            name="Bob Jones",
            business_title="Engineer",
            job_title="Software Engineer II",
            job_profile="Engineering/MT4/USA",
            job_level="MT4",
            job_function="Engineering",
            location="USA",
            direct_manager="MGR001",
            hire_date=date(2022, 6, 1),
            tenure_category="< 1 year",
            time_in_job_profile="1.5 years",
            performance=PerformanceLevel.MEDIUM,
            potential=PotentialLevel.MEDIUM,
            grid_position=5,
            talent_indicator="Solid Contributor",
        ),
        Employee(
            employee_id=3,
            name="Carol White",
            business_title="Product Manager",
            job_title="Senior Product Manager",
            job_profile="Product/MT5/USA",
            job_level="MT5",
            job_function="Product",
            location="USA",
            direct_manager="MGR002",
            hire_date=date(2019, 3, 10),
            tenure_category="2-5 years",
            time_in_job_profile="4.8 years",
            performance=PerformanceLevel.HIGH,
            potential=PotentialLevel.MEDIUM,
            grid_position=6,
            talent_indicator="High Performer",
        ),
    ]

    # Run analyses
    analyses = run_all_analyses(employees)

    # Package for LLM (anonymized)
    package = package_for_llm(employees, analyses)

    print(f"[OK] Packaged {len(package['employees'])} employees")
    print(f"[OK] Overview: {package['overview']['total_employees']} total employees")
    print(f"[OK] Analyses included: {list(package['analyses'].keys())}")

    # Verify anonymization
    first_employee = package["employees"][0]
    if "employee_id" not in first_employee:
        print(f"[OK] Employee IDs are anonymized (using '{first_employee['id']}')")
    else:
        print("[FAIL] Employee IDs are NOT anonymized!")
        return False, None

    if "business_title" not in first_employee:
        print("[OK] Business titles are anonymized")
    else:
        print("[FAIL] Business titles are NOT anonymized!")
        return False, None

    print(f"[OK] Package size: {len(json.dumps(package))} bytes")
    print()
    return True, package


def test_generate_calibration_analysis(package):
    """Test the new generate_calibration_analysis() method."""
    print("=" * 80)
    print("TEST 3: Generate Calibration Analysis")
    print("=" * 80)

    # Initialize LLM service
    llm_service = LLMService()

    # Check availability
    availability = llm_service.is_available()
    if not availability["available"]:
        print(f"[WARN] LLM service not available: {availability['reason']}")
        print("[WARN] Skipping API test (this is expected if ANTHROPIC_API_KEY is not set)")
        print()
        return True

    print("[OK] LLM service is available")
    print(f"[OK] Using model: {llm_service.model}")

    try:
        print("[OK] Calling generate_calibration_analysis()...")
        result = llm_service.generate_calibration_analysis(package)

        print("[OK] Analysis generated successfully!")
        print(f"[OK] Summary length: {len(result['summary'])} characters")
        print(f"[OK] Number of issues: {len(result['issues'])}")

        # Display summary
        print()
        print("SUMMARY:")
        print("-" * 80)
        print(
            result["summary"][:500] + "..." if len(result["summary"]) > 500 else result["summary"]
        )
        print()

        # Display issues
        print("ISSUES:")
        print("-" * 80)
        for i, issue in enumerate(result["issues"][:3], 1):
            print(f"{i}. [{issue['priority'].upper()}] {issue['title']}")
            print(f"   Type: {issue['type']}, Category: {issue['category']}")
            print(f"   Affected: {issue['affected_count']} employees")
            if issue.get("cluster_id"):
                print(f"   Cluster: {issue['cluster_title']} ({issue['cluster_id']})")
            print()

        if len(result["issues"]) > 3:
            print(f"... and {len(result['issues']) - 3} more issues")
            print()

        return True

    except Exception as e:
        print(f"[FAIL] Failed to generate analysis: {e}")
        import traceback

        traceback.print_exc()
        print()
        return False


def test_deprecation_warning():
    """Test that generate_summary() shows deprecation warning."""
    print("=" * 80)
    print("TEST 4: Deprecation Warning")
    print("=" * 80)

    import warnings

    # Initialize service without API key to test warning
    llm_service = LLMService()

    print("[OK] Calling deprecated generate_summary() method...")

    with warnings.catch_warnings(record=True) as w:
        warnings.simplefilter("always")

        try:
            # This will fail due to no API key, but we should see the deprecation warning
            llm_service.generate_summary(
                selected_insight_ids=["test-id"],
                insights=[{"id": "test-id", "title": "Test"}],
                data_overview={"total_employees": 100},
            )
        except RuntimeError:
            # Expected - no API key
            pass

        # Check for deprecation warning
        deprecation_warnings = [
            warning for warning in w if issubclass(warning.category, DeprecationWarning)
        ]

        if deprecation_warnings:
            print(f"[OK] Deprecation warning raised: {deprecation_warnings[0].message}")
            print()
            return True
        else:
            print("[FAIL] No deprecation warning raised!")
            print()
            return False


def main():
    """Run all tests."""
    print()
    print("=" * 80)
    print("LLM Service Agent-First Architecture Test Suite")
    print("=" * 80)
    print()

    results = []

    # Test 1: Load system prompt
    results.append(test_load_system_prompt())

    # Test 2: Data packaging
    success, package = test_data_packaging()
    results.append(success)

    # Test 3: Generate analysis (only if package was created)
    if package:
        results.append(test_generate_calibration_analysis(package))

    # Test 4: Deprecation warning
    results.append(test_deprecation_warning())

    # Summary
    print("=" * 80)
    print("TEST SUMMARY")
    print("=" * 80)
    passed = sum(results)
    total = len(results)
    print(f"Passed: {passed}/{total}")

    if passed == total:
        print("[OK] All tests passed!")
    else:
        print(f"[FAIL] {total - passed} test(s) failed")

    print()

    return 0 if passed == total else 1


if __name__ == "__main__":
    sys.exit(main())
