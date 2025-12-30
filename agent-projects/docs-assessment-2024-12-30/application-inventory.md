# 9Boxer Application Feature Inventory

**Assessment Date:** December 30, 2024
**Version:** 2.2
**Purpose:** Complete catalog of application functionality to inform documentation assessment

---

## Executive Summary

9Boxer is a desktop Electron application (React frontend, Python FastAPI backend) for talent management using the 9-box methodology. The application allows users to visualize, analyze, and manage employee performance and potential ratings with drag-and-drop interactions, intelligent analytics, and comprehensive filtering capabilities.

**Key Statistics:**
- 21 documented features across 5 main categories
- 4 distinct panels/tabs in the right-side information panel
- 7 filter categories with 100+ filter options
- 8 employee flag types for talent indicators
- Multi-view modes (Normal, Donut Mode, Grid Position filtering)

---

## 1. Core Features

### 1.1 Data Import/Export

#### Upload Employee Data
- **Functionality:** Import Excel files (.xlsx, .xls) with employee information
- **Required Columns:** Employee ID, Worker, Performance, Potential (case-sensitive)
- **Optional Columns:** 20+ additional fields including Job Level, Function, Location, Manager, Hire Date, flags, etc.
- **Validation:** Real-time validation with specific error messages
- **UI Components:** FileUploadDialog, file upload button in empty state
- **User Workflow:** First-time setup, updating data mid-session

#### Load Sample Data
- **Functionality:** Generate realistic sample dataset (200 employees) with one click
- **Includes:** 8 locations, 8 functions, 6 levels, 3 years of history, deliberate bias patterns
- **Purpose:** Learning, training, demos, testing workflows
- **UI Components:** LoadSampleDialog, sample data button in empty state and file menu
- **Generated Data:** Consistent seed for reproducibility

#### Export Changes
- **Functionality:** Export modified ratings to Excel with audit trail
- **Export Columns:** Original data + Modified in Session (Yes/No), 9Boxer Change Notes, updated Performance/Potential
- **Donut Export:** Separate columns for donut exercise placements
- **File Naming:** modified_[original-filename].xlsx
- **UI Location:** File menu "Apply X Changes to Excel"
- **Critical:** No auto-save - export is the only way to save work

### 1.2 9-Box Grid Visualization

#### Main Grid Display
- **Layout:** 3x3 grid showing 9 talent positions
- **Axes:** Performance (horizontal: Low-Medium-High), Potential (vertical: Low-Medium-High)
- **Position Numbering:** 1-9 (1=bottom-left, 9=top-right)
- **Employee Tiles:** Card-based UI showing name, title, job level
- **Visual Indicators:**
  - Orange left border for modified employees
  - Purple border for donut mode placements
  - Flag badges (colored dots) in top-right
  - History icon with original position label for moved employees
- **UI Components:** NineBoxGrid, GridBox, EmployeeTile, Axis labels, EmployeeCount

#### Drag-and-Drop Movement
- **Functionality:** Click, drag, and drop employees to change grid position
- **Real-time Feedback:** Drag overlay, target highlighting
- **Persistence:** Changes tracked in session until export
- **Undo:** Manual (drag back to original position)
- **Accessibility:** Keyboard shortcuts available
- **Technical:** @dnd-kit/core library

#### Grid Box Expansion
- **Functionality:** Click expand icon to focus on one box in full view
- **Behavior:** Selected box expands to fill grid, other 8 boxes collapse to small thumbnails
- **Use Case:** Review many employees in one position (e.g., 40 people in Core Talent)
- **Exit:** Click collapse icon or press ESC key
- **Persistence:** Expansion state persisted in localStorage

### 1.3 View Modes

#### Normal Mode
- **Default view:** All employees visible across 9 positions
- **Filtering:** Works with all filter categories
- **Changes:** Tracked with orange border indicator

#### Donut Mode
- **Purpose:** Validate center box (position 5) placements
- **Behavior:** Shows only employees in position 5 (Medium Performance, Medium Potential)
- **Question Asked:** "Where would they go if they can't stay in the center?"
- **Separate Tracking:** Donut placements don't affect actual ratings
- **Visual:** Purple borders on donut-mode-placed employees, "ACTIVE" chip on button
- **Export:** Donut positions exported in separate columns
- **Use Case:** Pre-calibration exercise, quality checking ratings
- **UI:** Donut Mode button in top toolbar

---

## 2. Right Panel Features (4 Tabs)

### 2.1 Details Tab

#### Employee Information Display
- **Triggering:** Click any employee tile
- **Sections Displayed:**
  1. **Current Assessment**
     - Grid position number and label
     - Performance rating (1-10 scale shown)
     - Potential rating (1-10 scale shown)
  2. **Job Information**
     - Business Title
     - Job Level
     - Job Function
     - Location
     - Hire Date
     - Tenure (calculated)
  3. **Flags Section**
     - 8 flag types displayed as colored badges
     - Flag types: Promotion Ready, New Hire, Flight Risk, High Retention Priority, Performance Improvement Plan, Succession Candidate, Key Talent, Pending Retirement
     - Color-coded for quick recognition
  4. **Reporting Chain**
     - Hierarchical display from employee → manager → director → VP → CEO
     - Clickable to filter by manager
     - Shows full organizational context
- **UI Components:** EmployeeDetails, EmployeeFlags, ManagementChain

### 2.2 Changes Tab (Change Tracker)

#### Session Change Tracking
- **Functionality:** Tracks all employee rating changes made in current session
- **Display:** Table format with columns:
  - Employee name
  - From position → To position
  - Change timestamp
  - Notes field
- **Notes:** Free-text field for documenting rationale
- **Auto-save:** Notes save automatically as typed
- **Empty State:** "No changes yet" message
- **Badge:** Change count badge on File menu button
- **Use Case:** Audit trail, calibration meeting documentation, compliance

#### Individual Employee Changes
- **Context:** When employee selected, shows their specific changes
- **History Timeline:** Shows movement history within session
- **Notes:** Add/edit notes for this specific employee

### 2.3 Statistics Tab

#### Distribution Analysis
- **Overall View:** Works without employee selection
- **Components:**
  1. **Summary Cards**
     - Total employees
     - Average performance rating
     - Average potential rating
     - Distribution health score
  2. **Distribution Table**
     - Count and percentage for each of 9 grid positions
     - Position labels (e.g., "Stars", "Core Talent", "Concerns")
     - Visual indicators for healthy/unhealthy distributions
  3. **Distribution Chart**
     - Horizontal bar chart
     - Visual representation of employee spread
     - Color-coded by grid position
- **Filtering:** Updates when filters applied
- **Use Case:** Identify grade inflation, succession risks, calibration issues
- **UI Components:** StatisticsTab, DistributionChart, DistributionTable

### 2.4 Intelligence Tab

#### AI-Powered Pattern Detection
- **Functionality:** Analyzes employee data for statistical anomalies and patterns
- **Sections:**
  1. **Summary Section**
     - Quick insights about overall distribution
     - Key findings highlighted
  2. **Insights Section**
     - Strategic recommendations
     - Pattern interpretations
     - Actionable suggestions
  3. **Anomaly Detection**
     - Location bias (e.g., "USA has 15% more high performers than expected")
     - Function bias (e.g., "Sales has 20% more high performers than average")
     - Manager leniency/harshness patterns
     - Level distribution issues
  4. **Distribution Analysis**
     - Heatmaps showing concentrations
     - Deviation charts
     - Statistical outliers highlighted
- **Visual Components:**
  - Anomaly cards (red/yellow/green severity)
  - Distribution heatmaps
  - Deviation charts
  - Level distribution charts
- **Use Case:** Pre-calibration analysis, bias detection, data quality checks
- **UI Components:** IntelligenceTab, AnomaliesSection, InsightsSection, DistributionSection, AnomalyCard

---

## 3. Filtering & Focus Tools

### 3.1 Filter Drawer

#### Comprehensive Filtering System
- **Access:** Click Filters button in top toolbar
- **Drawer Location:** Left side of screen, temporary overlay
- **Active Indicator:** Orange dot on Filters button when filters applied
- **Filter Categories:**
  1. **Job Levels** - MT1 through MT6 (or custom levels)
  2. **Job Functions** - Engineering, Sales, Marketing, Operations, Product, Design, Data, HR, etc.
  3. **Locations** - All unique locations in dataset
  4. **Managers** - All unique manager names
  5. **Flags** - 8 flag types (Promotion Ready, Flight Risk, etc.)
  6. **Grid Positions** - Filter by specific boxes (1-9)
  7. **Reporting Chain** - Filter by entire management hierarchy
- **Filter Logic:**
  - Within category: OR (any selected value)
  - Across categories: AND (all selected categories)
- **UI Components:** FilterDrawer, FilterSection, FlagFilters, GridPositionFilter, ReportingChainFilter
- **Employee Count:** Shows "X of Y employees" when filters active

#### Reporting Chain Filter
- **Functionality:** Click any manager name to see their entire team
- **Includes:** Direct reports and all downstream employees
- **Visual:** Active chip showing manager name
- **Clear:** Click X on chip or Clear All button
- **Use Case:** Team-focused reviews, manager-specific calibration

### 3.2 Exclusion Management

#### Individual Exclusion System
- **Purpose:** Temporarily hide specific employees from view
- **Access:** Filters drawer → Manage Exclusions button → ExclusionDialog
- **Exclusion Methods:**
  1. **Individual Selection** - Check boxes for specific employees
  2. **Quick Filters** - Exclude all VPs, Exclude Directors+, Exclude Managers
- **Behavior:**
  - Hidden from grid display
  - Still included in exports
  - Counts show excluded vs. visible
- **Persistence:** Session-level (clears on new upload)
- **Use Case:** Focus on ICs, hide executives from certain views

---

## 4. Settings & Preferences

### 4.1 Settings Dialog

#### Theme Selection
- **Options:** Light, Dark, System (follows OS preference)
- **Persistence:** Saved in localStorage
- **Access:** Settings button (gear icon) in top toolbar
- **Components:** SettingsDialog
- **System Integration:** Listens for OS theme changes when set to System

#### Language Selection (Future/In Progress)
- **Evidence:** LanguageSelector component exists
- **Current State:** English only
- **Infrastructure:** i18n framework (react-i18next) implemented
- **UI Ready:** Language selector in settings dialog

### 4.2 View Controls

#### Zoom Controls
- **Functionality:** Adjust grid zoom level (50% to 200%)
- **Controls:** Zoom in (+), Zoom out (-), Reset (100%), percentage display
- **Persistence:** Session-level (resets on reload)
- **Location:** Floating bottom-right corner
- **UI:** ZoomControls component

#### View Mode Toggle
- **Options:** Normal Grid, Donut Mode
- **Location:** Top toolbar
- **Indicator:** "ACTIVE" chip when Donut Mode enabled
- **UI:** ViewModeToggle component

#### Fullscreen Mode
- **Functionality:** Toggle fullscreen application view
- **Access:** Fullscreen button in view controls
- **Platform:** Electron native fullscreen API
- **Exit:** ESC key or unfullscreen button

---

## 5. Help & Information Features

### 5.1 Help System

#### Help Button
- **Location:** Top toolbar (question mark icon)
- **Links:**
  - Open User Guide (launches documentation in browser)
  - Keyboard Shortcuts reference
  - About 9Boxer (version info)
- **UI:** HelpButton component with menu

#### Tooltips
- **Coverage:** All major buttons and UI elements
- **Trigger:** Hover
- **Content:** Contextual help for each feature
- **Examples:** "Click to filter employees", "Drag to move employee", "Export your changes"

#### Empty State Guidance
- **When Shown:** No session/data loaded
- **Content:**
  - Welcome message
  - Two action paths: Load Sample Data or Upload File
  - Quick explanation of what 9Boxer does
- **UI:** EmptyState component

### 5.2 Status Indicators

#### Connection Status
- **Functionality:** Shows backend connection state
- **States:** Connected, Disconnected, Connecting
- **Location:** Bottom-left corner
- **Auto-reconnect:** Attempts reconnection if backend unavailable
- **UI:** ConnectionStatus component

#### Loading States
- **Full-screen Loader:** During app initialization
- **Inline Loaders:** During data uploads, sample generation
- **Messages:** Contextual (e.g., "Connecting to backend...", "Uploading file...")
- **UI:** LoadingSpinner component

#### Error Handling
- **Error Boundary:** Catches React component errors
- **Snackbar Notifications:** User-friendly error messages
- **Error Messages:** Specific, actionable guidance
- **Example:** "Excel file must contain 'Employee ID' column (case-sensitive)"

---

## 6. Advanced Features

### 6.1 Performance History Tracking

#### Timeline View
- **Functionality:** Display historical performance/potential ratings over time
- **Data:** Shows up to 3 years of history (if present in uploaded data)
- **Visualization:** Timeline component with year markers
- **Data Requirements:** Original_Performance, Original_Potential, Historical Performance columns
- **Use Case:** Track employee progression, identify trends
- **Location:** Details tab when employee selected
- **UI:** RatingsTimeline component

### 6.2 Flag System

#### 8 Talent Flags
1. **Promotion Ready** - Green
2. **New Hire** - Blue
3. **Flight Risk** - Red
4. **High Retention Priority** - Orange
5. **Performance Improvement Plan (PIP)** - Dark Red
6. **Succession Candidate** - Purple
7. **Key Talent** - Gold
8. **Pending Retirement** - Gray

**Functionality:**
- Visual badges on employee tiles
- Filter by flag type
- Display in Details tab
- Export to Excel

**Use Cases:**
- Identify at-risk employees (Flight Risk + High Retention Priority)
- Find promotion candidates
- Track PIPs
- Succession planning

---

## 7. Data Model

### Employee Object Fields

**Required:**
- employee_id (unique identifier)
- name (display name)
- performance (1-10 or Low/Medium/High)
- potential (1-10 or Low/Medium/High)
- grid_position (1-9, calculated from performance/potential)

**Job Information:**
- business_title
- job_level
- job_function
- location
- hire_date
- manager

**Tracking Fields:**
- modified_in_session (boolean)
- original_grid_position
- original_performance
- original_potential
- donut_position (for donut mode exercise)
- donut_performance
- donut_potential
- change_notes

**Flags:** (all boolean)
- is_promotion_ready
- is_new_hire
- is_flight_risk
- is_high_retention_priority
- is_on_pip
- is_succession_candidate
- is_key_talent
- is_pending_retirement

**Historical Data:**
- historical_performance_2023, 2024, 2025
- historical_potential_2023, 2024, 2025

---

## 8. Technical Architecture

### Frontend (React + TypeScript)
- **Framework:** React 18 with TypeScript
- **UI Library:** Material-UI (MUI) v5
- **State Management:** Zustand (session store, UI store)
- **Drag-and-Drop:** @dnd-kit
- **Routing:** React Router
- **Internationalization:** react-i18next
- **Theme:** Custom MUI theme with light/dark modes
- **Layout:** react-resizable-panels for panel management

### Backend (Python FastAPI)
- **Framework:** FastAPI
- **Session Management:** In-memory session storage
- **Data Processing:** Pandas for Excel/CSV processing
- **Sample Data:** Faker library for realistic data generation
- **Intelligence:** NumPy/Pandas for statistical analysis

### Desktop (Electron)
- **Platform:** Electron
- **Target:** Windows, macOS, Linux
- **IPC:** Electron IPC for file operations, theme detection
- **Local Storage:** All data stays on user's computer
- **No Cloud:** Fully offline capable

---

## 9. User Workflows

### Core User Journeys

1. **First-Time User (Alex)**
   - Load sample data
   - Explore grid, click employees
   - Try filters
   - Experiment with drag-and-drop
   - View statistics and intelligence

2. **Quarterly Review (Sarah)**
   - Upload current employee data
   - Review distribution in Statistics
   - Filter by department to review teams
   - Run Donut Mode exercise
   - Export results

3. **Calibration Meeting (Marcus)**
   - Load data before meeting
   - Check Intelligence for bias patterns
   - Share screen during meeting
   - Use filters to review teams
   - Move employees based on discussion
   - Add notes for each change
   - Export calibrated ratings

4. **Talent Analytics (Priya)**
   - Upload organizational data (200+ employees)
   - Review Intelligence anomalies
   - Filter by high potential
   - Analyze trends over time
   - Identify development candidates
   - Export insights

5. **Strategic Planning (James)**
   - Filter by leadership levels
   - Review Stars for succession
   - Check distribution health
   - Analyze by department
   - Export summary for board

---

## 10. Feature Gaps & Opportunities

### Features Present in Code but Undocumented
1. **Grid Position Filter** - Filter by specific boxes (1-9) - exists in code but not prominently documented
2. **Keyboard Shortcuts** - Mentioned in Help menu but no dedicated documentation page
3. **Panel Resize** - Users can resize right panel - not documented
4. **Grid Box Expansion** - Expand single box to full view - documented but not prominent
5. **Auto-collapse Panel** - Panel auto-collapses on small screens - not documented

### Potential Enhancements (Not Yet Built)
1. **Multi-user Collaboration** - No real-time collaboration features
2. **Data Versioning** - No built-in version control for talent data
3. **Custom Reports** - No report builder or templating system
4. **Historical Comparison** - Can't compare two different time periods side-by-side
5. **Goal Setting** - No integration with performance goals or OKRs
6. **Development Plans** - No development planning features
7. **Notifications** - No reminder system for reviews
8. **Data Import from HRIS** - Manual Excel upload only
9. **Advanced Analytics** - Limited to current statistical analysis
10. **Mobile App** - Desktop only

---

## 11. Summary Statistics

**Total Feature Count:** 21 major features
**UI Components:** 80+ React components
**Documentation Pages:** 21 pages (8,277 total lines)
**Filter Options:** 7 categories with dynamic options
**Export Columns:** 4 required + 20+ optional + 3 tracking columns
**Supported Platforms:** Windows, macOS, Linux
**Localization:** English (infrastructure for more languages)
**Theme Support:** Light, Dark, System

---

## Appendix A: Component Inventory

**Dashboard:**
- DashboardPage (main container)
- AppBarContainer / PureAppBar
- FilterDrawer
- FileMenuButton
- FileNameDisplay
- ChangeIndicator
- HelpButton

**Grid:**
- NineBoxGrid (main grid)
- GridBox (individual box)
- EmployeeTile / EmployeeTileList
- Axis (horizontal/vertical labels)
- EmployeeCount
- ViewModeToggle
- BoxHeader

**Right Panel:**
- RightPanel (tab container)
- DetailsTab / EmployeeDetails
- ChangeTrackerTab
- StatisticsTab
- IntelligenceTab
- RatingsTimeline
- ManagementChain
- EmployeeFlags
- DistributionChart

**Intelligence:**
- IntelligenceSummary
- AnomaliesSection
- InsightsSection
- DistributionSection
- AnomalyCard
- DistributionHeatmap
- DeviationChart
- LevelDistributionChart

**Filters:**
- FilterSection (generic filter category)
- FlagFilters
- GridPositionFilter
- ReportingChainFilter
- ExclusionList
- ExclusionDialog

**Common:**
- FileUploadDialog
- LoadSampleDialog
- SettingsDialog
- ViewControls
- ZoomControls
- LoadingSpinner
- ConnectionStatus
- ErrorBoundary
- EmptyState

---

**Document Version:** 1.0
**Last Updated:** December 30, 2024
**Next Review:** When new features added
