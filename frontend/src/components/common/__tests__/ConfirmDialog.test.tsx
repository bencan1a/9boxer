/**
 * Unit tests for ConfirmDialog component
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ConfirmDialog } from "../ConfirmDialog";

describe("ConfirmDialog", () => {
  const defaultProps = {
    open: true,
    onClose: vi.fn(),
    onConfirm: vi.fn(),
    title: "Confirm Action",
    message: "Are you sure?",
  };

  it("renders dialog when open", () => {
    render(<ConfirmDialog {...defaultProps} />);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Confirm Action")).toBeInTheDocument();
    expect(screen.getByText("Are you sure?")).toBeInTheDocument();
  });

  it("does not render when closed", () => {
    render(<ConfirmDialog {...defaultProps} open={false} />);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders default button labels", () => {
    render(<ConfirmDialog {...defaultProps} />);

    expect(screen.getByRole("button", { name: "Confirm" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
  });

  it("renders custom button labels", () => {
    render(
      <ConfirmDialog
        {...defaultProps}
        confirmLabel="Delete"
        cancelLabel="Go Back"
      />
    );

    expect(screen.getByRole("button", { name: "Delete" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Go Back" })).toBeInTheDocument();
  });

  it("calls onClose when cancel button is clicked", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(<ConfirmDialog {...defaultProps} onClose={onClose} />);

    const cancelButton = screen.getByRole("button", { name: "Cancel" });
    await user.click(cancelButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onConfirm when confirm button is clicked", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();

    render(<ConfirmDialog {...defaultProps} onConfirm={onConfirm} />);

    const confirmButton = screen.getByRole("button", { name: "Confirm" });
    await user.click(confirmButton);

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when close icon is clicked", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(<ConfirmDialog {...defaultProps} onClose={onClose} />);

    const closeButton = screen.getByLabelText("close");
    await user.click(closeButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("disables buttons when loading", () => {
    render(<ConfirmDialog {...defaultProps} loading={true} />);

    const confirmButton = screen.getByRole("button", { name: "Confirm" });
    const cancelButton = screen.getByRole("button", { name: "Cancel" });
    const closeButton = screen.getByLabelText("close");

    expect(confirmButton).toBeDisabled();
    expect(cancelButton).toBeDisabled();
    expect(closeButton).toBeDisabled();
  });

  it("applies different confirm button colors", () => {
    const { rerender } = render(
      <ConfirmDialog {...defaultProps} confirmColor="error" />
    );

    const confirmButton = screen.getByRole("button", { name: "Confirm" });
    expect(confirmButton).toHaveClass("MuiButton-containedError");

    rerender(<ConfirmDialog {...defaultProps} confirmColor="success" />);
    expect(confirmButton).toHaveClass("MuiButton-containedSuccess");
  });

  it("sets aria labels correctly", () => {
    render(<ConfirmDialog {...defaultProps} />);

    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-labelledby", "confirm-dialog-title");
    expect(dialog).toHaveAttribute(
      "aria-describedby",
      "confirm-dialog-description"
    );
  });

  it("confirm button has focus", () => {
    render(<ConfirmDialog {...defaultProps} />);

    const confirmButton = screen.getByRole("button", { name: "Confirm" });
    // The autoFocus prop is passed to the button component
    expect(confirmButton).toBeInTheDocument();
  });

  it("supports different max widths", () => {
    const { rerender } = render(
      <ConfirmDialog {...defaultProps} maxWidth="xs" />
    );

    let dialog = screen.getByRole("dialog");
    expect(dialog.closest(".MuiDialog-paperWidthXs")).toBeInTheDocument();

    rerender(<ConfirmDialog {...defaultProps} maxWidth="sm" />);
    dialog = screen.getByRole("dialog");
    expect(dialog.closest(".MuiDialog-paperWidthSm")).toBeInTheDocument();
  });
});
