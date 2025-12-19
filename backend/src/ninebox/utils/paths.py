"""Path utilities for resource and data file handling."""

import os
import sys
from pathlib import Path


def get_resource_path(relative_path: str) -> Path:
    """
    Get absolute path to resource, works for dev and PyInstaller bundle.

    In frozen mode (PyInstaller), uses sys._MEIPASS.
    In dev mode, uses project root.

    Args:
        relative_path: Path relative to project root (e.g., 'data/file.txt')

    Returns:
        Absolute path to resource
    """
    if getattr(sys, "frozen", False):
        # Running in PyInstaller bundle
        base_path = Path(sys._MEIPASS)  # type: ignore[attr-defined]
    else:
        # Running in normal Python
        # Go up from: ninebox/utils/paths.py -> ninebox/utils -> ninebox -> src -> backend
        base_path = Path(__file__).parent.parent.parent.parent
    return base_path / relative_path


def get_user_data_dir() -> Path:
    """
    Get platform-specific user data directory.

    Checks APP_DATA_DIR env var (set by Electron), otherwise ~/.ninebox
    Creates directory if it doesn't exist.

    Returns:
        Path to user data directory
    """
    app_data_dir = os.getenv("APP_DATA_DIR")
    data_dir = Path(app_data_dir) if app_data_dir else Path.home() / ".ninebox"

    data_dir.mkdir(parents=True, exist_ok=True)
    return data_dir
