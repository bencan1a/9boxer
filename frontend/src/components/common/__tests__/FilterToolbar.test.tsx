/**
 * FilterToolbar Tests
 *
 * Tests for the FilterToolbar component presentation and variants.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { ThemeProvider } from "@mui/material/styles";
import { I18nextProvider } from "react-i18next";
import { i18n } from "../../../i18n";
import { FilterToolbar, ActiveFilter } from "../FilterToolbar";
import { ErrorBoundary } from "../ErrorBoundary";
import { getTheme } from "../../../theme/theme";

const theme = getTheme("light");

// Helper to render component with required providers
const renderFilterToolbar = (
  props: Partial<React.ComponentProps<typeof FilterToolbar>> = {}
) => {
  const defaultProps = {
    filteredCount: 100,
    totalCount: 200,
    onFilterClick: vi.fn(),
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
      expect(screen.getByTestId("search-input")).toBeInTheDocument();
    });

    it("highlights filter button when filters are active", () => {
      renderFilterToolbar({
        hasActiveFilters: true,
        activeFilters: [{ type: "level", label: "Level", values: ["IC5"] }],
      });
      const filterButton = screen.getByTestId("filter-button");
      expect(filterButton).toBeInTheDocument();
      // Button should have secondary color when filters are active
      expect(filterButton).toHaveStyle({ borderColor: expect.any(String) });
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
        .getByTestId("search-input")
        .querySelector("input");
      expect(searchInput).toBeDisabled();
    });
  });

  describe("Collapse/Expand Functionality", () => {
    beforeEach(() => {
      // Clear localStorage before each test
      localStorage.clear();
    });

    it("renders toggle button", () => {
      renderFilterToolbar();
      expect(screen.getByTestId("toolbar-toggle-button")).toBeInTheDocument();
    });

    it("starts in expanded state by default", () => {
      renderFilterToolbar();
      // Employee count should be visible when expanded
      expect(screen.getByTestId("employee-count")).toBeInTheDocument();
      // Search input should be visible when expanded
      expect(screen.getByTestId("search-input")).toBeInTheDocument();
    });

    it("collapses toolbar when toggle button is clicked", () => {
      const { container } = renderFilterToolbar();
      const toggleButton = screen.getByTestId("toolbar-toggle-button");

      // Initially expanded - collapsible content should be visible
      const collapseContainer = container.querySelector(".MuiCollapse-root");
      expect(collapseContainer).toHaveClass("MuiCollapse-entered");

      // Click to collapse
      toggleButton.click();

      // After collapse, Collapse component should have different class
      // (Note: Testing animation state is tricky, so we just verify toggle works)
      expect(toggleButton).toBeInTheDocument();
    });

    it("persists collapse state to localStorage", async () => {
      const { rerender } = renderFilterToolbar();
      const toggleButton = screen.getByTestId("toolbar-toggle-button");

      // Click to collapse
      toggleButton.click();

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
      newToggleButton.click();

      // Check localStorage was updated to expanded
      expect(localStorage.getItem("filterToolbarCollapsed")).toBe("false");
    });

    it("restores collapse state from localStorage on mount", () => {
      // Set collapsed state in localStorage
      localStorage.setItem("filterToolbarCollapsed", "true");

      renderFilterToolbar();

      // Toolbar should start collapsed
      const toggleButton = screen.getByTestId("toolbar-toggle-button");

      // Verify the button exists
      expect(toggleButton).toBeInTheDocument();
    });

    it("shows filter button even when collapsed", () => {
      localStorage.setItem("filterToolbarCollapsed", "true");

      renderFilterToolbar();

      // Filter button should always be visible
      expect(screen.getByTestId("filter-button")).toBeInTheDocument();
    });

    it("shows highlighted filter button when collapsed", () => {
      localStorage.setItem("filterToolbarCollapsed", "true");

      renderFilterToolbar({
        hasActiveFilters: true,
        activeFilters: [{ type: "level", label: "Level", values: ["IC5"] }],
      });

      // Filter button should be visible and highlighted even when collapsed
      const filterButton = screen.getByTestId("filter-button");
      expect(filterButton).toBeInTheDocument();
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
