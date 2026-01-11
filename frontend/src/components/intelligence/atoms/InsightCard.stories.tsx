import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "storybook/test";
import { InsightCard } from "./InsightCard";
import {
  mockRecommendationHigh,
  mockRecommendationMedium,
  mockRecommendationLow,
  mockObservation,
  mockWarning,
} from "../../../mocks/mockInsights";

/**
 * InsightCard - 🔮 Future Feature
 *
 * This component is planned for AI-powered insights but not yet implemented
 * in the application. It will display actionable insights and recommendations
 * about employee performance and distribution patterns.
 */
const meta: Meta<typeof InsightCard> = {
  title: "Intelligence/Atoms/🔮 Future Feature - InsightCard",
  component: InsightCard,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "🔮 **Future Feature** - This component is planned for AI-powered insights but not yet implemented in the application. It will display AI-generated recommendations, observations, and warnings with confidence indicators.",
      },
    },
  },
  argTypes: {
    insight: {
      description: "Insight data to display",
    },
    onAction: {
      description: "Callback when action button is clicked",
      action: "action",
    },
    showConfidence: {
      control: "boolean",
      description: "Whether to show confidence indicator",
    },
  },
};

export default meta;
type Story = StoryObj<typeof InsightCard>;

export const RecommendationHighConfidence: Story = {
  args: {
    insight: mockRecommendationHigh,
    onAction: fn(),
    showConfidence: true,
  },
};

export const RecommendationMediumConfidence: Story = {
  args: {
    insight: mockRecommendationMedium,
    onAction: fn(),
    showConfidence: true,
  },
};

export const RecommendationLowConfidence: Story = {
  args: {
    insight: mockRecommendationLow,
    onAction: fn(),
    showConfidence: true,
  },
};

export const Observation: Story = {
  args: {
    insight: mockObservation,
    onAction: fn(),
    showConfidence: true,
  },
};

export const Warning: Story = {
  args: {
    insight: mockWarning,
    onAction: fn(),
    showConfidence: true,
  },
};

export const NoActionButton: Story = {
  args: {
    insight: mockObservation,
    showConfidence: true,
  },
};

export const HiddenConfidence: Story = {
  args: {
    insight: mockRecommendationHigh,
    onAction: fn(),
    showConfidence: false,
  },
};
