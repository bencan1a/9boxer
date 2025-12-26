/**
 * Tests for ViewControls component
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "../../../test/utils";
import { ViewControls } from "../ViewControls";
import { useSessionStore } from "../../../store/sessionStore";
import * as zoomService from "../../../services/zoomService";

// Mock session store with default state
const mockToggleDonutMode = vi.fn();
let mockSessionState = {
  sessionId: "test-session",
  donutModeActive: false,
  toggleDonutMode: mockToggleDonutMode,
};

vi.mock("../../../store/sessionStore", () => ({
  useSessionStore: (selector?: any) => {
    if (selector) {
      return selector(mockSessionState);
    }
    return mockSessionState;
  },
}));

// Mock the zoom service
vi.mock("../../../services/zoomService", () => ({
  zoomIn: vi.fn(),
  zoomOut: vi.fn(),
  resetZoom: vi.fn(),
  getCurrentZoomPercentage: vi.fn(() => "100%"),
  canZoomIn: vi.fn(() => true),
  canZoomOut: vi.fn(() => true),
  isAtDefaultZoom: vi.fn(() => true),
  saveZoomLevel: vi.fn(),
  loadSavedZoom: vi.fn(),
}));

describe("ViewControls", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Reset to default session state
    mockSessionState = {
      sessionId: "test-session",
      donutModeActive: false,
      toggleDonutMode: mockToggleDonutMode,
    };

    // Mock fullscreen API
    Object.defineProperty(document, "fullscreenElement", {
      writable: true,
      value: null,
    });
    document.documentElement.requestFullscreen = vi.fn(() => Promise.resolve());
    document.exitFullscreen = vi.fn(() => Promise.resolve());
  });

  it("renders all control groups when session exists", () => {
    render(<ViewControls />);

    // View mode toggle buttons
    expect(screen.getByTestId("view-mode-toggle")).toBeInTheDocument();
    expect(screen.getByTestId("grid-view-button")).toBeInTheDocument();
    expect(screen.getByTestId("donut-view-button")).toBeInTheDocument();

    // Zoom controls
    expect(screen.getByTestId("zoom-out-button")).toBeInTheDocument();
    expect(screen.getByTestId("zoom-reset-button")).toBeInTheDocument();
    expect(screen.getByTestId("zoom-in-button")).toBeInTheDocument();
    expect(screen.getByTestId("zoom-percentage")).toBeInTheDocument();

    // Fullscreen toggle
    expect(screen.getByTestId("fullscreen-toggle-button")).toBeInTheDocument();
  });

  it("displays current zoom percentage", () => {
    render(<ViewControls />);

    const percentageDisplay = screen.getByTestId("zoom-percentage");
    expect(percentageDisplay).toHaveTextContent("100%");
  });

  it("calls zoomIn when zoom in button is clicked", () => {
    render(<ViewControls />);

    const zoomInButton = screen.getByTestId("zoom-in-button");
    fireEvent.click(zoomInButton);

    expect(zoomService.zoomIn).toHaveBeenCalledTimes(1);
  });

  it("calls zoomOut when zoom out button is clicked", () => {
    render(<ViewControls />);

    const zoomOutButton = screen.getByTestId("zoom-out-button");
    fireEvent.click(zoomOutButton);

    expect(zoomService.zoomOut).toHaveBeenCalledTimes(1);
  });

  it("calls resetZoom when reset button is clicked", () => {
    // Mock isAtDefaultZoom to return false so button is enabled
    (zoomService.isAtDefaultZoom as any).mockReturnValue(false);

    render(<ViewControls />);

    const resetButton = screen.getByTestId("zoom-reset-button");
    fireEvent.click(resetButton);

    expect(zoomService.resetZoom).toHaveBeenCalled();
  });

  it("toggles view mode when grid button is clicked", async () => {
    mockSessionState = {
      sessionId: "test-session",
      donutModeActive: true,
      toggleDonutMode: mockToggleDonutMode,
    };

    render(<ViewControls />);

    const gridButton = screen.getByTestId("grid-view-button");
    fireEvent.click(gridButton);

    expect(mockToggleDonutMode).toHaveBeenCalledWith(false);
  });

  it("toggles view mode when donut button is clicked", async () => {
    render(<ViewControls />);

    const donutButton = screen.getByTestId("donut-view-button");
    fireEvent.click(donutButton);

    expect(mockToggleDonutMode).toHaveBeenCalledWith(true);
  });

  it("shows grid view as active when donutModeActive is false", () => {
    render(<ViewControls />);

    const gridButton = screen.getByTestId("grid-view-button");
    expect(gridButton).toHaveAttribute("aria-pressed", "true");

    const donutButton = screen.getByTestId("donut-view-button");
    expect(donutButton).toHaveAttribute("aria-pressed", "false");
  });

  it("shows donut view as active when donutModeActive is true", () => {
    mockSessionState = {
      sessionId: "test-session",
      donutModeActive: true,
      toggleDonutMode: mockToggleDonutMode,
    };

    render(<ViewControls />);

    const gridButton = screen.getByTestId("grid-view-button");
    expect(gridButton).toHaveAttribute("aria-pressed", "false");

    const donutButton = screen.getByTestId("donut-view-button");
    expect(donutButton).toHaveAttribute("aria-pressed", "true");
  });

  it("calls requestFullscreen when fullscreen button is clicked", () => {
    render(<ViewControls />);

    const fullscreenButton = screen.getByTestId("fullscreen-toggle-button");
    fireEvent.click(fullscreenButton);

    expect(document.documentElement.requestFullscreen).toHaveBeenCalledTimes(1);
  });

  it("calls exitFullscreen when fullscreen button is clicked while in fullscreen", () => {
    // Mock being in fullscreen
    Object.defineProperty(document, "fullscreenElement", {
      writable: true,
      value: document.documentElement,
    });

    render(<ViewControls />);

    const fullscreenButton = screen.getByTestId("fullscreen-toggle-button");
    fireEvent.click(fullscreenButton);

    expect(document.exitFullscreen).toHaveBeenCalledTimes(1);
  });

  it("disables zoom out button when canZoomOut is false", () => {
    (zoomService.canZoomOut as any).mockReturnValue(false);

    render(<ViewControls />);

    const zoomOutButton = screen.getByTestId("zoom-out-button");
    expect(zoomOutButton).toBeDisabled();
  });

  it("disables zoom in button when canZoomIn is false", () => {
    (zoomService.canZoomIn as any).mockReturnValue(false);

    render(<ViewControls />);

    const zoomInButton = screen.getByTestId("zoom-in-button");
    expect(zoomInButton).toBeDisabled();
  });

  it("disables reset button when at default zoom", () => {
    (zoomService.isAtDefaultZoom as any).mockReturnValue(true);

    render(<ViewControls />);

    const resetButton = screen.getByTestId("zoom-reset-button");
    expect(resetButton).toBeDisabled();
  });

  it("disables view mode toggle when no session exists", () => {
    mockSessionState = {
      sessionId: null,
      donutModeActive: false,
      toggleDonutMode: mockToggleDonutMode,
    };

    render(<ViewControls />);

    const toggleGroup = screen.getByTestId("view-mode-toggle");
    const buttons = toggleGroup.querySelectorAll("button");
    // All buttons should be disabled when sessionId is null
    buttons.forEach((button) => {
      expect(button).toBeDisabled();
    });
  });

  it("renders normally on larger screens", () => {
    // Default test rendering is for larger screens
    const { container } = render(<ViewControls />);
    const viewControls = container.querySelector(
      '[data-testid="view-controls"]'
    );
    expect(viewControls).toBeInTheDocument();
  });

  it("has correct ARIA labels for accessibility", () => {
    render(<ViewControls />);

    const viewModeToggle = screen.getByTestId("view-mode-toggle");
    expect(viewModeToggle).toHaveAttribute("aria-label");

    const gridButton = screen.getByTestId("grid-view-button");
    expect(gridButton).toHaveAttribute("aria-label");

    const donutButton = screen.getByTestId("donut-view-button");
    expect(donutButton).toHaveAttribute("aria-label");
  });

  it("is positioned absolutely for floating behavior", () => {
    const { container } = render(<ViewControls />);

    const viewControls = container.querySelector(
      '[data-testid="view-controls"]'
    );
    expect(viewControls).toHaveStyle({ position: "absolute" });
  });
});
