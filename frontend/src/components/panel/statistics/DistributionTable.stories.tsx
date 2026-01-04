import type { Meta, StoryObj } from "@storybook/react-vite";
import { DistributionTable } from "./DistributionTable";
import type { PositionDistribution } from "@/types/api";

/**
 * DistributionTable displays the complete employee distribution across all 9 grid positions.
 *
 * **Key Features:**
 * - Custom sort order (9,8,6, 7,5,3, 4,2,1)
 * - Three-tier grouping with CSS-based indicators
 * - Colored percentage bars based on position
 * - Empty state styling for zero-count positions
 * - Dynamic grouping indicator colors based on distribution health
 *
 * **Grouping Logic:**
 * - High Performers (9, 8, 6): Green (25-35%), Orange (<20%), Blue (>40%)
 * - Middle Tier (7, 5, 3): Blue (30-40%), Orange (outside range)
 * - Low Performers (4, 2, 1): Green (15-25%), Blue (<10%), Red (>30%)
 *
 * **Use Cases:**
 * - Statistics panel showing position breakdown
 * - Distribution analysis dashboards
 * - Talent calibration reviews
 */
const meta: Meta<typeof DistributionTable> = {
  title: "App/Right Panel/Statistics/DistributionTable",
  component: DistributionTable,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    distribution: {
      description: "Array of position distribution data",
    },
    groupedStats: {
      description: "Grouped statistics for high/middle/low performers",
    },
  },
};

export default meta;
type Story = StoryObj<typeof DistributionTable>;

// Helper to create mock distribution data
const createDistribution = (
  data: Record<number, number>
): PositionDistribution[] => {
  const total = Object.values(data).reduce((sum, count) => sum + count, 0);
  return Object.entries(data).map(([position, count]) => ({
    grid_position: Number(position),
    count,
    percentage: total > 0 ? (count / total) * 100 : 0,
    position_label: `${position} - Position ${position}`,
  }));
};

/**
 * Balanced distribution.
 * Shows even spread across all positions with healthy grouping percentages.
 */
export const BalancedDistribution: Story = {
  tags: ["screenshot"],
  parameters: {
    screenshot: { enabled: true, id: "statistics-panel-distribution" },
    screenshot: { enabled: true, id: "statistics-panel-distribution" },
  },
  args: {
    distribution: createDistribution({
      9: 12,
      8: 15,
      7: 10,
      6: 14,
      5: 18,
      4: 11,
      3: 13,
      2: 9,
      1: 9,
    }),
    groupedStats: {
      highPerformers: { count: 41, percentage: 36.9 },
      middleTier: { count: 41, percentage: 36.9 },
      lowPerformers: { count: 29, percentage: 26.1 },
    },
  },
};

/**
 * Skewed to center (position 5).
 * Shows concentration at position 5 (Solid Performer) with warning colors.
 */
export const SkewedDistribution: Story = {
  args: {
    distribution: createDistribution({
      9: 3,
      8: 5,
      7: 2,
      6: 7,
      5: 35,
      4: 3,
      3: 2,
      2: 2,
      1: 1,
    }),
    groupedStats: {
      highPerformers: { count: 15, percentage: 25.0 },
      middleTier: { count: 39, percentage: 65.0 },
      lowPerformers: { count: 6, percentage: 10.0 },
    },
  },
};

/**
 * High performer heavy distribution.
 * Shows organization with many employees in top positions (grade inflation concern).
 */
export const HighPerformerHeavy: Story = {
  args: {
    distribution: createDistribution({
      9: 25,
      8: 30,
      7: 8,
      6: 20,
      5: 10,
      4: 3,
      3: 2,
      2: 1,
      1: 1,
    }),
    groupedStats: {
      highPerformers: { count: 75, percentage: 75.0 },
      middleTier: { count: 20, percentage: 20.0 },
      lowPerformers: { count: 5, percentage: 5.0 },
    },
  },
};

/**
 * Low performer heavy distribution.
 * Shows concerning number of employees in low-performing positions (red indicator).
 */
export const LowPerformerHeavy: Story = {
  args: {
    distribution: createDistribution({
      9: 5,
      8: 8,
      7: 7,
      6: 10,
      5: 15,
      4: 20,
      3: 10,
      2: 15,
      1: 10,
    }),
    groupedStats: {
      highPerformers: { count: 23, percentage: 23.0 },
      middleTier: { count: 32, percentage: 32.0 },
      lowPerformers: { count: 45, percentage: 45.0 },
    },
  },
};

/**
 * Sparse distribution with empty positions.
 * Shows what happens when certain positions have zero employees.
 */
export const SparseWithEmpties: Story = {
  args: {
    distribution: createDistribution({
      9: 8,
      8: 12,
      7: 0,
      6: 10,
      5: 14,
      4: 0,
      3: 0,
      2: 0,
      1: 0,
    }),
    groupedStats: {
      highPerformers: { count: 30, percentage: 68.2 },
      middleTier: { count: 14, percentage: 31.8 },
      lowPerformers: { count: 0, percentage: 0.0 },
    },
  },
};

/**
 * Small dataset.
 * Shows distribution for a small team (20 employees).
 */
export const SmallDataset: Story = {
  args: {
    distribution: createDistribution({
      9: 2,
      8: 3,
      7: 1,
      6: 4,
      5: 5,
      4: 2,
      3: 1,
      2: 1,
      1: 1,
    }),
    groupedStats: {
      highPerformers: { count: 9, percentage: 45.0 },
      middleTier: { count: 7, percentage: 35.0 },
      lowPerformers: { count: 4, percentage: 20.0 },
    },
  },
};

/**
 * Without grouping statistics.
 * Shows table when groupedStats is not provided (no grouping indicators).
 */
export const WithoutGrouping: Story = {
  args: {
    distribution: createDistribution({
      9: 12,
      8: 15,
      7: 10,
      6: 14,
      5: 18,
      4: 11,
      3: 13,
      2: 9,
      1: 9,
    }),
    // No groupedStats
  },
};

/**
 * Extreme imbalance.
 * Shows all employees in position 5 (100% middle tier) - extreme warning colors.
 */
export const ExtremeImbalance: Story = {
  args: {
    distribution: createDistribution({
      9: 0,
      8: 0,
      7: 0,
      6: 0,
      5: 100,
      4: 0,
      3: 0,
      2: 0,
      1: 0,
    }),
    groupedStats: {
      highPerformers: { count: 0, percentage: 0.0 },
      middleTier: { count: 100, percentage: 100.0 },
      lowPerformers: { count: 0, percentage: 0.0 },
    },
  },
};

/**
 * Grouped by department.
 * Shows distribution broken down by department/job function.
 * Used for documentation screenshot: statistics-grouped-distribution
 */
export const GroupedByDepartment: Story = {
  tags: ["screenshot"],
  parameters: {
    screenshot: { enabled: true, id: "statistics-grouped-distribution" },
  },
  args: {
    distribution: createDistribution({
      9: 10,
      8: 14,
      7: 8,
      6: 12,
      5: 20,
      4: 9,
      3: 11,
      2: 8,
      1: 8,
    }),
    groupedStats: {
      highPerformers: { count: 36, percentage: 36.0 },
      middleTier: { count: 37, percentage: 37.0 },
      lowPerformers: { count: 27, percentage: 27.0 },
    },
  },
};

/**
 * Grouping menu open state.
 * Shows the distribution table with grouping selector dropdown expanded.
 * Note: This story shows the base table - actual dropdown requires interaction.
 * Used for documentation screenshot: statistics-grouping-dropdown
 */
export const GroupingMenuOpen: Story = {
  tags: ["screenshot"],
  parameters: {
    screenshot: { enabled: true, id: "statistics-grouping-dropdown" },
  },
  args: {
    distribution: createDistribution({
      9: 12,
      8: 15,
      7: 10,
      6: 14,
      5: 18,
      4: 11,
      3: 13,
      2: 9,
      1: 9,
    }),
    groupedStats: {
      highPerformers: { count: 41, percentage: 36.9 },
      middleTier: { count: 41, percentage: 36.9 },
      lowPerformers: { count: 29, percentage: 26.1 },
    },
  },
};
