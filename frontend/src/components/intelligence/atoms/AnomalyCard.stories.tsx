import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "@storybook/test";
import { AnomalyCard } from "./AnomalyCard";
import {
  mockLocationAnomaly,
  mockFunctionAnomaly,
  mockDistributionAnomaly,
  mockOutlierAnomaly,
} from "../../../mocks/mockAnomalies";

const meta: Meta<typeof AnomalyCard> = {
  title: "Intelligence/Atoms/AnomalyCard",
  component: AnomalyCard,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  argTypes: {
    anomaly: {
      description: "Anomaly data to display",
    },
    onDismiss: {
      description: "Callback when dismiss button is clicked",
      action: "dismiss",
    },
    onClick: {
      description: "Callback when card is clicked",
      action: "click",
    },
    showActions: {
      control: "boolean",
      description: "Whether to show action buttons",
    },
  },
};

export default meta;
type Story = StoryObj<typeof AnomalyCard>;

export const Critical: Story = {
  args: {
    anomaly: mockFunctionAnomaly,
    onDismiss: fn(),
    onClick: fn(),
    showActions: true,
  },
};

export const Warning: Story = {
  args: {
    anomaly: mockLocationAnomaly,
    onDismiss: fn(),
    onClick: fn(),
    showActions: true,
  },
};

export const Info: Story = {
  args: {
    anomaly: mockOutlierAnomaly,
    onDismiss: fn(),
    onClick: fn(),
    showActions: true,
  },
};

export const WithoutActions: Story = {
  args: {
    anomaly: mockDistributionAnomaly,
    onDismiss: fn(),
    onClick: fn(),
    showActions: false,
  },
};

export const NoSuggestion: Story = {
  args: {
    anomaly: {
      ...mockOutlierAnomaly,
      suggestion: undefined,
    },
    onDismiss: fn(),
    onClick: fn(),
    showActions: true,
  },
};
