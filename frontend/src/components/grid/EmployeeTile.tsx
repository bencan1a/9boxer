/**
 * Employee tile component (draggable)
 *
 * Individual employee card shown within grid boxes. Displays employee
 * name, title, job level, and flags. Supports drag-and-drop.
 *
 * **Movement Highlighting** (Consistent full border approach):
 * - Session Modified: Full orange border (2px)
 * - Donut Mode: Full purple border (2px)
 *
 * **Flag Display** (Treatment 2 - Badge Strip):
 * - Individual colored circular badges (16px) at top-right
 * - Each flag shows its semantic color
 * - Tooltip shows flag name on hover
 *
 * @component
 * @screenshots
 *   - employee-tile-normal: Individual employee tile showing name and role
 *   - changes-orange-border: Employee tile with orange modified border (full border)
 *   - details-flag-badges: Employee tiles showing individual flag badges in top-right corner
 */

import React from "react";
import { useDraggable } from "@dnd-kit/core";
import {
  Card,
  CardContent,
  Typography,
  Box,
  useTheme,
  Tooltip,
} from "@mui/material";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import HistoryIcon from "@mui/icons-material/History";
import { Employee } from "../../types/employee";
import { logger } from "../../utils/logger";
import { getFlagDisplayName, getFlagColor } from "../../constants/flags";
import { getPositionLabel } from "../../constants/positionLabels";
import { useGridZoom } from "../../contexts/GridZoomContext";

export type OriginalPositionVariant =
  | "none"
  | "chip"
  | "text"
  | "text-compact"
  | "arrow"
  | "icon-text";

interface EmployeeTileProps {
  employee: Employee;
  onSelect: (employeeId: number) => void;
  donutModeActive?: boolean;
  originalPositionVariant?: OriginalPositionVariant;
}

/**
 * Truncate string to max length with ellipsis
 */
const truncate = (str: string, maxLength: number): string => {
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength) + "…";
};

export const EmployeeTile: React.FC<EmployeeTileProps> = ({
  employee,
  onSelect,
  donutModeActive = false,
  originalPositionVariant = "icon-text",
}) => {
  const theme = useTheme();
  const { tokens } = useGridZoom();
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, isDragging } =
    useDraggable({
      id: `employee-${employee.employee_id}`,
      data: { employee },
    });

  const handleCardClick = () => {
    logger.debug(
      "Card clicked - selecting employee:",
      employee.employee_id,
      employee.name
    );
    onSelect(employee.employee_id);
  };

  // Get flags
  const flags = employee.flags || [];

  // Determine if employee has moved and what the original position was
  const hasMoved = donutModeActive
    ? Boolean(employee.donut_position)
    : employee.modified_in_session;

  const originalPosition = donutModeActive
    ? employee.grid_position // In donut mode, grid_position is where they started
    : employee.original_grid_position || null; // In normal mode, use original_grid_position if available

  const originalPositionLabel = originalPosition
    ? getPositionLabel(originalPosition)
    : null;

  // Determine border color based on modification state
  const getBorderColor = () => {
    if (donutModeActive && employee.donut_position) {
      return theme.tokens.colors.semantic.donutMode; // Purple
    }
    if (employee.modified_in_session) {
      return theme.palette.secondary.main; // Orange
    }
    return "transparent";
  };

  const showBorder =
    (donutModeActive && employee.donut_position) ||
    employee.modified_in_session;

  return (
    <Card
      ref={setNodeRef}
      onClick={handleCardClick}
      sx={{
        mb: 1,
        minWidth: tokens.tile.minWidth,
        maxWidth: tokens.tile.maxWidth,
        cursor: "pointer",
        display: "flex",
        opacity: isDragging
          ? 0.5
          : donutModeActive && employee.donut_position
            ? 0.7
            : 1,
        userSelect: "none",
        position: "relative",
        // Consistent full border for both movement types
        border: 2,
        borderStyle: "solid",
        borderColor: showBorder ? getBorderColor() : "divider",
        boxShadow: 1,
        "&:hover": {
          boxShadow: 3,
        },
      }}
      data-testid={`employee-card-${employee.employee_id}`}
      data-position={employee.grid_position}
      data-donut-position={employee.donut_position || ""}
    >
      {/* Flag Badges - Top Right Strip */}
      {flags.length > 0 && (
        <Box
          sx={{
            position: "absolute",
            top: theme.tokens.spacing.xs,
            right: theme.tokens.spacing.xs,
            display: "flex",
            flexDirection: "row",
            gap: `${tokens.spacing.flagGap}px`,
            zIndex: 1,
          }}
        >
          {flags.map((flag, index) => (
            <Tooltip
              key={index}
              title={getFlagDisplayName(flag)}
              arrow
              placement="top"
            >
              <Box
                sx={{
                  width: tokens.icon.flag,
                  height: tokens.icon.flag,
                  borderRadius: "50%",
                  backgroundColor: getFlagColor(flag),
                  border: 2,
                  borderColor: "background.paper",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                role="img"
                aria-label={getFlagDisplayName(flag)}
                data-testid={`flag-badge-${index}`}
              />
            </Tooltip>
          ))}
        </Box>
      )}

      {/* Drag Handle */}
      <Box
        ref={setActivatorNodeRef}
        {...listeners}
        {...attributes}
        sx={{
          width: 24,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "grab",
          borderRight: 1,
          borderColor: "divider",
          backgroundColor: "action.hover",
          "&:active": {
            cursor: "grabbing",
          },
        }}
        onClick={(e) => e.stopPropagation()} // Prevent click from bubbling to card
      >
        <DragIndicatorIcon
          sx={{ fontSize: tokens.icon.dragHandle, color: "action.active" }}
        />
      </Box>

      {/* Card Content */}
      <CardContent
        sx={{
          p: `${tokens.tile.padding}px`,
          "&:last-child": { pb: `${tokens.tile.padding}px` },
          flex: 1,
          pr: 3,
        }}
      >
        {/* Row 1: Name */}
        <Typography
          variant="subtitle2"
          fontWeight="bold"
          gutterBottom
          sx={{
            fontSize: tokens.font.name,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {employee.name}
        </Typography>

        {/* Row 2: Title | Level (left) + Original Position (right) */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {/* Left side: Title | Level inline */}
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              fontSize: tokens.font.titleLevel,
              flex: 1,
              minWidth: 0,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {truncate(employee.business_title, 16)} |{" "}
            {truncate(employee.job_level, 16)}
          </Typography>

          {/* Right side: Original Position Indicator with Tooltip */}
          {hasMoved &&
            originalPositionLabel &&
            originalPositionVariant !== "none" && (
              <Tooltip
                title="Original position at session start"
                arrow
                placement="top"
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                    flexShrink: 0,
                  }}
                  data-testid="original-position-icon-text"
                >
                  <HistoryIcon
                    sx={{
                      fontSize: tokens.icon.history,
                      color: "text.disabled",
                    }}
                  />
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    fontSize={theme.tokens.typography.fontSize.caption}
                    sx={{ whiteSpace: "nowrap" }}
                  >
                    {originalPositionLabel}
                  </Typography>
                </Box>
              </Tooltip>
            )}
        </Box>
      </CardContent>
    </Card>
  );
};
