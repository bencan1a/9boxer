/**
 * Grid Zoom Context
 *
 * Single source of truth for grid zoom state management.
 * Provides zoom level management for the grid view with 5 discrete levels (0-4),
 * including localStorage persistence and design tokens.
 *
 * Zoom Levels:
 * - Level 0: Ultra Compact (48%) - Maximum information density
 * - Level 1: Compact (60%) - Very dense view
 * - Level 2: Normal (80%) - Default view
 * - Level 3: Comfortable (125%) - Slightly larger than normal
 * - Level 4: Presentation (150%) - Maximum visibility from distance
 */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import { tokens } from "../theme/tokens";

// Type for the zoom level tokens
interface ZoomTokens {
  tile: { minWidth: number; maxWidth: number; padding: number };
  font: { name: string; titleLevel: string; metadata: string };
  icon: { dragHandle: number; flag: number; history: number };
  spacing: { gap: number; flagGap: number };
}

interface GridZoomContextType {
  /** Current zoom level (0-4) */
  level: number;

  /** Design tokens for current zoom level */
  tokens: ZoomTokens;

  /** Current zoom percentage as string (e.g., "100%") */
  percentage: string;

  /** Set zoom level (0-4) */
  setLevel: (level: number) => void;

  /** Zoom in (level + 1, max 4) */
  zoomIn: () => void;

  /** Zoom out (level - 1, min 0) */
  zoomOut: () => void;

  /** Reset to normal (level 2) */
  resetZoom: () => void;

  /** Check if can zoom in (not at max) */
  canZoomIn: boolean;

  /** Check if can zoom out (not at min) */
  canZoomOut: boolean;

  /** Check if at default zoom (level 2) */
  isAtDefault: boolean;

  /** Whether the panel is currently being resized */
  isResizing: boolean;

  /** Set the resizing state */
  setIsResizing: (isResizing: boolean) => void;
}

const GridZoomContext = createContext<GridZoomContextType | undefined>(
  undefined
);

// Constants
const MIN_LEVEL = 0;
const MAX_LEVEL = 4;
const DEFAULT_LEVEL = 2; // Normal (80%)
const STORAGE_KEY = "app-zoom-level";
const ZOOM_PERCENTAGES = ["48%", "60%", "80%", "125%", "150%"];

/**
 * Get design tokens for a specific zoom level
 */
function getTokensForLevel(level: number): ZoomTokens {
  const levelKey = `level${level}` as
    | "level0"
    | "level1"
    | "level2"
    | "level3"
    | "level4";

  return tokens.dimensions.gridZoom[levelKey];
}

/**
 * Load saved zoom level from localStorage
 */
function loadSavedZoomLevel(): number {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved !== null) {
      const index = parseInt(saved, 10);
      if (!isNaN(index) && index >= MIN_LEVEL && index <= MAX_LEVEL) {
        return index;
      }
    }
  } catch (error) {
    console.warn("[GridZoomContext] Failed to load saved zoom level:", error);
  }
  return DEFAULT_LEVEL;
}

/**
 * Save zoom level to localStorage
 */
function saveZoomLevel(level: number): void {
  try {
    localStorage.setItem(STORAGE_KEY, level.toString());
  } catch (error) {
    console.warn("[GridZoomContext] Failed to save zoom level:", error);
  }
}

/**
 * GridZoomProvider Component
 *
 * Single source of truth for grid zoom state.
 * Handles state management, persistence, and design tokens.
 */
export const GridZoomProvider: React.FC<{
  children: React.ReactNode;
  isResizing?: boolean;
  setIsResizing?: (isResizing: boolean) => void;
}> = ({
  children,
  isResizing: externalIsResizing = false,
  setIsResizing: externalSetIsResizing,
}) => {
  // Initialize from localStorage
  const [level, setLevelState] = useState<number>(() => loadSavedZoomLevel());

  // Internal isResizing state (used if not provided externally)
  const [internalIsResizing, setInternalIsResizing] = useState(false);

  // Use external state if parent is managing it (setter provided), otherwise use internal state
  const isResizing = externalSetIsResizing
    ? externalIsResizing
    : internalIsResizing;
  const setIsResizing = externalSetIsResizing || setInternalIsResizing;

  // Memoize the tokens for the current level
  const currentTokens = useMemo(() => getTokensForLevel(level), [level]);

  // Compute derived values
  const percentage = useMemo(() => ZOOM_PERCENTAGES[level], [level]);
  const canZoomInValue = useMemo(() => level < MAX_LEVEL, [level]);
  const canZoomOutValue = useMemo(() => level > MIN_LEVEL, [level]);
  const isAtDefaultValue = useMemo(() => level === DEFAULT_LEVEL, [level]);

  /**
   * Set zoom level with bounds checking and persistence
   */
  const setLevel = useCallback((newLevel: number) => {
    const clampedLevel = Math.max(MIN_LEVEL, Math.min(MAX_LEVEL, newLevel));
    setLevelState(clampedLevel);
    saveZoomLevel(clampedLevel);
  }, []);

  /**
   * Zoom in to the next level (max 4)
   */
  const zoomIn = useCallback(() => {
    setLevel(Math.min(MAX_LEVEL, level + 1));
  }, [level, setLevel]);

  /**
   * Zoom out to the previous level (min 0)
   */
  const zoomOut = useCallback(() => {
    setLevel(Math.max(MIN_LEVEL, level - 1));
  }, [level, setLevel]);

  /**
   * Reset to normal zoom (level 2)
   */
  const resetZoom = useCallback(() => {
    setLevel(DEFAULT_LEVEL);
  }, [setLevel]);

  const value = useMemo(
    () => ({
      level,
      tokens: currentTokens,
      percentage,
      setLevel,
      zoomIn,
      zoomOut,
      resetZoom,
      canZoomIn: canZoomInValue,
      canZoomOut: canZoomOutValue,
      isAtDefault: isAtDefaultValue,
      isResizing,
      setIsResizing,
    }),
    [
      level,
      currentTokens,
      percentage,
      setLevel,
      zoomIn,
      zoomOut,
      resetZoom,
      canZoomInValue,
      canZoomOutValue,
      isAtDefaultValue,
      isResizing,
      setIsResizing,
    ]
  );

  return (
    <GridZoomContext.Provider value={value}>
      {children}
    </GridZoomContext.Provider>
  );
};

/**
 * useGridZoom Hook
 *
 * Custom hook to access grid zoom state and controls.
 * Must be used within a GridZoomProvider.
 *
 * @throws Error if used outside GridZoomProvider
 *
 * @example
 * ```tsx
 * const { level, tokens, setLevel, zoomIn, zoomOut, resetZoom } = useGridZoom();
 * ```
 */
// eslint-disable-next-line react-refresh/only-export-components
export const useGridZoom = (): GridZoomContextType => {
  const context = useContext(GridZoomContext);
  if (!context) {
    throw new Error("useGridZoom must be used within a GridZoomProvider");
  }
  return context;
};
