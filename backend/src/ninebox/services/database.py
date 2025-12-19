"""Database connection and schema management for session persistence."""

import logging
import sqlite3
from collections.abc import Generator
from contextlib import contextmanager

from ninebox.utils.paths import get_resource_path, get_user_data_dir

logger = logging.getLogger(__name__)


class DatabaseManager:
    """Manages SQLite database connections and schema initialization.

    This class provides:
    - Connection pooling via context manager
    - Automatic schema initialization on first run
    - Transaction management (auto-commit on success, rollback on error)
    - Database stored in user data directory

    Example:
        >>> db_manager = DatabaseManager()
        >>> with db_manager.get_connection() as conn:
        ...     cursor = conn.execute("SELECT * FROM sessions")
        ...     rows = cursor.fetchall()
    """

    def __init__(self) -> None:
        """Initialize database manager and ensure schema exists.

        Creates database file in user data directory if it doesn't exist.
        Runs schema initialization (idempotent - safe to run multiple times).
        """
        self.db_path = get_user_data_dir() / "ninebox.db"
        logger.info(f"Initializing database at: {self.db_path}")
        self._ensure_schema()

    @contextmanager
    def get_connection(self) -> Generator[sqlite3.Connection, None, None]:
        """Context manager for database connections.

        Provides a database connection with automatic transaction management:
        - Commits on successful completion
        - Rolls back on exception
        - Always closes connection

        Yields:
            sqlite3.Connection: Database connection with row_factory set to sqlite3.Row

        Example:
            >>> with db_manager.get_connection() as conn:
            ...     conn.execute("INSERT INTO sessions VALUES (?)", (data,))
            ...     # Auto-commits here if no exception
        """
        conn = sqlite3.connect(str(self.db_path))
        conn.row_factory = sqlite3.Row  # Enable dict-like row access
        try:
            yield conn
            conn.commit()
            logger.debug("Database transaction committed")
        except Exception as e:
            conn.rollback()
            logger.error(f"Database transaction rolled back due to error: {e}")
            raise
        finally:
            conn.close()

    def _ensure_schema(self) -> None:
        """Ensure database schema exists by executing schema.sql.

        This method is idempotent - safe to run multiple times.
        Uses CREATE TABLE IF NOT EXISTS, so existing tables are not affected.

        Raises:
            FileNotFoundError: If schema.sql cannot be found
            sqlite3.Error: If schema execution fails
        """
        schema_path = get_resource_path("src/ninebox/models/schema.sql")

        if not schema_path.exists():
            raise FileNotFoundError(f"Database schema file not found: {schema_path}")

        logger.info(f"Loading database schema from: {schema_path}")

        with schema_path.open("r", encoding="utf-8") as f:
            schema_sql = f.read()

        try:
            with self.get_connection() as conn:
                conn.executescript(schema_sql)
            logger.info("Database schema initialized successfully")
        except sqlite3.Error as e:
            logger.error(f"Failed to initialize database schema: {e}")
            raise


# Global database manager instance
# Initialized once when module is imported
db_manager = DatabaseManager()
