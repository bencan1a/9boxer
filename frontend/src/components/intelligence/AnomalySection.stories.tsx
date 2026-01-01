/**
 * Storybook stories for AnomalySection component
 *
 * This file contains comprehensive stories covering all statistical scenarios:
 * - Green, yellow, and red status levels
 * - Embedded DeviationChart and LevelDistributionChart
 * - Collapsible details table interactions
 * - Various sample sizes and edge cases
 */

import type { Meta, StoryObj } from "@storybook/react";
import { AnomalySection } from "./AnomalySection";
import { DeviationChart } from "./DeviationChart";
import { LevelDistributionChart } from "./LevelDistributionChart";
import {
  mockGreenAnalysis,
  mockYellowAnalysis,
  mockRedAnalysis,
  mockSmallSampleAnalysis,
  mockLargeSampleAnalysis,
  mockAllNonSignificant,
  mockMixedSignificance,
  mockSingleCategory,
  mockEmptyDeviations,
  mockLongCategoryNames,
} from "../../mocks/mockIntelligence";

const meta: Meta<typeof AnomalySection> = {
  title: "App/Right Panel/Intelligence/AnomalySection",
  component: AnomalySection,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Displays statistical analysis for a single dimension (e.g., location, function, level, tenure). Shows chi-square test results, p-values, effect sizes, and detailed deviations with collapsible table. Integrates with DeviationChart or LevelDistributionChart for visual representation.",
      },
    },
  },
  argTypes: {
    title: {
      control: "text",
      description:
        "Section title (e.g., 'Location Analysis', 'Function Analysis')",
    },
    analysis: {
      description:
        "DimensionAnalysis object with statistical test results and deviations",
    },
    chartComponent: {
      description:
        "Chart component to display (DeviationChart or LevelDistributionChart)",
    },
  },
};

export default meta;
type Story = StoryObj<typeof AnomalySection>;

/**
 * Green status - No significant issues (p > 0.05)
 * All deviations are within expected ranges, no action needed.
 */
export const GreenStatus: Story = {
  tags: ["screenshot"],
  parameters: {
    screenshot: { enabled: true, id: "intelligence-anomaly-green" },
  },
  args: {
    title: "Location Analysis",
    analysis: mockGreenAnalysis,
    chartComponent: (
      <DeviationChart
        data={mockGreenAnalysis.deviations}
        title="Performance by Location"
      />
    ),
  },
};

/**
 * Yellow status - Moderate anomaly (p < 0.05 but p >= 0.01)
 * One or more categories show moderate deviations that may warrant attention.
 */
export const YellowStatus: Story = {
  args: {
    title: "Function Analysis",
    analysis: mockYellowAnalysis,
    chartComponent: (
      <DeviationChart
        data={mockYellowAnalysis.deviations}
        title="Performance by Function"
      />
    ),
  },
};

/**
 * Red status - Severe anomaly (p < 0.01)
 * Significant deviations detected requiring investigation and potential action.
 */
export const RedStatus: Story = {
  tags: ["screenshot"],
  parameters: {
    screenshot: { enabled: true, id: "intelligence-anomaly-red" },
    screenshot: { enabled: true, id: "quickstart-intelligence-bias-detected" },
    screenshot: { enabled: true, id: "intelligence-anomaly-details" },
  },
  args: {
    title: "Level Analysis",
    analysis: mockRedAnalysis,
    chartComponent: (
      <DeviationChart
        data={mockRedAnalysis.deviations}
        title="Performance by Job Level"
      />
    ),
  },
};

/**
 * With DeviationChart (bar chart showing expected vs actual percentages)
 * Standard visualization for comparing observed vs expected distributions.
 */
export const WithDeviationChart: Story = {
  args: {
    title: "Department Analysis",
    analysis: mockMixedSignificance,
    chartComponent: (
      <DeviationChart
        data={mockMixedSignificance.deviations}
        title="Performance by Department"
      />
    ),
  },
};

/**
 * With LevelDistributionChart (stacked bar chart)
 * Shows performance distribution (Low/Medium/High) across job levels.
 */
export const WithLevelDistributionChart: Story = {
  args: {
    title: "Level Distribution",
    analysis: mockRedAnalysis,
    chartComponent: (
      <LevelDistributionChart
        data={[
          {
            level: "IC",
            low_pct: 35.0,
            low_count: 42,
            medium_pct: 39.6,
            medium_count: 48,
            high_pct: 25.4,
            high_count: 30,
            total: 120,
          },
          {
            level: "Team Lead",
            low_pct: 30.9,
            low_count: 17,
            medium_pct: 30.9,
            medium_count: 17,
            high_pct: 38.2,
            high_count: 21,
            total: 55,
          },
          {
            level: "Manager",
            low_pct: 25.0,
            low_count: 10,
            medium_pct: 26.3,
            medium_count: 11,
            high_pct: 48.7,
            high_count: 19,
            total: 40,
          },
          {
            level: "Senior Manager",
            low_pct: 20.0,
            low_count: 4,
            medium_pct: 27.7,
            medium_count: 6,
            high_pct: 52.3,
            high_count: 11,
            total: 20,
          },
        ]}
        title="Performance Distribution by Level"
        baselineHighPct={33.0}
      />
    ),
  },
};

/**
 * Small sample size (< 30)
 * Demonstrates handling of low statistical power scenarios.
 */
export const SmallSampleSize: Story = {
  args: {
    title: "Team Analysis (Small Sample)",
    analysis: mockSmallSampleAnalysis,
    chartComponent: (
      <DeviationChart
        data={mockSmallSampleAnalysis.deviations}
        title="Performance by Team (n=24)"
      />
    ),
  },
};

/**
 * Large sample size (1000+)
 * Demonstrates high statistical power where small effects become significant.
 */
export const LargeSampleSize: Story = {
  args: {
    title: "Tenure Analysis (Large Sample)",
    analysis: mockLargeSampleAnalysis,
    chartComponent: (
      <DeviationChart
        data={mockLargeSampleAnalysis.deviations}
        title="Performance by Tenure (n=1,240)"
      />
    ),
  },
};

/**
 * All non-significant deviations
 * All categories show green bars, perfect balance.
 */
export const AllNonSignificant: Story = {
  args: {
    title: "Product Line Analysis",
    analysis: mockAllNonSignificant,
    chartComponent: (
      <DeviationChart
        data={mockAllNonSignificant.deviations}
        title="Performance by Product Line"
      />
    ),
  },
};

/**
 * Mixed significance levels
 * Some categories significant (red/yellow), others not (green).
 */
export const MixedSignificance: Story = {
  args: {
    title: "Department Analysis",
    analysis: mockMixedSignificance,
    chartComponent: (
      <DeviationChart
        data={mockMixedSignificance.deviations}
        title="Performance by Department"
      />
    ),
  },
};

/**
 * Single category edge case
 * Only one category to analyze, no comparisons possible.
 */
export const SingleCategory: Story = {
  args: {
    title: "Organization Analysis",
    analysis: mockSingleCategory,
    chartComponent: (
      <DeviationChart
        data={mockSingleCategory.deviations}
        title="Overall Performance"
      />
    ),
  },
};

/**
 * Empty deviations edge case
 * No data available for analysis.
 */
export const EmptyDeviations: Story = {
  args: {
    title: "Incomplete Data Analysis",
    analysis: mockEmptyDeviations,
    chartComponent: (
      <DeviationChart data={mockEmptyDeviations.deviations} title="No Data" />
    ),
  },
};

/**
 * Long category names
 * Tests text wrapping and truncation in charts and tables.
 */
export const LongCategoryNames: Story = {
  args: {
    title: "Division Analysis",
    analysis: mockLongCategoryNames,
    chartComponent: (
      <DeviationChart
        data={mockLongCategoryNames.deviations}
        title="Performance by Division"
      />
    ),
  },
};

/**
 * Very low p-value (p < 0.001)
 * Demonstrates p-value formatting for highly significant results.
 */
export const VeryLowPValue: Story = {
  args: {
    title: "Level Analysis (Highly Significant)",
    analysis: {
      ...mockRedAnalysis,
      p_value: 0.00023, // Should display as "<0.001"
    },
    chartComponent: (
      <DeviationChart
        data={mockRedAnalysis.deviations}
        title="Performance by Job Level"
      />
    ),
  },
};

/**
 * High effect size
 * Large practical significance even if statistical significance varies.
 */
export const HighEffectSize: Story = {
  args: {
    title: "Function Analysis (Large Effect)",
    analysis: {
      ...mockYellowAnalysis,
      effect_size: 0.72, // Large effect size (>0.5)
    },
    chartComponent: (
      <DeviationChart
        data={mockYellowAnalysis.deviations}
        title="Performance by Function"
      />
    ),
  },
};

/**
 * Interactive - Details Expanded by Default
 * Story for testing expanded state manually (requires play function)
 * Note: Default state is collapsed; use Storybook's play function to test expanded state
 */
export const DetailsExpandedInteraction: Story = {
  args: {
    title: "Location Analysis (Interactive)",
    analysis: mockGreenAnalysis,
    chartComponent: (
      <DeviationChart
        data={mockGreenAnalysis.deviations}
        title="Performance by Location"
      />
    ),
  },
  parameters: {
    docs: {
      description: {
        story:
          "This story demonstrates the collapsible details table. Click the 'Detailed Deviations' section to expand/collapse the table. The table shows all deviation data in tabular format with color-coded rows for significant deviations.",
      },
    },
  },
};

// =============================================================================
// Screenshot Stories for Intelligence Documentation
// Each represents one of the 4 bias detectors
// =============================================================================

/**
 * Location Bias Detector - Screenshot for documentation
 * Shows location-based analysis with typical office/remote distribution patterns.
 */
export const LocationBiasDetector: Story = {
  tags: ["screenshot"],
  parameters: {
    screenshot: { enabled: true, id: "intelligence-location" },
    docs: {
      description: {
        story:
          "Location bias detector showing performance distribution across offices and remote workers. " +
          "Highlights when specific locations have significantly different high performer rates.",
      },
    },
  },
  args: {
    title: "Location Analysis",
    analysis: mockYellowAnalysis,
    chartComponent: (
      <DeviationChart
        data={mockYellowAnalysis.deviations}
        title="Performance by Location"
      />
    ),
  },
};

/**
 * Job Function Bias Detector - Screenshot for documentation
 * Shows function-based analysis across departments.
 */
export const FunctionBiasDetector: Story = {
  tags: ["screenshot"],
  parameters: {
    screenshot: { enabled: true, id: "intelligence-function" },
    docs: {
      description: {
        story:
          "Job function bias detector showing performance distribution across departments. " +
          "Identifies when certain functions (Engineering, Sales, etc.) have skewed ratings.",
      },
    },
  },
  args: {
    title: "Job Function Analysis",
    analysis: mockMixedSignificance,
    chartComponent: (
      <DeviationChart
        data={mockMixedSignificance.deviations}
        title="Performance by Job Function"
      />
    ),
  },
};

/**
 * Job Level Bias Detector - Screenshot for documentation
 * Shows level-based analysis highlighting seniority bias patterns.
 */
export const LevelBiasDetector: Story = {
  tags: ["screenshot"],
  parameters: {
    screenshot: { enabled: true, id: "intelligence-level" },
    docs: {
      description: {
        story:
          "Job level bias detector showing performance distribution across job levels. " +
          "Detects when ratings correlate too strongly with seniority rather than performance.",
      },
    },
  },
  args: {
    title: "Job Level Analysis",
    analysis: mockRedAnalysis,
    chartComponent: (
      <DeviationChart
        data={mockRedAnalysis.deviations}
        title="Performance by Job Level"
      />
    ),
  },
};

/**
 * Tenure Bias Detector - Screenshot for documentation
 * Shows tenure-based analysis across employee tenure bands.
 */
export const TenureBiasDetector: Story = {
  tags: ["screenshot"],
  parameters: {
    screenshot: { enabled: true, id: "intelligence-tenure" },
    docs: {
      description: {
        story:
          "Tenure bias detector showing performance distribution across tenure categories. " +
          "Identifies patterns like new hire optimism or long-tenure stagnation.",
      },
    },
  },
  args: {
    title: "Tenure Analysis",
    analysis: mockLargeSampleAnalysis,
    chartComponent: (
      <DeviationChart
        data={mockLargeSampleAnalysis.deviations}
        title="Performance by Tenure"
      />
    ),
  },
};
