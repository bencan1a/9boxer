"""Tests for database module."""

import os
from collections.abc import Generator
from pathlib import Path
from unittest.mock import MagicMock, Mock, patch

import pytest

from ninebox.core.database import get_db_path


pytestmark = pytest.mark.unit


@pytest.fixture(autouse=True)
def cleanup_env_state() -> Generator[None, None, None]:
    """Clean up environment state before and after each test.

    Ensures environment variables don't leak between tests.
    Preserves session-scoped APP_DATA_DIR and DATABASE_PATH from conftest.

    This fixture handles all environment variables that could affect database
    path resolution and configuration settings, while respecting session-level
    test database configuration.
    """
    # List of all environment variables that should be isolated
    env_vars_to_isolate = [
        "APP_NAME",          # Used by Settings
        "DEBUG",             # Used by Settings
        "MAX_UPLOAD_SIZE",   # Used by Settings
        "CORS_ORIGINS",      # Used by Settings
        "ANTHROPIC_API_KEY", # Used by Settings (LLM)
        "LLM_MODEL",         # Used by Settings (LLM)
        "LLM_MAX_TOKENS",    # Used by Settings (LLM)
    ]

    # IMPORTANT: DO NOT clear APP_DATA_DIR and DATABASE_PATH
    # These are set by the session-scoped test_db_path fixture in conftest.py
    # and should persist across all tests to ensure consistent database paths

    # BEFORE test: Save ALL original environment variables (except session-scoped ones)
    original_env = {}
    for var_name in env_vars_to_isolate:
        original_env[var_name] = os.environ.get(var_name)

    # BEFORE test: Clear only test-specific environment variables
    # Leave APP_DATA_DIR and DATABASE_PATH alone - they're managed by session fixture
    for var_name in env_vars_to_isolate:
        if var_name in os.environ:
            del os.environ[var_name]

    yield

    # AFTER test: Restore test-specific environment variables only
    for var_name, original_value in original_env.items():
        if original_value is None:
            # Variable wasn't set originally, ensure it's removed
            os.environ.pop(var_name, None)
        else:
            # Variable was set originally, restore it
            os.environ[var_name] = original_value


class TestGetDbPath:
    """Test suite for get_db_path function."""

    def test_get_db_path_when_called_then_returns_path(self) -> None:
        """Test that get_db_path returns a Path object."""
        # Act
        result = get_db_path()

        # Assert
        assert isinstance(result, Path)
        assert str(result).endswith("ninebox.db")

    def test_get_db_path_when_called_then_uses_user_data_dir(self, tmp_path: Path) -> None:
        """Test that database path uses user data directory."""
        # Arrange
        custom_data_dir = tmp_path / "app_data"

        # Act
        # Temporarily remove APP_DATA_DIR to ensure patch takes precedence
        with patch.dict(os.environ, {"APP_DATA_DIR": str(custom_data_dir)}):
            with patch("ninebox.core.database.get_user_data_dir", return_value=custom_data_dir):
                result = get_db_path()

        # Assert
        assert result == custom_data_dir / "ninebox.db"
        assert result.parent == custom_data_dir

    def test_get_db_path_when_app_data_dir_set_then_respects_location(self, tmp_path: Path) -> None:
        """Test database path respects APP_DATA_DIR environment variable."""
        # Arrange
        custom_dir = tmp_path / "custom_app_data"

        # Act
        with patch.dict(os.environ, {"APP_DATA_DIR": str(custom_dir)}):
            result = get_db_path()

        # Assert
        assert result.parent == custom_dir
        assert result.name == "ninebox.db"

    def test_get_db_path_when_called_multiple_times_then_consistent(self) -> None:
        """Test that multiple calls return consistent paths."""
        # Act
        result1 = get_db_path()
        result2 = get_db_path()

        # Assert
        assert result1 == result2
        assert str(result1) == str(result2)

    def test_get_db_path_when_frozen_mode_then_uses_writable_location(self, tmp_path: Path) -> None:
        """Test that database path is in writable location even in frozen mode."""
        # Arrange
        custom_data_dir = tmp_path / "frozen_app_data"

        # Act
        # Temporarily set APP_DATA_DIR to ensure patch takes precedence
        # Simulate frozen mode by using get_user_data_dir which handles frozen mode
        with patch.dict(os.environ, {"APP_DATA_DIR": str(custom_data_dir)}):
            with patch("ninebox.core.database.get_user_data_dir", return_value=custom_data_dir):
                result = get_db_path()

        # Assert
        assert result == custom_data_dir / "ninebox.db"
        # Verify the path is absolute and writable
        assert result.is_absolute()

    def test_get_db_path_when_windows_then_handles_path_correctly(self, tmp_path: Path) -> None:
        """Test database path handles Windows paths correctly."""
        # Arrange
        windows_style_dir = tmp_path / "AppData" / "Local" / "ninebox"

        # Act
        # Temporarily set APP_DATA_DIR to ensure patch takes precedence
        with patch.dict(os.environ, {"APP_DATA_DIR": str(windows_style_dir)}):
            with patch("ninebox.core.database.get_user_data_dir", return_value=windows_style_dir):
                result = get_db_path()

        # Assert
        assert result == windows_style_dir / "ninebox.db"
        assert isinstance(result, Path)
        assert result.is_absolute()


class TestDatabasePathIntegration:
    """Integration tests for database path resolution."""

    def test_database_path_when_user_data_dir_created_then_path_accessible(
        self, tmp_path: Path
    ) -> None:
        """Test that database path is accessible after user data directory creation."""
        # Arrange
        app_data_dir = tmp_path / "new_app_data"

        # Act
        with patch.dict(os.environ, {"APP_DATA_DIR": str(app_data_dir)}):
            db_path = get_db_path()

        # Assert
        # User data directory should be created by get_user_data_dir
        assert db_path.parent.exists()
        assert db_path.parent.is_dir()
        assert db_path.is_absolute()

    def test_database_path_when_nested_structure_then_resolves_correctly(
        self, tmp_path: Path
    ) -> None:
        """Test database path resolution with nested directory structure."""
        # Arrange
        nested_dir = tmp_path / "level1" / "level2" / "level3" / "app_data"

        # Act
        with patch.dict(os.environ, {"APP_DATA_DIR": str(nested_dir)}):
            db_path = get_db_path()

        # Assert
        assert db_path.parent == nested_dir
        assert db_path.name == "ninebox.db"
        # Parent directory should be created
        assert db_path.parent.exists()
