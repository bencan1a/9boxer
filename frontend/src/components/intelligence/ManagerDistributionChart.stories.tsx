/**
 * Storybook stories for ManagerDistributionChart component
 *
 * Displays manager rating distributions as 100% stacked horizontal bar chart
 * with baseline reference markers at 20% High / 70% Medium / 10% Low.
 */

import type { Meta, StoryObj } from "@storybook/react";
import { ManagerDistributionChart } from "./ManagerDistributionChart";
import {
  mockManagerDeviationSmall,
  mockManagerDeviationMedium,
  mockManagerDeviationLarge,
  mockManagerDeviationAllGood,
  mockManagerDeviationMixed,
  mockManagerDeviationAllBad,
  mockManagerDeviationEmpty,
  mockManagerDeviationSingle,
  mockManagerDeviationLongNames,
} from "../../mocks/mockChartData";

/**
 * ManagerDistributionChart shows rating distribution analysis for managers
 * to detect anomalous patterns compared to the expected 20/70/10 baseline.
 *
 * ## Features
 * - 100% stacked horizontal bar chart (Low/Medium/High)
 * - Color-coded performance levels:
 *   - 🔴 Red: Low performers
 *   - 🟡 Yellow: Medium performers
 *   - 🟢 Green: High performers
 * - Baseline reference markers (20% High, 90% cumulative)
 * - Opacity indicators for statistical significance
 * - Interactive tooltips with team size and deviations
 * - Responsive design with automatic sizing
 * - Empty state handling
 *
 * ## Usage
 * Used in Intelligence Tab to visualize manager rating bias patterns.
 */
const meta = {
  title: "App/Right Panel/Intelligence/ManagerDistributionChart",
  component: ManagerDistributionChart,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Displays manager rating distributions as 100% stacked horizontal bars with baseline reference at 20/70/10.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    data: {
      description: "Array of manager deviation data points",
      control: false,
    },
    title: {
      description: "Chart title",
      control: "text",
    },
  },
} satisfies Meta<typeof ManagerDistributionChart>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Small dataset with 3 managers.
 * Ideal for focused analysis of a few managers.
 */
export const SmallDataset: Story = {
  args: {
    data: mockManagerDeviationSmall,
    title: "Manager Rating Distribution (Small Sample)",
  },
};

/**
 * Medium dataset with 6 managers.
 * Most common use case for typical organization analysis.
 */
export const MediumDataset: Story = {
  args: {
    data: mockManagerDeviationMedium,
    title: "Manager Rating Distribution",
  },
};

/**
 * Large dataset with 10 managers.
 * Tests chart readability and scrolling with many managers.
 */
export const LargeDataset: Story = {
  args: {
    data: mockManagerDeviationLarge,
    title: "Top 10 Most Anomalous Managers",
  },
};

/**
 * All managers well-calibrated (close to 20/70/10 baseline).
 * Represents healthy calibration with no significant anomalies.
 */
export const AllWellCalibrated: Story = {
  args: {
    data: mockManagerDeviationAllGood,
    title: "Well-Calibrated Managers (No Anomalies)",
  },
};

/**
 * Mixed significance levels (some significant, some not).
 * Shows a realistic scenario with varying levels of bias.
 */
export const MixedSignificance: Story = {
  tags: ["screenshot"],
  parameters: {
    screenshot: {
      enabled: true,
      id: "intelligence-manager-distribution-chart",
    },
  },
  args: {
    data: mockManagerDeviationMixed,
    title: "Manager Distribution with Mixed Anomalies",
  },
};

/**
 * All highly anomalous managers.
 * Indicates severe calibration issues requiring immediate attention.
 */
export const AllAnomalous: Story = {
  args: {
    data: mockManagerDeviationAllBad,
    title: "Severe Manager Bias Detected (Action Required)",
  },
};

/**
 * Empty state when no data is available.
 * Shows graceful handling of empty dataset.
 */
export const EmptyState: Story = {
  args: {
    data: mockManagerDeviationEmpty,
    title: "No Manager Anomalies Detected",
  },
};

/**
 * Single manager only.
 * Edge case for isolated analysis of one manager.
 */
export const SingleManager: Story = {
  args: {
    data: mockManagerDeviationSingle,
    title: "Engineering Manager Only",
  },
};

/**
 * Long manager names to test text wrapping.
 * Ensures labels remain readable with lengthy manager names.
 */
export const LongManagerNames: Story = {
  args: {
    data: mockManagerDeviationLongNames,
    title: "Distribution with Long Manager Names",
  },
};

/**
 * Dark mode variant with mixed significance.
 * Demonstrates chart appearance in dark theme.
 */
export const DarkMode: Story = {
  args: {
    data: mockManagerDeviationMixed,
    title: "Manager Rating Distribution (Dark Mode)",
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
    data: mockManagerDeviationMedium,
    title: "Customize This Chart",
  },
  argTypes: {
    title: {
      control: "text",
      description: "Chart title",
    },
  },
};
