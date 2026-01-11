import type { Meta, StoryObj } from "@storybook/react";
import { NotificationBanner } from "./NotificationBanner";
import Box from "@mui/material/Box";
import CloudDownload from "@mui/icons-material/CloudDownload";

const meta: Meta<typeof NotificationBanner> = {
  title: "App/Notifications/NotificationBanner",
  component: NotificationBanner,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "A persistent banner notification component for system-level messages like auto-updates, warnings, and important announcements. Supports progress indicators, custom actions, and theming.",
      },
    },
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["info", "success", "warning", "error"],
      description: "Visual style variant",
    },
    title: {
      control: "text",
      description: "Main notification message",
    },
    description: {
      control: "text",
      description: "Optional secondary description text",
    },
    closable: {
      control: "boolean",
      description: "Whether the notification can be dismissed",
    },
    floating: {
      control: "boolean",
      description:
        "Whether to display as a floating notification at the top center of the viewport",
    },
  },
  decorators: [
    (Story) => (
      <Box sx={{ maxWidth: "800px", margin: "0 auto", padding: 2 }}>
        <Story />
      </Box>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof NotificationBanner>;

// Basic Variants
export const Info: Story = {
  args: {
    variant: "info",
    title: "Version 0.9.1 is available",
    closable: true,
  },
  tags: ["screenshot"],
  parameters: {
    screenshot: { enabled: true, id: "notification-banner-info" },
    docs: {
      description: {
        story: "Basic info notification with dismiss option.",
      },
    },
  },
};

export const InfoWithActions: Story = {
  args: {
    variant: "info",
    title: "Important system announcement",
    actions: [
      {
        label: "Learn More",
        onClick: () => console.log("Learn more clicked"),
        variant: "contained",
      },
      {
        label: "Dismiss",
        onClick: () => console.log("Dismiss clicked"),
        variant: "text",
      },
    ],
    closable: false,
  },
  tags: ["screenshot"],
  parameters: {
    screenshot: { enabled: true, id: "notification-banner-info-actions" },
    docs: {
      description: {
        story: "Info notification with action buttons for user interaction.",
      },
    },
  },
};

export const Progress: Story = {
  args: {
    variant: "info",
    title: "Processing data...",
    progress: {
      value: 45,
    },
    closable: false,
  },
  tags: ["screenshot"],
  parameters: {
    screenshot: { enabled: true, id: "notification-banner-progress" },
    docs: {
      description: {
        story:
          "Progress notification with progress bar. Can be used for long-running operations like data processing or imports.",
      },
    },
  },
};

export const Success: Story = {
  args: {
    variant: "success",
    title: "Update 0.9.1 is ready to install",
    icon: <CloudDownload />,
    actions: [
      {
        label: "Restart Now",
        onClick: () => console.log("Restart clicked"),
        variant: "contained",
        color: "primary",
      },
      {
        label: "Install Later",
        onClick: () => console.log("Later clicked"),
        variant: "text",
      },
    ],
    closable: false,
  },
  tags: ["screenshot"],
  parameters: {
    screenshot: { enabled: true, id: "notification-banner-success" },
    docs: {
      description: {
        story:
          "Success notification indicating completed action with prominent primary action button.",
      },
    },
  },
};

export const SuccessSimple: Story = {
  args: {
    variant: "success",
    title: "LLM summary completed successfully",
    closable: true,
  },
  tags: ["screenshot"],
  parameters: {
    screenshot: { enabled: true, id: "notification-banner-success-simple" },
    docs: {
      description: {
        story: "Simple success notification with dismiss option.",
      },
    },
  },
};

export const Warning: Story = {
  args: {
    variant: "warning",
    title: "LLM processing may take up to 2 minutes",
    description:
      "Complex analyses with large datasets require additional processing time. You can continue working while the summary is being generated.",
    actions: [
      {
        label: "Got it",
        onClick: () => console.log("Acknowledged"),
        variant: "text",
      },
    ],
  },
  tags: ["screenshot"],
  parameters: {
    screenshot: { enabled: true, id: "notification-banner-warning" },
    docs: {
      description: {
        story:
          "Warning notification with title and description to provide context and set expectations.",
      },
    },
  },
};

export const WarningSimple: Story = {
  args: {
    variant: "warning",
    title: "Unsaved changes will be lost",
    closable: true,
  },
  tags: ["screenshot"],
  parameters: {
    screenshot: { enabled: true, id: "notification-banner-warning-simple" },
    docs: {
      description: {
        story: "Simple warning notification for quick alerts.",
      },
    },
  },
};

export const Error: Story = {
  args: {
    variant: "error",
    title: "Connection Failed",
    description:
      "Unable to connect to update server. Please check your network connection and try again.",
    actions: [
      {
        label: "Retry",
        onClick: () => console.log("Retry clicked"),
        variant: "outlined",
      },
      {
        label: "Dismiss",
        onClick: () => console.log("Dismiss clicked"),
        variant: "text",
      },
    ],
  },
  tags: ["screenshot"],
  parameters: {
    screenshot: { enabled: true, id: "notification-banner-error" },
    docs: {
      description: {
        story:
          "Error notification with detailed description and recovery actions (retry and dismiss).",
      },
    },
  },
};

export const ErrorSimple: Story = {
  args: {
    variant: "error",
    title: "Failed to load data",
    closable: true,
  },
  tags: ["screenshot"],
  parameters: {
    screenshot: { enabled: true, id: "notification-banner-error-simple" },
    docs: {
      description: {
        story: "Simple error notification for quick error messages.",
      },
    },
  },
};

// Use Case Examples

// Note: Auto-update now downloads silently, so we only show "ready to install" notification
// The "Update Available" and "Downloading" states are no longer shown to users

export const AutoUpdateReady: Story = {
  name: "Use Case: Auto-Update Ready (Silent Download)",
  args: {
    variant: "success",
    title: "Update 0.9.1 is ready",
    description: "Restart to install and enjoy the latest features",
    icon: <CloudDownload />,
    actions: [
      {
        label: "Restart Now",
        onClick: () => console.log("Restarting application..."),
        variant: "contained",
        color: "primary",
      },
      {
        label: "Later",
        onClick: () => console.log("Install deferred"),
        variant: "text",
      },
    ],
    closable: false,
  },
  tags: ["screenshot"],
  parameters: {
    screenshot: { enabled: true, id: "notification-banner-use-case-ready" },
    docs: {
      description: {
        story:
          "Real-world use case: Update silently downloaded in background and ready for installation. This is the ONLY notification users see since download happens automatically.",
      },
    },
  },
};

export const AutoUpdateReadyFloating: Story = {
  name: "Use Case: Auto-Update Ready (Floating)",
  args: {
    variant: "success",
    title: "Update 0.9.1 is ready",
    description: "Restart to install and enjoy the latest features",
    icon: <CloudDownload />,
    floating: true,
    actions: [
      {
        label: "Restart Now",
        onClick: () => console.log("Restarting application..."),
        variant: "contained",
        color: "primary",
      },
    ],
    closable: true,
    onClose: () => console.log("Dismissed"),
  },
  tags: ["screenshot"],
  parameters: {
    screenshot: {
      enabled: true,
      id: "notification-banner-use-case-ready-floating",
    },
    layout: "fullscreen",
    docs: {
      description: {
        story:
          "Floating variant: Non-intrusive notification at top center of viewport. Close button (X) in top-right corner follows window control convention. Primary action (Restart Now) in bottom-right follows modal dialog pattern. No redundant 'Later' button - use X to dismiss.",
      },
    },
  },
};

export const LLMProcessing: Story = {
  name: "Use Case: LLM Processing (Banner)",
  args: {
    variant: "info",
    title: "Generating LLM summary...",
    description: "Processing 200 employees. This may take a moment.",
    progress: {
      value: 35,
    },
    closable: false,
  },
  tags: ["screenshot"],
  parameters: {
    screenshot: { enabled: true, id: "notification-banner-use-case-llm" },
    docs: {
      description: {
        story:
          "Alternative approach: Using a banner for long-running LLM processing. Note: For LLM completion notifications, use Toasts (see Toast stories) for better UX.",
      },
    },
  },
};

export const NetworkError: Story = {
  name: "Use Case: Network Error",
  args: {
    variant: "error",
    title: "Update Check Failed",
    description:
      "Unable to connect to update server. Check your internet connection and try again.",
    actions: [
      {
        label: "Retry",
        onClick: () => console.log("Retrying..."),
        variant: "outlined",
      },
      {
        label: "Dismiss",
        onClick: () => console.log("Dismissed"),
        variant: "text",
      },
    ],
  },
  tags: ["screenshot"],
  parameters: {
    screenshot: { enabled: true, id: "notification-banner-use-case-network" },
    docs: {
      description: {
        story:
          "Real-world use case: Network error with retry and dismiss options.",
      },
    },
  },
};

// Comparison View
export const AllVariants: Story = {
  name: "All Variants Comparison",
  render: () => (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <NotificationBanner
        variant="info"
        title="Info: Version 0.9.1 is available"
        actions={[
          { label: "Download", onClick: () => {}, variant: "contained" },
          { label: "Dismiss", onClick: () => {}, variant: "text" },
        ]}
      />
      <NotificationBanner
        variant="success"
        title="Success: Update ready to install"
        actions={[
          { label: "Restart", onClick: () => {}, variant: "contained" },
        ]}
      />
      <NotificationBanner
        variant="warning"
        title="Warning: Processing may take up to 2 minutes"
        closable={true}
      />
      <NotificationBanner
        variant="error"
        title="Error: Connection failed"
        description="Unable to connect to server"
        actions={[{ label: "Retry", onClick: () => {}, variant: "outlined" }]}
      />
    </Box>
  ),
  tags: ["screenshot"],
  parameters: {
    screenshot: { enabled: true, id: "notification-banner-all-variants" },
    docs: {
      description: {
        story:
          "Side-by-side comparison of all notification variants for design review.",
      },
    },
  },
};

// Dark Mode Test
export const DarkModeComparison: Story = {
  name: "Dark Mode Variants",
  render: () => (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <NotificationBanner
        variant="info"
        title="Info notification in dark mode"
        actions={[{ label: "Action", onClick: () => {}, variant: "text" }]}
      />
      <NotificationBanner
        variant="success"
        title="Success notification in dark mode"
        closable={true}
      />
      <NotificationBanner
        variant="warning"
        title="Warning notification in dark mode"
        description="Additional context in dark mode"
      />
      <NotificationBanner
        variant="error"
        title="Error notification in dark mode"
        actions={[{ label: "Retry", onClick: () => {}, variant: "outlined" }]}
      />
    </Box>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "All variants in dark mode. Toggle theme in Storybook toolbar to compare.",
      },
    },
  },
};
