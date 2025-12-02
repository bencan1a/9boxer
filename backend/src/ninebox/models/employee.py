"""Employee data models."""

from datetime import date, datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel


class PerformanceLevel(str, Enum):
    """Performance level enumeration."""

    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"


class PotentialLevel(str, Enum):
    """Potential level enumeration."""

    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"


class HistoricalRating(BaseModel):
    """Historical performance rating."""

    year: int
    rating: str  # "Strong", "Solid", "Leading", etc.


class Employee(BaseModel):
    """Employee model matching Excel schema."""

    # Identifiers
    employee_id: int
    name: str

    # Job Information
    business_title: str
    job_title: str
    job_profile: str
    job_level: str  # MT1, MT2, MT4, MT5, MT6

    # Management
    manager: str
    management_chain_04: Optional[str] = None
    management_chain_05: Optional[str] = None
    management_chain_06: Optional[str] = None

    # Tenure
    hire_date: date
    tenure_category: str
    time_in_job_profile: str

    # Current Performance (editable via drag-drop)
    performance: PerformanceLevel
    potential: PotentialLevel
    grid_position: int  # 1-9
    position_label: str  # "Top Talent [H,H]", etc.
    talent_indicator: str

    # Historical Performance
    ratings_history: list[HistoricalRating] = []

    # Development
    development_focus: Optional[str] = None
    development_action: Optional[str] = None
    notes: Optional[str] = None
    promotion_status: Optional[str] = None

    # Metadata
    modified_in_session: bool = False
    last_modified: Optional[datetime] = None

    class Config:
        """Pydantic config."""

        json_encoders = {
            date: lambda v: v.isoformat(),
            datetime: lambda v: v.isoformat() if v else None,
        }
