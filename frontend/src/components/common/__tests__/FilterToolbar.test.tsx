/**
 * FilterToolbar Tests
 *
 * Tests for the FilterToolbar component presentation and variants.
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { I18nextProvider } from "react-i18next";
import i18n from "../../../i18n";
import { FilterToolbar, ActiveFilter } from "../FilterToolbar";

const theme = createTheme();

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

    it("renders filter badge when filters are active", () => {
      renderFilterToolbar({
        hasActiveFilters: true,
        activeFilterCount: 3,
      });
      expect(screen.getByTestId("filter-badge")).toBeInTheDocument();
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
    it("renders compact variant by default", () => {
      renderFilterToolbar();
      expect(screen.getByTestId("filter-toolbar")).toBeInTheDocument();
    });

    it("renders expandable variant", () => {
      renderFilterToolbar({ variant: "expandable" });
      expect(screen.getByTestId("filter-toolbar")).toBeInTheDocument();
    });

    it("renders chips variant", () => {
      renderFilterToolbar({ variant: "chips" });
      expect(screen.getByTestId("filter-toolbar")).toBeInTheDocument();
    });

    it("renders dropdown variant", () => {
      renderFilterToolbar({ variant: "dropdown" });
      expect(screen.getByTestId("filter-toolbar")).toBeInTheDocument();
    });

    it("renders split variant", () => {
      renderFilterToolbar({ variant: "split" });
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

    it("shows filter info in compact variant when filters are active", () => {
      renderFilterToolbar({
        variant: "compact",
        hasActiveFilters: true,
        activeFilters: sampleFilters,
      });
      expect(screen.getByTestId("filter-info")).toBeInTheDocument();
    });

    it("shows filter chips in chips variant when filters are active", () => {
      const { container } = renderFilterToolbar({
        variant: "chips",
        hasActiveFilters: true,
        activeFilters: sampleFilters,
      });
      // Check for MUI Chip components
      const chips = container.querySelectorAll(".MuiChip-root");
      expect(chips.length).toBeGreaterThan(0);
    });

    it("shows expand button in expandable variant when filters are active", () => {
      renderFilterToolbar({
        variant: "expandable",
        hasActiveFilters: true,
        activeFilters: sampleFilters,
      });
      expect(screen.getByTestId("info-toggle-button")).toBeInTheDocument();
    });

    it("shows info button in dropdown variant when filters are active", () => {
      renderFilterToolbar({
        variant: "dropdown",
        hasActiveFilters: true,
        activeFilters: sampleFilters,
      });
      expect(screen.getByTestId("info-button")).toBeInTheDocument();
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
});
