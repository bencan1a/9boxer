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

import React, { Profiler, useRef, useMemo, useState, useEffect } from "react";
import Box from "@mui/material/Box";
import { useVirtualizer } from "@tanstack/react-virtual";
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
  const parentRef = useRef<HTMLDivElement>(null);

  // Track container width to calculate columns dynamically
  const [containerWidth, setContainerWidth] = useState(0);

  // Calculate tile dimensions
  const tileWidth = isWideLayout
    ? tokens.tile.wideWidth
    : tokens.tile.narrowWidth;
  const tileHeight = 80; // Approximate height of EmployeeTile
  const columnGap = tokens.spacing.gap; // Horizontal spacing
  const rowGap = tokens.spacing.rowGap; // Vertical spacing
  const containerPadding = 12; // Padding to prevent border clipping

  // Measure container width on mount and resize
  useEffect(() => {
    const element = parentRef.current;
    if (!element) return;

    const updateWidth = () => {
      setContainerWidth(element.clientWidth);
    };

    // Initial measurement
    updateWidth();

    // Watch for resize
    const resizeObserver = new ResizeObserver(updateWidth);
    resizeObserver.observe(element);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // Calculate how many columns fit in the container
  const columnsPerRow = useMemo(() => {
    if (containerWidth === 0) return 1; // Default before measurement
    if (isWideLayout) return 1; // Single column in wide layout

    // Calculate columns that fit: floor((width + columnGap) / (tileWidth + columnGap))
    const cols = Math.floor(
      (containerWidth + columnGap) / (tileWidth + columnGap)
    );
    return Math.max(1, cols); // At least 1 column
  }, [containerWidth, isWideLayout, tileWidth, columnGap]);

  // Group employees into virtual rows
  const employeeRows = useMemo(() => {
    const rows: Employee[][] = [];
    for (let i = 0; i < employees.length; i += columnsPerRow) {
      rows.push(employees.slice(i, i + columnsPerRow));
    }
    return rows;
  }, [employees, columnsPerRow]);

  // Virtualize rows (not individual tiles)
  const rowVirtualizer = useVirtualizer({
    count: employeeRows.length,
    // CRITICAL: Scroll container is the direct parent (GridBox > scrollable Box wrapper > EmployeeTileList)
    getScrollElement: () => parentRef.current?.parentElement ?? null,
    estimateSize: () => tileHeight + rowGap, // Use rowGap for vertical spacing
    overscan: 1, // Render 1 extra row above/below viewport (tighter buffer for multi-column layout)
  });

  // Get only visible employees from virtualized rows
  const visibleEmployees = useMemo(() => {
    const visible: Employee[] = [];
    const virtualItems = rowVirtualizer.getVirtualItems();

    for (const virtualRow of virtualItems) {
      const row = employeeRows[virtualRow.index];
      if (row) {
        visible.push(...row);
      }
    }

    return visible;
  }, [rowVirtualizer.getVirtualItems(), employeeRows]);

  // Performance profiler callback - only log when significant rendering occurs
  const onRenderCallback = (
    _id: string,
    phase: "mount" | "update" | "nested-update",
    actualDuration: number,
    baseDuration: number
  ) => {
    if (import.meta.env.DEV) {
      // Only log if:
      // 1. Actual rendering work happened (>2ms), OR
      // 2. Mount phase (to show initial virtualization stats)
      if (actualDuration > 2 || phase === "mount") {
        const virtualRows = rowVirtualizer.getVirtualItems();
        console.log(
          `[Perf] EmployeeTileList (${employees.length} total → ${visibleEmployees.length} rendered in ${virtualRows.length} rows) ${phase}: ${actualDuration.toFixed(2)}ms`,
          {
            actualDuration: actualDuration.toFixed(2) + "ms",
            baseDuration: baseDuration.toFixed(2) + "ms",
            overhead: (actualDuration - baseDuration).toFixed(2) + "ms",
            totalEmployees: employees.length,
            renderedEmployees: visibleEmployees.length,
            virtualRows: virtualRows.length,
            totalRows: employeeRows.length,
            columnsPerRow,
            isWideLayout,
          }
        );
      }
    }
  };

  return (
    <Profiler id="EmployeeTileList" onRender={onRenderCallback}>
      <Box
        ref={parentRef}
        data-testid="employee-tile-list"
        sx={{
          height: "100%",
          width: "100%",
          // No overflow - parent GridBox handles scrolling
          // Ensure minimum height when empty for visibility in tests/Storybook
          minHeight: employees.length === 0 ? "48px" : undefined,
        }}
      >
        {/* Virtual scroll container with total height */}
        <Box
          sx={{
            height: `${rowVirtualizer.getTotalSize() + containerPadding * 2}px`,
            width: "100%",
            position: "relative",
          }}
        >
          {/* Render only visible rows */}
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const row = employeeRows[virtualRow.index];
            if (!row) return null;

            return (
              <Box
                key={virtualRow.key}
                data-index={virtualRow.index}
                sx={{
                  position: "absolute",
                  top: 0,
                  left: `${containerPadding}px`,
                  right: `${containerPadding}px`,
                  transform: `translateY(${virtualRow.start + containerPadding}px)`,
                  // Multi-column grid layout within each virtual row
                  display: "grid",
                  gridTemplateColumns: isWideLayout
                    ? `${tokens.tile.wideWidth}px`
                    : `repeat(${columnsPerRow}, ${tokens.tile.narrowWidth}px)`,
                  columnGap: `${columnGap}px`,
                  rowGap: `${rowGap}px`,
                }}
              >
                {row.map((employee) => (
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
            );
          })}
        </Box>
      </Box>
    </Profiler>
  );
};
