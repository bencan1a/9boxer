/**
 * Development Mode Indicator
 *
 * Displays current backend connection information in development mode.
 * Shows the backend port and connection status for debugging purposes.
 *
 * Only visible when:
 * - Running in development mode (import.meta.env.DEV)
 * - Running in Electron mode (window.electronAPI available)
 */

import React, { useEffect, useState } from "react";
import { Chip, Tooltip } from "@mui/material";
import { Code as CodeIcon } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { isDevelopment, isElectron } from "../../config";
import { logger } from "../../utils/logger";

export const DevModeIndicator: React.FC = () => {
  const { t } = useTranslation();
  const [backendPort, setBackendPort] = useState<number | null>(null);
  const [backendUrl, setBackendUrl] = useState<string | null>(null);

  useEffect(() => {
    // Only fetch backend info in Electron mode
    if (!isElectron() || !window.electronAPI?.backend) {
      return;
    }

    async function fetchBackendInfo() {
      try {
        const [port, url] = await Promise.all([
          window.electronAPI!.backend.getPort(),
          window.electronAPI!.backend.getUrl(),
        ]);
        setBackendPort(port);
        setBackendUrl(url);
        logger.info('[DevModeIndicator] Backend info:', { port, url });
      } catch (error) {
        logger.error('[DevModeIndicator] Failed to fetch backend info:', error);
      }
    }

    fetchBackendInfo();
  }, []);

  // Only show in development mode
  if (!isDevelopment) {
    return null;
  }

  // Only show in Electron mode
  if (!isElectron()) {
    return (
      <Tooltip title={t('common.devMode.webModeTooltip')} placement="left">
        <Chip
          icon={<CodeIcon />}
          label={t('common.devMode.webModeLabel')}
          size="small"
          color="info"
          sx={{
            position: "fixed",
            bottom: 16,
            right: 16,
            zIndex: 9999,
            fontSize: "0.75rem",
          }}
        />
      </Tooltip>
    );
  }

  // Show backend connection info
  const label = backendPort
    ? t('common.devMode.backendPort', { port: backendPort })
    : t('common.devMode.backendLoading');

  const tooltipText = backendUrl
    ? t('common.devMode.backendUrlTooltip', { url: backendUrl })
    : t('common.devMode.fetchingBackendInfo');

  return (
    <Tooltip title={tooltipText} placement="left">
      <Chip
        icon={<CodeIcon />}
        label={label}
        size="small"
        color="success"
        sx={{
          position: "fixed",
          bottom: 16,
          right: 16,
          zIndex: 9999,
          fontSize: "0.75rem",
          fontFamily: "monospace",
        }}
      />
    </Tooltip>
  );
};
