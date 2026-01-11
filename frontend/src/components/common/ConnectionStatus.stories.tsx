import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Box from "@mui/material/Box";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useTranslation } from "react-i18next";

// Create a standalone component that mimics ConnectionStatus behavior
// without requiring the actual hook (which needs Electron/backend)
const ConnectionStatusDemo = ({
  status = "connected",
  retryCount = 0,
}: {
  status?: "connected" | "reconnecting" | "disconnected";
  retryCount?: number;
}) => {
  const { t } = useTranslation();
  const manualRetry = fn();

  // Configuration for each status (same as the real component)
  const statusConfig = {
    connected: {
      color: "success" as const,
      label: t("common.connectionStatus.connected"),
      icon: "🟢",
    },
    reconnecting: {
      color: "warning" as const,
      label:
        retryCount > 0
          ? t("common.connectionStatus.reconnectingWithCount", {
              count: retryCount,
            })
          : t("common.connectionStatus.reconnecting"),
      icon: "🟡",
    },
    disconnected: {
      color: "error" as const,
      label: t("common.connectionStatus.disconnected"),
      icon: "🔴",
    },
  };

  const config = statusConfig[status];

  return (
    <Box
      sx={{
        position: "fixed",
        top: 16,
        right: 16,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        gap: 1,
      }}
    >
      <Chip
        icon={<span style={{ fontSize: "14px" }}>{config.icon}</span>}
        label={config.label}
        color={config.color}
        size="small"
        variant="filled"
        sx={{
          fontWeight: 500,
          boxShadow: 2,
        }}
      />
      {status === "disconnected" && (
        <IconButton
          size="small"
          color="error"
          onClick={manualRetry}
          title={t("common.retryConnection")}
          sx={{
            boxShadow: 2,
            bgcolor: "background.paper",
            "&:hover": {
              bgcolor: "background.default",
            },
          }}
        >
          <RefreshIcon fontSize="small" />
        </IconButton>
      )}
    </Box>
  );
};

const meta: Meta<typeof ConnectionStatusDemo> = {
  title: "App/Common/ConnectionStatus",
  component: ConnectionStatusDemo,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Displays the backend connection status in the top-right corner. " +
          "Shows green when connected, yellow when reconnecting, and red when disconnected. " +
          "Includes a retry button when disconnected.",
      },
    },
  },
  argTypes: {
    status: {
      control: "select",
      options: ["connected", "reconnecting", "disconnected"],
      description: "Current connection status",
    },
    retryCount: {
      control: { type: "number", min: 0, max: 10 },
      description: "Number of retry attempts (shown when reconnecting)",
    },
  },
};

export default meta;
type Story = StoryObj<typeof ConnectionStatusDemo>;

/**
 * Connected state - green chip indicator.
 * Shows when the backend is healthy and responding.
 */
export const Connected: Story = {
  args: {
    status: "connected",
    retryCount: 0,
  },
  parameters: {
    docs: {
      description: {
        story:
          "The default healthy state. Shows a green chip with a checkmark emoji " +
          'and "Connected" label. No retry button is shown.',
      },
    },
  },
};

/**
 * Reconnecting state - yellow chip with retry count.
 * Shows when the app is attempting to reconnect to the backend.
 */
export const Reconnecting: Story = {
  args: {
    status: "reconnecting",
    retryCount: 3,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Shown during automatic reconnection attempts. The chip is yellow and displays " +
          "the retry count. This appears when the backend becomes temporarily unavailable.",
      },
    },
  },
};

/**
 * Disconnected state - red chip with manual retry button.
 * Shows when the backend connection is lost and automatic retries have failed.
 */
export const Disconnected: Story = {
  args: {
    status: "disconnected",
    retryCount: 0,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Shown when the connection is lost and automatic reconnection has failed. " +
          "The chip is red and includes a manual retry button (refresh icon) that users " +
          "can click to attempt reconnection.",
      },
    },
  },
};

/**
 * Reconnecting without count - shows just the status.
 * Initial reconnection attempt before retry counter starts.
 */
export const ReconnectingInitial: Story = {
  args: {
    status: "reconnecting",
    retryCount: 0,
  },
  parameters: {
    docs: {
      description: {
        story:
          "The first reconnection attempt, before the retry counter increments. " +
          'Shows "Reconnecting..." without a count.',
      },
    },
  },
};
