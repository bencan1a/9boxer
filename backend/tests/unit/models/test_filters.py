"""Tests for employee filter models."""

import pytest
from fastapi import HTTPException

from ninebox.models.filters import EmployeeFilters

pytestmark = pytest.mark.unit


def test_from_query_params_when_all_params_then_parses_correctly() -> None:
    """Test parsing all query parameters."""
    filters = EmployeeFilters.from_query_params(
        levels="Senior,Junior",
        job_profiles="Engineer,Manager",
        managers="Alice,Bob",
        performance="High,Medium",
        potential="High,Low",
        exclude_ids="1,2,3",
    )

    assert filters.levels == ["Senior", "Junior"]
    assert filters.job_profiles == ["Engineer", "Manager"]
    assert filters.managers == ["Alice", "Bob"]
    assert filters.performance == ["High", "Medium"]
    assert filters.potential == ["High", "Low"]
    assert filters.exclude_ids == [1, 2, 3]


def test_from_query_params_when_none_then_returns_empty_filters() -> None:
    """Test parsing when all parameters are None."""
    filters = EmployeeFilters.from_query_params()

    assert filters.levels is None
    assert filters.job_profiles is None
    assert filters.managers is None
    assert filters.performance is None
    assert filters.potential is None
    assert filters.exclude_ids is None


def test_from_query_params_when_whitespace_then_strips() -> None:
    """Test that whitespace is properly trimmed from values."""
    filters = EmployeeFilters.from_query_params(
        levels=" Senior , Junior ",
        job_profiles="  Engineer  ,  Manager  ",
    )

    assert filters.levels == ["Senior", "Junior"]
    assert filters.job_profiles == ["Engineer", "Manager"]


def test_from_query_params_when_empty_string_then_none() -> None:
    """Test that empty strings are treated as None."""
    filters = EmployeeFilters.from_query_params(
        levels="",
        job_profiles="   ",
        managers=None,
    )

    assert filters.levels is None
    assert filters.job_profiles is None
    assert filters.managers is None


def test_from_query_params_when_single_value_then_creates_list() -> None:
    """Test that single values are converted to lists."""
    filters = EmployeeFilters.from_query_params(
        levels="Senior",
        exclude_ids="42",
    )

    assert filters.levels == ["Senior"]
    assert filters.exclude_ids == [42]


def test_from_query_params_when_invalid_exclude_ids_then_raises_400() -> None:
    """Test that invalid exclude_ids raises HTTPException."""
    with pytest.raises(HTTPException) as exc_info:
        EmployeeFilters.from_query_params(exclude_ids="1,invalid,3")

    assert exc_info.value.status_code == 400
    assert "employee ID" in exc_info.value.detail


def test_to_filter_kwargs_when_some_none_then_only_includes_non_none() -> None:
    """Test that to_filter_kwargs excludes None values."""
    filters = EmployeeFilters(
        levels=["Senior"],
        job_profiles=None,
        managers=["Alice"],
        performance=None,
        potential=None,
        exclude_ids=None,
    )

    kwargs = filters.to_filter_kwargs()

    assert "levels" in kwargs
    assert kwargs["levels"] == ["Senior"]
    assert "managers" in kwargs
    assert kwargs["managers"] == ["Alice"]
    assert "job_profiles" not in kwargs
    assert "performance" not in kwargs
    assert "potential" not in kwargs
    assert "exclude_ids" not in kwargs


def test_to_filter_kwargs_when_all_none_then_empty_dict() -> None:
    """Test that to_filter_kwargs returns empty dict when all None."""
    filters = EmployeeFilters()

    kwargs = filters.to_filter_kwargs()

    assert kwargs == {}


def test_to_filter_kwargs_when_all_set_then_includes_all() -> None:
    """Test that to_filter_kwargs includes all non-None values."""
    filters = EmployeeFilters(
        levels=["Senior", "Junior"],
        job_profiles=["Engineer"],
        managers=["Alice"],
        performance=["High"],
        potential=["Medium"],
        exclude_ids=[1, 2, 3],
    )

    kwargs = filters.to_filter_kwargs()

    assert len(kwargs) == 6
    assert kwargs["levels"] == ["Senior", "Junior"]
    assert kwargs["job_profiles"] == ["Engineer"]
    assert kwargs["managers"] == ["Alice"]
    assert kwargs["performance"] == ["High"]
    assert kwargs["potential"] == ["Medium"]
    assert kwargs["exclude_ids"] == [1, 2, 3]


def test_parse_string_list_when_empty_items_then_filters_out() -> None:
    """Test that empty items in comma-separated list are filtered out."""
    filters = EmployeeFilters.from_query_params(levels="Senior,,Junior,")

    assert filters.levels == ["Senior", "Junior"]


def test_parse_string_list_when_only_commas_then_none() -> None:
    """Test that string with only commas is treated as None."""
    filters = EmployeeFilters.from_query_params(levels=",,,")

    assert filters.levels is None
