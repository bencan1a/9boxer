"""Session data models."""

from datetime import datetime

from pydantic import BaseModel, ConfigDict

from ninebox.models.employee import Employee
from ninebox.models.events import Event
from ninebox.services.excel_parser import JobFunctionConfig


class SessionState(BaseModel):
    """In-memory session state."""

    session_id: str
    user_id: str
    created_at: datetime

    # Original uploaded data
    original_employees: list[Employee]
    original_filename: str
    original_file_path: str

    # Excel sheet information (for robust export)
    sheet_name: str
    sheet_index: int

    # Job function configuration (auto-detected from data)
    job_function_config: JobFunctionConfig | None = None

    # Current state (with modifications)
    current_employees: list[Employee]

    # Event tracking (unified for all property changes)
    events: list[Event] = []

    # Donut Mode state
    donut_events: list[Event] = []
    donut_mode_active: bool = False

    model_config = ConfigDict(
        # Pydantic V2 automatically serializes datetime to ISO format
        # No need for custom json_encoders
    )
