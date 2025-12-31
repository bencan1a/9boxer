import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  ZOOM_LEVELS,
  DEFAULT_ZOOM_LEVEL,
  getCurrentZoomIndex,
  setZoomByIndex,
  zoomIn,
  zoomOut,
  resetZoom,
  getCurrentZoomPercentage,
  canZoomIn,
  canZoomOut,
  isAtDefaultZoom,
  getGridZoomLevel,
  getGridZoomTokens,
  saveZoomLevel,
  loadSavedZoom,
} from "../zoomService";
import { tokens } from "../../theme/tokens";

describe("zoomService", () => {
  beforeEach(() => {
    // Reset to default before each test
    setZoomByIndex(DEFAULT_ZOOM_LEVEL);
    // Clear localStorage
    localStorage.clear();
  });

  describe("Constants", () => {
    it("exports correct ZOOM_LEVELS array", () => {
      expect(ZOOM_LEVELS).toEqual([0, 1, 2, 3, 4]);
    });

    it("exports correct DEFAULT_ZOOM_LEVEL", () => {
      expect(DEFAULT_ZOOM_LEVEL).toBe(2);
    });
  });

  describe("getCurrentZoomIndex", () => {
    it("returns default zoom level (2) initially", () => {
      expect(getCurrentZoomIndex()).toBe(2);
    });

    it("returns updated zoom level after change", () => {
      setZoomByIndex(3);
      expect(getCurrentZoomIndex()).toBe(3);
    });
  });

  describe("getGridZoomLevel", () => {
    it("returns default zoom level (2) initially", () => {
      expect(getGridZoomLevel()).toBe(2);
    });

    it("returns updated zoom level after change", () => {
      setZoomByIndex(4);
      expect(getGridZoomLevel()).toBe(4);
    });
  });

  describe("getGridZoomTokens", () => {
    it("returns level2 tokens initially", () => {
      expect(getGridZoomTokens()).toEqual(tokens.dimensions.gridZoom.level2);
    });

    it("returns correct tokens for level 0", () => {
      setZoomByIndex(0);
      expect(getGridZoomTokens()).toEqual(tokens.dimensions.gridZoom.level0);
    });

    it("returns correct tokens for level 4", () => {
      setZoomByIndex(4);
      expect(getGridZoomTokens()).toEqual(tokens.dimensions.gridZoom.level4);
    });

    it("returns tokens with correct structure", () => {
      const tokens = getGridZoomTokens();
      expect(tokens).toHaveProperty("tile");
      expect(tokens).toHaveProperty("font");
      expect(tokens).toHaveProperty("icon");
      expect(tokens).toHaveProperty("spacing");
    });
  });

  describe("setZoomByIndex", () => {
    it("sets zoom level within valid range", () => {
      setZoomByIndex(3);
      expect(getCurrentZoomIndex()).toBe(3);
    });

    it("clamps to minimum (0) when given negative value", () => {
      setZoomByIndex(-5);
      expect(getCurrentZoomIndex()).toBe(0);
    });

    it("clamps to maximum (4) when given too large value", () => {
      setZoomByIndex(10);
      expect(getCurrentZoomIndex()).toBe(4);
    });

    it("returns the clamped index", () => {
      expect(setZoomByIndex(3)).toBe(3);
      expect(setZoomByIndex(-1)).toBe(0);
      expect(setZoomByIndex(10)).toBe(4);
    });
  });

  describe("zoomIn", () => {
    it("increases zoom level by 1 from default", () => {
      const result = zoomIn();
      expect(result).toBe(3);
      expect(getCurrentZoomIndex()).toBe(3);
    });

    it("does not exceed maximum level (4)", () => {
      setZoomByIndex(4);
      const result = zoomIn();
      expect(result).toBe(4);
      expect(getCurrentZoomIndex()).toBe(4);
    });

    it("can zoom in multiple times", () => {
      setZoomByIndex(0);
      zoomIn();
      zoomIn();
      expect(getCurrentZoomIndex()).toBe(2);
    });
  });

  describe("zoomOut", () => {
    it("decreases zoom level by 1 from default", () => {
      const result = zoomOut();
      expect(result).toBe(1);
      expect(getCurrentZoomIndex()).toBe(1);
    });

    it("does not go below minimum level (0)", () => {
      setZoomByIndex(0);
      const result = zoomOut();
      expect(result).toBe(0);
      expect(getCurrentZoomIndex()).toBe(0);
    });

    it("can zoom out multiple times", () => {
      setZoomByIndex(4);
      zoomOut();
      zoomOut();
      expect(getCurrentZoomIndex()).toBe(2);
    });
  });

  describe("resetZoom", () => {
    it("resets to default level (2) from higher level", () => {
      setZoomByIndex(4);
      const result = resetZoom();
      expect(result).toBe(2);
      expect(getCurrentZoomIndex()).toBe(2);
    });

    it("resets to default level (2) from lower level", () => {
      setZoomByIndex(0);
      const result = resetZoom();
      expect(result).toBe(2);
      expect(getCurrentZoomIndex()).toBe(2);
    });

    it("stays at default when already at default", () => {
      setZoomByIndex(2);
      const result = resetZoom();
      expect(result).toBe(2);
      expect(getCurrentZoomIndex()).toBe(2);
    });
  });

  describe("getCurrentZoomPercentage", () => {
    it("returns correct percentages for each level", () => {
      const expected = ["60%", "80%", "100%", "125%", "150%"];

      for (let level = 0; level <= 4; level++) {
        setZoomByIndex(level);
        expect(getCurrentZoomPercentage()).toBe(expected[level]);
      }
    });

    it("returns 100% for default level", () => {
      setZoomByIndex(DEFAULT_ZOOM_LEVEL);
      expect(getCurrentZoomPercentage()).toBe("100%");
    });
  });

  describe("canZoomIn", () => {
    it("returns true when not at maximum", () => {
      setZoomByIndex(0);
      expect(canZoomIn()).toBe(true);

      setZoomByIndex(2);
      expect(canZoomIn()).toBe(true);

      setZoomByIndex(3);
      expect(canZoomIn()).toBe(true);
    });

    it("returns false when at maximum level (4)", () => {
      setZoomByIndex(4);
      expect(canZoomIn()).toBe(false);
    });
  });

  describe("canZoomOut", () => {
    it("returns true when not at minimum", () => {
      setZoomByIndex(1);
      expect(canZoomOut()).toBe(true);

      setZoomByIndex(2);
      expect(canZoomOut()).toBe(true);

      setZoomByIndex(4);
      expect(canZoomOut()).toBe(true);
    });

    it("returns false when at minimum level (0)", () => {
      setZoomByIndex(0);
      expect(canZoomOut()).toBe(false);
    });
  });

  describe("isAtDefaultZoom", () => {
    it("returns true when at default level (2)", () => {
      setZoomByIndex(2);
      expect(isAtDefaultZoom()).toBe(true);
    });

    it("returns false when not at default level", () => {
      setZoomByIndex(0);
      expect(isAtDefaultZoom()).toBe(false);

      setZoomByIndex(1);
      expect(isAtDefaultZoom()).toBe(false);

      setZoomByIndex(3);
      expect(isAtDefaultZoom()).toBe(false);

      setZoomByIndex(4);
      expect(isAtDefaultZoom()).toBe(false);
    });
  });

  describe("localStorage persistence", () => {
    it("saves current zoom level to localStorage", () => {
      setZoomByIndex(3);
      saveZoomLevel();

      expect(localStorage.getItem("app-zoom-level")).toBe("3");
    });

    it("loads saved zoom level from localStorage", () => {
      localStorage.setItem("app-zoom-level", "4");
      loadSavedZoom();

      expect(getCurrentZoomIndex()).toBe(4);
    });

    it("handles missing localStorage data gracefully", () => {
      localStorage.clear();
      loadSavedZoom();

      // Should stay at current level (default)
      expect(getCurrentZoomIndex()).toBe(2);
    });

    it("handles invalid localStorage data", () => {
      localStorage.setItem("app-zoom-level", "invalid");
      const initialLevel = getCurrentZoomIndex();
      loadSavedZoom();

      // Should stay at current level
      expect(getCurrentZoomIndex()).toBe(initialLevel);
    });

    it("handles out-of-range localStorage data", () => {
      localStorage.setItem("app-zoom-level", "10");
      const initialLevel = getCurrentZoomIndex();
      loadSavedZoom();

      // Should stay at current level
      expect(getCurrentZoomIndex()).toBe(initialLevel);
    });

    it("handles negative localStorage data", () => {
      localStorage.setItem("app-zoom-level", "-5");
      const initialLevel = getCurrentZoomIndex();
      loadSavedZoom();

      // Should stay at current level
      expect(getCurrentZoomIndex()).toBe(initialLevel);
    });
  });

  describe("Zoom level boundaries", () => {
    it("respects minimum boundary across all operations", () => {
      setZoomByIndex(0);
      expect(getCurrentZoomIndex()).toBe(0);

      zoomOut(); // Should not go below 0
      expect(getCurrentZoomIndex()).toBe(0);
    });

    it("respects maximum boundary across all operations", () => {
      setZoomByIndex(4);
      expect(getCurrentZoomIndex()).toBe(4);

      zoomIn(); // Should not go above 4
      expect(getCurrentZoomIndex()).toBe(4);
    });
  });
});
