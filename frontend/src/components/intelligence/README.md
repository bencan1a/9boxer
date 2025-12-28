# Intelligence Visualization Components

This directory contains the visualization components for the Intelligence Tab feature. Components are organized into **Current Components** (actively used in the app) and **Future Components** (planned for AI-powered features).

## Component Organization

### Current Components (Active)

The following components are actively used in the Intelligence Tab:

1. **IntelligenceSummary** - Summary cards displaying overall quality metrics
2. **AnomalySection** - Statistical analysis showing significant deviations
3. **DeviationChart** - Bar chart with significance indicators
4. **LevelDistributionChart** - Stacked bar showing performance by level

### Future Components (Planned)

The following components are planned for AI-powered insights but not yet implemented:

1. **AnomalyCard** - Individual anomaly display with actions (Atom)
2. **InsightCard** - AI-generated insight display with confidence (Atom)
3. **AnomaliesSection** - Collection of anomalies with filtering (Section)
4. **InsightsSection** - Collection of AI insights with grouping (Section)
5. **DistributionSection** - Distribution comparison section (Section)

**Note:** Future components have their Storybook stories marked with 🔮 Future Feature badges for clarity.

## Components

### 1. DeviationChart

Bar chart comparing expected vs actual percentages with statistical significance indicators.

**Usage:**
```typescript
import { DeviationChart } from "./intelligence";

<DeviationChart
  data={[
    {
      category: "USA",
      observed_high_pct: 45,
      expected_high_pct: 25,
      z_score: 4.1,
      p_value: 0.0001,
      sample_size: 150,
      is_significant: true,
    },
    // ... more items
  ]}
  title="Location Analysis: High Performer Distribution"
/>
```

**Features:**
- Traffic light color coding (Green/Yellow/Red)
- Rich tooltips with statistical details
- Responsive design
- Handles empty data gracefully

---

### 2. DistributionHeatmap

Heatmap showing percentage distribution across 9-box positions by category (e.g., function).

**Usage:**
```typescript
import { DistributionHeatmap } from "./intelligence";

<DistributionHeatmap
  data={[
    {
      function: "Engineering",
      distribution: {
        "9": { percentage: 15.2, count: 12 },
        "8": { percentage: 8.9, count: 7 },
        // ... positions 1-9
      },
      total: 79,
    },
    // ... more functions
  ]}
  title="Function Analysis: 9-Box Position Distribution"
/>
```

**Features:**
- Color intensity gradient based on percentage
- Cell hover effects with tooltips
- Horizontally scrollable for long lists
- Shows both percentage and count

---

### 3. LevelDistributionChart

Stacked bar chart showing performance distribution (Low/Medium/High) by job level.

**Usage:**
```typescript
import { LevelDistributionChart } from "./intelligence";

<LevelDistributionChart
  data={[
    {
      level: "MT1",
      low_pct: 15.0,
      low_count: 6,
      medium_pct: 60.0,
      medium_count: 24,
      high_pct: 25.0,
      high_count: 10,
      total: 40,
    },
    // ... more levels
  ]}
  title="Level Analysis: Performance Distribution by Level"
  baselineHighPct={25}
/>
```

**Features:**
- Stacked bars normalized to 100%
- Baseline reference line for comparison
- Traffic light colors (Red/Yellow/Green)
- Detailed tooltips with counts and percentages

---

## Mock Data Demo

See `MockDataDemo.tsx` for a complete working example of all three components with realistic data.

To view the demo, temporarily add it to your routing or import it in a test page:

```typescript
import { MockDataDemo } from "./components/intelligence/MockDataDemo";

// In your component
<MockDataDemo />
```

---

## Design Principles

1. **Consistency**: All components match the visual style of `StatisticsTab.tsx`
2. **Accessibility**: High contrast colors, clear labels, semantic HTML
3. **Responsive**: Work on various screen sizes
4. **Informative**: Rich tooltips with all relevant statistical information
5. **Error Handling**: Graceful handling of empty/invalid data

---

## Dependencies

- `recharts` (already installed): Charts and visualizations
- `@mui/material`: UI components and styling

---

## Color Scheme

### Traffic Light System
Uses semantic colors from design tokens (`theme.tokens.colors.semantic`):
- **Green** (`theme.tokens.colors.semantic.success`): No significant anomaly
- **Yellow/Orange** (`theme.tokens.colors.semantic.warning`): Moderate anomaly (p < 0.05)
- **Red** (`theme.tokens.colors.semantic.error`): Severe anomaly (p < 0.01)

### Performance Categories
- **High Performance**: Green (`theme.tokens.colors.semantic.success`)
- **Medium Performance**: Yellow/Orange (`theme.tokens.colors.semantic.warning`)
- **Low Performance**: Red (`theme.tokens.colors.semantic.error`)

### Heatmap
- **Low intensity**: Light blue
- **High intensity**: Dark blue
- **Zero**: Light gray (`#f5f5f5`)

---

## Integration with Intelligence Tab

These components are designed to be used in the main Intelligence Tab component:

```typescript
// IntelligenceTab.tsx
import {
  DeviationChart,
  DistributionHeatmap,
  LevelDistributionChart,
} from "./intelligence";

export const IntelligenceTab: React.FC = () => {
  const { data } = useIntelligence();

  return (
    <Box>
      {/* Location Analysis Section */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6">Location Analysis</Typography>
        <DeviationChart
          data={data.location_analysis.deviations}
          title="High Performer Distribution by Location"
        />
      </Paper>

      {/* Function Analysis Section */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6">Function Analysis</Typography>
        <DistributionHeatmap
          data={data.function_analysis.distributions}
          title="9-Box Position Distribution by Function"
        />
      </Paper>

      {/* Level Analysis Section */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6">Level Analysis</Typography>
        <LevelDistributionChart
          data={data.level_analysis.distributions}
          title="Performance Distribution by Level"
          baselineHighPct={data.overall_stats.high_performer_pct}
        />
      </Paper>
    </Box>
  );
};
```

---

## File Structure

```
intelligence/
├── DeviationChart.tsx          # Bar chart with expected vs actual
├── DistributionHeatmap.tsx     # Heatmap for grid position distribution
├── LevelDistributionChart.tsx  # Stacked bar chart by level
├── MockDataDemo.tsx            # Demo page with mock data
├── index.ts                    # Barrel exports
└── README.md                   # This file
```

---

## Testing

### Build Test
```bash
cd frontend && npm run build
```

All components compile without errors.

### Visual Testing
Use `MockDataDemo.tsx` to visually inspect all components.

### Integration Testing
Will be tested once integrated with backend API and real data.

---

## Performance

- Components use functional React components (implicitly memoized)
- Recharts handles internal optimization
- Tested with typical business data volumes (< 100 items)
- No performance issues expected

---

## Storybook Organization

### Current Component Stories

Stories for active components are located in the root:
- `IntelligenceSummary.stories.tsx` - Summary card variants
- `AnomalySection.stories.tsx` - Statistical analysis section variants
- `DeviationChart.stories.tsx` - Bar chart with different datasets
- `LevelDistributionChart.stories.tsx` - Stacked bar with performance levels

### Future Component Stories

Stories for planned components are organized by type and marked with "🔮 Future Feature" badges:

**Atoms (atomic components):**
- `atoms/🔮 Future Feature - AnomalyCard` - Individual anomaly card display
- `atoms/🔮 Future Feature - InsightCard` - AI insight card display

**Sections (compound components):**
- `sections/🔮 Future Feature - AnomaliesSection` - Multiple anomalies collection
- `sections/🔮 Future Feature - InsightsSection` - Multiple insights collection
- `sections/🔮 Future Feature - DistributionSection` - Distribution comparison

All future component stories include:
- **JSDoc description block** explaining the component's planned purpose
- **"🔮 Future Feature" prefix** in the Storybook title
- **`parameters.docs.description.component`** with detailed information about implementation status
- **Complete mock data and stories** ready for when the feature is implemented

### Viewing in Storybook

Run Storybook to see the stories:

```bash
cd frontend
npm run storybook
```

Future feature components are clearly marked in the sidebar with the crystal ball emoji (🔮).

---

## Component Development Guidelines

### Adding a New Current Component

1. Create component file: `ComponentName.tsx`
2. Create story file: `ComponentName.stories.tsx` with JSDoc header:
   ```typescript
   /**
    * ComponentName
    *
    * Brief description of what this component does and where it's used.
    */
   const meta: Meta<typeof ComponentName> = {
     title: "Intelligence/ComponentName",
     // ... rest of meta
   };
   ```
3. Add JSDoc comments to each story explaining the use case
4. Add to barrel export in `index.ts`
5. Document in this README

### Adding a Future Component

1. Create component file: `ComponentName.tsx`
2. Create story file in appropriate subfolder: `atoms/ComponentName.stories.tsx` or `sections/ComponentName.stories.tsx`
3. Add JSDoc header with "Future Feature" notation:
   ```typescript
   /**
    * ComponentName - 🔮 Future Feature
    *
    * This component is planned for [purpose] but not yet implemented
    * in the application.
    */
   const meta: Meta<typeof ComponentName> = {
     title: "Intelligence/[Type]/🔮 Future Feature - ComponentName",
     parameters: {
       docs: {
         description: {
           component: "🔮 **Future Feature** - [Detailed description of planned implementation]",
         },
       },
     },
     // ... rest of meta
   };
   ```
4. Add to the "Future Components" section in this README
5. Do NOT add to barrel export until feature is implemented

### Storybook Story Best Practices

Each story should include:

- **Clear title**: Describe what scenario/variant it shows
- **JSDoc comment** (above story export):
  ```typescript
  /**
   * Story name - Brief description
   * Explains what this story demonstrates
   */
  export const StoryName: Story = { ... };
  ```
- **Meaningful args**: Use realistic data for the story variant
- **Complete coverage**: Include common use cases and edge cases

### Example Story Template

```typescript
/**
 * Enhanced Performance
 * Shows component with high performance score (85+)
 */
export const Enhanced: Story = {
  args: {
    score: 92,
    title: "Excellent Quality",
    // ... other props
  },
};
```

---

## Component Hierarchy

```
Intelligence/
├── Current Components (Active)
│   ├── IntelligenceSummary        # Overview cards
│   ├── AnomalySection             # Statistical anomalies
│   ├── DeviationChart             # Bar chart
│   └── LevelDistributionChart     # Stacked bar
│
└── Future Components (🔮 Planned)
    ├── Atoms (Basic building blocks)
    │   ├── AnomalyCard            # Single anomaly display
    │   └── InsightCard            # Single insight display
    │
    └── Sections (Compound components)
        ├── AnomaliesSection       # Anomaly collection
        ├── InsightsSection        # Insight collection
        └── DistributionSection    # Distribution analysis
```

---

## Future Enhancements

Potential improvements for future iterations:

1. **Export functionality**: Allow downloading charts as PNG/SVG
2. **Interactive filtering**: Click on chart elements to filter
3. **Animation**: Smooth transitions when data changes
4. **Customization**: Allow color scheme overrides
5. **Accessibility**: Add ARIA labels for screen readers
6. **Drill-down**: Click to see detailed employee lists
7. **AI Integration**: Implement future components with actual AI insights
