"""Employee management API endpoints."""

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel

from ninebox.api.auth import get_current_user_id
from ninebox.models.employee import Employee, PerformanceLevel, PotentialLevel
from ninebox.services.employee_service import employee_service
from ninebox.services.session_manager import session_manager

router = APIRouter(prefix="/employees", tags=["employees"])


class MoveRequest(BaseModel):
    """Request to move an employee."""

    performance: str  # "Low", "Medium", "High"
    potential: str  # "Low", "Medium", "High"


@router.get("", response_model=dict)
async def get_employees(
    user_id: str = Depends(get_current_user_id),
    levels: Optional[str] = Query(None, description="Comma-separated levels (e.g., 'MT2,MT4')"),
    job_profiles: Optional[str] = Query(None),
    managers: Optional[str] = Query(None),
    chain_levels: Optional[str] = Query(None, description="Comma-separated chain levels (e.g., '04,05')"),
    exclude_ids: Optional[str] = Query(None, description="Comma-separated employee IDs"),
    performance: Optional[str] = Query(None),
    potential: Optional[str] = Query(None),
) -> dict:
    """Get filtered list of employees."""
    session = session_manager.get_session(user_id)

    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active session",
        )

    # Parse query parameters
    levels_list = levels.split(",") if levels else None
    job_profiles_list = job_profiles.split(",") if job_profiles else None
    managers_list = managers.split(",") if managers else None
    chain_levels_list = chain_levels.split(",") if chain_levels else None
    exclude_ids_list = [int(id.strip()) for id in exclude_ids.split(",")] if exclude_ids else None
    performance_list = performance.split(",") if performance else None
    potential_list = potential.split(",") if potential else None

    # Apply filters
    filtered_employees = employee_service.filter_employees(
        employees=session.current_employees,
        levels=levels_list,
        job_profiles=job_profiles_list,
        managers=managers_list,
        chain_levels=chain_levels_list,
        exclude_ids=exclude_ids_list,
        performance=performance_list,
        potential=potential_list,
    )

    return {
        "employees": [emp.model_dump() for emp in filtered_employees],
        "total": len(session.current_employees),
        "filtered": len(filtered_employees),
    }


@router.get("/filter-options")
async def get_filter_options(user_id: str = Depends(get_current_user_id)) -> dict:
    """Get available filter options from current session."""
    session = session_manager.get_session(user_id)

    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active session",
        )

    return employee_service.get_filter_options(session.current_employees)


@router.get("/{employee_id}", response_model=Employee)
async def get_employee(
    employee_id: int, user_id: str = Depends(get_current_user_id)
) -> Employee:
    """Get single employee by ID."""
    session = session_manager.get_session(user_id)

    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active session",
        )

    employee = next(
        (e for e in session.current_employees if e.employee_id == employee_id), None
    )

    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Employee {employee_id} not found",
        )

    return employee


@router.patch("/{employee_id}/move")
async def move_employee(
    employee_id: int, move: MoveRequest, user_id: str = Depends(get_current_user_id)
) -> dict:
    """Move employee to new position."""
    try:
        # Convert strings to enums
        performance = PerformanceLevel(move.performance)
        potential = PotentialLevel(move.potential)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid performance or potential value: {str(e)}",
        )

    try:
        change = session_manager.move_employee(
            user_id=user_id,
            employee_id=employee_id,
            new_performance=performance,
            new_potential=potential,
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )

    # Get updated employee
    session = session_manager.get_session(user_id)
    employee = next(
        (e for e in session.current_employees if e.employee_id == employee_id), None
    )

    return {
        "employee": employee.model_dump() if employee else None,
        "change": change.model_dump(),
        "success": True,
    }
