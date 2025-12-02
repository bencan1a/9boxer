# 9-Box Application - Detailed Implementation Plan

## Overview

This document breaks down the remaining frontend implementation and testing into discrete chunks that can be tackled systematically by agents or developers.

---

## Frontend Implementation - 8 Chunks

### Chunk 1: Foundation Layer (Types, API, Store, Theme)

**Purpose**: Establish the core infrastructure that all components will depend on.

**Files to Create** (7 files):
1. `src/types/employee.ts` - Employee, HistoricalRating, Performance/Potential enums
2. `src/types/session.ts` - SessionState, EmployeeMove types
3. `src/types/api.ts` - API request/response types
4. `src/services/api.ts` - Axios client with interceptors, base config
5. `src/store/authStore.ts` - Zustand: login, logout, token management
6. `src/store/sessionStore.ts` - Zustand: session state, employees, changes
7. `src/theme/theme.ts` - Material-UI theme (colors, typography, spacing)

**Acceptance Criteria**:
- [ ] All TypeScript types match backend Pydantic models
- [ ] API client configured with base URL and auth interceptor
- [ ] Zustand stores provide reactive state management
- [ ] Theme applies Material Design principles (blue primary color)

**Estimated Time**: 1-2 hours

**Dependencies**: None (can start immediately)

---

### Chunk 2: Authentication & Routing

**Purpose**: Implement login flow and route protection.

**Files to Create** (5 files):
1. `src/components/auth/LoginPage.tsx` - Login form with Material-UI
2. `src/components/auth/ProtectedRoute.tsx` - Route wrapper requiring auth
3. `src/hooks/useAuth.ts` - Hook for auth state and actions
4. `src/App.tsx` - Root component with React Router
5. `src/main.tsx` - Entry point, renders App

**Key Features**:
- Login form with username/password fields
- Form validation (required fields)
- Error display for failed login
- Token storage in localStorage
- Auto-redirect to dashboard after login
- Protected routes redirect to login if not authenticated

**Acceptance Criteria**:
- [ ] User can login with bencan/password
- [ ] Invalid credentials show error message
- [ ] Successful login redirects to /dashboard
- [ ] Accessing /dashboard without login redirects to /login
- [ ] Logout clears token and redirects to login

**Estimated Time**: 1-2 hours

**Dependencies**: Chunk 1 (authStore, API client)

---

### Chunk 3: Dashboard Shell & File Upload

**Purpose**: Create main dashboard layout and file upload mechanism.

**Files to Create** (4 files):
1. `src/components/dashboard/DashboardPage.tsx` - Main layout container
2. `src/components/dashboard/AppBar.tsx` - Top bar with actions
3. `src/components/common/FileUploadDialog.tsx` - File picker dialog
4. `src/hooks/useSession.ts` - Hook for session operations

**Key Features**:
- App bar with title and action buttons (Upload, Filters, Apply, Logout)
- File upload dialog:
  - Opens on "Upload" button click
  - File input accepting .xlsx/.xls only
  - Drag-and-drop support (optional, nice-to-have)
  - Upload progress indicator
  - Success/error notifications
- Session status display (filename, employee count)
- Layout: flex container ready for grid + panels

**Acceptance Criteria**:
- [ ] App bar displays with all buttons
- [ ] Upload button opens file dialog
- [ ] Selected Excel file uploads to backend
- [ ] Success message shows employee count
- [ ] Error handling for invalid files
- [ ] Logout button works and redirects to login

**Estimated Time**: 2-3 hours

**Dependencies**: Chunk 2 (routing, auth)

---

### Chunk 4: 9-Box Grid Core (Drag & Drop)

**Purpose**: Build the interactive 3x3 grid with drag-and-drop functionality.

**Files to Create** (4 files):
1. `src/components/grid/NineBoxGrid.tsx` - 3x3 grid container with axes labels
2. `src/components/grid/GridBox.tsx` - Single box with drop zone
3. `src/components/grid/EmployeeTile.tsx` - Draggable employee card
4. `src/hooks/useEmployees.ts` - Hook for employee data and filtering

**Key Features**:
- 3x3 CSS Grid layout (responsive)
- Each box labeled (e.g., "Top Talent [H,H]", "Core Talent [M,M]")
- Employee count badge per box
- Employee tiles show: name, title, level
- Modified indicator (orange border/badge)
- Drag & drop using @dnd-kit:
  - Draggable tiles
  - Drop zones with visual feedback
  - API call on drop to update position
  - Optimistic UI update
- Axis labels: "Performance (Low → High)" vertical, "Potential (Low → High)" horizontal

**Grid Position Mapping**:
```
7 [H,L]  8 [H,M]  9 [H,H]   ← High Performance
4 [M,L]  5 [M,M]  6 [M,H]   ← Medium Performance
1 [L,L]  2 [L,M]  3 [L,H]   ← Low Performance
   ↑        ↑        ↑
  Low     Med     High
      Potential
```

**Acceptance Criteria**:
- [ ] 3x3 grid displays with correct labels
- [ ] Employees render in correct boxes based on performance/potential
- [ ] Drag tile from one box to another updates backend
- [ ] Modified tiles show visual indicator
- [ ] Box counts update after drag
- [ ] Snackbar notification on successful move

**Estimated Time**: 3-4 hours

**Dependencies**: Chunk 3 (session with employee data)

---

### Chunk 5: Filters & Exclusion Dialog

**Purpose**: Implement comprehensive filtering including the exclusion dialog with quick filters.

**Files to Create** (4 files):
1. `src/components/dashboard/FilterDrawer.tsx` - Left sidebar with filters
2. `src/components/dashboard/ExclusionDialog.tsx` - Modal dialog for exclusions
3. `src/store/filterStore.ts` - Zustand: filter state management
4. `src/hooks/useFilters.ts` - Hook for filter operations

**Key Features**:

**FilterDrawer**:
- Collapsible sidebar (toggle via "Filters" button)
- Filter sections:
  - Job Level (checkboxes: MT1, MT2, MT4, MT5, MT6)
  - Manager (checkboxes: dynamically loaded from data)
  - Management Chain (checkboxes: Level 04, 05, 06)
  - Exclude Employees (button opens ExclusionDialog)
- Active filter chips display
- Clear all filters button

**ExclusionDialog**:
- Modal dialog with Material-UI Dialog component
- Header: "Exclude Employees" with close button
- Quick filter buttons:
  - "Exclude VPs" (MT6+)
  - "Exclude Directors+" (MT5+)
  - "Exclude Managers in Room" (placeholder for future customization)
  - "Clear All"
- Search bar (filters checkbox list by name/title)
- "Select All" checkbox (toggles all visible items)
- Scrollable checkbox list showing:
  - Employee name
  - Level and manager (secondary text)
- Selected count indicator (e.g., "5/18 selected")
- Footer: Cancel and "Apply Exclusions" buttons

**Filter Behavior**:
- All filters combine with AND logic
- Exclusion takes precedence (excluded employees never show)
- Grid updates reactively as filters change
- Statistics recalculate for filtered view

**Acceptance Criteria**:
- [ ] Filter drawer toggles open/closed
- [ ] All filter checkboxes work correctly
- [ ] "Exclude Employees" button opens dialog
- [ ] Quick filter buttons pre-select correct employees
- [ ] Search filters the checkbox list
- [ ] Select All works on visible (filtered) items
- [ ] Apply button applies exclusions and closes dialog
- [ ] Grid shows only non-excluded, filtered employees
- [ ] Employee count updates in app bar

**Estimated Time**: 3-4 hours

**Dependencies**: Chunk 4 (grid displaying employees)

---

### Chunk 6: Right Panel - Details Tab

**Purpose**: Display detailed employee information with historical timeline.

**Files to Create** (4 files):
1. `src/components/panel/RightPanel.tsx` - Container with Material-UI Tabs
2. `src/components/panel/DetailsTab.tsx` - Details tab content wrapper
3. `src/components/panel/EmployeeDetails.tsx` - Employee info display
4. `src/components/panel/RatingsTimeline.tsx` - Timeline visualization

**Key Features**:

**RightPanel**:
- Fixed width (30% of container)
- Two tabs: "Details" and "Statistics"
- Tab indicator animation

**DetailsTab**:
- Shows message if no employee selected
- Renders EmployeeDetails + RatingsTimeline when employee selected

**EmployeeDetails**:
- Sections with Material-UI dividers:
  - Employee Information (name, title, level, manager, chains)
  - Current Assessment (performance, potential, position label, modified status)
- Clean, readable layout with label/value pairs

**RatingsTimeline**:
- Material-UI Timeline component
- Timeline items (top to bottom):
  - 2025 (Current) - Green dot - Performance/Potential
  - 2024 - Blue dot - Rating
  - 2023 - Blue dot - Rating
- Vertical connector line between items
- Conditional rendering (only shows years with data)

**Click Behavior**:
- Clicking employee tile selects it
- Selected tile gets highlighted border
- Details panel updates to show that employee

**Acceptance Criteria**:
- [ ] Clicking employee tile loads their details
- [ ] All employee information displays correctly
- [ ] Timeline shows current + historical ratings
- [ ] Modified status shows if employee was moved
- [ ] Management chain levels display when present
- [ ] Empty state shows when no employee selected

**Estimated Time**: 2-3 hours

**Dependencies**: Chunk 4 (employee tiles to click)

---

### Chunk 7: Right Panel - Statistics Tab

**Purpose**: Display distribution statistics and visualizations.

**Files to Create** (3 files):
1. `src/components/panel/StatisticsTab.tsx` - Statistics tab content
2. `src/components/panel/DistributionChart.tsx` - Bar chart visualization
3. `src/hooks/useStatistics.ts` - Hook for statistics data

**Key Features**:

**Summary Cards** (3 cards in a row):
- Total employees (in current filtered view)
- Modified count
- High performers count

**Distribution Table**:
- Material-UI Table
- Columns: Box Label, Count, Percentage
- Rows: All 9 boxes (sorted 9 → 1)
- Visual percentage bar in percentage column
- Highlight row if count > 0

**Distribution Chart** (Recharts Bar Chart):
- X-axis: 9-box positions (labels like "Top Talent [H,H]")
- Y-axis: Count
- Blue bars
- Tooltip on hover
- Responsive sizing

**Data Source**:
- GET /api/statistics with current filter params
- Updates when filters change
- Updates when employee is moved

**Acceptance Criteria**:
- [ ] Summary cards show correct totals
- [ ] Distribution table shows all 9 boxes
- [ ] Percentages calculate correctly
- [ ] Chart visualizes distribution
- [ ] Statistics update when filters change
- [ ] Statistics update after employee move
- [ ] Empty boxes show 0 count and 0%

**Estimated Time**: 2-3 hours

**Dependencies**: Chunk 5 (filters working) or Chunk 6 (just needs session)

---

### Chunk 8: Export, Error Handling & Polish

**Purpose**: Complete the application with export, error handling, and UX improvements.

**Files to Create** (2 files):
1. `src/components/common/LoadingSpinner.tsx` - Reusable loading component
2. `src/components/common/ErrorBoundary.tsx` - Error boundary wrapper

**Key Features**:

**Export Functionality**:
- "Apply" button in app bar
- Triggers POST /api/session/export
- Downloads modified Excel file
- Shows success notification
- Disables if no changes made

**Loading States**:
- Loading spinner during file upload
- Loading during login
- Loading during export
- Skeleton loaders for employee tiles (optional)

**Error Handling**:
- API error interceptor in axios
- User-friendly error messages
- Retry mechanism for failed requests
- Error boundary for React errors
- Form validation errors

**Notifications** (Material-UI Snackbar):
- Success: "Login successful", "File uploaded", "Employee moved", "Changes exported"
- Error: "Login failed", "Upload failed", "Network error"
- Info: "No changes to export"

**Responsive Design**:
- Grid responsive on smaller screens (stack to single column if needed)
- Mobile-friendly touch interactions for drag-and-drop
- Responsive typography

**Accessibility**:
- ARIA labels for interactive elements
- Keyboard navigation for drag-and-drop (if time permits)
- Focus indicators
- Alt text for icons

**Acceptance Criteria**:
- [ ] Apply button downloads Excel file
- [ ] Apply disabled when no changes made
- [ ] All loading states show spinners
- [ ] All errors display user-friendly messages
- [ ] Notifications appear and auto-dismiss
- [ ] Layout works on tablet/desktop sizes
- [ ] Basic accessibility (keyboard navigation, ARIA labels)

**Estimated Time**: 2-3 hours

**Dependencies**: All previous chunks (polishing complete app)

---

## Testing Plan

### Backend Testing

#### Unit Tests (pytest)

**Test Suite 1: Excel Parser** (`tests/test_services/test_excel_parser.py`)
- [ ] Test parsing sample Excel file
- [ ] Test handling missing columns (graceful degradation)
- [ ] Test parsing with different performance/potential values
- [ ] Test historical ratings extraction
- [ ] Test invalid file format handling
- [ ] Test empty file handling

**Test Suite 2: Session Manager** (`tests/test_services/test_session_manager.py`)
- [ ] Test create_session
- [ ] Test get_session
- [ ] Test move_employee
- [ ] Test position calculation (all 9 positions)
- [ ] Test change tracking
- [ ] Test session deletion

**Test Suite 3: Employee Service** (`tests/test_services/test_employee_service.py`)
- [ ] Test filter by level
- [ ] Test filter by manager
- [ ] Test filter by chain levels
- [ ] Test exclude employees by ID
- [ ] Test combined filters (AND logic)
- [ ] Test get_filter_options

**Test Suite 4: Statistics Service** (`tests/test_services/test_statistics_service.py`)
- [ ] Test distribution calculation
- [ ] Test percentage calculation
- [ ] Test aggregation by performance/potential
- [ ] Test empty employee list
- [ ] Test modified count

**Test Suite 5: Excel Exporter** (`tests/test_services/test_excel_exporter.py`)
- [ ] Test export creates valid Excel file
- [ ] Test modification tracking columns added
- [ ] Test original formatting preserved
- [ ] Test updated values written correctly

#### API Tests (pytest + httpx)

**Test Suite 6: Auth API** (`tests/test_api/test_auth.py`)
- [ ] Test login with valid credentials
- [ ] Test login with invalid credentials
- [ ] Test login with missing fields
- [ ] Test protected endpoint without token
- [ ] Test protected endpoint with invalid token
- [ ] Test protected endpoint with valid token
- [ ] Test logout

**Test Suite 7: Session API** (`tests/test_api/test_session.py`)
- [ ] Test upload valid Excel file
- [ ] Test upload invalid file type
- [ ] Test upload with large file (>10MB)
- [ ] Test get session status
- [ ] Test get status with no session
- [ ] Test export session
- [ ] Test export with no session
- [ ] Test clear session

**Test Suite 8: Employees API** (`tests/test_api/test_employees.py`)
- [ ] Test get all employees
- [ ] Test get with filters
- [ ] Test get single employee
- [ ] Test get non-existent employee
- [ ] Test move employee
- [ ] Test move with invalid performance/potential
- [ ] Test get filter options

**Test Suite 9: Statistics API** (`tests/test_api/test_statistics.py`)
- [ ] Test get statistics for all employees
- [ ] Test get statistics with filters
- [ ] Test statistics after employee move

#### Integration Tests

**Test Suite 10: End-to-End Flow** (`tests/test_integration/test_e2e.py`)
- [ ] Full workflow: login → upload → filter → move → export
- [ ] Test multiple users with separate sessions
- [ ] Test session persistence during user session
- [ ] Test cleanup on logout

### Frontend Testing

#### Component Tests (React Testing Library + Vitest)

**Test Suite 11: Auth Components** (`src/components/auth/__tests__/`)
- [ ] LoginPage renders form
- [ ] LoginPage submits credentials
- [ ] LoginPage shows error on failed login
- [ ] ProtectedRoute redirects when not authenticated
- [ ] ProtectedRoute renders children when authenticated

**Test Suite 12: Grid Components** (`src/components/grid/__tests__/`)
- [ ] NineBoxGrid renders 9 boxes
- [ ] GridBox displays employees
- [ ] EmployeeTile renders employee data
- [ ] EmployeeTile shows modified indicator
- [ ] Drag and drop updates position

**Test Suite 13: Filter Components** (`src/components/dashboard/__tests__/`)
- [ ] FilterDrawer renders all filter options
- [ ] ExclusionDialog opens and closes
- [ ] ExclusionDialog quick filters work
- [ ] ExclusionDialog search filters list
- [ ] Applied filters update employee list

**Test Suite 14: Panel Components** (`src/components/panel/__tests__/`)
- [ ] RightPanel switches between tabs
- [ ] EmployeeDetails displays all fields
- [ ] RatingsTimeline renders timeline items
- [ ] StatisticsTab shows correct counts
- [ ] DistributionChart renders

#### Integration Tests (Frontend)

**Test Suite 15: User Flows** (`src/__tests__/integration/`)
- [ ] User can login and logout
- [ ] User can upload file and see employees
- [ ] User can filter employees
- [ ] User can drag employee to new box
- [ ] User can exclude employees
- [ ] User can view employee details
- [ ] User can export modified data

### Manual Testing Checklist

#### Pre-Implementation Validation
- [ ] Backend starts without errors
- [ ] Database initializes with bencan user
- [ ] API docs accessible at http://localhost:8000/docs
- [ ] Can login via Swagger UI
- [ ] Can upload sample Excel file via Swagger UI
- [ ] Sample file parses correctly (check employee count)

#### Post-Implementation E2E Testing

**Authentication Flow**
- [ ] Open http://localhost:3000
- [ ] Redirects to /login
- [ ] Login with bencan/password succeeds
- [ ] Login with wrong password shows error
- [ ] Successful login redirects to /dashboard

**File Upload Flow**
- [ ] Click "Upload" button opens dialog
- [ ] Select sample Excel file
- [ ] File uploads successfully
- [ ] Employee count shows in UI
- [ ] Employees appear in 9-box grid

**Grid Interaction**
- [ ] Employees render in correct boxes
- [ ] Each box shows count badge
- [ ] Drag employee from one box to another
- [ ] Tile updates position
- [ ] Modified indicator appears
- [ ] Snackbar shows success message
- [ ] Employee count updates in boxes

**Filtering**
- [ ] Click "Filters" toggles drawer
- [ ] Uncheck MT1 level filter
- [ ] Team Leads disappear from grid
- [ ] Employee count updates
- [ ] Check MT1 again, they reappear

**Exclusion Dialog**
- [ ] Click "Exclude Employees" button
- [ ] Dialog opens with all employees listed
- [ ] Click "Exclude VPs" quick filter
- [ ] MT6 employees get checked
- [ ] Search for employee name filters list
- [ ] Click "Select All" toggles all visible
- [ ] Click "Apply Exclusions"
- [ ] Excluded employees disappear from grid
- [ ] Grid count updates

**Employee Details**
- [ ] Click employee tile
- [ ] Tile gets highlighted
- [ ] Details tab shows employee info
- [ ] All fields populated correctly
- [ ] Timeline shows 2023, 2024, 2025 ratings
- [ ] Current rating shows green dot

**Statistics**
- [ ] Click "Statistics" tab
- [ ] Summary cards show correct totals
- [ ] Distribution table lists all 9 boxes
- [ ] Percentages add up to 100%
- [ ] Chart visualizes distribution
- [ ] Move an employee
- [ ] Statistics update immediately

**Export**
- [ ] Move at least one employee
- [ ] Click "Apply" button
- [ ] Excel file downloads
- [ ] Open downloaded file
- [ ] Check "Modified in Session" column added
- [ ] Verify updated performance/potential values
- [ ] Verify original formatting preserved

**Error Handling**
- [ ] Upload invalid file type (.txt)
- [ ] Error message displays
- [ ] Logout and try accessing /dashboard directly
- [ ] Redirects to login
- [ ] Test with network disconnected
- [ ] Error message shows

**Responsive Design**
- [ ] Resize browser to tablet width
- [ ] Layout remains usable
- [ ] Grid adapts to smaller screen
- [ ] Panels stack or resize appropriately

### Performance Testing

- [ ] Upload file with 100+ employees (if available)
- [ ] Drag-and-drop remains smooth
- [ ] Filtering responds instantly
- [ ] Statistics calculate quickly
- [ ] Export completes in <5 seconds

### Browser Compatibility

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Edge (latest)
- [ ] Safari (if macOS available)

---

## Implementation Order & Scheduling

### Recommended Approach: Sequential Chunks

**Week 1**:
- Day 1: Chunk 1 (Foundation) + Chunk 2 (Auth)
- Day 2: Chunk 3 (Dashboard) + Chunk 4 (Grid start)
- Day 3: Chunk 4 (Grid finish) + Testing

**Week 2**:
- Day 1: Chunk 5 (Filters) + Chunk 6 (Details start)
- Day 2: Chunk 6 (Details finish) + Chunk 7 (Statistics)
- Day 3: Chunk 8 (Polish) + Testing

**Week 3**:
- Day 1-2: Backend testing (write and run all test suites)
- Day 3: Frontend testing + manual E2E testing

### Alternative Approach: Parallel Work

If multiple agents/developers available:

**Track 1** (Core Flow):
- Chunk 1 → Chunk 2 → Chunk 3 → Chunk 4

**Track 2** (Details & Viz):
- Wait for Chunk 3 → Chunk 6 → Chunk 7

**Track 3** (Filters):
- Wait for Chunk 4 → Chunk 5

**Track 4** (Polish):
- Wait for all → Chunk 8

**Track 5** (Testing):
- Backend tests can start anytime (backend complete)
- Frontend tests after each chunk completes

---

## Success Criteria

### Must Have (MVP)
- [ ] User can login
- [ ] User can upload any Excel file with expected structure
- [ ] Employees display in correct 9-box positions
- [ ] Drag-and-drop moves employees between boxes
- [ ] Filters work (level, manager, chain)
- [ ] Exclusion dialog with quick filters works
- [ ] Employee details display with timeline
- [ ] Statistics show distribution
- [ ] Export downloads modified Excel file
- [ ] All backend tests pass
- [ ] Core frontend components have tests
- [ ] Manual E2E testing completed

### Nice to Have (Post-MVP)
- [ ] Comprehensive frontend test coverage (>70%)
- [ ] Drag-and-drop keyboard accessibility
- [ ] Mobile responsive design
- [ ] Dark mode theme
- [ ] Undo/redo functionality
- [ ] Bulk operations
- [ ] Advanced analytics
- [ ] Role-based access control
- [ ] Multi-user collaboration

---

## Risk Mitigation

### High Risk Items
1. **Drag-and-drop complexity** - Mitigate: Use proven @dnd-kit library, test early
2. **Excel parsing edge cases** - Mitigate: Flexible parser with error handling, test with multiple files
3. **State synchronization** - Mitigate: Zustand for predictable state, test filters thoroughly
4. **Performance with large files** - Mitigate: Virtualization if needed, test with 100+ employees

### Medium Risk Items
1. **Browser compatibility** - Mitigate: Use Material-UI (cross-browser tested), test on major browsers
2. **Responsive design** - Mitigate: Mobile-first approach, test at multiple breakpoints
3. **Timezone handling** - Mitigate: Store dates in ISO format, display in local time

---

## Deployment Plan

### Development Setup
```bash
# Backend
cd backend
pip install -e '.[dev]'
python init_user.py
cd src
python -m ninebox.main  # Runs on :8000

# Frontend (new terminal)
cd frontend
npm install
npm run dev  # Runs on :3000, proxies API to :8000
```

### Production Deployment (Docker Compose)

**Create**:
1. `docker/Dockerfile.backend` - Backend container
2. `docker/Dockerfile.frontend` - Frontend build + nginx
3. `docker-compose.yml` - Full stack orchestration
4. `.env.example` - Environment variables template
5. `README.md` - Deployment instructions

**Docker Compose Structure**:
```yaml
services:
  backend:
    build: ./backend
    ports: ["8000:8000"]
    volumes: ["./data:/app/data"]
    env_file: .env

  frontend:
    build: ./frontend
    ports: ["3000:80"]
    depends_on: [backend]
```

**Deployment Steps**:
```bash
# 1. Clone repo
git clone <repo>
cd 9boxer

# 2. Configure
cp .env.example .env
# Edit .env to set SECRET_KEY

# 3. Build and run
docker-compose up --build

# 4. Initialize user
docker-compose exec backend python init_user.py

# 5. Access app
# Open http://localhost:3000
```

---

## Documentation Deliverables

1. **README.md** - Quick start, development setup, deployment
2. **CONTRIBUTING.md** - Development workflow, coding standards
3. **API.md** - API endpoint documentation (supplement Swagger)
4. **USER_GUIDE.md** - End-user instructions with screenshots
5. **ARCHITECTURE.md** - System design, data flow diagrams
6. **TESTING.md** - Testing strategy, how to run tests
7. **DEPLOYMENT.md** - Production deployment guide
8. **CHANGELOG.md** - Version history

---

## Next Steps After Plan Approval

1. **Review this plan** - Ensure all requirements captured
2. **Confirm chunk order** - Adjust if needed
3. **Begin Chunk 1** - Foundation layer (types, API, stores, theme)
4. **Test after each chunk** - Incremental validation
5. **Track progress** - Update todo list after each chunk
6. **Document as we go** - Add comments and docs during implementation

---

**Estimated Total Time**: 15-20 hours
- Frontend Implementation: 12-16 hours
- Backend Testing: 2-3 hours
- Frontend Testing: 1-2 hours
- Deployment Setup: 1 hour
- Documentation: 1-2 hours

**Current Status**: 40% complete (backend done, frontend structure ready)
**Remaining**: 60% (all frontend chunks + testing + deployment)
