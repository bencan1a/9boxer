/**
 * Session expiry warning component
 * Shows a notification when the session is about to expire due to inactivity
 */

import { useEffect, useState } from "react";
import { Snackbar, Alert, Button } from "@mui/material";
import { useAuthStore } from "../../store/authStore";

interface SessionExpiryWarningProps {
  warningMinutes?: number; // How many minutes before expiry to show warning
}

export const SessionExpiryWarning: React.FC<SessionExpiryWarningProps> = ({
  warningMinutes = 5,
}) => {
  const [showWarning, setShowWarning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const expiresAt = useAuthStore((state) => state.expiresAt);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const recordActivity = useAuthStore((state) => state.recordActivity);

  useEffect(() => {
    if (!isAuthenticated || !expiresAt) {
      setShowWarning(false);
      return;
    }

    // Update time remaining every second
    const updateTimer = setInterval(() => {
      const now = Date.now();
      const remaining = expiresAt - now;
      const remainingMinutes = Math.floor(remaining / 1000 / 60);

      setTimeRemaining(remainingMinutes);

      // Show warning if within warning window
      const warningThreshold = warningMinutes * 60 * 1000;
      if (remaining > 0 && remaining <= warningThreshold) {
        setShowWarning(true);
      } else {
        setShowWarning(false);
      }
    }, 1000); // Update every second

    return () => {
      clearInterval(updateTimer);
    };
  }, [expiresAt, isAuthenticated, warningMinutes]);

  const handleClose = () => {
    setShowWarning(false);
  };

  const handleContinueSession = () => {
    // User interaction - this will extend the session
    recordActivity();
    setShowWarning(false);
  };

  if (!isAuthenticated || !showWarning) {
    return null;
  }

  return (
    <Snackbar
      open={showWarning}
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
      onClose={handleClose}
    >
      <Alert
        severity="warning"
        onClose={handleClose}
        action={
          <Button color="inherit" size="small" onClick={handleContinueSession}>
            Continue
          </Button>
        }
      >
        Your session will expire in {timeRemaining} minute{timeRemaining !== 1 ? "s" : ""} due to inactivity.
        Click Continue or interact with the page to extend your session.
      </Alert>
    </Snackbar>
  );
};
