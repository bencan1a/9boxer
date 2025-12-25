import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for Visual Regression Testing
 * Separate config for visual tests to run against Storybook
 * See https://playwright.dev/docs/test-snapshots
 */
export default defineConfig({
  testDir: './playwright/visual',

  // Timeout for visual tests (Storybook can be slow to start)
  timeout: 30000,

  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,

  // Retry on CI to handle flaky renders
  retries: process.env.CI ? 2 : 0,

  // Run visual tests sequentially for consistency
  workers: 1,

  // Reporter to use
  reporter: [
    ['html', { outputFolder: 'playwright-report-visual' }],
    ['list'],
  ],

  use: {
    // Base URL for Storybook
    baseURL: 'http://localhost:6006',

    // Consistent viewport for visual tests
    viewport: { width: 1280, height: 720 },

    // Longer action timeout for Storybook loading
    actionTimeout: 15000,

    // Always capture trace for visual tests (helpful for debugging diffs)
    trace: 'on',

    // Always capture screenshot on failure to see what went wrong
    screenshot: 'only-on-failure',

    // Video not needed for visual tests (snapshots are the point)
    video: 'off',
  },

  // Test against Chromium only for consistent visual baselines
  // Can add more browsers later if needed
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // Force consistent rendering
        deviceScaleFactor: 1,
        hasTouch: false,
      },
    },
  ],

  // Storybook dev server must be running
  // We don't auto-start it because it's typically already running during development
  // For CI, we'll start it in the GitHub Actions workflow
  webServer: process.env.CI
    ? {
        command: 'npm run storybook',
        url: 'http://localhost:6006',
        reuseExistingServer: false,
        timeout: 120000,
      }
    : undefined,

  // Visual comparison configuration
  expect: {
    toHaveScreenshot: {
      // Allow small differences for anti-aliasing and font rendering variations
      maxDiffPixels: 100,
      maxDiffPixelRatio: 0.01, // 1% difference allowed

      // Consistent screenshot settings
      animations: 'disabled',
      scale: 'css',
    },
  },
});
