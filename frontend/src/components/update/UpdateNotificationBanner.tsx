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

/**
 * Simplified auto-update notification banner with floating mode
 *
 * Since auto-update downloads silently in the background, this component
 * only shows notifications for:
 * 1. Update ready to install (floating banner - requires user action: restart)
 * 2. Download errors (floating banner - allows user to retry or dismiss)
 *
 * Download progress is NOT shown as it happens silently.
 */
export const UpdateNotificationBanner: React.FC = () => {
  const [status, setStatus] = useState<UpdateStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if electronAPI is available (only available in Electron environment)
    if (!window.electronAPI?.update) {
      return;
    }

    // Get initial status
    window.electronAPI.update.getStatus().then(setStatus);

    // Listen for update downloaded event (the only one we show in silent mode)
    const cleanupDownloaded = window.electronAPI.update.onUpdateDownloaded(
      () => {
        // Refresh status when download completes
        window.electronAPI?.update.getStatus().then(setStatus);
        setDismissed(false); // Ensure notification is shown when download completes
      }
    );

    const cleanupError = window.electronAPI.update.onUpdateError(
      (err: { message: string }) => {
        setError(err.message);
      }
    );

    return () => {
      cleanupDownloaded();
      cleanupError();
    };
  }, []);

  // Don't show if dismissed or no status
  if (!status || dismissed) return null;

  // Error state (only show critical errors in floating mode)
  if (error) {
    const errorConfig = getUpdateErrorMessage(error);
    return (
      <NotificationBanner
        variant="error"
        title={errorConfig.title}
        description={errorConfig.detail}
        floating={true}
        actions={[
          {
            label: "Retry",
            onClick: () => {
              setError(null);
              window.electronAPI?.update.checkForUpdates();
            },
            variant: "contained",
          },
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
  // FLOATING BANNER: Non-intrusive, appears at top center
  // X button (top-right) dismisses, "Restart Now" (bottom-right) is primary action
  if (status.updateDownloaded) {
    return (
      <NotificationBanner
        variant="success"
        title={`Update ${status.updateVersion} is ready`}
        description="Restart to install and enjoy the latest features"
        icon={<CloudDownload />}
        floating={true}
        actions={[
          {
            label: "Restart Now",
            onClick: () => window.electronAPI?.update.installAndRestart(),
            variant: "contained",
            color: "primary",
          },
        ]}
        closable={true}
        onClose={() => setDismissed(true)}
      />
    );
  }

  // Silent mode: Don't show anything for "update available" or "download in progress"
  // The update downloads automatically in the background
  return null;
};
