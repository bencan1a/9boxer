import type { Meta, StoryObj } from "@storybook/react";
import { IntelligenceSummary } from "./IntelligenceSummary";
import {
  mockExcellentIntelligence,
  mockGoodIntelligence,
  mockNeedsAttentionIntelligence,
  mockHighAnomalyCount,
  mockLowAnomalyCount,
  mockMixedIntelligence,
  mockYellowAnalysis,
} from "../../mocks/mockIntelligence";

/**
 * IntelligenceSummary displays overview cards at the top of the Intelligence tab.
 *
 * **Key Sections:**
 * - Quality Score Card: Overall rating quality score (0-100 scale) with status icon
 * - Anomaly Count Card: Total anomalies broken down by severity (green/yellow/red)
 * - Status Card: Overall health assessment with descriptive message
 *
 * **Features:**
 * - Color-coded quality indicators (green=excellent 80+, yellow=good 50-79, red=needs attention <50)
 * - Dynamic status icons (CheckCircle, Warning, Error) based on quality score
 * - Chip badges showing anomaly breakdown by severity level
 * - Responsive grid layout (3 columns on desktop, 1 column on mobile)
 * - Supports light and dark modes
 *
 * **Quality Score Ranges:**
 * - 80-100: Excellent (green) - Well-calibrated distributions
 * - 50-79: Good (yellow) - Some anomalies detected
 * - 0-49: Needs Attention (red) - Significant anomalies require review
 *
 * **Dependencies:**
 * - Uses IntelligenceData type from API
 * - Requires i18n translation keys under panel.intelligenceTab.summary
 * - Uses Material-UI theme colors (success, warning, error)
 */
const meta: Meta<typeof IntelligenceSummary> = {
  title: "App/Right Panel/Intelligence/IntelligenceSummary",
  component: IntelligenceSummary,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    data: {
      description:
        "Intelligence data object containing quality score, anomaly counts, and dimension analyses",
    },
  },
};

export default meta;
type Story = StoryObj<typeof IntelligenceSummary>;

/**
 * Default view with mixed quality indicators.
 * Shows a realistic scenario with moderate quality score (67),
 * mix of green/yellow/red anomalies, and balanced status.
 */
export const Default: Story = {
  args: {
    data: mockMixedIntelligence,
  },
};

/**
 * Excellent quality scenario (score 85+).
 * All green status indicators, no significant anomalies detected.
 * Shows ideal calibration state with well-balanced distributions.
 */
export const ExcellentQuality: Story = {
  tags: ["screenshot"],
  parameters: {
    screenshot: { enabled: true, id: "intelligence-summary-excellent" },
  },
  args: {
    data: mockExcellentIntelligence,
  },
};

/**
 * Good quality scenario (score 65-84).
 * Some yellow anomalies detected but overall healthy.
 * Shows typical production scenario with minor adjustments needed.
 */
export const GoodQuality: Story = {
  args: {
    data: mockGoodIntelligence,
  },
};

/**
 * Needs attention scenario (score < 50).
 * Multiple red anomalies indicating significant calibration issues.
 * Immediate review and corrective action recommended.
 */
export const NeedsAttention: Story = {
  tags: ["screenshot"],
  parameters: {
    screenshot: { enabled: true, id: "intelligence-summary-needs-attention" },
    screenshot: { enabled: true, id: "intelligence-summary-needs-attention" },
  },
  args: {
    data: mockNeedsAttentionIntelligence,
  },
};

/**
 * High anomaly count scenario (20+ total anomalies).
 * Tests display with many detected issues across multiple dimensions.
 * Shows severe calibration problems requiring comprehensive review.
 */
export const HighAnomalyCount: Story = {
  args: {
    data: mockHighAnomalyCount,
  },
};

/**
 * Low anomaly count scenario (0-3 anomalies).
 * Very healthy state with minimal detected issues.
 * Demonstrates optimal calibration with balanced distributions.
 */
export const LowAnomalyCount: Story = {
  args: {
    data: mockLowAnomalyCount,
  },
};

/**
 * Edge case: Perfect score scenario.
 * Tests display with maximum quality score and zero anomalies.
 */
export const PerfectScore: Story = {
  args: {
    data: {
      quality_score: 100,
      anomaly_count: {
        green: 4,
        yellow: 0,
        red: 0,
      },
      location_analysis: mockExcellentIntelligence.location_analysis,
      function_analysis: mockExcellentIntelligence.function_analysis,
      level_analysis: mockExcellentIntelligence.level_analysis,
      tenure_analysis: mockExcellentIntelligence.tenure_analysis,
    },
  },
};

/**
 * Edge case: Zero score scenario.
 * Tests display with minimum quality score and all red anomalies.
 */
export const ZeroScore: Story = {
  args: {
    data: {
      quality_score: 0,
      anomaly_count: {
        green: 0,
        yellow: 0,
        red: 12,
      },
      location_analysis: mockNeedsAttentionIntelligence.location_analysis,
      function_analysis: mockNeedsAttentionIntelligence.function_analysis,
      level_analysis: mockNeedsAttentionIntelligence.level_analysis,
      tenure_analysis: mockNeedsAttentionIntelligence.tenure_analysis,
    },
  },
};

/**
 * Edge case: Boundary score at 80 (excellent threshold).
 * Tests color transition from yellow to green status.
 */
export const BoundaryExcellent: Story = {
  args: {
    data: {
      quality_score: 80,
      anomaly_count: {
        green: 3,
        yellow: 1,
        red: 0,
      },
      location_analysis: mockGoodIntelligence.location_analysis,
      function_analysis: mockExcellentIntelligence.function_analysis,
      level_analysis: mockExcellentIntelligence.level_analysis,
      tenure_analysis: mockExcellentIntelligence.tenure_analysis,
    },
  },
};

/**
 * Edge case: Boundary score at 50 (needs attention threshold).
 * Tests color transition from red to yellow status.
 */
export const BoundaryNeedsAttention: Story = {
  args: {
    data: {
      quality_score: 50,
      anomaly_count: {
        green: 1,
        yellow: 2,
        red: 1,
      },
      location_analysis: mockYellowAnalysis,
      function_analysis: mockGoodIntelligence.function_analysis,
      level_analysis: mockYellowAnalysis,
      tenure_analysis: mockGoodIntelligence.tenure_analysis,
    },
  },
};

/**
 * All yellow anomalies scenario.
 * Tests display when all detected anomalies are moderate severity.
 */
export const AllYellowAnomalies: Story = {
  args: {
    data: {
      quality_score: 68,
      anomaly_count: {
        green: 0,
        yellow: 8,
        red: 0,
      },
      location_analysis: mockYellowAnalysis,
      function_analysis: mockYellowAnalysis,
      level_analysis: mockYellowAnalysis,
      tenure_analysis: mockYellowAnalysis,
    },
  },
};

/**
 * Zero anomalies scenario.
 * Tests display when no anomalies are detected at all.
 * Rare but possible state indicating perfect calibration.
 */
export const ZeroAnomalies: Story = {
  args: {
    data: {
      quality_score: 100,
      anomaly_count: {
        green: 0,
        yellow: 0,
        red: 0,
      },
      location_analysis: mockExcellentIntelligence.location_analysis,
      function_analysis: mockExcellentIntelligence.function_analysis,
      level_analysis: mockExcellentIntelligence.level_analysis,
      tenure_analysis: mockExcellentIntelligence.tenure_analysis,
    },
  },
};
