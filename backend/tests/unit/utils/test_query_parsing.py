"""Tests for query parsing utilities."""

import pytest
from fastapi import HTTPException

from ninebox.utils.query_parsing import parse_id_list


pytestmark = pytest.mark.unit


def test_parse_id_list_when_valid_ids_then_returns_list():
    """Test parsing valid comma-separated IDs."""
    result = parse_id_list("1,2,3")
    assert result == [1, 2, 3]


def test_parse_id_list_when_whitespace_then_strips():
    """Test parsing IDs with whitespace."""
    result = parse_id_list(" 1 , 2 , 3 ")
    assert result == [1, 2, 3]


def test_parse_id_list_when_none_then_returns_none():
    """Test parsing None input."""
    result = parse_id_list(None)
    assert result is None


def test_parse_id_list_when_empty_string_then_returns_none():
    """Test parsing empty string."""
    result = parse_id_list("")
    assert result is None


def test_parse_id_list_when_whitespace_only_then_returns_none():
    """Test parsing whitespace-only string."""
    result = parse_id_list("   ")
    assert result is None


def test_parse_id_list_when_invalid_id_then_raises_400():
    """Test parsing invalid ID raises 400 error."""
    with pytest.raises(HTTPException) as exc_info:
        parse_id_list("1,abc,3")
    assert exc_info.value.status_code == 400
    assert "Invalid ID" in exc_info.value.detail
    assert "must be comma-separated integers" in exc_info.value.detail


def test_parse_id_list_when_custom_param_name_then_uses_in_error():
    """Test error message uses custom parameter name."""
    with pytest.raises(HTTPException) as exc_info:
        parse_id_list("bad", "session ID")
    assert exc_info.value.status_code == 400
    assert "Invalid session ID" in exc_info.value.detail


def test_parse_id_list_when_empty_values_then_skips():
    """Test parsing list with empty values between commas."""
    result = parse_id_list("1,,2,3")
    assert result == [1, 2, 3]


def test_parse_id_list_when_single_id_then_returns_single_item_list():
    """Test parsing single ID."""
    result = parse_id_list("42")
    assert result == [42]
