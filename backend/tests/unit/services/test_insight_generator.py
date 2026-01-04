"""Tests for the shared InsightGenerator module.

This module tests the centralized insight generation logic that was consolidated
from intelligence_service.py and calibration_summary_service.py.
"""

import pytest

from ninebox.services.insight_generator import InsightGenerator

pytestmark = pytest.mark.unit


# =============================================================================
# Test Fixtures
# =============================================================================


@pytest.fixture
def insight_generator():
    """Create an InsightGenerator instance for testing."""
    return InsightGenerator()


@pytest.fixture
def sample_location_analysis_green():
    """Sample location analysis with green status (no anomalies)."""
    return {
        "status": "green",
        "p_value": 0.45,
        "effect_size": 0.15,
        "sample_size": 100,
        "deviations": [
            {
                "category": "New York",
                "observed_high_pct": 21.0,
                "expected_high_pct": 20.0,
                "z_score": 0.5,
                "sample_size": 50,
                "is_significant": False,
            },
            {
                "category": "San Francisco",
                "observed_high_pct": 19.0,
                "expected_high_pct": 20.0,
                "z_score": -0.5,
                "sample_size": 50,
                "is_significant": False,
            },
        ],
        "interpretation": "Performance ratings are evenly distributed across locations.",
    }


@pytest.fixture
def sample_location_analysis_yellow():
    """Sample location analysis with yellow status (moderate anomaly)."""
    return {
        "status": "yellow",
        "p_value": 0.03,
        "effect_size": 0.35,
        "sample_size": 100,
        "deviations": [
            {
                "category": "Austin",
                "observed_high_pct": 35.0,
                "expected_high_pct": 20.0,
                "z_score": 2.5,
                "sample_size": 40,
                "is_significant": True,
            },
            {
                "category": "Seattle",
                "observed_high_pct": 15.0,
                "expected_high_pct": 20.0,
                "z_score": -1.2,
                "sample_size": 60,
                "is_significant": False,
            },
        ],
        "interpretation": "Significant location bias detected.",
    }


@pytest.fixture
def sample_location_analysis_red():
    """Sample location analysis with red status (severe anomaly)."""
    return {
        "status": "red",
        "p_value": 0.001,
        "effect_size": 0.65,
        "sample_size": 150,
        "deviations": [
            {
                "category": "Boston",
                "observed_high_pct": 45.0,
                "expected_high_pct": 20.0,
                "z_score": 4.2,
                "sample_size": 50,
                "is_significant": True,
            },
            {
                "category": "Chicago",
                "observed_high_pct": 8.0,
                "expected_high_pct": 20.0,
                "z_score": -3.1,
                "sample_size": 50,
                "is_significant": True,
            },
            {
                "category": "Denver",
                "observed_high_pct": 18.0,
                "expected_high_pct": 20.0,
                "z_score": -0.8,
                "sample_size": 50,
                "is_significant": False,
            },
        ],
        "interpretation": "Critical location bias detected.",
    }


@pytest.fixture
def sample_manager_analysis():
    """Sample manager analysis with deviations."""
    return {
        "status": "yellow",
        "p_value": 0.02,
        "effect_size": 0.40,
        "sample_size": 120,
        "deviations": [
            {
                "category": "Jane Smith",
                "observed_high_pct": 40.0,
                "expected_high_pct": 20.0,
                "medium_pct": 50.0,
                "low_pct": 10.0,
                "z_score": 2.8,
                "sample_size": 20,
                "is_significant": True,
            },
            {
                "category": "John Doe",
                "observed_high_pct": 10.0,
                "expected_high_pct": 20.0,
                "medium_pct": 75.0,
                "low_pct": 15.0,
                "z_score": -2.2,
                "sample_size": 15,
                "is_significant": True,
            },
        ],
        "interpretation": "Manager rating distribution anomalies detected.",
    }


# =============================================================================
# Test Basic Functionality
# =============================================================================


def test_generate_from_analyses_empty(insight_generator):
    """Test generate_from_analyses with empty analyses dict."""
    insights = insight_generator.generate_from_analyses({})
    assert insights == []


def test_generate_from_analyses_green_status_only(
    insight_generator, sample_location_analysis_green
):
    """Test that green status analyses don't generate insights."""
    analyses = {"location": sample_location_analysis_green}
    insights = insight_generator.generate_from_analyses(analyses)
    assert len(insights) == 0


def test_generate_from_analyses_multiple_dimensions(
    insight_generator, sample_location_analysis_yellow, sample_manager_analysis
):
    """Test generating insights from multiple analysis dimensions."""
    analyses = {
        "location": sample_location_analysis_yellow,
        "manager": sample_manager_analysis,
    }
    insights = insight_generator.generate_from_analyses(analyses)

    # Should get insights from both dimensions
    assert len(insights) > 0

    # Check that we have insights from both categories
    categories = {insight["category"] for insight in insights}
    assert "location" in categories
    assert "manager" in categories


def test_insights_sorted_by_priority(
    insight_generator, sample_location_analysis_red, sample_location_analysis_yellow
):
    """Test that insights are sorted by priority (high -> medium -> low)."""
    # Create analyses that will generate different priority insights
    analyses = {
        "location": sample_location_analysis_red,  # z=4.2 -> high priority
        "function": sample_location_analysis_yellow,  # z=2.5 -> medium priority
    }
    insights = insight_generator.generate_from_analyses(analyses)

    # Extract priorities
    priorities = [insight["priority"] for insight in insights]

    # Verify high priority comes before medium
    if "high" in priorities and "medium" in priorities:
        high_idx = priorities.index("high")
        medium_idx = priorities.index("medium")
        assert high_idx < medium_idx


# =============================================================================
# Test Insight Generation for Specific Dimensions
# =============================================================================


def test_generate_insights_for_location_with_significant_deviations(
    insight_generator, sample_location_analysis_yellow
):
    """Test insight generation for location with significant deviations."""
    insights = insight_generator._generate_insights_for_dimension(
        "location", sample_location_analysis_yellow
    )

    # Should generate insight for the significant deviation (Austin)
    assert len(insights) >= 1

    # Check the first insight
    insight = insights[0]
    assert insight["type"] == "anomaly"
    assert insight["category"] == "location"
    assert insight["priority"] in ["medium", "high"]
    assert "Austin" in insight["title"]
    assert "higher" in insight["title"]  # z_score is positive


def test_generate_insights_for_manager_includes_distribution_details(
    insight_generator, sample_manager_analysis
):
    """Test that manager insights include full distribution details."""
    insights = insight_generator._generate_insights_for_dimension(
        "manager", sample_manager_analysis
    )

    assert len(insights) >= 1

    # Check that description includes medium and low percentages for manager
    insight = insights[0]
    assert "high" in insight["description"].lower()
    assert "medium" in insight["description"].lower()
    assert "low" in insight["description"].lower()


def test_generate_insights_yellow_status_no_significant_deviations(insight_generator):
    """Test insight generation for yellow status with no significant deviations."""
    analysis = {
        "status": "yellow",
        "p_value": 0.04,
        "effect_size": 0.32,
        "sample_size": 80,
        "deviations": [
            {
                "category": "Engineering",
                "observed_high_pct": 23.0,
                "expected_high_pct": 20.0,
                "z_score": 1.5,
                "sample_size": 40,
                "is_significant": False,
            }
        ],
        "interpretation": "Some variation detected.",
    }

    insights = insight_generator._generate_insights_for_dimension("function", analysis)

    # Should generate a general insight
    assert len(insights) == 1
    insight = insights[0]
    assert insight["type"] == "anomaly"
    assert insight["category"] == "function"
    assert insight["priority"] == "medium"
    assert "differences detected" in insight["title"].lower()


def test_generate_insights_red_status_multiple_significant_deviations(
    insight_generator, sample_location_analysis_red
):
    """Test insight generation for red status with multiple significant deviations."""
    insights = insight_generator._generate_insights_for_dimension(
        "location", sample_location_analysis_red
    )

    # Should generate insights for both significant deviations (Boston and Chicago)
    assert len(insights) >= 2

    # Check that we have insights for both significant deviations
    titles = [insight["title"] for insight in insights]
    assert any("Boston" in title for title in titles)
    assert any("Chicago" in title for title in titles)


def test_generate_insights_priority_based_on_z_score(insight_generator):
    """Test that priority is correctly assigned based on z-score magnitude."""
    # High priority: |z| > 3.0
    high_z_analysis = {
        "status": "red",
        "p_value": 0.001,
        "sample_size": 100,
        "deviations": [
            {
                "category": "Critical Location",
                "observed_high_pct": 50.0,
                "expected_high_pct": 20.0,
                "z_score": 3.5,
                "sample_size": 50,
                "is_significant": True,
            }
        ],
    }

    insights = insight_generator._generate_insights_for_dimension(
        "location", high_z_analysis
    )
    assert insights[0]["priority"] == "high"

    # Medium priority: 2.0 <= |z| <= 3.0
    medium_z_analysis = {
        "status": "yellow",
        "p_value": 0.03,
        "sample_size": 100,
        "deviations": [
            {
                "category": "Moderate Location",
                "observed_high_pct": 30.0,
                "expected_high_pct": 20.0,
                "z_score": 2.5,
                "sample_size": 50,
                "is_significant": True,
            }
        ],
    }

    insights = insight_generator._generate_insights_for_dimension(
        "location", medium_z_analysis
    )
    assert insights[0]["priority"] == "medium"


def test_generate_insights_direction_detection(insight_generator):
    """Test that direction (higher/lower) is correctly detected."""
    # Positive z-score -> higher
    higher_analysis = {
        "status": "yellow",
        "p_value": 0.03,
        "sample_size": 100,
        "deviations": [
            {
                "category": "Above Average",
                "observed_high_pct": 30.0,
                "expected_high_pct": 20.0,
                "z_score": 2.2,
                "sample_size": 50,
                "is_significant": True,
            }
        ],
    }

    insights = insight_generator._generate_insights_for_dimension(
        "location", higher_analysis
    )
    assert "higher" in insights[0]["title"]

    # Negative z-score -> lower
    lower_analysis = {
        "status": "yellow",
        "p_value": 0.03,
        "sample_size": 100,
        "deviations": [
            {
                "category": "Below Average",
                "observed_high_pct": 10.0,
                "expected_high_pct": 20.0,
                "z_score": -2.2,
                "sample_size": 50,
                "is_significant": True,
            }
        ],
    }

    insights = insight_generator._generate_insights_for_dimension(
        "location", lower_analysis
    )
    assert "lower" in insights[0]["title"]


# =============================================================================
# Test Insight Structure and Fields
# =============================================================================


def test_insight_has_required_fields(
    insight_generator, sample_location_analysis_yellow
):
    """Test that generated insights have all required fields."""
    insights = insight_generator._generate_insights_for_dimension(
        "location", sample_location_analysis_yellow
    )

    insight = insights[0]

    # Required fields
    assert "id" in insight
    assert "type" in insight
    assert "category" in insight
    assert "priority" in insight
    assert "title" in insight
    assert "description" in insight
    assert "affected_count" in insight
    assert "source_data" in insight

    # Validate field types
    assert isinstance(insight["id"], str)
    assert isinstance(insight["type"], str)
    assert isinstance(insight["category"], str)
    assert isinstance(insight["priority"], str)
    assert isinstance(insight["title"], str)
    assert isinstance(insight["description"], str)
    assert isinstance(insight["affected_count"], int)
    assert isinstance(insight["source_data"], dict)


def test_insight_source_data_contains_analysis_metadata(
    insight_generator, sample_location_analysis_yellow
):
    """Test that source_data contains relevant analysis metadata."""
    insights = insight_generator._generate_insights_for_dimension(
        "location", sample_location_analysis_yellow
    )

    source_data = insights[0]["source_data"]

    # Should contain statistical metadata
    assert "z_score" in source_data
    assert "p_value" in source_data
    assert "observed_pct" in source_data
    assert "expected_pct" in source_data


# =============================================================================
# Test ID Generation
# =============================================================================


def test_generate_insight_id_deterministic(insight_generator):
    """Test that ID generation is deterministic."""
    id1 = insight_generator._generate_insight_id("anomaly", "location", "New York")
    id2 = insight_generator._generate_insight_id("anomaly", "location", "New York")

    assert id1 == id2


def test_generate_insight_id_unique_for_different_inputs(insight_generator):
    """Test that different inputs generate different IDs."""
    id1 = insight_generator._generate_insight_id("anomaly", "location", "New York")
    id2 = insight_generator._generate_insight_id("anomaly", "location", "Boston")
    id3 = insight_generator._generate_insight_id("anomaly", "function", "New York")

    assert id1 != id2
    assert id1 != id3
    assert id2 != id3


def test_generate_insight_id_handles_various_types(insight_generator):
    """Test that ID generation handles various component types."""
    # Should handle strings, numbers, etc.
    id1 = insight_generator._generate_insight_id("test", 123, 45.6, "string")
    assert isinstance(id1, str)
    assert len(id1) == 16  # First 16 characters of MD5 hash


# =============================================================================
# Test Edge Cases
# =============================================================================


def test_empty_deviations_list(insight_generator):
    """Test handling of analysis with empty deviations list."""
    analysis = {
        "status": "yellow",
        "p_value": 0.04,
        "effect_size": 0.30,
        "sample_size": 50,
        "deviations": [],
        "interpretation": "Some issue detected.",
    }

    insights = insight_generator._generate_insights_for_dimension("tenure", analysis)

    # Should generate a general insight
    assert len(insights) == 1
    assert "differences detected" in insights[0]["title"].lower()


def test_missing_interpretation_field(insight_generator):
    """Test handling of analysis missing interpretation field."""
    analysis = {
        "status": "yellow",
        "p_value": 0.04,
        "sample_size": 50,
        "deviations": [],
        # interpretation field missing
    }

    insights = insight_generator._generate_insights_for_dimension("level", analysis)

    # Should still generate insight with fallback description
    assert len(insights) == 1
    assert insights[0]["description"] is not None


def test_deviation_missing_optional_fields(insight_generator):
    """Test handling of deviations with missing optional fields."""
    analysis = {
        "status": "yellow",
        "p_value": 0.03,
        "sample_size": 100,
        "deviations": [
            {
                # Only required fields, others will use defaults
                "is_significant": True,
            }
        ],
    }

    insights = insight_generator._generate_insights_for_dimension("function", analysis)

    # Should handle gracefully with defaults
    assert len(insights) >= 1
    insight = insights[0]
    assert insight["title"] is not None
    assert insight["description"] is not None


# =============================================================================
# Integration Test
# =============================================================================


def test_full_workflow_multiple_dimensions(
    insight_generator,
    sample_location_analysis_yellow,
    sample_location_analysis_red,
    sample_manager_analysis,
):
    """Test complete workflow with multiple analysis dimensions."""
    analyses = {
        "location": sample_location_analysis_yellow,
        "function": sample_location_analysis_red,
        "manager": sample_manager_analysis,
    }

    insights = insight_generator.generate_from_analyses(analyses)

    # Should generate multiple insights
    assert len(insights) >= 3

    # All should have valid structure
    for insight in insights:
        assert "id" in insight
        assert "type" in insight
        assert "category" in insight
        assert "priority" in insight
        assert insight["category"] in ["location", "function", "manager"]
        assert insight["priority"] in ["high", "medium", "low"]

    # Should be sorted by priority
    priorities = [insight["priority"] for insight in insights]
    priority_values = {"high": 0, "medium": 1, "low": 2}
    priority_scores = [priority_values[p] for p in priorities]
    assert priority_scores == sorted(priority_scores)
