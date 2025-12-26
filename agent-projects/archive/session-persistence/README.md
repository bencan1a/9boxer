# Session Persistence Project

## Quick Summary

**Problem**: Sessions are stored in-memory only. Backend restarts lose all session state, causing "No session found" errors.

**Solution**: Persist sessions to SQLite database with automatic restore on backend startup.

**Status**: Planning complete, ready for implementation

## Files in This Project

- **[plan.md](plan.md)**: Comprehensive implementation plan (8 phases)
- **[design-decisions.md](design-decisions.md)**: Architectural decisions and trade-offs
- **README.md**: This file (quick reference)

## Quick Start (For Implementation)

### Phase Order
1. **Database Setup** (DatabaseManager + schema)
2. **Serialization** (SessionSerializer with round-trip tests)
3. **Persistence** (Enhance SessionManager)
4. **File Storage** (Copy uploads to permanent location)
5. **Testing** (Unit + integration + E2E)
6. **Polish** (Optional frontend notifications)

### Key Design Choices
- **Storage**: SQLite with JSON columns (simple, portable)
- **Pattern**: Write-through cache (every mutation writes to DB)
- **Files**: Copy to permanent `uploads/` directory
- **Restore**: Automatic on backend startup

### Estimated Effort
~12 hours of focused development

## Testing Checklist
- [ ] Upload file → restart backend → session restored
- [ ] Move employee → restart backend → changes persisted
- [ ] Delete session → restart backend → session gone
- [ ] Large dataset (1000 employees) performance test

## Success Criteria
- ✅ Sessions survive backend restarts
- ✅ Zero data loss on crash
- ✅ Startup time <500ms (1000 employees)
- ✅ All existing tests pass

## References
- [session_manager.py](../../backend/src/ninebox/services/session_manager.py)
- [session.py](../../backend/src/ninebox/models/session.py)
- [CLAUDE.md](../../CLAUDE.md)
