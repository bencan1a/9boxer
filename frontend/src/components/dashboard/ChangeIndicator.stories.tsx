/**
 * Storybook stories for ChangeIndicator component
 */

import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "storybook/test";
import { ChangeIndicator } from "./ChangeIndicator";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";

const meta = {
  title: "App/Dashboard/ChangeIndicator",
  component: ChangeIndicator,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    count: {
      control: { type: "number", min: 0, max: 99 },
      description: "Number of changes",
    },
    invisible: {
      control: "boolean",
      description: "Whether badge is invisible",
    },
  },
  args: {
    onClick: fn(),
  },
  decorators: [
    (Story) => (
      <Box sx={{ p: 4 }}>
        <Story />
      </Box>
    ),
  ],
} satisfies Meta<typeof ChangeIndicator>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Hidden (no changes)
 */
export const Hidden: Story = {
  args: {
    count: 0,
    children: <Button variant="contained">File Menu</Button>,
  },
};

/**
 * Few changes
 */
export const FewChanges: Story = {
  args: {
    count: 3,
    children: <Button variant="contained">File Menu</Button>,
  },
};

/**
 * Many changes
 */
export const ManyChanges: Story = {
  args: {
    count: 15,
    children: <Button variant="contained">File Menu</Button>,
  },
};

/**
 * Single change
 */
export const SingleChange: Story = {
  args: {
    count: 1,
    children: <Button variant="contained">File Menu</Button>,
  },
};

/**
 * Very many changes
 */
export const VeryManyChanges: Story = {
  args: {
    count: 99,
    children: <Button variant="contained">File Menu</Button>,
  },
};

/**
 * Invisible (forced)
 */
export const InvisibleForced: Story = {
  args: {
    count: 5,
    invisible: true,
    children: <Button variant="contained">File Menu</Button>,
  },
};

/**
 * On icon button
 */
export const OnIconButton: Story = {
  args: {
    count: 3,
    children: (
      <Button variant="outlined" size="small">
        Export
      </Button>
    ),
  },
};
