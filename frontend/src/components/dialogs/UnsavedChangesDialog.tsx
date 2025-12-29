/**
 * Unsaved Changes Dialog Component
 *
 * Warns users before discarding unsaved changes when loading new file,
 * closing file, or other session-clearing actions.
 */

import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import WarningIcon from "@mui/icons-material/Warning";
import { useTheme } from "@mui/material/styles";

export interface UnsavedChangesDialogProps {
  /** Whether the dialog is open */
  open: boolean;
  /** Number of unsaved changes */
  changeCount: number;
  /** Callback when Apply Changes button is clicked */
  onApply: () => void;
  /** Callback when Discard Changes button is clicked */
  onDiscard: () => void;
  /** Callback when Cancel button is clicked or dialog is closed */
  onCancel: () => void;
}

/**
 * Dialog for warning about unsaved changes.
 * Provides options to apply, discard, or cancel the operation.
 */
export const UnsavedChangesDialog: React.FC<UnsavedChangesDialogProps> = ({
  open,
  changeCount,
  onApply,
  onDiscard,
  onCancel,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <Dialog
      open={open}
      onClose={onCancel}
      maxWidth="sm"
      fullWidth
      data-testid="unsaved-changes-dialog"
      aria-labelledby="unsaved-changes-dialog-title"
      aria-describedby="unsaved-changes-dialog-description"
    >
      <DialogTitle
        id="unsaved-changes-dialog-title"
        sx={{
          display: "flex",
          alignItems: "center",
          gap: theme.tokens.spacing.sm / 8,
        }}
      >
        <WarningIcon color="warning" />
        <Typography variant="h6" component="span">
          {t("dialogs.unsavedChanges.title", "Unsaved Changes")}
        </Typography>
      </DialogTitle>

      <DialogContent id="unsaved-changes-dialog-description">
        <Typography variant="body1" gutterBottom>
          {t("dialogs.unsavedChanges.message", {
            count: changeCount,
            defaultValue:
              changeCount === 1
                ? "You have {{count}} unsaved change."
                : "You have {{count}} unsaved changes.",
          })}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: theme.tokens.spacing.md / 8 }}
        >
          {t(
            "dialogs.unsavedChanges.question",
            "Apply changes before continuing?"
          )}
        </Typography>
      </DialogContent>

      <DialogActions
        sx={{
          px: theme.tokens.spacing.lg / 8,
          pb: theme.tokens.spacing.md / 8,
        }}
      >
        <Button onClick={onCancel} color="inherit" data-testid="cancel-button">
          {t("common.cancel", "Cancel")}
        </Button>
        <Button
          onClick={onDiscard}
          color="error"
          variant="outlined"
          data-testid="discard-button"
        >
          {t("dialogs.unsavedChanges.discard", "Discard Changes")}
        </Button>
        <Button
          onClick={onApply}
          color="primary"
          variant="contained"
          data-testid="apply-button"
        >
          {t("dialogs.unsavedChanges.apply", "Apply Changes")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
