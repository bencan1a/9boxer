/**
 * ConnectionStatus Component
 *
 * Displays a visual indicator of the backend connection status in the top-right corner.
 * Shows:
 * - Green: Connected and healthy
 * - Yellow: Reconnecting (with retry count)
 * - Red: Disconnected (with manual retry button)
 */

import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import { Refresh as RefreshIcon } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { useConnectionStatus } from "../../hooks/useConnectionStatus";

export function ConnectionStatus() {
  const theme = useTheme();
  const { t } = useTranslation();
  const { status, retryCount, manualRetry } = useConnectionStatus();

  // Configuration for each status
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
        icon={
          <span style={{ fontSize: theme.tokens.typography.fontSize.body2 }}>
            {config.icon}
          </span>
        }
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
}
