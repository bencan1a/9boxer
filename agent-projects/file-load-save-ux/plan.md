---
status: done
owner: claude-code
created: 2025-12-28
completed: 2025-12-28
summary:
  - ✅ Improved file load/save UX with clearer mental model
  - ✅ Added recent files list (last 5 files)
  - ✅ Added unsaved changes protection
  - ✅ Added close file functionality
  - ✅ Implemented "Save as new file" option
  - ✅ Added error handling with auto-fallback
  - 📝 Documentation tracked in issue #122
---

# File Load/Save UX Improvements

## Overview

Improving the file load/save experience with better terminology, unsaved changes protection, recent files, and close file functionality.

## Problem Statement

Current issues:
1. **Inconsistent terminology**: Mix of "import data" and "load file" creates confusion
2. **No unsaved changes warning**: Easy to lose work when loading new file
3. **No recent files**: Users must navigate file picker every time
4. **No close file**: Can't return to empty state without loading new file
5. **Unclear apply model**: "Apply changes" generates new file, doesn't modify original

## Goals

1. **Standardize mental model**: "Load File" → work with data → "Apply Changes" to file
2. **Protect user work**: Warn before losing unsaved changes
3. **Improve convenience**: Recent files list for quick access
4. **Support workflows**: Close file to return to empty state
5. **Handle edge cases**: File missing, read-only, etc.

## Solution Design

### 1. Mental Model: Load/Apply/Close

**Load File:**
- User loads Excel file into session
- File path remembered for applying changes later

**Apply Changes:**
- Default: Modify original file in place (apply diffs)
- Option: "Save as new file" checkbox
- Auto-fallback: If original file unavailable → prompt for new location
- Edge cases: Missing file, read-only → graceful fallback

**Close File:**
- Return to empty state
- Triggers unsaved changes warning if applicable

### 2. Recent Files (Last 5)

**Storage:** localStorage via uiStore (same pattern as theme preference)

**Display:** File menu dropdown (placeholder already exists)

**Behavior:**
- Click recent file → triggers unsaved changes check → loads file
- Updated on every successful load or apply
- Persists across app restarts

### 3. Unsaved Changes Protection

**Detection:** `session.events.length > 0` (existing change tracking)

**Triggers:** Load File, Load Sample Data, Close File, Load Recent File

**Dialog Options:**
- "Apply Changes and Continue" → Open apply dialog → Proceed with action
- "Discard Changes and Continue" → Proceed with action
- "Cancel" → Abort, stay on current screen

### 4. Apply Changes Dialog

**UI:**
```
Apply Changes to File
─────────────────────────────────────
Apply changes to: employees.xlsx

□ Save as new file instead

[Cancel]  [Apply Changes]
```

**Logic:**
- Unchecked (default): Apply to original file
- Checked: Show file save dialog first
- Error handling: Graceful fallback with user-friendly messages

## Architecture Changes

### Backend

**Files to modify:**
- `backend/src/ninebox/models/preferences.py` (new) - RecentFile model
- `backend/src/ninebox/services/preferences_manager.py` (new) - Manage recent files
- `backend/src/ninebox/api/preferences.py` (new) - Preferences endpoints
- `backend/src/ninebox/api/session.py` - Enhance export endpoint with mode parameter
- `backend/src/ninebox/api/session.py` - Add close session endpoint

**New Endpoints:**
- `GET /api/preferences/recent-files` → Returns list of 5 recent files
- `POST /api/preferences/recent-files` → Adds file to recent list
- `POST /api/session/export?mode=update_original|save_new&new_path=...` (enhanced)
- `POST /api/session/close` → Clear session, return to empty state

**Storage:**
- Recent files in JSON file: `~/.9boxer/config.json`

### Frontend

**Files to modify:**
- `frontend/src/store/uiStore.ts` - Add recent files state
- `frontend/src/components/dashboard/FileMenuButton.tsx` - Wire up recent files
- `frontend/src/components/dialogs/UnsavedChangesDialog.tsx` (new)
- `frontend/src/components/dialogs/ApplyChangesDialog.tsx` (new)
- `frontend/src/components/dashboard/AppBarContainer.tsx` - Update export flow
- `frontend/src/store/sessionStore.ts` - Add unsaved changes checks

**Storage:**
- Recent files in localStorage: `"9boxer-ui-state"` (via uiStore persist)

## Implementation Phases

### Phase 1: Backend Foundation (Week 1)
**Agent-sized chunks:**
- Chunk 1A: Recent files storage (preferences manager + API endpoints)
- Chunk 1B: Export API enhancement (mode parameter + error handling)
- Chunk 1C: Close session API
- Chunk 1D: Backend tests (unit + integration)

### Phase 2: Frontend Components (Week 2)
**Agent-sized chunks:**
- Chunk 2A: Unsaved changes dialog component
- Chunk 2B: Apply changes dialog component
- Chunk 2C: Recent files in uiStore + FileMenuButton
- Chunk 2D: Close file menu item
- Chunk 2E: Frontend component tests

### Phase 3: Integration (Week 3)
**Agent-sized chunks:**
- Chunk 3A: Wire unsaved changes checks to all flows
- Chunk 3B: Session restoration with recent files
- Chunk 3C: E2E tests (file workflows)
- Chunk 3D: Error handling polish + edge cases

### Phase 4: Documentation (Week 4)
**Agent-sized chunks:**
- Chunk 4A: User guide updates
- Chunk 4B: Screenshot workflows + generation
- Chunk 4C: Architecture doc updates

## Testing Strategy (TDD)

### Backend Tests
- `test_preferences_manager.py` - Recent files list operations
- `test_session_export_modes.py` - Export with modes
- `test_session_close.py` - Close session API
- `test_export_error_handling.py` - Missing/readonly file fallback

### Frontend Tests
- `UnsavedChangesDialog.test.tsx` - Dialog interactions
- `ApplyChangesDialog.test.tsx` - Checkbox + error handling
- `FileMenuButton.test.tsx` - Recent files menu
- `file-workflow.spec.ts` (E2E) - Full workflow with warnings
- `recent-files.spec.ts` (E2E) - Recent files list

### Coverage Target
- Backend: >80% for new code
- Frontend: >70% for new components

## Related Work

- **Future Enhancement:** Smart merge (GitHub #99) - Preserve user columns when applying changes
  - Not required for initial implementation
  - Can be added later without breaking changes

## Success Criteria

- [ ] Users understand "Load/Apply/Close" mental model
- [ ] No accidental data loss from unsaved changes
- [ ] Recent files list shows last 5 files
- [ ] Apply changes modifies original file by default
- [ ] Save as new file option works correctly
- [ ] Edge cases handled gracefully (missing file, read-only, etc.)
- [ ] All tests passing with >80% backend coverage
- [ ] User guide updated with screenshots
- [ ] No regressions in existing functionality

## Timeline

- Week 1: Backend foundation
- Week 2: Frontend components
- Week 3: Integration + testing
- Week 4: Documentation + polish

## Dependencies

- Existing session state tracking (already working)
- Existing file upload/export flow (enhance, don't replace)
- Electron file dialog APIs (already integrated)

## Risks & Mitigations

**Risk:** Breaking existing upload/export workflows
**Mitigation:** Enhance existing endpoints, don't replace. Maintain backward compatibility.

**Risk:** Edge cases with file permissions/missing files
**Mitigation:** Comprehensive error handling with user-friendly messages and fallbacks

**Risk:** Recent files pointing to moved/deleted files
**Mitigation:** Validate file existence before loading, graceful error if missing

## Notes

- Following existing patterns: localStorage via Zustand persist (like theme)
- TDD approach: Write tests first, then implement
- Phased implementation with independent code reviews
- Agent-sized chunks for parallel work where possible
