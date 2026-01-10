import React from "react";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import LinearProgress from "@mui/material/LinearProgress";
import { alpha, useTheme } from "@mui/material/styles";
import InfoIcon from "@mui/icons-material/Info";
import SuccessIcon from "@mui/icons-material/CheckCircle";
import WarningIcon from "@mui/icons-material/Warning";
import ErrorIcon from "@mui/icons-material/Error";
import CloseIcon from "@mui/icons-material/Close";
import type { SxProps, Theme } from "@mui/material/styles";

export interface NotificationAction {
  label: string;
  onClick: () => void;
  variant?: "text" | "outlined" | "contained";
  color?: "primary" | "secondary" | "inherit";
  disabled?: boolean;
}

export interface NotificationProgress {
  value: number; // 0-100
  total?: number;
  transferred?: string; // e.g., "12.3 MB / 27.5 MB"
  speed?: string; // e.g., "450 KB/s"
}

export interface NotificationBannerProps {
  variant: "info" | "success" | "warning" | "error";
  title: string;
  description?: string;
  icon?: React.ReactNode;
  progress?: NotificationProgress;
  actions?: NotificationAction[];
  onClose?: () => void;
  closable?: boolean;
  floating?: boolean;
  sx?: SxProps<Theme>;
}

const defaultIcons = {
  info: <InfoIcon />,
  success: <SuccessIcon />,
  warning: <WarningIcon />,
  error: <ErrorIcon />,
};

export const NotificationBanner: React.FC<NotificationBannerProps> = ({
  variant,
  title,
  description,
  icon,
  progress,
  actions = [],
  onClose,
  closable = true,
  floating = false,
  sx,
}) => {
  const theme = useTheme();

  // Get the color palette based on variant
  const color = theme.palette[variant];

  // Select the appropriate icon
  const iconElement = icon || defaultIcons[variant];

  // Calculate background and border colors
  // Floating banners are opaque, embedded banners use alpha for subtlety
  const backgroundColor = floating
    ? theme.palette.mode === "dark"
      ? theme.palette.background.paper
      : theme.palette.background.paper
    : alpha(color.main, theme.palette.mode === "dark" ? 0.15 : 0.1);

  const borderColor = alpha(
    theme.palette.mode === "dark" ? color.light : color.main,
    theme.palette.mode === "dark" ? 0.5 : 0.3
  );
  const borderLeftColor =
    theme.palette.mode === "dark" ? color.light : color.main;

  // Floating-specific styles
  const floatingStyles = floating
    ? {
        position: "fixed" as const,
        top: `${theme.tokens.spacing.lg}px`,
        left: "50%",
        transform: "translateX(-50%)",
        width: "50%",
        maxWidth: "800px",
        minWidth: "600px",
        zIndex: theme.zIndex.snackbar,
        animation: "slideDown 0.3s ease-out",
        "@keyframes slideDown": {
          from: {
            opacity: 0,
            transform: "translateX(-50%) translateY(-20px)",
          },
          to: {
            opacity: 1,
            transform: "translateX(-50%) translateY(0)",
          },
        },
      }
    : {};

  return (
    <Box
      role="alert"
      aria-live={variant === "error" ? "assertive" : "polite"}
      sx={{
        position: "relative",
        display: "flex",
        alignItems: "flex-start",
        gap: `${theme.tokens.spacing.md}px`,
        padding: `${theme.tokens.spacing.md}px`,
        paddingRight:
          floating && closable && onClose
            ? `${theme.tokens.spacing.xl}px`
            : `${theme.tokens.spacing.md}px`,
        backgroundColor,
        border: `1px solid ${borderColor}`,
        borderLeft: `4px solid ${borderLeftColor}`,
        borderRadius: `${theme.tokens.radius.md}px`,
        boxShadow:
          theme.palette.mode === "dark"
            ? theme.tokens.shadows.card.dark
            : theme.tokens.shadows.card.light,
        transition: `all ${theme.tokens.duration.normal} ${theme.tokens.easing.easeInOut}`,
        "&:hover": {
          boxShadow:
            theme.palette.mode === "dark"
              ? theme.tokens.shadows.elevated.dark
              : theme.tokens.shadows.elevated.light,
        },
        ...floatingStyles,
        ...sx,
      }}
    >
      {/* Icon */}
      <Box
        sx={{
          color: theme.palette.mode === "dark" ? color.light : color.main,
          fontSize: "20px",
          lineHeight: 1,
          mt: 0.25,
          flexShrink: 0,
        }}
      >
        {iconElement}
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        {/* Title */}
        <Typography
          variant="body1"
          sx={{
            fontWeight: theme.tokens.typography.fontWeight.medium,
            color:
              theme.palette.mode === "dark"
                ? color.light
                : color.dark || color.main,
            mb: description || progress ? 0.5 : 0,
          }}
        >
          {title}
        </Typography>

        {/* Description */}
        {description && (
          <Typography
            variant="body2"
            sx={{
              color: theme.palette.text.secondary,
              mb: progress ? 1 : 0,
            }}
          >
            {description}
          </Typography>
        )}

        {/* Progress */}
        {progress && (
          <Box sx={{ mt: 1 }}>
            <LinearProgress
              variant="determinate"
              value={progress.value}
              sx={{
                height: 6,
                borderRadius: `${theme.tokens.radius.sm}px`,
                backgroundColor: alpha(color.main, 0.2),
                "& .MuiLinearProgress-bar": {
                  backgroundColor:
                    theme.palette.mode === "dark" ? color.light : color.main,
                  borderRadius: `${theme.tokens.radius.sm}px`,
                },
              }}
            />
            {(progress.transferred || progress.speed) && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  mt: 0.5,
                }}
              >
                {progress.transferred && (
                  <Typography variant="caption" color="text.secondary">
                    {progress.transferred}
                  </Typography>
                )}
                {progress.speed && (
                  <Typography variant="caption" color="text.secondary">
                    {progress.speed}
                  </Typography>
                )}
              </Box>
            )}
          </Box>
        )}
      </Box>

      {/* Close button - top right for floating, inline for embedded */}
      {closable && onClose && floating && (
        <IconButton
          size="small"
          onClick={onClose}
          aria-label="Close notification"
          sx={{
            position: "absolute",
            top: `${theme.tokens.spacing.sm}px`,
            right: `${theme.tokens.spacing.sm}px`,
            color: theme.palette.text.secondary,
            "&:hover": {
              color: theme.palette.text.primary,
            },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      )}

      {/* Actions */}
      {actions.length > 0 && (
        <Box
          sx={{
            display: "flex",
            flexDirection: floating ? "row" : "column",
            gap: `${theme.tokens.spacing.sm}px`,
            alignItems: floating ? "center" : "flex-end",
            alignSelf: floating ? "flex-end" : "flex-start",
            flexShrink: 0,
          }}
        >
          {actions.map((action, index) => (
            <Button
              key={index}
              variant={action.variant || "text"}
              color={action.color || "primary"}
              onClick={action.onClick}
              disabled={action.disabled}
              size="small"
              sx={{
                minWidth: "auto",
                whiteSpace: "nowrap",
              }}
            >
              {action.label}
            </Button>
          ))}
        </Box>
      )}

      {/* Close button - inline for embedded banners */}
      {closable && onClose && !floating && actions.length === 0 && (
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-end",
            flexShrink: 0,
          }}
        >
          <IconButton
            size="small"
            onClick={onClose}
            aria-label="Close notification"
            sx={{
              color: theme.palette.text.secondary,
              "&:hover": {
                color: theme.palette.text.primary,
              },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      )}
    </Box>
  );
};

export default NotificationBanner;
