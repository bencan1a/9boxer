"""Tests for validate-translations.py script.

This test suite validates the translation file validation script to ensure
it correctly identifies JSON syntax errors, key parity issues, structure
inconsistencies, and placeholder mismatches.
"""

import importlib.util
import json
import sys
from pathlib import Path
from typing import Any

import pytest

# Import the functions from the validate-translations.py script
import sys
import importlib.util

# Add tools directory to path and import the validation script
# Note: The script has a dash in the name, so we need to use importlib
tools_path = Path(__file__).parent.parent.parent.parent.parent / "tools"
validate_script_path = tools_path / "validate-translations.py"

spec = importlib.util.spec_from_file_location("validate_translations", validate_script_path)
if spec is None or spec.loader is None:
    raise ImportError(f"Could not load validate-translations.py from {validate_script_path}")
validate_translations_module = importlib.util.module_from_spec(spec)
sys.modules["validate_translations"] = validate_translations_module
spec.loader.exec_module(validate_translations_module)

# Import the functions we need
extract_placeholders = validate_translations_module.extract_placeholders
flatten_keys = validate_translations_module.flatten_keys
get_structure_paths = validate_translations_module.get_structure_paths
validate_json_syntax = validate_translations_module.validate_json_syntax
validate_translations = validate_translations_module.validate_translations


pytestmark = pytest.mark.unit


class TestExtractPlaceholders:
    """Test suite for placeholder extraction from translation strings."""

    def test_extract_single_placeholder(self) -> None:
        """Test extraction of a single placeholder."""
        text = "Hello {{name}}"
        result = extract_placeholders(text)
        assert result == {"name"}

    def test_extract_multiple_placeholders(self) -> None:
        """Test extraction of multiple placeholders."""
        text = "You have {{count}} items in {{location}}"
        result = extract_placeholders(text)
        assert result == {"count", "location"}

    def test_extract_no_placeholders(self) -> None:
        """Test text with no placeholders."""
        text = "Hello world"
        result = extract_placeholders(text)
        assert result == set()

    def test_extract_repeated_placeholder(self) -> None:
        """Test that repeated placeholders are deduplicated."""
        text = "{{name}} said hello to {{name}}"
        result = extract_placeholders(text)
        assert result == {"name"}

    def test_extract_from_empty_string(self) -> None:
        """Test extraction from empty string."""
        text = ""
        result = extract_placeholders(text)
        assert result == set()

    def test_extract_placeholder_with_underscores(self) -> None:
        """Test placeholder with underscores in name."""
        text = "Welcome {{user_name}}"
        result = extract_placeholders(text)
        assert result == {"user_name"}

    def test_extract_placeholder_with_numbers(self) -> None:
        """Test placeholder with numbers in name."""
        text = "Item {{item123}}"
        result = extract_placeholders(text)
        assert result == {"item123"}


class TestFlattenKeys:
    """Test suite for flattening nested dictionaries."""

    def test_flatten_simple_dict(self) -> None:
        """Test flattening a simple flat dictionary."""
        data = {"key1": "value1", "key2": "value2"}
        result = flatten_keys(data)
        assert result == {"key1": "value1", "key2": "value2"}

    def test_flatten_nested_dict(self) -> None:
        """Test flattening a nested dictionary."""
        data = {"parent": {"child": "value"}}
        result = flatten_keys(data)
        assert result == {"parent.child": "value"}

    def test_flatten_deeply_nested_dict(self) -> None:
        """Test flattening a deeply nested dictionary."""
        data = {"level1": {"level2": {"level3": "value"}}}
        result = flatten_keys(data)
        assert result == {"level1.level2.level3": "value"}

    def test_flatten_mixed_depth(self) -> None:
        """Test flattening dictionary with mixed nesting depths."""
        data = {"flat": "value1", "nested": {"key": "value2"}}
        result = flatten_keys(data)
        assert result == {"flat": "value1", "nested.key": "value2"}

    def test_flatten_empty_dict(self) -> None:
        """Test flattening an empty dictionary."""
        data: dict[str, Any] = {}
        result = flatten_keys(data)
        assert result == {}


class TestGetStructurePaths:
    """Test suite for extracting structure paths from nested dictionaries."""

    def test_structure_simple_dict(self) -> None:
        """Test structure paths for a simple dictionary."""
        data = {"key1": "value1", "key2": "value2"}
        result = get_structure_paths(data)
        assert result == {"key1", "key2"}

    def test_structure_nested_dict(self) -> None:
        """Test structure paths for nested dictionary."""
        data = {"parent": {"child": "value"}}
        result = get_structure_paths(data)
        assert result == {"parent", "parent.child"}

    def test_structure_deeply_nested(self) -> None:
        """Test structure paths for deeply nested dictionary."""
        data = {"level1": {"level2": {"level3": "value"}}}
        result = get_structure_paths(data)
        assert result == {"level1", "level1.level2", "level1.level2.level3"}

    def test_structure_multiple_branches(self) -> None:
        """Test structure paths with multiple branches."""
        data = {"branch1": {"leaf1": "v1"}, "branch2": {"leaf2": "v2"}}
        result = get_structure_paths(data)
        expected = {"branch1", "branch1.leaf1", "branch2", "branch2.leaf2"}
        assert result == expected


class TestValidateJsonSyntax:
    """Test suite for JSON syntax validation."""

    def test_valid_json_file(self, tmp_path: Path) -> None:
        """Test validation of a valid JSON file."""
        # Arrange
        test_file = tmp_path / "valid.json"
        data = {"key": "value"}
        test_file.write_text(json.dumps(data), encoding="utf-8")

        # Act
        success, error, parsed_data = validate_json_syntax(test_file)

        # Assert
        assert success is True
        assert error is None
        assert parsed_data == data

    def test_invalid_json_syntax(self, tmp_path: Path) -> None:
        """Test validation of invalid JSON syntax."""
        # Arrange
        test_file = tmp_path / "invalid.json"
        test_file.write_text('{"key": "value",}', encoding="utf-8")  # Trailing comma

        # Act
        success, error, parsed_data = validate_json_syntax(test_file)

        # Assert
        assert success is False
        assert error is not None
        assert "JSON syntax error" in error
        assert parsed_data is None

    def test_empty_json_file(self, tmp_path: Path) -> None:
        """Test validation of empty JSON object."""
        # Arrange
        test_file = tmp_path / "empty.json"
        test_file.write_text("{}", encoding="utf-8")

        # Act
        success, error, parsed_data = validate_json_syntax(test_file)

        # Assert
        assert success is True
        assert error is None
        assert parsed_data == {}

    def test_nested_json_file(self, tmp_path: Path) -> None:
        """Test validation of nested JSON structure."""
        # Arrange
        test_file = tmp_path / "nested.json"
        data = {"parent": {"child": {"grandchild": "value"}}}
        test_file.write_text(json.dumps(data), encoding="utf-8")

        # Act
        success, error, parsed_data = validate_json_syntax(test_file)

        # Assert
        assert success is True
        assert error is None
        assert parsed_data == data


class TestValidateTranslations:
    """Test suite for the main translation validation function."""

    def test_single_valid_file(self, tmp_path: Path) -> None:
        """Test validation with a single valid file."""
        # Arrange
        file1 = tmp_path / "en.json"
        file1.write_text(json.dumps({"key": "value"}), encoding="utf-8")

        # Act
        result = validate_translations([file1])

        # Assert
        assert result == 0

    def test_two_matching_files(self, tmp_path: Path) -> None:
        """Test validation with two files that have matching keys."""
        # Arrange
        file1 = tmp_path / "en.json"
        file2 = tmp_path / "es.json"
        data = {"greeting": "Hello", "farewell": "Goodbye"}
        file1.write_text(json.dumps(data), encoding="utf-8")
        file2.write_text(json.dumps({"greeting": "Hola", "farewell": "Adiós"}), encoding="utf-8")

        # Act
        result = validate_translations([file1, file2])

        # Assert
        assert result == 0

    def test_json_syntax_error(self, tmp_path: Path) -> None:
        """Test that JSON syntax errors are detected."""
        # Arrange
        file1 = tmp_path / "invalid.json"
        file1.write_text('{"key": invalid}', encoding="utf-8")

        # Act
        result = validate_translations([file1])

        # Assert
        assert result == 1

    def test_missing_keys_detected(self, tmp_path: Path) -> None:
        """Test that missing keys between files are detected."""
        # Arrange
        file1 = tmp_path / "en.json"
        file2 = tmp_path / "es.json"
        file1.write_text(json.dumps({"key1": "value1", "key2": "value2"}), encoding="utf-8")
        file2.write_text(json.dumps({"key1": "valor1"}), encoding="utf-8")  # Missing key2

        # Act
        result = validate_translations([file1, file2])

        # Assert
        assert result == 1

    def test_placeholder_consistency_valid(self, tmp_path: Path) -> None:
        """Test that consistent placeholders pass validation."""
        # Arrange
        file1 = tmp_path / "en.json"
        file2 = tmp_path / "es.json"
        file1.write_text(json.dumps({"msg": "Hello {{name}}"}), encoding="utf-8")
        file2.write_text(json.dumps({"msg": "Hola {{name}}"}), encoding="utf-8")

        # Act
        result = validate_translations([file1, file2])

        # Assert
        assert result == 0

    def test_placeholder_inconsistency_detected(self, tmp_path: Path) -> None:
        """Test that placeholder inconsistencies are detected."""
        # Arrange
        file1 = tmp_path / "en.json"
        file2 = tmp_path / "es.json"
        file1.write_text(json.dumps({"msg": "Hello {{name}}"}), encoding="utf-8")
        file2.write_text(json.dumps({"msg": "Hola {{nombre}}"}), encoding="utf-8")

        # Act
        result = validate_translations([file1, file2])

        # Assert
        assert result == 1

    def test_structure_consistency_valid(self, tmp_path: Path) -> None:
        """Test that consistent structure passes validation."""
        # Arrange
        file1 = tmp_path / "en.json"
        file2 = tmp_path / "es.json"
        data1 = {"app": {"title": "9Boxer", "subtitle": "Tool"}}
        data2 = {"app": {"title": "9Boxer", "subtitle": "Herramienta"}}
        file1.write_text(json.dumps(data1), encoding="utf-8")
        file2.write_text(json.dumps(data2), encoding="utf-8")

        # Act
        result = validate_translations([file1, file2])

        # Assert
        assert result == 0

    def test_structure_inconsistency_detected(self, tmp_path: Path) -> None:
        """Test that structure inconsistencies are detected."""
        # Arrange
        file1 = tmp_path / "en.json"
        file2 = tmp_path / "es.json"
        data1 = {"app": {"title": "9Boxer"}}
        data2 = {"application": {"title": "9Boxer"}}  # Different structure
        file1.write_text(json.dumps(data1), encoding="utf-8")
        file2.write_text(json.dumps(data2), encoding="utf-8")

        # Act
        result = validate_translations([file1, file2])

        # Assert
        assert result == 1

    def test_real_translation_files(self) -> None:
        """Test validation with actual project translation files."""
        # Arrange
        project_root = Path(__file__).parent.parent.parent.parent.parent
        en_file = project_root / "frontend" / "src" / "i18n" / "locales" / "en" / "translation.json"
        es_file = project_root / "frontend" / "src" / "i18n" / "locales" / "es" / "translation.json"

        # Only run if files exist (they should in the actual project)
        if not (en_file.exists() and es_file.exists()):
            pytest.skip("Translation files not found in project")

        # Act
        result = validate_translations([en_file, es_file])

        # Assert
        assert result == 0, "Project translation files should be valid"

    def test_multiple_placeholder_types(self, tmp_path: Path) -> None:
        """Test files with multiple different placeholder types."""
        # Arrange
        file1 = tmp_path / "en.json"
        file2 = tmp_path / "es.json"
        data1 = {
            "msg1": "Hello {{name}}",
            "msg2": "You have {{count}} items",
            "msg3": "Welcome to {{location}}",
        }
        data2 = {
            "msg1": "Hola {{name}}",
            "msg2": "Tienes {{count}} elementos",
            "msg3": "Bienvenido a {{location}}",
        }
        file1.write_text(json.dumps(data1), encoding="utf-8")
        file2.write_text(json.dumps(data2), encoding="utf-8")

        # Act
        result = validate_translations([file1, file2])

        # Assert
        assert result == 0

    def test_unicode_content(self, tmp_path: Path) -> None:
        """Test files with Unicode content."""
        # Arrange
        file1 = tmp_path / "en.json"
        file2 = tmp_path / "zh.json"
        file1.write_text(json.dumps({"greeting": "Hello"}), encoding="utf-8")
        file2.write_text(json.dumps({"greeting": "你好"}), encoding="utf-8")

        # Act
        result = validate_translations([file1, file2])

        # Assert
        assert result == 0
