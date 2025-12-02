#!/usr/bin/env python3
"""
Build comprehensive documentation context for AI agents and developers.

This script:
1. Generates API documentation from Python docstrings (using pdoc3)
2. Summarizes active agent plans
3. Merges everything into docs/CONTEXT.md
4. Updates docs/SUMMARY.md and docs/CHANGELOG.md
5. Prunes old files from agent-tmp/

Environment variables (with defaults):
- CONTEXT_MAX_CHARS: "150000" (max size of CONTEXT.md)
- PLANS_MAX_AGE_DAYS: "21" (max age for active plans)
- CLEAN_TMP_AGE_DAYS: "7" (max age for agent-tmp files)
"""

import os
import re
import subprocess
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any

# Configuration from environment
CONTEXT_MAX_CHARS = int(os.getenv("CONTEXT_MAX_CHARS", "150000"))
PLANS_MAX_AGE_DAYS = int(os.getenv("PLANS_MAX_AGE_DAYS", "21"))
CLEAN_TMP_AGE_DAYS = int(os.getenv("CLEAN_TMP_AGE_DAYS", "7"))

# Paths
REPO_ROOT = Path(__file__).parent.parent
DOCS_DIR = REPO_ROOT / "docs"
GENERATED_DIR = DOCS_DIR / "_generated"
AGENT_PLANS_DIR = REPO_ROOT / "agent-plans"
AGENT_TMP_DIR = REPO_ROOT / "agent-tmp"
SRC_DIR = REPO_ROOT / "src"


def get_git_sha() -> str:
    """Get the current git commit SHA."""
    try:
        result = subprocess.run(
            ["git", "rev-parse", "HEAD"],
            capture_output=True,
            text=True,
            check=True,
            cwd=REPO_ROOT,
        )
        return result.stdout.strip()
    except subprocess.CalledProcessError:
        return "unknown"


def parse_plan_metadata(plan_path: Path) -> dict[str, Any] | None:
    """Parse metadata from a plan.md file.

    Expected format at the start of the file:
    ```yaml
    status: active|paused|done
    owner: <name>
    created: YYYY-MM-DD
    summary:
      - short bullet
      - another bullet
    ```
    """
    try:
        content = plan_path.read_text(encoding="utf-8")

        # Look for YAML frontmatter-style metadata at the start
        # Match from start of file or after opening ```yaml
        pattern = r"(?:^|\n```yaml\n)(status:\s*(\w+)\s*\n.*?owner:\s*(.+?)\s*\n.*?created:\s*(\d{4}-\d{2}-\d{2}))"
        match = re.search(pattern, content, re.DOTALL | re.MULTILINE)

        if not match:
            return None

        status = match.group(2)
        owner = match.group(3)
        created_str = match.group(4)

        # Parse summary bullets
        summary_pattern = r"summary:\s*\n((?:\s*-\s*.+\n?)+)"
        summary_match = re.search(summary_pattern, content, re.MULTILINE)
        summary = []
        if summary_match:
            bullets = summary_match.group(1)
            summary = [
                line.strip()[2:].strip()  # Remove '- ' prefix
                for line in bullets.strip().split("\n")
                if line.strip().startswith("-")
            ]

        return {
            "status": status,
            "owner": owner,
            "created": datetime.strptime(created_str, "%Y-%m-%d").date(),
            "summary": summary,
        }
    except Exception as e:
        print(f"Warning: Could not parse metadata from {plan_path}: {e}", file=sys.stderr)
        return None


def collect_active_plans() -> list[dict[str, Any]]:
    """Collect active plans less than PLANS_MAX_AGE_DAYS old."""
    if not AGENT_PLANS_DIR.exists():
        return []

    active_plans = []
    cutoff_date = datetime.now(timezone.utc).date() - timedelta(days=PLANS_MAX_AGE_DAYS)

    for project_dir in AGENT_PLANS_DIR.iterdir():
        if not project_dir.is_dir():
            continue

        plan_file = project_dir / "plan.md"
        if not plan_file.exists():
            continue

        metadata = parse_plan_metadata(plan_file)
        if not metadata:
            continue

        # Only include active plans within age limit
        if metadata["status"] == "active" and metadata["created"] >= cutoff_date:
            active_plans.append(
                {
                    "project": project_dir.name,
                    "path": plan_file.relative_to(REPO_ROOT),
                    **metadata,
                }
            )

    return sorted(active_plans, key=lambda x: x["created"], reverse=True)


def generate_api_docs() -> bool:
    """Generate API documentation using pdoc3.

    Returns True if successful, False otherwise.
    """
    api_dir = GENERATED_DIR / "api"
    api_dir.mkdir(parents=True, exist_ok=True)

    # Check if pdoc3 is available
    try:
        subprocess.run(
            ["pdoc", "--version"],
            capture_output=True,
            check=True,
        )
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("Warning: pdoc3 not installed, skipping API docs generation", file=sys.stderr)
        return False

    # Generate markdown docs for each package in src/
    if not SRC_DIR.exists():
        print("Warning: src/ directory not found, skipping API docs", file=sys.stderr)
        return False

    try:
        # Find all Python packages in src/
        for item in SRC_DIR.iterdir():
            if item.is_dir() and (item / "__init__.py").exists():
                package_name = item.name

                # Generate markdown documentation
                result = subprocess.run(
                    [
                        "pdoc",
                        "--html",
                        "--force",
                        "--output-dir",
                        str(api_dir),
                        f"src.{package_name}",
                    ],
                    check=False,
                    capture_output=True,
                    text=True,
                    cwd=REPO_ROOT,
                )

                if result.returncode != 0:
                    print(
                        f"Warning: pdoc failed for {package_name}: {result.stderr}", file=sys.stderr
                    )

        return True
    except Exception as e:
        print(f"Warning: Error generating API docs: {e}", file=sys.stderr)
        return False


def generate_plans_index(plans: list[dict[str, Any]]) -> str:
    """Generate markdown index of active plans."""
    if not plans:
        return "# Active Plans\n\nNo active plans at this time.\n"

    lines = ["# Active Plans", ""]
    lines.append(f"**Updated**: {datetime.now(timezone.utc).isoformat()}")
    lines.append(f"**Showing**: Plans with status=active created within {PLANS_MAX_AGE_DAYS} days")
    lines.append("")

    for plan in plans:
        lines.append(f"## {plan['project']}")
        lines.append(f"- **Status**: {plan['status']}")
        lines.append(f"- **Owner**: {plan['owner']}")
        lines.append(f"- **Created**: {plan['created']}")
        lines.append(f"- **Path**: `{plan['path']}`")

        if plan["summary"]:
            lines.append("- **Summary**:")
            for bullet in plan["summary"]:
                lines.append(f"  - {bullet}")

        lines.append("")

    return "\n".join(lines)


def build_context_file(plans: list[dict[str, Any]], git_sha: str) -> str:
    """Build the main CONTEXT.md file."""
    sections = []

    # Header with metadata
    sections.append("# Project Documentation Context")
    sections.append("")
    sections.append(f"**Generated**: {datetime.now(timezone.utc).isoformat()}")
    sections.append(f"**Source SHA**: {git_sha}")
    sections.append(f"**Max Size**: {CONTEXT_MAX_CHARS:,} characters")
    sections.append("")
    sections.append(
        "This file provides comprehensive context about the project for AI agents and developers."
    )
    sections.append("")

    # Include facts.json
    facts_file = DOCS_DIR / "facts.json"
    if facts_file.exists():
        sections.append("## Project Facts")
        sections.append("")
        sections.append("```json")
        sections.append(facts_file.read_text(encoding="utf-8").strip())
        sections.append("```")
        sections.append("")

    # Include active plans summary
    if plans:
        sections.append("## Active Plans")
        sections.append("")
        sections.append(f"There are {len(plans)} active plan(s):")
        sections.append("")
        for plan in plans:
            sections.append(f"### {plan['project']}")
            sections.append(f"- Owner: {plan['owner']}")
            sections.append(f"- Created: {plan['created']}")
            if plan["summary"]:
                sections.append("- Summary:")
                for bullet in plan["summary"]:
                    sections.append(f"  - {bullet}")
            sections.append("")

    # Include API documentation reference
    api_dir = GENERATED_DIR / "api"
    if api_dir.exists() and list(api_dir.iterdir()):
        sections.append("## API Documentation")
        sections.append("")
        sections.append("API documentation is available in `docs/_generated/api/`:")
        sections.append("")
        for api_file in sorted(api_dir.iterdir()):
            if api_file.suffix == ".md":
                sections.append(f"- `{api_file.relative_to(DOCS_DIR)}`")
        sections.append("")

    # Include reference to main README
    readme = REPO_ROOT / "README.md"
    if readme.exists():
        sections.append("## Project README")
        sections.append("")
        sections.append("See the main README.md for project overview and quick start:")
        sections.append("```")
        content = readme.read_text(encoding="utf-8")
        # Include first 2000 chars of README
        if len(content) > 2000:
            sections.append(content[:2000] + "\n...[truncated]")
        else:
            sections.append(content)
        sections.append("```")
        sections.append("")

    # Combine and truncate if needed
    full_content = "\n".join(sections)
    if len(full_content) > CONTEXT_MAX_CHARS:
        full_content = (
            full_content[:CONTEXT_MAX_CHARS]
            + "\n\n...[Content truncated to stay within size limit]"
        )

    return full_content


def update_summary(git_sha: str) -> None:
    """Update the SUMMARY.md file."""
    summary_file = DOCS_DIR / "SUMMARY.md"

    lines = ["# Documentation Summary", ""]
    lines.append(f"**Last Updated**: {datetime.now(timezone.utc).isoformat()}")
    lines.append(f"**Source SHA**: {git_sha}")
    lines.append("")
    lines.append(
        "This file provides a quick index of all documentation components in this project."
    )
    lines.append("")

    lines.append("## Documentation Components")
    lines.append("")
    lines.append("### Core Documentation")
    lines.append("- **CONTEXT.md** - Main generated context file for agents")
    lines.append("- **facts.json** - Stable project truths and configuration")
    lines.append("- **CHANGELOG.md** - Documentation build history")
    lines.append("")

    lines.append("### Generated Documentation (`_generated/`)")

    # List generated files
    if GENERATED_DIR.exists():
        for item in sorted(GENERATED_DIR.rglob("*")):
            if item.is_file():
                rel_path = item.relative_to(DOCS_DIR)
                lines.append(f"- `{rel_path}`")

    lines.append("")
    lines.append("## How to Use This Documentation")
    lines.append("")
    lines.append("### For AI Agents")
    lines.append("1. Start with `CONTEXT.md` for comprehensive project context")
    lines.append("2. Check `facts.json` for stable project information")
    lines.append("3. Review `_generated/plans_index.md` for active work")
    lines.append("4. Consult specific documentation as needed")
    lines.append("")
    lines.append("### For Developers")
    lines.append("1. See `facts.json` for project overview")
    lines.append("2. Check API documentation in `_generated/api/`")
    lines.append("3. Review architecture and design docs in this directory")
    lines.append("4. Check `CHANGELOG.md` for documentation update history")
    lines.append("")
    lines.append("## Regenerating Documentation")
    lines.append("")
    lines.append("To manually regenerate all documentation:")
    lines.append("```bash")
    lines.append("python tools/build_context.py")
    lines.append("```")
    lines.append("")
    lines.append("Documentation is automatically regenerated:")
    lines.append("- On every push that changes source, schema, or docs files")
    lines.append("- Every night at 2 AM UTC")
    lines.append("")

    summary_file.write_text("\n".join(lines), encoding="utf-8")


def update_changelog(git_sha: str, changes: list[str]) -> None:
    """Append an entry to the CHANGELOG.md."""
    changelog_file = DOCS_DIR / "CHANGELOG.md"

    # Read existing content
    if changelog_file.exists():
        existing = changelog_file.read_text(encoding="utf-8")
    else:
        existing = "# Documentation Changelog\n\n"

    # Add new entry
    entry_lines = [
        "",
        f"## Build at {datetime.now(timezone.utc).isoformat()}",
        f"**Source SHA**: {git_sha}",
        "",
        "### Changes",
    ]

    for change in changes:
        entry_lines.append(f"- {change}")

    entry_lines.append("")

    # Insert after header
    header_end = existing.find("\n---\n")
    if header_end > 0:
        # Insert after the --- separator
        new_content = (
            existing[: header_end + 5] + "\n".join(entry_lines) + existing[header_end + 5 :]
        )
    else:
        # Append to end
        new_content = existing + "\n".join(entry_lines)

    changelog_file.write_text(new_content, encoding="utf-8")


def clean_tmp_directory() -> int:
    """Remove files from agent-tmp/ older than CLEAN_TMP_AGE_DAYS.

    Returns the number of files removed.
    """
    if not AGENT_TMP_DIR.exists():
        return 0

    cutoff_time = datetime.now(timezone.utc).timestamp() - (CLEAN_TMP_AGE_DAYS * 86400)
    removed_count = 0

    for item in AGENT_TMP_DIR.rglob("*"):
        if item.is_file() and item.name != "README.md":
            if item.stat().st_mtime < cutoff_time:
                try:
                    item.unlink()
                    removed_count += 1
                except Exception as e:
                    print(f"Warning: Could not remove {item}: {e}", file=sys.stderr)

    return removed_count


def main() -> int:
    """Main entry point."""
    print("Building documentation context...")
    print(f"Repository root: {REPO_ROOT}")
    print("Configuration:")
    print(f"  CONTEXT_MAX_CHARS: {CONTEXT_MAX_CHARS:,}")
    print(f"  PLANS_MAX_AGE_DAYS: {PLANS_MAX_AGE_DAYS}")
    print(f"  CLEAN_TMP_AGE_DAYS: {CLEAN_TMP_AGE_DAYS}")
    print()

    # Ensure directories exist
    GENERATED_DIR.mkdir(parents=True, exist_ok=True)

    # Get git SHA
    git_sha = get_git_sha()
    print(f"Source SHA: {git_sha}")
    print()

    changes = []

    # Generate API documentation
    print("Generating API documentation...")
    if generate_api_docs():
        changes.append("Regenerated API documentation")
        print("  ✓ API docs generated")
    else:
        print("  ⚠ API docs skipped")
    print()

    # Collect active plans
    print("Collecting active plans...")
    plans = collect_active_plans()
    print(f"  Found {len(plans)} active plan(s)")

    if plans:
        # Write plans index
        plans_index = generate_plans_index(plans)
        plans_index_file = GENERATED_DIR / "plans_index.md"
        plans_index_file.write_text(plans_index, encoding="utf-8")
        changes.append(f"Updated plans index ({len(plans)} active plans)")
        print(f"  ✓ Plans index written to {plans_index_file.relative_to(REPO_ROOT)}")
    print()

    # Build main context file
    print("Building CONTEXT.md...")
    context = build_context_file(plans, git_sha)
    context_file = DOCS_DIR / "CONTEXT.md"
    context_file.write_text(context, encoding="utf-8")
    changes.append(f"Rebuilt CONTEXT.md ({len(context):,} chars)")
    print(f"  ✓ CONTEXT.md written ({len(context):,} characters)")
    print()

    # Update SUMMARY.md
    print("Updating SUMMARY.md...")
    update_summary(git_sha)
    changes.append("Updated SUMMARY.md")
    print("  ✓ SUMMARY.md updated")
    print()

    # Update CHANGELOG.md
    print("Updating CHANGELOG.md...")
    update_changelog(git_sha, changes)
    print("  ✓ CHANGELOG.md updated")
    print()

    # Clean temporary files
    print(f"Cleaning agent-tmp/ (files older than {CLEAN_TMP_AGE_DAYS} days)...")
    removed = clean_tmp_directory()
    if removed > 0:
        print(f"  ✓ Removed {removed} old file(s)")
    else:
        print("  ✓ No old files to remove")
    print()

    print("✅ Documentation build complete!")
    return 0


if __name__ == "__main__":
    sys.exit(main())
