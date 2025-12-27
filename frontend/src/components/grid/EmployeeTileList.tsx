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

import React from "react";
import { Box } from "@mui/material";
import { Employee } from "../../types/employee";
import { EmployeeTile } from "./EmployeeTile";

/**
 * Props for the EmployeeTileList component
 */
export interface EmployeeTileListProps {
  /** Array of employees to display */
  employees: Employee[];
  /** Whether to use multi-column grid layout (expanded mode) */
  isExpanded: boolean;
  /** Callback fired when an employee tile is clicked */
  onSelectEmployee: (employeeId: number) => void;
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
  isExpanded,
  onSelectEmployee,
  donutModeActive = false,
}) => {
  return (
    <Box
      data-testid="employee-tile-list"
      sx={{
        // Multi-column grid layout when expanded for better space utilization
        display: isExpanded ? "grid" : "block",
        gridTemplateColumns: isExpanded
          ? "repeat(auto-fill, minmax(280px, 1fr))"
          : undefined,
        gap: isExpanded ? 1.5 : 0, // 12px gap between cards in grid mode
        // Ensure minimum height when empty for visibility in tests/Storybook
        minHeight: employees.length === 0 ? "48px" : undefined,
      }}
    >
      {employees.map((employee) => (
        <EmployeeTile
          key={employee.employee_id}
          employee={employee}
          onSelect={onSelectEmployee}
          donutModeActive={donutModeActive}
        />
      ))}
    </Box>
  );
};
