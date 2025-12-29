import type { Meta, StoryObj } from "@storybook/react";
import { UnsavedChangesDialog } from "./UnsavedChangesDialog";
import { fn } from "@storybook/test";

const meta: Meta<typeof UnsavedChangesDialog> = {
  title: "Dialogs/UnsavedChangesDialog",
  component: UnsavedChangesDialog,
  parameters: {
    layout: "centered",
  },
  args: {
    onApply: fn(),
    onDiscard: fn(),
    onCancel: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof UnsavedChangesDialog>;

export const SingleChange: Story = {
  args: {
    open: true,
    changeCount: 1,
  },
};

export const MultipleChanges: Story = {
  args: {
    open: true,
    changeCount: 5,
  },
};

export const ManyChanges: Story = {
  args: {
    open: true,
    changeCount: 42,
  },
};
