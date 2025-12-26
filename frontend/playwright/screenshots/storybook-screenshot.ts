/**
 * Storybook Screenshot Utilities
 *
 * Provides utilities for capturing documentation screenshots from Storybook stories.
 * This is faster, more reliable, and easier to maintain than full-app screenshots
 * for component-level documentation.
 *
 * Benefits:
 * - 10x faster than full app (no app startup, navigation, or state setup)
 * - 100% reliable (isolated, no flakiness from app state)
 * - Single source of truth (same stories for dev, testing, and docs)
 * - Auto theme support (light/dark mode screenshots automatically)
 *
 * Usage:
 *   import { captureStorybookScreenshot } from './storybook-screenshot';
 *
 *   export async function generateEmployeeTile(page: Page, outputPath: string) {
 *     await captureStorybookScreenshot(page, {
 *       storyId: 'grid-employeetile--modified',
 *       outputPath,
 *       theme: 'light',
 *     });
 *   }
 */

import { Page } from "@playwright/test";
import * as path from "path";
import * as fs from "fs";

export interface StorybookScreenshotOptions {
  /** Story ID in format 'component-name--story-name' (e.g., 'grid-employeetile--default') */
  storyId: string;
  /** Absolute path where screenshot should be saved */
  outputPath: string;
  /** Theme to use (defaults to 'light') */
  theme?: "light" | "dark";
  /** Whether to capture full page or just story container (defaults to false - just container) */
  fullPage?: boolean;
  /** CSS selector to screenshot (defaults to '#storybook-root' - the story container) */
  selector?: string;
  /** Wait time in ms after story loads before screenshot (defaults to 500ms) */
  waitTime?: number;
}

/**
 * Storybook server manager
 *
 * Manages starting/stopping Storybook server for screenshot generation.
 * Separate from main ServerManager because Storybook runs on different port.
 */
export class StorybookServerManager {
  private static instance: StorybookServerManager | null = null;
  private storybookProcess: any = null;
  private readonly storybookPort = 6006;
  private isReady = false;

  private constructor() {}

  /**
   * Get singleton instance
   */
  static getInstance(): StorybookServerManager {
    if (!StorybookServerManager.instance) {
      StorybookServerManager.instance = new StorybookServerManager();
    }
    return StorybookServerManager.instance;
  }

  /**
   * Start Storybook server if not already running
   */
  async start(): Promise<void> {
    if (this.isReady) {
      return;
    }

    // Check if Storybook is already running (reuse existing server)
    if (await this.isStorybookRunning()) {
      console.log("Storybook already running, reusing existing server");
      this.isReady = true;
      return;
    }

    console.log("Starting Storybook server...");

    const { spawn } = await import("child_process");
    const frontendDir = path.resolve(__dirname, "../..");

    this.storybookProcess = spawn("npm", ["run", "storybook"], {
      cwd: frontendDir,
      stdio: "pipe",
      shell: true,
    });

    this.storybookProcess.stdout?.on("data", (data: Buffer) => {
      const message = data.toString().trim();
      if (message.includes("Storybook")) {
        console.log(`[Storybook] ${message}`);
      }
    });

    this.storybookProcess.stderr?.on("data", (data: Buffer) => {
      // Storybook outputs to stderr, not necessarily errors
      const message = data.toString().trim();
      if (message.includes("Local:") || message.includes("Network:")) {
        console.log(`[Storybook] ${message}`);
      }
    });

    // Wait for Storybook to be ready
    await this.waitForServer(60000);
    this.isReady = true;
    console.log("Storybook server ready");
  }

  /**
   * Check if Storybook is already running
   */
  private async isStorybookRunning(): Promise<boolean> {
    try {
      const http = await import("http");
      await new Promise<void>((resolve, reject) => {
        http
          .get(
            `http://localhost:${this.storybookPort}`,
            { timeout: 2000 },
            (res) => {
              resolve();
            }
          )
          .on("error", reject)
          .on("timeout", () => reject(new Error("timeout")));
      });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Wait for Storybook server to be ready
   */
  private async waitForServer(timeout: number): Promise<void> {
    const startTime = Date.now();
    const http = await import("http");

    while (Date.now() - startTime < timeout) {
      try {
        await new Promise<void>((resolve, reject) => {
          http
            .get(
              `http://localhost:${this.storybookPort}`,
              { timeout: 5000 },
              (res) => {
                if (res.statusCode === 200) {
                  resolve();
                } else {
                  reject(new Error(`Server returned ${res.statusCode}`));
                }
              }
            )
            .on("error", reject)
            .on("timeout", () => reject(new Error("Request timeout")));
        });
        return; // Success
      } catch {
        // Server not ready yet, wait and retry
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }

    throw new Error(
      `Storybook server did not become ready within ${timeout}ms`
    );
  }

  /**
   * Stop Storybook server
   */
  async stop(): Promise<void> {
    if (this.storybookProcess) {
      console.log("Stopping Storybook server...");
      this.storybookProcess.kill();
      this.storybookProcess = null;
      this.isReady = false;
      console.log("Storybook server stopped");
    }
  }
}

/**
 * Navigate to a Storybook story in iframe mode (component only, no UI chrome)
 *
 * @param page - Playwright page object
 * @param storyId - Story ID in format 'component-name--story-name'
 * @param theme - Optional theme override ('light' or 'dark')
 */
export async function navigateToStory(
  page: Page,
  storyId: string,
  theme?: "light" | "dark"
): Promise<void> {
  const baseUrl = "http://localhost:6006/iframe.html";
  const themeParam = theme ? `&globals=theme:${theme}` : "";
  const url = `${baseUrl}?id=${storyId}&viewMode=story${themeParam}`;

  await page.goto(url, { waitUntil: "networkidle" });

  // Wait for Storybook to render the component
  await page.waitForSelector("#storybook-root", {
    state: "visible",
    timeout: 10000,
  });

  // Additional wait to ensure all animations/transitions complete
  await page.waitForTimeout(500);
}

/**
 * Capture a screenshot from a Storybook story
 *
 * This is the main function for generating documentation screenshots from Storybook.
 * It handles navigation, waiting, and capturing with sensible defaults.
 *
 * @param page - Playwright page object
 * @param options - Screenshot options
 *
 * @example
 * ```typescript
 * // Capture employee tile in light mode
 * await captureStorybookScreenshot(page, {
 *   storyId: 'grid-employeetile--modified',
 *   outputPath: '/path/to/employee-tile-modified.png',
 *   theme: 'light',
 * });
 *
 * // Capture full dialog (larger container)
 * await captureStorybookScreenshot(page, {
 *   storyId: 'settings-settingsdialog--default',
 *   outputPath: '/path/to/settings-dialog.png',
 *   fullPage: true,
 * });
 * ```
 */
export async function captureStorybookScreenshot(
  page: Page,
  options: StorybookScreenshotOptions
): Promise<void> {
  const {
    storyId,
    outputPath,
    theme = "light",
    fullPage = false,
    selector = "#storybook-root",
    waitTime = 500,
  } = options;

  // Ensure Storybook server is running
  const serverManager = StorybookServerManager.getInstance();
  await serverManager.start();

  // Navigate to the story
  await navigateToStory(page, storyId, theme);

  // Additional wait if specified
  if (waitTime > 0) {
    await page.waitForTimeout(waitTime);
  }

  // Ensure output directory exists
  const outputDir = path.dirname(outputPath);
  fs.mkdirSync(outputDir, { recursive: true });

  // Take screenshot
  if (fullPage) {
    await page.screenshot({ path: outputPath, fullPage: true });
  } else {
    const element = await page.locator(selector);
    await element.screenshot({ path: outputPath });
  }

  console.log(`  ✓ Captured from Storybook: ${storyId} (${theme} theme)`);
}

/**
 * Capture both light and dark theme versions of a story
 *
 * Convenience function to generate both theme variants in one call.
 *
 * @param page - Playwright page object
 * @param storyId - Story ID to capture
 * @param basePath - Base output path (will add -light/-dark suffix)
 * @param options - Additional screenshot options
 *
 * @example
 * ```typescript
 * await captureStorybookScreenshotBothThemes(
 *   page,
 *   'grid-employeetile--modified',
 *   '/path/to/employee-tile-modified.png'
 * );
 * // Creates:
 * //   /path/to/employee-tile-modified-light.png
 * //   /path/to/employee-tile-modified-dark.png
 * ```
 */
export async function captureStorybookScreenshotBothThemes(
  page: Page,
  storyId: string,
  basePath: string,
  options?: Omit<StorybookScreenshotOptions, "storyId" | "outputPath" | "theme">
): Promise<void> {
  // Generate paths for light and dark versions
  const ext = path.extname(basePath);
  const basePathWithoutExt = basePath.slice(0, -ext.length);

  const lightPath = `${basePathWithoutExt}-light${ext}`;
  const darkPath = `${basePathWithoutExt}-dark${ext}`;

  // Capture light theme
  await captureStorybookScreenshot(page, {
    storyId,
    outputPath: lightPath,
    theme: "light",
    ...options,
  });

  // Capture dark theme
  await captureStorybookScreenshot(page, {
    storyId,
    outputPath: darkPath,
    theme: "dark",
    ...options,
  });
}
