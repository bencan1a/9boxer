/**
 * Unit tests for AnomalyCard component
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@/test/utils";
import { AnomalyCard } from "../AnomalyCard";
import {
  mockFunctionAnomaly,
  mockLocationAnomaly,
  mockDistributionAnomaly,
  mockOutlierAnomaly,
  createCustomAnomaly,
} from "@/mocks/mockAnomalies";

describe("AnomalyCard", () => {
  describe("Rendering with different severities", () => {
    it("renders with critical severity", () => {
      render(<AnomalyCard anomaly={mockFunctionAnomaly} />);

      expect(screen.getByText(mockFunctionAnomaly.title)).toBeInTheDocument();
      expect(
        screen.getByTestId(`anomaly-card-${mockFunctionAnomaly.id}`)
      ).toBeInTheDocument();
      expect(screen.getByText(/critical/i)).toBeInTheDocument();
    });

    it("renders with warning severity", () => {
      render(<AnomalyCard anomaly={mockLocationAnomaly} />);

      expect(screen.getByText(mockLocationAnomaly.title)).toBeInTheDocument();
      expect(screen.getByText(/warning/i)).toBeInTheDocument();
    });

    it("renders with info severity", () => {
      render(<AnomalyCard anomaly={mockOutlierAnomaly} />);

      expect(screen.getByText(mockOutlierAnomaly.title)).toBeInTheDocument();
      expect(screen.getByText(/info/i)).toBeInTheDocument();
    });
  });

  describe("Content display", () => {
    it("displays title and description correctly", () => {
      render(<AnomalyCard anomaly={mockFunctionAnomaly} />);

      expect(screen.getByText(mockFunctionAnomaly.title)).toBeInTheDocument();
      expect(
        screen.getByText(mockFunctionAnomaly.description)
      ).toBeInTheDocument();
    });

    it("shows affected employee count with correct pluralization", () => {
      const singleEmployee = createCustomAnomaly({
        affectedEmployees: ["emp-1"],
      });
      const { rerender } = render(<AnomalyCard anomaly={singleEmployee} />);

      expect(screen.getByText(/1 employee/i)).toBeInTheDocument();

      const multipleEmployees = createCustomAnomaly({
        affectedEmployees: ["emp-1", "emp-2", "emp-3"],
      });
      rerender(<AnomalyCard anomaly={multipleEmployees} />);

      expect(screen.getByText(/3 employees/i)).toBeInTheDocument();
    });

    it("displays confidence percentage", () => {
      const anomaly = createCustomAnomaly({
        confidence: 0.92,
      });
      render(<AnomalyCard anomaly={anomaly} />);

      expect(screen.getByText(/92%/i)).toBeInTheDocument();
    });

    it("displays anomaly type", () => {
      render(<AnomalyCard anomaly={mockLocationAnomaly} />);

      // Type is displayed as a chip, search more specifically
      const typeChip = screen.getAllByText(/Location/i)[0];
      expect(typeChip).toBeInTheDocument();
    });
  });

  describe("Suggestion expansion", () => {
    it("shows suggestion when available", () => {
      render(<AnomalyCard anomaly={mockFunctionAnomaly} />);

      const showButton = screen.getByRole("button", {
        name: /show.*suggestion/i,
      });
      expect(showButton).toBeInTheDocument();
    });

    it("hides suggestion when not available", () => {
      const anomalyWithoutSuggestion = createCustomAnomaly({
        suggestion: undefined,
      });
      render(<AnomalyCard anomaly={anomalyWithoutSuggestion} />);

      expect(
        screen.queryByRole("button", { name: /show.*suggestion/i })
      ).not.toBeInTheDocument();
    });

    it("expands suggestion when Show button clicked", async () => {
      render(<AnomalyCard anomaly={mockFunctionAnomaly} />);

      const showButton = screen.getByRole("button", {
        name: /show.*suggestion/i,
      });
      fireEvent.click(showButton);

      await waitFor(() => {
        expect(
          screen.getByText(mockFunctionAnomaly.suggestion!)
        ).toBeInTheDocument();
      });
    });

    it("collapses suggestion when Hide button clicked", async () => {
      render(<AnomalyCard anomaly={mockFunctionAnomaly} />);

      const showButton = screen.getByRole("button", {
        name: /show.*suggestion/i,
      });
      fireEvent.click(showButton);

      await waitFor(() => {
        expect(
          screen.getByText(mockFunctionAnomaly.suggestion!)
        ).toBeInTheDocument();
      });

      const hideButton = screen.getByRole("button", {
        name: /hide.*suggestion/i,
      });
      fireEvent.click(hideButton);

      await waitFor(() => {
        expect(
          screen.queryByText(mockFunctionAnomaly.suggestion!)
        ).not.toBeVisible();
      });
    });

    it("has aria-expanded on expand button", () => {
      render(<AnomalyCard anomaly={mockFunctionAnomaly} />);

      const expandButton = screen.getByRole("button", {
        name: /show.*suggestion/i,
      });
      expect(expandButton).toHaveAttribute("aria-expanded", "false");

      fireEvent.click(expandButton);

      expect(expandButton).toHaveAttribute("aria-expanded", "true");
    });
  });

  describe("Click interactions", () => {
    it("calls onClick when card is clicked", () => {
      const handleClick = vi.fn();
      render(
        <AnomalyCard anomaly={mockFunctionAnomaly} onClick={handleClick} />
      );

      const card = screen.getByTestId(`anomaly-card-${mockFunctionAnomaly.id}`);
      fireEvent.click(card);

      expect(handleClick).toHaveBeenCalledWith(mockFunctionAnomaly);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("does not call onClick when onDismiss button is clicked", () => {
      const handleClick = vi.fn();
      const handleDismiss = vi.fn();
      render(
        <AnomalyCard
          anomaly={mockFunctionAnomaly}
          onClick={handleClick}
          onDismiss={handleDismiss}
        />
      );

      const dismissButton = screen.getByTestId(
        `anomaly-dismiss-${mockFunctionAnomaly.id}`
      );
      fireEvent.click(dismissButton);

      expect(handleDismiss).toHaveBeenCalledWith(mockFunctionAnomaly.id);
      expect(handleClick).not.toHaveBeenCalled();
    });

    it("does not call onClick when expand button is clicked", () => {
      const handleClick = vi.fn();
      render(
        <AnomalyCard anomaly={mockFunctionAnomaly} onClick={handleClick} />
      );

      const expandButton = screen.getByRole("button", {
        name: /show.*suggestion/i,
      });
      fireEvent.click(expandButton);

      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe("Dismiss functionality", () => {
    it("calls onDismiss when dismiss button clicked", () => {
      const handleDismiss = vi.fn();
      render(
        <AnomalyCard anomaly={mockFunctionAnomaly} onDismiss={handleDismiss} />
      );

      const dismissButton = screen.getByTestId(
        `anomaly-dismiss-${mockFunctionAnomaly.id}`
      );
      fireEvent.click(dismissButton);

      expect(handleDismiss).toHaveBeenCalledWith(mockFunctionAnomaly.id);
      expect(handleDismiss).toHaveBeenCalledTimes(1);
    });

    it("shows dismiss button when onDismiss provided and showActions is true", () => {
      render(
        <AnomalyCard
          anomaly={mockFunctionAnomaly}
          onDismiss={vi.fn()}
          showActions
        />
      );

      expect(
        screen.getByTestId(`anomaly-dismiss-${mockFunctionAnomaly.id}`)
      ).toBeInTheDocument();
    });

    it("hides dismiss button when showActions is false", () => {
      render(
        <AnomalyCard
          anomaly={mockFunctionAnomaly}
          onDismiss={vi.fn()}
          showActions={false}
        />
      );

      expect(
        screen.queryByTestId(`anomaly-dismiss-${mockFunctionAnomaly.id}`)
      ).not.toBeInTheDocument();
    });

    it("hides dismiss button when onDismiss not provided", () => {
      render(<AnomalyCard anomaly={mockFunctionAnomaly} showActions />);

      expect(
        screen.queryByTestId(`anomaly-dismiss-${mockFunctionAnomaly.id}`)
      ).not.toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("has role='button' when onClick provided", () => {
      render(<AnomalyCard anomaly={mockFunctionAnomaly} onClick={vi.fn()} />);

      const card = screen.getByTestId(`anomaly-card-${mockFunctionAnomaly.id}`);
      expect(card).toHaveAttribute("role", "button");
    });

    it("does not have role='button' when onClick not provided", () => {
      render(<AnomalyCard anomaly={mockFunctionAnomaly} />);

      const card = screen.getByTestId(`anomaly-card-${mockFunctionAnomaly.id}`);
      expect(card).not.toHaveAttribute("role", "button");
    });

    it("has ARIA label when clickable", () => {
      render(<AnomalyCard anomaly={mockFunctionAnomaly} onClick={vi.fn()} />);

      const card = screen.getByTestId(`anomaly-card-${mockFunctionAnomaly.id}`);
      expect(card).toHaveAttribute("aria-label");
    });

    it("does not have ARIA label when not clickable", () => {
      render(<AnomalyCard anomaly={mockFunctionAnomaly} />);

      const card = screen.getByTestId(`anomaly-card-${mockFunctionAnomaly.id}`);
      expect(card).not.toHaveAttribute("aria-label");
    });

    it("has tabIndex when clickable", () => {
      render(<AnomalyCard anomaly={mockFunctionAnomaly} onClick={vi.fn()} />);

      const card = screen.getByTestId(`anomaly-card-${mockFunctionAnomaly.id}`);
      expect(card).toHaveAttribute("tabIndex", "0");
    });

    it("does not have tabIndex when not clickable", () => {
      render(<AnomalyCard anomaly={mockFunctionAnomaly} />);

      const card = screen.getByTestId(`anomaly-card-${mockFunctionAnomaly.id}`);
      expect(card).not.toHaveAttribute("tabIndex");
    });

    it("dismiss button has aria-label", () => {
      render(<AnomalyCard anomaly={mockFunctionAnomaly} onDismiss={vi.fn()} />);

      const dismissButton = screen.getByTestId(
        `anomaly-dismiss-${mockFunctionAnomaly.id}`
      );
      expect(dismissButton).toHaveAttribute("aria-label");
    });
  });

  describe("Keyboard interactions", () => {
    it("responds to Enter key when clickable", () => {
      const handleClick = vi.fn();
      render(
        <AnomalyCard anomaly={mockFunctionAnomaly} onClick={handleClick} />
      );

      const card = screen.getByTestId(`anomaly-card-${mockFunctionAnomaly.id}`);
      fireEvent.keyDown(card, { key: "Enter", code: "Enter" });

      expect(handleClick).toHaveBeenCalledWith(mockFunctionAnomaly);
    });

    it("responds to Space key when clickable", () => {
      const handleClick = vi.fn();
      render(
        <AnomalyCard anomaly={mockFunctionAnomaly} onClick={handleClick} />
      );

      const card = screen.getByTestId(`anomaly-card-${mockFunctionAnomaly.id}`);
      fireEvent.keyDown(card, { key: " ", code: "Space" });

      expect(handleClick).toHaveBeenCalledWith(mockFunctionAnomaly);
    });

    it("does not respond to other keys", () => {
      const handleClick = vi.fn();
      render(
        <AnomalyCard anomaly={mockFunctionAnomaly} onClick={handleClick} />
      );

      const card = screen.getByTestId(`anomaly-card-${mockFunctionAnomaly.id}`);
      fireEvent.keyDown(card, { key: "a", code: "KeyA" });

      expect(handleClick).not.toHaveBeenCalled();
    });

    it("does not respond to keys when not clickable", () => {
      render(<AnomalyCard anomaly={mockFunctionAnomaly} />);

      const card = screen.getByTestId(`anomaly-card-${mockFunctionAnomaly.id}`);
      fireEvent.keyDown(card, { key: "Enter", code: "Enter" });

      // Should not throw error
      expect(card).toBeInTheDocument();
    });
  });

  describe("Severity styling", () => {
    it("uses correct styling for critical severity", () => {
      render(<AnomalyCard anomaly={mockFunctionAnomaly} />);

      const card = screen.getByTestId(`anomaly-card-${mockFunctionAnomaly.id}`);
      // Check that the card has a styled border
      expect(card).toHaveStyle({ borderLeft: expect.stringContaining("4px") });
    });

    it("uses correct styling for warning severity", () => {
      render(<AnomalyCard anomaly={mockLocationAnomaly} />);

      const card = screen.getByTestId(`anomaly-card-${mockLocationAnomaly.id}`);
      expect(card).toHaveStyle({ borderLeft: expect.stringContaining("4px") });
    });

    it("uses correct styling for info severity", () => {
      render(<AnomalyCard anomaly={mockOutlierAnomaly} />);

      const card = screen.getByTestId(`anomaly-card-${mockOutlierAnomaly.id}`);
      expect(card).toHaveStyle({ borderLeft: expect.stringContaining("4px") });
    });
  });

  describe("i18n", () => {
    it("uses i18n keys for severity labels", () => {
      render(<AnomalyCard anomaly={mockFunctionAnomaly} />);

      // Severity labels should be translated
      expect(screen.getByText(/critical/i)).toBeInTheDocument();
    });

    it("uses i18n keys for button text", () => {
      render(<AnomalyCard anomaly={mockFunctionAnomaly} />);

      expect(
        screen.getByRole("button", { name: /show.*suggestion/i })
      ).toBeInTheDocument();
    });

    it("uses i18n keys for employee count", () => {
      render(<AnomalyCard anomaly={mockFunctionAnomaly} />);

      // Check that the text is rendered (even if split across elements)
      const card = screen.getByTestId(`anomaly-card-${mockFunctionAnomaly.id}`);
      expect(card).toHaveTextContent("Affected");
      expect(card).toHaveTextContent("8 employees");
    });
  });

  describe("Edge cases", () => {
    it("handles zero affected employees", () => {
      const anomaly = createCustomAnomaly({
        affectedEmployees: [],
      });
      render(<AnomalyCard anomaly={anomaly} />);

      expect(screen.getByText(/0 employees/i)).toBeInTheDocument();
    });

    it("handles very low confidence", () => {
      const anomaly = createCustomAnomaly({
        confidence: 0.01,
      });
      render(<AnomalyCard anomaly={anomaly} />);

      expect(screen.getByText(/1%/i)).toBeInTheDocument();
    });

    it("handles maximum confidence", () => {
      const anomaly = createCustomAnomaly({
        confidence: 1.0,
      });
      render(<AnomalyCard anomaly={anomaly} />);

      expect(screen.getByText(/100%/i)).toBeInTheDocument();
    });

    it("handles long titles without breaking layout", () => {
      const anomaly = createCustomAnomaly({
        title:
          "A very long anomaly title that should not break the card layout even on small screens",
      });
      render(<AnomalyCard anomaly={anomaly} />);

      expect(
        screen.getByText(
          /A very long anomaly title that should not break the card layout/
        )
      ).toBeInTheDocument();
    });

    it("handles long descriptions without breaking layout", () => {
      const anomaly = createCustomAnomaly({
        description:
          "This is a very long description that contains a lot of text and should wrap properly without breaking the card layout. It should remain readable and accessible even when there is a lot of content to display.",
      });
      render(<AnomalyCard anomaly={anomaly} />);

      expect(
        screen.getByText(/This is a very long description/)
      ).toBeInTheDocument();
    });
  });
});
