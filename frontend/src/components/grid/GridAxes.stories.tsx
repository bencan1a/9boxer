import type { Meta, StoryObj } from "@storybook/react-vite";
import { GridAxes } from "./GridAxes";

/**
 * GridAxes displays the Y-axis (Potential) label for the nine-box grid.
 * - Y-axis: Potential (Low → High, vertical)
 *
 * Note: The X-axis (Performance) label is rendered separately by NineBoxGrid in its header section.
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
          "Y-axis label component for the nine-box grid. Displays the Potential (Y) label with vertical text rotation. The X-axis (Performance) label is rendered separately by NineBoxGrid.",
      },
    },
  },
  argTypes: {
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
    yAxisLabel: "Capability",
    showLabels: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Custom Y-axis label for organizations that use different terminology than Potential.",
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
