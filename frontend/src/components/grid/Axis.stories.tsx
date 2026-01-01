import type { Meta, StoryObj } from "@storybook/react-vite";
import { Axis } from "./Axis";

/**
 * Axis component displays a single axis label for the nine-box grid.
 *
 * - **Horizontal:** Performance axis (X-axis) - centered at top
 * - **Vertical:** Potential axis (Y-axis) - rotated text on left
 *
 * **Key Features:**
 * - Single responsibility (one axis per component)
 * - Configurable orientation (horizontal/vertical)
 * - Internationalization support via i18n
 * - Optional label override
 * - Can be hidden via `showLabel` prop
 *
 * **Data Attributes:**
 * - `data-testid="grid-axis-horizontal"` - Horizontal axis container
 * - `data-testid="grid-axis-vertical"` - Vertical axis container
 *
 * **Design Improvement:**
 * This component replaces the previous `GridAxes` component which returned
 * a fragment with both axes. The new design follows single responsibility
 * principle and allows flexible composition.
 */
const meta: Meta<typeof Axis> = {
  title: "App/Grid/Axis",
  component: Axis,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Single axis label component for the nine-box grid. Can be configured as horizontal (Performance) or vertical (Potential) via orientation prop.",
      },
    },
  },
  argTypes: {
    orientation: {
      control: "radio",
      options: ["horizontal", "vertical"],
      description: "Orientation of the axis label",
    },
    label: {
      control: "text",
      description:
        "Custom label text. If not provided, uses i18n translation based on orientation.",
    },
    showLabel: {
      control: "boolean",
      description: "Whether to show the axis label. Defaults to true.",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Axis>;

/**
 * Horizontal axis (Performance) - default state.
 * Used for the X-axis showing performance levels (Low → High).
 */
export const Horizontal: Story = {
  args: {
    orientation: "horizontal",
    showLabel: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Horizontal axis for Performance. Displayed centered at the top of the grid.",
      },
    },
  },
};

/**
 * Vertical axis (Potential) - default state.
 * Used for the Y-axis showing potential levels (Low → High).
 * Text is rotated 180 degrees for vertical reading.
 */
export const Vertical: Story = {
  args: {
    orientation: "vertical",
    showLabel: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Vertical axis for Potential. Displayed on the left side with rotated text (writing-mode: vertical-rl).",
      },
    },
  },
};

/**
 * Custom horizontal label.
 * Allows organizations to use custom terminology instead of "Performance".
 */
export const CustomHorizontalLabel: Story = {
  args: {
    orientation: "horizontal",
    label: "Results",
    showLabel: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Horizontal axis with custom label. Useful for organizations that use different terminology.",
      },
    },
  },
};

/**
 * Custom vertical label.
 * Allows organizations to use custom terminology instead of "Potential".
 */
export const CustomVerticalLabel: Story = {
  args: {
    orientation: "vertical",
    label: "Capability",
    showLabel: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Vertical axis with custom label. Example: 'Capability' instead of 'Potential'.",
      },
    },
  },
};

/**
 * Hidden horizontal axis.
 * When showLabel is false, the axis is not rendered.
 */
export const HiddenHorizontal: Story = {
  args: {
    orientation: "horizontal",
    showLabel: false,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Hidden horizontal axis. Useful for embedded views or when labels are redundant.",
      },
    },
  },
};

/**
 * Hidden vertical axis.
 * When showLabel is false, the axis is not rendered.
 */
export const HiddenVertical: Story = {
  args: {
    orientation: "vertical",
    showLabel: false,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Hidden vertical axis. Component returns null when showLabel is false.",
      },
    },
  },
};
