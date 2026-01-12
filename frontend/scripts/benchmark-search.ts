/**
 * Benchmark Script for Employee Search Performance
 *
 * Measures search performance across different dataset sizes (200-10000 employees)
 * and provides detailed metrics including average, min, max, and percentile latencies.
 *
 * Run with: npm run benchmark:search
 */

import { performance } from "perf_hooks";
import Fuse from "fuse.js";

// Simplified employee type for benchmark
interface BenchmarkEmployee {
  employee_id: number;
  name: string;
  business_title: string;
  job_level: string;
  job_function: string;
  location: string;
  manager: string;
}

/**
 * Generate in-memory employees for benchmarking
 */
function generateEmployees(count: number): BenchmarkEmployee[] {
  const employees: BenchmarkEmployee[] = [];
  const firstNames = [
    "Alice",
    "Bob",
    "Carol",
    "David",
    "Eve",
    "Frank",
    "Grace",
    "Henry",
  ];
  const lastNames = [
    "Smith",
    "Johnson",
    "Williams",
    "Brown",
    "Jones",
    "Garcia",
    "Miller",
    "Davis",
  ];
  const titles = [
    "Software Engineer",
    "Product Manager",
    "Data Analyst",
    "Engineering Manager",
    "Designer",
  ];
  const functions = ["Engineering", "Product", "Data", "Design", "Operations"];
  const locations = ["USA", "CAN", "GBR", "DEU", "IND", "AUS"];

  for (let i = 0; i < count; i++) {
    employees.push({
      employee_id: i + 1,
      name: `${firstNames[i % firstNames.length]} ${lastNames[Math.floor(i / firstNames.length) % lastNames.length]}`,
      business_title: titles[i % titles.length],
      job_level: `MT${(i % 6) + 1}`,
      job_function: functions[i % functions.length],
      location: locations[i % locations.length],
      manager: `Manager ${Math.floor(i / 10)}`,
    });
  }

  return employees;
}

/**
 * Benchmark search operations
 */
function benchmarkSearch(
  employees: BenchmarkEmployee[],
  queries: string[],
  iterations: number = 5
): {
  avg: number;
  min: number;
  max: number;
  p50: number;
  p95: number;
  p99: number;
} {
  // Create Fuse instance
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

  const durations: number[] = [];

  // Run multiple iterations
  for (let i = 0; i < iterations; i++) {
    for (const query of queries) {
      const start = performance.now();
      fuse.search(query, { limit: 10 });
      const duration = performance.now() - start;
      durations.push(duration);
    }
  }

  // Sort for percentile calculation
  durations.sort((a, b) => a - b);

  const sum = durations.reduce((acc, val) => acc + val, 0);
  const avg = sum / durations.length;
  const min = durations[0];
  const max = durations[durations.length - 1];
  const p50 = durations[Math.floor(durations.length * 0.5)];
  const p95 = durations[Math.floor(durations.length * 0.95)];
  const p99 = durations[Math.floor(durations.length * 0.99)];

  return { avg, min, max, p50, p95, p99 };
}

/**
 * Run comprehensive benchmarks
 */
async function runBenchmarks() {
  console.log("Employee Search Performance Benchmark");
  console.log("=====================================\n");

  const sizes = [200, 500, 1000, 2500, 5000, 10000];
  const queries = [
    "Alice",
    "Engineer",
    "test",
    "Manager",
    "Product",
    "MT3",
    "USA",
    "Engineering",
  ];

  console.log(`Testing with ${queries.length} different queries\n`);

  const results: Array<{
    size: number;
    avg: number;
    min: number;
    max: number;
    p50: number;
    p95: number;
    p99: number;
  }> = [];

  for (const size of sizes) {
    console.log(`\n📊 Testing ${size.toLocaleString()} employees...`);

    // Generate dataset
    const genStart = performance.now();
    const employees = generateEmployees(size);
    const genTime = performance.now() - genStart;
    console.log(`  Generation: ${genTime.toFixed(2)}ms`);

    // Benchmark searches
    const searchStart = performance.now();
    const stats = benchmarkSearch(employees, queries, 5);
    const totalSearchTime = performance.now() - searchStart;

    console.log(`  Search Performance (${queries.length * 5} searches):`);
    console.log(`    Average: ${stats.avg.toFixed(2)}ms`);
    console.log(`    Median (p50): ${stats.p50.toFixed(2)}ms`);
    console.log(`    p95: ${stats.p95.toFixed(2)}ms`);
    console.log(`    p99: ${stats.p99.toFixed(2)}ms`);
    console.log(`    Min: ${stats.min.toFixed(2)}ms`);
    console.log(`    Max: ${stats.max.toFixed(2)}ms`);
    console.log(`    Total time: ${totalSearchTime.toFixed(2)}ms`);

    results.push({ size, ...stats });
  }

  // Print summary table
  console.log("\n\n📈 Performance Summary");
  console.log("=====================\n");
  console.log(
    "| Size   | Avg (ms) | p50 (ms) | p95 (ms) | p99 (ms) | Max (ms) |"
  );
  console.log(
    "|--------|----------|----------|----------|----------|----------|"
  );

  results.forEach((result) => {
    console.log(
      `| ${result.size.toString().padEnd(6)} | ${result.avg.toFixed(2).padStart(8)} | ${result.p50.toFixed(2).padStart(8)} | ${result.p95.toFixed(2).padStart(8)} | ${result.p99.toFixed(2).padStart(8)} | ${result.max.toFixed(2).padStart(8)} |`
    );
  });

  // Performance degradation analysis
  console.log("\n\n📉 Scalability Analysis");
  console.log("======================\n");

  for (let i = 1; i < results.length; i++) {
    const prev = results[i - 1];
    const curr = results[i];
    const sizeRatio = curr.size / prev.size;
    const perfRatio = curr.avg / prev.avg;

    console.log(
      `${prev.size} → ${curr.size} (${sizeRatio.toFixed(1)}x data): ${perfRatio.toFixed(2)}x slower`
    );
  }

  // Performance targets
  console.log("\n\n🎯 Performance Targets");
  console.log("=====================\n");

  const targets = [
    { size: 200, target: 50, label: "Baseline (current)" },
    { size: 500, target: 75, label: "Small enterprise" },
    { size: 1000, target: 100, label: "Medium enterprise" },
    { size: 2500, target: 150, label: "Large enterprise" },
    { size: 5000, target: 200, label: "Very large enterprise" },
    { size: 10000, target: 300, label: "Exceptional scale" },
  ];

  targets.forEach((target) => {
    const result = results.find((r) => r.size === target.size);
    if (result) {
      const status = result.avg < target.target ? "✅ PASS" : "❌ FAIL";
      console.log(
        `${status} ${target.size.toString().padEnd(6)} employees: ${result.avg.toFixed(2)}ms (target: <${target.target}ms) - ${target.label}`
      );
    }
  });

  console.log("\n✅ Benchmark complete!\n");
}

// Run benchmarks
runBenchmarks().catch((error) => {
  console.error("Benchmark failed:", error);
  process.exit(1);
});
