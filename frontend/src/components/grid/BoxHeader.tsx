/**
 * Box header component - displays position label, employee count, and expand/collapse button
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

export interface BoxHeaderProps {
  position: number;
  positionName: string;
  shortLabel: string;
  employeeCount: number;
  isExpanded: boolean;
  isCollapsed: boolean;
  onExpand?: () => void;
  onCollapse?: () => void;
  positionGuidance?: string;
}

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
