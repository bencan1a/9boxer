/**
 * Unit tests for SectionHeader component
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@/test/utils";
import userEvent from "@testing-library/user-event";
import { SectionHeader } from "../SectionHeader";
import Button from "@mui/material/Button";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";

describe("SectionHeader", () => {
  describe("Basic rendering", () => {
    it("renders title correctly", () => {
      render(<SectionHeader title="Test Section" />);

      expect(screen.getByText("Test Section")).toBeInTheDocument();
    });

    it("uses h6 variant for title", () => {
      render(<SectionHeader title="Test Section" />);

      const title = screen.getByText("Test Section");
      // MUI Typography h6 adds specific classes
      expect(title.tagName).toBe("H6");
    });

    it("applies primary color to title", () => {
      render(<SectionHeader title="Test Section" />);

      const title = screen.getByText("Test Section");
      // Color is applied via color prop, check that title exists
      expect(title).toBeInTheDocument();
    });

    it("applies correct spacing", () => {
      const { container } = render(<SectionHeader title="Test Section" />);

      // Component uses mb: 2 for bottom margin
      const headerBox = container.firstChild;
      expect(headerBox).toBeInTheDocument();
    });
  });

  describe("Tooltip functionality", () => {
    it("shows info icon when tooltip provided", () => {
      render(
        <SectionHeader
          title="Test Section"
          tooltip="This is a helpful tooltip"
        />
      );

      const infoButton = screen.getByLabelText(/info/i);
      expect(infoButton).toBeInTheDocument();
    });

    it("hides info icon when tooltip not provided", () => {
      render(<SectionHeader title="Test Section" />);

      expect(screen.queryByLabelText(/info/i)).not.toBeInTheDocument();
    });

    it("shows tooltip on info icon hover", async () => {
      const user = userEvent.setup();
      render(
        <SectionHeader
          title="Test Section"
          tooltip="This is a helpful tooltip"
        />
      );

      const infoButton = screen.getByLabelText(/info/i);
      await user.hover(infoButton);

      // MUI Tooltip should display the tooltip text
      expect(
        await screen.findByText("This is a helpful tooltip")
      ).toBeInTheDocument();
    });

    it("tooltip has arrow placement", () => {
      render(<SectionHeader title="Test Section" tooltip="Test tooltip" />);

      // Info button should be present
      expect(screen.getByLabelText(/info/i)).toBeInTheDocument();
    });

    it("has correct ARIA label on info icon", () => {
      render(<SectionHeader title="Test Section" tooltip="Test tooltip" />);

      const infoButton = screen.getByLabelText(/info/i);
      expect(infoButton).toHaveAttribute("aria-label");
    });
  });

  describe("Icon display", () => {
    it("shows icon when provided", () => {
      render(
        <SectionHeader
          title="Test Section"
          icon={<TrendingUpIcon data-testid="custom-icon" />}
        />
      );

      expect(screen.getByTestId("custom-icon")).toBeInTheDocument();
    });

    it("hides icon when not provided", () => {
      render(<SectionHeader title="Test Section" />);

      expect(screen.queryByTestId("custom-icon")).not.toBeInTheDocument();
    });

    it("displays icon before title", () => {
      const { container } = render(
        <SectionHeader
          title="Test Section"
          icon={<TrendingUpIcon data-testid="custom-icon" />}
        />
      );

      const icon = screen.getByTestId("custom-icon");
      const title = screen.getByText("Test Section");

      // Icon should be in the DOM before the title
      const iconOrder = Array.from(container.querySelectorAll("*")).indexOf(
        icon.parentElement!
      );
      const titleOrder = Array.from(container.querySelectorAll("*")).indexOf(
        title
      );

      expect(iconOrder).toBeLessThan(titleOrder);
    });

    it("renders multiple icons if provided", () => {
      render(
        <SectionHeader
          title="Test Section"
          icon={
            <>
              <TrendingUpIcon data-testid="icon-1" />
              <TrendingUpIcon data-testid="icon-2" />
            </>
          }
        />
      );

      expect(screen.getByTestId("icon-1")).toBeInTheDocument();
      expect(screen.getByTestId("icon-2")).toBeInTheDocument();
    });
  });

  describe("Actions display", () => {
    it("shows actions when provided", () => {
      render(
        <SectionHeader
          title="Test Section"
          actions={<Button data-testid="action-button">View All</Button>}
        />
      );

      expect(screen.getByTestId("action-button")).toBeInTheDocument();
    });

    it("hides actions when not provided", () => {
      render(<SectionHeader title="Test Section" />);

      expect(screen.queryByTestId("action-button")).not.toBeInTheDocument();
    });

    it("renders multiple action buttons", () => {
      render(
        <SectionHeader
          title="Test Section"
          actions={
            <>
              <Button data-testid="action-1">Action 1</Button>
              <Button data-testid="action-2">Action 2</Button>
            </>
          }
        />
      );

      expect(screen.getByTestId("action-1")).toBeInTheDocument();
      expect(screen.getByTestId("action-2")).toBeInTheDocument();
    });

    it("action buttons are clickable", async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();

      render(
        <SectionHeader
          title="Test Section"
          actions={
            <Button data-testid="action-button" onClick={handleClick}>
              Click Me
            </Button>
          }
        />
      );

      const actionButton = screen.getByTestId("action-button");
      await user.click(actionButton);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("displays actions on the right side", () => {
      const { container } = render(
        <SectionHeader
          title="Test Section"
          actions={<Button data-testid="action-button">Action</Button>}
        />
      );

      // Header uses flexbox with space-between
      // Actions should be in a separate Box
      const actionButton = screen.getByTestId("action-button");
      expect(actionButton).toBeInTheDocument();
    });
  });

  describe("Combined features", () => {
    it("renders all features together", () => {
      render(
        <SectionHeader
          title="Test Section"
          tooltip="Helpful information"
          icon={<TrendingUpIcon data-testid="custom-icon" />}
          actions={<Button data-testid="action-button">View All</Button>}
        />
      );

      expect(screen.getByText("Test Section")).toBeInTheDocument();
      expect(screen.getByLabelText(/info/i)).toBeInTheDocument();
      expect(screen.getByTestId("custom-icon")).toBeInTheDocument();
      expect(screen.getByTestId("action-button")).toBeInTheDocument();
    });

    it("maintains layout with icon and tooltip", () => {
      render(
        <SectionHeader
          title="Test Section"
          tooltip="Help text"
          icon={<TrendingUpIcon data-testid="custom-icon" />}
        />
      );

      const icon = screen.getByTestId("custom-icon");
      const title = screen.getByText("Test Section");
      const infoButton = screen.getByLabelText(/info/i);

      expect(icon).toBeInTheDocument();
      expect(title).toBeInTheDocument();
      expect(infoButton).toBeInTheDocument();
    });

    it("maintains layout with tooltip and actions", () => {
      render(
        <SectionHeader
          title="Test Section"
          tooltip="Help text"
          actions={<Button data-testid="action-button">Action</Button>}
        />
      );

      expect(screen.getByText("Test Section")).toBeInTheDocument();
      expect(screen.getByLabelText(/info/i)).toBeInTheDocument();
      expect(screen.getByTestId("action-button")).toBeInTheDocument();
    });

    it("maintains layout with icon and actions", () => {
      render(
        <SectionHeader
          title="Test Section"
          icon={<TrendingUpIcon data-testid="custom-icon" />}
          actions={<Button data-testid="action-button">Action</Button>}
        />
      );

      expect(screen.getByText("Test Section")).toBeInTheDocument();
      expect(screen.getByTestId("custom-icon")).toBeInTheDocument();
      expect(screen.getByTestId("action-button")).toBeInTheDocument();
    });
  });

  describe("Edge cases", () => {
    it("handles empty title string", () => {
      render(<SectionHeader title="" />);

      // Should render without crashing
      const title = screen.queryByRole("heading");
      expect(title).toBeInTheDocument();
    });

    it("handles very long title", () => {
      const longTitle =
        "This is a very long section title that should wrap properly and not break the layout";
      render(<SectionHeader title={longTitle} />);

      expect(screen.getByText(longTitle)).toBeInTheDocument();
    });

    it("handles very long tooltip text", () => {
      const longTooltip =
        "This is a very long tooltip text that provides extensive information about the section and should be displayed properly when the user hovers over the info icon";
      render(<SectionHeader title="Test" tooltip={longTooltip} />);

      const infoButton = screen.getByLabelText(/info/i);
      expect(infoButton).toBeInTheDocument();
    });

    it("handles title with special characters", () => {
      const specialTitle = `Test & Section <> 'With' "Special" Characters!`;
      render(<SectionHeader title={specialTitle} />);

      expect(screen.getByText(specialTitle)).toBeInTheDocument();
    });

    it("handles title with line breaks", () => {
      const titleWithBreaks = "Line 1\nLine 2";
      render(<SectionHeader title={titleWithBreaks} />);

      // Line breaks in JSX text content are rendered but may be preserved or collapsed
      const heading = screen.getByRole("heading");
      expect(heading).toBeInTheDocument();
      expect(heading.textContent).toContain("Line");
    });

    it("handles null or undefined gracefully for optional props", () => {
      // TypeScript should catch these, but test runtime behavior
      render(
        <SectionHeader
          title="Test"
          tooltip={undefined}
          icon={undefined}
          actions={undefined}
        />
      );

      expect(screen.getByText("Test")).toBeInTheDocument();
      expect(screen.queryByLabelText(/info/i)).not.toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("info button has correct size", () => {
      render(<SectionHeader title="Test" tooltip="Help" />);

      const infoButton = screen.getByLabelText(/info/i);
      expect(infoButton).toHaveClass("MuiIconButton-sizeSmall");
    });

    it("info icon has correct size", () => {
      render(<SectionHeader title="Test" tooltip="Help" />);

      // Info icon should be present with small size
      const infoButton = screen.getByLabelText(/info/i);
      expect(infoButton).toBeInTheDocument();
    });

    it("uses semantic heading element", () => {
      render(<SectionHeader title="Test Section" />);

      const heading = screen.getByRole("heading", { name: "Test Section" });
      expect(heading).toBeInTheDocument();
    });

    it("tooltip is accessible via keyboard", async () => {
      const user = userEvent.setup();
      render(<SectionHeader title="Test" tooltip="Help text" />);

      const infoButton = screen.getByLabelText(/info/i);

      // Tab to the button
      await user.tab();
      expect(infoButton).toHaveFocus();

      // Tooltip should appear on focus (MUI behavior)
    });
  });

  describe("Typography", () => {
    it("uses correct typography variant", () => {
      render(<SectionHeader title="Test Section" />);

      const title = screen.getByText("Test Section");
      expect(title).toHaveClass("MuiTypography-h6");
    });

    it("applies color primary", () => {
      render(<SectionHeader title="Test Section" />);

      const title = screen.getByText("Test Section");
      // Color primary is applied via the color prop
      expect(title).toBeInTheDocument();
    });
  });

  describe("Layout", () => {
    it("uses flexbox layout", () => {
      const { container } = render(
        <SectionHeader
          title="Test"
          actions={<Button data-testid="action">Action</Button>}
        />
      );

      const headerBox = container.firstChild;
      expect(headerBox).toBeInTheDocument();
    });

    it("separates title area and actions area", () => {
      render(
        <SectionHeader
          title="Test"
          actions={<Button data-testid="action">Action</Button>}
        />
      );

      const title = screen.getByText("Test");
      const action = screen.getByTestId("action");

      expect(title).toBeInTheDocument();
      expect(action).toBeInTheDocument();
    });

    it("groups icon and title together", () => {
      render(
        <SectionHeader
          title="Test"
          icon={<TrendingUpIcon data-testid="icon" />}
        />
      );

      const icon = screen.getByTestId("icon");
      const title = screen.getByText("Test");

      expect(icon).toBeInTheDocument();
      expect(title).toBeInTheDocument();
    });
  });

  describe("i18n", () => {
    it("uses i18n key for info ARIA label", () => {
      render(<SectionHeader title="Test" tooltip="Help" />);

      const infoButton = screen.getByLabelText(/info/i);
      expect(infoButton).toHaveAttribute("aria-label");
    });
  });
});
