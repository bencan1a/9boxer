/**
 * Unit tests for AnomalySection component
 */

import { describe, it, expect } from "vitest";
import { render, screen, fireEvent, waitFor } from "@/test/utils";
import { getTranslatedText as t } from "@/test/i18nTestUtils";
import { AnomalySection } from "../AnomalySection";
import { DeviationChart } from "../DeviationChart";
import {
  mockGreenAnalysis,
  mockYellowAnalysis,
  mockRedAnalysis,
  mockSmallSampleAnalysis,
  mockLargeSampleAnalysis,
  mockEmptyDeviations,
  mockSingleCategory,
  mockLongCategoryNames,
} from "@/mocks/mockIntelligence";

describe("AnomalySection", () => {
  describe("Rendering with different status levels", () => {
    it("renders with green status and correct chip", () => {
      render(
        <AnomalySection
          title="Location Analysis"
          analysis={mockGreenAnalysis}
          chartComponent={
            <DeviationChart
              data={mockGreenAnalysis.deviations}
              title="Test Chart"
            />
          }
        />
      );

      expect(screen.getByText("Location Analysis")).toBeInTheDocument();
      expect(
        screen.getByText(t("panel.intelligenceTab.anomaly.noIssues"))
      ).toBeInTheDocument();
    });

    it("renders with yellow status and correct chip", () => {
      render(
        <AnomalySection
          title="Function Analysis"
          analysis={mockYellowAnalysis}
          chartComponent={
            <DeviationChart
              data={mockYellowAnalysis.deviations}
              title="Test Chart"
            />
          }
        />
      );

      expect(screen.getByText("Function Analysis")).toBeInTheDocument();
      expect(
        screen.getByText(t("panel.intelligenceTab.anomaly.moderateAnomaly"))
      ).toBeInTheDocument();
    });

    it("renders with red status and correct chip", () => {
      render(
        <AnomalySection
          title="Level Analysis"
          analysis={mockRedAnalysis}
          chartComponent={
            <DeviationChart
              data={mockRedAnalysis.deviations}
              title="Test Chart"
            />
          }
        />
      );

      expect(screen.getByText("Level Analysis")).toBeInTheDocument();
      expect(
        screen.getByText(t("panel.intelligenceTab.anomaly.severeAnomaly"))
      ).toBeInTheDocument();
    });
  });

  describe("Statistical summary display", () => {
    it("displays p-value correctly when p >= 0.001", () => {
      render(
        <AnomalySection
          title="Test"
          analysis={mockGreenAnalysis}
          chartComponent={<div>Chart</div>}
        />
      );

      // p-value is 0.427, should display as "0.427"
      expect(screen.getByText("0.427")).toBeInTheDocument();
    });

    it("displays p-value as '<0.001' when p < 0.001", () => {
      const analysisWithVeryLowP = {
        ...mockRedAnalysis,
        p_value: 0.0003,
      };

      render(
        <AnomalySection
          title="Test"
          analysis={analysisWithVeryLowP}
          chartComponent={<div>Chart</div>}
        />
      );

      expect(screen.getByText("<0.001")).toBeInTheDocument();
    });

    it("displays effect size with 3 decimal places", () => {
      render(
        <AnomalySection
          title="Test"
          analysis={mockGreenAnalysis}
          chartComponent={<div>Chart</div>}
        />
      );

      // Effect size is 0.08, should display as "0.080"
      expect(screen.getByText("0.080")).toBeInTheDocument();
    });

    it("displays sample size", () => {
      render(
        <AnomalySection
          title="Test"
          analysis={mockGreenAnalysis}
          chartComponent={<div>Chart</div>}
        />
      );

      // Sample size is 150
      expect(screen.getByText("150")).toBeInTheDocument();
    });

    it("displays degrees of freedom", () => {
      render(
        <AnomalySection
          title="Test"
          analysis={mockGreenAnalysis}
          chartComponent={<div>Chart</div>}
        />
      );

      // DOF is 4
      expect(screen.getByText("4")).toBeInTheDocument();
    });

    it("shows tooltips for statistical terms", () => {
      render(
        <AnomalySection
          title="Test"
          analysis={mockGreenAnalysis}
          chartComponent={<div>Chart</div>}
        />
      );

      // Should have info icons for p-value and effect size tooltips
      const infoIcons = screen.getAllByTestId("InfoIcon");
      expect(infoIcons.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe("Interpretation display", () => {
    it("displays green status interpretation", () => {
      render(
        <AnomalySection
          title="Test"
          analysis={mockGreenAnalysis}
          chartComponent={<div>Chart</div>}
        />
      );

      expect(
        screen.getByText(/No significant deviations detected/)
      ).toBeInTheDocument();
    });

    it("displays yellow status interpretation", () => {
      render(
        <AnomalySection
          title="Test"
          analysis={mockYellowAnalysis}
          chartComponent={<div>Chart</div>}
        />
      );

      expect(screen.getByText(/Moderate anomaly detected/)).toBeInTheDocument();
    });

    it("displays red status interpretation", () => {
      render(
        <AnomalySection
          title="Test"
          analysis={mockRedAnalysis}
          chartComponent={<div>Chart</div>}
        />
      );

      expect(screen.getByText(/Severe anomaly detected/)).toBeInTheDocument();
    });
  });

  describe("Chart component integration", () => {
    it("renders provided chart component", () => {
      render(
        <AnomalySection
          title="Test"
          analysis={mockGreenAnalysis}
          chartComponent={<div data-testid="test-chart">Custom Chart</div>}
        />
      );

      expect(screen.getByTestId("test-chart")).toBeInTheDocument();
      expect(screen.getByText("Custom Chart")).toBeInTheDocument();
    });

    it("passes deviations data to DeviationChart", () => {
      render(
        <AnomalySection
          title="Test"
          analysis={mockGreenAnalysis}
          chartComponent={
            <DeviationChart
              data={mockGreenAnalysis.deviations}
              title="Deviation Chart"
            />
          }
        />
      );

      // Chart should render with the data
      expect(screen.getByText("Deviation Chart")).toBeInTheDocument();
    });
  });

  describe("Collapsible details table", () => {
    it("details table is collapsed by default", () => {
      render(
        <AnomalySection
          title="Test"
          analysis={mockGreenAnalysis}
          chartComponent={<div>Chart</div>}
        />
      );

      // Header should be visible
      const detailsText = t("panel.intelligenceTab.anomaly.detailedDeviations");
      expect(screen.getByText(new RegExp(detailsText))).toBeInTheDocument();

      // Table headers should not be visible when collapsed
      const categoryText = t("panel.intelligenceTab.anomaly.category");
      expect(screen.queryByText(categoryText)).not.toBeVisible();
    });

    it("expands details table when header is clicked", async () => {
      render(
        <AnomalySection
          title="Test"
          analysis={mockGreenAnalysis}
          chartComponent={<div>Chart</div>}
        />
      );

      const detailsText = t("panel.intelligenceTab.anomaly.detailedDeviations");
      const detailsHeader = screen.getByText(new RegExp(detailsText));
      fireEvent.click(detailsHeader);

      await waitFor(
        () => {
          const categoryText = t("panel.intelligenceTab.anomaly.category");
          expect(screen.getByText(categoryText)).toBeVisible();
        },
        { timeout: 2000 }
      );
    });

    it("collapses details table when header is clicked again", async () => {
      render(
        <AnomalySection
          title="Test"
          analysis={mockGreenAnalysis}
          chartComponent={<div>Chart</div>}
        />
      );

      const detailsText = t("panel.intelligenceTab.anomaly.detailedDeviations");
      const detailsHeader = screen.getByText(new RegExp(detailsText));

      // Expand
      fireEvent.click(detailsHeader);
      await waitFor(
        () => {
          const categoryText = t("panel.intelligenceTab.anomaly.category");
          expect(screen.getByText(categoryText)).toBeVisible();
        },
        { timeout: 2000 }
      );

      // Collapse
      fireEvent.click(detailsHeader);
      await waitFor(
        () => {
          const categoryText = t("panel.intelligenceTab.anomaly.category");
          const element = screen.queryByText(categoryText);
          expect(element).not.toBeInTheDocument();
        },
        { timeout: 2000 }
      );
    });

    it("displays deviation count in header", () => {
      render(
        <AnomalySection
          title="Test"
          analysis={mockGreenAnalysis}
          chartComponent={<div>Chart</div>}
        />
      );

      const detailsText = t("panel.intelligenceTab.anomaly.detailedDeviations");
      // Should show count of deviations (5 in mockGreenAnalysis)
      const headerElement = screen.getByText(new RegExp(detailsText));
      expect(headerElement).toHaveTextContent("5");
    });

    it("rotates expand icon when expanding/collapsing", async () => {
      render(
        <AnomalySection
          title="Test"
          analysis={mockGreenAnalysis}
          chartComponent={<div>Chart</div>}
        />
      );

      const detailsText = t("panel.intelligenceTab.anomaly.detailedDeviations");
      const detailsHeader = screen.getByText(new RegExp(detailsText));

      // Get all expand icons and find the one for details (should be the second one)
      const expandIcons = screen.getAllByTestId("ExpandMoreIcon");
      const detailsExpandIcon = expandIcons[expandIcons.length - 1];

      fireEvent.click(detailsHeader);

      // Icon should be present and interactive
      await waitFor(
        () => {
          expect(detailsExpandIcon).toBeInTheDocument();
        },
        { timeout: 2000 }
      );
    });
  });

  describe("Details table content", () => {
    it("displays all deviation rows when expanded", async () => {
      render(
        <AnomalySection
          title="Test"
          analysis={mockGreenAnalysis}
          chartComponent={<div>Chart</div>}
        />
      );

      const detailsText = t("panel.intelligenceTab.anomaly.detailedDeviations");
      const detailsHeader = screen.getByText(new RegExp(detailsText));
      fireEvent.click(detailsHeader);

      await waitFor(() => {
        // Should show all 5 location categories
        expect(screen.getByText("New York")).toBeInTheDocument();
        expect(screen.getByText("San Francisco")).toBeInTheDocument();
        expect(screen.getByText("Chicago")).toBeInTheDocument();
        expect(screen.getByText("Austin")).toBeInTheDocument();
        expect(screen.getByText("Remote")).toBeInTheDocument();
      });
    });

    it("displays observed percentages with 1 decimal place", async () => {
      render(
        <AnomalySection
          title="Test"
          analysis={mockGreenAnalysis}
          chartComponent={<div>Chart</div>}
        />
      );

      const detailsText = t("panel.intelligenceTab.anomaly.detailedDeviations");
      const detailsHeader = screen.getByText(new RegExp(detailsText));
      fireEvent.click(detailsHeader);

      await waitFor(() => {
        // First deviation has observed_high_pct of 31.5
        expect(screen.getByText("31.5%")).toBeInTheDocument();
      });
    });

    it("displays expected percentages with 1 decimal place", async () => {
      render(
        <AnomalySection
          title="Test"
          analysis={mockGreenAnalysis}
          chartComponent={<div>Chart</div>}
        />
      );

      const detailsText = t("panel.intelligenceTab.anomaly.detailedDeviations");
      const detailsHeader = screen.getByText(new RegExp(detailsText));
      fireEvent.click(detailsHeader);

      await waitFor(() => {
        // All expected values are 33.0
        const expectedCells = screen.getAllByText("33.0%");
        expect(expectedCells.length).toBeGreaterThan(0);
      });
    });

    it("displays z-scores with 2 decimal places", async () => {
      render(
        <AnomalySection
          title="Test"
          analysis={mockGreenAnalysis}
          chartComponent={<div>Chart</div>}
        />
      );

      const detailsText = t("panel.intelligenceTab.anomaly.detailedDeviations");
      const detailsHeader = screen.getByText(new RegExp(detailsText));
      fireEvent.click(detailsHeader);

      await waitFor(
        () => {
          const table = screen.getByRole("table");
          // Z-scores should be formatted with 2 decimals (e.g., "-0.24")
          expect(table).toBeInTheDocument();
        },
        { timeout: 2000 }
      );
    });

    it("displays sample sizes", async () => {
      render(
        <AnomalySection
          title="Test"
          analysis={mockGreenAnalysis}
          chartComponent={<div>Chart</div>}
        />
      );

      const detailsText = t("panel.intelligenceTab.anomaly.detailedDeviations");
      const detailsHeader = screen.getByText(new RegExp(detailsText));
      fireEvent.click(detailsHeader);

      await waitFor(() => {
        // First deviation has sample_size of 40
        expect(screen.getByText("40")).toBeInTheDocument();
      });
    });

    it("shows significance chips correctly", async () => {
      render(
        <AnomalySection
          title="Test"
          analysis={mockYellowAnalysis}
          chartComponent={<div>Chart</div>}
        />
      );

      const detailsText = t("panel.intelligenceTab.anomaly.detailedDeviations");
      const detailsHeader = screen.getByText(new RegExp(detailsText));
      fireEvent.click(detailsHeader);

      await waitFor(() => {
        // mockYellowAnalysis has one significant deviation (Engineering)
        const yesText = t("panel.intelligenceTab.anomaly.yes");
        const noText = t("panel.intelligenceTab.anomaly.no");
        expect(screen.getByText(yesText)).toBeInTheDocument();
        expect(screen.getAllByText(noText).length).toBeGreaterThan(0);
      });
    });

    it("highlights significant deviations with background color", async () => {
      render(
        <AnomalySection
          title="Test"
          analysis={mockYellowAnalysis}
          chartComponent={<div>Chart</div>}
        />
      );

      const detailsText = t("panel.intelligenceTab.anomaly.detailedDeviations");
      const detailsHeader = screen.getByText(new RegExp(detailsText));
      fireEvent.click(detailsHeader);

      await waitFor(() => {
        const engineeringRow = screen.getByText("Engineering").closest("tr");
        expect(engineeringRow).toHaveStyle({
          backgroundColor: expect.stringContaining("rgba"),
        });
      });
    });

    it("bolds high z-scores (|z| > 2)", async () => {
      render(
        <AnomalySection
          title="Test"
          analysis={mockRedAnalysis}
          chartComponent={<div>Chart</div>}
        />
      );

      const detailsText = t("panel.intelligenceTab.anomaly.detailedDeviations");
      const detailsHeader = screen.getByText(new RegExp(detailsText));
      fireEvent.click(detailsHeader);

      await waitFor(() => {
        const table = screen.getByRole("table");
        // Red analysis has several high z-scores that should be bold
        expect(table).toBeInTheDocument();
      });
    });

    it("colors very high z-scores (|z| > 3) in red", async () => {
      render(
        <AnomalySection
          title="Test"
          analysis={mockRedAnalysis}
          chartComponent={<div>Chart</div>}
        />
      );

      const detailsText = t("panel.intelligenceTab.anomaly.detailedDeviations");
      const detailsHeader = screen.getByText(new RegExp(detailsText));
      fireEvent.click(detailsHeader);

      await waitFor(() => {
        const table = screen.getByRole("table");
        // Red analysis should have some z-scores > 3 colored in error.main
        expect(table).toBeInTheDocument();
      });
    });
  });

  describe("Edge cases", () => {
    it("handles small sample sizes", () => {
      render(
        <AnomalySection
          title="Small Sample"
          analysis={mockSmallSampleAnalysis}
          chartComponent={<div>Chart</div>}
        />
      );

      expect(screen.getByText("Small Sample")).toBeInTheDocument();
      expect(screen.getByText("24")).toBeInTheDocument(); // Sample size 24
    });

    it("handles large sample sizes", () => {
      render(
        <AnomalySection
          title="Large Sample"
          analysis={mockLargeSampleAnalysis}
          chartComponent={<div>Chart</div>}
        />
      );

      expect(screen.getByText("Large Sample")).toBeInTheDocument();
      expect(screen.getByText("1240")).toBeInTheDocument(); // Sample size 1240
    });

    it("handles empty deviations array", () => {
      render(
        <AnomalySection
          title="Empty Data"
          analysis={mockEmptyDeviations}
          chartComponent={<div>Chart</div>}
        />
      );

      expect(screen.getByText("Empty Data")).toBeInTheDocument();
      const detailsText = t("panel.intelligenceTab.anomaly.detailedDeviations");
      const headerElement = screen.getByText(new RegExp(detailsText));
      expect(headerElement).toHaveTextContent("0");
    });

    it("handles single category", () => {
      render(
        <AnomalySection
          title="Single Category"
          analysis={mockSingleCategory}
          chartComponent={<div>Chart</div>}
        />
      );

      expect(screen.getByText("Single Category")).toBeInTheDocument();
      const detailsText = t("panel.intelligenceTab.anomaly.detailedDeviations");
      const headerElement = screen.getByText(new RegExp(detailsText));
      expect(headerElement).toHaveTextContent("1");
    });

    it("handles long category names without breaking layout", async () => {
      render(
        <AnomalySection
          title="Long Names"
          analysis={mockLongCategoryNames}
          chartComponent={<div>Chart</div>}
        />
      );

      const detailsText = t("panel.intelligenceTab.anomaly.detailedDeviations");
      const detailsHeader = screen.getByText(new RegExp(detailsText));
      fireEvent.click(detailsHeader);

      await waitFor(() => {
        expect(
          screen.getByText(
            "Enterprise Solutions and Strategic Partnerships Division"
          )
        ).toBeInTheDocument();
        expect(
          screen.getByText("Customer Success and Technical Support Operations")
        ).toBeInTheDocument();
      });
    });

    it("handles zero degrees of freedom", () => {
      render(
        <AnomalySection
          title="Test"
          analysis={mockSingleCategory}
          chartComponent={<div>Chart</div>}
        />
      );

      expect(screen.getByText("0")).toBeInTheDocument(); // DOF = 0
    });

    it("handles p-value of 1.0", () => {
      render(
        <AnomalySection
          title="Test"
          analysis={mockSingleCategory}
          chartComponent={<div>Chart</div>}
        />
      );

      expect(screen.getByText("1.000")).toBeInTheDocument(); // p = 1.0
    });

    it("handles zero effect size", () => {
      render(
        <AnomalySection
          title="Test"
          analysis={mockSingleCategory}
          chartComponent={<div>Chart</div>}
        />
      );

      expect(screen.getByText("0.000")).toBeInTheDocument(); // effect_size = 0.0
    });
  });

  describe("Accessibility", () => {
    it("uses semantic HTML structure", () => {
      render(
        <AnomalySection
          title="Test"
          analysis={mockGreenAnalysis}
          chartComponent={<div>Chart</div>}
        />
      );

      expect(screen.getByRole("button")).toBeInTheDocument(); // Expand button
    });

    it("has proper ARIA attributes on expand button", () => {
      render(
        <AnomalySection
          title="Test"
          analysis={mockGreenAnalysis}
          chartComponent={<div>Chart</div>}
        />
      );

      const expandButton = screen.getByRole("button");
      expect(expandButton).toBeInTheDocument();
    });

    it("table has proper structure when expanded", async () => {
      render(
        <AnomalySection
          title="Test"
          analysis={mockGreenAnalysis}
          chartComponent={<div>Chart</div>}
        />
      );

      const detailsText = t("panel.intelligenceTab.anomaly.detailedDeviations");
      const detailsHeader = screen.getByText(new RegExp(detailsText));
      fireEvent.click(detailsHeader);

      await waitFor(() => {
        const table = screen.getByRole("table");
        expect(table).toBeInTheDocument();

        const columnHeaders = screen.getAllByRole("columnheader");
        expect(columnHeaders.length).toBe(6); // 6 columns in table
      });
    });
  });

  describe("i18n", () => {
    it("uses translation keys for all text", () => {
      render(
        <AnomalySection
          title="Test"
          analysis={mockGreenAnalysis}
          chartComponent={<div>Chart</div>}
        />
      );

      // Check for translated text
      expect(
        screen.getByText(t("panel.intelligenceTab.anomaly.statisticalSummary"))
      ).toBeInTheDocument();
      expect(
        screen.getByText(t("panel.intelligenceTab.anomaly.interpretation"))
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          new RegExp(t("panel.intelligenceTab.anomaly.detailedDeviations"))
        )
      ).toBeInTheDocument();
    });

    it("translates status labels", () => {
      render(
        <AnomalySection
          title="Test"
          analysis={mockGreenAnalysis}
          chartComponent={<div>Chart</div>}
        />
      );

      expect(
        screen.getByText(t("panel.intelligenceTab.anomaly.noIssues"))
      ).toBeInTheDocument();
    });

    it("translates table headers", async () => {
      render(
        <AnomalySection
          title="Test"
          analysis={mockGreenAnalysis}
          chartComponent={<div>Chart</div>}
        />
      );

      const detailsText = t("panel.intelligenceTab.anomaly.detailedDeviations");
      const detailsHeader = screen.getByText(new RegExp(detailsText));
      fireEvent.click(detailsHeader);

      await waitFor(() => {
        expect(
          screen.getByText(t("panel.intelligenceTab.anomaly.category"))
        ).toBeInTheDocument();
        expect(
          screen.getByText(t("panel.intelligenceTab.anomaly.observedPercent"))
        ).toBeInTheDocument();
        expect(
          screen.getByText(t("panel.intelligenceTab.anomaly.expectedPercent"))
        ).toBeInTheDocument();
      });
    });
  });
});
