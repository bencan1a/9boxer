"""Session management API endpoints."""

import gc
import logging
import shutil
import time
import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from fastapi.responses import FileResponse
from pydantic import BaseModel

from ninebox.core.dependencies import get_session_manager
from ninebox.models.events import Event
from ninebox.services.excel_exporter import ExcelExporter
from ninebox.services.excel_parser import ExcelParser
from ninebox.services.session_manager import SessionManager
from ninebox.utils.paths import get_user_data_dir

router = APIRouter(prefix="/session", tags=["session"])

# Constant user ID for local-only app (no authentication)
LOCAL_USER_ID = "local-user"


class UpdateNotesRequest(BaseModel):
    """Request model for updating change notes."""

    notes: str


class ToggleDonutModeRequest(BaseModel):
    """Request model for toggling donut mode."""

    enabled: bool


@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    session_mgr: SessionManager = Depends(get_session_manager),
) -> dict:
    """Upload Excel file and create session."""
    # Validate file type
    if not file.filename or not file.filename.endswith((".xlsx", ".xls")):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be an Excel file (.xlsx or .xls)",
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
    logger.info(
        f"Creating session for user_id={LOCAL_USER_ID}, employees={len(employees)}, filename={file.filename}"
    )

    session_mgr.create_session(
        user_id=LOCAL_USER_ID,
        employees=employees,
        filename=file.filename,
        file_path=str(permanent_path),
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

        # Force garbage collection to release file handles (important on Windows)
        gc.collect()

        # Clean up uploaded file from permanent location
        uploaded_file = Path(session.original_file_path)

        # Retry deletion with small delays (handles file locking on Windows)
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


@router.post("/export")
async def export_session(
    session_mgr: SessionManager = Depends(get_session_manager),
) -> FileResponse:
    """Export current session data to Excel."""
    session = session_mgr.get_session(LOCAL_USER_ID)

    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active session",
        )

    # Create output path
    output_dir = get_user_data_dir() / "temp"
    output_dir.mkdir(parents=True, exist_ok=True)

    output_filename = f"modified_{session.original_filename}"
    output_path = output_dir / output_filename

    # Export to Excel
    exporter = ExcelExporter()
    try:
        exporter.export(
            original_file=session.original_file_path,
            employees=session.current_employees,
            output_path=str(output_path),
            sheet_index=session.sheet_index,
            session=session,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to export Excel file: {e!s}",
        ) from e

    # Return file
    return FileResponse(
        path=str(output_path),
        filename=output_filename,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    )


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
