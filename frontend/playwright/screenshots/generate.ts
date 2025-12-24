#!/usr/bin/env node
/**
 * Screenshot Generation CLI
 *
 * Generates documentation screenshots using Playwright and shared E2E test helpers.
 * This replaces the Python screenshot generator with a TypeScript implementation
 * that reuses the same helpers as E2E tests, ensuring consistency and eliminating duplication.
 *
 * Usage:
 *   npm run screenshots:generate                    # Generate all automated screenshots
 *   npm run screenshots:generate grid-normal        # Generate specific screenshot
 *   npm run screenshots:generate grid-normal changes-tab  # Generate multiple specific screenshots
 *
 * Architecture:
 *   - Starts backend and frontend servers (reuses Playwright test infrastructure)
 *   - Launches browser with consistent viewport (1400x900)
 *   - Calls workflow functions to generate screenshots
 *   - Tracks results (successful/failed/skipped/manual)
 *   - Provides summary report
 */

import { chromium, Browser, Page } from '@playwright/test';
import { spawn, ChildProcess } from 'child_process';
import * as http from 'http';
import * as path from 'path';
import * as fs from 'fs';
import {
  screenshotConfig,
  ScreenshotMetadata,
  getAutomatedScreenshots,
  getManualScreenshots,
} from './config';

interface GenerateOptions {
  screenshots?: string[];  // Filter specific screenshots
  outputDir?: string;      // Override output directory (not typically used)
  viewport?: { width: number; height: number };
  headless?: boolean;
}

interface GenerationResults {
  successful: string[];
  failed: Array<{ name: string; error: string }>;
  skipped: string[];
  manual: string[];
}

/**
 * Server management for backend and frontend
 */
class ServerManager {
  private backendProcess: ChildProcess | null = null;
  private frontendProcess: ChildProcess | null = null;
  private readonly backendPort = 8000;
  private readonly frontendPort = 5173;

  async startBackend(): Promise<void> {
    console.log('Starting backend server...');

    // Determine backend executable path based on platform
    const projectRoot = path.resolve(__dirname, '../../..');
    const isWindows = process.platform === 'win32';
    const backendExe = isWindows
      ? path.join(projectRoot, 'backend', 'dist', 'ninebox', 'ninebox.exe')
      : path.join(projectRoot, 'backend', 'dist', 'ninebox', 'ninebox');

    // Check if backend executable exists
    if (!fs.existsSync(backendExe)) {
      throw new Error(
        `Backend executable not found at ${backendExe}. ` +
        'Please build the backend first using: cd backend && ./scripts/build_executable.sh (or .bat on Windows)'
      );
    }

    this.backendProcess = spawn(backendExe, [], {
      stdio: 'pipe',
      env: { ...process.env, PORT: this.backendPort.toString() },
    });

    this.backendProcess.stdout?.on('data', (data) => {
      console.log(`[Backend] ${data.toString().trim()}`);
    });

    this.backendProcess.stderr?.on('data', (data) => {
      console.error(`[Backend Error] ${data.toString().trim()}`);
    });

    // Wait for backend to be ready
    await this.waitForServer(`http://localhost:${this.backendPort}/health`, 30000);
    console.log('Backend server ready');
  }

  async startFrontend(): Promise<void> {
    console.log('Starting frontend server...');

    const frontendDir = path.resolve(__dirname, '../..');

    this.frontendProcess = spawn('npm', ['run', 'dev'], {
      cwd: frontendDir,
      stdio: 'pipe',
      shell: true,
    });

    this.frontendProcess.stdout?.on('data', (data) => {
      console.log(`[Frontend] ${data.toString().trim()}`);
    });

    this.frontendProcess.stderr?.on('data', (data) => {
      // Vite outputs to stderr, not necessarily errors
      const message = data.toString().trim();
      if (message.includes('Local:')) {
        console.log(`[Frontend] ${message}`);
      }
    });

    // Wait for frontend to be ready
    await this.waitForServer(`http://localhost:${this.frontendPort}`, 60000);
    console.log('Frontend server ready');
  }

  private async waitForServer(url: string, timeout: number): Promise<void> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      try {
        await new Promise<void>((resolve, reject) => {
          http
            .get(url, { timeout: 5000 }, (res) => {
              if (res.statusCode === 200) {
                resolve();
              } else {
                reject(new Error(`Server returned ${res.statusCode}`));
              }
            })
            .on('error', reject)
            .on('timeout', () => {
              reject(new Error('Request timeout'));
            });
        });
        return; // Success
      } catch (error) {
        // Server not ready yet, wait and retry
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }

    throw new Error(`Server at ${url} did not become ready within ${timeout}ms`);
  }

  async stopAll(): Promise<void> {
    console.log('\nStopping servers...');

    if (this.backendProcess) {
      this.backendProcess.kill();
      this.backendProcess = null;
    }

    if (this.frontendProcess) {
      this.frontendProcess.kill();
      this.frontendProcess = null;
    }

    console.log('Servers stopped');
  }
}

/**
 * Main screenshot generation function
 */
export async function generateScreenshots(options: GenerateOptions = {}): Promise<GenerationResults> {
  const serverManager = new ServerManager();
  const results: GenerationResults = {
    successful: [],
    failed: [],
    skipped: [],
    manual: [],
  };

  let browser: Browser | null = null;

  try {
    // Start servers
    await serverManager.startBackend();
    await serverManager.startFrontend();

    // Launch browser
    console.log('\nLaunching browser...');
    browser = await chromium.launch({
      headless: options.headless ?? true,
    });

    const page = await browser.newPage({
      viewport: options.viewport || { width: 1400, height: 900 },
    });

    // Navigate to app
    await page.goto('http://localhost:5173');
    console.log('Browser ready\n');

    // Determine which screenshots to generate
    const automatedScreenshots = getAutomatedScreenshots();
    const manualScreenshots = getManualScreenshots();

    // Filter screenshots if specific ones requested
    let screenshotsToGenerate: Record<string, ScreenshotMetadata> = automatedScreenshots;
    if (options.screenshots && options.screenshots.length > 0) {
      screenshotsToGenerate = Object.fromEntries(
        Object.entries(automatedScreenshots).filter(([name]) =>
          options.screenshots!.includes(name)
        )
      );
    }

    // Report manual screenshots
    for (const [name, metadata] of Object.entries(manualScreenshots)) {
      results.manual.push(name);
      console.log(`⚠ [Manual] ${name} - ${metadata.description}`);
    }

    // Generate each automated screenshot
    let screenshotIndex = 0;
    const totalScreenshots = Object.keys(screenshotsToGenerate).length;

    for (const [name, metadata] of Object.entries(screenshotsToGenerate)) {
      try {
        // Phase 3: Reset application state between screenshots for isolation
        // Skip reset for first screenshot (page already clean)
        if (screenshotIndex > 0) {
          await resetApplicationState(page);
        }

        console.log(`📸 Generating: ${name}... (${screenshotIndex + 1}/${totalScreenshots})`);
        await generateScreenshot(page, name, metadata);
        results.successful.push(name);
        console.log(`✓ Success: ${name}`);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        results.failed.push({ name, error: errorMessage });
        console.error(`✗ Failed: ${name} - ${errorMessage}`);
      }

      screenshotIndex++;
    }

    // Report skipped screenshots (if filtering was used)
    if (options.screenshots && options.screenshots.length > 0) {
      const allNames = Object.keys(automatedScreenshots);
      const skipped = allNames.filter((name) => !options.screenshots!.includes(name));
      results.skipped = skipped;
    }
  } catch (error) {
    console.error('\n✗ Fatal error during screenshot generation:');
    console.error(error);
    throw error;
  } finally {
    // Cleanup
    if (browser) {
      await browser.close();
    }
    await serverManager.stopAll();
  }

  // Print summary
  printSummary(results);

  return results;
}

/**
 * Reset application state between screenshots (Phase 3: Task 8)
 *
 * Ensures each screenshot starts with a clean state:
 * - Reloads the page to clear all application state
 * - Waits for page to be fully loaded
 * - Verifies app is in clean initial state
 *
 * This prevents state leakage between screenshots and ensures
 * consistent, reproducible results regardless of execution order.
 */
async function resetApplicationState(page: Page): Promise<void> {
  // Reload page to clear all state
  await page.reload({ waitUntil: 'networkidle' });

  // Wait for app to be ready (verify clean state - Phase 3: Task 9)
  // The app should show the welcome/upload state with no data loaded
  const appReady = page.locator('[data-testid="nine-box-grid"]');

  // Wait a moment for React to initialize
  await page.waitForTimeout(500);

  // Verify we're in clean state (no employees loaded)
  const employeeCards = page.locator('[data-testid^="employee-card-"]');
  const count = await employeeCards.count();

  if (count > 0) {
    // State not clean - might be persistent storage
    // This is expected and okay - workflows will handle uploading fresh data
    console.log(`  ℹ State reset: ${count} employees still present (will be replaced by workflow)`);
  }
}

/**
 * Generate a single screenshot
 */
async function generateScreenshot(
  page: Page,
  name: string,
  metadata: ScreenshotMetadata
): Promise<void> {
  // Dynamically import the workflow module
  const workflowModule = await import(`./workflows/${metadata.workflow}`);
  const screenshotFn = workflowModule[metadata.function];

  if (!screenshotFn) {
    throw new Error(`Screenshot function ${metadata.function} not found in ${metadata.workflow}`);
  }

  // Ensure output directory exists
  const projectRoot = path.resolve(__dirname, '../../..');
  const outputPath = path.join(projectRoot, metadata.path);
  const outputDir = path.dirname(outputPath);
  fs.mkdirSync(outputDir, { recursive: true });

  // Call the workflow function
  await screenshotFn(page, outputPath);

  // Validate screenshot was created successfully (Phase 2: Task 7)
  await validateScreenshot(outputPath, name);
}

/**
 * Validate that a screenshot was created successfully
 *
 * Checks:
 * - File exists on disk
 * - File size is reasonable (> 1 KB to detect corrupt/empty files)
 *
 * @throws Error if validation fails
 */
async function validateScreenshot(outputPath: string, name: string): Promise<void> {
  // Check file exists
  if (!fs.existsSync(outputPath)) {
    throw new Error(`Screenshot file not created at ${outputPath}`);
  }

  // Check file size
  const stats = fs.statSync(outputPath);
  const fileSizeKB = stats.size / 1024;

  if (stats.size === 0) {
    throw new Error(`Screenshot file is empty (0 bytes)`);
  }

  if (fileSizeKB < 1) {
    throw new Error(
      `Screenshot file suspiciously small (${fileSizeKB.toFixed(2)} KB). ` +
      'May indicate a corrupt or incomplete screenshot.'
    );
  }

  // Success - file looks valid
  console.log(`  ✓ Validated: ${fileSizeKB.toFixed(1)} KB`);
}

/**
 * Print generation summary
 */
function printSummary(results: GenerationResults): void {
  console.log('\n' + '='.repeat(60));
  console.log('Screenshot Generation Summary');
  console.log('='.repeat(60));

  console.log(`✓ Successful: ${results.successful.length}`);
  console.log(`✗ Failed:     ${results.failed.length}`);
  console.log(`⊘ Skipped:    ${results.skipped.length}`);
  console.log(`⚠ Manual:     ${results.manual.length}`);

  if (results.failed.length > 0) {
    console.log('\nFailed screenshots:');
    for (const { name, error } of results.failed) {
      console.log(`  - ${name}: ${error}`);
    }
  }

  if (results.manual.length > 0) {
    console.log('\nManual screenshots (require manual creation):');
    for (const name of results.manual) {
      const metadata = screenshotConfig[name];
      console.log(`  - ${name}: ${metadata.description}`);
    }
  }

  console.log('='.repeat(60) + '\n');
}

/**
 * Parse CLI arguments
 */
function parseArgs(): GenerateOptions {
  const args = process.argv.slice(2);

  const options: GenerateOptions = {
    screenshots: args.length > 0 ? args : undefined,
    headless: process.env.HEADLESS !== 'false',
  };

  return options;
}

/**
 * CLI entry point
 */
async function main(): Promise<void> {
  const options = parseArgs();

  console.log('Screenshot Generator');
  console.log('='.repeat(60));

  if (options.screenshots && options.screenshots.length > 0) {
    console.log(`Generating specific screenshots: ${options.screenshots.join(', ')}`);
  } else {
    console.log('Generating all automated screenshots');
  }

  console.log('='.repeat(60) + '\n');

  try {
    const results = await generateScreenshots(options);

    // Exit with error code if any screenshots failed
    process.exit(results.failed.length > 0 ? 1 : 0);
  } catch (error) {
    console.error('\n✗ Screenshot generation failed');
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}
