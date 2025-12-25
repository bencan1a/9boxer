/**
 * Zoom Service
 *
 * Manages application-wide zoom levels using Electron's webFrame API.
 * Provides standard browser zoom steps, persistence, and keyboard shortcuts.
 */

// Standard browser zoom levels (matching Chrome/Firefox)
export const ZOOM_LEVELS = [
  0.25, // 25%
  0.33, // 33%
  0.5,  // 50%
  0.67, // 67%
  0.75, // 75%
  0.8,  // 80%
  0.9,  // 90%
  1.0,  // 100% (default)
  1.1,  // 110%
  1.25, // 125%
  1.5,  // 150%
  1.75, // 175%
  2.0,  // 200%
  2.5,  // 250%
  3.0,  // 300%
] as const;

export const DEFAULT_ZOOM_INDEX = ZOOM_LEVELS.indexOf(1.0); // Index of 100%
const STORAGE_KEY = 'app-zoom-level';

/**
 * Get the webFrame API from Electron.
 * Returns null if not running in Electron environment.
 */
function getWebFrame() {
  // In Electron, webFrame is available via require in renderer process
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { webFrame } = require('electron');
    return webFrame;
  } catch {
    // Not in Electron environment (e.g., web mode, tests)
    return null;
  }
}

/**
 * Apply CSS zoom for non-Electron environments.
 * Stores the zoom index in a data attribute for reliable retrieval.
 */
function applyCssZoom(factor: number, index: number): void {
  const root = document.documentElement;
  if (root) {
    // Use CSS zoom property (simpler than transform and works better for layout)
    root.style.zoom = factor.toString();
    // Store index in data attribute for reliable retrieval
    root.setAttribute('data-zoom-index', index.toString());
  }
}

/**
 * Get zoom index from DOM (fallback mode).
 */
function getFallbackZoomIndex(): number {
  const root = document.documentElement;
  if (root) {
    const stored = root.getAttribute('data-zoom-index');
    if (stored !== null) {
      const index = parseInt(stored, 10);
      if (!isNaN(index) && index >= 0 && index < ZOOM_LEVELS.length) {
        return index;
      }
    }
  }
  return DEFAULT_ZOOM_INDEX;
}

/**
 * Get current zoom level index.
 * Returns the index in ZOOM_LEVELS array.
 */
export function getCurrentZoomIndex(): number {
  const webFrame = getWebFrame();
  if (!webFrame) {
    // Fallback for non-Electron: read from DOM
    return getFallbackZoomIndex();
  }

  const currentFactor = webFrame.getZoomFactor();

  // Find the closest matching zoom level
  let closestIndex = DEFAULT_ZOOM_INDEX;
  let smallestDiff = Math.abs(ZOOM_LEVELS[closestIndex] - currentFactor);

  for (let i = 0; i < ZOOM_LEVELS.length; i++) {
    const diff = Math.abs(ZOOM_LEVELS[i] - currentFactor);
    if (diff < smallestDiff) {
      smallestDiff = diff;
      closestIndex = i;
    }
  }

  return closestIndex;
}

/**
 * Set zoom level by index.
 * @param index - Index in ZOOM_LEVELS array
 * @returns The zoom factor that was set
 */
export function setZoomByIndex(index: number): number {
  const clampedIndex = Math.max(0, Math.min(ZOOM_LEVELS.length - 1, index));
  const zoomFactor = ZOOM_LEVELS[clampedIndex];

  const webFrame = getWebFrame();
  if (webFrame) {
    // Electron mode: use webFrame API
    webFrame.setZoomFactor(zoomFactor);
  } else {
    // Fallback for non-Electron: use CSS zoom and store in DOM
    applyCssZoom(zoomFactor, clampedIndex);
  }

  return zoomFactor;
}

/**
 * Zoom in to the next level.
 * @returns The new zoom factor
 */
export function zoomIn(): number {
  const currentIndex = getCurrentZoomIndex();
  const newIndex = Math.min(ZOOM_LEVELS.length - 1, currentIndex + 1);
  return setZoomByIndex(newIndex);
}

/**
 * Zoom out to the previous level.
 * @returns The new zoom factor
 */
export function zoomOut(): number {
  const currentIndex = getCurrentZoomIndex();
  const newIndex = Math.max(0, currentIndex - 1);
  return setZoomByIndex(newIndex);
}

/**
 * Reset zoom to 100%.
 * @returns The default zoom factor (1.0)
 */
export function resetZoom(): number {
  return setZoomByIndex(DEFAULT_ZOOM_INDEX);
}

/**
 * Get current zoom percentage as a string (e.g., "125%").
 */
export function getCurrentZoomPercentage(): string {
  const index = getCurrentZoomIndex();
  const factor = ZOOM_LEVELS[index];
  return `${Math.round(factor * 100)}%`;
}

/**
 * Save current zoom level to localStorage.
 */
export function saveZoomLevel(): void {
  const index = getCurrentZoomIndex();
  try {
    localStorage.setItem(STORAGE_KEY, index.toString());
  } catch (error) {
    console.warn('[ZoomService] Failed to save zoom level:', error);
  }
}

/**
 * Load and apply saved zoom level from localStorage.
 * Should be called on app initialization.
 */
export function loadSavedZoom(): void {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved !== null) {
      const index = parseInt(saved, 10);
      if (!isNaN(index) && index >= 0 && index < ZOOM_LEVELS.length) {
        setZoomByIndex(index);
        console.log(`[ZoomService] Restored zoom level: ${getCurrentZoomPercentage()}`);
      }
    }
  } catch (error) {
    console.warn('[ZoomService] Failed to load saved zoom level:', error);
  }
}

/**
 * Check if zoom in is possible (not at max zoom).
 */
export function canZoomIn(): boolean {
  return getCurrentZoomIndex() < ZOOM_LEVELS.length - 1;
}

/**
 * Check if zoom out is possible (not at min zoom).
 */
export function canZoomOut(): boolean {
  return getCurrentZoomIndex() > 0;
}

/**
 * Check if currently at default zoom (100%).
 */
export function isAtDefaultZoom(): boolean {
  return getCurrentZoomIndex() === DEFAULT_ZOOM_INDEX;
}
