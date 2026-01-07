/**
 * Edge Case Integration Tests for useFilters Hook
 *
 * Purpose: Catch data edge cases that break UI components at runtime
 * These tests use realistic "messy" data that mirrors what the sample data
 * generator might produce, including undefined/null values and empty strings.
 *
 * This is our "smoke test" layer - catching obvious crashes before E2E tests.
 */

import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useFilters } from "../useFilters";
import {
  Employee,
  PerformanceLevel,
  PotentialLevel,
} from "../../types/employee";

/**
 * Create an employee with realistic edge case data
 * This mirrors actual sample data generation which can produce:
 * - undefined managers (CEO level)
 * - null management chains
 * - empty strings for optional fields
 * - missing flags arrays
 */
const createEdgeCaseEmployee = (overrides: Partial<Employee>): Employee => ({
  employee_id: 1,
  name: "Test Employee",
  business_title: "Test Title",
  job_title: "Test Job",
  job_profile: "Test Profile",
  job_level: "MT1 - Individual Contributor",
  job_function: "Engineering",
  location: "USA",
  // CRITICAL: These are the fields that can be undefined/null in real data
  manager: "", // CEO or orphaned employee
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

describe("useFilters - Edge Cases and Data Anomalies", () => {
  describe("getAvailableOptions with messy data", () => {
    it("handles employees with undefined managers (CEO level)", () => {
      const employees: Employee[] = [
        createEdgeCaseEmployee({
          employee_id: 1,
          name: "CEO",
          manager: undefined, // CEO has no manager
        }),
        createEdgeCaseEmployee({
          employee_id: 2,
          name: "VP",
          manager: "CEO",
        }),
        createEdgeCaseEmployee({
          employee_id: 3,
          name: "Director",
          manager: "VP",
        }),
      ];

      const { result } = renderHook(() => useFilters());

      // This should not crash - undefined managers should be filtered out
      const options = result.current.getAvailableOptions(employees);

      expect(options.managers).toEqual(["CEO", "VP"]);
      expect(options.managers).not.toContain(undefined);
      expect(options.managers).not.toContain(null);
    });

    it("handles employees with null and empty string values", () => {
      const employees: Employee[] = [
        createEdgeCaseEmployee({
          employee_id: 1,
          job_function: null as any, // Explicitly test null
          location: "", // Empty string
          manager: null as any,
        }),
        createEdgeCaseEmployee({
          employee_id: 2,
          job_function: "Engineering",
          location: "USA",
          manager: "Alice",
        }),
        createEdgeCaseEmployee({
          employee_id: 3,
          job_function: "", // Empty string
          location: null as any,
          manager: "", // Empty string manager
        }),
      ];

      const { result } = renderHook(() => useFilters());
      const options = result.current.getAvailableOptions(employees);

      // Should only include valid, non-empty values
      expect(options.jobFunctions).toEqual(["Engineering"]);
      expect(options.locations).toEqual(["USA"]);
      expect(options.managers).toEqual(["Alice"]);

      // Should not include null, undefined, or empty strings
      expect(options.jobFunctions).not.toContain("");
      expect(options.jobFunctions).not.toContain(null);
      expect(options.locations).not.toContain("");
      expect(options.managers).not.toContain("");
    });

    it("handles mixed valid and invalid data in same field", () => {
      const employees: Employee[] = [
        createEdgeCaseEmployee({ employee_id: 1, manager: "Alice" }),
        createEdgeCaseEmployee({ employee_id: 2, manager: undefined }),
        createEdgeCaseEmployee({ employee_id: 3, manager: "Bob" }),
        createEdgeCaseEmployee({ employee_id: 4, manager: null as any }),
        createEdgeCaseEmployee({ employee_id: 5, manager: "" }),
        createEdgeCaseEmployee({ employee_id: 6, manager: "Alice" }), // Duplicate
      ];

      const { result } = renderHook(() => useFilters());
      const options = result.current.getAvailableOptions(employees);

      // Should handle duplicates and invalid values correctly
      expect(options.managers).toEqual(["Alice", "Bob"]);
      expect(options.managers.length).toBe(2);
    });

    it("handles employees with undefined or missing flags arrays", () => {
      const employees: Employee[] = [
        createEdgeCaseEmployee({
          employee_id: 1,
          flags: undefined,
        }),
        createEdgeCaseEmployee({
          employee_id: 2,
          flags: null as any,
        }),
        createEdgeCaseEmployee({
          employee_id: 3,
          flags: [], // Empty array
        }),
        createEdgeCaseEmployee({
          employee_id: 4,
          flags: ["promotion_ready", "flight_risk"],
        }),
      ];

      const { result } = renderHook(() => useFilters());
      const options = result.current.getAvailableOptions(employees);

      // Should handle missing/empty flags gracefully
      expect(options.flags.length).toBeGreaterThan(0);
      const promotionFlag = options.flags.find(
        (f) => f.key === "promotion_ready"
      );
      expect(promotionFlag?.count).toBe(1);
    });

    it("handles employees with missing job_level gracefully", () => {
      // This test verifies the fix for the job_level crash bug
      const employees: any[] = [
        // Missing job_level field
        {
          employee_id: 1,
          name: "Test",
          // job_level is missing - should be filtered out
          job_function: "Engineering",
          location: "USA",
          manager: "Boss",
        },
        // Valid employee
        createEdgeCaseEmployee({
          employee_id: 2,
          job_level: "MT2 - Team Lead",
        }),
      ];

      const { result } = renderHook(() => useFilters());

      // FIXED: Should handle missing job_level gracefully without crashing
      expect(() => {
        const options = result.current.getAvailableOptions(employees);
        // Should only include the valid job level
        expect(options.levels).toEqual(["MT2"]);
        // Should not include undefined or null
        expect(options.levels).not.toContain(undefined);
        expect(options.levels).not.toContain(null);
      }).not.toThrow();
    });

    it("handles special characters in manager names", () => {
      const employees: Employee[] = [
        createEdgeCaseEmployee({
          employee_id: 1,
          manager: "O'Brien, John", // Apostrophe and comma
        }),
        createEdgeCaseEmployee({
          employee_id: 2,
          manager: "María García-López", // Accented characters and hyphen
        }),
        createEdgeCaseEmployee({
          employee_id: 3,
          manager: "李明 (Li Ming)", // Unicode characters
        }),
      ];

      const { result } = renderHook(() => useFilters());
      const options = result.current.getAvailableOptions(employees);

      // Should handle special characters without crashing
      expect(options.managers.length).toBe(3);
      expect(options.managers).toContain("O'Brien, John");
      expect(options.managers).toContain("María García-López");
      expect(options.managers).toContain("李明 (Li Ming)");
    });
  });

  describe("applyFilters with edge case data", () => {
    it("filters employees with undefined managers correctly", () => {
      const employees: Employee[] = [
        createEdgeCaseEmployee({
          employee_id: 1,
          name: "CEO",
          manager: undefined,
        }),
        createEdgeCaseEmployee({
          employee_id: 2,
          name: "VP",
          manager: "CEO",
        }),
      ];

      const { result } = renderHook(() => useFilters());

      // Filtering should work even with undefined managers in dataset
      const filtered = result.current.applyFilters(employees);
      expect(filtered.length).toBe(2);
    });

    it("handles reporting chain filter with null management chains", () => {
      const employees: Employee[] = [
        createEdgeCaseEmployee({
          employee_id: 1,
          manager: "Alice",
          management_chain_01: null,
          management_chain_02: null,
        }),
        createEdgeCaseEmployee({
          employee_id: 2,
          manager: "Bob",
          management_chain_01: "Alice",
          management_chain_02: "Charlie",
        }),
      ];

      const { result } = renderHook(() => useFilters());

      // Should handle null chains without crashing
      const filtered = result.current.applyFilters(employees);
      expect(filtered.length).toBe(2);
    });
  });

  describe("Real-world sample data scenarios", () => {
    it("handles the exact scenario that caused the production crash", () => {
      // This reproduces the exact bug: undefined manager causing toLowerCase() error
      const employees: Employee[] = [
        createEdgeCaseEmployee({
          employee_id: 1,
          name: "John Smith (CEO)",
          job_level: "MT6",
          manager: undefined, // This was the killer
        }),
        createEdgeCaseEmployee({
          employee_id: 2,
          name: "Jane Doe",
          manager: "John Smith (CEO)",
        }),
      ];

      const { result } = renderHook(() => useFilters());

      // The original bug: this would crash with "Cannot read properties of undefined"
      expect(() => {
        const options = result.current.getAvailableOptions(employees);
        expect(options.managers).toEqual(["John Smith (CEO)"]);
      }).not.toThrow();
    });

    it("handles typical sample data distribution with edge cases", () => {
      // Simulate realistic sample data: mix of valid and edge case employees
      const employees: Employee[] = [
        // CEO - no manager
        createEdgeCaseEmployee({
          employee_id: 1,
          manager: undefined,
          job_level: "MT6",
        }),
        // Regular employees with managers
        ...Array.from({ length: 50 }, (_, i) =>
          createEdgeCaseEmployee({
            employee_id: i + 2,
            manager: "Manager " + Math.floor(i / 10),
          })
        ),
        // Some employees with empty/null fields
        createEdgeCaseEmployee({
          employee_id: 52,
          manager: "",
          location: null as any,
        }),
        createEdgeCaseEmployee({
          employee_id: 53,
          job_function: "",
          manager: null as any,
        }),
      ];

      const { result } = renderHook(() => useFilters());
      const options = result.current.getAvailableOptions(employees);

      // Should process large datasets with edge cases efficiently
      expect(options.managers.length).toBeGreaterThan(0);
      expect(options.managers).not.toContain(undefined);
      expect(options.managers).not.toContain(null);
      expect(options.managers).not.toContain("");

      // All managers should be valid strings
      options.managers.forEach((manager) => {
        expect(typeof manager).toBe("string");
        expect(manager.length).toBeGreaterThan(0);
      });
    });
  });
});
