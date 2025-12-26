import { describe, it, expect, vi } from "vitest";
import { render, screen } from "../../../test/utils";
import { GridAxes } from "../GridAxes";

describe("GridAxes", () => {
  it("renders Y-axis label by default", () => {
    render(<GridAxes />);

    // Y-axis is rendered (X-axis is rendered separately in NineBoxGrid)
    const yAxis = screen.getByTestId("grid-y-axis");
    expect(yAxis).toBeInTheDocument();
    expect(yAxis).toHaveTextContent("Potential (Low → High)");
  });

  it("renders custom Y-axis label when provided", () => {
    render(<GridAxes yAxisLabel="Custom Potential" />);

    const yAxis = screen.getByTestId("grid-y-axis");
    expect(yAxis).toHaveTextContent("Custom Potential");
  });

  it("hides labels when showLabels is false", () => {
    render(<GridAxes showLabels={false} />);

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
