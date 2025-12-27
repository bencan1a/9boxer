import type { Meta, StoryObj } from "@storybook/react-vite";
import { DistributionSection } from "./DistributionSection";
import {
  mockIdealDistribution,
  mockSkewedDistribution,
  mockConcentratedDistribution,
  mockBalancedDistribution,
  mockSmallDistribution,
} from "../../../mocks/mockDistribution";

const meta: Meta<typeof DistributionSection> = {
  title: "Intelligence/Sections/DistributionSection",
  component: DistributionSection,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  argTypes: {
    data: {
      description: "Distribution data to display",
    },
    chartComponent: {
      description: "Optional chart component",
    },
    showIdeal: {
      control: "boolean",
      description: "Whether to show ideal percentage comparisons",
    },
  },
};

export default meta;
type Story = StoryObj<typeof DistributionSection>;

export const IdealDistribution: Story = {
  args: {
    data: mockIdealDistribution,
    showIdeal: true,
  },
};

export const SkewedDistribution: Story = {
  args: {
    data: mockSkewedDistribution,
    showIdeal: true,
  },
};

export const ConcentratedDistribution: Story = {
  args: {
    data: mockConcentratedDistribution,
    showIdeal: true,
  },
};

export const BalancedDistribution: Story = {
  args: {
    data: mockBalancedDistribution,
    showIdeal: true,
  },
};

export const SmallDataset: Story = {
  args: {
    data: mockSmallDistribution,
    showIdeal: true,
  },
};

export const NoIdealComparison: Story = {
  args: {
    data: mockBalancedDistribution,
    showIdeal: false,
  },
};
