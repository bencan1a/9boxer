import React from "react";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Box from "@mui/material/Box";
import { alpha, useTheme } from "@mui/material/styles";
import InfoIcon from "@mui/icons-material/Info";
import SuccessIcon from "@mui/icons-material/CheckCircle";
import WarningIcon from "@mui/icons-material/Warning";
import ErrorIcon from "@mui/icons-material/Error";
import CloseIcon from "@mui/icons-material/Close";
import type { SnackbarProps } from "@mui/material/Snackbar";

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastProps extends Omit<SnackbarProps, "onClose" | "action"> {
  variant: "info" | "success" | "warning" | "error";
  message: string;
  title?: string;
  action?: ToastAction;
  persistent?: boolean;
  duration?: number;
  onClose?: () => void;
}

const defaultIcons = {
  info: <InfoIcon />,
  success: <SuccessIcon />,
  warning: <WarningIcon />,
  error: <ErrorIcon />,
};

export const Toast: React.FC<ToastProps> = ({
  variant,
  message,
  title,
  action,
  persistent = false,
  duration = 6000,
  onClose,
  open,
  ...snackbarProps
}) => {
  const theme = useTheme();
  const [isPaused, setIsPaused] = React.useState(false);
  const timerRef = React.useRef<number | null>(null);
  const remainingTimeRef = React.useRef<number>(duration);
  const startTimeRef = React.useRef<number | null>(null);

  const handleClose = (
    _event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    // Don't close on clickaway for persistent toasts
    if (persistent && reason === "clickaway") {
      return;
    }
    // Clear timer when closing
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    onClose?.();
  };

  const handleMouseEnter = () => {
    setIsPaused(true);
  };

  const handleMouseLeave = () => {
    setIsPaused(false);
  };

  // Manual timer management for proper pause/resume
  React.useEffect(() => {
    if (!open || persistent) {
      return;
    }

    if (isPaused) {
      // Pause: calculate remaining time and clear timer
      if (timerRef.current && startTimeRef.current !== null) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
        const elapsed = Date.now() - startTimeRef.current;
        remainingTimeRef.current = Math.max(
          0,
          remainingTimeRef.current - elapsed
        );
      }
    } else {
      // Resume or start: create new timer with remaining time
      startTimeRef.current = Date.now();
      timerRef.current = setTimeout(() => {
        onClose?.();
      }, remainingTimeRef.current);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [open, isPaused, persistent, onClose]);

  // Reset timer when toast opens
  React.useEffect(() => {
    if (open) {
      remainingTimeRef.current = duration;
      startTimeRef.current = null;
    }
  }, [open, duration]);

  return (
    <Snackbar
      open={open}
      autoHideDuration={null}
      onClose={handleClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      {...snackbarProps}
      sx={{
        "& .MuiSnackbar-root": {
          bottom: `${theme.tokens.spacing.md}px`,
          right: `${theme.tokens.spacing.md}px`,
        },
        ...snackbarProps.sx,
      }}
    >
      <Alert
        variant="filled"
        severity={variant}
        icon={defaultIcons[variant]}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        sx={{
          minWidth: "300px",
          maxWidth: "400px",
          boxShadow:
            theme.palette.mode === "dark"
              ? theme.tokens.shadows.elevated.dark
              : theme.tokens.shadows.elevated.light,
          borderRadius: `${theme.tokens.radius.md}px`,
          "& .MuiAlert-icon": {
            fontSize: "24px",
            alignSelf: "center",
          },
          "& .MuiAlert-message": {
            flex: 1,
            padding: `${theme.tokens.spacing.sm}px 0`,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          },
          "& .MuiAlert-action": {
            alignItems: "center",
            padding: 0,
            paddingLeft: `${theme.tokens.spacing.sm}px`,
          },
        }}
        action={
          <Box
            sx={{
              display: "flex",
              gap: `${theme.tokens.spacing.sm}px`,
              alignItems: "center",
            }}
          >
            {action && (
              <Button
                color="inherit"
                size="small"
                onClick={(e) => {
                  action.onClick();
                  handleClose(e);
                }}
                sx={{
                  fontWeight: theme.tokens.typography.fontWeight.medium,
                  textTransform: "none",
                  "&:hover": {
                    backgroundColor: alpha(theme.palette.common.white, 0.2),
                  },
                }}
              >
                {action.label}
              </Button>
            )}
            {(persistent || onClose) && (
              <IconButton
                size="small"
                onClick={handleClose}
                aria-label="Close notification"
                sx={{
                  color: "inherit",
                  "&:hover": {
                    backgroundColor: alpha(theme.palette.common.white, 0.2),
                  },
                }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            )}
          </Box>
        }
      >
        {title && <AlertTitle>{title}</AlertTitle>}
        {message}
      </Alert>
    </Snackbar>
  );
};

export default Toast;
