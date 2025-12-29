import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@/test/utils";
import { UnsavedChangesDialog } from "./UnsavedChangesDialog";

describe("UnsavedChangesDialog", () => {
  it("displays change count when rendered", () => {
    render(
      <UnsavedChangesDialog
        open={true}
        changeCount={5}
        onApply={vi.fn()}
        onDiscard={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    expect(screen.getByText(/5 unsaved change/i)).toBeInTheDocument();
  });

  it("calls onApply when Apply Changes button clicked", () => {
    const handleApply = vi.fn();
    render(
      <UnsavedChangesDialog
        open={true}
        changeCount={3}
        onApply={handleApply}
        onDiscard={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /apply changes/i }));
    expect(handleApply).toHaveBeenCalledTimes(1);
  });

  it("calls onDiscard when Discard Changes button clicked", () => {
    const handleDiscard = vi.fn();
    render(
      <UnsavedChangesDialog
        open={true}
        changeCount={3}
        onApply={vi.fn()}
        onDiscard={handleDiscard}
        onCancel={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /discard/i }));
    expect(handleDiscard).toHaveBeenCalledTimes(1);
  });

  it("calls onCancel when Cancel button clicked", () => {
    const handleCancel = vi.fn();
    render(
      <UnsavedChangesDialog
        open={true}
        changeCount={3}
        onApply={vi.fn()}
        onDiscard={vi.fn()}
        onCancel={handleCancel}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
    expect(handleCancel).toHaveBeenCalledTimes(1);
  });

  it("does not render when open is false", () => {
    render(
      <UnsavedChangesDialog
        open={false}
        changeCount={3}
        onApply={vi.fn()}
        onDiscard={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    expect(screen.queryByText(/unsaved change/i)).not.toBeInTheDocument();
  });

  it("shows singular form for 1 change", () => {
    render(
      <UnsavedChangesDialog
        open={true}
        changeCount={1}
        onApply={vi.fn()}
        onDiscard={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    expect(screen.getByText(/1 unsaved change/i)).toBeInTheDocument();
  });
});
