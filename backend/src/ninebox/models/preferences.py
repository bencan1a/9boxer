"""Preferences data models.

This module defines data models for user preferences including recent files.
"""

from pydantic import BaseModel, ConfigDict, Field


class RecentFile(BaseModel):
    """Represents a recently accessed file.

    Attributes:
        path: Full file system path to the file.
        name: Display name of the file (typically the filename).
        last_accessed: Unix timestamp in milliseconds when the file was last accessed.

    Example:
        >>> recent_file = RecentFile(
        ...     path="c:/Projects/data.xlsx",
        ...     name="data.xlsx",
        ...     last_accessed=1703123456789
        ... )
        >>> recent_file.path
        'c:/Projects/data.xlsx'
    """

    model_config = ConfigDict(populate_by_name=True)

    path: str
    name: str
    last_accessed: int = Field(
        ..., serialization_alias="lastAccessed"
    )  # Unix timestamp in milliseconds
