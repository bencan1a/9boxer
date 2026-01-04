"""Organization hierarchy API endpoints."""

import logging
from typing import TypedDict

from fastapi import APIRouter, Depends, HTTPException, Path, Query, status

from ninebox.core.dependencies import get_session_manager
from ninebox.models.employee import Employee
from ninebox.services.org_service import OrgService
from ninebox.services.session_manager import SessionManager

router = APIRouter(prefix="/org-hierarchy", tags=["org-hierarchy"])

# Constant user ID for local-only app (no authentication)
LOCAL_USER_ID = "local-user"

logger = logging.getLogger(__name__)


class ManagerInfo(TypedDict):
    """Manager information response."""

    employee_id: int
    name: str
    team_size: int


class ManagerListResponse(TypedDict):
    """Response for manager list endpoint."""

    managers: list[ManagerInfo]
    total_count: int


class ReportingChainResponse(TypedDict):
    """Response for reporting chain endpoint."""

    employee_id: int
    employee_name: str
    reporting_chain: list[ManagerInfo]


class AllReportsResponse(TypedDict):
    """Response for all reports endpoint."""

    manager_id: int
    manager_name: str
    direct_reports_count: int
    total_reports_count: int
    all_reports: list[dict]


@router.get("/managers", response_model=None)
async def get_managers(
    min_team_size: int = Query(default=1, ge=1, description="Minimum team size to filter managers"),
    session_mgr: SessionManager = Depends(get_session_manager),
) -> ManagerListResponse:
    """
    Get list of all managers with their team sizes.

    Uses OrgService to find managers with at least min_team_size total employees
    (direct + indirect reports) in their organization.

    Args:
        min_team_size: Minimum total team size (default: 1)
        session_mgr: Session manager dependency

    Returns:
        ManagerListResponse with list of managers and their team sizes

    Raises:
        HTTPException: 404 if no active session found
        HTTPException: 500 if org service initialization fails
    """
    # Get session
    session = session_mgr.get_session(LOCAL_USER_ID)

    if not session:
        logger.error(f"OrgHierarchy: No session found for user_id={LOCAL_USER_ID}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active session found. Please upload an Excel file first.",
        )

    if not session.current_employees:
        logger.error("OrgHierarchy: Session exists but current_employees is EMPTY")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Session exists but contains no employee data. Please reload your Excel file.",
        )

    try:
        # Initialize OrgService with current employees
        # Disable validation to handle test data with incomplete org structures
        org_service = OrgService(session.current_employees, validate=False)

        # Find managers with minimum team size
        manager_ids = org_service.find_managers(min_team_size=min_team_size)

        # Build manager info list
        managers: list[ManagerInfo] = []
        for manager_id in manager_ids:
            manager = org_service.get_employee_by_id(manager_id)
            if not manager:
                logger.warning(
                    f"Manager ID {manager_id} found in org tree but not in employee list. Skipping."
                )
                continue

            # Get team size (all reports)
            team_size = len(org_service.get_all_reports(manager_id))

            managers.append(
                {
                    "employee_id": manager_id,
                    "name": manager.name,
                    "team_size": team_size,
                }
            )

        # Sort by team size descending, then by name
        managers.sort(key=lambda m: (-m["team_size"], m["name"]))

        return {"managers": managers, "total_count": len(managers)}

    except Exception as e:
        logger.error(f"OrgHierarchy: Failed to get managers: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve manager list: {e!s}",
        ) from e


@router.get("/reports/{employee_id}", response_model=None)
async def get_all_reports(
    employee_id: int = Path(..., description="Employee ID of the manager"),
    session_mgr: SessionManager = Depends(get_session_manager),
) -> AllReportsResponse:
    """
    Get all reports (direct + indirect) for a specific manager.

    Uses OrgService to traverse the org tree and return all employees
    reporting to the specified manager, both directly and indirectly.

    Args:
        employee_id: Employee ID of the manager
        session_mgr: Session manager dependency

    Returns:
        AllReportsResponse with manager info and list of all reports

    Raises:
        HTTPException: 404 if no active session found or employee not found
        HTTPException: 500 if org service operation fails
    """
    # Get session
    session = session_mgr.get_session(LOCAL_USER_ID)

    if not session:
        logger.error(f"OrgHierarchy: No session found for user_id={LOCAL_USER_ID}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active session found. Please upload an Excel file first.",
        )

    if not session.current_employees:
        logger.error("OrgHierarchy: Session exists but current_employees is EMPTY")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Session exists but contains no employee data. Please reload your Excel file.",
        )

    try:
        # Initialize OrgService with current employees
        org_service = OrgService(session.current_employees, validate=False)

        # Get manager employee
        manager = org_service.get_employee_by_id(employee_id)
        if not manager:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Employee ID {employee_id} not found in dataset.",
            )

        # Get direct and all reports
        direct_reports = org_service.get_direct_reports(employee_id)
        all_reports = org_service.get_all_reports(employee_id)

        # Convert employees to dict representation for response
        def employee_to_dict(emp: Employee) -> dict:
            return {
                "employee_id": emp.employee_id,
                "name": emp.name,
                "job_title": emp.job_title,
                "job_level": emp.job_level,
                "job_function": emp.job_function,
                "manager": emp.direct_manager,
            }

        return {
            "manager_id": employee_id,
            "manager_name": manager.name,
            "direct_reports_count": len(direct_reports),
            "total_reports_count": len(all_reports),
            "all_reports": [employee_to_dict(emp) for emp in all_reports],
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"OrgHierarchy: Failed to get reports for employee {employee_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve reports: {e!s}",
        ) from e


@router.get("/reporting-chain/{employee_id}", response_model=None)
async def get_reporting_chain(
    employee_id: int = Path(..., description="Employee ID to get reporting chain for"),
    session_mgr: SessionManager = Depends(get_session_manager),
) -> ReportingChainResponse:
    """
    Get the upward reporting chain from an employee to the CEO.

    Returns the chain of manager IDs from the employee's direct manager up to
    the CEO (root of the tree).

    Args:
        employee_id: Employee ID to get chain for
        session_mgr: Session manager dependency

    Returns:
        ReportingChainResponse with employee info and reporting chain

    Raises:
        HTTPException: 404 if no active session found or employee not found
        HTTPException: 500 if org service operation fails
    """
    # Get session
    session = session_mgr.get_session(LOCAL_USER_ID)

    if not session:
        logger.error(f"OrgHierarchy: No session found for user_id={LOCAL_USER_ID}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active session found. Please upload an Excel file first.",
        )

    if not session.current_employees:
        logger.error("OrgHierarchy: Session exists but current_employees is EMPTY")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Session exists but contains no employee data. Please reload your Excel file.",
        )

    try:
        # Initialize OrgService with current employees
        org_service = OrgService(session.current_employees, validate=False)

        # Get employee
        employee = org_service.get_employee_by_id(employee_id)
        if not employee:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Employee ID {employee_id} not found in dataset.",
            )

        # Get reporting chain
        chain_ids = org_service.get_reporting_chain(employee_id)

        # Build manager info list for chain
        reporting_chain: list[ManagerInfo] = []
        for mgr_id in chain_ids:
            mgr = org_service.get_employee_by_id(mgr_id)
            if mgr:
                team_size = len(org_service.get_all_reports(mgr_id))
                reporting_chain.append(
                    {
                        "employee_id": mgr_id,
                        "name": mgr.name,
                        "team_size": team_size,
                    }
                )

        return {
            "employee_id": employee_id,
            "employee_name": employee.name,
            "reporting_chain": reporting_chain,
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"OrgHierarchy: Failed to get reporting chain for employee {employee_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve reporting chain: {e!s}",
        ) from e
