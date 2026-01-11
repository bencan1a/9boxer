/**
 * Storybook stories for LoadSampleDialog component
 */

import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "storybook/test";
import { useState } from "react";
import { LoadSampleDialog } from "./LoadSampleDialog";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";

const meta = {
  title: "App/Dialogs/LoadSampleDialog",
  component: LoadSampleDialog,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Confirmation dialog for loading sample employee data. Warns users if existing data will be replaced.",
      },
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof LoadSampleDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

// Wrapper component to handle open/close state
const DialogWrapper = (args: {
  hasExistingData: boolean;
  simulateError?: boolean;
  simulateDelay?: boolean;
}) => {
  const [open, setOpen] = useState(false);

  const handleConfirm = async () => {
    // Simulate loading delay
    if (args.simulateDelay) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    // Simulate error
    if (args.simulateError) {
      throw new globalThis.Error("Failed to generate sample data");
    }

    // Success - close dialog
    setOpen(false);
    alert("Sample data loaded successfully!");
  };

  return (
    <Box>
      <Button variant="contained" onClick={() => setOpen(true)}>
        Open Load Sample Dialog
      </Button>
      <LoadSampleDialog
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={handleConfirm}
        hasExistingData={args.hasExistingData}
      />
    </Box>
  );
};

/**
 * Default state - no existing data, no warning
 */
export const NoExistingData: Story = {
  tags: ["screenshot"],
  parameters: {
    screenshot: { enabled: true, id: "quickstart-load-sample-dialog" },
    docs: {
      description: {
        story:
          "Initial load state when no data exists. Shows information about sample dataset without warnings.",
      },
    },
  },
  args: {
    open: true,
    onClose: fn(),
    onConfirm: fn(async () => {}),
    hasExistingData: false,
  },
};

/**
 * Warning state - existing data will be replaced
 */
export const WithExistingData: Story = {
  args: {
    open: true,
    onClose: fn(),
    onConfirm: fn(async () => {}),
    hasExistingData: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Shows warning when user has existing data that will be replaced.",
      },
    },
  },
};

/**
 * Loading state - data generation in progress
 * Note: This story shows the dialog ready state. Click 'Load Sample Data' to see loading spinner.
 */
export const Loading: Story = {
  args: {
    open: true,
    onClose: fn(),
    onConfirm: fn(async () => {
      // Simulate loading delay
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }),
    hasExistingData: false,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Dialog ready to load sample data. Click 'Load Sample Data' button to see loading spinner while data is being generated.",
      },
    },
  },
};

/**
 * Error state - generation failed
 * Note: This story shows the dialog ready state. Click 'Load Sample Data' to see error.
 */
export const Error: Story = {
  args: {
    open: true,
    onClose: fn(),
    onConfirm: fn(async () => {
      // Simulate error
      throw new globalThis.Error("Failed to generate sample data");
    }),
    hasExistingData: false,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Dialog ready to load sample data. Click 'Load Sample Data' button to see error message when generation fails.",
      },
    },
  },
};

/**
 * Dark mode - with existing data warning
 */
export const DarkMode: Story = {
  args: {
    open: true,
    onClose: fn(),
    onConfirm: fn(async () => {}),
    hasExistingData: true,
  },
  parameters: {
    backgrounds: { default: "dark" },
    docs: {
      description: {
        story: "Dark mode variant with existing data warning displayed.",
      },
    },
  },
};
