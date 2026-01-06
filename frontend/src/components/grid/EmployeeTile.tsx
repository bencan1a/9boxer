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
 * **Selection Highlighting**:
 * - Selected: Blue outer glow (3px box-shadow) using primary color
 * - Can combine with movement borders (e.g., orange border + blue glow)
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

import React, { useMemo } from "react";
import { useDraggable } from "@dnd-kit/core";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import Tooltip from "@mui/material/Tooltip";
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
  onDoubleClick?: (employeeId: number) => void;
  donutModeActive?: boolean;
  originalPositionVariant?: OriginalPositionVariant;
  isSelected?: boolean;
}

/**
 * Truncate string to max length with ellipsis
 */
const truncate = (str: string, maxLength: number): string => {
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength) + "…";
};

const EmployeeTileComponent: React.FC<EmployeeTileProps> = ({
  employee,
  onSelect,
  onDoubleClick,
  donutModeActive = false,
  originalPositionVariant = "icon-text",
  isSelected = false,
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

  const handleCardDoubleClick = () => {
    logger.debug(
      "Card double-clicked - opening details:",
      employee.employee_id,
      employee.name
    );
    if (onDoubleClick) {
      onDoubleClick(employee.employee_id);
    }
  };

  // Memoize computed values to avoid recalculation on every render
  const flags = useMemo(() => employee.flags || [], [employee.flags]);

  const hasMoved = useMemo(
    () =>
      donutModeActive
        ? Boolean(employee.donut_position)
        : employee.modified_in_session,
    [donutModeActive, employee.donut_position, employee.modified_in_session]
  );

  const originalPosition = useMemo(
    () =>
      donutModeActive
        ? employee.grid_position
        : employee.original_grid_position || null,
    [donutModeActive, employee.grid_position, employee.original_grid_position]
  );

  const originalPositionLabel = useMemo(
    () => (originalPosition ? getPositionLabel(originalPosition) : null),
    [originalPosition]
  );

  const showBorder = useMemo(
    () =>
      (donutModeActive && employee.donut_position) ||
      employee.modified_in_session,
    [donutModeActive, employee.donut_position, employee.modified_in_session]
  );

  const borderColor = useMemo(() => {
    if (donutModeActive && employee.donut_position) {
      return theme.tokens.colors.semantic.donutMode; // Purple
    }
    if (employee.modified_in_session) {
      return theme.palette.secondary.main; // Orange
    }
    return "transparent";
  }, [
    donutModeActive,
    employee.donut_position,
    employee.modified_in_session,
    theme.tokens.colors.semantic.donutMode,
    theme.palette.secondary.main,
  ]);

  const selectionStyles = useMemo(() => {
    const outline =
      theme.palette.mode === "dark"
        ? theme.tokens.colors.selection.dark.outline
        : theme.tokens.colors.selection.light.outline;
    const width = theme.tokens.colors.selection.light.outlineWidth;
    return { outline, width };
  }, [
    theme.palette.mode,
    theme.tokens.colors.selection.dark.outline,
    theme.tokens.colors.selection.light.outline,
    theme.tokens.colors.selection.light.outlineWidth,
  ]);

  // Memoize Card sx prop to avoid recalculation
  const cardSx = useMemo(
    () => ({
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
      borderColor: showBorder ? borderColor : "divider",
      // Selection state: blue outer glow (can combine with border colors)
      boxShadow: isSelected
        ? `0 0 0 ${selectionStyles.width}px ${selectionStyles.outline}`
        : 1,
      "&:hover": {
        boxShadow: isSelected
          ? `0 0 0 ${selectionStyles.width}px ${selectionStyles.outline}, 0 4px 8px rgba(0,0,0,0.15)`
          : 3,
      },
    }),
    [
      tokens.tile.minWidth,
      tokens.tile.maxWidth,
      isDragging,
      donutModeActive,
      employee.donut_position,
      showBorder,
      borderColor,
      isSelected,
      selectionStyles.width,
      selectionStyles.outline,
    ]
  );

  // Memoize flag container sx
  const flagContainerSx = useMemo(
    () => ({
      position: "absolute",
      top: theme.tokens.spacing.xs,
      right: theme.tokens.spacing.xs,
      display: "flex",
      flexDirection: "row",
      gap: `${tokens.spacing.flagGap}px`,
      zIndex: 1,
    }),
    [theme.tokens.spacing.xs, tokens.spacing.flagGap]
  );

  // Memoize drag handle sx
  const dragHandleSx = useMemo(
    () => ({
      width: tokens.tile.dragHandleWidth,
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
    }),
    [tokens.tile.dragHandleWidth]
  );

  // Memoize card content sx
  const cardContentSx = useMemo(
    () => ({
      py: `${tokens.tile.paddingY}px`,
      pl: `${tokens.tile.paddingX}px`,
      pr: 3,
      "&:last-child": { pb: `${tokens.tile.paddingY}px` },
      flex: 1,
    }),
    [tokens.tile.paddingY, tokens.tile.paddingX]
  );

  return (
    <Card
      ref={setNodeRef}
      onClick={handleCardClick}
      onDoubleClick={handleCardDoubleClick}
      sx={cardSx}
      data-testid={`employee-card-${employee.employee_id}`}
      data-position={employee.grid_position}
      data-donut-position={employee.donut_position || ""}
      data-selected={isSelected}
    >
      {/* Flag Badges - Top Right Strip */}
      {flags.length > 0 && (
        <Box sx={flagContainerSx}>
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
        sx={dragHandleSx}
        onClick={(e) => e.stopPropagation()} // Prevent click from bubbling to card
      >
        <DragIndicatorIcon
          sx={{ fontSize: tokens.icon.dragHandle, color: "action.active" }}
        />
      </Box>

      {/* Card Content */}
      <CardContent sx={cardContentSx}>
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

/**
 * Order-independent array equality check.
 * More efficient than JSON.stringify for flag arrays.
 */
const areArraysEqual = (
  a: string[] | undefined,
  b: string[] | undefined
): boolean => {
  const arr1 = a || [];
  const arr2 = b || [];
  if (arr1.length !== arr2.length) return false;
  const sorted1 = [...arr1].sort();
  const sorted2 = [...arr2].sort();
  return sorted1.every((val, idx) => val === sorted2[idx]);
};

/**
 * Memoized EmployeeTile component to prevent unnecessary re-renders during drag operations.
 * Custom comparison function ensures tiles only re-render when their specific data changes.
 */
export const EmployeeTile = React.memo(
  EmployeeTileComponent,
  (prevProps, nextProps) => {
    // Return true if props are equal (skip re-render), false if different (re-render)
    return (
      prevProps.employee.employee_id === nextProps.employee.employee_id &&
      prevProps.employee.name === nextProps.employee.name &&
      prevProps.employee.business_title === nextProps.employee.business_title &&
      prevProps.employee.job_level === nextProps.employee.job_level &&
      prevProps.employee.performance === nextProps.employee.performance &&
      prevProps.employee.potential === nextProps.employee.potential &&
      prevProps.employee.grid_position === nextProps.employee.grid_position &&
      prevProps.employee.donut_position === nextProps.employee.donut_position &&
      prevProps.employee.modified_in_session ===
        nextProps.employee.modified_in_session &&
      prevProps.employee.original_grid_position ===
        nextProps.employee.original_grid_position &&
      areArraysEqual(prevProps.employee.flags, nextProps.employee.flags) &&
      prevProps.donutModeActive === nextProps.donutModeActive &&
      prevProps.originalPositionVariant === nextProps.originalPositionVariant &&
      prevProps.isSelected === nextProps.isSelected &&
      prevProps.onSelect === nextProps.onSelect &&
      prevProps.onDoubleClick === nextProps.onDoubleClick
    );
  }
);
