import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright configuration for E2E and Visual Regression testing
 * This config includes both E2E and Visual projects so VSCode can discover both
 * See https://playwright.dev/docs/test-configuration.
 *
 * IMPORTANT: webServer configuration
 * - Both Vite (5173) and Storybook (6006) are started automatically
 * - In development: Reuses existing servers if already running
 * - In CI: Starts fresh servers (reuseExistingServer: false)
 * - If you get "DLL initialization failed" errors on Windows, check for port conflicts
 * - Run `npm run test:cleanup` to kill any lingering servers
 */
export default defineConfig({
  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,

  // Enable parallel test execution
  // Limit to 2 workers max for stability and to avoid flakiness
  workers: 2,

  // Reporter to use
  reporter: process.env.CI ? [["html"], ["github"]] : "html",

  // Configure projects for different test suites
  projects: [
    // ===== E2E Tests (DISABLED - replaced by e2e-core) =====
    // NOTE: The comprehensive e2e test suite has been replaced by the focused e2e-core suite
    // The e2e-core suite provides atomic UX validation based on the test specification
    // To re-enable the full e2e suite, uncomment the configuration below
    // {
    //   name: "e2e",
    //   testDir: "./playwright/e2e",
    //   timeout: 30000,
    //   retries: process.env.CI ? 2 : 1,
    //   fullyParallel: false,
    //   use: {
    //     ...devices["Desktop Chrome"],
    //     baseURL: "http://localhost:5173",
    //     viewport: { width: 1920, height: 1080 },
    //     headless: true,
    //     actionTimeout: 15000,
    //     trace: "retain-on-failure",
    //     screenshot: "only-on-failure",
    //     video: "retain-on-failure",
    //     storageState: undefined,
    //   },
    // },

    // ===== E2E Core Tests (Atomic UX Validation) =====
    // Focused test suite for atomic UX operations based on test specification
    // These tests validate core user workflows and critical functionality
    {
      name: "e2e-core",
      testDir: "./playwright/e2e-core",
      timeout: 30000,
      retries: process.env.CI ? 2 : 1,
      // Tests within a file run sequentially, but different files run in parallel
      fullyParallel: false,
      use: {
        ...devices["Desktop Chrome"],
        baseURL: "http://localhost:5173",
        viewport: { width: 1920, height: 1080 },
        headless: true,
        actionTimeout: 15000,
        trace: "retain-on-failure",
        screenshot: "only-on-failure",
        video: "retain-on-failure",
        storageState: undefined,
      },
    },

    // ===== Visual Regression Tests =====
    {
      name: "visual",
      testDir: "./playwright/visual",
      timeout: 30000,
      retries: process.env.CI ? 2 : 0,
      // Run visual tests sequentially for consistency (reduces rendering variations)
      fullyParallel: false,
      use: {
        ...devices["Desktop Chrome"],
        baseURL: "http://localhost:6006",
        viewport: { width: 1280, height: 720 },
        headless: true, // Explicitly force headless mode
        actionTimeout: 15000,
        trace: "retain-on-failure",
        screenshot: "only-on-failure",
        video: "off",
        deviceScaleFactor: 1,
        hasTouch: false,
        // Clear storage state between test contexts for isolation
        storageState: undefined,
      },
    },

    // ===== Documentation Screenshot Visual Regression =====
    {
      name: "docs-visual",
      testDir: "./playwright/visual-regression",
      timeout: 60000, // Longer timeout for screenshot comparison
      retries: process.env.CI ? 1 : 0,
      // Run tests in parallel since they're just comparing static images
      fullyParallel: true,
      use: {
        ...devices["Desktop Chrome"],
        // No baseURL needed - tests compare existing screenshot files
        headless: true,
        trace: "retain-on-failure",
        // Clear storage state between test contexts for isolation
        storageState: undefined,
      },
    },

    // ===== Screenshot Generation =====
    {
      name: "screenshots",
      testDir: "./playwright/screenshots",
      testMatch: "screenshots.spec.ts",
      timeout: 60000,
      retries: 0, // No retries for screenshot generation
      fullyParallel: false, // Run sequentially to avoid conflicts
      use: {
        ...devices["Desktop Chrome"],
        baseURL: "http://localhost:5173",
        viewport: { width: 1400, height: 900 },
        headless: true,
        actionTimeout: 30000,
        trace: "on", // Always capture traces for debugging
        screenshot: "on", // Capture screenshots at each step
        video: "retain-on-failure",
        storageState: undefined,
      },
    },

    // ===== Performance Tests =====
    // End-to-end performance testing for critical user workflows
    {
      name: "performance",
      testDir: "./playwright/performance",
      timeout: 60000, // Longer timeout for performance measurements
      retries: process.env.CI ? 1 : 0,
      fullyParallel: false, // Run sequentially for consistent performance metrics
      use: {
        ...devices["Desktop Chrome"],
        baseURL: "http://localhost:5173",
        viewport: { width: 1920, height: 1080 },
        headless: true,
        actionTimeout: 15000,
        trace: "retain-on-failure",
        screenshot: "only-on-failure",
        video: "retain-on-failure",
        storageState: undefined,
      },
    },
  ],

  // Global setup/teardown for backend server
  // Backend is started once before all tests and stopped after all tests
  globalSetup: "./playwright/global-setup.ts",
  globalTeardown: "./playwright/global-teardown.ts",

  // Auto-start both dev server and Storybook before running tests
  // Backend is handled by globalSetup
  // Both servers will start automatically and stop when tests complete
  webServer: [
    // Frontend dev server for E2E tests
    {
      command: "npm run dev",
      url: "http://localhost:5173",
      reuseExistingServer: !process.env.CI,
      timeout: 120000,
      // Enhanced logging for debugging
      stdout: "pipe",
      stderr: "pipe",
    },
    // Storybook server for visual regression tests
    {
      command: "npm run storybook",
      url: "http://localhost:6006",
      reuseExistingServer: !process.env.CI,
      timeout: 120000,
      // Enhanced logging for debugging
      stdout: "pipe",
      stderr: "pipe",
    },
  ],

  // Global expect configuration
  expect: {
    // Expect assertions timeout (applies to all expect() calls)
    timeout: 5000, // Balanced - fast enough to catch real issues, tolerant of CI environment

    // Visual comparison configuration (for visual regression tests)
    toHaveScreenshot: {
      maxDiffPixels: 100,
      maxDiffPixelRatio: 0.01,
      animations: "disabled",
      scale: "css",
    },
  },
});
