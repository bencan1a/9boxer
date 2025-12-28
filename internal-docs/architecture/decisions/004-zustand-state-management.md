# ADR-004: Zustand State Management

**Status:** ✅ Accepted
**Date:** 2024-Q4 (Initial implementation)
**Tags:** #frontend #state-management #react #zustand

## Quick Summary

| Decision | Context | Impact |
|----------|---------|--------|
| Use Zustand for frontend state management instead of Redux or Context API | Need global state for session, employees, UI, and filters | Minimal boilerplate, 3KB bundle, simple API, no provider hell |

## When to Reference This ADR

- Before adding new state management library or refactoring state
- When deciding where to store global state (Zustand vs local component state)
- When debugging state updates or re-renders
- When evaluating Redux, MobX, or other state managers
- When adding new global state slices (stores)

## Alternatives Comparison

| Option | Bundle Size | Boilerplate | DevTools | Learning Curve | Performance | Decision |
|--------|-------------|-------------|----------|----------------|-------------|----------|
| **Zustand** | 3KB | ⭐⭐⭐⭐⭐ (Minimal) | ✅ Redux DevTools | ⭐⭐⭐⭐⭐ (Simple) | ⭐⭐⭐⭐⭐ | ✅ Chosen |
| Redux Toolkit | 20KB | ⭐⭐⭐ (Actions, reducers, slices) | ✅ Redux DevTools | ⭐⭐⭐ (Medium) | ⭐⭐⭐⭐ | ❌ Rejected |
| Context API | 0KB (built-in) | ⭐⭐ (Provider hell) | ❌ No DevTools | ⭐⭐⭐⭐ (Simple) | ⭐⭐ (Re-render issues) | ❌ Rejected |
| MobX | 16KB | ⭐⭐⭐⭐ (Decorators optional) | ✅ MobX DevTools | ⭐⭐ (Observables paradigm) | ⭐⭐⭐⭐⭐ | ❌ Rejected |
| Jotai (atoms) | 3KB | ⭐⭐⭐⭐ (Minimal) | ✅ Redux DevTools | ⭐⭐⭐ (Atom concept) | ⭐⭐⭐⭐⭐ | ⚠️ Close second |
| Recoil | 20KB | ⭐⭐⭐ (Atoms, selectors) | ✅ Recoil DevTools | ⭐⭐⭐ (Atom concept) | ⭐⭐⭐⭐ | ❌ Rejected |

## Decision Criteria Matrix

| Criterion | Weight | Winner | Rationale |
|-----------|--------|--------|-----------|
| **Simplicity** | High | Zustand | No providers, no boilerplate, no actions/reducers |
| **Bundle Size** | Medium | Zustand/Jotai | 3KB vs 20KB Redux, every byte counts |
| **Learning Curve** | High | Zustand | Just `create()` and `useStore()`, no new paradigms |
| **DevTools** | Medium | Tie | All options have DevTools (Zustand uses Redux DevTools) |
| **Performance** | Low | Tie | All modern solutions perform well for our scale |
| **Ecosystem** | Low | Redux | But we don't need ecosystem (no middleware, no persistence libs) |

**Final Score:** Zustand wins 3/3 high-weighted criteria

## Implementation Details

### Key Constraints

- **No global providers**: Stores are imported directly, no `<Provider>` wrapper needed
- **Immutable updates**: Must use `set()` with new objects, not mutate state
- **Selective subscriptions**: Components can subscribe to specific state slices
- **Async actions**: Store methods can be async, call backend API
- **No middleware needed**: Simple enough to not require Redux middleware

### Store Architecture

We have 3 main stores:

```
┌─────────────────────────────────────────────────────────┐
│ Frontend State (Zustand Stores)                        │
│                                                         │
│  ┌──────────────────┐  ┌─────────────┐  ┌───────────┐ │
│  │ sessionStore     │  │ filterStore │  │ uiStore   │ │
│  │                  │  │             │  │           │ │
│  │ - sessionId      │  │ - nameFilter│  │ - theme   │ │
│  │ - employees      │  │ - boxFilter │  │ - language│ │
│  │ - events         │  │ - flagFilter│  │ - panel   │ │
│  │ - filename       │  │             │  │           │ │
│  │                  │  │             │  │           │ │
│  │ Actions:         │  │ Actions:    │  │ Actions:  │ │
│  │ - uploadFile()   │  │ - setFilter│  │ - setTheme│ │
│  │ - moveEmployee() │  │ - clearAll │  │ - setLang │ │
│  │ - clearSession() │  │             │  │           │ │
│  └──────────────────┘  └─────────────┘  └───────────┘ │
└─────────────────────────────────────────────────────────┘
```

### Store Pattern

**Session Store:** `frontend/src/store/sessionStore.ts`
```typescript
import { create } from 'zustand';
import { apiClient } from '../services/api';

interface SessionState {
  // State
  sessionId: string | null;
  employees: Employee[];
  events: TrackableEvent[];
  isLoading: boolean;
  error: string | null;

  // Actions (can be async)
  uploadFile: (file: File) => Promise<void>;
  moveEmployee: (id: number, perf: string, pot: string) => Promise<void>;
  clearSession: () => Promise<void>;
  clearError: () => void;
}

export const useSessionStore = create<SessionState>((set, get) => ({
  // Initial state
  sessionId: null,
  employees: [],
  events: [],
  isLoading: false,
  error: null,

  // Actions
  uploadFile: async (file: File) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.upload(file);
      const employeesResponse = await apiClient.getEmployees();

      set({
        sessionId: response.session_id,
        employees: employeesResponse.employees,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false, error: extractErrorMessage(error) });
      throw error;
    }
  },

  moveEmployee: async (id: number, perf: string, pot: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.moveEmployee(id, perf, pot);

      // Update employees immutably
      const updatedEmployees = get().employees.map(emp =>
        emp.employee_id === id ? response.employee : emp
      );

      set({ employees: updatedEmployees, isLoading: false });
    } catch (error) {
      set({ isLoading: false, error: extractErrorMessage(error) });
    }
  },

  clearSession: async () => {
    await apiClient.clearSession();
    set({ sessionId: null, employees: [], events: [] });
  },

  clearError: () => set({ error: null }),
}));
```

### Component Usage

**Selective Subscription (Efficient):**
```typescript
// ✅ CORRECT: Only subscribe to employees
// Component re-renders ONLY when employees change
function EmployeeList() {
  const employees = useSessionStore(state => state.employees);

  return (
    <div>
      {employees.map(emp => (
        <EmployeeTile key={emp.employee_id} employee={emp} />
      ))}
    </div>
  );
}
```

**Multiple Subscriptions:**
```typescript
// ✅ CORRECT: Subscribe to multiple slices
function UploadButton() {
  const { uploadFile, isLoading, error } = useSessionStore(state => ({
    uploadFile: state.uploadFile,
    isLoading: state.isLoading,
    error: state.error,
  }));

  return (
    <Button onClick={handleUpload} disabled={isLoading}>
      {isLoading ? 'Uploading...' : 'Upload File'}
    </Button>
  );
}
```

**Anti-Pattern (Inefficient):**
```typescript
// ❌ WRONG: Subscribe to entire store
// Component re-renders on ANY state change
function EmployeeList() {
  const store = useSessionStore(); // Bad: subscribes to everything

  return (
    <div>
      {store.employees.map(emp => (
        <EmployeeTile key={emp.employee_id} employee={emp} />
      ))}
    </div>
  );
}
```

### Related Files

- `frontend/src/store/sessionStore.ts` - Session, employees, events
- `frontend/src/store/filterStore.ts` - Filters (name, box, flags)
- `frontend/src/store/uiStore.ts` - UI state (theme, language, panel)
- `frontend/src/services/api.ts` - API client called by store actions

## Accepted Trade-offs

| What We Gave Up | What We Gained | Mitigation |
|-----------------|----------------|------------|
| **Redux ecosystem** | Simplicity, smaller bundle | Don't need middleware (no complex async, no persistence) |
| **Time-travel debugging** | No boilerplate, easier to reason about | Redux DevTools still works for state inspection |
| **Strict unidirectional flow** | Flexibility, direct mutations in actions | Follow immutable update patterns, code review |
| **Global provider tree** | No provider hell, import anywhere | N/A (no downside) |

## Why Not Redux?

**Redux Toolkit (rejected):**
```typescript
// ❌ WRONG: Too much boilerplate for simple state
const sessionSlice = createSlice({
  name: 'session',
  initialState: { sessionId: null, employees: [], isLoading: false },
  reducers: {
    setSessionId: (state, action) => { state.sessionId = action.payload; },
    setEmployees: (state, action) => { state.employees = action.payload; },
    setLoading: (state, action) => { state.isLoading = action.payload; },
  },
});

export const { setSessionId, setEmployees, setLoading } = sessionSlice.actions;

// Need thunk for async
export const uploadFile = (file: File) => async (dispatch: Dispatch) => {
  dispatch(setLoading(true));
  const response = await apiClient.upload(file);
  dispatch(setSessionId(response.session_id));
  dispatch(setLoading(false));
};

// Need provider
<Provider store={store}>
  <App />
</Provider>
```

**Zustand (chosen):**
```typescript
// ✅ CORRECT: Simple, no boilerplate
export const useSessionStore = create<SessionState>((set) => ({
  sessionId: null,
  employees: [],
  isLoading: false,

  uploadFile: async (file: File) => {
    set({ isLoading: true });
    const response = await apiClient.upload(file);
    set({ sessionId: response.session_id, isLoading: false });
  },
}));

// No provider needed
function App() {
  const uploadFile = useSessionStore(state => state.uploadFile);
  // ...
}
```

## Why Not Context API?

**Context API (rejected):**
```typescript
// ❌ WRONG: Provider hell, re-render issues
const SessionContext = createContext(null);

function SessionProvider({ children }) {
  const [sessionId, setSessionId] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Every state change re-renders ALL consumers
  return (
    <SessionContext.Provider value={{ sessionId, employees, isLoading, ... }}>
      {children}
    </SessionContext.Provider>
  );
}

// Need multiple providers
<SessionProvider>
  <FilterProvider>
    <UIProvider>
      <App />
    </UIProvider>
  </FilterProvider>
</SessionProvider>
```

**Performance Issue:** Context re-renders all consumers on any state change (can't select slices)

## When to Use Local State vs Zustand

| Use Case | Solution | Rationale |
|----------|----------|-----------|
| **Form input values** | Local `useState` | Ephemeral, component-specific |
| **Modal open/closed** | Local `useState` | Ephemeral, component-specific |
| **Current session data** | Zustand `sessionStore` | Global, shared across components |
| **Active filters** | Zustand `filterStore` | Global, affects multiple components |
| **UI preferences** | Zustand `uiStore` | Persistent, shared across app |
| **Hover state** | Local `useState` | Ephemeral, component-specific |

**Rule of Thumb:** Use Zustand if >2 components need the state OR state needs to persist

## Related Decisions

- See [ADR-003](003-http-ipc-communication.md) for backend API communication
- See [ADR-001](001-electron-desktop-architecture.md) for Electron architecture
- See [DESIGN_SYSTEM.md](../../DESIGN_SYSTEM.md) for UI component patterns

## References

- [Zustand Documentation](https://zustand-demo.pmnd.rs/)
- [Zustand GitHub](https://github.com/pmndrs/zustand)
- [Redux Toolkit vs Zustand Comparison](https://blog.logrocket.com/zustand-vs-redux/)
- [React State Management in 2024](https://www.robinwieruch.de/react-state-management/)
