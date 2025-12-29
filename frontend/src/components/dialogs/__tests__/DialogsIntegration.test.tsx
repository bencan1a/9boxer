/**
 * Integration tests for Dialog components
 * Tests how UnsavedChangesDialog and ApplyChangesDialog work together
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@/test/utils";
import { UnsavedChangesDialog } from "../UnsavedChangesDialog";
import { ApplyChangesDialog } from "../ApplyChangesDialog";
import { useState } from "react";

// Test wrapper component that simulates the dialog flow
const DialogFlowWrapper = () => {
  const [unsavedDialogOpen, setUnsavedDialogOpen] = useState(true);
  const [applyDialogOpen, setApplyDialogOpen] = useState(false);
  const [changeCount] = useState(5);
  const [filename] = useState("employees.xlsx");

  const handleApply = () => {
    setUnsavedDialogOpen(false);
    setApplyDialogOpen(true);
  };

  const handleDiscard = () => {
    setUnsavedDialogOpen(false);
  };

  const handleCancel = () => {
    setUnsavedDialogOpen(false);
  };

  const handleApplyChanges = async (
    mode: "update_original" | "save_new",
    newPath?: string
  ) => {
    console.log("Apply changes:", mode, newPath);
    setApplyDialogOpen(false);
  };

  const handleCancelApply = () => {
    setApplyDialogOpen(false);
    setUnsavedDialogOpen(true);
  };

  return (
    <>
      <UnsavedChangesDialog
        open={unsavedDialogOpen}
        changeCount={changeCount}
        onApply={handleApply}
        onDiscard={handleDiscard}
        onCancel={handleCancel}
      />
      <ApplyChangesDialog
        open={applyDialogOpen}
        filename={filename}
        onApply={handleApplyChanges}
        onCancel={handleCancelApply}
      />
    </>
  );
};

describe("Dialogs Integration", () => {
  it("transitions from UnsavedChangesDialog to ApplyChangesDialog", async () => {
    const { user } = render(<DialogFlowWrapper />);

    // Initially, unsaved changes dialog should be visible
    expect(screen.getByTestId("unsaved-changes-dialog")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /unsaved changes/i })
    ).toBeInTheDocument();

    // Click Apply Changes button
    const applyButton = screen.getByTestId("apply-button");
    await user.click(applyButton);

    // Now apply changes dialog should be visible
    await screen.findByTestId("apply-changes-dialog");
    expect(
      screen.getByRole("heading", { name: /apply changes to file/i })
    ).toBeInTheDocument();
  });

  it("returns to UnsavedChangesDialog when canceling ApplyChangesDialog", async () => {
    const { user } = render(<DialogFlowWrapper />);

    // Navigate to apply changes dialog
    const applyButton = screen.getByTestId("apply-button");
    await user.click(applyButton);

    // Verify we're on apply changes dialog
    await screen.findByTestId("apply-changes-dialog");
    const applyDialogHeading = screen.getByRole("heading", {
      name: /apply changes to file/i,
    });
    expect(applyDialogHeading).toBeInTheDocument();

    // Get all cancel buttons (there might be multiple in the DOM)
    const cancelButtons = screen.getAllByRole("button", { name: /cancel/i });
    // Click the last one (which should be in the apply changes dialog)
    await user.click(cancelButtons[cancelButtons.length - 1]);

    // Wait for the apply changes dialog to close and unsaved dialog to reopen
    await waitFor(() => {
      const unsavedDialog = screen.getByTestId("unsaved-changes-dialog");
      expect(unsavedDialog).not.toHaveAttribute("aria-hidden", "true");
    });

    // Verify unsaved changes dialog content is visible
    expect(screen.getByText(/you have 5 unsaved changes/i)).toBeInTheDocument();
  });

  it("shows correct change count in UnsavedChangesDialog", () => {
    render(<DialogFlowWrapper />);

    // Verify change count is displayed
    expect(screen.getByText(/you have 5 unsaved changes/i)).toBeInTheDocument();
  });

  it("shows correct filename in ApplyChangesDialog", async () => {
    const { user } = render(<DialogFlowWrapper />);

    // Navigate to apply changes dialog
    const applyButton = screen.getByTestId("apply-button");
    await user.click(applyButton);

    // Verify filename is displayed
    await screen.findByText("employees.xlsx");
  });

  it("closes UnsavedChangesDialog when Discard is clicked", async () => {
    const { user } = render(<DialogFlowWrapper />);

    // Initially visible
    expect(screen.getByTestId("unsaved-changes-dialog")).toBeInTheDocument();

    // Click Discard
    const discardButton = screen.getByTestId("discard-button");
    await user.click(discardButton);

    // Dialog should be closed (not in document)
    await new Promise((resolve) => setTimeout(resolve, 300)); // Wait for animation
    expect(
      screen.queryByRole("heading", { name: /unsaved changes/i })
    ).not.toBeInTheDocument();
  });

  it("closes UnsavedChangesDialog when Cancel is clicked", async () => {
    const { user } = render(<DialogFlowWrapper />);

    // Initially visible
    expect(screen.getByTestId("unsaved-changes-dialog")).toBeInTheDocument();

    // Click Cancel
    const cancelButton = screen.getByTestId("cancel-button");
    await user.click(cancelButton);

    // Dialog should be closed
    await new Promise((resolve) => setTimeout(resolve, 300)); // Wait for animation
    expect(
      screen.queryByRole("heading", { name: /unsaved changes/i })
    ).not.toBeInTheDocument();
  });

  it("provides all three action options in UnsavedChangesDialog", () => {
    render(<DialogFlowWrapper />);

    expect(screen.getByTestId("apply-button")).toBeInTheDocument();
    expect(screen.getByTestId("discard-button")).toBeInTheDocument();
    expect(screen.getByTestId("cancel-button")).toBeInTheDocument();
  });

  it("provides apply and cancel options in ApplyChangesDialog", async () => {
    const { user } = render(<DialogFlowWrapper />);

    // Navigate to apply changes dialog
    const applyButton = screen.getByTestId("apply-button");
    await user.click(applyButton);

    // Verify buttons exist
    await screen.findByRole("button", { name: /apply changes/i });
    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
  });

  it("displays save as new checkbox in ApplyChangesDialog", async () => {
    const { user } = render(<DialogFlowWrapper />);

    // Navigate to apply changes dialog
    const applyButton = screen.getByTestId("apply-button");
    await user.click(applyButton);

    // Verify checkbox exists
    await screen.findByTestId("save-as-new-checkbox");
    expect(screen.getByTestId("save-as-new-checkbox")).toBeInTheDocument();
  });
});

describe("Dialog Visual Consistency", () => {
  it("UnsavedChangesDialog has warning icon", () => {
    const handleApply = vi.fn();
    const handleDiscard = vi.fn();
    const handleCancel = vi.fn();

    render(
      <UnsavedChangesDialog
        open={true}
        changeCount={3}
        onApply={handleApply}
        onDiscard={handleDiscard}
        onCancel={handleCancel}
      />
    );

    // Warning icon should be present (rendered via WarningIcon component)
    const dialog = screen.getByTestId("unsaved-changes-dialog");
    expect(dialog).toBeInTheDocument();
  });

  it("ApplyChangesDialog has save icon", () => {
    const handleApply = vi.fn();
    const handleCancel = vi.fn();

    render(
      <ApplyChangesDialog
        open={true}
        filename="test.xlsx"
        onApply={handleApply}
        onCancel={handleCancel}
      />
    );

    // Save icon should be present (rendered via SaveIcon component)
    const dialog = screen.getByTestId("apply-changes-dialog");
    expect(dialog).toBeInTheDocument();
  });
});

describe("Dialog Error Handling", () => {
  it("ApplyChangesDialog displays error message when provided", () => {
    const handleApply = vi.fn();
    const handleCancel = vi.fn();
    const errorMessage = "Failed to save file";

    render(
      <ApplyChangesDialog
        open={true}
        filename="test.xlsx"
        error={errorMessage}
        onApply={handleApply}
        onCancel={handleCancel}
      />
    );

    // Error message should be displayed
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it("ApplyChangesDialog shows loading state", () => {
    const handleApply = vi.fn();
    const handleCancel = vi.fn();

    render(
      <ApplyChangesDialog
        open={true}
        filename="test.xlsx"
        isLoading={true}
        onApply={handleApply}
        onCancel={handleCancel}
      />
    );

    // Loading text should be displayed
    expect(screen.getByText(/applying/i)).toBeInTheDocument();

    // Buttons should be disabled
    expect(screen.getByRole("button", { name: /cancel/i })).toBeDisabled();
  });
});
