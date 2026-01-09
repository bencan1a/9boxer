import React, { useEffect, useState } from "react";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import LinearProgress from "@mui/material/LinearProgress";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Download from "@mui/icons-material/Download";
import Refresh from "@mui/icons-material/Refresh";
import CloudDownload from "@mui/icons-material/CloudDownload";

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
    return (
      <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
        Update failed: {error}
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
        Update {status.updateVersion} is ready to install. It will be applied
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

  // Update available, not downloaded yet
  if (status.updateAvailable && updateInfo) {
    return (
      <Alert
        severity="info"
        icon={<Refresh />}
        sx={{ mb: 2 }}
        action={
          <Button
            color="inherit"
            size="small"
            onClick={() => window.electronAPI?.update.downloadUpdate()}
          >
            Download
          </Button>
        }
      >
        <Typography variant="body2" fontWeight="medium">
          Version {updateInfo.version} is available
        </Typography>
        <Typography variant="caption" sx={{ mt: 0.5, display: "block" }}>
          Current: {status.currentVersion} • Released:{" "}
          {new Date(updateInfo.releaseDate).toLocaleDateString()}
        </Typography>
      </Alert>
    );
  }

  return null;
};
