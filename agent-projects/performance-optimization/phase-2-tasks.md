# Phase 2: Drag & Drop Performance Optimization

**Priority**: HIGH
**Estimated Impact**: 30fps → 60fps during drag operations
**Agent**: general-purpose

---

## Task Overview

Phase 2 addresses excessive re-renders during drag-and-drop operations. The current implementation causes every employee tile to re-render on each drag movement, resulting in sluggish 30fps performance. This phase will add proper memoization and optimize render paths.

---

## Agent Tasks

### Task 2.1: Add React.memo to EmployeeTile Component

**File**: [EmployeeTile.tsx](c:/Git_Repos/9boxer/frontend/src/components/grid/EmployeeTile.tsx) (lines 64-296)

**Current Problem**:
- EmployeeTile component not memoized
- Re-renders on every parent state change
- During drag, all 50+ tiles re-render continuously
- Each re-render recalculates styles, colors, and layouts

**Implementation Steps**:
1. Read the current EmployeeTile component implementation
2. Identify props that should trigger re-renders
3. Wrap component export with React.memo:
   ```typescript
   export const EmployeeTile = React.memo(({ employee, isDragging, ... }) => {
     // ... component implementation
   }, (prevProps, nextProps) => {
     // Custom comparison function
     return (
       prevProps.employee.id === nextProps.employee.id &&
       prevProps.employee.name === nextProps.employee.name &&
       prevProps.employee.performance === nextProps.employee.performance &&
       prevProps.employee.potential === nextProps.employee.potential &&
       prevProps.isDragging === nextProps.isDragging
       // Add other relevant props
     )
   })
   ```
4. Ensure prop types are stable (no inline objects/functions)
5. Test that tiles only re-render when their specific data changes

**Expected Outcome**:
- Tiles only re-render when their specific employee data changes
- During drag, only the dragged tile re-renders
- 50-70% reduction in render cycles during drag operations
- Noticeably smoother drag experience

**Verification**:
- [ ] Use React DevTools Profiler to measure render counts
- [ ] Verify tiles don't re-render during other tiles' drag
- [ ] Test that data updates still trigger re-renders correctly
- [ ] No visual glitches or stale data

---

### Task 2.2: Optimize useMemo Dependencies in NineBoxGrid

**File**: [NineBoxGrid.tsx](c:/Git_Repos/9boxer/frontend/src/components/grid/NineBoxGrid.tsx) (lines 49-470)

**Current Problem**:
- `employeesByPosition` recalculated on every render
- useMemo has incorrect or missing dependencies
- Entire grid re-computes position mapping during drag
- Causes cascade of child component re-renders

**Implementation Steps**:
1. Read the NineBoxGrid component and locate `employeesByPosition` calculation
2. Audit the useMemo dependencies:
   ```typescript
   const employeesByPosition = useMemo(() => {
     // Position calculation logic
   }, [/* verify these dependencies are minimal and correct */])
   ```
3. Identify what actually needs to trigger recalculation:
   - Employee data changes (additions/removals/updates)
   - Position changes (performance/potential updates)
   - NOT: drag state, hover state, selection state
4. Ensure the dependency array is correct and minimal
5. Consider splitting into multiple useMemo hooks if needed:
   ```typescript
   const positionMap = useMemo(() => {
     // Build position lookup
   }, [employees]) // Only when employee list changes

   const employeesByPosition = useMemo(() => {
     // Group by position using positionMap
   }, [positionMap]) // Only when positions change
   ```

**Expected Outcome**:
- `employeesByPosition` only recalculates when employee data actually changes
- No recalculation during drag operations
- 40-50% reduction in grid render time
- Faster drag start and drag end operations

**Verification**:
- [ ] Add console.log to verify recalculation frequency
- [ ] Test dragging doesn't trigger recalculation
- [ ] Test employee updates DO trigger recalculation
- [ ] Profile with React DevTools

---

### Task 2.3: Memoize Style Objects in GridBox

**File**: [GridBox.tsx](c:/Git_Repos/9boxer/frontend/src/components/grid/GridBox.tsx) (lines 80-130)

**Current Problem**:
- `getBoxStyling()` creates new style objects on every render
- Inline style objects cause child components to re-render
- New object references break React.memo and shallow equality checks

**Current Pattern**:
```typescript
const boxStyle = getBoxStyling() // New object every render
return <Box sx={boxStyle}>...</Box>
```

**Implementation Steps**:
1. Locate all style object creation in GridBox
2. Identify which styles are static vs dynamic
3. Memoize dynamic styles based on actual dependencies:
   ```typescript
   const boxStyling = useMemo(() => ({
     backgroundColor: getBackgroundColor(performance, potential),
     borderColor: isSelected ? 'primary.main' : 'divider',
     opacity: isDragOver ? 0.8 : 1,
     // ... other dynamic styles
   }), [performance, potential, isSelected, isDragOver])
   ```
4. Move static styles outside component or use theme
5. Consider using CSS-in-JS with stable references
6. Ensure style objects have stable references for same values

**Expected Outcome**:
- Style objects only recreated when relevant state changes
- Fewer child re-renders due to stable prop references
- 10-15% render performance improvement
- Cleaner, more maintainable code

**Verification**:
- [ ] Use React DevTools to verify prop stability
- [ ] Test that styles update correctly for state changes
- [ ] Verify no visual regressions
- [ ] Measure render time improvement

---

### Task 2.4: Extract and Memoize DragOverlay Component

**File**: [NineBoxGrid.tsx](c:/Git_Repos/9boxer/frontend/src/components/grid/NineBoxGrid.tsx) (lines 298-465)

**Current Problem**:
- DragOverlay JSX is complex and rebuilt on every drag movement
- Heavy computation for overlay rendering
- Inline JSX prevents optimization

**Current Pattern**:
```typescript
<DragOverlay>
  {activeEmployee && (
    <Box>
      {/* Complex JSX with employee data, styles, etc */}
    </Box>
  )}
</DragOverlay>
```

**Implementation Steps**:
1. Extract DragOverlay content to separate component:
   ```typescript
   const DraggedEmployeeTile = React.memo(({ employee }) => {
     return (
       <Box>
         {/* Overlay rendering logic */}
       </Box>
     )
   })
   ```
2. Move to new file: `DraggedEmployeeTile.tsx`
3. Add proper memoization with custom comparison
4. Use in NineBoxGrid:
   ```typescript
   <DragOverlay>
     {activeEmployee && (
       <DraggedEmployeeTile employee={activeEmployee} />
     )}
   </DragOverlay>
   ```
5. Ensure overlay renders correctly during drag
6. Optimize any heavy computations within overlay

**Expected Outcome**:
- DragOverlay component only re-renders when activeEmployee changes
- Reduced computation during continuous drag movements
- Smoother drag visual feedback
- Better code organization

**Verification**:
- [ ] Drag overlay displays correctly
- [ ] Overlay updates when dragging different employees
- [ ] Profile shows reduced render time
- [ ] No visual glitches during drag

---

## Success Criteria

### Performance Metrics
- [ ] Drag operations maintain 55+ FPS (measured with Chrome DevTools)
- [ ] Render time per drag movement: < 16ms (60fps)
- [ ] Memory usage stable during drag operations
- [ ] No frame drops during continuous dragging

### Code Quality
- [ ] All components properly memoized
- [ ] No unnecessary re-renders detected in profiler
- [ ] Code reviewed by principal-engineer agent
- [ ] Existing tests pass

### Functionality
- [ ] Drag and drop works correctly
- [ ] Visual feedback during drag is smooth
- [ ] Employee data updates correctly after drop
- [ ] No race conditions or state inconsistencies

---

## Testing Checklist

### Before Implementation
- [ ] Capture baseline FPS during drag (use React DevTools Profiler)
- [ ] Document render counts per drag operation
- [ ] Record any existing drag-related bugs

### During Implementation
- [ ] Test after each task completion
- [ ] Use React DevTools Profiler to verify improvements
- [ ] Check for prop stability with React DevTools

### After Implementation
- [ ] Profile complete drag operation (start to end)
- [ ] Test with maximum employees (~100 employees)
- [ ] Test rapid dragging of multiple employees
- [ ] Test dragging across different grid boxes
- [ ] Verify data integrity after drag operations
- [ ] Check for memory leaks (Chrome Memory Profiler)

---

## Performance Profiling Guide

### Using React DevTools Profiler:
1. Open React DevTools → Profiler tab
2. Click "Record" (red circle)
3. Perform drag operation
4. Stop recording
5. Analyze flame graph for:
   - Components that rendered unnecessarily
   - Long render times
   - Render cascades

### Using Chrome DevTools Performance:
1. Open Chrome DevTools → Performance tab
2. Check "Screenshots" and "Memory"
3. Click "Record"
4. Perform drag operation
5. Stop recording
6. Analyze:
   - FPS meter (target: 55-60 FPS)
   - Main thread activity
   - Memory allocations

---

## Rollback Plan

If critical issues arise:
1. React.memo can be removed without breaking functionality
2. useMemo optimizations can be reverted
3. DragOverlay extraction can be undone
4. Each task is independent and can be rolled back separately

---

## Dependencies

- React DevTools (for profiling)
- Chrome DevTools (for FPS measurement)
- No new npm packages required

---

## Notes for Agent

- **Focus on measurement**: Use profiler before and after each change
- **Test thoroughly**: Drag and drop is critical user-facing functionality
- **Watch for edge cases**: Multiple employees, rapid dragging, edge-of-grid drops
- **Document improvements**: Capture profiler screenshots showing improvement
- **Verify prop types**: Ensure props passed to memoized components are stable
- **Consider deep equality**: Some props may need deep comparison functions

---

## Related Issues

- Issue #5: Missing React.memo on EmployeeTile
- Issue #6: Unnecessary re-renders in NineBoxGrid
- Issue #7: Inline object creation in render
- Issue #8: Heavy computation in DragOverlay
