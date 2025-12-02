"""Session management API endpoints."""

import shutil
from pathlib import Path
from tempfile import NamedTemporaryFile

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from fastapi.responses import FileResponse

from ninebox.api.auth import get_current_user_id
from ninebox.services.excel_exporter import ExcelExporter
from ninebox.services.excel_parser import ExcelParser
from ninebox.services.session_manager import session_manager

router = APIRouter(prefix="/session", tags=["session"])


@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...), user_id: str = Depends(get_current_user_id)
) -> dict:
    """Upload Excel file and create session."""
    # Validate file type
    if not file.filename or not file.filename.endswith((".xlsx", ".xls")):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be an Excel file (.xlsx or .xls)",
        )

    # Save uploaded file temporarily
    temp_dir = Path("data/temp")
    temp_dir.mkdir(parents=True, exist_ok=True)

    temp_file_path = temp_dir / f"{user_id}_{file.filename}"

    try:
        with temp_file_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save file: {str(e)}",
        )

    # Parse Excel file
    parser = ExcelParser()
    try:
        employees = parser.parse(str(temp_file_path))
    except Exception as e:
        # Clean up temp file on error
        temp_file_path.unlink(missing_ok=True)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to parse Excel file: {str(e)}",
        )

    # Create session
    session_id = session_manager.create_session(
        user_id=user_id,
        employees=employees,
        filename=file.filename,
        file_path=str(temp_file_path),
    )

    return {
        "session_id": session_id,
        "employee_count": len(employees),
        "filename": file.filename,
        "uploaded_at": session_manager.get_session(user_id).created_at.isoformat()
        if session_manager.get_session(user_id)
        else None,
    }


@router.get("/status")
async def get_session_status(user_id: str = Depends(get_current_user_id)) -> dict:
    """Get current session status."""
    session = session_manager.get_session(user_id)

    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active session",
        )

    return {
        "session_id": session.session_id,
        "active": True,
        "employee_count": len(session.current_employees),
        "changes_count": len(session.changes),
        "uploaded_filename": session.original_filename,
        "created_at": session.created_at.isoformat(),
    }


@router.delete("/clear")
async def clear_session(user_id: str = Depends(get_current_user_id)) -> dict:
    """Clear current session."""
    session = session_manager.get_session(user_id)

    if session:
        # Clean up temp file
        temp_file = Path(session.original_file_path)
        temp_file.unlink(missing_ok=True)

        # Delete session
        session_manager.delete_session(user_id)

    return {"success": True}


@router.post("/export")
async def export_session(user_id: str = Depends(get_current_user_id)) -> FileResponse:
    """Export current session data to Excel."""
    session = session_manager.get_session(user_id)

    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active session",
        )

    # Create output path
    output_dir = Path("data/temp")
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
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to export Excel file: {str(e)}",
        )

    # Return file
    return FileResponse(
        path=str(output_path),
        filename=output_filename,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    )
