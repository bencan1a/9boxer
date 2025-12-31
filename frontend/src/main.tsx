/**
 * Application entry point
 */

import React, { Suspense } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ErrorBoundary } from "./components/common/ErrorBoundary";
import "./styles/panel-animations.css";
import "./i18n/config"; // Initialize i18n before rendering

// Loading component for i18n suspense
const I18nLoader = () => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      backgroundColor: "#1a1a1a",
      color: "#ffffff",
      fontSize: "16px",
    }}
  >
    Loading translations...
  </div>
);

// Error fallback for translation loading failures
const I18nErrorFallback = () => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      gap: "16px",
      backgroundColor: "#1a1a1a",
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
        backgroundColor: "#0066cc",
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
      <Suspense fallback={<I18nLoader />}>
        <App />
      </Suspense>
    </ErrorBoundary>
  </React.StrictMode>
);
