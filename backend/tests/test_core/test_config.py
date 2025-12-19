"""Tests for application configuration module."""

import os
from unittest.mock import patch

import pytest

from ninebox.core.config import Settings, settings


class TestSettings:
    """Test suite for Settings class."""

    def test_settings_when_defaults_then_valid_configuration(self) -> None:
        """Test that default settings are valid."""
        # Arrange & Act
        config = Settings()

        # Assert
        assert config.app_name == "9Boxer"
        assert config.app_version == "0.1.0"
        assert config.debug is False
        assert isinstance(config.cors_origins, list)
        assert len(config.cors_origins) == 2
        assert config.max_upload_size == 10 * 1024 * 1024

    def test_settings_when_debug_false_then_cors_has_dev_origins(self) -> None:
        """Test CORS configuration in non-debug mode uses development origins."""
        # Arrange & Act
        config = Settings(debug=False)

        # Assert
        assert "http://localhost:3000" in config.cors_origins
        assert "http://localhost:5173" in config.cors_origins

    def test_settings_when_debug_true_then_cors_allows_dev_origins(self) -> None:
        """Test CORS configuration in debug mode."""
        # Arrange & Act
        config = Settings(debug=True)

        # Assert
        assert isinstance(config.cors_origins, list)
        assert len(config.cors_origins) >= 2

    def test_settings_when_env_override_then_uses_env_value(self) -> None:
        """Test environment variable overrides for settings."""
        # Arrange
        test_app_name = "Test App"
        test_debug = "true"

        # Act
        with patch.dict(os.environ, {"APP_NAME": test_app_name, "DEBUG": test_debug}):
            config = Settings()

        # Assert
        assert config.app_name == test_app_name
        assert config.debug is True

    def test_settings_when_max_upload_size_override_then_uses_custom_value(self) -> None:
        """Test max upload size can be overridden via environment."""
        # Arrange
        custom_size = str(5 * 1024 * 1024)  # 5MB

        # Act
        with patch.dict(os.environ, {"MAX_UPLOAD_SIZE": custom_size}):
            config = Settings()

        # Assert
        assert config.max_upload_size == int(custom_size)

    def test_settings_when_cors_origins_env_then_parses_list(self) -> None:
        """Test CORS origins can be set via environment variable."""
        # Arrange
        # Note: pydantic_settings parses JSON arrays from env vars
        custom_origins = '["http://example.com", "https://example.com"]'

        # Act
        with patch.dict(os.environ, {"CORS_ORIGINS": custom_origins}):
            config = Settings()

        # Assert
        assert "http://example.com" in config.cors_origins
        assert "https://example.com" in config.cors_origins


class TestSettingsSingleton:
    """Test suite for settings singleton instance."""

    def test_settings_singleton_when_imported_then_is_settings_instance(self) -> None:
        """Test that settings module exports a Settings instance."""
        # Assert
        assert isinstance(settings, Settings)

    def test_settings_singleton_when_accessed_then_has_expected_defaults(self) -> None:
        """Test singleton has expected default values."""
        # Assert
        assert settings.app_name == "9Boxer"
        assert settings.app_version == "0.1.0"
        assert isinstance(settings.cors_origins, list)
        assert settings.max_upload_size > 0

    def test_settings_singleton_when_multiple_imports_then_same_instance(self) -> None:
        """Test that importing settings multiple times returns the same instance."""
        # Arrange
        from ninebox.core.config import settings as settings1
        from ninebox.core.config import settings as settings2

        # Assert
        assert settings1 is settings2
        assert id(settings1) == id(settings2)


class TestSettingsValidation:
    """Test suite for settings validation."""

    def test_settings_when_app_name_empty_then_accepts(self) -> None:
        """Test that empty app name is accepted (defaults to provided value)."""
        # Act
        config = Settings(app_name="")

        # Assert
        assert config.app_name == ""

    def test_settings_when_negative_max_upload_then_accepts(self) -> None:
        """Test that negative max_upload_size is technically accepted by pydantic."""
        # Act
        config = Settings(max_upload_size=-1)

        # Assert
        # Pydantic accepts this as an int, validation would need to be added
        assert config.max_upload_size == -1

    def test_settings_when_cors_origins_empty_then_accepts(self) -> None:
        """Test that empty CORS origins list is accepted."""
        # Act
        config = Settings(cors_origins=[])

        # Assert
        assert config.cors_origins == []
        assert isinstance(config.cors_origins, list)
