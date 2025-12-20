import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for E2E testing
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './playwright/e2e',

  // Maximum time one test can run
  timeout: 30000,

  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,

  // Retry on CI only
  retries: 0,

  // Run tests sequentially (1 worker)
  workers: 1,

  // Reporter to use
  reporter: 'html',

  use: {
    // Base URL to use in actions like `await page.goto('/')`
    baseURL: 'http://localhost:5173',

    // Viewport size matching Cypress config
    viewport: { width: 1280, height: 720 },

    // Maximum time each action can take
    actionTimeout: 10000,

    // Collect trace on failure
    trace: 'on-first-retry',

    // Screenshot on failure
    screenshot: 'only-on-failure',
  },

  // Configure projects for major browsers
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Global setup/teardown for backend server
  // Backend is started once before all tests and stopped after all tests
  globalSetup: require.resolve('./playwright/global-setup.ts'),
  globalTeardown: require.resolve('./playwright/global-teardown.ts'),

  // Auto-start frontend dev server before running tests
  // Backend is handled by globalSetup
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
