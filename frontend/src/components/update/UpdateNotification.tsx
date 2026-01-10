import React, { useEffect, useState } from "react";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import LinearProgress from "@mui/material/LinearProgress";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Download from "@mui/icons-material/Download";
import CloudDownload from "@mui/icons-material/CloudDownload";
import {
  ERROR_MESSAGES,
  type ErrorMessageConfig,
} from "../../utils/errorMessages";

/**
 * Categorize update errors and return appropriate error message configuration
 */
function getUpdateErrorMessage(errorMessage: string): ErrorMessageConfig {
  // Check for 404 errors (missing release files)
  if (errorMessage.includes("404") && errorMessage.includes("latest.yml")) {
    return ERROR_MESSAGES.updateMetadataMissing;
  }

  // Check for network/connection errors
  if (
    errorMessage.includes("ENOTFOUND") ||
    errorMessage.includes("ECONNREFUSED") ||
    errorMessage.includes("ETIMEDOUT") ||
    errorMessage.includes("network")
  ) {
    return ERROR_MESSAGES.updateNetworkError;
  }

  // Check for server errors
  if (errorMessage.includes("500") || errorMessage.includes("503")) {
    return ERROR_MESSAGES.updateServerError;
  }

  // Check for checksum/verification errors
  if (
    errorMessage.includes("checksum") ||
    errorMessage.includes("integrity") ||
    errorMessage.includes("signature")
  ) {
    return ERROR_MESSAGES.updateVerificationFailed;
  }

  // Generic error - use fallback
  return ERROR_MESSAGES.updateGenericError;
}

interface UpdateStatus {
  currentVersion: string;
  updateAvailable: boolean;
  updateVersion: string | null;
  downloadInProgress: boolean;
  updateDownloaded: boolean;
}

interface UpdateInfo {
  version: string;
  releaseDate: string;
  releaseNotes: string;
}

interface DownloadProgress {
  percent: number;
  bytesPerSecond: number;
  transferred: number;
  total: number;
}

export const UpdateNotification: React.FC = () => {
  const [status, setStatus] = useState<UpdateStatus | null>(null);
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [progress, setProgress] = useState<DownloadProgress | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if electronAPI is available (only available in Electron environment)
    if (!window.electronAPI?.update) {
      return;
    }

    // Get initial status
    window.electronAPI.update.getStatus().then(setStatus);

    // Listen for update events
    const cleanupAvailable = window.electronAPI.update.onUpdateAvailable(
      (info) => {
        setUpdateInfo(info);
        // Refresh status when update becomes available
        window.electronAPI?.update.getStatus().then(setStatus);
      }
    );

    const cleanupProgress = window.electronAPI.update.onDownloadProgress(
      (prog) => {
        setProgress(prog);
      }
    );

    const cleanupDownloaded = window.electronAPI.update.onUpdateDownloaded(
      () => {
        // Refresh status when download completes
        window.electronAPI?.update.getStatus().then(setStatus);
        setProgress(null); // Clear progress
      }
    );

    const cleanupError = window.electronAPI.update.onUpdateError((err) => {
      setError(err.message);
      setProgress(null); // Clear progress on error
    });

    return () => {
      cleanupAvailable();
      cleanupProgress();
      cleanupDownloaded();
      cleanupError();
    };
  }, []);

  if (!status) return null;

  // Error state
  if (error) {
    const errorConfig = getUpdateErrorMessage(error);
    return (
      <Alert
        severity="error"
        onClose={() => setError(null)}
        sx={{ mb: 2 }}
        action={
          <Button
            color="inherit"
            size="small"
            onClick={() => {
              setError(null);
              window.electronAPI?.update.checkForUpdates();
            }}
          >
            Retry
          </Button>
        }
      >
        <Typography variant="body2" fontWeight="medium">
          {errorConfig.message}
        </Typography>
        <Typography
          variant="caption"
          sx={{ mt: 0.5, display: "block", opacity: 0.8 }}
        >
          {errorConfig.detail}
        </Typography>
      </Alert>
    );
  }

  // Update downloaded, ready to install
  if (status.updateDownloaded) {
    return (
      <Alert
        severity="success"
        icon={<CloudDownload />}
        sx={{ mb: 2 }}
        action={
          <Button
            color="inherit"
            size="small"
            onClick={() => window.electronAPI?.update.installAndRestart()}
          >
            Restart Now
          </Button>
        }
      >
        Update {status.updateVersion} has been downloaded and will be installed
        when you restart the app.
      </Alert>
    );
  }

  // Download in progress
  if (status.downloadInProgress && progress) {
    return (
      <Alert severity="info" icon={<Download />} sx={{ mb: 2 }}>
        <Typography variant="body2">
          Downloading update {status.updateVersion}...
        </Typography>
        <Box sx={{ mt: 1 }}>
          <LinearProgress variant="determinate" value={progress.percent} />
          <Typography variant="caption" sx={{ mt: 0.5, display: "block" }}>
            {(progress.transferred / 1024 / 1024).toFixed(1)} MB /{" "}
            {(progress.total / 1024 / 1024).toFixed(1)} MB (
            {progress.percent.toFixed(1)}%)
          </Typography>
        </Box>
      </Alert>
    );
  }

  // Update available, download starting automatically
  if (status.updateAvailable && updateInfo && !status.downloadInProgress) {
    return (
      <Alert severity="info" icon={<Download />} sx={{ mb: 2 }}>
        <Typography variant="body2" fontWeight="medium">
          Version {updateInfo.version} is available
        </Typography>
        <Typography variant="caption" sx={{ mt: 0.5, display: "block" }}>
          Current: {status.currentVersion} • Released:{" "}
          {new Date(updateInfo.releaseDate).toLocaleDateString()}
        </Typography>
        <Typography
          variant="caption"
          sx={{ mt: 0.5, display: "block", opacity: 0.8 }}
        >
          Download starting automatically...
        </Typography>
      </Alert>
    );
  }

  return null;
};
