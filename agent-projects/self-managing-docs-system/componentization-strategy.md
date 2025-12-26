# Componentization Strategy for Screenshot Generation

## Question 1: What Should We Componentize?

Analysis of full-app screenshots that could become Storybook screenshots with better componentization.

---

## High-Impact Componentization Targets 🎯

### 1. **NineBoxGrid Component** (Highest ROI)

**Current State:**
- Grid is likely coupled to app state, routing, and data fetching
- Cannot render in isolation in Storybook

**Proposed:**
- Extract `NineBoxGrid` as a pure presentational component
- Props: `employees`, `onEmployeeClick`, `onEmployeeDrag`, `viewMode`, etc.
- No direct coupling to global state or API calls

**Screenshots Enabled (7-8 total):**
- ✅ `grid-normal` - Grid with sample employees
- ✅ `quickstart-grid-populated` - Populated grid after upload
- ✅ `hero-grid-sample` - Hero image with full grid
- ✅ `donut-mode-active-layout` - Donut mode layout
- ✅ `calibration-donut-mode-grid` - Donut mode with ghosting
- Potentially: `filters-active-chips` (grid portion)
- Potentially: `details-flag-badges` (grid with flag badges)

**Implementation Approach:**

```typescript
// frontend/src/components/grid/NineBoxGrid.tsx
export interface NineBoxGridProps {
  employees: Employee[];
  viewMode: 'grid' | 'donut';
  highlightedEmployees?: string[]; // For ghosting/filtering effects
  onEmployeeClick?: (employee: Employee) => void;
  onEmployeeDrag?: (employee: Employee, newBox: BoxPosition) => void;
  showModifiedIndicators?: boolean;
  compact?: boolean;
}

export const NineBoxGrid: React.FC<NineBoxGridProps> = ({ ... }) => {
  // Pure rendering logic, no global state access
  // Uses props for all data and callbacks
};
```

**Storybook Stories:**

```typescript
// NineBoxGrid.stories.tsx
export const Normal: Story = {
  args: {
    employees: mockEmployees(20), // Helper generates 20 employees
    viewMode: 'grid',
  },
};

export const Populated: Story = {
  args: {
    employees: mockEmployees(50),
    viewMode: 'grid',
  },
};

export const DonutMode: Story = {
  args: {
    employees: mockEmployees(30),
    viewMode: 'donut',
  },
};

export const WithGhosting: Story = {
  args: {
    employees: mockEmployees(25),
    viewMode: 'donut',
    highlightedEmployees: ['emp-1', 'emp-2'], // Others are ghosted
  },
};

export const WithFlagBadges: Story = {
  args: {
    employees: mockEmployeesWithFlags(30),
    viewMode: 'grid',
  },
};
```

**Effort:** 2-3 days (refactoring existing grid, creating stories, testing)
**Impact:** 7-8 screenshots (15% of total) become Storybook-based

---

### 2. **IntelligencePanel Component** (Medium-High ROI)

**Current State:**
- Intelligence tab likely coupled to API calls for AI analysis
- Cannot render in isolation

**Proposed:**
- Extract `IntelligencePanel` as presentational component
- Props: `anomalies`, `insights`, `distribution`, `onExport`

**Screenshots Enabled (1-2 total):**
- ✅ `calibration-intelligence-anomalies` - Intelligence tab with AI insights

**Implementation:**

```typescript
// frontend/src/components/panel/IntelligencePanel.tsx
export interface IntelligencePanelProps {
  anomalies: Anomaly[];
  insights: Insight[];
  distribution: DistributionData;
  onAnomalyClick?: (anomaly: Anomaly) => void;
  onExport?: () => void;
}

export const IntelligencePanel: React.FC<IntelligencePanelProps> = ({ ... }) => {
  // Renders AI insights, anomalies, recommendations
};
```

**Storybook Stories:**

```typescript
// IntelligencePanel.stories.tsx
export const WithAnomalies: Story = {
  args: {
    anomalies: [
      { type: 'location', severity: 'high', description: 'NYC office has 80% in top-right' },
      { type: 'function', severity: 'medium', description: 'Engineering skewed high potential' },
    ],
    insights: mockInsights(),
    distribution: mockDistribution(),
  },
};

export const NoAnomalies: Story = {
  args: {
    anomalies: [],
    insights: mockInsights(),
    distribution: mockDistribution(),
  },
};
```

**Effort:** 1-2 days
**Impact:** 1-2 screenshots become Storybook-based

---

### 3. **AppBar Component States** (Medium ROI)

**Current State:**
- AppBar likely has tight coupling to app state (current file, change count, routing)

**Proposed:**
- Make AppBar accept explicit props for state
- Create stories for different states

**Screenshots Enabled (3-4 total):**
- ✅ `view-controls-simplified-appbar` - AppBar alone
- ✅ `quickstart-file-menu-button` - AppBar in empty state
- ✅ `calibration-file-import` - File menu open (maybe)

**Implementation:**

```typescript
// frontend/src/components/layout/AppBar.tsx
export interface AppBarProps {
  fileName?: string; // undefined = "No file selected"
  changeCount?: number; // For "Apply X Changes" button
  onFileMenuClick?: () => void;
  onSettingsClick?: () => void;
  onHelpClick?: () => void;
}

export const AppBar: React.FC<AppBarProps> = ({ ... }) => {
  // Pure rendering based on props
};
```

**Storybook Stories:**

```typescript
// AppBar.stories.tsx
export const EmptyState: Story = {
  args: {
    fileName: undefined, // Shows "No file selected"
    changeCount: 0,
  },
};

export const WithFile: Story = {
  args: {
    fileName: 'Sample_People_List.xlsx',
    changeCount: 0,
  },
};

export const WithChanges: Story = {
  args: {
    fileName: 'Sample_People_List.xlsx',
    changeCount: 3,
  },
};

export const FileMenuOpen: Story = {
  args: {
    fileName: 'Sample_People_List.xlsx',
    changeCount: 0,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const fileButton = canvas.getByText(/file/i);
    await userEvent.click(fileButton);
  },
};
```

**Effort:** 1 day
**Impact:** 3-4 screenshots become Storybook-based

---

### 4. **StatisticsTab Component** (Low-Medium ROI)

**Current State:**
- May already be componentized (has DistributionChart story)
- But full tab view requires composition

**Proposed:**
- Create `StatisticsTab` container that composes DistributionChart + other widgets
- Make it accept `distribution`, `trends`, `comparisons` as props

**Screenshots Enabled (3 total):**
- Already covered by Phase 2 plan (DistributionChart variants)
- This would enable full tab view screenshots

**Effort:** 0.5-1 day (if chart already works)
**Impact:** 3 screenshots (already in Phase 2 plan)

---

### 5. **Complete Layout Components** (Lower Priority)

**Proposed:**
- `DashboardLayout` - Full layout: AppBar + Grid + RightPanel
- `CalibrationView` - Complete calibration workflow view
- `FilteredGridView` - Grid with filters applied

**Screenshots Enabled:**
- `view-controls-main-interface` - Full dashboard
- Various calibration screenshots
- Filter + grid combinations

**Challenges:**
- Very large components with many dependencies
- May lose the benefit of isolation
- Essentially recreating the full app in Storybook

**Recommendation:** Don't pursue unless other options fail
**Reason:** Defeats the purpose of component isolation; full-app may be better

---

## Componentization Priority Matrix

| Component | Screenshots Enabled | Effort (days) | ROI | Priority |
|-----------|-------------------|---------------|-----|----------|
| **NineBoxGrid** | 7-8 | 2-3 | 🔥 Very High | **#1** |
| **AppBar States** | 3-4 | 1 | 🔥 High | **#2** |
| **IntelligencePanel** | 1-2 | 1-2 | 🟡 Medium | **#3** |
| **StatisticsTab** | 3 | 0.5-1 | 🟡 Medium | **#4** |
| Layout Components | Many | 5+ | ❄️ Low | **#5** |

---

## Recommended Componentization Roadmap

### Phase 1: Grid Component (Highest ROI) 🎯

**Week 1-2:** Extract NineBoxGrid as presentational component

**Steps:**
1. Create new `NineBoxGrid.tsx` with props interface
2. Refactor existing grid to use new component
3. Update state management to pass props instead of global state access
4. Create Storybook stories for all grid states
5. Update screenshot config to use Storybook
6. Test and validate

**Deliverables:**
- ✅ NineBoxGrid component with 6+ stories
- ✅ 7-8 screenshots migrated to Storybook
- ✅ Grid is now reusable and testable in isolation

---

### Phase 2: AppBar States (Quick Win) ⚡

**Week 3:** Extract AppBar states

**Steps:**
1. Refactor AppBar to accept state as props
2. Create stories for empty, with-file, with-changes states
3. Update screenshot config
4. Test and validate

**Deliverables:**
- ✅ AppBar component with 4+ stories
- ✅ 3-4 screenshots migrated to Storybook
- ✅ AppBar testable in isolation

---

### Phase 3: Intelligence Panel (Medium Priority) 📊

**Week 4:** Extract IntelligencePanel

**Steps:**
1. Create IntelligencePanel component
2. Mock AI insights and anomalies data
3. Create stories for different analysis states
4. Update screenshot config
5. Test and validate

**Deliverables:**
- ✅ IntelligencePanel component with 3+ stories
- ✅ 1-2 screenshots migrated to Storybook
- ✅ Intelligence panel testable in isolation

---

## Total Impact After Full Componentization

**Before:**
- Storybook: 10 screenshots (19%)
- Full-app: 34 screenshots (65%)
- Manual: 8 screenshots (15%)

**After Phase 1 (Grid):**
- Storybook: 17-18 screenshots (33%)
- Full-app: 26-27 screenshots (50%)
- Manual: 8 screenshots (15%)

**After Phase 2 (AppBar):**
- Storybook: 20-22 screenshots (38-42%)
- Full-app: 22-24 screenshots (42-46%)
- Manual: 8 screenshots (15%)

**After Phase 3 (Intelligence):**
- Storybook: 21-24 screenshots (40-46%)
- Full-app: 20-23 screenshots (38-44%)
- Manual: 8 screenshots (15%)

**Final State:**
- ~40-46% of screenshots using fast, reliable Storybook
- ~38-44% using full-app (legitimately need it)
- ~15% manual (Excel, compositions, annotations)

---

## Componentization Best Practices

### Design Principles

1. **Props Over Global State**
   - Pass all data as props, not via global stores
   - Component should be "dumb" - just renders what it's told

2. **Callbacks Over Side Effects**
   - Pass event handlers as props
   - Component doesn't dispatch actions or call APIs directly

3. **Composition Over Configuration**
   - Small, focused components that compose together
   - Container/Presentational pattern

4. **Data Mocking Helpers**
   - Create `mockEmployees()`, `mockDistribution()` helpers
   - Reuse mocks across stories and tests

### Example Pattern

```typescript
// ❌ Bad: Tightly coupled to app state
const MyComponent = () => {
  const employees = useSessionStore(state => state.employees);
  const dispatch = useDispatch();

  return <div onClick={() => dispatch(loadEmployees())}>...</div>;
};

// ✅ Good: Pure component with props
interface MyComponentProps {
  employees: Employee[];
  onLoadEmployees: () => void;
}

const MyComponent: React.FC<MyComponentProps> = ({ employees, onLoadEmployees }) => {
  return <div onClick={onLoadEmployees}>...</div>;
};

// Container wraps and provides state
const MyComponentContainer = () => {
  const employees = useSessionStore(state => state.employees);
  const dispatch = useDispatch();

  return <MyComponent
    employees={employees}
    onLoadEmployees={() => dispatch(loadEmployees())}
  />;
};
```

---

## Migration Strategy

### Incremental Approach (Recommended)

1. **Create New Component** - Don't break existing code
2. **Add Stories** - Validate component works in isolation
3. **Swap in App** - Replace old implementation with new component
4. **Update Screenshots** - Switch config to Storybook
5. **Remove Old Code** - Clean up after validation

### Testing Checklist

For each componentized component:
- [ ] Component renders in Storybook without errors
- [ ] All props work as expected
- [ ] Component matches existing visual design
- [ ] Component works in actual app
- [ ] Screenshot generation succeeds
- [ ] Screenshot quality matches original
- [ ] Visual regression tests pass

---

## Risks and Mitigations

### Risk: Breaking Existing Functionality

**Mitigation:**
- Incremental migration (new component alongside old)
- Comprehensive testing before swapping
- Feature flags to toggle between old/new implementations

### Risk: Over-Componentization

**Mitigation:**
- Only componentize where it enables Storybook screenshots
- Don't create components just for the sake of it
- Ensure components have genuine reuse value

### Risk: Mock Data Doesn't Match Reality

**Mitigation:**
- Generate mocks from real data samples
- Validate mocks against actual API responses
- Update mocks when data structures change

### Risk: State Management Complexity

**Mitigation:**
- Use container/presentational pattern
- Keep state logic in containers, rendering in components
- Document state flow clearly

---

## Componentization Guidelines Document

**Recommendation:** Create `docs/contributing/componentization-guide.md`

**Contents:**
- When to componentize (Storybook-first approach)
- How to extract components (step-by-step)
- Props design patterns
- Mock data helpers
- Testing requirements
- Screenshot integration

This ensures future components follow the same patterns.

---

## Next Steps

1. **Review and Approve** this componentization strategy
2. **Start with NineBoxGrid** (highest ROI, most impact)
3. **Create GitHub Issue** for tracking Grid componentization work
4. **Assign to Developer** with 2-3 day timeline
5. **Validate Approach** before proceeding to AppBar and Intelligence

**Expected Timeline:**
- Phase 1 (Grid): 2-3 days
- Phase 2 (AppBar): 1 day
- Phase 3 (Intelligence): 1-2 days
- **Total: 4-6 days of development work**

**Expected Benefit:**
- 40-46% of screenshots using Storybook (vs 19% today)
- Much faster, more reliable screenshot generation
- Better component architecture (testable, reusable)
- Single source of truth for component states
