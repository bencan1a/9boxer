"""Integration tests for calibration summary API endpoints.

These tests verify the full stack:
- API endpoint → Service → LLM → Response

Tests cover both agent-enabled (use_agent=true) and legacy (use_agent=false) modes,
LLM availability checking, and error handling scenarios.
"""

import os
from unittest.mock import patch

import pytest
from fastapi.testclient import TestClient

pytestmark = [pytest.mark.integration]


# =============================================================================
# Fixtures
# =============================================================================


@pytest.fixture
def mock_llm_service():
    """Mock LLM service for testing without actual API calls.

    Returns a mock that simulates successful LLM responses without
    making actual calls to the Anthropic API.
    """

    def mock_generate_analysis(data_package):
        """Mock LLM analysis generation."""
        return {
            "summary": "Test AI summary of calibration data",
            "issues": [
                {
                    "type": "anomaly",
                    "category": "level",
                    "priority": "high",
                    "title": "Test anomaly issue",
                    "description": "This is a test description of an anomaly",
                    "affected_count": 10,
                    "source_data": {"z_score": 2.5, "p_value": 0.01},
                },
                {
                    "type": "focus_area",
                    "category": "distribution",
                    "priority": "medium",
                    "title": "Test focus area",
                    "description": "This is a test focus area description",
                    "affected_count": 25,
                    "source_data": {"center_pct": 55.0},
                },
            ],
        }

    with patch(
        "ninebox.services.llm_service.LLMService.generate_calibration_analysis",
        side_effect=mock_generate_analysis,
    ):
        yield


@pytest.fixture
def session_with_sample_data(test_client: TestClient) -> dict[str, str]:
    """Create a session with sample employee data.

    Returns:
        Headers dict (includes session cookie set by API)
    """
    response = test_client.post(
        "/api/employees/generate-sample",
        json={"size": 100, "include_bias": True, "seed": 42},
    )
    assert response.status_code == 200
    return {}


# =============================================================================
# Test GET /api/calibration-summary (Agent Mode)
# =============================================================================


class TestCalibrationSummaryAgentMode:
    """Tests for calibration summary with AI agent enabled."""

    def test_get_calibration_summary_with_agent_default(
        self, test_client: TestClient, session_with_sample_data: dict, mock_llm_service
    ) -> None:
        """Test GET /api/calibration-summary with default use_agent=true."""
        response = test_client.get("/api/calibration-summary", headers=session_with_sample_data)

        assert response.status_code == 200
        data = response.json()

        # Verify structure
        assert "data_overview" in data
        assert "time_allocation" in data
        assert "insights" in data
        assert "summary" in data

        # Summary should be populated (mocked LLM)
        assert data["summary"] is not None
        assert isinstance(data["summary"], str)
        assert len(data["summary"]) > 0

        # Insights should be present from LLM
        assert len(data["insights"]) > 0
        assert data["insights"][0]["id"]
        assert data["insights"][0]["type"]
        assert data["insights"][0]["title"]

    def test_get_calibration_summary_with_agent_explicit_true(
        self, test_client: TestClient, session_with_sample_data: dict, mock_llm_service
    ) -> None:
        """Test GET /api/calibration-summary?use_agent=true."""
        response = test_client.get(
            "/api/calibration-summary?use_agent=true", headers=session_with_sample_data
        )

        assert response.status_code == 200
        data = response.json()

        # Summary should be populated
        assert data["summary"] is not None
        assert isinstance(data["summary"], str)

        # Insights should be from LLM agent
        assert len(data["insights"]) > 0

    def test_agent_mode_insights_have_required_fields(
        self, test_client: TestClient, session_with_sample_data: dict, mock_llm_service
    ) -> None:
        """Test that agent-generated insights have all required fields."""
        response = test_client.get(
            "/api/calibration-summary?use_agent=true", headers=session_with_sample_data
        )

        assert response.status_code == 200
        data = response.json()
        insights = data["insights"]

        assert len(insights) > 0
        for insight in insights:
            # Required fields
            assert "id" in insight
            assert "type" in insight
            assert "category" in insight
            assert "priority" in insight
            assert "title" in insight
            assert "description" in insight
            assert "affected_count" in insight
            assert "source_data" in insight

            # Validate types
            assert isinstance(insight["id"], str)
            assert isinstance(insight["type"], str)
            assert isinstance(insight["category"], str)
            assert isinstance(insight["priority"], str)
            assert isinstance(insight["title"], str)
            assert isinstance(insight["description"], str)
            assert isinstance(insight["affected_count"], int)
            assert isinstance(insight["source_data"], dict)

    def test_agent_mode_insights_may_have_clustering_fields(
        self, test_client: TestClient, session_with_sample_data: dict, mock_llm_service
    ) -> None:
        """Test that insights can include optional clustering fields."""
        response = test_client.get(
            "/api/calibration-summary?use_agent=true", headers=session_with_sample_data
        )

        assert response.status_code == 200
        data = response.json()
        insights = data["insights"]

        # Check if any insights have cluster_id/cluster_title (optional fields)
        for insight in insights:
            if "cluster_id" in insight and insight["cluster_id"]:
                # If clustered, should have cluster_title too
                assert "cluster_title" in insight
                assert insight["cluster_title"]

    def test_agent_mode_data_overview_structure(
        self, test_client: TestClient, session_with_sample_data: dict, mock_llm_service
    ) -> None:
        """Test data overview has correct structure and values."""
        response = test_client.get(
            "/api/calibration-summary?use_agent=true", headers=session_with_sample_data
        )

        assert response.status_code == 200
        data = response.json()
        overview = data["data_overview"]

        # Required fields
        assert "total_employees" in overview
        assert "by_level" in overview
        assert "by_function" in overview
        assert "by_location" in overview
        assert "stars_count" in overview
        assert "stars_percentage" in overview
        assert "center_box_count" in overview
        assert "center_box_percentage" in overview
        assert "lower_performers_count" in overview
        assert "lower_performers_percentage" in overview
        assert "high_performers_count" in overview
        assert "high_performers_percentage" in overview

        # Validate values
        assert overview["total_employees"] == 100
        assert isinstance(overview["by_level"], dict)
        assert isinstance(overview["by_function"], dict)
        assert isinstance(overview["by_location"], dict)
        assert overview["stars_count"] >= 0
        assert 0 <= overview["stars_percentage"] <= 100

    def test_agent_mode_time_allocation_structure(
        self, test_client: TestClient, session_with_sample_data: dict, mock_llm_service
    ) -> None:
        """Test time allocation has correct structure."""
        response = test_client.get(
            "/api/calibration-summary?use_agent=true", headers=session_with_sample_data
        )

        assert response.status_code == 200
        data = response.json()
        time_allocation = data["time_allocation"]

        # Required fields
        assert "estimated_duration_minutes" in time_allocation
        assert "breakdown_by_level" in time_allocation
        assert "suggested_sequence" in time_allocation

        # Validate structure
        assert isinstance(time_allocation["estimated_duration_minutes"], int)
        assert time_allocation["estimated_duration_minutes"] >= 30  # Minimum bound
        assert isinstance(time_allocation["breakdown_by_level"], list)
        assert isinstance(time_allocation["suggested_sequence"], list)

        # Validate breakdown items
        if time_allocation["breakdown_by_level"]:
            for item in time_allocation["breakdown_by_level"]:
                assert "level" in item
                assert "employee_count" in item
                assert "minutes" in item
                assert "percentage" in item


# =============================================================================
# Test GET /api/calibration-summary (Legacy Mode)
# =============================================================================


class TestCalibrationSummaryLegacyMode:
    """Tests for calibration summary without AI agent (legacy mode)."""

    def test_get_calibration_summary_legacy_mode(
        self, test_client: TestClient, session_with_sample_data: dict
    ) -> None:
        """Test GET /api/calibration-summary?use_agent=false."""
        response = test_client.get(
            "/api/calibration-summary?use_agent=false", headers=session_with_sample_data
        )

        assert response.status_code == 200
        data = response.json()

        # Verify structure
        assert "data_overview" in data
        assert "time_allocation" in data
        assert "insights" in data
        assert "summary" in data

        # Summary should be None in legacy mode
        assert data["summary"] is None

        # But insights should still be generated using legacy logic
        assert len(data["insights"]) > 0

    def test_legacy_mode_insights_generated(
        self, test_client: TestClient, session_with_sample_data: dict
    ) -> None:
        """Test that legacy mode still generates insights."""
        response = test_client.get(
            "/api/calibration-summary?use_agent=false", headers=session_with_sample_data
        )

        assert response.status_code == 200
        data = response.json()
        insights = data["insights"]

        # Should have at least some insights (distribution-based, time allocation)
        assert len(insights) > 0

        # Validate insight structure
        for insight in insights:
            assert "id" in insight
            assert "type" in insight
            assert "category" in insight
            assert "priority" in insight
            assert "title" in insight
            assert "description" in insight


# =============================================================================
# Test GET /api/calibration-summary/llm-availability
# =============================================================================


class TestLLMAvailability:
    """Tests for LLM availability endpoint."""

    def test_llm_availability_with_api_key(self, test_client: TestClient) -> None:
        """Test LLM availability when API key is present."""
        with patch.dict(os.environ, {"ANTHROPIC_API_KEY": "test-key"}):
            # Mock the LLMService initialization
            with patch("ninebox.services.llm_service.LLMService.is_available", return_value={"available": True, "reason": None}):
                response = test_client.get("/api/calibration-summary/llm-availability")

                assert response.status_code == 200
                data = response.json()

                assert "available" in data
                assert "reason" in data

                # With API key, should be available
                assert data["available"] is True
                assert data["reason"] is None

    def test_llm_availability_without_api_key(self, test_client: TestClient) -> None:
        """Test LLM availability when API key is missing."""
        # Mock LLM service to return unavailable
        with patch("ninebox.services.llm_service.LLMService.is_available", return_value={"available": False, "reason": "ANTHROPIC_API_KEY environment variable not set"}):
            response = test_client.get("/api/calibration-summary/llm-availability")

            assert response.status_code == 200
            data = response.json()

            assert data["available"] is False
            assert "ANTHROPIC_API_KEY" in data["reason"]


# =============================================================================
# Test POST /api/calibration-summary/generate-summary
# =============================================================================


class TestGenerateLLMSummary:
    """Tests for on-demand LLM summary generation."""

    def test_generate_summary_success(
        self, test_client: TestClient, session_with_sample_data: dict, mock_llm_service
    ) -> None:
        """Test successful LLM summary generation."""
        # First get the summary to get insight IDs
        summary_response = test_client.get(
            "/api/calibration-summary?use_agent=false", headers=session_with_sample_data
        )
        assert summary_response.status_code == 200
        insights = summary_response.json()["insights"]
        assert len(insights) > 0

        # Select first insight
        selected_ids = [insights[0]["id"]]

        # Mock LLM response
        with patch.dict(os.environ, {"ANTHROPIC_API_KEY": "test-key"}):
            with patch(
                "ninebox.services.llm_service.LLMService.generate_summary",
                return_value={
                    "summary": "Test summary",
                    "key_recommendations": ["Rec 1", "Rec 2"],
                    "discussion_points": ["Point 1", "Point 2"],
                    "model_used": "claude-sonnet-4-5-20250929",
                },
            ):
                response = test_client.post(
                    "/api/calibration-summary/generate-summary",
                    json={"selected_insight_ids": selected_ids},
                    headers=session_with_sample_data,
                )

                assert response.status_code == 200
                data = response.json()

                assert "summary" in data
                assert "key_recommendations" in data
                assert "discussion_points" in data
                assert "model_used" in data

                assert data["summary"] == "Test summary"
                assert len(data["key_recommendations"]) == 2
                assert len(data["discussion_points"]) == 2

    def test_generate_summary_without_llm_availability(
        self, test_client: TestClient, session_with_sample_data: dict
    ) -> None:
        """Test that generate-summary fails when LLM not available."""
        # Mock LLM service to return unavailable
        with patch("ninebox.services.llm_service.LLMService.is_available", return_value={"available": False, "reason": "ANTHROPIC_API_KEY environment variable not set"}):
            response = test_client.post(
                "/api/calibration-summary/generate-summary",
                json={"selected_insight_ids": ["test-id-12345678"]},
                headers=session_with_sample_data,
            )

            assert response.status_code == 400
            data = response.json()
            assert "detail" in data
            assert "not available" in data["detail"].lower()

    def test_generate_summary_with_empty_insight_ids(
        self, test_client: TestClient, session_with_sample_data: dict
    ) -> None:
        """Test that empty insight IDs returns 422 validation error."""
        response = test_client.post(
            "/api/calibration-summary/generate-summary",
            json={"selected_insight_ids": []},
            headers=session_with_sample_data,
        )

        assert response.status_code == 422  # Pydantic validation error

    def test_generate_summary_with_invalid_insight_id_format(
        self, test_client: TestClient, session_with_sample_data: dict
    ) -> None:
        """Test that invalid insight ID format returns 422 validation error."""
        response = test_client.post(
            "/api/calibration-summary/generate-summary",
            json={"selected_insight_ids": ["invalid-format"]},
            headers=session_with_sample_data,
        )

        assert response.status_code == 422  # Pydantic validation error

    def test_generate_summary_with_too_many_insights(
        self, test_client: TestClient, session_with_sample_data: dict
    ) -> None:
        """Test that too many insights (>50) returns 422 validation error."""
        # Create 51 valid insight IDs
        many_ids = [f"test-id-{i:08d}" for i in range(51)]

        response = test_client.post(
            "/api/calibration-summary/generate-summary",
            json={"selected_insight_ids": many_ids},
            headers=session_with_sample_data,
        )

        assert response.status_code == 422  # Pydantic validation error

    def test_generate_summary_with_duplicate_ids(
        self, test_client: TestClient, session_with_sample_data: dict
    ) -> None:
        """Test that duplicate insight IDs returns 422 validation error."""
        response = test_client.post(
            "/api/calibration-summary/generate-summary",
            json={"selected_insight_ids": ["test-id-12345678", "test-id-12345678"]},
            headers=session_with_sample_data,
        )

        assert response.status_code == 422  # Pydantic validation error


# =============================================================================
# Test Error Handling
# =============================================================================


class TestCalibrationSummaryErrorCases:
    """Error handling and edge cases."""

    def test_calibration_summary_without_session(self, test_client: TestClient) -> None:
        """Test endpoint returns 404 when no session exists."""
        # Don't create a session - call directly
        response = test_client.get("/api/calibration-summary")

        assert response.status_code == 404
        data = response.json()
        assert "detail" in data
        assert "session" in data["detail"].lower()

    def test_calibration_summary_with_empty_employees(self, test_client: TestClient) -> None:
        """Test endpoint handles empty employee list gracefully."""
        # Create a session but don't add employees
        # (This is difficult to test as generate-sample always creates employees,
        # and file upload creates employees. This test is a placeholder.)
        # In practice, the API prevents creating sessions without employees.
        pass

    def test_agent_mode_fallback_when_llm_fails(
        self, test_client: TestClient, session_with_sample_data: dict
    ) -> None:
        """Test that agent mode falls back to legacy when LLM fails."""
        # Mock LLM to raise an exception
        with patch(
            "ninebox.services.llm_service.LLMService.generate_calibration_analysis",
            side_effect=RuntimeError("LLM service failed"),
        ):
            response = test_client.get(
                "/api/calibration-summary?use_agent=true", headers=session_with_sample_data
            )

            assert response.status_code == 200
            data = response.json()

            # Should fall back to legacy mode
            assert data["summary"] is None  # No LLM summary
            assert len(data["insights"]) > 0  # But still has insights from legacy


# =============================================================================
# Test Data Consistency
# =============================================================================


class TestDataConsistency:
    """Tests for data consistency across modes."""

    def test_data_overview_same_for_both_modes(
        self, test_client: TestClient, session_with_sample_data: dict, mock_llm_service
    ) -> None:
        """Test that data overview is identical in both agent and legacy modes."""
        # Get agent mode response
        agent_response = test_client.get(
            "/api/calibration-summary?use_agent=true", headers=session_with_sample_data
        )
        assert agent_response.status_code == 200
        agent_overview = agent_response.json()["data_overview"]

        # Get legacy mode response
        legacy_response = test_client.get(
            "/api/calibration-summary?use_agent=false", headers=session_with_sample_data
        )
        assert legacy_response.status_code == 200
        legacy_overview = legacy_response.json()["data_overview"]

        # Data overview should be identical
        assert agent_overview == legacy_overview

    def test_time_allocation_same_for_both_modes(
        self, test_client: TestClient, session_with_sample_data: dict, mock_llm_service
    ) -> None:
        """Test that time allocation is identical in both agent and legacy modes."""
        # Get agent mode response
        agent_response = test_client.get(
            "/api/calibration-summary?use_agent=true", headers=session_with_sample_data
        )
        assert agent_response.status_code == 200
        agent_time = agent_response.json()["time_allocation"]

        # Get legacy mode response
        legacy_response = test_client.get(
            "/api/calibration-summary?use_agent=false", headers=session_with_sample_data
        )
        assert legacy_response.status_code == 200
        legacy_time = legacy_response.json()["time_allocation"]

        # Time allocation should be identical
        assert agent_time == legacy_time

    def test_insight_ids_are_deterministic(
        self, test_client: TestClient, session_with_sample_data: dict
    ) -> None:
        """Test that insight IDs are deterministic across multiple calls."""
        # Get summary twice
        response1 = test_client.get(
            "/api/calibration-summary?use_agent=false", headers=session_with_sample_data
        )
        assert response1.status_code == 200
        insights1 = response1.json()["insights"]

        response2 = test_client.get(
            "/api/calibration-summary?use_agent=false", headers=session_with_sample_data
        )
        assert response2.status_code == 200
        insights2 = response2.json()["insights"]

        # Insight IDs should be the same
        ids1 = [i["id"] for i in insights1]
        ids2 = [i["id"] for i in insights2]
        assert ids1 == ids2
