/**
 * Load Sample Data Dialog
 *
 * Confirmation dialog for loading sample employee data.
 * Warns users if they have existing data that will be replaced.
 */

import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Button,
  Box,
  Alert,
  Typography,
  CircularProgress,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import ScienceIcon from "@mui/icons-material/Science";

export interface LoadSampleDialogProps {
  /** Whether the dialog is open */
  open: boolean;
  /** Callback when dialog is closed */
  onClose: () => void;
  /** Callback when confirm action is triggered (async) */
  onConfirm: () => Promise<void>;
  /** Whether user has existing data that will be replaced */
  hasExistingData: boolean;
}

/**
 * Dialog for confirming sample data load operation.
 * Shows warning if user has existing data.
 */
export const LoadSampleDialog: React.FC<LoadSampleDialogProps> = ({
  open,
  onClose,
  onConfirm,
  hasExistingData,
}) => {
  const theme = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await onConfirm();
      // Dialog will be closed by parent component on success
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load sample data";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setError(null);
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      data-testid="load-sample-dialog"
      aria-labelledby="load-sample-dialog-title"
      aria-describedby="load-sample-dialog-description"
    >
      <DialogTitle id="load-sample-dialog-title">
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <ScienceIcon color="primary" />
          <Typography variant="h6" component="span">
            Load Sample Dataset
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        {/* Warning for existing data */}
        {hasExistingData && (
          <Alert
            severity="warning"
            sx={{ mb: theme.tokens.spacing.md / 8 }}
            data-testid="existing-data-warning"
          >
            <strong>Warning:</strong> This will replace your current data.
            Continue?
          </Alert>
        )}

        {/* Error display */}
        {error && (
          <Alert
            severity="error"
            sx={{ mb: theme.tokens.spacing.md / 8 }}
            data-testid="error-message"
          >
            {error}
          </Alert>
        )}

        {/* Description */}
        <DialogContentText id="load-sample-dialog-description">
          This will generate a sample dataset of <strong>200 employees</strong>{" "}
          with realistic patterns for testing and demonstration purposes.
        </DialogContentText>

        <Box sx={{ mt: theme.tokens.spacing.md / 8 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            The sample data includes:
          </Typography>
          <Box
            component="ul"
            sx={{
              mt: 1,
              pl: theme.tokens.spacing.lg / 8,
              color: "text.secondary",
            }}
          >
            <Typography component="li" variant="body2">
              Employees across all 9 grid positions
            </Typography>
            <Typography component="li" variant="body2">
              Realistic job titles, levels, and locations
            </Typography>
            <Typography component="li" variant="body2">
              Management hierarchies and reporting chains
            </Typography>
            <Typography component="li" variant="body2">
              Historical ratings and performance data
            </Typography>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          px: theme.tokens.spacing.lg / 8,
          pb: theme.tokens.spacing.md / 8,
        }}
      >
        <Button
          onClick={handleClose}
          disabled={isLoading}
          data-testid="cancel-button"
        >
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          color="primary"
          disabled={isLoading}
          startIcon={isLoading ? <CircularProgress size={16} /> : null}
          data-testid="confirm-button"
        >
          {isLoading ? "Loading..." : "Load Sample Data"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
