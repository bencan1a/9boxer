/**
 * Custom hook for employee operations and filtering
 */

import { useMemo } from "react";
import { Employee } from "../types/employee";
import { useSession } from "./useSession";
import { useSessionStore, selectDonutModeActive } from "../store/sessionStore";
import { useFilters } from "./useFilters";
import {
  getPositionLabel,
  getShortPositionLabel,
  getPositionName,
  getPositionGuidance,
  getPositionInfo,
} from "../constants/positionLabels";
import { sortEmployees } from "../utils/sortEmployees";

export const useEmployees = () => {
  const { employees, moveEmployee, selectEmployee, selectedEmployeeId } =
    useSession();

  // Use granular selector to minimize re-renders
  const donutModeActive = useSessionStore(selectDonutModeActive);

  const { applyFilters } = useFilters();

  // Apply filters to employees
  const filteredEmployees = useMemo(() => {
    return applyFilters(employees);
  }, [employees, applyFilters]);

  // In donut mode, further filter to only show employees from position 5
  const donutFilteredEmployees = useMemo(() => {
    if (!donutModeActive) {
      return filteredEmployees;
    }
    // In donut mode, only show employees whose ORIGINAL position is 5
    return filteredEmployees.filter((emp) => emp.grid_position === 5);
  }, [filteredEmployees, donutModeActive]);

  // Group employees by position
  // In donut mode, use donut_position for modified employees, otherwise grid_position
  const employeesByPosition = useMemo(() => {
    const grouped: Record<number, Employee[]> = {};

    // Initialize all positions 1-9
    for (let i = 1; i <= 9; i++) {
      grouped[i] = [];
    }

    // Group employees (donut-filtered in donut mode, all in normal mode)
    donutFilteredEmployees.forEach((emp) => {
      let position: number;

      // In donut mode, use donut_position if employee has been modified in donut mode
      if (donutModeActive && emp.donut_modified && emp.donut_position) {
        position = emp.donut_position;
      } else {
        position = emp.grid_position;
      }

      if (position >= 1 && position <= 9) {
        grouped[position].push(emp);
      }
    });

    // Sort each group using three-tier logic
    Object.keys(grouped).forEach((key) => {
      grouped[parseInt(key)] = sortEmployees(grouped[parseInt(key)]);
    });

    return grouped;
  }, [donutFilteredEmployees, donutModeActive]);

  // Position label functions are now imported from constants/positionLabels.ts

  // Convert position to performance/potential
  const positionToLevels = (
    position: number
  ): { performance: string; potential: string } => {
    const mapping: Record<number, { performance: string; potential: string }> =
      {
        1: { performance: "Low", potential: "Low" },
        2: { performance: "Medium", potential: "Low" },
        3: { performance: "High", potential: "Low" },
        4: { performance: "Low", potential: "Medium" },
        5: { performance: "Medium", potential: "Medium" },
        6: { performance: "High", potential: "Medium" },
        7: { performance: "Low", potential: "High" },
        8: { performance: "Medium", potential: "High" },
        9: { performance: "High", potential: "High" },
      };
    return mapping[position] || { performance: "Medium", potential: "Medium" };
  };

  return {
    employees: donutFilteredEmployees, // Returns donut-filtered list in donut mode, all employees otherwise
    employeesByPosition,
    getPositionLabel,
    getShortPositionLabel,
    getPositionName,
    getPositionGuidance,
    getPositionInfo,
    positionToLevels,
    moveEmployee,
    selectEmployee,
    selectedEmployeeId,
  };
};
