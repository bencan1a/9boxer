"""Tests for database module."""

import os
from pathlib import Path
from unittest.mock import MagicMock, Mock, patch

import pytest

from ninebox.core.database import get_db_path



pytestmark = pytest.mark.unit

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
        with patch("ninebox.core.database.get_user_data_dir", return_value=custom_data_dir):
            result = get_db_path()

        # Assert
        assert result == custom_data_dir / "ninebox.db"
        assert result.parent == custom_data_dir

    def test_get_db_path_when_app_data_dir_set_then_respects_location(
        self, tmp_path: Path
    ) -> None:
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

    def test_get_db_path_when_frozen_mode_then_uses_writable_location(
        self, tmp_path: Path
    ) -> None:
        """Test that database path is in writable location even in frozen mode."""
        # Arrange
        custom_data_dir = tmp_path / "frozen_app_data"

        # Act
        # Simulate frozen mode by using get_user_data_dir which handles frozen mode
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
