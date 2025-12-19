"""Employee management API endpoints."""

from fastapi import APIRouter, HTTPException, Query, status
from pydantic import BaseModel

from ninebox.models.employee import Employee, PerformanceLevel, PotentialLevel
from ninebox.services.employee_service import employee_service
from ninebox.services.session_manager import session_manager

router = APIRouter(prefix="/employees", tags=["employees"])

# Constant user ID for local-only app (no authentication)
LOCAL_USER_ID = "local-user"


class MoveRequest(BaseModel):
    """Request to move an employee."""

    performance: str  # "Low", "Medium", "High"
    potential: str  # "Low", "Medium", "High"


class UpdateEmployeeRequest(BaseModel):
    """Request to update employee fields."""

    promotion_readiness: bool | None = None
    development_focus: str | None = None
    development_action: str | None = None
    notes: str | None = None


@router.get("", response_model=dict)
async def get_employees(
    levels: str | None = Query(None, description="Comma-separated levels (e.g., 'MT2,MT4')"),
    job_profiles: str | None = Query(None),
    managers: str | None = Query(None),
    exclude_ids: str | None = Query(None, description="Comma-separated employee IDs"),
    performance: str | None = Query(None),
    potential: str | None = Query(None),
) -> dict:
    """Get filtered list of employees."""
    session = session_manager.get_session(LOCAL_USER_ID)

    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active session",
        )

    # Parse query parameters
    levels_list = levels.split(",") if levels else None
    job_profiles_list = job_profiles.split(",") if job_profiles else None
    managers_list = managers.split(",") if managers else None

    # Parse exclude_ids with validation
    exclude_ids_list = None
    if exclude_ids:
        try:
            exclude_ids_list = [int(id.strip()) for id in exclude_ids.split(",")]
        except ValueError as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid employee ID in exclude_ids: {e!s}",
            ) from e

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

    return {
        "employees": [emp.model_dump() for emp in filtered_employees],
        "total": len(session.current_employees),
        "filtered": len(filtered_employees),
    }


@router.get("/filter-options")
async def get_filter_options() -> dict:
    """Get available filter options from current session."""
    session = session_manager.get_session(LOCAL_USER_ID)

    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active session",
        )

    return employee_service.get_filter_options(session.current_employees)


@router.get("/{employee_id}", response_model=Employee)
async def get_employee(employee_id: int) -> Employee:
    """Get single employee by ID."""
    session = session_manager.get_session(LOCAL_USER_ID)

    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active session",
        )

    employee = next((e for e in session.current_employees if e.employee_id == employee_id), None)

    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Employee {employee_id} not found",
        )

    return employee


@router.patch("/{employee_id}")
async def update_employee(
    employee_id: int,
    updates: UpdateEmployeeRequest,
) -> dict:
    """Update employee fields."""
    session = session_manager.get_session(LOCAL_USER_ID)

    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active session",
        )

    # Find employee
    employee = next((e for e in session.current_employees if e.employee_id == employee_id), None)

    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Employee {employee_id} not found",
        )

    # Update fields
    update_data = updates.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(employee, field, value)

    # Mark as modified
    employee.modified_in_session = True

    return {
        "employee": employee.model_dump(),
        "success": True,
    }


@router.patch("/{employee_id}/move")
async def move_employee(employee_id: int, move: MoveRequest) -> dict:
    """Move employee to new position."""
    try:
        # Convert strings to enums
        performance = PerformanceLevel(move.performance)
        potential = PotentialLevel(move.potential)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid performance or potential value: {e!s}",
        ) from e

    try:
        change = session_manager.move_employee(
            user_id=LOCAL_USER_ID,
            employee_id=employee_id,
            new_performance=performance,
            new_potential=potential,
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        ) from e

    # Get updated employee
    session = session_manager.get_session(LOCAL_USER_ID)
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found",
        )
    employee = next((e for e in session.current_employees if e.employee_id == employee_id), None)

    return {
        "employee": employee.model_dump() if employee else None,
        "change": change.model_dump(),
        "success": True,
    }
