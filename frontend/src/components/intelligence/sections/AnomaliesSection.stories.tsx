import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "@storybook/test";
import { AnomaliesSection } from "./AnomaliesSection";
import {
  mockMixedAnomalies,
  mockManyAnomalies,
  mockNoAnomalies,
  mockFunctionAnomaly,
  mockLocationAnomaly,
} from "../../../mocks/mockAnomalies";

const meta: Meta<typeof AnomaliesSection> = {
  title: "Intelligence/Sections/AnomaliesSection",
  component: AnomaliesSection,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  argTypes: {
    anomalies: {
      description: "List of anomalies to display",
    },
    onAnomalyClick: {
      description: "Callback when anomaly card is clicked",
      action: "anomaly-click",
    },
    onAnomalyDismiss: {
      description: "Callback when anomaly is dismissed",
      action: "anomaly-dismiss",
    },
    showActions: {
      control: "boolean",
      description: "Whether to show action buttons",
    },
  },
};

export default meta;
type Story = StoryObj<typeof AnomaliesSection>;

export const Empty: Story = {
  args: {
    anomalies: mockNoAnomalies,
    onAnomalyClick: fn(),
    onAnomalyDismiss: fn(),
    showActions: true,
  },
};

export const SingleCritical: Story = {
  args: {
    anomalies: [mockFunctionAnomaly],
    onAnomalyClick: fn(),
    onAnomalyDismiss: fn(),
    showActions: true,
  },
};

export const MixedSeverity: Story = {
  args: {
    anomalies: mockMixedAnomalies,
    onAnomalyClick: fn(),
    onAnomalyDismiss: fn(),
    showActions: true,
  },
};

export const ManyAnomalies: Story = {
  args: {
    anomalies: mockManyAnomalies,
    onAnomalyClick: fn(),
    onAnomalyDismiss: fn(),
    showActions: true,
  },
};

export const NoActions: Story = {
  args: {
    anomalies: [mockFunctionAnomaly, mockLocationAnomaly],
    onAnomalyClick: fn(),
    onAnomalyDismiss: fn(),
    showActions: false,
  },
};
