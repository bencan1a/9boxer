"""Tests for the documentation build system (tools/build_context.py)."""

import json
import subprocess
import sys
from pathlib import Path


# Test utilities
def run_build_script() -> subprocess.CompletedProcess:
    """Run the build_context.py script and return the result."""
    repo_root = Path(__file__).parent.parent
    script_path = repo_root / "tools" / "build_context.py"

    result = subprocess.run(
        [sys.executable, str(script_path)],
        check=False,
        capture_output=True,
        text=True,
        cwd=repo_root,
    )
    return result


class TestBuildContext:
    """Tests for the build_context.py script."""

    def test_build_script_exists(self) -> None:
        """Test that the build_context.py script exists and is executable."""
        repo_root = Path(__file__).parent.parent
        script_path = repo_root / "tools" / "build_context.py"

        assert script_path.exists(), "build_context.py script should exist"
        assert script_path.is_file(), "build_context.py should be a file"
        # Check if file is executable or has proper shebang
        content = script_path.read_text(encoding="utf-8")
        assert content.startswith("#!/usr/bin/env python3"), "Script should have Python shebang"

    def test_build_script_runs_successfully(self) -> None:
        """Test that the build script runs without errors."""
        result = run_build_script()

        assert result.returncode == 0, f"Build script should succeed. stderr: {result.stderr}"
        assert "Documentation build complete" in result.stdout

    def test_context_file_generated(self) -> None:
        """Test that CONTEXT.md is generated."""
        # Run build
        result = run_build_script()
        assert result.returncode == 0

        # Check that CONTEXT.md exists
        repo_root = Path(__file__).parent.parent
        context_file = repo_root / "docs" / "CONTEXT.md"

        assert context_file.exists(), "CONTEXT.md should be generated"

        # Check content
        content = context_file.read_text(encoding="utf-8")
        assert "Project Documentation Context" in content
        assert "**Source SHA**:" in content
        assert "**Generated**:" in content

    def test_summary_file_generated(self) -> None:
        """Test that SUMMARY.md is generated."""
        result = run_build_script()
        assert result.returncode == 0

        repo_root = Path(__file__).parent.parent
        summary_file = repo_root / "docs" / "SUMMARY.md"

        assert summary_file.exists(), "SUMMARY.md should be generated"

        content = summary_file.read_text(encoding="utf-8")
        assert "Documentation Summary" in content
        assert "**Last Updated**:" in content

    def test_changelog_updated(self) -> None:
        """Test that CHANGELOG.md is updated with build entry."""
        result = run_build_script()
        assert result.returncode == 0

        repo_root = Path(__file__).parent.parent
        changelog_file = repo_root / "docs" / "CHANGELOG.md"

        assert changelog_file.exists(), "CHANGELOG.md should exist"

        content = changelog_file.read_text(encoding="utf-8")
        assert "Documentation Changelog" in content
        # Should have at least one build entry
        assert "**Source SHA**:" in content

    def test_generated_directory_created(self) -> None:
        """Test that the _generated directory is created."""
        result = run_build_script()
        assert result.returncode == 0

        repo_root = Path(__file__).parent.parent
        generated_dir = repo_root / "docs" / "_generated"

        assert generated_dir.exists(), "_generated directory should be created"
        assert generated_dir.is_dir(), "_generated should be a directory"


class TestPlanParsing:
    """Tests for plan file parsing."""

    def test_active_plan_detected(self) -> None:
        """Test that active plans are detected and indexed."""
        # The test-plan should be active
        result = run_build_script()
        assert result.returncode == 0

        repo_root = Path(__file__).parent.parent

        # Check that plans index exists
        plans_index = repo_root / "docs" / "_generated" / "plans_index.md"

        # Only check if agent-plans directory has content
        agent_plans_dir = repo_root / "agent-plans"
        if agent_plans_dir.exists() and any(agent_plans_dir.iterdir()):
            assert plans_index.exists(), "plans_index.md should exist when plans are present"

            content = plans_index.read_text(encoding="utf-8")
            assert "Active Plans" in content

    def test_plan_in_context(self) -> None:
        """Test that active plans appear in CONTEXT.md."""
        result = run_build_script()
        assert result.returncode == 0

        repo_root = Path(__file__).parent.parent
        context_file = repo_root / "docs" / "CONTEXT.md"
        content = context_file.read_text(encoding="utf-8")

        # Only check if agent-plans directory has active plans
        agent_plans_dir = repo_root / "agent-plans"
        if agent_plans_dir.exists() and any(agent_plans_dir.iterdir()):
            # Check that the plans section exists
            if "There are" in content and "active plan(s)" in content:
                assert "Active Plans" in content


class TestFolderStructure:
    """Tests for the documentation folder structure."""

    def test_required_directories_exist(self) -> None:
        """Test that all required directories exist after build."""
        result = run_build_script()
        assert result.returncode == 0

        repo_root = Path(__file__).parent.parent

        required_dirs = [
            "docs",
            "docs/_generated",
            "tools",
        ]

        for dir_path in required_dirs:
            full_path = repo_root / dir_path
            assert full_path.exists(), f"{dir_path} should exist"
            assert full_path.is_dir(), f"{dir_path} should be a directory"

    def test_required_files_exist(self) -> None:
        """Test that all required files exist."""
        result = run_build_script()
        assert result.returncode == 0

        repo_root = Path(__file__).parent.parent

        required_files = [
            "AGENTS.md",
            "docs/facts.json",
            "docs/CONTEXT.md",
            "docs/SUMMARY.md",
            "docs/CHANGELOG.md",
            "tools/build_context.py",
            ".github/workflows/docs.yml",
        ]

        for file_path in required_files:
            full_path = repo_root / file_path
            assert full_path.exists(), f"{file_path} should exist"
            assert full_path.is_file(), f"{file_path} should be a file"

    def test_facts_json_valid(self) -> None:
        """Test that facts.json is valid JSON."""

        repo_root = Path(__file__).parent.parent
        facts_file = repo_root / "docs" / "facts.json"

        assert facts_file.exists(), "facts.json should exist"

        # Should be valid JSON
        with facts_file.open(encoding="utf-8") as f:
            facts = json.load(f)

        # Should have expected keys
        assert "project_name" in facts
        assert "description" in facts
        assert "folder_structure" in facts


class TestAPIDocumentation:
    """Tests for API documentation generation."""

    def test_api_docs_directory_created(self) -> None:
        """Test that API docs directory is created."""
        result = run_build_script()
        assert result.returncode == 0

        repo_root = Path(__file__).parent.parent
        api_dir = repo_root / "docs" / "_generated" / "api"

        assert api_dir.exists(), "API docs directory should be created"
        assert api_dir.is_dir(), "API docs path should be a directory"

    def test_api_docs_generated_for_packages(self) -> None:
        """Test that API docs are generated for Python packages."""
        result = run_build_script()
        assert result.returncode == 0

        repo_root = Path(__file__).parent.parent
        api_dir = repo_root / "docs" / "_generated" / "api"

        # Should have some HTML files (pdoc3 generates HTML)
        html_files = list(api_dir.rglob("*.html"))
        assert len(html_files) > 0, "API docs should include HTML files"
