"""Employee management API endpoints."""

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel

from ninebox.core.dependencies import get_employee_service, get_session_manager
from ninebox.models.employee import Employee, PerformanceLevel, PotentialLevel
from ninebox.models.filters import EmployeeFilters
from ninebox.services.employee_service import EmployeeService
from ninebox.services.session_manager import SessionManager

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


class DonutMoveRequest(BaseModel):
    """Request to move an employee in donut mode."""

    performance: str  # "Low", "Medium", "High"
    potential: str  # "Low", "Medium", "High"
    notes: str | None = None


@router.get("", response_model=dict)
async def get_employees(
    levels: str | None = Query(None, description="Comma-separated levels (e.g., 'MT2,MT4')"),
    job_profiles: str | None = Query(None),
    managers: str | None = Query(None),
    exclude_ids: str | None = Query(None, description="Comma-separated employee IDs"),
    performance: str | None = Query(None),
    potential: str | None = Query(None),
    session_mgr: SessionManager = Depends(get_session_manager),  # noqa: B008
    emp_service: EmployeeService = Depends(get_employee_service),  # noqa: B008
) -> dict:
    """Get filtered list of employees."""
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

    return {
        "employees": [emp.model_dump() for emp in filtered_employees],
        "total": len(session.current_employees),
        "filtered": len(filtered_employees),
    }


@router.get("/filter-options")
async def get_filter_options(
    session_mgr: SessionManager = Depends(get_session_manager),  # noqa: B008
    emp_service: EmployeeService = Depends(get_employee_service),  # noqa: B008
) -> dict:
    """Get available filter options from current session."""
    session = session_mgr.get_session(LOCAL_USER_ID)

    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active session",
        )

    return emp_service.get_filter_options(session.current_employees)


@router.get("/{employee_id}", response_model=Employee)
async def get_employee(
    employee_id: int,
    session_mgr: SessionManager = Depends(get_session_manager),  # noqa: B008
) -> Employee:
    """Get single employee by ID."""
    session = session_mgr.get_session(LOCAL_USER_ID)

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
    session_mgr: SessionManager = Depends(get_session_manager),  # noqa: B008
) -> dict:
    """Update employee fields."""
    session = session_mgr.get_session(LOCAL_USER_ID)

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
async def move_employee(
    employee_id: int,
    move: MoveRequest,
    session_mgr: SessionManager = Depends(get_session_manager),  # noqa: B008
) -> dict:
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
        change = session_mgr.move_employee(
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
    session = session_mgr.get_session(LOCAL_USER_ID)
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


@router.patch("/{employee_id}/move-donut")
async def move_employee_donut(
    employee_id: int,
    move: DonutMoveRequest,
    session_mgr: SessionManager = Depends(get_session_manager),  # noqa: B008
) -> dict:
    """Move employee to new position in donut mode.

    This endpoint moves an employee within the donut exercise (separate from regular grid moves).
    Donut mode allows exploring hypothetical placements without affecting the main grid.

    Args:
        employee_id: ID of the employee to move
        move: DonutMoveRequest containing performance, potential, and optional notes

    Returns:
        dict: Response containing updated employee, change entry, and success status

    Raises:
        HTTPException: 400 if performance/potential values are invalid
        HTTPException: 404 if employee not found or no active session
    """
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
        change = session_mgr.move_employee_donut(
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

    # Get updated session
    session = session_mgr.get_session(LOCAL_USER_ID)
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found",
        )

    # Update notes if provided and employee was moved to a non-position-5 location
    if move.notes is not None:
        # Store notes in the employee's donut_notes field
        employee_obj = next(
            (e for e in session.current_employees if e.employee_id == employee_id), None
        )
        if employee_obj and employee_obj.donut_modified:
            employee_obj.donut_notes = move.notes
            # Also update the change entry if it exists
            change_entry = next(
                (c for c in session.donut_changes if c.employee_id == employee_id), None
            )
            if change_entry:
                change_entry.notes = move.notes

    # Get updated employee for response
    employee = next((e for e in session.current_employees if e.employee_id == employee_id), None)

    return {
        "employee": employee.model_dump() if employee else None,
        "change": change.model_dump(),
        "success": True,
    }
