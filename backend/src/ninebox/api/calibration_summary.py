"""Calibration summary API endpoints.

This module provides endpoints for calibration meeting preparation,
including data overview, insights, time allocation, and optional LLM summaries.
"""

import asyncio
import logging
from typing import Any, TypedDict

from fastapi import APIRouter, Depends, HTTPException, Query, status

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


class CalibrationSummaryResponseRequired(TypedDict):
    """Required fields for CalibrationSummaryResponse."""

    data_overview: DataOverviewResponse
    time_allocation: TimeAllocationResponse
    insights: list[InsightResponse]


class CalibrationSummaryResponse(CalibrationSummaryResponseRequired, total=False):
    """Complete calibration summary response.

    This TypedDict uses inheritance to make the summary field optional.
    All fields from CalibrationSummaryResponseRequired are required,
    while the summary field is optional.

    Attributes:
        data_overview: Statistical overview of the employee dataset
        time_allocation: Time allocation recommendations for the meeting
        insights: List of actionable insights for meeting preparation
        summary: Optional AI-generated summary of all insights (None if not available)
    """

    summary: str | None


class LLMAvailabilityResponse(TypedDict):
    """LLM service availability status."""

    available: bool
    reason: str | None


# =============================================================================
# Endpoints
# =============================================================================


@router.get("", response_model=None)
async def get_calibration_summary(
    use_agent: bool = Query(
        default=True,
        description="Use AI agent for insights and summary generation. "
        "If True, uses LLM for insights + summary. If False, uses legacy logic (no summary).",
    ),
    session_mgr: SessionManager = Depends(get_session_manager),
    summary_service: CalibrationSummaryService = Depends(get_calibration_summary_service),
) -> CalibrationSummaryResponse:
    """Get calibration summary with optional AI-powered analysis.

    This endpoint provides comprehensive calibration meeting preparation data.
    It includes:
    - Data overview (employee counts, distributions)
    - Time allocation recommendations
    - Actionable insights (AI-generated if use_agent=True, legacy logic if False)
    - AI summary (only when use_agent=True and LLM succeeds)

    Args:
        use_agent: If True, use LLM agent for insights + summary.
                   If False, use legacy insight generation (no summary).
                   Defaults to True for agent-first architecture.

    Returns:
        CalibrationSummaryResponse with all summary data, including optional AI summary

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
            f"for user_id={LOCAL_USER_ID} with use_agent={use_agent}"
        )

        # Run the potentially long-running LLM calculation in a background thread
        # to prevent blocking the event loop and keep the server responsive
        summary = await asyncio.to_thread(
            summary_service.calculate_summary, session.current_employees, use_agent=use_agent
        )
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
