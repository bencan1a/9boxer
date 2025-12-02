/**
 * Global snackbar context for notifications
 */

import React, { createContext, useContext, useState, useCallback } from "react";
import { Snackbar, Alert, AlertColor } from "@mui/material";

interface SnackbarMessage {
  id: number;
  message: string;
  severity: AlertColor;
}

interface SnackbarContextType {
  showMessage: (message: string, severity?: AlertColor) => void;
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showInfo: (message: string) => void;
  showWarning: (message: string) => void;
}

const SnackbarContext = createContext<SnackbarContextType | undefined>(
  undefined
);

export const useSnackbar = () => {
  const context = useContext(SnackbarContext);
  if (!context) {
    throw new Error("useSnackbar must be used within a SnackbarProvider");
  }
  return context;
};

export const SnackbarProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [_messageQueue, setMessageQueue] = useState<SnackbarMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState<SnackbarMessage | null>(
    null
  );

  const showMessage = useCallback(
    (message: string, severity: AlertColor = "info") => {
      const id = Date.now();
      const newMessage = { id, message, severity };

      // If no message is currently showing, show this one immediately
      if (!currentMessage) {
        setCurrentMessage(newMessage);
      } else {
        // Otherwise add to queue
        setMessageQueue((prev) => [...prev, newMessage]);
      }
    },
    [currentMessage]
  );

  const showSuccess = useCallback(
    (message: string) => showMessage(message, "success"),
    [showMessage]
  );

  const showError = useCallback(
    (message: string) => showMessage(message, "error"),
    [showMessage]
  );

  const showInfo = useCallback(
    (message: string) => showMessage(message, "info"),
    [showMessage]
  );

  const showWarning = useCallback(
    (message: string) => showMessage(message, "warning"),
    [showMessage]
  );

  const handleClose = () => {
    setCurrentMessage(null);

    // Show next message in queue after a short delay
    setTimeout(() => {
      setMessageQueue((prev) => {
        if (prev.length > 0) {
          setCurrentMessage(prev[0]);
          return prev.slice(1);
        }
        return prev;
      });
    }, 100);
  };

  return (
    <SnackbarContext.Provider
      value={{
        showMessage,
        showSuccess,
        showError,
        showInfo,
        showWarning,
      }}
    >
      {children}
      {currentMessage && (
        <Snackbar
          open={true}
          autoHideDuration={4000}
          onClose={handleClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            onClose={handleClose}
            severity={currentMessage.severity}
            variant="filled"
            sx={{ width: "100%" }}
          >
            {currentMessage.message}
          </Alert>
        </Snackbar>
      )}
    </SnackbarContext.Provider>
  );
};
