"""Database connection and initialization."""

from pathlib import Path

from ninebox.utils.paths import get_user_data_dir


def get_db_path() -> Path:
    """Get absolute path to database file."""
    # Use user data directory for database storage
    # This ensures the database is stored in a user-writable location
    # and works correctly in both dev and PyInstaller bundle mode
    db_path = get_user_data_dir() / "ninebox.db"
    return db_path
