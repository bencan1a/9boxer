"""Service for tracking and querying update analytics."""

import logging
import sqlite3
from datetime import datetime, timedelta
from pathlib import Path

from ninebox.core.database import get_db_path
from ninebox.models.update_analytics import (
    UpdateAnalyticsSummary,
    UpdateEvent,
    UpdateEventRecord,
)

logger = logging.getLogger(__name__)


class UpdateAnalyticsService:
    """Service for managing update analytics."""

    def __init__(self, db_path: Path | None = None):
        """Initialize service with database path."""
        self.db_path = db_path or get_db_path()
        self._init_database()

    def _init_database(self) -> None:
        """Create update_events table if it doesn't exist."""
        conn = sqlite3.connect(self.db_path)
        try:
            cursor = conn.cursor()
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS update_events (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    event_type TEXT NOT NULL,
                    from_version TEXT NOT NULL,
                    to_version TEXT,
                    platform TEXT NOT NULL,
                    arch TEXT NOT NULL,
                    error_message TEXT,
                    bytes_downloaded INTEGER,
                    total_bytes INTEGER,
                    percent_complete REAL,
                    timestamp TEXT NOT NULL,
                    session_id TEXT
                )
            """)

            # Create indexes for common queries
            cursor.execute("""
                CREATE INDEX IF NOT EXISTS idx_update_events_type
                ON update_events(event_type)
            """)
            cursor.execute("""
                CREATE INDEX IF NOT EXISTS idx_update_events_timestamp
                ON update_events(timestamp)
            """)
            cursor.execute("""
                CREATE INDEX IF NOT EXISTS idx_update_events_version
                ON update_events(from_version, to_version)
            """)

            conn.commit()
            logger.info("Update analytics database initialized")
        except Exception as e:
            logger.error(f"Failed to initialize update analytics database: {e}")
            raise
        finally:
            conn.close()

    def record_event(self, event: UpdateEvent, session_id: str | None = None) -> int:
        """
        Record an update event.

        Args:
            event: Update event to record
            session_id: Optional session ID from user preferences

        Returns:
            ID of inserted record
        """
        conn = sqlite3.connect(self.db_path)
        try:
            cursor = conn.cursor()
            cursor.execute(
                """
                INSERT INTO update_events (
                    event_type, from_version, to_version, platform, arch,
                    error_message, bytes_downloaded, total_bytes,
                    percent_complete, timestamp, session_id
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
                (
                    event.event_type,
                    event.from_version,
                    event.to_version,
                    event.platform,
                    event.arch,
                    event.error_message,
                    event.bytes_downloaded,
                    event.total_bytes,
                    event.percent_complete,
                    event.timestamp.isoformat(),
                    session_id,
                ),
            )
            conn.commit()
            event_id = cursor.lastrowid
            if event_id is None:
                raise RuntimeError("Failed to get inserted record ID")
            logger.info(
                f"Recorded update event: {event.event_type} "
                f"({event.from_version} -> {event.to_version})"
            )
            return event_id
        except Exception as e:
            logger.error(f"Failed to record update event: {e}")
            raise
        finally:
            conn.close()

    def get_summary(self, days: int = 30) -> UpdateAnalyticsSummary:
        """
        Get summary statistics for update analytics.

        Args:
            days: Number of days to include in summary

        Returns:
            Summary statistics
        """
        conn = sqlite3.connect(self.db_path)
        try:
            cursor = conn.cursor()
            cutoff_date = (datetime.utcnow() - timedelta(days=days)).isoformat()

            # Count events by type
            cursor.execute(
                """
                SELECT event_type, COUNT(*)
                FROM update_events
                WHERE timestamp >= ?
                GROUP BY event_type
            """,
                (cutoff_date,),
            )
            event_counts = dict(cursor.fetchall())

            total_checks = event_counts.get("check", 0)
            total_downloads = event_counts.get("download_complete", 0)
            total_installs = event_counts.get("install", 0)
            total_errors = event_counts.get("error", 0)

            # Calculate success rate
            success_rate = total_installs / total_downloads if total_downloads > 0 else 0.0

            # Most common error
            cursor.execute(
                """
                SELECT error_message, COUNT(*) as count
                FROM update_events
                WHERE event_type = 'error'
                  AND timestamp >= ?
                  AND error_message IS NOT NULL
                GROUP BY error_message
                ORDER BY count DESC
                LIMIT 1
            """,
                (cutoff_date,),
            )
            result = cursor.fetchone()
            most_common_error = result[0] if result else None

            # Version distribution
            cursor.execute(
                """
                SELECT to_version, COUNT(*)
                FROM update_events
                WHERE timestamp >= ?
                  AND to_version IS NOT NULL
                GROUP BY to_version
            """,
                (cutoff_date,),
            )
            version_distribution = dict(cursor.fetchall())

            # Platform distribution
            cursor.execute(
                """
                SELECT platform, COUNT(*)
                FROM update_events
                WHERE timestamp >= ?
                GROUP BY platform
            """,
                (cutoff_date,),
            )
            platform_distribution = dict(cursor.fetchall())

            return UpdateAnalyticsSummary(
                total_checks=total_checks,
                total_downloads=total_downloads,
                total_installs=total_installs,
                total_errors=total_errors,
                success_rate=success_rate,
                most_common_error=most_common_error,
                version_distribution=version_distribution,
                platform_distribution=platform_distribution,
            )
        finally:
            conn.close()

    def get_events(
        self, event_type: str | None = None, limit: int = 100
    ) -> list[UpdateEventRecord]:
        """
        Query update events.

        Args:
            event_type: Filter by event type (optional)
            limit: Maximum number of events to return

        Returns:
            List of update events
        """
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        try:
            cursor = conn.cursor()

            if event_type:
                cursor.execute(
                    """
                    SELECT * FROM update_events
                    WHERE event_type = ?
                    ORDER BY timestamp DESC
                    LIMIT ?
                """,
                    (event_type, limit),
                )
            else:
                cursor.execute(
                    """
                    SELECT * FROM update_events
                    ORDER BY timestamp DESC
                    LIMIT ?
                """,
                    (limit,),
                )

            rows = cursor.fetchall()
            return [
                UpdateEventRecord(
                    id=row["id"],
                    event_type=row["event_type"],
                    from_version=row["from_version"],
                    to_version=row["to_version"],
                    platform=row["platform"],
                    arch=row["arch"],
                    error_message=row["error_message"],
                    bytes_downloaded=row["bytes_downloaded"],
                    total_bytes=row["total_bytes"],
                    percent_complete=row["percent_complete"],
                    timestamp=datetime.fromisoformat(row["timestamp"]),
                    session_id=row["session_id"],
                )
                for row in rows
            ]
        finally:
            conn.close()
