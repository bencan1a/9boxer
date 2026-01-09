"""Models for update analytics tracking."""

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field

UpdateEventType = Literal[
    "check",
    "available",
    "download_start",
    "download_progress",
    "download_complete",
    "install",
    "error",
]


class UpdateEvent(BaseModel):
    """Update analytics event from Electron client."""

    event_type: UpdateEventType = Field(..., description="Type of update event")
    from_version: str = Field(..., description="Current app version")
    to_version: str | None = Field(None, description="Target version (if available)")
    platform: str = Field(..., description="OS platform (win32, darwin, linux)")
    arch: str = Field(..., description="CPU architecture (x64, arm64)")
    error_message: str | None = Field(None, description="Error message if event_type=error")
    bytes_downloaded: int | None = Field(None, description="Bytes downloaded (progress events)")
    total_bytes: int | None = Field(None, description="Total bytes to download")
    percent_complete: float | None = Field(None, description="Download percent complete")
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class UpdateEventRecord(UpdateEvent):
    """Update event with database ID."""

    id: int
    session_id: str | None = Field(None, description="Session ID from preferences")


class UpdateAnalyticsSummary(BaseModel):
    """Summary statistics for update analytics."""

    total_checks: int
    total_downloads: int
    total_installs: int
    total_errors: int
    success_rate: float  # installs / downloads
    most_common_error: str | None
    version_distribution: dict[str, int]  # version -> count
    platform_distribution: dict[str, int]  # platform -> count
