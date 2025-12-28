import type { Meta, StoryObj } from "@storybook/react-vite";
import { StatisticsSummary } from "./StatisticsSummary";

/**
 * StatisticsSummary displays three key metrics in a responsive grid layout.
 *
 * **Key Features:**
 * - Responsive grid (3 columns → 1 column on mobile)
 * - Icon-enhanced cards for visual recognition
 * - Semantic color coding (primary, warning, success)
 * - i18n translated labels
 * - Number formatting with commas
 *
 * **Metrics Shown:**
 * 1. Total Employees (primary, blue)
 * 2. Modified Employees (warning, orange)
 * 3. High Performers (success, green)
 *
 * **Use Cases:**
 * - Statistics tab summary section
 * - Dashboard overview panels
 * - Session summary displays
 */
const meta: Meta<typeof StatisticsSummary> = {
  title: "Panel/Statistics/StatisticsSummary",
  component: StatisticsSummary,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  argTypes: {
    totalEmployees: {
      description: "Total number of employees in current view",
      control: { type: "number", min: 0 },
    },
    modifiedEmployees: {
      description: "Number of employees modified in current session",
      control: { type: "number", min: 0 },
    },
    highPerformers: {
      description: "Number of high performers (positions 6, 8, 9)",
      control: { type: "number", min: 0 },
    },
  },
};

export default meta;
type Story = StoryObj<typeof StatisticsSummary>;

/**
 * Default summary with typical values.
 * Shows a realistic distribution of employees.
 */
export const Default: Story = {
  args: {
    totalEmployees: 125,
    modifiedEmployees: 23,
    highPerformers: 42,
  },
};

/**
 * All zero values.
 * Empty state when no employees or session just started.
 */
export const AllZero: Story = {
  args: {
    totalEmployees: 0,
    modifiedEmployees: 0,
    highPerformers: 0,
  },
};

/**
 * Large numbers with comma formatting.
 * Tests number formatting for enterprise-scale datasets.
 */
export const LargeNumbers: Story = {
  args: {
    totalEmployees: 1234,
    modifiedEmployees: 567,
    highPerformers: 890,
  },
};

/**
 * Small dataset.
 * Shows appearance for small teams.
 */
export const SmallDataset: Story = {
  args: {
    totalEmployees: 20,
    modifiedEmployees: 3,
    highPerformers: 8,
  },
};

/**
 * No modifications yet.
 * Typical state when session just opened.
 */
export const NoModifications: Story = {
  args: {
    totalEmployees: 125,
    modifiedEmployees: 0,
    highPerformers: 42,
  },
};

/**
 * All employees are high performers.
 * Edge case showing maximum high performer percentage.
 */
export const AllHighPerformers: Story = {
  args: {
    totalEmployees: 50,
    modifiedEmployees: 5,
    highPerformers: 50,
  },
};

/**
 * Responsive behavior demonstration.
 * Shows how cards stack on mobile viewports.
 */
export const Responsive: Story = {
  parameters: {
    viewport: {
      defaultViewport: "mobile1",
    },
  },
  args: {
    totalEmployees: 125,
    modifiedEmployees: 23,
    highPerformers: 42,
  },
};
