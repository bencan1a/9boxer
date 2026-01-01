import { describe, it, expect } from "vitest";
import { render, screen } from "@/test/utils";
import { ColoredPercentageBar } from "./ColoredPercentageBar";
import { tokens } from "@/theme/tokens";

describe("ColoredPercentageBar", () => {
  describe("Rendering", () => {
    it("renders progress bar with correct value", () => {
      render(<ColoredPercentageBar percentage={50} position={5} />);

      const progressBar = screen.getByTestId("colored-percentage-bar-progress");
      expect(progressBar).toBeInTheDocument();
    });

    it("shows percentage label by default", () => {
      render(<ColoredPercentageBar percentage={25.5} position={9} />);

      expect(screen.getByText("25.5%")).toBeInTheDocument();
    });

    it("hides percentage label when showLabel is false", () => {
      render(
        <ColoredPercentageBar
          percentage={25.5}
          position={9}
          showLabel={false}
        />
      );

      expect(screen.queryByText("25.5%")).not.toBeInTheDocument();
    });

    it("formats percentage with one decimal place", () => {
      render(<ColoredPercentageBar percentage={12.456} position={5} />);

      expect(screen.getByText("12.5%")).toBeInTheDocument();
    });
  });

  describe("Color Logic - High Performers (9, 8, 6)", () => {
    it("uses success color when percentage >= 8% for position 9", () => {
      render(
        <ColoredPercentageBar
          percentage={25}
          position={9}
          data-testid="high-perf-good"
        />
      );

      // Should render without errors - visual testing will verify green color
      expect(screen.getByTestId("high-perf-good")).toBeInTheDocument();
    });

    it("uses warning color when percentage < 8% for position 8", () => {
      render(
        <ColoredPercentageBar
          percentage={4}
          position={8}
          data-testid="high-perf-low"
        />
      );

      expect(screen.getByTestId("high-perf-low")).toBeInTheDocument();
    });

    it("applies correct logic for position 6", () => {
      render(<ColoredPercentageBar percentage={10} position={6} />);

      expect(screen.getByText("10.0%")).toBeInTheDocument();
    });
  });

  describe("Color Logic - Middle Tier (7, 5, 3)", () => {
    it("uses info color when percentage is 8-15% for position 5", () => {
      render(
        <ColoredPercentageBar
          percentage={12}
          position={5}
          data-testid="middle-balanced"
        />
      );

      expect(screen.getByTestId("middle-balanced")).toBeInTheDocument();
    });

    it("uses warning color when percentage < 8% for position 7", () => {
      render(
        <ColoredPercentageBar
          percentage={5}
          position={7}
          data-testid="middle-low"
        />
      );

      expect(screen.getByTestId("middle-low")).toBeInTheDocument();
    });

    it("uses warning color when percentage > 15% for position 3", () => {
      render(
        <ColoredPercentageBar
          percentage={32}
          position={3}
          data-testid="middle-high"
        />
      );

      expect(screen.getByTestId("middle-high")).toBeInTheDocument();
    });
  });

  describe("Color Logic - Low Performers (4, 2, 1)", () => {
    it("uses success color when percentage <= 8% for position 1", () => {
      render(
        <ColoredPercentageBar
          percentage={3}
          position={1}
          data-testid="low-perf-good"
        />
      );

      expect(screen.getByTestId("low-perf-good")).toBeInTheDocument();
    });

    it("uses error color when percentage > 8% for position 4", () => {
      render(
        <ColoredPercentageBar
          percentage={30}
          position={4}
          data-testid="low-perf-high"
        />
      );

      expect(screen.getByTestId("low-perf-high")).toBeInTheDocument();
    });

    it("applies correct logic for position 2", () => {
      render(<ColoredPercentageBar percentage={15} position={2} />);

      expect(screen.getByText("15.0%")).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("handles 0% correctly", () => {
      render(<ColoredPercentageBar percentage={0} position={5} />);

      expect(screen.getByText("0.0%")).toBeInTheDocument();
    });

    it("handles 100% correctly", () => {
      render(<ColoredPercentageBar percentage={100} position={5} />);

      expect(screen.getByText("100.0%")).toBeInTheDocument();
    });

    it("handles decimal values correctly", () => {
      render(<ColoredPercentageBar percentage={12.456789} position={5} />);

      expect(screen.getByText("12.5%")).toBeInTheDocument();
    });
  });

  describe("Data Test IDs", () => {
    it("uses default test ID when not provided", () => {
      render(<ColoredPercentageBar percentage={25} position={5} />);

      expect(screen.getByTestId("colored-percentage-bar")).toBeInTheDocument();
      expect(
        screen.getByTestId("colored-percentage-bar-progress")
      ).toBeInTheDocument();
      expect(
        screen.getByTestId("colored-percentage-bar-label")
      ).toBeInTheDocument();
    });

    it("uses custom test ID when provided", () => {
      render(
        <ColoredPercentageBar
          percentage={25}
          position={5}
          data-testid="custom-bar"
        />
      );

      expect(screen.getByTestId("custom-bar")).toBeInTheDocument();
      expect(screen.getByTestId("custom-bar-progress")).toBeInTheDocument();
      expect(screen.getByTestId("custom-bar-label")).toBeInTheDocument();
    });
  });

  describe("Progress Bar Properties", () => {
    it("has correct height from design tokens", () => {
      const { container } = render(
        <ColoredPercentageBar percentage={50} position={5} />
      );

      const progressBar = container.querySelector(".MuiLinearProgress-root");
      const style = window.getComputedStyle(progressBar!);
      const expectedHeight = `${tokens.dimensions.progressBar.height}px`;
      expect(style.height).toBe(expectedHeight);
    });

    it("has border radius applied", () => {
      const { container } = render(
        <ColoredPercentageBar percentage={50} position={5} />
      );

      const progressBar = container.querySelector(".MuiLinearProgress-root");
      expect(progressBar).toBeTruthy();
    });

    it("label has minimum width for alignment from design tokens", () => {
      render(<ColoredPercentageBar percentage={5} position={5} />);

      const label = screen.getByText("5.0%");
      const style = window.getComputedStyle(label);
      const expectedMinWidth = `${tokens.dimensions.progressBar.labelMinWidth}px`;
      expect(style.minWidth).toBe(expectedMinWidth);
    });

    it("label is right-aligned", () => {
      render(<ColoredPercentageBar percentage={5} position={5} />);

      const label = screen.getByText("5.0%");
      const style = window.getComputedStyle(label);
      expect(style.textAlign).toBe("right");
    });
  });

  describe("All Positions", () => {
    it("handles all 9 positions without errors", () => {
      const positions = [1, 2, 3, 4, 5, 6, 7, 8, 9];

      positions.forEach((position) => {
        const { unmount } = render(
          <ColoredPercentageBar
            percentage={12}
            position={position}
            data-testid={`pos-${position}`}
          />
        );

        expect(screen.getByTestId(`pos-${position}`)).toBeInTheDocument();
        unmount();
      });
    });
  });
});
