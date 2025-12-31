/**
 * DraggedEmployeeTile component
 *
 * Optimized overlay component shown during drag operations.
 * Memoized to prevent unnecessary re-renders during drag movements.
 *
 * @component
 */

import React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import Tooltip from "@mui/material/Tooltip";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import HistoryIcon from "@mui/icons-material/History";
import { Employee } from "../../types/employee";
import { getFlagDisplayName, getFlagColor } from "../../constants/flags";
import { getPositionLabel } from "../../constants/positionLabels";
import { useGridZoom } from "../../contexts/GridZoomContext";

interface DraggedEmployeeTileProps {
  employee: Employee;
  donutModeActive?: boolean;
}

/**
 * Truncate string to max length with ellipsis
 */
const truncate = (str: string, maxLength: number): string => {
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength) + "…";
};

const DraggedEmployeeTileComponent: React.FC<DraggedEmployeeTileProps> = ({
  employee,
  donutModeActive = false,
}) => {
  const theme = useTheme();
  const { tokens } = useGridZoom();

  // Calculate flags, movement state, and original position
  const flags = employee.flags || [];
  const hasMoved = donutModeActive
    ? Boolean(employee.donut_position)
    : employee.modified_in_session;
  const originalPosition = donutModeActive
    ? employee.grid_position
    : employee.original_grid_position || null;
  const originalPositionLabel = originalPosition
    ? getPositionLabel(originalPosition)
    : null;

  // Determine border color
  const getBorderColor = () => {
    if (donutModeActive && employee.donut_position) {
      return theme.tokens.colors.semantic.donutMode; // Purple
    }
    if (employee.modified_in_session) {
      return theme.palette.secondary.main; // Orange
    }
    return "divider";
  };

  return (
    <Card
      sx={{
        mb: 1,
        minWidth: tokens.tile.minWidth,
        maxWidth: tokens.tile.maxWidth,
        cursor: "grabbing",
        display: "flex",
        opacity: 0.9,
        userSelect: "none",
        position: "relative",
        border: 2,
        borderStyle: "solid",
        borderColor: getBorderColor(),
        boxShadow: 6,
      }}
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
            gap: 0.5,
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
              />
            </Tooltip>
          ))}
        </Box>
      )}

      {/* Drag Handle */}
      <Box
        sx={{
          width: 24,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "grabbing",
          borderRight: 1,
          borderColor: "divider",
          backgroundColor: "action.hover",
        }}
      >
        <DragIndicatorIcon
          sx={{ fontSize: tokens.icon.dragHandle, color: "action.active" }}
        />
      </Box>

      {/* Card Content */}
      <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 }, flex: 1, pr: 3 }}>
        {/* Row 1: Name */}
        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
          {employee.name}
        </Typography>

        {/* Row 2: Title | Level (left) + Original Position (right) */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {/* Left side: Title | Level inline */}
          <Typography
            variant="body2"
            color="text.secondary"
            fontSize="0.75rem"
            sx={{
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
          {hasMoved && originalPositionLabel && (
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
 * Memoized DraggedEmployeeTile to prevent re-renders during drag operations.
 * Only re-renders when the employee data actually changes.
 */
export const DraggedEmployeeTile = React.memo(
  DraggedEmployeeTileComponent,
  (prevProps, nextProps) => {
    // Return true if props are equal (skip re-render), false if different (re-render)
    return (
      prevProps.employee.employee_id === nextProps.employee.employee_id &&
      prevProps.employee.name === nextProps.employee.name &&
      prevProps.employee.business_title === nextProps.employee.business_title &&
      prevProps.employee.job_level === nextProps.employee.job_level &&
      prevProps.employee.grid_position === nextProps.employee.grid_position &&
      prevProps.employee.donut_position === nextProps.employee.donut_position &&
      prevProps.employee.modified_in_session ===
        nextProps.employee.modified_in_session &&
      prevProps.employee.original_grid_position ===
        nextProps.employee.original_grid_position &&
      areArraysEqual(prevProps.employee.flags, nextProps.employee.flags) &&
      prevProps.donutModeActive === nextProps.donutModeActive
    );
  }
);
