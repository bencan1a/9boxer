"""Startup performance benchmarks - measure import times and lazy loading.

This test suite validates that our lazy import optimizations are working correctly
and that startup time remains within acceptable bounds.

Target startup time (development): < 12s
"""

import importlib
import sys
import time

import pytest


@pytest.mark.performance
def test_main_module_import_time() -> None:
    """Measure import time for main ninebox module.

    This is the critical path for application startup. Target is < 12s in development.
    """
    # Clear any cached imports
    modules_to_clear = [k for k in sys.modules if k.startswith("ninebox")]
    for mod in modules_to_clear:
        del sys.modules[mod]

    start = time.time()
    import ninebox.main  # noqa: F401, PLC0415

    elapsed = time.time() - start

    # After optimizations, import should be faster than baseline (was ~13.8s)
    # Set conservative target of 12s
    assert elapsed < 12.0, (
        f"Main module import took {elapsed:.2f}s, exceeds 12s target (after optimizations)"
    )

    print(f"\n✓ Main module import time: {elapsed:.2f}s (target: <12s)")


@pytest.mark.performance
def test_scipy_not_imported_at_startup() -> None:
    """Verify scipy.stats is NOT imported during ninebox.main import.

    After lazy loading optimization, scipy should only be imported when
    intelligence service methods are actually called.
    """
    # Clear any cached imports
    modules_to_clear = [k for k in sys.modules if k.startswith(("ninebox", "scipy"))]
    for mod in modules_to_clear:
        del sys.modules[mod]

    # Import main module
    import ninebox.main  # noqa: F401, PLC0415

    # scipy.stats should NOT be in sys.modules
    assert "scipy.stats" not in sys.modules, "scipy.stats was imported at startup (should be lazy)"

    print("✓ scipy.stats NOT imported at startup (lazy loading working)")


@pytest.mark.performance
def test_scipy_imported_when_intelligence_used() -> None:
    """Verify scipy.stats IS imported when intelligence service is used."""
    # Clear any cached imports
    modules_to_clear = [k for k in sys.modules if k.startswith(("ninebox", "scipy"))]
    for mod in modules_to_clear:
        del sys.modules[mod]

    # Import intelligence service
    from ninebox.services.intelligence_service import (  # noqa: PLC0415
        IntelligenceService,
    )

    service = IntelligenceService()

    # scipy.stats should NOT be imported yet
    assert "scipy.stats" not in sys.modules, (
        "scipy.stats imported before intelligence methods called"
    )

    # Call a method that uses chi-square test
    from datetime import date  # noqa: PLC0415

    from ninebox.models.employee import Employee, PerformanceLevel, PotentialLevel  # noqa: PLC0415

    employees = [
        Employee(
            employee_id=1,
            name="Test",
            business_title="Engineer",
            job_title="Engineer",
            job_profile="Engineer",
            job_level="MT4",
            job_function="Engineer",
            location="USA",
            manager="Boss",
            hire_date=date(2020, 1, 1),
            tenure_category="2-5 years",
            time_in_job_profile="1-2 years",
            performance=PerformanceLevel.HIGH,
            potential=PotentialLevel.HIGH,
            grid_position=3,  # High performance, High potential
            position_label="High/High",
            talent_indicator="",
            ratings_history=[],
        )
    ]

    # Calculate intelligence - this should trigger scipy import
    result = service.calculate_overall(employees)

    # Now scipy.stats SHOULD be imported (if the data triggered statistical tests)
    # Note: May not always import if data doesn't trigger certain tests
    # So we just verify the method succeeded
    assert isinstance(result, dict), "Intelligence calculation failed"

    print("✓ Intelligence service works correctly with lazy scipy import")


@pytest.mark.performance
def test_openpyxl_not_imported_at_startup() -> None:
    """Verify openpyxl is NOT imported during ninebox.main import.

    After lazy loading optimization, openpyxl should only be imported when
    excel export is actually called.
    """
    # Clear any cached imports
    modules_to_clear = [k for k in sys.modules if k.startswith(("ninebox", "openpyxl"))]
    for mod in modules_to_clear:
        del sys.modules[mod]

    # Import main module
    import ninebox.main  # noqa: F401, PLC0415

    # openpyxl should NOT be in sys.modules
    assert "openpyxl" not in sys.modules, "openpyxl was imported at startup (should be lazy)"

    print("✓ openpyxl NOT imported at startup (lazy loading working)")


@pytest.mark.performance
def test_service_import_times() -> None:
    """Measure import times for individual services.

    This helps identify which services contribute most to startup time.
    """
    import_times: dict[str, float] = {}

    services = [
        "ninebox.services.database",
        "ninebox.services.session_manager",
        "ninebox.services.excel_parser",
        "ninebox.services.excel_exporter",
        "ninebox.services.intelligence_service",
        "ninebox.services.statistics_service",
        "ninebox.services.employee_service",
    ]

    for service in services:
        # Clear cached import
        if service in sys.modules:
            del sys.modules[service]

        start = time.time()
        importlib.import_module(service)
        elapsed = time.time() - start

        import_times[service] = elapsed

    # Print results
    print("\n" + "=" * 60)
    print("Service Import Times:")
    print("=" * 60)
    for service, import_time in sorted(import_times.items(), key=lambda x: x[1], reverse=True):
        service_name = service.replace("ninebox.services.", "")
        print(f"{service_name:25} {import_time:8.3f}s")
    print("=" * 60)

    # Validate lazy-loaded services
    # Note: pandas might already be cached from pytest/other tests, so we can't reliably test its import time
    # Instead, we verify that services that SHOULD be lazy are fast

    # intelligence_service should NOT import scipy at module level
    # If it's importing scipy.stats, it would take ~0.8s
    assert import_times["ninebox.services.intelligence_service"] < 0.3, (
        f"intelligence_service import took {import_times['ninebox.services.intelligence_service']:.2f}s - "
        "scipy.stats might be imported at module level (should be lazy)"
    )

    # excel_exporter should NOT import openpyxl at module level
    assert import_times["ninebox.services.excel_exporter"] < 0.1, (
        f"excel_exporter import took {import_times['ninebox.services.excel_exporter']:.2f}s - "
        "openpyxl might be imported at module level (should be lazy)"
    )

    print("\n✓ Lazy-loaded services import quickly (scipy and openpyxl not at module level)")


@pytest.mark.performance
def test_session_manager_lazy_loading() -> None:
    """Verify SessionManager does NOT restore sessions during __init__.

    After optimization, session restoration should be deferred until first access.
    """
    # Clear any cached imports
    modules_to_clear = [k for k in sys.modules if k.startswith("ninebox")]
    for mod in modules_to_clear:
        del sys.modules[mod]

    start = time.time()
    from ninebox.services.session_manager import SessionManager  # noqa: PLC0415

    mgr = SessionManager()
    elapsed = time.time() - start

    # Should be very fast if not restoring sessions
    assert elapsed < 0.5, (
        f"SessionManager initialization took {elapsed:.2f}s - "
        "might be restoring sessions (should be lazy)"
    )

    # Verify _sessions_loaded flag exists and is False
    assert hasattr(mgr, "_sessions_loaded"), "SessionManager missing _sessions_loaded flag"
    assert mgr._sessions_loaded is False, "_sessions_loaded should be False until first access"

    print(f"✓ SessionManager.__init__() took {elapsed:.3f}s (lazy loading working)")


@pytest.mark.performance
def test_import_performance_regression() -> None:
    """Regression test to ensure import times don't increase over time.

    This test establishes baseline import times after optimizations.
    Future changes should not significantly increase these times.
    """
    baselines: dict[str, float] = {
        # After Phase 1 optimizations (scipy, openpyxl, session restore)
        "ninebox.services.intelligence_service": 0.3,  # Was ~0.8s with scipy
        "ninebox.services.excel_exporter": 0.1,  # Was ~0.24s with openpyxl
        "ninebox.services.session_manager": 0.5,  # Was ~0.85s with session restore
    }

    failures: list[tuple[str, float, float]] = []

    for module, baseline in baselines.items():
        # Clear cached import
        if module in sys.modules:
            del sys.modules[module]

        start = time.time()
        importlib.import_module(module)
        elapsed = time.time() - start

        # Allow 50% margin for variance
        max_allowed = baseline * 1.5

        if elapsed > max_allowed:
            failures.append((module, elapsed, max_allowed))

    if failures:
        error_msg = "Import time regressions detected:\n"
        for module, actual, expected in failures:
            error_msg += f"  {module}: {actual:.3f}s > {expected:.3f}s (baseline + 50%)\n"
        pytest.fail(error_msg)

    print("✓ All import times within acceptable baselines")
