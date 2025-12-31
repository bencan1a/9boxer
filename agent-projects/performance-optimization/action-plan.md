# Performance Optimization - Action Plan

**Created**: 2025-12-31
**Status**: Work in Progress
**Target**: Production Deployment

---

## Quick Summary

**Overall Rating**: 7.8/10 - Good work, but needs polish
**Test Status**: 1,124 passing / 49 failing (96% pass rate)
**Deployment**: CONDITIONAL GO - Fix P1 issues first

**What This Means**:
- ✅ Core optimizations are implemented correctly
- ✅ Build succeeds, app functions properly
- ⚠️ Test mocks need updates (not a code problem, a test problem)
- ⚠️ Several edge cases and error handling gaps
- ⚠️ No empirical validation of performance claims

---

## Critical Path to Deployment

### ⚡ PRIORITY 1: Fix Test Failures (4-6 hours)

**What**: 49 tests failing due to Phase 4 selector changes
**Why**: Test mocks weren't updated when stores were refactored
**Impact**: Blocks deployment confidence

**Files to Fix**:
1. `frontend/src/store/__tests__/sessionStore.test.ts`
2. `frontend/src/hooks/__tests__/useEmployees.test.ts`
3. `frontend/src/components/common/__tests__/FileUploadDialog.test.tsx`
4. `frontend/src/components/common/__tests__/ViewControls.test.tsx`
5. `frontend/src/components/grid/__tests__/NineBoxGrid.test.tsx`
6. `frontend/src/components/grid/__tests__/ViewModeToggle.test.tsx`
7. `frontend/e2e/__tests__/RecentFileLoadingWorkflow.test.tsx`

**Fix Template**:
```typescript
// BEFORE (broken):
vi.mock('../../../store/sessionStore', () => ({
  useSessionStore: vi.fn(() => ({
    employees: mockEmployees,
    sessionId: 'test-123'
  }))
}));

// AFTER (working):
vi.mock('../../../store/sessionStore', () => ({
  useSessionStore: vi.fn(),
  selectEmployees: vi.fn((state) => state.employees),
  selectSessionId: vi.fn((state) => state.sessionId),
  selectDonutModeActive: vi.fn((state) => state.donutModeActive),
  // ... add all other selectors
}));

// Then in test setup:
beforeEach(() => {
  useSessionStore.mockImplementation((selector) => {
    const mockState = {
      employees: mockEmployees,
      sessionId: 'test-123',
      donutModeActive: false,
      // ... full mock state
    };
    return selector(mockState);
  });
});
```

**Acceptance Criteria**:
- [ ] All 1,173 tests passing
- [ ] No test warnings in console
- [ ] Test mocks match new selector pattern

---

### ⚡ PRIORITY 2: Fix Phase 2 Critical Issues (3-4 hours)

#### 2.1: Add `onSelect` to React.memo Comparison

**File**: `frontend/src/components/grid/EmployeeTile.tsx` (line ~320)

**Current**:
```typescript
export const EmployeeTile = React.memo(
  EmployeeTileComponent,
  (prevProps, nextProps) => {
    return (
      prevProps.employee.employee_id === nextProps.employee.employee_id &&
      // ... other comparisons
      prevProps.donutModeActive === nextProps.donutModeActive
      // ❌ Missing onSelect
    );
  }
);
```

**Fix**:
```typescript
export const EmployeeTile = React.memo(
  EmployeeTileComponent,
  (prevProps, nextProps) => {
    return (
      prevProps.employee.employee_id === nextProps.employee.employee_id &&
      // ... other comparisons
      prevProps.donutModeActive === nextProps.donutModeActive &&
      prevProps.onSelect === nextProps.onSelect  // ✅ Add this
    );
  }
);
```

**Acceptance Criteria**:
- [ ] onSelect comparison added
- [ ] Tests still pass
- [ ] No re-render issues

---

#### 2.2: Replace JSON.stringify with Efficient Array Comparison

**Files**:
- `frontend/src/components/grid/EmployeeTile.tsx` (line ~315)
- `frontend/src/components/grid/DraggedEmployeeTile.tsx` (line ~227)

**Current**:
```typescript
JSON.stringify(prevProps.employee.flags || []) === JSON.stringify(nextProps.employee.flags || [])
```

**Fix** (add helper at top of file):
```typescript
/**
 * Order-independent array equality check
 * More efficient than JSON.stringify for flag arrays
 */
const areArraysEqual = (a: string[] | undefined, b: string[] | undefined): boolean => {
  const arr1 = a || [];
  const arr2 = b || [];
  if (arr1.length !== arr2.length) return false;
  const sorted1 = [...arr1].sort();
  const sorted2 = [...arr2].sort();
  return sorted1.every((val, idx) => val === sorted2[idx]);
};

// Then in comparison:
areArraysEqual(prevProps.employee.flags, nextProps.employee.flags)
```

**Acceptance Criteria**:
- [ ] JSON.stringify removed from both files
- [ ] Helper function added
- [ ] Array comparison works with different orders
- [ ] Performance improved (measure with React Profiler)

---

#### 2.3: Fix DraggedEmployeeTile Hard-Coded Values

**File**: `frontend/src/components/grid/DraggedEmployeeTile.tsx`

**Current**:
```typescript
const DraggedEmployeeTileComponent: React.FC<DraggedEmployeeTileProps> = ({
  employee,
  donutModeActive = false,
}) => {
  const theme = useTheme();
  // ❌ Missing useGridZoom()

  return (
    <Card
      sx={{
        minWidth: 280,  // ❌ Hard-coded
        maxWidth: 400,  // ❌ Hard-coded
```

**Fix**:
```typescript
const DraggedEmployeeTileComponent: React.FC<DraggedEmployeeTileProps> = ({
  employee,
  donutModeActive = false,
}) => {
  const theme = useTheme();
  const { tokens } = useGridZoom();  // ✅ Add this

  return (
    <Card
      sx={{
        minWidth: tokens.tile.minWidth,  // ✅ Use tokens
        maxWidth: tokens.tile.maxWidth,  // ✅ Use tokens
        // ... use tokens throughout
```

**Files to Update**:
- Replace ALL hard-coded values (280, 400, 16, 12, etc.) with tokens
- Match EmployeeTile.tsx token usage

**Acceptance Criteria**:
- [ ] All hard-coded values replaced with tokens
- [ ] Drag overlay matches tile size at all zoom levels
- [ ] Visual consistency verified

---

### ⚡ PRIORITY 3: Fix Phase 3 Critical Issues (2-3 hours)

#### 3.1: Add Mounted Guard to RAF Callback

**File**: `frontend/src/components/dashboard/DashboardPage.tsx`

**Add at component top**:
```typescript
const isMountedRef = useRef(true);
```

**Update cleanup effect**:
```typescript
useEffect(() => {
  isMountedRef.current = true;
  return () => {
    isMountedRef.current = false;  // ✅ Set to false on unmount
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
    }
    if (resizeTimeoutRef.current) {
      clearTimeout(resizeTimeoutRef.current);
    }
  };
}, []);
```

**Update RAF callback**:
```typescript
rafIdRef.current = requestAnimationFrame(() => {
  if (!isMountedRef.current) return;  // ✅ Guard against unmount

  // Track panel size changes
  if (!isRightPanelCollapsed && sizes.length === 2) {
    const rightSize = sizes[1];
    if (rightSize !== rightPanelSize) {
      setRightPanelSize(rightSize);
    }
  }

  if (!isMountedRef.current) return;  // ✅ Check again before timeout

  resizeTimeoutRef.current = setTimeout(() => {
    if (!isMountedRef.current) return;  // ✅ Guard in timeout too
    setIsResizing(false);
  }, 150);
});
```

**Acceptance Criteria**:
- [ ] No React warnings about setState on unmounted component
- [ ] Resize still works correctly
- [ ] No memory leaks detected

---

#### 3.2: Fix Stale Closure in handlePanelResize

**File**: `frontend/src/components/dashboard/DashboardPage.tsx`

**Current**:
```typescript
const handlePanelResize = useCallback(
  (sizes: number[]) => {
    if (!isResizing) {  // ❌ Reads from closure
      setIsResizing(true);
    }
    // ...
  },
  [isResizing, isRightPanelCollapsed, rightPanelSize, setRightPanelSize]
  // ❌ isResizing in deps causes unnecessary recreations
);
```

**Fix**:
```typescript
const handlePanelResize = useCallback(
  (sizes: number[]) => {
    // Use functional setState to avoid dependency on current value
    setIsResizing(prev => {
      if (!prev) return true;  // Only update if not already resizing
      return prev;  // Keep current value
    });

    // ... rest of logic
  },
  [isRightPanelCollapsed, rightPanelSize, setRightPanelSize]
  // ✅ isResizing removed from deps
);
```

**Acceptance Criteria**:
- [ ] isResizing removed from dependencies
- [ ] Functional setState used
- [ ] No unnecessary function recreations during resize
- [ ] Resize behavior unchanged

---

#### 3.3: Fix GridZoomContext Fallback Logic

**File**: `frontend/src/contexts/GridZoomContext.tsx` (line ~148)

**Current**:
```typescript
const isResizing = externalIsResizing;  // ❌ Always uses external
const setIsResizing = externalSetIsResizing || setInternalIsResizing;
```

**Fix**:
```typescript
// Use external state if parent is managing it, otherwise use internal
const isResizing = externalSetIsResizing ? externalIsResizing : internalIsResizing;
const setIsResizing = externalSetIsResizing || setInternalIsResizing;
```

**Acceptance Criteria**:
- [ ] Internal state used when no external setter provided
- [ ] External state used when setter provided
- [ ] Tests verify both scenarios

---

### ⚡ PRIORITY 4: Fix Phase 1 High-Priority Issues (3-4 hours)

#### 1.1: Add Translation Loading Fallback

**File**: `frontend/src/i18n/config.ts`

**Current**:
```typescript
const loadLanguage = async (language: string) => {
  try {
    const translations = await import(`./locales/${language}/translation.json`);
    return translations.default || translations;
  } catch (error) {
    console.error(`Failed to load language: ${language}`, error);
    throw error;  // ❌ No fallback
  }
};
```

**Fix**:
```typescript
const loadLanguage = async (language: string) => {
  try {
    const translations = await import(`./locales/${language}/translation.json`);
    return translations.default || translations;
  } catch (error) {
    console.error(`Failed to load language: ${language}`, error);

    // Fallback to English if not already trying English
    if (language !== 'en') {
      console.warn(`Falling back to English translations`);
      try {
        const enTranslations = await import(`./locales/en/translation.json`);
        return enTranslations.default || enTranslations;
      } catch (fallbackError) {
        console.error('Failed to load English fallback', fallbackError);
      }
    }

    // If English also failed or we were already loading English,
    // return empty object (i18next will use translation keys as display text)
    return {};
  }
};
```

**Acceptance Criteria**:
- [ ] Falls back to English on translation load failure
- [ ] Returns empty object if English also fails
- [ ] App doesn't crash on translation errors
- [ ] User sees keys instead of crashing

---

#### 1.2: Add Error Boundary for i18n Suspense

**File**: `frontend/src/main.tsx`

**Current**:
```typescript
<Suspense fallback={<I18nLoader />}>
  <App />
</Suspense>
```

**Fix**:
```typescript
const I18nErrorFallback = () => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    gap: '16px',
    fontFamily: 'system-ui, sans-serif'
  }}>
    <h2>Translation Loading Error</h2>
    <p>There was a problem loading translations.</p>
    <button
      onClick={() => window.location.reload()}
      style={{
        padding: '12px 24px',
        fontSize: '16px',
        cursor: 'pointer'
      }}
    >
      Refresh Page
    </button>
  </div>
);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary fallback={<I18nErrorFallback />}>
      <Suspense fallback={<I18nLoader />}>
        <App />
      </Suspense>
    </ErrorBoundary>
  </React.StrictMode>
);
```

**Acceptance Criteria**:
- [ ] Error boundary wraps Suspense
- [ ] Friendly error message shown on translation failure
- [ ] Refresh button works
- [ ] No blank screen on error

---

### ⚡ PRIORITY 5: Validation & Measurement (2-3 hours)

#### 5.1: Capture Performance Baselines

**Tools**:
- Chrome DevTools Performance
- React DevTools Profiler
- Lighthouse

**Metrics to Capture**:

**Bundle Size** (already captured):
- ✅ Initial load: 381 KB gzipped
- ✅ Chunk breakdown documented

**Web Vitals** (need to capture):
```bash
# In Chrome DevTools Console after app loads:
performance.getEntriesByType('navigation')
performance.getEntriesByType('paint')
```

**Capture**:
- [ ] LCP (Largest Contentful Paint): Target < 2.5s
- [ ] FCP (First Contentful Paint): Target < 1.8s
- [ ] TTI (Time to Interactive): Target < 2s
- [ ] TTFB (Time to First Byte): Target < 600ms

**Drag Performance**:
```bash
# Steps:
1. Open React DevTools → Profiler
2. Click Record
3. Drag an employee tile across grid
4. Stop recording
5. Analyze:
   - How many components rendered?
   - What was the render duration?
   - Are tiles re-rendering unnecessarily?
```

**Capture**:
- [ ] FPS during drag: Target 55-60 fps
- [ ] Render count per drag movement
- [ ] Only dragged tile re-renders (verify)

**Resize Performance**:
```bash
# Steps:
1. Open Chrome DevTools → Performance
2. Enable FPS meter (Cmd+Shift+P → "Show FPS")
3. Record
4. Resize right panel slowly, then quickly
5. Stop recording
6. Analyze FPS and frame timing
```

**Capture**:
- [ ] FPS during resize: Target 60 fps
- [ ] Frame timing < 16ms
- [ ] No layout thrashing (purple bars)

**Memory Usage**:
```bash
# Steps:
1. Chrome DevTools → Memory
2. Take heap snapshot (before drag)
3. Drag 20 employees
4. Take heap snapshot (after drag)
5. Compare sizes
```

**Capture**:
- [ ] Memory delta during drag operations
- [ ] No detached DOM elements
- [ ] No memory leaks

---

## Optional Improvements (P2)

### Complete MUI Import Optimization (2-3 hours)

**Find barrel imports**:
```bash
cd frontend
grep -r "from '@mui/material'" src/ | grep -v "from '@mui/material/" | wc -l
```

**Replace with direct imports**:
```bash
# Script already created: frontend/scripts/optimize-mui-imports.js
# Run it on remaining files
```

**Expected Gain**: 5-10% bundle reduction (19-38 KB)

---

### Extract Magic Numbers (1 hour)

**File**: `frontend/src/components/dashboard/DashboardPage.tsx`

**Current**:
```typescript
}, 150); // Magic number appears twice
```

**Fix**:
```typescript
/**
 * Debounce duration for resize end detection.
 * 150ms balances responsiveness and stability.
 */
const RESIZE_END_DEBOUNCE_MS = 150;

// Use throughout file
```

---

## Timeline

### Week 1: Critical Fixes
**Days 1-2**: Fix test mocks (4-6 hours)
- Update all 7 test files
- Verify 100% pass rate

**Days 3-4**: Fix Phase 2 & 3 P0 issues (5-7 hours)
- React.memo comparison
- JSON.stringify replacement
- RAF race condition
- Stale closure fix

**Day 5**: Fix Phase 1 issues (3-4 hours)
- Translation fallback
- Error boundary

**Total Week 1**: 12-17 hours

### Week 2: Validation & Polish
**Days 1-2**: Performance measurement (2-3 hours)
- Capture all baselines
- Document in performance-analysis.md

**Days 3-4**: Optional improvements (4-5 hours)
- Complete MUI optimization
- Extract magic numbers
- Documentation updates

**Day 5**: Final testing & review
- Run full test suite
- Manual smoke testing
- Code review

**Total Week 2**: 6-8 hours

### Week 3: Deployment
**Days 1-3**: Internal beta
- Deploy to test environment
- Gather feedback
- Monitor metrics

**Days 4-5**: Production rollout
- Canary to 25% users
- Monitor closely
- Full rollout if metrics good

---

## Success Criteria

### Before Deployment
- [ ] All 1,173 tests passing (currently 1,124)
- [ ] All P0 issues fixed (0 exist, but we created P1s)
- [ ] All P1 issues fixed (11 identified)
- [ ] Performance baselines captured
- [ ] Build succeeds with no warnings
- [ ] Manual smoke test passes

### Post-Deployment
- [ ] Web Vitals meet targets
- [ ] No error rate increase
- [ ] User feedback positive
- [ ] Actual performance matches expectations
- [ ] Monitoring dashboard active

---

## Risk Assessment

**Current Risk Level**: MEDIUM

**Risks**:
1. ⚠️ Test failures hide real issues → Fix tests first
2. ⚠️ Performance claims unvalidated → Measure before deployment
3. ⚠️ Error handling gaps → Fix P1 issues
4. ✅ Build succeeds → Low risk of breakage
5. ✅ Optimizations are additive → Easy rollback

**Mitigation**:
- Fix all P1 issues before deployment
- Capture baselines for validation
- Phased rollout (internal → canary → full)
- Monitor closely during rollout
- Have rollback plan ready

---

## Next Steps

**Immediate (Today)**:
1. Review this action plan with team
2. Assign P1 issues to developers
3. Set up tracking in GitHub projects
4. Schedule code review sessions

**This Week**:
1. Start fixing test mocks
2. Fix Phase 2 & 3 critical issues
3. Daily standup on progress

**Next Week**:
1. Capture performance baselines
2. Optional improvements
3. Prepare for deployment

---

**Status**: Ready to execute
**Owner**: Development team
**Target Completion**: 2 weeks
**Review Date**: 2025-01-14
