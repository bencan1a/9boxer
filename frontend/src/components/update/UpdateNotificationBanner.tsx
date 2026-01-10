import React, { useEffect, useState } from "react";
import { NotificationBanner } from "../notifications/NotificationBanner";
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

/**
 * Simplified auto-update notification banner
 *
 * Since auto-update downloads silently in the background, this component
 * only shows notifications for:
 * 1. Update ready to install (requires user action: restart)
 * 2. Download errors (optional - allows user to dismiss)
 *
 * Download progress is NOT shown as it happens silently.
 */
export const UpdateNotificationBanner: React.FC = () => {
  const [status, setStatus] = useState<UpdateStatus | null>(null);
  const [_updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
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
      (info: UpdateInfo) => {
        setUpdateInfo(info);
        // Refresh status when update becomes available
        window.electronAPI?.update.getStatus().then(setStatus);
      }
    );

    const cleanupDownloaded = window.electronAPI.update.onUpdateDownloaded(
      () => {
        // Refresh status when download completes
        window.electronAPI?.update.getStatus().then(setStatus);
      }
    );

    const cleanupError = window.electronAPI.update.onUpdateError(
      (err: { message: string }) => {
        setError(err.message);
      }
    );

    return () => {
      cleanupAvailable();
      cleanupDownloaded();
      cleanupError();
    };
  }, []);

  if (!status) return null;

  // Error state (optional - shown if silent download fails)
  if (error) {
    const errorConfig = getUpdateErrorMessage(error);
    return (
      <NotificationBanner
        variant="error"
        title={errorConfig.title}
        description={errorConfig.detail}
        actions={[
          {
            label: "Dismiss",
            onClick: () => setError(null),
            variant: "text",
          },
        ]}
        closable={true}
        onClose={() => setError(null)}
      />
    );
  }

  // Update downloaded and ready to install
  // This is the PRIMARY notification users will see
  if (status.updateDownloaded) {
    return (
      <NotificationBanner
        variant="success"
        title={`Update ${status.updateVersion} is ready`}
        description="Restart to install and enjoy the latest features"
        icon={<CloudDownload />}
        actions={[
          {
            label: "Restart Now",
            onClick: () => window.electronAPI?.update.installAndRestart(),
            variant: "contained",
            color: "primary",
          },
          {
            label: "Later",
            onClick: () => {
              // Hide the banner temporarily
              // It will reappear on next app launch if update still pending
              setStatus((prev) =>
                prev ? { ...prev, updateDownloaded: false } : null
              );
            },
            variant: "text",
          },
        ]}
        closable={false}
      />
    );
  }

  // No notification shown during:
  // - Update available (downloads silently)
  // - Download in progress (happens in background)
  return null;
};
