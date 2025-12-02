/**
 * 9-Box Grid component with drag-and-drop
 */

import React from "react";
import { DndContext, DragEndEvent } from "@dnd-kit/core";
import { Box, Typography } from "@mui/material";
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

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

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
    <DndContext onDragEnd={handleDragEnd}>
      <Box sx={{ p: 3, height: "100%" }}>
        {/* Axis Labels */}
        <Box sx={{ display: "flex", mb: 2 }}>
          <Box sx={{ width: 80 }} /> {/* Spacer for left label */}
          <Box sx={{ flex: 1, textAlign: "center" }}>
            <Typography variant="h6" fontWeight="bold">
              Performance (Low → High)
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: "flex", height: "calc(100% - 60px)" }}>
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
    </DndContext>
  );
};
