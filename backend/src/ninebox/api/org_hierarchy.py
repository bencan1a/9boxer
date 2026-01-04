"""Organization hierarchy API endpoints."""

import logging
from typing import TypedDict

from fastapi import APIRouter, Depends, HTTPException, Path, Query, status

from ninebox.core.dependencies import get_org_service
from ninebox.models.employee import Employee
from ninebox.services.org_service import OrgService

router = APIRouter(prefix="/org-hierarchy", tags=["org-hierarchy"])

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


class OrgTreeNode(TypedDict):
    """Hierarchical organization tree node."""

    employee_id: int
    name: str
    team_size: int
    direct_reports: list["OrgTreeNode"]


class OrgTreeResponse(TypedDict):
    """Response for organization tree endpoint."""

    roots: list[OrgTreeNode]
    total_managers: int


@router.get("/managers", response_model=None)
async def get_managers(
    min_team_size: int = Query(default=1, ge=1, description="Minimum team size to filter managers"),
    org_service: OrgService = Depends(get_org_service),
) -> ManagerListResponse:
    """
    Get list of all managers with their team sizes.

    Uses OrgService to find managers with at least min_team_size total employees
    (direct + indirect reports) in their organization.

    Args:
        min_team_size: Minimum total team size (default: 1)
        org_service: OrgService dependency

    Returns:
        ManagerListResponse with list of managers and their team sizes

    Raises:
        HTTPException: 404 if no active session found
        HTTPException: 500 if org service initialization fails
    """
    try:
        # Find managers with minimum team size
        manager_ids = org_service.find_managers(min_team_size=min_team_size)

        # Build org tree once for O(1) lookups
        org_tree = org_service.build_org_tree()

        # Build manager info list
        managers: list[ManagerInfo] = []
        for manager_id in manager_ids:
            manager = org_service.get_employee_by_id(manager_id)
            if not manager:
                logger.warning(
                    f"Manager ID {manager_id} found in org tree but not in employee list. Skipping."
                )
                continue

            # Get team size (all reports) using O(1) lookup
            team_size = len(org_tree.get(manager_id, []))

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
    org_service: OrgService = Depends(get_org_service),
) -> AllReportsResponse:
    """
    Get all reports (direct + indirect) for a specific manager.

    Uses OrgService to traverse the org tree and return all employees
    reporting to the specified manager, both directly and indirectly.

    Args:
        employee_id: Employee ID of the manager
        org_service: OrgService dependency

    Returns:
        AllReportsResponse with manager info and list of all reports

    Raises:
        HTTPException: 404 if no active session found or employee not found
        HTTPException: 500 if org service operation fails
    """
    try:
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
    org_service: OrgService = Depends(get_org_service),
) -> ReportingChainResponse:
    """
    Get the upward reporting chain from an employee to the CEO.

    Returns the chain of manager IDs from the employee's direct manager up to
    the CEO (root of the tree).

    Args:
        employee_id: Employee ID to get chain for
        org_service: OrgService dependency

    Returns:
        ReportingChainResponse with employee info and reporting chain

    Raises:
        HTTPException: 404 if no active session found or employee not found
        HTTPException: 500 if org service operation fails
    """
    try:
        # Get employee
        employee = org_service.get_employee_by_id(employee_id)
        if not employee:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Employee ID {employee_id} not found in dataset.",
            )

        # Get reporting chain
        chain_ids = org_service.get_reporting_chain(employee_id)

        # Build org tree once for O(1) lookups
        org_tree = org_service.build_org_tree()

        # Build manager info list for chain
        reporting_chain: list[ManagerInfo] = []
        for mgr_id in chain_ids:
            mgr = org_service.get_employee_by_id(mgr_id)
            if mgr:
                # Get team size using O(1) lookup
                team_size = len(org_tree.get(mgr_id, []))
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


@router.get("/tree", response_model=None)
async def get_org_tree(  # noqa: PLR0912
    min_team_size: int = Query(default=1, ge=1, description="Minimum team size to filter managers"),
    org_service: OrgService = Depends(get_org_service),
) -> OrgTreeResponse:
    """
    Get hierarchical organization tree structure.

    Returns the org structure as a tree with parent-child relationships,
    making it easy to display as an expandable tree in the UI.

    Only includes managers with at least min_team_size total reports.
    The tree shows direct reporting relationships between managers.

    Args:
        min_team_size: Minimum total team size (default: 1)
        org_service: OrgService dependency

    Returns:
        OrgTreeResponse with root managers and their nested direct reports

    Example response:
        {
            "roots": [
                {
                    "employee_id": 1,
                    "name": "CEO",
                    "team_size": 200,
                    "direct_reports": [
                        {
                            "employee_id": 2,
                            "name": "VP Engineering",
                            "team_size": 100,
                            "direct_reports": [...]
                        }
                    ]
                }
            ],
            "total_managers": 15
        }
    """
    try:
        # Get all managers with minimum team size
        manager_ids = org_service.find_managers(min_team_size=min_team_size)

        # Build org tree once for O(1) lookups
        org_tree = org_service.build_org_tree()

        # Create set for fast lookup
        manager_id_set = set(manager_ids)

        # Build manager info map
        manager_info_map: dict[int, OrgTreeNode] = {}
        for manager_id in manager_ids:
            manager = org_service.get_employee_by_id(manager_id)
            if not manager:
                continue

            team_size = len(org_tree.get(manager_id, []))
            manager_info_map[manager_id] = {
                "employee_id": manager_id,
                "name": manager.name,
                "team_size": team_size,
                "direct_reports": [],
            }

        # Build parent-child relationships
        # For each manager, find which other managers are their direct reports
        for manager_id in manager_ids:
            direct_reports = org_service.get_direct_reports(manager_id)

            for report in direct_reports:
                # If this direct report is also a manager in our list, add them as a child
                if report.employee_id in manager_id_set:
                    manager_info_map[manager_id]["direct_reports"].append(
                        manager_info_map[report.employee_id]
                    )

        # Sort direct reports by team size (desc) then name within each parent
        for info in manager_info_map.values():
            info["direct_reports"].sort(key=lambda m: (-m["team_size"], m["name"]))

        # Find root managers (those who don't report to another manager in our list)
        root_managers = []
        for manager_id in manager_ids:
            manager = org_service.get_employee_by_id(manager_id)
            if not manager:
                continue

            # Check if this manager's boss is in our manager list
            manager_employee_data = org_service.get_employee_by_id(manager_id)
            if not manager_employee_data:
                continue

            # Get this manager's reporting chain to find their boss
            manager_chain = org_service.get_reporting_chain(manager_id)

            # If the chain is empty, this is a root (CEO/top-level manager)
            is_root = True

            if manager_chain:
                # The first person in the chain is their direct manager
                # Check if that manager is also in our filtered manager list
                direct_manager_id = manager_chain[0]
                if direct_manager_id in manager_id_set:
                    # They report to another manager in our filtered list, so not a root
                    is_root = False

            if is_root:
                root_managers.append(manager_info_map[manager_id])

        # Sort roots by team size (desc) then name
        root_managers.sort(key=lambda m: (-m["team_size"], m["name"]))

        return {"roots": root_managers, "total_managers": len(manager_ids)}

    except Exception as e:
        logger.error(f"OrgHierarchy: Failed to build org tree: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to build organization tree: {e!s}",
        ) from e
