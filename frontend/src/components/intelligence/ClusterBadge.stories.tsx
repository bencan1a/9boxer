import type { Meta, StoryObj } from "@storybook/react";
import { ClusterBadge } from "./ClusterBadge";

/**
 * ClusterBadge - Cluster Grouping Indicator Component
 *
 * Small chip component that displays cluster membership for insights.
 * Shows a link icon and cluster title to indicate that multiple insights
 * are related under a common theme or root cause.
 *
 * **Key Features:**
 * - Link icon to indicate grouping
 * - Primary color theming
 * - Small size optimized for inline display
 * - Hover tooltip showing full cluster title
 *
 * **Use Cases:**
 * - Grouping related insights (e.g., "MT3 Level Requires Deep Review")
 * - Indicating shared root causes across multiple findings
 * - Helping users identify patterns in calibration issues
 */
const meta: Meta<typeof ClusterBadge> = {
  title: "Intelligence/CalibrationSummary/ClusterBadge",
  component: ClusterBadge,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Displays cluster membership badge for insights. Used to group related insights under a common theme (e.g., 'MT3 Level Requires Deep Review'). Shows link icon and cluster title in a compact chip format with primary color styling.",
      },
    },
  },
  argTypes: {
    clusterId: {
      control: "text",
      description: "Unique identifier for the cluster (internal use)",
    },
    clusterTitle: {
      control: "text",
      description:
        "Human-readable cluster title displayed in the badge (e.g., 'MT3 Level Requires Deep Review')",
    },
  },
};

export default meta;
type Story = StoryObj<typeof ClusterBadge>;

/**
 * Default cluster badge with standard title.
 * Most common use case showing level-based grouping.
 */
export const Default: Story = {
  args: {
    clusterId: "cluster-mt3",
    clusterTitle: "MT3 Level Requires Deep Review",
  },
};

/**
 * Long title that tests text wrapping and truncation.
 * Ensures badge handles lengthy cluster names gracefully.
 */
export const LongTitle: Story = {
  args: {
    clusterId: "cluster-long",
    clusterTitle:
      "New Hire Performance Assessment Timeline and Expectations Review Process",
  },
};

/**
 * Short title - minimal text case.
 */
export const ShortTitle: Story = {
  args: {
    clusterId: "cluster-eng",
    clusterTitle: "Engineering Focus",
  },
};

/**
 * Location-based cluster example.
 */
export const LocationCluster: Story = {
  args: {
    clusterId: "cluster-remote",
    clusterTitle: "Remote Employee Assessment Patterns",
  },
};

/**
 * Function-based cluster example.
 */
export const FunctionCluster: Story = {
  args: {
    clusterId: "cluster-sales",
    clusterTitle: "Sales Team Calibration Consistency",
  },
};

/**
 * Distribution-based cluster example.
 */
export const DistributionCluster: Story = {
  args: {
    clusterId: "cluster-centerbox",
    clusterTitle: "Center Box Inflation Factors",
  },
};

/**
 * Multiple badges in a row - shows how they appear together.
 */
export const MultipleBadges: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      <ClusterBadge
        clusterId="cluster-mt3"
        clusterTitle="MT3 Level Requires Deep Review"
      />
      <ClusterBadge
        clusterId="cluster-remote"
        clusterTitle="Remote Employee Patterns"
      />
      <ClusterBadge clusterId="cluster-eng" clusterTitle="Engineering Focus" />
    </div>
  ),
};
