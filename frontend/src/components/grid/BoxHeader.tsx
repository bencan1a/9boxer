/**
 * Box header component - displays position label, employee count, and expand/collapse button
 * 
 * @component
 * @example
 * ```tsx
 * <BoxHeader 
 *   position={9}
 *   positionName="Star"
 *   shortLabel="H,H"
 *   employeeCount={5}
 *   isExpanded={false}
 *   isCollapsed={false}
 *   onExpand={() => console.log('expand')}
 *   onCollapse={() => console.log('collapse')}
 *   positionGuidance="High performers with high potential"
 * />
 * ```
 */

import React from "react";
import {
  Box,
  Typography,
  Badge,
  IconButton,
  Tooltip,
  alpha,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import OpenInFullIcon from "@mui/icons-material/OpenInFull";
import CloseFullscreenIcon from "@mui/icons-material/CloseFullscreen";
import { useTranslation } from "react-i18next";

/**
 * Props for the BoxHeader component
 */
export interface BoxHeaderProps {
  /** Grid position (1-9) */
  position: number;
  /** Name of the position (e.g., 'Star', 'Core Talent') */
  positionName: string;
  /** Short label showing performance/potential levels (e.g., 'H,H', 'M,M') */
  shortLabel: string;
  /** Number of employees in this box */
  employeeCount: number;
  /** Whether the box is in expanded state (full height) */
  isExpanded: boolean;
  /** Whether the box is in collapsed state (minimal height) */
  isCollapsed: boolean;
  /** Callback fired when expand button is clicked */
  onExpand?: () => void;
  /** Callback fired when collapse button is clicked */
  onCollapse?: () => void;
  /** Tooltip text with guidance for this position */
  positionGuidance?: string;
}

/**
 * BoxHeader component - displays grid box header with controls
 * 
 * Adapts layout based on expansion state:
 * - Collapsed: Centered vertical layout with prominent expand button
 * - Normal/Expanded: Horizontal layout with badge and controls
 * 
 * @param props - Component props
 * @returns The rendered box header
 */
export const BoxHeader: React.FC<BoxHeaderProps> = ({
  position,
  positionName,
  shortLabel,
  employeeCount,
  isExpanded,
  isCollapsed,
  onExpand,
  onCollapse,
  positionGuidance,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();

  if (isCollapsed) {
    // Collapsed: Centered column layout with expand button prominent
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 0.5,
        }}
      >
        <Typography
          variant="caption"
          fontWeight="bold"
          sx={{
            fontSize: "0.7rem",
            display: "block",
            textAlign: "center",
          }}
        >
          {positionName} {shortLabel}
        </Typography>
        <IconButton
          size="small"
          onClick={onExpand}
          aria-label={t("grid.gridBox.expandBox")}
          sx={{
            opacity: theme.tokens.opacity.gridExpandButtonActive,
            transition: `opacity ${theme.tokens.duration.normal} ${theme.tokens.easing.easeInOut}`,
            "&:hover": {
              opacity: theme.tokens.opacity.gridExpandButtonActive,
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
            },
          }}
        >
          <OpenInFullIcon fontSize="small" />
        </IconButton>
      </Box>
    );
  }

  // Normal/Expanded: Horizontal layout with badge and button
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        mb: 1,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, flex: 1 }}>
        <Tooltip
          title={positionGuidance || ""}
          arrow
          placement="top"
          enterDelay={300}
        >
          <Typography
            variant="caption"
            fontWeight="bold"
            sx={{
              fontSize: isExpanded ? "0.85rem" : "0.7rem",
              display: "block",
              cursor: "help",
            }}
          >
            {positionName} {shortLabel}
          </Typography>
        </Tooltip>
        <Badge
          badgeContent={employeeCount}
          color="primary"
          sx={{ "& .MuiBadge-badge": { fontSize: "0.65rem", height: 16 } }}
          data-testid={`grid-box-${position}-count`}
        />
      </Box>

      {/* Expand/Collapse Button */}
      {isExpanded ? (
        <IconButton
          size="small"
          onClick={onCollapse}
          aria-label={t("grid.gridBox.collapseBox")}
          sx={{ ml: 1 }}
        >
          <CloseFullscreenIcon fontSize="small" />
        </IconButton>
      ) : (
        <IconButton
          size="small"
          onClick={onExpand}
          aria-label={t("grid.gridBox.expandBox")}
          sx={{
            ml: 1,
            opacity: theme.tokens.opacity.gridExpandButtonIdle,
            transition: `opacity ${theme.tokens.duration.normal} ${theme.tokens.easing.easeInOut}`,
            "&:hover": {
              opacity: theme.tokens.opacity.gridExpandButtonActive,
            },
          }}
        >
          <OpenInFullIcon fontSize="small" />
        </IconButton>
      )}
    </Box>
  );
};
