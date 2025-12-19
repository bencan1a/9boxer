# Session Persistence: Design Decisions & Trade-offs

## Key Architectural Decisions

### 1. Storage Technology: SQLite

**Decision**: Use SQLite database in user's app data directory.

**Alternatives Considered**:
- **JSON files**: Simple but lacks ACID guarantees, harder to query
- **Local Storage (browser)**: Frontend-only, doesn't survive backend restart
- **PostgreSQL/MySQL**: Overkill for single-user desktop app

**Rationale**:
- ✅ Already using SQLite for app data (consistent)
- ✅ ACID transactions prevent corruption
- ✅ Easy queries and schema evolution
- ✅ Zero external dependencies
- ✅ Cross-platform support

### 2. Serialization Strategy: JSON Blobs

**Decision**: Store complex objects (employees, changes) as JSON TEXT columns.

**Alternatives Considered**:
- **Normalized tables**: Separate tables for employees, changes, etc.
- **Pickle/Binary**: Python-specific, not human-readable
- **MessagePack**: Faster but less debuggable

**Rationale**:
- ✅ Simple schema (single table)
- ✅ Human-readable for debugging
- ✅ Easy to export/import sessions
- ✅ Flexible schema evolution
- ❌ Slightly slower deserialization (acceptable trade-off)
- ❌ Can't query into JSON without extensions (not needed)

**Performance Impact**:
- 1000 employees × 1KB = ~1MB JSON
- Deserialization: <50ms on modern hardware
- Acceptable for single-user desktop app

### 3. Persistence Pattern: Write-Through Cache

**Decision**: Update both memory and database on every mutation.

**Alternatives Considered**:
- **Write-Behind (async)**: Batch writes for performance
- **Read-Through Only**: Persist on shutdown only
- **Event Sourcing**: Store all events, rebuild state

**Rationale**:
- ✅ Guarantees consistency (memory = database)
- ✅ Simple implementation
- ✅ Data safety (no loss on crash)
- ✅ No complex async coordination
- ❌ Slightly slower writes (acceptable for desktop app)

**Trade-off Analysis**:
```
Write-Through:
  + Data safety: Immediate persistence
  + Simplicity: No async complexity
  - Performance: ~10ms per write (acceptable)

Write-Behind:
  + Performance: Fast writes (no blocking)
  - Complexity: Requires queue, flush logic
  - Data loss: Window between write and flush
```

For a desktop app with infrequent mutations (employee moves), write-through is the right choice.

### 4. File Storage: Permanent Location

**Decision**: Copy uploaded files to permanent `uploads/` directory.

**Alternatives Considered**:
- **Keep in temp**: Simpler but files get deleted
- **Embed in database**: Bloats database, 10-100MB per file
- **Reference only**: Export breaks if file moved

**Rationale**:
- ✅ Survives temp directory cleanup
- ✅ Enables export after backend restart
- ✅ Clear ownership (app owns file)
- ✅ Easy cleanup on session delete
- ❌ Disk space usage (acceptable)

**Cleanup Strategy**:
- Delete on explicit session clear
- Optional: Purge files older than 30 days
- Optional: Add "Manage Storage" UI

### 5. Session Restore: Automatic on Startup

**Decision**: Restore all sessions from database in `SessionManager.__init__()`.

**Alternatives Considered**:
- **Lazy loading**: Restore on first access
- **Manual restore**: User clicks "Restore Session" button
- **No restore**: Treat restart as fresh start

**Rationale**:
- ✅ Zero user friction
- ✅ Invisible to user (app "just works")
- ✅ Simple implementation
- ✅ Startup cost is one-time and fast (<100ms)
- ❌ Slight startup delay (acceptable)

### 6. Error Handling: Graceful Degradation

**Decision**: If session restore fails, log error and continue with empty state.

**Strategies**:
1. **File missing**: Mark session as incomplete, allow viewing but block export
2. **Deserialization error**: Skip corrupted session, log for debugging
3. **Database locked**: Retry with backoff, fallback to in-memory only

**Rationale**:
- ✅ App remains usable even with corrupted data
- ✅ User can re-upload if needed
- ✅ Prevents app crash on startup
- ❌ Silent data loss (mitigated by logging)

### 7. Schema Creation: Simple Initialization

**Decision**: Create schema on first run using `CREATE TABLE IF NOT EXISTS`.

**Rationale**:
- ✅ Simple implementation (no migration complexity)
- ✅ Idempotent (safe to run multiple times)
- ✅ No backwards compatibility needed (new feature)
- ✅ Easy to understand and maintain

**Note**: Future schema changes can be handled when needed, but not required for initial implementation.

## Performance Benchmarks (Estimated)

| Operation | Current (In-Memory) | With Persistence | Delta |
|-----------|---------------------|------------------|-------|
| Create session | 5ms | 15ms | +10ms |
| Move employee | <1ms | 10ms | +10ms |
| Get employees | <1ms | <1ms | 0ms |
| Startup (100 employees) | 0ms | 50ms | +50ms |
| Startup (1000 employees) | 0ms | 200ms | +200ms |

**Conclusion**: Performance impact is negligible for desktop app use case.

## Security Considerations

### Data at Rest
- ✅ SQLite database is in user's protected app data directory
- ✅ No encryption needed (local-only app, user's own data)
- ⚠️ Future: Consider encryption for sensitive HR data

### Data Integrity
- ✅ ACID transactions prevent corruption
- ✅ JSON schema validation on deserialize
- ✅ Foreign key constraints (if normalized in future)

### Privacy
- ✅ No network transmission (offline-first)
- ✅ No cloud storage (unless user opts in)
- ✅ User controls data lifecycle (delete session = delete data)

## Testing Strategy

### Unit Tests
```python
# test_session_persistence.py
def test_create_and_restore_session():
    # Create session with employees
    session_id = manager.create_session(...)

    # Simulate restart: create new manager instance
    manager2 = SessionManager()

    # Verify session restored
    assert manager2.get_session("local-user") is not None
    assert len(manager2.get_session("local-user").current_employees) == 10
```

### Integration Tests
```python
# test_backend_restart.py
@pytest.mark.integration
def test_backend_restart_preserves_changes():
    # Upload file
    # Make employee moves
    # Restart FastAPI app (teardown/setup fixtures)
    # Verify changes persisted
```

### E2E Tests (Playwright)
```typescript
// backend-restart.spec.ts
test('session survives backend restart', async ({ page }) => {
  await uploadFile(page, 'sample.xlsx');
  await moveEmployee(page, 'John Doe', 'High', 'High');

  // Simulate restart: kill backend, wait for auto-restart
  await restartBackend();

  // Verify employee still in new position
  await expect(page.getByTestId('employee-John-Doe')).toHaveAttribute(
    'data-position', 'Star [H,H]'
  );
});
```

## Rollout Plan

### Phase 1: Core Implementation (MVP)
- Database schema
- SessionManager persistence
- Basic serialization
- Unit tests

### Phase 2: File Migration
- Permanent file storage
- Cleanup on delete
- Handle missing files

### Phase 3: Testing & Hardening
- Integration tests
- E2E tests
- Error handling
- Performance profiling

### Phase 4: Polish
- Migration system
- Frontend notifications
- Documentation
- User-facing error messages

### Phase 5: Release
- Feature flag (optional)
- Beta testing
- Production rollout
- Monitor for issues

## Success Metrics

**Functional**:
- ✅ 100% session restore success rate
- ✅ Zero data loss on backend restart
- ✅ All existing tests pass

**Performance**:
- ✅ Startup time <500ms (1000 employees)
- ✅ Employee move <50ms
- ✅ Session create <100ms

**Reliability**:
- ✅ No database corruption in testing
- ✅ Graceful handling of missing files
- ✅ Rollback on deserialization errors

## Future Enhancements

1. **Session Export/Import**: Share sessions between users
2. **Version History**: Track changes over time, enable undo
3. **Cloud Backup**: Optional sync to Google Drive/Dropbox
4. **Compression**: Gzip JSON for large datasets
5. **Incremental Saves**: Only save changed employees (optimization)
6. **Read-only mode**: View sessions without writable file

## Open Questions

1. **Max session age**: Auto-delete sessions older than X days?
2. **Max sessions per user**: Limit to prevent disk bloat?
3. **Backup strategy**: Should we auto-backup before migrations?
4. **User visibility**: Show session metadata in UI (created date, file size)?
5. **Conflict resolution**: Handle manual file edits while session active?

## References

- [SQLite JSON Functions](https://www.sqlite.org/json1.html)
- [FastAPI Background Tasks](https://fastapi.tiangolo.com/tutorial/background-tasks/) - For async writes (future)
- [Pydantic Serialization](https://docs.pydantic.dev/latest/concepts/serialization/) - For model_dump_json()
- [pytest-asyncio](https://pytest-asyncio.readthedocs.io/) - For async tests
