# 9Boxer E2E Test Specification
## Minimal Atomic UX Test Suite

This document defines the minimal set of atomic UX operations that validate the core 9Boxer user experience. Each test specification includes setup, inputs, and success criteria.

---

## 1. DATA LOADING TESTS

### 1.1 Load Sample Data from Empty State
**Description:** Verify user can load sample data when no data is currently loaded.

**Prerequisites:**
- Application is open
- No data is currently loaded (empty state visible)

**Test Steps:**
1. Click the "Load Sample Data (200 employees)" button

**Success Criteria:**
- ✅ Sample data loads within reasonable time (< 5 seconds)
- ✅ Grid displays populated with employee tiles
- ✅ Employee count shows "200 employees" (or similar)
- ✅ All 9 grid boxes contain at least some employees
- ✅ File menu shows "sample-data.xlsx" or similar indicator

---

### 1.2 Load Sample Data from File Menu (Replace Existing)
**Description:** Verify user can load sample data from File menu when data already exists.

**Prerequisites:**
- Application has existing data loaded (sample or uploaded)

**Test Steps:**
1. Click File menu button
2. Select "Load Sample Dataset..." option
3. Confirm replacement in dialog (if warning appears)
4. Click "Load Sample Data" button in dialog

**Success Criteria:**
- ✅ Warning dialog appears indicating existing data will be replaced
- ✅ New sample data loads successfully
- ✅ Grid displays 200 employees
- ✅ Previous data is completely replaced
- ✅ File menu shows "sample-data.xlsx"

---

### 1.3 Import Excel File
**Description:** Verify user can import their own Excel file with employee data.

**Prerequisites:**
- Application is open
- Valid Excel file available with required columns: `Employee ID`, `Worker`, `Performance`, `Potential`

**Test Steps:**
1. Click File menu → "Import Data" (or use empty state button)
2. Select Excel file in file picker
3. Click "Upload" in dialog

**Success Criteria:**
- ✅ File upload dialog appears
- ✅ File processes successfully
- ✅ Success notification appears
- ✅ Grid populates with employees from the file
- ✅ Employee count matches file row count
- ✅ Employees are positioned correctly based on Performance/Potential ratings
- ✅ File menu shows the uploaded filename

---

## 2. EMPLOYEE SELECTION & RIGHT PANEL NAVIGATION TESTS

### 2.1 Select Employee Shows Details Panel
**Description:** Verify clicking an employee tile opens the right panel with Details tab.

**Prerequisites:**
- Sample data is loaded
- Right panel is not currently open (or no employee selected)

**Test Steps:**
1. Click any employee tile in the grid

**Success Criteria:**
- ✅ Right panel opens/becomes visible
- ✅ Details tab is active/selected
- ✅ Employee's name is displayed in panel header
- ✅ Employee tile gets visual selection indicator (border/highlight)

---

### 2.2 Details Tab Shows Employee Information
**Description:** Verify Details tab displays complete employee information.

**Prerequisites:**
- Sample data is loaded
- Employee is selected

**Test Steps:**
1. Select an employee tile
2. Verify Details tab is active

**Success Criteria:**
- ✅ Current Assessment section shows Performance and Potential ratings
- ✅ Job Information section shows: Function, Level, Location, Tenure
- ✅ Flags section displays any employee flags (if applicable)
- ✅ Reporting Chain section shows manager hierarchy up to CEO
- ✅ All data matches the employee's actual information

---

### 2.3 Timeline Tab Shows Performance History
**Description:** Verify Timeline tab displays 3-year performance history.

**Prerequisites:**
- Sample data is loaded (includes historical data)
- Employee is selected

**Test Steps:**
1. Select an employee tile
2. Click the "Timeline" tab in right panel

**Success Criteria:**
- ✅ Timeline tab becomes active
- ✅ Historical ratings are displayed (2023, 2024, 2025)
- ✅ Each year shows Performance and Potential values
- ✅ Visual representation of grid position movements over time
- ✅ Timeline shows progression/trends clearly

---

### 2.4 Statistics Tab Shows Distribution
**Description:** Verify Statistics tab displays distribution table and chart.

**Prerequisites:**
- Sample data is loaded

**Test Steps:**
1. Click the "Statistics" tab in right panel (no employee selection required)

**Success Criteria:**
- ✅ Statistics tab becomes active
- ✅ Distribution table shows breakdown by box (count and percentage)
- ✅ Visual bar chart displays distribution
- ✅ Summary cards show: Total employees, Average ratings, Distribution health metrics
- ✅ Percentages add up to 100%

---

### 2.5 Intelligence Tab Loads
**Description:** Verify Intelligence tab displays AI-powered insights.

**Prerequisites:**
- Sample data is loaded (contains detectable patterns)

**Test Steps:**
1. Click the "Intelligence" tab in right panel

**Success Criteria:**
- ✅ Intelligence tab becomes active
- ✅ Summary section appears at top
- ✅ Anomaly Detection section displays below
- ✅ At least one pattern/anomaly is detected (e.g., location bias, function bias)
- ✅ Anomaly cards show clear descriptions of detected patterns
- ✅ No loading errors or blank sections

---

## 3. MAKING CHANGES TESTS

### 3.1 Drag and Drop Employee to Different Box
**Description:** Verify user can move employee between grid boxes via drag and drop.

**Prerequisites:**
- Sample data is loaded
- Employee is visible in grid (not filtered out)

**Test Steps:**
1. Click and hold on an employee tile
2. Drag the tile to a different grid box
3. Release mouse to drop

**Success Criteria:**
- ✅ Tile follows cursor during drag operation
- ✅ Visual feedback indicates valid drop zones during drag
- ✅ Employee tile appears in new box position after drop
- ✅ Employee tile is removed from original box
- ✅ Grid updates immediately without page refresh

---

### 3.2 Modified Employee Shows Orange Border
**Description:** Verify moved employees display visual indicator (orange left border).

**Prerequisites:**
- Sample data is loaded

**Test Steps:**
1. Drag an employee to a different box (from test 3.1)
2. Observe the moved employee's tile

**Success Criteria:**
- ✅ Employee tile displays orange left border (color: #ff9800 in light mode, #ffb74d in dark mode)
- ✅ Border is clearly visible and distinguishes modified from unmodified employees
- ✅ Border persists after deselecting the employee
- ✅ Border remains visible when filtering/navigating

---

### 3.3 File Menu Badge Shows Change Count
**Description:** Verify File menu badge updates to show number of changes made.

**Prerequisites:**
- Sample data is loaded
- No changes made yet (or known change count)

**Test Steps:**
1. Note current change count (if any)
2. Move an employee to a different box
3. Observe File menu button

**Success Criteria:**
- ✅ File menu button displays badge/indicator
- ✅ Badge shows correct number of changes (increments by 1 after move)
- ✅ Badge updates immediately after change
- ✅ Badge is visually prominent (color/position makes it noticeable)

---

### 3.4 Changes Records Show Up When Employee is Moved
**Description:** Verify Changes tab records employee movements.

**Prerequisites:**
- Sample data is loaded
- Employee has been moved to a different box

**Test Steps:**
1. Move an employee to a different box
2. Click the moved employee tile
3. Click the "Changes" tab in right panel

**Success Criteria:**
- ✅ Changes tab shows the moved employee
- ✅ Previous position is displayed (e.g., "Medium Performance, Medium Potential")
- ✅ New position is displayed (e.g., "High Performance, High Potential")
- ✅ Change timestamp or indicator is visible
- ✅ Notes field is available for the change

---

### 3.5 Add Note to Changed Employee
**Description:** Verify user can add notes to document changes.

**Prerequisites:**
- Sample data is loaded
- Employee has been moved to a different box
- Employee is selected with Changes tab open

**Test Steps:**
1. Click moved employee tile
2. Switch to Changes tab
3. Click in the "Notes" field
4. Type a note: "Test note - promoted to senior role"
5. Click outside the field or press Tab to save

**Success Criteria:**
- ✅ Notes field is editable
- ✅ Text appears in field as user types
- ✅ Note saves automatically (no explicit save button required)
- ✅ Note persists when deselecting and reselecting employee
- ✅ No error messages or save failures

---

### 3.6 Apply Flag to Employee and Verify Display
**Description:** Verify user can add a flag to an employee and it appears in Details panel.

**Prerequisites:**
- Sample data is loaded
- Employee is selected

**Test Steps:**
1. Select an employee tile
2. Open Details tab (or Changes tab, depending on UI)
3. Add/apply a flag to the employee (e.g., "Promotion Ready", "Flight Risk")
4. Observe Details tab

**Success Criteria:**
- ✅ Flag can be applied/added to employee
- ✅ Flag appears in Flags section of Details tab
- ✅ Flag displays with correct name/label
- ✅ Flag is visually distinct (icon, color, badge)
- ✅ Flag persists when deselecting and reselecting employee

---

## 4. FILTERING TESTS

### 4.1 Open Filters Panel
**Description:** Verify Filters button opens the filter drawer.

**Prerequisites:**
- Sample data is loaded

**Test Steps:**
1. Click the "Filters" button in toolbar

**Success Criteria:**
- ✅ Filter drawer/panel opens from left side
- ✅ Filter categories are visible (Location, Function, Level, etc.)
- ✅ All filter options are displayed
- ✅ "Clear All" button is visible
- ✅ Panel can be closed (X button or outside click)

---

### 4.2 Apply Location Filter
**Description:** Verify applying a location filter shows only matching employees.

**Prerequisites:**
- Sample data is loaded
- Filters panel is open

**Test Steps:**
1. Open Filters panel
2. Under "Location" section, select "USA"
3. Observe grid updates

**Success Criteria:**
- ✅ Grid updates to show only USA employees
- ✅ Employee count updates (e.g., "45 of 200 employees")
- ✅ Non-USA employees are hidden/removed from grid
- ✅ USA filter shows as selected/active in panel
- ✅ Grid boxes update counts accordingly

---

### 4.3 Filters Button Shows Active State
**Description:** Verify Filters button indicates when filters are active.

**Prerequisites:**
- Sample data is loaded
- At least one filter is applied

**Test Steps:**
1. Apply any filter (e.g., Location: USA)
2. Close filters panel
3. Observe Filters button in toolbar

**Success Criteria:**
- ✅ Filters button displays orange dot or indicator
- ✅ Indicator is clearly visible and distinct from inactive state
- ✅ Indicator persists while filters remain active
- ✅ Indicator disappears when all filters are cleared

---

### 4.4 Employee Count Updates with Filter
**Description:** Verify employee count display updates when filters are applied.

**Prerequisites:**
- Sample data is loaded (200 employees)
- No filters currently applied

**Test Steps:**
1. Note total employee count display
2. Apply a filter (e.g., Location: USA)
3. Observe employee count display

**Success Criteria:**
- ✅ Count shows filtered employees vs. total (e.g., "45 of 200 employees")
- ✅ Count updates immediately when filter is applied
- ✅ Count is accurate (matches visible employees)
- ✅ Count returns to total when filters are cleared

---

### 4.5 Clear Filters
**Description:** Verify "Clear All" button removes all active filters.

**Prerequisites:**
- Sample data is loaded
- At least one filter is applied

**Test Steps:**
1. Apply one or more filters
2. Open Filters panel
3. Click "Clear All" button

**Success Criteria:**
- ✅ All filter selections are cleared
- ✅ Grid shows all 200 employees again
- ✅ Employee count returns to "200 employees"
- ✅ Filters button active indicator disappears
- ✅ No filters show as selected in panel

---

## 5. DONUT MODE TESTS

### 5.1 Switch to Donut Mode and Move Employee from Box 5
**Description:** Verify user can enable Donut mode and move an employee from the center box (Box 5) to another position.

**Prerequisites:**
- Sample data is loaded
- At least one employee exists in Box 5 (Medium Performance, Medium Potential)
- Normal grid mode is active

**Test Steps:**
1. Click "Donut Mode" button/toggle in toolbar
2. Verify Donut mode activates (center box is highlighted/focused)
3. Select an employee from Box 5 (center box)
4. Drag the employee to a different box (e.g., Box 6 - High Performance, Medium Potential)
5. Drop the employee

**Success Criteria:**
- ✅ Donut Mode toggle/button activates successfully
- ✅ UI indicates Donut mode is active (center box emphasis/highlighting)
- ✅ Box 5 employees are clearly visible and selectable
- ✅ Employee can be dragged from Box 5 to another box
- ✅ Employee moves to new position successfully
- ✅ Employee displays orange border indicating change
- ✅ Change is tracked (File menu badge updates, Changes tab records it)
- ✅ Can exit Donut mode and return to normal view

---

## 6. EXPORT TESTS

### 6.1 Export Changes to Excel
**Description:** Verify user can export changes and download updated Excel file.

**Prerequisites:**
- Sample data is loaded
- At least one change has been made (employee moved, note added)

**Test Steps:**
1. Make one or more changes (move employees, add notes)
2. Click File menu button
3. Click "Apply X Changes to Excel" option (where X = number of changes)
4. Wait for download

**Success Criteria:**
- ✅ Export option shows correct change count
- ✅ File downloads automatically to default downloads folder
- ✅ Filename follows pattern: `modified_[original-filename].xlsx`
- ✅ File is valid Excel format (.xlsx)
- ✅ No error messages during export

---

### 6.2 Exported File Contains Updated Ratings
**Description:** Verify exported Excel file reflects Performance/Potential changes.

**Prerequisites:**
- Sample data is loaded
- Employee has been moved to different box (known original and new positions)
- File has been exported (from test 6.1)

**Test Steps:**
1. Move an employee from known position to different position (record both)
2. Export the file
3. Open exported Excel file in Excel or compatible viewer
4. Locate the moved employee's row
5. Check Performance and Potential columns

**Success Criteria:**
- ✅ Excel file opens without errors
- ✅ Performance column shows updated value matching new position
- ✅ Potential column shows updated value matching new position
- ✅ All original columns are preserved
- ✅ Other unchanged employees retain original ratings

---

### 6.3 Exported File Contains Change Notes
**Description:** Verify exported Excel file includes notes in dedicated column.

**Prerequisites:**
- Sample data is loaded
- Employee moved with note added (specific note text recorded)
- File has been exported

**Test Steps:**
1. Move an employee and add note: "Test export note - performance improvement"
2. Export the file
3. Open exported Excel file
4. Locate the moved employee's row
5. Check for "9Boxer Change Notes" column

**Success Criteria:**
- ✅ "9Boxer Change Notes" column exists in exported file
- ✅ Column contains the note text exactly as entered
- ✅ Note appears in correct employee's row
- ✅ Employees without notes have empty/blank notes cell
- ✅ "Modified in Session" column shows "Yes" for changed employees

---

## TEST EXECUTION PRIORITY

### Phase 1: Critical Path (Must Pass for Basic Functionality)
1. 1.1 - Load Sample Data from Empty State
2. 2.1 - Select Employee Shows Details Panel
3. 3.1 - Drag and Drop Employee to Different Box
4. 6.1 - Export Changes to Excel

### Phase 2: Core Interactions (Essential Features)
5. 2.3 - Timeline Tab Shows Performance History
6. 2.4 - Statistics Tab Shows Distribution
7. 4.2 - Apply Location Filter
8. 3.5 - Add Note to Changed Employee
9. 3.4 - Changes Records Show Up When Employee is Moved

### Phase 3: Enhanced Features (Complete Coverage)
10. 2.5 - Intelligence Tab Loads
11. 3.6 - Apply Flag to Employee and Verify Display
12. 5.1 - Switch to Donut Mode and Move Employee from Box 5
13. 4.5 - Clear Filters
14. 1.2 - Load Sample Data from File Menu
15. 1.3 - Import Excel File

---

## NOTES FOR IMPLEMENTATION

### Test Data Requirements
- Use sample data generator for consistent test environment
- Tests should be independent (each test can run in isolation)
- Tests should clean up after themselves (or use fresh data per test)

### Common Setup
- All tests assume Electron app is launched and ready
- Default viewport/window size should be consistent
- Tests should wait for async operations (data loading, animations)

### Success Criteria Validation
- Each ✅ criterion should be explicitly asserted in test code
- Visual indicators should be verified via element presence, CSS properties, or screenshots
- Data accuracy should be verified by comparing expected vs. actual values

### Error Handling
- Tests should fail gracefully with clear error messages
- Screenshots should be captured on failure for debugging
- Timeouts should be reasonable (5-10s for data operations, 2-3s for UI updates)

---

**Document Version:** 1.0
**Last Updated:** 2025-12-30
**Total Tests:** 18 atomic test specifications
**Estimated Implementation Time:** Start with Phase 1 (4 tests), then expand
