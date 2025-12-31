/**
 * 9-Box Grid component with drag-and-drop
 *
 * Main talent grid visualization component that displays employees
 * organized by performance and potential levels.
 *
 * @component
 * @screenshots
 *   - grid-normal: Standard 9-box grid with employee tiles
 *   - quickstart-grid-populated: Populated grid after successful file upload
 *   - hero-grid-sample: Hero image showing full grid with sample data
 *   - donut-mode-active-layout: Active donut mode layout showing purple-bordered tiles in outer boxes
 *   - changes-drag-sequence: Base grid for 3-panel drag sequence
 *   - filters-active-chips: Grid view with active filter chips and orange dot indicator
 *   - filters-before-after: Before/after filtering comparison
 */

import React, { useState, useEffect } from "react";
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from "@dnd-kit/core";
import { Box, Typography, Card, CardContent, Tooltip } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import HistoryIcon from "@mui/icons-material/History";
import { GridBox } from "./GridBox";
import { EmployeeCount } from "./EmployeeCount";
import { Axis } from "./Axis";
import { useEmployees } from "../../hooks/useEmployees";
import { useSessionStore } from "../../store/sessionStore";
import { Employee } from "../../types/employee";
import { logger } from "../../utils/logger";
import { getFlagDisplayName, getFlagColor } from "../../constants/flags";
import { getPositionLabel } from "../../constants/positionLabels";

const EXPANDED_POSITION_STORAGE_KEY = "nineBoxExpandedPosition";

/**
 * Truncate string to max length with ellipsis
 */
const truncate = (str: string, maxLength: number): string => {
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength) + "…";
};

export const NineBoxGrid: React.FC = () => {
  const theme = useTheme();
  const {
    employeesByPosition,
    getShortPositionLabel,
    positionToLevels,
    moveEmployee,
    selectEmployee,
  } = useEmployees();

  const { donutModeActive, moveEmployeeDonut } = useSessionStore();

  const [activeEmployee, setActiveEmployee] = useState<Employee | null>(null);
  const [expandedPosition, setExpandedPosition] = useState<number | null>(
    () => {
      // Restore from localStorage on mount
      const stored = localStorage.getItem(EXPANDED_POSITION_STORAGE_KEY);
      if (stored) {
        const parsed = parseInt(stored, 10);
        // Validate position is 1-9 and not NaN
        if (!isNaN(parsed) && parsed >= 1 && parsed <= 9) {
          return parsed;
        }
      }
      return null;
    }
  );

  const handleDragStart = (event: DragStartEvent) => {
    const employee = event.active.data.current?.employee as
      | Employee
      | undefined;
    if (employee) {
      setActiveEmployee(employee);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    setActiveEmployee(null);

    if (!over) return;

    // Extract employee and target position
    const employee = active.data.current?.employee as Employee | undefined;
    const targetPosition = over.data.current?.position as number | undefined;

    if (!employee || !targetPosition) return;

    // Don't move if already in that position
    if (employee.grid_position === targetPosition) return;

    // Get performance and potential for target position
    const { performance, potential } = positionToLevels(targetPosition);

    try {
      // Use appropriate move function based on donut mode
      if (donutModeActive) {
        await moveEmployeeDonut(employee.employee_id, performance, potential);
      } else {
        await moveEmployee(employee.employee_id, performance, potential);
      }
    } catch (error) {
      logger.error("Failed to move employee", error);
    }
  };

  const handleDragCancel = () => {
    setActiveEmployee(null);
  };

  const handleExpandBox = (position: number) => {
    // Validate position
    if (position < 1 || position > 9) return;
    setExpandedPosition(position);
    localStorage.setItem(EXPANDED_POSITION_STORAGE_KEY, position.toString());
  };

  const handleCollapseBox = () => {
    setExpandedPosition(null);
    localStorage.removeItem(EXPANDED_POSITION_STORAGE_KEY);
  };

  // ESC key listener for collapse
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && expandedPosition !== null) {
        // Inline collapse logic to avoid stale closure
        setExpandedPosition(null);
        localStorage.removeItem(EXPANDED_POSITION_STORAGE_KEY);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [expandedPosition]);

  // Grid layout: 3x3
  // Row 1 (top): positions 7, 8, 9 (High Potential)
  // Row 2 (middle): positions 4, 5, 6 (Medium Potential)
  // Row 3 (bottom): positions 1, 2, 3 (Low Potential)
  // Columns: Low, Medium, High Performance (left to right)

  const gridPositions = [
    [7, 8, 9], // Top row (High Potential)
    [4, 5, 6], // Middle row (Medium Potential)
    [1, 2, 3], // Bottom row (Low Potential)
  ];

  /**
   * Calculate dynamic grid template based on expanded position
   * @param position - The expanded position (1-9), or null for normal layout
   * @returns Object with gridTemplateColumns and gridTemplateRows strings
   */
  const getGridTemplate = (
    position: number | null
  ): { gridTemplateColumns: string; gridTemplateRows: string } => {
    if (position === null) {
      // Normal mode: equal sizing
      return {
        gridTemplateColumns: "repeat(3, 1fr)",
        gridTemplateRows: "repeat(3, 1fr)",
      };
    }

    // Map position to row and column indices
    // Positions: [7,8,9] = row 0, [4,5,6] = row 1, [1,2,3] = row 2
    let row = 0;
    let col = 0;

    if (position >= 7 && position <= 9) {
      row = 0;
      col = position - 7; // 7→0, 8→1, 9→2
    } else if (position >= 4 && position <= 6) {
      row = 1;
      col = position - 4; // 4→0, 5→1, 6→2
    } else if (position >= 1 && position <= 3) {
      row = 2;
      col = position - 1; // 1→0, 2→1, 3→2
    }

    // Expanded mode: Make target row/col large, others small
    const smallSize = "80px";
    const largeSize = "1fr";

    const cols = [smallSize, smallSize, smallSize];
    cols[col] = largeSize;

    const rows = [smallSize, smallSize, smallSize];
    rows[row] = largeSize;

    return {
      gridTemplateColumns: cols.join(" "),
      gridTemplateRows: rows.join(" "),
    };
  };

  const gridTemplate = getGridTemplate(expandedPosition);

  return (
    <DndContext
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <Box
        sx={{
          p: 2,
          minHeight: "calc(100vh - 80px)",
          width: "100%",
          userSelect: "none",
          display: "flex",
          flexDirection: "column",
        }}
        data-testid="nine-box-grid"
      >
        {/* Header row with Performance label, employee count, and view mode toggle */}
        <Box
          sx={{ display: "flex", mb: 1, width: "100%", alignItems: "center" }}
        >
          <Box sx={{ width: 64 }} /> {/* Spacer for left label alignment */}
          <Box
            sx={{
              flex: 1,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 2,
            }}
          >
            {/* Left: Empty for balance */}
            <Box sx={{ width: 120 }} />

            {/* Center: Performance label + Employee count */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                flexDirection: { xs: "column", sm: "row" },
              }}
            >
              <Axis orientation="horizontal" />
              <EmployeeCount />
            </Box>

            {/* Right: Empty for balance (view controls moved to floating position) */}
            <Box sx={{ width: 120 }} />
          </Box>
        </Box>

        <Box sx={{ display: "flex", flex: 1, minHeight: 0, width: "100%" }}>
          {/* Left axis label */}
          <Axis orientation="vertical" />

          {/* Grid */}
          <Box
            sx={{
              flex: 1,
              display: "grid",
              gridTemplateColumns: gridTemplate.gridTemplateColumns,
              gridTemplateRows: gridTemplate.gridTemplateRows,
              gap: 2,
              transition: `grid-template-columns ${theme.tokens.duration.normal} ${theme.tokens.easing.easeInOut}, grid-template-rows ${theme.tokens.duration.normal} ${theme.tokens.easing.easeInOut}, gap ${theme.tokens.duration.normal} ${theme.tokens.easing.easeInOut}`,
            }}
          >
            {gridPositions.flat().map((position) => (
              <GridBox
                key={position}
                position={position}
                employees={employeesByPosition[position] || []}
                shortLabel={getShortPositionLabel(position)}
                onSelectEmployee={selectEmployee}
                isExpanded={expandedPosition === position}
                isCollapsed={
                  expandedPosition !== null && expandedPosition !== position
                }
                onExpand={() => handleExpandBox(position)}
                onCollapse={handleCollapseBox}
                donutModeActive={donutModeActive}
              />
            ))}
          </Box>
        </Box>
      </Box>

      {/* Drag Overlay - shows the dragged item */}
      <DragOverlay dropAnimation={null}>
        {activeEmployee
          ? (() => {
              // Calculate flags, movement state, and original position (same logic as EmployeeTile)
              const flags = activeEmployee.flags || [];
              const hasMoved = donutModeActive
                ? Boolean(activeEmployee.donut_position)
                : activeEmployee.modified_in_session;
              const originalPosition = donutModeActive
                ? activeEmployee.grid_position
                : activeEmployee.original_grid_position || null;
              const originalPositionLabel = originalPosition
                ? getPositionLabel(originalPosition)
                : null;

              return (
                <Card
                  sx={{
                    mb: 1,
                    minWidth: 280,
                    maxWidth: 400,
                    cursor: "grabbing",
                    display: "flex",
                    opacity: 0.9,
                    userSelect: "none",
                    position: "relative",
                    border: 2,
                    borderStyle: "solid",
                    borderColor: (() => {
                      if (donutModeActive && activeEmployee.donut_position) {
                        return theme.tokens.colors.semantic.donutMode; // Purple
                      }
                      if (activeEmployee.modified_in_session) {
                        return theme.palette.secondary.main; // Orange
                      }
                      return "divider";
                    })(),
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
                      sx={{ fontSize: 16, color: "action.active" }}
                    />
                  </Box>

                  {/* Card Content */}
                  <CardContent
                    sx={{ p: 1.5, "&:last-child": { pb: 1.5 }, flex: 1, pr: 3 }}
                  >
                    {/* Row 1: Name */}
                    <Typography
                      variant="subtitle2"
                      fontWeight="bold"
                      gutterBottom
                    >
                      {activeEmployee.name}
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
                        {truncate(activeEmployee.business_title, 16)} |{" "}
                        {truncate(activeEmployee.job_level, 16)}
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
                                fontSize: 12,
                                color: "text.disabled",
                              }}
                            />
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              fontSize={
                                theme.tokens.typography.fontSize.caption
                              }
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
            })()
          : null}
      </DragOverlay>
    </DndContext>
  );
};
