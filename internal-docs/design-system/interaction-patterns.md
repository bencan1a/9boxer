# Interaction Patterns

**Part of:** [9Boxer Design System](README.md)
**Related:** [Layout Patterns](layout-patterns.md) | [Design Principles](design-principles.md)
**Last Updated:** 2025-12-24

---

## Overview

This document defines the interaction patterns for the 9Boxer application, covering animations, transitions, user feedback, drag-and-drop mechanics, hover states, and keyboard shortcuts. These patterns ensure a consistent, responsive, and delightful user experience.

**Core Interaction Philosophy:**
- **Immediate Feedback** - Users see response within 100ms
- **Smooth Transitions** - Natural, physics-based motion (ease-in-out)
- **Clear States** - Visual distinction between idle, hover, active, disabled
- **Keyboard First** - All interactions accessible via keyboard
- **Graceful Performance** - Animations respect user preferences and device capabilities

---

## Animation & Transition Standards

### Transition Duration System

**Standard Durations** (from design tokens):

```typescript
const duration = {
  fast: '0.15s',      // Quick feedback (button press, tooltip)
  normal: '0.3s',     // Standard transitions (expand, hover, color change)
  slow: '0.5s',       // Deliberate transitions (modal enter/exit)
};
```

**Current Implementation** (standardized values):

| Duration | Use Cases | Examples |
|----------|-----------|----------|
| **0.2s** | Quick UI feedback | Panel resize handle color change |
| **0.3s** | Standard interactions | Grid box expansion, button hover, drawer slide |
| **0.5s** | Deliberate actions | Large modal animations |
| **1.5s** | Feedback delays | Auto-close after success message |
| **4s** | Notification persistence | Snackbar auto-hide duration |

### Easing Functions

**Primary Easing:** `ease-in-out`

```typescript
const easing = {
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',  // Material Design standard
  // Smooth acceleration and deceleration
};
```

**Why ease-in-out?**
- Feels natural (starts slow, speeds up, slows down)
- Matches Material Design specifications
- Consistent across all animations

### Transition Properties Pattern

**Grid Box Expansion** ([GridBox.tsx:119-120](../../frontend/src/components/grid/GridBox.tsx#L119-L120)):

```typescript
transition:
  "min-height 0.3s ease-in-out, " +
  "max-height 0.3s ease-in-out, " +
  "opacity 0.3s ease-in-out, " +
  "background-color 0.3s ease-in-out, " +
  "border-color 0.3s ease-in-out, " +
  "border-style 0.3s ease-in-out, " +
  "box-shadow 0.3s ease-in-out"
```

**Best Practice:** Always specify which properties to transition (never use `all` for performance).

### Grid Layout Resizing

**Grid Layout Transitions** ([NineBoxGrid.tsx:241-242](../../frontend/src/components/grid/NineBoxGrid.tsx#L241-L242)):

```typescript
transition:
  "grid-template-columns 0.3s ease-in-out, " +
  "grid-template-rows 0.3s ease-in-out, " +
  "gap 0.3s ease-in-out"
```

**When a box expands:**
1. Grid columns/rows animate smoothly (0.3s)
2. Gap between boxes adjusts (0.3s)
3. Box itself expands with height/opacity change (0.3s)
4. All transitions synchronized for smooth experience

---

## Drag-and-Drop Patterns

### Drag Mechanics

**Library:** `@dnd-kit/core` (modern, accessible drag-and-drop)

**Draggable Element:** EmployeeTile ([EmployeeTile.tsx](../../frontend/src/components/grid/EmployeeTile.tsx))

```typescript
const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
  id: `employee-${employee.id}`,
  data: { employee, sourcePosition },
});
```

### Visual Feedback During Drag

#### 1. Source Tile (Being Dragged)

**Opacity Reduction** ([EmployeeTile.tsx:57](../../frontend/src/components/grid/EmployeeTile.tsx#L57)):

```typescript
opacity: isDragging ? 0.5 : 1  // 50% transparent while dragging
```

**Cursor States** ([EmployeeTile.tsx:81,85-86](../../frontend/src/components/grid/EmployeeTile.tsx#L81)):

```typescript
cursor: "grab"        // Idle state
"&:active": {
  cursor: "grabbing"  // Active dragging state
}
```

#### 2. Drag Handle Visual

**Drag Indicator Icon** (left border of tile):

```typescript
<DragIndicatorIcon
  sx={{
    color: "text.secondary",
    fontSize: 20,
    opacity: 0.6,
    mr: 1,
  }}
  {...listeners}  // Only the handle is draggable
/>
```

**Why a drag handle?**
- Prevents accidental drags when scrolling
- Clear affordance (visual cue) for draggability
- Accessibility: explicit interaction point

#### 3. Drag Overlay (Ghost Image)

**Ghost Tile** ([NineBoxGrid.tsx:263-298](../../frontend/src/components/grid/NineBoxGrid.tsx#L263-L298)):

```typescript
<DragOverlay dropAnimation={null}>
  {activeEmployee ? (
    <Card sx={{
      opacity: 0.9,          // Slightly transparent
      boxShadow: 6,          // High elevation (feels "lifted")
      cursor: "grabbing",
      display: "flex",
      mb: 1,
      borderLeft: activeEmployee.modified_in_session ? 4 : 0,
    }}>
      {/* Full tile content mirrored here */}
    </Card>
  ) : null}
</DragOverlay>
```

**Design Decisions:**
- **No drop animation** (`dropAnimation={null}`) - instant feedback
- **High shadow** (6) - clearly elevated above content
- **90% opacity** - shows it's a "ghost"
- **Cursor: grabbing** - reinforces drag state

### Drop Zone Feedback

**Drop Target:** GridBox ([GridBox.tsx](../../frontend/src/components/grid/GridBox.tsx))

```typescript
const { isOver, setNodeRef } = useDroppable({
  id: `grid-${position}`,
  data: { position },
});
```

#### Visual States (Normal Box)

**When dragging over** ([GridBox.tsx:116-118](../../frontend/src/components/grid/GridBox.tsx#L116-L118)):

```typescript
backgroundColor: isOver
  ? alpha(theme.palette.primary.main, 0.15)  // Light blue tint
  : alpha(bgColor, 0.5)

borderColor: isOver
  ? "primary.main"   // Blue border
  : "divider"        // Gray border
```

#### Visual States (Collapsed Box)

**When dragging over collapsed box** ([GridBox.tsx:132-134](../../frontend/src/components/grid/GridBox.tsx#L132-L134)):

```typescript
opacity: isOver
  ? OPACITY.COLLAPSED_DRAG_OVER  // 1.0 (full opacity)
  : OPACITY.COLLAPSED_IDLE       // 0.7 (subtle)

backgroundColor: isOver
  ? "primary.light"              // Bright highlight
  : alpha(bgColor, 0.5)          // Muted

borderStyle: isOver
  ? "dashed"                     // Dashed border (clear target)
  : "solid"                      // Normal border
```

**Why dashed border on collapsed boxes?**
- Stronger visual cue (collapsed = less space = needs emphasis)
- Clearly distinguishes "drop zone active" state
- Accessibility: multiple visual cues (color + pattern + opacity)

### Drag Event Flow

**Drag Lifecycle** ([NineBoxGrid.tsx:45-85](../../frontend/src/components/grid/NineBoxGrid.tsx#L45-L85)):

```typescript
// 1. User starts dragging
onDragStart(event) {
  setActiveEmployee(event.active.data.current.employee);
  // Ghost overlay appears
}

// 2. User drops on a target
onDragEnd(event) {
  const { active, over } = event;
  if (over && over.id.startsWith("grid-")) {
    const targetPosition = parseInt(over.id.replace("grid-", ""));
    // Call API to move employee
    await moveEmployee(active.data.current.employee.id, targetPosition);
  }
  setActiveEmployee(null);  // Remove ghost
}

// 3. User cancels (Escape key or drag outside)
onDragCancel() {
  setActiveEmployee(null);  // Remove ghost
}
```

### Drag-and-Drop Best Practices

**DO:**
- ✅ Provide immediate visual feedback (opacity, cursor)
- ✅ Use distinct drop zone states (hover highlights)
- ✅ Show a ghost overlay that follows cursor
- ✅ Support keyboard alternative (cut/paste with Ctrl+X/V)
- ✅ Validate drop targets (prevent invalid moves)
- ✅ Provide undo functionality after drop

**DON'T:**
- ❌ Make entire tile draggable (use explicit handle)
- ❌ Delay visual feedback (instant response)
- ❌ Use complex drop animations (confusing)
- ❌ Forget to clear drag state on cancel

---

## Feedback Mechanisms

### Loading States

#### 1. Full-Screen Loading (Initial Load)

**LoadingSpinner Component** ([LoadingSpinner.tsx](../../frontend/src/components/common/LoadingSpinner.tsx)):

```typescript
<LoadingSpinner overlay />
```

**Visual:** Centered CircularProgress (40px) with semi-transparent backdrop.

```typescript
// Overlay mode
<Box sx={{
  position: "fixed",
  top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: alpha(theme.palette.background.default, 0.8),  // 80% opacity
  zIndex: 9999,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
}}>
  <CircularProgress size={40} />
</Box>
```

**Usage:**
- Tab content loading (Statistics, Intelligence)
- Initial data fetch

#### 2. Inline Loading (Action Feedback)

**Button Loading State** ([FileUploadDialog.tsx:237](../../frontend/src/components/common/FileUploadDialog.tsx#L237)):

```typescript
<Button
  disabled={uploading}
  startIcon={uploading ? <CircularProgress size={16} /> : <CloudUploadIcon />}
>
  {uploading ? t('common.fileUpload.uploading') : t('common.fileUpload.selectFile')}
</Button>
```

**Pattern:**
- Button disabled during action
- Icon replaced with small spinner (16px)
- Text changes to "Uploading..."

#### 3. Section Loading

**Content Area Loading:**

```typescript
{loading ? (
  <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
    <CircularProgress />
  </Box>
) : (
  <ContentComponent data={data} />
)}
```

### Notification System

**Snackbar Context** ([SnackbarContext.tsx](../../frontend/src/contexts/SnackbarContext.tsx)):

```typescript
// Usage
const { showSuccess, showError, showInfo, showWarning } = useSnackbar();

showSuccess(t('common.fileUpload.importSuccess', { filename: 'employees.xlsx' }));
showError(t('errors.fileUploadFailed'));
```

**Configuration:**

| Property | Value | Rationale |
|----------|-------|-----------|
| **Auto-hide Duration** | 4000ms (4s) | Long enough to read, not intrusive |
| **Position** | Bottom center | Non-blocking, visible, standard |
| **Transition** | Slide up | Natural entry from bottom |
| **Queue** | FIFO | Multiple messages show sequentially |
| **Queue Delay** | 100ms | Brief pause between messages |

**Severity Variants:**

```typescript
// Success (green)
<Alert severity="success" onClose={handleClose}>
  File uploaded successfully!
</Alert>

// Error (red)
<Alert severity="error" onClose={handleClose}>
  Upload failed. Please try again.
</Alert>

// Warning (orange)
<Alert severity="warning">
  Some employees have missing data.
</Alert>

// Info (blue)
<Alert severity="info">
  No data available. Upload a file to get started.
</Alert>
```

### Success Feedback with Auto-Close

**Pattern** ([FileUploadDialog.tsx:131-137](../../frontend/src/components/common/FileUploadDialog.tsx#L131-L137)):

```typescript
// 1. Show success notification
showSuccess(t('common.fileUpload.importSuccess', { filename: selectedFile.name }));

// 2. Wait 1.5s for user to read
setTimeout(() => {
  onClose();              // Close dialog
  setSelectedFile(null);  // Reset state
  setSuccess(false);
}, 1500);
```

**Why 1.5s delay?**
- Gives user time to see success message
- Feels deliberate, not abrupt
- Standard "success celebration" duration

### Error Handling Patterns

#### Inline Errors (Form Validation)

```typescript
{error && (
  <Alert severity="error" sx={{ mb: 2 }}>
    {error}
  </Alert>
)}
```

#### Error Lists with Title

**Intelligence Tab Errors** ([IntelligenceTab.tsx:43-59](../../frontend/src/components/intelligence/IntelligenceTab.tsx#L43-L59)):

```typescript
<Alert severity="error">
  <AlertTitle>Failed to load intelligence data</AlertTitle>
  <Typography variant="body2">
    {error.message}
  </Typography>
</Alert>
```

### Progress Indicators

#### Determinate Progress (Known Duration)

**Position Distribution Bars** ([StatisticsTab.tsx:222-226](../../frontend/src/components/panel/StatisticsTab.tsx#L222-L226)):

```typescript
<LinearProgress
  variant="determinate"
  value={percentage}
  sx={{ height: 8, borderRadius: 4 }}
/>
```

**Use when:** Process has known steps or percentage (file upload, processing)

#### Indeterminate Progress (Unknown Duration)

```typescript
<CircularProgress />  // Default: indeterminate
```

**Use when:** Waiting for server response, loading data

---

## Hover & Focus States

### Button Hover States

#### Standard Button Hover

**MUI Default:** Slight background color change

```typescript
// Defined in theme.ts MuiButton overrides
"&:hover": {
  backgroundColor: darken(theme.palette.primary.main, 0.1),
}
```

#### Icon Button Hover

**Expand Box Button** ([GridBox.tsx:253-266](../../frontend/src/components/grid/GridBox.tsx#L253-L266)):

```typescript
// Normal state
opacity: OPACITY.EXPAND_BUTTON_IDLE  // 0.6

// Hover state
"&:hover": {
  opacity: OPACITY.EXPAND_BUTTON_ACTIVE,  // 1.0
  backgroundColor: alpha(theme.palette.primary.main, 0.1),
}
```

**Pattern:** Opacity + subtle background tint

#### Collapsed Box Button Hover

**Stronger Background Highlight** ([GridBox.tsx:189-203](../../frontend/src/components/grid/GridBox.tsx#L189-L203)):

```typescript
"&:hover": {
  backgroundColor: alpha(theme.palette.primary.main, 0.1),  // 10% blue tint
}
```

### Card/Tile Hover States

#### Employee Tile Hover

**Shadow Elevation Change** ([EmployeeTile.tsx:63-65](../../frontend/src/components/grid/EmployeeTile.tsx#L63-L65)):

```typescript
boxShadow: 1,  // Base elevation

"&:hover": {
  boxShadow: 3,  // Raised elevation (subtle lift)
}
```

**Why shadow instead of background?**
- Preserves color-coded backgrounds (modified indicators)
- Subtle "lift" feels tactile
- Distinguishes from selection (which uses border)

#### List Item Hover

**Anomaly Details Row** ([AnomalySection.tsx:181](../../frontend/src/components/intelligence/AnomalySection.tsx#L181)):

```typescript
"&:hover": {
  backgroundColor: alpha(theme.palette.text.primary, 0.04),  // Very subtle
}
```

**Why 4% opacity?**
- Doesn't obscure content
- Visible but not distracting
- Standard Material Design hover state

### Interactive Element Hover

#### Panel Resize Handle

**Color Change on Hover** ([DashboardPage.tsx:220-223](../../frontend/src/components/dashboard/DashboardPage.tsx#L220-L223)):

```typescript
backgroundColor: theme.palette.divider,  // Gray (idle)
transition: "background-color 0.2s",

"&:hover": {
  backgroundColor: theme.palette.primary.main,  // Blue (hover)
}
```

**Why color change?**
- Small target (5px wide) needs strong visual feedback
- Color draws eye to interactive area
- Fast transition (0.2s) feels responsive

### Focus States

#### Keyboard Navigation

**MUI Default Focus Rings:**
- Outline: 2px solid primary color
- Offset: 2px from element
- Visible only on keyboard focus (not mouse click)

**Custom Focus Styling:**

```typescript
"&:focus-visible": {
  outline: `2px solid ${theme.palette.primary.main}`,
  outlineOffset: 2,
}
```

**Accessibility Requirement:**
- Focus indicators MUST have 3:1 contrast ratio (WCAG 2.1 Level AA)
- Focus MUST be visible on all interactive elements

#### Tab Order

**Logical Tab Sequence:**
1. Top Toolbar (File, View, Zoom, Settings)
2. Filter Drawer controls (Search, Department, Level)
3. Grid boxes (9 boxes, 1-9 in reading order)
4. Employee tiles within focused box
5. Right Panel tabs
6. Right Panel content

**Skip Links:** Not currently implemented (potential improvement)

---

## Keyboard Shortcuts

### Global Shortcuts

**Zoom Controls** ([ZoomControls.tsx:98-124](../../frontend/src/components/common/ZoomControls.tsx#L98-L124)):

| Shortcut | Action | Handler |
|----------|--------|---------|
| `Ctrl/Cmd + Plus (+)` | Zoom In | Increase zoom by 10% |
| `Ctrl/Cmd + Minus (-)` | Zoom Out | Decrease zoom by 10% |
| `Ctrl/Cmd + 0` | Reset Zoom | Reset to 100% |
| `F11` | Toggle Full-Screen | Enter/exit full-screen mode |
| `Ctrl/Cmd + Scroll Up` | Zoom In | Mouse wheel zoom |
| `Ctrl/Cmd + Scroll Down` | Zoom Out | Mouse wheel zoom |

**Implementation Pattern:**

```typescript
useEffect(() => {
  const handleKeyDown = (event: KeyboardEvent) => {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const modifier = isMac ? event.metaKey : event.ctrlKey;

    if (modifier && event.key === '=') {  // Plus/Equals key
      event.preventDefault();
      handleZoomIn();
    }
    // ... other shortcuts
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, []);
```

### Context Shortcuts

**Grid Navigation** ([NineBoxGrid.tsx:100-111](../../frontend/src/components/grid/NineBoxGrid.tsx#L100-L111)):

| Shortcut | Action | Context |
|----------|--------|---------|
| `Escape` | Collapse Expanded Box | When a box is expanded |

**Dialog Shortcuts:**

| Shortcut | Action | Context |
|----------|--------|---------|
| `Escape` | Close Dialog | All dialogs (FileUploadDialog, SettingsDialog) |
| `Enter` | Confirm Action | Dialog with primary button focused |
| `Tab` | Navigate Controls | Cycle through dialog inputs/buttons |

### Keyboard Shortcut Best Practices

**DO:**
- ✅ Use standard conventions (Ctrl+C, Ctrl+V, etc.)
- ✅ Show shortcuts in tooltips or help text
- ✅ Prevent default browser behavior when overriding
- ✅ Support both Ctrl (Windows/Linux) and Cmd (Mac)
- ✅ Provide visual feedback when shortcut triggered

**DON'T:**
- ❌ Override browser shortcuts (Ctrl+T, Ctrl+W)
- ❌ Use single-letter shortcuts without modifier
- ❌ Forget to document shortcuts in UI
- ❌ Make shortcuts discoverable only through documentation

---

## State Indicators

### Employee Modification States

**Modified in Current Session** ([EmployeeTile.tsx:53](../../frontend/src/components/grid/EmployeeTile.tsx#L53)):

```typescript
// Visual: 4px left border (secondary color)
borderLeft: employee.modified_in_session ? 4 : 0,
borderLeftColor: "secondary.main",  // Orange

// Chip indicator
{employee.modified_in_session && (
  <Chip
    label="Modified"
    size="small"
    color="secondary"
  />
)}
```

**Donut Mode Modification** ([EmployeeTile.tsx:59-62,113-125](../../frontend/src/components/grid/EmployeeTile.tsx#L59-L62)):

```typescript
// Visual: 4px left border (purple) + reduced opacity
borderLeft: isDonutModified ? 4 : 0,
borderLeftColor: "#9c27b0",  // Purple (should be token)
opacity: isDonutModified ? 0.7 : 1,

// Chip indicator
{isDonutModified && (
  <Chip
    label="Donut"
    size="small"
    sx={{
      backgroundColor: "#9c27b0",  // Purple
      color: "white",
    }}
  />
)}
```

**Why two types of modifications?**
- **Modified** (orange) = Changed in this session (any mode)
- **Donut** (purple) = Changed specifically in donut mode (special edit mode)

### Grid Box States

| State | Visual | When |
|-------|--------|------|
| **Normal** | Default background, standard height | Default state |
| **Collapsed** | 60-80px height, 70% opacity, centered content | Space-saving mode |
| **Expanded** | Max height (vh - 250px), shadow 4, scrollable | Focus mode |
| **Drag Over** | Blue border, light blue background | Dragging employee over box |
| **Drag Over (Collapsed)** | Dashed border, bright blue background, full opacity | Dragging over collapsed box |

**Implementation** ([GridBox.tsx:126-148](../../frontend/src/components/grid/GridBox.tsx#L126-L148)):

```typescript
// Collapsed state
sx={{
  minHeight: BOX_HEIGHTS.COLLAPSED_MIN,
  maxHeight: BOX_HEIGHTS.COLLAPSED_MAX,
  opacity: OPACITY.COLLAPSED_IDLE,        // 0.7
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
}}

// Expanded state
sx={{
  maxHeight: `calc(100vh - ${BOX_HEIGHTS.EXPANDED_VIEWPORT_OFFSET}px)`,
  boxShadow: 4,
  overflowY: "auto",
}}
```

### Connection Status

**Backend Connection Indicator** ([ConnectionStatus.tsx](../../frontend/src/components/common/ConnectionStatus.tsx)):

- **Connected:** Green dot, "Connected" text
- **Disconnected:** Red dot, "Disconnected" text, boxShadow highlight
- **Connecting:** Yellow dot, "Connecting..." text

**Why always visible?**
- Critical system status
- Users need to know if actions will work
- Positioned fixed (top-right, non-blocking)

---

## Implementation Guidelines

### Adding New Animations

**Checklist:**

1. **Use Standard Durations**
   ```typescript
   transition: `opacity ${theme.tokens.duration.normal} ${theme.tokens.easing.easeInOut}`
   ```

2. **Specify Properties** (never use `all`)
   ```typescript
   // ✅ Good
   transition: "background-color 0.3s, color 0.3s"

   // ❌ Bad (forces reflow)
   transition: "all 0.3s"
   ```

3. **Test Performance**
   - Avoid animating `width`, `height`, `top`, `left` (triggers layout)
   - Prefer `transform`, `opacity` (GPU-accelerated)

4. **Respect User Preferences**
   ```typescript
   const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

   <Box sx={{
     transition: prefersReducedMotion ? 'none' : 'opacity 0.3s ease-in-out'
   }} />
   ```

### Adding Drag-and-Drop

**Pattern:**

```typescript
// 1. Wrap with DndContext
<DndContext onDragStart={...} onDragEnd={...} onDragCancel={...}>

  // 2. Create draggable
  const { setNodeRef, listeners, isDragging } = useDraggable({
    id: 'unique-id',
    data: { yourData },
  });

  <div ref={setNodeRef} {...listeners}>Drag me</div>

  // 3. Create droppable
  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: 'drop-zone',
  });

  <div ref={setDropRef}>Drop here</div>

  // 4. Add DragOverlay
  <DragOverlay>
    {activeItem ? <YourGhostComponent item={activeItem} /> : null}
  </DragOverlay>

</DndContext>
```

### Adding Loading States

**Pattern:**

```typescript
const [loading, setLoading] = useState(false);

const handleAction = async () => {
  setLoading(true);
  try {
    await performAction();
    showSuccess('Action completed!');
  } catch (error) {
    showError('Action failed. Please try again.');
  } finally {
    setLoading(false);
  }
};

// UI
<Button
  disabled={loading}
  startIcon={loading ? <CircularProgress size={16} /> : <ActionIcon />}
>
  {loading ? 'Processing...' : 'Perform Action'}
</Button>
```

### Adding Notifications

**Pattern:**

```typescript
import { useSnackbar } from '@/contexts/SnackbarContext';

const { showSuccess, showError, showWarning, showInfo } = useSnackbar();

// Success
showSuccess('Employee moved successfully!');

// Error with details
showError(`Failed to save: ${error.message}`);

// Warning
showWarning('Some employees have missing performance ratings.');

// Info
showInfo('Tip: Press F11 for full-screen mode.');
```

---

## Accessibility Considerations

### Motion Sensitivity

**Respect `prefers-reduced-motion`:**

```typescript
const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

<Box sx={{
  transition: prefersReducedMotion
    ? 'none'
    : 'transform 0.3s ease-in-out',
}} />
```

**When to disable animations:**
- User has system-wide reduced motion enabled
- Low-end devices (check performance)
- Critical actions (don't delay user with animations)

### Keyboard Accessibility

**All interactive elements MUST:**
- Be keyboard accessible (Tab, Enter, Space)
- Show clear focus indicators (3:1 contrast ratio)
- Support Escape to cancel/close
- Maintain logical tab order

### Screen Reader Support

**Drag-and-Drop Announcements:**

```typescript
<div
  aria-label={`${employee.name}, currently in ${currentPosition}, draggable`}
  aria-grabbed={isDragging}
  role="button"
  tabIndex={0}
>
```

**Loading State Announcements:**

```typescript
<CircularProgress
  aria-label="Loading employee data"
  role="status"
/>
```

---

## Common Patterns Summary

### Quick Reference Table

| Pattern | Duration | Easing | Use Case |
|---------|----------|--------|----------|
| **Button Hover** | 0.2s | ease-in-out | Background color change |
| **Card Hover** | 0.3s | ease-in-out | Shadow elevation |
| **Modal Enter/Exit** | 0.3s | ease-in-out | Dialog open/close |
| **Drawer Slide** | 0.3s | ease-in-out | Filter drawer open/close |
| **Grid Expansion** | 0.3s | ease-in-out | Box expand/collapse |
| **Drag Ghost** | - | - | Opacity 0.9, shadow 6 |
| **Drop Highlight** | - | - | Primary color, alpha 0.15 |
| **Loading Spinner** | - | - | Indeterminate (unknown duration) |
| **Progress Bar** | - | - | Determinate (known percentage) |
| **Snackbar** | 4s auto-hide | slide-up | Success/error notifications |

---

## Related Documentation

- **[Design Principles](design-principles.md)** - Core interaction philosophy
- **[Layout Patterns](layout-patterns.md)** - Where interactions happen
- **[Component Guidelines](component-guidelines.md)** - Component-specific interaction patterns
- **[Accessibility Standards](accessibility-standards.md)** - WCAG compliance for interactions

---

**Next Steps:**
- Standardize transition durations into design tokens
- Add `prefers-reduced-motion` support globally
- Document keyboard shortcuts in UI (tooltip hints)
- Create reusable animation hooks (`useHover`, `useFadeIn`, etc.)
