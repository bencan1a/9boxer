"""Tests for LLM service."""

import json
import os
import sys
from collections.abc import Generator
from pathlib import Path
from unittest.mock import MagicMock, Mock, patch

import pytest

from ninebox.services.llm_service import (
    CALIBRATION_ANALYSIS_SCHEMA,
    DEFAULT_MODEL,
    HAIKU_MODEL,
    LLMService,
    load_system_prompt,
)

pytestmark = pytest.mark.unit


@pytest.fixture(autouse=True)
def cleanup_env_state() -> Generator[None, None, None]:
    """Clean up environment state before and after each test.

    Ensures LLM-related environment variables don't leak between tests.
    This is critical for test isolation, especially for tests that verify
    behavior when API keys are missing.
    """
    # List of LLM-related environment variables that should be isolated
    env_vars_to_isolate = [
        "ANTHROPIC_API_KEY",  # Used by LLMService
        "LLM_MODEL",          # Used by LLMService
        "LLM_MAX_TOKENS",     # Used by LLMService (if applicable)
    ]

    # BEFORE test: Save original environment variables
    original_env = {}
    for var_name in env_vars_to_isolate:
        original_env[var_name] = os.environ.get(var_name)

    # BEFORE test: Clear all LLM environment variables so tests start clean
    for var_name in env_vars_to_isolate:
        if var_name in os.environ:
            del os.environ[var_name]

    yield

    # AFTER test: Restore original environment variables
    for var_name, original_value in original_env.items():
        if original_value is None:
            # Variable wasn't set originally, ensure it's removed
            os.environ.pop(var_name, None)
        else:
            # Variable was set originally, restore it
            os.environ[var_name] = original_value


class TestLLMServiceAvailability:
    """Tests for LLM service availability checks."""

    def test_is_available_without_api_key(self) -> None:
        """Test that service is unavailable without API key."""
        # Preserve session-scoped test database environment variables
        # These are set by the session-scoped test_db_path fixture in conftest.py
        # and must persist across all tests to ensure consistent database paths
        app_data_dir = os.environ.get("APP_DATA_DIR")
        database_path = os.environ.get("DATABASE_PATH")
        env_to_preserve = {}
        if app_data_dir:
            env_to_preserve["APP_DATA_DIR"] = app_data_dir
        if database_path:
            env_to_preserve["DATABASE_PATH"] = database_path

        with patch.dict(os.environ, env_to_preserve, clear=True):
            # Remove ANTHROPIC_API_KEY if set (though it should already be clear from fixture)
            os.environ.pop("ANTHROPIC_API_KEY", None)
            service = LLMService()

            availability = service.is_available()

            assert availability["available"] is False
            assert "ANTHROPIC_API_KEY" in (availability["reason"] or "")

    def test_is_available_with_api_key_but_no_anthropic(self) -> None:
        """Test availability check when anthropic package import fails."""
        with patch.dict(os.environ, {"ANTHROPIC_API_KEY": "test-key"}):
            # The service may or may not have anthropic installed
            # If it does, the client will be initialized
            # We can test that with an API key, the service reports availability
            service = LLMService()

            availability = service.is_available()

            # With API key set, check if client initialized
            if service._client is not None:
                assert availability["available"] is True
            else:
                # Client failed to initialize (no anthropic package)
                assert availability["available"] is False


class TestSystemPromptLoading:
    """Tests for system prompt loading from configuration files.

    These tests are for a potential future enhancement where prompts
    are loaded from external config files rather than being hardcoded.
    """

    def test_load_prompt_from_config_file_successfully(self) -> None:
        """Test that system prompt can be loaded from a config file."""
        try:
            from ninebox.services.llm_service import load_system_prompt
        except ImportError:
            pytest.skip("load_system_prompt not yet implemented")

        # Assuming prompts are stored in a config file
        prompt = load_system_prompt()

        # Should return a non-empty string
        assert isinstance(prompt, str)
        assert len(prompt) > 0
        assert "calibration" in prompt.lower() or "hr" in prompt.lower()

    def test_load_prompt_handles_missing_file_gracefully(self) -> None:
        """Test that missing prompt file is handled gracefully."""
        try:
            from ninebox.services.llm_service import load_system_prompt
        except ImportError:
            pytest.skip("load_system_prompt not yet implemented")

        # Try to load a non-existent prompt
        try:
            prompt = load_system_prompt("nonexistent_prompt.txt")
            # If it doesn't raise an error, should return default
            assert isinstance(prompt, str)
        except FileNotFoundError:
            # This is also acceptable behavior
            pass

    def test_load_prompt_returns_string_content(self) -> None:
        """Test that loaded prompt is returned as string."""
        try:
            from ninebox.services.llm_service import load_system_prompt
        except ImportError:
            pytest.skip("load_system_prompt not yet implemented")

        prompt = load_system_prompt()

        # Should be a string
        assert isinstance(prompt, str)

        # Should not have extra whitespace at ends
        assert prompt == prompt.strip()

    def test_load_custom_prompt_from_path(self) -> None:
        """Test loading a custom prompt from a specific path."""
        try:
            from ninebox.services.llm_service import load_system_prompt
        except ImportError:
            pytest.skip("load_system_prompt not yet implemented")

        # Test with custom path parameter
        # This would require a test fixture file
        import tempfile
        import os

        # Create a temporary prompt file
        with tempfile.NamedTemporaryFile(mode='w', delete=False, suffix='.txt') as f:
            f.write("Custom test prompt for calibration")
            temp_path = f.name

        try:
            prompt = load_system_prompt(temp_path)
            assert prompt == "Custom test prompt for calibration"
        finally:
            # Clean up
            os.unlink(temp_path)

    def test_load_prompt_with_template_variables(self) -> None:
        """Test that prompts can include template variables."""
        try:
            from ninebox.services.llm_service import load_system_prompt
        except ImportError:
            pytest.skip("load_system_prompt not yet implemented")

        # Some prompt systems support variables like {company_name}
        prompt = load_system_prompt()

        # If prompt includes variables, they should be in proper format
        # This is implementation-dependent
        assert isinstance(prompt, str)

    def test_default_prompt_is_used_when_config_missing(self) -> None:
        """Test that a default prompt is used when config file is missing."""
        try:
            from ninebox.services.llm_service import load_system_prompt, DEFAULT_SYSTEM_PROMPT
        except ImportError:
            pytest.skip("load_system_prompt not yet implemented")

        # Even if file is missing, should fall back to default
        prompt = load_system_prompt("missing_file.txt", use_default_on_error=True)

        assert isinstance(prompt, str)
        assert len(prompt) > 0

    def test_prompt_file_format_validation(self) -> None:
        """Test that prompt file format is validated."""
        try:
            from ninebox.services.llm_service import load_system_prompt
        except ImportError:
            pytest.skip("load_system_prompt not yet implemented")

        import tempfile
        import os

        # Create an invalid prompt file (e.g., binary file)
        with tempfile.NamedTemporaryFile(mode='wb', delete=False) as f:
            f.write(b'\x00\x01\x02\x03')  # Binary content
            temp_path = f.name

        try:
            # Should either raise an error or handle gracefully
            # If no error raised, should return a string (graceful handling)
            result = load_system_prompt(temp_path)
            if result is not None:
                # Graceful handling - accepts it
                assert isinstance(result, str)
            else:
                # Or raises an error
                pytest.fail("Should either return a string or raise an error")
        except (ValueError, UnicodeDecodeError):
            # This is acceptable - strict validation
            pass
        finally:
            os.unlink(temp_path)

    def test_load_prompt_from_yaml_config(self) -> None:
        """Test loading prompt from YAML configuration."""
        try:
            from ninebox.services.llm_service import load_system_prompt_from_yaml
        except ImportError:
            pytest.skip("load_system_prompt_from_yaml not yet implemented")

        import tempfile
        import os

        # Create a YAML config file
        yaml_content = """
system_prompt: |
  You are an HR consultant.
  Help with calibration meetings.
        """

        with tempfile.NamedTemporaryFile(mode='w', delete=False, suffix='.yaml') as f:
            f.write(yaml_content)
            temp_path = f.name

        try:
            prompt = load_system_prompt_from_yaml(temp_path)
            assert "HR consultant" in prompt
            assert "calibration" in prompt
        finally:
            os.unlink(temp_path)


class TestLLMServiceInitialization:
    """Tests for LLM service initialization."""

    def test_init_with_api_key_parameter(self) -> None:
        """Test initialization with API key passed as parameter."""
        service = LLMService(api_key="test-key-123")
        assert service.api_key == "test-key-123"
        assert service.model == DEFAULT_MODEL

    def test_init_with_model_parameter(self) -> None:
        """Test initialization with custom model parameter."""
        service = LLMService(api_key="test-key", model=HAIKU_MODEL)
        assert service.model == HAIKU_MODEL

    def test_init_with_env_var_api_key(self) -> None:
        """Test initialization with API key from environment variable."""
        with patch.dict(os.environ, {"ANTHROPIC_API_KEY": "env-key-123"}):
            service = LLMService()
            assert service.api_key == "env-key-123"

    def test_init_with_env_var_model(self) -> None:
        """Test initialization with model from environment variable."""
        with patch.dict(
            os.environ,
            {"ANTHROPIC_API_KEY": "test-key", "LLM_MODEL": "claude-opus-4-5-20250929"}
        ):
            service = LLMService()
            assert service.model == "claude-opus-4-5-20250929"

    def test_init_parameter_overrides_env_var(self) -> None:
        """Test that parameters override environment variables."""
        with patch.dict(
            os.environ,
            {"ANTHROPIC_API_KEY": "env-key", "LLM_MODEL": "env-model"}
        ):
            service = LLMService(api_key="param-key", model="param-model")
            assert service.api_key == "param-key"
            assert service.model == "param-model"

    def test_init_with_anthropic_import_error(self) -> None:
        """Test initialization when anthropic package is not available."""
        with patch.dict(os.environ, {"ANTHROPIC_API_KEY": "test-key"}):
            # Temporarily remove anthropic from sys.modules if present
            anthropic_module = sys.modules.pop("anthropic", None)
            try:
                # Mock the import to raise ImportError
                import builtins
                real_import = builtins.__import__

                def mock_import(name, *args, **kwargs):
                    if name == "anthropic":
                        raise ImportError("No module named 'anthropic'")
                    return real_import(name, *args, **kwargs)

                with patch.object(builtins, '__import__', side_effect=mock_import):
                    # Should not raise, just log warning
                    service = LLMService()
                    assert service._client is None
            finally:
                # Restore anthropic module if it was present
                if anthropic_module is not None:
                    sys.modules["anthropic"] = anthropic_module

    def test_init_with_anthropic_client_error(self) -> None:
        """Test initialization when anthropic client fails to initialize."""
        with patch.dict(os.environ, {"ANTHROPIC_API_KEY": "test-key"}):
            # Create a mock anthropic module
            mock_anthropic_class = MagicMock(side_effect=ValueError("Invalid API key"))
            mock_module = MagicMock()
            mock_module.Anthropic = mock_anthropic_class

            # Temporarily replace or add anthropic module
            anthropic_module = sys.modules.get("anthropic")
            sys.modules["anthropic"] = mock_module

            try:
                service = LLMService()
                assert service._client is None
            finally:
                # Restore original module state
                if anthropic_module is not None:
                    sys.modules["anthropic"] = anthropic_module
                else:
                    sys.modules.pop("anthropic", None)


class TestLoadSystemPrompt:
    """Tests for load_system_prompt function."""

    def test_load_system_prompt_success(self) -> None:
        """Test loading system prompt successfully."""
        prompt = load_system_prompt()
        assert isinstance(prompt, str)
        assert len(prompt) > 0

    def test_load_system_prompt_with_custom_path(self) -> None:
        """Test loading system prompt with custom path."""
        import tempfile

        with tempfile.NamedTemporaryFile(mode='w', delete=False, suffix='.txt') as f:
            f.write("  Custom prompt content  \n")
            temp_path = f.name

        try:
            prompt = load_system_prompt(temp_path)
            assert prompt == "Custom prompt content"
        finally:
            os.unlink(temp_path)

    def test_load_system_prompt_nonexistent_file(self) -> None:
        """Test loading system prompt with nonexistent file."""
        with pytest.raises(FileNotFoundError):
            load_system_prompt("nonexistent_file_12345.txt")

    def test_load_system_prompt_unicode_error(self) -> None:
        """Test loading system prompt with invalid UTF-8 content."""
        import tempfile

        with tempfile.NamedTemporaryFile(mode='wb', delete=False) as f:
            f.write(b'\xff\xfe\x00\x01')  # Invalid UTF-8
            temp_path = f.name

        try:
            with pytest.raises(UnicodeDecodeError):
                load_system_prompt(temp_path)
        finally:
            os.unlink(temp_path)

    def test_load_system_prompt_pyinstaller_frozen_mode(self) -> None:
        """Test loading system prompt in PyInstaller frozen mode."""
        # Mock sys.frozen and sys._MEIPASS
        with patch.object(sys, 'frozen', True, create=True):
            # Create temp directory to simulate _MEIPASS
            import tempfile
            with tempfile.TemporaryDirectory() as tmpdir:
                # Create config directory structure
                config_dir = Path(tmpdir) / "config"
                config_dir.mkdir()
                prompt_file = config_dir / "calibration_agent_prompt.txt"
                prompt_file.write_text("Frozen mode prompt")

                with patch.object(sys, '_MEIPASS', tmpdir, create=True):
                    prompt = load_system_prompt("nonexistent.txt")
                    assert prompt == "Frozen mode prompt"

    def test_load_system_prompt_pyinstaller_frozen_mode_missing_file(self) -> None:
        """Test loading system prompt in frozen mode when file is missing."""
        with patch.object(sys, 'frozen', True, create=True):
            import tempfile
            with tempfile.TemporaryDirectory() as tmpdir:
                with patch.object(sys, '_MEIPASS', tmpdir, create=True):
                    with pytest.raises(FileNotFoundError, match="PyInstaller bundle"):
                        load_system_prompt("nonexistent.txt")


class TestLLMMetrics:
    """Tests for LLM metrics logging."""

    def test_log_llm_metrics_success(self) -> None:
        """Test logging LLM metrics for successful call."""
        service = LLMService(api_key="test-key")

        with patch('ninebox.services.llm_service.logger') as mock_logger:
            service._log_llm_metrics(
                duration_ms=1500.5,
                model="claude-sonnet-4-5-20250929",
                input_tokens=1000,
                output_tokens=500,
                status="success"
            )

            # Should log info for success
            mock_logger.info.assert_called_once()
            call_args = mock_logger.info.call_args

            # Check log message
            assert "LLM call completed" in call_args[0][0]
            assert "1500ms" in call_args[0][0]
            assert "1500 tokens" in call_args[0][0]

            # Check structured data
            log_data = call_args[1]['extra']
            assert log_data['event'] == 'llm_call'
            assert log_data['status'] == 'success'
            assert log_data['tokens']['input'] == 1000
            assert log_data['tokens']['output'] == 500
            assert log_data['tokens']['total'] == 1500

    def test_log_llm_metrics_error(self) -> None:
        """Test logging LLM metrics for failed call."""
        service = LLMService(api_key="test-key")

        with patch('ninebox.services.llm_service.logger') as mock_logger:
            service._log_llm_metrics(
                duration_ms=500.0,
                model="claude-sonnet-4-5-20250929",
                input_tokens=100,
                output_tokens=0,
                status="error",
                error_type="RuntimeError"
            )

            # Should log error
            mock_logger.error.assert_called_once()
            call_args = mock_logger.error.call_args

            # Check log message includes error type
            assert "LLM call failed" in call_args[0][0]
            assert "RuntimeError" in call_args[0][0]

            # Check structured data
            log_data = call_args[1]['extra']
            assert log_data['status'] == 'error'
            assert log_data['error_type'] == 'RuntimeError'

    def test_log_llm_metrics_cost_calculation(self) -> None:
        """Test that cost calculation is correct."""
        service = LLMService(api_key="test-key")

        with patch('ninebox.services.llm_service.logger') as mock_logger:
            service._log_llm_metrics(
                duration_ms=1000.0,
                model="claude-sonnet-4-5-20250929",
                input_tokens=1_000_000,  # 1M tokens
                output_tokens=1_000_000,  # 1M tokens
                status="success"
            )

            call_args = mock_logger.info.call_args
            log_data = call_args[1]['extra']

            # Input: 1M tokens * $3/M = $3
            # Output: 1M tokens * $15/M = $15
            # Total: $18
            assert log_data['cost_usd']['input'] == 3.0
            assert log_data['cost_usd']['output'] == 15.0
            assert log_data['cost_usd']['total'] == 18.0


class TestGenerateCalibrationAnalysis:
    """Tests for generate_calibration_analysis method."""

    def test_generate_analysis_service_unavailable(self) -> None:
        """Test that error is raised when service is unavailable."""
        service = LLMService()  # No API key

        with pytest.raises(RuntimeError, match="LLM service not available"):
            service.generate_calibration_analysis({"test": "data"})

    def test_generate_analysis_prompt_file_not_found(self) -> None:
        """Test error when system prompt file is missing."""
        service = LLMService(api_key="test-key")
        # Mock client to make service available
        service._client = MagicMock()

        with patch('ninebox.services.llm_service.load_system_prompt', side_effect=FileNotFoundError("Prompt not found")):
            with pytest.raises(RuntimeError, match="Failed to load system prompt"):
                service.generate_calibration_analysis({"test": "data"})

    def test_generate_analysis_success(self) -> None:
        """Test successful generation of calibration analysis."""
        service = LLMService(api_key="test-key")

        # Mock the Anthropic client
        mock_client = MagicMock()
        service._client = mock_client

        # Create mock response
        mock_response = MagicMock()
        mock_response.model = "claude-sonnet-4-5-20250929"
        mock_response.stop_reason = "end_turn"
        mock_response.usage.input_tokens = 1000
        mock_response.usage.output_tokens = 500

        # Create valid response content
        response_data = {
            "summary": "Test summary of calibration findings",
            "issues": [
                {
                    "type": "anomaly",
                    "category": "level",
                    "priority": "high",
                    "title": "Test issue",
                    "description": "Test description",
                    "affected_count": 10,
                    "source_data": {"z_score": 2.5}
                }
            ]
        }
        mock_response.content = [MagicMock(text=json.dumps(response_data))]

        mock_client.beta.messages.create.return_value = mock_response

        # Mock load_system_prompt
        with patch('ninebox.services.llm_service.load_system_prompt', return_value="Test prompt"):
            result = service.generate_calibration_analysis({"test": "data"})

        # Verify result
        assert result["summary"] == "Test summary of calibration findings"
        assert len(result["issues"]) == 1
        assert result["issues"][0]["type"] == "anomaly"
        assert result["issues"][0]["affected_count"] == 10

        # Verify API was called correctly
        mock_client.beta.messages.create.assert_called_once()
        call_kwargs = mock_client.beta.messages.create.call_args[1]
        assert call_kwargs["model"] == DEFAULT_MODEL
        assert call_kwargs["temperature"] == 0.3
        assert "Test prompt" in call_kwargs["system"]

    def test_generate_analysis_with_custom_model(self) -> None:
        """Test generation with custom model parameter."""
        service = LLMService(api_key="test-key")
        mock_client = MagicMock()
        service._client = mock_client

        # Create mock response
        mock_response = MagicMock()
        mock_response.model = HAIKU_MODEL
        mock_response.stop_reason = "end_turn"
        mock_response.usage.input_tokens = 500
        mock_response.usage.output_tokens = 200

        response_data = {"summary": "Fast summary", "issues": []}
        mock_response.content = [MagicMock(text=json.dumps(response_data))]

        mock_client.beta.messages.create.return_value = mock_response

        with patch('ninebox.services.llm_service.load_system_prompt', return_value="Test prompt"):
            result = service.generate_calibration_analysis({"test": "data"}, model=HAIKU_MODEL)

        # Verify custom model was used
        call_kwargs = mock_client.beta.messages.create.call_args[1]
        assert call_kwargs["model"] == HAIKU_MODEL

    def test_generate_analysis_large_input_warning(self) -> None:
        """Test warning is logged for large input data."""
        service = LLMService(api_key="test-key")
        mock_client = MagicMock()
        service._client = mock_client

        # Create large data package (>120,000 chars = ~30,000 tokens)
        large_data = {"employees": ["Employee"] * 15000}

        mock_response = MagicMock()
        mock_response.model = DEFAULT_MODEL
        mock_response.stop_reason = "end_turn"
        mock_response.usage.input_tokens = 35000
        mock_response.usage.output_tokens = 1000

        response_data = {"summary": "Summary", "issues": []}
        mock_response.content = [MagicMock(text=json.dumps(response_data))]

        mock_client.beta.messages.create.return_value = mock_response

        with patch('ninebox.services.llm_service.load_system_prompt', return_value="Test prompt"):
            with patch('ninebox.services.llm_service.logger') as mock_logger:
                service.generate_calibration_analysis(large_data)

                # Should log warning about large input
                warning_calls = [call for call in mock_logger.warning.call_args_list
                               if "Large input detected" in str(call)]
                assert len(warning_calls) > 0

    def test_generate_analysis_json_decode_error(self) -> None:
        """Test handling of JSON decode errors (should not happen with structured outputs)."""
        service = LLMService(api_key="test-key")
        mock_client = MagicMock()
        service._client = mock_client

        mock_response = MagicMock()
        mock_response.model = DEFAULT_MODEL
        mock_response.stop_reason = "end_turn"
        mock_response.usage.input_tokens = 100
        mock_response.usage.output_tokens = 50

        # Return invalid JSON (shouldn't happen with structured outputs)
        mock_response.content = [MagicMock(text="Invalid JSON {")]

        mock_client.beta.messages.create.return_value = mock_response

        with patch('ninebox.services.llm_service.load_system_prompt', return_value="Test prompt"):
            with pytest.raises(RuntimeError, match="Failed to parse structured output"):
                service.generate_calibration_analysis({"test": "data"})

    def test_generate_analysis_api_error(self) -> None:
        """Test handling of API errors."""
        service = LLMService(api_key="test-key")
        mock_client = MagicMock()
        service._client = mock_client

        # Simulate API error
        mock_client.beta.messages.create.side_effect = Exception("API Error")

        with patch('ninebox.services.llm_service.load_system_prompt', return_value="Test prompt"):
            with pytest.raises(RuntimeError, match="Failed to generate calibration analysis"):
                service.generate_calibration_analysis({"test": "data"})

    def test_generate_analysis_client_not_initialized(self) -> None:
        """Test error when client is not initialized."""
        service = LLMService(api_key="test-key")
        service._client = None  # Client failed to initialize

        with pytest.raises(RuntimeError, match="LLM service not available"):
            service.generate_calibration_analysis({"test": "data"})

    def test_generate_analysis_metrics_logging_on_error(self) -> None:
        """Test that metrics are logged even on error."""
        service = LLMService(api_key="test-key")
        mock_client = MagicMock()
        service._client = mock_client

        mock_client.beta.messages.create.side_effect = ValueError("Test error")

        with patch('ninebox.services.llm_service.load_system_prompt', return_value="Test prompt"):
            with patch('ninebox.services.llm_service.logger') as mock_logger:
                try:
                    service.generate_calibration_analysis({"test": "data"})
                except RuntimeError:
                    pass

                # Should log error metrics
                error_calls = [call for call in mock_logger.error.call_args_list
                             if "LLM call failed" in str(call)]
                assert len(error_calls) > 0

    def test_generate_analysis_includes_data_in_prompt(self) -> None:
        """Test that data package is included in user prompt."""
        service = LLMService(api_key="test-key")
        mock_client = MagicMock()
        service._client = mock_client

        mock_response = MagicMock()
        mock_response.model = DEFAULT_MODEL
        mock_response.stop_reason = "end_turn"
        mock_response.usage.input_tokens = 100
        mock_response.usage.output_tokens = 50

        response_data = {"summary": "Summary", "issues": []}
        mock_response.content = [MagicMock(text=json.dumps(response_data))]

        mock_client.beta.messages.create.return_value = mock_response

        test_data = {"metric": "test_value", "count": 42}

        with patch('ninebox.services.llm_service.load_system_prompt', return_value="Test prompt"):
            service.generate_calibration_analysis(test_data)

        # Verify data is in the prompt
        call_kwargs = mock_client.beta.messages.create.call_args[1]
        user_message = call_kwargs["messages"][0]["content"]
        assert "test_value" in user_message
        assert "42" in user_message
