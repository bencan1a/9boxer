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

/**
 * Save-as mode story for screenshot generation
 * Note: Storybook doesn't support direct state manipulation of checkbox,
 * so this story documents the save-as mode for reference.
 * Screenshot workflow should capture Default story and manually check checkbox.
 */
export const SaveAsDocumentation: Story = {
  args: {
    open: true,
    filename: "employees.xlsx",
  },
};
