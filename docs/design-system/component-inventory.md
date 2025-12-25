# Component Inventory

Complete catalog of all UI components in the 9Boxer application. This inventory helps understand what exists, where components live, and how they relate to each other.

**Last Updated:** 2025-12-24
**Total Components:** 32

---

## Table of Contents

- [Component Hierarchy](#component-hierarchy)
- [Component Catalog by Zone](#component-catalog-by-zone)
- [Reusability Matrix](#reusability-matrix)
- [Migration Status](#migration-status)
- [Component Index](#component-index)

---

## Component Hierarchy

Visual tree of how components nest within the application.

```
DashboardPage (Main Layout)
├── AppBar (Top Toolbar)
│   ├── FileMenu
│   │   └── ExclusionDialog (conditional)
│   ├── ViewModeToggle (grid area control)
│   ├── ZoomControls (grid area control)
│   ├── LanguageSelector
│   └── SettingsDialog (conditional)
│
├── FilterDrawer (Left Sidebar - Collapsible)
│
├── NineBoxGrid (Center - Main Content)
│   ├── GridBox (x9 - one per position)
│   │   ├── EmployeeCount (header badge)
│   │   └── EmployeeTile (x many - draggable employees)
│   └── LoadingSpinner (overlay when loading)
│
├── RightPanel (Right Sidebar - Resizable)
│   ├── DetailsTab
│   │   ├── EmployeeDetails
│   │   ├── RatingsTimeline
│   │   └── ManagementChain
│   ├── ChangeTrackerTab
│   ├── StatisticsTab
│   │   └── DistributionChart (pie/bar charts)
│   └── IntelligenceTab
│       ├── IntelligenceSummary
│       ├── DeviationChart
│       ├── DistributionHeatmap
│       ├── LevelDistributionChart
│       └── AnomalySection
│
├── FileUploadDialog (Modal - Conditional)
├── ConnectionStatus (Global - Fixed Position)
└── DevModeIndicator (Global - Fixed Position)

ErrorBoundary (Wrapper - Root Level)
```

---

## Component Catalog by Zone

### 🌍 Global Components

Components that appear regardless of zone or can wrap the entire app.

| Component | File | Purpose | Reusable |
|-----------|------|---------|----------|
| **ErrorBoundary** | `common/ErrorBoundary.tsx` | Catch React errors, show fallback UI | ✅ Yes |
| **LoadingSpinner** | `common/LoadingSpinner.tsx` | Loading indicator with optional overlay | ✅ Yes |
| **ConnectionStatus** | `common/ConnectionStatus.tsx` | Backend connection indicator | ❌ No (app-specific) |
| **DevModeIndicator** | `common/DevModeIndicator.tsx` | Development mode badge | ❌ No (app-specific) |

---

### 📊 Dashboard (Layout & Navigation)

Main layout components that structure the application.

| Component | File | Purpose | Children |
|-----------|------|---------|----------|
| **DashboardPage** | `dashboard/DashboardPage.tsx` | Main app layout, manages panels | AppBar, FilterDrawer, NineBoxGrid, RightPanel |
| **AppBar** | `dashboard/AppBar.tsx` | Top toolbar with global actions | FileMenu, ViewModeToggle, ZoomControls, LanguageSelector |
| **FileMenu** | `dashboard/FileMenu.tsx` | File operations (New, Open, Save, Export) | ExclusionDialog (modal) |
| **FilterDrawer** | `dashboard/FilterDrawer.tsx` | Search and filter sidebar | None (form inputs) |
| **ExclusionDialog** | `dashboard/ExclusionDialog.tsx` | Manage excluded employees | None (form) |

---

### 🎯 Grid (Employee Visualization)

Components for the 9-box grid and employee manipulation.

| Component | File | Purpose | Reusable |
|-----------|------|---------|----------|
| **NineBoxGrid** | `grid/NineBoxGrid.tsx` | Container for 9 grid boxes | ✅ Potentially |
| **GridBox** | `grid/GridBox.tsx` | Individual 9-box position cell (droppable) | ✅ Yes |
| **EmployeeTile** | `grid/EmployeeTile.tsx` | Draggable employee card | ✅ Yes |
| **EmployeeCount** | `grid/EmployeeCount.tsx` | Badge showing employee count | ✅ Yes |
| **ViewModeToggle** | `grid/ViewModeToggle.tsx` | Normal/Donut view switcher | ❌ No (grid-specific) |

---

### 📋 Panel (Detailed Information)

Right panel components for employee details and analysis.

#### Panel Container

| Component | File | Purpose | Children |
|-----------|------|---------|----------|
| **RightPanel** | `panel/RightPanel.tsx` | Resizable panel with tabs | DetailsTab, ChangesTab, StatisticsTab, IntelligenceTab |

#### Panel Tabs

| Component | File | Purpose | Children |
|-----------|------|---------|----------|
| **DetailsTab** | `panel/DetailsTab.tsx` | Employee profile and history | EmployeeDetails, RatingsTimeline, ManagementChain |
| **ChangeTrackerTab** | `panel/ChangeTrackerTab.tsx` | Session change history (undo/redo) | None (list) |
| **StatisticsTab** | `panel/StatisticsTab.tsx` | Aggregate statistics | DistributionChart |
| **IntelligenceTab** | `panel/IntelligenceTab.tsx` | AI insights and analytics | IntelligenceSummary, DeviationChart, etc. |

#### Panel Components (Used in Tabs)

| Component | File | Purpose | Used In |
|-----------|------|---------|---------|
| **EmployeeDetails** | `panel/EmployeeDetails.tsx` | Employee profile card | DetailsTab |
| **RatingsTimeline** | `panel/RatingsTimeline.tsx` | Historical performance chart | DetailsTab |
| **ManagementChain** | `panel/ManagementChain.tsx` | Org chart visualization | DetailsTab |
| **DistributionChart** | `panel/DistributionChart.tsx` | Pie/Bar charts (Recharts) | StatisticsTab |

---

### 📈 Intelligence (Analytics & Insights)

Components for data visualization and AI-generated insights.

| Component | File | Purpose | Used In |
|-----------|------|---------|---------|
| **IntelligenceSummary** | `intelligence/IntelligenceSummary.tsx` | Overview statistics cards | IntelligenceTab |
| **DeviationChart** | `intelligence/DeviationChart.tsx` | Expected vs Actual bar chart | IntelligenceTab |
| **DistributionHeatmap** | `intelligence/DistributionHeatmap.tsx` | Position distribution heatmap | IntelligenceTab |
| **LevelDistributionChart** | `intelligence/LevelDistributionChart.tsx` | Stacked bar chart by level | IntelligenceTab |
| **AnomalySection** | `intelligence/AnomalySection.tsx` | Statistical anomaly display | IntelligenceTab |
| **MockDataDemo** | `intelligence/MockDataDemo.tsx` | Demo page (development only) | N/A |

---

### ⚙️ Common (Reusable Utilities)

Highly reusable components that can be used anywhere.

| Component | File | Purpose | Reusable |
|-----------|------|---------|----------|
| **FileUploadDialog** | `common/FileUploadDialog.tsx` | Excel file upload modal | ✅ Yes |
| **ZoomControls** | `common/ZoomControls.tsx` | Zoom in/out/reset buttons | ✅ Yes |
| **LanguageSelector** | `common/LanguageSelector.tsx` | i18n language picker | ✅ Yes |
| **LoadingSpinner** | `common/LoadingSpinner.tsx` | Loading indicator | ✅ Yes |
| **ErrorBoundary** | `common/ErrorBoundary.tsx` | Error boundary wrapper | ✅ Yes |
| **ConnectionStatus** | `common/ConnectionStatus.tsx` | Connection indicator | ⚠️ Moderate |
| **DevModeIndicator** | `common/DevModeIndicator.tsx` | Dev mode badge | ⚠️ Moderate |

---

### 🎛️ Settings

User preferences and configuration.

| Component | File | Purpose | Reusable |
|-----------|------|---------|----------|
| **SettingsDialog** | `settings/SettingsDialog.tsx` | App settings modal (theme, language) | ❌ No (app-specific) |

---

## Reusability Matrix

Components categorized by reusability potential.

### ✅ Highly Reusable (Generic)

Can be used in any React app with minimal modification.

- **ErrorBoundary** - Generic error boundary
- **LoadingSpinner** - Generic loading indicator
- **FileUploadDialog** - Generic file upload (Excel-specific)
- **ZoomControls** - Generic zoom controls
- **LanguageSelector** - Generic i18n selector
- **EmployeeCount** - Generic badge (can display any count)
- **DistributionChart** - Generic Recharts wrapper

### ⚠️ Moderately Reusable (Domain-Specific)

Can be adapted for similar talent management apps.

- **GridBox** - Droppable container (generic drag-drop)
- **EmployeeTile** - Draggable card (can be adapted)
- **NineBoxGrid** - 9-box grid layout (talent-specific)
- **RightPanel** - Resizable panel with tabs (generic layout)
- **DetailsTab** - Detail view pattern (adaptable)
- **StatisticsTab** - Statistics display pattern (adaptable)
- **DeviationChart** - Statistical chart (adaptable)
- **DistributionHeatmap** - Heatmap visualization (adaptable)
- **LevelDistributionChart** - Stacked bar chart (adaptable)
- **ConnectionStatus** - Connection indicator (adaptable)

### ❌ App-Specific (Not Reusable)

Tightly coupled to 9Boxer business logic.

- **DashboardPage** - Main app layout
- **AppBar** - App-specific toolbar
- **FileMenu** - 9Boxer file operations
- **FilterDrawer** - Employee filtering logic
- **ExclusionDialog** - Employee exclusion feature
- **ViewModeToggle** - Grid-specific modes
- **ChangeTrackerTab** - Session change tracking
- **IntelligenceTab** - AI insights (9-boxer specific)
- **EmployeeDetails** - Employee data model specific
- **RatingsTimeline** - Performance ratings specific
- **ManagementChain** - Org chart specific
- **IntelligenceSummary** - 9-box analytics specific
- **AnomalySection** - Statistical analysis specific
- **SettingsDialog** - App-specific settings
- **DevModeIndicator** - Development feature

---

## Migration Status

Tracking which components use design tokens vs. hardcoded values.

### ✅ Migrated (Uses Design Tokens)

Components that have been updated to use `theme.tokens.*`:

- **None yet** (Phase 1 just created tokens)

### ⏭️ Pending Migration (Hardcoded Values)

Components with hardcoded values identified in audit:

**High Priority (Phase 1):**
- GridBox (has local constants for BOX_HEIGHTS, OPACITY)
- EmployeeTile
- DashboardPage
- AppBar
- LoadingSpinner
- FileUploadDialog

**Medium Priority (Phase 2):**
- RightPanel (hardcoded panel widths)
- FilterDrawer
- DetailsTab
- ErrorBoundary

**Lower Priority (Phase 3):**
- All intelligence components (chart colors)
- All panel tab components
- Remaining common components

See [Hardcoded Values Audit](../../agent-tmp/hardcoded-values-audit.md) for complete migration plan.

---

## Component Index

Alphabetical index of all components with quick reference.

| Component | Location | Type | Reusable | Migrated |
|-----------|----------|------|----------|----------|
| AnomalySection | `intelligence/` | Intelligence | ⚠️ Moderate | ❌ |
| AppBar | `dashboard/` | Layout | ❌ No | ❌ |
| ChangeTrackerTab | `panel/` | Panel Tab | ❌ No | ❌ |
| ConnectionStatus | `common/` | Global | ⚠️ Moderate | ❌ |
| DashboardPage | `dashboard/` | Layout | ❌ No | ❌ |
| DetailsTab | `panel/` | Panel Tab | ⚠️ Moderate | ❌ |
| DeviationChart | `intelligence/` | Intelligence | ⚠️ Moderate | ❌ |
| DevModeIndicator | `common/` | Global | ⚠️ Moderate | ❌ |
| DistributionChart | `panel/` | Visualization | ✅ Yes | ❌ |
| DistributionHeatmap | `intelligence/` | Intelligence | ⚠️ Moderate | ❌ |
| EmployeeCount | `grid/` | Grid | ✅ Yes | ❌ |
| EmployeeDetails | `panel/` | Panel Component | ❌ No | ❌ |
| EmployeeTile | `grid/` | Grid | ✅ Yes | ❌ |
| ErrorBoundary | `common/` | Global | ✅ Yes | ❌ |
| ExclusionDialog | `dashboard/` | Modal | ❌ No | ❌ |
| FileMenu | `dashboard/` | Menu | ❌ No | ❌ |
| FileUploadDialog | `common/` | Modal | ✅ Yes | ❌ |
| FilterDrawer | `dashboard/` | Sidebar | ❌ No | ❌ |
| GridBox | `grid/` | Grid | ⚠️ Moderate | ❌ |
| IntelligenceSummary | `intelligence/` | Intelligence | ❌ No | ❌ |
| IntelligenceTab | `panel/` | Panel Tab | ❌ No | ❌ |
| LanguageSelector | `common/` | Utility | ✅ Yes | ❌ |
| LevelDistributionChart | `intelligence/` | Intelligence | ⚠️ Moderate | ❌ |
| LoadingSpinner | `common/` | Utility | ✅ Yes | ❌ |
| ManagementChain | `panel/` | Panel Component | ❌ No | ❌ |
| MockDataDemo | `intelligence/` | Development | ❌ No | ❌ |
| NineBoxGrid | `grid/` | Grid | ⚠️ Moderate | ❌ |
| RatingsTimeline | `panel/` | Panel Component | ❌ No | ❌ |
| RightPanel | `panel/` | Layout | ⚠️ Moderate | ❌ |
| SettingsDialog | `settings/` | Modal | ❌ No | ❌ |
| StatisticsTab | `panel/` | Panel Tab | ⚠️ Moderate | ❌ |
| ViewModeToggle | `grid/` | Control | ❌ No | ❌ |
| ZoomControls | `common/` | Control | ✅ Yes | ❌ |

---

## Component Statistics

### By Zone

| Zone | Count | Purpose |
|------|-------|---------|
| **Common** | 7 | Reusable utilities |
| **Dashboard** | 5 | Layout & navigation |
| **Grid** | 5 | Employee visualization |
| **Panel** | 9 | Detailed information |
| **Intelligence** | 6 | Analytics & insights |
| **Settings** | 1 | User preferences |
| **Total** | 32 | All components |

### By Reusability

| Category | Count | Percentage |
|----------|-------|------------|
| **Highly Reusable** | 7 | 22% |
| **Moderately Reusable** | 11 | 34% |
| **App-Specific** | 14 | 44% |

### By Migration Status

| Status | Count | Percentage |
|--------|-------|------------|
| **Migrated** | 0 | 0% |
| **Pending** | 32 | 100% |

---

## Component Relationships

### Parent-Child Relationships

**DashboardPage** is the root container:
- Uses 4 direct children (AppBar, FilterDrawer, NineBoxGrid, RightPanel)
- Manages 2 modal dialogs (FileUploadDialog, SettingsDialog via AppBar)
- Displays 2 global indicators (ConnectionStatus, DevModeIndicator)

**NineBoxGrid** renders 9 GridBox instances:
- Each GridBox contains multiple EmployeeTile instances
- GridBox also contains EmployeeCount badge

**RightPanel** uses Tab pattern:
- 4 tab components (Details, Changes, Statistics, Intelligence)
- Each tab has its own child components

**IntelligenceTab** uses 5 visualization components:
- IntelligenceSummary
- DeviationChart
- DistributionHeatmap
- LevelDistributionChart
- AnomalySection

### Shared Dependencies

**All components depend on:**
- `@mui/material` - Material-UI components
- `react-i18next` - Internationalization
- `useTheme()` - Theme access

**Visualization components depend on:**
- `recharts` - Charts library (DistributionChart, DeviationChart, etc.)

**Drag-and-drop components depend on:**
- `@dnd-kit/core` - Drag and drop (GridBox, EmployeeTile, NineBoxGrid)

---

## Next Steps

### Immediate (Phase 1 Migration)

1. **Migrate GridBox** to use `theme.tokens.dimensions.gridBox.*` and `theme.tokens.opacity.grid*`
2. **Migrate EmployeeTile** to use `theme.tokens.dimensions.employeeTile.*`
3. **Migrate common components** (LoadingSpinner, FileUploadDialog)

### Future Enhancements

1. **Create barrel exports** for each zone (`common/index.ts`, `grid/index.ts`, etc.)
2. **Add Storybook stories** for all reusable components
3. **Extract shared logic** into custom hooks (e.g., drag-and-drop hook)
4. **Create base components** for common patterns (Card, List, Tab patterns)

---

## Related Documentation

- [Design Principles](design-principles.md) - Core UX philosophy
- [Design Tokens](design-tokens.md) - All design constants
- [DESIGN_SYSTEM.md](../../DESIGN_SYSTEM.md) - Complete UI guidelines
- [Component Guidelines](component-guidelines.md) - Detailed component patterns (Phase 2)
- [Layout Patterns](layout-patterns.md) - Layout and hierarchy patterns (Phase 2)

---

## Questions?

**How to find a component:**
1. Check this index (alphabetical)
2. Look in component hierarchy (visual tree)
3. Search by zone (Dashboard, Grid, Panel, etc.)

**How to know if I should create a new component:**
1. Check if similar component exists in this inventory
2. Review reusability matrix
3. Follow decision tree in [DESIGN_SYSTEM.md](../../DESIGN_SYSTEM.md#when-to-create-new-components)

**How to know where a component should live:**
1. Check component hierarchy (where it's used)
2. Review UI zones in [DESIGN_SYSTEM.md](../../DESIGN_SYSTEM.md#ui-zones--layout-structure)
3. Follow existing folder structure (common, dashboard, grid, panel, etc.)
