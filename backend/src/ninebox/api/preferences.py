"""Preferences management API endpoints.

This module provides API endpoints for managing user preferences including
recent files list.
"""

import logging

from fastapi import APIRouter, Depends
from pydantic import BaseModel

from ninebox.core.dependencies import get_preferences_manager
from ninebox.models.preferences import RecentFile
from ninebox.services.preferences_manager import PreferencesManager

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/preferences", tags=["preferences"])


class AddRecentFileRequest(BaseModel):
    """Request model for adding a recent file.

    Attributes:
        path: Full file system path to the file.
        name: Display name of the file (typically the filename).
    """

    path: str
    name: str


class AddRecentFileResponse(BaseModel):
    """Response model for adding a recent file.

    Attributes:
        success: Whether the operation was successful.
    """

    success: bool


@router.get("/recent-files", response_model=list[RecentFile])
async def get_recent_files(
    prefs_mgr: PreferencesManager = Depends(get_preferences_manager),
) -> list[RecentFile]:
    """Get the list of recent files.

    Returns a list of recently accessed files sorted by last accessed timestamp
    in descending order (most recent first). Maximum of 5 files are returned.

    Args:
        prefs_mgr: Preferences manager dependency.

    Returns:
        List of recent files sorted by last accessed time.

    Example:
        >>> # GET /preferences/recent-files
        >>> # Response:
        >>> [
        ...     {
        ...         "path": "c:/Projects/data.xlsx",
        ...         "name": "data.xlsx",
        ...         "last_accessed": 1703123456789
        ...     }
        ... ]
    """
    files = prefs_mgr.get_recent_files()
    logger.info(f"Fetching recent files: {len(files)} files")
    return files


@router.post("/recent-files", response_model=AddRecentFileResponse)
async def add_recent_file(
    request: AddRecentFileRequest,
    prefs_mgr: PreferencesManager = Depends(get_preferences_manager),
) -> AddRecentFileResponse:
    """Add a file to the recent files list.

    If the file already exists in the list, its timestamp is updated and it's
    moved to the top. The list maintains a maximum of 5 files, removing the
    oldest when the limit is reached.

    Args:
        request: Request containing file path and name.
        prefs_mgr: Preferences manager dependency.

    Returns:
        Response indicating success.

    Example:
        >>> # POST /preferences/recent-files
        >>> # Request:
        >>> {
        ...     "path": "c:/Projects/data.xlsx",
        ...     "name": "data.xlsx"
        ... }
        >>> # Response:
        >>> {"success": True}
    """
    prefs_mgr.add_recent_file(request.path, request.name)
    return AddRecentFileResponse(success=True)


class ClearRecentFilesResponse(BaseModel):
    """Response model for clearing recent files.

    Attributes:
        success: Whether the operation was successful.
    """

    success: bool


@router.delete("/recent-files", response_model=ClearRecentFilesResponse)
async def clear_recent_files(
    prefs_mgr: PreferencesManager = Depends(get_preferences_manager),
) -> ClearRecentFilesResponse:
    """Clear all recent files.

    Removes all entries from the recent files list.

    Args:
        prefs_mgr: Preferences manager dependency.

    Returns:
        Response indicating success.

    Example:
        >>> # DELETE /preferences/recent-files
        >>> # Response:
        >>> {"success": True}
    """
    logger.info("Clearing all recent files")
    prefs_mgr.clear_recent_files()
    return ClearRecentFilesResponse(success=True)
