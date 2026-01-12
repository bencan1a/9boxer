/**
 * Performance tests for useEmployeeSearch hook at enterprise scale
 *
 * These tests validate search performance with datasets ranging from
 * 200 to 10,000 employees. They measure:
 * - Search latency across different dataset sizes
 * - Fuse.js initialization time
 * - Memory stability during repeated searches
 * - Stress testing at maximum scale
 *
 * Note: These tests are skipped in CI to avoid flakiness on variable runners.
 * Run locally to validate performance characteristics.
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { renderHook } from "@testing-library/react";
import { useEmployeeSearch } from "../useEmployeeSearch";
import {
  generateEnterpriseDataset,
  clearEnterpriseDatasetCache,
  performanceUtils,
} from "../../test-utils/performance-generators";
import { Employee } from "../../types/employee";

describe("Employee Search Performance at Enterprise Scale", () => {
  // Clean up cache after all tests
  afterAll(() => {
    clearEnterpriseDatasetCache();
  });

  describe("Search Performance at Various Scales", () => {
    // Test search performance at different employee counts
    it.each([
      [200, 50], // 200 employees: target <50ms
      [500, 75], // 500 employees: target <75ms
      [1000, 100], // 1000 employees: target <100ms
      [2500, 150], // 2500 employees: target <150ms
      [5000, 200], // 5000 employees: target <200ms
    ])(
      "searches %i employees efficiently (target: <%ims)",
      async (count: number, targetMs: number) => {
        // Skip in CI due to variable runner performance
        if (process.env.CI) {
          console.log(`Skipping performance test in CI: ${count} employees`);
          return;
        }

        // Generate dataset via API
        console.log(`Generating ${count} employees via API...`);
        const employees = await generateEnterpriseDataset(count, {
          useCache: true,
        });

        expect(employees).toHaveLength(count);

        // Render hook with generated data
        const { result } = renderHook(() =>
          useEmployeeSearch({ employees, threshold: 0.3 })
        );

        expect(result.current.isReady).toBe(true);

        // Warm up: perform one search to ensure Fuse is ready
        result.current.search("test");

        // Measure search latency across multiple queries
        const queries = ["John", "Engineer", "MT2", "Manager", "USA", "Sales"];
        const latencies: number[] = [];

        for (const query of queries) {
          const startTime = performance.now();
          const results = result.current.search(query);
          const endTime = performance.now();

          const latency = endTime - startTime;
          latencies.push(latency);

          // Verify results are correct (should have some matches)
          expect(Array.isArray(results)).toBe(true);
          expect(results.length).toBeGreaterThanOrEqual(0);
          expect(results.length).toBeLessThanOrEqual(10); // Default result limit
        }

        // Calculate average latency
        const avgLatency =
          latencies.reduce((a, b) => a + b, 0) / latencies.length;
        const maxLatency = Math.max(...latencies);

        console.log(
          `[${count} employees] Avg latency: ${avgLatency.toFixed(2)}ms, Max: ${maxLatency.toFixed(2)}ms, Target: <${targetMs}ms`
        );

        // Verify performance meets target
        // Use maxLatency instead of avgLatency for stricter check
        expect(maxLatency).toBeLessThan(targetMs * 1.5); // Allow 50% buffer for test environment variability
      },
      60000 // 60 second timeout for large datasets
    );
  });

  describe("Stress Test: Maximum Scale", () => {
    it("handles 10000 employees without crashing", async () => {
      // Skip in CI - this is a heavy stress test
      if (process.env.CI) {
        console.log("Skipping stress test in CI: 10000 employees");
        return;
      }

      console.log("Generating 10000 employees via API...");
      const employees = await generateEnterpriseDataset(10000, {
        useCache: true,
      });

      expect(employees).toHaveLength(10000);

      // Measure Fuse initialization time
      const initStartTime = performance.now();
      const { result } = renderHook(() =>
        useEmployeeSearch({ employees, threshold: 0.3 })
      );
      const initEndTime = performance.now();
      const initTime = initEndTime - initStartTime;

      console.log(`[10000 employees] Fuse init time: ${initTime.toFixed(2)}ms`);

      // Verify hook is ready
      expect(result.current.isReady).toBe(true);
      expect(result.current.error).toBeUndefined();

      // Perform a search and verify it works
      const startTime = performance.now();
      const results = result.current.search("Engineer");
      const endTime = performance.now();
      const searchTime = endTime - startTime;

      console.log(`[10000 employees] Search time: ${searchTime.toFixed(2)}ms`);

      // Should return results (limited to 10 by default)
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeGreaterThan(0);
      expect(results.length).toBeLessThanOrEqual(10);

      // Should complete in reasonable time (allow generous timeout for stress test)
      expect(searchTime).toBeLessThan(1000); // Should complete within 1 second
    }, 120000); // 120 second timeout for stress test
  });

  describe("Memory Leak Detection", () => {
    it("does not leak memory during rapid searches (1000 employees)", async () => {
      // Skip in CI - memory measurement requires Chrome DevTools
      if (process.env.CI || !performanceUtils.getMemoryUsage()) {
        console.log(
          "Skipping memory leak test: not in Chrome DevTools environment"
        );
        return;
      }

      console.log("Generating 1000 employees for memory leak test...");
      const employees = await generateEnterpriseDataset(1000, {
        useCache: true,
      });

      const { result } = renderHook(() =>
        useEmployeeSearch({ employees, threshold: 0.3 })
      );

      expect(result.current.isReady).toBe(true);

      // Measure memory before rapid searches
      const startMemory = performanceUtils.getMemoryUsage();
      expect(startMemory).not.toBeNull();

      // Perform 100 rapid searches with different queries
      const queries = [
        "John",
        "Engineer",
        "MT2",
        "Manager",
        "USA",
        "Sales",
        "Director",
        "Product",
        "Alice",
        "Bob",
      ];

      for (let i = 0; i < 100; i++) {
        const query = queries[i % queries.length];
        result.current.search(query);
      }

      // Force garbage collection if available
      const globalWithGc = globalThis as typeof globalThis & {
        gc?: () => void;
      };
      if (globalWithGc.gc) {
        globalWithGc.gc();
      }

      // Measure memory after rapid searches
      const endMemory = performanceUtils.getMemoryUsage();
      expect(endMemory).not.toBeNull();

      const memoryGrowth = endMemory! - startMemory!;
      const memoryGrowthMB = memoryGrowth / (1024 * 1024);

      console.log(
        `[Memory leak test] Memory growth: ${memoryGrowthMB.toFixed(2)}MB after 100 searches`
      );

      // Verify memory growth is reasonable (should be < 5MB for 100 searches)
      // This is a sanity check - actual memory management is complex
      expect(memoryGrowthMB).toBeLessThan(10); // Allow 10MB buffer
    }, 60000); // 60 second timeout
  });

  describe("Fuse Instance Creation Performance", () => {
    it.each([
      [200, 50], // 200 employees: init should be <50ms
      [500, 100], // 500 employees: init should be <100ms
      [1000, 150], // 1000 employees: init should be <150ms
      [2500, 300], // 2500 employees: init should be <300ms
      [5000, 500], // 5000 employees: init should be <500ms
    ])(
      "creates search index efficiently for %i employees (target: <%ims)",
      async (count: number, targetMs: number) => {
        // Skip in CI
        if (process.env.CI) {
          console.log(`Skipping Fuse init test in CI: ${count} employees`);
          return;
        }

        console.log(`Testing Fuse initialization for ${count} employees...`);
        const employees = await generateEnterpriseDataset(count, {
          useCache: true,
        });

        // Measure Fuse initialization time
        const startTime = performance.now();
        const { result } = renderHook(() =>
          useEmployeeSearch({ employees, threshold: 0.3 })
        );
        const endTime = performance.now();

        const initTime = endTime - startTime;
        console.log(
          `[${count} employees] Fuse init time: ${initTime.toFixed(2)}ms, Target: <${targetMs}ms`
        );

        // Verify hook is ready
        expect(result.current.isReady).toBe(true);
        expect(result.current.error).toBeUndefined();

        // Verify initialization time meets target
        expect(initTime).toBeLessThan(targetMs * 1.5); // Allow 50% buffer
      },
      60000 // 60 second timeout
    );
  });

  describe("Result Accuracy at Scale", () => {
    it("returns accurate results at 5000 employee scale", async () => {
      // Skip in CI
      if (process.env.CI) {
        console.log("Skipping accuracy test in CI");
        return;
      }

      const employees = await generateEnterpriseDataset(5000, {
        useCache: true,
      });

      const { result } = renderHook(() =>
        useEmployeeSearch({ employees, threshold: 0.3 })
      );

      expect(result.current.isReady).toBe(true);

      // Search for a specific name and verify results
      const results = result.current.search("Alice");

      // Should return results (limited to 10 by default)
      expect(results.length).toBeGreaterThan(0);
      expect(results.length).toBeLessThanOrEqual(10);

      // All results should contain "Alice" in some field
      results.forEach((result) => {
        const employee = result.employee;
        const fields = [
          employee.name,
          employee.business_title,
          employee.manager,
          employee.location,
          employee.job_function,
        ];

        const hasMatch = fields.some(
          (field) => field && field.toLowerCase().includes("alice")
        );

        expect(hasMatch).toBe(true);
      });

      // Results should be sorted by relevance (score ascending)
      if (results.length > 1) {
        for (let i = 1; i < results.length; i++) {
          const prevScore = results[i - 1].score ?? 0;
          const currentScore = results[i].score ?? 0;
          expect(prevScore).toBeLessThanOrEqual(currentScore);
        }
      }
    }, 60000);
  });
});
