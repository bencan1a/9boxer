/**
 * Main App component with routing
 */

import React from "react";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";
import { theme } from "./theme/theme";
import { LoginPage } from "./components/auth/LoginPage";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { SessionExpiryWarning } from "./components/auth/SessionExpiryWarning";
import { DashboardPage } from "./components/dashboard/DashboardPage";
import { ErrorBoundary } from "./components/common/ErrorBoundary";
import { SnackbarProvider } from "./contexts/SnackbarContext";
import { useActivityTracker } from "./hooks/useActivityTracker";

const App: React.FC = () => {
  // Track user activity to extend session on interaction
  useActivityTracker();

  return (
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <SnackbarProvider>
          <CssBaseline />
          <HashRouter>
            <SessionExpiryWarning warningMinutes={5} />
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/login" element={<LoginPage />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </HashRouter>
        </SnackbarProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;
