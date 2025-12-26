/**
 * Employee tile list component - wrapper for displaying employee tiles
 */

import React from "react";
import { Box } from "@mui/material";
import { Employee } from "../../types/employee";
import { EmployeeTile } from "./EmployeeTile";

export interface EmployeeTileListProps {
  employees: Employee[];
  isExpanded: boolean;
  onSelectEmployee: (employeeId: number) => void;
  donutModeActive?: boolean;
}

export const EmployeeTileList: React.FC<EmployeeTileListProps> = ({
  employees,
  isExpanded,
  onSelectEmployee,
  donutModeActive = false,
}) => {
  return (
    <Box
      sx={{
        // Multi-column grid layout when expanded for better space utilization
        display: isExpanded ? "grid" : "block",
        gridTemplateColumns: isExpanded
          ? "repeat(auto-fill, minmax(280px, 1fr))"
          : undefined,
        gap: isExpanded ? 1.5 : 0, // 12px gap between cards in grid mode
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
