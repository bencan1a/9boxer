# Blocker: changes-employee-details Screenshot

## Issue
The `panel-employeedetails--with-changes` Storybook story fails to render, causing screenshot generation timeouts.

## Error
```
page.waitForSelector: Timeout 10000ms exceeded.
waiting for locator('#storybook-root') to be visible
  24 × locator resolved to hidden <div id="storybook-root"></div>
```

## Root Cause
The `WithChanges` story needs to populate the session store with events to show the "Changes Summary" section. Multiple approaches have been attempted:

1. **Using `require()` in render function** - ❌ Wrong pattern for ES modules
2. **Using ES6 imports in render function** - ❌ Still fails to render
3. **Using decorators to set session store state** - ❌ Story won't render (current state)

## Story Code (Current)
```typescript
export const WithChanges: Story = {
  args: {
    employee: {
      ...fullEmployee,
      modified_in_session: true,
      last_modified: "2025-12-24T10:30:00Z",
    },
  },
  decorators: [
    (Story) => {
      const gridEvents: GridMoveEvent[] = [
        {
          event_id: "grid-1",
          event_type: "grid_move",
          employee_id: 12345,
          employee_name: "Alice Johnson",
          timestamp: "2025-12-24T10:30:00Z",
          old_position: 5,
          new_position: 9,
          old_performance: "Medium",
          new_performance: "High",
          old_potential: "Medium",
          new_potential: "High",
          notes: "Promoted...",
        },
      ];

      useSessionStore.setState({
        events: gridEvents,
        donutEvents: [],
        donutModeActive: false,
      });

      return <Story />;
    },
  ],
};
```

## Hypothesis
The decorator pattern may be causing React rendering issues when setting Zustand store state during render. The `EmployeeChangesSummary` component reads from `useSessionStore` to display changes, but the timing of `setState()` in the decorator might be problematic.

## Possible Solutions

### Option 1: Simplify Story (Quick Fix)
Remove decorators and just show employee without changes. Won't demonstrate the feature but at least generates a screenshot.

```typescript
export const WithChanges: Story = {
  args: {
    employee: {
      ...fullEmployee,
      modified_in_session: true,
      last_modified: "2025-12-24T10:30:00Z",
    },
  },
};
```

### Option 2: Full-App Workflow
Replace Storybook screenshot with full-app workflow that:
1. Loads sample data
2. Moves an employee (generating session event)
3. Clicks employee to open details panel
4. Screenshots the panel showing changes

Pros: More reliable for complex state
Cons: Slower, more brittle

### Option 3: Debug Storybook Story
- Check browser console for React errors
- Verify session store setup in Storybook preview
- Test if other stories using session store decorators work
- Try alternative decorator patterns (e.g., wrapper component)

## Files Modified
- `frontend/src/components/panel/EmployeeDetails.stories.tsx` - Added imports, created WithChanges story
- `frontend/playwright/screenshots/workflows/storybook-components.ts` - Added `generateEmployeeDetailsPanelWithChanges()` function
- `frontend/playwright/screenshots/config.ts` - Updated to reference new function

## Recommendation
**Option 1** (simplify story) for immediate unblocking, then revisit with **Option 3** (debug) when time allows. The user review noted "basic shot is ok, but it doesn't show any changes" - so even a simple version is acceptable, and we can improve it iteratively.
