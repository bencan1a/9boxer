import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "@storybook/test";
import { GridAxes } from "./GridAxes";

/**
 * GridAxes displays the X and Y axis labels for the nine-box grid.
 * - X-axis: Performance (Low → High, horizontal)
 * - Y-axis: Potential (Low → High, vertical)
 *
 * The Y-axis label is rendered vertically using CSS transform.
 *
 * **Key Features:**
 * - Internationalization support via i18n
 * - Optional label override
 * - Can be hidden via `showLabels` prop
 * - Consistent 80px width for Y-axis spacing
 *
 * **Data Attributes:**
 * - `data-testid="grid-y-axis"` - Y-axis label container
 */
const meta: Meta<typeof GridAxes> = {
  title: "Grid/GridAxes",
  component: GridAxes,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Axis labels component for the nine-box grid. Displays Performance (X) and Potential (Y) labels with vertical text rotation for Y-axis.",
      },
    },
  },
  argTypes: {
    xAxisLabel: {
      control: "text",
      description: "Custom label for X-axis (Performance). Defaults to i18n value.",
    },
    yAxisLabel: {
      control: "text",
      description: "Custom label for Y-axis (Potential). Defaults to i18n value.",
    },
    showLabels: {
      control: "boolean",
      description: "Whether to show axis labels. Defaults to true.",
    },
  },
};

export default meta;
type Story = StoryObj<typeof GridAxes>;

/**
 * Default Y-axis label using i18n translations.
 * Shows standard "Potential (Low → High)" Y-axis label. X-axis labels are not rendered by this component.
 */
export const Default: Story = {
  args: {
    showLabels: true,
  },
};

/**
 * Custom labels - override default translations.
 * Useful for organizations with custom terminology.
 */
export const CustomLabels: Story = {
  args: {
    xAxisLabel: "Results",
    yAxisLabel: "Capability",
    showLabels: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Custom axis labels for organizations that use different terminology than Performance/Potential.",
      },
    },
  },
};

/**
 * Hidden labels - labels disabled.
 * Grid renders without axis labels for cleaner, more compact view.
 */
export const Hidden: Story = {
  args: {
    showLabels: false,
  },
  parameters: {
    docs: {
      description: {
        story: "Axis labels hidden. Useful for embedded views or when labels are redundant.",
      },
    },
  },
};
