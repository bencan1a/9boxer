/**
 * Reusable section header component for Intelligence Panel sections
 */

import React from "react";
import { Box, Typography, IconButton, Tooltip } from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";

export interface SectionHeaderProps {
  /**
   * Section title
   */
  title: string;

  /**
   * Optional tooltip text explaining the section
   */
  tooltip?: string;

  /**
   * Optional icon to display before the title
   */
  icon?: React.ReactNode;

  /**
   * Optional action buttons to display on the right
   */
  actions?: React.ReactNode;
}

/**
 * Section header component
 *
 * Provides consistent styling for section headers across the Intelligence Panel.
 *
 * @example
 * ```tsx
 * <SectionHeader
 *   title="Anomalies Detected"
 *   tooltip="Statistical anomalies found in your data"
 *   actions={<Button>View All</Button>}
 * />
 * ```
 */
export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  tooltip,
  icon,
  actions,
}) => {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        mb: 2,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        {icon && <Box sx={{ display: "flex", alignItems: "center" }}>{icon}</Box>}
        <Typography variant="h6" color="primary">
          {title}
        </Typography>
        {tooltip && (
          <Tooltip title={tooltip} arrow placement="top">
            <IconButton size="small" aria-label="Section information">
              <InfoIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Box>
      {actions && <Box>{actions}</Box>}
    </Box>
  );
};
