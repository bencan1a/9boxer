#!/usr/bin/env python3
"""Architectural Review Tool for 9Boxer.

This tool analyzes recent commits and pull requests to identify potential
architectural drift and quality issues. It's designed to be run by the
architectural review board agent on a weekly basis.

Usage:
    python tools/architecture_review.py --days 7 --output report.md
"""

import argparse
import json
import subprocess
import sys
from collections import defaultdict
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from pathlib import Path
from typing import Any


@dataclass
class ArchitecturalFinding:
    """Represents an architectural finding from the review."""

    severity: str  # CRITICAL, HIGH, MEDIUM, LOW
    category: str  # Architecture, Design Pattern, Quality, Security, Performance
    title: str
    description: str
    commit_sha: str
    files_affected: list[str]
    recommendation: str
    principles_violated: list[str] = field(default_factory=list)


@dataclass
class CommitInfo:
    """Information about a commit."""

    sha: str
    author: str
    email: str
    date: str
    message: str
    files_changed: list[str] = field(default_factory=list)


class ArchitecturalReviewer:
    """Performs architectural review of recent changes."""

    def __init__(self, repo_root: Path, days: int = 7):
        """Initialize the reviewer.

        Args:
            repo_root: Root directory of the repository
            days: Number of days to look back for commits
        """
        self.repo_root = repo_root
        self.days = days
        self.findings: list[ArchitecturalFinding] = []
        self.commits: list[CommitInfo] = []

    def run_review(self) -> dict[str, Any]:
        """Run the complete architectural review.

        Returns:
            Dictionary containing review results
        """
        print(f"🔍 Starting architectural review for last {self.days} days...")

        # Gather commits
        self.commits = self._get_recent_commits()
        print(f"✓ Found {len(self.commits)} commits to review")

        # Analyze each commit
        for commit in self.commits:
            self._analyze_commit(commit)

        # Generate summary
        summary = self._generate_summary()
        print(f"✓ Review complete: {len(self.findings)} findings")

        return summary

    def _get_recent_commits(self) -> list[CommitInfo]:
        """Get commits from the last N days.

        Returns:
            List of commit information
        """
        since_date = (datetime.now() - timedelta(days=self.days)).strftime("%Y-%m-%d")

        try:
            # Get commit info
            cmd = [
                "git",
                "log",
                f"--since={since_date}",
                "--pretty=format:%H|%an|%ae|%ad|%s",
                "--date=iso",
            ]
            result = subprocess.run(
                cmd,
                cwd=self.repo_root,
                capture_output=True,
                text=True,
                check=True,
            )

            commits = []
            for line in result.stdout.strip().split("\n"):
                if not line:
                    continue

                parts = line.split("|", 4)
                if len(parts) == 5:
                    sha, author, email, date, message = parts
                    commit = CommitInfo(
                        sha=sha,
                        author=author,
                        email=email,
                        date=date,
                        message=message,
                    )

                    # Get files changed in this commit
                    files_cmd = ["git", "show", "--name-only", "--pretty=format:", sha]
                    files_result = subprocess.run(
                        files_cmd,
                        cwd=self.repo_root,
                        capture_output=True,
                        text=True,
                        check=True,
                    )
                    commit.files_changed = [
                        f for f in files_result.stdout.strip().split("\n") if f
                    ]
                    commits.append(commit)

            return commits

        except subprocess.CalledProcessError as e:
            print(f"❌ Error getting commits: {e}")
            return []

    def _analyze_commit(self, commit: CommitInfo) -> None:
        """Analyze a single commit for architectural issues.

        Args:
            commit: Commit information to analyze
        """
        # Check for type annotation issues in Python files
        self._check_python_type_annotations(commit)

        # Check for architectural boundary violations
        self._check_architectural_boundaries(commit)

        # Check for quality standard violations
        self._check_quality_standards(commit)

        # Check for security patterns
        self._check_security_patterns(commit)

        # Check for documentation updates
        self._check_documentation_updates(commit)

        # Check for test coverage
        self._check_test_coverage(commit)

    def _check_python_type_annotations(self, commit: CommitInfo) -> None:
        """Check if Python files have proper type annotations.

        Args:
            commit: Commit to check
        """
        python_files = [f for f in commit.files_changed if f.endswith(".py")]
        if not python_files:
            return

        # Get the diff to check for function definitions without type annotations
        try:
            diff_cmd = ["git", "show", commit.sha]
            result = subprocess.run(
                diff_cmd,
                cwd=self.repo_root,
                capture_output=True,
                text=True,
                check=True,
            )

            diff_content = result.stdout

            # Simple heuristic: look for "def " without type hints
            # This is not perfect but catches obvious cases
            lines = diff_content.split("\n")
            suspicious_lines = []

            for i, line in enumerate(lines):
                if line.startswith("+") and "def " in line and "(" in line:
                    # Check if it looks like it's missing type annotations
                    if "->" not in line and "# type: ignore" not in line:
                        # Skip __init__ and some common patterns
                        if (
                            "__init__" not in line
                            and "self" not in line.split("(")[0]
                            and "cls" not in line.split("(")[0]
                        ):
                            suspicious_lines.append((i + 1, line.strip()))

            if suspicious_lines and len(suspicious_lines) > 2:
                # Only report if multiple functions are missing annotations
                self.findings.append(
                    ArchitecturalFinding(
                        severity="HIGH",
                        category="Quality",
                        title="Missing type annotations in Python code",
                        description=f"Found {len(suspicious_lines)} function definitions that may be missing type annotations",
                        commit_sha=commit.sha[:7],
                        files_affected=python_files,
                        recommendation="Add type annotations to all function parameters and return types. This is a mandatory quality standard.",
                        principles_violated=["Type Safety Everywhere"],
                    )
                )

        except subprocess.CalledProcessError:
            pass  # Skip if we can't get the diff

    def _check_architectural_boundaries(self, commit: CommitInfo) -> None:
        """Check for architectural boundary violations.

        Args:
            commit: Commit to check
        """
        # Check if backend files are importing frontend code or vice versa
        backend_files = [
            f for f in commit.files_changed if f.startswith("backend/src/")
        ]
        frontend_files = [
            f for f in commit.files_changed if f.startswith("frontend/src/")
        ]

        # If commit touches both backend and frontend, flag for review
        if backend_files and frontend_files:
            # Check if it's a legitimate cross-cutting change
            is_config_change = any(
                "config" in f.lower() or "package" in f.lower()
                for f in commit.files_changed
            )

            if not is_config_change:
                self.findings.append(
                    ArchitecturalFinding(
                        severity="MEDIUM",
                        category="Architecture",
                        title="Cross-boundary change detected",
                        description="Commit modifies both backend and frontend code. Verify this maintains clean separation of concerns.",
                        commit_sha=commit.sha[:7],
                        files_affected=backend_files + frontend_files,
                        recommendation="Review to ensure frontend/backend boundaries are maintained. Each layer should have clear responsibilities.",
                        principles_violated=["Clean Separation of Concerns"],
                    )
                )

    def _check_quality_standards(self, commit: CommitInfo) -> None:
        """Check for quality standard violations.

        Args:
            commit: Commit to check
        """
        # Check if pyproject.toml or package.json were modified
        # This could indicate dependency changes that need review
        dependency_files = ["pyproject.toml", "frontend/package.json"]
        modified_deps = [f for f in commit.files_changed if f in dependency_files]

        if modified_deps:
            self.findings.append(
                ArchitecturalFinding(
                    severity="MEDIUM",
                    category="Quality",
                    title="Dependency changes detected",
                    description=f"Dependencies were modified in: {', '.join(modified_deps)}",
                    commit_sha=commit.sha[:7],
                    files_affected=modified_deps,
                    recommendation="Review new dependencies for security, license compatibility, and bundle size impact. Run security audit tools.",
                    principles_violated=[],
                )
            )

    def _check_security_patterns(self, commit: CommitInfo) -> None:
        """Check for security-related patterns.

        Args:
            commit: Commit to check
        """
        # Check Electron main process files
        electron_files = [
            f for f in commit.files_changed if "electron/main" in f or "preload" in f
        ]

        if electron_files:
            # Get diff to check for security anti-patterns
            try:
                diff_cmd = ["git", "show", commit.sha]
                result = subprocess.run(
                    diff_cmd,
                    cwd=self.repo_root,
                    capture_output=True,
                    text=True,
                    check=True,
                )

                diff_content = result.stdout.lower()

                # Check for security anti-patterns
                security_issues = []
                if "nodeintegration: true" in diff_content:
                    security_issues.append("nodeIntegration enabled")
                if "contextisolation: false" in diff_content:
                    security_issues.append("contextIsolation disabled")
                if "sandbox: false" in diff_content:
                    security_issues.append("sandbox disabled")

                if security_issues:
                    self.findings.append(
                        ArchitecturalFinding(
                            severity="CRITICAL",
                            category="Security",
                            title="Security anti-patterns detected in Electron",
                            description=f"Found security issues: {', '.join(security_issues)}",
                            commit_sha=commit.sha[:7],
                            files_affected=electron_files,
                            recommendation="Remove security anti-patterns. contextIsolation must be true, nodeIntegration must be false, sandbox should be true.",
                            principles_violated=["Security by Default"],
                        )
                    )

            except subprocess.CalledProcessError:
                pass

    def _check_documentation_updates(self, commit: CommitInfo) -> None:
        """Check if documentation was updated for significant changes.

        Args:
            commit: Commit to check
        """
        # Check if significant code changes were made without doc updates
        code_files = [
            f
            for f in commit.files_changed
            if f.endswith((".py", ".ts", ".tsx", ".js", ".jsx"))
            and not f.startswith("backend/tests/")
            and not f.endswith(".test.ts")
            and not f.endswith(".test.tsx")
        ]

        doc_files = [
            f
            for f in commit.files_changed
            if f.endswith(".md") or "docs/" in f or "README" in f
        ]

        # If many code files changed but no docs, flag it
        if len(code_files) >= 5 and not doc_files:
            # Check if it's a refactoring (common terms in message)
            is_refactor = any(
                term in commit.message.lower()
                for term in ["refactor", "rename", "move", "reorganize"]
            )

            if not is_refactor:
                self.findings.append(
                    ArchitecturalFinding(
                        severity="LOW",
                        category="Documentation",
                        title="Significant changes without documentation updates",
                        description=f"Changed {len(code_files)} code files but no documentation updated",
                        commit_sha=commit.sha[:7],
                        files_affected=code_files[:5],  # First 5 files
                        recommendation="Consider updating documentation to reflect significant code changes. This helps maintain up-to-date docs.",
                        principles_violated=[],
                    )
                )

    def _check_test_coverage(self, commit: CommitInfo) -> None:
        """Check if tests were added for new code.

        Args:
            commit: Commit to check
        """
        # Check if new source files were added without corresponding tests
        new_source_files = []
        new_test_files = []

        try:
            # Get list of new files (not just modified)
            diff_cmd = ["git", "show", "--diff-filter=A", "--name-only", commit.sha]
            result = subprocess.run(
                diff_cmd,
                cwd=self.repo_root,
                capture_output=True,
                text=True,
                check=True,
            )

            new_files = [f for f in result.stdout.strip().split("\n") if f]

            for f in new_files:
                if f.endswith(".py") and f.startswith("backend/src/"):
                    new_source_files.append(f)
                elif f.endswith(".py") and f.startswith("backend/tests/"):
                    new_test_files.append(f)
                elif f.endswith((".ts", ".tsx")) and f.startswith("frontend/src/"):
                    # Skip certain files
                    if not any(
                        skip in f for skip in ["types/", "utils/", "constants/"]
                    ):
                        new_source_files.append(f)
                elif f.endswith((".test.ts", ".test.tsx")):
                    new_test_files.append(f)

            # If new source files but no new tests, flag it
            if new_source_files and not new_test_files:
                self.findings.append(
                    ArchitecturalFinding(
                        severity="MEDIUM",
                        category="Quality",
                        title="New code without tests",
                        description=f"Added {len(new_source_files)} new source files but no test files",
                        commit_sha=commit.sha[:7],
                        files_affected=new_source_files,
                        recommendation="Add tests for new functionality. Maintain test coverage above 80% threshold.",
                        principles_violated=["Test-Driven Quality"],
                    )
                )

        except subprocess.CalledProcessError:
            pass

    def _generate_summary(self) -> dict[str, Any]:
        """Generate a summary of the review.

        Returns:
            Dictionary containing review summary
        """
        # Count findings by severity
        severity_counts = defaultdict(int)
        category_counts = defaultdict(int)

        for finding in self.findings:
            severity_counts[finding.severity] += 1
            category_counts[finding.category] += 1

        return {
            "review_date": datetime.now().isoformat(),
            "days_reviewed": self.days,
            "commits_reviewed": len(self.commits),
            "findings_count": len(self.findings),
            "severity_breakdown": dict(severity_counts),
            "category_breakdown": dict(category_counts),
            "findings": [
                {
                    "severity": f.severity,
                    "category": f.category,
                    "title": f.title,
                    "description": f.description,
                    "commit": f.commit_sha,
                    "files": f.files_affected,
                    "recommendation": f.recommendation,
                    "principles_violated": f.principles_violated,
                }
                for f in self.findings
            ],
            "commits": [
                {
                    "sha": c.sha[:7],
                    "author": c.author,
                    "date": c.date,
                    "message": c.message,
                    "files_changed": len(c.files_changed),
                }
                for c in self.commits
            ],
        }

    def generate_markdown_report(self, summary: dict[str, Any]) -> str:
        """Generate a markdown report from the review summary.

        Args:
            summary: Review summary dictionary

        Returns:
            Markdown formatted report
        """
        report = [
            "# Architectural Review Report",
            "",
            f"**Review Date**: {summary['review_date']}",
            f"**Period**: Last {summary['days_reviewed']} days",
            f"**Commits Reviewed**: {summary['commits_reviewed']}",
            f"**Findings**: {summary['findings_count']}",
            "",
            "## Executive Summary",
            "",
        ]

        # Add severity breakdown
        if summary["severity_breakdown"]:
            report.append("### Findings by Severity")
            report.append("")
            report.append("| Severity | Count |")
            report.append("|----------|-------|")
            for severity in ["CRITICAL", "HIGH", "MEDIUM", "LOW"]:
                count = summary["severity_breakdown"].get(severity, 0)
                icon = {
                    "CRITICAL": "🔴",
                    "HIGH": "🟠",
                    "MEDIUM": "🟡",
                    "LOW": "🟢",
                }.get(severity, "⚪")
                report.append(f"| {icon} {severity} | {count} |")
            report.append("")

        # Add category breakdown
        if summary["category_breakdown"]:
            report.append("### Findings by Category")
            report.append("")
            report.append("| Category | Count |")
            report.append("|----------|-------|")
            for category, count in summary["category_breakdown"].items():
                report.append(f"| {category} | {count} |")
            report.append("")

        # Add detailed findings
        if summary["findings"]:
            report.append("## Detailed Findings")
            report.append("")

            # Group by severity
            for severity in ["CRITICAL", "HIGH", "MEDIUM", "LOW"]:
                severity_findings = [
                    f for f in summary["findings"] if f["severity"] == severity
                ]

                if severity_findings:
                    icon = {
                        "CRITICAL": "🔴",
                        "HIGH": "🟠",
                        "MEDIUM": "🟡",
                        "LOW": "🟢",
                    }.get(severity, "⚪")
                    report.append(f"### {icon} {severity} Priority")
                    report.append("")

                    for i, finding in enumerate(severity_findings, 1):
                        report.append(f"#### {i}. {finding['title']}")
                        report.append("")
                        report.append(f"**Category**: {finding['category']}")
                        report.append(f"**Commit**: `{finding['commit']}`")
                        report.append("")
                        report.append(f"**Description**: {finding['description']}")
                        report.append("")
                        report.append(
                            f"**Files Affected** ({len(finding['files'])} files):"
                        )
                        for file in finding["files"][:5]:  # Show first 5
                            report.append(f"- `{file}`")
                        if len(finding["files"]) > 5:
                            report.append(
                                f"- _{len(finding['files']) - 5} more files..._"
                            )
                        report.append("")
                        report.append(f"**Recommendation**: {finding['recommendation']}")

                        if finding["principles_violated"]:
                            report.append("")
                            report.append("**Principles Violated**:")
                            for principle in finding["principles_violated"]:
                                report.append(f"- {principle}")

                        report.append("")
                        report.append("---")
                        report.append("")

        # Add commit summary
        if summary["commits"]:
            report.append("## Commits Reviewed")
            report.append("")
            report.append("| Commit | Author | Date | Message | Files |")
            report.append("|--------|--------|------|---------|-------|")
            for commit in summary["commits"][:20]:  # Show first 20
                message = commit["message"][:60]
                if len(commit["message"]) > 60:
                    message += "..."
                report.append(
                    f"| `{commit['sha']}` | {commit['author']} | {commit['date'][:10]} | {message} | {commit['files_changed']} |"
                )
            if len(summary["commits"]) > 20:
                report.append(
                    f"| ... | ... | ... | _{len(summary['commits']) - 20} more commits_ | ... |"
                )
            report.append("")

        # Add footer
        report.append("---")
        report.append("")
        report.append("## Next Steps")
        report.append("")
        report.append(
            "1. Review all CRITICAL and HIGH priority findings immediately"
        )
        report.append(
            "2. Create GitHub issues for findings that require remediation"
        )
        report.append("3. Update architectural guidelines if patterns emerge")
        report.append("4. Schedule follow-up review in 1 week")
        report.append("")
        report.append("## References")
        report.append("")
        report.append("- [Architectural Guidelines](../docs/architecture/GUIDELINES.md)")
        report.append("- [Source of Truth](../docs/facts.json)")
        report.append(
            "- [Architecture Review Board Agent](../.github/agents/architecture-review-board.md)"
        )

        return "\n".join(report)


def main() -> int:
    """Main entry point for the architectural review tool.

    Returns:
        Exit code (0 for success, 1 for error)
    """
    parser = argparse.ArgumentParser(
        description="Architectural review tool for 9Boxer"
    )
    parser.add_argument(
        "--days",
        type=int,
        default=7,
        help="Number of days to look back for commits (default: 7)",
    )
    parser.add_argument(
        "--output",
        type=str,
        help="Output file for the review report (markdown format)",
    )
    parser.add_argument(
        "--json",
        action="store_true",
        help="Output results in JSON format instead of markdown",
    )

    args = parser.parse_args()

    # Get repository root
    try:
        result = subprocess.run(
            ["git", "rev-parse", "--show-toplevel"],
            capture_output=True,
            text=True,
            check=True,
        )
        repo_root = Path(result.stdout.strip())
    except subprocess.CalledProcessError:
        print("❌ Error: Not in a git repository")
        return 1

    # Run the review
    reviewer = ArchitecturalReviewer(repo_root, days=args.days)
    summary = reviewer.run_review()

    # Output results
    if args.json:
        output_content = json.dumps(summary, indent=2)
    else:
        output_content = reviewer.generate_markdown_report(summary)

    if args.output:
        output_path = Path(args.output)
        output_path.parent.mkdir(parents=True, exist_ok=True)
        output_path.write_text(output_content)
        print(f"✓ Report saved to: {args.output}")
    else:
        print("\n" + output_content)

    # Return non-zero exit code if critical or high severity findings
    critical = summary["severity_breakdown"].get("CRITICAL", 0)
    high = summary["severity_breakdown"].get("HIGH", 0)

    if critical > 0:
        print(f"\n⚠️  Found {critical} CRITICAL issues!")
        return 1
    elif high > 0:
        print(f"\n⚠️  Found {high} HIGH priority issues")

    return 0


if __name__ == "__main__":
    sys.exit(main())
