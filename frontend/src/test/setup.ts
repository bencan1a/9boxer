import "@testing-library/jest-dom";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Mock ResizeObserver for components that use charts (Recharts)
// Enhanced to provide mock dimensions to prevent Recharts warnings about 0x0 containers
global.ResizeObserver = class ResizeObserver {
  constructor(callback: ResizeObserverCallback) {
    // Immediately trigger callback with mock dimensions in next tick
    // This simulates the browser measuring the container
    setTimeout(() => {
      callback(
        [
          {
            target: document.body,
            contentRect: {
              width: 800,
              height: 400,
              top: 0,
              left: 0,
              bottom: 400,
              right: 800,
              x: 0,
              y: 0,
            } as DOMRectReadOnly,
            borderBoxSize: [] as ResizeObserverSize[],
            contentBoxSize: [] as ResizeObserverSize[],
            devicePixelContentBoxSize: [] as ResizeObserverSize[],
          } as ResizeObserverEntry,
        ],
        this
      );
    }, 0);
  }

  observe() {}
  unobserve() {}
  disconnect() {}
};

// Cleanup after each test
afterEach(() => {
  cleanup();
});
