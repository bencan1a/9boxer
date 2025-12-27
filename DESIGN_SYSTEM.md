# Design System Guidelines for AI Agents

This document provides comprehensive guidelines for creating and modifying UI components in 9Boxer. Following these standards ensures visual consistency, accessibility, and maintainability.

> **Related Documentation:**
> - [Design Tokens](docs/design-system/design-tokens.md) - All design constants
> - [CLAUDE.md](CLAUDE.md) - General development guidelines
> - [Component Guidelines](docs/design-system/component-guidelines.md) - Detailed component patterns

---

## Table of Contents

- [Before Creating Any UI Component](#before-creating-any-ui-component)
- [Component Development Checklist](#component-development-checklist)
- [Styling Rules](#styling-rules)
- [UI Zones & Layout Structure](#ui-zones--layout-structure)
- [Component Anatomy Patterns](#component-anatomy-patterns)
- [When to Create New Components](#when-to-create-new-components)
- [Design Review Criteria](#design-review-criteria)
- [Common Patterns](#common-patterns)

---

## Before Creating Any UI Component

**MANDATORY steps before writing any UI code:**

1. ✅ **Check existing components** in `frontend/src/components/`
   - Use `Glob` or `Grep` to search for similar functionality
   - Review component README files (e.g., `intelligence/README.md`)

2. ✅ **Review design tokens** in `frontend/src/theme/tokens.ts`
   - Never hardcode colors, spacing, or dimensions
   - Use tokens for all visual properties

3. ✅ **Determine correct UI zone** (see [UI Zones](#ui-zones--layout-structure))
   - Top Toolbar → Global actions, file operations
   - Grid Area → Employee manipulation, view controls
   - Right Panel → Employee details, analysis
   - Settings → User preferences, configuration

4. ✅ **Read design guidelines**
   - [Design Principles](docs/design-system/design-principles.md)
   - [Component Guidelines](docs/design-system/component-guidelines.md)
   - [Accessibility Standards](docs/design-system/accessibility-standards.md)

---

## Component Development Checklist

Use this checklist for **EVERY** new or modified component:

### Required for ALL Components

- [ ] **TypeScript with strict types**
  - All props defined with TypeScript interface
  - All function parameters typed
  - All function returns typed
  - No `any` types without justification

- [ ] **Accessibility (WCAG 2.1 Level AA)**
  - ARIA labels for all interactive elements
  - Keyboard navigation support (Tab, Enter, Esc, Arrow keys)
  - Focus indicators visible
  - Screen reader compatible
  - Minimum contrast ratio: 4.5:1 (text), 3:1 (UI components)

- [ ] **Internationalization (i18n)**
  - ALL user-visible text uses `useTranslation()` hook
  - Translation keys follow convention: `section.component.label`
  - No hardcoded strings in JSX

- [ ] **Theme support**
  - Works in both light and dark modes
  - Uses `theme.palette.*` for colors
  - Uses `theme.tokens.*` for spacing/dimensions/etc.
  - Test by toggling theme mode

- [ ] **Testing**
  - data-testid attributes for all testable elements
  - Unit tests (Vitest + React Testing Library)
  - Test user behavior, not implementation details

- [ ] **Documentation**
  - JSDoc comments with usage examples
  - Props interface documented
  - Complex logic explained with inline comments

### Styling Checklist

- [ ] **Use MUI `sx` prop** (not inline styles or styled-components)
- [ ] **Use theme tokens** for all values
  - Colors: `theme.palette.*`
  - Spacing: `theme.tokens.spacing.*` or `theme.spacing(n)`
  - Dimensions: `theme.tokens.dimensions.*`
  - Durations: `theme.tokens.duration.*`
  - Shadows: `theme.tokens.shadows.*`

- [ ] **No hardcoded values**
  - ❌ `padding: '16px'` → ✅ `padding: theme.tokens.spacing.md`
  - ❌ `color: '#1976d2'` → ✅ `color: theme.palette.primary.main`
  - ❌ `fontSize: '14px'` → ✅ `fontSize: theme.typography.fontSize.body2`

- [ ] **Responsive (if applicable)**
  - Use MUI breakpoints: `theme.breakpoints.up('md')`
  - Test at different viewport sizes

---

## UI Zones & Layout Structure

**CRITICAL:** Controls and features must live in consistent zones. This prevents design drift where new features appear in random locations.

### Application Layout

```
┌─────────────────────────────────────────────────────────────┐
│                      TOP TOOLBAR                            │
│  [File Menu] [View Controls] [Export] [Settings] [Help]    │
├─────────────────────────────────┬───────────────────────────┤
│                                 │                           │
│                                 │      RIGHT PANEL          │
│          GRID AREA              │   (resizable drawer)      │
│                                 │                           │
│  [Filter Drawer]  [9-Box Grid]  │  [Tabs: Details,         │
│                                 │   Changes, Stats,         │
│                                 │   Intelligence]           │
│                                 │                           │
└─────────────────────────────────┴───────────────────────────┘
```

### UI Zone Definitions

#### 1. Top Toolbar (`DashboardPage` → `AppBar`)

**Purpose:** Global actions that affect the entire application.

**What Goes Here:**
- ✅ File operations (New, Open, Save, Export)
- ✅ View mode toggles (Normal/Donut view)
- ✅ Zoom controls (if affecting entire grid)
- ✅ Full-screen toggle
- ✅ Settings button
- ✅ Language selector
- ✅ Help/Documentation links

**What Does NOT Go Here:**
- ❌ Employee-specific actions
- ❌ Grid box controls
- ❌ Panel content
- ❌ Search/filter (belongs in Filter Drawer)

**Component Location:** `frontend/src/components/dashboard/AppBar.tsx`

**Example - Adding a New Global Action:**
```tsx
// ✅ Correct - Add to AppBar
<AppBar>
  <FileMenu />
  <ViewModeToggle />
  <NewGlobalAction />  {/* New button here */}
  <SettingsButton />
</AppBar>

// ❌ Wrong - Don't add global actions to grid or panel
```

#### 2. Grid Area (`NineBoxGrid`)

**Purpose:** Employee visualization and direct manipulation.

**What Goes Here:**
- ✅ 9-box grid cells (GridBox components)
- ✅ Employee tiles (draggable EmployeeTile)
- ✅ Grid-level controls (expand/collapse, employee counts)
- ✅ Drag and drop interactions
- ✅ Grid overlays (loading states, empty states)

**What Does NOT Go Here:**
- ❌ File operations (toolbar)
- ❌ Detailed employee information (right panel)
- ❌ Charts/analytics (right panel intelligence tab)
- ❌ Settings (settings dialog)

**Component Locations:**
- `frontend/src/components/grid/NineBoxGrid.tsx` - Grid container
- `frontend/src/components/grid/GridBox.tsx` - Individual grid cells
- `frontend/src/components/grid/EmployeeTile.tsx` - Employee cards

**Example - Adding Employee Quick Actions:**
```tsx
// ✅ Correct - Add to EmployeeTile (appears in grid)
<EmployeeTile employee={emp}>
  <EmployeeInfo />
  <QuickActionButtons />  {/* View, Edit, Delete icons */}
</EmployeeTile>

// ❌ Wrong - Don't add to toolbar or panel
```

#### 3. Filter Drawer (`FilterDrawer`)

**Purpose:** Filter and search functionality.

**What Goes Here:**
- ✅ Search input (employee name, ID, manager)
- ✅ Filter checkboxes (departments, levels, exclusions)
- ✅ Filter reset button
- ✅ Active filter count badge

**What Does NOT Go Here:**
- ❌ Export buttons (toolbar)
- ❌ Employee details (right panel)
- ❌ View mode toggles (toolbar)

**Component Location:** `frontend/src/components/dashboard/FilterDrawer.tsx`

#### 4. Right Panel (`RightPanel`)

**Purpose:** Detailed information and analysis for selected employee or entire grid.

**Structure:**
```
Right Panel
├── Details Tab       - Selected employee information
├── Changes Tab       - Session change history
├── Statistics Tab    - Aggregate statistics
└── Intelligence Tab  - AI insights and analytics
```

**What Goes in Each Tab:**

**Details Tab** (`DetailsTab.tsx`):
- ✅ Selected employee full information
- ✅ Performance ratings
- ✅ Ratings timeline (historical chart)
- ✅ Management chain (org chart)
- ✅ Notes/comments

**Changes Tab** (`ChangeTrackerTab.tsx`):
- ✅ List of all moves/edits in current session
- ✅ Undo/Redo buttons
- ✅ Change timestamps
- ✅ Before/After position comparisons

**Statistics Tab** (`StatisticsTab.tsx`):
- ✅ Grid-level aggregate statistics
- ✅ Distribution charts (pie, bar)
- ✅ Summary metrics (average rating, total employees)

**Intelligence Tab** (`IntelligenceTab.tsx`):
- ✅ AI-generated insights
- ✅ Anomaly detection charts
- ✅ Deviation analysis (expected vs actual distribution)
- ✅ Heat maps
- ✅ Recommendations

**What Does NOT Go Here:**
- ❌ File operations (toolbar)
- ❌ Grid manipulation controls (grid area)
- ❌ Global settings (settings dialog)

**Component Location:** `frontend/src/components/panel/`

**Example - Adding New Employee Metadata:**
```tsx
// ✅ Correct - Add to DetailsTab in Right Panel
<DetailsTab employee={selectedEmployee}>
  <EmployeeDetails />
  <RatingsTimeline />
  <NewMetadataSection />  {/* e.g., Skills, Certifications */}
</DetailsTab>

// ❌ Wrong - Don't add detailed info to EmployeeTile (grid)
```

#### 5. Settings Dialog (`SettingsDialog`)

**Purpose:** User preferences and application configuration.

**What Goes Here:**
- ✅ Theme preference (light/dark/auto)
- ✅ Language selection
- ✅ Default view mode
- ✅ Auto-save preferences
- ✅ Data export format preferences

**What Does NOT Go Here:**
- ❌ Employee data operations
- ❌ Grid controls
- ❌ Analysis tools

**Component Location:** `frontend/src/components/settings/SettingsDialog.tsx`

---

## Component Anatomy Patterns

### NineBoxGrid Component Hierarchy

**Purpose:** Main 9-box talent grid visualization with complete component hierarchy.

**Component Hierarchy (Phase 1.1 Componentization - COMPLETE):**
```tsx
<NineBoxGrid> (container with state)
├── Axis (orientation="horizontal") - Performance label
├── Axis (orientation="vertical") - Potential label
├── GridBox[] (9 instances, positions 1-9)
│   ├── BoxHeader
│   │   ├── PositionLabel
│   │   ├── EmployeeCount (badge)
│   │   └── ExpandCollapseButton
│   ├── EmployeeTileList
│   │   └── EmployeeTile[] (draggable cards)
│   └── DropZone (drag-drop target)
└── DragOverlay (shows dragged item)
```

**New Components (Phase 1.1):**
1. **Axis** - `frontend/src/components/grid/Axis.tsx`
   - Single responsibility: Renders one axis label
   - Configurable orientation: `horizontal` (Performance) or `vertical` (Potential)
   - Horizontal: Centered text at top
   - Vertical: Rotated text on left (writing-mode: vertical-rl)
   - Customizable labels via props
   - Can be hidden via `showLabel` prop
   - **Design improvement:** Replaces previous GridAxes component for better composability

2. **BoxHeader** - `frontend/src/components/grid/BoxHeader.tsx`
   - Position name + short label (e.g., "Star [H,H]")
   - Employee count badge
   - Expand/collapse button
   - Position guidance tooltip
   - Adaptive layout (collapsed vs normal/expanded)

3. **EmployeeTileList** - `frontend/src/components/grid/EmployeeTileList.tsx`
   - Wrapper for employee tiles
   - Normal mode: Vertical stack
   - Expanded mode: Multi-column grid (responsive)
   - Manages layout only, delegates rendering to EmployeeTile

**Grid States:**
- **View mode:** `normal` | `donut` | `compact`
- **Drag state:** `idle` | `dragging` | `dragOver`
- **Data state:** `empty` | `loading` | `populated`

**GridBox States:**
- **Expansion:** `expanded` | `collapsed` | `normal`
- **Employee count:** `empty` | `hasEmployees` (1-5, 6-10, 11+)
- **Drag state:** `idle` | `dragOver` | `dragAccept` | `dragReject`

**Position Layout:**
```
Row 1 (High Potential):    [7: L,H] [8: M,H] [9: H,H]
Row 2 (Medium Potential):  [4: L,M] [5: M,M] [6: H,M]
Row 3 (Low Potential):     [1: L,L] [2: M,L] [3: H,L]
                           ← Performance (Low → High) →
```

**Benefits of Componentization:**
- ✅ Isolated, testable components (77 tests total)
- ✅ Comprehensive Storybook stories (40+ stories)
- ✅ Clear separation of concerns
- ✅ Easier to maintain and extend
- ✅ Better code reuse

**Storybook Stories:**
- NineBoxGrid: 11 stories (Empty, Populated, Skewed, Donut Mode, etc.)
- GridBox: 7 stories (Empty, Expanded, Collapsed, etc.)
- BoxHeader: 6 stories (Normal, Expanded, Collapsed, etc.)
- EmployeeTileList: 8 stories (Empty, Normal layout, Expanded layout, etc.)
- EmployeeTile: 7 stories (Default, Modified, Donut mode, etc.)
- Axis: 6 stories (Horizontal, Vertical, Custom labels, Hidden)

### EmployeeTile Structure

**Purpose:** Display employee info in grid, support drag-and-drop.

**Required Elements (in this order):**
```tsx
<EmployeeTile>
  1. Drag Handle (icon, left side)
  2. Employee Name (primary text, left-aligned)
  3. Employee ID (secondary text, below name)
  4. Quick Actions (icons, right side)
     - View details
     - Edit
     - Delete/Exclude
</EmployeeTile>
```

**Visual Layout:**
```
┌─────────────────────────────────────────────┐
│ ≡  John Smith                          👁 ✎ │
│    ID: 12345                                │
└─────────────────────────────────────────────┘
```

**Rules:**
- ✅ Height: `theme.tokens.dimensions.employeeTile.height` (56px)
- ✅ Spacing: `theme.tokens.dimensions.employeeTile.spacing` (8px)
- ✅ Always show: Name, ID
- ✅ Optional: Department, Manager (if space allows)
- ❌ Do NOT add: Charts, long descriptions, multiple buttons

**When to Extend:**
- Adding new metadata? → Add to **DetailsTab**, not EmployeeTile
- Adding new action? → Add icon button to right side (max 3 icons)

### GridBox Structure

**Purpose:** Container for employees in a 9-box position.

**Component Hierarchy (NEW - Phase 1.1 Componentization):**
```tsx
<GridBox>
  ├── BoxHeader
  │   ├── Position Label (e.g., "Star [H,H]")
  │   ├── Employee Count Badge
  │   └── Expand/Collapse Button
  ├── EmployeeTileList
  │   └── EmployeeTile[] (draggable employee cards)
  └── Drop Zone (invisible drag-drop target)
</GridBox>
```

**Sub-Components:**
1. **BoxHeader** - `frontend/src/components/grid/BoxHeader.tsx`
   - Displays position name, short label, and employee count
   - Shows expand/collapse controls
   - Tooltip with position guidance
   - Adapts layout: Collapsed (centered vertical) vs Normal/Expanded (horizontal)

2. **EmployeeTileList** - `frontend/src/components/grid/EmployeeTileList.tsx`
   - Wraps employee tiles with responsive layout
   - Normal mode: Vertical stack (block layout)
   - Expanded mode: Multi-column grid (auto-fill, minmax(280px, 1fr))

**Required Elements:**
```tsx
<GridBox>
  1. Position Label (top, center) - e.g., "High Performer"
  2. Employee Count Badge (top right)
  3. Expand/Collapse Button (bottom right, conditional)
  4. Employee Tiles (scrollable list)
  5. Guidance Text (on hover, tooltip)
</GridBox>
```

**Visual States:**
- **Collapsed:** Min height 60px, shows count only, opacity 0.7
- **Normal:** Height 150-400px, scrollable list
- **Expanded:** Maximized height, pushes other boxes to collapsed

**Rules:**
- ✅ Background color: `theme.palette.gridBox.*` (semantic colors)
- ✅ Heights: `theme.tokens.dimensions.gridBox.*`
- ✅ Drag-over state: Opacity 1, border highlight
- ✅ Use sub-components: BoxHeader, EmployeeTileList
- ❌ Do NOT add: Export buttons, filters, charts

### Right Panel Tab Structure

**Purpose:** Organize detailed information into logical sections.

**Tab Design Pattern:**
```tsx
<Tab>
  1. Tab Header (icon + label)
  2. Content Area (scrollable)
     a. Section Heading (Typography variant="h6")
     b. Content (data, charts, forms)
     c. Actions (buttons, if applicable)
</Tab>
```

**Rules:**
- ✅ Each tab is self-contained
- ✅ Use consistent section headings (h6)
- ✅ Scrollable content area
- ✅ Loading states (LoadingSpinner)
- ✅ Empty states (helpful message + illustration)

**When to Add New Tab:**
- Content is distinct from existing tabs
- Content is substantial (not just 1-2 fields)
- Content applies to all employees (not position-specific)

**When to Add to Existing Tab:**
- Content fits logically into Details/Changes/Stats/Intelligence
- Content is small addition (1-3 fields)

---

## When to Create New Components

### Create a New Component When:

1. **Functionality will be reused in 2+ places**
   ```tsx
   // ✅ Good - Reusable button
   <StatusBadge status="active" />  // Used in EmployeeTile, DetailsTab, etc.
   ```

2. **Component encapsulates complex logic**
   ```tsx
   // ✅ Good - Complex drag-and-drop logic
   <EmployeeTile employee={emp} onDragStart={...} onDragEnd={...} />
   ```

3. **Component represents a distinct UI pattern**
   ```tsx
   // ✅ Good - Distinct pattern for distribution visualization
   <DistributionHeatmap data={gridData} />
   ```

### Extend Existing Component When:

1. **Slight variation of existing component**
   ```tsx
   // ✅ Good - Add props to existing component
   <LoadingSpinner size="large" message="Loading employees..." />
   ```

2. **Can be achieved with props/variants**
   ```tsx
   // ✅ Good - Use variant prop
   <Button variant="contained|outlined|text" />
   ```

3. **Shares same core behavior**
   ```tsx
   // ✅ Good - Same behavior, different data
   <DistributionChart type="pie|bar" data={stats} />
   ```

### Component Composition Guidelines

**Prefer composition over props explosion:**

```tsx
// ❌ Avoid - Too many props
<Card
  title="Employee Details"
  subtitle="Performance Review"
  action={<Button>Edit</Button>}
  footer={<Typography>Last updated</Typography>}
/>

// ✅ Better - Composition
<Card>
  <Card.Header>
    <Typography variant="h6">Employee Details</Typography>
    <Typography variant="caption">Performance Review</Typography>
  </Card.Header>
  <Card.Content>
    <EmployeeDetails />
  </Card.Content>
  <Card.Actions>
    <Button>Edit</Button>
  </Card.Actions>
  <Card.Footer>
    <Typography variant="caption">Last updated</Typography>
  </Card.Footer>
</Card>
```

---

## Design Review Criteria

Before submitting a PR with UI changes, verify:

### Visual Consistency

- [ ] Matches existing design language
- [ ] Uses design tokens (no hardcoded values)
- [ ] Consistent spacing and alignment
- [ ] Follows typography hierarchy

### Accessibility

- [ ] WCAG AA contrast ratios met
- [ ] Keyboard navigation works
- [ ] Screen reader compatible
- [ ] Focus indicators visible
- [ ] No color-only information

### Theme Support

- [ ] Tested in light mode
- [ ] Tested in dark mode
- [ ] Colors from `theme.palette.*`
- [ ] Transitions smooth

### Internationalization

- [ ] All text uses translation keys
- [ ] No hardcoded strings
- [ ] Layout works with different text lengths
- [ ] RTL support (if applicable)

### Performance

- [ ] No unnecessary re-renders
- [ ] Uses React.memo where appropriate
- [ ] Virtualized lists (if > 50 items)
- [ ] Images optimized

### Testing

- [ ] Unit tests written
- [ ] data-testid attributes present
- [ ] Tests pass in CI
- [ ] Manual QA performed

### Documentation

- [ ] JSDoc comments added
- [ ] Props interface documented
- [ ] README updated (if new pattern)
- [ ] Screenshots added (if visual change)

---

## Common Patterns

### Loading States

```tsx
import LoadingSpinner from '@/components/common/LoadingSpinner';

{isLoading ? (
  <LoadingSpinner message={t('loading.employees')} />
) : (
  <EmployeeList employees={employees} />
)}
```

### Error Handling

```tsx
import ErrorBoundary from '@/components/common/ErrorBoundary';

<ErrorBoundary>
  <ComponentThatMightError />
</ErrorBoundary>
```

### Notifications

```tsx
import { useSnackbar } from '@/contexts/SnackbarContext';

const { showSuccess, showError } = useSnackbar();

// Success
showSuccess(t('employee.saved'));

// Error
showError(t('employee.save_failed'));
```

### Empty States

```tsx
<Box sx={{
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.tokens.spacing.xl,
}}>
  <EmptyStateIcon />
  <Typography variant="h6" sx={{ mt: 2 }}>
    {t('employees.empty.title')}
  </Typography>
  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
    {t('employees.empty.description')}
  </Typography>
  <Button
    variant="contained"
    sx={{ mt: 3 }}
    onClick={handleUpload}
  >
    {t('employees.empty.action')}
  </Button>
</Box>
```

### Modal Dialogs

```tsx
import { Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';

<Dialog open={open} onClose={handleClose}>
  <DialogTitle>{t('dialog.title')}</DialogTitle>
  <DialogContent>
    <Typography>{t('dialog.message')}</Typography>
  </DialogContent>
  <DialogActions>
    <Button onClick={handleClose}>{t('common.cancel')}</Button>
    <Button variant="contained" onClick={handleConfirm}>
      {t('common.confirm')}
    </Button>
  </DialogActions>
</Dialog>
```

### Form Inputs

```tsx
<TextField
  label={t('employee.name')}
  value={name}
  onChange={(e) => setName(e.target.value)}
  fullWidth
  required
  error={!!error}
  helperText={error || t('employee.name_hint')}
  inputProps={{
    'data-testid': 'employee-name-input',
  }}
/>
```

---

## Quick Reference

### ❌ Don't Do This

```tsx
// Hardcoded values
<Box sx={{ padding: '16px', color: '#1976d2' }} />

// Missing i18n
<Typography>Save Employee</Typography>

// Missing accessibility
<IconButton onClick={handleEdit}>
  <EditIcon />
</IconButton>

// Wrong UI zone
<AppBar>
  <EmployeeDetailsForm />  {/* Should be in Right Panel */}
</AppBar>
```

### ✅ Do This Instead

```tsx
// Use design tokens
<Box sx={{
  padding: theme.tokens.spacing.md,
  color: theme.palette.primary.main,
}} />

// Use i18n
<Typography>{t('employee.save')}</Typography>

// Add accessibility
<IconButton
  onClick={handleEdit}
  aria-label={t('employee.edit')}
  data-testid="edit-employee-button"
>
  <EditIcon />
</IconButton>

// Correct UI zone
<RightPanel>
  <DetailsTab>
    <EmployeeDetailsForm />  {/* Right place */}
  </DetailsTab>
</RightPanel>
```

---

## Related Documentation

- [Design Tokens](docs/design-system/design-tokens.md) - All design constants
- [Design Principles](docs/design-system/design-principles.md) - Core UX philosophy
- [Component Guidelines](docs/design-system/component-guidelines.md) - Detailed component patterns
- [Accessibility Standards](docs/design-system/accessibility-standards.md) - WCAG compliance
- [CLAUDE.md](CLAUDE.md) - General development guidelines
- [Testing Guide](docs/testing/quick-reference.md) - Testing patterns

---

## Getting Help

**Before asking for help:**
1. Check existing components for similar patterns
2. Review design token documentation
3. Search codebase for examples (`Grep` tool)

**When stuck:**
1. Reference this document
2. Look at existing components in the same UI zone
3. Check Material-UI documentation for MUI components

**When uncertain:**
1. Ask for clarification on the specific pattern
2. Propose an approach and ask for review
3. Create a draft PR for early feedback
