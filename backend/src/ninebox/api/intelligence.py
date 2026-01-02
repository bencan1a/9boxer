"""Intelligence API endpoints."""

import logging
from typing import TypedDict

from fastapi import APIRouter, Depends, HTTPException, status

from ninebox.core.dependencies import get_session_manager
from ninebox.services.intelligence_service import calculate_overall_intelligence
from ninebox.services.session_manager import SessionManager

router = APIRouter(prefix="/intelligence", tags=["intelligence"])

# Constant user ID for local-only app (no authentication)
LOCAL_USER_ID = "local-user"


class AnomalyCount(TypedDict):
    """Anomaly severity counts."""

    green: int
    yellow: int
    red: int


class DimensionAnalysis(TypedDict):
    """Analysis for a single dimension."""

    chi_square: float
    p_value: float
    effect_size: float
    degrees_of_freedom: int
    sample_size: int
    status: str  # "green" | "yellow" | "red"
    deviations: list[dict]
    interpretation: str


class IntelligenceResponse(TypedDict):
    """Intelligence analysis response."""

    quality_score: int
    anomaly_count: AnomalyCount
    location_analysis: DimensionAnalysis
    function_analysis: DimensionAnalysis
    level_analysis: DimensionAnalysis
    tenure_analysis: DimensionAnalysis
    manager_analysis: DimensionAnalysis


@router.get("", response_model=None)
async def get_intelligence(
    session_mgr: SessionManager = Depends(get_session_manager),
) -> IntelligenceResponse:
    """
    Get statistical intelligence analysis for the full dataset.

    Note: This analyzes the FULL dataset, not filtered data.
    Anomaly detection requires the full population to establish baseline.

    Returns:
        IntelligenceResponse containing quality score, anomaly counts, and dimension analyses

    Raises:
        HTTPException: 404 if no active session found
        HTTPException: 500 if intelligence calculation fails
    """
    # Get session
    session = session_mgr.get_session(LOCAL_USER_ID)

    if not session:
        # Log diagnostic information
        logger = logging.getLogger(__name__)
        logger.error(f"Intelligence: No session found for user_id={LOCAL_USER_ID}")
        logger.error(f"Active sessions: {list(session_mgr.sessions.keys())}")

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active session found. Please upload an Excel file first.",
        )

    try:
        # Log diagnostic information
        logger = logging.getLogger(__name__)
        logger.info(
            f"Intelligence: Processing for user_id={LOCAL_USER_ID}, employees={len(session.current_employees)}"
        )

        # Check if employees list is empty
        if not session.current_employees:
            logger.error(
                f"Intelligence: Session exists but current_employees is EMPTY for user_id={LOCAL_USER_ID}"
            )
            logger.error(
                f"Session details: session_id={session.session_id}, original_count={len(session.original_employees)}"
            )
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Session exists but contains no employee data. Please reload your Excel file.",
            )

        # Calculate intelligence using full dataset (current_employees)
        intelligence = calculate_overall_intelligence(session.current_employees)
        return IntelligenceResponse(**intelligence)  # type: ignore[typeddict-item, no-any-return]
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        logger = logging.getLogger(__name__)
        logger.exception(f"Intelligence calculation failed for user_id={LOCAL_USER_ID}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to calculate intelligence: {e!s}",
        ) from e
