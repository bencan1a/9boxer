/**
 * Storybook stories for ConfirmDialog component
 */

import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { ConfirmDialog } from "./ConfirmDialog";
import Button from "@mui/material/Button";

const meta = {
  title: "Common/ConfirmDialog",
  component: ConfirmDialog,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A reusable confirmation dialog component for user actions that require confirmation.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    confirmColor: {
      control: "select",
      options: ["primary", "secondary", "error", "warning", "info", "success"],
    },
    maxWidth: {
      control: "select",
      options: ["xs", "sm", "md", "lg", "xl"],
    },
  },
} satisfies Meta<typeof ConfirmDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

// Wrapper component to handle open/close state
const DialogWrapper = (args: any) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="contained" onClick={() => setOpen(true)}>
        Open Dialog
      </Button>
      <ConfirmDialog
        {...args}
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={() => {
          alert("Confirmed!");
          setOpen(false);
        }}
      />
    </>
  );
};

/**
 * Default confirmation dialog
 */
export const Default: Story = {
  render: (args) => <DialogWrapper {...args} />,
  args: {
    title: "Confirm Action",
    message: "Are you sure you want to proceed with this action?",
  },
};

/**
 * Delete confirmation with error color
 */
export const DeleteConfirmation: Story = {
  render: (args) => <DialogWrapper {...args} />,
  args: {
    title: "Delete Employee",
    message:
      "Are you sure you want to delete this employee? This action cannot be undone.",
    confirmLabel: "Delete",
    cancelLabel: "Cancel",
    confirmColor: "error",
  },
};

/**
 * Discard changes confirmation
 */
export const DiscardChanges: Story = {
  render: (args) => <DialogWrapper {...args} />,
  args: {
    title: "Discard Changes",
    message: "You have unsaved changes. Are you sure you want to discard them?",
    confirmLabel: "Discard",
    cancelLabel: "Keep Editing",
    confirmColor: "warning",
  },
};

/**
 * Success action confirmation
 */
export const SuccessAction: Story = {
  render: (args) => <DialogWrapper {...args} />,
  args: {
    title: "Approve Changes",
    message: "Are you sure you want to approve and publish these changes?",
    confirmLabel: "Approve",
    cancelLabel: "Cancel",
    confirmColor: "success",
  },
};

/**
 * Loading state
 */
export const Loading: Story = {
  render: (args) => <DialogWrapper {...args} />,
  args: {
    title: "Processing",
    message: "Please wait while we process your request...",
    confirmLabel: "Confirm",
    cancelLabel: "Cancel",
    loading: true,
  },
};

/**
 * Large dialog with more content
 */
export const Large: Story = {
  render: (args) => <DialogWrapper {...args} />,
  args: {
    title: "Important Notice",
    message:
      "This is a longer message that provides more detailed information about the action you're about to take. Please read carefully before confirming.",
    maxWidth: "sm",
    confirmLabel: "I Understand",
    cancelLabel: "Go Back",
  },
};

/**
 * Usage example: Export confirmation
 */
export const ExportConfirmation: Story = {
  render: (args) => <DialogWrapper {...args} />,
  args: {
    title: "Export Data",
    message: "This will export all employee data to an Excel file. Continue?",
    confirmLabel: "Export",
    cancelLabel: "Cancel",
    confirmColor: "primary",
  },
  parameters: {
    docs: {
      description: {
        story: "Example usage for confirming data export",
      },
    },
  },
};
