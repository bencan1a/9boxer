import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import Alert from "@mui/material/Alert";
import Divider from "@mui/material/Divider";
import RefreshIcon from "@mui/icons-material/Refresh";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import InfoIcon from "@mui/icons-material/Info";

interface UpdateStatus {
  currentVersion: string;
  updateAvailable: boolean;
  updateVersion: string | null;
  downloadInProgress: boolean;
  updateDownloaded: boolean;
}

/**
 * Debug panel for auto-update troubleshooting
 * Shows detailed update status, log file access, and manual controls
 */
export const UpdateDebugPanel: React.FC = () => {
  const [status, setStatus] = useState<UpdateStatus | null>(null);
  const [logPath, setLogPath] = useState<string | null>(null);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load initial status and log path
  useEffect(() => {
    if (!window.electronAPI?.update) {
      return;
    }

    // Get status
    window.electronAPI.update.getStatus().then(setStatus);

    // Get log path
    window.electronAPI.update.getLogPath().then(setLogPath);

    // Listen for update events
    const cleanupError = window.electronAPI.update.onUpdateError((err) => {
      setError(err.message);
      setChecking(false);
    });

    const cleanupAvailable = window.electronAPI.update.onUpdateAvailable(() => {
      setLastCheck(new Date());
      setChecking(false);
      // Refresh status
      window.electronAPI?.update.getStatus().then(setStatus);
    });

    return () => {
      cleanupError();
      cleanupAvailable();
    };
  }, []);

  const handleCheckForUpdates = async () => {
    if (!window.electronAPI?.update) return;

    setChecking(true);
    setError(null);
    setLastCheck(new Date());

    try {
      await window.electronAPI.update.checkForUpdates();
      // Refresh status after check
      setTimeout(async () => {
        const newStatus = await window.electronAPI?.update.getStatus();
        setStatus(newStatus || null);
        setChecking(false);
      }, 2000); // Wait 2 seconds for update check to complete
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to check for updates";
      setError(errorMessage);
      setChecking(false);
    }
  };

  const handleOpenLogFile = async () => {
    if (!window.electronAPI?.update) return;

    try {
      const result = await window.electronAPI.update.openLogFile();
      if (!result.success) {
        setError("Failed to open log file");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to open log file";
      setError(errorMessage);
    }
  };

  if (!window.electronAPI?.update) {
    return (
      <Alert severity="warning">
        Auto-update debugging is only available in the desktop app
      </Alert>
    );
  }

  if (!status) {
    return <Typography>Loading update status...</Typography>;
  }

  return (
    <Card>
      <CardContent>
        <Stack spacing={2}>
          <Box>
            <Typography variant="h6" gutterBottom>
              Auto-Update Debug Panel
            </Typography>
            <Typography variant="body2" color="text.secondary">
              View detailed update information and access diagnostic logs
            </Typography>
          </Box>

          <Divider />

          {/* Current Status */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Status
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
              <Chip
                label={`Version: ${status.currentVersion}`}
                color="primary"
                size="small"
              />
              {status.updateAvailable && (
                <Chip
                  label={`Update Available: ${status.updateVersion}`}
                  color="success"
                  size="small"
                />
              )}
              {status.downloadInProgress && (
                <Chip label="Downloading..." color="info" size="small" />
              )}
              {status.updateDownloaded && (
                <Chip label="Ready to Install" color="success" size="small" />
              )}
              {!status.updateAvailable &&
                !status.downloadInProgress &&
                !status.updateDownloaded && (
                  <Chip label="Up to Date" color="default" size="small" />
                )}
            </Stack>
          </Box>

          {/* Last Check */}
          {lastCheck && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Last Check
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {lastCheck.toLocaleString()}
              </Typography>
            </Box>
          )}

          {/* Log File Path */}
          {logPath && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Log File Location
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  fontFamily: "monospace",
                  fontSize: "0.75rem",
                  wordBreak: "break-all",
                  backgroundColor: "action.hover",
                  padding: 1,
                  borderRadius: 1,
                }}
              >
                {logPath}
              </Typography>
            </Box>
          )}

          {/* Error Display */}
          {error && (
            <Alert
              severity="error"
              onClose={() => setError(null)}
              icon={<InfoIcon />}
            >
              <Typography variant="body2" fontWeight="medium">
                Error
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  fontFamily: "monospace",
                  display: "block",
                  mt: 0.5,
                  wordBreak: "break-all",
                }}
              >
                {error}
              </Typography>
            </Alert>
          )}

          {/* Actions */}
          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={handleCheckForUpdates}
              disabled={checking}
            >
              {checking ? "Checking..." : "Check for Updates"}
            </Button>
            <Button
              variant="outlined"
              startIcon={<FolderOpenIcon />}
              onClick={handleOpenLogFile}
            >
              Open Log File
            </Button>
          </Stack>

          {/* Help Text */}
          <Alert severity="info" icon={<InfoIcon />}>
            <Typography variant="body2">
              <strong>Troubleshooting Tips:</strong>
            </Typography>
            <Typography variant="caption" component="div" sx={{ mt: 0.5 }}>
              • The app checks for updates every 6 hours automatically
              <br />
              • Updates download in the background when available
              <br />
              • Check the log file for detailed diagnostic information
              <br />• Look for network errors, 404 errors (missing files), or
              verification issues
            </Typography>
          </Alert>
        </Stack>
      </CardContent>
    </Card>
  );
};
