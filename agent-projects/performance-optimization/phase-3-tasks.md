# Phase 3: Panel Resize Performance Optimization

**Priority**: MEDIUM-HIGH
**Estimated Impact**: Smooth 60fps resize (currently janky)
**Agent**: general-purpose

---

## Task Overview

Phase 3 addresses the sluggish right panel resizing experience. The current implementation fires events on every pixel of movement without throttling, causing janky animations and poor responsiveness. This phase will implement efficient resize handling.

---

## Agent Tasks

### Task 3.1: Add Throttling to Panel Resize Handlers

**File**: [DashboardPage.tsx](c:/Git_Repos/9boxer/frontend/src/components/dashboard/DashboardPage.tsx) (lines 236-245)

**Current Problem**:
- `onLayout` callback fires continuously during resize (100+ times per second)
- State updates on every pixel of movement
- Causes excessive re-renders of child components
- Results in janky, unresponsive resize experience

**Implementation Steps**:
1. Read the current resize handler implementation in DashboardPage
2. Install or implement throttle utility:
   ```typescript
   import { throttle } from 'lodash-es'
   // OR implement custom throttle
   ```
3. Wrap the resize handler with throttle (16ms = 60fps):
   ```typescript
   const handleResize = useCallback(
     throttle((sizes: number[]) => {
       // Update state with new panel sizes
       setPanelSizes(sizes)
     }, 16), // 60fps
     []
   )
   ```
4. Alternatively, use requestAnimationFrame for smoother updates:
   ```typescript
   const rafId = useRef<number>()

   const handleResize = useCallback((sizes: number[]) => {
     if (rafId.current) {
       cancelAnimationFrame(rafId.current)
     }
     rafId.current = requestAnimationFrame(() => {
       setPanelSizes(sizes)
     })
   }, [])
   ```
5. Clean up throttle/RAF on unmount
6. Test that resize feels smooth and responsive

**Expected Outcome**:
- Resize handler fires at max 60 times per second
- Smooth 60fps resize experience
- Reduced CPU usage during resize
- No perceptible lag or stuttering

**Verification**:
- [ ] Use Chrome DevTools Performance tab to verify 60fps
- [ ] Test resize feels smooth and responsive
- [ ] Verify panel sizes update correctly
- [ ] No visual glitches or jumps during resize

---

### Task 3.2: Disable CSS Transitions During Active Resize

**File**: [GridBox.tsx](c:/Git_Repos/9boxer/frontend/src/components/grid/GridBox.tsx) (line 91)

**Current Problem**:
- CSS transitions (e.g., `transition: all 0.2s ease`) conflict with JavaScript-driven resize
- Transitions try to animate during resize, causing jank
- Browser fights between CSS and JS for control
- Results in stuttering and delayed visual updates

**Current Code Pattern**:
```typescript
sx={{
  transition: 'all 0.2s ease',
  // ... other styles
}}
```

**Implementation Steps**:
1. Add resize state tracking in parent (DashboardPage):
   ```typescript
   const [isResizing, setIsResizing] = useState(false)
   ```
2. Update resize handler to track resize state:
   ```typescript
   const handleResizeStart = () => setIsResizing(true)
   const handleResizeEnd = () => setIsResizing(false)
   ```
3. Pass `isResizing` to GridBox components via context or props
4. Conditionally disable transitions during resize:
   ```typescript
   sx={{
     transition: isResizing ? 'none' : 'all 0.2s ease',
     // ... other styles
   }}
   ```
5. Ensure transitions re-enable after resize completes
6. Test that animations work correctly when not resizing

**Alternative Approach** (if resize library supports it):
- Use the resize panel library's `onDragStart` and `onDragEnd` events
- Check react-resizable-panels or similar library documentation

**Expected Outcome**:
- No transition conflicts during resize
- Immediate visual feedback during resize
- Smooth transitions restored after resize completes
- Noticeably smoother resize experience

**Verification**:
- [ ] No jank or stuttering during resize
- [ ] Transitions work correctly after resize stops
- [ ] No visual glitches when starting/stopping resize
- [ ] Test with various transition properties

---

### Task 3.3: Optimize Layout Recalculation

**File**: [DashboardPage.tsx](c:/Git_Repos/9boxer/frontend/src/components/dashboard/DashboardPage.tsx) (lines 75-88)

**Current Problem**:
- Uses requestAnimationFrame in useEffect for panel control
- Unnecessary deferrals and complexity
- May cause layout thrashing

**Current Pattern** (assumed):
```typescript
useEffect(() => {
  requestAnimationFrame(() => {
    // Panel size calculations
  })
}, [dependencies])
```

**Implementation Steps**:
1. Read the current panel control implementation
2. Identify if requestAnimationFrame is actually needed
3. If not needed, use direct DOM updates via refs:
   ```typescript
   const panelRef = useRef<HTMLDivElement>(null)

   const updatePanelSize = (size: number) => {
     if (panelRef.current) {
       panelRef.current.style.width = `${size}px`
     }
   }
   ```
4. Move non-critical calculations outside the resize path
5. Use ResizeObserver if you need to react to size changes:
   ```typescript
   useEffect(() => {
     const resizeObserver = new ResizeObserver(entries => {
       // Only for read operations, not writes
     })
     resizeObserver.observe(element)
     return () => resizeObserver.disconnect()
   }, [])
   ```
6. Ensure no read-write-read patterns that cause layout thrashing

**Expected Outcome**:
- Cleaner, more predictable resize behavior
- Fewer unnecessary layout recalculations
- Faster resize responsiveness
- More maintainable code

**Verification**:
- [ ] Use Chrome DevTools Performance → Rendering → Layout Shift Regions
- [ ] Verify no layout thrashing during resize
- [ ] Test panel sizes update correctly
- [ ] No visual regressions

---

## Success Criteria

### Performance Metrics
- [ ] Panel resize maintains 60 FPS (measured with Chrome DevTools)
- [ ] Resize response time: < 16ms (60fps)
- [ ] No frame drops during continuous resize
- [ ] No layout thrashing detected in profiler

### Code Quality
- [ ] Resize handlers properly throttled
- [ ] Clean state management for resize
- [ ] Code reviewed by principal-engineer agent
- [ ] Existing tests pass

### Functionality
- [ ] Panel resizes smoothly without jank
- [ ] Panel sizes persist correctly
- [ ] Min/max constraints respected
- [ ] Resize handle provides good UX

---

## Testing Checklist

### Before Implementation
- [ ] Capture baseline resize performance (Chrome DevTools)
- [ ] Record FPS during resize operations
- [ ] Document current resize behavior

### During Implementation
- [ ] Test after each task completion
- [ ] Verify no regressions in resize functionality
- [ ] Check FPS improvements incrementally

### After Implementation
- [ ] Profile complete resize operation
- [ ] Test rapid resize movements
- [ ] Test slow, deliberate resizes
- [ ] Test edge cases (min/max sizes)
- [ ] Verify performance on low-end hardware
- [ ] Test with CPU throttling enabled

---

## Performance Profiling Guide

### Measuring Resize Performance:
1. **Chrome DevTools → Performance**
   - Enable "Screenshots"
   - Record during resize operation
   - Analyze FPS meter (target: 60fps)
   - Check for "Layout Shift" warnings

2. **Chrome DevTools → Rendering**
   - Enable "Paint flashing" to see repaint areas
   - Enable "Layout Shift Regions" to detect layout thrashing
   - Resize and observe paint/layout behavior

3. **React DevTools → Profiler**
   - Record during resize
   - Check which components re-render
   - Verify re-renders are minimal

### Red Flags to Watch For:
- FPS drops below 55
- Purple "Layout" bars in Performance timeline
- Excessive paint flashing
- Components re-rendering unnecessarily

---

## Common Resize Panel Libraries

If using a library, consult its documentation:
- **react-resizable-panels**: Check for `onDragStart`, `onDragEnd`, throttle options
- **react-split-pane**: May have built-in throttling
- **react-resizable**: Check resize event handling

Look for:
- Built-in throttle/debounce options
- Resize start/end callbacks
- Performance optimization settings

---

## Rollback Plan

If critical issues arise:
1. Throttling can be disabled (remove throttle wrapper)
2. Transition disabling can be reverted
3. Layout optimizations can be undone
4. Each task is independent and reversible

---

## Dependencies

- lodash-es (if using lodash throttle) - may already be installed
- ResizeObserver polyfill (if targeting older browsers)
- No other new dependencies expected

---

## Notes for Agent

- **Measure first**: Capture before/after performance metrics
- **Test on different hardware**: Resize performance varies significantly
- **Watch for side effects**: Ensure no data loss during resize
- **Consider accessibility**: Keyboard resize support
- **Verify persistence**: Panel sizes should persist correctly
- **Document findings**: Note any library-specific behaviors

---

## Related Issues

- Issue #9: Missing throttling on panel resize
- Issue #10: CSS transitions during resize
- Issue #11: RequestAnimationFrame in useEffect

---

## Performance Budget

Target metrics for this phase:
- Resize FPS: 60fps (no drops below 55fps)
- Resize latency: < 16ms per frame
- Layout shifts: 0 during resize
- Paint time: < 10ms per frame
