import type { Meta, StoryObj } from "@storybook/react";
import { Toast } from "./Toast";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { useState } from "react";

const meta: Meta<typeof Toast> = {
  title: "App/Notifications/Toast",
  component: Toast,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "A transient toast notification component for quick feedback messages. Auto-dismisses after a set duration (default 4s) and supports actions, pause-on-hover, and persistent mode.",
      },
    },
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["info", "success", "warning", "error"],
      description: "Visual style variant",
    },
    message: {
      control: "text",
      description: "Main notification message",
    },
    title: {
      control: "text",
      description: "Optional title above message",
    },
    persistent: {
      control: "boolean",
      description: "Prevents auto-dismiss, requires manual close",
    },
    duration: {
      control: "number",
      description: "Auto-dismiss duration in milliseconds (default 4000)",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Toast>;

// Helper component to manage toast open state
const ToastWrapperComponent: React.FC<React.ComponentProps<typeof Toast>> = (
  args
) => {
  const [open, setOpen] = useState(false);

  return (
    <Box sx={{ padding: 4 }}>
      <Button variant="contained" onClick={() => setOpen(true)}>
        Show Toast
      </Button>
      <Toast {...args} open={open} onClose={() => setOpen(false)} />
    </Box>
  );
};

// Basic Variants
export const Info: Story = {
  render: (args) => <ToastWrapperComponent {...args} />,
  args: {
    variant: "info",
    message: "New update is available",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Basic info toast that auto-dismisses after 4 seconds. Click 'Show Toast' to preview.",
      },
    },
  },
};

export const Success: Story = {
  render: (args) => <ToastWrapperComponent {...args} />,
  args: {
    variant: "success",
    message: "Changes saved successfully",
  },
  parameters: {
    docs: {
      description: {
        story: "Success toast for positive action confirmation.",
      },
    },
  },
};

export const Warning: Story = {
  render: (args) => <ToastWrapperComponent {...args} />,
  args: {
    variant: "warning",
    message: "Connection unstable, attempting to reconnect...",
  },
  parameters: {
    docs: {
      description: {
        story: "Warning toast for cautionary messages.",
      },
    },
  },
};

export const Error: Story = {
  render: (args) => <ToastWrapperComponent {...args} />,
  args: {
    variant: "error",
    message: "Failed to save changes",
  },
  parameters: {
    docs: {
      description: {
        story: "Error toast for failure notifications.",
      },
    },
  },
};

// With Title
export const WithTitle: Story = {
  render: (args) => <ToastWrapperComponent {...args} />,
  args: {
    variant: "info",
    title: "Information",
    message: "LLM summary processing has started",
  },
  parameters: {
    docs: {
      description: {
        story: "Toast with title for additional context.",
      },
    },
  },
};

// With Action
export const WithAction: Story = {
  render: (args) => <ToastWrapperComponent {...args} />,
  args: {
    variant: "success",
    message: "LLM summary completed",
    action: {
      label: "View",
      onClick: () => console.log("View action clicked"),
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          "Toast with action button. Clicking the action button automatically closes the toast.",
      },
    },
  },
};

export const WithActionAndTitle: Story = {
  render: (args) => <ToastWrapperComponent {...args} />,
  args: {
    variant: "success",
    title: "Success",
    message: "File uploaded successfully",
    action: {
      label: "View File",
      onClick: () => console.log("View file clicked"),
    },
  },
  parameters: {
    docs: {
      description: {
        story: "Toast with both title and action button.",
      },
    },
  },
};

// Persistent
export const Persistent: Story = {
  render: (args) => <ToastWrapperComponent {...args} />,
  args: {
    variant: "error",
    message: "Connection lost. Please check your network.",
    persistent: true,
    action: {
      label: "Retry",
      onClick: () => console.log("Retry clicked"),
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          "Persistent toast that doesn't auto-dismiss. User must click action or close button.",
      },
    },
  },
};

// Custom Duration
export const ShortDuration: Story = {
  render: (args) => <ToastWrapperComponent {...args} />,
  args: {
    variant: "info",
    message: "Quick notification (2 seconds)",
    duration: 2000,
  },
  parameters: {
    docs: {
      description: {
        story: "Toast with shorter duration (2 seconds instead of default 4).",
      },
    },
  },
};

export const LongDuration: Story = {
  render: (args) => <ToastWrapperComponent {...args} />,
  args: {
    variant: "warning",
    message: "Important message with longer duration (6 seconds)",
    duration: 6000,
  },
  parameters: {
    docs: {
      description: {
        story: "Toast with longer duration (6 seconds) for important messages.",
      },
    },
  },
};

// Use Cases
export const LLMSummaryCompleted: Story = {
  name: "Use Case: LLM Summary Completed",
  render: (args) => <ToastWrapperComponent {...args} />,
  args: {
    variant: "success",
    message: "LLM summary completed",
    action: {
      label: "View",
      onClick: () => console.log("Navigating to Intelligence tab..."),
    },
    duration: 6000,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Real-world use case: Notify user when LLM processing completes with option to view results.",
      },
    },
  },
};

export const LLMSummaryStarted: Story = {
  name: "Use Case: LLM Summary Started",
  render: (args) => <ToastWrapperComponent {...args} />,
  args: {
    variant: "info",
    message: "Generating LLM summary...",
    duration: 2000,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Real-world use case: Brief notification when LLM processing starts.",
      },
    },
  },
};

export const LLMSummaryFailed: Story = {
  name: "Use Case: LLM Summary Failed",
  render: (args) => <ToastWrapperComponent {...args} />,
  args: {
    variant: "error",
    message: "LLM summary generation failed",
    action: {
      label: "Retry",
      onClick: () => console.log("Retrying LLM processing..."),
    },
    persistent: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Real-world use case: Error notification with retry option, stays visible until action.",
      },
    },
  },
};

export const FileUploadSuccess: Story = {
  name: "Use Case: File Upload",
  render: (args) => <ToastWrapperComponent {...args} />,
  args: {
    variant: "success",
    message: "Sample dataset loaded successfully",
    action: {
      label: "Undo",
      onClick: () => console.log("Undoing file upload..."),
    },
    duration: 6000,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Real-world use case: File upload confirmation with undo option.",
      },
    },
  },
};

export const ChangesSaved: Story = {
  name: "Use Case: Changes Saved",
  render: (args) => <ToastWrapperComponent {...args} />,
  args: {
    variant: "success",
    message: "Changes saved",
    duration: 3000,
  },
  parameters: {
    docs: {
      description: {
        story: "Real-world use case: Simple save confirmation.",
      },
    },
  },
};

export const ConnectionLost: Story = {
  name: "Use Case: Connection Lost",
  render: (args) => <ToastWrapperComponent {...args} />,
  args: {
    variant: "error",
    message: "Connection lost",
    action: {
      label: "Retry",
      onClick: () => console.log("Attempting to reconnect..."),
    },
    persistent: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Real-world use case: Persistent error notification for connection issues.",
      },
    },
  },
};

// Queue Demo Component
const QueueDemoComponent: React.FC = () => {
  const [toasts, setToasts] = useState<Array<{ id: number; open: boolean }>>(
    []
  );
  let nextId = 0;

  const showToast = () => {
    const id = nextId++;
    setToasts((prev) => [...prev, { id, open: true }]);

    // Auto-remove after duration
    setTimeout(() => {
      setToasts((prev) =>
        prev.map((t) => (t.id === id ? { ...t, open: false } : t))
      );
    }, 4000);
  };

  const variants: Array<"info" | "success" | "warning" | "error"> = [
    "info",
    "success",
    "warning",
    "error",
  ];

  return (
    <Box sx={{ padding: 4 }}>
      <Button variant="contained" onClick={showToast}>
        Add Toast to Queue
      </Button>
      <Box sx={{ mt: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Click multiple times to see queue behavior. Only one toast displays at
          a time.
        </Typography>
      </Box>
      {toasts.map((toast, index) => (
        <Toast
          key={toast.id}
          variant={variants[index % 4]}
          message={`Toast ${toast.id + 1}`}
          open={toast.open}
          onClose={() =>
            setToasts((prev) =>
              prev.map((t) => (t.id === toast.id ? { ...t, open: false } : t))
            )
          }
        />
      ))}
    </Box>
  );
};

// Queue Demo
export const QueueDemo: Story = {
  name: "Queue Demonstration",
  render: () => <QueueDemoComponent />,
  parameters: {
    docs: {
      description: {
        story:
          "Demonstrates queue behavior when multiple toasts are triggered. Only one toast displays at a time.",
      },
    },
  },
};

// All Variants Component
const AllVariantsComponent: React.FC = () => {
  const [openToasts, setOpenToasts] = useState({
    info: false,
    success: false,
    warning: false,
    error: false,
  });

  const showAll = () => {
    setOpenToasts({ info: true, success: true, warning: true, error: true });
  };

  return (
    <Box sx={{ padding: 4 }}>
      <Button variant="contained" onClick={showAll}>
        Show All Variants
      </Button>
      <Box sx={{ mt: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Note: In production, toasts would queue. This is for visual design
          reference only.
        </Typography>
      </Box>

      <Toast
        variant="info"
        message="Info notification"
        open={openToasts.info}
        onClose={() => setOpenToasts((prev) => ({ ...prev, info: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "left" }}
      />
      <Toast
        variant="success"
        message="Success notification"
        open={openToasts.success}
        onClose={() => setOpenToasts((prev) => ({ ...prev, success: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      />
      <Toast
        variant="warning"
        message="Warning notification"
        open={openToasts.warning}
        onClose={() => setOpenToasts((prev) => ({ ...prev, warning: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      />
      <Toast
        variant="error"
        message="Error notification"
        open={openToasts.error}
        onClose={() => setOpenToasts((prev) => ({ ...prev, error: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
    </Box>
  );
};

// All Variants Comparison
export const AllVariants: Story = {
  name: "All Variants (Visual Reference)",
  render: () => <AllVariantsComponent />,
  parameters: {
    docs: {
      description: {
        story:
          "Visual reference showing all toast variants. In production, these would queue rather than display simultaneously.",
      },
    },
  },
};
