/**
 * Unit tests for EmptyState component
 *
 * Tests cover:
 * - Rendering of heading and description
 * - Button click handlers
 * - Loading state behavior
 * - Button disabled states
 * - Accessibility (ARIA labels, roles, keyboard navigation)
 */

import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent } from "../../../test/utils";
import EmptyState from "../DashboardEmptyState";

describe("EmptyState", () => {
  const defaultProps = {
    onLoadSampleData: vi.fn(),
    onUploadFile: vi.fn(),
  };

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("renders heading and description", () => {
      render(<EmptyState {...defaultProps} />);

      expect(screen.getByText("No Employees Loaded")).toBeInTheDocument();
      expect(
        screen.getByText(
          /Load sample data to explore features, or upload your own Excel file/i
        )
      ).toBeInTheDocument();
    });

    it("renders primary action button", () => {
      render(<EmptyState {...defaultProps} />);

      const button = screen.getByRole("button", {
        name: /Load sample data with 200 employees/i,
      });
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent("Load Sample Data (200 employees)");
    });

    it("renders secondary action button", () => {
      render(<EmptyState {...defaultProps} />);

      const button = screen.getByRole("button", {
        name: /Upload Excel file with employee data/i,
      });
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent("Upload Excel File");
    });

    it("renders tutorial hint text", () => {
      render(<EmptyState {...defaultProps} />);

      expect(
        screen.getByText(
          /Sample data includes diverse employees across all 9-box positions/i
        )
      ).toBeInTheDocument();
    });

    it("has proper container with data-testid", () => {
      render(<EmptyState {...defaultProps} />);

      expect(screen.getByTestId("empty-state")).toBeInTheDocument();
    });
  });

  describe("Button Click Handlers", () => {
    it("calls onLoadSampleData when primary button is clicked", () => {
      const onLoadSampleData = vi.fn();
      render(
        <EmptyState {...defaultProps} onLoadSampleData={onLoadSampleData} />
      );

      const button = screen.getByTestId("load-sample-data-button");
      fireEvent.click(button);

      expect(onLoadSampleData).toHaveBeenCalledTimes(1);
    });

    it("calls onUploadFile when secondary button is clicked", () => {
      const onUploadFile = vi.fn();
      render(<EmptyState {...defaultProps} onUploadFile={onUploadFile} />);

      const button = screen.getByTestId("upload-file-button");
      fireEvent.click(button);

      expect(onUploadFile).toHaveBeenCalledTimes(1);
    });

    it("does not call handlers multiple times on single click", () => {
      const onLoadSampleData = vi.fn();
      const onUploadFile = vi.fn();
      render(
        <EmptyState
          onLoadSampleData={onLoadSampleData}
          onUploadFile={onUploadFile}
        />
      );

      fireEvent.click(screen.getByTestId("load-sample-data-button"));
      fireEvent.click(screen.getByTestId("upload-file-button"));

      expect(onLoadSampleData).toHaveBeenCalledTimes(1);
      expect(onUploadFile).toHaveBeenCalledTimes(1);
    });
  });

  describe("Loading State", () => {
    it("shows loading spinner when isLoading is true", () => {
      render(<EmptyState {...defaultProps} isLoading={true} />);

      expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
      expect(screen.getByLabelText("Loading sample data")).toBeInTheDocument();
    });

    it("shows loading status text when isLoading is true", () => {
      render(<EmptyState {...defaultProps} isLoading={true} />);

      expect(screen.getByText("Loading sample data...")).toBeInTheDocument();
    });

    it("does not show icon when loading", () => {
      render(<EmptyState {...defaultProps} isLoading={true} />);

      // Icon should be replaced by spinner
      expect(screen.queryByRole("img")).not.toBeInTheDocument();
    });

    it("hides tutorial hint when loading", () => {
      render(<EmptyState {...defaultProps} isLoading={true} />);

      expect(
        screen.queryByText(/Sample data includes diverse employees/i)
      ).not.toBeInTheDocument();
    });

    it("disables primary button when isLoading is true", () => {
      render(<EmptyState {...defaultProps} isLoading={true} />);

      const button = screen.getByTestId("load-sample-data-button");
      expect(button).toBeDisabled();
    });

    it("disables secondary button when isLoading is true", () => {
      render(<EmptyState {...defaultProps} isLoading={true} />);

      const button = screen.getByTestId("upload-file-button");
      expect(button).toBeDisabled();
    });

    it("does not call handlers when buttons are clicked while loading", () => {
      const onLoadSampleData = vi.fn();
      const onUploadFile = vi.fn();
      render(
        <EmptyState
          onLoadSampleData={onLoadSampleData}
          onUploadFile={onUploadFile}
          isLoading={true}
        />
      );

      fireEvent.click(screen.getByTestId("load-sample-data-button"));
      fireEvent.click(screen.getByTestId("upload-file-button"));

      expect(onLoadSampleData).not.toHaveBeenCalled();
      expect(onUploadFile).not.toHaveBeenCalled();
    });

    it("enables buttons when isLoading is false", () => {
      render(<EmptyState {...defaultProps} isLoading={false} />);

      expect(screen.getByTestId("load-sample-data-button")).not.toBeDisabled();
      expect(screen.getByTestId("upload-file-button")).not.toBeDisabled();
    });
  });

  describe("Accessibility", () => {
    it("has proper ARIA labels on buttons", () => {
      render(<EmptyState {...defaultProps} />);

      expect(
        screen.getByRole("button", {
          name: "Load sample data with 200 employees",
        })
      ).toBeInTheDocument();

      expect(
        screen.getByRole("button", {
          name: "Upload Excel file with employee data",
        })
      ).toBeInTheDocument();
    });

    it("has role=status on container for screen readers", () => {
      render(<EmptyState {...defaultProps} />);

      const container = screen.getByTestId("empty-state");
      expect(container).toHaveAttribute("role", "status");
    });

    it("has aria-live=polite on container", () => {
      render(<EmptyState {...defaultProps} />);

      const container = screen.getByTestId("empty-state");
      expect(container).toHaveAttribute("aria-live", "polite");
    });

    it("marks icon container as aria-hidden", () => {
      const { container } = render(<EmptyState {...defaultProps} />);

      // Find the icon container (the circle background)
      const iconContainer = container.querySelector('[aria-hidden="true"]');
      expect(iconContainer).toBeInTheDocument();
    });

    it("has aria-live on loading status text", () => {
      render(<EmptyState {...defaultProps} isLoading={true} />);

      const loadingText = screen.getByText("Loading sample data...");
      expect(loadingText).toHaveAttribute("aria-live", "polite");
    });

    it("supports keyboard navigation on buttons", () => {
      render(<EmptyState {...defaultProps} />);

      const primaryButton = screen.getByTestId("load-sample-data-button");
      const secondaryButton = screen.getByTestId("upload-file-button");

      // Both buttons should be focusable
      primaryButton.focus();
      expect(primaryButton).toHaveFocus();

      secondaryButton.focus();
      expect(secondaryButton).toHaveFocus();
    });

    it("uses semantic HTML elements", () => {
      render(<EmptyState {...defaultProps} />);

      // Check for proper heading
      const heading = screen.getByRole("heading", { level: 4 });
      expect(heading).toHaveTextContent("No Employees Loaded");

      // Check for buttons (not divs)
      const buttons = screen.getAllByRole("button");
      expect(buttons).toHaveLength(2);
    });
  });

  describe("Responsive Layout", () => {
    it("renders without errors", () => {
      const { container } = render(<EmptyState {...defaultProps} />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it("applies responsive styles to button container", () => {
      const { container } = render(<EmptyState {...defaultProps} />);

      // Button container should have flexbox layout
      const buttonContainer = container.querySelector(
        "[data-testid='empty-state'] > div:last-of-type"
      );
      expect(buttonContainer).toBeInTheDocument();
    });
  });

  describe("Default Props", () => {
    it("defaults isLoading to false", () => {
      render(<EmptyState {...defaultProps} />);

      expect(screen.queryByTestId("loading-spinner")).not.toBeInTheDocument();
      expect(screen.getByTestId("load-sample-data-button")).not.toBeDisabled();
    });
  });
});
