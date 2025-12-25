#!/usr/bin/env python3
"""
Translation file validator for i18n JSON files.

This script validates translation files for:
- JSON syntax correctness
- Key parity between languages
- Structure consistency
- Placeholder consistency (e.g., {{variable}})

Usage:
    python validate-translations.py [translation_files...]

Exit codes:
    0: All validations passed
    1: Validation errors found
"""

import argparse
import json
import re
import sys
from pathlib import Path
from typing import Any

# Fix Windows console encoding for Unicode characters
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")  # type: ignore
    sys.stderr.reconfigure(encoding="utf-8")  # type: ignore


def extract_placeholders(text: str) -> set[str]:
    """Extract placeholder variables from translation text (e.g., {{count}}, {{name}})."""
    return set(re.findall(r"\{\{(\w+)\}\}", text))


def flatten_keys(data: dict[str, Any], parent_key: str = "") -> dict[str, Any]:
    """Flatten nested dictionary into dot-notation keys."""
    items: dict[str, Any] = {}
    for key, value in data.items():
        new_key = f"{parent_key}.{key}" if parent_key else key
        if isinstance(value, dict):
            items.update(flatten_keys(value, new_key))
        else:
            items[new_key] = value
    return items


def get_structure_paths(data: dict[str, Any], parent_key: str = "") -> set[str]:
    """Get all structural paths (including intermediate keys) from nested dictionary."""
    paths = set()
    for key, value in data.items():
        new_key = f"{parent_key}.{key}" if parent_key else key
        paths.add(new_key)
        if isinstance(value, dict):
            paths.update(get_structure_paths(value, new_key))
    return paths


def validate_json_syntax(file_path: Path) -> tuple[bool, str | None, dict[str, Any] | None]:
    """Validate JSON syntax of a file."""
    try:
        with file_path.open(encoding="utf-8") as f:
            data = json.load(f)
        return True, None, data
    except json.JSONDecodeError as e:
        return False, f"JSON syntax error at line {e.lineno}, column {e.colno}: {e.msg}", None
    except Exception as e:
        return False, f"Error reading file: {e}", None


def validate_translations(translation_files: list[Path]) -> int:
    """
    Validate translation files.

    Returns:
        0 if all validations pass, 1 if any validation fails
    """
    if not translation_files:
        print("Error: No translation files provided", file=sys.stderr)
        return 1

    # Step 1: Validate JSON syntax for all files
    print("Validating JSON syntax...")
    file_data: dict[Path, dict[str, Any]] = {}
    has_errors = False

    for file_path in translation_files:
        success, error, data = validate_json_syntax(file_path)
        if not success:
            print(f"✗ {file_path}: {error}", file=sys.stderr)
            has_errors = True
        else:
            print(f"✓ {file_path}: Valid JSON")
            file_data[file_path] = data  # type: ignore

    if has_errors:
        return 1

    # Step 2: Validate key parity and structure consistency
    if len(translation_files) >= 2:
        print("\nValidating key parity and structure consistency...")

        # Get flattened keys and structure for all files
        all_flat_keys: dict[Path, dict[str, Any]] = {}
        all_structures: dict[Path, set[str]] = {}

        for file_path, data in file_data.items():
            all_flat_keys[file_path] = flatten_keys(data)
            all_structures[file_path] = get_structure_paths(data)

        # Compare each pair of files
        file_list = list(file_data.keys())
        for i in range(len(file_list)):
            for j in range(i + 1, len(file_list)):
                file1, file2 = file_list[i], file_list[j]
                keys1 = set(all_flat_keys[file1].keys())
                keys2 = set(all_flat_keys[file2].keys())
                struct1 = all_structures[file1]
                struct2 = all_structures[file2]

                # Check for missing keys
                missing_in_file2 = keys1 - keys2
                missing_in_file1 = keys2 - keys1

                if missing_in_file2:
                    print(f"\n✗ Keys in {file1.name} but missing in {file2.name}:", file=sys.stderr)
                    for key in sorted(missing_in_file2):
                        print(f"  - {key}", file=sys.stderr)
                    has_errors = True

                if missing_in_file1:
                    print(f"\n✗ Keys in {file2.name} but missing in {file1.name}:", file=sys.stderr)
                    for key in sorted(missing_in_file1):
                        print(f"  - {key}", file=sys.stderr)
                    has_errors = True

                # Check for structural inconsistencies
                missing_struct_in_file2 = struct1 - struct2
                missing_struct_in_file1 = struct2 - struct1

                if missing_struct_in_file2:
                    print(
                        f"\n✗ Structure paths in {file1.name} but missing in {file2.name}:",
                        file=sys.stderr,
                    )
                    for path in sorted(missing_struct_in_file2):
                        print(f"  - {path}", file=sys.stderr)
                    has_errors = True

                if missing_struct_in_file1:
                    print(
                        f"\n✗ Structure paths in {file2.name} but missing in {file1.name}:",
                        file=sys.stderr,
                    )
                    for path in sorted(missing_struct_in_file1):
                        print(f"  - {path}", file=sys.stderr)
                    has_errors = True

                if not (
                    missing_in_file2
                    or missing_in_file1
                    or missing_struct_in_file2
                    or missing_struct_in_file1
                ):
                    print(f"✓ {file1.name} ↔ {file2.name}: Keys and structure match")

        # Step 3: Validate placeholder consistency
        print("\nValidating placeholder consistency...")

        for i in range(len(file_list)):
            for j in range(i + 1, len(file_list)):
                file1, file2 = file_list[i], file_list[j]
                flat1 = all_flat_keys[file1]
                flat2 = all_flat_keys[file2]

                # Only check keys that exist in both files
                common_keys = set(flat1.keys()) & set(flat2.keys())

                inconsistent_placeholders = []
                for key in common_keys:
                    val1 = flat1[key]
                    val2 = flat2[key]

                    # Only check string values
                    if isinstance(val1, str) and isinstance(val2, str):
                        placeholders1 = extract_placeholders(val1)
                        placeholders2 = extract_placeholders(val2)

                        if placeholders1 != placeholders2:
                            inconsistent_placeholders.append(
                                (key, placeholders1, placeholders2, val1, val2)
                            )

                if inconsistent_placeholders:
                    print(
                        f"\n✗ Placeholder inconsistencies between {file1.name} and {file2.name}:",
                        file=sys.stderr,
                    )
                    for key, ph1, ph2, val1, val2 in inconsistent_placeholders:
                        print(f"  - {key}:", file=sys.stderr)
                        print(f"    {file1.name}: {ph1} in '{val1}'", file=sys.stderr)
                        print(f"    {file2.name}: {ph2} in '{val2}'", file=sys.stderr)
                    has_errors = True
                else:
                    print(f"✓ {file1.name} ↔ {file2.name}: Placeholders consistent")

    if has_errors:
        return 1

    print("\n✅ All validation checks passed!")
    return 0


def main() -> int:
    """Main entry point."""
    parser = argparse.ArgumentParser(
        description="Validate i18n translation JSON files",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Validate all translation files
  %(prog)s frontend/src/i18n/locales/*/translation.json

  # Validate specific files
  %(prog)s en/translation.json es/translation.json
        """,
    )
    parser.add_argument(
        "files",
        nargs="+",
        type=Path,
        metavar="FILE",
        help="Translation JSON files to validate",
    )

    args = parser.parse_args()

    # Validate that all files exist
    missing_files = [f for f in args.files if not f.exists()]
    if missing_files:
        print("Error: The following files do not exist:", file=sys.stderr)
        for f in missing_files:
            print(f"  - {f}", file=sys.stderr)
        return 1

    return validate_translations(args.files)


if __name__ == "__main__":
    sys.exit(main())
