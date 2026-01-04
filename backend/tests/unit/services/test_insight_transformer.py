"""Tests for InsightTransformer - LLM agent output transformation.

This module tests the InsightTransformer class which converts raw LLM agent
outputs (JSON) into structured Insight objects.
"""

import pytest

from ninebox.services.insight_transformer import InsightTransformer


# =============================================================================
# Test: transform_agent_issues
# =============================================================================


def test_transform_single_issue():
    """Test transforming a single agent issue to Insight object."""
    transformer = InsightTransformer()

    agent_issues = [
        {
            "type": "anomaly",
            "category": "location",
            "priority": "high",
            "title": "Seattle office rates higher than average",
            "description": "Seattle has 75% high performers vs 60% expected (z=2.5)",
            "affected_count": 25,
            "source_data": {
                "z_score": 2.5,
                "observed_pct": 75.0,
                "expected_pct": 60.0,
            },
            "cluster_id": "cluster-geo-001",
            "cluster_title": "Geographic Patterns",
        }
    ]

    insights = transformer.transform_agent_issues(agent_issues)

    assert len(insights) == 1
    insight = insights[0]

    # Verify all fields are present
    assert insight["type"] == "anomaly"
    assert insight["category"] == "location"
    assert insight["priority"] == "high"
    assert insight["title"] == "Seattle office rates higher than average"
    assert insight["description"] == "Seattle has 75% high performers vs 60% expected (z=2.5)"
    assert insight["affected_count"] == 25
    assert insight["source_data"]["z_score"] == 2.5
    assert insight["cluster_id"] == "cluster-geo-001"
    assert insight["cluster_title"] == "Geographic Patterns"

    # Verify ID is generated and has correct prefix
    assert "id" in insight
    assert insight["id"].startswith("agent-")
    assert len(insight["id"]) > 10  # Should have hash suffix


def test_transform_multiple_issues():
    """Test transforming multiple agent issues."""
    transformer = InsightTransformer()

    agent_issues = [
        {
            "type": "anomaly",
            "category": "location",
            "priority": "high",
            "title": "Seattle rates high",
            "description": "Seattle description",
            "affected_count": 25,
        },
        {
            "type": "recommendation",
            "category": "function",
            "priority": "medium",
            "title": "Engineering needs review",
            "description": "Engineering description",
            "affected_count": 50,
        },
        {
            "type": "anomaly",
            "category": "level",
            "priority": "low",
            "title": "Junior level cluster",
            "description": "Junior description",
            "affected_count": 10,
        },
    ]

    insights = transformer.transform_agent_issues(agent_issues)

    assert len(insights) == 3

    # Verify each insight has unique ID
    ids = [i["id"] for i in insights]
    assert len(ids) == len(set(ids))  # All IDs are unique

    # Verify types are preserved
    assert insights[0]["type"] == "anomaly"
    assert insights[1]["type"] == "recommendation"
    assert insights[2]["type"] == "anomaly"


def test_transform_empty_list_returns_empty():
    """Test transforming an empty list returns empty list."""
    transformer = InsightTransformer()

    insights = transformer.transform_agent_issues([])

    assert insights == []


def test_handle_missing_optional_fields():
    """Test handling of missing optional fields with appropriate defaults."""
    transformer = InsightTransformer()

    # Minimal issue with only required fields
    agent_issues = [
        {
            "type": "anomaly",
            "category": "location",
            "priority": "high",
            "title": "Test issue",
            "description": "Test description",
            "affected_count": 10,
            # Missing: source_data, cluster_id, cluster_title
        }
    ]

    insights = transformer.transform_agent_issues(agent_issues)

    assert len(insights) == 1
    insight = insights[0]

    # Verify defaults are applied
    assert insight["source_data"] == {}
    assert insight["cluster_id"] is None
    assert insight["cluster_title"] is None


def test_handle_missing_required_fields_with_defaults():
    """Test handling of missing fields that should have defaults."""
    transformer = InsightTransformer()

    # Issue missing some fields that should get defaults
    agent_issues = [
        {
            # Missing type, category, priority
            "title": "Test issue",
            "description": "Test description",
            "affected_count": 10,
        }
    ]

    insights = transformer.transform_agent_issues(agent_issues)

    assert len(insights) == 1
    insight = insights[0]

    # Verify defaults are applied
    assert insight["type"] == "focus_area"  # Default type
    assert insight["category"] == "organizational"  # Default category
    assert insight["priority"] == "medium"  # Default priority


def test_preserve_all_source_data_fields():
    """Test that all source_data fields are preserved."""
    transformer = InsightTransformer()

    agent_issues = [
        {
            "type": "anomaly",
            "category": "location",
            "priority": "high",
            "title": "Test",
            "description": "Test",
            "affected_count": 10,
            "source_data": {
                "z_score": 3.2,
                "p_value": 0.001,
                "observed_pct": 80.0,
                "expected_pct": 60.0,
                "segment": "Seattle",
                "count": 25,
                "percentage": 75.5,
                "actual": 30,
                "expected": 20,
            },
        }
    ]

    insights = transformer.transform_agent_issues(agent_issues)
    source_data = insights[0]["source_data"]

    assert source_data["z_score"] == 3.2
    assert source_data["p_value"] == 0.001
    assert source_data["observed_pct"] == 80.0
    assert source_data["expected_pct"] == 60.0
    assert source_data["segment"] == "Seattle"
    assert source_data["count"] == 25
    assert source_data["percentage"] == 75.5
    assert source_data["actual"] == 30
    assert source_data["expected"] == 20


# =============================================================================
# Test: _generate_insight_id (Deterministic ID Generation)
# =============================================================================


def test_generate_deterministic_id_same_input_same_output():
    """Test that same input produces same ID (deterministic)."""
    id1 = InsightTransformer._generate_insight_id("agent", "location", "Seattle rates high", "25")
    id2 = InsightTransformer._generate_insight_id("agent", "location", "Seattle rates high", "25")

    assert id1 == id2


def test_generate_deterministic_id_different_input_different_output():
    """Test that different input produces different IDs."""
    id1 = InsightTransformer._generate_insight_id("agent", "location", "Seattle rates high", "25")
    id2 = InsightTransformer._generate_insight_id("agent", "location", "Portland rates high", "25")
    id3 = InsightTransformer._generate_insight_id("agent", "function", "Seattle rates high", "25")

    assert id1 != id2
    assert id1 != id3
    assert id2 != id3


def test_generate_deterministic_id_has_correct_prefix():
    """Test that generated IDs have the correct prefix."""
    id1 = InsightTransformer._generate_insight_id("agent", "location", "Test", "10")
    id2 = InsightTransformer._generate_insight_id("legacy", "function", "Test", "20")

    assert id1.startswith("agent-")
    assert id2.startswith("legacy-")


def test_generate_deterministic_id_format():
    """Test that generated IDs have expected format: prefix-hash."""
    insight_id = InsightTransformer._generate_insight_id("agent", "location", "Test", "10")

    parts = insight_id.split("-")
    assert len(parts) == 2
    assert parts[0] == "agent"
    assert len(parts[1]) == 16  # Hash suffix should be 16 chars (64 bits)


def test_generate_deterministic_id_handles_special_characters():
    """Test ID generation with special characters in components."""
    id1 = InsightTransformer._generate_insight_id(
        "agent", "location", "Seattle (HQ)", "25%", "z=2.5"
    )

    assert id1.startswith("agent-")
    assert len(id1.split("-")[1]) == 16


def test_generate_deterministic_id_handles_empty_components():
    """Test ID generation with empty string components."""
    id1 = InsightTransformer._generate_insight_id("agent", "", "", "0")

    assert id1.startswith("agent-")
    # Should still generate valid ID even with empty components


# =============================================================================
# Test: Integration with Real Agent Outputs
# =============================================================================


def test_transform_realistic_agent_output():
    """Test transformation with realistic agent output structure."""
    transformer = InsightTransformer()

    # Realistic output structure from LLM agent
    agent_issues = [
        {
            "type": "anomaly",
            "category": "location",
            "priority": "high",
            "title": "Seattle office shows significantly higher ratings",
            "description": (
                "The Seattle office has 78% high performers compared to the "
                "organization average of 62% (z-score: 2.8). This represents "
                "25 employees and may indicate grade inflation or genuinely "
                "exceptional talent concentration."
            ),
            "affected_count": 25,
            "source_data": {
                "z_score": 2.8,
                "observed_pct": 78.0,
                "expected_pct": 62.0,
                "segment": "Seattle",
            },
            "cluster_id": "geo-patterns",
            "cluster_title": "Geographic Rating Patterns",
        },
        {
            "type": "recommendation",
            "category": "distribution",
            "priority": "medium",
            "title": "Consider Donut Mode exercise for center box differentiation",
            "description": (
                "52% of employees are rated in the center box (Position 5). "
                "This may indicate managers are avoiding differentiation. "
                "Consider running a Donut Mode calibration exercise."
            ),
            "affected_count": 130,
            "source_data": {
                "center_count": 130,
                "center_pct": 52.0,
                "recommended_max_pct": 50.0,
            },
            "cluster_id": None,
            "cluster_title": None,
        },
    ]

    insights = transformer.transform_agent_issues(agent_issues)

    assert len(insights) == 2

    # Verify first insight (anomaly)
    assert insights[0]["type"] == "anomaly"
    assert insights[0]["category"] == "location"
    assert insights[0]["priority"] == "high"
    assert insights[0]["affected_count"] == 25
    assert insights[0]["cluster_id"] == "geo-patterns"

    # Verify second insight (recommendation)
    assert insights[1]["type"] == "recommendation"
    assert insights[1]["category"] == "distribution"
    assert insights[1]["priority"] == "medium"
    assert insights[1]["affected_count"] == 130
    assert insights[1]["cluster_id"] is None


def test_transform_preserves_cluster_information():
    """Test that cluster_id and cluster_title are properly preserved."""
    transformer = InsightTransformer()

    agent_issues = [
        {
            "type": "anomaly",
            "category": "location",
            "priority": "high",
            "title": "Issue 1",
            "description": "Description 1",
            "affected_count": 10,
            "cluster_id": "cluster-001",
            "cluster_title": "Cluster Title A",
        },
        {
            "type": "anomaly",
            "category": "function",
            "priority": "medium",
            "title": "Issue 2",
            "description": "Description 2",
            "affected_count": 20,
            "cluster_id": "cluster-001",
            "cluster_title": "Cluster Title A",
        },
        {
            "type": "recommendation",
            "category": "distribution",
            "priority": "low",
            "title": "Issue 3",
            "description": "Description 3",
            "affected_count": 30,
            "cluster_id": None,
            "cluster_title": None,
        },
    ]

    insights = transformer.transform_agent_issues(agent_issues)

    # First two insights share same cluster
    assert insights[0]["cluster_id"] == "cluster-001"
    assert insights[0]["cluster_title"] == "Cluster Title A"
    assert insights[1]["cluster_id"] == "cluster-001"
    assert insights[1]["cluster_title"] == "Cluster Title A"

    # Third insight has no cluster
    assert insights[2]["cluster_id"] is None
    assert insights[2]["cluster_title"] is None


# =============================================================================
# Test: Edge Cases
# =============================================================================


def test_transform_with_zero_affected_count():
    """Test handling of zero affected_count."""
    transformer = InsightTransformer()

    agent_issues = [
        {
            "type": "anomaly",
            "category": "location",
            "priority": "low",
            "title": "Test",
            "description": "Test",
            "affected_count": 0,
        }
    ]

    insights = transformer.transform_agent_issues(agent_issues)

    assert len(insights) == 1
    assert insights[0]["affected_count"] == 0
    # Should still generate valid ID
    assert "id" in insights[0]


def test_transform_with_large_affected_count():
    """Test handling of very large affected_count."""
    transformer = InsightTransformer()

    agent_issues = [
        {
            "type": "recommendation",
            "category": "distribution",
            "priority": "high",
            "title": "Test",
            "description": "Test",
            "affected_count": 999999,
        }
    ]

    insights = transformer.transform_agent_issues(agent_issues)

    assert insights[0]["affected_count"] == 999999


def test_transform_with_unicode_in_text_fields():
    """Test handling of Unicode characters in text fields."""
    transformer = InsightTransformer()

    agent_issues = [
        {
            "type": "anomaly",
            "category": "location",
            "priority": "high",
            "title": "São Paulo office shows higher ratings",
            "description": "São Paulo has 75% high performers… (z=2.5) — significant! 🎯",
            "affected_count": 25,
        }
    ]

    insights = transformer.transform_agent_issues(agent_issues)

    assert insights[0]["title"] == "São Paulo office shows higher ratings"
    assert "São Paulo" in insights[0]["description"]
    assert "🎯" in insights[0]["description"]
