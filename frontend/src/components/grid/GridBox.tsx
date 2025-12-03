/**
 * Grid box component (droppable)
 */

import React from "react";
import { useDroppable } from "@dnd-kit/core";
import { Box, Typography, Badge } from "@mui/material";
import { Employee } from "../../types/employee";
import { EmployeeTile } from "./EmployeeTile";

interface GridBoxProps {
  position: number;
  employees: Employee[];
  shortLabel: string;
  onSelectEmployee: (employeeId: number) => void;
}

export const GridBox: React.FC<GridBoxProps> = ({
  position,
  employees,
  shortLabel,
  onSelectEmployee,
}) => {
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

  return (
    <Box
      ref={setNodeRef}
      sx={{
        border: 2,
        borderColor: isOver ? "primary.main" : "divider",
        borderRadius: 1,
        p: 1.5,
        minHeight: 150,
        maxHeight: 400,
        overflowY: "auto",
        backgroundColor: isOver ? "primary.light" : getBackgroundColor(position),
        transition: "all 0.2s ease",
        userSelect: "none",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 1,
        }}
      >
        <Typography
          variant="caption"
          fontWeight="bold"
          sx={{
            fontSize: "0.7rem",
            display: "block",
            mb: 0.5,
          }}
        >
          {shortLabel}
        </Typography>
        <Badge
          badgeContent={employees.length}
          color="primary"
          sx={{ "& .MuiBadge-badge": { fontSize: "0.65rem", height: 16 } }}
        />
      </Box>

      {/* Employees */}
      {employees.map((employee) => (
        <EmployeeTile
          key={employee.employee_id}
          employee={employee}
          onSelect={onSelectEmployee}
        />
      ))}
    </Box>
  );
};
