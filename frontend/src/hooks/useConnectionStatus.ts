/**
 * useConnectionStatus Hook
 *
 * React hook for managing backend connection status.
 * Listens to IPC events from the Electron main process and provides
 * connection state and retry functionality.
 */

import { useState, useEffect, useCallback } from "react";
import { isElectron } from "../config";
import { apiClient } from "../services/api";

export type ConnectionStatus = "connected" | "reconnecting" | "disconnected";

interface ConnectionStatusData {
  status: ConnectionStatus;
  retryCount: number;
  manualRetry: () => void;
}

/**
 * Hook to track backend connection status in Electron mode.
 * In browser mode, always returns 'connected' status.
 *
 * @returns Connection status, retry count, and manual retry function
 *
 * @example
 * ```typescript
 * function MyComponent() {
 *   const { status, retryCount, manualRetry } = useConnectionStatus();
 *
 *   if (status === 'disconnected') {
 *     return (
 *       <div>
 *         <p>Connection lost</p>
 *         <button onClick={manualRetry}>Retry</button>
 *       </div>
 *     );
 *   }
 *
 *   return <div>Connected</div>;
 * }
 * ```
 */
export function useConnectionStatus(): ConnectionStatusData {
  const [status, setStatus] = useState<ConnectionStatus>("connected");
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    // Only set up IPC listener in Electron mode
    if (!isElectron()) {
      return;
    }

    // Get the Electron API from window
    const electronAPI = (window as any).electronAPI;
    if (!electronAPI?.backend?.onConnectionStatusChange) {
      console.warn("[useConnectionStatus] Electron API not available");
      return;
    }

    // Set up listener for connection status changes
    const cleanup = electronAPI.backend.onConnectionStatusChange(
      (data: { status: ConnectionStatus; port?: number }) => {
        console.log("[useConnectionStatus] Status changed:", data.status);

        setStatus(data.status);

        // Increment retry count when reconnecting, reset when connected
        if (data.status === "reconnecting") {
          setRetryCount((prev) => prev + 1);
        } else if (data.status === "connected") {
          setRetryCount(0);

          // Update API client base URL if port changed
          if (data.port) {
            const newBaseUrl = `http://localhost:${data.port}`;
            apiClient.updateBaseUrl(newBaseUrl);
            console.log(
              "[useConnectionStatus] API client updated to:",
              newBaseUrl
            );
          }
        }
      }
    );

    // Cleanup listener on unmount
    return cleanup;
  }, []);

  /**
   * Manually trigger a connection retry by refreshing the page.
   * This will cause the app to reinitialize and attempt to reconnect.
   */
  const manualRetry = useCallback(() => {
    console.log("[useConnectionStatus] Manual retry requested, reloading...");
    window.location.reload();
  }, []);

  return {
    status,
    retryCount,
    manualRetry,
  };
}
