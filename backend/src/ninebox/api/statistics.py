"""Statistics API endpoints."""

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status

from ninebox.api.auth import get_current_user_id
from ninebox.services.employee_service import employee_service
from ninebox.services.session_manager import session_manager
from ninebox.services.statistics_service import statistics_service

router = APIRouter(prefix="/statistics", tags=["statistics"])


@router.get("")
async def get_statistics(
    user_id: str = Depends(get_current_user_id),
    levels: Optional[str] = Query(None),
    job_profiles: Optional[str] = Query(None),
    managers: Optional[str] = Query(None),
    exclude_ids: Optional[str] = Query(None),
    performance: Optional[str] = Query(None),
    potential: Optional[str] = Query(None),
) -> dict:
    """Get statistics for filtered employees."""
    session = session_manager.get_session(user_id)

    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active session",
        )

    # Parse query parameters (same as employees endpoint)
    levels_list = levels.split(",") if levels else None
    job_profiles_list = job_profiles.split(",") if job_profiles else None
    managers_list = managers.split(",") if managers else None
    exclude_ids_list = [int(id.strip()) for id in exclude_ids.split(",")] if exclude_ids else None
    performance_list = performance.split(",") if performance else None
    potential_list = potential.split(",") if potential else None

    # Apply filters
    filtered_employees = employee_service.filter_employees(
        employees=session.current_employees,
        levels=levels_list,
        job_profiles=job_profiles_list,
        managers=managers_list,
        exclude_ids=exclude_ids_list,
        performance=performance_list,
        potential=potential_list,
    )

    # Calculate statistics
    stats = statistics_service.calculate_distribution(filtered_employees)

    return stats
