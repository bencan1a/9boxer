/**
 * Zoom Service
 *
 * Manages application-wide grid zoom levels using discrete zoom level indices.
 * Provides 5 zoom levels (60%, 80%, 100%, 125%, 150%), persistence, and keyboard shortcuts.
 */

import { tokens } from "../theme/tokens";

// Grid zoom levels (5 discrete levels, 0-4)
// Level 0: Compact (60%) - Maximum information density
// Level 1: Comfortable- (80%) - Slightly smaller than normal
// Level 2: Normal (100%) - Default view
// Level 3: Comfortable+ (125%) - Slightly larger than normal
// Level 4: Presentation (150%) - Maximum visibility from distance
export const ZOOM_LEVELS = [0, 1, 2, 3, 4] as const;

export const DEFAULT_ZOOM_LEVEL = 2; // Normal (100%)
const STORAGE_KEY = "app-zoom-level";

// Track current zoom level
let currentZoomLevel = DEFAULT_ZOOM_LEVEL;

/**
 * Get the current grid zoom level index (0-4)
 */
export function getGridZoomLevel(): number {
  return currentZoomLevel;
}

/**
 * Get the design tokens for the current zoom level
 */
export function getGridZoomTokens() {
  return tokens.dimensions.gridZoom[
    `level${currentZoomLevel}` as keyof typeof tokens.dimensions.gridZoom
  ];
}

/**
 * Get current zoom level index.
 * Returns the index in ZOOM_LEVELS array (0-4).
 */
export function getCurrentZoomIndex(): number {
  return currentZoomLevel;
}

/**
 * Set zoom level by index.
 * @param index - Index in ZOOM_LEVELS array (0-4)
 * @returns The zoom level index that was set
 */
export function setZoomByIndex(index: number): number {
  const clampedIndex = Math.max(0, Math.min(ZOOM_LEVELS.length - 1, index));
  currentZoomLevel = clampedIndex;
  return clampedIndex;
}

/**
 * Zoom in to the next level.
 * @returns The new zoom level index
 */
export function zoomIn(): number {
  const currentIndex = getCurrentZoomIndex();
  const newIndex = Math.min(ZOOM_LEVELS.length - 1, currentIndex + 1);
  return setZoomByIndex(newIndex);
}

/**
 * Zoom out to the previous level.
 * @returns The new zoom level index
 */
export function zoomOut(): number {
  const currentIndex = getCurrentZoomIndex();
  const newIndex = Math.max(0, currentIndex - 1);
  return setZoomByIndex(newIndex);
}

/**
 * Reset zoom to 100% (level 2).
 * @returns The default zoom level index (2)
 */
export function resetZoom(): number {
  return setZoomByIndex(DEFAULT_ZOOM_LEVEL);
}

/**
 * Get current zoom percentage as a string (e.g., "125%").
 * Maps zoom levels to their percentage values.
 */
export function getCurrentZoomPercentage(): string {
  const percentages = ["60%", "80%", "100%", "125%", "150%"];
  return percentages[currentZoomLevel];
}

/**
 * Save current zoom level to localStorage.
 */
export function saveZoomLevel(): void {
  const index = getCurrentZoomIndex();
  try {
    localStorage.setItem(STORAGE_KEY, index.toString());
  } catch (error) {
    console.warn("[ZoomService] Failed to save zoom level:", error);
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
        console.log(
          `[ZoomService] Restored zoom level: ${getCurrentZoomPercentage()}`
        );
      }
    }
  } catch (error) {
    console.warn("[ZoomService] Failed to load saved zoom level:", error);
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
 * Check if currently at default zoom (100% - level 2).
 */
export function isAtDefaultZoom(): boolean {
  return getCurrentZoomIndex() === DEFAULT_ZOOM_LEVEL;
}
