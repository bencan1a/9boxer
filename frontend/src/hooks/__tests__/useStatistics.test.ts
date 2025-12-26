import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useStatistics } from "../useStatistics";
import {
  Employee,
  PerformanceLevel,
  PotentialLevel,
} from "../../types/employee";

// Helper to create a test employee
const createEmployee = (overrides: Partial<Employee>): Employee => ({
  employee_id: 1,
  name: "Test Employee",
  business_title: "Test Title",
  job_title: "Test Job",
  job_profile: "Test Profile",
  job_level: "MT1",
  job_function: "Test Function",
  location: "USA",
  manager: "Test Manager",
  management_chain_01: null,
  management_chain_02: null,
  management_chain_03: null,
  management_chain_04: null,
  management_chain_05: null,
  management_chain_06: null,
  hire_date: "2020-01-01",
  tenure_category: "Mid",
  time_in_job_profile: "2 years",
  performance: PerformanceLevel.MEDIUM,
  potential: PotentialLevel.MEDIUM,
  grid_position: 5,
  position_label: "Core Talent [M,M]",
  talent_indicator: "Core",
  ratings_history: [],
  development_focus: null,
  development_action: null,
  notes: null,
  promotion_status: null,
  promotion_readiness: null,
  modified_in_session: false,
  last_modified: null,
  ...overrides,
});

describe("useStatistics", () => {
  describe("Normal Mode", () => {
    it("calculates distribution based on grid_position in normal mode", () => {
      const employees: Employee[] = [
        createEmployee({ employee_id: 1, grid_position: 9 }),
        createEmployee({ employee_id: 2, grid_position: 9 }),
        createEmployee({ employee_id: 3, grid_position: 5 }),
        createEmployee({ employee_id: 4, grid_position: 1 }),
      ];

      const { result } = renderHook(() => useStatistics(employees, false));

      expect(result.current.statistics).not.toBeNull();
      expect(result.current.statistics?.total_employees).toBe(4);

      const distribution = result.current.statistics!.distribution;
      const position9 = distribution.find((d) => d.grid_position === 9);
      const position5 = distribution.find((d) => d.grid_position === 5);
      const position1 = distribution.find((d) => d.grid_position === 1);

      expect(position9?.count).toBe(2);
      expect(position5?.count).toBe(1);
      expect(position1?.count).toBe(1);
    });

    it("counts modified employees based on modified_in_session in normal mode", () => {
      const employees: Employee[] = [
        createEmployee({ employee_id: 1, modified_in_session: true }),
        createEmployee({ employee_id: 2, modified_in_session: true }),
        createEmployee({ employee_id: 3, modified_in_session: false }),
        createEmployee({ employee_id: 4, modified_in_session: false }),
      ];

      const { result } = renderHook(() => useStatistics(employees, false));

      expect(result.current.statistics?.modified_employees).toBe(2);
    });

    it("ignores donut fields in normal mode", () => {
      const employees: Employee[] = [
        createEmployee({
          employee_id: 1,
          grid_position: 5,
          donut_position: 9,
          donut_modified: true,
        }),
        createEmployee({
          employee_id: 2,
          grid_position: 5,
          donut_position: 9,
          donut_modified: true,
        }),
      ];

      const { result } = renderHook(() => useStatistics(employees, false));

      const distribution = result.current.statistics!.distribution;
      const position5 = distribution.find((d) => d.grid_position === 5);
      const position9 = distribution.find((d) => d.grid_position === 9);

      // Should count in position 5 (grid_position), not position 9 (donut_position)
      expect(position5?.count).toBe(2);
      expect(position9?.count).toBe(0);

      // Should not count donut modifications
      expect(result.current.statistics?.modified_employees).toBe(0);
    });
  });

  describe("Donut Mode", () => {
    it("calculates distribution based on donut_position when employee is donut_modified", () => {
      const employees: Employee[] = [
        createEmployee({
          employee_id: 1,
          grid_position: 5,
          donut_position: 9,
          donut_modified: true,
        }),
        createEmployee({
          employee_id: 2,
          grid_position: 5,
          donut_position: 9,
          donut_modified: true,
        }),
        createEmployee({
          employee_id: 3,
          grid_position: 5,
          donut_modified: false,
        }),
      ];

      const { result } = renderHook(() => useStatistics(employees, true));

      const distribution = result.current.statistics!.distribution;
      const position9 = distribution.find((d) => d.grid_position === 9);
      const position5 = distribution.find((d) => d.grid_position === 5);

      // Two employees with donut_position=9 should be counted in position 9
      expect(position9?.count).toBe(2);
      // One employee with grid_position=5 and not donut_modified should be counted in position 5
      expect(position5?.count).toBe(1);
    });

    it("falls back to grid_position when donut_modified is false", () => {
      const employees: Employee[] = [
        createEmployee({
          employee_id: 1,
          grid_position: 5,
          donut_position: 9,
          donut_modified: false,
        }),
        createEmployee({
          employee_id: 2,
          grid_position: 5,
          donut_modified: false,
        }),
      ];

      const { result } = renderHook(() => useStatistics(employees, true));

      const distribution = result.current.statistics!.distribution;
      const position5 = distribution.find((d) => d.grid_position === 5);
      const position9 = distribution.find((d) => d.grid_position === 9);

      // Both should be counted in position 5 since donut_modified is false
      expect(position5?.count).toBe(2);
      expect(position9?.count).toBe(0);
    });

    it("counts modified employees based on donut_modified in donut mode", () => {
      const employees: Employee[] = [
        createEmployee({
          employee_id: 1,
          modified_in_session: false,
          donut_modified: true,
        }),
        createEmployee({
          employee_id: 2,
          modified_in_session: false,
          donut_modified: true,
        }),
        createEmployee({
          employee_id: 3,
          modified_in_session: true,
          donut_modified: false,
        }),
      ];

      const { result } = renderHook(() => useStatistics(employees, true));

      // Should count 2 donut_modified employees, ignoring modified_in_session
      expect(result.current.statistics?.modified_employees).toBe(2);
    });

    it("handles mixed donut and non-donut employees correctly", () => {
      const employees: Employee[] = [
        // Donut-modified: position 5 → 9
        createEmployee({
          employee_id: 1,
          grid_position: 5,
          donut_position: 9,
          donut_modified: true,
        }),
        // Donut-modified: position 5 → 6
        createEmployee({
          employee_id: 2,
          grid_position: 5,
          donut_position: 6,
          donut_modified: true,
        }),
        // Not donut-modified, stays in position 5
        createEmployee({
          employee_id: 3,
          grid_position: 5,
          donut_modified: false,
        }),
        // Not donut-modified, stays in position 1
        createEmployee({
          employee_id: 4,
          grid_position: 1,
          donut_modified: false,
        }),
      ];

      const { result } = renderHook(() => useStatistics(employees, true));

      expect(result.current.statistics?.total_employees).toBe(4);
      expect(result.current.statistics?.modified_employees).toBe(2);

      const distribution = result.current.statistics!.distribution;
      const position9 = distribution.find((d) => d.grid_position === 9);
      const position6 = distribution.find((d) => d.grid_position === 6);
      const position5 = distribution.find((d) => d.grid_position === 5);
      const position1 = distribution.find((d) => d.grid_position === 1);

      expect(position9?.count).toBe(1); // Employee 1 with donut placement
      expect(position6?.count).toBe(1); // Employee 2 with donut placement
      expect(position5?.count).toBe(1); // Employee 3 without donut modification
      expect(position1?.count).toBe(1); // Employee 4 without donut modification
    });

    it("calculates percentages correctly in donut mode", () => {
      const employees: Employee[] = [
        createEmployee({
          employee_id: 1,
          grid_position: 5,
          donut_position: 9,
          donut_modified: true,
        }),
        createEmployee({
          employee_id: 2,
          grid_position: 5,
          donut_position: 9,
          donut_modified: true,
        }),
        createEmployee({
          employee_id: 3,
          grid_position: 5,
          donut_modified: false,
        }),
        createEmployee({
          employee_id: 4,
          grid_position: 5,
          donut_modified: false,
        }),
      ];

      const { result } = renderHook(() => useStatistics(employees, true));

      const distribution = result.current.statistics!.distribution;
      const position9 = distribution.find((d) => d.grid_position === 9);
      const position5 = distribution.find((d) => d.grid_position === 5);

      // 2 out of 4 employees in position 9 = 50%
      expect(position9?.percentage).toBe(50);
      // 2 out of 4 employees in position 5 = 50%
      expect(position5?.percentage).toBe(50);
    });
  });

  describe("Edge Cases", () => {
    it("returns null when no employees provided", () => {
      const { result } = renderHook(() => useStatistics([], false));

      expect(result.current.statistics).toBeNull();
    });

    it("handles employees without donut_position gracefully", () => {
      const employees: Employee[] = [
        createEmployee({
          employee_id: 1,
          grid_position: 5,
          donut_modified: true,
          // donut_position is undefined
        }),
      ];

      const { result } = renderHook(() => useStatistics(employees, true));

      const distribution = result.current.statistics!.distribution;
      const position5 = distribution.find((d) => d.grid_position === 5);

      // Should fall back to grid_position when donut_position is undefined
      expect(position5?.count).toBe(1);
    });
  });
});
