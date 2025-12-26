/**
 * Unit tests for EmptyState component
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EmptyState } from "../EmptyState";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import UploadFileIcon from "@mui/icons-material/UploadFile";

describe("EmptyState", () => {
  it("renders title", () => {
    render(<EmptyState title="No data" />);
    expect(screen.getByText("No data")).toBeInTheDocument();
  });

  it("renders icon when provided", () => {
    render(
      <EmptyState
        title="No data"
        icon={<PersonOutlineIcon data-testid="person-icon" />}
      />
    );
    expect(screen.getByTestId("person-icon")).toBeInTheDocument();
  });

  it("renders description when provided", () => {
    render(
      <EmptyState
        title="No data"
        description="Please upload a file to continue"
      />
    );
    expect(
      screen.getByText("Please upload a file to continue")
    ).toBeInTheDocument();
  });

  it("renders action button when provided", () => {
    const handleClick = vi.fn();
    render(
      <EmptyState
        title="No data"
        action={{
          label: "Upload File",
          onClick: handleClick,
        }}
      />
    );
    
    const button = screen.getByRole("button", { name: "Upload File" });
    expect(button).toBeInTheDocument();
  });

  it("calls action onClick when button is clicked", async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    
    render(
      <EmptyState
        title="No data"
        action={{
          label: "Upload File",
          onClick: handleClick,
        }}
      />
    );
    
    const button = screen.getByRole("button", { name: "Upload File" });
    await user.click(button);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("renders action button with icon", () => {
    render(
      <EmptyState
        title="No data"
        action={{
          label: "Upload File",
          onClick: () => {},
          icon: <UploadFileIcon data-testid="upload-icon" />,
        }}
      />
    );
    
    expect(screen.getByTestId("upload-icon")).toBeInTheDocument();
  });

  it("renders hint text when provided", () => {
    render(
      <EmptyState
        title="No data"
        action={{
          label: "Upload File",
          onClick: () => {},
        }}
        hint="Supported formats: .xlsx, .xls"
      />
    );
    
    expect(
      screen.getByText("Supported formats: .xlsx, .xls")
    ).toBeInTheDocument();
  });

  it("applies different button variants", () => {
    const { rerender } = render(
      <EmptyState
        title="No data"
        action={{
          label: "Upload File",
          onClick: () => {},
          variant: "contained",
        }}
      />
    );
    
    const button = screen.getByRole("button", { name: "Upload File" });
    expect(button).toHaveClass("MuiButton-contained");
    
    rerender(
      <EmptyState
        title="No data"
        action={{
          label: "Upload File",
          onClick: () => {},
          variant: "outlined",
        }}
      />
    );
    
    expect(button).toHaveClass("MuiButton-outlined");
  });

  it("supports different icon sizes", () => {
    const { container, rerender } = render(
      <EmptyState
        title="No data"
        icon={<PersonOutlineIcon />}
        iconSize="small"
      />
    );
    
    // Check that component renders with small size
    expect(container.firstChild).toBeInTheDocument();
    
    rerender(
      <EmptyState
        title="No data"
        icon={<PersonOutlineIcon />}
        iconSize="large"
      />
    );
    
    // Check that component re-renders with large size
    expect(container.firstChild).toBeInTheDocument();
  });

  it("renders without icon", () => {
    render(<EmptyState title="No data" description="Some description" />);
    
    expect(screen.getByText("No data")).toBeInTheDocument();
    expect(screen.getByText("Some description")).toBeInTheDocument();
    // Icon container should not be present
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("applies custom sx styles", () => {
    const { container } = render(
      <EmptyState
        title="No data"
        sx={{ backgroundColor: "red", padding: 8 }}
      />
    );
    
    const emptyStateContainer = container.firstChild as HTMLElement;
    expect(emptyStateContainer).toBeInTheDocument();
  });
});
