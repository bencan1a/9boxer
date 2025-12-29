/**
 * Apply Changes Dialog Component
 *
 * Dialog for applying changes to Excel file with mode selection:
 * - Update original file (default)
 * - Save as new file (checkbox)
 */

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Checkbox,
  FormControlLabel,
  Alert,
  CircularProgress,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import SaveIcon from "@mui/icons-material/Save";
import { useElectronAPI } from "../../hooks/useElectronAPI";

export interface ApplyChangesDialogProps {
  open: boolean;
  filename: string;
  error?: string;
  isLoading?: boolean;
  onApply: (
    mode: "update_original" | "save_new",
    newPath?: string
  ) => Promise<void>;
  onCancel: () => void;
}

export const ApplyChangesDialog: React.FC<ApplyChangesDialogProps> = ({
  open,
  filename,
  error,
  isLoading = false,
  onApply,
  onCancel,
}) => {
  const { t } = useTranslation();
  const { saveFileDialog } = useElectronAPI();
  const [saveAsNew, setSaveAsNew] = useState(false);
  const [dialogError, setDialogError] = useState<string | undefined>(error);

  // Sync error prop with local state
  useEffect(() => {
    setDialogError(error);
  }, [error]);

  const handleApply = async () => {
    try {
      if (saveAsNew) {
        // Trigger file save dialog via Electron API
        const newPath = await saveFileDialog(filename);

        if (newPath) {
          await onApply("save_new", newPath);
        }
      } else {
        await onApply("update_original");
      }
    } catch (err) {
      // Handle Electron API errors (e.g., running in web mode)
      const errorMessage =
        err instanceof Error ? err.message : "Failed to save file";
      setDialogError(errorMessage);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setSaveAsNew(false); // Reset state on close
      setDialogError(undefined); // Clear any dialog-specific errors
      onCancel();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      data-testid="apply-changes-dialog"
      aria-labelledby="apply-changes-dialog-title"
      aria-describedby="apply-changes-dialog-description"
    >
      <DialogTitle
        id="apply-changes-dialog-title"
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        <SaveIcon color="primary" />
        <Typography variant="h6" component="span">
          {t("dialogs.applyChanges.title", "Apply Changes to File")}
        </Typography>
      </DialogTitle>

      <DialogContent id="apply-changes-dialog-description">
        <Typography variant="body1" gutterBottom>
          {t("dialogs.applyChanges.applyTo", "Apply changes to:")}
        </Typography>

        <Box
          sx={{
            bgcolor: "action.hover",
            p: 1.5,
            borderRadius: 1,
            mb: 2,
          }}
        >
          <Typography variant="body2" fontWeight="medium">
            {filename}
          </Typography>
        </Box>

        <Typography variant="body2" color="text.secondary">
          {t(
            "dialogs.applyChanges.defaultBehavior",
            "Your changes will be saved to the original file."
          )}
        </Typography>

        {dialogError && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {dialogError}
          </Alert>
        )}
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          pb: 2,
          flexDirection: "column",
          alignItems: "stretch",
          gap: 1,
        }}
      >
        <FormControlLabel
          control={
            <Checkbox
              checked={saveAsNew}
              onChange={(e) => setSaveAsNew(e.target.checked)}
              disabled={isLoading}
              data-testid="save-as-new-checkbox"
              size="small"
            />
          }
          label={
            <Typography variant="body2" color="text.secondary">
              {t(
                "dialogs.applyChanges.saveAsNew",
                "Save to a different file instead"
              )}
            </Typography>
          }
          sx={{ mb: 1 }}
        />

        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
          <Button onClick={handleClose} color="inherit" disabled={isLoading}>
            {t("common.cancel", "Cancel")}
          </Button>
          <Button
            onClick={handleApply}
            color="primary"
            variant="contained"
            disabled={isLoading}
            startIcon={
              isLoading ? <CircularProgress size={20} /> : <SaveIcon />
            }
          >
            {isLoading
              ? t("dialogs.applyChanges.applying", "Applying...")
              : t("dialogs.applyChanges.apply", "Apply Changes")}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};
