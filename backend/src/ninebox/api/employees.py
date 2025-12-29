"""Employee management API endpoints."""

import logging
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field, field_validator

from ninebox.core.dependencies import get_employee_service, get_session_manager
from ninebox.models.employee import Employee, PerformanceLevel, PotentialLevel
from ninebox.models.filters import EmployeeFilters
from ninebox.services.employee_service import EmployeeService
from ninebox.services.sample_data_generator import RichDatasetConfig, generate_rich_dataset
from ninebox.services.session_manager import SessionManager

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/employees", tags=["employees"])

# Constant user ID for local-only app (no authentication)
LOCAL_USER_ID = "local-user"


class MoveRequest(BaseModel):
    """Request to move an employee."""

    performance: str  # "Low", "Medium", "High"
    potential: str  # "Low", "Medium", "High"


class UpdateEmployeeRequest(BaseModel):
    """Request to update employee fields."""

    # Grid position fields (will trigger event tracking)
    performance: str | None = None  # "LOW", "MEDIUM", "HIGH"
    potential: str | None = None  # "LOW", "MEDIUM", "HIGH"

    # Other employee fields
    promotion_readiness: bool | None = None
    development_focus: str | None = None
    development_action: str | None = None
    notes: str | None = None
    flags: list[str] | None = None

    @field_validator("flags")
    @classmethod
    def validate_flags(cls, v: list[str] | None) -> list[str] | None:
        """Validate flags are from allowed list.

        Args:
            v: List of flag strings to validate

        Returns:
            Validated list of flags or None

        Raises:
            ValueError: If any flag is not in the allowed list
        """
        if v is None:
            return None

        allowed_flags = {
            "promotion_ready",
            "flagged_for_discussion",
            "flight_risk",
            "new_hire",
            "succession_candidate",
            "pip",
            "high_retention_priority",
            "ready_for_lateral_move",
        }

        invalid_flags = [flag for flag in v if flag not in allowed_flags]
        if invalid_flags:
            raise ValueError(
                f"Invalid flags: {', '.join(invalid_flags)}. "
                f"Allowed flags: {', '.join(sorted(allowed_flags))}"
            )

        return v


class DonutMoveRequest(BaseModel):
    """Request to move an employee in donut mode."""

    performance: str  # "Low", "Medium", "High"
    potential: str  # "Low", "Medium", "High"
    notes: str | None = None


class GenerateSampleRequest(BaseModel):
    """Request to generate sample employee dataset."""

    size: int = Field(default=200, ge=50, le=300, description="Number of employees to generate")
    include_bias: bool = Field(default=True, description="Include detectable bias patterns")
    seed: int | None = Field(default=None, description="Random seed for reproducibility")


class GenerateSampleResponse(BaseModel):
    """Response containing generated sample dataset."""

    employees: list[Employee]
    metadata: dict[str, Any]  # Contains: total, bias_patterns, locations, functions
    session_id: str  # Session identifier for the generated dataset
    filename: str  # Filename of the generated dataset


@router.get("", response_model=dict)
async def get_employees(
    levels: str | None = Query(None, description="Comma-separated levels (e.g., 'MT2,MT4')"),
    job_profiles: str | None = Query(None),
    managers: str | None = Query(None),
    exclude_ids: str | None = Query(None, description="Comma-separated employee IDs"),
    performance: str | None = Query(None),
    potential: str | None = Query(None),
    session_mgr: SessionManager = Depends(get_session_manager),
    emp_service: EmployeeService = Depends(get_employee_service),
) -> dict:
    """Get filtered list of employees."""
    logger.info(f"GET /employees called for user: {LOCAL_USER_ID}")
    session = session_mgr.get_session(LOCAL_USER_ID)

    if not session:
        logger.error(f"No active session found for user: {LOCAL_USER_ID}")
        logger.error(f"Available sessions: {list(session_mgr.sessions.keys())}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active session",
        )

    logger.info(f"Found session with {len(session.current_employees)} employees")

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
    session_mgr: SessionManager = Depends(get_session_manager),
    emp_service: EmployeeService = Depends(get_employee_service),
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
    session_mgr: SessionManager = Depends(get_session_manager),
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
async def update_employee(  # noqa: PLR0912 - Complex update logic requires multiple branches for validation and different update types (flags, grid moves, field updates)
    employee_id: int,
    updates: UpdateEmployeeRequest,
    session_mgr: SessionManager = Depends(get_session_manager),
) -> dict:
    """Update employee fields."""
    session = session_mgr.get_session(LOCAL_USER_ID)
    if not session:
        raise HTTPException(status_code=404, detail="No active session")

    update_data = updates.model_dump(exclude_unset=True)

    # Handle flags separately using new event tracking
    if "flags" in update_data:
        new_flags = update_data.pop("flags")
        session_mgr.update_employee_flags(
            user_id=LOCAL_USER_ID,
            employee_id=employee_id,
            new_flags=new_flags,
        )

    # Handle performance/potential changes with event tracking
    if "performance" in update_data or "potential" in update_data:
        # Get current employee to determine defaults if only one field is provided
        employee = next(
            (e for e in session.current_employees if e.employee_id == employee_id), None
        )
        if not employee:
            raise HTTPException(status_code=404, detail="Employee not found")

        # Use current values as defaults if not provided
        new_performance = update_data.pop("performance", None)
        new_potential = update_data.pop("potential", None)

        # If not provided, use current values
        if new_performance is None:
            new_performance = employee.performance
        if new_potential is None:
            new_potential = employee.potential

        # Convert strings to enums if needed (normalize case: "MEDIUM" -> "Medium")
        if isinstance(new_performance, str):
            try:
                # Normalize case: "MEDIUM" -> "Medium", "medium" -> "Medium"
                normalized = new_performance.capitalize()
                new_performance = PerformanceLevel(normalized)
            except ValueError as e:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid performance value: {new_performance}",
                ) from e
        if isinstance(new_potential, str):
            try:
                # Normalize case: "HIGH" -> "High", "high" -> "High"
                normalized = new_potential.capitalize()
                new_potential = PotentialLevel(normalized)
            except ValueError as e:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid potential value: {new_potential}",
                ) from e

        # Create GridMoveEvent via session manager (handles event tracking)
        try:
            session_mgr.move_employee(
                user_id=LOCAL_USER_ID,
                employee_id=employee_id,
                new_performance=new_performance,
                new_potential=new_potential,
            )
        except ValueError as e:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=str(e),
            ) from e

    # Handle other fields (promotion_readiness, development_focus, development_action, notes)
    if update_data:
        employee = next(
            (e for e in session.current_employees if e.employee_id == employee_id), None
        )
        if not employee:
            raise HTTPException(status_code=404, detail="Employee not found")

        # Update remaining fields
        for field, value in update_data.items():
            setattr(employee, field, value)

        # Update modified status based on events
        has_event = any(e.employee_id == employee_id for e in session.events)
        employee.modified_in_session = has_event

        # Persist
        session_mgr._persist_session(session)

    # Return updated employee
    session = session_mgr.get_session(LOCAL_USER_ID)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    employee = next((e for e in session.current_employees if e.employee_id == employee_id), None)
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    return {"employee": employee.model_dump(), "success": True}


@router.patch("/{employee_id}/move")
async def move_employee(
    employee_id: int,
    move: MoveRequest,
    session_mgr: SessionManager = Depends(get_session_manager),
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
    session_mgr: SessionManager = Depends(get_session_manager),
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
            # Also update the event entry if it exists
            event_entry = next(
                (e for e in session.donut_events if e.employee_id == employee_id), None
            )
            if event_entry:
                event_entry.notes = move.notes

    # Get updated employee for response
    employee = next((e for e in session.current_employees if e.employee_id == employee_id), None)

    return {
        "employee": employee.model_dump() if employee else None,
        "change": change.model_dump(),
        "success": True,
    }


@router.post("/generate-sample", response_model=GenerateSampleResponse)
async def generate_sample_employees(
    request: GenerateSampleRequest,
    session_manager: SessionManager = Depends(get_session_manager),
) -> GenerateSampleResponse:
    """Generate sample employee dataset for testing and tutorials.

    This endpoint generates realistic employee data with:
    - Organizational hierarchy (6 management levels)
    - Performance history over 3 years
    - Statistical bias patterns (if enabled)
    - Complete coverage of grid positions and flags
    - Reproducible results via seed parameter

    The generated data IS saved to a new session for immediate use.

    Args:
        request: Configuration for dataset generation

    Returns:
        GenerateSampleResponse containing employees and metadata

    Raises:
        HTTPException: 400 if size is out of range (50-300)
        HTTPException: 500 if generation fails

    Example:
        >>> # Generate 200 employees with default settings
        >>> POST /api/employees/generate-sample {"size": 200}
        >>> # Generate 100 employees with custom config
        >>> POST /api/employees/generate-sample {"size": 100, "include_bias": false, "seed": 42}
    """
    try:
        # Create configuration from request
        config = RichDatasetConfig(
            size=request.size,
            include_bias=request.include_bias,
            seed=request.seed,
        )

        # Generate employees
        employees = generate_rich_dataset(config)

        # Extract metadata for response
        locations = {emp.location for emp in employees}
        functions = {emp.job_function for emp in employees}
        grid_positions = {emp.grid_position for emp in employees}

        # Count bias patterns if enabled
        bias_info = {}
        if request.include_bias:
            usa_employees = [emp for emp in employees if emp.location == "USA"]
            sales_employees = [emp for emp in employees if emp.job_function == "Sales"]

            # Count high performers
            usa_high_perf = sum(1 for emp in usa_employees if emp.performance.value == "High")
            sales_high_perf = sum(1 for emp in sales_employees if emp.performance.value == "High")

            bias_info = {
                "usa_employees": len(usa_employees),
                "usa_high_performers": usa_high_perf,
                "usa_high_performer_rate": usa_high_perf / len(usa_employees)
                if usa_employees
                else 0,
                "sales_employees": len(sales_employees),
                "sales_high_performers": sales_high_perf,
                "sales_high_performer_rate": (
                    sales_high_perf / len(sales_employees) if sales_employees else 0
                ),
            }

        metadata: dict[str, Any] = {
            "total": len(employees),
            "locations": sorted(locations),
            "functions": sorted(functions),
            "grid_positions": sorted(grid_positions),
            "bias_patterns": bias_info if request.include_bias else None,
        }

        # Create a session with the generated sample data
        filename = f"Sample_Dataset_{request.size}_employees.xlsx"
        session_id = session_manager.create_session(
            user_id=LOCAL_USER_ID,
            filename=filename,
            file_path="",  # No actual file for generated data
            sheet_name="Sample Data",
            sheet_index=0,
            employees=employees,
        )

        # Verify session was created and can be retrieved
        logger.info(f"Created sample data session: {session_id}")
        verify_session = session_manager.get_session(LOCAL_USER_ID)
        if verify_session:
            logger.info(
                f"Verified session exists with {len(verify_session.current_employees)} employees"
            )
        else:
            logger.error(f"CRITICAL: Session {session_id} was NOT found after creation!")

        return GenerateSampleResponse(
            employees=employees, metadata=metadata, session_id=session_id, filename=filename
        )

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid request parameters: {e!s}",
        ) from e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate sample dataset: {e!s}",
        ) from e
