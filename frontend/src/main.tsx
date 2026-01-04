/**
 * Application entry point
 */

/* eslint-disable react-refresh/only-export-components */
// This is the application entry point - it doesn't export components

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ErrorBoundary } from "./components/common/ErrorBoundary";
import "./styles/panel-animations.css";
import "./i18n/config"; // Initialize i18n before rendering

// Error fallback for translation loading failures
// Note: This component cannot use theme tokens as it's rendered before the theme provider
const I18nErrorFallback = () => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      gap: "16px",
      // eslint-disable-next-line no-restricted-syntax
      backgroundColor: "#1a1a1a",
      // eslint-disable-next-line no-restricted-syntax
      color: "#ffffff",
      fontFamily: "system-ui, sans-serif",
    }}
  >
    <h2>Translation Loading Error</h2>
    <p>There was a problem loading translations. Please refresh the page.</p>
    <button
      onClick={() => window.location.reload()}
      style={{
        padding: "12px 24px",
        fontSize: "16px",
        cursor: "pointer",
        // eslint-disable-next-line no-restricted-syntax
        backgroundColor: "#0066cc",
        // eslint-disable-next-line no-restricted-syntax
        color: "#ffffff",
        border: "none",
        borderRadius: "4px",
      }}
    >
      Refresh Page
    </button>
  </div>
);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary fallback={<I18nErrorFallback />}>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
