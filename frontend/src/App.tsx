/**
 * Main App component with routing
 */

import React, { useEffect } from "react";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";
import { theme } from "./theme/theme";
import { DashboardPage } from "./components/dashboard/DashboardPage";
import { ErrorBoundary } from "./components/common/ErrorBoundary";
import { SnackbarProvider } from "./contexts/SnackbarContext";
import { logger } from "./utils/logger";

const App: React.FC = () => {

  // Global error handlers to catch errors outside React component tree
  useEffect(() => {
    // Handle uncaught errors (e.g., in setTimeout, setInterval callbacks)
    const handleError = (event: ErrorEvent) => {
      logger.error('Uncaught error', event.error);
      logger.error('Error stack', event.error?.stack);
      // Prevent the default browser error handling
      event.preventDefault();
    };

    // Handle unhandled promise rejections (e.g., in async code, API calls)
    const handleRejection = (event: PromiseRejectionEvent) => {
      logger.error('Unhandled promise rejection', event.reason);
      logger.error('Rejection stack', event.reason?.stack);
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

  return (
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <SnackbarProvider>
          <CssBaseline />
          <HashRouter>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardPage />} />
            </Routes>
          </HashRouter>
        </SnackbarProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;
