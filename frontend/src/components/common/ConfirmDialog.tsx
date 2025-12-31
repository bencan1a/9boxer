/**
 * Reusable confirmation dialog component
 * Displays a consistent confirmation dialog with title, message, and action buttons
 */

import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Button,
  IconButton,
  Box,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import CloseIcon from "@mui/icons-material/Close";

export interface ConfirmDialogProps {
  /** Whether the dialog is open */
  open: boolean;
  /** Callback when dialog is closed */
  onClose: () => void;
  /** Callback when confirm action is triggered */
  onConfirm: () => void;
  /** Dialog title */
  title: string;
  /** Dialog message/content */
  message: string;
  /** Confirm button label (default: "Confirm") */
  confirmLabel?: string;
  /** Cancel button label (default: "Cancel") */
  cancelLabel?: string;
  /** Confirm button color (default: "primary") */
  confirmColor?:
    | "inherit"
    | "primary"
    | "secondary"
    | "error"
    | "warning"
    | "info"
    | "success";
  /** Whether to show loading state on confirm button */
  loading?: boolean;
  /** Maximum width of the dialog */
  maxWidth?: "xs" | "sm" | "md" | "lg" | "xl";
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel,
  cancelLabel,
  confirmColor = "primary",
  loading = false,
  maxWidth = "xs",
}) => {
  const theme = useTheme();
  const { t } = useTranslation();

  // Use translated defaults if labels not provided
  const confirmText = confirmLabel ?? t("dialogs.confirm", "Confirm");
  const cancelText = cancelLabel ?? t("common.cancel", "Cancel");

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-description"
    >
      <DialogTitle id="confirm-dialog-title">
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {title}
          <IconButton
            aria-label="close"
            onClick={onClose}
            size="small"
            disabled={loading}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="confirm-dialog-description">
          {message}
        </DialogContentText>
      </DialogContent>
      <DialogActions
        sx={{
          px: theme.tokens.spacing.lg / 8, // Convert 24px to 3
          pb: theme.tokens.spacing.md / 8, // Convert 16px to 2
        }}
      >
        <Button onClick={onClose} disabled={loading}>
          {cancelText}
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color={confirmColor}
          disabled={loading}
          autoFocus
        >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
