#!/usr/bin/env python3
"""Check documentation file sizes to prevent bloat.

This script is used as a pre-commit hook to ensure documentation files
don't exceed their size limits.
"""

import sys
from pathlib import Path

# File size limits (in bytes)
LIMITS = {
    "CLAUDE_INDEX.md": 15_000,  # 15 KB max
    "AGENTS.md": 20_000,  # 20 KB max
    "GITHUB_AGENT.md": 25_000,  # 25 KB max (comprehensive onboarding)
}


def check_file_size(filepath: str) -> bool:
    """
    Check if file exceeds size limit.

    Args:
        filepath: Path to the file to check

    Returns:
        True if file is within limits, False otherwise
    """
    path = Path(filepath)
    name = path.name

    # Check if file has a limit
    limit = LIMITS.get(name)
    if not limit:
        return True

    # Check size
    size = path.stat().st_size
    if size > limit:
        print(f"[X] {filepath}: {size:,} bytes (limit: {limit:,})")
        print("   -> File is too large! Consider:")
        print("      - Moving detailed content to internal-docs/")
        print("      - Linking to detailed docs instead of embedding")
        print("      - Checking for duplication")
        return False

    print(f"[OK] {filepath}: {size:,} bytes (under {limit:,} limit)")
    return True


def main() -> int:
    """Main entry point."""
    files = sys.argv[1:]
    if not files:
        print("No files to check")
        return 0

    all_pass = all(check_file_size(f) for f in files)
    return 0 if all_pass else 1


if __name__ == "__main__":
    sys.exit(main())
