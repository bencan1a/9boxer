import { describe, it, expect } from "vitest";
import { render, screen } from "../../../test/utils";
import { GridAxes } from "../GridAxes";

describe("GridAxes", () => {
  it("renders both X and Y axis labels by default", () => {
    render(<GridAxes />);

    // X-axis is rendered
    const xAxis = screen.getByTestId("grid-x-axis");
    expect(xAxis).toBeInTheDocument();
    expect(xAxis).toHaveTextContent("Performance (Low → High)");

    // Y-axis is rendered
    const yAxis = screen.getByTestId("grid-y-axis");
    expect(yAxis).toBeInTheDocument();
    expect(yAxis).toHaveTextContent("Potential (Low → High)");
  });

  it("renders custom X-axis label when provided", () => {
    render(<GridAxes xAxisLabel="Custom Performance" />);

    const xAxis = screen.getByTestId("grid-x-axis");
    expect(xAxis).toHaveTextContent("Custom Performance");
  });

  it("renders custom Y-axis label when provided", () => {
    render(<GridAxes yAxisLabel="Custom Potential" />);

    const yAxis = screen.getByTestId("grid-y-axis");
    expect(yAxis).toHaveTextContent("Custom Potential");
  });

  it("hides labels when showLabels is false", () => {
    render(<GridAxes showLabels={false} />);

    const xAxis = screen.queryByTestId("grid-x-axis");
    expect(xAxis).not.toBeInTheDocument();

    const yAxis = screen.queryByTestId("grid-y-axis");
    expect(yAxis).not.toBeInTheDocument();
  });

  it("applies correct vertical text styling to Y-axis", () => {
    render(<GridAxes />);

    const yAxis = screen.getByTestId("grid-y-axis");
    expect(yAxis).toHaveStyle({
      writingMode: "vertical-rl",
      transform: "rotate(180deg)",
    });
  });

  it("has correct width for Y-axis container", () => {
    render(<GridAxes />);

    const yAxis = screen.getByTestId("grid-y-axis");
    const styles = window.getComputedStyle(yAxis);
    expect(styles.width).toBe("80px");
  });
});
