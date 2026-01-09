"""API endpoints for update analytics."""

import logging

from fastapi import APIRouter, Depends, HTTPException

from ninebox.models.update_analytics import (
    UpdateAnalyticsSummary,
    UpdateEvent,
    UpdateEventRecord,
)
from ninebox.services.update_analytics_service import UpdateAnalyticsService

logger = logging.getLogger(__name__)
router = APIRouter()


def get_analytics_service() -> UpdateAnalyticsService:
    """Dependency: Get update analytics service instance."""
    return UpdateAnalyticsService()


@router.post("/analytics/update-events", status_code=201)
async def record_update_event(
    event: UpdateEvent,
    service: UpdateAnalyticsService = Depends(get_analytics_service),
) -> dict[str, int]:
    """
    Record an update event from Electron client.

    This endpoint is called by the Electron main process to track
    update lifecycle events (checks, downloads, installs, errors).
    """
    try:
        event_id = service.record_event(event)
        return {"id": event_id}
    except Exception as e:
        logger.error(f"Failed to record update event: {e}")
        raise HTTPException(status_code=500, detail="Failed to record event") from e


@router.get("/analytics/update-events/summary")
async def get_update_summary(
    days: int = 30,
    service: UpdateAnalyticsService = Depends(get_analytics_service),
) -> UpdateAnalyticsSummary:
    """
    Get summary statistics for update analytics.

    Query parameters:
    - days: Number of days to include (default: 30)
    """
    try:
        return service.get_summary(days=days)
    except Exception as e:
        logger.error(f"Failed to get update summary: {e}")
        raise HTTPException(status_code=500, detail="Failed to get summary") from e


@router.get("/analytics/update-events")
async def get_update_events(
    event_type: str | None = None,
    limit: int = 100,
    service: UpdateAnalyticsService = Depends(get_analytics_service),
) -> list[UpdateEventRecord]:
    """
    Query update events.

    Query parameters:
    - event_type: Filter by event type (optional)
    - limit: Maximum events to return (default: 100)
    """
    try:
        return service.get_events(event_type=event_type, limit=limit)
    except Exception as e:
        logger.error(f"Failed to get update events: {e}")
        raise HTTPException(status_code=500, detail="Failed to get events") from e
