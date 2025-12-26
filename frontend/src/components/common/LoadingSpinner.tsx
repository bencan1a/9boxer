/**
 * Reusable loading spinner component
 */

import React from "react";
import { Box, CircularProgress, Typography } from "@mui/material";
import { useTheme, alpha } from "@mui/material/styles";

interface LoadingSpinnerProps {
  size?: number;
  message?: string;
  overlay?: boolean;
  color?:
    | "primary"
    | "secondary"
    | "error"
    | "info"
    | "success"
    | "warning"
    | "inherit";
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 40,
  message,
  overlay = false,
  color = "primary",
}) => {
  const theme = useTheme();

  const content = (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
      }}
    >
      <CircularProgress size={size} color={color} />
      {message && (
        <Typography variant="body2" color="text.secondary">
          {message}
        </Typography>
      )}
    </Box>
  );

  if (overlay) {
    return (
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: alpha(theme.palette.background.default, 0.8),
          zIndex: 9999,
        }}
      >
        {content}
      </Box>
    );
  }

  return content;
};
