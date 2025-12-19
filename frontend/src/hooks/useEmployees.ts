/**
 * Custom hook for employee operations and filtering
 */

import { useMemo } from "react";
import { Employee } from "../types/employee";
import { useSession } from "./useSession";
import { useFilters } from "./useFilters";
import {
  getPositionLabel,
  getShortPositionLabel,
  getPositionName,
  getPositionGuidance,
  getPositionInfo,
} from "../constants/positionLabels";

export const useEmployees = () => {
  const { employees, moveEmployee, selectEmployee, selectedEmployeeId } =
    useSession();
  const { applyFilters } = useFilters();

  // Apply filters to employees
  const filteredEmployees = useMemo(() => {
    return applyFilters(employees);
  }, [employees, applyFilters]);

  // Group employees by grid position
  const employeesByPosition = useMemo(() => {
    const grouped: Record<number, Employee[]> = {};

    // Initialize all positions 1-9
    for (let i = 1; i <= 9; i++) {
      grouped[i] = [];
    }

    // Group filtered employees
    filteredEmployees.forEach((emp) => {
      const position = emp.grid_position;
      if (position >= 1 && position <= 9) {
        grouped[position].push(emp);
      }
    });

    return grouped;
  }, [filteredEmployees]);

  // Position label functions are now imported from constants/positionLabels.ts

  // Convert position to performance/potential
  const positionToLevels = (
    position: number
  ): { performance: string; potential: string } => {
    const mapping: Record<
      number,
      { performance: string; potential: string }
    > = {
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
    employees: filteredEmployees,
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
