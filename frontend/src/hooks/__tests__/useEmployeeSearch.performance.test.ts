/**
 * Performance tests for useEmployeeSearch hook at enterprise scale
 *
 * Tests employee search performance with datasets ranging from 200 to 10,000 employees
 * to validate behavior at small, medium, and large enterprise scales.
 */

import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useEmployeeSearch } from "../useEmployeeSearch";
import { generateEmployeesInMemory } from "../../test-utils/performance-generators";

describe("useEmployeeSearch - Enterprise Scale Performance", () => {
  describe("Search Performance at Scale", () => {
    it.each([
      { count: 200, target: 50, label: "✅ Tested baseline" },
      { count: 500, target: 75, label: "⚠️ Small enterprise" },
      { count: 1000, target: 100, label: "⚠️ Medium enterprise" },
      { count: 2500, target: 150, label: "⚠️ Large enterprise" },
      { count: 5000, target: 200, label: "❌ Very large enterprise" },
    ])(
      "searches $count employees in <$targetms ($label)",
      async ({ count, target }) => {
        const employees = await generateEmployeesInMemory(count);
        const { result } = renderHook(() => useEmployeeSearch({ employees }));

        const start = performance.now();
        act(() => {
          result.current.search("test query");
        });
        const duration = performance.now() - start;

        console.log(
          `${count} employees: ${duration.toFixed(2)}ms (target: <${target}ms)`
        );
        expect(duration).toBeLessThan(target);
      }
    );

    it("handles 10000 employees without crashing", async () => {
      const employees = await generateEmployeesInMemory(10000);
      const { result } = renderHook(() => useEmployeeSearch({ employees }));

      expect(() => {
        act(() => {
          result.current.search("test");
        });
      }).not.toThrow();

      // Verify results are returned
      const results = result.current.search("Employee");
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeGreaterThan(0);
    });

    it("search performance degrades gracefully with dataset size", async () => {
      const scales = [200, 500, 1000, 2500];
      const timings: number[] = [];

      for (const scale of scales) {
        const employees = await generateEmployeesInMemory(scale);
        const { result } = renderHook(() => useEmployeeSearch({ employees }));

        const start = performance.now();
        act(() => {
          result.current.search("Engineer");
        });
        const duration = performance.now() - start;
        timings.push(duration);

        console.log(`${scale} employees: ${duration.toFixed(2)}ms`);
      }

      // Verify performance doesn't degrade exponentially
      // Each doubling should be less than 2x slower
      for (let i = 1; i < timings.length; i++) {
        const ratio = timings[i] / timings[i - 1];
        console.log(
          `Performance ratio ${scales[i]}/${scales[i - 1]}: ${ratio.toFixed(2)}x`
        );
        // Allow up to 2.5x degradation between scales
        expect(ratio).toBeLessThan(2.5);
      }
    });
  });

  describe("Memory Stability", () => {
    it("does not leak memory during rapid searches", async () => {
      const employees = await generateEmployeesInMemory(1000);
      const { result } = renderHook(() => useEmployeeSearch({ employees }));

      // @ts-expect-error - performance.memory is Chrome-specific
      const initialMemory = performance.memory?.usedJSHeapSize || 0;

      // Perform 100 searches
      for (let i = 0; i < 100; i++) {
        act(() => {
          result.current.search(`query${i}`);
        });
      }

      // @ts-expect-error - performance.memory is Chrome-specific
      const finalMemory = performance.memory?.usedJSHeapSize || 0;
      const memoryGrowth = finalMemory - initialMemory;

      if (initialMemory > 0) {
        console.log(
          `Memory growth: ${(memoryGrowth / 1024 / 1024).toFixed(2)}MB`
        );

        // Memory growth should be <10MB
        expect(memoryGrowth).toBeLessThan(10 * 1024 * 1024);
      } else {
        console.log(
          "Memory API not available (not Chrome), skipping assertion"
        );
      }
    });

    it("maintains stable performance after many searches", async () => {
      const employees = await generateEmployeesInMemory(1000);
      const { result } = renderHook(() => useEmployeeSearch({ employees }));

      // Warm up
      for (let i = 0; i < 10; i++) {
        act(() => {
          result.current.search(`warmup${i}`);
        });
      }

      // Measure first batch
      const firstBatchStart = performance.now();
      for (let i = 0; i < 50; i++) {
        act(() => {
          result.current.search(`test${i}`);
        });
      }
      const firstBatchDuration = performance.now() - firstBatchStart;

      // Measure second batch
      const secondBatchStart = performance.now();
      for (let i = 0; i < 50; i++) {
        act(() => {
          result.current.search(`test${i + 50}`);
        });
      }
      const secondBatchDuration = performance.now() - secondBatchStart;

      console.log(
        `First batch: ${firstBatchDuration.toFixed(2)}ms, Second batch: ${secondBatchDuration.toFixed(2)}ms`
      );

      // Second batch should not be significantly slower (allow 50% variance)
      const ratio = secondBatchDuration / firstBatchDuration;
      expect(ratio).toBeLessThan(1.5);
    });
  });

  describe("Concurrent Search Performance", () => {
    it("handles concurrent searches efficiently", async () => {
      const employees = await generateEmployeesInMemory(1000);
      const { result } = renderHook(() => useEmployeeSearch({ employees }));

      const searches = ["Alice", "Engineer", "USA", "Manager", "High"];
      const start = performance.now();

      searches.forEach((query) => {
        act(() => {
          result.current.search(query);
        });
      });

      const duration = performance.now() - start;
      console.log(`5 concurrent searches: ${duration.toFixed(2)}ms`);
      expect(duration).toBeLessThan(500);
    });

    it("handles varied query lengths efficiently", async () => {
      const employees = await generateEmployeesInMemory(1000);
      const { result } = renderHook(() => useEmployeeSearch({ employees }));

      const queries = [
        "A", // 1 char (below minMatchCharLength, should return empty)
        "Al", // 2 chars (minimum)
        "Alice", // 5 chars
        "Engineer Manager", // 16 chars
        "Senior Software Engineer in Engineering", // 40 chars
      ];

      for (const query of queries) {
        const start = performance.now();
        act(() => {
          result.current.search(query);
        });
        const duration = performance.now() - start;

        console.log(
          `Query length ${query.length}: ${duration.toFixed(2)}ms - "${query.substring(0, 20)}${query.length > 20 ? "..." : ""}"`
        );

        // All queries should complete in reasonable time
        expect(duration).toBeLessThan(100);
      }
    });

    it("handles empty results efficiently at scale", async () => {
      const employees = await generateEmployeesInMemory(2500);
      const { result } = renderHook(() => useEmployeeSearch({ employees }));

      // Search for something that won't match
      const start = performance.now();
      act(() => {
        result.current.search("ZZZZZZZZZ_NOMATCH");
      });
      const duration = performance.now() - start;

      console.log(
        `Empty result search (2500 employees): ${duration.toFixed(2)}ms`
      );

      // Even when no results, should be fast
      expect(duration).toBeLessThan(100);

      const results = result.current.search("ZZZZZZZZZ_NOMATCH");
      expect(results).toHaveLength(0);
    });
  });

  describe("Result Quality at Scale", () => {
    it("returns accurate results at 5000 employee scale", async () => {
      const employees = await generateEmployeesInMemory(5000);
      const { result } = renderHook(() => useEmployeeSearch({ employees }));

      // Search for common terms
      const engineerResults = result.current.search("Engineer");
      const managerResults = result.current.search("Manager");

      // Should find results
      expect(engineerResults.length).toBeGreaterThan(0);
      expect(managerResults.length).toBeGreaterThan(0);

      // Results should be limited to default 10
      expect(engineerResults.length).toBeLessThanOrEqual(10);
      expect(managerResults.length).toBeLessThanOrEqual(10);

      // Results should contain the search term
      engineerResults.forEach((result) => {
        const employee = result.employee;
        const hasMatch =
          employee.name.toLowerCase().includes("engineer") ||
          employee.business_title?.toLowerCase().includes("engineer") ||
          employee.job_function?.toLowerCase().includes("engineer");
        expect(hasMatch).toBe(true);
      });
    });

    it("ranks results consistently at scale", async () => {
      const employees = await generateEmployeesInMemory(2500);
      const { result } = renderHook(() => useEmployeeSearch({ employees }));

      // Search multiple times with same query
      const results1 = result.current.search("Engineer");
      const results2 = result.current.search("Engineer");

      // Results should be consistent
      expect(results1.length).toBe(results2.length);

      // Top results should be the same
      if (results1.length > 0 && results2.length > 0) {
        expect(results1[0].employee.employee_id).toBe(
          results2[0].employee.employee_id
        );
      }
    });
  });

  describe("Edge Cases at Scale", () => {
    it("handles special characters in large dataset", async () => {
      const employees = await generateEmployeesInMemory(1000);
      const { result } = renderHook(() => useEmployeeSearch({ employees }));

      const specialQueries = [
        "test@example.com",
        "VP (Engineering)",
        "O'Brien",
        "Smith-Jones",
        "Engineer/Manager",
      ];

      specialQueries.forEach((query) => {
        expect(() => {
          act(() => {
            result.current.search(query);
          });
        }).not.toThrow();
      });
    });

    it("handles unicode characters at scale", async () => {
      const employees = await generateEmployeesInMemory(1000);
      const { result } = renderHook(() => useEmployeeSearch({ employees }));

      const unicodeQueries = ["José", "François", "Müller", "中文", "日本語"];

      unicodeQueries.forEach((query) => {
        const start = performance.now();
        expect(() => {
          act(() => {
            result.current.search(query);
          });
        }).not.toThrow();
        const duration = performance.now() - start;

        console.log(`Unicode query "${query}": ${duration.toFixed(2)}ms`);
        expect(duration).toBeLessThan(100);
      });
    });
  });
});
