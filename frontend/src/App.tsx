/**
 * Main App component with routing
 */

import React, { useEffect, useMemo, useState } from "react";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import { CssBaseline, Box } from "@mui/material";
import { getTheme } from "./theme/theme";
import { useUiStore } from "./store/uiStore";
import { DashboardPage } from "./components/dashboard/DashboardPage";
import { ErrorBoundary } from "./components/common/ErrorBoundary";
import { SnackbarProvider } from "./contexts/SnackbarContext";
import { logger } from "./utils/logger";
import { initializeConfig } from "./config";
import { LoadingSpinner } from "./components/common/LoadingSpinner";

const App: React.FC = () => {
  // Track configuration initialization state
  const [configReady, setConfigReady] = useState(false);

  // Get effective theme from store
  const effectiveTheme = useUiStore((state) => state.effectiveTheme);

  // Create dynamic theme based on effective theme
  const theme = useMemo(() => getTheme(effectiveTheme), [effectiveTheme]);

  // Initialize configuration before rendering main app
  useEffect(() => {
    async function init() {
      try {
        await initializeConfig();
        logger.info("[App] Configuration initialized successfully");
      } catch (error) {
        logger.error("[App] Failed to initialize configuration:", error);
        // Continue anyway with default configuration
      } finally {
        setConfigReady(true);
      }
    }
    init();
  }, []);

  // Initialize theme detection and listen for OS theme changes
  useEffect(() => {
    // Check if running in Electron environment
    if (!window.electronAPI?.theme) {
      logger.warn(
        "Electron API not available - theme detection disabled (running in web mode)"
      );
      return;
    }

    // Get initial system theme
    window.electronAPI.theme
      .getSystemTheme()
      .then((systemTheme) => {
        logger.info("Initial system theme detected:", systemTheme);
        useUiStore.getState().setSystemTheme(systemTheme);
      })
      .catch((error) => {
        logger.error("Failed to get system theme:", error);
      });

    // Listen for system theme changes
    const cleanup = window.electronAPI.theme.onSystemThemeChange(
      (systemTheme) => {
        logger.info("System theme changed to:", systemTheme);
        useUiStore.getState().setSystemTheme(systemTheme);
      }
    );

    return cleanup;
  }, []);

  // Global error handlers to catch errors outside React component tree
  useEffect(() => {
    // Handle uncaught errors (e.g., in setTimeout, setInterval callbacks)
    const handleError = (event: ErrorEvent) => {
      logger.error("Uncaught error", event.error);
      logger.error("Error stack", event.error?.stack);
      // Prevent the default browser error handling
      event.preventDefault();
    };

    // Handle unhandled promise rejections (e.g., in async code, API calls)
    const handleRejection = (event: PromiseRejectionEvent) => {
      logger.error("Unhandled promise rejection", event.reason);
      logger.error("Rejection stack", event.reason?.stack);
      // Prevent the default browser rejection handling
      event.preventDefault();
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleRejection);

    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleRejection);
    };
  }, []);

  // Show loading screen while initializing configuration
  if (!configReady) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            backgroundColor: "background.default",
          }}
        >
          <LoadingSpinner
            size={60}
            message="Connecting to backend..."
            overlay={false}
          />
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <SnackbarProvider>
          <CssBaseline />
          <Box
            sx={{
              transition: "background-color 0.3s ease, color 0.3s ease",
              minHeight: "100vh",
              backgroundColor: "background.default",
            }}
          >
            <HashRouter
              future={{
                v7_relativeSplatPath: true,
                v7_startTransition: true,
              }}
            >
              <Routes>
                <Route
                  path="/"
                  element={<Navigate to="/dashboard" replace />}
                />
                <Route path="/dashboard" element={<DashboardPage />} />
              </Routes>
            </HashRouter>
          </Box>
        </SnackbarProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;
