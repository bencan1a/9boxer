# Component Inventory

Complete catalog of all UI components in the 9Boxer application. This inventory documents the current state of componentization, showing which components use design tokens and which still have legacy hardcoded values.

**Last Updated:** 2025-12-28
**Total Components:** 60 component files (excluding tests and stories)

---

## Table of Contents

- [Component Hierarchy](#component-hierarchy)
- [Component Catalog by Zone](#component-catalog-by-zone)
- [Reusability Matrix](#reusability-matrix)
- [Design Token Usage](#design-token-usage)
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
| **EmptyState** | `common/EmptyState.tsx` | Consistent empty state display with icon, message, and optional action | ✅ Yes |
| **ConfirmDialog** | `common/ConfirmDialog.tsx` | Reusable confirmation dialog for user actions | ✅ Yes |
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

- **EmptyState** - Generic empty state with icon, message, and action
- **ConfirmDialog** - Generic confirmation dialog
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

## Design Token Usage

The 9Boxer codebase has a mix of components using the centralized design token system (`theme.tokens.*`) and legacy components with hardcoded values. This section documents the current state.

### Token System Overview

Design tokens are centralized in `frontend/src/theme/tokens.ts` and provide:
- **Colors**: Semantic colors, grid box colors, chart colors
- **Spacing**: 8px-based spacing scale (xs, sm, md, lg, xl, xxl)
- **Dimensions**: Component-specific dimensions (gridBox, panel, employeeTile)
- **Opacity**: Standard opacity levels (disabled, hover, active, grid-specific)
- **Duration/Easing**: Animation timing constants
- **Z-index**: Layering constants
- **Typography**: Font sizes, weights, line heights
- **Radius/Shadows**: Border radius and shadow definitions

### Current Adoption Status

**Components Using Design Tokens:** 27 out of 60 (45%)
**Components with Legacy Hardcoded Values:** 33 out of 60 (55%)

### Components Using Design Tokens

These components properly reference `theme.tokens.*` for styling:

**Grid Components:**
- GridBox - Uses `theme.tokens.duration`, `theme.tokens.easing`, `theme.tokens.opacity.grid*`
- EmployeeTile - Uses `theme.tokens.colors.semantic.donutMode`, `theme.tokens.colors.semantic.warning`
- NineBoxGrid - Uses `theme.tokens.duration.normal`, `theme.tokens.easing.easeInOut`
- BoxHeader - Uses `theme.tokens.opacity.hover`

**Dashboard Components:**
- DashboardPage - Uses `theme.tokens.duration.normal`, `theme.tokens.easing.easeInOut`

**Panel Components:**
- DistributionChart - Uses `theme.tokens.colors.semantic.*` for chart colors

**Intelligence Components:**
- DeviationChart - Uses `theme.tokens.colors.semantic.*`
- AnomalySection - Uses `theme.tokens.colors.semantic.*`
- LevelDistributionChart - Uses `theme.tokens.colors.semantic.*`
- DistributionHeatmap - Uses `theme.tokens.colors.semantic.*`

**Common Components:**
- ConnectionStatus - Uses `theme.tokens.duration.fast`, `theme.tokens.easing.easeInOut`
- LoadingSpinner - Uses `theme.tokens.spacing.md`, `theme.tokens.zIndex.tooltip`
- EmptyState - Uses `theme.tokens.spacing.*`, `theme.tokens.dimensions.*`
- LanguageSelector - Uses `theme.tokens.spacing.xxl`
- FileUploadDialog - Uses `theme.tokens.spacing.*`, `theme.tokens.radius.*`
- ConfirmDialog - Uses `theme.tokens.spacing.*`
- ErrorBoundary - Uses `theme.tokens.dimensions.errorBoundary.*`, `theme.tokens.spacing.*`

**Dashboard Components:**
- FilterDrawer - Uses `theme.tokens.dimensions.drawer.width`, `theme.tokens.dimensions.appBar.height`, `theme.tokens.spacing.*`
- PureAppBar - Uses `theme.tokens.dimensions.appBar.*`, `theme.tokens.spacing.*`

**Panel Components:**
- DetailsTab - Uses `theme.tokens.spacing.lg`
- StatisticsTab - Uses `theme.tokens.spacing.*`
- IntelligenceTab - Uses `theme.tokens.spacing.*`

**Filter Components:**
- ReportingChainFilter - Uses `theme.tokens.opacity.hover`
- GridPositionFilter - Uses `theme.tokens.opacity.hover`
- FlagFilters - Uses `theme.tokens.opacity.hover`
- ExclusionList - Uses `theme.tokens.opacity.hover`

**Intelligence Atoms:**
- ManagementChain - Uses `theme.tokens.opacity.hover`

### Components with Legacy Hardcoded Values

These components still use hardcoded pixel values, rem values, or numeric spacing instead of tokens:

**Panel Components:**
- RatingsTimeline - Hardcoded dimensions for timeline visualization
- EmployeeDetails - Hardcoded spacing and dimensions
- EmployeeFlags - Hardcoded spacing
- ChangeTrackerTab - Hardcoded spacing
- RightPanel - Hardcoded panel width values (320, 400, 600)

**Dashboard Components:**
- AppBar - Hardcoded spacing and dimensions
- FileMenu - Hardcoded spacing

**Common Components:**
- ZoomControls - Hardcoded spacing
- ViewControls - Hardcoded spacing

**Intelligence Components:**
- IntelligenceSummary - Hardcoded spacing and dimensions

**Grid Components:**
- Axis - Hardcoded dimensions and spacing

**Settings Components:**
- SettingsDialog - Hardcoded spacing and dimensions

**Events Components:**
- EventDisplay - Hardcoded spacing
- EmployeeChangesSummary - Hardcoded spacing

### Why the Mixed State?

The design token system was created in December 2025 to centralize design constants. Components using tokens were either:
1. **Created after token system** - Built with tokens from the start
2. **Updated during features** - Migrated to tokens when touched for feature work
3. **Grid/Intelligence focus** - Priority given to core grid and analytics components

Components with hardcoded values were either:
1. **Created before token system** - Pre-December 2025 legacy code
2. **Not touched recently** - Haven't needed updates since token system was created
3. **Complex calculations** - Some hardcoded values are algorithmic (e.g., SVG paths, timeline calculations) rather than design constants

---

## Component Index

Alphabetical index of all major components with quick reference.

| Component | Location | Type | Reusable | Uses Tokens |
|-----------|----------|------|----------|-------------|
| AnomalySection | `intelligence/` | Intelligence | ⚠️ Moderate | ✅ Partial |
| AppBar | `dashboard/` | Layout | ❌ No | ❌ Legacy |
| Axis | `grid/` | Grid | ✅ Yes | ❌ Legacy |
| BoxHeader | `grid/` | Grid | ✅ Yes | ✅ Partial |
| ChangeTrackerTab | `panel/` | Panel Tab | ❌ No | ❌ Legacy |
| ConfirmDialog | `common/` | Utility | ✅ Yes | ✅ Partial |
| ConnectionStatus | `common/` | Global | ⚠️ Moderate | ✅ Partial |
| DashboardPage | `dashboard/` | Layout | ❌ No | ✅ Partial |
| DetailsTab | `panel/` | Panel Tab | ⚠️ Moderate | ✅ Partial |
| DeviationChart | `intelligence/` | Intelligence | ⚠️ Moderate | ✅ Partial |
| DevModeIndicator | `common/` | Global | ⚠️ Moderate | ❌ Legacy |
| DistributionChart | `panel/` | Visualization | ✅ Yes | ✅ Partial |
| DistributionHeatmap | `intelligence/` | Intelligence | ⚠️ Moderate | ✅ Partial |
| EmptyState | `common/` | Utility | ✅ Yes | ✅ Partial |
| EmployeeChangesSummary | `panel/` | Panel Component | ❌ No | ❌ Legacy |
| EmployeeCount | `grid/` | Grid | ✅ Yes | ❌ Legacy |
| EmployeeDetails | `panel/` | Panel Component | ❌ No | ❌ Legacy |
| EmployeeFlags | `panel/` | Panel Component | ❌ No | ❌ Legacy |
| EmployeeTile | `grid/` | Grid | ✅ Yes | ✅ Partial |
| ErrorBoundary | `common/` | Global | ✅ Yes | ✅ Partial |
| EventDisplay | `events/` | Events | ⚠️ Moderate | ❌ Legacy |
| ExclusionDialog | `dashboard/` | Modal | ❌ No | ❌ Legacy |
| ExclusionList | `dashboard/filters/` | Filter | ❌ No | ✅ Partial |
| FileMenu | `dashboard/` | Menu | ❌ No | ❌ Legacy |
| FileUploadDialog | `common/` | Modal | ✅ Yes | ✅ Partial |
| FilterDrawer | `dashboard/` | Sidebar | ❌ No | ✅ Partial |
| FilterSection | `dashboard/filters/` | Filter | ✅ Yes | ❌ Legacy |
| FlagFilters | `dashboard/filters/` | Filter | ❌ No | ✅ Partial |
| GridBox | `grid/` | Grid | ⚠️ Moderate | ✅ Partial |
| GridPositionFilter | `dashboard/filters/` | Filter | ❌ No | ✅ Partial |
| IntelligenceSummary | `intelligence/` | Intelligence | ❌ No | ❌ Legacy |
| IntelligenceTab | `panel/` | Panel Tab | ❌ No | ✅ Partial |
| LanguageSelector | `common/` | Utility | ✅ Yes | ✅ Partial |
| LevelDistributionChart | `intelligence/` | Intelligence | ⚠️ Moderate | ✅ Partial |
| LoadingSpinner | `common/` | Utility | ✅ Yes | ✅ Partial |
| ManagementChain | `panel/` | Panel Component | ❌ No | ✅ Partial |
| MockDataDemo | `intelligence/` | Development | ❌ No | ❌ Legacy |
| NineBoxGrid | `grid/` | Grid | ⚠️ Moderate | ✅ Partial |
| PureAppBar | `dashboard/` | Layout | ❌ No | ✅ Partial |
| RatingsTimeline | `panel/` | Panel Component | ❌ No | ❌ Legacy |
| ReportingChainFilter | `dashboard/filters/` | Filter | ❌ No | ✅ Partial |
| RightPanel | `panel/` | Layout | ⚠️ Moderate | ❌ Legacy |
| SettingsDialog | `settings/` | Modal | ❌ No | ❌ Legacy |
| StatisticsTab | `panel/` | Panel Tab | ⚠️ Moderate | ✅ Partial |
| ViewControls | `common/` | Control | ✅ Yes | ❌ Legacy |
| ViewModeToggle | `grid/` | Control | ❌ No | ❌ Legacy |
| ZoomControls | `common/` | Control | ✅ Yes | ❌ Legacy |

**Legend:**
- **✅ Partial** - Uses some design tokens but may still have hardcoded values
- **❌ Legacy** - Primarily uses hardcoded values, not yet migrated to tokens

---

## Component Statistics

### By Zone

| Zone | Count | Purpose |
|------|-------|---------|
| **Common** | 11 | Reusable utilities (LoadingSpinner, EmptyState, ConfirmDialog, etc.) |
| **Dashboard** | 10 | Layout & navigation (AppBar, FilterDrawer, FileMenu, etc.) |
| **Grid** | 7 | Employee visualization (NineBoxGrid, GridBox, EmployeeTile, etc.) |
| **Panel** | 10 | Detailed information (tabs, charts, employee details) |
| **Intelligence** | 7 | Analytics & insights (charts, anomalies, summaries) |
| **Settings** | 1 | User preferences |
| **Events** | 1 | Event tracking |
| **Filter Subcomponents** | 5 | Specialized filter components |
| **Total** | ~50 | Major components (excluding utility/helper components) |

### By Reusability

| Category | Count | Percentage |
|----------|-------|------------|
| **Highly Reusable** | ~15 | 30% |
| **Moderately Reusable** | ~18 | 36% |
| **App-Specific** | ~17 | 34% |

### By Design Token Adoption

| Status | Count | Percentage | Description |
|--------|-------|------------|-------------|
| **Using Tokens (Partial)** | 27 | 45% | Components that reference `theme.tokens.*` |
| **Legacy (Hardcoded)** | 33 | 55% | Components with hardcoded values |

**Note:** "Partial" means the component uses some design tokens but may still have hardcoded values for complex calculations or legacy code paths. The design token system was introduced in December 2025, so most pre-existing components have not been migrated yet.

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
