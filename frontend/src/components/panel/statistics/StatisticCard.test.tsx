import { describe, it, expect } from "vitest";
import { render, screen } from "@/test/utils";
import { StatisticCard } from "./StatisticCard";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";

describe("StatisticCard", () => {
  it("renders value and label when provided", () => {
    render(<StatisticCard value={125} label="Total Employees" />);

    expect(screen.getByText("125")).toBeInTheDocument();
    expect(screen.getByText("Total Employees")).toBeInTheDocument();
  });

  it("formats numeric values with commas when value is large", () => {
    render(<StatisticCard value={1234} label="Large Number" />);

    // Should display "1,234" not "1234"
    expect(screen.getByText("1,234")).toBeInTheDocument();
  });

  it("displays string values without formatting", () => {
    render(<StatisticCard value="N/A" label="String Value" />);

    expect(screen.getByText("N/A")).toBeInTheDocument();
  });

  it("applies correct color theme to value typography", () => {
    render(
      <StatisticCard
        value={42}
        label="High Performers"
        color="success"
        data-testid="success-card"
      />
    );

    const valueElement = screen.getByTestId("success-card-value");
    expect(valueElement).toHaveClass("MuiTypography-root");
  });

  it("renders icon when provided", () => {
    render(
      <StatisticCard
        value={100}
        label="With Icon"
        icon={<TrendingUpIcon data-testid="trending-icon" />}
      />
    );

    expect(screen.getByTestId("trending-icon")).toBeInTheDocument();
  });

  it("does not render icon when not provided", () => {
    const { container } = render(<StatisticCard value={100} label="No Icon" />);

    const icons = container.querySelectorAll("svg");
    expect(icons.length).toBe(0);
  });

  it("applies outlined variant by default", () => {
    const { container } = render(
      <StatisticCard value={50} label="Default Variant" />
    );

    const card = container.querySelector(".MuiCard-root");
    expect(card).toHaveClass("MuiPaper-outlined");
  });

  it("applies elevation variant when specified", () => {
    const { container } = render(
      <StatisticCard value={50} label="Elevated" variant="elevation" />
    );

    const card = container.querySelector(".MuiCard-root");
    expect(card).not.toHaveClass("MuiPaper-outlined");
  });

  it("uses custom data-testid when provided", () => {
    render(
      <StatisticCard
        value={75}
        label="Custom TestId"
        data-testid="custom-card"
      />
    );

    expect(screen.getByTestId("custom-card")).toBeInTheDocument();
    expect(screen.getByTestId("custom-card-value")).toBeInTheDocument();
    expect(screen.getByTestId("custom-card-label")).toBeInTheDocument();
  });

  it("uses default data-testid when not provided", () => {
    render(<StatisticCard value={100} label="Default TestId" />);

    expect(screen.getByTestId("statistic-card")).toBeInTheDocument();
  });

  it("displays zero value correctly", () => {
    render(<StatisticCard value={0} label="Zero Value" />);

    expect(screen.getByText("0")).toBeInTheDocument();
  });

  it("has consistent height with minHeight 120px", () => {
    const { container } = render(
      <StatisticCard value={50} label="Height Test" />
    );

    const cardContent = container.querySelector(".MuiCardContent-root");

    // Check that minHeight is applied
    expect(cardContent).toHaveStyle({ minHeight: "120px" });
  });

  it("centers content vertically and horizontally", () => {
    const { container } = render(<StatisticCard value={50} label="Centered" />);

    const cardContent = container.querySelector(".MuiCardContent-root");

    expect(cardContent).toHaveStyle({
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
    });
  });
});
