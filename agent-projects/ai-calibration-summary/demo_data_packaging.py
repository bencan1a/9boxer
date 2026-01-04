"""Demonstration script for data packaging service.

This script shows how the data packaging service works and provides
a sample of the output format for LLM agent consumption.
"""

import json
import sys
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent / "src"))

from ninebox.services.analysis_registry import run_all_analyses
from ninebox.services.data_packaging_service import package_for_ui
from ninebox.services.sample_data_generator import (
    RichDatasetConfig,
    generate_rich_dataset,
)


def main():
    """Generate sample data and package it for LLM agent."""
    print("=" * 80)
    print("Data Packaging Service Demo")
    print("=" * 80)
    print()

    # Generate sample dataset
    print("1. Generating sample dataset (50 employees)...")
    config = RichDatasetConfig(
        size=50,
        include_bias=True,
        seed=42,  # For reproducibility
    )
    employees = generate_rich_dataset(config)
    print(f"   Generated {len(employees)} employees")
    print()

    # Run all analyses
    print("2. Running statistical analyses...")
    analyses = run_all_analyses(employees)
    print(f"   Completed {len(analyses)} analyses:")
    for name, result in analyses.items():
        status = result.get("status", "unknown")
        p_value = result.get("p_value", 0)
        print(f"   - {name}: {status} (p={p_value:.4f})")
    print()

    # Package for UI display (includes all fields)
    print("3. Packaging data for UI display (includes all employee fields)...")
    package = package_for_ui(employees, analyses)
    print(f"   Package created with {len(package)} top-level sections:")
    for key in package:
        print(f"   - {key}")
    print()

    # Show sample output
    print("4. Sample Output Structure:")
    print("-" * 80)
    print()

    # Show first employee
    if package["employees"]:
        print("Sample Employee Record:")
        print(json.dumps(package["employees"][0], indent=2))
        print()

    # Show overview
    print("Data Overview:")
    print(json.dumps(package["overview"], indent=2))
    print()

    # Show organization summary
    print("Organization Summary:")
    org_summary = {
        "total_employees": package["organization"]["total_employees"],
        "total_managers": package["organization"]["total_managers"],
        "levels_present": package["organization"]["levels_present"],
    }
    print(json.dumps(org_summary, indent=2))
    print()

    # Show first manager
    if package["organization"]["managers"]:
        print("Sample Manager Record:")
        print(json.dumps(package["organization"]["managers"][0], indent=2))
        print()

    # Show analysis summary
    print("Analysis Results Summary:")
    analysis_summary = {
        name: {
            "status": result.get("status"),
            "p_value": result.get("p_value"),
            "sample_size": result.get("sample_size"),
        }
        for name, result in package["analyses"].items()
    }
    print(json.dumps(analysis_summary, indent=2))
    print()

    # Save full package to file for inspection
    output_file = Path(__file__).parent / "demo_package_output.json"
    with output_file.open("w") as f:
        json.dump(package, f, indent=2, default=str)  # default=str for date serialization

    print(f"5. Full package saved to: {output_file}")
    print()
    print("=" * 80)
    print("Demo Complete!")
    print("=" * 80)


if __name__ == "__main__":
    main()
