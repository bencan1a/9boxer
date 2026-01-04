/**
 * Simplified Toolbar Component
 *
 * Fallback UI for FilterToolbar when an error occurs.
 * Displays a simple alert notifying the user that filters are unavailable.
 *
 * @component
 */

import React from "react";
import Box from "@mui/material/Box";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import { useTheme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";

/**
 * SimplifiedToolbar Component
 *
 * Minimal fallback toolbar displayed when FilterToolbar encounters an error.
 * Shows a warning alert that filters are temporarily unavailable.
 */
export const SimplifiedToolbar: React.FC = () => {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <Box
      data-testid="simplified-toolbar"
      sx={{
        position: "absolute",
        top: `-${theme.tokens.dimensions.gridContainer.padding}px`,
        left: 0,
        zIndex: 10,
        maxWidth: "500px",
      }}
    >
      <Alert severity="warning" data-testid="filters-unavailable-alert">
        <AlertTitle>
          {t("filters.unavailable", "Filters Unavailable")}
        </AlertTitle>
        {t(
          "filters.unavailableMessage",
          "The filtering toolbar is temporarily unavailable. You can still view all employees on the grid."
        )}
      </Alert>
    </Box>
  );
};
