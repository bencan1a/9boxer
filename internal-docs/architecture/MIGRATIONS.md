# Database Migrations

## Quick Rules

- Schema version MUST be tracked via column detection (`PRAGMA table_info`)
- Migrations MUST run automatically on app startup (before session restoration)
- Migrations MUST be idempotent (safe to run multiple times)
- Migrations MUST preserve all user data (no data loss)
- Database is ephemeral (local only, single user) - no backup prompts needed
- Use `ALTER TABLE ADD COLUMN` for additive changes
- Use table recreation pattern for breaking changes (create new, copy data, swap)
- Test migrations on representative data (10, 1000, 10000 employees)
- NEVER use Alembic or external migration tools (keep it simple)

## Current Migration System

**Approach:** Inline schema detection + manual SQL migrations
**Location:** `backend/src/ninebox/services/database.py` (`DatabaseManager._run_migrations()`)
**Trigger:** Automatic on first database connection
**Versioning:** Column-based detection (`PRAGMA table_info`) - no version table needed
**Rollback:** Not supported (ephemeral database, users can delete and re-upload)

**Why This Approach:**
- Simple: No migration framework overhead
- Idempotent: Uses `PRAGMA table_info` to detect current state
- Fast: Runs inline during database initialization
- Local-first: No distributed migration coordination needed

## Migration Workflow (Step-by-Step)

When adding new database columns or changing schema:

1. **Update schema.sql**
   - Add new column to `schema.sql` with `DEFAULT` value
   - Document purpose in SQL comment
   - Location: `backend/src/ninebox/models/schema.sql`

2. **Add migration to `_run_migrations()`**
   - Check if column exists using `PRAGMA table_info`
   - Add column if missing with `ALTER TABLE ADD COLUMN`
   - Include data migration if needed (e.g., copy from old column)
   - Location: `backend/src/ninebox/services/database.py`

3. **Update Pydantic models**
   - Add field to relevant model (e.g., `SessionState`, `Employee`)
   - Use `| None` for nullable fields, provide default value
   - Location: `backend/src/ninebox/models/`

4. **Update serializers**
   - Add field to serialization/deserialization logic
   - Handle backward compatibility (old databases without field)
   - Location: `backend/src/ninebox/services/session_serializer.py`

5. **Test migration**
   - Create test database without column (old schema)
   - Run app and verify migration executes
   - Verify data is preserved and new column is populated
   - Test with 10, 1000 employees

6. **Document in CHANGELOG.md**
   - Note schema version change
   - Document migration behavior

## Pattern Catalog

### Pattern: Add New Column (Non-Breaking) #add-column

**When:** Adding optional field to sessions or employees
**Example:** Adding `donut_mode_active` column

**Step 1: Update schema.sql**
```sql
-- backend/src/ninebox/models/schema.sql

CREATE TABLE IF NOT EXISTS sessions (
    -- ... existing columns ...
    donut_mode_active INTEGER NOT NULL DEFAULT 0,  -- Boolean: 0=False, 1=True
    updated_at TIMESTAMP NOT NULL
);
```

**Step 2: Add migration to `_run_migrations()`**
```python
# backend/src/ninebox/services/database.py

def _run_migrations(self, conn: sqlite3.Connection) -> None:
    """Run database migrations to add new columns to existing tables."""

    # Get current schema
    cursor = conn.execute("PRAGMA table_info(sessions)")
    columns = {row[1] for row in cursor.fetchall()}

    # Migration: Add donut_mode_active column if missing
    if "donut_mode_active" not in columns:
        logger.info("Running migration: Adding donut_mode_active column")
        conn.execute(
            "ALTER TABLE sessions ADD COLUMN donut_mode_active INTEGER NOT NULL DEFAULT 0"
        )
```

**Step 3: Update Pydantic model**
```python
# backend/src/ninebox/models/session.py

class SessionState(BaseModel):
    # ... existing fields ...
    donut_mode_active: bool = False  # New field with default
```

**Step 4: Update serializer**
```python
# backend/src/ninebox/services/session_serializer.py

class SessionSerializer:
    @staticmethod
    def serialize(session: SessionState) -> dict[str, Any]:
        return {
            # ... existing fields ...
            "donut_mode_active": session.donut_mode_active,
        }

    @staticmethod
    def deserialize(data: dict[str, Any]) -> SessionState:
        return SessionState(
            # ... existing fields ...
            donut_mode_active=data.get("donut_mode_active", False),  # Backward compatible
        )
```

**Testing Checklist:**
- [ ] Old database (without column) migrates successfully
- [ ] New database (with column) works without migration
- [ ] Existing data is preserved
- [ ] New sessions have correct default value
- [ ] Migration runs only once (idempotent)

---

### Pattern: Rename Column (Breaking Migration) #rename-column

**When:** Renaming a column for clarity (e.g., `changes` → `events`)

**Step 1: Add new column migration**
```python
def _run_migrations(self, conn: sqlite3.Connection) -> None:
    cursor = conn.execute("PRAGMA table_info(sessions)")
    columns = {row[1] for row in cursor.fetchall()}

    # Migration: Add new column
    if "events" not in columns:
        logger.info("Running migration: Adding events column")
        conn.execute("ALTER TABLE sessions ADD COLUMN events TEXT NOT NULL DEFAULT '[]'")

        # Copy data from old column if it exists
        if "changes" in columns:
            logger.info("Migrating data from 'changes' to 'events'")
            conn.execute("UPDATE sessions SET events = changes")
```

**Step 2: Drop old column (optional)**
```python
    # Migration: Drop old column (optional - SQLite 3.35.0+)
    if "changes" in columns:
        logger.info("Running migration: Dropping obsolete 'changes' column")
        try:
            conn.execute("ALTER TABLE sessions DROP COLUMN changes")
        except sqlite3.OperationalError as e:
            logger.warning(f"Could not drop 'changes' column (old SQLite version?): {e}")
            # Not a critical error - old column remains but is unused
```

**Note:** SQLite versions before 3.35.0 do not support `DROP COLUMN`. It's safe to leave obsolete columns in the database - they simply won't be read or written.

**Testing Checklist:**
- [ ] Data migrates from old column to new column
- [ ] Old column is dropped (if SQLite version supports it)
- [ ] Serializer reads from new column name
- [ ] Migration is idempotent (safe if new column already exists)

---

### Pattern: Add JSON Column #add-json-column

**When:** Adding complex structured data (e.g., `job_function_config`)

**Step 1: Update schema.sql**
```sql
CREATE TABLE IF NOT EXISTS sessions (
    -- ... existing columns ...
    job_function_config TEXT,  -- JSON blob: JobFunctionConfig or NULL
);
```

**Step 2: Add migration**
```python
if "job_function_config" not in columns:
    logger.info("Running migration: Adding job_function_config column")
    conn.execute("ALTER TABLE sessions ADD COLUMN job_function_config TEXT DEFAULT NULL")
```

**Step 3: Serialize/deserialize JSON**
```python
import json

# Serialize
data["job_function_config"] = json.dumps(session.job_function_config) if session.job_function_config else None

# Deserialize
job_function_config_json = data.get("job_function_config")
job_function_config = json.loads(job_function_config_json) if job_function_config_json else None
```

**Don't:**
```python
# ❌ WRONG: Storing Python object directly (not JSON serializable)
conn.execute("INSERT INTO sessions VALUES (?)", (session.job_function_config,))

# ❌ WRONG: No null handling
json.dumps(session.job_function_config)  # Raises error if None
```

---

### Pattern: Change Column Type (Breaking) #change-column-type

**When:** Changing data type (e.g., `INTEGER` → `TEXT`, `TEXT` → `REAL`)

**SQLite limitation:** `ALTER TABLE ALTER COLUMN` is not supported.
**Solution:** Table recreation pattern.

**Migration:**
```python
def _run_migrations(self, conn: sqlite3.Connection) -> None:
    cursor = conn.execute("PRAGMA table_info(sessions)")
    columns = {row[1]: row[2] for row in cursor.fetchall()}  # {name: type}

    # Check if column type needs changing
    if columns.get("session_id") == "INTEGER":  # Old type
        logger.info("Running migration: Changing session_id to TEXT")

        # Step 1: Create new table with correct schema
        conn.execute("""
            CREATE TABLE sessions_new (
                user_id TEXT PRIMARY KEY,
                session_id TEXT NOT NULL,  -- Changed from INTEGER to TEXT
                created_at TIMESTAMP NOT NULL,
                -- ... other columns with correct types ...
                updated_at TIMESTAMP NOT NULL
            )
        """)

        # Step 2: Copy data with type conversion
        conn.execute("""
            INSERT INTO sessions_new
            SELECT
                user_id,
                CAST(session_id AS TEXT),  -- Convert INTEGER → TEXT
                created_at,
                -- ... other columns ...
                updated_at
            FROM sessions
        """)

        # Step 3: Swap tables
        conn.execute("DROP TABLE sessions")
        conn.execute("ALTER TABLE sessions_new RENAME TO sessions")

        # Step 4: Recreate indexes
        conn.execute("CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id)")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_sessions_session_id ON sessions(session_id)")
```

**Testing Checklist:**
- [ ] All data is preserved (compare row counts before/after)
- [ ] Data conversion is correct (e.g., INTEGER 123 → TEXT "123")
- [ ] Indexes are recreated
- [ ] Foreign keys are recreated (if any)
- [ ] Migration is idempotent (check column type first)

---

### Pattern: Add Index for Performance #add-index

**When:** Query is slow, adding index to speed up lookups

**Step 1: Update schema.sql**
```sql
-- Index for fast session_id lookups (secondary index)
CREATE INDEX IF NOT EXISTS idx_sessions_session_id ON sessions(session_id);
```

**Step 2: Add migration**
```python
def _run_migrations(self, conn: sqlite3.Connection) -> None:
    # Check if index exists
    cursor = conn.execute("SELECT name FROM sqlite_master WHERE type='index' AND name='idx_sessions_session_id'")
    if not cursor.fetchone():
        logger.info("Running migration: Adding session_id index")
        conn.execute("CREATE INDEX idx_sessions_session_id ON sessions(session_id)")
```

**Don't:**
```python
# ❌ WRONG: Always creating index (not idempotent)
conn.execute("CREATE INDEX idx_sessions_session_id ON sessions(session_id)")
# Will raise error if index already exists

# ✅ CORRECT: Use IF NOT EXISTS
conn.execute("CREATE INDEX IF NOT EXISTS idx_sessions_session_id ON sessions(session_id)")
```

---

### Pattern: Data Migration (Transform Existing Data) #data-migration

**When:** Changing data format or populating new column from existing data

**Example:** Calculate `tenure_category` from `hire_date` for all employees

**Migration:**
```python
def _run_migrations(self, conn: sqlite3.Connection) -> None:
    cursor = conn.execute("PRAGMA table_info(sessions)")
    columns = {row[1] for row in cursor.fetchall()}

    # Add new column
    if "tenure_category" not in columns:
        logger.info("Running migration: Adding tenure_category column")
        conn.execute("ALTER TABLE sessions ADD COLUMN tenure_category TEXT DEFAULT NULL")

        # Data migration: Calculate tenure_category from hire_date
        logger.info("Running data migration: Populating tenure_category")
        cursor = conn.execute("SELECT user_id, current_employees FROM sessions")
        for row in cursor.fetchall():
            user_id, current_employees_json = row
            employees = json.loads(current_employees_json)

            # Transform each employee
            for emp in employees:
                if "hire_date" in emp and emp.get("tenure_category") is None:
                    hire_date = datetime.fromisoformat(emp["hire_date"])
                    years = (datetime.now() - hire_date).days / 365.25

                    if years < 2:
                        emp["tenure_category"] = "<2 years"
                    elif years < 5:
                        emp["tenure_category"] = "2-5 years"
                    else:
                        emp["tenure_category"] = "5+ years"

            # Update row
            conn.execute(
                "UPDATE sessions SET current_employees = ? WHERE user_id = ?",
                (json.dumps(employees), user_id)
            )
```

**Testing Checklist:**
- [ ] All employees have `tenure_category` populated
- [ ] Calculation is correct for edge cases (new hires, long tenure)
- [ ] Migration is idempotent (skips if already populated)
- [ ] Performance is acceptable (test with 10,000 employees)

---

## Version Compatibility Matrix

| Schema Version | Columns | Changes | Backward Compatible |
|----------------|---------|---------|---------------------|
| **1.0** (Initial) | user_id, session_id, created_at, original_filename, original_file_path, sheet_name, sheet_index, job_function_config, original_employees, current_employees, changes, updated_at | Initial schema | N/A |
| **1.1** (Rename events) | Added: events, donut_events, donut_mode_active | Renamed `changes` → `events`, added donut tracking | ✅ Yes (migration copies data) |
| **1.2** (Drop old columns) | Dropped: changes, donut_changes | Cleanup obsolete columns | ✅ Yes (data already migrated) |

**Forward Compatibility Rule:**
- New app versions CAN read old databases (migrations run on startup)
- Old app versions CANNOT read new databases (missing columns cause errors)

**User Impact:**
- Database is ephemeral (local only, single user)
- If migration fails, user can delete database and re-upload Excel file
- No backup/restore needed (data source is Excel file)

---

## Decision Matrix: When to Migrate vs Recreate

| Scenario | Approach | Rationale |
|----------|----------|-----------|
| Adding optional column | ✅ Migration (ALTER TABLE ADD) | Fast, non-breaking |
| Renaming column | ✅ Migration (ADD + copy + DROP) | Preserves data, backward compatible during transition |
| Changing column type | ⚠️ Table recreation (CREATE new + copy + swap) | SQLite limitation, requires full table rebuild |
| Adding index | ✅ Migration (CREATE INDEX IF NOT EXISTS) | Fast, non-breaking |
| Removing column | ⚠️ Migration (DROP COLUMN) or leave | SQLite 3.35.0+ only, safe to leave unused columns |
| Major schema overhaul | ❌ Recreate (delete database, user re-uploads) | Simpler than complex migration, acceptable for local app |

---

## Migration Testing Checklist

Before deploying schema change:

**Unit Tests:**
- [ ] Test migration on empty database (no existing sessions)
- [ ] Test migration on database with 1 session
- [ ] Test migration on database with 10 sessions
- [ ] Test migration is idempotent (run twice, no errors)

**Integration Tests:**
- [ ] Test with small dataset (10 employees)
- [ ] Test with medium dataset (1,000 employees)
- [ ] Test with large dataset (10,000 employees)
- [ ] Test with old database (without new column)
- [ ] Test with new database (with new column)

**Performance Tests:**
- [ ] Migration completes in <1s for typical database
- [ ] Migration completes in <5s for large database (10,000 employees)
- [ ] No memory spikes during migration

**Backward Compatibility:**
- [ ] Old database can be migrated to new schema
- [ ] Existing data is preserved (no data loss)
- [ ] Serializer handles missing fields gracefully

**Verification:**
- [ ] Run app after migration and verify all features work
- [ ] Check logs for migration success message
- [ ] Verify database schema matches schema.sql (`PRAGMA table_info`)
- [ ] Document migration in CHANGELOG.md

---

## Migration Failure Recovery

| Failure Type | Symptom | Recovery Strategy | User Action |
|--------------|---------|-------------------|-------------|
| Column already exists | `sqlite3.OperationalError: duplicate column` | Check column existence first | No action (migration was already applied) |
| Data conversion error | `sqlite3.IntegrityError: NOT NULL constraint` | Provide DEFAULT value in ALTER TABLE | Check logs, delete database, re-upload |
| Missing old column | `sqlite3.OperationalError: no such column` | Check column existence before copying data | No action (fresh database, no data to migrate) |
| SQLite version too old | `sqlite3.OperationalError: unsupported SQL` | Use workarounds (table recreation) or skip | Update Python/SQLite, or delete database |
| Migration timeout | App hangs on startup | Optimize data migration (batch updates) | Force quit, delete database, report bug |

**General Recovery:**
1. Check logs (`{userData}/backend.log`) for migration errors
2. If migration fails, database is unusable - delete and re-upload Excel
3. User data source is Excel file, not database (database is cache)

---

## Common Migration Mistakes

### Mistake: Not checking if column exists

**Don't:**
```python
# ❌ WRONG: Always adds column (not idempotent)
def _run_migrations(self, conn: sqlite3.Connection) -> None:
    conn.execute("ALTER TABLE sessions ADD COLUMN new_column TEXT")
    # Raises error on second run: "duplicate column name: new_column"
```

**Do:**
```python
# ✅ CORRECT: Check existence first
def _run_migrations(self, conn: sqlite3.Connection) -> None:
    cursor = conn.execute("PRAGMA table_info(sessions)")
    columns = {row[1] for row in cursor.fetchall()}

    if "new_column" not in columns:
        conn.execute("ALTER TABLE sessions ADD COLUMN new_column TEXT")
```

---

### Mistake: Not providing DEFAULT value

**Don't:**
```python
# ❌ WRONG: No DEFAULT for NOT NULL column (fails on existing rows)
conn.execute("ALTER TABLE sessions ADD COLUMN new_column TEXT NOT NULL")
# Raises error: "Cannot add NOT NULL column with default value NULL"
```

**Do:**
```python
# ✅ CORRECT: Provide DEFAULT value
conn.execute("ALTER TABLE sessions ADD COLUMN new_column TEXT NOT NULL DEFAULT ''")

# Or make nullable
conn.execute("ALTER TABLE sessions ADD COLUMN new_column TEXT DEFAULT NULL")
```

---

### Mistake: Forgetting to update serializer

**Don't:**
```python
# ❌ WRONG: Migration adds column, but serializer doesn't handle it
def _run_migrations(self, conn):
    if "new_column" not in columns:
        conn.execute("ALTER TABLE sessions ADD COLUMN new_column TEXT DEFAULT NULL")

# Serializer still doesn't read/write new_column
# Result: Column is always NULL, data is lost
```

**Do:**
```python
# ✅ CORRECT: Update serializer to handle new column
class SessionSerializer:
    @staticmethod
    def serialize(session: SessionState) -> dict[str, Any]:
        return {
            # ... existing fields ...
            "new_column": session.new_column,  # Serialize new field
        }

    @staticmethod
    def deserialize(data: dict[str, Any]) -> SessionState:
        return SessionState(
            # ... existing fields ...
            new_column=data.get("new_column"),  # Deserialize with backward compatibility
        )
```

---

### Mistake: Not handling backward compatibility

**Don't:**
```python
# ❌ WRONG: Assumes new column always exists (breaks old databases)
def deserialize(data: dict[str, Any]) -> SessionState:
    return SessionState(
        new_column=data["new_column"],  # KeyError if old database doesn't have field
    )
```

**Do:**
```python
# ✅ CORRECT: Use .get() with default value
def deserialize(data: dict[str, Any]) -> SessionState:
    return SessionState(
        new_column=data.get("new_column", None),  # Handles missing field gracefully
    )
```

---

### Mistake: Not testing idempotency

**Don't:**
```python
# ❌ WRONG: Migration runs unconditionally (not idempotent)
def _run_migrations(self, conn: sqlite3.Connection) -> None:
    conn.execute("ALTER TABLE sessions ADD COLUMN new_column TEXT")
    # Fails on second run
```

**Do:**
```python
# ✅ CORRECT: Check state before migrating
def _run_migrations(self, conn: sqlite3.Connection) -> None:
    cursor = conn.execute("PRAGMA table_info(sessions)")
    columns = {row[1] for row in cursor.fetchall()}

    if "new_column" not in columns:  # Idempotent check
        conn.execute("ALTER TABLE sessions ADD COLUMN new_column TEXT")
```

**Testing:**
```python
# Test idempotency
def test_migration_idempotent():
    db = DatabaseManager()

    # Run migration twice
    with db.get_connection() as conn:
        db._run_migrations(conn)  # First run

    with db.get_connection() as conn:
        db._run_migrations(conn)  # Second run - should not fail
```

---

## Manual Migration Guide (When Automation Fails)

If migrations fail or are too complex, provide manual SQL for users:

**Example:** Manually add column to existing database

**Step 1: Backup database (optional)**
```bash
# Copy database file
cp ~/.config/9boxer/ninebox.db ~/.config/9boxer/ninebox.db.backup
```

**Step 2: Open database with sqlite3**
```bash
sqlite3 ~/.config/9boxer/ninebox.db
```

**Step 3: Run migration SQL**
```sql
-- Add missing column
ALTER TABLE sessions ADD COLUMN donut_mode_active INTEGER NOT NULL DEFAULT 0;

-- Verify column was added
PRAGMA table_info(sessions);

-- Exit
.quit
```

**Step 4: Restart application**
```bash
# Application will use updated schema
```

---

## Related Patterns

- See [SYSTEM_ARCHITECTURE.md](SYSTEM_ARCHITECTURE.md) for database schema overview
- See [ERROR_HANDLING.md](ERROR_HANDLING.md) for migration error handling patterns
- See [OBSERVABILITY.md](OBSERVABILITY.md) for migration logging guidance
- See `backend/src/ninebox/services/database.py` for migration implementation
- See `backend/src/ninebox/models/schema.sql` for current schema definition

---

## Quick Reference: Migration Checklist

When adding a new migration:

1. ✅ Update `schema.sql` with new column definition
2. ✅ Add migration to `DatabaseManager._run_migrations()`
3. ✅ Check column existence using `PRAGMA table_info`
4. ✅ Use `ALTER TABLE ADD COLUMN` with `DEFAULT` value
5. ✅ Update Pydantic model (add field with default)
6. ✅ Update serializer (handle backward compatibility with `.get()`)
7. ✅ Write unit test for migration (idempotency)
8. ✅ Test with old database (verify data migration)
9. ✅ Test with new database (verify no errors)
10. ✅ Document in CHANGELOG.md
11. ✅ Log migration execution with `logger.info()`

**Remember:** Migrations MUST be idempotent - safe to run multiple times!
