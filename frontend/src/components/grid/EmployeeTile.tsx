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
  Chip,
  Box,
  useTheme,
  Tooltip,
} from "@mui/material";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import { Employee } from "../../types/employee";
import { logger } from "../../utils/logger";
import { getFlagDisplayName, getFlagColor } from "../../constants/flags";

interface EmployeeTileProps {
  employee: Employee;
  onSelect: (employeeId: number) => void;
  donutModeActive?: boolean;
}

export const EmployeeTile: React.FC<EmployeeTileProps> = ({
  employee,
  onSelect,
  donutModeActive = false,
}) => {
  const theme = useTheme();
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
        minWidth: 280, // Minimum width for multi-column grid layout
        maxWidth: 400, // Maximum width for readability
        cursor: "pointer",
        display: "flex",
        opacity: isDragging ? 0.5 : 1,
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
                  width: 16,
                  height: 16,
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
        <DragIndicatorIcon sx={{ fontSize: 16, color: "action.active" }} />
      </Box>

      {/* Card Content */}
      <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 }, flex: 1, pr: 3 }}>
        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
          {employee.name}
        </Typography>
        <Typography variant="body2" color="text.secondary" fontSize="0.75rem">
          {employee.business_title}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.5 }}>
          <Chip label={employee.job_level} size="small" sx={{ height: 18 }} />
        </Box>
      </CardContent>
    </Card>
  );
};
