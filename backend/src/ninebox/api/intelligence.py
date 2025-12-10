"""Intelligence API endpoints."""

from typing import TypedDict

from fastapi import APIRouter, Depends, HTTPException, status

from ninebox.api.auth import get_current_user_id
from ninebox.services.session_manager import session_manager

router = APIRouter(prefix="/intelligence", tags=["intelligence"])


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


@router.get("", response_model=None)
async def get_intelligence(
    user_id: str = Depends(get_current_user_id),
) -> IntelligenceResponse:
    """
    Get statistical intelligence analysis for the full dataset.

    Note: This analyzes the FULL dataset, not filtered data.
    Anomaly detection requires the full population to establish baseline.

    Args:
        user_id: Current user ID from authentication token

    Returns:
        IntelligenceResponse containing quality score, anomaly counts, and dimension analyses

    Raises:
        HTTPException: 404 if no active session found
        HTTPException: 500 if intelligence calculation fails
    """
    # Get session
    session = session_manager.get_session(user_id)

    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active session",
        )

    # Import intelligence service (will be created by Agent A)
    try:
        from ninebox.services.intelligence_service import calculate_overall_intelligence  # noqa: PLC0415, I001
    except ImportError:
        # Mock response if service not yet available
        # This allows the API endpoint to be tested independently
        return IntelligenceResponse(
            quality_score=0,
            anomaly_count=AnomalyCount(green=0, yellow=0, red=0),
            location_analysis=DimensionAnalysis(
                chi_square=0.0,
                p_value=1.0,
                effect_size=0.0,
                degrees_of_freedom=0,
                sample_size=0,
                status="green",
                deviations=[],
                interpretation="Service not available",
            ),
            function_analysis=DimensionAnalysis(
                chi_square=0.0,
                p_value=1.0,
                effect_size=0.0,
                degrees_of_freedom=0,
                sample_size=0,
                status="green",
                deviations=[],
                interpretation="Service not available",
            ),
            level_analysis=DimensionAnalysis(
                chi_square=0.0,
                p_value=1.0,
                effect_size=0.0,
                degrees_of_freedom=0,
                sample_size=0,
                status="green",
                deviations=[],
                interpretation="Service not available",
            ),
            tenure_analysis=DimensionAnalysis(
                chi_square=0.0,
                p_value=1.0,
                effect_size=0.0,
                degrees_of_freedom=0,
                sample_size=0,
                status="green",
                deviations=[],
                interpretation="Service not available",
            ),
        )

    try:
        # Calculate intelligence using full dataset (current_employees)
        intelligence = calculate_overall_intelligence(session.current_employees)
        return IntelligenceResponse(**intelligence)  # type: ignore[typeddict-item, no-any-return]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to calculate intelligence: {e!s}",
        ) from e
