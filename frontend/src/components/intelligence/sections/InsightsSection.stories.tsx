import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "@storybook/test";
import { InsightsSection } from "./InsightsSection";
import {
  mockMixedInsights,
  mockManyInsights,
  mockNoInsights,
  mockRecommendationHigh,
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

export const Empty: Story = {
  args: {
    insights: mockNoInsights,
    onInsightAction: fn(),
    showConfidence: true,
  },
};

export const SingleRecommendation: Story = {
  args: {
    insights: [mockRecommendationHigh],
    onInsightAction: fn(),
    showConfidence: true,
  },
};

export const MixedTypes: Story = {
  args: {
    insights: mockMixedInsights,
    onInsightAction: fn(),
    showConfidence: true,
  },
};

export const ManyInsights: Story = {
  args: {
    insights: mockManyInsights,
    onInsightAction: fn(),
    showConfidence: true,
  },
};

export const NoConfidenceDisplay: Story = {
  args: {
    insights: [mockRecommendationHigh, mockObservation, mockWarning],
    onInsightAction: fn(),
    showConfidence: false,
  },
};
