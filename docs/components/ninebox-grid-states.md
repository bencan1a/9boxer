# NineBoxGrid Component States and Transitions

This document describes the state machine and transitions for the NineBoxGrid component hierarchy.

## Component Hierarchy

```
NineBoxGrid (container)
├── GridAxes (axis labels)
├── GridBox[] (9 instances)
│   ├── BoxHeader (label, count, controls)
│   ├── EmployeeTileList (layout wrapper)
│   │   └── EmployeeTile[] (draggable cards)
│   └── DropZone (drag target)
└── DragOverlay (active drag item)
```

## State Definitions

### NineBoxGrid States

#### View Mode
```typescript
type ViewMode = 'normal' | 'donut' | 'compact';
```

**States:**
- `normal` - Standard 3x3 grid with all employees
- `donut` - Calibration mode, shows only position 5 employees
- `compact` - Smaller grid for embedded views (future)

**Transitions:**
- User clicks "Donut Mode" toggle → `normal` ↔ `donut`
- Mode persists in session store

#### Drag State
```typescript
type DragState = 'idle' | 'dragging' | 'dragOver';
```

**States:**
- `idle` - No drag operation in progress
- `dragging` - User is dragging an employee tile
- `dragOver` - Dragged item is over a drop target

**Transitions:**
- User starts drag → `idle` → `dragging`
- User moves over GridBox → `dragging` → `dragOver`
- User releases or cancels → any state → `idle`

### GridBox States

#### Expansion State
```typescript
type ExpansionState = 'normal' | 'expanded' | 'collapsed';
```

**States:**
- `normal` - Default size (150-400px height)
- `expanded` - Full viewport height, multi-column layout
- `collapsed` - Minimal size (60-80px), shows label only

**Transitions:**
- User clicks expand button → `normal` → `expanded`
- User clicks collapse button → `expanded` → `normal`
- Another box expands → `normal` → `collapsed` (automatic)
- ESC key pressed → `expanded` → `normal` (all boxes)

**Persistence:**
- Expanded position saved to localStorage (`nineBoxExpandedPosition`)
- Restored on app reload

---

**Last Updated:** Phase 1.1 Componentization (December 2024)
**Related Files:**
- `frontend/src/components/grid/NineBoxGrid.tsx`
- `frontend/src/components/grid/GridBox.tsx`
- `frontend/src/components/grid/BoxHeader.tsx`
- `frontend/src/components/grid/EmployeeTileList.tsx`
- `DESIGN_SYSTEM.md` - Component guidelines
