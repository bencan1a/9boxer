"""Database connection and initialization."""

import sqlite3
from pathlib import Path
from typing import Optional

from ninebox.core.config import settings
from ninebox.core.security import get_password_hash


def get_db_path() -> Path:
    """Get absolute path to database file."""
    # Get the path relative to this file
    current_file = Path(__file__).resolve()
    backend_dir = current_file.parent.parent.parent.parent
    db_path = backend_dir / "data" / "ninebox.db"
    db_path.parent.mkdir(parents=True, exist_ok=True)
    return db_path


def get_connection() -> sqlite3.Connection:
    """Get database connection."""
    db_path = get_db_path()
    conn = sqlite3.connect(str(db_path))
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    """Initialize database with schema."""
    conn = get_connection()
    cursor = conn.cursor()

    # Create users table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            user_id TEXT PRIMARY KEY,
            username TEXT UNIQUE NOT NULL,
            hashed_password TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    conn.commit()
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
