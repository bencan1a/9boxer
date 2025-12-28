# Component Guidelines

**Part of:** [9Boxer Design System](README.md)
**Related:** [Component Inventory](component-inventory.md) | [Design Principles](design-principles.md) | [Layout Patterns](layout-patterns.md)
**Last Updated:** 2025-12-24

---

## Overview

This document provides comprehensive guidelines for creating, composing, and maintaining React components in the 9Boxer application. Following these patterns ensures consistency, reusability, and maintainability across the codebase.

**Core Principles:**
- **Composition Over Inheritance** - Build complex UI from simple, focused components
- **Single Responsibility** - Each component does one thing well
- **Props-Driven** - Behavior controlled by props, not internal assumptions
- **Accessibility First** - WCAG AA compliance built-in, not bolted on
- **Type Safety** - Full TypeScript coverage with explicit interfaces

---

## Component Composition Patterns

### Container vs Presentational Components

**Container Components** (Smart):
- Manage state and side effects
- Connect to global stores (Zustand, contexts)
- Handle data fetching and transformations
- Orchestrate multiple presentational components
- Minimal visual styling

**Presentational Components** (Dumb):
- Receive all data via props
- No direct state management (only local UI state)
- Highly reusable
- Extensive visual styling
- Easy to test in isolation

#### Example: Container Component

**DashboardPage** ([DashboardPage.tsx:25-292](../../frontend/src/components/dashboard/DashboardPage.tsx#L25-L292)):

```tsx
export const DashboardPage: React.FC = () => {
  // Container responsibilities:
  // 1. Session management
  const { sessionId, employees } = useSession();

  // 2. Global state
  const { showSuccess } = useSnackbar();

  // 3. Panel resizing logic
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const panelRef = useRef<ImperativePanelHandle>(null);

  // 4. Layout orchestration
  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <AppBarContainer />
      <PanelGroup direction="horizontal">
        <FilterDrawer />
        <NineBoxGrid />  {/* Presentational */}
        <RightPanel />   {/* Presentational */}
      </PanelGroup>
    </Box>
  );
};
```

#### Example: Presentational Component

**GridBox** ([GridBox.tsx:56-294](../../frontend/src/components/grid/GridBox.tsx#L56-L294)):

```tsx
interface GridBoxProps {
  position: number;
  employees: Employee[];
  isExpanded?: boolean;
  isCollapsed?: boolean;
  onSelectEmployee: (employeeId: number) => void;
  onExpand?: () => void;
  onCollapse?: () => void;
}

export const GridBox: React.FC<GridBoxProps> = ({
  position,
  employees,
  isExpanded = false,
  isCollapsed = false,
  onSelectEmployee,
  onExpand,
  onCollapse,
}) => {
  // Only local UI state (drag-drop interaction)
  const { isOver, setNodeRef } = useDroppable({
    id: `grid-${position}`,
    data: { position },
  });

  // Pure rendering based on props
  return (
    <Box ref={setNodeRef} sx={{ /* styling */ }}>
      {employees.map(employee => (
        <EmployeeTile
          key={employee.id}
          employee={employee}
          onSelect={onSelectEmployee}
        />
      ))}
    </Box>
  );
};
```

**When to use which?**
- **Container**: DashboardPage, RightPanel, NineBoxGrid, ExclusionDialog
- **Presentational**: GridBox, EmployeeTile, LoadingSpinner, ConnectionStatus

---

### Compound Component Pattern

**Use when:** Components work together as a cohesive unit (Tabs, Accordion, Menus)

**RightPanel + TabPanel** ([RightPanel.tsx:14-99](../../frontend/src/components/panel/RightPanel.tsx#L14-L99)):

```tsx
// TabPanel helper component (private to RightPanel)
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

// Main component orchestrates tabs
export const RightPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <Box>
      <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
        <Tab label="Details" />
        <Tab label="Changes" />
        <Tab label="Statistics" />
        <Tab label="Intelligence" />
      </Tabs>

      <TabPanel value={activeTab} index={0}>
        <DetailsTab />
      </TabPanel>
      <TabPanel value={activeTab} index={1}>
        <ChangeTrackerTab />
      </TabPanel>
      {/* ... */}
    </Box>
  );
};
```

**Benefits:**
- Tab content only renders when active (performance)
- ARIA attributes handled automatically
- Consistent tab behavior across application

---

### Provider Pattern for Global State

**Use when:** State needs to be accessed by many components across the tree

**SnackbarContext** ([SnackbarContext.tsx:34-123](../../frontend/src/contexts/SnackbarContext.tsx#L34-L123)):

```tsx
// 1. Define context shape
interface SnackbarContextType {
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showInfo: (message: string) => void;
  showWarning: (message: string) => void;
}

// 2. Create context
const SnackbarContext = createContext<SnackbarContextType | undefined>(undefined);

// 3. Provider component manages state
export const SnackbarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [queue, setQueue] = useState<SnackbarMessage[]>([]);
  const [open, setOpen] = useState(false);
  const [currentMessage, setCurrentMessage] = useState<SnackbarMessage | null>(null);

  const showMessage = (message: string, severity: AlertColor) => {
    setQueue(prev => [...prev, { message, severity, key: Date.now() }]);
  };

  const contextValue: SnackbarContextType = {
    showSuccess: (msg) => showMessage(msg, 'success'),
    showError: (msg) => showMessage(msg, 'error'),
    showInfo: (msg) => showMessage(msg, 'info'),
    showWarning: (msg) => showMessage(msg, 'warning'),
  };

  return (
    <SnackbarContext.Provider value={contextValue}>
      {children}
      <Snackbar open={open} autoHideDuration={4000} onClose={handleClose}>
        <Alert severity={currentMessage?.severity}>
          {currentMessage?.message}
        </Alert>
      </Snackbar>
    </SnackbarContext.Provider>
  );
};

// 4. Custom hook for easy access
export const useSnackbar = () => {
  const context = useContext(SnackbarContext);
  if (!context) {
    throw new Error('useSnackbar must be used within SnackbarProvider');
  }
  return context;
};
```

**Usage:**

```tsx
// In app root
<SnackbarProvider>
  <App />
</SnackbarProvider>

// In any component
const { showSuccess, showError } = useSnackbar();

const handleUpload = async () => {
  try {
    await uploadFile();
    showSuccess('File uploaded successfully!');
  } catch (error) {
    showError('Upload failed. Please try again.');
  }
};
```

**Existing Providers:**
- `SnackbarProvider` - Global notifications
- `ThemeProvider` (MUI) - Theme and design tokens
- `I18nextProvider` - Internationalization

---

## When to Create New Components

### Decision Tree

```
Does this UI element appear in 2+ places?
├─ YES → Create reusable component
└─ NO → Is it >50 lines or complex logic?
    ├─ YES → Extract to component (maintainability)
    └─ NO → Keep inline (simplicity)
```

### Reusability Threshold

**Create Component If:**
- Used in 2+ different locations
- Self-contained functionality (can be developed/tested in isolation)
- Clear, single responsibility

**Examples:**
- ✅ **LoadingSpinner** - Used in multiple tabs and dialogs
- ✅ **EmployeeTile** - Used in all 9 grid boxes
- ✅ **ConnectionStatus** - Single use, but complex enough to warrant isolation

**Keep Inline If:**
- Single-use, simple UI (< 20 lines)
- Tightly coupled to parent logic
- No reuse potential

**Examples:**
- ✅ **TabPanel** (in RightPanel.tsx) - Private helper, not exported
- ✅ **Empty state cards** - Specific to each feature

### Complexity Threshold

**Component Size Guidelines:**

| Lines | Recommendation | Action |
|-------|----------------|--------|
| < 50 | Acceptable inline | No action needed |
| 50-100 | Consider extraction | Extract if reusable or complex |
| 100-200 | Should be component | Extract and test separately |
| 200+ | Needs refactoring | Split into smaller components |

**Refactoring Example:**

**Before** (DashboardPage at 292 lines):
```tsx
// Single component handling:
// - Panel resizing logic
// - Layout orchestration
// - File upload state
// - Session management
```

**After** (recommended):
```tsx
// DashboardPage.tsx (orchestration only)
export const DashboardPage: React.FC = () => {
  return (
    <PanelLayout
      header={<AppBarContainer />}
      left={<FilterDrawer />}
      center={<NineBoxGrid />}
      right={<RightPanel />}
    />
  );
};

// PanelLayout.tsx (extracted reusable layout)
interface PanelLayoutProps {
  header: React.ReactNode;
  left: React.ReactNode;
  center: React.ReactNode;
  right: React.ReactNode;
}

export const PanelLayout: React.FC<PanelLayoutProps> = ({...}) => {
  // Panel resizing logic lives here
  // Reusable across different pages
};
```

---

## Common UI Patterns

### 1. Empty State Pattern

**Use when:** No data is available yet (first load, filtered to zero results)

**Structure:**
1. Icon (large, centered, muted color)
2. Heading (describes state)
3. Description (explains what to do)
4. Primary action (if applicable)
5. Optional hint text

**DashboardPage Empty State** ([DashboardPage.tsx:128-188](../../frontend/src/components/dashboard/DashboardPage.tsx#L128-L188)):

```tsx
<Box
  sx={{
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    textAlign: "center",
    p: 4,
  }}
>
  {/* 1. Icon */}
  <Box
    sx={{
      width: 120,
      height: 120,
      borderRadius: "50%",
      backgroundColor: alpha(theme.palette.primary.main, 0.1),
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      mb: 3,
    }}
  >
    <UploadFileIcon sx={{ fontSize: 60, color: "primary.main" }} />
  </Box>

  {/* 2. Heading */}
  <Typography variant="h4" gutterBottom>
    {t("dashboard.noData.title")}
  </Typography>

  {/* 3. Description */}
  <Typography
    variant="body1"
    color="text.secondary"
    sx={{ mb: 4, maxWidth: 400 }}
  >
    {t("dashboard.noData.description")}
  </Typography>

  {/* 4. Primary Action */}
  <Button
    variant="contained"
    size="large"
    startIcon={<CloudUploadIcon />}
    onClick={handleOpenFileDialog}
  >
    {t("dashboard.noData.uploadButton")}
  </Button>

  {/* 5. Hint */}
  <Typography variant="caption" color="text.secondary" sx={{ mt: 2 }}>
    {t("dashboard.noData.hint")}
  </Typography>
</Box>
```

**Simpler Empty State** ([DetailsTab.tsx:24-40](../../frontend/src/components/panel/DetailsTab.tsx#L24-L40)):

```tsx
{!selectedEmployee ? (
  <Box
    sx={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      height: "100%",
      color: "text.disabled",
    }}
  >
    <PersonOutlineIcon sx={{ fontSize: 64, mb: 2 }} />
    <Typography variant="body1">
      {t("panel.details.noSelection")}
    </Typography>
  </Box>
) : (
  <EmployeeDetails employee={selectedEmployee} />
)}
```

**Empty State Checklist:**
- ✅ Icon with muted color (text.disabled or alpha opacity)
- ✅ Translated text (use i18n)
- ✅ Clear call-to-action if user can fix state
- ✅ Avoid technical jargon ("No employees" not "Empty array")

---

### 2. Loading State Pattern

#### Full-Screen Loading (Initial Data Fetch)

**LoadingSpinner Component** ([LoadingSpinner.tsx:15-63](../../frontend/src/components/common/LoadingSpinner.tsx#L15-L63)):

```tsx
interface LoadingSpinnerProps {
  size?: number;
  message?: string;
  overlay?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 40,
  message,
  overlay = false,
}) => {
  const theme = useTheme();

  if (overlay) {
    return (
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: alpha(theme.palette.background.default, 0.8),
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircularProgress size={size} />
        {message && (
          <Typography variant="body2" sx={{ mt: 2 }}>
            {message}
          </Typography>
        )}
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        p: 4,
      }}
    >
      <CircularProgress size={size} />
      {message && (
        <Typography variant="body2" sx={{ mt: 2 }}>
          {message}
        </Typography>
      )}
    </Box>
  );
};
```

**Usage:**

```tsx
// Full-screen with backdrop
<LoadingSpinner overlay message="Loading employees..." />

// Inline section loading
{loading ? (
  <LoadingSpinner />
) : (
  <EmployeeList employees={employees} />
)}
```

#### Inline Loading (Action Feedback)

**Button Loading State** ([FileUploadDialog.tsx:237-240](../../frontend/src/components/common/FileUploadDialog.tsx#L237-L240)):

```tsx
const [uploading, setUploading] = useState(false);

<Button
  variant="contained"
  disabled={uploading}
  startIcon={uploading ? <CircularProgress size={16} /> : <CloudUploadIcon />}
  onClick={handleUpload}
>
  {uploading ? t('common.fileUpload.uploading') : t('common.fileUpload.selectFile')}
</Button>
```

**Pattern Checklist:**
- ✅ Button disabled during loading
- ✅ Icon replaced with small spinner (16px)
- ✅ Text changes to "Loading..." or similar
- ✅ Prevent double-submit

---

### 3. Error Handling Pattern

#### Inline Errors (Form Validation)

```tsx
const [error, setError] = useState<string | null>(null);

{error && (
  <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
    {error}
  </Alert>
)}
```

#### Error Lists with Details

**IntelligenceTab** ([IntelligenceTab.tsx:43-59](../../frontend/src/components/intelligence/IntelligenceTab.tsx#L43-L59)):

```tsx
{error && (
  <Alert severity="error">
    <AlertTitle>{t('errors.failedToLoad')}</AlertTitle>
    <Typography variant="body2">
      {error.message || t('errors.unknownError')}
    </Typography>
  </Alert>
)}
```

#### Global Error Boundary

**ErrorBoundary** ([ErrorBoundary.tsx:22-138](../../frontend/src/components/common/ErrorBoundary.tsx#L22-L138)):

```tsx
class ErrorBoundary extends React.Component<Props, State> {
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log to error reporting service
    console.error('ErrorBoundary caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>
            {t('errors.somethingWentWrong')}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            {t('errors.errorBoundaryMessage')}
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/')}
          >
            {t('errors.returnHome')}
          </Button>
          {/* Error details in dev mode */}
          {import.meta.env.DEV && (
            <Box component="pre" sx={{ mt: 3, textAlign: 'left' }}>
              {this.state.error?.stack}
            </Box>
          )}
        </Box>
      );
    }

    return this.props.children;
  }
}
```

**Usage:**

```tsx
// Wrap app root
<ErrorBoundary>
  <App />
</ErrorBoundary>
```

**Error Handling Checklist:**
- ✅ User-friendly messages (no stack traces in production)
- ✅ Actionable recovery (retry button, navigation home)
- ✅ Log errors with context for debugging
- ✅ Show details only in dev mode

---

### 4. Notification/Snackbar Pattern

**SnackbarContext** ([SnackbarContext.tsx](../../frontend/src/contexts/SnackbarContext.tsx)):

```tsx
const { showSuccess, showError, showInfo, showWarning } = useSnackbar();

// Success
showSuccess(t('common.fileUpload.importSuccess', { filename: 'data.xlsx' }));

// Error
showError(t('errors.fileUploadFailed'));

// Warning
showWarning(t('warnings.missingData'));

// Info
showInfo(t('info.autoSaveEnabled'));
```

**Notification Best Practices:**
- **Success**: Brief confirmation (1-2 words + context)
  - ✅ "Employee saved successfully"
  - ❌ "The employee record has been successfully persisted to the database"
- **Error**: What went wrong + what to do
  - ✅ "Upload failed. Please check file format and try again."
  - ❌ "Error code 500"
- **Warning**: Non-blocking issue + optional action
  - ✅ "Some employees have missing performance ratings. Results may be incomplete."
- **Info**: FYI, no action required
  - ✅ "Changes are auto-saved every 30 seconds"

**Auto-Dismiss Rules:**
- Success: 4s (standard)
- Error: Manual dismiss (user needs time to read and act)
- Warning: Manual dismiss (important context)
- Info: 6s (longer read time acceptable)

---

### 5. Dialog/Modal Pattern

#### Standard Dialog Structure

**SettingsDialog** ([SettingsDialog.tsx:30-239](../../frontend/src/components/settings/SettingsDialog.tsx#L30-L239)):

```tsx
interface SettingsDialogProps {
  open: boolean;
  onClose: () => void;
}

export const SettingsDialog: React.FC<SettingsDialogProps> = ({ open, onClose }) => {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      {/* Header */}
      <DialogTitle>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography variant="h6">
            {t('settings.title')}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <Divider />

      {/* Scrollable Content */}
      <DialogContent>
        {/* Form controls here */}
      </DialogContent>

      {/* Optional Actions */}
      <DialogActions>
        <Button onClick={onClose}>
          {t('common.cancel')}
        </Button>
        <Button variant="contained" onClick={handleSave}>
          {t('common.save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
```

#### Complex Dialog with Search/Filter

**ExclusionDialog** ([ExclusionDialog.tsx](../../frontend/src/components/dashboard/ExclusionDialog.tsx)):

```tsx
<Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
  <DialogTitle>
    {/* Title with close button */}
  </DialogTitle>

  <DialogContent>
    {/* Quick filter buttons */}
    <ButtonGroup size="small" sx={{ mb: 2 }}>
      <Button onClick={() => setQuickFilter('all')}>All</Button>
      <Button onClick={() => setQuickFilter('none')}>None</Button>
    </ButtonGroup>

    {/* Search input */}
    <TextField
      fullWidth
      placeholder={t('search.placeholder')}
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      InputProps={{
        startAdornment: <SearchIcon />
      }}
    />

    {/* Selectable list */}
    <Box sx={{ maxHeight: 400, overflowY: 'auto', mt: 2 }}>
      {filteredEmployees.map(employee => (
        <FormControlLabel
          key={employee.id}
          control={<Checkbox checked={...} onChange={...} />}
          label={employee.name}
        />
      ))}
    </Box>

    {/* Selected count */}
    <Typography variant="caption" color="text.secondary">
      {selectedCount} employees selected
    </Typography>
  </DialogContent>

  <DialogActions>
    <Button onClick={onClose}>Cancel</Button>
    <Button variant="contained" onClick={handleApply}>
      Apply
    </Button>
  </DialogActions>
</Dialog>
```

**Dialog Size Guidelines:**

| Size | Max Width | Use Case |
|------|-----------|----------|
| `xs` | 444px | Simple confirmations, single input |
| `sm` | 600px | Settings, short forms (SettingsDialog) |
| `md` | 900px | Complex forms, lists (ExclusionDialog) |
| `lg` | 1200px | Data tables, multi-step wizards |

**Dialog Checklist:**
- ✅ Controlled by parent's `open` prop
- ✅ Close icon in header (X button)
- ✅ Escape key closes dialog
- ✅ Backdrop click closes dialog (unless critical action)
- ✅ Scrollable content (DialogContent with overflow)
- ✅ Clear actions (Cancel + Primary)
- ✅ Focus management (auto-focus first input)

---

### 6. Form Pattern

#### Standard Form Structure

```tsx
const [formData, setFormData] = useState({
  name: '',
  email: '',
  department: '',
});
const [errors, setErrors] = useState<Record<string, string>>({});
const [submitting, setSubmitting] = useState(false);

const validate = (): boolean => {
  const newErrors: Record<string, string> = {};

  if (!formData.name.trim()) {
    newErrors.name = t('validation.required');
  }

  if (!formData.email.match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)) {
    newErrors.email = t('validation.invalidEmail');
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!validate()) return;

  setSubmitting(true);
  try {
    await saveData(formData);
    showSuccess(t('success.dataSaved'));
    onClose();
  } catch (error) {
    showError(t('errors.saveFailed'));
  } finally {
    setSubmitting(false);
  }
};

return (
  <Box component="form" onSubmit={handleSubmit}>
    <TextField
      fullWidth
      label={t('form.name')}
      value={formData.name}
      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
      error={!!errors.name}
      helperText={errors.name}
      required
      margin="normal"
    />

    <TextField
      fullWidth
      label={t('form.email')}
      type="email"
      value={formData.email}
      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
      error={!!errors.email}
      helperText={errors.email}
      required
      margin="normal"
    />

    <Button
      type="submit"
      variant="contained"
      fullWidth
      disabled={submitting}
      sx={{ mt: 2 }}
    >
      {submitting ? t('common.saving') : t('common.save')}
    </Button>
  </Box>
);
```

**Form Best Practices:**
- ✅ Client-side validation before submit
- ✅ Show errors next to fields (helperText)
- ✅ Disable submit during submission
- ✅ Use `type="email"`, `type="number"` for better mobile UX
- ✅ Mark required fields visually
- ✅ Preserve form state on validation errors

---

### 7. Drag-and-Drop Pattern

**DndContext Wrapper** ([NineBoxGrid.tsx](../../frontend/src/components/grid/NineBoxGrid.tsx)):

```tsx
import { DndContext, DragEndEvent, DragStartEvent } from '@dnd-kit/core';

export const NineBoxGrid: React.FC = () => {
  const [activeEmployee, setActiveEmployee] = useState<Employee | null>(null);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveEmployee(event.active.data.current.employee);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && over.id.startsWith('grid-')) {
      const targetPosition = parseInt(over.id.replace('grid-', ''));
      await moveEmployee(active.data.current.employee.id, targetPosition);
    }

    setActiveEmployee(null);
  };

  const handleDragCancel = () => {
    setActiveEmployee(null);
  };

  return (
    <DndContext
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      {/* Droppable zones */}
      {positions.map(pos => (
        <GridBox key={pos} position={pos} />
      ))}

      {/* Drag overlay (ghost) */}
      <DragOverlay dropAnimation={null}>
        {activeEmployee ? (
          <EmployeeTileGhost employee={activeEmployee} />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};
```

**Draggable Component** ([EmployeeTile.tsx](../../frontend/src/components/grid/EmployeeTile.tsx)):

```tsx
import { useDraggable } from '@dnd-kit/core';

export const EmployeeTile: React.FC<{ employee: Employee }> = ({ employee }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `employee-${employee.id}`,
    data: { employee },
  });

  return (
    <Card
      ref={setNodeRef}
      sx={{
        opacity: isDragging ? 0.5 : 1,
        cursor: 'default',
      }}
    >
      {/* Drag handle */}
      <Box {...listeners} {...attributes} sx={{ cursor: 'grab' }}>
        <DragIndicatorIcon />
      </Box>

      {/* Employee content */}
      <Typography>{employee.name}</Typography>
    </Card>
  );
};
```

**Droppable Component** ([GridBox.tsx](../../frontend/src/components/grid/GridBox.tsx)):

```tsx
import { useDroppable } from '@dnd-kit/core';

export const GridBox: React.FC<{ position: number }> = ({ position }) => {
  const { isOver, setNodeRef } = useDroppable({
    id: `grid-${position}`,
    data: { position },
  });

  return (
    <Box
      ref={setNodeRef}
      sx={{
        backgroundColor: isOver ? 'primary.light' : 'background.paper',
        borderColor: isOver ? 'primary.main' : 'divider',
      }}
    >
      {/* Drop zone content */}
    </Box>
  );
};
```

---

## Component API Design

### Props Naming Conventions

#### Event Handlers

**DO:**
```tsx
interface ButtonProps {
  onClick: () => void;
  onSubmit: (data: FormData) => void;
  onClose: () => void;
}
```

**DON'T:**
```tsx
interface ButtonProps {
  click: () => void;           // Missing 'on' prefix
  handleSubmit: () => void;     // 'handle' is implementation detail
  closeHandler: () => void;     // Inconsistent naming
}
```

#### Boolean Props

**DO:**
```tsx
interface DialogProps {
  open: boolean;
  disabled: boolean;
  isLoading: boolean;    // 'is' prefix acceptable
  hasError: boolean;     // 'has' prefix acceptable
}
```

**DON'T:**
```tsx
interface DialogProps {
  opened: boolean;       // Ambiguous (past tense)
  enable: boolean;       // Use 'disabled' or 'enabled'
  loading: boolean;      // Prefer 'isLoading' for clarity
}
```

#### State Props

**DO:**
```tsx
interface AccordionProps {
  expanded: boolean;           // Current state
  defaultExpanded?: boolean;   // Initial state
  onExpand?: () => void;       // State change handler
}
```

**Pattern:** `value` (controlled) + `defaultValue` (uncontrolled) + `onChange` (handler)

### Required vs Optional Props

**Required Props** (no `?`):
- Core data: `employee`, `employees`, `position`
- Essential callbacks: `onClose`, `onSubmit`
- Critical configuration: `open` (dialogs)

**Optional Props** (with `?`):
- Callbacks that have default behavior
- Visual modifiers: `size`, `variant`, `color`
- Optional content: `title`, `description`, `icon`

```tsx
interface DialogProps {
  // Required
  open: boolean;
  onClose: () => void;

  // Optional
  title?: string;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg';
  children?: React.ReactNode;
}
```

### Default Props Pattern

**Modern (Function Parameters):**

```tsx
interface LoadingSpinnerProps {
  size?: number;
  message?: string;
  overlay?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 40,
  message,
  overlay = false,
}) => {
  // Use destructured defaults
};
```

**Avoid (Legacy defaultProps):**

```tsx
// ❌ Old pattern (deprecated in React 18)
LoadingSpinner.defaultProps = {
  size: 40,
  overlay: false,
};
```

### TypeScript Patterns

#### Interface vs Type

**Use `interface` for:**
- Component props (can be extended)
- Object shapes (can be merged)

```tsx
interface ButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

interface IconButtonProps extends ButtonProps {
  icon: React.ReactNode;
}
```

**Use `type` for:**
- Unions and intersections
- Primitive aliases
- Mapped types

```tsx
type Status = 'idle' | 'loading' | 'success' | 'error';

type Callback = () => void;

type PartialEmployee = Partial<Employee>;
```

#### Generic Components

```tsx
interface ListProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  keyExtractor: (item: T) => string | number;
}

export const List = <T,>({ items, renderItem, keyExtractor }: ListProps<T>) => {
  return (
    <Box>
      {items.map(item => (
        <Box key={keyExtractor(item)}>
          {renderItem(item)}
        </Box>
      ))}
    </Box>
  );
};

// Usage
<List
  items={employees}
  renderItem={(employee) => <EmployeeTile employee={employee} />}
  keyExtractor={(employee) => employee.id}
/>
```

---

## Reusable Hooks

### Custom Hook Patterns

#### Data Fetching Hook

**useEmployees** ([useEmployees.ts:18-103](../../frontend/src/hooks/useEmployees.ts#L18-L103)):

```tsx
export const useEmployees = () => {
  const { sessionId, employees } = useSession();
  const { applyFilters } = useFilters();
  const { selectedEmployeeId, selectEmployee } = useSessionStore();

  // Memoized filtering
  const filteredEmployees = useMemo(() => {
    return applyFilters(employees);
  }, [employees, applyFilters]);

  // Memoized grouping
  const employeesByPosition = useMemo(() => {
    const grouped: Record<number, Employee[]> = {};
    for (let i = 1; i <= 9; i++) grouped[i] = [];

    filteredEmployees.forEach(emp => {
      const position = calculatePosition(emp.performance, emp.potential);
      grouped[position].push(emp);
    });

    return grouped;
  }, [filteredEmployees]);

  // Actions
  const moveEmployee = async (id: number, position: number) => {
    // API call + state update
  };

  return {
    employees: filteredEmployees,
    employeesByPosition,
    moveEmployee,
    selectEmployee,
    selectedEmployeeId,
  };
};
```

#### UI State Hook

**useConnectionStatus** ([useConnectionStatus.ts](../../frontend/src/hooks/useConnectionStatus.ts)):

```tsx
export const useConnectionStatus = () => {
  const [status, setStatus] = useState<'connected' | 'reconnecting' | 'disconnected'>('connected');
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const response = await fetch('/api/health');
        if (response.ok) {
          setStatus('connected');
          setRetryCount(0);
        } else {
          setStatus('reconnecting');
        }
      } catch {
        setStatus('disconnected');
      }
    };

    const interval = setInterval(checkConnection, 5000);
    return () => clearInterval(interval);
  }, []);

  const manualRetry = async () => {
    setRetryCount(prev => prev + 1);
    // ... retry logic
  };

  return { status, retryCount, manualRetry };
};
```

### Hook Best Practices

**DO:**
- ✅ Name with `use` prefix (`useEmployees`, not `getEmployees`)
- ✅ Return object for named values (`{ employees, loading }`)
- ✅ Return array for positional values (`[value, setValue]`)
- ✅ Memoize expensive computations (`useMemo`)
- ✅ Memoize callbacks passed to children (`useCallback`)

**DON'T:**
- ❌ Call hooks conditionally
- ❌ Call hooks in loops
- ❌ Call hooks in event handlers
- ❌ Return too many values (max 5-6)

---

## Best Practices Summary

### Performance Optimization

**1. Memoization**
```tsx
// Memoize expensive computations
const sortedEmployees = useMemo(() => {
  return [...employees].sort((a, b) => a.name.localeCompare(b.name));
}, [employees]);

// Memoize callbacks
const handleSelect = useCallback((id: number) => {
  setSelectedId(id);
}, []);
```

**2. Lazy Loading**
```tsx
const IntelligenceTab = lazy(() => import('./components/panel/IntelligenceTab'));

<Suspense fallback={<LoadingSpinner />}>
  <IntelligenceTab />
</Suspense>
```

**3. Virtualization** (for long lists)
```tsx
// Consider react-window or react-virtualized for 100+ items
```

### Accessibility

**1. Semantic HTML**
```tsx
// ✅ Good
<button onClick={handleClick}>Click me</button>

// ❌ Bad
<div onClick={handleClick}>Click me</div>
```

**2. ARIA Labels**
```tsx
<IconButton
  aria-label={t('common.close')}
  onClick={onClose}
>
  <CloseIcon />
</IconButton>
```

**3. Keyboard Navigation**
```tsx
<Box
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick();
    }
  }}
>
```

### Internationalization

**Always use translation keys:**

```tsx
// ✅ Good
<Typography>{t('dashboard.title')}</Typography>

// ❌ Bad
<Typography>Dashboard</Typography>
```

**With interpolation:**

```tsx
showSuccess(t('success.fileSaved', { filename: 'data.xlsx' }));
// Translation: "File {{filename}} saved successfully"
```

---

## Anti-Patterns to Avoid

### 1. Prop Drilling

**Problem:**
```tsx
<DashboardPage employees={employees}>
  <NineBoxGrid employees={employees}>
    <GridBox employees={filteredEmployees}>
      <EmployeeTile employee={employee} />
    </GridBox>
  </NineBoxGrid>
</DashboardPage>
```

**Solution:** Use hooks to access data directly
```tsx
// In EmployeeTile
const { employees } = useEmployees();  // Access directly from hook
```

### 2. Too Many State Variables

**Problem:**
```tsx
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
const [success, setSuccess] = useState(false);
const [data, setData] = useState<Data | null>(null);
```

**Solution:** Use reducer or combined state
```tsx
type State =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: Data }
  | { status: 'error'; error: string };

const [state, setState] = useState<State>({ status: 'idle' });
```

### 3. Missing Keys in Lists

**Problem:**
```tsx
{employees.map((emp, index) => (
  <EmployeeTile key={index} employee={emp} />  // ❌ Index as key
))}
```

**Solution:**
```tsx
{employees.map(emp => (
  <EmployeeTile key={emp.id} employee={emp} />  // ✅ Stable ID
))}
```

### 4. Inline Function Definitions

**Problem:**
```tsx
<Button onClick={() => handleClick(id)}>Click</Button>
// Creates new function on every render
```

**Solution:**
```tsx
const onClick = useCallback(() => handleClick(id), [id]);
<Button onClick={onClick}>Click</Button>
```

---

## Testing Components

### Unit Testing Pattern

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@/test/utils';
import { Button } from './Button';

describe('Button', () => {
  it('renders label when provided', () => {
    render(<Button label="Click me" />);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick handler when clicked', () => {
    const handleClick = vi.fn();
    render(<Button label="Click" onClick={handleClick} />);

    fireEvent.click(screen.getByRole('button'));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('disables button when disabled prop is true', () => {
    render(<Button label="Click" disabled />);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

---

## State Management Patterns

### Component State Machines

State machines provide predictable, testable state transitions for complex components. This section documents the state definitions and transitions for key components.

#### NineBoxGrid Component Hierarchy

```
NineBoxGrid (container)
├── GridAxes (axis labels)
├── GridBox[] (9 instances)
│   ├── BoxHeader (label, count, controls)
│   ├── EmployeeTileList (layout wrapper)
│   │   └── EmployeeTile[] (draggable cards)
│   └── DropZone (drag target)
└── DragOverlay (active drag item)
```

### NineBoxGrid States

#### View Mode State

```typescript
type ViewMode = 'normal' | 'donut' | 'compact';
```

**State Definitions:**
- `normal` - Standard 3x3 grid with all employees
- `donut` - Calibration mode, shows only position 5 employees
- `compact` - Smaller grid for embedded views (future)

**State Transitions:**
- User clicks "Donut Mode" toggle → `normal` ↔ `donut`
- Mode persists in session store

**Implementation:** View mode state is managed by session store and drives conditional rendering of the grid.

#### Drag State

```typescript
type DragState = 'idle' | 'dragging' | 'dragOver';
```

**State Definitions:**
- `idle` - No drag operation in progress
- `dragging` - User is dragging an employee tile
- `dragOver` - Dragged item is over a drop target

**State Transitions:**
- User starts drag → `idle` → `dragging`
- User moves over GridBox → `dragging` → `dragOver`
- User releases or cancels → any state → `idle`

**Implementation:** Drag state is managed by `@dnd-kit` library with visual feedback (opacity changes, drop zone highlights).

### GridBox States

#### Expansion State

```typescript
type ExpansionState = 'normal' | 'expanded' | 'collapsed';
```

**State Definitions:**
- `normal` - Default size (150-400px height)
- `expanded` - Full viewport height, multi-column layout
- `collapsed` - Minimal size (60-80px), shows label only

**State Transitions:**
- User clicks expand button → `normal` → `expanded`
- User clicks collapse button → `expanded` → `normal`
- Another box expands → `normal` → `collapsed` (automatic)
- ESC key pressed → `expanded` → `normal` (all boxes)

**Persistence:** Expanded position saved to localStorage (`nineBoxExpandedPosition`) and restored on app reload.

**Implementation Example:**

```tsx
// In NineBoxGrid.tsx
const [expandedPosition, setExpandedPosition] = useState<number | null>(null);

// Load from localStorage on mount
useEffect(() => {
  const saved = localStorage.getItem('nineBoxExpandedPosition');
  if (saved) setExpandedPosition(parseInt(saved));
}, []);

// Save to localStorage on change
useEffect(() => {
  if (expandedPosition !== null) {
    localStorage.setItem('nineBoxExpandedPosition', expandedPosition.toString());
  } else {
    localStorage.removeItem('nineBoxExpandedPosition');
  }
}, [expandedPosition]);

// Pass to GridBox components
<GridBox
  position={1}
  isExpanded={expandedPosition === 1}
  isCollapsed={expandedPosition !== null && expandedPosition !== 1}
  onExpand={() => setExpandedPosition(1)}
  onCollapse={() => setExpandedPosition(null)}
/>
```

### State Management Best Practices

**DO:**
- ✅ Use TypeScript union types for state enums
- ✅ Document all valid states and transitions
- ✅ Handle ESC key for collapsing expanded states
- ✅ Persist user preferences to localStorage
- ✅ Restore state on component mount
- ✅ Clear invalid state on unmount

**DON'T:**
- ❌ Allow invalid state combinations (use discriminated unions)
- ❌ Mutate state directly (use setState)
- ❌ Store derived state (compute from source state)
- ❌ Forget to handle loading/error states

**Related Files:**
- [NineBoxGrid.tsx](../../frontend/src/components/grid/NineBoxGrid.tsx) - Main grid container
- [GridBox.tsx](../../frontend/src/components/grid/GridBox.tsx) - Individual grid boxes
- [BoxHeader.tsx](../../frontend/src/components/grid/BoxHeader.tsx) - Box headers with expand/collapse controls
- [EmployeeTileList.tsx](../../frontend/src/components/grid/EmployeeTileList.tsx) - Tile layout wrapper

---

## Related Documentation

- **[Component Inventory](component-inventory.md)** - Catalog of all components
- **[Design Principles](design-principles.md)** - Core design philosophy
- **[Layout Patterns](layout-patterns.md)** - Where components live
- **[Interaction Patterns](interaction-patterns.md)** - How components behave
- **[Accessibility Standards](accessibility-standards.md)** - WCAG compliance

---

**Next Steps:**
- Extract `PanelLayout` component from DashboardPage
- Create reusable `EmptyState` component
- Add Storybook stories for all common components
- Document component testing patterns
