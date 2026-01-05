/**
 * Grid Position Filter Component
 *
 * Interactive 3x3 grid for filtering employees by grid position.
 * Multi-select interface matching the 9-box grid layout and colors.
 */

import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import ButtonBase from "@mui/material/ButtonBase";
import { alpha } from "@mui/system";
import { useTheme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import {
  getPositionName,
  getPositionGuidance,
} from "../../../constants/positionLabels";
import { isInPerformanceBucket } from "../../../constants/performanceBuckets";

export interface GridPositionFilterProps {
  selectedPositions: number[];
  onPositionsChange: (positions: number[]) => void;
  employeeCounts?: Record<number, number>;
}

export const GridPositionFilter: React.FC<GridPositionFilterProps> = ({
  selectedPositions,
  onPositionsChange,
  employeeCounts,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();

  /**
   * Get background color for a grid position
   * Matches the color scheme from GridBox component
   */
  const getBackgroundColor = (position: number): string => {
    // High Performers: [M,H], [H,H], [H,M] = positions 8, 9, 6
    if (isInPerformanceBucket(position, "High")) {
      return theme.palette.gridBox.highPerformer;
    }
    // Needs Attention: [L,L], [M,L], [L,M] = positions 1, 2, 4
    if (isInPerformanceBucket(position, "Low")) {
      return theme.palette.gridBox.needsAttention;
    }
    // Solid Performer: [M,M] = position 5
    if (position === 5) {
      return theme.palette.gridBox.solidPerformer;
    }
    // Development: [L,H], [H,L] = positions 7, 3
    if ([3, 7].includes(position)) {
      return theme.palette.gridBox.development;
    }
    // Fallback (should not happen)
    return theme.palette.background.default;
  };

  /**
   * Toggle position selection
   */
  const handleTogglePosition = (position: number) => {
    if (selectedPositions.includes(position)) {
      onPositionsChange(selectedPositions.filter((p) => p !== position));
    } else {
      onPositionsChange([...selectedPositions, position]);
    }
  };

  /**
   * Clear all selections
   */
  const handleClearSelection = () => {
    onPositionsChange([]);
  };

  // Grid layout: 3x3
  // Row 1 (top): positions 7, 8, 9 (High Potential)
  // Row 2 (middle): positions 4, 5, 6 (Medium Potential)
  // Row 3 (bottom): positions 1, 2, 3 (Low Potential)
  const gridPositions = [
    [7, 8, 9], // Top row (High Potential)
    [4, 5, 6], // Middle row (Medium Potential)
    [1, 2, 3], // Bottom row (Low Potential)
  ];

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: theme.tokens.spacing.md,
      }}
      data-testid="grid-position-filter"
    >
      {/* Grid */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gridTemplateRows: "repeat(3, 1fr)",
          gap: theme.tokens.spacing.sm,
          aspectRatio: "1 / 1",
        }}
      >
        {gridPositions.flat().map((position) => {
          const isSelected = selectedPositions.includes(position);
          const count = employeeCounts?.[position] ?? 0;
          const bgColor = getBackgroundColor(position);

          return (
            <ButtonBase
              key={position}
              onClick={() => handleTogglePosition(position)}
              aria-label={`${getPositionName(position)} - ${getPositionGuidance(position)}`}
              aria-pressed={isSelected}
              data-testid={`grid-position-${position}`}
              sx={{
                border: 2,
                borderColor: isSelected
                  ? theme.palette.primary.main
                  : theme.palette.divider,
                borderRadius: theme.tokens.radius.sm,
                backgroundColor: bgColor,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: theme.tokens.spacing.xs,
                padding: theme.tokens.spacing.sm,
                transition: `all ${theme.tokens.duration.fast} ${theme.tokens.easing.easeInOut}`,
                opacity: isSelected ? 1 : theme.tokens.opacity.inactive,
                boxShadow: isSelected ? 2 : 0,
                "&:hover": {
                  opacity: 1,
                  borderColor: theme.palette.primary.main,
                  backgroundColor: alpha(bgColor, 0.9),
                },
                "&:focus-visible": {
                  outline: `2px solid ${theme.palette.primary.main}`,
                  outlineOffset: 2,
                },
              }}
            >
              {/* Position label */}
              <Typography
                variant="caption"
                fontWeight="bold"
                sx={{
                  fontSize: "0.7rem",
                  textAlign: "center",
                  color: theme.palette.text.primary,
                  lineHeight: 1.2,
                }}
              >
                {getPositionName(position)}
              </Typography>

              {/* Employee count */}
              {employeeCounts && count > 0 && (
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: "0.65rem",
                    color: theme.palette.text.secondary,
                    backgroundColor: alpha(theme.palette.background.paper, 0.7),
                    borderRadius: theme.tokens.radius.sm,
                    padding: `${theme.tokens.spacing.xs / 2}px ${theme.tokens.spacing.xs}px`,
                    minWidth: 20,
                    textAlign: "center",
                  }}
                  data-testid={`grid-position-${position}-count`}
                >
                  {count}
                </Typography>
              )}
            </ButtonBase>
          );
        })}
      </Box>

      {/* Clear button */}
      {selectedPositions.length > 0 && (
        <Button
          variant="text"
          size="small"
          onClick={handleClearSelection}
          data-testid="grid-position-clear-button"
          sx={{
            textTransform: "none",
            color: theme.palette.text.secondary,
            fontSize: "0.875rem",
          }}
        >
          {t("dashboard.filterDrawer.clearSelection")} (
          {selectedPositions.length})
        </Button>
      )}
    </Box>
  );
};
