/**
 * Grid box component (droppable)
 */

import React from "react";
import { useDroppable } from "@dnd-kit/core";
import { Box, alpha } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Employee } from "../../types/employee";
import { BoxHeader } from "./BoxHeader";
import { EmployeeTileList } from "./EmployeeTileList";
import {
  getPositionName,
  getPositionGuidance,
} from "../../constants/positionLabels";
import { logger } from "../../utils/logger";

interface GridBoxProps {
  position: number;
  employees: Employee[];
  shortLabel: string;
  onSelectEmployee: (employeeId: number) => void;
  isExpanded?: boolean;
  isCollapsed?: boolean;
  onExpand?: () => void;
  onCollapse?: () => void;
  donutModeActive?: boolean;
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
  donutModeActive = false,
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
      backgroundColor: isOver
        ? alpha(theme.palette.primary.main, 0.15)
        : bgColor,
      transition: `min-height ${theme.tokens.duration.normal} ${theme.tokens.easing.easeInOut}, max-height ${theme.tokens.duration.normal} ${theme.tokens.easing.easeInOut}, opacity ${theme.tokens.duration.normal} ${theme.tokens.easing.easeInOut}, background-color ${theme.tokens.duration.normal} ${theme.tokens.easing.easeInOut}, border-color ${theme.tokens.duration.normal} ${theme.tokens.easing.easeInOut}, border-style ${theme.tokens.duration.normal} ${theme.tokens.easing.easeInOut}, box-shadow ${theme.tokens.duration.normal} ${theme.tokens.easing.easeInOut}`,
      userSelect: "none" as const,
      overflowY: isCollapsed ? ("hidden" as const) : ("auto" as const),
    };

    // Collapsed state takes precedence if both are true (though validation warns about this)
    if (isCollapsed && !isExpanded) {
      // Collapsed: Small, no scrolling needed
      return {
        ...baseStyles,
        minHeight: theme.tokens.dimensions.gridBox.collapsedMin,
        maxHeight: theme.tokens.dimensions.gridBox.collapsedMax,
        opacity: isOver
          ? theme.tokens.opacity.gridCollapsedDragOver
          : theme.tokens.opacity.gridCollapsedIdle,
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
        minHeight: theme.tokens.dimensions.gridBox.expandedMin,
        maxHeight: `calc(100vh - ${theme.tokens.dimensions.gridBox.expandedViewportOffset}px)`,
        boxShadow: 4,
      };
    }

    // Normal mode
    return {
      ...baseStyles,
      minHeight: theme.tokens.dimensions.gridBox.normalMin,
      maxHeight: theme.tokens.dimensions.gridBox.normalMax,
    };
  };

  return (
    <Box
      ref={setNodeRef}
      sx={getBoxStyling()}
      aria-expanded={isExpanded}
      data-testid={`grid-box-${position}`}
    >
      {/* Header */}
      <BoxHeader
        position={position}
        positionName={getPositionName(position)}
        shortLabel={shortLabel}
        employeeCount={employees.length}
        isExpanded={isExpanded}
        isCollapsed={isCollapsed}
        onExpand={onExpand}
        onCollapse={onCollapse}
        positionGuidance={getPositionGuidance(position)}
      />

      {/* Employees - hidden when collapsed */}
      {!isCollapsed && (
        <EmployeeTileList
          employees={employees}
          isExpanded={isExpanded}
          onSelectEmployee={onSelectEmployee}
          donutModeActive={donutModeActive}
        />
      )}
    </Box>
  );
};
