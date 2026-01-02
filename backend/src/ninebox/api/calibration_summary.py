"""Calibration summary API endpoints.

This module provides endpoints for calibration meeting preparation,
including data overview, insights, time allocation, and optional LLM summaries.
"""

import logging
import re
from re import Pattern
from typing import Any, ClassVar, TypedDict, cast

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, field_validator

from ninebox.core.dependencies import (
    get_calibration_summary_service,
    get_llm_service,
    get_session_manager,
)
from ninebox.services.calibration_summary_service import CalibrationSummaryService
from ninebox.services.llm_service import LLMService
from ninebox.services.session_manager import SessionManager

router = APIRouter(prefix="/calibration-summary", tags=["calibration-summary"])
logger = logging.getLogger(__name__)

# Constant user ID for local-only app (no authentication)
LOCAL_USER_ID = "local-user"


# =============================================================================
# Response TypedDicts
# =============================================================================


class DataOverviewResponse(TypedDict):
    """Data overview statistics."""

    total_employees: int
    by_level: dict[str, int]
    by_function: dict[str, int]
    by_location: dict[str, int]
    stars_count: int
    stars_percentage: float
    center_box_count: int
    center_box_percentage: float
    lower_performers_count: int
    lower_performers_percentage: float
    high_performers_count: int
    high_performers_percentage: float


class LevelTimeBreakdownResponse(TypedDict):
    """Time breakdown for a single level."""

    level: str
    employee_count: int
    minutes: int
    percentage: float


class TimeAllocationResponse(TypedDict):
    """Time allocation recommendations."""

    estimated_duration_minutes: int
    breakdown_by_level: list[LevelTimeBreakdownResponse]
    suggested_sequence: list[str]


class InsightResponse(TypedDict):
    """A single insight for meeting preparation."""

    id: str
    type: str
    category: str
    priority: str
    title: str
    description: str
    affected_count: int
    source_data: dict[str, Any]


class CalibrationSummaryResponse(TypedDict):
    """Complete calibration summary response."""

    data_overview: DataOverviewResponse
    time_allocation: TimeAllocationResponse
    insights: list[InsightResponse]


class LLMAvailabilityResponse(TypedDict):
    """LLM service availability status."""

    available: bool
    reason: str | None


class LLMSummaryResponse(TypedDict):
    """LLM-generated summary response."""

    summary: str
    key_recommendations: list[str]
    discussion_points: list[str]
    model_used: str


# =============================================================================
# Request Models
# =============================================================================


class GenerateSummaryRequest(BaseModel):
    """Request to generate LLM summary."""

    selected_insight_ids: list[str]

    # Maximum insights allowed to prevent DoS
    MAX_INSIGHTS: ClassVar[int] = 50

    # Valid insight ID pattern: type-description-hexid (e.g., focus-crowded-center-a1b2c3d4, anomaly-513398ea)
    # Pattern: starts with letter, contains letters/numbers/dashes, ends with dash + 8 hex chars
    INSIGHT_ID_PATTERN: ClassVar[Pattern[str]] = re.compile(r"^[a-z][a-z0-9-]+-[a-f0-9]{8}$")

    @field_validator("selected_insight_ids")
    @classmethod
    def validate_insight_ids(cls, v: list[str]) -> list[str]:
        """Validate insight IDs for security and correctness."""
        if not v:
            raise ValueError("At least one insight must be selected")

        if len(v) > cls.MAX_INSIGHTS:
            raise ValueError(f"Too many insights selected (max {cls.MAX_INSIGHTS})")

        if len(v) != len(set(v)):
            raise ValueError("Duplicate insight IDs not allowed")

        for insight_id in v:
            if not cls.INSIGHT_ID_PATTERN.match(insight_id):
                raise ValueError(f"Invalid insight ID format: {insight_id}")

        return v


# =============================================================================
# Endpoints
# =============================================================================


@router.get("", response_model=None)
async def get_calibration_summary(
    session_mgr: SessionManager = Depends(get_session_manager),
    summary_service: CalibrationSummaryService = Depends(get_calibration_summary_service),
) -> CalibrationSummaryResponse:
    """Get calibration summary with data overview, time allocation, and insights.

    This endpoint provides the static analysis for calibration meeting preparation.
    It includes:
    - Data overview (employee counts, distributions)
    - Time allocation recommendations
    - Discrete, selectable insights derived from intelligence analysis

    Returns:
        CalibrationSummaryResponse with all summary data

    Raises:
        HTTPException: 404 if no active session found
        HTTPException: 500 if summary calculation fails
    """
    session = session_mgr.get_session(LOCAL_USER_ID)

    if not session:
        logger.error(f"CalibrationSummary: No session found for user_id={LOCAL_USER_ID}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active session found. Please upload an Excel file first.",
        )

    try:
        if not session.current_employees:
            logger.error(
                f"CalibrationSummary: Session exists but current_employees is empty "
                f"for user_id={LOCAL_USER_ID}"
            )
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Session exists but contains no employee data. Please reload your Excel file.",
            )

        logger.info(
            f"CalibrationSummary: Processing {len(session.current_employees)} employees "
            f"for user_id={LOCAL_USER_ID}"
        )

        summary = summary_service.calculate_summary(session.current_employees)
        return CalibrationSummaryResponse(**summary)  # type: ignore[typeddict-item]

    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"CalibrationSummary calculation failed for user_id={LOCAL_USER_ID}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to calculate calibration summary: {e!s}",
        ) from e


@router.get("/llm-availability", response_model=None)
async def check_llm_availability(
    llm_service: LLMService = Depends(get_llm_service),
) -> LLMAvailabilityResponse:
    """Check if LLM summary generation is available.

    The LLM service is available when:
    - ANTHROPIC_API_KEY environment variable is set
    - The anthropic package is installed

    Returns:
        LLMAvailabilityResponse with availability status and reason if unavailable
    """
    availability = llm_service.is_available()
    return LLMAvailabilityResponse(**availability)


@router.post("/generate-summary", response_model=None)
async def generate_llm_summary(
    request: GenerateSummaryRequest,
    session_mgr: SessionManager = Depends(get_session_manager),
    summary_service: CalibrationSummaryService = Depends(get_calibration_summary_service),
    llm_service: LLMService = Depends(get_llm_service),
) -> LLMSummaryResponse:
    """Generate AI-powered meeting summary from selected insights.

    This endpoint calls Claude to generate a natural language summary,
    key recommendations, and predicted discussion points based on the
    selected insights. Only anonymized data is sent to the LLM.

    Args:
        request: Request containing list of selected insight IDs

    Returns:
        LLMSummaryResponse with AI-generated summary and recommendations

    Raises:
        HTTPException: 404 if no active session found
        HTTPException: 400 if no insights selected or LLM not available
        HTTPException: 500 if LLM generation fails
    """
    # Check LLM availability
    availability = llm_service.is_available()
    if not availability["available"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"LLM service not available: {availability['reason']}",
        )

    # Get session
    session = session_mgr.get_session(LOCAL_USER_ID)
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active session found. Please upload an Excel file first.",
        )

    if not session.current_employees:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Session exists but contains no employee data.",
        )

    # Note: Request validation (empty list, max size, format) is handled by Pydantic

    try:
        # Get the full summary to access insights
        summary = summary_service.calculate_summary(session.current_employees)

        # Generate LLM summary
        llm_result = llm_service.generate_summary(
            selected_insight_ids=request.selected_insight_ids,
            insights=cast("list[dict[str, Any]]", summary["insights"]),
            data_overview=cast("dict[str, Any]", summary["data_overview"]),
        )

        logger.info(
            f"Generated LLM summary for {len(request.selected_insight_ids)} insights "
            f"using model {llm_result['model_used']}"
        )

        return LLMSummaryResponse(**llm_result)

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        ) from e
    except RuntimeError as e:
        logger.exception("LLM summary generation failed")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        ) from e
    except Exception as e:
        logger.exception("Unexpected error during LLM summary generation")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate summary: {e!s}",
        ) from e
