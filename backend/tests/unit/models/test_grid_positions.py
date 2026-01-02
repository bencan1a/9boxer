"""Tests for grid position utilities and performance bucket mapping."""

import pytest

from ninebox.models.grid_positions import (
    GRID_POSITION_PERFORMANCE_MAP,
    PERFORMANCE_BUCKETS,
    get_performance_category,
)

pytestmark = pytest.mark.unit


def test_performance_buckets_contains_all_categories() -> None:
    """Test that PERFORMANCE_BUCKETS contains High, Medium, and Low categories."""
    assert "High" in PERFORMANCE_BUCKETS
    assert "Medium" in PERFORMANCE_BUCKETS
    assert "Low" in PERFORMANCE_BUCKETS


def test_performance_buckets_high_positions() -> None:
    """Test that High performance bucket contains correct positions."""
    assert PERFORMANCE_BUCKETS["High"] == [9, 8, 6]


def test_performance_buckets_medium_positions() -> None:
    """Test that Medium performance bucket contains correct positions."""
    assert PERFORMANCE_BUCKETS["Medium"] == [7, 5, 3]


def test_performance_buckets_low_positions() -> None:
    """Test that Low performance bucket contains correct positions."""
    assert PERFORMANCE_BUCKETS["Low"] == [4, 2, 1]


def test_performance_buckets_covers_all_positions() -> None:
    """Test that all positions 1-9 are covered by performance buckets."""
    all_positions = set()
    for positions in PERFORMANCE_BUCKETS.values():
        all_positions.update(positions)

    assert all_positions == {1, 2, 3, 4, 5, 6, 7, 8, 9}


def test_grid_position_performance_map_all_positions() -> None:
    """Test that GRID_POSITION_PERFORMANCE_MAP covers all positions 1-9."""
    assert set(GRID_POSITION_PERFORMANCE_MAP.keys()) == {1, 2, 3, 4, 5, 6, 7, 8, 9}


def test_grid_position_performance_map_high_positions() -> None:
    """Test that high performance positions map correctly."""
    assert GRID_POSITION_PERFORMANCE_MAP[9] == "High"
    assert GRID_POSITION_PERFORMANCE_MAP[8] == "High"
    assert GRID_POSITION_PERFORMANCE_MAP[6] == "High"


def test_grid_position_performance_map_medium_positions() -> None:
    """Test that medium performance positions map correctly."""
    assert GRID_POSITION_PERFORMANCE_MAP[7] == "Medium"
    assert GRID_POSITION_PERFORMANCE_MAP[5] == "Medium"
    assert GRID_POSITION_PERFORMANCE_MAP[3] == "Medium"


def test_grid_position_performance_map_low_positions() -> None:
    """Test that low performance positions map correctly."""
    assert GRID_POSITION_PERFORMANCE_MAP[4] == "Low"
    assert GRID_POSITION_PERFORMANCE_MAP[2] == "Low"
    assert GRID_POSITION_PERFORMANCE_MAP[1] == "Low"


def test_get_performance_category_high_positions() -> None:
    """Test get_performance_category returns 'High' for high performer positions."""
    assert get_performance_category(9) == "High"
    assert get_performance_category(8) == "High"
    assert get_performance_category(6) == "High"


def test_get_performance_category_medium_positions() -> None:
    """Test get_performance_category returns 'Medium' for medium performer positions."""
    assert get_performance_category(7) == "Medium"
    assert get_performance_category(5) == "Medium"
    assert get_performance_category(3) == "Medium"


def test_get_performance_category_low_positions() -> None:
    """Test get_performance_category returns 'Low' for low performer positions."""
    assert get_performance_category(4) == "Low"
    assert get_performance_category(2) == "Low"
    assert get_performance_category(1) == "Low"


def test_get_performance_category_invalid_position_returns_none() -> None:
    """Test get_performance_category returns None for invalid positions."""
    assert get_performance_category(0) is None
    assert get_performance_category(10) is None
    assert get_performance_category(-1) is None
    assert get_performance_category(100) is None


def test_performance_buckets_and_map_consistency() -> None:
    """Test that PERFORMANCE_BUCKETS and GRID_POSITION_PERFORMANCE_MAP are consistent."""
    for category, positions in PERFORMANCE_BUCKETS.items():
        for position in positions:
            assert GRID_POSITION_PERFORMANCE_MAP[position] == category
