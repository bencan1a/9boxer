import { describe, it, expect } from "vitest";
import { render, screen } from "../../../test/utils";
import { Axis } from "../Axis";
import { tokens } from "../../../theme/tokens";

describe("Axis", () => {
  describe("horizontal orientation", () => {
    it("renders horizontal axis with default label", () => {
      render(<Axis orientation="horizontal" />);

      const axis = screen.getByTestId("grid-axis-horizontal");
      expect(axis).toBeInTheDocument();
      expect(axis).toHaveTextContent("Performance (Low → High)");
    });

    it("renders horizontal axis with custom label", () => {
      render(<Axis orientation="horizontal" label="Results" />);

      const axis = screen.getByTestId("grid-axis-horizontal");
      expect(axis).toHaveTextContent("Results");
    });

    it("applies correct horizontal layout styles", () => {
      render(<Axis orientation="horizontal" />);

      const axis = screen.getByTestId("grid-axis-horizontal");
      const styles = window.getComputedStyle(axis);

      expect(styles.display).toBe("flex");
      expect(styles.alignItems).toBe("center");
      expect(styles.justifyContent).toBe("center");
    });
  });

  describe("vertical orientation", () => {
    it("renders vertical axis with default label", () => {
      render(<Axis orientation="vertical" />);

      const axis = screen.getByTestId("grid-axis-vertical");
      expect(axis).toBeInTheDocument();
      expect(axis).toHaveTextContent("Potential (Low → High)");
    });

    it("renders vertical axis with custom label", () => {
      render(<Axis orientation="vertical" label="Capability" />);

      const axis = screen.getByTestId("grid-axis-vertical");
      expect(axis).toHaveTextContent("Capability");
    });

    it("applies correct vertical layout styles", () => {
      render(<Axis orientation="vertical" />);

      const axis = screen.getByTestId("grid-axis-vertical");
      const styles = window.getComputedStyle(axis);

      // Use design token for vertical axis width
      const expectedWidth = `${tokens.dimensions.axis.verticalWidth}px`;
      expect(styles.width).toBe(expectedWidth);
      expect(styles.writingMode).toBe("vertical-rl");
      expect(styles.transform).toBe("rotate(180deg)");
    });
  });

  describe("visibility control", () => {
    it("hides horizontal axis when showLabel is false", () => {
      render(<Axis orientation="horizontal" showLabel={false} />);

      const axis = screen.queryByTestId("grid-axis-horizontal");
      expect(axis).not.toBeInTheDocument();
    });

    it("hides vertical axis when showLabel is false", () => {
      render(<Axis orientation="vertical" showLabel={false} />);

      const axis = screen.queryByTestId("grid-axis-vertical");
      expect(axis).not.toBeInTheDocument();
    });

    it("shows axis by default when showLabel is not provided", () => {
      render(<Axis orientation="horizontal" />);

      const axis = screen.getByTestId("grid-axis-horizontal");
      expect(axis).toBeInTheDocument();
    });
  });

  describe("custom labels", () => {
    it("accepts custom label for horizontal axis", () => {
      render(
        <Axis orientation="horizontal" label="Custom Performance Metric" />
      );

      expect(screen.getByText("Custom Performance Metric")).toBeInTheDocument();
    });

    it("accepts custom label for vertical axis", () => {
      render(<Axis orientation="vertical" label="Growth Potential" />);

      expect(screen.getByText("Growth Potential")).toBeInTheDocument();
    });

    it("prefers custom label over i18n default", () => {
      render(<Axis orientation="horizontal" label="Override" />);

      expect(screen.getByText("Override")).toBeInTheDocument();
      expect(
        screen.queryByText("Performance (Low → High)")
      ).not.toBeInTheDocument();
    });
  });
});
