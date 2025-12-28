import type { Meta, StoryObj } from "@storybook/react";
import { DistributionSection } from "./DistributionSection";
import {
  mockIdealDistribution,
  mockSkewedDistribution,
  mockConcentratedDistribution,
  mockBalancedDistribution,
  mockSmallDistribution,
} from "../../../mocks/mockDistribution";

/**
 * DistributionSection - 🔮 Future Feature
 *
 * This section component is planned for AI-powered insights but not yet
 * implemented in the application. It will display distribution analysis
 * comparing actual vs ideal employee distributions across the 9-box grid.
 */
const meta: Meta<typeof DistributionSection> = {
  title: "Intelligence/Sections/🔮 Future Feature - DistributionSection",
  component: DistributionSection,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "🔮 **Future Feature** - This component is planned for AI-powered insights but not yet implemented in the application. It will display distribution analysis comparing actual vs ideal employee distributions across the 9-box grid with statistical comparisons.",
      },
    },
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
