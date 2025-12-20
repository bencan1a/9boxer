/**
 * Employee tile component (draggable)
 */

import React from "react";
import { useDraggable } from "@dnd-kit/core";
import { Card, CardContent, Typography, Chip, Box } from "@mui/material";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import { Employee } from "../../types/employee";
import { logger } from "../../utils/logger";

interface EmployeeTileProps {
  employee: Employee;
  onSelect: (employeeId: number) => void;
}

export const EmployeeTile: React.FC<EmployeeTileProps> = ({
  employee,
  onSelect,
}) => {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, isDragging } =
    useDraggable({
      id: `employee-${employee.employee_id}`,
      data: { employee },
    });

  const handleCardClick = () => {
    logger.debug('Card clicked - selecting employee:', employee.employee_id, employee.name);
    onSelect(employee.employee_id);
  };

  return (
    <Card
      ref={setNodeRef}
      onClick={handleCardClick}
      sx={{
        mb: 1,
        minWidth: 280, // Minimum width for multi-column grid layout
        maxWidth: 400, // Maximum width for readability
        borderLeft: employee.modified_in_session ? 4 : 0,
        borderColor: "secondary.main",
        cursor: "pointer",
        display: "flex",
        opacity: isDragging ? 0.5 : 1,
        userSelect: "none",
        "&:hover": {
          boxShadow: 3,
        },
      }}
      data-testid={`employee-card-${employee.employee_id}`}
    >
      {/* Drag Handle */}
      <Box
        ref={setActivatorNodeRef}
        {...listeners}
        {...attributes}
        sx={{
          width: 24,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "grab",
          borderRight: 1,
          borderColor: "divider",
          backgroundColor: "action.hover",
          "&:active": {
            cursor: "grabbing",
          },
        }}
        onClick={(e) => e.stopPropagation()} // Prevent click from bubbling to card
      >
        <DragIndicatorIcon sx={{ fontSize: 16, color: "action.active" }} />
      </Box>

      {/* Card Content */}
      <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 }, flex: 1 }}>
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
              data-testid="modified-indicator"
            />
          )}
        </Box>
      </CardContent>
    </Card>
  );
};
