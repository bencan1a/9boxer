# Statistics Panel Componentization Plan

**Status:** active
**Owner:** Claude Code
**Created:** 2025-12-27
**Summary:**
  - Break down StatisticsTab into reusable, testable components
  - Replace SVG curly braces with CSS-based grouping indicators
  - Add color-coded percentage bars to show distribution skew
  - Build comprehensive Storybook stories for all components
  - Update component tests and documentation screenshots

---

## Overview

The Statistics Panel (`StatisticsTab.tsx`) currently has 328 lines of code with inline components and hardcoded values. This plan breaks it down into 6 focused components following the design system's componentization patterns (similar to NineBoxGrid Phase 1.1).

**Goals:**
1. **Reusability** - Extract StatisticCard for use in other summary views
2. **Testability** - Isolate components for unit testing
3. **Design Token Compliance** - Eliminate all hardcoded values
4. **Storybook Coverage** - 30+ stories across all components
5. **Accessibility** - WCAG 2.1 AA compliance
6. **Visual Feedback** - Color-coded groupings to identify distribution skew

---

## Component Architecture

```
StatisticsTab (container - 50 lines)
├── StatisticsSummary (composition)
│   └── StatisticCard (×3) (atom)
│
├── DistributionTable (organism)
│   ├── GroupingIndicator (CSS-based) (atom)
│   └── DistributionRow (×9) (molecule)
│       ├── position label
│       ├── count
│       └── ColoredPercentageBar (molecule)
│
└── DistributionChart (existing ✅)
```

---

## CSS-Based Grouping Design

### Problem with Current Approach
The current SVG curly brace approach:
- Complex path calculations
- Fixed sizing (doesn't adapt well to different row heights)
- Not semantic (screen readers struggle with SVG shapes)
- Hard to maintain

### Proposed CSS Solution

**Visual Design:**
```
┌─────────────────────────────────────────────────────────────┐
│ Position         | Count | Percentage      | Group %        │
├─────────────────────────────────────────────────────────────┤
│ 9 - Star         │   12  │ ████░░░ 10.8%  │ ┃              │
│ 8 - High Perf    │   15  │ █████░░ 13.5%  │ ┃ High         │
│ 6 - Strong       │   14  │ █████░░ 12.6%  │ ┃ 37.0%        │
├─────────────────────────────────────────────────────────────┤
│ 7 - High Pot     │   10  │ ███░░░░  9.0%  │ ┃              │
│ 5 - Solid        │   18  │ ██████░ 16.2%  │ ┃ Middle       │
│ 3 - Inconsist    │   13  │ ████░░░ 11.7%  │ ┃ 37.0%        │
├─────────────────────────────────────────────────────────────┤
│ 4 - Dev Needed   │   11  │ ████░░░  9.9%  │ ┃              │
│ 2 - Under Perf   │    9  │ ███░░░░  8.1%  │ ┃ Low          │
│ 1 - Needs Att    │    9  │ ███░░░░  8.1%  │ ┃ 26.0%        │
└─────────────────────────────────────────────────────────────┘
```

**CSS Implementation:**

```tsx
// GroupingIndicator.tsx
<TableCell
  rowSpan={3}
  sx={{
    position: 'relative',
    width: 120,
    borderLeft: `4px solid ${groupColor}`,
    backgroundColor: alpha(groupColor, 0.05),
    verticalAlign: 'middle',
  }}
>
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 0.5,
    }}
  >
    <Typography
      variant="caption"
      sx={{
        color: groupColor,
        fontWeight: 'bold',
        textTransform: 'uppercase',
      }}
    >
      {groupLabel}
    </Typography>
    <Typography
      variant="h6"
      sx={{
        color: groupColor,
        fontWeight: 'bold',
      }}
    >
      {groupPercentage.toFixed(1)}%
    </Typography>
  </Box>
</TableCell>
```

**Group Color Scheme:**

Based on distribution patterns, colors indicate skew:
- **High Performers (9, 8, 6)**:
  - Ideal: 25-35% → `theme.palette.success.main` (green)
  - Too low: <20% → `theme.palette.warning.main` (orange)
  - Too high: >40% → `theme.palette.info.main` (blue)
- **Middle Tier (7, 5, 3)**:
  - Ideal: 30-40% → `theme.palette.info.main` (blue)
  - Too low: <25% → `theme.palette.warning.main` (orange)
  - Too high: >45% → `theme.palette.warning.main` (orange)
- **Low Performers (4, 2, 1)**:
  - Ideal: 15-25% → `theme.palette.success.main` (green)
  - Too low: <10% → `theme.palette.info.main` (blue)
  - Too high: >30% → `theme.palette.error.main` (red)

**Benefits:**
- ✅ Semantic HTML (uses table cells, not SVG)
- ✅ Screen reader accessible
- ✅ Adapts to row height automatically
- ✅ Clear visual hierarchy with color + border
- ✅ Easy to maintain (pure CSS)

---

## Colored Percentage Bars

### Current State
Percentage bars are uniform blue (`LinearProgress` default color)

### Proposed Enhancement

**Color Logic:**
```typescript
const getPercentageBarColor = (percentage: number, position: number) => {
  // High performers (9, 8, 6) - Green when above 8%
  if ([9, 8, 6].includes(position)) {
    return percentage >= 8
      ? theme.palette.success.main
      : theme.palette.warning.main;
  }

  // Middle tier (7, 5, 3) - Blue when 8-15%
  if ([7, 5, 3].includes(position)) {
    return percentage >= 8 && percentage <= 15
      ? theme.palette.info.main
      : theme.palette.warning.main;
  }

  // Low performers (4, 2, 1) - Warning when below 8%
  if ([4, 2, 1].includes(position)) {
    return percentage <= 8
      ? theme.palette.success.main
      : theme.palette.error.main;
  }

  return theme.palette.primary.main;
};
```

**Visual Example:**
```
9 - Star         │ ███████████░░░░░ 25.0%  [GREEN - Good!]
8 - High Perf    │ █████████░░░░░░░ 18.0%  [GREEN - Good!]
6 - Strong       │ ██░░░░░░░░░░░░░░  4.0%  [ORANGE - Too low]
5 - Solid        │ ████████████████ 32.0%  [ORANGE - Too high]
4 - Dev Needed   │ ████████████████ 30.0%  [RED - Too many!]
1 - Needs Att    │ ██░░░░░░░░░░░░░░  3.0%  [GREEN - Good!]
```

---

## Component Specifications

### 1. StatisticCard (Atom)

**File:** `frontend/src/components/panel/statistics/StatisticCard.tsx`

**Props:**
```typescript
interface StatisticCardProps {
  value: number | string;
  label: string;
  color?: 'primary' | 'warning' | 'success' | 'error' | 'info';
  icon?: React.ReactNode;
  variant?: 'outlined' | 'elevation';
  'data-testid'?: string;
}
```

**Design Tokens:**
- `theme.tokens.spacing.md` - Card padding (2)
- `theme.palette[color].main` - Value color
- Minimum height: 120px (no token, specific to this card)

**Storybook Stories (6):**
1. Default - Primary color, no icon
2. WithWarningColor - Orange warning value
3. WithSuccessColor - Green success value
4. WithIcon - Includes TrendingUp icon
5. ElevatedVariant - With shadow instead of outline
6. LargeNumber - Tests number formatting (1,234)

**Tests:**
- Renders value and label correctly
- Applies correct color theme
- Handles large numbers with commas
- Supports both variant types
- Accessible (ARIA labels, semantic HTML)

---

### 2. StatisticsSummary (Composition)

**File:** `frontend/src/components/panel/statistics/StatisticsSummary.tsx`

**Props:**
```typescript
interface StatisticsSummaryProps {
  totalEmployees: number;
  modifiedEmployees: number;
  highPerformers: number;
}
```

**Layout:**
- MUI Grid with 3 columns (4 units each)
- Responsive: Stacks on small screens
- Uses `theme.tokens.spacing.md` for gap

**Storybook Stories (4):**
1. Default - Normal numbers
2. AllZero - Empty state (0, 0, 0)
3. LargeNumbers - Tests formatting (1,234, 567, 890)
4. Responsive - Shows mobile/desktop layouts

**Tests:**
- Renders all three cards
- Passes correct props to StatisticCard
- Responsive layout works
- Grid spacing uses design tokens

---

### 3. GroupingIndicator (Atom - CSS-Based)

**File:** `frontend/src/components/panel/statistics/GroupingIndicator.tsx`

**Props:**
```typescript
interface GroupingIndicatorProps {
  groupType: 'high' | 'middle' | 'low';
  percentage: number;
  rowSpan?: number;
}
```

**Color Logic:**
```typescript
const getGroupColor = (groupType: string, percentage: number) => {
  switch (groupType) {
    case 'high':
      if (percentage < 20) return theme.palette.warning.main;
      if (percentage > 40) return theme.palette.info.main;
      return theme.palette.success.main;
    case 'middle':
      if (percentage < 25 || percentage > 45)
        return theme.palette.warning.main;
      return theme.palette.info.main;
    case 'low':
      if (percentage < 10) return theme.palette.info.main;
      if (percentage > 30) return theme.palette.error.main;
      return theme.palette.success.main;
  }
};
```

**Design Tokens:**
- `theme.tokens.spacing.sm` - Gap between label and percentage
- `theme.palette.success/warning/error/info.main` - Group colors
- `alpha(groupColor, 0.05)` - Background tint

**Storybook Stories (6):**
1. HighPerformersBalanced - 30%, green
2. HighPerformersTooLow - 15%, orange warning
3. HighPerformersTooHigh - 45%, blue info
4. MiddleTierBalanced - 35%, blue
5. LowPerformersTooHigh - 35%, red error
6. LowPerformersBalanced - 20%, green

**Tests:**
- Renders correct label and percentage
- Applies correct color based on logic
- TableCell has correct rowSpan
- Background tint uses alpha transparency
- Border color matches text color

---

### 4. ColoredPercentageBar (Molecule)

**File:** `frontend/src/components/panel/statistics/ColoredPercentageBar.tsx`

**Props:**
```typescript
interface ColoredPercentageBarProps {
  percentage: number;
  position: number;
  showLabel?: boolean;
}
```

**Color Logic:** See "Colored Percentage Bars" section above

**Design Tokens:**
- `theme.tokens.radius.sm` - Border radius (4px)
- Height: 8px (specific to progress bar)
- `theme.palette.*` - Dynamic colors based on position

**Storybook Stories (8):**
1. HighPerformerGood - Position 9, 25%, green
2. HighPerformerLow - Position 8, 4%, orange
3. MiddleTierBalanced - Position 5, 12%, blue
4. MiddleTierTooHigh - Position 5, 32%, orange
5. LowPerformerGood - Position 1, 3%, green
6. LowPerformerTooHigh - Position 4, 30%, red
7. ZeroPercentage - 0%, gray
8. FullWidth - 100%, tests edge case

**Tests:**
- Renders LinearProgress with correct value
- Applies correct color based on position + percentage
- Shows formatted percentage label
- Handles edge cases (0%, 100%)
- Uses design tokens for styling

---

### 5. DistributionRow (Molecule)

**File:** `frontend/src/components/panel/statistics/DistributionRow.tsx`

**Props:**
```typescript
interface DistributionRowProps {
  position: number;
  positionLabel: string;
  count: number;
  percentage: number;
  isEmpty?: boolean;
  groupIndicator?: React.ReactNode; // Rendered by parent
}
```

**Design Tokens:**
- `theme.tokens.spacing.sm` - Gap between bar and label
- `theme.palette.mode` - Empty state background
- `theme.palette.text.secondary` - Label color

**Empty State Styling:**
```tsx
sx={{
  backgroundColor: isEmpty
    ? theme.palette.mode === 'dark'
      ? 'rgba(255, 255, 255, 0.05)'
      : 'grey.50'
    : 'transparent',
}}
```

**Storybook Stories (6):**
1. Default - Position 9, normal data
2. EmptyPosition - Count 0, styled differently
3. HighCount - 35 employees, 30%
4. LowPercentage - 2%, small bar
5. WithGroupIndicator - Shows grouping cell
6. DarkMode - Tests empty state in dark theme

**Tests:**
- Renders all cells correctly
- Empty state styling applied when count = 0
- ColoredPercentageBar receives correct props
- Group indicator cell rendered when provided
- Font weight changes based on count (bold if > 0)

---

### 6. DistributionTable (Organism)

**File:** `frontend/src/components/panel/statistics/DistributionTable.tsx`

**Props:**
```typescript
interface DistributionTableProps {
  distribution: PositionDistribution[];
  groupedStats?: {
    highPerformers: { count: number; percentage: number };
    middleTier: { count: number; percentage: number };
    lowPerformers: { count: number; percentage: number };
  };
}
```

**Custom Sort Order:** [9, 8, 6, 7, 5, 3, 4, 2, 1]

**Table Structure:**
```tsx
<Table>
  <TableHead>
    <TableRow>
      <TableCell>Position</TableCell>
      <TableCell align="right">Count</TableCell>
      <TableCell align="left">Percentage</TableCell>
      <TableCell align="center">Group %</TableCell>
    </TableRow>
  </TableHead>
  <TableBody>
    {/* Rows 9, 8, 6 with GroupingIndicator (rowSpan=3) on first row */}
    {/* Rows 7, 5, 3 with GroupingIndicator (rowSpan=3) on first row */}
    {/* Rows 4, 2, 1 with GroupingIndicator (rowSpan=3) on first row */}
  </TableBody>
</Table>
```

**Design Tokens:**
- `theme.tokens.spacing.md` - Table padding
- `theme.palette.divider` - Border colors

**Storybook Stories (7):**
1. BalancedDistribution - Even spread
2. SkewedToCenter - 58% in position 5
3. HighPerformerHeavy - 75% in top tier
4. LowPerformerHeavy - 50% in bottom tier
5. SparseWithEmpties - Some positions at 0
6. SmallDataset - 20 employees
7. WithoutGrouping - No groupedStats prop

**Tests:**
- Sorts distribution in custom order
- Renders GroupingIndicator with correct rowSpan
- Passes correct groupType to indicators
- Empty positions styled correctly
- GroupingIndicator gets correct color based on percentage
- Handles missing groupedStats gracefully

---

### 7. StatisticsTab (Refactored Container)

**File:** `frontend/src/components/panel/StatisticsTab.tsx`

**New Line Count:** ~50 lines (down from 328)

**Responsibilities:**
- Data fetching (useStatistics hook)
- Loading/error/empty state orchestration
- Layout composition with design tokens

**No longer contains:**
- ❌ Inline card components
- ❌ Inline table rows
- ❌ SVG curly braces
- ❌ Hardcoded spacing values

**Design Tokens:**
- `theme.tokens.spacing.lg` - Gap between sections (3 units = 24px)
- `theme.tokens.spacing.md` - Paper padding (2 units = 16px)

---

## Implementation Plan

### Phase 1: Foundation Components (Atoms)

**Task 1.1: StatisticCard**
- Create component file
- Add PropTypes interface
- Implement with design tokens
- Create 6 Storybook stories
- Write unit tests

**Task 1.2: GroupingIndicator (CSS-based)**
- Create component file
- Implement color logic function
- Add design tokens
- Create 6 Storybook stories
- Write unit tests

**Task 1.3: ColoredPercentageBar**
- Create component file
- Implement position-based color logic
- Add design tokens
- Create 8 Storybook stories
- Write unit tests

---

### Phase 2: Composition Components (Molecules)

**Task 2.1: StatisticsSummary**
- Create component file
- Compose 3 StatisticCards
- Add responsive Grid layout
- Create 4 Storybook stories
- Write unit tests

**Task 2.2: DistributionRow**
- Create component file
- Integrate ColoredPercentageBar
- Add empty state styling
- Create 6 Storybook stories
- Write unit tests

---

### Phase 3: Complex Components (Organisms)

**Task 3.1: DistributionTable**
- Create component file
- Implement custom sort order
- Integrate GroupingIndicator with rowSpan logic
- Integrate DistributionRow
- Create 7 Storybook stories
- Write unit tests

---

### Phase 4: Container Refactoring

**Task 4.1: Refactor StatisticsTab**
- Replace inline components with new components
- Remove hardcoded values
- Keep only orchestration logic
- Update imports
- Verify functionality

**Task 4.2: Update Tests**
- Update StatisticsTab tests to use new components
- Add integration tests
- Verify test coverage >80%

---

### Phase 5: Documentation & Visual Testing

**Task 5.1: Generate Documentation Screenshots**
- `statistics-panel-distribution` - Overview of panel
- `statistics-trend-indicators` - Colored percentage bars
- `statistics-grouping-indicators` - New CSS grouping design
- `statistics-skewed-distribution` - Red warning for too many low performers

**Task 5.2: Update Visual Regression Baselines**
- Run `npm run test:visual`
- Review visual diffs
- Update baselines with `npm run test:visual:update`
- Commit updated snapshots

**Task 5.3: Update User Documentation**
- Update screenshots in `resources/user-guide/docs/`
- Update any references to statistics panel
- Regenerate USER_GUIDE.html

---

## File Structure

```
frontend/src/components/panel/statistics/
├── StatisticCard.tsx
├── StatisticCard.stories.tsx
├── StatisticCard.test.tsx
├── GroupingIndicator.tsx
├── GroupingIndicator.stories.tsx
├── GroupingIndicator.test.tsx
├── ColoredPercentageBar.tsx
├── ColoredPercentageBar.stories.tsx
├── ColoredPercentageBar.test.tsx
├── StatisticsSummary.tsx
├── StatisticsSummary.stories.tsx
├── StatisticsSummary.test.tsx
├── DistributionRow.tsx
├── DistributionRow.stories.tsx
├── DistributionRow.test.tsx
├── DistributionTable.tsx
├── DistributionTable.stories.tsx
├── DistributionTable.test.tsx
└── index.ts (exports)

frontend/src/components/panel/
├── StatisticsTab.tsx (refactored)
├── StatisticsTab.stories.tsx (updated)
└── StatisticsTab.test.tsx (updated)
```

---

## Success Criteria

**Code Quality:**
- ✅ All components use design tokens (no hardcoded values)
- ✅ TypeScript strict mode compliant
- ✅ ESLint passes with no warnings
- ✅ Test coverage >80% for all new components

**Accessibility:**
- ✅ WCAG 2.1 AA compliant
- ✅ Keyboard navigation works
- ✅ Screen reader compatible
- ✅ All interactive elements have ARIA labels

**Visual Design:**
- ✅ Supports light and dark themes
- ✅ Responsive layout (mobile + desktop)
- ✅ Color-coded groupings show distribution skew
- ✅ Visual regression tests pass

**Documentation:**
- ✅ 30+ Storybook stories created
- ✅ All components have JSDoc comments
- ✅ User guide screenshots updated
- ✅ README updated with new component structure

**Performance:**
- ✅ No unnecessary re-renders
- ✅ Memoization where appropriate
- ✅ Bundle size increase <5KB

---

## Timeline Estimate

| Phase | Tasks | Estimated Time |
|-------|-------|----------------|
| Phase 1 | 3 atoms × 2 hours | 6 hours |
| Phase 2 | 2 molecules × 1.5 hours | 3 hours |
| Phase 3 | 1 organism × 2 hours | 2 hours |
| Phase 4 | Refactoring × 1 hour | 1 hour |
| Phase 5 | Docs + Visual × 2 hours | 2 hours |
| **Total** | | **14 hours** |

---

## Risks & Mitigation

**Risk 1: Color Logic Too Complex**
- **Mitigation:** Extract color logic to pure functions, test extensively
- **Fallback:** Start with simpler logic (static colors), add intelligence later

**Risk 2: CSS Grouping Not Clear Enough**
- **Mitigation:** User testing with screenshots, iterate on design
- **Fallback:** Hybrid approach (border + subtle background)

**Risk 3: Breaking Changes to StatisticsTab**
- **Mitigation:** Keep StatisticsTab tests intact, verify behavior unchanged
- **Fallback:** Feature flag to toggle between old/new components

**Risk 4: Performance Regression**
- **Mitigation:** Use React.memo for ColoredPercentageBar
- **Fallback:** Lazy load DistributionTable if needed

---

## Future Enhancements

**Post-MVP Features:**
1. **Interactive Rows** - Click to highlight employees in that position
2. **Export Table** - Download distribution as CSV
3. **Comparison Mode** - Compare current vs. ideal distribution
4. **Animation** - Smooth transitions when data changes
5. **Tooltips** - Hover to see guidance on each position

---

## References

- [Design System Guidelines](../../DESIGN_SYSTEM.md)
- [Component Guidelines](../../internal-docs/design-system/component-guidelines.md)
- [Design Tokens](../../frontend/src/theme/tokens.ts)
- [NineBoxGrid Componentization](../grid-componentization-phase-1.1/) (similar pattern)
- [Accessibility Standards](../../internal-docs/design-system/accessibility-standards.md)

---

**Status:** Ready for implementation
**Next Step:** Begin Phase 1 - Foundation Components
