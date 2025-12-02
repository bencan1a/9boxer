#!/usr/bin/env python3
"""Coverage checker script for specific files.

This script checks that coverage for specific files meets a threshold.
"""

import argparse
import json
import sys
from pathlib import Path

try:
    from coverage import Coverage
except ImportError:
    Coverage = None  # type: ignore


def load_coverage_data(coverage_file: str = ".coverage") -> Coverage:
    """Load coverage data from coverage.py data file.

    Args:
        coverage_file: Path to .coverage file

    Returns:
        Coverage object loaded from the specified file
    """
    if Coverage is None:
        print("Error: coverage package not installed", file=sys.stderr)
        sys.exit(1)

    try:
        cov = Coverage(data_file=coverage_file)
        cov.load()
        return cov
    except Exception as e:
        print(f"Error loading coverage data: {e}", file=sys.stderr)
        sys.exit(1)


def get_file_coverage(cov: Coverage, file_path: str) -> float:
    """Get coverage percentage for a specific file.

    Args:
        cov: Coverage object
        file_path: Path to file to check

    Returns:
        Coverage percentage (0-100)
    """
    try:
        analysis = cov.analysis(file_path)
        if analysis:
            executed = len(analysis[1])  # Executed lines
            missing = len(analysis[2])  # Missing lines
            total = executed + missing
            if total > 0:
                return (executed / total) * 100
        return 0.0
    except Exception:
        return 0.0


def check_coverage_threshold(
    changed_files: list[str], threshold: float = 70.0, coverage_file: str = ".coverage"
) -> bool:
    """Check if coverage meets threshold for changed files.

    Args:
        changed_files: List of files to check coverage for
        threshold: Minimum coverage percentage required
        coverage_file: Path to .coverage file

    Returns:
        True if all files meet threshold, False otherwise
    """
    if not changed_files:
        print("No files to check coverage for")
        return True

    cov = load_coverage_data(coverage_file)
    project_root = Path.cwd()

    all_pass = True
    total_coverage = 0.0
    files_checked = 0

    print(f"\nChecking coverage (threshold: {threshold}%):")
    print("-" * 70)

    for file_path in changed_files:
        # Convert to absolute path
        abs_path = (project_root / file_path).resolve()

        if not abs_path.exists():
            print(f"  {file_path}: File not found")
            continue

        files_checked += 1
        coverage_pct = get_file_coverage(cov, str(abs_path))
        total_coverage += coverage_pct

        status = "✓" if coverage_pct >= threshold else "✗"
        print(f"  {status} {file_path}: {coverage_pct:.1f}%")

        if coverage_pct < threshold:
            all_pass = False

    print("-" * 70)

    if files_checked > 0:
        avg_coverage = total_coverage / files_checked
        print(f"Average coverage: {avg_coverage:.1f}%")

    return all_pass


def main() -> int:
    """Main entry point for coverage checking."""
    parser = argparse.ArgumentParser(description="Check coverage threshold for specific files")
    parser.add_argument(
        "--files",
        nargs="+",
        help="Files to check coverage for",
    )
    parser.add_argument(
        "--threshold",
        type=float,
        default=70.0,
        help="Minimum coverage percentage (default: 70.0)",
    )
    parser.add_argument(
        "--coverage-file",
        default=".coverage",
        help="Path to .coverage file (default: .coverage)",
    )
    parser.add_argument(
        "--files-from-json",
        help="Read files from JSON output of smart_test_selection.py",
    )

    args = parser.parse_args()

    # Get list of files to check
    files_to_check = []

    if args.files_from_json:
        try:
            with Path(args.files_from_json).open() as f:
                data = json.load(f)
                files_to_check = data.get("changed_files", [])
        except Exception as e:
            print(f"Error reading JSON file: {e}", file=sys.stderr)
            return 1
    elif args.files:
        files_to_check = args.files
    else:
        print("No files specified to check", file=sys.stderr)
        return 1

    # Check coverage
    passed = check_coverage_threshold(files_to_check, args.threshold, args.coverage_file)

    if not passed:
        print("\n❌ Coverage check failed: Some files below threshold", file=sys.stderr)
        return 1

    print("\n✅ Coverage check passed: All files meet threshold")
    return 0


if __name__ == "__main__":
    sys.exit(main())
