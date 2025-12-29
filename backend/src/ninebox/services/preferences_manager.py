"""Preferences management service.

This module provides functionality for managing user preferences including
recent files list with persistence to disk.
"""

import json
import logging
import time
from pathlib import Path
from typing import Any

from ninebox.models.preferences import RecentFile
from ninebox.utils.paths import get_user_data_dir

logger = logging.getLogger(__name__)

MAX_RECENT_FILES = 5


class PreferencesManager:
    """Manages user preferences with persistence to disk.

    This class handles storing and retrieving user preferences such as
    recently accessed files. Preferences are stored in a JSON file.

    Attributes:
        config_path: Path to the preferences configuration file.

    Example:
        >>> from pathlib import Path
        >>> config_path = Path.home() / ".9boxer" / "config.json"
        >>> manager = PreferencesManager(config_path=config_path)
        >>> manager.add_recent_file("c:/data.xlsx", "data.xlsx")
        >>> recent = manager.get_recent_files()
        >>> len(recent)
        1
    """

    def __init__(self, config_path: Path | None = None) -> None:
        """Initialize the preferences manager.

        Args:
            config_path: Path to the configuration file. If not provided,
                defaults to ~/.9boxer/config.json.
        """
        if config_path is None:
            config_path = Path.home() / ".9boxer" / "config.json"

        self.config_path = config_path

        # Ensure the directory exists
        self.config_path.parent.mkdir(parents=True, exist_ok=True)

        # Initialize config file if it doesn't exist
        if not self.config_path.exists():
            self._save_config({"recent_files": []})

    def _validate_file_path(self, file_path: str) -> Path:
        """Validate file path is safe and within allowed directories.

        Args:
            file_path: Path to validate

        Returns:
            Resolved Path object if valid

        Raises:
            ValueError: If path is unsafe (traversal, reserved names, etc.)
        """
        path = Path(file_path).resolve()

        # Check for path traversal - must be within allowed directories
        allowed_dirs = [
            Path.home().resolve(),
            get_user_data_dir().resolve(),
        ]

        if not any(path.is_relative_to(d) for d in allowed_dirs):
            raise ValueError(
                f"Path {path} is outside allowed directories. "
                f"Files must be in user home or application data directory."
            )

        # Check for Windows reserved names
        reserved_names = {
            "CON",
            "PRN",
            "AUX",
            "NUL",
            "COM1",
            "COM2",
            "COM3",
            "COM4",
            "COM5",
            "COM6",
            "COM7",
            "COM8",
            "COM9",
            "LPT1",
            "LPT2",
            "LPT3",
            "LPT4",
            "LPT5",
            "LPT6",
            "LPT7",
            "LPT8",
            "LPT9",
        }
        if path.name.upper().split(".")[0] in reserved_names:
            raise ValueError(f"Invalid filename: {path.name} (reserved name)")

        return path

    def add_recent_file(self, path: str, name: str) -> None:
        """Add a file to the recent files list.

        If the file already exists in the list, its timestamp is updated and it's
        moved to the top. The list maintains a maximum of 5 files, removing the
        oldest when the limit is reached.

        Args:
            path: Full file system path to the file.
            name: Display name of the file (typically the filename).

        Raises:
            ValueError: If path is unsafe (path traversal or reserved name).

        Example:
            >>> manager = PreferencesManager()
            >>> manager.add_recent_file("c:/Projects/data.xlsx", "data.xlsx")
            >>> recent = manager.get_recent_files()
            >>> recent[0].name
            'data.xlsx'
        """
        # Validate path before adding
        validated_path = self._validate_file_path(path)

        config = self._load_config()
        recent_files_data = config.get("recent_files", [])

        # Parse existing recent files
        recent_files = [RecentFile(**file_data) for file_data in recent_files_data]

        # Use string representation of validated path
        validated_path_str = str(validated_path)

        # Remove existing entry if present
        recent_files = [f for f in recent_files if f.path != validated_path_str]

        # Add new entry at the beginning with current timestamp
        current_timestamp = int(time.time_ns() // 1_000_000)
        new_file = RecentFile(path=validated_path_str, name=name, last_accessed=current_timestamp)
        recent_files.insert(0, new_file)

        # Keep only the most recent MAX_RECENT_FILES files
        recent_files = recent_files[:MAX_RECENT_FILES]

        # Save back to disk
        config["recent_files"] = [f.model_dump() for f in recent_files]
        self._save_config(config)

        logger.info(f"Added recent file: {name} ({validated_path_str})")

    def get_recent_files(self) -> list[RecentFile]:
        """Get the list of recent files.

        Returns a list of recent files sorted by last accessed timestamp
        in descending order (most recent first).

        Returns:
            List of RecentFile objects sorted by last accessed time.

        Example:
            >>> manager = PreferencesManager()
            >>> manager.add_recent_file("c:/file1.xlsx", "file1.xlsx")
            >>> manager.add_recent_file("c:/file2.xlsx", "file2.xlsx")
            >>> recent = manager.get_recent_files()
            >>> len(recent)
            2
            >>> recent[0].name
            'file2.xlsx'
        """
        config = self._load_config()
        recent_files_data = config.get("recent_files", [])

        try:
            recent_files = [RecentFile(**file_data) for file_data in recent_files_data]
            # Sort by last_accessed in descending order (most recent first)
            recent_files.sort(key=lambda f: f.last_accessed, reverse=True)
            return recent_files
        except Exception as e:
            logger.warning(f"Failed to parse recent files: {e}")
            return []

    def clear_recent_files(self) -> None:
        """Clear all recent files.

        Removes all entries from the recent files list.

        Example:
            >>> manager = PreferencesManager()
            >>> manager.add_recent_file("c:/file1.xlsx", "file1.xlsx")
            >>> manager.clear_recent_files()
            >>> recent = manager.get_recent_files()
            >>> len(recent)
            0
        """
        config = self._load_config()
        config["recent_files"] = []
        self._save_config(config)
        logger.info("Cleared all recent files")

    def _load_config(self) -> dict[str, Any]:
        """Load configuration from disk.

        Returns:
            Configuration dictionary. If the file is corrupted or cannot be read,
            returns a default configuration with an empty recent files list.
        """
        try:
            with self.config_path.open(encoding="utf-8") as f:
                config: dict[str, Any] = json.load(f)
                return config
        except (json.JSONDecodeError, FileNotFoundError) as e:
            logger.warning(f"Failed to load config from {self.config_path}: {e}")
            # Return default config and save it
            default_config: dict[str, Any] = {"recent_files": []}
            self._save_config(default_config)
            return default_config

    def _save_config(self, config: dict[str, Any]) -> None:
        """Save configuration to disk.

        Args:
            config: Configuration dictionary to save.
        """
        try:
            with self.config_path.open("w", encoding="utf-8") as f:
                json.dump(config, f, indent=2, ensure_ascii=False)
        except Exception as e:
            logger.error(f"Failed to save config to {self.config_path}: {e}")
            raise
