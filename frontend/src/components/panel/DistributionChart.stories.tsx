import type { Meta, StoryObj } from "@storybook/react-vite";
import { DistributionChart } from "./DistributionChart";

/**
 * DistributionChart displays a bar chart showing employee distribution across the 9-box grid positions.
 * Used in the Statistics tab of the right panel.
 *
 * **Key Features:**
 * - Responsive bar chart using Recharts
 * - Color intensity based on employee count (darker = more employees)
 * - Sorted by grid position (9 → 1)
 * - Angled x-axis labels for readability
 * - Tooltip showing count details
 * - Empty state when no data available
 *
 * **Data Format:**
 * Each PositionDistribution object contains:
 * - grid_position: 1-9
 * - count: number of employees
 * - percentage: percentage of total
 * - position_label: human-readable label (e.g., "9 - Star Performer")
 */
const meta: Meta<typeof DistributionChart> = {
  title: "App/Right Panel/Statistics/DistributionChart",
  component: DistributionChart,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  decorators: [
    (Story) => (
      <div style={{ width: 600, height: 400 }}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    data: {
      description: "Array of position distribution data with counts and labels",
    },
  },
};

export default meta;
type Story = StoryObj<typeof DistributionChart>;

/**
 * Balanced distribution across all positions.
 * Shows relatively even spread of employees with slight variations.
 * Represents a well-calibrated talent pool.
 */
export const BalancedDistribution: Story = {
  args: {
    data: [
      {
        grid_position: 9,
        count: 12,
        percentage: 10.8,
        position_label: "9 - Star Performer",
      },
      {
        grid_position: 8,
        count: 15,
        percentage: 13.5,
        position_label: "8 - High Performer",
      },
      {
        grid_position: 7,
        count: 10,
        percentage: 9.0,
        position_label: "7 - High Potential",
      },
      {
        grid_position: 6,
        count: 14,
        percentage: 12.6,
        position_label: "6 - Strong Contributor",
      },
      {
        grid_position: 5,
        count: 18,
        percentage: 16.2,
        position_label: "5 - Solid Performer",
      },
      {
        grid_position: 4,
        count: 11,
        percentage: 9.9,
        position_label: "4 - Development Needed",
      },
      {
        grid_position: 3,
        count: 13,
        percentage: 11.7,
        position_label: "3 - Inconsistent",
      },
      {
        grid_position: 2,
        count: 9,
        percentage: 8.1,
        position_label: "2 - Under Performer",
      },
      {
        grid_position: 1,
        count: 9,
        percentage: 8.1,
        position_label: "1 - Needs Attention",
      },
    ],
  },
};

/**
 * Skewed distribution with most employees in one position.
 * Shows a concentration of employees at position 5 (Solid Performer).
 * Might indicate conservative rating practices or true performance clustering.
 */
export const SkewedDistribution: Story = {
  args: {
    data: [
      {
        grid_position: 9,
        count: 3,
        percentage: 5.0,
        position_label: "9 - Star Performer",
      },
      {
        grid_position: 8,
        count: 5,
        percentage: 8.3,
        position_label: "8 - High Performer",
      },
      {
        grid_position: 7,
        count: 2,
        percentage: 3.3,
        position_label: "7 - High Potential",
      },
      {
        grid_position: 6,
        count: 7,
        percentage: 11.7,
        position_label: "6 - Strong Contributor",
      },
      {
        grid_position: 5,
        count: 35,
        percentage: 58.3,
        position_label: "5 - Solid Performer",
      },
      {
        grid_position: 4,
        count: 3,
        percentage: 5.0,
        position_label: "4 - Development Needed",
      },
      {
        grid_position: 3,
        count: 2,
        percentage: 3.3,
        position_label: "3 - Inconsistent",
      },
      {
        grid_position: 2,
        count: 2,
        percentage: 3.3,
        position_label: "2 - Under Performer",
      },
      {
        grid_position: 1,
        count: 1,
        percentage: 1.7,
        position_label: "1 - Needs Attention",
      },
    ],
  },
};

/**
 * Empty data state.
 * Shows message when no distribution data is available.
 * Typically occurs when no session is active or no employees loaded.
 */
export const EmptyData: Story = {
  args: {
    data: [],
  },
};

/**
 * High performer heavy distribution.
 * Shows organization with many employees in top positions (6, 8, 9).
 * Might indicate grade inflation or exceptionally strong team.
 */
export const HighPerformerHeavy: Story = {
  args: {
    data: [
      {
        grid_position: 9,
        count: 25,
        percentage: 25.0,
        position_label: "9 - Star Performer",
      },
      {
        grid_position: 8,
        count: 30,
        percentage: 30.0,
        position_label: "8 - High Performer",
      },
      {
        grid_position: 7,
        count: 8,
        percentage: 8.0,
        position_label: "7 - High Potential",
      },
      {
        grid_position: 6,
        count: 20,
        percentage: 20.0,
        position_label: "6 - Strong Contributor",
      },
      {
        grid_position: 5,
        count: 10,
        percentage: 10.0,
        position_label: "5 - Solid Performer",
      },
      {
        grid_position: 4,
        count: 3,
        percentage: 3.0,
        position_label: "4 - Development Needed",
      },
      {
        grid_position: 3,
        count: 2,
        percentage: 2.0,
        position_label: "3 - Inconsistent",
      },
      {
        grid_position: 2,
        count: 1,
        percentage: 1.0,
        position_label: "2 - Under Performer",
      },
      {
        grid_position: 1,
        count: 1,
        percentage: 1.0,
        position_label: "1 - Needs Attention",
      },
    ],
  },
};

/**
 * Small dataset distribution.
 * Shows distribution for a small team (20 employees).
 * Tests chart appearance with lower counts.
 */
export const SmallDataset: Story = {
  args: {
    data: [
      {
        grid_position: 9,
        count: 2,
        percentage: 10.0,
        position_label: "9 - Star Performer",
      },
      {
        grid_position: 8,
        count: 3,
        percentage: 15.0,
        position_label: "8 - High Performer",
      },
      {
        grid_position: 7,
        count: 1,
        percentage: 5.0,
        position_label: "7 - High Potential",
      },
      {
        grid_position: 6,
        count: 4,
        percentage: 20.0,
        position_label: "6 - Strong Contributor",
      },
      {
        grid_position: 5,
        count: 5,
        percentage: 25.0,
        position_label: "5 - Solid Performer",
      },
      {
        grid_position: 4,
        count: 2,
        percentage: 10.0,
        position_label: "4 - Development Needed",
      },
      {
        grid_position: 3,
        count: 1,
        percentage: 5.0,
        position_label: "3 - Inconsistent",
      },
      {
        grid_position: 2,
        count: 1,
        percentage: 5.0,
        position_label: "2 - Under Performer",
      },
      {
        grid_position: 1,
        count: 1,
        percentage: 5.0,
        position_label: "1 - Needs Attention",
      },
    ],
  },
};

/**
 * Sparse distribution with some empty positions.
 * Shows what happens when certain positions have zero employees.
 * Tests zero-count styling (different background color).
 */
export const SparseDistribution: Story = {
  args: {
    data: [
      {
        grid_position: 9,
        count: 8,
        percentage: 18.2,
        position_label: "9 - Star Performer",
      },
      {
        grid_position: 8,
        count: 12,
        percentage: 27.3,
        position_label: "8 - High Performer",
      },
      {
        grid_position: 7,
        count: 0,
        percentage: 0,
        position_label: "7 - High Potential",
      },
      {
        grid_position: 6,
        count: 10,
        percentage: 22.7,
        position_label: "6 - Strong Contributor",
      },
      {
        grid_position: 5,
        count: 14,
        percentage: 31.8,
        position_label: "5 - Solid Performer",
      },
      {
        grid_position: 4,
        count: 0,
        percentage: 0,
        position_label: "4 - Development Needed",
      },
      {
        grid_position: 3,
        count: 0,
        percentage: 0,
        position_label: "3 - Inconsistent",
      },
      {
        grid_position: 2,
        count: 0,
        percentage: 0,
        position_label: "2 - Under Performer",
      },
      {
        grid_position: 1,
        count: 0,
        percentage: 0,
        position_label: "1 - Needs Attention",
      },
    ],
  },
};
