import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "@storybook/test";
import { InsightCard } from "./InsightCard";
import {
  mockRecommendationHigh,
  mockRecommendationMedium,
  mockRecommendationLow,
  mockObservation,
  mockWarning,
} from "../../../mocks/mockInsights";

const meta: Meta<typeof InsightCard> = {
  title: "Intelligence/Atoms/InsightCard",
  component: InsightCard,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
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
