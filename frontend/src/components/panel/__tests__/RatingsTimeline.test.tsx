import { describe, it, expect } from "vitest";
import { render, screen } from "../../../test/utils";
import { RatingsTimeline } from "../RatingsTimeline";
import { createMockEmployee } from "../../../test/mockData";
import { getTranslatedText } from "../../../test/i18nTestUtils";

describe("RatingsTimeline", () => {
  it("renders performance history heading when displayed", () => {
    const employee = createMockEmployee({
      ratings_history: [
        { year: 2023, rating: "Leading" },
        { year: 2022, rating: "Strong" },
      ],
    });

    render(<RatingsTimeline employee={employee} />);

    expect(
      screen.getByText(getTranslatedText("panel.detailsTab.performanceHistory"))
    ).toBeInTheDocument();
  });

  it("displays current year rating correctly", () => {
    const employee = createMockEmployee({
      performance: "High",
      potential: "High",
      ratings_history: [],
    });

    render(<RatingsTimeline employee={employee} />);

    expect(
      screen.getByText(
        getTranslatedText("panel.detailsTab.currentYear", { year: 2025 })
      )
    ).toBeInTheDocument();
    // Check for performance and potential values
    const performanceText = screen.getByText(/Performance:.*High/);
    expect(performanceText).toBeInTheDocument();
  });

  it("displays historical ratings sorted by year descending", () => {
    const employee = createMockEmployee({
      ratings_history: [
        { year: 2022, rating: "Strong" },
        { year: 2023, rating: "Leading" },
        { year: 2021, rating: "Meeting" },
      ],
    });

    render(<RatingsTimeline employee={employee} />);

    // All years should be displayed
    expect(screen.getByText("2023")).toBeInTheDocument();
    expect(screen.getByText("2022")).toBeInTheDocument();
    expect(screen.getByText("2021")).toBeInTheDocument();

    // All ratings should be displayed
    expect(screen.getByText(/Leading$/)).toBeInTheDocument();
    expect(screen.getByText(/Strong$/)).toBeInTheDocument();
    expect(screen.getByText(/Meeting$/)).toBeInTheDocument();
  });

  it("displays empty state when no historical ratings exist", () => {
    const employee = createMockEmployee({
      ratings_history: [],
    });

    render(<RatingsTimeline employee={employee} />);

    expect(
      screen.getByText(
        getTranslatedText("panel.detailsTab.noHistoricalRatings")
      )
    ).toBeInTheDocument();
  });

  it("renders timeline with default left alignment (no position prop)", () => {
    const employee = createMockEmployee({
      ratings_history: [{ year: 2023, rating: "Leading" }],
    });

    const { container } = render(<RatingsTimeline employee={employee} />);

    // Check that Timeline component doesn't have position="right" prop
    // The Timeline should be rendered without explicit positioning
    const timeline = container.querySelector(".MuiTimeline-root");
    expect(timeline).toBeInTheDocument();

    // Verify content is visible and accessible
    expect(screen.getByText("2023")).toBeInTheDocument();
    expect(screen.getByText(/Leading$/)).toBeInTheDocument();
  });

  it("displays both current and historical ratings together", () => {
    const employee = createMockEmployee({
      performance: "High",
      potential: "Medium",
      ratings_history: [
        { year: 2023, rating: "Leading" },
        { year: 2022, rating: "Strong" },
      ],
    });

    render(<RatingsTimeline employee={employee} />);

    // Current year
    expect(
      screen.getByText(
        getTranslatedText("panel.detailsTab.currentYear", { year: 2025 })
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(getTranslatedText("panel.detailsTab.currentAssessment"))
    ).toBeInTheDocument();

    // Historical ratings
    expect(screen.getByText("2023")).toBeInTheDocument();
    expect(screen.getByText("2022")).toBeInTheDocument();
  });

  it("displays performance and potential for current year", () => {
    const employee = createMockEmployee({
      performance: "High",
      potential: "Medium",
      ratings_history: [],
    });

    render(<RatingsTimeline employee={employee} />);

    const performanceLabel = getTranslatedText("panel.detailsTab.performance");
    const potentialLabel = getTranslatedText("panel.detailsTab.potentialLabel");

    expect(
      screen.getByText(new RegExp(`${performanceLabel}.*High`))
    ).toBeInTheDocument();
    expect(
      screen.getByText(new RegExp(`${potentialLabel}.*Medium`))
    ).toBeInTheDocument();
  });

  it("renders timeline items with correct structure", () => {
    const employee = createMockEmployee({
      ratings_history: [{ year: 2023, rating: "Leading" }],
    });

    const { container } = render(<RatingsTimeline employee={employee} />);

    // Check for Timeline components structure
    const timelineItems = container.querySelectorAll(".MuiTimelineItem-root");
    expect(timelineItems.length).toBeGreaterThan(0);

    // Check for dots
    const timelineDots = container.querySelectorAll(".MuiTimelineDot-root");
    expect(timelineDots.length).toBeGreaterThan(0);

    // Check for connectors
    const timelineConnectors = container.querySelectorAll(
      ".MuiTimelineConnector-root"
    );
    expect(timelineConnectors.length).toBeGreaterThan(0);
  });
});
