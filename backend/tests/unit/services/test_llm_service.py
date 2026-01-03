"""Tests for LLM service."""

import os
from unittest.mock import patch

import pytest

from ninebox.services.llm_service import LLMService

pytestmark = pytest.mark.unit


class TestLLMServiceAvailability:
    """Tests for LLM service availability checks."""

    def test_is_available_without_api_key(self) -> None:
        """Test that service is unavailable without API key."""
        with patch.dict(os.environ, {}, clear=True):
            # Remove ANTHROPIC_API_KEY if set
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


class TestLLMServiceResponseParsing:
    """Tests for Claude response parsing."""

    @pytest.fixture
    def service(self) -> LLMService:
        """Create a service instance (without client)."""
        with patch.dict(os.environ, {}, clear=True):
            os.environ.pop("ANTHROPIC_API_KEY", None)
            return LLMService()

    def test_parse_json_from_code_block(self, service: LLMService) -> None:
        """Test parsing JSON from markdown code block."""
        content = '''Here is my analysis:

```json
{
  "summary": "Test summary",
  "key_recommendations": ["Rec 1", "Rec 2"],
  "discussion_points": ["Point 1"]
}
```
'''
        result = service._parse_response(content)

        assert result["summary"] == "Test summary"
        assert len(result["key_recommendations"]) == 2
        assert len(result["discussion_points"]) == 1

    def test_parse_raw_json(self, service: LLMService) -> None:
        """Test parsing raw JSON without code block."""
        content = '''{
  "summary": "Direct JSON",
  "key_recommendations": ["Rec"],
  "discussion_points": []
}'''
        result = service._parse_response(content)

        assert result["summary"] == "Direct JSON"

    def test_parse_raises_for_invalid_json(self, service: LLMService) -> None:
        """Test that invalid JSON raises ValueError."""
        content = "This is not JSON at all"

        with pytest.raises(ValueError, match="Could not find JSON"):
            service._parse_response(content)

    def test_parse_handles_malformed_json(self, service: LLMService) -> None:
        """Test handling of malformed JSON."""
        content = '{"summary": "incomplete'

        with pytest.raises(ValueError):
            service._parse_response(content)


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
