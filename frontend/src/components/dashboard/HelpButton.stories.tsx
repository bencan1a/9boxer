/**
 * Storybook stories for HelpButton component
 */

import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { HelpButton } from "./HelpButton";
import Box from "@mui/material/Box";

const meta = {
  title: "App/Dashboard/HelpButton",
  component: HelpButton,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    disabled: {
      control: "boolean",
      description: "Whether button is disabled",
    },
  },
  args: {
    onUserGuideClick: fn(),
    onAboutClick: fn(),
  },
  decorators: [
    (Story) => (
      <Box sx={{ p: 2, backgroundColor: "primary.main", color: "white" }}>
        <Story />
      </Box>
    ),
  ],
} satisfies Meta<typeof HelpButton>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default state
 */
export const Default: Story = {
  args: {},
};

/**
 * Disabled state
 */
export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

/**
 * Menu open (controlled)
 */
export const MenuOpen: Story = {
  args: {
    isOpen: true,
  },
};
