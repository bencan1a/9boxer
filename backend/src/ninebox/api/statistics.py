"""Statistics API endpoints."""

from fastapi import APIRouter, Depends, HTTPException, Query, status

from ninebox.core.dependencies import (
    get_employee_service,
    get_session_manager,
    get_statistics_service,
)
from ninebox.models.filters import EmployeeFilters
from ninebox.services.employee_service import EmployeeService
from ninebox.services.session_manager import SessionManager
from ninebox.services.statistics_service import StatisticsService

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
    session_mgr: SessionManager = Depends(get_session_manager),
    emp_service: EmployeeService = Depends(get_employee_service),
    stats_service: StatisticsService = Depends(get_statistics_service),
) -> dict:
    """Get statistics for filtered employees."""
    session = session_mgr.get_session(LOCAL_USER_ID)

    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active session",
        )

    # Parse query parameters using shared filter model
    filters = EmployeeFilters.from_query_params(
        levels=levels,
        job_profiles=job_profiles,
        managers=managers,
        performance=performance,
        potential=potential,
        exclude_ids=exclude_ids,
    )

    # Apply filters
    filtered_employees = emp_service.filter_employees(
        employees=session.current_employees,
        **filters.to_filter_kwargs(),
    )

    # Calculate statistics
    stats = stats_service.calculate_distribution(filtered_employees)

    return stats
