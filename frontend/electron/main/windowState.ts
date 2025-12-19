import { BrowserWindow, screen, app } from 'electron';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Window bounds configuration
 */
interface WindowBounds {
  x?: number;
  y?: number;
  width: number;
  height: number;
  isMaximized?: boolean;
}

/**
 * Default window configuration
 */
const DEFAULT_BOUNDS: WindowBounds = {
  width: 1400,
  height: 900,
  isMaximized: false,
};

/**
 * Window state manager for persisting window size and position.
 * Automatically saves window bounds when the window is moved or resized,
 * and restores them on the next app launch.
 */
export class WindowStateManager {
  private configPath: string;
  private window: BrowserWindow | null = null;
  private saveTimeoutId: NodeJS.Timeout | null = null;

  constructor() {
    // Store window state in userData directory
    const userDataPath = app.getPath('userData');
    this.configPath = path.join(userDataPath, 'window-state.json');
    console.log('📐 Window state file:', this.configPath);
  }

  /**
   * Load saved window bounds from disk.
   * Returns default bounds if no saved state exists or if saved state is invalid.
   */
  loadBounds(): WindowBounds {
    try {
      if (!fs.existsSync(this.configPath)) {
        console.log('📐 No saved window state, using defaults');
        return DEFAULT_BOUNDS;
      }

      const data = fs.readFileSync(this.configPath, 'utf-8');
      const savedBounds = JSON.parse(data) as WindowBounds;

      // Validate bounds to ensure window is visible on screen
      const validatedBounds = this.validateBounds(savedBounds);
      console.log('📐 Loaded window state:', validatedBounds);
      return validatedBounds;
    } catch (error) {
      console.error('❌ Failed to load window state:', error);
      return DEFAULT_BOUNDS;
    }
  }

  /**
   * Validate window bounds to ensure the window is visible on screen.
   * If the saved position is off-screen (e.g., monitor was disconnected),
   * reset to default position but keep the saved size.
   */
  private validateBounds(bounds: WindowBounds): WindowBounds {
    const displays = screen.getAllDisplays();

    // If position is specified, check if it's visible on any display
    if (bounds.x !== undefined && bounds.y !== undefined) {
      const isVisible = displays.some((display) => {
        const { x, y, width, height } = display.bounds;
        // Check if window's top-left corner is within this display
        // Allow some tolerance for window decorations
        return (
          bounds.x! >= x - 100 &&
          bounds.x! < x + width &&
          bounds.y! >= y - 100 &&
          bounds.y! < y + height
        );
      });

      if (!isVisible) {
        console.log('📐 Saved window position is off-screen, centering window');
        // Keep saved size but remove position (will be centered by Electron)
        return {
          width: bounds.width || DEFAULT_BOUNDS.width,
          height: bounds.height || DEFAULT_BOUNDS.height,
          isMaximized: bounds.isMaximized,
        };
      }
    }

    // Ensure width and height are reasonable
    const width = Math.max(800, Math.min(bounds.width, 4000));
    const height = Math.max(600, Math.min(bounds.height, 3000));

    return {
      x: bounds.x,
      y: bounds.y,
      width,
      height,
      isMaximized: bounds.isMaximized,
    };
  }

  /**
   * Save window bounds to disk.
   * Uses debouncing to avoid excessive writes during window resize/move.
   */
  private saveBounds(): void {
    if (!this.window) {
      return;
    }

    // Debounce saves to avoid excessive writes
    if (this.saveTimeoutId) {
      clearTimeout(this.saveTimeoutId);
    }

    this.saveTimeoutId = setTimeout(() => {
      try {
        const bounds = this.window!.getBounds();
        const isMaximized = this.window!.isMaximized();

        const state: WindowBounds = {
          x: bounds.x,
          y: bounds.y,
          width: bounds.width,
          height: bounds.height,
          isMaximized,
        };

        fs.writeFileSync(this.configPath, JSON.stringify(state, null, 2), 'utf-8');
        console.log('📐 Saved window state:', state);
      } catch (error) {
        console.error('❌ Failed to save window state:', error);
      }
    }, 500); // Debounce for 500ms
  }

  /**
   * Attach event listeners to save window bounds when changed.
   * Call this after creating the BrowserWindow.
   */
  track(window: BrowserWindow): void {
    this.window = window;

    // Save bounds when window is resized or moved
    window.on('resize', () => this.saveBounds());
    window.on('move', () => this.saveBounds());

    // Save maximized state
    window.on('maximize', () => this.saveBounds());
    window.on('unmaximize', () => this.saveBounds());

    // Save one final time when window is about to close
    window.on('close', () => {
      // Clear debounce timeout and save immediately
      if (this.saveTimeoutId) {
        clearTimeout(this.saveTimeoutId);
      }
      this.saveBounds();
    });

    console.log('📐 Window state tracking enabled');
  }

  /**
   * Apply saved bounds to a BrowserWindow configuration.
   * Returns updated options object with restored bounds.
   */
  applyBounds(options: Electron.BrowserWindowConstructorOptions): Electron.BrowserWindowConstructorOptions {
    const bounds = this.loadBounds();

    const result = {
      ...options,
      width: bounds.width,
      height: bounds.height,
    };

    // Only set position if we have saved coordinates
    if (bounds.x !== undefined && bounds.y !== undefined) {
      result.x = bounds.x;
      result.y = bounds.y;
    }

    return result;
  }

  /**
   * Restore maximized state after window is shown.
   * Call this in the 'ready-to-show' event.
   */
  restoreMaximizedState(window: BrowserWindow): void {
    const bounds = this.loadBounds();
    if (bounds.isMaximized) {
      window.maximize();
      console.log('📐 Restored maximized state');
    }
  }
}
