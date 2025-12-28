import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright configuration for E2E and Visual Regression testing
 * This config includes both E2E and Visual projects so VSCode can discover both
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,

  // Enable parallel test execution
  // CI uses 2 workers for stability, local uses auto-detect based on CPU cores
  workers: process.env.CI ? 2 : undefined,

  // Reporter to use
  reporter: "html",

  // Configure projects for different test suites
  projects: [
    // ===== E2E Tests =====
    // NOTE: E2E tests use worker-scoped backend isolation (see fixtures/worker-backend.ts)
    // Each worker gets its own backend server + database for true parallel execution
    {
      name: "e2e",
      testDir: "./playwright/e2e",
      timeout: 30000,
      retries: process.env.CI ? 2 : 1,
      // Tests within a file run sequentially, but different files run in parallel
      fullyParallel: false,
      use: {
        ...devices["Desktop Chrome"],
        baseURL: "http://localhost:5173",
        viewport: { width: 1920, height: 1080 },
        headless: true, // Explicitly force headless mode
        actionTimeout: 15000, // Increased to allow proper auto-waiting
        trace: "retain-on-failure",
        screenshot: "only-on-failure",
        video: "retain-on-failure",
        // Clear storage state between test contexts for isolation
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
        trace: "on",
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
  ],

  // Global setup/teardown for backend server
  // Backend is started once before all tests and stopped after all tests
  globalSetup: require.resolve("./playwright/global-setup.ts"),
  globalTeardown: require.resolve("./playwright/global-teardown.ts"),

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
    },
    // Storybook server for visual regression tests
    {
      command: "npm run storybook",
      url: "http://localhost:6006",
      reuseExistingServer: !process.env.CI,
      timeout: 120000,
    },
  ],

  // Global expect configuration
  expect: {
    // Expect assertions timeout (applies to all expect() calls)
    timeout: 2000, // Fail fast - anything longer means something is seriously wrong

    // Visual comparison configuration (for visual regression tests)
    toHaveScreenshot: {
      maxDiffPixels: 100,
      maxDiffPixelRatio: 0.01,
      animations: "disabled",
      scale: "css",
    },
  },
});
