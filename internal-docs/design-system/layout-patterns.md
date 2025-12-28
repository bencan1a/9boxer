# Layout Patterns

Comprehensive guide to the spatial organization of 9Boxer. This document defines WHERE components should be placed, HOW they should be arranged, and WHY the layout is structured this way.

> **Related:** This builds on [Design Principles](design-principles.md) and [Component Inventory](component-inventory.md).

---

## Table of Contents

- [Application Hierarchy](#application-hierarchy)
- [Layout Grid System](#layout-grid-system)
- [UI Zone Anatomy](#ui-zone-anatomy)
- [Panel & Drawer Patterns](#panel--drawer-patterns)
- [Modal & Dialog Patterns](#modal--dialog-patterns)
- [Spacing Rules](#spacing-rules)
- [Responsive Considerations](#responsive-considerations)

---

## Application Hierarchy

### Complete Component Tree

Full breakdown of component nesting with responsibilities:

```
9Boxer Application
│
└── ErrorBoundary (Root Wrapper)
    │
    └── DashboardPage (Main Layout Container)
        │
        ├── ConnectionStatus (Fixed: Top-Right)
        ├── DevModeIndicator (Fixed: Bottom-Right, dev only)
        │
        ├── AppBarContainer (Zone 1: Top Toolbar)
        │   ├── PureAppBar (Presentation)
        │   │   ├── Logo & Title (Left)
        │   │   ├── FileMenuButton (Dropdown)
        │   │   ├── HelpButton (Documentation)
        │   │   └── SettingsButton
        │   ├── FileUploadDialog (Modal, conditional)
        │   ├── LoadSampleDialog (Modal, conditional)
        │   └── SettingsDialog (Modal, conditional)
        │       ├── Theme Selection (Radio buttons)
        │       └── Language Selection (Dropdown)
        │
        ├── FilterDrawer (Zone 2: Left Sidebar - Collapsible)
        │   ├── Search Input
        │   ├── Department Filters (Checkboxes)
        │   ├── Level Filters (Checkboxes)
        │   ├── Exclusion Filter (Checkbox)
        │   └── Reset Button
        │
        ├── NineBoxGrid (Zone 3: Center - Main Content)
        │   ├── ViewControls (Floating: Top-Right)
        │   │   ├── ViewModeToggle (Grid/Donut switcher)
        │   │   ├── ZoomControls (In/Out/Reset + percentage)
        │   │   └── FullscreenToggle (Enter/Exit fullscreen)
        │   ├── LoadingSpinner (Overlay, conditional)
        │   ├── GridBox (x9 - Positions 1-9)
        │   │   ├── Position Label (Header)
        │   │   ├── EmployeeCount (Badge)
        │   │   ├── EmployeeTile (x many)
        │   │   │   ├── Drag Handle (Icon)
        │   │   │   ├── Name & ID (Text)
        │   │   │   └── Quick Actions (Icons)
        │   │   └── Expand Button (Footer, conditional)
        │   └── Empty State (When no data)
        │
        ├── RightPanel (Zone 4: Right Sidebar - Resizable)
        │   ├── Panel Header (Title + Close Button)
        │   ├── Tabs (Navigation)
        │   │   ├── DetailsTab
        │   │   │   ├── EmployeeDetails (Card)
        │   │   │   ├── RatingsTimeline (Chart)
        │   │   │   ├── ManagementChain (Org Chart)
        │   │   │   └── Notes Section
        │   │   ├── ChangesTab
        │   │   │   ├── Change List (Timeline)
        │   │   │   └── Undo/Redo Buttons
        │   │   ├── StatisticsTab
        │   │   │   ├── Summary Cards
        │   │   │   └── DistributionChart (Pie/Bar)
        │   │   └── IntelligenceTab
        │   │       ├── IntelligenceSummary (Cards)
        │   │       ├── DeviationChart (Bar)
        │   │       ├── DistributionHeatmap (Grid)
        │   │       ├── LevelDistributionChart (Stacked Bar)
        │   │       └── AnomalySection (List)
        │   └── Panel Resize Handle (Vertical)
        │
        └── FileUploadDialog (Modal, conditional)
            ├── Dialog Title
            ├── Upload Zone (Drag & Drop)
            ├── Instructions
            └── Actions (Cancel, Upload)
```

---

## Layout Grid System

### Base Layout Structure

9Boxer uses a **5-zone layout** with resizable panels:

```
┌─────────────────────────────────────────────────────────────────┐
│  Zone 1: TOP TOOLBAR (Fixed Height: 64px)                      │
│  [Logo] [File▾]                                      [?] [⚙]   │
├────────────┬──────────────────────────────┬─────────────────────┤
│            │                              │                     │
│  Zone 2:   │   Zone 3: GRID AREA          │  Zone 4:            │
│  FILTER    │   (Main Content)             │  RIGHT PANEL        │
│  DRAWER    │                              │  (Tabs)             │
│            │   [9-Box Grid]               │                     │
│  (280px)   │   [3x3 Layout]               │  (Default: 400px)   │
│            │                              │  (Min: 320px)       │
│  Collapse→ │   Scrollable Y               │  (Max: 600px)       │
│            │                              │                     │
│            │                              │  ← Resize Handle    │
│            │                              │  ← Collapse Toggle  │
│            │                              │                     │
└────────────┴──────────────────────────────┴─────────────────────┘
```

### Zone Dimensions

| Zone | Width | Height | Resizable | Collapsible |
|------|-------|--------|-----------|-------------|
| **Top Toolbar** | 100% | 64px | ❌ No | ❌ No |
| **Filter Drawer** | 280px | 100% - 64px | ❌ No | ✅ Yes |
| **Grid Area** | Flex (remaining) | 100% - 64px | ❌ No | ❌ No |
| **Right Panel** | 320-600px (default 400px) | 100% - 64px | ✅ Yes | ✅ Yes |

### Spacing Units

All layout spacing uses the **8px base grid**:

```tsx
// Standard layout spacing
const layoutSpacing = {
  toolbarHeight: 64,        // 8 * 8
  filterDrawerWidth: 280,   // 8 * 35
  panelDefaultWidth: 400,   // 8 * 50
  panelMinWidth: 320,       // 8 * 40
  panelMaxWidth: 600,       // 8 * 75
  sectionGap: 24,           // 3 * 8 (lg spacing)
  componentGap: 16,         // 2 * 8 (md spacing)
  tightGap: 8,              // 1 * 8 (sm spacing)
};
```

---

## UI Zone Anatomy

Detailed breakdown of each zone's structure and purpose.

### Zone 1: Top Toolbar (AppBarContainer)

**Purpose:** Global actions that affect the entire application.

**Height:** 64px (fixed)

**Layout Structure:**
```
┌────────────────────────────────────────────────────┐
│ [Logo] [File▾]                    [?] [⚙]        │
│  16px   Auto                     44px 44px        │
└────────────────────────────────────────────────────┘
   ← Left Group (Actions)    Right Group (Settings) →
```

**Spacing Rules:**
- **Padding:** `0 24px` (horizontal)
- **Gap between groups:** `auto` (flexbox space-between)
- **Gap within group:** `8px` (sm spacing)
- **Icon button size:** `44px` minimum (touch target)

**Left Group (Actions):**
1. **Logo & Title** - Branding (16px padding-right)
2. **FileMenuButton** - Import, Load Sample, Export (dropdown)

**Right Group (Settings):**
3. **HelpButton** - Opens user guide
4. **SettingsButton** - Opens settings dialog (theme, language preferences)

**Example Layout:**
```tsx
<AppBarContainer>
  {/* Renders PureAppBar with business logic */}
  <PureAppBar
    fileName={filename}
    changeCount={events.length}
    onImportClick={handleImportClick}
    onLoadSampleClick={handleLoadSampleClick}
    onExportClick={handleExportClick}
    onSettingsClick={() => setSettingsDialogOpen(true)}
    onUserGuideClick={handleUserGuideClick}
    onAboutClick={handleAboutClick}
  />
</AppBarContainer>
```

**What SHOULD Go Here:**
- ✅ Global file operations (New, Save, Export)
- ✅ Application settings (theme, language - via SettingsDialog)
- ✅ Help/Documentation access

**What Should NOT Go Here:**
- ❌ View/Grid controls (now in floating ViewControls component)
- ❌ Employee-specific actions (belongs in EmployeeTile or DetailsTab)
- ❌ Grid box controls (belongs in GridBox)
- ❌ Search/Filter (belongs in FilterDrawer)
- ❌ Detailed statistics (belongs in RightPanel)

**Note:** View controls (view mode toggle, zoom, fullscreen) were intentionally moved out of the toolbar to a floating ViewControls component in the grid area. See [Grid Area - ViewControls Component](#viewcontrols-floating-component) for rationale.

---

### Zone 2: Filter Drawer (Left Sidebar)

**Purpose:** Search and filter employees displayed in the grid.

**Width:** 280px (fixed, not resizable)

**State:** Collapsible (slides in/out from left)

**Layout Structure:**
```
┌───────────────────────┐
│  🔍 Search            │ ← Search input (full width)
│  ___________________  │    16px padding
│                       │
│  □ Engineering        │ ← Department filters
│  □ Product            │    (checkboxes)
│  □ Sales              │    8px gap
│  □ Marketing          │
│                       │
│  ▼ Job Levels         │ ← Expandable section
│  □ Executive          │    (accordion)
│  □ Senior             │    16px padding
│  □ Mid                │
│  □ Junior             │
│                       │
│  □ Show Excluded      │ ← Exclusion toggle
│                       │
│  ────────────────     │ ← Divider (24px margin)
│                       │
│  [Reset Filters]      │ ← Reset button (centered)
│                       │
└───────────────────────┘
```

**Spacing Rules:**
- **Padding:** `24px` (all sides)
- **Section gap:** `24px` (lg spacing)
- **Checkbox gap:** `8px` (sm spacing)
- **Input margin:** `16px` (bottom)

**Sections (Top to Bottom):**

1. **Search Input**
   - Full width minus padding
   - Placeholder: "Search employees..."
   - Real-time filtering
   - Clear button (X icon)

2. **Department Filters**
   - Checkbox list (dynamic from data)
   - Show count per department (e.g., "Engineering (27)")
   - Scrollable if >10 departments

3. **Job Level Filters**
   - Accordion/expandable (collapsed by default)
   - Checkbox list
   - Show count per level

4. **Exclusion Toggle**
   - Single checkbox
   - "Show Excluded Employees"
   - Disabled if no exclusions

5. **Reset Button**
   - Outlined button (secondary)
   - Centered horizontally
   - Clears all filters

**Example Layout:**
```tsx
<Drawer
  variant="persistent"
  open={isFilterDrawerOpen}
  sx={{ width: 280 }}
>
  <Box sx={{ width: 280, p: 3 }}>
    {/* Search */}
    <TextField
      fullWidth
      placeholder="Search employees..."
      InputProps={{ startAdornment: <SearchIcon /> }}
      sx={{ mb: 3 }}
    />

    {/* Department Filters */}
    <Typography variant="h6" sx={{ mb: 1 }}>Departments</Typography>
    <FormGroup sx={{ mb: 3, gap: 1 }}>
      {departments.map(dept => (
        <FormControlLabel
          control={<Checkbox />}
          label={`${dept.name} (${dept.count})`}
        />
      ))}
    </FormGroup>

    {/* Reset Button */}
    <Button variant="outlined" fullWidth onClick={handleReset}>
      Reset Filters
    </Button>
  </Box>
</Drawer>
```

**What SHOULD Go Here:**
- ✅ Search input (employee name, ID, manager)
- ✅ Filter checkboxes (department, level, location)
- ✅ Show/hide controls (exclusions, inactive)
- ✅ Filter reset button

**What Should NOT Go Here:**
- ❌ Export buttons (belongs in FileMenuButton/Toolbar)
- ❌ Employee details (belongs in RightPanel)
- ❌ Statistics (belongs in RightPanel)
- ❌ Grid controls (belongs in Toolbar or GridBox)

---

### Zone 3: Grid Area (Main Content)

**Purpose:** Visualize and manipulate employees in 9-box grid.

**Size:** Flexible (fills remaining space after panels)

**Layout:** 3x3 grid of GridBox components

**Grid Structure:**
```
┌────────────┬────────────┬────────────┐
│ Position 7 │ Position 8 │ Position 9 │
│ Low, High  │ Med, High  │ High, High │
│   (L-H)    │   (M-H)    │   (H-H)    │
├────────────┼────────────┼────────────┤
│ Position 4 │ Position 5 │ Position 6 │
│ Low, Med   │ Med, Med   │ High, Med  │
│   (L-M)    │   (M-M)    │   (H-M)    │
├────────────┼────────────┼────────────┤
│ Position 1 │ Position 2 │ Position 3 │
│ Low, Low   │ Med, Low   │ High, Low  │
│   (L-L)    │   (M-L)    │   (H-L)    │
└────────────┴────────────┴────────────┘
     ↑ Performance →
```

**Grid Spacing:**
- **Grid gap:** `16px` (md spacing)
- **Grid padding:** `24px` (lg spacing)
- **Minimum grid width:** `900px` (3 × 280 + gaps)

**GridBox Anatomy:**
```
┌─────────────────────────────────────┐
│ High Performer (Purple)          [3]│ ← Header (Position Label + Count Badge)
│ ─────────────────────────────────── │    Height: 40px, Padding: 8px
│                                     │
│ ┌─────────────────────────────────┐ │ ← Employee List (Scrollable)
│ │ ≡ John Smith       👁 ✎ 🗑     │ │    EmployeeTile (56px each)
│ │   ID: EMP-12345                │ │    Gap: 8px
│ └─────────────────────────────────┘ │    Padding: 8px
│ ┌─────────────────────────────────┐ │
│ │ ≡ Jane Doe         👁 ✎ 🗑     │ │
│ │   ID: EMP-67890                │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ─────────────────────────────────── │    Divider (if has expand button)
│              [Expand ▼]             │ ← Footer (Expand Button)
└─────────────────────────────────────┘    Height: 40px
```

**GridBox States & Heights:**

| State | Height | Opacity | Usage |
|-------|--------|---------|-------|
| **Collapsed** | 60-80px | 0.7 | Overview mode (show counts only) |
| **Normal** | 150-400px | 1.0 | Default (show employee list) |
| **Expanded** | Maximized | 1.0 | Focus mode (one box expanded, others collapsed) |

**GridBox Color Coding:**

| Position Type | Background Color | Positions |
|--------------|------------------|-----------|
| **High Performer** | Purple (`theme.palette.gridBox.highPerformer`) | 6, 8, 9 (M-H, H-H, H-M) |
| **Solid Performer** | Green (`theme.palette.gridBox.solidPerformer`) | 5 (M-M) |
| **Development** | Yellow (`theme.palette.gridBox.development`) | 3, 7 (H-L, L-H) |
| **Needs Attention** | Red (`theme.palette.gridBox.needsAttention`) | 1, 2, 4 (L-L, M-L, L-M) |

**EmployeeTile Anatomy:**
```
┌─────────────────────────────────────────────┐
│ ≡  John Smith                          👁 ✎ │ ← Height: 56px
│    ID: EMP-12345                            │   Padding: 8px
└─────────────────────────────────────────────┘   Gap: 8px (between tiles)

Parts:
- Drag Handle (≡): Left, 24px width
- Name (John Smith): Primary text (body1), bold
- ID (EMP-12345): Secondary text (body2), below name
- Quick Actions (👁 ✎): Right, icon buttons (40px each)
```

**Example Layout:**
```tsx
<Box sx={{
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gridTemplateRows: 'repeat(3, 1fr)',
  gap: 2,
  p: 3,
  height: '100%',
}}>
  {[7, 8, 9, 4, 5, 6, 1, 2, 3].map(position => (
    <GridBox
      key={position}
      position={position}
      employees={employeesByPosition[position]}
      sx={{
        minHeight: isCollapsed ? 60 : 150,
        maxHeight: isExpanded ? 'none' : 400,
      }}
    />
  ))}
</Box>
```

**What SHOULD Go Here:**
- ✅ GridBox components (9 total, one per position)
- ✅ EmployeeTile components (draggable employees)
- ✅ Drag-and-drop interactions
- ✅ Grid-level loading spinner (overlay)
- ✅ Empty state (when no employees)
- ✅ ViewControls floating component (see below)

**What Should NOT Go Here:**
- ❌ File operations (belongs in Toolbar)
- ❌ Detailed employee information (belongs in RightPanel)
- ❌ Search/filter inputs (belongs in FilterDrawer)
- ❌ Statistics (belongs in RightPanel)

#### ViewControls Floating Component

**Purpose:** Unified view manipulation controls (view mode, zoom, fullscreen) positioned as a floating toolbar within the grid area.

**Positioning:** Absolute positioning at `top: 16px, right: 16px` within the grid container (not viewport).

**Layout Structure:**
```
┌────────────────────────────────────────────────┐
│ Grid Container (position: relative)            │
│                                                 │
│  ┌─────────────────────────────────────┐       │
│  │ [Grid][Donut] │ [−][↺][+] 100% │ [⛶] │  ← Floating at top-right
│  └─────────────────────────────────────┘       │
│                                                 │
│  [9-Box Grid Layout]                            │
│                                                 │
└────────────────────────────────────────────────┘
```

**Component Groups** (separated by vertical dividers):
1. **View Mode Toggle** - Grid/Donut switcher (ToggleButtonGroup)
2. **Zoom Controls** - Zoom Out, Reset, Zoom In + percentage display
3. **Fullscreen Toggle** - Enter/Exit fullscreen

**Keyboard Shortcuts:**
- **D** - Toggle Grid/Donut view mode
- **Ctrl/Cmd + Plus** - Zoom in
- **Ctrl/Cmd + Minus** - Zoom out
- **Ctrl/Cmd + 0** - Reset zoom
- **F11** - Toggle fullscreen

**Example Layout:**
```tsx
<Box sx={{ position: 'relative', height: '100%', width: '100%' }}>
  {/* Grid Content */}
  <NineBoxGrid />

  {/* Floating View Controls */}
  <ViewControls />  {/* Absolutely positioned at top-right */}
</Box>
```

**Design System Exception Rationale:**

ViewControls intentionally floats in the grid area rather than being in the AppBar for the following reasons:

1. **Toolbar Space Constraints** - The consolidated controls would add 5+ items to an already crowded toolbar, causing visual clutter and potential wrapping on smaller screens.

2. **Contextual Proximity** - View controls (zoom, view mode, fullscreen) directly manipulate the grid visualization. Placing them near the grid provides better UX through spatial association.

3. **Industry Standard Pattern** - Floating view controls are a common pattern in visualization-heavy applications:
   - Video players (YouTube, Vimeo): play/pause, volume, fullscreen float over video
   - Mapping applications (Google Maps, Mapbox): zoom controls float over map
   - Data visualization tools (Tableau, D3.js dashboards): view controls overlay the chart area

4. **Frequent Use** - These controls are used frequently during grid manipulation sessions. A floating, always-visible toolbar provides faster access than tucked-away menu items.

5. **Clean Separation of Concerns:**
   - **AppBarContainer** → Global file operations and application settings
   - **ViewControls** → Grid-specific view manipulation
   - **FilterDrawer** → Data filtering and search
   - **RightPanel** → Detailed information and analysis

**Visibility:** Hidden on small screens (`< 600px width`) via `useMediaQuery(theme.breakpoints.down('sm'))`.

---

### Zone 4: Right Panel (Detail Sidebar)

**Purpose:** Detailed information and analysis (employee details, changes, statistics, intelligence).

**Width:** 320-600px (default 400px, resizable)

**State:** Collapsible (slides in/out from right)

**Layout Structure:**
```
┌────────────────────────────────────┐
│ Employee Details          [×]      │ ← Panel Header (Height: 64px)
│ ════════════════════════════════   │    Title + Close Button
│ [Details][Changes][Stats][Intel]  │ ← Tabs (Height: 48px)
├────────────────────────────────────┤
│                                    │
│ ┌────────────────────────────────┐ │ ← Tab Content (Scrollable)
│ │  Selected: John Smith          │ │    Padding: 24px
│ │                                │ │
│ │  ┌──────────────────────────┐  │ │ ← Section (Card)
│ │  │ Performance Rating: 4.5  │  │ │    Margin: 16px bottom
│ │  │ Potential Rating: 4.0    │  │ │    Padding: 16px
│ │  └──────────────────────────┘  │ │
│ │                                │ │
│ │  ┌──────────────────────────┐  │ │
│ │  │ Ratings Timeline         │  │ │
│ │  │ [Chart]                  │  │ │
│ │  └──────────────────────────┘  │ │
│ │                                │ │
│ │  ┌──────────────────────────┐  │ │
│ │  │ Management Chain         │  │ │
│ │  │ [Org Chart]              │  │ │
│ │  └──────────────────────────┘  │ │
│ └────────────────────────────────┘ │
│                                    │
└────────────────────────────────────┘
```

**Panel Header:**
- **Height:** 64px (fixed)
- **Padding:** `0 24px`
- **Layout:** Title (left) + Close Button (right)
- **Border:** Bottom border (1px, theme.palette.divider)

**Tabs:**
- **Height:** 48px (MUI default)
- **Indicator:** Bottom border (2px, theme.palette.primary.main)
- **Active state:** Bold font weight

**Tab Content:**
- **Padding:** `24px` (all sides)
- **Scrollable:** Vertical scroll (overflow-y: auto)
- **Section gap:** `16px` (md spacing) between cards

**DetailsTab Layout:**
```
DetailsTab (Scrollable)
├── EmployeeDetails Card
│   ├── Name (h5)
│   ├── Employee ID (body2)
│   ├── Department (body2)
│   ├── Manager (body2)
│   └── Position (chip)
│
├── RatingsTimeline Card
│   ├── Section Title (h6)
│   └── Line Chart (Recharts)
│
├── ManagementChain Card
│   ├── Section Title (h6)
│   └── Org Chart (Custom)
│
└── Notes Section Card
    ├── Section Title (h6)
    ├── Notes List
    └── Add Note Button
```

**ChangesTab Layout:**
```
ChangesTab (Scrollable)
├── Action Buttons
│   ├── Undo Button (disabled if no history)
│   └── Redo Button (disabled if no future)
│
└── Change Timeline
    ├── Change Item (Card)
    │   ├── Timestamp (caption)
    │   ├── Description (body1)
    │   ├── Before → After (chip + arrow + chip)
    │   └── Undo Button (icon)
    └── ... (more changes)
```

**StatisticsTab Layout:**
```
StatisticsTab (Scrollable)
├── Summary Cards (Grid: 2 columns)
│   ├── Total Employees (Metric Card)
│   ├── High Performers (Metric Card)
│   ├── Needs Attention (Metric Card)
│   └── Average Rating (Metric Card)
│
└── Distribution Chart Card
    ├── Section Title (h6)
    ├── Chart Type Toggle (Pie/Bar)
    └── Chart (Recharts)
```

**IntelligenceTab Layout:**
```
IntelligenceTab (Scrollable)
├── IntelligenceSummary Card
│   ├── Section Title (h6)
│   └── Metric Cards (Grid: 2 columns)
│
├── DeviationChart Card
│   ├── Section Title (h6)
│   └── Bar Chart (Expected vs Actual)
│
├── DistributionHeatmap Card
│   ├── Section Title (h6)
│   └── Heatmap Grid
│
├── LevelDistributionChart Card
│   ├── Section Title (h6)
│   └── Stacked Bar Chart
│
└── AnomalySection Card
    ├── Section Title (h6)
    └── Anomaly List
```

**Spacing Rules:**
- **Panel padding:** `24px` (all sides for content)
- **Card margin:** `16px` (bottom, between cards)
- **Card padding:** `16px` (all sides, internal content)
- **Section gap:** `16px` (md spacing)

**Example Layout:**
```tsx
<Drawer
  anchor="right"
  variant="persistent"
  open={!isRightPanelCollapsed}
  sx={{ width: rightPanelSize }}
>
  {/* Header */}
  <Box sx={{
    height: 64,
    px: 3,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: 1,
    borderColor: 'divider',
  }}>
    <Typography variant="h6">Employee Details</Typography>
    <IconButton onClick={handleClose}>
      <CloseIcon />
    </IconButton>
  </Box>

  {/* Tabs */}
  <Tabs value={activeTab} onChange={handleTabChange}>
    <Tab label="Details" />
    <Tab label="Changes" />
    <Tab label="Statistics" />
    <Tab label="Intelligence" />
  </Tabs>

  {/* Tab Content */}
  <Box sx={{ p: 3, overflowY: 'auto', height: 'calc(100% - 112px)' }}>
    {activeTab === 0 && <DetailsTab />}
    {activeTab === 1 && <ChangesTab />}
    {activeTab === 2 && <StatisticsTab />}
    {activeTab === 3 && <IntelligenceTab />}
  </Box>
</Drawer>
```

**What SHOULD Go Here:**
- ✅ Selected employee details (full profile)
- ✅ Session change history (undo/redo)
- ✅ Aggregate statistics (grid-level metrics)
- ✅ AI insights and analytics

**What Should NOT Go Here:**
- ❌ Global app settings (belongs in SettingsDialog)
- ❌ File operations (belongs in Toolbar)
- ❌ Search/filter (belongs in FilterDrawer)
- ❌ Grid controls (belongs in Toolbar or GridBox)

---

## Panel & Drawer Patterns

### Collapsible Drawers

**Pattern:** Slide in/out from edge of screen.

**Use Cases:**
- FilterDrawer (left sidebar)
- RightPanel (right sidebar)

**Implementation:**
```tsx
<Drawer
  variant="persistent"    // Stays open, doesn't overlap content
  anchor="left"          // or "right"
  open={isOpen}
  sx={{ width: drawerWidth }}
>
  <Box sx={{ width: drawerWidth }}>
    {/* Drawer content */}
  </Box>
</Drawer>
```

**Animation:** `0.3s ease-out` (entrance), `0.3s ease-in` (exit)

**Collapse Trigger:**
- Icon button (usually in toolbar or panel header)
- Keyboard shortcut (Ctrl+B for sidebars)
- Auto-collapse on narrow screens (< 1024px)

---

### Resizable Panels

**Pattern:** Draggable resize handle between panels.

**Use Case:** RightPanel (adjust width)

**Constraints:**
- **Min Width:** 320px (readable minimum)
- **Max Width:** 600px (don't dominate screen)
- **Default Width:** 400px (optimal reading width)

**Implementation:**
```tsx
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';

<PanelGroup direction="horizontal">
  <Panel defaultSize={60} minSize={30}>
    <GridArea />
  </Panel>

  <PanelResizeHandle />

  <Panel
    defaultSize={40}
    minSize={20}
    maxSize={50}
    ref={panelRef}
  >
    <RightPanel />
  </Panel>
</PanelGroup>
```

**Resize Handle:**
- **Width:** 4px (hover: 8px)
- **Color:** Transparent (hover: theme.palette.divider)
- **Cursor:** `col-resize`

---

## Modal & Dialog Patterns

### Modal Overlay

**Pattern:** Centered dialog with backdrop.

**Use Cases:**
- FileUploadDialog
- SettingsDialog
- ExclusionDialog
- Confirmation dialogs

**Structure:**
```
Backdrop (Full Screen, Dimmed)
    ↓
Dialog (Centered, Elevated)
├── Dialog Title (h6)
├── Dialog Content (Scrollable)
└── Dialog Actions (Buttons)
```

**Sizing:**
- **Small Dialog:** 400px max width (confirmations)
- **Medium Dialog:** 600px max width (forms)
- **Large Dialog:** 800px max width (complex forms, file upload)
- **Full Screen:** Mobile or complex workflows

**Spacing:**
- **Title padding:** `24px 24px 16px`
- **Content padding:** `0 24px 24px`
- **Actions padding:** `16px 24px`
- **Button gap:** `8px`

**Example Layout:**
```tsx
<Dialog
  open={isOpen}
  onClose={handleClose}
  maxWidth="md"
  fullWidth
>
  <DialogTitle>Upload Employee Data</DialogTitle>
  <DialogContent>
    <Typography variant="body2" sx={{ mb: 2 }}>
      Select an Excel file (.xlsx) with employee data.
    </Typography>
    <UploadZone />
  </DialogContent>
  <DialogActions>
    <Button onClick={handleClose}>Cancel</Button>
    <Button variant="contained" onClick={handleUpload}>
      Upload
    </Button>
  </DialogActions>
</Dialog>
```

**Keyboard Behavior:**
- **Escape:** Close dialog
- **Enter:** Confirm action (if single primary action)
- **Tab:** Navigate between fields/buttons

---

## Spacing Rules

### Consistent Spacing Scale

All layout spacing uses design tokens:

```tsx
theme.tokens.spacing.xs   // 4px  - Icon-to-label gap
theme.tokens.spacing.sm   // 8px  - List items, chip spacing
theme.tokens.spacing.md   // 16px - Component padding, card spacing
theme.tokens.spacing.lg   // 24px - Section separation, panel padding
theme.tokens.spacing.xl   // 32px - Large section separation
theme.tokens.spacing.xxl  // 48px - Page-level margins
```

### Layout Spacing Guidelines

| Element | Spacing | Token |
|---------|---------|-------|
| **Panel padding** | 24px | `lg` |
| **Card padding** | 16px | `md` |
| **Card margin** (between cards) | 16px | `md` |
| **Section gap** | 24px | `lg` |
| **Button gap** | 8px | `sm` |
| **List item gap** | 8px | `sm` |
| **Input margin** | 16px | `md` |
| **Chip spacing** | 8px | `sm` |

### Vertical Rhythm

Maintain consistent vertical spacing:

```tsx
<Box sx={{ p: 3 }}>                    // Panel: 24px padding
  <Typography variant="h6" sx={{ mb: 2 }}>  // Title: 16px bottom margin
    Section Heading
  </Typography>

  <Card sx={{ p: 2, mb: 2 }}>              // Card: 16px padding, 16px margin
    <Typography variant="body1" sx={{ mb: 1 }}>  // Text: 8px bottom
      Content
    </Typography>
  </Card>

  <Card sx={{ p: 2, mb: 2 }}>              // Next card: Same spacing
    <Typography variant="body1">
      More content
    </Typography>
  </Card>
</Box>
```

---

## Responsive Considerations

### Current State (Desktop Only)

9Boxer is currently a **desktop application** (Electron) with no mobile/tablet support.

**Fixed Minimum Width:** 1280px (recommended)

**However,** components should be designed with responsive principles for future web deployment:

### Responsive Breakpoints (Future)

| Breakpoint | Width | Layout Changes |
|-----------|-------|----------------|
| **xs** | < 600px | Single column, panels stacked |
| **sm** | 600-900px | Tablet, grid 2×2, panel overlay |
| **md** | 900-1200px | Grid 3×3, panel auto-collapse |
| **lg** | 1200-1536px | Full layout (current desktop) |
| **xl** | > 1536px | Extra space for panel/grid |

### Auto-Collapse Behavior

**Current Implementation:**

At **< 1024px window width:**
- RightPanel auto-collapses
- FilterDrawer auto-collapses
- Grid takes full width
- User can manually re-open panels (overlay mode)

**Implementation:**
```tsx
const PANEL_COLLAPSE_BREAKPOINT = 1024;

useEffect(() => {
  const handleResize = () => {
    const width = window.innerWidth;

    if (width < PANEL_COLLAPSE_BREAKPOINT && !isRightPanelCollapsed) {
      setRightPanelCollapsed(true);
      setWasAutoCollapsed(true);
    } else if (width >= PANEL_COLLAPSE_BREAKPOINT && wasAutoCollapsed) {
      setRightPanelCollapsed(false);
      setWasAutoCollapsed(false);
    }
  };

  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
}, []);
```

---

## Related Documentation

- [Design Principles](design-principles.md) - Core UX philosophy
- [Design Tokens](design-tokens.md) - All design constants
- [Component Inventory](component-inventory.md) - Complete component catalog
- [DESIGN_SYSTEM.md](../../DESIGN_SYSTEM.md) - Complete UI guidelines
- [Interaction Patterns](interaction-patterns.md) - Animation and interaction standards (Chunk 4)
- [Component Guidelines](component-guidelines.md) - Detailed component patterns (Chunk 5)

---

## Questions?

**Where should a new control go?**
1. Check UI Zone Anatomy sections above
2. Review "What SHOULD Go Here" / "What Should NOT Go Here"
3. Follow hierarchy: Global → Zone-specific → Component-specific

**How much spacing should I use?**
1. Check Spacing Rules section
2. Use design tokens (`theme.tokens.spacing.*`)
3. Maintain vertical rhythm (consistent gaps)

**Should this be a drawer or a modal?**
- **Drawer:** Persistent information, can work alongside main content
- **Modal:** Focused task, blocks main content, requires action

**How wide should a panel be?**
- Check Panel & Drawer Patterns section
- Use constraints: min/max/default
- Test at different screen sizes
