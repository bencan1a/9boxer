import type { Meta, StoryObj } from "@storybook/react";
import { ApplyChangesDialog } from "./ApplyChangesDialog";
import { fn } from "@storybook/test";

const meta: Meta<typeof ApplyChangesDialog> = {
  title: "Dialogs/ApplyChangesDialog",
  component: ApplyChangesDialog,
  parameters: {
    layout: "centered",
  },
  args: {
    onApply: fn(() => Promise.resolve()),
    onCancel: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof ApplyChangesDialog>;

export const Default: Story = {
  args: {
    open: true,
    filename: "employees.xlsx",
  },
};

export const WithError: Story = {
  args: {
    open: true,
    filename: "missing.xlsx",
    error: "Could not find missing.xlsx. Please save to a new location.",
  },
};

export const Loading: Story = {
  args: {
    open: true,
    filename: "employees.xlsx",
    isLoading: true,
  },
};
