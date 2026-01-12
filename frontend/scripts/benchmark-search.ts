#!/usr/bin/env tsx
/**
 * Benchmark script for employee search performance
 *
 * This script measures search performance at various enterprise scales:
 * - Data generation time via backend API
 * - Fuse.js instance creation time
 * - Search latency statistics (p50, p95, p99)
 * - Memory usage patterns (if available)
 *
 * Usage:
 *   npm run benchmark:search
 *
 * Requirements:
 *   - Backend server must be running on port 38000
 *   - Node.js 20+ with tsx support
 */

import Fuse from "fuse.js";

// Mock window.performance for Node.js environment
if (typeof window === "undefined") {
  (global as any).window = {
    performance: {
      now: () => performance.now(),
      memory: undefined,
    },
  };
}

// Import after window mock
const apiBaseUrl = "http://localhost:38000/api";

interface Employee {
  employee_id: number;
  name: string;
  business_title: string;
  job_title: string;
  job_profile: string;
  job_level: string;
  job_function: string;
  location: string;
  manager: string;
  // ... other fields
}

interface GenerateSampleResponse {
  employees: Employee[];
  metadata: {
    total: number;
    bias_patterns?: string[];
    locations: string[];
    functions: string[];
  };
  session_id: string;
  filename: string;
}

/**
 * Generate sample dataset via backend API
 */
async function generateDataset(
  size: number,
  includeBias = false
): Promise<Employee[]> {
  const response = await fetch(`${apiBaseUrl}/employees/generate-sample`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      size,
      include_bias: includeBias,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to generate dataset: ${response.statusText}`);
  }

  const data: GenerateSampleResponse = await response.json();
  return data.employees;
}

/**
 * Calculate percentile from sorted array
 */
function percentile(sortedArray: number[], p: number): number {
  if (sortedArray.length === 0) return 0;
  const index = Math.ceil((p / 100) * sortedArray.length) - 1;
  return sortedArray[Math.max(0, index)];
}

/**
 * Run search benchmark for a specific dataset size
 */
async function benchmarkScale(size: number): Promise<void> {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`Benchmarking ${size} employees`);
  console.log("=".repeat(60));

  // Step 1: Generate dataset
  console.log(`\n[1/4] Generating ${size} employees via API...`);
  const genStartTime = performance.now();
  const employees = await generateDataset(size, false);
  const genEndTime = performance.now();
  const genTime = genEndTime - genStartTime;

  console.log(
    `  ✓ Generated ${employees.length} employees in ${genTime.toFixed(2)}ms`
  );

  // Step 2: Create Fuse instance
  console.log("\n[2/4] Creating Fuse.js search index...");
  const fuseStartTime = performance.now();

  const fuse = new Fuse(employees, {
    keys: [
      { name: "name", weight: 0.45 },
      { name: "business_title", weight: 0.25 },
      { name: "job_level", weight: 0.15 },
      { name: "manager", weight: 0.1 },
      { name: "location", weight: 0.05 },
      { name: "job_function", weight: 0.05 },
    ],
    threshold: 0.25,
    ignoreLocation: true,
    minMatchCharLength: 2,
    includeScore: true,
    includeMatches: true,
  });

  const fuseEndTime = performance.now();
  const fuseInitTime = fuseEndTime - fuseStartTime;

  console.log(`  ✓ Fuse index created in ${fuseInitTime.toFixed(2)}ms`);

  // Step 3: Run search queries and measure latency
  console.log("\n[3/4] Running search queries...");
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
    "Senior",
    "VP",
    "Marketing",
    "Developer",
    "Analyst",
  ];

  const latencies: number[] = [];
  const resultCounts: number[] = [];

  // Warm up: run first query to stabilize
  fuse.search(queries[0], { limit: 10 });

  // Run all queries and measure
  for (const query of queries) {
    const startTime = performance.now();
    const results = fuse.search(query, { limit: 10 });
    const endTime = performance.now();

    const latency = endTime - startTime;
    latencies.push(latency);
    resultCounts.push(results.length);
  }

  // Sort latencies for percentile calculation
  const sortedLatencies = [...latencies].sort((a, b) => a - b);

  // Calculate statistics
  const avgLatency = latencies.reduce((a, b) => a + b, 0) / latencies.length;
  const minLatency = Math.min(...latencies);
  const maxLatency = Math.max(...latencies);
  const p50 = percentile(sortedLatencies, 50);
  const p95 = percentile(sortedLatencies, 95);
  const p99 = percentile(sortedLatencies, 99);

  console.log(`  ✓ Executed ${queries.length} search queries`);
  console.log(`\n  Search Latency Statistics:`);
  console.log(`    Min:     ${minLatency.toFixed(2)}ms`);
  console.log(`    Max:     ${maxLatency.toFixed(2)}ms`);
  console.log(`    Average: ${avgLatency.toFixed(2)}ms`);
  console.log(`    p50:     ${p50.toFixed(2)}ms`);
  console.log(`    p95:     ${p95.toFixed(2)}ms`);
  console.log(`    p99:     ${p99.toFixed(2)}ms`);

  // Step 4: Report memory usage (if available)
  console.log("\n[4/4] Memory usage:");
  if ((performance as any).memory) {
    const memoryMB = (performance as any).memory.usedJSHeapSize / (1024 * 1024);
    console.log(`  ✓ Used JS Heap: ${memoryMB.toFixed(2)}MB`);
  } else {
    console.log("  ⚠ Memory usage not available (Chrome DevTools required)");
  }

  // Summary
  console.log(`\n${"=".repeat(60)}`);
  console.log(`Summary for ${size} employees:`);
  console.log(`  Data Generation: ${genTime.toFixed(2)}ms`);
  console.log(`  Fuse Init:       ${fuseInitTime.toFixed(2)}ms`);
  console.log(`  Search p50:      ${p50.toFixed(2)}ms`);
  console.log(`  Search p95:      ${p95.toFixed(2)}ms`);
  console.log(`  Search p99:      ${p99.toFixed(2)}ms`);
  console.log("=".repeat(60));
}

/**
 * Main benchmark execution
 */
async function main() {
  console.log("╔══════════════════════════════════════════════════════════╗");
  console.log("║  Employee Search Performance Benchmark                   ║");
  console.log("╚══════════════════════════════════════════════════════════╝");

  // Check backend availability
  console.log("\n[Check] Verifying backend API is available...");
  try {
    const response = await fetch(`${apiBaseUrl}/employees`, {
      method: "GET",
    });
    if (!response.ok) {
      throw new Error(`Backend returned ${response.status}`);
    }
    console.log("  ✓ Backend API is available");
  } catch (error) {
    console.error("  ✗ Backend API is not available!");
    console.error("  Please start the backend server on port 38000");
    console.error(`  Error: ${error}`);
    process.exit(1);
  }

  // Benchmark scales
  const scales = [200, 500, 1000, 2500, 5000];

  console.log(
    `\n[Info] Will benchmark at scales: ${scales.join(", ")} employees`
  );
  console.log("[Info] This may take several minutes...\n");

  // Run benchmarks for each scale
  for (const size of scales) {
    try {
      await benchmarkScale(size);
    } catch (error) {
      console.error(`\n✗ Benchmark failed for ${size} employees:`);
      console.error(`  ${error}`);
    }
  }

  // Optional: 10k stress test (commented out by default)
  console.log(`\n${"=".repeat(60)}`);
  console.log("Optional Stress Test (10,000 employees)");
  console.log("=".repeat(60));
  console.log("Skipped by default. Uncomment in script to run.");
  /*
  try {
    await benchmarkScale(10000);
  } catch (error) {
    console.error(`\n✗ Stress test failed:`);
    console.error(`  ${error}`);
  }
  */

  console.log("\n╔══════════════════════════════════════════════════════════╗");
  console.log("║  Benchmark Complete!                                     ║");
  console.log("╚══════════════════════════════════════════════════════════╝\n");
}

// Run benchmark
main().catch((error) => {
  console.error("Fatal error running benchmark:");
  console.error(error);
  process.exit(1);
});
