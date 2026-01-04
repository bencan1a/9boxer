"""LLM service for AI-powered calibration summaries.

This module provides integration with Claude (Anthropic API) to generate
natural language summaries and recommendations from calibration insights.
All data sent to the LLM is anonymized - no PII is ever transmitted.
"""

import json
import logging
import os
import time
from pathlib import Path
from typing import Any, TypedDict, cast

logger = logging.getLogger(__name__)


# =============================================================================
# Type Definitions
# =============================================================================


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

# Anthropic pricing (as of January 2025)
# Source: https://www.anthropic.com/pricing
PRICE_PER_MILLION_INPUT_TOKENS = 3.0  # $3 per million input tokens (Sonnet 4.5)
PRICE_PER_MILLION_OUTPUT_TOKENS = 15.0  # $15 per million output tokens (Sonnet 4.5)

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

    def _log_llm_metrics(
        self,
        duration_ms: float,
        model: str,
        input_tokens: int,
        output_tokens: int,
        status: str,
        error_type: str | None = None,
    ) -> None:
        """Log LLM usage metrics for operational visibility and cost tracking.

        This method provides structured logging for internal desktop app observability.
        Logs are designed to be easily parsed for budget tracking and usage analysis.

        Args:
            duration_ms: Call duration in milliseconds
            model: Model identifier used for the call
            input_tokens: Number of input tokens consumed
            output_tokens: Number of output tokens generated
            status: Call status - "success" or "error"
            error_type: Optional error type (e.g., "JSONDecodeError", "RuntimeError")
        """
        # Calculate estimated cost based on Anthropic pricing
        input_cost = (input_tokens / 1_000_000) * PRICE_PER_MILLION_INPUT_TOKENS
        output_cost = (output_tokens / 1_000_000) * PRICE_PER_MILLION_OUTPUT_TOKENS
        total_cost = input_cost + output_cost

        # Create structured log entry for easy parsing
        log_data = {
            "event": "llm_call",
            "status": status,
            "model": model,
            "duration_ms": round(duration_ms, 2),
            "tokens": {
                "input": input_tokens,
                "output": output_tokens,
                "total": input_tokens + output_tokens,
            },
            "cost_usd": {
                "input": round(input_cost, 6),
                "output": round(output_cost, 6),
                "total": round(total_cost, 6),
            },
        }

        if error_type:
            log_data["error_type"] = error_type

        # Log with structured data for easy filtering/parsing
        if status == "success":
            logger.info(
                f"LLM call completed: {model}, {duration_ms:.0f}ms, "
                f"{input_tokens + output_tokens} tokens, ${total_cost:.6f}",
                extra=log_data,
            )
        else:
            logger.error(
                f"LLM call failed: {model}, {duration_ms:.0f}ms, "
                f"{input_tokens + output_tokens} tokens, ${total_cost:.6f}, "
                f"error={error_type}",
                extra=log_data,
            )

    def generate_calibration_analysis(
        self,
        data_package: dict,
        model: str | None = None,
    ) -> dict:
        """Generate agent-driven calibration analysis (summary + issues).

        This is the new agent-first approach where Claude analyzes all data
        holistically and returns both summary and structured issues in one call.

        Uses structured outputs (beta API) to guarantee valid JSON responses.

        Args:
            data_package: Full calibration data from package_for_llm()
            model: Optional model override (defaults to LLM_MODEL or claude-sonnet-4-5)

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

            # Track call duration for metrics
            start_time = time.time()

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

            # Calculate duration
            duration_ms = (time.time() - start_time) * 1000

            # Log response metadata
            logger.info(
                f"Claude API response received: "
                f"model={message.model}, "
                f"stop_reason={message.stop_reason}, "
                f"tokens_in={message.usage.input_tokens}, "
                f"tokens_out={message.usage.output_tokens}"
            )

            # Log metrics for observability
            self._log_llm_metrics(
                duration_ms=duration_ms,
                model=message.model,
                input_tokens=message.usage.input_tokens,
                output_tokens=message.usage.output_tokens,
                status="success",
            )

            # Extract text content - structured outputs guarantee valid JSON
            content = message.content[0].text

            # Parse JSON directly (structured outputs ensure valid JSON)
            try:
                result = json.loads(content)
                return cast("dict[str, Any]", result)
            except json.JSONDecodeError as parse_error:
                # This should never happen with structured outputs
                logger.error(
                    f"Unexpected JSON parsing error with structured outputs: {parse_error}"
                )
                logger.error(f"Response content: {content[:500]}...")
                raise RuntimeError(
                    f"Failed to parse structured output (this should not happen): {parse_error}"
                ) from parse_error

        except Exception as e:
            # Log error metrics if we have partial information
            # For errors before API call, we won't have token counts
            error_type = type(e).__name__

            # Try to extract duration if start_time was set
            try:
                duration_ms = (time.time() - start_time) * 1000
            except NameError:
                # start_time not defined - error occurred before API call
                duration_ms = 0.0

            # Log error with zero tokens (can't determine actual usage on error)
            self._log_llm_metrics(
                duration_ms=duration_ms,
                model=model_to_use or DEFAULT_MODEL,
                input_tokens=0,
                output_tokens=0,
                status="error",
                error_type=error_type,
            )

            logger.error(f"Failed to generate calibration analysis: {e}")
            raise RuntimeError(f"Failed to generate calibration analysis: {e}") from e


# Module-level instance for use in endpoints
llm_service = LLMService()
