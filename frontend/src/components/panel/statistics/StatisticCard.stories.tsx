import type { Meta, StoryObj } from "@storybook/react-vite";
import { StatisticCard } from "./StatisticCard";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import PeopleIcon from "@mui/icons-material/People";
import EditIcon from "@mui/icons-material/Edit";

/**
 * StatisticCard displays a single metric with value, label, and semantic color.
 *
 * **Key Features:**
 * - Semantic color coding (primary, warning, success, error, info)
 * - Optional icon display
 * - Number formatting with commas
 * - Two variants: outlined (border) or elevation (shadow)
 * - Responsive and accessible
 *
 * **Use Cases:**
 * - Dashboard summary cards
 * - Statistics panels
 * - Key metric displays
 * - KPI visualizations
 */
const meta: Meta<typeof StatisticCard> = {
  title: "Panel/Statistics/StatisticCard",
  component: StatisticCard,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  decorators: [
    (Story) => (
      <div style={{ width: 300 }}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    value: {
      description: "The numeric or string value to display",
      control: "number",
    },
    label: {
      description: "The descriptive label for this statistic",
      control: "text",
    },
    color: {
      description: "Semantic color from theme palette",
      control: "select",
      options: ["primary", "warning", "success", "error", "info"],
    },
    variant: {
      description: "Card style variant",
      control: "radio",
      options: ["outlined", "elevation"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof StatisticCard>;

/**
 * Default card with primary color.
 * Standard appearance for general metrics.
 */
export const Default: Story = {
  args: {
    value: 125,
    label: "Total Employees",
    color: "primary",
  },
};

/**
 * Warning color variant.
 * Used for metrics requiring attention (e.g., modified employees, pending reviews).
 */
export const WithWarningColor: Story = {
  args: {
    value: 23,
    label: "Modified This Session",
    color: "warning",
  },
};

/**
 * Success color variant.
 * Used for positive metrics (e.g., high performers, completed tasks).
 */
export const WithSuccessColor: Story = {
  args: {
    value: 42,
    label: "High Performers",
    color: "success",
  },
};

/**
 * Card with icon above value.
 * Adds visual interest and quick recognition.
 */
export const WithIcon: Story = {
  args: {
    value: 125,
    label: "Total Employees",
    color: "primary",
    icon: <PeopleIcon sx={{ fontSize: 32 }} />,
  },
};

/**
 * Elevated variant with shadow.
 * Alternative to outlined border for visual hierarchy.
 */
export const ElevatedVariant: Story = {
  args: {
    value: 89,
    label: "Active Employees",
    color: "info",
    variant: "elevation",
  },
};

/**
 * Large number with comma formatting.
 * Tests number formatting for readability (1,234 instead of 1234).
 */
export const LargeNumber: Story = {
  args: {
    value: 1234,
    label: "Total Evaluations",
    color: "primary",
  },
};

/**
 * Multiple cards in a row.
 * Shows how cards look when placed side-by-side in a grid.
 */
export const MultipleCards: Story = {
  decorators: [
    (_Story) => (
      <div style={{ display: "flex", gap: 16, width: "100%" }}>
        <div style={{ flex: 1 }}>
          <StatisticCard
            value={125}
            label="Total Employees"
            color="primary"
            icon={<PeopleIcon sx={{ fontSize: 32 }} />}
          />
        </div>
        <div style={{ flex: 1 }}>
          <StatisticCard
            value={23}
            label="Modified"
            color="warning"
            icon={<EditIcon sx={{ fontSize: 32 }} />}
          />
        </div>
        <div style={{ flex: 1 }}>
          <StatisticCard
            value={42}
            label="High Performers"
            color="success"
            icon={<TrendingUpIcon sx={{ fontSize: 32 }} />}
          />
        </div>
      </div>
    ),
  ],
  args: {
    value: 125,
    label: "Total Employees",
    color: "primary",
  },
};

/**
 * Zero value state.
 * Tests appearance when metric value is zero.
 */
export const ZeroValue: Story = {
  args: {
    value: 0,
    label: "Modified Employees",
    color: "warning",
  },
};

/**
 * String value instead of number.
 * Supports non-numeric values (e.g., "N/A", "Loading...").
 */
export const StringValue: Story = {
  args: {
    value: "N/A",
    label: "Pending Analysis",
    color: "info",
  },
};
