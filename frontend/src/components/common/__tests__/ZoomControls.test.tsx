import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "../../../test/utils";
import { ZoomControls } from "../ZoomControls";

describe("ZoomControls", () => {
  beforeEach(() => {
    // Mock fullscreen API
    Object.defineProperty(document, "fullscreenElement", {
      writable: true,
      value: null,
      configurable: true,
    });
    document.exitFullscreen = vi.fn().mockResolvedValue(undefined);
    document.documentElement.requestFullscreen = vi
      .fn()
      .mockResolvedValue(undefined);

    // Mock localStorage
    const localStorageMock = {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
      clear: vi.fn(),
    };
    Object.defineProperty(window, "localStorage", {
      value: localStorageMock,
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders zoom controls with all buttons", () => {
    render(<ZoomControls />);

    expect(screen.getByTestId("zoom-controls")).toBeInTheDocument();
    expect(screen.getByTestId("zoom-in-button")).toBeInTheDocument();
    expect(screen.getByTestId("zoom-out-button")).toBeInTheDocument();
    expect(screen.getByTestId("zoom-reset-button")).toBeInTheDocument();
    expect(screen.getByTestId("fullscreen-toggle-button")).toBeInTheDocument();
  });

  it("displays current zoom percentage (default is 100%)", () => {
    render(<ZoomControls />);

    expect(screen.getByTestId("zoom-percentage")).toHaveTextContent("100%");
  });

  it("increases zoom percentage when zoom in button is clicked", () => {
    render(<ZoomControls />);

    const zoomInButton = screen.getByTestId("zoom-in-button");
    fireEvent.click(zoomInButton);

    // Should go from 100% to 125%
    expect(screen.getByTestId("zoom-percentage")).toHaveTextContent("125%");
  });

  it("decreases zoom percentage when zoom out button is clicked", () => {
    render(<ZoomControls />);

    const zoomOutButton = screen.getByTestId("zoom-out-button");
    fireEvent.click(zoomOutButton);

    // Should go from 100% to 75%
    expect(screen.getByTestId("zoom-percentage")).toHaveTextContent("75%");
  });

  it("resets zoom to 100% when reset button is clicked", () => {
    render(<ZoomControls />);

    // First zoom in
    const zoomInButton = screen.getByTestId("zoom-in-button");
    fireEvent.click(zoomInButton);
    expect(screen.getByTestId("zoom-percentage")).toHaveTextContent("125%");

    // Then reset
    const resetButton = screen.getByTestId("zoom-reset-button");
    fireEvent.click(resetButton);
    expect(screen.getByTestId("zoom-percentage")).toHaveTextContent("100%");
  });

  it("disables zoom out button at minimum zoom", () => {
    render(<ZoomControls />);

    // Zoom out to minimum
    const zoomOutButton = screen.getByTestId("zoom-out-button");
    fireEvent.click(zoomOutButton); // 100% -> 75%
    fireEvent.click(zoomOutButton); // 75% -> 50%

    expect(screen.getByTestId("zoom-percentage")).toHaveTextContent("50%");

    // Zoom out button should be disabled
    expect(zoomOutButton).toBeDisabled();
  });

  it("disables zoom in button at maximum zoom", () => {
    render(<ZoomControls />);

    // Zoom in to maximum
    const zoomInButton = screen.getByTestId("zoom-in-button");
    fireEvent.click(zoomInButton); // 100% -> 125%
    fireEvent.click(zoomInButton); // 125% -> 150%

    expect(screen.getByTestId("zoom-percentage")).toHaveTextContent("150%");

    // Zoom in button should be disabled
    expect(zoomInButton).toBeDisabled();
  });

  it("disables reset button when at default zoom", () => {
    render(<ZoomControls />);

    const resetButton = screen.getByTestId("zoom-reset-button");

    // Should be disabled at default (100%)
    expect(resetButton).toBeDisabled();

    // Zoom in
    const zoomInButton = screen.getByTestId("zoom-in-button");
    fireEvent.click(zoomInButton);

    // Should be enabled now
    expect(resetButton).not.toBeDisabled();
  });

  it("enables reset button when not at default zoom", () => {
    render(<ZoomControls />);

    // Zoom in to non-default level
    const zoomInButton = screen.getByTestId("zoom-in-button");
    fireEvent.click(zoomInButton);

    const resetButton = screen.getByTestId("zoom-reset-button");
    expect(resetButton).not.toBeDisabled();
  });

  it("requests fullscreen when fullscreen button is clicked", () => {
    render(<ZoomControls />);

    const fullscreenButton = screen.getByTestId("fullscreen-toggle-button");
    fireEvent.click(fullscreenButton);

    expect(document.documentElement.requestFullscreen).toHaveBeenCalledTimes(1);
  });

  it("exits fullscreen when fullscreen button is clicked while in fullscreen", async () => {
    // Simulate fullscreen mode
    Object.defineProperty(document, "fullscreenElement", {
      writable: true,
      value: document.documentElement,
      configurable: true,
    });

    render(<ZoomControls />);

    // Trigger fullscreenchange event
    fireEvent(document, new Event("fullscreenchange"));

    const fullscreenButton = screen.getByTestId("fullscreen-toggle-button");
    fireEvent.click(fullscreenButton);

    expect(document.exitFullscreen).toHaveBeenCalledTimes(1);
  });

  it("hides controls on small screens", () => {
    // Mock window.matchMedia to simulate small screen
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: query === "(max-width:599.95px)", // Simulate small screen
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    const { container } = render(<ZoomControls />);

    // Component should not render
    expect(container.firstChild).toBeNull();
  });
});
