/**
 * EmptyState component for when no employees are loaded
 *
 * Displays a clear call-to-action for users to either load sample data
 * or upload their own Excel file. This component is specific to the
 * initial empty state of the 9Boxer application.
 *
 * @example
 * ```tsx
 * <EmptyState
 *   onLoadSampleData={() => handleLoadSample()}
 *   onUploadFile={() => handleUpload()}
 *   isLoading={false}
 * />
 * ```
 */

import React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import { useTheme, alpha } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import PeopleOutlineIcon from "@mui/icons-material/PeopleOutline";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import SampleDataIcon from "@mui/icons-material/GroupAdd";

export interface EmptyStateProps {
  /** Callback when "Load Sample Data" button is clicked */
  onLoadSampleData: () => void;
  /** Callback when "Upload Excel File" button is clicked */
  onUploadFile: () => void;
  /** Loading state - shows spinner and disables buttons when true */
  isLoading?: boolean;
}

/**
 * EmptyState component displays when no employees are loaded
 *
 * Features:
 * - Primary action: Load Sample Data (200 employees)
 * - Secondary action: Upload Excel File
 * - Loading state with spinner
 * - Responsive layout (mobile + desktop)
 * - Light/dark mode support
 * - Full keyboard accessibility
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  onLoadSampleData,
  onUploadFile,
  isLoading = false,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        minHeight: "400px",
        textAlign: "center",
        padding: theme.tokens.spacing.xl / 8, // Convert 32px to MUI spacing units (32/8 = 4)
      }}
      role="status"
      aria-live="polite"
      data-testid="empty-state"
    >
      {/* Icon Container */}
      <Box
        sx={{
          width: 120,
          height: 120,
          borderRadius: "50%",
          backgroundColor: alpha(theme.palette.primary.main, 0.08),
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: theme.tokens.spacing.lg / 8, // Convert 24px to MUI spacing units (24/8 = 3)
        }}
        aria-hidden="true"
      >
        {isLoading ? (
          <CircularProgress
            size={64}
            data-testid="loading-spinner"
            aria-label="Loading sample data"
          />
        ) : (
          <PeopleOutlineIcon
            sx={{
              fontSize: 64,
              color: "primary.main",
            }}
          />
        )}
      </Box>

      {/* Heading */}
      <Typography
        variant="h4"
        gutterBottom
        sx={{
          fontWeight: theme.tokens.typography.fontWeight.medium,
          color: "text.primary",
        }}
      >
        {t("emptyState.heading", "No Employees Loaded")}
      </Typography>

      {/* Description */}
      <Typography
        variant="body1"
        color="text.secondary"
        sx={{
          marginBottom: theme.tokens.spacing.xl / 8, // Convert 32px to MUI spacing units (32/8 = 4)
          maxWidth: theme.tokens.dimensions.panel.defaultWidth, // 400px
          lineHeight: theme.tokens.typography.lineHeight.normal,
        }}
      >
        {t(
          "emptyState.description",
          "Load sample data to explore features, or upload your own Excel file to get started."
        )}
      </Typography>

      {/* Action Buttons */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          gap: theme.tokens.spacing.md / 8, // Convert 16px to MUI spacing units (16/8 = 2)
          alignItems: "center",
          justifyContent: "center",
          marginBottom: theme.tokens.spacing.md / 8,
        }}
      >
        {/* Primary Action: Load Sample Data */}
        <Button
          variant="contained"
          size="large"
          startIcon={<SampleDataIcon />}
          onClick={onLoadSampleData}
          disabled={isLoading}
          aria-label="Load sample data with 200 employees"
          data-testid="load-sample-data-button"
          sx={{
            minWidth: { xs: "100%", sm: "240px" },
          }}
        >
          {t("emptyState.loadSampleButton", "Load Sample Data (200 employees)")}
        </Button>

        {/* Secondary Action: Upload File */}
        <Button
          variant="outlined"
          size="large"
          startIcon={<UploadFileIcon />}
          onClick={onUploadFile}
          disabled={isLoading}
          aria-label="Upload Excel file with employee data"
          data-testid="upload-file-button"
          sx={{
            minWidth: { xs: "100%", sm: "200px" },
          }}
        >
          {t("emptyState.uploadButton", "Upload Excel File")}
        </Button>
      </Box>

      {/* Tutorial Hint */}
      {!isLoading && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            marginTop: theme.tokens.spacing.sm / 8, // Convert 8px to MUI spacing units (8/8 = 1)
            maxWidth: theme.tokens.dimensions.panel.defaultWidth,
          }}
        >
          {t(
            "emptyState.sampleDataHint",
            "Sample data includes diverse employees across all 9-box positions with realistic performance and potential ratings"
          )}
        </Typography>
      )}

      {/* Loading Status Text */}
      {isLoading && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            marginTop: theme.tokens.spacing.md / 8,
          }}
          aria-live="polite"
        >
          {t("emptyState.loadingStatus", "Loading sample data...")}
        </Typography>
      )}
    </Box>
  );
};

export default EmptyState;
