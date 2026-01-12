"""Unit test specific configuration and fixtures.

This conftest provides additional isolation for unit tests beyond the base conftest.
It ensures complete database and state isolation when running unit tests alongside
performance tests in a single pytest invocation (as VSCode does).
"""

import gc
import os
import tempfile
import uuid
from collections.abc import Generator
from pathlib import Path

import pytest


@pytest.fixture(scope="function", autouse=True)
def isolate_database_for_unit_tests(request: pytest.FixtureRequest, monkeypatch: pytest.MonkeyPatch) -> Generator[None, None, None]:
    """Ensure complete database isolation for unit tests.

    This fixture addresses database state pollution when unit and performance
    tests run in the same process. It provides complete isolation by:

    1. Creating a unique temporary database for each test
    2. Patching all database path resolution functions
    3. Clearing all service caches and instances
    4. Preventing cross-test contamination

    This is critical when VSCode runs tests by passing all test names to pytest,
    causing them to run in the same process where state can leak between tests.
    """
    # Skip this fixture for tests that need to control their own environment/mocks
    # - test_database.py: Tests database path resolution explicitly
    # - test_export_error_handling.py: Tests error handling with specific mock setups
    test_module = request.node.module.__name__ if hasattr(request.node, 'module') else ""
    if "test_database" in test_module or "test_export_error_handling" in test_module:
        yield
        return
    # Generate a unique ID for this test to ensure no collisions
    test_id = str(uuid.uuid4())[:8]

    # Create a unique temporary directory for this specific test
    test_temp_dir = tempfile.mkdtemp(prefix=f"unit_test_{test_id}_", suffix="_ninebox")
    test_db_path = Path(test_temp_dir) / "test.db"

    # Save original environment variables
    original_app_data_dir = os.environ.get("APP_DATA_DIR")
    original_database_path = os.environ.get("DATABASE_PATH")

    # Override environment variables for this test
    os.environ["APP_DATA_DIR"] = test_temp_dir
    os.environ["DATABASE_PATH"] = str(test_db_path)

    # Patch all database path resolution functions to use our test directory
    # This ensures ALL services use the same isolated database
    def mock_get_user_data_dir() -> Path:
        """Return the test-specific temporary directory."""
        return Path(test_temp_dir)

    def mock_get_db_path() -> Path:
        """Return the test-specific database path."""
        return test_db_path

    # Patch at all possible import locations
    monkeypatch.setattr("ninebox.utils.paths.get_user_data_dir", mock_get_user_data_dir)
    monkeypatch.setattr("ninebox.core.database.get_user_data_dir", mock_get_user_data_dir)
    monkeypatch.setattr("ninebox.core.database.get_db_path", mock_get_db_path)
    monkeypatch.setattr("ninebox.services.update_analytics_service.get_db_path", mock_get_db_path)

    # Clear all dependency injection caches BEFORE test
    try:
        from ninebox.core.dependencies import (
            get_calibration_summary_service,
            get_db_manager,
            get_employee_service,
            get_llm_service,
            get_preferences_manager,
            get_session_manager,
            get_statistics_service,
        )

        # Clear all LRU caches to force fresh instances
        get_db_manager.cache_clear()
        get_session_manager.cache_clear()
        get_employee_service.cache_clear()
        get_statistics_service.cache_clear()
        get_calibration_summary_service.cache_clear()
        get_llm_service.cache_clear()
        get_preferences_manager.cache_clear()
    except ImportError:
        pass  # Some dependencies might not be imported yet

    # Reset ALL DatabaseManager instances (including those not from DI)
    try:
        from ninebox.services.database import DatabaseManager

        for obj in gc.get_objects():
            if isinstance(obj, DatabaseManager):
                obj._schema_initialized = False
                if hasattr(obj, '_db_path_cache'):
                    obj._db_path_cache = None
    except ImportError:
        pass

    # Force garbage collection to clean up any lingering references
    gc.collect()
    gc.collect()  # Run twice to break circular references

    yield  # Run the test

    # AFTER test: Complete cleanup

    # Clear dependency injection caches again
    try:
        from ninebox.core.dependencies import (
            get_calibration_summary_service,
            get_db_manager,
            get_employee_service,
            get_llm_service,
            get_preferences_manager,
            get_session_manager,
            get_statistics_service,
        )

        get_db_manager.cache_clear()
        get_session_manager.cache_clear()
        get_employee_service.cache_clear()
        get_statistics_service.cache_clear()
        get_calibration_summary_service.cache_clear()
        get_llm_service.cache_clear()
        get_preferences_manager.cache_clear()
    except ImportError:
        pass

    # Reset DatabaseManager instances
    try:
        from ninebox.services.database import DatabaseManager

        for obj in gc.get_objects():
            if isinstance(obj, DatabaseManager):
                obj._schema_initialized = False
                if hasattr(obj, '_db_path_cache'):
                    obj._db_path_cache = None
    except ImportError:
        pass

    # Restore original environment variables
    if original_app_data_dir is None:
        os.environ.pop("APP_DATA_DIR", None)
    else:
        os.environ["APP_DATA_DIR"] = original_app_data_dir

    if original_database_path is None:
        os.environ.pop("DATABASE_PATH", None)
    else:
        os.environ["DATABASE_PATH"] = original_database_path

    # Clean up the temporary directory
    try:
        if test_db_path.exists():
            test_db_path.unlink()
    except Exception:
        pass  # Ignore cleanup errors

    try:
        if Path(test_temp_dir).exists():
            import shutil
            shutil.rmtree(test_temp_dir, ignore_errors=True)
    except Exception:
        pass  # Ignore cleanup errors

    # Final garbage collection
    gc.collect()
