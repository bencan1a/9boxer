/**
 * Performance Test Data Generators
 *
 * Utilities for generating large datasets for performance testing.
 * These generators create realistic employee data for testing grid rendering,
 * sorting, filtering, and other performance-critical operations.
 */

import { Employee, PerformanceLevel, PotentialLevel } from "../types/employee";
import { sampleDataService } from "../services/sampleDataService";

/**
 * Cache for generated enterprise datasets to avoid redundant API calls
 */
const enterpriseDatasetCache: Map<string, Employee[]> = new Map();

/**
 * Generate a large dataset of employees for performance testing
 *
 * @param count - Number of employees to generate
 * @param options - Optional configuration for data generation
 * @returns Array of generated employees
 */
export function generateLargeEmployeeDataset(
  count: number,
  options: {
    withModified?: boolean;
    withFlags?: boolean;
    distributeEvenly?: boolean;
  } = {}
): Employee[] {
  const {
    withModified = false,
    withFlags = false,
    distributeEvenly = true,
  } = options;

  const employees: Employee[] = [];
  const names = generateNames(count);
  const jobTitles = [
    "Software Engineer",
    "Product Manager",
    "Data Analyst",
    "Engineering Manager",
    "UX Designer",
    "DevOps Engineer",
    "QA Engineer",
    "Technical Writer",
    "Business Analyst",
    "Solutions Architect",
  ];
  const jobFunctions = [
    "Engineering",
    "Product",
    "Data",
    "Design",
    "Operations",
    "Quality",
  ];
  const locations = [
    "USA",
    "Canada",
    "UK",
    "Germany",
    "India",
    "Australia",
    "Singapore",
    "Japan",
  ];
  const performanceLevels = [
    PerformanceLevel.LOW,
    PerformanceLevel.MEDIUM,
    PerformanceLevel.HIGH,
  ];
  const potentialLevels = [
    PotentialLevel.LOW,
    PotentialLevel.MEDIUM,
    PotentialLevel.HIGH,
  ];
  const flags = ["promotion_ready", "flight_risk", "new_hire"];

  for (let i = 0; i < count; i++) {
    const performance = distributeEvenly
      ? performanceLevels[i % 3]
      : performanceLevels[Math.floor(Math.random() * 3)];
    const potential = distributeEvenly
      ? potentialLevels[Math.floor(i / 3) % 3]
      : potentialLevels[Math.floor(Math.random() * 3)];

    const gridPosition = calculateGridPosition(performance, potential);

    const employee: Employee = {
      employee_id: i + 1,
      name: names[i],
      business_title: jobTitles[i % jobTitles.length],
      job_title: jobTitles[i % jobTitles.length],
      job_profile: `${jobFunctions[i % jobFunctions.length]}-Tech-${locations[i % locations.length]}`,
      job_level: `MT${(i % 5) + 1}`,
      job_function: jobFunctions[i % jobFunctions.length],
      location: locations[i % locations.length],
      manager: `Manager ${Math.floor(i / 10)}`,
      management_chain_01: `Manager ${Math.floor(i / 10)}`,
      management_chain_02: `Director ${Math.floor(i / 50)}`,
      management_chain_03: `VP ${Math.floor(i / 200)}`,
      management_chain_04: null,
      management_chain_05: null,
      management_chain_06: null,
      hire_date: generateHireDate(i),
      tenure_category: calculateTenure(i),
      time_in_job_profile: `${(i % 5) + 1} years`,
      performance,
      potential,
      grid_position: gridPosition,
      talent_indicator: calculateTalentIndicator(gridPosition),
      ratings_history: generateRatingsHistory(i),
      development_focus: i % 3 === 0 ? "Leadership skills" : null,
      development_action: i % 3 === 0 ? "Training program" : null,
      notes: i % 5 === 0 ? "High performer" : null,
      promotion_status: i % 10 === 0 ? "Ready" : null,
      promotion_readiness: i % 10 === 0,
      modified_in_session: withModified && i % 20 === 0,
      last_modified:
        withModified && i % 20 === 0 ? new Date().toISOString() : null,
      flags: withFlags && i % 15 === 0 ? [flags[i % flags.length]] : [],
    };

    employees.push(employee);
  }

  return employees;
}

/**
 * Generate realistic employee names
 */
function generateNames(count: number): string[] {
  const firstNames = [
    "Alice",
    "Bob",
    "Carol",
    "David",
    "Eve",
    "Frank",
    "Grace",
    "Henry",
    "Iris",
    "Jack",
    "Kate",
    "Leo",
    "Mary",
    "Nina",
    "Oscar",
    "Paul",
    "Quinn",
    "Rita",
    "Sam",
    "Tina",
    "Uma",
    "Victor",
    "Wendy",
    "Xavier",
    "Yara",
    "Zach",
    "Amber",
    "Blake",
    "Chloe",
    "Dylan",
  ];
  const lastNames = [
    "Anderson",
    "Brown",
    "Clark",
    "Davis",
    "Evans",
    "Foster",
    "Garcia",
    "Harris",
    "Irwin",
    "Jackson",
    "Kumar",
    "Lee",
    "Martinez",
    "Nelson",
    "Olson",
    "Parker",
    "Quinn",
    "Rodriguez",
    "Smith",
    "Taylor",
    "Underwood",
    "Vazquez",
    "White",
    "Yang",
    "Zhang",
    "Abbott",
    "Bennett",
    "Cooper",
    "Diaz",
    "Ellis",
  ];

  const names: string[] = [];
  for (let i = 0; i < count; i++) {
    const firstName = firstNames[i % firstNames.length];
    const lastName =
      lastNames[Math.floor(i / firstNames.length) % lastNames.length];
    const suffix =
      Math.floor(i / (firstNames.length * lastNames.length)) > 0
        ? ` ${Math.floor(i / (firstNames.length * lastNames.length))}`
        : "";
    names.push(`${firstName} ${lastName}${suffix}`);
  }

  return names;
}

/**
 * Generate hire date based on index
 */
function generateHireDate(index: number): string {
  const year = 2015 + (index % 9);
  const month = (index % 12) + 1;
  const day = (index % 28) + 1;
  return `${year}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
}

/**
 * Calculate tenure category based on index
 */
function calculateTenure(index: number): string {
  const categories = [
    "0-1 years",
    "1-3 years",
    "3-5 years",
    "5-10 years",
    "10+ years",
  ];
  return categories[index % categories.length];
}

/**
 * Generate ratings history based on index
 */
function generateRatingsHistory(
  index: number
): Array<{ year: number; rating: string }> {
  const ratings = ["Leading", "Strong", "Solid", "Developing"];
  const historyLength = (index % 3) + 1;
  const history: Array<{ year: number; rating: string }> = [];

  for (let i = 0; i < historyLength; i++) {
    history.push({
      year: 2024 - i,
      rating: ratings[index % ratings.length],
    });
  }

  return history;
}

/**
 * Calculate grid position from performance and potential levels
 */
function calculateGridPosition(
  performance: PerformanceLevel,
  potential: PotentialLevel
): number {
  // Grid positions: 1-9 (bottom-left to top-right)
  // Rows: Low=1, Medium=2, High=3 (potential)
  // Cols: Low=1, Medium=2, High=3 (performance)
  const perfMap = { Low: 1, Medium: 2, High: 3 };
  const potMap = { Low: 1, Medium: 2, High: 3 };

  const col = perfMap[performance];
  const row = potMap[potential];

  return (row - 1) * 3 + col;
}

/**
 * Calculate talent indicator from grid position
 */
function calculateTalentIndicator(position: number): string {
  const indicators: Record<number, string> = {
    1: "Underperformer",
    2: "Effective Pro",
    3: "Workhorse",
    4: "Inconsistent",
    5: "Core Talent",
    6: "High Impact",
    7: "Enigma",
    8: "Growth",
    9: "Star",
  };
  return indicators[position] || "Core Talent";
}

/**
 * Generate employees grouped by grid position for testing
 */
export function generateEmployeesByPosition(
  employeesPerPosition: number = 10
): Record<number, Employee[]> {
  const byPosition: Record<number, Employee[]> = {};

  for (let position = 1; position <= 9; position++) {
    byPosition[position] = [];
  }

  const allEmployees = generateLargeEmployeeDataset(employeesPerPosition * 9, {
    distributeEvenly: true,
  });

  allEmployees.forEach((employee) => {
    byPosition[employee.grid_position].push(employee);
  });

  return byPosition;
}

/**
 * Performance measurement utilities
 */
export const performanceUtils = {
  /**
   * Measure render time for a component
   */
  measureRenderTime: (renderFn: () => void): number => {
    const start = performance.now();
    renderFn();
    return performance.now() - start;
  },

  /**
   * Measure async operation time
   */
  measureAsyncTime: async <T>(
    operation: () => Promise<T>
  ): Promise<{ result: T; duration: number }> => {
    const start = performance.now();
    const result = await operation();
    const duration = performance.now() - start;
    return { result, duration };
  },

  /**
   * Get current memory usage (if available)
   */
  getMemoryUsage: (): number | null => {
    const memory = (
      performance as Performance & {
        memory?: { usedJSHeapSize: number };
      }
    ).memory;

    if (memory && typeof memory.usedJSHeapSize === "number") {
      return memory.usedJSHeapSize;
    }
    return null;
  },

  /**
   * Measure memory growth over multiple operations
   */
  measureMemoryGrowth: (
    iterations: number,
    operation: () => void
  ): number | null => {
    const startMemory = performanceUtils.getMemoryUsage();
    if (startMemory === null) return null;

    for (let i = 0; i < iterations; i++) {
      operation();
    }

    // Force garbage collection if available (Chrome DevTools)
    const globalWithGc = globalThis as typeof globalThis & { gc?: () => void };
    if (globalWithGc.gc) {
      globalWithGc.gc();
    }

    const endMemory = performanceUtils.getMemoryUsage();
    if (endMemory === null) return null;

    return endMemory - startMemory;
  },
};

/**
 * Generate enterprise-scale dataset using backend API
 *
 * This function uses the backend sample data generator for realistic data at scale.
 * Results are cached to avoid redundant API calls during test runs.
 *
 * @param count - Number of employees to generate (50-10000)
 * @param options - Optional configuration
 * @returns Array of generated employees
 *
 * @remarks
 * - Uses backend API for realistic data generation
 * - Falls back to local generation if API is unavailable
 * - Results are cached per count for performance
 * - Cache is cleared between test files
 *
 * @example
 * ```ts
 * // Generate 1000 employees via API
 * const employees = await generateEnterpriseDataset(1000);
 *
 * // Generate 5000 employees with custom seed
 * const employees = await generateEnterpriseDataset(5000, { seed: 42 });
 * ```
 */
export async function generateEnterpriseDataset(
  count: number,
  options: {
    seed?: number;
    include_bias?: boolean;
    useCache?: boolean;
  } = {}
): Promise<Employee[]> {
  const { seed, include_bias = false, useCache = true } = options;

  // Check cache first (include bias and seed in cache key to avoid collisions)
  const cacheKey = `${count}-${include_bias}-${seed ?? "default"}`;
  if (useCache && enterpriseDatasetCache.has(cacheKey)) {
    return enterpriseDatasetCache.get(cacheKey)!;
  }

  try {
    // Try to generate via backend API for realistic data
    const response = await sampleDataService.generateSampleDataset({
      size: count,
      include_bias,
      seed,
    });

    const employees = response.employees;

    // Cache the result
    if (useCache) {
      enterpriseDatasetCache.set(cacheKey, employees);
    }

    return employees;
  } catch (error) {
    // Fall back to local generation if API is unavailable
    console.warn(
      `[generateEnterpriseDataset] API unavailable, falling back to local generation: ${error}`
    );
    return generateLargeEmployeeDataset(count, {
      distributeEvenly: true,
      withFlags: include_bias,
    });
  }
}

/**
 * Clear the enterprise dataset cache
 *
 * Call this between test files or when memory is a concern
 */
export function clearEnterpriseDatasetCache(): void {
  enterpriseDatasetCache.clear();
}
