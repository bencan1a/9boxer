#!/usr/bin/env python3
"""Smart test selection script for CI/CD workflows.

This script analyzes changed files and selects relevant tests to run.
It maps source files to their corresponding test files and outputs
the tests that should be executed.

Mapping Logic for 9boxer:
- backend/src/ninebox/api/employees.py -> backend/tests/unit/api/test_employees.py
- backend/src/ninebox/services/excel_parser.py -> backend/tests/unit/services/test_excel_parser.py
- backend/src/ninebox/services/intelligence_service.py ->
    - backend/tests/unit/services/test_intelligence_service.py
    - backend/tests/integration/test_intelligence_integration.py (strips _service suffix)
- Test files map to themselves when changed
- Skips __init__.py, main.py, and non-Python files
"""

import argparse
import json
import subprocess
import sys
from pathlib import Path


def get_changed_files(base_ref: str = "origin/main") -> list[str]:
    """Get list of changed files compared to base reference.

    Args:
        base_ref: Git reference to compare against (default: origin/main)

    Returns:
        List of changed file paths
    """
    try:
        # First, fetch the base ref to ensure it's up to date
        subprocess.run(
            ["git", "fetch", "origin", base_ref.replace("origin/", "")],
            check=False,
            capture_output=True,
        )

        # Get the list of changed files
        result = subprocess.run(
            ["git", "diff", "--name-only", f"{base_ref}...HEAD"],
            capture_output=True,
            text=True,
            check=False,
        )

        # If the diff command failed, try fallback
        if result.returncode != 0:
            # Fallback: try to get all changed files in the current commit
            result = subprocess.run(
                ["git", "diff", "--name-only", "HEAD^", "HEAD"],
                capture_output=True,
                text=True,
                check=False,
            )

        changed_files = [f.strip() for f in result.stdout.strip().split("\n") if f.strip()]
        return changed_files
    except subprocess.CalledProcessError as e:
        print(f"Error getting changed files: {e}", file=sys.stderr)
        return []


def map_source_to_tests(source_files: list[str]) -> set[str]:
    """Map source files to their corresponding test files.

    Args:
        source_files: List of source file paths

    Returns:
        Set of test file paths
    """
    test_files = set()
    project_root = Path(__file__).parent.parent.parent

    for source_file in source_files:
        source_path = Path(source_file)

        # Skip non-Python files
        if source_path.suffix != ".py":
            continue

        # Normalize path for comparison (handle Windows backslashes)
        normalized_path = source_path.as_posix()

        # Handle test files themselves - if a test file changes, run that test
        if normalized_path.startswith("backend/tests/"):
            if source_path.exists() and source_path.stem not in {"__init__", "conftest"}:
                test_files.add(normalized_path)
            continue

        # Handle backend source files: backend/src/ninebox/
        if normalized_path.startswith("backend/src/ninebox/"):
            try:
                # Extract relative path from backend/src/ninebox/
                # e.g., backend/src/ninebox/api/employees.py -> api/employees.py
                relative_to_ninebox = source_path.relative_to("backend/src/ninebox")

                # Skip __init__.py and main.py
                if relative_to_ninebox.stem in ("__init__", "main"):
                    continue

                # Extract module directory (e.g., api, services, models, utils, core)
                module_dir = relative_to_ninebox.parent

                # Build test file name: test_<filename>.py
                test_name = f"test_{relative_to_ninebox.stem}.py"

                # Map to unit test: backend/tests/unit/<module>/<test_name>
                unit_test_path = (
                    project_root / "backend" / "tests" / "unit" / module_dir / test_name
                )
                if unit_test_path.exists():
                    # Store as POSIX path (forward slashes) for consistency
                    test_files.add(unit_test_path.relative_to(project_root).as_posix())

                # Also check for integration tests with various naming patterns
                # Pattern 1: test_<filename>_integration.py (exact match)
                integration_test_name = f"test_{relative_to_ninebox.stem}_integration.py"
                integration_test_path = (
                    project_root / "backend" / "tests" / "integration" / integration_test_name
                )
                if integration_test_path.exists():
                    test_files.add(integration_test_path.relative_to(project_root).as_posix())

                # Pattern 2: test_<base_name>_integration.py (strip common suffixes like _service, _manager)
                # e.g., intelligence_service -> intelligence, session_manager -> session
                base_name = relative_to_ninebox.stem
                for suffix in ["_service", "_manager", "_handler", "_controller"]:
                    if base_name.endswith(suffix):
                        base_name = base_name[: -len(suffix)]
                        alternative_integration_name = f"test_{base_name}_integration.py"
                        alternative_integration_path = (
                            project_root
                            / "backend"
                            / "tests"
                            / "integration"
                            / alternative_integration_name
                        )
                        if alternative_integration_path.exists():
                            test_files.add(
                                alternative_integration_path.relative_to(project_root).as_posix()
                            )
                        break  # Only strip one suffix

            except ValueError:
                # Not in backend/src/ninebox/, skip
                continue

    return test_files


def get_changed_source_files(changed_files: list[str]) -> list[str]:
    """Filter changed files to only include source files in backend/src/ninebox directory.

    Args:
        changed_files: List of all changed files

    Returns:
        List of changed source files in backend/src/ninebox directory
    """
    source_files = []
    for file_path in changed_files:
        path = Path(file_path)
        # Normalize path for comparison (handle Windows backslashes)
        normalized_path = path.as_posix()
        if normalized_path.startswith("backend/src/ninebox/") and path.suffix == ".py":
            source_files.append(file_path)
    return source_files


def main() -> int:  # noqa: PLR0912
    """Main entry point for smart test selection."""
    parser = argparse.ArgumentParser(description="Smart test selection based on changed files")
    parser.add_argument(
        "--base-ref",
        default="origin/main",
        help="Git reference to compare against (default: origin/main)",
    )
    parser.add_argument(
        "--format",
        choices=["pytest", "json", "list"],
        default="pytest",
        help="Output format (default: pytest)",
    )
    parser.add_argument(
        "--output-changed-files",
        action="store_true",
        help="Output the changed source files instead of test files",
    )

    args = parser.parse_args()

    # Get changed files
    changed_files = get_changed_files(args.base_ref)

    if not changed_files:
        print("No files changed", file=sys.stderr)
        if args.format == "json":
            print(json.dumps({"tests": [], "changed_files": []}))
        elif args.format == "pytest":
            print("")  # Empty string means no tests to run
        else:
            print("")
        return 0

    # Get changed source files
    changed_source_files = get_changed_source_files(changed_files)

    if args.output_changed_files:
        # Output changed source files (for coverage reporting)
        if args.format == "json":
            print(json.dumps({"changed_files": changed_source_files}))
        else:
            for file in changed_source_files:
                print(file)
        return 0

    # Map to test files
    test_files = map_source_to_tests(changed_source_files)

    # Output based on format
    if args.format == "json":
        print(json.dumps({"tests": sorted(test_files), "changed_files": changed_source_files}))
    elif args.format == "pytest":
        if test_files:
            print(" ".join(sorted(test_files)))
        else:
            print("")  # Empty string means no tests to run
    else:  # list
        for test in sorted(test_files):
            print(test)

    return 0


if __name__ == "__main__":
    sys.exit(main())
