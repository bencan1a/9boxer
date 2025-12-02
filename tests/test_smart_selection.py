"""Tests for smart test selection and coverage checking scripts."""

import json
import subprocess
import tempfile
from pathlib import Path

import pytest


@pytest.fixture
def project_root():
    """Get the project root directory."""
    return Path(__file__).parent.parent


@pytest.fixture
def smart_selection_script(project_root):
    """Get path to smart test selection script."""
    return project_root / ".github" / "scripts" / "smart_test_selection.py"


@pytest.fixture
def coverage_check_script(project_root):
    """Get path to coverage check script."""
    return project_root / ".github" / "scripts" / "check_coverage.py"


def test_smart_selection_script_exists(smart_selection_script):
    """Test that smart test selection script exists."""
    assert smart_selection_script.exists()


def test_coverage_check_script_exists(coverage_check_script):
    """Test that coverage check script exists."""
    assert coverage_check_script.exists()


def test_smart_selection_json_format(smart_selection_script, project_root):
    """Test smart test selection with JSON output format."""
    result = subprocess.run(
        [
            "python",
            str(smart_selection_script),
            "--base-ref",
            "HEAD",
            "--format",
            "json",
        ],
        check=False,
        cwd=project_root,
        capture_output=True,
        text=True,
    )

    # Should exit successfully
    assert result.returncode == 0

    # Should produce valid JSON
    try:
        data = json.loads(result.stdout)
        assert "tests" in data
        assert "changed_files" in data
        assert isinstance(data["tests"], list)
        assert isinstance(data["changed_files"], list)
    except json.JSONDecodeError as e:
        pytest.fail(f"Invalid JSON output: {e}\nOutput: {result.stdout}")


def test_smart_selection_pytest_format(smart_selection_script, project_root):
    """Test smart test selection with pytest output format."""
    result = subprocess.run(
        [
            "python",
            str(smart_selection_script),
            "--base-ref",
            "HEAD",
            "--format",
            "pytest",
        ],
        check=False,
        cwd=project_root,
        capture_output=True,
        text=True,
    )

    # Should exit successfully
    assert result.returncode == 0
    # Output should be a string (possibly empty)
    assert isinstance(result.stdout, str)


def test_smart_selection_changed_files_output(smart_selection_script, project_root):
    """Test smart test selection with changed files output."""
    result = subprocess.run(
        [
            "python",
            str(smart_selection_script),
            "--base-ref",
            "HEAD",
            "--output-changed-files",
        ],
        check=False,
        cwd=project_root,
        capture_output=True,
        text=True,
    )

    # Should exit successfully
    assert result.returncode == 0


def test_coverage_check_with_valid_files(coverage_check_script, project_root):
    """Test coverage check with valid source files."""
    # First, run pytest to generate coverage data (just run the calculator tests)
    result = subprocess.run(
        ["pytest", "tests/test_calculator.py", "--cov=src", "--cov-report=term", "-q"],
        check=False,
        cwd=project_root,
        capture_output=True,
        timeout=30,
    )
    assert result.returncode == 0, "Failed to generate coverage data"

    # Check coverage for calculator.py with low threshold
    result = subprocess.run(
        [
            "python",
            str(coverage_check_script),
            "--files",
            "src/python_template/calculator.py",
            "--threshold",
            "50.0",
        ],
        check=False,
        cwd=project_root,
        capture_output=True,
        text=True,
        timeout=10,
    )

    # Should pass (our coverage is 100%)
    assert result.returncode == 0


def test_coverage_check_with_high_threshold_fails(coverage_check_script, project_root):
    """Test that coverage check fails with unrealistic threshold."""
    # Run pytest to generate coverage data
    result = subprocess.run(
        ["pytest", "tests/test_calculator.py", "--cov=src", "--cov-report=term", "-q"],
        check=False,
        cwd=project_root,
        capture_output=True,
        timeout=30,
    )
    assert result.returncode == 0, "Failed to generate coverage data"

    # Check with impossible threshold
    result = subprocess.run(
        [
            "python",
            str(coverage_check_script),
            "--files",
            "src/python_template/calculator.py",
            "--threshold",
            "101.0",
        ],
        check=False,
        cwd=project_root,
        capture_output=True,
        text=True,
        timeout=10,
    )

    # Should fail
    assert result.returncode == 1


def test_coverage_check_with_json_input(coverage_check_script, project_root):
    """Test coverage check with JSON input file."""
    # Run pytest to generate coverage data
    result = subprocess.run(
        ["pytest", "tests/test_calculator.py", "--cov=src", "--cov-report=term", "-q"],
        check=False,
        cwd=project_root,
        capture_output=True,
        timeout=30,
    )
    assert result.returncode == 0, "Failed to generate coverage data"

    # Create temporary JSON file
    with tempfile.NamedTemporaryFile(mode="w", suffix=".json", delete=False) as f:
        json.dump(
            {"changed_files": ["src/python_template/calculator.py"]},
            f,
        )
        temp_file = f.name

    try:
        result = subprocess.run(
            [
                "python",
                str(coverage_check_script),
                "--files-from-json",
                temp_file,
                "--threshold",
                "50.0",
            ],
            check=False,
            cwd=project_root,
            capture_output=True,
            text=True,
        )

        # Should pass
        assert result.returncode == 0
    finally:
        Path(temp_file).unlink()


@pytest.mark.slow
def test_smart_selection_integration(smart_selection_script, project_root):
    """Integration test for smart test selection.

    This test creates temporary commits to verify the selection logic.
    """
    # Save current state
    original_head = subprocess.run(
        ["git", "rev-parse", "HEAD"],
        check=False,
        cwd=project_root,
        capture_output=True,
        text=True,
    ).stdout.strip()

    try:
        # Modify calculator.py
        calc_file = project_root / "src" / "python_template" / "calculator.py"
        original_content = calc_file.read_text()

        calc_file.write_text(original_content + "\n# Test comment\n")
        subprocess.run(
            ["git", "add", str(calc_file)],
            cwd=project_root,
            check=True,
        )
        subprocess.run(
            ["git", "commit", "-m", "Test: modify calculator"],
            cwd=project_root,
            check=True,
        )

        # Run smart selection
        result = subprocess.run(
            [
                "python",
                str(smart_selection_script),
                "--base-ref",
                original_head,
                "--format",
                "json",
            ],
            check=False,
            cwd=project_root,
            capture_output=True,
            text=True,
        )

        assert result.returncode == 0
        data = json.loads(result.stdout)

        # Should select test_calculator.py
        assert "tests/test_calculator.py" in data["tests"]
        assert "src/python_template/calculator.py" in data["changed_files"]

    finally:
        # Restore original state
        subprocess.run(
            ["git", "reset", "--hard", original_head],
            cwd=project_root,
            check=True,
        )
