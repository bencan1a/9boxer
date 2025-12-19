"""Tests for path utilities module."""

import os
import sys
from pathlib import Path
from unittest.mock import Mock, patch

import pytest

from ninebox.utils.paths import get_resource_path, get_user_data_dir


class TestGetResourcePath:
    """Test suite for get_resource_path function."""

    def test_get_resource_path_when_dev_mode_then_returns_project_relative_path(self) -> None:
        """Test path resolution in development mode."""
        # Arrange
        relative_path = "data/test.txt"

        # Act
        with patch.object(sys, "frozen", False, create=True):
            result = get_resource_path(relative_path)

        # Assert
        # Should resolve to backend/data/test.txt from project root
        assert isinstance(result, Path)
        assert str(result).endswith(os.path.join("backend", "data", "test.txt"))
        assert result.is_absolute()

    def test_get_resource_path_when_frozen_mode_then_uses_meipass(self) -> None:
        """Test path resolution in PyInstaller frozen mode."""
        # Arrange
        relative_path = "data/test.txt"
        mock_meipass = Path(r"C:\temp\_MEI12345")

        # Act
        with patch.object(sys, "frozen", True, create=True):
            with patch.object(sys, "_MEIPASS", str(mock_meipass), create=True):
                result = get_resource_path(relative_path)

        # Assert
        expected = mock_meipass / relative_path
        assert result == expected
        assert result.is_absolute()

    def test_get_resource_path_when_nested_path_then_preserves_structure(self) -> None:
        """Test path resolution with nested directory structure."""
        # Arrange
        relative_path = "resources/images/logo.png"

        # Act
        with patch.object(sys, "frozen", False, create=True):
            result = get_resource_path(relative_path)

        # Assert
        assert isinstance(result, Path)
        assert result.parts[-3:] == ("resources", "images", "logo.png")
        assert result.is_absolute()

    def test_get_resource_path_when_windows_path_then_normalizes_correctly(self) -> None:
        """Test Windows path normalization."""
        # Arrange
        relative_path = r"data\config\settings.ini"

        # Act
        with patch.object(sys, "frozen", False, create=True):
            result = get_resource_path(relative_path)

        # Assert
        assert isinstance(result, Path)
        # Path should handle both forward and backslashes
        assert "settings.ini" in str(result)
        assert result.is_absolute()

    def test_get_resource_path_when_empty_string_then_returns_base_path(self) -> None:
        """Test path resolution with empty relative path."""
        # Arrange
        relative_path = ""

        # Act
        with patch.object(sys, "frozen", False, create=True):
            result = get_resource_path(relative_path)

        # Assert
        assert isinstance(result, Path)
        assert result.is_absolute()
        # Should resolve to backend directory
        assert str(result).endswith("backend")


class TestGetUserDataDir:
    """Test suite for get_user_data_dir function."""

    def test_get_user_data_dir_when_env_var_set_then_uses_app_data_dir(
        self, tmp_path: Path
    ) -> None:
        """Test user data directory when APP_DATA_DIR environment variable is set."""
        # Arrange
        custom_dir = tmp_path / "custom_app_data"

        # Act
        with patch.dict(os.environ, {"APP_DATA_DIR": str(custom_dir)}):
            result = get_user_data_dir()

        # Assert
        assert result == custom_dir
        assert result.exists()
        assert result.is_dir()

    def test_get_user_data_dir_when_env_var_not_set_then_uses_home_directory(self) -> None:
        """Test user data directory defaults to ~/.ninebox."""
        # Act
        with patch.dict(os.environ, {}, clear=False):
            # Remove APP_DATA_DIR if it exists
            os.environ.pop("APP_DATA_DIR", None)
            result = get_user_data_dir()

        # Assert
        expected = Path.home() / ".ninebox"
        assert result == expected
        assert result.exists()
        assert result.is_dir()

    def test_get_user_data_dir_when_directory_exists_then_does_not_raise(
        self, tmp_path: Path
    ) -> None:
        """Test that existing directory does not cause errors."""
        # Arrange
        existing_dir = tmp_path / "existing_app_data"
        existing_dir.mkdir(parents=True, exist_ok=True)

        # Act
        with patch.dict(os.environ, {"APP_DATA_DIR": str(existing_dir)}):
            result = get_user_data_dir()

        # Assert
        assert result == existing_dir
        assert result.exists()

    def test_get_user_data_dir_when_nested_path_then_creates_parents(self, tmp_path: Path) -> None:
        """Test creation of nested directory structure."""
        # Arrange
        nested_dir = tmp_path / "level1" / "level2" / "app_data"

        # Act
        with patch.dict(os.environ, {"APP_DATA_DIR": str(nested_dir)}):
            result = get_user_data_dir()

        # Assert
        assert result == nested_dir
        assert result.exists()
        assert result.is_dir()
        assert result.parent.exists()

    def test_get_user_data_dir_when_called_multiple_times_then_idempotent(
        self, tmp_path: Path
    ) -> None:
        """Test that multiple calls are idempotent."""
        # Arrange
        app_dir = tmp_path / "app_data"

        # Act
        with patch.dict(os.environ, {"APP_DATA_DIR": str(app_dir)}):
            result1 = get_user_data_dir()
            result2 = get_user_data_dir()

        # Assert
        assert result1 == result2
        assert result1.exists()
        assert result2.exists()
