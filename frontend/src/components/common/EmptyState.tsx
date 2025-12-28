/**
 * Reusable empty state component
 * Displays a consistent empty state with icon, message, and optional action
 */

import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { SxProps, Theme } from "@mui/material/styles";
import { alpha, useTheme } from "@mui/material/styles";

export interface EmptyStateProps {
  /** Icon to display (React element, e.g., <UploadFileIcon />) */
  icon?: React.ReactElement;
  /** Main heading text */
  title: string;
  /** Optional description text */
  description?: string;
  /** Optional action button */
  action?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactElement;
    variant?: "text" | "outlined" | "contained";
  };
  /** Optional hint text below action */
  hint?: string;
  /** Size variant for icon */
  iconSize?: "small" | "medium" | "large";
  /** Custom styles */
  sx?: SxProps<Theme>;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  hint,
  iconSize = "large",
  sx,
}) => {
  const theme = useTheme();

  // Icon size mapping - component-specific dimensions
  const iconSizeMap = {
    small: 48,
    medium: 64,
    large: 80,
  };

  // Container size for icon circle - component-specific dimensions
  const containerSizeMap = {
    small: 80,
    medium: 120,
    large: 160,
  };

  const iconDimension = iconSizeMap[iconSize];
  const containerDimension = containerSizeMap[iconSize];

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        textAlign: "center",
        p: theme.tokens.spacing.xl / 8, // Convert 32px to MUI spacing units (32/8 = 4)
        ...sx,
      }}
    >
      {/* Icon */}
      {icon && (
        <Box
          sx={{
            width: containerDimension,
            height: containerDimension,
            borderRadius: "50%",
            backgroundColor: alpha(theme.palette.primary.main, 0.1),
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mb: theme.tokens.spacing.lg / 8, // Convert 24px to MUI spacing units (24/8 = 3)
          }}
        >
          {React.cloneElement(icon, {
            sx: {
              fontSize: iconDimension,
              color: "primary.main",
              ...icon.props.sx,
            },
          })}
        </Box>
      )}

      {/* Title */}
      <Typography
        variant={
          iconSize === "large" ? "h4" : iconSize === "medium" ? "h5" : "h6"
        }
        gutterBottom
      >
        {title}
      </Typography>

      {/* Description */}
      {description && (
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{
            mb: action ? theme.tokens.spacing.xl / 8 : 0, // Convert 32px to MUI spacing units (32/8 = 4)
            maxWidth: theme.tokens.dimensions.panel.defaultWidth, // 400px
          }}
        >
          {description}
        </Typography>
      )}

      {/* Action Button */}
      {action && (
        <Button
          variant={action.variant || "contained"}
          size="large"
          startIcon={action.icon}
          onClick={action.onClick}
          sx={{ mb: hint ? theme.tokens.spacing.md / 8 : 0 }} // Convert 16px to MUI spacing units (16/8 = 2)
        >
          {action.label}
        </Button>
      )}

      {/* Hint */}
      {hint && (
        <Typography variant="caption" color="text.secondary">
          {hint}
        </Typography>
      )}
    </Box>
  );
};
