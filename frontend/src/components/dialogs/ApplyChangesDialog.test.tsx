import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@/test/utils";
import { ApplyChangesDialog } from "./ApplyChangesDialog";

describe("ApplyChangesDialog", () => {
  const mockOnApply = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    mockOnApply.mockClear();
    mockOnCancel.mockClear();
  });

  it("displays filename when rendered", () => {
    render(
      <ApplyChangesDialog
        open={true}
        filename="employees.xlsx"
        onApply={mockOnApply}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText(/employees\.xlsx/i)).toBeInTheDocument();
  });

  it("displays default behavior message", () => {
    render(
      <ApplyChangesDialog
        open={true}
        filename="employees.xlsx"
        onApply={mockOnApply}
        onCancel={mockOnCancel}
      />
    );

    expect(
      screen.getByText(/your changes will be saved to the original file/i)
    ).toBeInTheDocument();
  });

  it("checkbox is unchecked by default", () => {
    render(
      <ApplyChangesDialog
        open={true}
        filename="test.xlsx"
        onApply={mockOnApply}
        onCancel={mockOnCancel}
      />
    );

    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).not.toBeChecked();
  });

  it("calls onApply with update_original when unchecked", async () => {
    render(
      <ApplyChangesDialog
        open={true}
        filename="test.xlsx"
        onApply={mockOnApply}
        onCancel={mockOnCancel}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /apply/i }));

    await waitFor(() => {
      expect(mockOnApply).toHaveBeenCalledWith("update_original");
    });
  });

  it("prompts for new path when checkbox is checked", async () => {
    render(
      <ApplyChangesDialog
        open={true}
        filename="test.xlsx"
        onApply={mockOnApply}
        onCancel={mockOnCancel}
      />
    );

    // Check the "Save as new file" checkbox
    const checkbox = screen.getByRole("checkbox");
    fireEvent.click(checkbox);

    expect(checkbox).toBeChecked();
  });

  it("calls onCancel when Cancel button clicked", () => {
    render(
      <ApplyChangesDialog
        open={true}
        filename="test.xlsx"
        onApply={mockOnApply}
        onCancel={mockOnCancel}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });

  it("shows error message when provided", () => {
    render(
      <ApplyChangesDialog
        open={true}
        filename="test.xlsx"
        error="Could not find test.xlsx. Please save to a new location."
        onApply={mockOnApply}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText(/could not find/i)).toBeInTheDocument();
  });

  it("shows loading state when isLoading is true", () => {
    render(
      <ApplyChangesDialog
        open={true}
        filename="test.xlsx"
        isLoading={true}
        onApply={mockOnApply}
        onCancel={mockOnCancel}
      />
    );

    const applyButton = screen.getByRole("button", { name: /applying/i });
    expect(applyButton).toBeDisabled();
  });
});
