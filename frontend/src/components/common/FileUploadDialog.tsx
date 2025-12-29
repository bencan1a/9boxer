/**
 * File import dialog component
 *
 * Modal dialog for uploading Excel files with drag-and-drop support
 * and file validation.
 *
 * @component
 * @screenshots
 *   - quickstart-upload-dialog: Upload dialog showing drag-and-drop area and instructions
 */

import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { useTranslation } from "react-i18next";
import { useSessionStore } from "../../store/sessionStore";
import { useUiStore } from "../../store/uiStore";
import { useSnackbar } from "../../contexts/SnackbarContext";
import { logger } from "../../utils/logger";

interface FileUploadDialogProps {
  open: boolean;
  onClose: () => void;
}

export const FileUploadDialog: React.FC<FileUploadDialogProps> = ({
  open,
  onClose,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { uploadFile, isLoading } = useSessionStore();
  const { showSuccess, showError } = useSnackbar();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFilePath, setSelectedFilePath] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Use Electron file dialog if available, otherwise fall back to HTML input
  const handleSelectFileClick = async () => {
    if (window.electronAPI?.openFileDialog) {
      // Use Electron file dialog to get the actual file path
      const filePath = await window.electronAPI.openFileDialog();
      if (filePath) {
        await handleFileSelectFromPath(filePath);
      }
    }
  };

  const handleFileSelectFromPath = async (filePath: string) => {
    try {
      // Read the file using Electron API
      const fileResult = await window.electronAPI!.readFile(filePath);
      if (!fileResult.success || !fileResult.buffer || !fileResult.fileName) {
        setError(fileResult.error || t("common.fileUpload.failedToRead"));
        return;
      }

      // Convert buffer to File object
      const uint8Array = new Uint8Array(fileResult.buffer);
      const blob = new Blob([uint8Array], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const file = new File([blob], fileResult.fileName, {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      // Validate file size (< 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        setError(t("common.fileUpload.fileTooLarge"));
        setSelectedFile(null);
        setSelectedFilePath(null);
        return;
      }

      // Validate file type
      if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
        setError(t("common.fileUpload.invalidFileType"));
        setSelectedFile(null);
        setSelectedFilePath(null);
        return;
      }

      setSelectedFile(file);
      setSelectedFilePath(filePath);
      setError(null);
    } catch (err) {
      setError(t("common.fileUpload.failedToRead"));
      logger.error("Error reading file", err);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file size (< 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        setError(t("common.fileUpload.fileTooLarge"));
        setSelectedFile(null);
        return;
      }

      // Validate file type
      if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
        setError(t("common.fileUpload.invalidFileType"));
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
      setSelectedFilePath(null); // No path available from HTML input
      setError(null);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      setError(t("common.fileUpload.noFileSelected"));
      return;
    }

    setError(null);
    setSuccess(false);

    try {
      // Pass the file path to uploadFile so it can be persisted
      await uploadFile(selectedFile, selectedFilePath || undefined);

      // Add to recent files using the original user path
      if (selectedFilePath) {
        const fileName =
          selectedFilePath.split(/[\\/]/).pop() || selectedFile.name;
        await useUiStore.getState().addRecentFile(selectedFilePath, fileName);
      }

      setSuccess(true);
      showSuccess(
        t("common.fileUpload.importSuccess", { filename: selectedFile.name })
      );
      setTimeout(() => {
        onClose();
        setSelectedFile(null);
        setSelectedFilePath(null);
        setSuccess(false);
      }, 1500);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.detail || t("common.fileUpload.importFailed");
      setError(errorMessage);
      showError(errorMessage);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
      setSelectedFile(null);
      setSelectedFilePath(null);
      setError(null);
      setSuccess(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      data-testid="file-upload-dialog"
    >
      <DialogTitle>{t("common.fileUpload.dialogTitle")}</DialogTitle>
      <DialogContent>
        <Box sx={{ py: theme.tokens.spacing.md / 8 }}>
          {" "}
          {/* Convert 16px to 2 */}
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {t("common.fileUpload.description")}
          </Typography>
          {error && (
            <Alert
              severity="error"
              sx={{
                mt: theme.tokens.spacing.md / 8,
                mb: theme.tokens.spacing.md / 8,
              }}
            >
              {" "}
              {/* Convert 16px to 2 */}
              {error}
            </Alert>
          )}
          {success && (
            <Alert
              severity="success"
              sx={{
                mt: theme.tokens.spacing.md / 8,
                mb: theme.tokens.spacing.md / 8,
              }}
            >
              {" "}
              {/* Convert 16px to 2 */}
              {t("common.fileUpload.successMessage")}
            </Alert>
          )}
          <Box
            sx={{
              mt: theme.tokens.spacing.lg / 8, // Convert 24px to 3
              p: theme.tokens.spacing.lg / 8, // Convert 24px to 3
              border: "2px dashed",
              borderColor: "primary.main",
              borderRadius: theme.tokens.radius.md, // 8px
              textAlign: "center",
              backgroundColor: "background.default",
            }}
          >
            {window.electronAPI ? (
              // Electron: Use native file dialog
              <Button
                variant="outlined"
                startIcon={<CloudUploadIcon />}
                disabled={isLoading}
                onClick={handleSelectFileClick}
              >
                {t("common.fileUpload.selectFile")}
              </Button>
            ) : (
              // Web: Use HTML file input
              <>
                <input
                  accept=".xlsx,.xls"
                  style={{ display: "none" }}
                  id="file-upload-input"
                  type="file"
                  onChange={handleFileSelect}
                  disabled={isLoading}
                />
                <label htmlFor="file-upload-input">
                  <Button
                    component="span"
                    variant="outlined"
                    startIcon={<CloudUploadIcon />}
                    disabled={isLoading}
                  >
                    {t("common.fileUpload.selectFile")}
                  </Button>
                </label>
              </>
            )}

            {selectedFile && (
              <Typography
                variant="body2"
                sx={{ mt: theme.tokens.spacing.md / 8 }}
              >
                {" "}
                {/* Convert 16px to 2 */}
                {t("common.fileUpload.selected")}{" "}
                <strong>{selectedFile.name}</strong>
              </Typography>
            )}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={isLoading}>
          {t("common.cancel")}
        </Button>
        <Button
          onClick={handleImport}
          variant="contained"
          disabled={!selectedFile || isLoading}
          startIcon={
            isLoading ? <CircularProgress size={16} /> : null // 16px - specific UI element size
          }
          data-testid="upload-submit-button"
        >
          {isLoading
            ? t("common.fileUpload.importing")
            : t("common.fileUpload.import")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
