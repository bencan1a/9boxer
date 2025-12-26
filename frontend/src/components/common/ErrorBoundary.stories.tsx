import type { Meta, StoryObj } from "@storybook/react-vite";
import { ErrorBoundary } from "./ErrorBoundary";
import { Box, Typography, Button } from "@mui/material";
import { useState } from "react";

// Component that throws an error on demand
const ErrorThrowingComponent = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error(
      "This is a simulated error for testing the ErrorBoundary component"
    );
  }
  return (
    <Box sx={{ padding: 3, textAlign: "center" }}>
      <Typography variant="h5" gutterBottom>
        Normal Component Content
      </Typography>
      <Typography variant="body1" color="text.secondary">
        This content is displayed when there are no errors. The ErrorBoundary
        wraps this component and will catch any rendering errors that occur.
      </Typography>
    </Box>
  );
};

// Interactive wrapper to demonstrate error catching
const InteractiveErrorDemo = () => {
  const [shouldThrow, setShouldThrow] = useState(false);

  return (
    <ErrorBoundary>
      {!shouldThrow && (
        <Box sx={{ padding: 3, textAlign: "center" }}>
          <Typography variant="h5" gutterBottom>
            Interactive Error Boundary Demo
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Click the button below to simulate a component error. The
            ErrorBoundary will catch it and display the error UI.
          </Typography>
          <Button
            variant="contained"
            color="error"
            onClick={() => setShouldThrow(true)}
          >
            Trigger Error
          </Button>
        </Box>
      )}
      <ErrorThrowingComponent shouldThrow={shouldThrow} />
    </ErrorBoundary>
  );
};

const meta: Meta<typeof ErrorBoundary> = {
  title: "Common/ErrorBoundary",
  component: ErrorBoundary,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Error boundary component that catches React rendering errors and displays a user-friendly error screen. " +
          "Prevents the entire app from crashing when a component error occurs. " +
          'Shows the error message in development mode and provides a "Return Home" button to recover. ' +
          "Logs all errors using the logger utility for debugging.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof ErrorBoundary>;

/**
 * Default state - no error, shows children normally.
 * The ErrorBoundary is transparent when no errors occur.
 */
export const Default: Story = {
  render: () => (
    <ErrorBoundary>
      <Box sx={{ padding: 3, textAlign: "center" }}>
        <Typography variant="h5" gutterBottom>
          Normal Application Content
        </Typography>
        <Typography variant="body1" color="text.secondary">
          When there are no errors, the ErrorBoundary simply renders its
          children as-is. It acts as a safety net that only activates when a
          component error occurs.
        </Typography>
      </Box>
    </ErrorBoundary>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "The default state shows normal children content. The ErrorBoundary is completely " +
          "transparent and has no effect on the UI when everything is working correctly.",
      },
    },
  },
};

/**
 * Error state - shows error UI with message and recovery button.
 * Demonstrates the error screen that users see when a component crashes.
 */
export const WithError: Story = {
  render: () => (
    <ErrorBoundary>
      <ErrorThrowingComponent shouldThrow={true} />
    </ErrorBoundary>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "When a component throws an error, the ErrorBoundary catches it and displays:\n\n" +
          "- Error icon (red warning symbol)\n" +
          "- User-friendly title from i18n translations\n" +
          "- Descriptive error message\n" +
          "- Error details box (in development mode) showing the error stack trace\n" +
          '- "Return Home" button to recover by redirecting to the root path\n\n' +
          "The error is also logged to the console via the logger utility for debugging.",
      },
    },
  },
};

/**
 * Interactive demo - trigger error on demand.
 * Allows testing the ErrorBoundary behavior interactively.
 */
export const InteractiveDemo: Story = {
  render: () => <InteractiveErrorDemo />,
  parameters: {
    docs: {
      description: {
        story:
          'Click the "Trigger Error" button to simulate a component error. ' +
          "This demonstrates how the ErrorBoundary catches the error and prevents the entire app from crashing. " +
          'Note: In Storybook, the "Return Home" button will not work as expected since we\'re not in a full routing context.',
      },
    },
  },
};
