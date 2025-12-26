import { describe, it, expect, vi } from "vitest";
import { render, screen } from "../../../test/utils";
import { mockEmployees, mockStatistics } from "../../../test/mockData";
import { StatisticsTab } from "../StatisticsTab";
import { getTranslatedText } from "../../../test/i18nTestUtils";

// Mock the DistributionChart component to avoid recharts issues in tests
vi.mock("../DistributionChart", () => ({
  DistributionChart: () => (
    <div data-testid="distribution-chart">Distribution Chart</div>
  ),
}));

// Mock the hooks
vi.mock("../../../hooks/useEmployees", () => ({
  useEmployees: () => ({ employees: mockEmployees }),
}));

vi.mock("../../../hooks/useStatistics", () => ({
  useStatistics: () => ({
    statistics: mockStatistics,
    isLoading: false,
    error: null,
  }),
}));

vi.mock("../../../store/sessionStore", () => ({
  useSessionStore: vi.fn(() => false), // donutModeActive = false
}));

describe("StatisticsTab", () => {
  it("displays statistics when data is loaded", () => {
    render(<StatisticsTab />);

    // Check for total employees
    expect(
      screen.getByText(getTranslatedText("panel.statisticsTab.totalEmployees"))
    ).toBeInTheDocument();
    expect(
      screen.getByText(getTranslatedText("panel.statisticsTab.modified"))
    ).toBeInTheDocument();
    expect(
      screen.getByText(getTranslatedText("panel.statisticsTab.highPerformers"))
    ).toBeInTheDocument();
  });

  it("renders distribution table", () => {
    render(<StatisticsTab />);

    // Check table headers
    expect(
      screen.getByText(getTranslatedText("panel.statisticsTab.position"))
    ).toBeInTheDocument();
    expect(
      screen.getByText(getTranslatedText("panel.statisticsTab.count"))
    ).toBeInTheDocument();
    expect(
      screen.getByText(getTranslatedText("panel.statisticsTab.percentage"))
    ).toBeInTheDocument();
  });

  it("renders distribution chart component", () => {
    render(<StatisticsTab />);

    expect(screen.getByTestId("distribution-chart")).toBeInTheDocument();
    expect(screen.getByText("Visual Distribution")).toBeInTheDocument();
  });
});
