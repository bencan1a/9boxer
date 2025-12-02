---
status: active
owner: Principal Architect
created: 2025-12-02
summary:
  - Design and implement 9-box performance review web application
  - Excel upload with drag-and-drop grid interface for talent assessment
  - Material Design UI with filtering, employee details, and statistics
---

# 9-Box Performance Review Application - Technical Plan

## Overview
Single-user web application for performance review discussions. Enables visual management of employee talent assessments on a 3×3 grid (Low/Medium/High Performance × Potential) with drag-and-drop functionality.

## Requirements Summary
- **Upload**: Excel file (.xlsx) with employee performance data
- **Visualize**: 3×3 grid displaying employees as draggable tiles
- **Interact**: Drag tiles between boxes to update ratings (auto-saved to session)
- **Filter**: By level, job function, manager, custom criteria
- **Details**: Right panel showing selected employee info and statistics
- **Export**: "Apply" button to persist changes back to Excel
- **Auth**: Simple username/password login (sensitive data)
- **Scale**: 10-100s of employees per session
- **Deployment**: Local machine (Docker)

## Architecture

### Technology Stack

**Frontend:**
- React 18 + TypeScript
- Material-UI (MUI) v5 - per user requirement
- @dnd-kit/core - modern drag & drop
- Recharts - statistics visualization
- Axios - HTTP client
- Vite - build tool
- React Router - navigation

**Backend:**
- Python 3.10+ (FastAPI)
- openpyxl + pandas - Excel I/O
- python-jose[cryptography] - JWT auth
- bcrypt - password hashing
- Pydantic - data validation
- SQLite - user credentials only
- In-memory dict - session data (Redis for future multi-user)

**Development:**
- Docker + Docker Compose - containerization
- pytest - backend testing
- Jest + React Testing Library - frontend testing
- ruff - linting/formatting (existing)
- mypy + pyright - type checking (existing)

### System Architecture

```
┌────────────────────────────────────────────────────────────┐
│  Browser (localhost:3000)                                  │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  React + Material-UI Frontend                        │ │
│  │  - LoginPage: username/password                      │ │
│  │  - DashboardPage: main layout                        │ │
│  │  - NineBoxGrid: 3×3 drag-drop grid (70% width)      │ │
│  │  - RightPanel: details + stats (30% width)          │ │
│  │  - FilterBar: multi-select filters                   │ │
│  │  - EmployeeTile: draggable card component           │ │
│  └──────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────┘
                        ↕ REST API (HTTPS)
┌────────────────────────────────────────────────────────────┐
│  FastAPI Backend (localhost:8000/api)                      │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  API Routes                                          │ │
│  │  /auth/login, /auth/logout                          │ │
│  │  /session/upload, /session/export, /session/clear   │ │
│  │  /employees (GET with filters)                      │ │
│  │  /employees/{id}/move (PATCH)                       │ │
│  │  /statistics (GET with filters)                     │ │
│  └──────────────────────────────────────────────────────┘ │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  Business Logic                                      │ │
│  │  - ExcelParser: XLSX → Employee objects             │ │
│  │  - SessionManager: In-memory state per session      │ │
│  │  - EmployeeService: CRUD, filtering, validation     │ │
│  │  - StatisticsService: Distribution calculations     │ │
│  │  - ExcelExporter: Modified data → XLSX              │ │
│  └──────────────────────────────────────────────────────┘ │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  Data Layer                                          │ │
│  │  - In-memory: Session data (dict)                   │ │
│  │  - SQLite: User credentials (bcrypt hashed)         │ │
│  │  - Filesystem: Temp storage for uploaded XLSX       │ │
│  └──────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────┘
```

## Data Model

### Actual Excel Schema (from sample file)

**Sheet 2: "PUX Mgrs"** (18 rows × 24 columns)

**Core Fields:**
- `Employee ID` (int): Unique identifier
- `Worker` (str): Employee name
- `Business Title` (str): Display title
- `Job Level - Primary Position` (str): MT1-MT6 levels
- `Worker's Manager` (str): Manager name
- `Management Chain - Level 04/05/06` (str): Org hierarchy

**Performance Data:**
- `Aug 2025 Talent Assessment Performance` (str): "Low" | "Medium" | "High"
- `Aug 2025 Talent Assessment Potential` (str): "Low" | "Medium" | "High"
- `Aug 2025 Talent Assessment 9-Box Label` (float): 1-9 grid position
- `Talent Mapping Position [Performance vs Potential]` (str): e.g., "Top Talent [H,H]"
- `FY25 Talent Indicator` (str): Category label

**Historical Ratings:**
- `2023 Completed Performance Rating` (str): "Strong" | "Solid" | "Leading"
- `2024 Completed Performance Rating` (str): Same values

**Tenure Data:**
- `Hire Date` (datetime): Calculate tenure
- `Tenure Category (Months)` (str): Pre-categorized
- `Time in Job Profile` (str): Length in current level

**Additional Context:**
- `Development Focus` (str): Development notes
- `Development Action` (str): Action items
- `Notes` (str): Free-form comments
- `Promotion (In-Line,` (str): Promotion indicator

**9-Box Grid Mapping:**
```
Grid Position Codes (1-9):
┌─────────┬─────────┬─────────┐
│ 7 [H,L] │ 8 [H,M] │ 9 [H,H] │  High Performance
├─────────┼─────────┼─────────┤
│ 4 [M,L] │ 5 [M,M] │ 6 [M,H] │  Medium Performance
├─────────┼─────────┼─────────┤
│ 1 [L,L] │ 2 [L,M] │ 3 [L,H] │  Low Performance
└─────────┴─────────┴─────────┘
   Low      Medium     High
      Potential
```

### Python Data Models

```python
from enum import Enum
from datetime import datetime, date
from typing import Optional
from pydantic import BaseModel

class PerformanceLevel(str, Enum):
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"

class PotentialLevel(str, Enum):
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"

class HistoricalRating(BaseModel):
    year: int
    rating: str  # "Strong", "Solid", "Leading"

class Employee(BaseModel):
    """Employee model matching Excel schema."""

    # Identifiers
    employee_id: int
    name: str  # Worker column

    # Job Information
    business_title: str
    job_title: str
    job_profile: str
    job_level: str  # MT1, MT2, MT4, MT5, MT6

    # Management
    manager: str
    management_chain_04: Optional[str] = None
    management_chain_05: Optional[str] = None
    management_chain_06: Optional[str] = None

    # Tenure
    hire_date: date
    tenure_category: str
    time_in_job_profile: str

    # Current Performance (editable via drag-drop)
    performance: PerformanceLevel
    potential: PotentialLevel
    grid_position: int  # 1-9
    position_label: str  # "Top Talent [H,H]"
    talent_indicator: str

    # Historical Performance
    ratings_history: list[HistoricalRating]

    # Development
    development_focus: Optional[str] = None
    development_action: Optional[str] = None
    notes: Optional[str] = None
    promotion_status: Optional[str] = None

    # Metadata
    modified_in_session: bool = False
    last_modified: Optional[datetime] = None

class SessionState(BaseModel):
    """In-memory session state."""
    session_id: str
    user_id: str
    created_at: datetime

    # Original uploaded data
    original_employees: list[Employee]
    original_filename: str

    # Current state (with modifications)
    current_employees: list[Employee]

    # Change tracking
    changes: list['EmployeeMove']

class EmployeeMove(BaseModel):
    """Track a single employee move."""
    employee_id: int
    employee_name: str
    timestamp: datetime
    old_performance: PerformanceLevel
    old_potential: PotentialLevel
    new_performance: PerformanceLevel
    new_potential: PotentialLevel
    old_position: int
    new_position: int

class User(BaseModel):
    """User authentication model."""
    user_id: str
    username: str
    hashed_password: str
    created_at: datetime
```

## API Specification

### Authentication Endpoints

```python
POST /api/auth/login
Request:  {username: str, password: str}
Response: {access_token: str, token_type: "bearer", expires_in: int}
Status:   200 OK | 401 Unauthorized

POST /api/auth/logout
Headers:  Authorization: Bearer {token}
Response: {success: bool}
Status:   200 OK

GET /api/auth/me
Headers:  Authorization: Bearer {token}
Response: {user_id: str, username: str}
Status:   200 OK | 401 Unauthorized
```

### Session Endpoints

```python
POST /api/session/upload
Headers:  Authorization: Bearer {token}
Request:  multipart/form-data (file: xlsx)
Response: {
    session_id: str,
    employee_count: int,
    filename: str,
    uploaded_at: datetime
}
Status:   200 OK | 400 Bad Request

GET /api/session/status
Headers:  Authorization: Bearer {token}
Response: {
    session_id: str,
    active: bool,
    employee_count: int,
    changes_count: int,
    uploaded_filename: str,
    created_at: datetime
}
Status:   200 OK | 404 Not Found

DELETE /api/session/clear
Headers:  Authorization: Bearer {token}
Response: {success: bool}
Status:   200 OK
```

### Employee Endpoints

```python
GET /api/employees?filters=...
Headers:  Authorization: Bearer {token}
Query Params:
    - level: str (comma-separated, e.g., "MT2,MT4")
    - job_profile: str (comma-separated)
    - manager: str (comma-separated)
    - exclude_ids: str (comma-separated employee IDs)
    - performance: str (L, M, H - comma-separated)
    - potential: str (L, M, H - comma-separated)
Response: {
    employees: list[Employee],
    total: int,
    filtered: int
}
Status:   200 OK

GET /api/employees/{employee_id}
Headers:  Authorization: Bearer {token}
Response: Employee
Status:   200 OK | 404 Not Found

PATCH /api/employees/{employee_id}/move
Headers:  Authorization: Bearer {token}
Request:  {
    performance: "Low" | "Medium" | "High",
    potential: "Low" | "Medium" | "High"
}
Response: {
    employee: Employee,
    change: EmployeeMove,
    success: bool
}
Status:   200 OK | 400 Bad Request | 404 Not Found
```

### Statistics Endpoint

```python
GET /api/statistics?filters=...
Headers:  Authorization: Bearer {token}
Query Params: Same as /api/employees (for filtering)
Response: {
    total_count: int,
    distribution: {
        "1": {count: int, percentage: float, label: "[L,L]"},
        "2": {count: int, percentage: float, label: "[L,M]"},
        ...
        "9": {count: int, percentage: float, label: "[H,H]"}
    },
    by_performance: {
        "Low": int,
        "Medium": int,
        "High": int
    },
    by_potential: {
        "Low": int,
        "Medium": int,
        "High": int
    }
}
Status:   200 OK
```

### Export Endpoint

```python
POST /api/session/export
Headers:  Authorization: Bearer {token}
Response: Excel file (application/vnd.openxmlformats-officedocument.spreadsheetml.sheet)
          - Includes all current ratings (modified + unmodified)
          - Adds "Modified" column (Yes/No)
          - Adds "Modified Date" column
          - Preserves all original columns
Status:   200 OK | 404 Not Found (no active session)
```

## Frontend Components

### Component Hierarchy

```
App
├── AuthProvider (context)
├── Router
    ├── LoginPage
    └── DashboardPage (protected)
        ├── AppBar
        │   ├── FileUploadButton
        │   ├── ApplyButton
        │   ├── FilterButton
        │   └── LogoutButton
        ├── FilterDrawer (collapsible)
        │   ├── LevelFilter (multi-select)
        │   ├── JobProfileFilter
        │   ├── ManagerFilter
        │   └── ExcludeEmployeesSelector
        ├── MainContent (flex layout)
        │   ├── NineBoxGrid (70% width)
        │   │   └── GridBox (9 instances)
        │   │       └── EmployeeTile[] (draggable)
        │   └── RightPanel (30% width)
        │       ├── Tabs
        │       │   ├── DetailsTab
        │       │   │   ├── EmployeeDetails
        │       │   │   └── RatingsTimeline
        │       │   └── StatisticsTab
        │       │       ├── DistributionTable
        │       │       └── DistributionChart
        └── Snackbar (notifications)
```

### Key Components

#### 1. **LoginPage**
```tsx
// Material-UI Card with centered form
- TextField (username)
- TextField (password, type="password")
- Button (Login)
- Error alert (if auth fails)
```

#### 2. **DashboardPage Layout**
```tsx
<Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
  <AppBar>
    {/* Upload, Apply, Filters, Logout */}
  </AppBar>

  <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
    <FilterDrawer />

    <Box sx={{ flex: 1, display: 'flex', gap: 2, p: 2 }}>
      <NineBoxGrid sx={{ flex: '0 0 70%' }} />
      <RightPanel sx={{ flex: '0 0 30%' }} />
    </Box>
  </Box>
</Box>
```

#### 3. **NineBoxGrid**
```tsx
// 3×3 CSS Grid with drop zones
<Grid container spacing={1} sx={{ aspectRatio: '1/1' }}>
  {[7,8,9,4,5,6,1,2,3].map(position => (
    <Grid item xs={4} key={position}>
      <GridBox
        position={position}
        label={getLabel(position)}
        employees={getEmployeesInBox(position)}
        onDrop={handleDrop}
      />
    </Grid>
  ))}
</Grid>

// Grid labels (axes)
- Y-axis (left): "High Performance" → "Low Performance"
- X-axis (bottom): "Low Potential" → "High Potential"
```

#### 4. **EmployeeTile**
```tsx
<Card
  sx={{
    cursor: 'grab',
    opacity: isDragging ? 0.5 : 1,
    border: isModified ? '2px solid orange' : 'none'
  }}
>
  <CardContent>
    <Typography variant="subtitle1">{employee.name}</Typography>
    <Typography variant="body2" color="text.secondary">
      {employee.job_level} {employee.job_profile}
    </Typography>
    {isModified && <Chip label="Modified" size="small" color="warning" />}
  </CardContent>
</Card>
```

#### 5. **RatingsTimeline** (Material-UI Timeline)
```tsx
<Timeline position="alternate">
  <TimelineItem>
    <TimelineSeparator><TimelineDot /></TimelineSeparator>
    <TimelineContent>
      <Typography variant="h6">2025</Typography>
      <Typography>Current: {performance} / {potential}</Typography>
    </TimelineContent>
  </TimelineItem>
  <TimelineItem>
    <TimelineSeparator><TimelineDot /></TimelineSeparator>
    <TimelineContent>
      <Typography variant="h6">2024</Typography>
      <Typography>Rating: {rating_2024}</Typography>
    </TimelineContent>
  </TimelineItem>
  {/* ... */}
</Timeline>
```

#### 6. **DistributionChart**
```tsx
// Recharts BarChart showing distribution across 9 boxes
<BarChart data={distributionData}>
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis dataKey="label" />
  <YAxis />
  <Tooltip />
  <Bar dataKey="count" fill="#1976d2" />
</BarChart>
```

## Backend Services

### ExcelParser Service

```python
class ExcelParser:
    """Parse Excel file into Employee objects."""

    def parse(self, file_path: str) -> list[Employee]:
        """Read Excel sheet and convert to Employee list."""
        df = pd.read_excel(file_path, sheet_name=1)  # "PUX Mgrs" tab

        employees = []
        for _, row in df.iterrows():
            # Extract historical ratings
            history = []
            if pd.notna(row.get('2023 Completed Performance Rating')):
                history.append(HistoricalRating(
                    year=2023,
                    rating=row['2023 Completed Performance Rating']
                ))
            if pd.notna(row.get('2024 Completed Performance Rating')):
                history.append(HistoricalRating(
                    year=2024,
                    rating=row['2024 Completed Performance Rating']
                ))

            employee = Employee(
                employee_id=int(row['Employee ID']),
                name=row['Worker'],
                business_title=row['Business Title'],
                job_title=row['Job Title'],
                job_profile=row['Job Profile'],
                job_level=row['Job Level - Primary Position'],
                manager=row['Worker\'s Manager'] if pd.notna(row['Worker\'s Manager']) else '',
                management_chain_04=row.get('Management Chain - Level 04'),
                management_chain_05=row.get('Management Chain - Level 05'),
                management_chain_06=row.get('Management Chain - Level 06'),
                hire_date=row['Hire Date'],
                tenure_category=row['Tenure Category (Months)'],
                time_in_job_profile=row['Time in Job Profile'],
                performance=PerformanceLevel(row['Aug 2025 Talent Assessment Performance']),
                potential=PotentialLevel(row['Aug 2025  Talent Assessment Potential']),
                grid_position=int(row['Aug 2025 Talent Assessment 9-Box Label']),
                position_label=row['Talent Mapping Position [Performance vs Potential] '],
                talent_indicator=row['FY25 Talent Indicator '],
                ratings_history=history,
                development_focus=row.get('Development Focus '),
                development_action=row.get('Development Action '),
                notes=row.get('Notes '),
                promotion_status=row.get('Promotion (In-Line,'),
                modified_in_session=False
            )
            employees.append(employee)

        return employees
```

### ExcelExporter Service

```python
class ExcelExporter:
    """Export modified employee data back to Excel."""

    def export(self, original_file: str, employees: list[Employee], output_path: str):
        """Create new Excel file with updated ratings."""

        # Read original file to preserve formatting
        workbook = openpyxl.load_workbook(original_file)
        sheet = workbook.worksheets[1]  # "PUX Mgrs" tab

        # Find column indices
        perf_col = self._find_column(sheet, 'Aug 2025 Talent Assessment Performance')
        pot_col = self._find_column(sheet, 'Aug 2025  Talent Assessment Potential')
        box_col = self._find_column(sheet, 'Aug 2025 Talent Assessment 9-Box Label')
        label_col = self._find_column(sheet, 'Talent Mapping Position')

        # Add "Modified" column
        modified_col = sheet.max_column + 1
        sheet.cell(1, modified_col, 'Modified in Session')
        sheet.cell(1, modified_col + 1, 'Modification Date')

        # Update rows with modified data
        employee_map = {e.employee_id: e for e in employees}

        for row_idx in range(2, sheet.max_row + 1):
            emp_id = sheet.cell(row_idx, 1).value  # Employee ID
            if emp_id in employee_map:
                emp = employee_map[emp_id]

                # Update performance data
                sheet.cell(row_idx, perf_col, emp.performance.value)
                sheet.cell(row_idx, pot_col, emp.potential.value)
                sheet.cell(row_idx, box_col, emp.grid_position)
                sheet.cell(row_idx, label_col, emp.position_label)

                # Mark as modified
                sheet.cell(row_idx, modified_col, 'Yes' if emp.modified_in_session else 'No')
                if emp.modified_in_session and emp.last_modified:
                    sheet.cell(row_idx, modified_col + 1, emp.last_modified.isoformat())

        workbook.save(output_path)
```

### SessionManager Service

```python
class SessionManager:
    """Manage in-memory session state."""

    def __init__(self):
        self.sessions: dict[str, SessionState] = {}

    def create_session(self, user_id: str, employees: list[Employee], filename: str) -> str:
        """Create new session with uploaded data."""
        session_id = str(uuid.uuid4())

        session = SessionState(
            session_id=session_id,
            user_id=user_id,
            created_at=datetime.utcnow(),
            original_employees=employees.copy(),
            original_filename=filename,
            current_employees=employees.copy(),
            changes=[]
        )

        self.sessions[session_id] = session
        return session_id

    def get_session(self, session_id: str) -> Optional[SessionState]:
        """Retrieve session by ID."""
        return self.sessions.get(session_id)

    def move_employee(self, session_id: str, employee_id: int,
                      new_performance: PerformanceLevel,
                      new_potential: PotentialLevel) -> EmployeeMove:
        """Update employee position in session."""
        session = self.sessions[session_id]

        # Find employee
        employee = next((e for e in session.current_employees if e.employee_id == employee_id), None)
        if not employee:
            raise ValueError(f"Employee {employee_id} not found")

        # Track change
        change = EmployeeMove(
            employee_id=employee_id,
            employee_name=employee.name,
            timestamp=datetime.utcnow(),
            old_performance=employee.performance,
            old_potential=employee.potential,
            new_performance=new_performance,
            new_potential=new_potential,
            old_position=employee.grid_position,
            new_position=self._calculate_position(new_performance, new_potential)
        )

        # Update employee
        employee.performance = new_performance
        employee.potential = new_potential
        employee.grid_position = change.new_position
        employee.position_label = self._get_position_label(new_performance, new_potential)
        employee.modified_in_session = True
        employee.last_modified = change.timestamp

        session.changes.append(change)
        return change

    def _calculate_position(self, perf: PerformanceLevel, pot: PotentialLevel) -> int:
        """Calculate 1-9 grid position from performance/potential."""
        perf_map = {PerformanceLevel.LOW: 0, PerformanceLevel.MEDIUM: 3, PerformanceLevel.HIGH: 6}
        pot_map = {PotentialLevel.LOW: 1, PotentialLevel.MEDIUM: 2, PotentialLevel.HIGH: 3}
        return perf_map[perf] + pot_map[pot]
```

### StatisticsService

```python
class StatisticsService:
    """Calculate distribution statistics."""

    def calculate_distribution(self, employees: list[Employee]) -> dict:
        """Calculate 9-box distribution."""

        # Initialize counts
        distribution = {str(i): {"count": 0, "percentage": 0.0, "label": ""} for i in range(1, 10)}

        # Count employees in each box
        for emp in employees:
            pos = str(emp.grid_position)
            distribution[pos]["count"] += 1
            distribution[pos]["label"] = self._get_box_label(emp.grid_position)

        # Calculate percentages
        total = len(employees)
        for box in distribution.values():
            box["percentage"] = round((box["count"] / total * 100), 1) if total > 0 else 0

        # Aggregate by performance/potential
        by_performance = {
            "Low": sum(1 for e in employees if e.performance == PerformanceLevel.LOW),
            "Medium": sum(1 for e in employees if e.performance == PerformanceLevel.MEDIUM),
            "High": sum(1 for e in employees if e.performance == PerformanceLevel.HIGH),
        }

        by_potential = {
            "Low": sum(1 for e in employees if e.potential == PotentialLevel.LOW),
            "Medium": sum(1 for e in employees if e.potential == PotentialLevel.MEDIUM),
            "High": sum(1 for e in employees if e.potential == PotentialLevel.HIGH),
        }

        return {
            "total_count": total,
            "distribution": distribution,
            "by_performance": by_performance,
            "by_potential": by_potential
        }
```

## Filtering Logic

### EmployeeService Filter Implementation

```python
class EmployeeService:
    """Filter and query employees."""

    def filter_employees(
        self,
        employees: list[Employee],
        levels: Optional[list[str]] = None,
        job_profiles: Optional[list[str]] = None,
        managers: Optional[list[str]] = None,
        exclude_ids: Optional[list[int]] = None,
        performance: Optional[list[str]] = None,
        potential: Optional[list[str]] = None
    ) -> list[Employee]:
        """Apply filters to employee list."""

        filtered = employees

        # Filter by level (e.g., ["MT2", "MT4"])
        if levels:
            filtered = [e for e in filtered if e.job_level in levels]

        # Filter by job profile
        if job_profiles:
            filtered = [e for e in filtered if e.job_profile in job_profiles]

        # Filter by manager
        if managers:
            filtered = [e for e in filtered if e.manager in managers]

        # Exclude specific employees (e.g., managers in the room)
        if exclude_ids:
            filtered = [e for e in filtered if e.employee_id not in exclude_ids]

        # Filter by performance level
        if performance:
            perf_levels = [PerformanceLevel(p) for p in performance]
            filtered = [e for e in filtered if e.performance in perf_levels]

        # Filter by potential level
        if potential:
            pot_levels = [PotentialLevel(p) for p in potential]
            filtered = [e for e in filtered if e.potential in pot_levels]

        return filtered

    def get_filter_options(self, employees: list[Employee]) -> dict:
        """Extract unique filter options from employee list."""
        return {
            "levels": sorted(set(e.job_level for e in employees)),
            "job_profiles": sorted(set(e.job_profile for e in employees)),
            "managers": sorted(set(e.manager for e in employees if e.manager)),
            "employees": [
                {"id": e.employee_id, "name": e.name, "level": e.job_level}
                for e in sorted(employees, key=lambda x: x.name)
            ]
        }
```

## Security Implementation

### JWT Authentication

```python
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext

SECRET_KEY = "your-secret-key-here"  # Load from env
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def decode_access_token(token: str) -> dict:
    return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
```

### Protected Routes (FastAPI Dependency)

```python
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthCredentials

security = HTTPBearer()

async def get_current_user(credentials: HTTPAuthCredentials = Depends(security)) -> str:
    """Validate JWT and return user_id."""
    try:
        payload = decode_access_token(credentials.credentials)
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid authentication")
        return user_id
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid authentication")

# Usage in routes
@router.get("/employees")
async def get_employees(user_id: str = Depends(get_current_user)):
    # user_id is validated and available
    pass
```

## File Structure

```
9boxer/
├── backend/                         # NEW: FastAPI backend
│   ├── src/
│   │   └── ninebox/
│   │       ├── __init__.py
│   │       ├── main.py              # FastAPI app entry
│   │       ├── api/
│   │       │   ├── __init__.py
│   │       │   ├── auth.py          # /auth/* endpoints
│   │       │   ├── session.py       # /session/* endpoints
│   │       │   ├── employees.py     # /employees/* endpoints
│   │       │   └── statistics.py    # /statistics endpoint
│   │       ├── models/
│   │       │   ├── __init__.py
│   │       │   ├── employee.py      # Employee, Rating models
│   │       │   ├── session.py       # SessionState, EmployeeMove
│   │       │   └── user.py          # User model
│   │       ├── services/
│   │       │   ├── __init__.py
│   │       │   ├── excel_parser.py
│   │       │   ├── excel_exporter.py
│   │       │   ├── session_manager.py
│   │       │   ├── employee_service.py
│   │       │   └── statistics_service.py
│   │       ├── core/
│   │       │   ├── __init__.py
│   │       │   ├── config.py        # Settings (from env)
│   │       │   ├── security.py      # JWT, password utils
│   │       │   └── database.py      # SQLite connection
│   │       └── utils/
│   │           ├── __init__.py
│   │           └── validators.py
│   ├── tests/
│   │   ├── test_api/
│   │   ├── test_services/
│   │   └── test_models/
│   ├── pyproject.toml               # Python dependencies
│   ├── requirements.txt             # Generated from pyproject.toml
│   └── pytest.ini
│
├── frontend/                        # NEW: React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   │   ├── LoginPage.tsx
│   │   │   │   └── ProtectedRoute.tsx
│   │   │   ├── dashboard/
│   │   │   │   ├── DashboardPage.tsx
│   │   │   │   ├── AppBar.tsx
│   │   │   │   └── FilterDrawer.tsx
│   │   │   ├── grid/
│   │   │   │   ├── NineBoxGrid.tsx
│   │   │   │   ├── GridBox.tsx
│   │   │   │   └── EmployeeTile.tsx
│   │   │   ├── panel/
│   │   │   │   ├── RightPanel.tsx
│   │   │   │   ├── DetailsTab.tsx
│   │   │   │   ├── StatisticsTab.tsx
│   │   │   │   ├── EmployeeDetails.tsx
│   │   │   │   ├── RatingsTimeline.tsx
│   │   │   │   └── DistributionChart.tsx
│   │   │   └── common/
│   │   │       ├── FileUploadButton.tsx
│   │   │       └── LoadingSpinner.tsx
│   │   ├── hooks/
│   │   │   ├── useAuth.ts           # Authentication state
│   │   │   ├── useSession.ts        # Session management
│   │   │   ├── useEmployees.ts      # Employee data + filters
│   │   │   └── useStatistics.ts     # Statistics data
│   │   ├── services/
│   │   │   ├── api.ts               # Axios client
│   │   │   ├── authService.ts
│   │   │   ├── sessionService.ts
│   │   │   ├── employeeService.ts
│   │   │   └── statisticsService.ts
│   │   ├── store/
│   │   │   ├── authStore.ts         # Zustand: auth state
│   │   │   ├── sessionStore.ts      # Zustand: session state
│   │   │   └── filterStore.ts       # Zustand: filter state
│   │   ├── types/
│   │   │   ├── employee.ts
│   │   │   ├── session.ts
│   │   │   └── api.ts
│   │   ├── utils/
│   │   │   ├── gridHelpers.ts       # Position calculations
│   │   │   └── formatters.ts        # Date, number formatting
│   │   ├── theme/
│   │   │   └── theme.ts             # Material-UI theme config
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── vite-env.d.ts
│   ├── public/
│   │   └── favicon.ico
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── .eslintrc.cjs
│
├── data/                            # Runtime data (gitignored)
│   ├── temp/                        # Temp storage for uploaded files
│   └── ninebox.db                   # SQLite database
│
├── docker/
│   ├── Dockerfile.backend
│   ├── Dockerfile.frontend
│   └── nginx.conf                   # Serve React + proxy API
│
├── docker-compose.yml               # Full stack deployment
├── .env.example                     # Environment variables template
├── .gitignore
├── README.md
├── CLAUDE.md                        # (existing project instructions)
└── examine_excel.py                 # (temp - can delete after dev)
```

## Development Workflow

### Phase 1: Backend Foundation (Week 1)
1. Set up FastAPI project structure
2. Implement User model + SQLite database
3. Implement JWT authentication (login/logout)
4. Create ExcelParser service with test coverage
5. Implement SessionManager (in-memory storage)
6. Create basic API endpoints (upload, get employees, move)

### Phase 2: Frontend Foundation (Week 1-2)
1. Set up React + TypeScript + Vite project
2. Configure Material-UI theme
3. Implement LoginPage with auth flow
4. Create DashboardPage layout
5. Build basic NineBoxGrid (static, no drag-drop yet)
6. Implement API service layer with Axios

### Phase 3: Drag & Drop (Week 2)
1. Integrate @dnd-kit into EmployeeTile
2. Implement drop zones in GridBox
3. Connect drag events to API (PATCH /employees/{id}/move)
4. Add visual feedback (drag preview, drop indicators)
5. Show success/error notifications (Snackbar)

### Phase 4: Filtering & Details (Week 2-3)
1. Build FilterDrawer with multi-select filters
2. Implement filter logic in backend EmployeeService
3. Create DetailsTab with EmployeeDetails component
4. Build RatingsTimeline using Material-UI Timeline
5. Add filter state management (Zustand)

### Phase 5: Statistics & Export (Week 3)
1. Implement StatisticsService in backend
2. Create StatisticsTab with DistributionChart (Recharts)
3. Build DistributionTable (Material-UI Table)
4. Implement ExcelExporter service
5. Add "Apply" button with export functionality

### Phase 6: Polish & Testing (Week 4)
1. Add loading states and error handling
2. Improve responsive design
3. Write unit tests (backend: pytest, frontend: Jest)
4. Write integration tests (API + UI)
5. Docker containerization
6. User acceptance testing with sample data

## Deployment

### Docker Compose Setup

```yaml
# docker-compose.yml
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: ../docker/Dockerfile.backend
    volumes:
      - ./data:/app/data
    environment:
      - DATABASE_URL=sqlite:///data/ninebox.db
      - SECRET_KEY=${SECRET_KEY}
      - CORS_ORIGINS=http://localhost:3000
    ports:
      - "8000:8000"
    networks:
      - ninebox-network

  frontend:
    build:
      context: ./frontend
      dockerfile: ../docker/Dockerfile.frontend
    ports:
      - "3000:80"
    depends_on:
      - backend
    networks:
      - ninebox-network

networks:
  ninebox-network:
    driver: bridge

volumes:
  data:
```

### Running Locally

```bash
# 1. Clone repo and navigate to project
cd 9boxer

# 2. Set up environment variables
cp .env.example .env
# Edit .env to set SECRET_KEY

# 3. Start services
docker-compose up --build

# 4. Access application
# - Frontend: http://localhost:3000
# - API docs: http://localhost:8000/docs

# 5. Create initial user (run once)
docker-compose exec backend python -c "
from ninebox.core.database import create_user
create_user('admin', 'password123')
"
```

## Testing Strategy

### Backend Tests (pytest)

```python
# tests/test_services/test_excel_parser.py
def test_parse_excel_file():
    parser = ExcelParser()
    employees = parser.parse('test_data.xlsx')

    assert len(employees) == 18
    assert employees[0].name == "Carolyn Blanco Losada"
    assert employees[0].performance == PerformanceLevel.LOW
    assert len(employees[0].ratings_history) == 2

# tests/test_api/test_auth.py
def test_login_success(client):
    response = client.post('/api/auth/login', json={
        'username': 'testuser',
        'password': 'testpass'
    })
    assert response.status_code == 200
    assert 'access_token' in response.json()

# tests/test_services/test_session_manager.py
def test_move_employee(session_manager, sample_employees):
    session_id = session_manager.create_session('user1', sample_employees, 'test.xlsx')

    change = session_manager.move_employee(
        session_id, 102671,
        PerformanceLevel.HIGH, PotentialLevel.HIGH
    )

    assert change.new_performance == PerformanceLevel.HIGH
    assert change.new_position == 9
```

### Frontend Tests (Jest + RTL)

```typescript
// src/components/grid/__tests__/EmployeeTile.test.tsx
describe('EmployeeTile', () => {
  it('renders employee information', () => {
    const employee = mockEmployee();
    render(<EmployeeTile employee={employee} />);

    expect(screen.getByText(employee.name)).toBeInTheDocument();
    expect(screen.getByText(employee.job_level)).toBeInTheDocument();
  });

  it('shows modified indicator for changed employees', () => {
    const employee = { ...mockEmployee(), modified_in_session: true };
    render(<EmployeeTile employee={employee} />);

    expect(screen.getByText('Modified')).toBeInTheDocument();
  });
});

// src/hooks/__tests__/useEmployees.test.ts
describe('useEmployees', () => {
  it('filters employees by level', async () => {
    const { result } = renderHook(() => useEmployees());

    act(() => {
      result.current.setFilters({ levels: ['MT2'] });
    });

    await waitFor(() => {
      expect(result.current.filteredEmployees.length).toBe(5);
    });
  });
});
```

## Future Enhancements (Post-MVP)

1. **Advanced Analytics Module**
   - Trend analysis (movement over time)
   - Flight risk indicators (high performers with low potential)
   - Diversity metrics (gender, tenure distribution)
   - Succession planning view

2. **Validation Rules Engine**
   - Enforce distribution limits (e.g., max 10% in top box)
   - Require justification for certain moves
   - Prevent direct L→H jumps without manager approval

3. **Bulk Operations**
   - Multi-select tiles for batch moves
   - Import/export comments
   - Undo/redo functionality

4. **Collaboration Features**
   - Multi-user sessions with real-time updates (WebSocket)
   - Comments and notes on individual employees
   - Role-based access (HR, Manager, Executive views)
   - Approval workflows

5. **Enhanced Reporting**
   - PDF export of 9-box grid
   - Custom report templates
   - Email summaries to stakeholders

6. **Performance Optimizations**
   - Redis for session storage (horizontal scaling)
   - PostgreSQL for production (if scale increases)
   - CDN for frontend assets

## Open Items

- [x] Excel schema analyzed
- [x] Data model designed
- [x] API specification complete
- [ ] Material-UI theme customization (colors, spacing)
- [ ] Initial user creation script
- [ ] Sample test data generator
- [ ] Deployment documentation
- [ ] User guide / tutorial

## Dependencies to Add

### Backend (pyproject.toml)
```toml
[project]
dependencies = [
    "fastapi>=0.104.0",
    "uvicorn[standard]>=0.24.0",
    "python-multipart>=0.0.6",  # File uploads
    "python-jose[cryptography]>=3.3.0",  # JWT
    "passlib[bcrypt]>=1.7.4",  # Password hashing
    "pandas>=2.1.0",
    "openpyxl>=3.1.0",
    "pydantic>=2.4.0",
    "pydantic-settings>=2.0.0",
]

[project.optional-dependencies]
dev = [
    "pytest>=7.4.0",
    "pytest-cov>=4.1.0",
    "pytest-asyncio>=0.21.0",
    "httpx>=0.25.0",  # For testing FastAPI
    "ruff>=0.1.0",
    "mypy>=1.6.0",
    "pyright>=1.1.0",
]
```

### Frontend (package.json)
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.18.0",
    "@mui/material": "^5.14.0",
    "@mui/icons-material": "^5.14.0",
    "@emotion/react": "^11.11.0",
    "@emotion/styled": "^11.11.0",
    "@dnd-kit/core": "^6.0.0",
    "@dnd-kit/sortable": "^7.0.0",
    "@dnd-kit/utilities": "^3.2.0",
    "axios": "^1.6.0",
    "zustand": "^4.4.0",
    "recharts": "^2.9.0",
    "date-fns": "^2.30.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^4.1.0",
    "typescript": "^5.2.0",
    "vite": "^4.5.0",
    "@testing-library/react": "^14.0.0",
    "@testing-library/jest-dom": "^6.1.0",
    "vitest": "^0.34.0",
    "eslint": "^8.52.0",
    "prettier": "^3.0.0"
  }
}
```

---

## Summary

This plan provides a complete technical specification for the 9-box performance review application based on the actual Excel schema. The architecture is designed for:

- **Simplicity**: Single-user, local deployment
- **Security**: Authentication required, sensitive data protected
- **Usability**: Material Design UI, intuitive drag-and-drop
- **Flexibility**: Powerful filtering for meeting scenarios
- **Maintainability**: Clean separation of concerns, comprehensive testing

**Next Steps:**
1. Review and approve this plan
2. Scaffold backend + frontend projects
3. Begin Phase 1 implementation (backend foundation)
4. Iterative development with regular testing using sample data

Ready to proceed when you approve!
