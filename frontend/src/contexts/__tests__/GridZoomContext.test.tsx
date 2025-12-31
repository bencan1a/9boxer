import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, renderHook, act } from "../../test/utils";
import { GridZoomProvider, useGridZoom } from "../GridZoomContext";
import { tokens } from "../../theme/tokens";
import React from "react";

describe("GridZoomContext", () => {
  // Mock localStorage
  const localStorageMock = (() => {
    let store: Record<string, string> = {};

    return {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => {
        store[key] = value.toString();
      },
      clear: () => {
        store = {};
      },
    };
  })();

  beforeEach(() => {
    // Setup localStorage mock
    Object.defineProperty(window, "localStorage", {
      value: localStorageMock,
      writable: true,
    });
    localStorageMock.clear();
  });

  afterEach(() => {
    localStorageMock.clear();
  });

  describe("GridZoomProvider", () => {
    it("provides correct initial values (level 2 - Normal)", () => {
      const { result } = renderHook(() => useGridZoom(), {
        wrapper: GridZoomProvider,
      });

      expect(result.current.level).toBe(2);
      expect(result.current.tokens).toEqual(tokens.dimensions.gridZoom.level2);
    });

    it("provides all required functions", () => {
      const { result } = renderHook(() => useGridZoom(), {
        wrapper: GridZoomProvider,
      });

      expect(typeof result.current.setLevel).toBe("function");
      expect(typeof result.current.zoomIn).toBe("function");
      expect(typeof result.current.zoomOut).toBe("function");
      expect(typeof result.current.resetZoom).toBe("function");
    });
  });

  describe("setLevel", () => {
    it("updates level and tokens when setLevel is called", () => {
      const { result } = renderHook(() => useGridZoom(), {
        wrapper: GridZoomProvider,
      });

      act(() => {
        result.current.setLevel(4);
      });

      expect(result.current.level).toBe(4);
      expect(result.current.tokens).toEqual(tokens.dimensions.gridZoom.level4);
    });

    it("clamps level to minimum (0)", () => {
      const { result } = renderHook(() => useGridZoom(), {
        wrapper: GridZoomProvider,
      });

      act(() => {
        result.current.setLevel(-5);
      });

      expect(result.current.level).toBe(0);
      expect(result.current.tokens).toEqual(tokens.dimensions.gridZoom.level0);
    });

    it("clamps level to maximum (4)", () => {
      const { result } = renderHook(() => useGridZoom(), {
        wrapper: GridZoomProvider,
      });

      act(() => {
        result.current.setLevel(10);
      });

      expect(result.current.level).toBe(4);
      expect(result.current.tokens).toEqual(tokens.dimensions.gridZoom.level4);
    });

    it("updates tokens correctly for all valid levels", () => {
      const { result } = renderHook(() => useGridZoom(), {
        wrapper: GridZoomProvider,
      });

      // Test level 0
      act(() => {
        result.current.setLevel(0);
      });
      expect(result.current.level).toBe(0);
      expect(result.current.tokens).toEqual(tokens.dimensions.gridZoom.level0);

      // Test level 1
      act(() => {
        result.current.setLevel(1);
      });
      expect(result.current.level).toBe(1);
      expect(result.current.tokens).toEqual(tokens.dimensions.gridZoom.level1);

      // Test level 2
      act(() => {
        result.current.setLevel(2);
      });
      expect(result.current.level).toBe(2);
      expect(result.current.tokens).toEqual(tokens.dimensions.gridZoom.level2);

      // Test level 3
      act(() => {
        result.current.setLevel(3);
      });
      expect(result.current.level).toBe(3);
      expect(result.current.tokens).toEqual(tokens.dimensions.gridZoom.level3);

      // Test level 4
      act(() => {
        result.current.setLevel(4);
      });
      expect(result.current.level).toBe(4);
      expect(result.current.tokens).toEqual(tokens.dimensions.gridZoom.level4);
    });
  });

  describe("zoomIn", () => {
    it("increases level by 1", () => {
      const { result } = renderHook(() => useGridZoom(), {
        wrapper: GridZoomProvider,
      });

      // Start at level 2 (default)
      expect(result.current.level).toBe(2);

      act(() => {
        result.current.zoomIn();
      });

      expect(result.current.level).toBe(3);
      expect(result.current.tokens).toEqual(tokens.dimensions.gridZoom.level3);
    });

    it("does not exceed maximum level (4)", () => {
      const { result } = renderHook(() => useGridZoom(), {
        wrapper: GridZoomProvider,
      });

      // Set to max level
      act(() => {
        result.current.setLevel(4);
      });

      expect(result.current.level).toBe(4);

      // Try to zoom in further
      act(() => {
        result.current.zoomIn();
      });

      // Should stay at max
      expect(result.current.level).toBe(4);
    });

    it("can zoom in multiple times", () => {
      const { result } = renderHook(() => useGridZoom(), {
        wrapper: GridZoomProvider,
      });

      // Start at level 0
      act(() => {
        result.current.setLevel(0);
      });

      // Zoom in 3 times (each in separate act for state updates)
      act(() => {
        result.current.zoomIn();
      });
      act(() => {
        result.current.zoomIn();
      });
      act(() => {
        result.current.zoomIn();
      });

      expect(result.current.level).toBe(3);
    });
  });

  describe("zoomOut", () => {
    it("decreases level by 1", () => {
      const { result } = renderHook(() => useGridZoom(), {
        wrapper: GridZoomProvider,
      });

      // Start at level 2 (default)
      expect(result.current.level).toBe(2);

      act(() => {
        result.current.zoomOut();
      });

      expect(result.current.level).toBe(1);
      expect(result.current.tokens).toEqual(tokens.dimensions.gridZoom.level1);
    });

    it("does not go below minimum level (0)", () => {
      const { result } = renderHook(() => useGridZoom(), {
        wrapper: GridZoomProvider,
      });

      // Set to min level
      act(() => {
        result.current.setLevel(0);
      });

      expect(result.current.level).toBe(0);

      // Try to zoom out further
      act(() => {
        result.current.zoomOut();
      });

      // Should stay at min
      expect(result.current.level).toBe(0);
    });

    it("can zoom out multiple times", () => {
      const { result } = renderHook(() => useGridZoom(), {
        wrapper: GridZoomProvider,
      });

      // Start at level 4
      act(() => {
        result.current.setLevel(4);
      });

      // Zoom out 3 times (each in separate act for state updates)
      act(() => {
        result.current.zoomOut();
      });
      act(() => {
        result.current.zoomOut();
      });
      act(() => {
        result.current.zoomOut();
      });

      expect(result.current.level).toBe(1);
    });
  });

  describe("resetZoom", () => {
    it("resets to level 2 (Normal) from higher level", () => {
      const { result } = renderHook(() => useGridZoom(), {
        wrapper: GridZoomProvider,
      });

      // Set to high level
      act(() => {
        result.current.setLevel(4);
      });

      expect(result.current.level).toBe(4);

      // Reset
      act(() => {
        result.current.resetZoom();
      });

      expect(result.current.level).toBe(2);
      expect(result.current.tokens).toEqual(tokens.dimensions.gridZoom.level2);
    });

    it("resets to level 2 (Normal) from lower level", () => {
      const { result } = renderHook(() => useGridZoom(), {
        wrapper: GridZoomProvider,
      });

      // Set to low level
      act(() => {
        result.current.setLevel(0);
      });

      expect(result.current.level).toBe(0);

      // Reset
      act(() => {
        result.current.resetZoom();
      });

      expect(result.current.level).toBe(2);
      expect(result.current.tokens).toEqual(tokens.dimensions.gridZoom.level2);
    });

    it("stays at level 2 when already at default", () => {
      const { result } = renderHook(() => useGridZoom(), {
        wrapper: GridZoomProvider,
      });

      // Already at default level 2
      expect(result.current.level).toBe(2);

      // Reset
      act(() => {
        result.current.resetZoom();
      });

      // Should still be at 2
      expect(result.current.level).toBe(2);
    });
  });

  describe("useGridZoom hook", () => {
    it("throws error when used outside provider", () => {
      // Suppress console.error for this test
      const originalError = console.error;
      console.error = () => {};

      expect(() => {
        renderHook(() => useGridZoom());
      }).toThrow("useGridZoom must be used within a GridZoomProvider");

      console.error = originalError;
    });

    it("works correctly when used inside provider", () => {
      const { result } = renderHook(() => useGridZoom(), {
        wrapper: GridZoomProvider,
      });

      expect(result.current).toBeDefined();
      expect(result.current.level).toBe(2);
      expect(result.current.tokens).toBeDefined();
    });
  });

  describe("token structure", () => {
    it("provides tokens with correct structure", () => {
      const { result } = renderHook(() => useGridZoom(), {
        wrapper: GridZoomProvider,
      });

      const { tokens } = result.current;

      // Verify token structure
      expect(tokens).toHaveProperty("tile");
      expect(tokens.tile).toHaveProperty("minWidth");
      expect(tokens.tile).toHaveProperty("maxWidth");
      expect(tokens.tile).toHaveProperty("padding");

      expect(tokens).toHaveProperty("font");
      expect(tokens.font).toHaveProperty("name");
      expect(tokens.font).toHaveProperty("titleLevel");
      expect(tokens.font).toHaveProperty("metadata");

      expect(tokens).toHaveProperty("icon");
      expect(tokens.icon).toHaveProperty("dragHandle");
      expect(tokens.icon).toHaveProperty("flag");
      expect(tokens.icon).toHaveProperty("history");

      expect(tokens).toHaveProperty("spacing");
      expect(tokens.spacing).toHaveProperty("gap");
      expect(tokens.spacing).toHaveProperty("flagGap");
    });

    it("provides numeric values for tile dimensions", () => {
      const { result } = renderHook(() => useGridZoom(), {
        wrapper: GridZoomProvider,
      });

      const { tokens } = result.current;

      expect(typeof tokens.tile.minWidth).toBe("number");
      expect(typeof tokens.tile.maxWidth).toBe("number");
      expect(typeof tokens.tile.padding).toBe("number");
    });

    it("provides string values for font sizes", () => {
      const { result } = renderHook(() => useGridZoom(), {
        wrapper: GridZoomProvider,
      });

      const { tokens } = result.current;

      expect(typeof tokens.font.name).toBe("string");
      expect(typeof tokens.font.titleLevel).toBe("string");
      expect(typeof tokens.font.metadata).toBe("string");
    });

    it("provides numeric values for icon sizes", () => {
      const { result } = renderHook(() => useGridZoom(), {
        wrapper: GridZoomProvider,
      });

      const { tokens } = result.current;

      expect(typeof tokens.icon.dragHandle).toBe("number");
      expect(typeof tokens.icon.flag).toBe("number");
      expect(typeof tokens.icon.history).toBe("number");
    });
  });

  describe("component integration", () => {
    it("can be consumed by child components", () => {
      const TestComponent = () => {
        const { level, tokens } = useGridZoom();
        return (
          <div>
            <span data-testid="level">{level}</span>
            <span data-testid="min-width">{tokens.tile.minWidth}</span>
          </div>
        );
      };

      render(
        <GridZoomProvider>
          <TestComponent />
        </GridZoomProvider>
      );

      expect(screen.getByTestId("level")).toHaveTextContent("2");
      expect(screen.getByTestId("min-width")).toHaveTextContent("200"); // New level 2 is 80% of 250
    });

    it("updates child components when level changes", () => {
      const TestComponent = () => {
        const { level, tokens, zoomIn } = useGridZoom();
        return (
          <div>
            <span data-testid="level">{level}</span>
            <span data-testid="min-width">{tokens.tile.minWidth}</span>
            <button onClick={zoomIn} data-testid="zoom-button">
              Zoom In
            </button>
          </div>
        );
      };

      render(
        <GridZoomProvider>
          <TestComponent />
        </GridZoomProvider>
      );

      // Initial state
      expect(screen.getByTestId("level")).toHaveTextContent("2");
      expect(screen.getByTestId("min-width")).toHaveTextContent("200"); // New level 2 is 80% of 250

      // Zoom in
      act(() => {
        screen.getByTestId("zoom-button").click();
      });

      // Updated state
      expect(screen.getByTestId("level")).toHaveTextContent("3");
      expect(screen.getByTestId("min-width")).toHaveTextContent("313"); // New level 3 is 125% of 250
    });
  });
});
