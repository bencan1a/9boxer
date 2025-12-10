"""Database connection and initialization."""

import sqlite3
from pathlib import Path
from typing import Optional

from ninebox.core.security import get_password_hash
from ninebox.utils.paths import get_user_data_dir


def get_db_path() -> Path:
    """Get absolute path to database file."""
    # Use user data directory for database storage
    # This ensures the database is stored in a user-writable location
    # and works correctly in both dev and PyInstaller bundle mode
    db_path = get_user_data_dir() / "ninebox.db"
    return db_path


def get_connection() -> sqlite3.Connection:
    """Get database connection."""
    db_path = get_db_path()
    conn = sqlite3.connect(str(db_path))
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    """Initialize database with schema and default data.

    Creates database file if it doesn't exist, creates all necessary tables,
    and inserts default admin user if database is empty. This function is
    idempotent and safe to call multiple times.

    Default Admin User:
        - username: bencan
        - password: password (bcrypt hashed)
    """
    # Ensure data directory exists
    data_dir = get_user_data_dir()
    data_dir.mkdir(parents=True, exist_ok=True)

    conn = get_connection()
    cursor = conn.cursor()

    try:
        # Create users table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                user_id TEXT PRIMARY KEY,
                username TEXT UNIQUE NOT NULL,
                hashed_password TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # Check if users table is empty
        cursor.execute("SELECT COUNT(*) as count FROM users")
        row = cursor.fetchone()
        user_count = row["count"] if row else 0

        # Create default admin user if database is empty
        if user_count == 0:
            import uuid

            default_user_id = str(uuid.uuid4())
            default_username = "bencan"
            default_password = "password"
            hashed_password = get_password_hash(default_password)

            cursor.execute(
                "INSERT INTO users (user_id, username, hashed_password) VALUES (?, ?, ?)",
                (default_user_id, default_username, hashed_password),
            )

        conn.commit()
    finally:
        conn.close()


def create_user(username: str, password: str) -> str:
    """Create a new user."""
    import uuid

    user_id = str(uuid.uuid4())
    hashed_password = get_password_hash(password)

    conn = get_connection()
    cursor = conn.cursor()

    try:
        cursor.execute(
            "INSERT INTO users (user_id, username, hashed_password) VALUES (?, ?, ?)",
            (user_id, username, hashed_password),
        )
        conn.commit()
        return user_id
    except sqlite3.IntegrityError:
        raise ValueError(f"User '{username}' already exists")
    finally:
        conn.close()


def get_user_by_username(username: str) -> Optional[dict]:
    """Get user by username."""
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM users WHERE username = ?", (username,))
    row = cursor.fetchone()
    conn.close()

    if row:
        return {
            "user_id": row["user_id"],
            "username": row["username"],
            "hashed_password": row["hashed_password"],
            "created_at": row["created_at"],
        }
    return None


def get_user_by_id(user_id: str) -> Optional[dict]:
    """Get user by ID."""
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM users WHERE user_id = ?", (user_id,))
    row = cursor.fetchone()
    conn.close()

    if row:
        return {
            "user_id": row["user_id"],
            "username": row["username"],
            "hashed_password": row["hashed_password"],
            "created_at": row["created_at"],
        }
    return None
