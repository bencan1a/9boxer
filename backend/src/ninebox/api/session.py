"""Session management API endpoints."""

import logging
import os
import shutil
import time
import uuid
from pathlib import Path
from typing import Literal

from fastapi import APIRouter, Body, Depends, File, Form, HTTPException, UploadFile, status
from pydantic import BaseModel, Field, field_validator

from ninebox.core.dependencies import get_session_manager
from ninebox.models.events import Event
from ninebox.services.excel_exporter import ExcelExporter
from ninebox.services.excel_parser import ExcelParser
from ninebox.services.session_manager import SessionManager
from ninebox.utils.paths import get_user_data_dir

router = APIRouter(prefix="/session", tags=["session"])

# Constant user ID for local-only app (no authentication)
LOCAL_USER_ID = "local-user"

# Maximum file upload size in bytes (default: 50MB, configurable via env var)
MAX_FILE_SIZE = int(os.getenv("MAX_UPLOAD_SIZE_MB", "50")) * 1024 * 1024


class UpdateNotesRequest(BaseModel):
    """Request model for updating change notes."""

    notes: str


class ToggleDonutModeRequest(BaseModel):
    """Request model for toggling donut mode."""

    enabled: bool


class ExportSessionRequest(BaseModel):
    """Request model for exporting session with validation."""

    mode: Literal["update_original", "save_new"] = "update_original"
    new_path: str | None = Field(
        None, max_length=500, description="Path to save file (max 500 chars)"
    )

    @field_validator("new_path")
    @classmethod
    def validate_excel_extension(cls, v: str | None) -> str | None:
        """Validate new_path has Excel extension if provided."""
        if v is None:
            return v
        if not v.lower().endswith((".xlsx", ".xls")):
            raise ValueError("new_path must be an Excel file (.xlsx or .xls)")
        return v

    @field_validator("mode")
    @classmethod
    def validate_mode(cls, v: str) -> str:
        """Validate mode is a valid option."""
        # Literal type handles this, but keep for clarity
        if v not in ("update_original", "save_new"):
            raise ValueError(f"Invalid mode: {v}. Must be 'update_original' or 'save_new'")
        return v


@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    original_file_path: str | None = Form(None),
    session_mgr: SessionManager = Depends(get_session_manager),
) -> dict:
    """Upload Excel file and create session.

    Args:
        file: The Excel file to upload
        original_file_path: Optional path to the original file on disk (for Electron app)
        session_mgr: Session manager dependency
    """
    # Validate file type
    if not file.filename or not file.filename.endswith((".xlsx", ".xls")):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be an Excel file (.xlsx or .xls)",
        )

    # Validate file size to prevent DOS attacks via memory exhaustion
    file.file.seek(0, 2)  # Seek to end of file
    file_size = file.file.tell()  # Get file size
    file.file.seek(0)  # Seek back to beginning

    if file_size > MAX_FILE_SIZE:
        max_size_mb = MAX_FILE_SIZE / (1024 * 1024)
        actual_size_mb = file_size / (1024 * 1024)
        raise HTTPException(
            status_code=status.HTTP_413_CONTENT_TOO_LARGE,
            detail=f"File size ({actual_size_mb:.1f}MB) exceeds maximum allowed size ({max_size_mb:.0f}MB)",
        )

    logger = logging.getLogger(__name__)

    # Generate session ID first (needed for unique filename)
    session_id = str(uuid.uuid4())

    # Save to PERMANENT location (not temp)
    uploads_dir = get_user_data_dir() / "uploads"
    uploads_dir.mkdir(parents=True, exist_ok=True)

    permanent_path = uploads_dir / f"{session_id}_{file.filename}"

    try:
        with permanent_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save file: {e!s}",
        ) from e

    # Parse Excel file
    parser = ExcelParser()
    try:
        result = parser.parse(str(permanent_path))
        employees = result.employees

        # Log parsing metadata
        logger.info(
            f"Parsed Excel file '{file.filename}': "
            f"sheet='{result.metadata.sheet_name}' (index {result.metadata.sheet_index}), "
            f"parsed={result.metadata.parsed_rows}/{result.metadata.total_rows}, "
            f"failed={result.metadata.failed_rows}"
        )

        if result.metadata.defaulted_fields:
            logger.info(f"Defaulted fields: {result.metadata.defaulted_fields}")

        if result.metadata.warnings:
            logger.warning(
                f"Parsing warnings ({len(result.metadata.warnings)}): {result.metadata.warnings[:3]}..."
            )

    except Exception as e:
        # Clean up permanent file on error
        permanent_path.unlink(missing_ok=True)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to parse Excel file: {e!s}",
        ) from e

    # Create session
    # Use original_file_path if provided (Electron app), otherwise use uploaded copy path
    actual_file_path = original_file_path if original_file_path else str(permanent_path)

    logger.info(
        f"Creating session for user_id={LOCAL_USER_ID}, employees={len(employees)}, "
        f"filename={file.filename}, original_path={original_file_path or 'None'}"
    )

    session_mgr.create_session(
        user_id=LOCAL_USER_ID,
        employees=employees,
        filename=file.filename,
        file_path=actual_file_path,
        sheet_name=result.metadata.sheet_name,
        sheet_index=result.metadata.sheet_index,
        job_function_config=result.metadata.job_function_config,
        session_id=session_id,
    )

    session = session_mgr.get_session(LOCAL_USER_ID)
    logger.info(
        f"Session created successfully: session_id={session_id}, active_sessions={list(session_mgr.sessions.keys())}"
    )

    return {
        "session_id": session_id,
        "employee_count": len(employees),
        "filename": file.filename,
        "uploaded_at": session.created_at.isoformat() if session else None,
    }


@router.get("/status")
async def get_session_status(
    session_mgr: SessionManager = Depends(get_session_manager),
) -> dict:
    """Get current session status.

    Returns session information if active, or a response with active=False if no session exists.
    This avoids 404 errors during normal operation (e.g., on app startup).
    """
    session = session_mgr.get_session(LOCAL_USER_ID)

    if not session:
        return {
            "active": False,
            "session_id": None,
            "employee_count": 0,
            "changes_count": 0,
            "events": [],
            "uploaded_filename": None,
            "created_at": None,
        }

    return {
        "session_id": session.session_id,
        "active": True,
        "employee_count": len(session.current_employees),
        "changes_count": len(session.events),  # Keep field name for API compatibility
        "events": [e.model_dump() for e in session.events],
        "uploaded_filename": session.original_filename,
        "created_at": session.created_at.isoformat(),
    }


@router.delete("/clear")
async def clear_session(
    session_mgr: SessionManager = Depends(get_session_manager),
) -> dict:
    """Clear current session."""

    session = session_mgr.get_session(LOCAL_USER_ID)

    if session:
        # Delete session first
        session_mgr.delete_session(LOCAL_USER_ID)

        # Clean up uploaded file from permanent location
        uploaded_file = Path(session.original_file_path)

        # Retry deletion with small delays (handles file locking on Windows)
        # File handles are now properly closed via try/finally blocks in parsers/exporters
        max_retries = 3
        for attempt in range(max_retries):
            try:
                uploaded_file.unlink(missing_ok=True)
                break
            except PermissionError:
                if attempt < max_retries - 1:
                    time.sleep(0.1)  # Wait 100ms before retry
                else:
                    # Log error but don't fail the request
                    logging.getLogger(__name__).warning(
                        f"Could not delete file {uploaded_file} after {max_retries} attempts"
                    )

    return {"success": True}


@router.post("/close")
async def close_session(
    session_mgr: SessionManager = Depends(get_session_manager),
) -> dict:
    """Close current session and clear state.

    This endpoint provides a clean way to close an active session without
    deleting the uploaded file (unlike /clear which removes all traces).

    Returns:
        dict: Success response with message, or error response

    Examples:
        Success response:
        {"success": True, "message": "Session closed"}

        Error response (no session):
        {"success": False, "error": "No active session to close"}
    """
    logger = logging.getLogger(__name__)

    try:
        session = session_mgr.get_session(LOCAL_USER_ID)

        if not session:
            return {"success": False, "error": "No active session to close"}

        # Delete session from manager
        session_mgr.delete_session(LOCAL_USER_ID)

        logger.info(f"Session closed successfully: session_id={session.session_id}")

        return {"success": True, "message": "Session closed"}

    except Exception as e:
        logger.error(f"Close session failed: {e}")
        return {"success": False, "error": str(e)}


@router.post("/export")
async def export_session(  # noqa: PLR0911, PLR0912  # Multiple returns/branches needed for error handling
    request: ExportSessionRequest = Body(
        default=ExportSessionRequest(mode="update_original", new_path=None)
    ),
    session_mgr: SessionManager = Depends(get_session_manager),
) -> dict:
    """
    Export current session data to Excel file.

    Args:
        request: Export request with mode and optional new_path
        session_mgr: Session manager dependency

    Returns:
        Success: {"success": True, "file_path": str, "message": str}
        Error: {"success": False, "error": str}

    Raises:
        HTTPException: If session not found or export fails

    Example:
        >>> # Update original file
        >>> request = ExportSessionRequest(mode="update_original")
        >>> response = await export_session(request)
        >>> # Save to new file
        >>> request = ExportSessionRequest(mode="save_new", new_path="/path/to/new.xlsx")
        >>> response = await export_session(request)
    """
    logger = logging.getLogger(__name__)
    session = session_mgr.get_session(LOCAL_USER_ID)

    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active session",
        )

    # Validate parameters
    if request.mode == "save_new" and not request.new_path:
        return {
            "success": False,
            "error": "new_path is required when mode='save_new'",
        }

    # Determine target path
    target_path: str
    if request.mode == "save_new":
        # Type checker knows new_path is not None here due to earlier check
        assert request.new_path is not None  # nosec B101  # Type narrowing after validation

        # Validate new_path for path traversal
        try:
            validated_path = Path(request.new_path).resolve()
            allowed_dirs = [Path.home().resolve(), get_user_data_dir().resolve()]
            if not any(validated_path.is_relative_to(d) for d in allowed_dirs):
                return {
                    "success": False,
                    "error": "Path must be within user home or application directory",
                }
            target_path = str(validated_path)
        except (ValueError, OSError) as e:
            return {"success": False, "error": f"Invalid path: {e}"}
    else:
        # Default to update_original mode
        target_path = session.original_file_path

    # Export to Excel
    exporter = ExcelExporter()
    try:
        exporter.export(
            original_file=session.original_file_path,
            employees=session.current_employees,
            output_path=target_path,
            sheet_index=session.sheet_index,
            session=session,
        )

        # Use original filename for update_original mode, or extract from path for save_new mode
        if request.mode == "save_new":
            filename = Path(target_path).name
        else:
            filename = session.original_filename

        # Reset session baseline after successful export
        # Current state becomes the new baseline with zero unsaved changes
        session.events = []
        session.donut_events = []
        # Deep copy current employees to make them the new baseline
        import copy

        session.original_employees = copy.deepcopy(session.current_employees)
        # Clear modified_in_session flags since changes are now saved
        for emp in session.current_employees:
            emp.modified_in_session = False

        logger.info(f"Session baseline reset after export to {filename}")

        # Return success response with file path and message
        return {
            "success": True,
            "file_path": target_path,
            "message": f"Changes applied to {filename}",
        }

    except FileNotFoundError as e:
        logger.warning(f"Original file not found: {e}")
        filename = Path(target_path).name
        return {
            "success": False,
            "error": f"Could not find {filename}. Please save to a new location.",
            "fallback_to_save_new": True,
        }

    except PermissionError as e:
        logger.warning(f"Permission denied: {e}")
        filename = Path(target_path).name
        return {
            "success": False,
            "error": f"Cannot write to {filename} (permission denied). Please save to a new location.",
            "fallback_to_save_new": True,
        }

    except OSError as e:
        logger.warning(f"File operation failed: {e}")
        filename = Path(target_path).name
        return {
            "success": False,
            "error": f"Cannot write to {filename} (file may be read-only or locked). Please save to a new location.",
            "fallback_to_save_new": True,
        }

    except Exception as e:
        logger.error(f"Unexpected export error: {e}")
        return {
            "success": False,
            "error": f"Export failed: {e!s}",
            "fallback_to_save_new": False,
        }


@router.patch("/changes/{employee_id}/notes")
async def update_change_notes(
    employee_id: int,
    request: UpdateNotesRequest,
    session_mgr: SessionManager = Depends(get_session_manager),
) -> Event:
    """Update notes for an employee's change entry."""
    try:
        updated_change = session_mgr.update_change_notes(
            user_id=LOCAL_USER_ID,
            employee_id=employee_id,
            notes=request.notes,
        )
        if updated_change is None:
            raise ValueError(f"No change entry found for employee {employee_id}")
        return updated_change
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e)) from e


@router.patch("/donut-changes/{employee_id}/notes")
async def update_donut_change_notes(
    employee_id: int,
    request: UpdateNotesRequest,
    session_mgr: SessionManager = Depends(get_session_manager),
) -> Event:
    """Update notes for an employee's donut change entry."""
    try:
        updated_change = session_mgr.update_donut_change_notes(
            user_id=LOCAL_USER_ID,
            employee_id=employee_id,
            notes=request.notes,
        )
        if updated_change is None:
            raise ValueError(f"No donut change entry found for employee {employee_id}")
        return updated_change
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e)) from e


@router.post("/toggle-donut-mode")
async def toggle_donut_mode(
    request: ToggleDonutModeRequest,
    session_mgr: SessionManager = Depends(get_session_manager),
) -> dict:
    """Toggle donut mode on or off for the current session.

    Donut mode is a separate exercise mode that allows exploring hypothetical
    employee placements without affecting the main grid positions.

    Args:
        request: ToggleDonutModeRequest containing enabled boolean

    Returns:
        dict: Response containing updated session state with donut_mode_active flag

    Raises:
        HTTPException: 404 if no active session exists
    """
    try:
        session = session_mgr.toggle_donut_mode(
            user_id=LOCAL_USER_ID,
            enabled=request.enabled,
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        ) from e

    return {
        "donut_mode_active": session.donut_mode_active,
        "session_id": session.session_id,
        "success": True,
    }
