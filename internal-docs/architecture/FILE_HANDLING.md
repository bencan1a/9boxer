# File Handling Architecture

**Purpose:** Agent-optimized file handling patterns for 9Boxer's file load/save/apply workflows
**Last Updated:** 2025-12-29
**Context:** Standalone desktop app (Electron + FastAPI), file operations via Electron IPC

---

## Quick Rules

- **File operations MUST use Electron IPC** (no direct file system access from renderer)
- **Recent files MUST persist in localStorage** via Zustand persist middleware
- **Unsaved changes MUST trigger warning** before import, load sample, or close file
- **Apply Changes MUST offer two modes:** Update original file OR Save to different file
- **Read-only files MUST auto-fallback** to save-as-different mode with user prompt
- **NEVER lose user data** - Always warn before discarding unsaved changes
- **ALWAYS track original file path** in session state for apply operation
- **File menu MUST show change count** when changes exist (Apply X Changes)
- **Recent files MUST show max 5 entries** with filename and timestamp

---

## File Lifecycle

```
┌─────────────┐
│ App Start   │ (Empty state)
└──────┬──────┘
       │
       ├─→ Import Data ─────────┐
       │                        ↓
       └─→ Load Sample ──→ ┌────────────┐
                           │ File Loaded│
                           │ (Session   │
                           │  Active)   │
                           └─────┬──────┘
                                 │
                    ┌────────────┼────────────┐
                    │            │            │
                    ↓            ↓            ↓
            Make Changes   View/Filter    Close File
                    │            │            │
                    ↓            │            │
          ┌─────────────┐       │            │
          │ Has Unsaved │       │            │
          │  Changes    │←──────┘            │
          └──────┬──────┘                    │
                 │                           │
                 ↓                           │
         Apply Changes ──→ Choose Mode       │
                 │             │             │
                 │    ┌────────┴─────┐       │
                 │    ↓              ↓       │
                 │ Update       Save As      │
                 │ Original     Different    │
                 │    │              │       │
                 └────┴──────────────┴───────┘
                          │
                          ↓
                   ┌──────────────┐
                   │ File Saved   │
                   │ Changes Clear│
                   └──────────────┘
```

---

## Pattern Catalog

### Pattern: Recent Files Persistence (#recent-files)

**When:** User loads or saves a file
**Scenario:** Track recently used files for quick access
**State Management:** Zustand store with localStorage persistence

**Implementation:**
```typescript
// frontend/src/store/uiStore.ts
interface RecentFile {
  path: string;
  name: string;
  timestamp: number;
}

interface UiState {
  recentFiles: RecentFile[];
  addRecentFile: (file: RecentFile) => void;
  clearRecentFiles: () => void;
}

const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      recentFiles: [],
      addRecentFile: (file) =>
        set((state) => ({
          recentFiles: [
            file,
            ...state.recentFiles.filter((f) => f.path !== file.path),
          ].slice(0, 5), // Keep only 5 most recent
        })),
      clearRecentFiles: () => set({ recentFiles: [] }),
    }),
    {
      name: 'ui-storage', // localStorage key
      partialize: (state) => ({ recentFiles: state.recentFiles }),
    }
  )
);
```

**Usage:**
```typescript
// After successful file load
useUiStore.getState().addRecentFile({
  path: filePath,
  name: fileName,
  timestamp: Date.now(),
});

// Display in File menu
const { recentFiles } = useUiStore();
recentFiles.map(file => (
  <MenuItem key={file.path} onClick={() => loadFile(file.path)}>
    {file.name}
    <Typography variant="caption">
      {formatTimestamp(file.timestamp)}
    </Typography>
  </MenuItem>
));
```

**Don't:**
```typescript
// ❌ WRONG: Storing full file contents in localStorage (size limit!)
addRecentFile: (file) => set({ recentFiles: [...state.recentFiles, { path, content: fullExcelData }] })

// ❌ WRONG: No limit on recent files (unbounded growth)
recentFiles: [...state.recentFiles, file] // Will grow forever!

// ❌ WRONG: Not persisting to localStorage (lost on refresh)
const [recentFiles, setRecentFiles] = useState<RecentFile[]>([]); // Not persisted!
```

---

### Pattern: Unsaved Changes Protection (#unsaved-changes)

**When:** User tries to import data, load sample, or close file
**Scenario:** Prevent accidental loss of hours of work
**Dialog:** UnsavedChangesDialog with 3 options

**Template:**
```typescript
// frontend/src/hooks/useUnsavedChangesProtection.ts
export function useUnsavedChangesProtection() {
  const { changes } = useSessionStore();
  const [showDialog, setShowDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<() => void | null>(null);

  const checkUnsavedChanges = (action: () => void) => {
    const changeCount = Object.keys(changes).length;

    if (changeCount > 0) {
      // Has unsaved changes - show warning
      setPendingAction(() => action);
      setShowDialog(true);
      return false; // Block the action
    } else {
      // No changes - proceed immediately
      action();
      return true;
    }
  };

  const handleApplyChanges = async () => {
    // Save changes first, then execute pending action
    await applyChanges();
    if (pendingAction) pendingAction();
    setShowDialog(false);
  };

  const handleDiscardChanges = () => {
    // Execute pending action without saving
    if (pendingAction) pendingAction();
    setShowDialog(false);
  };

  const handleCancel = () => {
    // Do nothing - return to work
    setShowDialog(false);
    setPendingAction(null);
  };

  return {
    checkUnsavedChanges,
    showDialog,
    handleApplyChanges,
    handleDiscardChanges,
    handleCancel,
    changeCount: Object.keys(changes).length,
  };
}
```

**Usage:**
```typescript
// In FileMenuButton component
const { checkUnsavedChanges } = useUnsavedChangesProtection();

const handleImportData = () => {
  checkUnsavedChanges(() => {
    // This only executes if no unsaved changes OR user clicked "Discard Changes"
    openFileDialog();
  });
};

const handleCloseFile = () => {
  checkUnsavedChanges(() => {
    clearSession();
    clearEmployees();
  });
};
```

**Don't:**
```typescript
// ❌ WRONG: No protection - lose all changes
const handleImportData = () => {
  openFileDialog(); // Directly replaces session, changes lost!
};

// ❌ WRONG: Only warning, no option to save first
const handleImportData = () => {
  if (changes.length > 0) {
    if (confirm("Discard changes?")) { // Can't save from here!
      openFileDialog();
    }
  }
};

// ❌ WRONG: Blocking all operations (can't close app!)
const handleCloseFile = () => {
  if (changes.length > 0) {
    alert("You must apply changes first!"); // User stuck!
    return;
  }
};
```

---

### Pattern: Apply Changes Dialog (#apply-changes)

**When:** User clicks File menu → Apply X Changes
**Scenario:** Offer choice to update original file OR save to different file
**Dialog:** ApplyChangesDialog with checkbox toggle

**Template:**
```typescript
// frontend/src/components/dialogs/ApplyChangesDialog.tsx
export function ApplyChangesDialog({ open, onClose, changeCount }: Props) {
  const [saveAsDifferent, setSaveAsDifferent] = useState(false);
  const { originalFilePath } = useSessionStore();

  const handleApply = async () => {
    if (saveAsDifferent) {
      // Prompt user for new file location
      const newPath = await window.electronAPI.saveFileDialog({
        defaultPath: originalFilePath,
        filters: [{ name: 'Excel', extensions: ['xlsx'] }],
      });

      if (newPath) {
        await applyChangesToFile(newPath);
        onClose();
      }
      // If user cancels dialog, stay on Apply Changes screen
    } else {
      // Update original file directly
      try {
        await applyChangesToFile(originalFilePath);
        onClose();
      } catch (error) {
        if (error.code === 'EACCES' || error.code === 'EPERM') {
          // File is read-only or locked - auto-fallback to save-as
          toast.error('Cannot update original file (read-only). Choose a new location.');
          setSaveAsDifferent(true); // Check the checkbox
          // Don't close dialog - let user choose new location
        } else {
          throw error;
        }
      }
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Apply {changeCount} Changes</DialogTitle>
      <DialogContent>
        <Typography>
          {saveAsDifferent
            ? 'Choose a location to save your updated file.'
            : `Update your original file: ${originalFilePath}`}
        </Typography>

        <FormControlLabel
          control={
            <Checkbox
              checked={saveAsDifferent}
              onChange={(e) => setSaveAsDifferent(e.target.checked)}
              data-testid="save-as-different-file-checkbox"
            />
          }
          label="Save to a different file instead"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleApply} variant="contained">
          Apply Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
}
```

**Don't:**
```typescript
// ❌ WRONG: No choice - always overwrites original
const handleApply = async () => {
  await applyChangesToFile(originalFilePath); // User can't choose!
};

// ❌ WRONG: Always creates new file (annoying for iterative work)
const handleApply = async () => {
  const newPath = await window.electronAPI.saveFileDialog();
  // Every time user applies, they pick a new file - tedious!
};

// ❌ WRONG: No fallback for read-only files
try {
  await fs.writeFile(originalFilePath, data);
} catch (error) {
  toast.error("Failed to save"); // User's work is stuck!
  throw error;
}
```

---

### Pattern: Session State Management (#session-state)

**When:** File is loaded, changed, or saved
**Scenario:** Track session state and file metadata
**State:** Zustand store with session manager

**Template:**
```typescript
// frontend/src/store/sessionStore.ts
interface SessionState {
  originalFilePath: string | null;
  fileName: string | null;
  loadedAt: number | null;
  lastSavedAt: number | null;
  changes: Record<number, Change>; // keyed by employee_id

  setSession: (filePath: string) => void;
  recordChange: (employeeId: number, change: Change) => void;
  clearChanges: () => void;
  clearSession: () => void;
}

const useSessionStore = create<SessionState>((set) => ({
  originalFilePath: null,
  fileName: null,
  loadedAt: null,
  lastSavedAt: null,
  changes: {},

  setSession: (filePath) => set({
    originalFilePath: filePath,
    fileName: path.basename(filePath),
    loadedAt: Date.now(),
    lastSavedAt: null,
    changes: {},
  }),

  recordChange: (employeeId, change) => set((state) => ({
    changes: {
      ...state.changes,
      [employeeId]: change,
    },
  })),

  clearChanges: () => set({
    changes: {},
    lastSavedAt: Date.now(),
  }),

  clearSession: () => set({
    originalFilePath: null,
    fileName: null,
    loadedAt: null,
    lastSavedAt: null,
    changes: {},
  }),
}));
```

**Usage:**
```typescript
// After file load
const { setSession } = useSessionStore();
setSession(filePath);

// After employee move
const { recordChange } = useSessionStore();
recordChange(employeeId, {
  from: oldPosition,
  to: newPosition,
  timestamp: Date.now(),
});

// After applying changes
const { clearChanges } = useSessionStore();
await applyChangesToFile(filePath);
clearChanges(); // Mark as saved
```

**Don't:**
```typescript
// ❌ WRONG: Not tracking original file path (can't update original!)
setSession: () => set({ loaded: true }); // Where's the file path?

// ❌ WRONG: Not clearing changes after save (shows stale change count)
await applyChangesToFile(filePath);
// Changes still in state - "Apply 5 Changes" button still shows!

// ❌ WRONG: Persisting session to localStorage (large data!)
const useSessionStore = create(persist((set) => ({ ... })));
// Session data can be MB large - don't persist!
```

---

## Decision Matrix: File Save Strategy

| Condition | Action | Rationale |
|-----------|--------|-----------|
| User clicks "Apply Changes" + checkbox unchecked | Update original file | Default, convenient for iterative work |
| User clicks "Apply Changes" + checkbox checked | Prompt for new file location | User wants milestone/backup version |
| Original file is read-only | Auto-check checkbox + prompt for new location | Graceful fallback, data never lost |
| Original file is deleted | Auto-check checkbox + prompt for new location | File moved/deleted since load |
| User has no original file path (loaded sample) | Force checkbox checked + prompt for location | Sample data has no original file |
| No changes exist | Disable "Apply Changes" menu item | Nothing to save |

---

## Error Scenarios

### Read-Only File

**Trigger:** User tries to update original file, but it's read-only or locked
**Behavior:**
1. Detect EACCES/EPERM error on write attempt
2. Auto-check "Save to different file" checkbox
3. Show toast: "Cannot update original file (read-only). Choose a new location."
4. Keep Apply Changes dialog open
5. Let user select new file location

**Code:**
```typescript
try {
  await window.electronAPI.saveFile(originalFilePath, data);
} catch (error) {
  if (error.code === 'EACCES' || error.code === 'EPERM') {
    setSaveAsDifferent(true);
    toast.error('Cannot update original file (read-only). Choose a new location.');
  } else {
    throw error; // Unexpected error
  }
}
```

### File Deleted/Moved

**Trigger:** Original file no longer exists at recorded path
**Behavior:**
1. Detect ENOENT error on write attempt
2. Auto-check "Save to different file" checkbox
3. Show toast: "Original file not found. Choose a new location."
4. Suggest original filename in save dialog

**Code:**
```typescript
try {
  await window.electronAPI.saveFile(originalFilePath, data);
} catch (error) {
  if (error.code === 'ENOENT') {
    setSaveAsDifferent(true);
    toast.error('Original file not found. Choose a new location.');
  }
}
```

---

## Integration Points

### Electron IPC

**Main Process** (`frontend/electron/main/index.ts`):
```typescript
// File open dialog
ipcMain.handle('dialog:openFile', async () => {
  const result = await dialog.showOpenDialog({
    filters: [{ name: 'Excel', extensions: ['xlsx', 'xls'] }],
    properties: ['openFile'],
  });
  return result.filePaths[0];
});

// File save dialog
ipcMain.handle('dialog:saveFile', async (_, options) => {
  const result = await dialog.showSaveDialog({
    defaultPath: options.defaultPath,
    filters: options.filters,
  });
  return result.filePath;
});
```

**Preload Script** (`frontend/electron/preload/index.ts`):
```typescript
contextBridge.exposeInMainWorld('electronAPI', {
  openFileDialog: () => ipcRenderer.invoke('dialog:openFile'),
  saveFileDialog: (options) => ipcRenderer.invoke('dialog:saveFile', options),
});
```

### Backend API

**Apply Changes Endpoint** (placeholder - Phase 3E):
```python
@router.post("/session/apply-changes")
async def apply_changes(
    file_path: str,
    session_mgr: SessionManager = Depends(get_session_manager),
) -> ApplyChangesResponse:
    """Apply session changes to Excel file.

    Args:
        file_path: Absolute path where to save the file

    Returns:
        Success status and file metadata

    Raises:
        HTTPException: If file cannot be written or session not found
    """
    session = session_mgr.get_session(LOCAL_USER_ID)
    if not session:
        raise HTTPException(404, "No active session")

    # Generate updated Excel with change tracking columns
    excel_service.write_excel(
        file_path,
        employees=session.current_employees,
        changes=session.changes,
    )

    return ApplyChangesResponse(
        success=True,
        file_path=file_path,
        change_count=len(session.changes),
    )
```

---

## Related ADRs

- **ADR-004**: Zustand State Management - Recent files persistence pattern
- **ADR-003**: HTTP IPC Communication - Electron file dialog integration

---

## Tags

`#file-handling` `#session-management` `#unsaved-changes` `#recent-files` `#apply-changes` `#electron-ipc` `#state-persistence`
