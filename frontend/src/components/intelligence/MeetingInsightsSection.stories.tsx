import type { Meta, StoryObj } from "@storybook/react";
import React, { useState } from "react";
import { MeetingInsightsSection } from "./MeetingInsightsSection";
import type { Insight } from "../../types/api";

// Mock insights data covering all priority levels and categories
const mockInsights: Insight[] = [
  {
    id: "ins-1",
    type: "anomaly",
    priority: "high",
    category: "level",
    title: "MT3 driving center box inflation",
    description:
      "MT3 level has 64% in center box vs. 35% expected (p<0.001, z-score 3.2). This represents 45 employees and is statistically significant. Consider deep-dive discussion on MT3 rating patterns to identify whether this reflects genuine performance clustering or rating conservatism.",
    affected_count: 45,
    cluster: "MT3 Level Requires Deep Review",
    cluster_id: "cluster-mt3",
    source_data: {
      z_score: 3.2,
      p_value: 0.001,
      observed_pct: 64.0,
      expected_pct: 35.0,
    },
  },
  {
    id: "ins-2",
    type: "anomaly",
    priority: "medium",
    category: "tenure",
    title: "New hires driving MT3 center box pattern",
    description:
      "New hires (< 1 year) at MT3 are 80% in center box vs. 41% company average (p<0.01). This affects 28 employees. New manager conservatism or insufficient performance data may be contributing factors.",
    affected_count: 28,
    cluster: "MT3 Level Requires Deep Review",
    cluster_id: "cluster-mt3",
    source_data: {
      z_score: 2.8,
      p_value: 0.01,
      observed_pct: 80.0,
      expected_pct: 41.0,
    },
  },
  {
    id: "ins-3",
    type: "recommendation",
    priority: "high",
    category: "distribution",
    title: "Run Donut Mode to increase differentiation",
    description:
      "Current distribution shows 52% in center box, above 45% threshold. Donut Mode exercise can help managers differentiate by forcing relative ranking. Run for 10-15 minutes before level-specific discussions to warm up calibration thinking.",
    affected_count: 0,
    cluster: null,
    cluster_id: null,
    source_data: {
      center_pct: 52.0,
      threshold_pct: 45.0,
    },
  },
  {
    id: "ins-4",
    type: "time_allocation",
    priority: "low",
    category: "time",
    title: "Allocate 45 minutes for MT3 deep dive",
    description:
      "Based on 45 affected employees and complexity of tenure patterns, recommend 45-minute focused discussion. Schedule after IC calibration for context on broader patterns.",
    affected_count: 45,
    cluster: "MT3 Level Requires Deep Review",
    cluster_id: "cluster-mt3",
    source_data: {
      estimated_minutes: 45,
      employee_count: 45,
    },
  },
  {
    id: "ins-5",
    type: "anomaly",
    priority: "high",
    category: "location",
    title: "Remote employees rated lower than office-based",
    description:
      "Remote location shows 45% lower performers vs. 11.5% company average (p<0.001, z-score 4.1). This affects 23 employees and is highly significant. Investigate whether this reflects actual performance differences, rating bias, or insufficient visibility into remote work contributions.",
    affected_count: 23,
    cluster: null,
    cluster_id: null,
    source_data: {
      z_score: 4.1,
      p_value: 0.001,
      observed_pct: 45.0,
      expected_pct: 11.5,
    },
  },
  {
    id: "ins-6",
    type: "focus_area",
    priority: "medium",
    category: "function",
    title: "Engineering function shows center box clustering",
    description:
      "Engineering has 55% in center box vs. 30% recommended maximum. This affects 65 employees. Determine if clustering reflects genuine role similarity or indicates calibration drift requiring intervention.",
    affected_count: 65,
    cluster: null,
    cluster_id: null,
    source_data: {
      center_pct: 55.0,
      recommended_max_pct: 30.0,
    },
  },
  {
    id: "ins-7",
    type: "recommendation",
    priority: "medium",
    category: "level",
    title: "Split MT3 and MT4 into separate calibration sessions",
    description:
      "MT3 has 45 employees with complex patterns while MT4 has only 12. Consider splitting these levels to allow adequate time for MT3 discussion without rushing MT4 calibration. This improves calibration quality for both groups.",
    affected_count: 57,
    cluster: null,
    cluster_id: null,
    source_data: {
      mt3_count: 45,
      mt4_count: 12,
    },
  },
  {
    id: "ins-8",
    type: "focus_area",
    priority: "low",
    category: "tenure",
    title: "Tenured employees show healthy distribution",
    description:
      "Employees with 3+ years tenure demonstrate expected distribution patterns across all performance categories (p=0.68). This represents 112 employees and suggests stable, consistent rating practices for experienced team members.",
    affected_count: 112,
    cluster: null,
    cluster_id: null,
    source_data: {
      p_value: 0.68,
    },
  },
];

// Subset for simpler scenarios
const mockFewInsights: Insight[] = mockInsights.slice(0, 3);

// High priority only
const mockHighPriorityOnly: Insight[] = mockInsights.filter(
  (i) => i.priority === "high"
);

/**
 * Wrapper component to handle state for Storybook
 */
interface MeetingInsightsSectionWrapperProps {
  insights: Insight[];
  defaultExpanded?: boolean;
  defaultSelectedInsights?: Record<string, boolean>;
}

const MeetingInsightsSectionWrapper: React.FC<
  MeetingInsightsSectionWrapperProps
> = ({ insights, defaultExpanded = true, defaultSelectedInsights }) => {
  const [selectedInsights, setSelectedInsights] = useState<
    Record<string, boolean>
  >(
    defaultSelectedInsights ||
      Object.fromEntries(insights.map((i) => [i.id, true]))
  );

  const handleToggleInsight = (insightId: string) => {
    setSelectedInsights((prev) => ({
      ...prev,
      [insightId]: !prev[insightId],
    }));
  };

  const handleSelectAll = () => {
    setSelectedInsights(Object.fromEntries(insights.map((i) => [i.id, true])));
  };

  const handleDeselectAll = () => {
    setSelectedInsights(Object.fromEntries(insights.map((i) => [i.id, false])));
  };

  return (
    <MeetingInsightsSection
      insights={insights}
      selectedInsights={selectedInsights}
      onToggleInsight={handleToggleInsight}
      onSelectAll={handleSelectAll}
      onDeselectAll={handleDeselectAll}
      defaultExpanded={defaultExpanded}
    />
  );
};

/**
 * MeetingInsightsSection - Selectable Calibration Insights Component
 *
 * Displays prioritized, filterable insights for calibration meeting preparation.
 * Users can filter by priority level and select specific insights to include in
 * their meeting agenda or AI summary generation.
 *
 * **Key Features:**
 * - Priority filtering (All, High, Medium, Low) with count badges
 * - Selectable insight cards with checkboxes
 * - Bulk select/deselect actions
 * - Expandable/collapsible section
 * - Cluster grouping visualization
 * - Scrollable insight list (max 400px height)
 *
 * **Use Cases:**
 * - Building calibration meeting agenda
 * - Identifying high-priority discussion topics
 * - Selecting insights for AI summary generation
 * - Reviewing all calibration recommendations at once
 *
 * @screenshots
 *   - calibration-insights-section: Full section with multiple priorities and cluster badges
 *   - insight-cluster-example: Multiple insights with same cluster badge
 */
const meta: Meta<typeof MeetingInsightsSectionWrapper> = {
  title: "Intelligence/CalibrationSummary/MeetingInsightsSection",
  component: MeetingInsightsSectionWrapper,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Displays selectable calibration insights with priority filtering. Users can filter insights by priority level (High/Medium/Low), select specific insights for meeting discussion, and see cluster groupings for related issues. Component includes bulk select/deselect actions and scrollable insight list.",
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 900 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof MeetingInsightsSectionWrapper>;

/**
 * Default view with multiple priorities and cluster badges.
 * This is the primary screenshot story showing the full feature set.
 */
export const WithMultiplePriorities: Story = {
  tags: ["screenshot"],
  parameters: {
    screenshot: {
      enabled: true,
      id: "calibration-insights-section",
    },
    docs: {
      description: {
        story:
          "Full insights section with HIGH (3), MEDIUM (3), and LOW (2) priority insights. Demonstrates priority filtering, cluster badges (MT3 cluster with 3 insights), and mixed selection state. Default filter is 'High' to focus on critical items.",
      },
    },
  },
  args: {
    insights: mockInsights,
    defaultSelectedInsights: {
      "ins-1": true, // High priority MT3
      "ins-2": false, // Medium priority MT3
      "ins-3": true, // High priority Donut Mode
      "ins-4": false, // Low priority time
      "ins-5": true, // High priority Remote
      "ins-6": false, // Medium priority Engineering
      "ins-7": false, // Medium priority split sessions
      "ins-8": false, // Low priority tenured
    },
  },
};

/**
 * Cluster example - multiple insights with same cluster badge.
 * Shows how related insights are grouped visually.
 */
export const ClusterGroupingExample: Story = {
  tags: ["screenshot"],
  parameters: {
    screenshot: {
      enabled: true,
      id: "insight-cluster-example",
    },
    docs: {
      description: {
        story:
          "Demonstrates cluster grouping with 3 insights sharing the 'MT3 Level Requires Deep Review' cluster badge. Shows HIGH, MEDIUM, and LOW priority insights all related to the same root cause.",
      },
    },
  },
  args: {
    insights: mockInsights.filter(
      (i) => i.cluster_id === "cluster-mt3" || i.id === "ins-3"
    ),
  },
};

/**
 * High priority only - focused view for critical items.
 * Common use case: reviewing only urgent calibration issues.
 */
export const HighPriorityOnly: Story = {
  args: {
    insights: mockHighPriorityOnly,
  },
};

/**
 * Few insights - small calibration session or simple dataset.
 */
export const FewInsights: Story = {
  args: {
    insights: mockFewInsights,
  },
};

/**
 * Empty state - no insights match current filter.
 * Shows "No {priority} priority insights found" message.
 */
export const NoInsights: Story = {
  args: {
    insights: [],
  },
};

/**
 * Collapsed state - header only visible.
 * Users can click to expand and see insights.
 */
export const Collapsed: Story = {
  args: {
    insights: mockInsights,
    defaultExpanded: false,
  },
};

/**
 * All insights deselected - shows unchecked state.
 * Useful for starting fresh with insight selection.
 */
export const AllDeselected: Story = {
  args: {
    insights: mockInsights,
    defaultSelectedInsights: Object.fromEntries(
      mockInsights.map((i) => [i.id, false])
    ),
  },
};

/**
 * Mixed priorities with no clusters - simpler insight set.
 */
export const NoClusters: Story = {
  args: {
    insights: mockInsights.filter((i) => !i.cluster_id),
  },
};
