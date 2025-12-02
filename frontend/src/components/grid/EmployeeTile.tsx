/**
 * Employee tile component (draggable)
 */

import React from "react";
import { useDraggable } from "@dnd-kit/core";
import { Card, CardContent, Typography, Chip, Box } from "@mui/material";
import { Employee } from "../../types/employee";

interface EmployeeTileProps {
  employee: Employee;
  onSelect: (employeeId: number) => void;
}

export const EmployeeTile: React.FC<EmployeeTileProps> = ({
  employee,
  onSelect,
}) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: `employee-${employee.employee_id}`,
      data: { employee },
    });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        opacity: isDragging ? 0.5 : 1,
        cursor: "grab",
      }
    : { cursor: "grab" };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={() => onSelect(employee.employee_id)}
      sx={{
        mb: 1,
        borderLeft: employee.modified_in_session ? 4 : 0,
        borderColor: "secondary.main",
        "&:hover": {
          boxShadow: 3,
        },
      }}
    >
      <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
          {employee.name}
        </Typography>
        <Typography variant="body2" color="text.secondary" fontSize="0.75rem">
          {employee.business_title}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.5 }}>
          <Chip label={employee.job_level} size="small" sx={{ height: 18 }} />
          {employee.modified_in_session && (
            <Chip
              label="Modified"
              size="small"
              color="secondary"
              sx={{ height: 18 }}
            />
          )}
        </Box>
      </CardContent>
    </Card>
  );
};
