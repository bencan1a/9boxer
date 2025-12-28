/**
 * Storybook stories for LevelDistributionChart component
 *
 * Displays stacked bar chart of performance distribution (Low/Medium/High)
 * across job levels with baseline comparison.
 */

import type { Meta, StoryObj } from "@storybook/react";
import { LevelDistributionChart } from "./LevelDistributionChart";
import {
  mockLevelDistributionNormal,
  mockLevelDistributionHighSkew,
  mockLevelDistributionLowSkew,
  mockLevelDistributionFew,
  mockLevelDistributionMany,
  mockLevelDistributionEmpty,
  mockLevelDistributionSingle,
  mockLevelDistributionSmallSamples,
  mockLevelDistributionLowBaseline,
  mockLevelDistributionHighBaseline,
  mockLevelDistributionLongNames,
} from "../../mocks/mockChartData";

/**
 * LevelDistributionChart shows the distribution of performance ratings
 * (Low/Medium/High) across job levels as a 100% stacked bar chart.
 *
 * ## Features
 * - 100% stacked bars showing performance distribution
 * - Traffic light color system:
 *   - 🔴 Red: Low performers
 *   - 🟡 Yellow: Medium performers
 *   - 🟢 Green: High performers
 * - Baseline reference line (default: 25% high performers)
 * - Interactive tooltips with counts and percentages
 * - Responsive design with automatic text rotation
 * - Empty state handling
 *
 * ## Usage
 * Used in AnomalySection components to visualize whether certain job levels
 * have disproportionate distributions of high or low performers.
 */
const meta = {
  title: "Intelligence/LevelDistributionChart",
  component: LevelDistributionChart,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Displays stacked bar chart of performance distribution across job levels with configurable baseline.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    data: {
      description: "Array of level distribution data points",
      control: false,
    },
    title: {
      description: "Chart title",
      control: "text",
    },
    baselineHighPct: {
      description: "Expected percentage of high performers (baseline)",
      control: { type: "range", min: 5, max: 50, step: 5 },
    },
  },
} satisfies Meta<typeof LevelDistributionChart>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Normal distribution (balanced Low/Med/High).
 * Shows a healthy, balanced distribution across job levels.
 */
export const NormalDistribution: Story = {
  args: {
    data: mockLevelDistributionNormal,
    title: "Performance Distribution by Job Level",
    baselineHighPct: 25,
  },
};

/**
 * Skewed toward high performers.
 * Indicates potential leniency bias or strong talent pool.
 */
export const SkewedTowardHighPerformers: Story = {
  args: {
    data: mockLevelDistributionHighSkew,
    title: "High-Performer Skewed Distribution",
    baselineHighPct: 25,
  },
};

/**
 * Skewed toward low performers.
 * Indicates potential performance issues or harsh calibration.
 */
export const SkewedTowardLowPerformers: Story = {
  args: {
    data: mockLevelDistributionLowSkew,
    title: "Low-Performer Skewed Distribution",
    baselineHighPct: 25,
  },
};

/**
 * Few levels (3-4).
 * Simplified job leveling structure.
 */
export const FewLevels: Story = {
  args: {
    data: mockLevelDistributionFew,
    title: "Performance Distribution (Simplified Levels)",
    baselineHighPct: 25,
  },
};

/**
 * Many levels (10-12).
 * Complex job leveling structure with detailed gradations.
 */
export const ManyLevels: Story = {
  args: {
    data: mockLevelDistributionMany,
    title: "Performance Distribution (Detailed Levels)",
    baselineHighPct: 25,
  },
};

/**
 * Empty state when no data is available.
 * Shows graceful handling of empty dataset.
 */
export const EmptyState: Story = {
  args: {
    data: mockLevelDistributionEmpty,
    title: "No Level Distribution Data",
    baselineHighPct: 25,
  },
};

/**
 * Single level only.
 * Edge case for isolated analysis of one job level.
 */
export const SingleLevel: Story = {
  args: {
    data: mockLevelDistributionSingle,
    title: "MT3 Level Only",
    baselineHighPct: 25,
  },
};

/**
 * Very small sample sizes.
 * Shows behavior with minimal data per level (1-3 employees each).
 */
export const SmallSampleSizes: Story = {
  args: {
    data: mockLevelDistributionSmallSamples,
    title: "Distribution with Small Sample Sizes",
    baselineHighPct: 25,
  },
};

/**
 * Low baseline percentage (15%).
 * Used for conservative calibration targets.
 */
export const LowBaseline: Story = {
  args: {
    data: mockLevelDistributionLowBaseline,
    title: "Performance Distribution (15% Target)",
    baselineHighPct: 15,
  },
};

/**
 * High baseline percentage (40%).
 * Used for aggressive high-performer identification.
 */
export const HighBaseline: Story = {
  args: {
    data: mockLevelDistributionHighBaseline,
    title: "Performance Distribution (40% Target)",
    baselineHighPct: 40,
  },
};

/**
 * Long level names to test text wrapping.
 * Ensures labels remain readable with lengthy job titles.
 */
export const LongLevelNames: Story = {
  args: {
    data: mockLevelDistributionLongNames,
    title: "Distribution with Long Job Level Names",
    baselineHighPct: 25,
  },
};

/**
 * Dark mode variant with normal distribution.
 * Demonstrates chart appearance in dark theme.
 */
export const DarkMode: Story = {
  args: {
    data: mockLevelDistributionNormal,
    title: "Performance Distribution (Dark Mode)",
    baselineHighPct: 25,
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
 * Allows customization of title and baseline percentage.
 */
export const Interactive: Story = {
  args: {
    data: mockLevelDistributionNormal,
    title: "Customize This Chart",
    baselineHighPct: 25,
  },
  argTypes: {
    title: {
      control: "text",
      description: "Chart title",
    },
    baselineHighPct: {
      control: { type: "range", min: 5, max: 50, step: 5 },
      description: "Expected % of high performers",
    },
  },
};
