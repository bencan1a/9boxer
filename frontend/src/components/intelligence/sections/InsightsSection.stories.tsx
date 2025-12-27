import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "@storybook/test";
import { InsightsSection } from "./InsightsSection";
import {
  mockMixedInsights,
  mockManyInsights,
  mockNoInsights,
  mockRecommendationHigh,
  mockRecommendationLow,
  mockObservation,
  mockWarning,
} from "../../../mocks/mockInsights";

const meta: Meta<typeof InsightsSection> = {
  title: "Intelligence/Sections/InsightsSection",
  component: InsightsSection,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  argTypes: {
    insights: {
      description: "List of insights to display",
    },
    onInsightAction: {
      description: "Callback when insight action is triggered",
      action: "insight-action",
    },
    showConfidence: {
      control: "boolean",
      description: "Whether to show confidence indicators",
    },
  },
};

export default meta;
type Story = StoryObj<typeof InsightsSection>;

/**
 * Empty state - no insights available
 * Displays a helpful message guiding users when no insights have been generated
 */
export const Empty: Story = {
  args: {
    insights: mockNoInsights,
    onInsightAction: fn(),
    showConfidence: true,
  },
};

/**
 * Single high-confidence recommendation
 * Displays a single recommendation insight with action button and confidence indicator
 */
export const SingleRecommendation: Story = {
  args: {
    insights: [mockRecommendationHigh],
    onInsightAction: fn(),
    showConfidence: true,
  },
};

/**
 * Mixed insight types - recommendations, observations, and warnings
 * Tests diversity of insight types with type indicators at the top of the section
 */
export const MixedTypes: Story = {
  args: {
    insights: mockMixedInsights,
    onInsightAction: fn(),
    showConfidence: true,
  },
};

/**
 * Many insights - stress test with 7+ items
 * Tests scrolling behavior and performance with a large number of insights
 */
export const ManyInsights: Story = {
  args: {
    insights: mockManyInsights,
    onInsightAction: fn(),
    showConfidence: true,
  },
};

/**
 * Low confidence insights - all insights below 0.6 confidence
 * Tests how confidence indicators appear for less certain insights
 */
export const LowConfidence: Story = {
  args: {
    insights: [
      mockRecommendationLow,
      {
        ...mockRecommendationLow,
        id: "rec-low-2",
        text: "Another low-confidence suggestion based on limited data.",
      },
      {
        ...mockObservation,
        id: "obs-low",
        confidence: 0.52,
        text: "This observation has lower confidence due to small sample size.",
      },
    ],
    onInsightAction: fn(),
    showConfidence: true,
  },
};

/**
 * Without action handlers - insights with no callback
 * Tests that insights render correctly even when no onInsightAction callback is provided
 */
export const WithoutActions: Story = {
  args: {
    insights: mockMixedInsights,
    showConfidence: true,
  },
};

/**
 * No confidence display - confidence indicators hidden
 * Displays insights with showConfidence=false, useful when confidence should not be exposed
 */
export const NoConfidenceDisplay: Story = {
  args: {
    insights: [mockRecommendationHigh, mockObservation, mockWarning],
    onInsightAction: fn(),
    showConfidence: false,
  },
};
