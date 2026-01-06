/**
 * Employee tile list component - wrapper for displaying employee tiles
 *
 * @component
 * @example
 * ```tsx
 * <EmployeeTileList
 *   employees={employees}
 *   isExpanded={false}
 *   onSelectEmployee={(id) => console.log('selected', id)}
 *   donutModeActive={false}
 * />
 * ```
 */

import React, { Profiler } from "react";
import Box from "@mui/material/Box";
import { Employee } from "../../types/employee";
import { EmployeeTile } from "./EmployeeTile";
import { useGridZoom } from "../../contexts/GridZoomContext";

/**
 * Props for the EmployeeTileList component
 */
export interface EmployeeTileListProps {
  /** Array of employees to display */
  employees: Employee[];
  /** Whether to use multi-column grid layout (expanded mode) */
  isExpanded: boolean;
  /** Whether to use wide (single-column) layout based on container width */
  isWideLayout?: boolean;
  /** Callback fired when an employee tile is clicked */
  onSelectEmployee: (employeeId: number) => void;
  /** Callback fired when an employee tile is double-clicked */
  onDoubleClickEmployee?: (employeeId: number) => void;
  /** ID of the currently selected employee */
  selectedEmployeeId?: number | null;
  /** Whether donut mode is active (passed through to tiles) */
  donutModeActive?: boolean;
}

/**
 * EmployeeTileList component - manages layout of employee tiles
 *
 * Switches between two layout modes:
 * - Normal: Vertical stack (block layout)
 * - Expanded: Multi-column grid with responsive auto-fill
 *
 * @param props - Component props
 * @returns The rendered employee tile list
 */
export const EmployeeTileList: React.FC<EmployeeTileListProps> = ({
  employees,
  isExpanded: _isExpanded,
  isWideLayout = false,
  onSelectEmployee,
  onDoubleClickEmployee,
  selectedEmployeeId = null,
  donutModeActive = false,
}) => {
  const { tokens } = useGridZoom();

  // Performance profiler callback - only log significantly slow renders
  const onRenderCallback = (
    _id: string,
    phase: "mount" | "update" | "nested-update",
    actualDuration: number,
    baseDuration: number
  ) => {
    if (import.meta.env.DEV && actualDuration > 30) {
      console.warn(
        `[Perf] EmployeeTileList (${employees.length} tiles) ${phase}: ${actualDuration.toFixed(2)}ms`,
        {
          actualDuration: actualDuration.toFixed(2) + "ms",
          baseDuration: baseDuration.toFixed(2) + "ms",
          overhead: (actualDuration - baseDuration).toFixed(2) + "ms",
          isWideLayout,
          tileWidth: isWideLayout
            ? tokens.tile.wideWidth
            : tokens.tile.narrowWidth,
        }
      );
    }
  };

  return (
    <Profiler id="EmployeeTileList" onRender={onRenderCallback}>
      <Box
        data-testid="employee-tile-list"
        sx={{
          // Multi-column grid layout with fixed tile widths for better performance
          display: "grid",
          gridTemplateColumns: isWideLayout
            ? `${tokens.tile.wideWidth}px` // Single wide column when container is narrow
            : `repeat(auto-fill, ${tokens.tile.narrowWidth}px)`, // Multiple narrow columns when container is wide
          gap: `${tokens.spacing.gap}px`,
          // Ensure minimum height when empty for visibility in tests/Storybook
          minHeight: employees.length === 0 ? "48px" : undefined,
        }}
      >
        {employees.map((employee) => (
          <EmployeeTile
            key={employee.employee_id}
            employee={employee}
            onSelect={onSelectEmployee}
            onDoubleClick={onDoubleClickEmployee}
            isSelected={employee.employee_id === selectedEmployeeId}
            donutModeActive={donutModeActive}
          />
        ))}
      </Box>
    </Profiler>
  );
};
