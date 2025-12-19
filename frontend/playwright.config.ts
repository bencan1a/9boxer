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

  // Auto-start both backend and frontend dev servers before running tests
  webServer: [
    {
      // Backend API server
      // In CI, use system Python; locally use venv
      command: process.env.CI
        ? 'python -m uvicorn ninebox.main:app --reload'
        : process.platform === 'win32'
          ? '..\\.venv\\Scripts\\python.exe -m uvicorn ninebox.main:app --reload'
          : '../.venv/bin/python -m uvicorn ninebox.main:app --reload',
      url: 'http://localhost:8000/health',
      reuseExistingServer: !process.env.CI,
      timeout: 120000,
      cwd: '../backend',  // Run from backend directory
    },
    {
      // Frontend Vite dev server
      command: 'npm run dev',
      url: 'http://localhost:5173',
      reuseExistingServer: !process.env.CI,
      timeout: 120000,
    },
  ],
});
