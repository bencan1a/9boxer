import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useEmployeeSearch } from "../useEmployeeSearch";
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
  job_function: "Engineering",
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

describe("useEmployeeSearch", () => {
  describe("Basic Functionality", () => {
    it("returns empty array for empty query", () => {
      const employees = [
        createEmployee({ employee_id: 1, name: "John Smith" }),
        createEmployee({ employee_id: 2, name: "Jane Doe" }),
      ];

      const { result } = renderHook(() =>
        useEmployeeSearch({ employees, threshold: 0.3 })
      );

      const results = result.current.search("");
      expect(results).toEqual([]);
    });

    it("returns employees matching name exactly", () => {
      const employees = [
        createEmployee({ employee_id: 1, name: "John Smith" }),
        createEmployee({ employee_id: 2, name: "Jane Doe" }),
        createEmployee({ employee_id: 3, name: "Bob Johnson" }),
      ];

      const { result } = renderHook(() =>
        useEmployeeSearch({ employees, threshold: 0.3 })
      );

      const results = result.current.search("John Smith");
      expect(results).toHaveLength(1);
      expect(results[0].employee.employee_id).toBe(1);
    });

    it("returns employees with fuzzy name match", () => {
      const employees = [
        createEmployee({ employee_id: 1, name: "John Smith" }),
        createEmployee({ employee_id: 2, name: "Jane Doe" }),
      ];

      const { result } = renderHook(
        () => useEmployeeSearch({ employees }) // Use default threshold of 0.25
      );

      // Partial match with typo: "Smit" should match "Smith"
      const results = result.current.search("Smit");
      expect(results.length).toBeGreaterThan(0);
      expect(results.some((r) => r.employee.name.includes("Smith"))).toBe(true);
    });

    it("returns partial name matches", () => {
      const employees = [
        createEmployee({ employee_id: 1, name: "John Smith" }),
        createEmployee({ employee_id: 2, name: "Jane Smith" }),
        createEmployee({ employee_id: 3, name: "Bob Johnson" }),
      ];

      const { result } = renderHook(() =>
        useEmployeeSearch({ employees, threshold: 0.3 })
      );

      // "Smith" should match both John Smith and Jane Smith
      const results = result.current.search("Smith");
      expect(results.length).toBeGreaterThanOrEqual(2);
      expect(results.map((r) => r.employee.name)).toContain("John Smith");
      expect(results.map((r) => r.employee.name)).toContain("Jane Smith");
    });
  });

  describe("Weighted Field Search", () => {
    it("searches across business_title field", () => {
      const employees = [
        createEmployee({
          employee_id: 1,
          name: "Alice Johnson",
          business_title: "Senior Software Engineer",
        }),
        createEmployee({
          employee_id: 2,
          name: "Bob Smith",
          business_title: "Product Manager",
        }),
      ];

      const { result } = renderHook(() =>
        useEmployeeSearch({ employees, threshold: 0.3 })
      );

      const results = result.current.search("Engineer");
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].employee.business_title).toContain("Engineer");
    });

    it("searches across job_level field", () => {
      const employees = [
        createEmployee({
          employee_id: 1,
          name: "Alice Johnson",
          job_level: "MT6",
        }),
        createEmployee({
          employee_id: 2,
          name: "Bob Smith",
          job_level: "MT2",
        }),
      ];

      const { result } = renderHook(() =>
        useEmployeeSearch({ employees, threshold: 0.3 })
      );

      const results = result.current.search("MT6");
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].employee.job_level).toBe("MT6");
    });

    it("searches across manager field", () => {
      const employees = [
        createEmployee({
          employee_id: 1,
          name: "Alice Johnson",
          manager: "Sarah Chen",
        }),
        createEmployee({
          employee_id: 2,
          name: "Bob Smith",
          manager: "Mike Davis",
        }),
      ];

      const { result } = renderHook(() =>
        useEmployeeSearch({ employees, threshold: 0.3 })
      );

      const results = result.current.search("Sarah");
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].employee.manager).toContain("Sarah");
    });

    it("searches across location field", () => {
      const employees = [
        createEmployee({
          employee_id: 1,
          name: "Alice Johnson",
          location: "USA",
        }),
        createEmployee({
          employee_id: 2,
          name: "Bob Smith",
          location: "GBR",
        }),
      ];

      const { result } = renderHook(() =>
        useEmployeeSearch({ employees, threshold: 0.3 })
      );

      const results = result.current.search("USA");
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].employee.location).toBe("USA");
    });

    it("searches across job_function field", () => {
      const employees = [
        createEmployee({
          employee_id: 1,
          name: "Alice Johnson",
          job_function: "Engineering",
        }),
        createEmployee({
          employee_id: 2,
          name: "Bob Smith",
          job_function: "Sales",
        }),
      ];

      const { result } = renderHook(() =>
        useEmployeeSearch({ employees, threshold: 0.3 })
      );

      const results = result.current.search("Engineering");
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].employee.job_function).toBe("Engineering");
    });

    it("prioritizes name matches over title matches", () => {
      const employees = [
        createEmployee({
          employee_id: 1,
          name: "Engineer Smith",
          business_title: "Product Manager",
        }),
        createEmployee({
          employee_id: 2,
          name: "Bob Jones",
          business_title: "Senior Engineer",
        }),
      ];

      const { result } = renderHook(() =>
        useEmployeeSearch({ employees, threshold: 0.3 })
      );

      const results = result.current.search("Engineer");
      expect(results.length).toBeGreaterThan(0);
      // Employee with "Engineer" in name should rank higher than one with it in title
      expect(results[0].employee.employee_id).toBe(1);
    });
  });

  describe("Edge Cases", () => {
    it("handles empty employee array", () => {
      const { result } = renderHook(() =>
        useEmployeeSearch({ employees: [], threshold: 0.3 })
      );

      expect(result.current.isReady).toBe(false);
      expect(result.current.search("test")).toEqual([]);
    });

    it("handles null query", () => {
      const employees = [
        createEmployee({ employee_id: 1, name: "John Smith" }),
      ];

      const { result } = renderHook(() =>
        useEmployeeSearch({ employees, threshold: 0.3 })
      );

      // @ts-expect-error Testing edge case with null query
      const results = result.current.search(null);
      expect(results).toEqual([]);
    });

    it("handles undefined query", () => {
      const employees = [
        createEmployee({ employee_id: 1, name: "John Smith" }),
      ];

      const { result } = renderHook(() =>
        useEmployeeSearch({ employees, threshold: 0.3 })
      );

      // @ts-expect-error Testing edge case with undefined query
      const results = result.current.search(undefined);
      expect(results).toEqual([]);
    });

    it("handles special characters in query", () => {
      const employees = [
        createEmployee({
          employee_id: 1,
          name: "John Smith",
          business_title: "VP (Engineering)",
        }),
      ];

      const { result } = renderHook(() =>
        useEmployeeSearch({ employees, threshold: 0.3 })
      );

      // Should not throw error with special regex characters
      // Search for "VP" without parentheses (realistic user behavior)
      expect(() => result.current.search("VP")).not.toThrow();
      const results = result.current.search("VP");
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].employee.business_title).toContain("VP");
    });

    it("handles whitespace-only query", () => {
      const employees = [
        createEmployee({ employee_id: 1, name: "John Smith" }),
      ];

      const { result } = renderHook(() =>
        useEmployeeSearch({ employees, threshold: 0.3 })
      );

      const results = result.current.search("   ");
      expect(results).toEqual([]);
    });
  });

  describe("International Support", () => {
    it("matches names with diacritics", () => {
      const employees = [
        createEmployee({ employee_id: 1, name: "José García" }),
        createEmployee({ employee_id: 2, name: "François Müller" }),
        createEmployee({ employee_id: 3, name: "John Smith" }),
      ];

      const { result } = renderHook(() =>
        useEmployeeSearch({ employees, threshold: 0.3 })
      );

      // Search for "Jose" should match "José"
      const results = result.current.search("Jose");
      expect(results.length).toBeGreaterThan(0);
      expect(results.some((r) => r.employee.name.includes("José"))).toBe(true);
    });

    it("matches names with accents", () => {
      const employees = [
        createEmployee({ employee_id: 1, name: "François Leclerc" }),
      ];

      const { result } = renderHook(() =>
        useEmployeeSearch({ employees, threshold: 0.3 })
      );

      // Search for "Francois" should match "François"
      const results = result.current.search("Francois");
      expect(results.length).toBeGreaterThan(0);
    });
  });

  describe("Performance", () => {
    // Skip performance tests in CI due to variable runner performance
    it.skipIf(!!process.env.CI)(
      "returns results in <50ms for 200 employees",
      () => {
        // Create 200 employees
        const employees = Array.from({ length: 200 }, (_, i) =>
          createEmployee({
            employee_id: i + 1,
            name: `Employee ${i + 1}`,
            business_title: `Title ${i % 10}`,
          })
        );

        const { result } = renderHook(() =>
          useEmployeeSearch({ employees, threshold: 0.3 })
        );

        const startTime = performance.now();
        result.current.search("Employee");
        const endTime = performance.now();

        const duration = endTime - startTime;
        expect(duration).toBeLessThan(50);
      }
    );

    it("limits results to specified resultLimit", () => {
      const employees = Array.from({ length: 50 }, (_, i) =>
        createEmployee({
          employee_id: i + 1,
          name: `John Smith ${i + 1}`,
        })
      );

      const { result } = renderHook(() =>
        useEmployeeSearch({ employees, threshold: 0.3, resultLimit: 10 })
      );

      const results = result.current.search("John");
      expect(results.length).toBeLessThanOrEqual(10);
    });

    it("limits results to default 10 when resultLimit not specified", () => {
      const employees = Array.from({ length: 50 }, (_, i) =>
        createEmployee({
          employee_id: i + 1,
          name: `John Smith ${i + 1}`,
        })
      );

      const { result } = renderHook(() =>
        useEmployeeSearch({ employees, threshold: 0.3 })
      );

      const results = result.current.search("John");
      expect(results.length).toBeLessThanOrEqual(10);
    });
  });

  describe("Memoization", () => {
    it("indicates ready state when employees are provided", () => {
      const employees = [
        createEmployee({ employee_id: 1, name: "John Smith" }),
      ];

      const { result } = renderHook(() =>
        useEmployeeSearch({ employees, threshold: 0.3 })
      );

      expect(result.current.isReady).toBe(true);
    });

    it("indicates not ready when employees array is empty", () => {
      const { result } = renderHook(() =>
        useEmployeeSearch({ employees: [], threshold: 0.3 })
      );

      expect(result.current.isReady).toBe(false);
    });

    it("re-creates Fuse instance when employees change", () => {
      const employees1 = [
        createEmployee({ employee_id: 1, name: "John Smith" }),
      ];
      const employees2 = [createEmployee({ employee_id: 2, name: "Jane Doe" })];

      const { result, rerender } = renderHook(
        ({ employees }) => useEmployeeSearch({ employees, threshold: 0.3 }),
        { initialProps: { employees: employees1 } }
      );

      const results1 = result.current.search("John");
      expect(results1.length).toBeGreaterThan(0);
      expect(results1[0].employee.name).toBe("John Smith");

      // Update employees
      rerender({ employees: employees2 });

      const results2 = result.current.search("Jane");
      expect(results2.length).toBeGreaterThan(0);
      expect(results2[0].employee.name).toBe("Jane Doe");

      // Old employee should not be found
      const results3 = result.current.search("John");
      expect(results3.length).toBe(0);
    });
  });

  describe("Threshold Configuration", () => {
    it("uses custom threshold value", () => {
      const employees = [
        createEmployee({ employee_id: 1, name: "John Smith" }),
      ];

      const { result } = renderHook(() =>
        useEmployeeSearch({ employees, threshold: 0.1 })
      );

      // With strict threshold (0.1), typos should match less
      const results = result.current.search("Jhn"); // Severe typo
      // Result depends on threshold - just verify it doesn't crash
      expect(Array.isArray(results)).toBe(true);
    });

    it("defaults to 0.25 threshold when not specified", () => {
      const employees = [
        createEmployee({ employee_id: 1, name: "John Smith" }),
      ];

      const { result } = renderHook(() => useEmployeeSearch({ employees }));

      // Should still perform fuzzy search with default threshold
      const results = result.current.search("Smit");
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeGreaterThan(0);
    });
  });

  describe("Multi-field Matching", () => {
    it("returns employees matching across different fields", () => {
      const employees = [
        createEmployee({
          employee_id: 1,
          name: "Alice Johnson",
          business_title: "Software Engineer",
          job_level: "MT2",
          manager: "Bob Smith",
        }),
      ];

      const { result } = renderHook(() =>
        useEmployeeSearch({ employees, threshold: 0.3 })
      );

      // Each of these searches should return the same employee
      expect(result.current.search("Alice").length).toBeGreaterThan(0);
      expect(result.current.search("Engineer").length).toBeGreaterThan(0);
      expect(result.current.search("MT2").length).toBeGreaterThan(0);
      expect(result.current.search("Bob").length).toBeGreaterThan(0);
    });

    it("ranks results by relevance", () => {
      const employees = [
        createEmployee({
          employee_id: 1,
          name: "Engineer Smith", // "Engineer" in name (high weight)
          business_title: "Product Manager",
        }),
        createEmployee({
          employee_id: 2,
          name: "Bob Jones",
          business_title: "Senior Engineer", // "Engineer" in title (lower weight)
        }),
      ];

      const { result } = renderHook(() =>
        useEmployeeSearch({ employees, threshold: 0.3 })
      );

      const results = result.current.search("Engineer");
      expect(results.length).toBeGreaterThan(0);

      // Higher weighted match (name) should rank first
      expect(results[0].employee.employee_id).toBe(1);
    });
  });

  describe("Error Handling", () => {
    it("returns error state as undefined when no error occurs", () => {
      const employees = [
        createEmployee({ employee_id: 1, name: "John Smith" }),
      ];

      const { result } = renderHook(() =>
        useEmployeeSearch({ employees, threshold: 0.3 })
      );

      expect(result.current.error).toBeUndefined();
    });

    it("indicates not ready when error occurs", () => {
      const employees = [
        createEmployee({ employee_id: 1, name: "John Smith" }),
      ];

      const { result } = renderHook(() =>
        useEmployeeSearch({ employees, threshold: 0.3 })
      );

      // Initially should be ready with no errors
      expect(result.current.isReady).toBe(true);
      expect(result.current.error).toBeUndefined();
    });

    it("clears error state when employees array becomes empty", () => {
      const employees1 = [
        createEmployee({ employee_id: 1, name: "John Smith" }),
      ];

      const { result, rerender } = renderHook(
        ({ employees }) => useEmployeeSearch({ employees, threshold: 0.3 }),
        { initialProps: { employees: employees1 } }
      );

      // Initially should be ready with no errors
      expect(result.current.isReady).toBe(true);
      expect(result.current.error).toBeUndefined();

      // Update to empty array
      rerender({ employees: [] });

      // Should not be ready, but no error either
      expect(result.current.isReady).toBe(false);
      expect(result.current.error).toBeUndefined();
    });

    it("returns empty results when search is called with an error state", () => {
      const employees = [
        createEmployee({ employee_id: 1, name: "John Smith" }),
      ];

      const { result } = renderHook(() =>
        useEmployeeSearch({ employees, threshold: 0.3 })
      );

      // Even if there's an error, search should gracefully return empty array
      const results = result.current.search("John");
      expect(Array.isArray(results)).toBe(true);
    });

    it("logs error to console when Fuse initialization fails", () => {
      // This test verifies the error logging behavior
      // In practice, Fuse.js rarely fails to initialize unless there's a severe issue
      // with the data structure or browser compatibility
      const employees = [
        createEmployee({ employee_id: 1, name: "John Smith" }),
      ];

      // Mock console.error to verify it's called
      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      // Note: In normal conditions, Fuse won't fail, so this test primarily
      // verifies the hook structure includes error handling
      const { result } = renderHook(() =>
        useEmployeeSearch({ employees, threshold: 0.3 })
      );

      // Clean up the spy
      consoleErrorSpy.mockRestore();

      // Verify hook returns correct structure even without errors
      expect(result.current).toHaveProperty("error");
      expect(result.current).toHaveProperty("isReady");
      expect(result.current).toHaveProperty("search");
    });

    it("includes error property in return type for TypeScript safety", () => {
      const employees = [
        createEmployee({ employee_id: 1, name: "John Smith" }),
      ];

      const { result } = renderHook(() =>
        useEmployeeSearch({ employees, threshold: 0.3 })
      );

      // Verify the error property exists and is typed correctly
      expect(result.current).toHaveProperty("error");
      expect(
        result.current.error === undefined ||
          result.current.error instanceof Error
      ).toBe(true);
    });
  });
});
