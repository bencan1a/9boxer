"""Statistics API endpoints."""

from fastapi import APIRouter, HTTPException, Query, status

from ninebox.services.employee_service import employee_service
from ninebox.services.session_manager import session_manager
from ninebox.services.statistics_service import statistics_service

router = APIRouter(prefix="/statistics", tags=["statistics"])

# Constant user ID for local-only app (no authentication)
LOCAL_USER_ID = "local-user"


@router.get("")
async def get_statistics(
    levels: str | None = Query(None),
    job_profiles: str | None = Query(None),
    managers: str | None = Query(None),
    exclude_ids: str | None = Query(None),
    performance: str | None = Query(None),
    potential: str | None = Query(None),
) -> dict:
    """Get statistics for filtered employees."""
    session = session_manager.get_session(LOCAL_USER_ID)

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
