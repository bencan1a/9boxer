"""Employee data models."""

from datetime import date, datetime
from enum import Enum

from pydantic import BaseModel, ConfigDict, field_validator

from ninebox.models.constants import ALLOWED_FLAGS


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
    job_function: str  # Extracted from job_profile
    location: str  # Last 3 characters of job_profile (country code)

    # Management
    manager: str
    management_chain_01: str | None = None
    management_chain_02: str | None = None
    management_chain_03: str | None = None
    management_chain_04: str | None = None
    management_chain_05: str | None = None
    management_chain_06: str | None = None

    # Tenure
    hire_date: date
    tenure_category: str
    time_in_job_profile: str

    # Current Performance (editable via drag-drop)
    performance: PerformanceLevel
    potential: PotentialLevel
    grid_position: int  # 1-9
    talent_indicator: str

    # Historical Performance
    ratings_history: list[HistoricalRating] = []

    # Development
    development_focus: str | None = None
    development_action: str | None = None
    notes: str | None = None
    promotion_status: str | None = None
    promotion_readiness: bool | None = None

    # Flags (predefined tags for filtering and categorization)
    flags: list[str] | None = None

    # Metadata
    modified_in_session: bool = False
    last_modified: datetime | None = None
    original_grid_position: int | None = None  # Position at session start (for tracking moves)

    # Donut Mode fields (temporary alternative placements)
    donut_performance: PerformanceLevel | None = None
    donut_potential: PotentialLevel | None = None
    donut_position: int | None = None
    donut_modified: bool = False
    donut_last_modified: datetime | None = None
    donut_notes: str | None = None

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

        invalid_flags = [flag for flag in v if flag not in ALLOWED_FLAGS]
        if invalid_flags:
            raise ValueError(
                f"Invalid flags: {', '.join(invalid_flags)}. Allowed flags: {', '.join(sorted(ALLOWED_FLAGS))}"
            )

        return v

    model_config = ConfigDict(
        # Pydantic V2 automatically serializes datetime/date to ISO format
        # No need for custom json_encoders
    )
