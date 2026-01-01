import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { AboutDialog } from "./AboutDialog";
import { useState } from "react";
import Button from "@mui/material/Button";

const meta = {
  title: "App/Dialogs/AboutDialog",
  component: AboutDialog,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "AboutDialog displays information about the 9Boxer application. It supports multiple visual variants: **simple**, **detailed**, **cards**, and **compact**.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    open: {
      control: "boolean",
      description: "Controls whether the dialog is open",
    },
    variant: {
      control: "select",
      options: ["simple", "detailed", "cards", "compact"],
      description: "Visual variant of the dialog",
      table: {
        type: { summary: "simple | detailed | cards | compact" },
        defaultValue: { summary: "detailed" },
      },
    },
    onClose: {
      description: "Callback fired when the dialog is closed",
    },
  },
  args: {
    onClose: fn(),
  },
} satisfies Meta<typeof AboutDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The default "detailed" variant provides comprehensive information about the application,
 * including version, technology stack, and copyright information.
 * This is the recommended variant for most use cases.
 */
export const Detailed: Story = {
  args: {
    open: true,
    variant: "detailed",
  },
};

/**
 * The "simple" variant displays minimal information with a clean, uncluttered design.
 * Perfect for when you want to show just the essential details.
 */
export const Simple: Story = {
  args: {
    open: true,
    variant: "simple",
  },
};

/**
 * The "cards" variant uses a modern card-based layout to highlight key features
 * and capabilities of the application. Great for showcasing functionality.
 */
export const Cards: Story = {
  args: {
    open: true,
    variant: "cards",
  },
};

/**
 * The "compact" variant provides a minimalist, centered design with quick links.
 * Ideal for a clean, streamlined about dialog with minimal visual weight.
 */
export const Compact: Story = {
  args: {
    open: true,
    variant: "compact",
  },
};

/**
 * Example of the dialog in its closed state.
 * Click the dialog in the canvas to trigger the onClose action.
 */
export const Closed: Story = {
  args: {
    open: false,
    variant: "detailed",
  },
};

/**
 * All variants shown in dark mode to demonstrate theme support.
 * Use the theme toggle in the Storybook toolbar to switch between light and dark modes.
 */
export const DarkMode: Story = {
  args: {
    open: true,
    variant: "detailed",
  },
  parameters: {
    backgrounds: { default: "dark" },
  },
};

/**
 * Interactive demo showing how the dialog can be toggled open/closed.
 * Try clicking the close button or backdrop to close the dialog.
 */
export const Interactive: Story = {
  args: {
    open: true,
    variant: "detailed",
  },
  parameters: {
    docs: {
      description: {
        story:
          "This story demonstrates the interactive behavior of the dialog. Click the close button, backdrop, or action button to trigger the onClose callback.",
      },
    },
  },
};

/**
 * Interactive demo with button to open the dialog.
 */
const DialogWrapper = (args: {
  variant?: "simple" | "detailed" | "cards" | "compact";
}) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="contained" onClick={() => setOpen(true)}>
        Open About Dialog
      </Button>
      <AboutDialog {...args} open={open} onClose={() => setOpen(false)} />
    </>
  );
};

/**
 * Interactive demo showing how the dialog can be triggered from a button.
 */
export const WithTriggerButton: Story = {
  render: (args) => <DialogWrapper {...args} />,
  args: {
    open: false,
    variant: "detailed",
  },
  parameters: {
    docs: {
      description: {
        story:
          "This story demonstrates how to trigger the dialog from a button click. Click 'Open About Dialog' to see the dialog in action.",
      },
    },
  },
};
