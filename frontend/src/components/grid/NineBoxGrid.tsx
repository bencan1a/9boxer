/**
 * 9-Box Grid component with drag-and-drop
 */

import React, { useState } from "react";
import { DndContext, DragEndEvent, DragStartEvent, DragOverlay } from "@dnd-kit/core";
import { Box, Typography, Card, CardContent, Chip } from "@mui/material";
import { GridBox } from "./GridBox";
import { useEmployees } from "../../hooks/useEmployees";
import { Employee } from "../../types/employee";

export const NineBoxGrid: React.FC = () => {
  const {
    employeesByPosition,
    getShortPositionLabel,
    positionToLevels,
    moveEmployee,
    selectEmployee,
  } = useEmployees();

  const [activeEmployee, setActiveEmployee] = useState<Employee | null>(null);

  const handleDragStart = (event: DragStartEvent) => {
    const employee = event.active.data.current?.employee as Employee | undefined;
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
      await moveEmployee(employee.employee_id, performance, potential);
    } catch (error) {
      console.error("Failed to move employee:", error);
    }
  };

  const handleDragCancel = () => {
    setActiveEmployee(null);
  };

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

  return (
    <DndContext
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <Box sx={{ p: 3, height: "100%", width: "100%", userSelect: "none" }}>
        {/* Axis Labels */}
        <Box sx={{ display: "flex", mb: 2, width: "100%" }}>
          <Box sx={{ width: 80 }} /> {/* Spacer for left label */}
          <Box sx={{ flex: 1, textAlign: "center" }}>
            <Typography variant="h6" fontWeight="bold">
              Performance (Low → High)
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: "flex", height: "calc(100% - 60px)", width: "100%" }}>
          {/* Left axis label */}
          <Box
            sx={{
              width: 80,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              writingMode: "vertical-rl",
              transform: "rotate(180deg)",
            }}
          >
            <Typography variant="h6" fontWeight="bold">
              Potential (Low → High)
            </Typography>
          </Box>

          {/* Grid */}
          <Box
            sx={{
              flex: 1,
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gridTemplateRows: "repeat(3, 1fr)",
              gap: 2,
            }}
          >
            {gridPositions.flat().map((position) => (
              <GridBox
                key={position}
                position={position}
                employees={employeesByPosition[position] || []}
                shortLabel={getShortPositionLabel(position)}
                onSelectEmployee={selectEmployee}
              />
            ))}
          </Box>
        </Box>
      </Box>

      {/* Drag Overlay - shows the dragged item */}
      <DragOverlay dropAnimation={null}>
        {activeEmployee ? (
          <Card
            sx={{
              mb: 1,
              borderLeft: activeEmployee.modified_in_session ? 4 : 0,
              borderColor: "secondary.main",
              cursor: "grabbing",
              display: "flex",
              opacity: 0.9,
              boxShadow: 6,
            }}
          >
            <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 }, flex: 1 }}>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                {activeEmployee.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" fontSize="0.75rem">
                {activeEmployee.business_title}
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.5 }}>
                <Chip label={activeEmployee.job_level} size="small" sx={{ height: 18 }} />
                {activeEmployee.modified_in_session && (
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
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};
