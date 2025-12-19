# Session Persistence Implementation Plan

status: active
owner: Claude
created: 2025-12-18
summary:
  - Add SQLite-based session persistence to survive backend restarts
  - Auto-restore sessions on backend startup
  - Ensure frontend-backend session state synchronization

## Problem Statement

Currently, sessions are stored in-memory only in `SessionManager`. When the backend process restarts or crashes:
- All session state is lost (employees, changes, metadata)
- Users see "No session found" errors
- Users must re-upload their Excel files
- This creates a poor user experience, especially in long-running sessions

## Root Cause

The `SessionManager` class ([session_manager.py:17](../../backend/src/ninebox/services/session_manager.py#L17)) stores sessions in a Python dictionary:
```python
def __init__(self) -> None:
    self.sessions: dict[str, SessionState] = {}
```

When the FastAPI backend (running as an Electron subprocess) restarts, this dictionary is wiped from memory.

## Solution Overview

Persist session state to SQLite database and auto-restore on startup:

1. **Database Schema**: Add `sessions` table to existing SQLite database
2. **SessionManager Enhancement**: Extend with persistence methods
3. **Auto-Restore**: Load sessions from database on backend startup
4. **Sync Strategy**: Write-through cache (update both memory + DB)
5. **Migration**: Handle existing sessions gracefully

## Implementation Plan

### Phase 1: Database Schema Design

**File**: `backend/src/ninebox/models/schema.sql` (new)

Create `sessions` table:
```sql
CREATE TABLE IF NOT EXISTS sessions (
    user_id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL,
    original_filename TEXT NOT NULL,
    original_file_path TEXT NOT NULL,
    sheet_name TEXT NOT NULL,
    sheet_index INTEGER NOT NULL,
    job_function_config TEXT,  -- JSON blob
    original_employees TEXT NOT NULL,  -- JSON blob
    current_employees TEXT NOT NULL,   -- JSON blob
    changes TEXT NOT NULL,             -- JSON blob
    updated_at TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_session_id ON sessions(session_id);
```

**Considerations**:
- Store complex objects (employees, changes, job_function_config) as JSON
- Use `user_id` as primary key (single session per user in local-only app)
- Add `updated_at` for audit trail
- Indexed lookups for performance

### Phase 2: Database Connection Manager

**File**: `backend/src/ninebox/services/database.py` (new)

Create a database connection manager:
```python
from pathlib import Path
import sqlite3
from contextlib import contextmanager
from ninebox.utils.paths import get_user_data_dir

class DatabaseManager:
    """Manages SQLite database connections and schema."""

    def __init__(self) -> None:
        self.db_path = get_user_data_dir() / "ninebox.db"
        self._ensure_schema()

    @contextmanager
    def get_connection(self):
        """Context manager for database connections."""
        conn = sqlite3.connect(str(self.db_path))
        conn.row_factory = sqlite3.Row
        try:
            yield conn
            conn.commit()
        except Exception:
            conn.rollback()
            raise
        finally:
            conn.close()

    def _ensure_schema(self) -> None:
        """Ensure database schema exists."""
        # Execute schema.sql
        pass

# Global database manager
db_manager = DatabaseManager()
```

**Key Features**:
- Connection pooling via context manager
- Auto-commit on success, rollback on error
- Schema initialization on first run
- Use existing `get_user_data_dir()` for database location

### Phase 3: Session Serialization

**File**: `backend/src/ninebox/services/session_serializer.py` (new)

Handle serialization/deserialization of session objects:
```python
import json
from datetime import datetime
from ninebox.models.session import SessionState, EmployeeMove
from ninebox.models.employee import Employee

class SessionSerializer:
    """Serializes and deserializes session state for database storage."""

    @staticmethod
    def serialize(session: SessionState) -> dict[str, Any]:
        """Convert SessionState to database-compatible dict."""
        return {
            "user_id": session.user_id,
            "session_id": session.session_id,
            "created_at": session.created_at.isoformat(),
            "original_filename": session.original_filename,
            "original_file_path": session.original_file_path,
            "sheet_name": session.sheet_name,
            "sheet_index": session.sheet_index,
            "job_function_config": json.dumps(
                session.job_function_config.__dict__ if session.job_function_config else None
            ),
            "original_employees": json.dumps(
                [emp.__dict__ for emp in session.original_employees]
            ),
            "current_employees": json.dumps(
                [emp.__dict__ for emp in session.current_employees]
            ),
            "changes": json.dumps(
                [change.__dict__ for change in session.changes]
            ),
            "updated_at": datetime.utcnow().isoformat(),
        }

    @staticmethod
    def deserialize(row: dict[str, Any]) -> SessionState:
        """Convert database row to SessionState."""
        # Parse JSON fields back to objects
        # Reconstruct Employee and EmployeeMove objects
        # Return SessionState instance
        pass
```

**Challenges**:
- Pydantic models with enums (PerformanceLevel, PotentialLevel)
- Datetime serialization (use ISO format)
- Nested objects (JobFunctionConfig, Employee, EmployeeMove)
- Ensure round-trip fidelity

**Alternative**: Use `pydantic.BaseModel.model_dump_json()` and `model_validate_json()` if models support it.

### Phase 4: Enhance SessionManager with Persistence

**File**: `backend/src/ninebox/services/session_manager.py` (modify)

Add persistence methods to existing `SessionManager`:

```python
from ninebox.services.database import db_manager
from ninebox.services.session_serializer import SessionSerializer

class SessionManager:
    """Manage in-memory AND persistent session state."""

    def __init__(self) -> None:
        self.sessions: dict[str, SessionState] = {}
        self._restore_sessions()  # NEW: Load from database

    def _restore_sessions(self) -> None:
        """Restore sessions from database on startup."""
        with db_manager.get_connection() as conn:
            cursor = conn.execute("SELECT * FROM sessions")
            rows = cursor.fetchall()

            for row in rows:
                session = SessionSerializer.deserialize(dict(row))
                self.sessions[session.user_id] = session

        logger.info(f"Restored {len(self.sessions)} sessions from database")

    def create_session(self, ...) -> str:
        """Create new session with uploaded data."""
        # ... existing logic ...

        self.sessions[user_id] = session
        self._persist_session(session)  # NEW: Save to database
        return session_id

    def move_employee(self, ...) -> EmployeeMove:
        """Update employee position in session."""
        # ... existing logic ...

        self._persist_session(session)  # NEW: Save changes
        return change

    def update_change_notes(self, ...) -> EmployeeMove:
        """Update notes for an employee's change entry."""
        # ... existing logic ...

        self._persist_session(session)  # NEW: Save notes
        return change_entry

    def delete_session(self, user_id: str) -> bool:
        """Delete session from memory AND database."""
        if user_id in self.sessions:
            del self.sessions[user_id]
            self._delete_session_from_db(user_id)  # NEW
            return True
        return False

    def _persist_session(self, session: SessionState) -> None:
        """Write session to database (write-through cache)."""
        data = SessionSerializer.serialize(session)

        with db_manager.get_connection() as conn:
            conn.execute(
                """
                INSERT OR REPLACE INTO sessions (
                    user_id, session_id, created_at, original_filename,
                    original_file_path, sheet_name, sheet_index,
                    job_function_config, original_employees,
                    current_employees, changes, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                tuple(data.values())
            )

    def _delete_session_from_db(self, user_id: str) -> None:
        """Delete session from database."""
        with db_manager.get_connection() as conn:
            conn.execute("DELETE FROM sessions WHERE user_id = ?", (user_id,))
```

**Key Changes**:
- Add `_restore_sessions()` called in `__init__`
- Add `_persist_session()` called after mutations
- Add `_delete_session_from_db()` for cleanup
- Use write-through cache strategy (update both memory + DB)

### Phase 5: Handle File Path Migration

**Challenge**: Stored `original_file_path` points to temp files that may be deleted.

**Solutions**:

1. **Copy to permanent location**:
   - On upload, copy file to `get_user_data_dir() / "uploads" / <session_id>_<filename>`
   - Store permanent path in session
   - Clean up on session delete

2. **Validate file existence on restore**:
   - Check if `original_file_path` exists on session restore
   - If missing, mark session as "file_missing" and handle gracefully
   - Prompt user to re-upload if export is attempted

**Recommendation**: Implement solution #1 with fallback to #2.

**File**: `backend/src/ninebox/api/session.py` (modify upload endpoint)

```python
@router.post("/upload")
async def upload_file(file: UploadFile = File(...)) -> dict:
    # ... existing validation ...

    # Save to PERMANENT location (not temp)
    uploads_dir = get_user_data_dir() / "uploads"
    uploads_dir.mkdir(parents=True, exist_ok=True)

    # Generate unique filename
    session_id = str(uuid.uuid4())
    permanent_path = uploads_dir / f"{session_id}_{file.filename}"

    # Save file
    with permanent_path.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # ... parse and create session with permanent_path ...

    session_id = session_manager.create_session(
        user_id=LOCAL_USER_ID,
        employees=employees,
        filename=file.filename,
        file_path=str(permanent_path),  # Use permanent path
        ...
    )
```

### Phase 6: Testing Strategy

**Unit Tests**:
- `test_database_manager.py`: Connection handling, schema creation
- `test_session_serializer.py`: Round-trip serialization
- `test_session_persistence.py`: CRUD operations on sessions

**Integration Tests**:
- `test_session_restore.py`: Backend restart scenarios
- `test_concurrent_updates.py`: Race conditions (if multi-user later)

**E2E Tests** (Playwright):
- Upload file → restart backend → verify session restored
- Make employee move → restart backend → verify changes persisted
- Delete session → restart backend → verify session gone

**Test Fixtures**:
- `backend/tests/fixtures/sample_session.json`: Serialized session data
- Use pytest fixtures for database setup/teardown

### Phase 7: Frontend Enhancements (Optional)

**Session Recovery Notification**:
Show toast/notification when session is auto-restored:
```tsx
// frontend/src/App.tsx
useEffect(() => {
  apiClient.getSessionStatus()
    .then(status => {
      if (status.restored_from_backup) {
        showNotification("Your previous session was restored", "success");
      }
    });
}, []);
```

**Session Health Monitoring**:
Periodically check session health and warn user if backend connection is lost.

## Implementation Checklist

- [ ] Phase 1: Design and document database schema
- [ ] Phase 2: Implement DatabaseManager with connection pooling
- [ ] Phase 3: Implement SessionSerializer with full round-trip tests
- [ ] Phase 4: Enhance SessionManager with persistence methods
- [ ] Phase 5: Update upload endpoint to use permanent file storage
- [ ] Phase 6: Write comprehensive unit and integration tests
- [ ] Phase 7: (Optional) Add frontend session recovery notifications
- [ ] Test: Upload → restart backend → verify session intact
- [ ] Test: Make changes → restart backend → verify changes persisted
- [ ] Test: Delete session → verify cleanup from both memory and DB
- [ ] Test: Large dataset (1000+ employees) serialization performance
- [ ] Document: Update CLAUDE.md with session persistence architecture

## Performance Considerations

**Write Performance**:
- Each employee move triggers database write
- Consider batching writes or async writes for high-frequency updates
- Profile with realistic workloads (100+ employees, 50+ moves)

**Read Performance**:
- Session restore on startup is one-time cost
- Optimize JSON deserialization for large employee arrays
- Consider caching deserialized objects

**Storage**:
- Estimate: 1000 employees × 1KB JSON ≈ 1MB per session
- SQLite handles this easily, even for 100+ sessions

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Serialization bugs lose data | High | Comprehensive round-trip tests, schema validation |
| Database corruption | High | Add integrity checks, backup on startup |
| File path migration breaks exports | Medium | Validate file existence, prompt re-upload if missing |
| Performance degradation | Low | Profile and optimize, consider async writes |
| Schema migration failures | Medium | Test migrations thoroughly, provide rollback |

## Future Enhancements

1. **Multi-user support**: Extend to support multiple users (already keyed by user_id)
2. **Session history**: Track session versions for undo/redo
3. **Cloud sync**: Sync sessions across devices (Google Drive, Dropbox)
4. **Auto-backup**: Periodic snapshots to prevent data loss
5. **Session sharing**: Export/import sessions between users

## Success Criteria

- ✅ Sessions survive backend restarts
- ✅ All employee moves and changes are persisted
- ✅ File uploads are stored in permanent location
- ✅ Zero data loss on backend crash/restart
- ✅ No performance regression (<100ms session restore)
- ✅ All existing tests pass
- ✅ New integration tests cover persistence scenarios

## Estimated Effort

- **Phase 1-3**: 4 hours (schema, database manager, serializer)
- **Phase 4-5**: 3 hours (SessionManager integration, file migration)
- **Phase 6**: 4 hours (comprehensive testing)
- **Phase 7**: 1 hour (optional frontend enhancements)
- **Total**: ~12 hours of focused development

## References

- [session_manager.py](../../backend/src/ninebox/services/session_manager.py) - Current implementation
- [session.py](../../backend/src/ninebox/models/session.py) - SessionState model
- [CLAUDE.md](../../CLAUDE.md) - Project architecture
- [SQLite JSON Functions](https://www.sqlite.org/json1.html) - For JSON column handling
