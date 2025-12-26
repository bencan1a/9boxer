import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FlagFilters, FlagOption } from "./FlagFilters";
import { ThemeProvider } from "@mui/material/styles";
import { getTheme } from "../../../theme/theme";

// Test wrapper with theme provider
const TestWrapper = ({
  children,
  mode = "light",
}: {
  children: React.ReactNode;
  mode?: "light" | "dark";
}) => {
  const theme = getTheme(mode);
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};

// Sample flag options for testing
const mockFlagOptions: FlagOption[] = [
  { key: "promotion_ready", displayName: "Promotion Ready", count: 12 },
  {
    key: "flagged_for_discussion",
    displayName: "Flagged for Discussion",
    count: 5,
  },
  { key: "flight_risk", displayName: "Flight Risk", count: 3 },
  { key: "new_hire", displayName: "New Hire", count: 8 },
  {
    key: "succession_candidate",
    displayName: "Succession Candidate",
    count: 4,
  },
  {
    key: "pip",
    displayName: "Performance Improvement Plan",
    count: 2,
  },
  {
    key: "high_retention_priority",
    displayName: "High Retention Priority",
    count: 6,
  },
  {
    key: "ready_for_lateral_move",
    displayName: "Ready for Lateral Move",
    count: 7,
  },
];

describe("FlagFilters", () => {
  describe("Rendering", () => {
    it("renders container with correct test id", () => {
      render(
        <TestWrapper>
          <FlagFilters
            selectedFlags={[]}
            flagOptions={mockFlagOptions}
            onFlagToggle={vi.fn()}
          />
        </TestWrapper>
      );

      expect(screen.getByTestId("flag-filters-container")).toBeInTheDocument();
    });

    it("renders all flag options", () => {
      render(
        <TestWrapper>
          <FlagFilters
            selectedFlags={[]}
            flagOptions={mockFlagOptions}
            onFlagToggle={vi.fn()}
          />
        </TestWrapper>
      );

      // Check that all 8 flags are rendered
      expect(screen.getByText(/Promotion Ready/)).toBeInTheDocument();
      expect(screen.getByText(/Flagged for Discussion/)).toBeInTheDocument();
      expect(screen.getByText(/Flight Risk/)).toBeInTheDocument();
      expect(screen.getByText(/New Hire/)).toBeInTheDocument();
      expect(screen.getByText(/Succession Candidate/)).toBeInTheDocument();
      expect(
        screen.getByText(/Performance Improvement Plan/)
      ).toBeInTheDocument();
      expect(screen.getByText(/High Retention Priority/)).toBeInTheDocument();
      expect(screen.getByText(/Ready for Lateral Move/)).toBeInTheDocument();
    });

    it("displays employee counts correctly", () => {
      render(
        <TestWrapper>
          <FlagFilters
            selectedFlags={[]}
            flagOptions={mockFlagOptions}
            onFlagToggle={vi.fn()}
          />
        </TestWrapper>
      );

      // Check specific counts
      expect(screen.getByText(/Promotion Ready \(12\)/)).toBeInTheDocument();
      expect(screen.getByText(/Flight Risk \(3\)/)).toBeInTheDocument();
      expect(screen.getByText(/New Hire \(8\)/)).toBeInTheDocument();
    });

    it("renders with empty flag options", () => {
      render(
        <TestWrapper>
          <FlagFilters
            selectedFlags={[]}
            flagOptions={[]}
            onFlagToggle={vi.fn()}
          />
        </TestWrapper>
      );

      expect(screen.getByTestId("flag-filters-container")).toBeInTheDocument();
      // No flags should be rendered
      expect(screen.queryByText(/Promotion Ready/)).not.toBeInTheDocument();
    });

    it("renders with zero counts", () => {
      const zeroCountFlags: FlagOption[] = [
        { key: "promotion_ready", displayName: "Promotion Ready", count: 0 },
        { key: "flight_risk", displayName: "Flight Risk", count: 0 },
      ];

      render(
        <TestWrapper>
          <FlagFilters
            selectedFlags={[]}
            flagOptions={zeroCountFlags}
            onFlagToggle={vi.fn()}
          />
        </TestWrapper>
      );

      expect(screen.getByText(/Promotion Ready \(0\)/)).toBeInTheDocument();
      expect(screen.getByText(/Flight Risk \(0\)/)).toBeInTheDocument();
    });
  });

  describe("Checkbox States", () => {
    it("checks boxes for selected flags", () => {
      render(
        <TestWrapper>
          <FlagFilters
            selectedFlags={["flight_risk", "pip"]}
            flagOptions={mockFlagOptions}
            onFlagToggle={vi.fn()}
          />
        </TestWrapper>
      );

      // Get checkboxes by their ARIA labels
      const flightRiskCheckbox = screen.getByLabelText(
        "Filter by Flight Risk, 3 employees"
      );
      const pipCheckbox = screen.getByLabelText(
        "Filter by Performance Improvement Plan, 2 employees"
      );
      const promotionReadyCheckbox = screen.getByLabelText(
        "Filter by Promotion Ready, 12 employees"
      );

      expect(flightRiskCheckbox).toBeChecked();
      expect(pipCheckbox).toBeChecked();
      expect(promotionReadyCheckbox).not.toBeChecked();
    });

    it("unchecks boxes for unselected flags", () => {
      render(
        <TestWrapper>
          <FlagFilters
            selectedFlags={[]}
            flagOptions={mockFlagOptions}
            onFlagToggle={vi.fn()}
          />
        </TestWrapper>
      );

      const flightRiskCheckbox = screen.getByLabelText(
        "Filter by Flight Risk, 3 employees"
      );
      expect(flightRiskCheckbox).not.toBeChecked();
    });

    it("handles all flags selected", () => {
      const allFlagKeys = mockFlagOptions.map((f) => f.key);

      render(
        <TestWrapper>
          <FlagFilters
            selectedFlags={allFlagKeys}
            flagOptions={mockFlagOptions}
            onFlagToggle={vi.fn()}
          />
        </TestWrapper>
      );

      // All checkboxes should be checked
      mockFlagOptions.forEach((flag) => {
        const checkbox = screen.getByLabelText(
          `Filter by ${flag.displayName}, ${flag.count} employees`
        );
        expect(checkbox).toBeChecked();
      });
    });
  });

  describe("User Interactions", () => {
    it("calls onFlagToggle when checkbox is clicked", async () => {
      const user = userEvent.setup();
      const handleToggle = vi.fn();

      render(
        <TestWrapper>
          <FlagFilters
            selectedFlags={[]}
            flagOptions={mockFlagOptions}
            onFlagToggle={handleToggle}
          />
        </TestWrapper>
      );

      const flightRiskCheckbox = screen.getByTestId(
        "filter-checkbox-flags-flight-risk"
      );
      await user.click(flightRiskCheckbox);

      expect(handleToggle).toHaveBeenCalledWith("flight_risk");
      expect(handleToggle).toHaveBeenCalledTimes(1);
    });

    it("calls onFlagToggle with correct flag key for each checkbox", async () => {
      const user = userEvent.setup();
      const handleToggle = vi.fn();

      render(
        <TestWrapper>
          <FlagFilters
            selectedFlags={[]}
            flagOptions={mockFlagOptions}
            onFlagToggle={handleToggle}
          />
        </TestWrapper>
      );

      // Click promotion ready
      const promotionReadyCheckbox = screen.getByTestId(
        "filter-checkbox-flags-promotion-ready"
      );
      await user.click(promotionReadyCheckbox);
      expect(handleToggle).toHaveBeenLastCalledWith("promotion_ready");

      // Click new hire
      const newHireCheckbox = screen.getByTestId(
        "filter-checkbox-flags-new-hire"
      );
      await user.click(newHireCheckbox);
      expect(handleToggle).toHaveBeenLastCalledWith("new_hire");

      expect(handleToggle).toHaveBeenCalledTimes(2);
    });

    it("calls onFlagToggle when unchecking a selected flag", async () => {
      const user = userEvent.setup();
      const handleToggle = vi.fn();

      render(
        <TestWrapper>
          <FlagFilters
            selectedFlags={["flight_risk"]}
            flagOptions={mockFlagOptions}
            onFlagToggle={handleToggle}
          />
        </TestWrapper>
      );

      const flightRiskCheckbox = screen.getByTestId(
        "filter-checkbox-flags-flight-risk"
      );
      await user.click(flightRiskCheckbox);

      expect(handleToggle).toHaveBeenCalledWith("flight_risk");
    });
  });

  describe("Accessibility", () => {
    it("has proper ARIA labels for all checkboxes", () => {
      render(
        <TestWrapper>
          <FlagFilters
            selectedFlags={[]}
            flagOptions={mockFlagOptions}
            onFlagToggle={vi.fn()}
          />
        </TestWrapper>
      );

      // Check that checkboxes can be found by their aria-label
      const flightRiskCheckbox = screen.getByLabelText(
        "Filter by Flight Risk, 3 employees"
      );
      expect(flightRiskCheckbox).toBeInTheDocument();
      expect(flightRiskCheckbox).toHaveAttribute("type", "checkbox");

      const promotionReadyCheckbox = screen.getByLabelText(
        "Filter by Promotion Ready, 12 employees"
      );
      expect(promotionReadyCheckbox).toBeInTheDocument();
      expect(promotionReadyCheckbox).toHaveAttribute("type", "checkbox");
    });

    it("has proper test IDs for all checkboxes", () => {
      render(
        <TestWrapper>
          <FlagFilters
            selectedFlags={[]}
            flagOptions={mockFlagOptions}
            onFlagToggle={vi.fn()}
          />
        </TestWrapper>
      );

      // Verify all test IDs exist
      expect(
        screen.getByTestId("filter-checkbox-flags-promotion-ready")
      ).toBeInTheDocument();
      expect(
        screen.getByTestId("filter-checkbox-flags-flagged-for-discussion")
      ).toBeInTheDocument();
      expect(
        screen.getByTestId("filter-checkbox-flags-flight-risk")
      ).toBeInTheDocument();
      expect(
        screen.getByTestId("filter-checkbox-flags-new-hire")
      ).toBeInTheDocument();
      expect(
        screen.getByTestId("filter-checkbox-flags-succession-candidate")
      ).toBeInTheDocument();
      expect(
        screen.getByTestId("filter-checkbox-flags-pip")
      ).toBeInTheDocument();
      expect(
        screen.getByTestId("filter-checkbox-flags-high-retention-priority")
      ).toBeInTheDocument();
      expect(
        screen.getByTestId("filter-checkbox-flags-ready-for-lateral-move")
      ).toBeInTheDocument();
    });
  });

  describe("Theme Support", () => {
    it("renders correctly in light theme", () => {
      render(
        <TestWrapper mode="light">
          <FlagFilters
            selectedFlags={[]}
            flagOptions={mockFlagOptions}
            onFlagToggle={vi.fn()}
          />
        </TestWrapper>
      );

      expect(screen.getByTestId("flag-filters-container")).toBeInTheDocument();
      expect(screen.getByText(/Promotion Ready/)).toBeInTheDocument();
    });

    it("renders correctly in dark theme", () => {
      render(
        <TestWrapper mode="dark">
          <FlagFilters
            selectedFlags={[]}
            flagOptions={mockFlagOptions}
            onFlagToggle={vi.fn()}
          />
        </TestWrapper>
      );

      expect(screen.getByTestId("flag-filters-container")).toBeInTheDocument();
      expect(screen.getByText(/Promotion Ready/)).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("handles flags with special characters in keys", () => {
      const specialFlags: FlagOption[] = [
        { key: "test_flag_123", displayName: "Test Flag 123", count: 5 },
        { key: "UPPERCASE_FLAG", displayName: "Uppercase Flag", count: 3 },
      ];

      render(
        <TestWrapper>
          <FlagFilters
            selectedFlags={[]}
            flagOptions={specialFlags}
            onFlagToggle={vi.fn()}
          />
        </TestWrapper>
      );

      expect(
        screen.getByTestId("filter-checkbox-flags-test-flag-123")
      ).toBeInTheDocument();
      expect(
        screen.getByTestId("filter-checkbox-flags-uppercase-flag")
      ).toBeInTheDocument();
    });

    it("handles large counts correctly", () => {
      const largeCountFlags: FlagOption[] = [
        { key: "promotion_ready", displayName: "Promotion Ready", count: 999 },
        { key: "flight_risk", displayName: "Flight Risk", count: 1234 },
      ];

      render(
        <TestWrapper>
          <FlagFilters
            selectedFlags={[]}
            flagOptions={largeCountFlags}
            onFlagToggle={vi.fn()}
          />
        </TestWrapper>
      );

      expect(screen.getByText(/Promotion Ready \(999\)/)).toBeInTheDocument();
      expect(screen.getByText(/Flight Risk \(1234\)/)).toBeInTheDocument();
    });

    it("handles rapid toggle interactions", async () => {
      const user = userEvent.setup();
      const handleToggle = vi.fn();

      render(
        <TestWrapper>
          <FlagFilters
            selectedFlags={[]}
            flagOptions={mockFlagOptions}
            onFlagToggle={handleToggle}
          />
        </TestWrapper>
      );

      const checkbox = screen.getByTestId("filter-checkbox-flags-flight-risk");

      // Rapid clicks
      await user.click(checkbox);
      await user.click(checkbox);
      await user.click(checkbox);

      expect(handleToggle).toHaveBeenCalledTimes(3);
      expect(handleToggle).toHaveBeenCalledWith("flight_risk");
    });
  });
});
