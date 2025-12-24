#!/usr/bin/env python3
"""
Standalone test runner for validate-translations.py.

This script can be run without pytest to verify basic functionality.
"""

import importlib.util
import json
import sys
import tempfile
from pathlib import Path


def load_validation_module():
    """Load the validate-translations.py module."""
    tools_path = Path(__file__).parent
    validate_script_path = tools_path / "validate-translations.py"
    
    spec = importlib.util.spec_from_file_location("validate_translations", validate_script_path)
    if spec is None or spec.loader is None:
        raise ImportError(f"Could not load validate-translations.py from {validate_script_path}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def test_extract_placeholders(module):
    """Test placeholder extraction."""
    print("Testing placeholder extraction...")
    
    # Test single placeholder
    result = module.extract_placeholders("Hello {{name}}")
    assert result == {"name"}, f"Expected {{'name'}}, got {result}"
    
    # Test multiple placeholders
    result = module.extract_placeholders("{{count}} items in {{location}}")
    assert result == {"count", "location"}, f"Expected {{'count', 'location'}}, got {result}"
    
    # Test no placeholders
    result = module.extract_placeholders("Hello world")
    assert result == set(), f"Expected empty set, got {result}"
    
    print("✓ Placeholder extraction tests passed")


def test_flatten_keys(module):
    """Test key flattening."""
    print("Testing key flattening...")
    
    # Test simple dict
    result = module.flatten_keys({"key1": "value1", "key2": "value2"})
    assert result == {"key1": "value1", "key2": "value2"}
    
    # Test nested dict
    result = module.flatten_keys({"parent": {"child": "value"}})
    assert result == {"parent.child": "value"}
    
    # Test deeply nested
    result = module.flatten_keys({"l1": {"l2": {"l3": "value"}}})
    assert result == {"l1.l2.l3": "value"}
    
    print("✓ Key flattening tests passed")


def test_structure_paths(module):
    """Test structure path extraction."""
    print("Testing structure path extraction...")
    
    # Test simple dict
    result = module.get_structure_paths({"key1": "value1", "key2": "value2"})
    assert result == {"key1", "key2"}
    
    # Test nested dict
    result = module.get_structure_paths({"parent": {"child": "value"}})
    assert result == {"parent", "parent.child"}
    
    print("✓ Structure path tests passed")


def test_json_validation(module):
    """Test JSON validation."""
    print("Testing JSON validation...")
    
    with tempfile.TemporaryDirectory() as tmpdir:
        tmpdir_path = Path(tmpdir)
        
        # Test valid JSON
        valid_file = tmpdir_path / "valid.json"
        valid_file.write_text(json.dumps({"key": "value"}), encoding="utf-8")
        success, error, data = module.validate_json_syntax(valid_file)
        assert success is True, f"Expected success, got error: {error}"
        assert data == {"key": "value"}
        
        # Test invalid JSON
        invalid_file = tmpdir_path / "invalid.json"
        invalid_file.write_text('{"key": "value",}', encoding="utf-8")
        success, error, data = module.validate_json_syntax(invalid_file)
        assert success is False, "Expected failure for invalid JSON"
        assert error is not None
        assert data is None
    
    print("✓ JSON validation tests passed")


def test_full_validation(module):
    """Test full translation validation."""
    print("Testing full translation validation...")
    
    with tempfile.TemporaryDirectory() as tmpdir:
        tmpdir_path = Path(tmpdir)
        
        # Test matching files
        file1 = tmpdir_path / "en.json"
        file2 = tmpdir_path / "es.json"
        file1.write_text(json.dumps({"greeting": "Hello {{name}}"}), encoding="utf-8")
        file2.write_text(json.dumps({"greeting": "Hola {{name}}"}), encoding="utf-8")
        
        result = module.validate_translations([file1, file2])
        assert result == 0, "Expected validation to pass for matching files"
        
        # Test missing keys
        file3 = tmpdir_path / "fr.json"
        file3.write_text(json.dumps({"farewell": "Au revoir"}), encoding="utf-8")
        result = module.validate_translations([file1, file3])
        assert result == 1, "Expected validation to fail for missing keys"
        
        # Test placeholder mismatch
        file4 = tmpdir_path / "de.json"
        file4.write_text(json.dumps({"greeting": "Hallo {{nombre}}"}), encoding="utf-8")
        result = module.validate_translations([file1, file4])
        assert result == 1, "Expected validation to fail for placeholder mismatch"
    
    print("✓ Full validation tests passed")


def test_real_translation_files(module):
    """Test with real project translation files."""
    print("Testing with real project translation files...")
    
    project_root = Path(__file__).parent.parent
    en_file = project_root / "frontend" / "src" / "i18n" / "locales" / "en" / "translation.json"
    es_file = project_root / "frontend" / "src" / "i18n" / "locales" / "es" / "translation.json"
    
    if not (en_file.exists() and es_file.exists()):
        print("⚠ Skipping real file test - translation files not found")
        return
    
    result = module.validate_translations([en_file, es_file])
    assert result == 0, "Project translation files should be valid"
    
    print("✓ Real translation file tests passed")


def main():
    """Run all tests."""
    print("=" * 60)
    print("Standalone Test Runner for validate-translations.py")
    print("=" * 60)
    print()
    
    try:
        module = load_validation_module()
        
        test_extract_placeholders(module)
        test_flatten_keys(module)
        test_structure_paths(module)
        test_json_validation(module)
        test_full_validation(module)
        test_real_translation_files(module)
        
        print()
        print("=" * 60)
        print("✅ All tests passed!")
        print("=" * 60)
        return 0
        
    except AssertionError as e:
        print()
        print("=" * 60)
        print(f"❌ Test failed: {e}")
        print("=" * 60)
        return 1
    except Exception as e:
        print()
        print("=" * 60)
        print(f"❌ Error running tests: {e}")
        import traceback
        traceback.print_exc()
        print("=" * 60)
        return 1


if __name__ == "__main__":
    sys.exit(main())
