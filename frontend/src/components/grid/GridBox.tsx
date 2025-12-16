/**
 * Grid box component (droppable)
 */

import React from "react";
import { useDroppable } from "@dnd-kit/core";
import { Box, Typography, Badge, IconButton, alpha } from "@mui/material";
import OpenInFullIcon from "@mui/icons-material/OpenInFull";
import CloseFullscreenIcon from "@mui/icons-material/CloseFullscreen";
import { Employee } from "../../types/employee";
import { EmployeeTile } from "./EmployeeTile";

// Styling constants
const BOX_HEIGHTS = {
  COLLAPSED_MIN: 60,
  COLLAPSED_MAX: 80,
  NORMAL_MIN: 150,
  NORMAL_MAX: 400,
  EXPANDED_MIN: 200,
  EXPANDED_VIEWPORT_OFFSET: 250, // Space for headers, margins, other collapsed boxes
} as const;

const OPACITY = {
  COLLAPSED_IDLE: 0.7,
  COLLAPSED_DRAG_OVER: 1,
  EXPAND_BUTTON_IDLE: 0.6,
  EXPAND_BUTTON_ACTIVE: 1,
} as const;

interface GridBoxProps {
  position: number;
  employees: Employee[];
  shortLabel: string;
  onSelectEmployee: (employeeId: number) => void;
  isExpanded?: boolean;
  isCollapsed?: boolean;
  onExpand?: () => void;
  onCollapse?: () => void;
}

export const GridBox: React.FC<GridBoxProps> = ({
  position,
  employees,
  shortLabel,
  onSelectEmployee,
  isExpanded = false,
  isCollapsed = false,
  onExpand,
  onCollapse,
}) => {
  // Validate mutually exclusive states
  if (isExpanded && isCollapsed) {
    console.error(
      `GridBox (position ${position}): Cannot be both expanded and collapsed. Using expanded state.`
    );
  }

  const { setNodeRef, isOver } = useDroppable({
    id: `grid-${position}`,
    data: { position },
  });

  // Background color based on position (performance/potential)
  const getBackgroundColor = (pos: number): string => {
    // High performance rows (3, 6, 9)
    if ([3, 6, 9].includes(pos)) {
      return "#e8f5e9"; // Light green
    }
    // High potential columns (7, 8, 9)
    if ([7, 8, 9].includes(pos)) {
      return "#e3f2fd"; // Light blue
    }
    // Medium
    if ([2, 5, 8].includes(pos)) {
      return "#fff9e6"; // Light yellow
    }
    // Low
    return "#ffebee"; // Light red
  };

  // Calculate dynamic styling based on expansion state
  const getBoxStyling = () => {
    const bgColor = getBackgroundColor(position);

    const baseStyles = {
      border: 2,
      borderColor: isOver ? "primary.main" : "divider",
      borderRadius: 1,
      p: 1.5,
      backgroundColor: isOver ? "primary.light" : bgColor,
      transition:
        "min-height 0.3s ease-in-out, max-height 0.3s ease-in-out, opacity 0.3s ease-in-out, background-color 0.3s ease-in-out, border-color 0.3s ease-in-out, border-style 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
      userSelect: "none",
      overflowY: "auto" as const,
    };

    // Collapsed state takes precedence if both are true (though validation warns about this)
    if (isCollapsed && !isExpanded) {
      // Collapsed: Small, no scrolling needed
      return {
        ...baseStyles,
        minHeight: BOX_HEIGHTS.COLLAPSED_MIN,
        maxHeight: BOX_HEIGHTS.COLLAPSED_MAX,
        opacity: isOver ? OPACITY.COLLAPSED_DRAG_OVER : OPACITY.COLLAPSED_IDLE,
        backgroundColor: isOver ? "primary.light" : alpha(bgColor, 0.5),
        borderStyle: isOver ? "dashed" : "solid",
        display: "flex",
        flexDirection: "column" as const,
        justifyContent: "center",
      };
    }

    if (isExpanded) {
      // Expanded: Large, with max-height based on viewport
      return {
        ...baseStyles,
        minHeight: BOX_HEIGHTS.EXPANDED_MIN,
        maxHeight: `calc(100vh - ${BOX_HEIGHTS.EXPANDED_VIEWPORT_OFFSET}px)`,
        boxShadow: 4,
      };
    }

    // Normal mode
    return {
      ...baseStyles,
      minHeight: BOX_HEIGHTS.NORMAL_MIN,
      maxHeight: BOX_HEIGHTS.NORMAL_MAX,
    };
  };

  return (
    <Box ref={setNodeRef} sx={getBoxStyling()} aria-expanded={isExpanded}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: isCollapsed ? 0 : 1,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flex: 1 }}>
          <Typography
            variant="caption"
            fontWeight="bold"
            sx={{
              fontSize: isExpanded ? "0.85rem" : "0.7rem",
              display: "block",
            }}
          >
            {shortLabel}
          </Typography>
          {!isCollapsed && (
            <Badge
              badgeContent={employees.length}
              color="primary"
              sx={{ "& .MuiBadge-badge": { fontSize: "0.65rem", height: 16 } }}
            />
          )}
        </Box>

        {/* Expand/Collapse Button */}
        {isExpanded ? (
          <IconButton
            size="small"
            onClick={onCollapse}
            aria-label="Collapse box"
            sx={{ ml: 1 }}
          >
            <CloseFullscreenIcon fontSize="small" />
          </IconButton>
        ) : (
          <IconButton
            size="small"
            onClick={onExpand}
            aria-label="Expand box"
            sx={{
              ml: 1,
              opacity: isCollapsed ? OPACITY.EXPAND_BUTTON_ACTIVE : OPACITY.EXPAND_BUTTON_IDLE,
              transition: "opacity 0.3s ease-in-out",
              "&:hover": { opacity: OPACITY.EXPAND_BUTTON_ACTIVE },
            }}
          >
            <OpenInFullIcon fontSize="small" />
          </IconButton>
        )}
      </Box>

      {/* Employees - hidden when collapsed */}
      {!isCollapsed &&
        employees.map((employee) => (
          <EmployeeTile
            key={employee.employee_id}
            employee={employee}
            onSelect={onSelectEmployee}
          />
        ))}
    </Box>
  );
};
