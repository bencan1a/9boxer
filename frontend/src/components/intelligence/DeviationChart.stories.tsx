/**
 * Storybook stories for DeviationChart component
 *
 * Displays expected vs actual percentage of high performers by category
 * with significance indicators (traffic light colors).
 */

import type { Meta, StoryObj } from "@storybook/react";
import { DeviationChart } from "./DeviationChart";
import {
  mockDeviationSmall,
  mockDeviationMedium,
  mockDeviationLarge,
  mockDeviationAllGreen,
  mockDeviationMixed,
  mockDeviationAllRed,
  mockDeviationEmpty,
  mockDeviationSingle,
  mockDeviationLongNames,
} from "../../mocks/mockChartData";

/**
 * DeviationChart shows statistical analysis of performance distribution
 * deviations from expected values across different categories (departments,
 * locations, job levels, etc.).
 *
 * ## Features
 * - Side-by-side bars for expected vs actual percentages
 * - Color-coded significance indicators:
 *   - 🟢 Green: Not significant (p >= 0.05)
 *   - 🟡 Yellow: Moderately significant (0.01 <= p < 0.05)
 *   - 🔴 Red: Highly significant (p < 0.01)
 * - Interactive tooltips with statistical details
 * - Responsive design with automatic text rotation
 * - Empty state handling
 *
 * ## Usage
 * Used in AnomalySection components to visualize statistical anomalies
 * in talent distribution.
 */
const meta = {
  title: "Intelligence/DeviationChart",
  component: DeviationChart,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Displays expected vs actual percentage of high performers with statistical significance indicators.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    data: {
      description: "Array of anomaly deviation data points",
      control: false,
    },
    title: {
      description: "Chart title",
      control: "text",
    },
  },
} satisfies Meta<typeof DeviationChart>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Small dataset with 3-5 categories.
 * Ideal for focused analysis of a few key categories.
 */
export const SmallDataset: Story = {
  args: {
    data: mockDeviationSmall,
    title: "Performance Distribution by Department (Small Sample)",
  },
};

/**
 * Medium dataset with 6-10 categories.
 * Most common use case for department-level analysis.
 */
export const MediumDataset: Story = {
  args: {
    data: mockDeviationMedium,
    title: "Performance Distribution by Department",
  },
};

/**
 * Large dataset with 15+ categories.
 * Tests chart readability with many categories and text wrapping.
 */
export const LargeDataset: Story = {
  args: {
    data: mockDeviationLarge,
    title: "Performance Distribution Across All Departments",
  },
};

/**
 * All non-significant deviations (all green bars).
 * Represents a healthy, well-calibrated distribution with no statistical anomalies.
 */
export const AllNonSignificant: Story = {
  args: {
    data: mockDeviationAllGreen,
    title: "Well-Calibrated Distribution (No Anomalies)",
  },
};

/**
 * Mixed significance levels (green/yellow/red bars).
 * Shows a realistic scenario with varying levels of statistical significance.
 */
export const MixedSignificance: Story = {
  args: {
    data: mockDeviationMixed,
    title: "Performance Distribution with Mixed Anomalies",
  },
};

/**
 * All highly significant deviations (all red bars).
 * Indicates severe calibration issues requiring immediate attention.
 */
export const AllHighlySignificant: Story = {
  args: {
    data: mockDeviationAllRed,
    title: "Severe Distribution Anomalies (Action Required)",
  },
};

/**
 * Empty state when no data is available.
 * Shows graceful handling of empty dataset.
 */
export const EmptyState: Story = {
  args: {
    data: mockDeviationEmpty,
    title: "No Anomalies Detected",
  },
};

/**
 * Single category only.
 * Edge case for isolated analysis of one category.
 */
export const SingleCategory: Story = {
  args: {
    data: mockDeviationSingle,
    title: "Engineering Department Only",
  },
};

/**
 * Long category names to test text wrapping.
 * Ensures labels remain readable with lengthy department/category names.
 */
export const LongCategoryNames: Story = {
  args: {
    data: mockDeviationLongNames,
    title: "Distribution with Long Department Names",
  },
};

/**
 * Dark mode variant with mixed significance.
 * Demonstrates chart appearance in dark theme.
 */
export const DarkMode: Story = {
  args: {
    data: mockDeviationMixed,
    title: "Performance Distribution (Dark Mode)",
  },
  parameters: {
    backgrounds: { default: "dark" },
  },
  globals: {
    theme: "dark",
  },
};

/**
 * Interactive story with controls.
 * Allows customization of title and data selection.
 */
export const Interactive: Story = {
  args: {
    data: mockDeviationMedium,
    title: "Customize This Chart",
  },
  argTypes: {
    title: {
      control: "text",
      description: "Chart title",
    },
  },
};
