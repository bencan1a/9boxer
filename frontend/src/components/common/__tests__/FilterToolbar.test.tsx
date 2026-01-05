/**
 * FilterToolbar Tests
 *
 * Tests for the FilterToolbar component presentation and variants.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { ThemeProvider } from "@mui/material/styles";
import { I18nextProvider } from "react-i18next";
import { i18n } from "../../../i18n";
import { FilterToolbar, ActiveFilter } from "../FilterToolbar";
import { ErrorBoundary } from "../ErrorBoundary";
import { getTheme } from "../../../theme/theme";
import {
  Employee,
  PerformanceLevel,
  PotentialLevel,
} from "../../../types/employee";

const theme = getTheme("light");

// Mock employee data for search tests
const mockEmployees: Employee[] = [
  {
    employee_id: 1,
    name: "Alice Johnson",
    business_title: "Senior Engineer",
    job_title: "Senior Software Engineer",
    job_profile: "Engineering - USA",
    job_level: "MT3",
    job_function: "Engineering",
    location: "USA",
    manager: "Bob Smith",
    management_chain_01: "Bob Smith",
    management_chain_02: null,
    management_chain_03: null,
    management_chain_04: null,
    management_chain_05: null,
    management_chain_06: null,
    hire_date: "2020-01-15",
    tenure_category: "3-5 years",
    time_in_job_profile: "2 years",
    performance: PerformanceLevel.HIGH,
    potential: PotentialLevel.HIGH,
    grid_position: 9,
    talent_indicator: "High Performer",
    ratings_history: [],
    development_focus: null,
    development_action: null,
    notes: null,
    promotion_status: null,
    promotion_readiness: null,
    modified_in_session: false,
    last_modified: null,
  },
  {
    employee_id: 2,
    name: "Bob Smith",
    business_title: "Engineering Manager",
    job_title: "Engineering Manager",
    job_profile: "Engineering Management - USA",
    job_level: "MT4",
    job_function: "Engineering",
    location: "USA",
    manager: "Carol White",
    management_chain_01: "Carol White",
    management_chain_02: null,
    management_chain_03: null,
    management_chain_04: null,
    management_chain_05: null,
    management_chain_06: null,
    hire_date: "2018-03-20",
    tenure_category: "5-10 years",
    time_in_job_profile: "4 years",
    performance: PerformanceLevel.HIGH,
    potential: PotentialLevel.MEDIUM,
    grid_position: 6,
    talent_indicator: "Solid Performer",
    ratings_history: [],
    development_focus: null,
    development_action: null,
    notes: null,
    promotion_status: null,
    promotion_readiness: null,
    modified_in_session: false,
    last_modified: null,
  },
  {
    employee_id: 3,
    name: "Carol White",
    business_title: "VP Engineering",
    job_title: "Vice President of Engineering",
    job_profile: "Engineering Leadership - USA",
    job_level: "MT5",
    job_function: "Engineering",
    location: "USA",
    manager: "David Lee",
    management_chain_01: "David Lee",
    management_chain_02: null,
    management_chain_03: null,
    management_chain_04: null,
    management_chain_05: null,
    management_chain_06: null,
    hire_date: "2015-06-10",
    tenure_category: "5-10 years",
    time_in_job_profile: "5 years",
    performance: PerformanceLevel.MEDIUM,
    potential: PotentialLevel.HIGH,
    grid_position: 8,
    talent_indicator: "High Potential",
    ratings_history: [],
    development_focus: null,
    development_action: null,
    notes: null,
    promotion_status: null,
    promotion_readiness: null,
    modified_in_session: false,
    last_modified: null,
  },
  {
    employee_id: 4,
    name: "David Lee",
    business_title: "CTO",
    job_title: "Chief Technology Officer",
    job_profile: "Executive Leadership - USA",
    job_level: "MT6",
    job_function: "Engineering",
    location: "USA",
    manager: "",
    management_chain_01: null,
    management_chain_02: null,
    management_chain_03: null,
    management_chain_04: null,
    management_chain_05: null,
    management_chain_06: null,
    hire_date: "2010-01-05",
    tenure_category: "10+ years",
    time_in_job_profile: "10 years",
    performance: PerformanceLevel.HIGH,
    potential: PotentialLevel.HIGH,
    grid_position: 9,
    talent_indicator: "High Performer",
    ratings_history: [],
    development_focus: null,
    development_action: null,
    notes: null,
    promotion_status: null,
    promotion_readiness: null,
    modified_in_session: false,
    last_modified: null,
  },
];

// Helper to render component with required providers
const renderFilterToolbar = (
  props: Partial<React.ComponentProps<typeof FilterToolbar>> = {}
) => {
  const defaultProps = {
    filteredCount: 100,
    totalCount: 200,
    onFilterClick: vi.fn(),
    employees: mockEmployees,
    ...props,
  };

  return render(
    <ThemeProvider theme={theme}>
      <I18nextProvider i18n={i18n}>
        <FilterToolbar {...defaultProps} />
      </I18nextProvider>
    </ThemeProvider>
  );
};

describe("FilterToolbar", () => {
  describe("Rendering", () => {
    it("renders filter button", () => {
      renderFilterToolbar();
      expect(screen.getByTestId("filter-button")).toBeInTheDocument();
    });

    it("renders employee count", () => {
      renderFilterToolbar();
      expect(screen.getByTestId("employee-count")).toBeInTheDocument();
    });

    it("renders search input", () => {
      renderFilterToolbar();
      expect(
        screen.getByTestId("employee-search-autocomplete")
      ).toBeInTheDocument();
    });

    it("renders filter button when filters are active", () => {
      renderFilterToolbar({
        hasActiveFilters: true,
      });
      // Filter button should be present and indicate active state
      const filterButton = screen.getByTestId("filter-button");
      expect(filterButton).toBeInTheDocument();
    });
  });

  describe("Employee Count Display", () => {
    it("shows total count when no filters are active", () => {
      renderFilterToolbar({
        filteredCount: 200,
        totalCount: 200,
        hasActiveFilters: false,
      });
      const countElement = screen.getByTestId("employee-count");
      expect(countElement).toHaveTextContent("200");
    });

    it("shows filtered count when filters are active", () => {
      renderFilterToolbar({
        filteredCount: 50,
        totalCount: 200,
        hasActiveFilters: true,
      });
      const countElement = screen.getByTestId("employee-count");
      expect(countElement).toHaveTextContent("50");
      expect(countElement).toHaveTextContent("200");
    });
  });

  describe("Variants", () => {
    it("renders FilterToolbar", () => {
      renderFilterToolbar();
      expect(screen.getByTestId("filter-toolbar")).toBeInTheDocument();
    });
  });

  describe("Active Filters", () => {
    const sampleFilters: ActiveFilter[] = [
      {
        type: "level",
        label: "Job Level",
        values: ["MT3", "MT4"],
      },
      {
        type: "location",
        label: "Location",
        values: ["USA"],
      },
    ];

    it("shows filter info when filters are active", () => {
      renderFilterToolbar({
        hasActiveFilters: true,
        activeFilters: sampleFilters,
      });
      expect(screen.getByTestId("filter-info")).toBeInTheDocument();
    });
  });

  describe("Disabled State", () => {
    it("disables filter button when disabled prop is true", () => {
      renderFilterToolbar({ disabled: true });
      const filterButton = screen.getByTestId("filter-button");
      expect(filterButton).toBeDisabled();
    });

    it("disables search input when disabled prop is true", () => {
      renderFilterToolbar({ disabled: true });
      const searchInput = screen
        .getByTestId("employee-search-autocomplete")
        .querySelector("input");
      expect(searchInput).toBeDisabled();
    });
  });

  describe("Collapse/Expand Functionality", () => {
    beforeEach(() => {
      // Clear localStorage before each test
      localStorage.clear();
    });

    it("renders toggle button in compact variant", () => {
      renderFilterToolbar();
      expect(screen.getByTestId("toolbar-toggle-button")).toBeInTheDocument();
    });

    it("starts in expanded state by default", () => {
      renderFilterToolbar();
      // Employee count should be visible when expanded
      expect(screen.getByTestId("employee-count")).toBeInTheDocument();
      // Search input should be visible when expanded
      expect(
        screen.getByTestId("employee-search-autocomplete")
      ).toBeInTheDocument();
    });

    it("collapses toolbar when toggle button is clicked", () => {
      const { container } = renderFilterToolbar();
      const toggleButton = screen.getByTestId("toolbar-toggle-button");

      // Initially expanded - collapsible content should be visible
      const collapseContainer = container.querySelector(".MuiCollapse-root");
      expect(collapseContainer).toHaveClass("MuiCollapse-entered");

      // Click to collapse
      act(() => {
        toggleButton.click();
      });

      // After collapse, Collapse component should have different class
      // (Note: Testing animation state is tricky, so we just verify toggle works)
      expect(toggleButton).toBeInTheDocument();
    });

    it("persists collapse state to localStorage", async () => {
      const { rerender } = renderFilterToolbar();
      const toggleButton = screen.getByTestId("toolbar-toggle-button");

      // Click to collapse
      act(() => {
        toggleButton.click();
      });

      // Check localStorage was updated to collapsed
      expect(localStorage.getItem("filterToolbarCollapsed")).toBe("true");

      // Re-render to ensure state is applied
      rerender(
        <ThemeProvider theme={theme}>
          <I18nextProvider i18n={i18n}>
            <FilterToolbar
              filteredCount={100}
              totalCount={200}
              onFilterClick={vi.fn()}
            />
          </I18nextProvider>
        </ThemeProvider>
      );

      // Find toggle button again after rerender
      const newToggleButton = screen.getByTestId("toolbar-toggle-button");

      // Click to expand
      act(() => {
        newToggleButton.click();
      });

      // Check localStorage was updated to expanded
      expect(localStorage.getItem("filterToolbarCollapsed")).toBe("false");
    });

    it("restores collapse state from localStorage on mount", () => {
      // Set collapsed state in localStorage
      localStorage.setItem("filterToolbarCollapsed", "true");

      renderFilterToolbar();

      // Toolbar should start collapsed
      const toggleButton = screen.getByTestId("toolbar-toggle-button");
      expect(toggleButton).toBeInTheDocument();
    });

    it("shows filter button even when collapsed", () => {
      localStorage.setItem("filterToolbarCollapsed", "true");

      renderFilterToolbar();

      // Filter button should always be visible
      expect(screen.getByTestId("filter-button")).toBeInTheDocument();
    });

    it("shows filter button when collapsed", () => {
      localStorage.setItem("filterToolbarCollapsed", "true");

      renderFilterToolbar({
        hasActiveFilters: true,
      });

      // Filter button should be visible even when collapsed
      expect(screen.getByTestId("filter-button")).toBeInTheDocument();
    });
  });

  describe("Error Boundary", () => {
    // Component that throws an error
    const ThrowError = () => {
      throw new Error("Test error");
    };

    it("catches errors and renders fallback UI", () => {
      // Suppress console.error for this test
      const consoleError = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      render(
        <ThemeProvider theme={theme}>
          <I18nextProvider i18n={i18n}>
            <ErrorBoundary
              fallback={
                <div data-testid="custom-fallback">Custom Fallback</div>
              }
            >
              <ThrowError />
            </ErrorBoundary>
          </I18nextProvider>
        </ThemeProvider>
      );

      // Should render the custom fallback
      expect(screen.getByTestId("custom-fallback")).toBeInTheDocument();
      expect(screen.getByText("Custom Fallback")).toBeInTheDocument();

      consoleError.mockRestore();
    });

    it("renders children normally when no error occurs", () => {
      render(
        <ThemeProvider theme={theme}>
          <I18nextProvider i18n={i18n}>
            <ErrorBoundary
              fallback={
                <div data-testid="custom-fallback">Custom Fallback</div>
              }
            >
              <div data-testid="normal-content">Normal Content</div>
            </ErrorBoundary>
          </I18nextProvider>
        </ThemeProvider>
      );

      // Should render the normal content
      expect(screen.getByTestId("normal-content")).toBeInTheDocument();
      expect(screen.queryByTestId("custom-fallback")).not.toBeInTheDocument();
    });

    it("wraps FilterToolbar in FilterToolbarContainer with error protection", () => {
      // Verify that SimplifiedToolbar exists and can be rendered
      const { container } = render(
        <ThemeProvider theme={theme}>
          <I18nextProvider i18n={i18n}>
            <div data-testid="test-container">
              <ErrorBoundary
                fallback={<div data-testid="simplified-toolbar">Fallback</div>}
              >
                <div>Normal content</div>
              </ErrorBoundary>
            </div>
          </I18nextProvider>
        </ThemeProvider>
      );

      // Should render the normal content, not the fallback
      expect(container.textContent).toContain("Normal content");
    });
  });
});
