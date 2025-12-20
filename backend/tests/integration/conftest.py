"""Integration test-specific fixtures."""

import sqlite3
from collections.abc import Generator
from contextlib import contextmanager
from unittest.mock import patch

import pytest


@pytest.fixture(scope="session")
def db_connection(test_db_path: str) -> Generator[sqlite3.Connection, None, None]:
    """Session-scoped database connection for transaction-based test isolation.

    This connection is shared across all integration tests in the session, but each test
    runs in its own transaction that is rolled back after completion.

    Note: check_same_thread=False is safe here because:
    - SQLite has internal locking to handle concurrent access
    - We use transactions to ensure isolation
    - Tests run sequentially within each worker (pytest-xdist isolation)
    """
    from ninebox.utils.paths import get_resource_path  # noqa: PLC0415

    # Create a persistent connection for the entire test session
    # check_same_thread=False allows TestClient (which uses threads) to use this connection
    conn = sqlite3.connect(test_db_path, check_same_thread=False)
    conn.row_factory = sqlite3.Row  # Enable dict-like row access
    conn.isolation_level = None  # Enable manual transaction control

    # Initialize schema directly on this connection
    schema_path = get_resource_path("src/ninebox/models/schema.sql")
    with schema_path.open("r", encoding="utf-8") as f:
        schema_sql = f.read()
    conn.executescript(schema_sql)
    conn.commit()

    yield conn

    # Cleanup
    conn.close()


@pytest.fixture(autouse=True)
def db_transaction(db_connection: sqlite3.Connection) -> Generator[None, None, None]:
    """Function-scoped transaction that rolls back after each test.

    This ensures test isolation by:
    1. Beginning a transaction before each test
    2. Allowing the test to run (which may modify database)
    3. Rolling back the transaction after test completes

    This is much faster than deleting rows and provides perfect isolation.
    """
    # Patch DatabaseManager to use the shared transactional connection
    from contextlib import contextmanager  # noqa: PLC0415
    from unittest.mock import patch  # noqa: PLC0415

    @contextmanager
    def mock_get_connection(self: object) -> Generator[sqlite3.Connection, None, None]:
        """Return the shared transactional connection instead of creating a new one."""
        yield db_connection
        # Don't commit or close - the transaction fixture handles rollback

    # Begin transaction for this test
    db_connection.execute("BEGIN")

    # Patch DatabaseManager.get_connection to use the transactional connection
    with patch("ninebox.services.database.DatabaseManager.get_connection", mock_get_connection):
        yield

    # Rollback transaction to undo all changes from this test
    db_connection.rollback()
