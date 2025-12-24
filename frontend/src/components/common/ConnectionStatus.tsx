/**
 * ConnectionStatus Component
 *
 * Displays a visual indicator of the backend connection status in the top-right corner.
 * Shows:
 * - Green: Connected and healthy
 * - Yellow: Reconnecting (with retry count)
 * - Red: Disconnected (with manual retry button)
 */

import { Chip, IconButton, Box } from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';
import { useConnectionStatus } from '../../hooks/useConnectionStatus';

export function ConnectionStatus() {
  const { status, retryCount, manualRetry } = useConnectionStatus();

  // Configuration for each status
  const statusConfig = {
    connected: {
      color: 'success' as const,
      label: 'Connected',
      icon: '🟢',
    },
    reconnecting: {
      color: 'warning' as const,
      label: `Reconnecting${retryCount > 0 ? ` (${retryCount})` : ''}`,
      icon: '🟡',
    },
    disconnected: {
      color: 'error' as const,
      label: 'Disconnected',
      icon: '🔴',
    },
  };

  const config = statusConfig[status];

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 16,
        right: 16,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: 1,
      }}
    >
      <Chip
        icon={<span style={{ fontSize: '14px' }}>{config.icon}</span>}
        label={config.label}
        color={config.color}
        size="small"
        variant="filled"
        sx={{
          fontWeight: 500,
          boxShadow: 2,
        }}
      />
      {status === 'disconnected' && (
        <IconButton
          size="small"
          color="error"
          onClick={manualRetry}
          title="Retry connection"
          sx={{
            boxShadow: 2,
            bgcolor: 'background.paper',
            '&:hover': {
              bgcolor: 'background.default',
            },
          }}
        >
          <RefreshIcon fontSize="small" />
        </IconButton>
      )}
    </Box>
  );
}
