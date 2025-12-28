/**
 * File name display component
 * Shows the current file name with optional unsaved changes indicator
 */

import React from "react";
import { Typography, Box, Tooltip } from "@mui/material";
import { useTranslation } from "react-i18next";

/**
 * Props for the FileNameDisplay component
 */
export interface FileNameDisplayProps {
  /** The name of the currently loaded file, or undefined if no file is loaded */
  fileName?: string;
  /** Whether there are unsaved changes to the file */
  hasUnsavedChanges?: boolean;
}

/**
 * FileNameDisplay component
 *
 * Displays the current file name or a placeholder if no file is loaded.
 * Shows an asterisk (*) indicator for unsaved changes.
 *
 * @example
 * ```tsx
 * <FileNameDisplay
 *   fileName="employees.xlsx"
 *   hasUnsavedChanges={true}
 * />
 * ```
 */
export const FileNameDisplay: React.FC<FileNameDisplayProps> = ({
  fileName,
  hasUnsavedChanges = false,
}) => {
  const { t } = useTranslation();

  const displayText = fileName || t("dashboard.fileMenu.noFileSelected");
  const fontWeight = fileName ? 500 : 400;
  const tooltipText =
    hasUnsavedChanges && fileName ? `${fileName} *` : displayText;

  return (
    <Tooltip title={tooltipText} arrow placement="bottom">
      <Box
        sx={{
          display: "inline-flex",
          alignItems: "center",
          minWidth: 0, // Allow flex child to shrink below content size
          flex: 1, // Take available space
        }}
      >
        <Typography
          variant="body2"
          noWrap
          sx={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            fontWeight,
            maxWidth: "100%", // Respect parent container width
          }}
          data-testid="file-name-display"
        >
          {displayText}
          {hasUnsavedChanges && fileName && " *"}
        </Typography>
      </Box>
    </Tooltip>
  );
};
