# 9Boxer System Architecture

**Authority**: This is the authoritative system architecture document. For factual details, defer to `docs/facts.json`.

**Purpose**: Document the **system-level design patterns, architectural decisions, and design principles** that agents must understand and follow when working on 9Boxer.

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Core Architectural Patterns](#core-architectural-patterns)
3. [Backend Architecture](#backend-architecture)
4. [Frontend Architecture](#frontend-architecture)
5. [Data Flow & State Management](#data-flow--state-management)
6. [Component Reuse Strategy](#component-reuse-strategy)
7. [Extension Points & Abstractions](#extension-points--abstractions)
8. [Anti-Patterns to Avoid](#anti-patterns-to-avoid)

---

## System Overview

### Three-Layer Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Electron Desktop App                      │
├─────────────────────────────────────────────────────────────┤
│  Frontend (React + TypeScript)                              │
│  ├─ UI Components (Material-UI)                             │
│  ├─ State Management (Zustand stores)                       │
│  ├─ API Client Service (Axios)                              │
│  └─ IPC Bridge (contextBridge)                              │
├─────────────────────────────────────────────────────────────┤
│  Backend (FastAPI subprocess)                               │
│  ├─ REST API Routes                                         │
│  ├─ Service Layer (business logic)                          │
│  ├─ Session Manager (write-through cache)                   │
│  └─ SQLite Database                                         │
└─────────────────────────────────────────────────────────────┘
```

**Key Principle**: **Separation of Concerns**
- Frontend = Presentation & user interaction
- Backend = Business logic & data persistence
- Electron = Desktop integration & IPC

**Critical**: Never mix these concerns. Frontend should never directly access SQLite. Backend should never manipulate DOM.

---

## Core Architectural Patterns

### 1. Session-Based State Management

**Pattern**: All user work happens within a **session** that persists across restarts.

**Backend Implementation** (`SessionManager`):
```python
class SessionManager:
    """Write-through cache pattern:
    - In-memory for fast access
    - Auto-persisted to SQLite
    - Lazy-loaded on first access
    """
```

**Frontend Implementation** (`sessionStore`):
```typescript
export const useSessionStore = create<SessionState>((set, get) => ({
  sessionId: string | null,
  employees: Employee[],
  originalEmployees: Employee[],  // Immutable baseline
  changes: EmployeeMove[],        // Change tracking
  ...
}))
```

**Key Design Decisions**:
- **Single source of truth**: Backend owns session state
- **Optimistic updates**: Frontend updates UI immediately, syncs to backend
- **Change tracking**: All employee moves tracked as `EmployeeMove` objects
- **Restoration**: Sessions automatically restored from localStorage/SQLite on startup

**When Adding Features**:
- ✅ Use existing `SessionManager` for persistence
- ✅ Add new fields to `SessionState` model
- ✅ Extend session API endpoints
- ❌ Don't create parallel state management systems
- ❌ Don't bypass SessionManager for employee data

---

### 2. Service Layer Pattern

**Pattern**: Business logic lives in **service classes**, not in API routes or UI components.

**Structure**:
```
backend/src/ninebox/services/
├── session_manager.py      # Session lifecycle & persistence
├── employee_service.py      # Employee operations
├── excel_parser.py          # Excel file processing
├── excel_exporter.py        # Export to Excel
├── intelligence_service.py  # AI-powered insights
├── statistics_service.py    # Calculations & metrics
└── database.py              # Database connection management
```

**Example - Good**:
```python
# API route delegates to service
@router.post("/employees/{employee_id}/move")
def move_employee(employee_id: int, move_data: MoveRequest):
    session = session_manager.get_session(user_id)
    employee_service.move_employee(session, employee_id, move_data)
    return {"status": "success"}
```

**Example - Bad**:
```python
# Don't put business logic in routes!
@router.post("/employees/{employee_id}/move")
def move_employee(employee_id: int, move_data: MoveRequest):
    # ❌ Direct database access
    # ❌ Business logic in route
    # ❌ No service layer
    db.execute("UPDATE employees SET ...")
```

**When Adding Features**:
- ✅ Add new methods to existing services
- ✅ Create new service classes for new domains
- ✅ Keep API routes thin (just validation & delegation)
- ❌ Don't put business logic in API routes
- ❌ Don't duplicate logic across routes

---

### 3. Zustand Store Pattern (Frontend)

**Pattern**: Centralized state management with **Zustand stores**, not React component state.

**Existing Stores**:
```
frontend/src/store/
├── sessionStore.ts    # Session, employees, changes
├── filterStore.ts     # Grid filters (departments, functions, etc.)
└── uiStore.ts         # UI state (theme, dialogs, tooltips)
```

**Design Principles**:
- **Store per domain**: Session data, filters, UI state are separate
- **Actions co-located**: Store includes both state and actions
- **No prop drilling**: Components access stores directly via hooks
- **Async actions**: Stores handle API calls and error states

**Example - Good**:
```typescript
// In component
const { employees, moveEmployee } = useSessionStore();

// Move handled by store
await moveEmployee(id, "Exceeds", "High");
```

**Example - Bad**:
```typescript
// ❌ Don't manage session state in components
const [employees, setEmployees] = useState([]);
const [changes, setChanges] = useState([]);
// This duplicates sessionStore!
```

**When Adding Features**:
- ✅ Extend existing stores for related state
- ✅ Create new stores for new domains
- ✅ Use stores for any state needed by multiple components
- ❌ Don't use component state for session/employee data
- ❌ Don't pass session data through props

---

### 4. API Client Pattern

**Pattern**: **Single centralized API client** (`apiClient`) for all backend communication.

**Structure**:
```typescript
class ApiClient {
  private client: AxiosInstance;
  
  // Session operations
  async upload(file: File): Promise<UploadResponse>
  async getEmployees(): Promise<EmployeesResponse>
  async clearSession(): Promise<void>
  
  // Employee operations  
  async moveEmployee(id: number, move: MoveRequest): Promise<MoveResponse>
  async updateEmployee(id: number, updates: Partial<Employee>): Promise<Employee>
  
  // Intelligence operations
  async getIntelligence(): Promise<IntelligenceData>
  
  // Built-in: retry logic, error handling, type safety
}

export const apiClient = new ApiClient();
```

**Key Features**:
- **Retry logic**: Automatic retry with exponential backoff for network errors
- **Type safety**: Full TypeScript types for requests/responses
- **Error handling**: Consistent error format across API
- **Dynamic base URL**: Supports Electron's dynamic port selection

**When Adding Features**:
- ✅ Add new methods to `ApiClient` class
- ✅ Define TypeScript types for requests/responses
- ✅ Let existing retry/error logic handle failures
- ❌ Don't use `axios.get()` directly in components
- ❌ Don't create multiple API clients

---

### 5. Component Reuse Strategy

**Pattern**: **Check existing components before creating new ones.**

**Component Hierarchy**:
```
frontend/src/components/
├── common/              # Reusable primitives
│   ├── Card/
│   ├── Tooltip/
│   ├── Dialog/
│   └── IconButton/
├── grid/                # 9-box grid UI
│   ├── GridBox/         # Individual grid cell
│   ├── EmployeeAvatar/  # Employee visual
│   └── GridControls/    # Zoom, donut mode
├── panel/               # Right side panel
│   ├── EmployeeDetails/
│   ├── PerformanceChart/
│   └── ChangeHistory/
├── intelligence/        # AI insights
│   └── IntelligenceTab/
└── dashboard/           # Top-level views
```

**Reuse Principles**:
1. **Common components** = Used in 3+ places → `components/common/`
2. **Domain components** = Grid-specific → `components/grid/`
3. **Composition over duplication**: Combine existing components
4. **Props for variation**: Use props, not new components

**Example - Good**:
```typescript
// Reuse existing Card component
<Card variant="outlined">
  <EmployeeDetails employee={employee} />
</Card>
```

**Example - Bad**:
```typescript
// ❌ Don't create duplicate components
<EmployeeCard>  {/* Duplicates Card! */}
  <div className="employee-details">
    {/* Duplicates EmployeeDetails! */}
  </div>
</EmployeeCard>
```

**When Adding Features**:
- ✅ Search `components/` for similar functionality
- ✅ Extend existing components with props
- ✅ Compose existing components
- ❌ Don't create new components for minor variations
- ❌ Don't duplicate logic from existing components

---

## Backend Architecture

### Service Layer Design

**Pattern**: **Thin routes, fat services.**

```
API Route              Service Layer           Data Layer
─────────              ─────────────           ──────────
  │                         │                      │
  ├─ Validate input         │                      │
  │                         │                      │
  ├─ Get session     ──────>│                      │
  │                         ├─ Business logic      │
  │                         ├─ Calculate           │
  │                         ├─ Transform           │
  │                         │                      │
  │                         ├─ Persist      ──────>│
  │                         │                   (SQLite)
  ├─ Return response <──────┤                      │
```

**Responsibilities**:
- **Routes**: Input validation, authentication, response formatting
- **Services**: Business logic, calculations, orchestration
- **Models**: Data structures, validation (Pydantic)
- **Database**: Persistence only (no logic)

### Session Management Pattern

**Write-Through Cache**:
```python
class SessionManager:
    def __init__(self):
        self._sessions: dict[str, SessionState] = {}  # In-memory cache
        self._sessions_loaded: bool = False            # Lazy loading flag
    
    def create_session(self, ...):
        session = SessionState(...)
        self._sessions[user_id] = session  # Cache
        self._persist_session(session)     # Write-through to DB
```

**Key Decisions**:
- **Lazy loading**: Sessions loaded from DB only when first accessed (faster startup)
- **Write-through**: Every mutation immediately persisted
- **User ID as key**: One session per user
- **Deep copy for history**: Original state never mutated

### Excel Processing Pattern

**Two-Way Transformation**:
```
Excel File ──(parser)──> Employee objects ──(exporter)──> Excel File
```

**Key Services**:
- `ExcelParser`: Reads .xlsx → `List[Employee]`
  - Handles multiple sheet formats
  - Configurable column mappings
  - Job function parsing
  
- `ExcelExporter`: Writes `List[Employee]` → .xlsx
  - Preserves original formatting
  - Adds change tracking columns
  - Maintains formulas

**When Adding Features**:
- ✅ Extend parser/exporter for new columns
- ✅ Use `JobFunctionConfig` for flexibility
- ❌ Don't create parallel Excel processing
- ❌ Don't bypass parser for special cases

---

## Frontend Architecture

### State Management Hierarchy

```
Global State (Zustand)
├── sessionStore      # Session, employees, changes
├── filterStore       # Grid filters
└── uiStore           # UI preferences

Component State (useState)
└── Local UI only (hover, focus, animation)
```

**Rules**:
1. **Session data** → `sessionStore` (never component state)
2. **Filters** → `filterStore` (shared across components)
3. **UI preferences** → `uiStore` (theme, tooltips, etc.)
4. **Local UI** → `useState` (button hover, input focus)

### Component Architecture

**Composition Pattern**:
```typescript
// Good: Compose existing components
<Grid>
  <GridBox position={5}>
    <EmployeeAvatar employee={emp} />
  </GridBox>
</Grid>

// Bad: Monolithic component
<GridWithEmployees />  // ❌ Hard to reuse
```

**Container/Presentational Split**:
```typescript
// Container: Manages state
export const EmployeePanel = () => {
  const { selectedEmployee } = useSessionStore();
  return <EmployeeDetails employee={selectedEmployee} />;
};

// Presentational: Pure display
export const EmployeeDetails = ({ employee }: Props) => {
  return <Card>...</Card>;
};
```

### Design System Integration

**Token-Based Styling**:
```typescript
// ✅ Use design tokens
<Box sx={{ 
  color: theme.palette.primary.main,
  spacing: theme.spacing(2)
}} />

// ❌ Don't hardcode
<Box sx={{ color: '#1976d2', margin: '16px' }} />
```

**Component Library**:
- Material-UI (MUI) for all UI components
- Custom wrappers in `components/common/` for consistent styling
- Design tokens in `theme/tokens.ts`

---

## Data Flow & State Management

### Employee Move Flow

```
User drags employee on grid
        ↓
Component calls sessionStore.moveEmployee()
        ↓
Store optimistically updates UI
        ↓
Store calls apiClient.moveEmployee()
        ↓
Backend validates & persists
        ↓
Backend returns updated employee
        ↓
Store updates with server state
```

**Key Principles**:
- **Optimistic updates**: UI feels instant
- **Server validation**: Backend is source of truth
- **Conflict resolution**: Server state wins
- **Change tracking**: Every move recorded as `EmployeeMove`

### Donut Mode Pattern

**Parallel State Management**:
```typescript
interface SessionState {
  // Normal mode
  employees: Employee[];
  changes: EmployeeMove[];
  
  // Donut mode (parallel universe)
  donutModeActive: boolean;
  donutChanges: EmployeeMove[];  // Separate change tracking
}
```

**Why Parallel**:
- Donut mode is hypothetical ("what if?")
- Can toggle back to reality without losing hypothetical changes
- Can compare hypothetical vs. reality side-by-side

**When Adding Features**:
- ✅ Consider if feature needs parallel donut state
- ✅ Use same patterns for hypothetical vs. real
- ❌ Don't mix donut and normal changes

---

## Extension Points & Abstractions

### 1. Intelligence Service

**Purpose**: AI-powered insights and recommendations.

**Current Features**:
- Performance trend analysis
- Risk identification
- Development recommendations

**Extension Point**:
```python
class IntelligenceService:
    def analyze(self, employees: List[Employee]) -> IntelligenceData:
        """Main extension point for new AI features."""
        return IntelligenceData(
            trends=self._analyze_trends(employees),
            risks=self._identify_risks(employees),
            recommendations=self._generate_recommendations(employees),
            # Add new analysis types here
        )
```

**When Adding AI Features**:
- ✅ Extend `IntelligenceService`
- ✅ Add new methods for specific analyses
- ✅ Return structured data (typed classes)
- ❌ Don't put AI logic in API routes
- ❌ Don't duplicate trend analysis

### 2. Filter System

**Purpose**: Flexible filtering of employee grid.

**Architecture**:
```typescript
interface FilterState {
  departments: string[];
  jobFunctions: string[];
  performanceLevels: string[];
  // Easy to extend with new filters
}

// Filter logic centralized in filterStore
const filteredEmployees = employees.filter(emp => 
  matchesDepartment(emp) && 
  matchesJobFunction(emp) &&
  matchesPerformance(emp)
);
```

**When Adding Filters**:
- ✅ Add new filter state to `filterStore`
- ✅ Add new filter UI to `GridControls`
- ✅ Extend filter logic in store
- ❌ Don't filter in individual components
- ❌ Don't bypass filterStore

### 3. Statistics Service

**Purpose**: Calculate metrics and statistics.

**Extension Point**:
```python
class StatisticsService:
    def calculate_statistics(self, employees: List[Employee]) -> Statistics:
        """Centralized calculation point."""
        return Statistics(
            total_count=len(employees),
            distribution=self._calculate_distribution(employees),
            averages=self._calculate_averages(employees),
            # Add new metrics here
        )
```

**When Adding Metrics**:
- ✅ Add calculation methods to `StatisticsService`
- ✅ Return typed results
- ✅ Reuse existing calculations
- ❌ Don't calculate metrics in UI components
- ❌ Don't duplicate calculation logic

---

## Anti-Patterns to Avoid

### 1. Local Optimization Breaking Global Design

**❌ Anti-Pattern**:
```typescript
// Component creates its own session state
const MyComponent = () => {
  const [localEmployees, setLocalEmployees] = useState([]);
  
  useEffect(() => {
    // Duplicate API call!
    fetch('/api/employees').then(data => setLocalEmployees(data));
  }, []);
  
  // Now we have two sources of truth!
};
```

**✅ Correct Pattern**:
```typescript
// Use existing sessionStore
const MyComponent = () => {
  const { employees } = useSessionStore();
  // Single source of truth!
};
```

### 2. Duplicating Existing Components

**❌ Anti-Pattern**:
```typescript
// Creating new component that duplicates existing one
const EmployeeInfoCard = ({ employee }: Props) => {
  return (
    <div className="card">  {/* Duplicates Card component */}
      <h3>{employee.name}</h3>
      <p>{employee.department}</p>
    </div>
  );
};
```

**✅ Correct Pattern**:
```typescript
// Compose existing components
const EmployeeInfoCard = ({ employee }: Props) => {
  return (
    <Card>  {/* Reuse existing Card */}
      <EmployeeDetails employee={employee} />  {/* Reuse existing details */}
    </Card>
  );
};
```

### 3. Business Logic in UI Components

**❌ Anti-Pattern**:
```typescript
const GridBox = ({ employees }: Props) => {
  // ❌ Calculation logic in UI component
  const averagePerformance = employees.reduce((sum, emp) => 
    sum + emp.performance, 0) / employees.length;
  
  return <div>Average: {averagePerformance}</div>;
};
```

**✅ Correct Pattern**:
```python
# Backend service calculates
class StatisticsService:
    def calculate_average_performance(self, employees):
        return sum(e.performance for e in employees) / len(employees)
```

```typescript
// Frontend just displays
const GridBox = () => {
  const { statistics } = useStatisticsStore();
  return <div>Average: {statistics.averagePerformance}</div>;
};
```

### 4. Bypassing Abstraction Layers

**❌ Anti-Pattern**:
```typescript
// Direct axios call from component
const MyComponent = () => {
  const handleMove = async () => {
    // ❌ Bypasses apiClient
    await axios.post('http://localhost:8000/api/employees/move', data);
  };
};
```

**✅ Correct Pattern**:
```typescript
// Use the API client abstraction
const MyComponent = () => {
  const { moveEmployee } = useSessionStore();
  
  const handleMove = async () => {
    // ✅ Uses apiClient + sessionStore
    await moveEmployee(id, performance, potential);
  };
};
```

### 5. Creating Parallel Systems

**❌ Anti-Pattern**:
```python
# Creating new session manager instead of extending existing one
class MyFeatureSessionManager:
    def __init__(self):
        self.my_sessions = {}  # ❌ Duplicate state!
```

**✅ Correct Pattern**:
```python
# Extend existing SessionManager
class SessionManager:
    def add_my_feature_data(self, user_id: str, data: Any):
        session = self.get_session(user_id)
        session.my_feature_data = data  # ✅ Extends existing state
        self._persist_session(session)
```

---

## Summary: Key Principles

1. **Use Existing Abstractions**: SessionManager, apiClient, Zustand stores
2. **Service Layer for Logic**: Keep routes thin, services fat
3. **Single Source of Truth**: Backend owns state, frontend reflects it
4. **Compose, Don't Duplicate**: Reuse components and services
5. **Think Globally**: Consider system-wide impact of local changes
6. **Extend, Don't Replace**: Add to existing patterns, don't create parallel ones

---

## For Agents: How to Use This Document

When adding features:

1. **Read relevant sections** to understand existing patterns
2. **Search for similar features** in the codebase
3. **Extend existing abstractions** rather than creating new ones
4. **Ask**: "Does this fit the existing architecture?"
5. **Validate**: Does this avoid the anti-patterns listed?

When reviewing code:

1. **Check for duplication**: Is this reinventing existing functionality?
2. **Check abstraction layers**: Is business logic in the right place?
3. **Check consistency**: Does this follow established patterns?
4. **Check global impact**: Does this break assumptions elsewhere?

---

**Related Documentation**:
- [docs/facts.json](../facts.json) - Factual source of truth
- [DESIGN_SYSTEM.md](../../DESIGN_SYSTEM.md) - UI component guidelines
- [docs/design-system/](../design-system/) - Visual design standards
