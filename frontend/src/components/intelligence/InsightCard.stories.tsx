import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { InsightCard } from "./InsightCard";
import type { Insight } from "../../types/api";

/**
 * InsightCard - Calibration Meeting Insight Card
 *
 * Displays a selectable insight card used in the Calibration Summary section.
 * Each card shows priority, category, title, description, and affected count.
 * Users can select/deselect insights to include in AI-generated summaries.
 */
const meta: Meta<typeof InsightCard> = {
  title: "Intelligence/CalibrationSummary/InsightCard",
  component: InsightCard,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "A selectable insight card for calibration meeting preparation. Shows priority level, category icon, title, description, and affected employee count. Part of the Calibration Summary feature.",
      },
    },
  },
  argTypes: {
    insight: {
      description: "The insight data to display",
    },
    selected: {
      control: "boolean",
      description: "Whether the insight is currently selected",
    },
    onToggle: {
      description: "Callback when selection is toggled",
      action: "toggled",
    },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 500 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof InsightCard>;

// Mock insights for different scenarios
const mockHighPriorityInsight: Insight = {
  id: "anomaly-location-abc12345",
  type: "anomaly",
  category: "location",
  priority: "high",
  title: "New York office has 45% lower performers",
  description:
    "Statistical anomaly detected: New York location shows significantly higher concentration of lower performers compared to company average.",
  affected_count: 23,
  source_data: {
    z_score: 3.2,
    p_value: 0.001,
    observed_pct: 45.0,
    expected_pct: 11.5,
  },
};

const mockMediumPriorityInsight: Insight = {
  id: "focus_area-function-def67890",
  type: "focus_area",
  category: "function",
  priority: "medium",
  title: "Engineering team distribution skewed",
  description:
    "Engineering function shows unusual clustering in center box positions, suggesting potential calibration bias.",
  affected_count: 45,
  source_data: {
    center_count: 45,
    center_pct: 55.0,
    recommended_max_pct: 30.0,
  },
};

const mockLowPriorityInsight: Insight = {
  id: "recommendation-level-ghi11111",
  type: "recommendation",
  category: "level",
  priority: "low",
  title: "Senior levels well calibrated",
  description:
    "Director and VP levels show healthy distribution across all performance categories.",
  affected_count: 12,
  source_data: {
    p_value: 0.42,
  },
};

const mockTimeAllocationInsight: Insight = {
  id: "time_allocation-time-jkl22222",
  type: "time_allocation",
  category: "time",
  priority: "medium",
  title: "Allocate extra time for tenure discussion",
  description:
    "Employees with 5+ years tenure show mixed performance patterns requiring detailed review.",
  affected_count: 34,
  source_data: {
    total_minutes: 25,
    by_level: { "5+ years": 15, "3-5 years": 10 },
  },
};

const mockDistributionInsight: Insight = {
  id: "anomaly-distribution-mno33333",
  type: "anomaly",
  category: "distribution",
  priority: "high",
  title: "Center box overcrowded at 42%",
  description:
    "Core Talent position has 42% of employees, significantly above the recommended 25-30% range.",
  affected_count: 84,
  source_data: {
    center_count: 84,
    center_pct: 42.0,
    recommended_max_pct: 30.0,
  },
};

const mockTenureInsight: Insight = {
  id: "focus_area-tenure-pqr44444",
  type: "focus_area",
  category: "tenure",
  priority: "low",
  title: "New hires performing well",
  description:
    "Employees with less than 1 year tenure are evenly distributed across performance levels.",
  affected_count: 18,
  source_data: {
    p_value: 0.65,
  },
};

const mockHighPriorityWithCluster: Insight = {
  id: "anomaly-level-cluster-xyz",
  type: "anomaly",
  category: "level",
  priority: "high",
  title: "MT3 driving center box inflation",
  description:
    "MT3 level has 64% in center box vs. 35% expected (p<0.001, z-score 3.2). This represents 45 employees and is statistically significant. Consider deep-dive discussion on MT3 rating patterns to identify whether this reflects genuine performance clustering or rating conservatism.",
  affected_count: 45,
  cluster_id: "cluster-mt3",
  cluster_title: "MT3 Level Requires Deep Review",
  source_data: {
    z_score: 3.2,
    p_value: 0.001,
    observed_pct: 64.0,
    expected_pct: 35.0,
  },
};

// Stories
export const HighPrioritySelected: Story = {
  args: {
    insight: mockHighPriorityInsight,
    selected: true,
    onToggle: fn(),
  },
};

export const HighPriorityUnselected: Story = {
  args: {
    insight: mockHighPriorityInsight,
    selected: false,
    onToggle: fn(),
  },
};

export const MediumPriority: Story = {
  args: {
    insight: mockMediumPriorityInsight,
    selected: true,
    onToggle: fn(),
  },
};

export const LowPriority: Story = {
  args: {
    insight: mockLowPriorityInsight,
    selected: true,
    onToggle: fn(),
  },
};

export const TimeAllocationCategory: Story = {
  args: {
    insight: mockTimeAllocationInsight,
    selected: true,
    onToggle: fn(),
  },
};

export const DistributionCategory: Story = {
  args: {
    insight: mockDistributionInsight,
    selected: true,
    onToggle: fn(),
  },
};

export const TenureCategory: Story = {
  args: {
    insight: mockTenureInsight,
    selected: true,
    onToggle: fn(),
  },
};

/**
 * High priority insight with cluster badge - for screenshot documentation.
 * Demonstrates complete insight card with all elements visible.
 */
export const WithClusterBadge: Story = {
  tags: ["screenshot"],
  parameters: {
    screenshot: {
      enabled: true,
      id: "insight-card-detail",
    },
    docs: {
      description: {
        story:
          "Insight card showing all elements: HIGH priority badge (red), level category icon (groups), cluster badge, title, description, and affected employee count. This is the primary screenshot for documentation.",
      },
    },
  },
  args: {
    insight: mockHighPriorityWithCluster,
    selected: true,
    onToggle: fn(),
  },
};

/**
 * Shows multiple insight cards in a list to demonstrate the full UI pattern
 */
export const InsightList: Story = {
  render: () => (
    <div>
      <InsightCard
        insight={mockHighPriorityInsight}
        selected={true}
        onToggle={fn()}
      />
      <InsightCard
        insight={mockMediumPriorityInsight}
        selected={true}
        onToggle={fn()}
      />
      <InsightCard
        insight={mockLowPriorityInsight}
        selected={false}
        onToggle={fn()}
      />
      <InsightCard
        insight={mockTimeAllocationInsight}
        selected={true}
        onToggle={fn()}
      />
    </div>
  ),
};
