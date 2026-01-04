"""Tests for analysis registry.

The analysis registry maintains a central registry of all available analyses
and provides methods to run them systematically.
"""

from datetime import date

import pytest

from ninebox.models.employee import Employee, PerformanceLevel, PotentialLevel


pytestmark = pytest.mark.unit


def create_employee(
    emp_id: int,
    location: str = "USA",
    function: str = "Engineering",
    level: str = "MT5",
    tenure: str = "2-5 years",
    performance: PerformanceLevel = PerformanceLevel.MEDIUM,
    potential: PotentialLevel = PotentialLevel.MEDIUM,
    grid_position: int = 5,
) -> Employee:
    """Create a test employee with specified attributes."""
    return Employee(
        employee_id=emp_id,
        name=f"Employee {emp_id}",
        business_title="Test Title",
        job_title="Test Job",
        job_profile=f"{function}-{location}",
        job_level=level,
        job_function=function,
        location=location,
        direct_manager="Test Manager",
        hire_date=date(2020, 1, 1),
        tenure_category=tenure,
        time_in_job_profile="1-2 years",
        performance=performance,
        potential=potential,
        grid_position=grid_position,
        talent_indicator="Test Indicator",
    )


class TestAnalysisRegistry:
    """Tests for the analysis registry."""

    def test_registry_contains_expected_analyses(self) -> None:
        """Test that registry contains all expected analyses."""
        # Import the registry (will need to be implemented)
        try:
            from ninebox.services.analysis_registry import ANALYSIS_REGISTRY
        except ImportError:
            pytest.skip("Analysis registry not yet implemented")

        # Expected analyses based on task description
        expected_analyses = {
            "location",
            "function",
            "level",
            "tenure",
            "per_level_distribution",
        }

        # Registry is a list of tuples: [(name, function), ...]
        registered_names = set(name for name, _ in ANALYSIS_REGISTRY)

        # Check that all expected analyses are registered
        for analysis_name in expected_analyses:
            assert (
                analysis_name in registered_names
            ), f"Expected analysis '{analysis_name}' not found in registry"

    def test_registry_analysis_has_callable_function(self) -> None:
        """Test that each registered analysis has a callable function."""
        try:
            from ninebox.services.analysis_registry import ANALYSIS_REGISTRY
        except ImportError:
            pytest.skip("Analysis registry not yet implemented")

        # Registry is a list of tuples: [(name, function), ...]
        for name, analysis_function in ANALYSIS_REGISTRY:
            assert callable(
                analysis_function
            ), f"Analysis '{name}' function is not callable"

    def test_registry_analysis_has_metadata(self) -> None:
        """Test that each registered analysis has name and callable function."""
        try:
            from ninebox.services.analysis_registry import ANALYSIS_REGISTRY
        except ImportError:
            pytest.skip("Analysis registry not yet implemented")

        # Registry is a simple list of (name, function) tuples
        # This is intentionally minimal - name + function is all that's needed
        for name, analysis_function in ANALYSIS_REGISTRY:
            assert isinstance(name, str), f"Analysis name should be string, got {type(name)}"
            assert len(name) > 0, "Analysis name should not be empty"
            assert callable(analysis_function), f"Analysis '{name}' function is not callable"

    def test_run_all_analyses_executes_all_registered_analyses(self) -> None:
        """Test that run_all_analyses() executes all registered analyses."""
        try:
            from ninebox.services.analysis_registry import run_all_analyses
        except ImportError:
            pytest.skip("Analysis registry not yet implemented")

        # Create test employees
        employees = [
            create_employee(1, location="USA", level="MT3", performance=PerformanceLevel.HIGH),
            create_employee(2, location="USA", level="MT3", performance=PerformanceLevel.MEDIUM),
            create_employee(3, location="UK", level="MT5", performance=PerformanceLevel.HIGH),
            create_employee(4, location="UK", level="MT5", performance=PerformanceLevel.LOW),
        ]

        results = run_all_analyses(employees)

        # Should return a dictionary with results for each analysis
        assert isinstance(results, dict)
        assert len(results) > 0

        # Each result should have expected structure
        for analysis_name, result in results.items():
            assert isinstance(result, dict), f"Analysis '{analysis_name}' did not return a dict"

    def test_run_all_analyses_with_empty_employee_list(self) -> None:
        """Test that run_all_analyses() handles empty employee list gracefully."""
        try:
            from ninebox.services.analysis_registry import run_all_analyses
        except ImportError:
            pytest.skip("Analysis registry not yet implemented")

        results = run_all_analyses([])

        # Should return results even for empty list (with appropriate messages)
        assert isinstance(results, dict)

    def test_add_analysis_to_registry_works_correctly(self) -> None:
        """Test that new analyses can be added to the registry dynamically."""
        try:
            from ninebox.services.analysis_registry import ANALYSIS_REGISTRY
        except ImportError:
            pytest.skip("Analysis registry not yet implemented")

        # Define a custom analysis function
        def custom_analysis(employees: list[Employee]) -> dict:
            return {"custom": True, "count": len(employees)}

        # Add it to the registry (it's a list, so we append)
        initial_count = len(ANALYSIS_REGISTRY)
        ANALYSIS_REGISTRY.append(("custom_test", custom_analysis))

        # Verify it was added
        assert len(ANALYSIS_REGISTRY) == initial_count + 1
        registered_names = [name for name, _ in ANALYSIS_REGISTRY]
        assert "custom_test" in registered_names

        # Clean up (remove from registry)
        ANALYSIS_REGISTRY.pop()  # Remove the last item we just added

    def test_analysis_results_have_expected_structure(self) -> None:
        """Test that analysis results have expected structure."""
        try:
            from ninebox.services.analysis_registry import run_all_analyses
        except ImportError:
            pytest.skip("Analysis registry not yet implemented")

        # Create diverse test data
        employees = []
        for i in range(30):
            employees.append(
                create_employee(
                    i,
                    location="USA" if i % 2 == 0 else "UK",
                    level="MT3" if i % 3 == 0 else "MT5",
                    performance=(
                        PerformanceLevel.HIGH
                        if i % 3 == 0
                        else PerformanceLevel.MEDIUM
                        if i % 3 == 1
                        else PerformanceLevel.LOW
                    ),
                )
            )

        results = run_all_analyses(employees)

        # Each analysis result should have common fields
        expected_fields = {"sample_size", "status"}

        for analysis_name, result in results.items():
            for field in expected_fields:
                assert (
                    field in result
                ), f"Analysis '{analysis_name}' missing field '{field}'"

            # Status should be one of: green, yellow, red
            assert result["status"] in [
                "green",
                "yellow",
                "red",
            ], f"Analysis '{analysis_name}' has invalid status: {result['status']}"

    def test_run_specific_analysis_by_name(self) -> None:
        """Test that we can run a specific analysis by name."""
        try:
            from ninebox.services.analysis_registry import get_analysis_function
        except ImportError:
            pytest.skip("Analysis registry not yet implemented")

        employees = [create_employee(i) for i in range(10)]

        # Get the location analysis function
        location_fn = get_analysis_function("location")
        assert location_fn is not None, "location analysis should be registered"

        # Run it
        result = location_fn(employees)

        assert isinstance(result, dict)
        assert "sample_size" in result

    def test_registry_analysis_order_is_preserved(self) -> None:
        """Test that analyses are executed in a consistent order."""
        try:
            from ninebox.services.analysis_registry import run_all_analyses
        except ImportError:
            pytest.skip("Analysis registry not yet implemented")

        employees = [create_employee(i) for i in range(10)]

        # Run multiple times and check order is consistent
        results1 = run_all_analyses(employees)
        results2 = run_all_analyses(employees)

        assert list(results1.keys()) == list(
            results2.keys()
        ), "Analysis execution order should be consistent"

    def test_run_all_analyses_returns_partial_results_when_one_fails(self) -> None:
        """Test that run_all_analyses returns partial results when one analysis fails."""
        try:
            from ninebox.services.analysis_registry import (
                ANALYSIS_REGISTRY,
                run_all_analyses,
            )
        except ImportError:
            pytest.skip("Analysis registry not yet implemented")

        # Create test employees
        employees = [create_employee(i) for i in range(10)]

        # Add a failing analysis to the registry
        def failing_analysis(employees: list[Employee]) -> dict:
            raise ValueError("Intentional test failure")

        # Save original registry length
        original_length = len(ANALYSIS_REGISTRY)
        try:
            # Add failing analysis
            ANALYSIS_REGISTRY.append(("failing_test", failing_analysis))

            # Run all analyses
            results = run_all_analyses(employees)

            # Should still get results for all analyses
            assert len(results) == original_length + 1

            # Failed analysis should have error status
            assert "failing_test" in results
            assert results["failing_test"]["status"] == "error"
            assert "Analysis failed: ValueError" in results["failing_test"]["error"]
            assert results["failing_test"]["sample_size"] == 0

            # Other analyses should still succeed
            for name, result in results.items():
                if name != "failing_test":
                    assert result["status"] in ["green", "yellow", "red"]
                    assert "sample_size" in result

        finally:
            # Clean up - remove the failing analysis
            ANALYSIS_REGISTRY.pop()

    def test_run_all_analyses_logs_errors_on_failure(self, caplog) -> None:
        """Test that run_all_analyses logs errors with traceback when analysis fails."""
        try:
            from ninebox.services.analysis_registry import (
                ANALYSIS_REGISTRY,
                run_all_analyses,
            )
        except ImportError:
            pytest.skip("Analysis registry not yet implemented")

        # Create test employees
        employees = [create_employee(i) for i in range(10)]

        # Add a failing analysis to the registry
        def failing_analysis(employees: list[Employee]) -> dict:
            raise RuntimeError("Test error with traceback")

        try:
            # Add failing analysis
            ANALYSIS_REGISTRY.append(("failing_test", failing_analysis))

            # Run all analyses with logging capture
            with caplog.at_level("ERROR"):
                results = run_all_analyses(employees)

            # Should have logged the error
            assert len(caplog.records) > 0
            error_logged = False
            for record in caplog.records:
                if "failing_test" in record.message and "failed" in record.message:
                    error_logged = True
                    # Should include exception info (traceback)
                    assert record.exc_info is not None
                    break

            assert error_logged, "Expected error log not found"

            # Should still return error status
            assert results["failing_test"]["status"] == "error"

        finally:
            # Clean up
            ANALYSIS_REGISTRY.pop()

    def test_run_all_analyses_returns_correct_error_type_in_message(self) -> None:
        """Test that error message includes the correct exception type."""
        try:
            from ninebox.services.analysis_registry import (
                ANALYSIS_REGISTRY,
                run_all_analyses,
            )
        except ImportError:
            pytest.skip("Analysis registry not yet implemented")

        # Create test employees
        employees = [create_employee(i) for i in range(10)]

        # Test different exception types
        def key_error_analysis(employees: list[Employee]) -> dict:
            raise KeyError("missing key")

        def type_error_analysis(employees: list[Employee]) -> dict:
            raise TypeError("wrong type")

        try:
            # Add failing analyses
            ANALYSIS_REGISTRY.append(("key_error_test", key_error_analysis))
            ANALYSIS_REGISTRY.append(("type_error_test", type_error_analysis))

            # Run all analyses
            results = run_all_analyses(employees)

            # Should include correct error types
            assert "Analysis failed: KeyError" in results["key_error_test"]["error"]
            assert "Analysis failed: TypeError" in results["type_error_test"]["error"]

        finally:
            # Clean up
            ANALYSIS_REGISTRY.pop()
            ANALYSIS_REGISTRY.pop()

    def test_run_all_analyses_continues_after_multiple_failures(self) -> None:
        """Test that run_all_analyses continues even when multiple analyses fail."""
        try:
            from ninebox.services.analysis_registry import (
                ANALYSIS_REGISTRY,
                run_all_analyses,
            )
        except ImportError:
            pytest.skip("Analysis registry not yet implemented")

        # Create test employees
        employees = [create_employee(i) for i in range(10)]

        # Add multiple failing analyses
        def failing_analysis_1(employees: list[Employee]) -> dict:
            raise ValueError("Error 1")

        def failing_analysis_2(employees: list[Employee]) -> dict:
            raise RuntimeError("Error 2")

        original_length = len(ANALYSIS_REGISTRY)
        try:
            # Add failing analyses
            ANALYSIS_REGISTRY.append(("failing_1", failing_analysis_1))
            ANALYSIS_REGISTRY.append(("failing_2", failing_analysis_2))

            # Run all analyses
            results = run_all_analyses(employees)

            # Should have results for all analyses
            assert len(results) == original_length + 2

            # Both failing analyses should have error status
            assert results["failing_1"]["status"] == "error"
            assert results["failing_2"]["status"] == "error"

            # Original analyses should still work
            successful_count = sum(
                1 for name, result in results.items()
                if result["status"] in ["green", "yellow", "red"]
            )
            assert successful_count == original_length

        finally:
            # Clean up
            ANALYSIS_REGISTRY.pop()
            ANALYSIS_REGISTRY.pop()
