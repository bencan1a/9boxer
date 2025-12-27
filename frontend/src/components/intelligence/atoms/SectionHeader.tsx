/**
 * Reusable section header component for Intelligence Panel sections
 */

import React from "react";
import { Box, Typography, IconButton, Tooltip } from "@mui/material";
import { useTranslation } from "react-i18next";
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
 * Reusable section header with optional icon, tooltip, and action buttons.
 *
 * Provides consistent styling for section headers across the Intelligence Panel.
 * Displays title in primary color, optional explanatory tooltip, and optional
 * action buttons aligned to the right.
 *
 * @component
 * @example
 * ```tsx
 * <SectionHeader
 *   title="Anomalies Detected"
 *   tooltip="Statistical anomalies found in your talent distribution data"
 *   icon={<ErrorOutlineIcon />}
 *   actions={
 *     <Button size="small" onClick={handleViewAll}>
 *       View All
 *     </Button>
 *   }
 * />
 * ```
 *
 * @param {SectionHeaderProps} props - Component props
 * @param {string} props.title - Section title text
 * @param {string} [props.tooltip] - Optional explanatory tooltip text
 * @param {React.ReactNode} [props.icon] - Optional icon to display before title
 * @param {React.ReactNode} [props.actions] - Optional action buttons to display on right
 *
 * @accessibility
 * - Info icon has descriptive aria-label
 * - Tooltip provides additional context on hover/focus
 * - Semantic heading structure (h6)
 * - Icon and tooltip keyboard accessible
 *
 * @i18n
 * - intelligence.section.infoAria - ARIA label for info tooltip button
 * - Title text provided by parent component (already translated)
 * - Tooltip text provided by parent component (already translated)
 *
 * @see AnomaliesSection
 * @see InsightsSection
 * @see DistributionSection
 */
export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  tooltip,
  icon,
  actions,
}) => {
  const { t } = useTranslation();

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
        {icon && (
          <Box sx={{ display: "flex", alignItems: "center" }}>{icon}</Box>
        )}
        <Typography variant="h6" color="primary">
          {title}
        </Typography>
        {tooltip && (
          <Tooltip title={tooltip} arrow placement="top">
            <IconButton
              size="small"
              aria-label={t("intelligence.section.infoAria")}
            >
              <InfoIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Box>
      {actions && <Box>{actions}</Box>}
    </Box>
  );
};
