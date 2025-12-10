"""Session data models."""

from datetime import datetime
from typing import ClassVar

from pydantic import BaseModel

from ninebox.models.employee import Employee, PerformanceLevel, PotentialLevel


class EmployeeMove(BaseModel):
    """Track a single employee move."""

    employee_id: int
    employee_name: str
    timestamp: datetime
    old_performance: PerformanceLevel
    old_potential: PotentialLevel
    new_performance: PerformanceLevel
    new_potential: PotentialLevel
    old_position: int
    new_position: int


class SessionState(BaseModel):
    """In-memory session state."""

    session_id: str
    user_id: str
    created_at: datetime

    # Original uploaded data
    original_employees: list[Employee]
    original_filename: str
    original_file_path: str

    # Current state (with modifications)
    current_employees: list[Employee]

    # Change tracking
    changes: list[EmployeeMove] = []

    class Config:
        """Pydantic config."""

        json_encoders: ClassVar = {
            datetime: lambda v: v.isoformat(),
        }
