"""LLM service for AI-powered calibration summaries.

This module provides integration with Claude (Anthropic API) to generate
natural language summaries and recommendations from calibration insights.
All data sent to the LLM is anonymized - no PII is ever transmitted.
"""

import json
import logging
import os
from typing import Any, TypedDict, cast

logger = logging.getLogger(__name__)


# =============================================================================
# Type Definitions
# =============================================================================


class LLMSummaryRequest(TypedDict):
    """Request data for LLM summary generation."""

    selected_insight_ids: list[str]
    insights: list[dict[str, Any]]
    data_overview: dict[str, Any]


class LLMSummaryResponse(TypedDict):
    """Response from LLM summary generation."""

    summary: str
    key_recommendations: list[str]
    discussion_points: list[str]
    model_used: str


class LLMAvailability(TypedDict):
    """LLM service availability status."""

    available: bool
    reason: str | None


# =============================================================================
# Constants
# =============================================================================

DEFAULT_MODEL = "claude-sonnet-4-5-20250929"
MAX_TOKENS = 2048
TEMPERATURE = 0.3  # Low temperature for consistent output

SYSTEM_PROMPT = """You are an experienced HR consultant and calibration meeting facilitator.
Your role is to help HR leaders and calibration managers prepare for talent review meetings.

Based on the anonymized statistical insights provided, generate:
1. A 2-3 paragraph executive summary of the key findings
2. 3-5 key recommendations for the calibration meeting
3. 3-5 predicted discussion points that may arise

Focus on actionable guidance that helps the calibration leader:
- Allocate meeting time effectively
- Anticipate challenging conversations
- Ensure fair and consistent talent assessment
- Address any statistical anomalies appropriately

Be direct and practical. Use business language appropriate for HR leadership.
Do not speculate about individual employees - work only with the aggregate data provided.

Respond in valid JSON format with this structure:
{
  "summary": "Your executive summary here...",
  "key_recommendations": ["Recommendation 1", "Recommendation 2", ...],
  "discussion_points": ["Discussion point 1", "Discussion point 2", ...]
}"""


# =============================================================================
# Service Class
# =============================================================================


class LLMService:
    """Service for generating AI-powered calibration summaries."""

    def __init__(self) -> None:
        """Initialize the LLM service.

        The service will be available only if ANTHROPIC_API_KEY is set.
        """
        self.api_key = os.getenv("ANTHROPIC_API_KEY")
        self.model = os.getenv("LLM_MODEL", DEFAULT_MODEL)
        self._client: Any = None

        if self.api_key:
            try:
                import anthropic

                self._client = anthropic.Anthropic(api_key=self.api_key)
                logger.info(f"LLM service initialized with model: {self.model}")
            except ImportError:
                logger.warning("anthropic package not installed. LLM features unavailable.")
            except Exception as e:
                # Don't log the full exception which might contain API key details
                logger.warning(f"Failed to initialize Anthropic client: {type(e).__name__}")

    def is_available(self) -> LLMAvailability:
        """Check if the LLM service is available and configured.

        Returns:
            LLMAvailability with status and reason if unavailable
        """
        if not self.api_key:
            return LLMAvailability(
                available=False,
                reason="ANTHROPIC_API_KEY environment variable not set",
            )

        if self._client is None:
            return LLMAvailability(
                available=False,
                reason="Anthropic client failed to initialize. Check logs for details.",
            )

        return LLMAvailability(available=True, reason=None)

    def generate_summary(
        self,
        selected_insight_ids: list[str],
        insights: list[dict[str, Any]],
        data_overview: dict[str, Any],
    ) -> LLMSummaryResponse:
        """Generate AI-powered summary from selected insights.

        Args:
            selected_insight_ids: List of insight IDs selected by the user
            insights: Full list of insights (only selected will be used)
            data_overview: Data overview statistics (anonymized)

        Returns:
            LLMSummaryResponse with summary, recommendations, and discussion points

        Raises:
            RuntimeError: If LLM service is not available
            ValueError: If no insights are selected
        """
        availability = self.is_available()
        if not availability["available"]:
            raise RuntimeError(f"LLM service not available: {availability['reason']}")

        if not selected_insight_ids:
            raise ValueError("At least one insight must be selected")

        # Filter to only selected insights
        selected_insights = [i for i in insights if i.get("id") in selected_insight_ids]

        if not selected_insights:
            raise ValueError("No matching insights found for the selected IDs")

        # Anonymize the data
        anonymized_data = self._anonymize_data(selected_insights, data_overview)

        # Build the prompt
        prompt = self._build_prompt(anonymized_data)

        # Call Claude
        try:
            response = self._call_claude(prompt)
            return response
        except Exception as e:
            logger.error(f"Failed to generate LLM summary: {e}")
            raise RuntimeError(f"Failed to generate summary: {e}") from e

    def _sanitize_for_prompt(self, text: str | None) -> str:
        """Sanitize text before including in LLM prompt.

        Removes potential prompt injection patterns and truncates to
        a reasonable length.

        Args:
            text: Text to sanitize, may be None

        Returns:
            Sanitized text safe for prompt inclusion
        """
        if not text:
            return ""

        # Remove common prompt manipulation patterns
        sanitized = text.replace("Ignore previous instructions", "")
        sanitized = sanitized.replace("System:", "")
        sanitized = sanitized.replace("Human:", "")
        sanitized = sanitized.replace("Assistant:", "")
        sanitized = sanitized.replace("```", "")

        # Truncate to reasonable length
        return sanitized[:500]

    def _anonymize_data(
        self,
        insights: list[dict[str, Any]],
        data_overview: dict[str, Any],
    ) -> dict[str, Any]:
        """Anonymize data before sending to LLM.

        This function removes any potentially identifying information
        and keeps only aggregate statistics.

        Args:
            insights: List of insights to anonymize
            data_overview: Data overview to anonymize

        Returns:
            Anonymized data dictionary safe to send to LLM
        """
        # Anonymize insights - keep only statistical/aggregate data
        anonymized_insights = []
        for insight in insights:
            anonymized_insight = {
                "type": insight.get("type"),
                "category": insight.get("category"),
                "priority": insight.get("priority"),
                # Sanitize user-influenced text fields
                "title": self._sanitize_for_prompt(insight.get("title")),
                "description": self._sanitize_for_prompt(insight.get("description")),
                "affected_count": insight.get("affected_count"),
            }

            # Include source_data but ensure no names/IDs
            source_data = insight.get("source_data", {})
            anonymized_source = {}

            # Safe fields to include
            safe_fields = [
                "z_score",
                "p_value",
                "observed_pct",
                "expected_pct",
                "center_count",
                "center_pct",
                "recommended_max_pct",
                "total_minutes",
                "by_level",
            ]

            for field in safe_fields:
                if field in source_data:
                    anonymized_source[field] = source_data[field]

            anonymized_insight["source_data"] = anonymized_source
            anonymized_insights.append(anonymized_insight)

        # Anonymize data overview - keep only aggregate counts/percentages
        anonymized_overview = {
            "total_employees": data_overview.get("total_employees"),
            "stars_percentage": data_overview.get("stars_percentage"),
            "center_box_percentage": data_overview.get("center_box_percentage"),
            "lower_performers_percentage": data_overview.get("lower_performers_percentage"),
            "high_performers_percentage": data_overview.get("high_performers_percentage"),
            # Include level/function/location counts but not names
            "level_count": len(data_overview.get("by_level", {})),
            "function_count": len(data_overview.get("by_function", {})),
            "location_count": len(data_overview.get("by_location", {})),
        }

        return {
            "insights": anonymized_insights,
            "data_overview": anonymized_overview,
        }

    def _build_prompt(self, anonymized_data: dict[str, Any]) -> str:
        """Build the user prompt for Claude.

        Args:
            anonymized_data: Anonymized data dictionary

        Returns:
            Formatted prompt string
        """
        data_json = json.dumps(anonymized_data, indent=2)

        return f"""Please analyze the following calibration data and provide your recommendations.

CALIBRATION DATA:
{data_json}

Based on this data, provide:
1. An executive summary (2-3 paragraphs)
2. Key recommendations for the calibration meeting (3-5 items)
3. Predicted discussion points that may arise (3-5 items)

Respond with valid JSON only."""

    def _call_claude(self, prompt: str) -> LLMSummaryResponse:
        """Call Claude API and parse the response.

        Args:
            prompt: The formatted prompt to send

        Returns:
            Parsed LLMSummaryResponse

        Raises:
            RuntimeError: If API call fails or response cannot be parsed
        """
        if self._client is None:
            raise RuntimeError("Anthropic client not initialized")

        # Log request metadata (without sensitive content)
        logger.info(f"Calling Claude API with model: {self.model}")
        logger.debug(f"Prompt length: {len(prompt)} characters")

        try:
            message = self._client.messages.create(
                model=self.model,
                max_tokens=MAX_TOKENS,
                temperature=TEMPERATURE,
                system=SYSTEM_PROMPT,
                messages=[
                    {
                        "role": "user",
                        "content": prompt,
                    }
                ],
            )

            # Log response metadata
            logger.info(
                f"Claude API response received: "
                f"model={message.model}, "
                f"stop_reason={message.stop_reason}, "
                f"tokens_in={message.usage.input_tokens}, "
                f"tokens_out={message.usage.output_tokens}"
            )

            # Extract text content
            content = message.content[0].text

            # Parse JSON response
            result = self._parse_response(content)
            result["model_used"] = self.model

            return LLMSummaryResponse(
                summary=result.get("summary", ""),
                key_recommendations=result.get("key_recommendations", []),
                discussion_points=result.get("discussion_points", []),
                model_used=self.model,
            )

        except Exception as e:
            logger.error(f"Claude API call failed: {e}")
            raise RuntimeError(f"Failed to call Claude API: {e}") from e

    def _parse_response(self, content: str) -> dict[str, Any]:
        """Parse Claude's response, handling markdown code blocks.

        Args:
            content: Raw response text from Claude

        Returns:
            Parsed JSON dictionary

        Raises:
            ValueError: If JSON cannot be extracted or parsed
        """
        import re

        # Try to extract JSON from markdown code blocks
        json_match = re.search(r"```json\s*([\s\S]*?)\s*```", content)
        if json_match:
            json_text = json_match.group(1)
        else:
            # Try to find raw JSON
            json_match = re.search(r"(\{[\s\S]*\})", content)
            if json_match:
                json_text = json_match.group(1)
            else:
                raise ValueError("Could not find JSON in response")

        try:
            return cast(dict[str, Any], json.loads(json_text))
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse JSON response: {e}")
            logger.error(f"Response content: {content[:500]}...")
            raise ValueError(f"Failed to parse response JSON: {e}") from e


# Module-level instance for use in endpoints
llm_service = LLMService()
