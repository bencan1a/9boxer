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
 *   - filters-active-chips: Grid view with active filter chips and orange dot indicator
 *   - filters-before-after: Before/after filtering comparison
 */

import React, { useState, useEffect, Profiler } from "react";
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from "@dnd-kit/core";
import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import { GridBox } from "./GridBox";
import { Axis } from "./Axis";
import { DraggedEmployeeTile } from "./DraggedEmployeeTile";
import { FilterToolbarContainer } from "../common/FilterToolbarContainer";
import { useEmployees } from "../../hooks/useEmployees";
import {
  useSessionStore,
  selectDonutModeActive,
  selectMoveEmployeeDonut,
} from "../../store/sessionStore";
import {
  useUiStore,
  selectIsRightPanelCollapsed,
  selectSetRightPanelCollapsed,
  selectSetActiveTab,
} from "../../store/uiStore";
import { Employee } from "../../types/employee";
import { logger } from "../../utils/logger";
import { useGridZoom } from "../../contexts/GridZoomContext";

const EXPANDED_POSITION_STORAGE_KEY = "nineBoxExpandedPosition";

/**
 * Performance profiler callback for NineBoxGrid
 * Logs render performance and warns about slow renders
 */
const onRenderCallback = (
  id: string,
  phase: "mount" | "update" | "nested-update",
  actualDuration: number
) => {
  // Only log in development mode
  if (import.meta.env.DEV) {
    // Warn if render takes longer than 16ms (60fps threshold)
    if (actualDuration > 16) {
      console.warn(
        `[Performance] ${id} ${phase}: ${actualDuration.toFixed(2)}ms (slower than 60fps)`
      );
    } else {
      console.log(
        `[Performance] ${id} ${phase}: ${actualDuration.toFixed(2)}ms`
      );
    }
  }
};

export const NineBoxGrid: React.FC = () => {
  const theme = useTheme();
  const { isResizing } = useGridZoom();
  const {
    employeesByPosition,
    getShortPositionLabel,
    positionToLevels,
    moveEmployee,
    selectEmployee,
    selectedEmployeeId,
  } = useEmployees();

  // Use granular selectors to minimize re-renders
  const donutModeActive = useSessionStore(selectDonutModeActive);
  const moveEmployeeDonut = useSessionStore(selectMoveEmployeeDonut);

  // UI store selectors for panel control
  const isRightPanelCollapsed = useUiStore(selectIsRightPanelCollapsed);
  const setRightPanelCollapsed = useUiStore(selectSetRightPanelCollapsed);
  const setActiveTab = useUiStore(selectSetActiveTab);

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

  const handleEmployeeDoubleClick = (employeeId: number) => {
    logger.debug("Employee double-clicked, opening details panel:", employeeId);

    // Select the employee
    selectEmployee(employeeId);

    // Open the panel if it's collapsed
    if (isRightPanelCollapsed) {
      setRightPanelCollapsed(false, false);
    }

    // Switch to the Details tab (index 0)
    setActiveTab(0);
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
    const smallSize = `${theme.tokens.dimensions.gridContainer.collapsedBoxSize}px`;
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
    <Profiler id="NineBoxGrid" onRender={onRenderCallback}>
      <DndContext
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <Box
          sx={{
            pt: `${theme.tokens.dimensions.gridContainer.padding}px`,
            pr: `${theme.tokens.dimensions.gridContainer.padding}px`,
            pb: `${theme.tokens.dimensions.gridContainer.padding}px`,
            pl: 0,
            height: "100%",
            width: "100%",
            userSelect: "none",
            display: "flex",
            flexDirection: "column",
          }}
          data-testid="nine-box-grid"
        >
          {/* Header row with Performance label and FilterToolbar */}
          <Box
            sx={{
              display: "flex",
              width: "100%",
              alignItems: "center",
              height: "40px",
              mb: 0.5,
            }}
          >
            <Box sx={{ width: theme.tokens.dimensions.axis.verticalWidth }} />{" "}
            {/* Spacer for left label alignment */}
            <Box
              sx={{
                flex: 1,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: 2,
                position: "relative",
              }}
            >
              {/* Left: FilterToolbar (positioned absolutely) */}
              <FilterToolbarContainer />

              {/* Center: Performance label */}
              <Axis orientation="horizontal" />
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
                // Disable transitions during resize for better performance
                transition: isResizing
                  ? "none"
                  : `grid-template-columns ${theme.tokens.duration.normal} ${theme.tokens.easing.easeInOut}, grid-template-rows ${theme.tokens.duration.normal} ${theme.tokens.easing.easeInOut}, gap ${theme.tokens.duration.normal} ${theme.tokens.easing.easeInOut}`,
              }}
            >
              {gridPositions.flat().map((position) => (
                <GridBox
                  key={position}
                  position={position}
                  employees={employeesByPosition[position] || []}
                  shortLabel={getShortPositionLabel(position)}
                  onSelectEmployee={selectEmployee}
                  onDoubleClickEmployee={handleEmployeeDoubleClick}
                  selectedEmployeeId={selectedEmployeeId}
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
          {activeEmployee && (
            <DraggedEmployeeTile
              employee={activeEmployee}
              donutModeActive={donutModeActive}
              isSelected={activeEmployee.employee_id === selectedEmployeeId}
            />
          )}
        </DragOverlay>
      </DndContext>
    </Profiler>
  );
};
