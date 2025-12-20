/**
 * Grid box component (droppable)
 */

import React from "react";
import { useDroppable } from "@dnd-kit/core";
import { Box, Typography, Badge, IconButton, alpha, Tooltip } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import OpenInFullIcon from "@mui/icons-material/OpenInFull";
import CloseFullscreenIcon from "@mui/icons-material/CloseFullscreen";
import { Employee } from "../../types/employee";
import { EmployeeTile } from "./EmployeeTile";
import { getPositionName, getPositionGuidance } from "../../constants/positionLabels";
import { logger } from "../../utils/logger";

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
    logger.error(
      `GridBox (position ${position}): Cannot be both expanded and collapsed. Using expanded state.`
    );
  }

  const theme = useTheme();
  const { setNodeRef, isOver } = useDroppable({
    id: `grid-${position}`,
    data: { position },
  });

  // Background color based on position (performance/potential)
  // Position layout: [7=L,H], [8=M,H], [9=H,H] (top row)
  //                  [4=L,M], [5=M,M], [6=H,M] (middle row)
  //                  [1=L,L], [2=M,L], [3=H,L] (bottom row)
  const getBackgroundColor = (pos: number): string => {
    // High Performers: [M,H], [H,H], [H,M] = positions 8, 9, 6
    if ([6, 8, 9].includes(pos)) {
      return theme.palette.gridBox.highPerformer;
    }
    // Needs Attention: [L,L], [M,L], [L,M] = positions 1, 2, 4
    if ([1, 2, 4].includes(pos)) {
      return theme.palette.gridBox.needsAttention;
    }
    // Solid Performer: [M,M] = position 5
    if (pos === 5) {
      return theme.palette.gridBox.solidPerformer;
    }
    // Development: [L,H], [H,L] = positions 7, 3
    if ([3, 7].includes(pos)) {
      return theme.palette.gridBox.development;
    }
    // Fallback (should not happen)
    return theme.palette.background.default;
  };

  // Calculate dynamic styling based on expansion state
  const getBoxStyling = () => {
    const bgColor = getBackgroundColor(position);

    const baseStyles = {
      border: 2,
      borderColor: isOver ? "primary.main" : "divider",
      borderRadius: 1,
      p: 1.5,
      backgroundColor: isOver ? alpha(theme.palette.primary.main, 0.15) : bgColor,
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
    <Box ref={setNodeRef} sx={getBoxStyling()} aria-expanded={isExpanded} data-testid={`grid-box-${position}`}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: isCollapsed ? 0 : 1,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, flex: 1 }}>
          <Tooltip
            title={getPositionGuidance(position)}
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
              {getPositionName(position)} {shortLabel}
            </Typography>
          </Tooltip>
          {!isCollapsed && (
            <Badge
              badgeContent={employees.length}
              color="primary"
              sx={{ "& .MuiBadge-badge": { fontSize: "0.65rem", height: 16 } }}
              data-testid={`grid-box-${position}-count`}
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
