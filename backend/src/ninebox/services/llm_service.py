"""LLM service for AI-powered calibration summaries.

This module provides integration with Claude (Anthropic API) to generate
natural language summaries and recommendations from calibration insights.
All data sent to the LLM is anonymized - no PII is ever transmitted.
"""

import json
import logging
import os
import warnings
from pathlib import Path
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
HAIKU_MODEL = "claude-haiku-3-5-20250110"  # Faster alternative (3-5x speed gain)
MAX_TOKENS = 4096  # Sufficient for typical outputs (1,000-2,500 tokens)
TEMPERATURE = 0.3  # Low temperature for consistent output

# JSON Schema for structured outputs (guarantees valid JSON)
CALIBRATION_ANALYSIS_SCHEMA = {
    "type": "object",
    "properties": {
        "summary": {
            "type": "string",
            "description": "Executive summary of calibration findings (2-4 paragraphs)",
        },
        "issues": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "type": {
                        "type": "string",
                        "enum": ["anomaly", "recommendation", "time_allocation"],
                    },
                    "category": {
                        "type": "string",
                        "enum": [
                            "location",
                            "function",
                            "level",
                            "tenure",
                            "overall",
                            "distribution",
                        ],
                    },
                    "priority": {"type": "string", "enum": ["high", "medium", "low"]},
                    "title": {"type": "string"},
                    "description": {"type": "string"},
                    "affected_count": {"type": "integer"},
                    "source_data": {
                        "type": "object",
                        "properties": {
                            "z_score": {"type": "number"},
                            "percentage": {"type": "number"},
                            "expected": {"type": "number"},
                            "actual": {"type": "number"},
                            "count": {"type": "integer"},
                            "segment": {"type": "string"},
                        },
                        "additionalProperties": False,
                        "required": [],  # All fields optional - different insights have different data
                    },
                    "cluster_id": {"type": ["string", "null"]},
                    "cluster_title": {"type": ["string", "null"]},
                },
                "required": [
                    "type",
                    "category",
                    "priority",
                    "title",
                    "description",
                    "affected_count",
                ],
                "additionalProperties": False,  # Strict validation for issue objects
            },
        },
    },
    "required": ["summary", "issues"],
    "additionalProperties": False,  # Strict validation for root object
}

# DEPRECATED: Only used by deprecated generate_summary() method
# This will be removed in Phase 3
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
# Utility Functions
# =============================================================================


def load_system_prompt(filepath: str = "backend/config/calibration_agent_prompt.txt") -> str:
    """Load system prompt from configuration file.

    Args:
        filepath: Path to prompt config file (defaults to calibration_agent_prompt.txt)

    Returns:
        System prompt text (stripped of leading/trailing whitespace)

    Raises:
        FileNotFoundError: If prompt file doesn't exist
        UnicodeDecodeError: If file is not valid UTF-8 text
    """
    prompt_file = Path(filepath)

    # If the file doesn't exist at the given path, try relative to the project root
    if not prompt_file.exists():
        # Try finding project root by looking for backend/config directory
        current = Path(__file__).resolve()
        # Go up from backend/src/ninebox/services/llm_service.py to project root
        project_root = current.parent.parent.parent.parent.parent
        alternative_path = project_root / filepath

        if alternative_path.exists():
            prompt_file = alternative_path
        else:
            raise FileNotFoundError(f"System prompt file not found: {filepath}")

    # Read and validate the file content
    # Use strict error handling to ensure file is valid UTF-8 text
    try:
        content = prompt_file.read_text(encoding="utf-8", errors="strict")
    except UnicodeDecodeError as e:
        raise UnicodeDecodeError(
            e.encoding,
            e.object,
            e.start,
            e.end,
            f"Prompt file is not valid UTF-8 text: {filepath}",
        ) from e

    return content.strip()


# =============================================================================
# Service Class
# =============================================================================


class LLMService:
    """Service for generating AI-powered calibration summaries."""

    def __init__(self, api_key: str | None = None, model: str | None = None) -> None:
        """Initialize the LLM service.

        The service will be available only if ANTHROPIC_API_KEY is set.

        Args:
            api_key: Optional API key override (from settings or env var)
            model: Optional model override (from settings or env var)
                   Use HAIKU_MODEL constant for 3-5x faster responses
                   Set via LLM_MODEL env var (e.g., LLM_MODEL=claude-haiku-3-5-20250110)
        """
        # Try passed parameters first, fall back to environment variables
        self.api_key = api_key or os.getenv("ANTHROPIC_API_KEY")
        self.model = model or os.getenv("LLM_MODEL", DEFAULT_MODEL)
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

        **DEPRECATED:** Use generate_calibration_analysis() instead.
        This method will be removed in Phase 3.

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
        warnings.warn(
            "generate_summary() is deprecated, use generate_calibration_analysis()",
            DeprecationWarning,
            stacklevel=2,
        )
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

    def generate_calibration_analysis(
        self,
        data_package: dict,
        model: str | None = None,
        max_retries: int = 2,
    ) -> dict:
        """Generate agent-driven calibration analysis (summary + issues).

        This is the new agent-first approach where Claude analyzes all data
        holistically and returns both summary and structured issues in one call.

        Args:
            data_package: Full calibration data from package_for_llm()
            model: Optional model override (defaults to LLM_MODEL or claude-sonnet-4-5)
            max_retries: Number of retry attempts for malformed JSON (default: 2)

        Returns:
            {
                "summary": "Executive summary text...",
                "issues": [
                    {
                        "type": "anomaly",
                        "category": "level",
                        "priority": "high",
                        "title": "...",
                        "description": "...",
                        "affected_count": 25,
                        "source_data": {...},
                        "cluster_id": "optional-cluster-id",
                        "cluster_title": "Optional cluster title"
                    },
                    ...
                ]
            }

        Raises:
            RuntimeError: If LLM service is not available
            Exception: If LLM call fails or JSON parsing fails after retries
        """
        availability = self.is_available()
        if not availability["available"]:
            raise RuntimeError(f"LLM service not available: {availability['reason']}")

        # Use provided model or fall back to instance model
        model_to_use = model or self.model

        # Load system prompt from config file
        try:
            system_prompt = load_system_prompt()
        except FileNotFoundError as e:
            logger.error(f"Failed to load system prompt: {e}")
            raise RuntimeError(f"Failed to load system prompt: {e}") from e

        # Build the user prompt with the data package
        data_json = json.dumps(data_package, indent=2)
        user_prompt = f"""Please analyze the following calibration data and provide your comprehensive analysis.

CALIBRATION DATA:
{data_json}

Analyze this data holistically and return your findings in the required JSON format."""

        # Call Claude
        try:
            logger.info(f"Calling Claude API for calibration analysis with model: {model_to_use}")
            logger.debug(f"Data package size: {len(data_json)} characters")

            # Warn if input is very large (rough estimate: 1 token ≈ 4 characters)
            estimated_tokens = len(data_json) // 4
            if estimated_tokens > 30000:
                logger.warning(
                    f"Large input detected: ~{estimated_tokens} tokens. "
                    f"This may result in high costs (~${estimated_tokens * 0.003 / 1000:.2f}) "
                    f"and slow responses. Consider summarizing employee data."
                )

            if self._client is None:
                raise RuntimeError("Anthropic client not initialized")

            # Use beta API for structured outputs (guarantees valid JSON)
            message = self._client.beta.messages.create(
                model=model_to_use,
                max_tokens=MAX_TOKENS,
                temperature=TEMPERATURE,
                system=system_prompt,
                betas=["structured-outputs-2025-11-13"],
                messages=[
                    {
                        "role": "user",
                        "content": user_prompt,
                    }
                ],
                output_format={
                    "type": "json_schema",
                    "schema": CALIBRATION_ANALYSIS_SCHEMA,
                },
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

            # Parse JSON response with retry logic
            try:
                result = self._parse_response(content)
                return result
            except (ValueError, json.JSONDecodeError) as parse_error:
                # Attempt retry with correction
                logger.warning(f"Initial JSON parsing failed: {parse_error}")
                # model_to_use is guaranteed to be str here (from line 284)
                return self._retry_with_correction(
                    malformed_response=content,
                    error_message=str(parse_error),
                    model=model_to_use,  # type: ignore[arg-type]
                    attempt=1,
                    max_retries=max_retries,
                )

        except Exception as e:
            logger.error(f"Failed to generate calibration analysis: {e}")
            raise RuntimeError(f"Failed to generate calibration analysis: {e}") from e

    def _retry_with_correction(
        self,
        malformed_response: str,
        error_message: str,
        model: str,
        attempt: int,
        max_retries: int,
    ) -> dict:
        """Retry LLM call with error correction prompt.

        If the LLM returns malformed JSON, send it back with instructions to fix.

        Args:
            malformed_response: The invalid JSON string
            error_message: The parsing error message
            model: Model to use
            attempt: Current attempt number
            max_retries: Maximum attempts

        Returns:
            Parsed JSON dict if successful

        Raises:
            Exception: If max retries exceeded or parsing still fails
        """
        if attempt >= max_retries:
            logger.error(f"Failed to parse JSON after {max_retries} retries")
            raise Exception(
                f"Failed to parse JSON after {max_retries} retries. Last error: {error_message}"
            )

        logger.info(f"Retry attempt {attempt + 1}/{max_retries} for JSON correction")

        correction_prompt = f"""
The previous response had invalid JSON. Please fix it.

ERROR: {error_message}

INVALID JSON:
{malformed_response}

Please return ONLY valid JSON with this exact structure:
{{
  "summary": "...",
  "issues": [...]
}}

Do not include markdown code blocks or any text outside the JSON. Just raw, valid JSON.
"""

        try:
            if self._client is None:
                raise RuntimeError("Anthropic client not initialized")

            message = self._client.messages.create(
                model=model,
                max_tokens=MAX_TOKENS,
                temperature=TEMPERATURE,
                system="You are a helpful assistant that fixes malformed JSON responses.",
                messages=[
                    {
                        "role": "user",
                        "content": correction_prompt,
                    }
                ],
            )

            content = message.content[0].text

            # Try to parse the corrected response
            try:
                result = self._parse_response(content)
                logger.info(f"Successfully parsed JSON after retry attempt {attempt + 1}")
                return result
            except (ValueError, json.JSONDecodeError) as parse_error:
                # Recursive retry
                return self._retry_with_correction(
                    malformed_response=content,
                    error_message=str(parse_error),
                    model=model,
                    attempt=attempt + 1,
                    max_retries=max_retries,
                )

        except Exception as e:
            logger.error(f"Retry attempt {attempt + 1} failed: {e}")
            raise RuntimeError(f"Retry attempt {attempt + 1} failed: {e}") from e

    def _sanitize_for_prompt(self, text: str | None) -> str:
        """Sanitize text before including in LLM prompt.

        **DEPRECATED:** Only used by deprecated generate_summary() method.
        This method will be removed in Phase 3.

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

        **DEPRECATED:** Only used by deprecated generate_summary() method.
        This method will be removed in Phase 3.

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

        **DEPRECATED:** Only used by deprecated generate_summary() method.
        This method will be removed in Phase 3.

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
                model_used=self.model or DEFAULT_MODEL,
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
            return cast("dict[str, Any]", json.loads(json_text))
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse JSON response: {e}")
            logger.error(f"Response content: {content[:500]}...")
            raise ValueError(f"Failed to parse response JSON: {e}") from e


# Module-level instance for use in endpoints
llm_service = LLMService()
