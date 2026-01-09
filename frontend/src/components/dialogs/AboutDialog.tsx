import React, { useState, useEffect } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Chip from "@mui/material/Chip";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Link from "@mui/material/Link";
import IconButton from "@mui/material/IconButton";
import { useTheme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import InfoIcon from "@mui/icons-material/Info";
import CloseIcon from "@mui/icons-material/Close";
import CodeIcon from "@mui/icons-material/Code";
import BusinessIcon from "@mui/icons-material/Business";
import GridOnIcon from "@mui/icons-material/GridOn";
import { Logo } from "../branding/Logo";

export type AboutDialogVariant = "simple" | "detailed" | "cards" | "compact";

export interface AboutDialogProps {
  open: boolean;
  onClose: () => void;
  variant?: AboutDialogVariant;
  onUserGuideClick?: () => void;
}

/**
 * AboutDialog - Display information about the 9Boxer application
 *
 * @example
 * ```tsx
 * <AboutDialog
 *   open={aboutDialogOpen}
 *   onClose={() => setAboutDialogOpen(false)}
 *   variant="detailed"
 * />
 * ```
 */
export const AboutDialog: React.FC<AboutDialogProps> = ({
  open,
  onClose,
  variant = "detailed",
  onUserGuideClick,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();

  const [appVersion, setAppVersion] = useState<string>("1.0.0"); // Fallback version
  const appName = "9Boxer";

  // Fetch app version from Electron when component mounts or when running in Electron
  useEffect(() => {
    const fetchVersion = async () => {
      if (window.electronAPI?.getAppVersion) {
        try {
          const version = await window.electronAPI.getAppVersion();
          setAppVersion(version);
        } catch (error) {
          console.error("Failed to fetch app version:", error);
          // Keep fallback version if fetch fails
        }
      }
    };

    fetchVersion();
  }, []);

  const renderSimpleContent = (): JSX.Element => (
    <Box>
      <Typography variant="body1" gutterBottom>
        {t(
          "dialogs.about.description",
          "A powerful talent management tool for visualizing and managing employee performance using the 9-box grid methodology."
        )}
      </Typography>

      <Box sx={{ mt: 3 }}>
        <Typography variant="body2" color="text.secondary">
          {t("dialogs.about.version", "Version")} {appVersion}
        </Typography>
      </Box>
    </Box>
  );

  const renderDetailedContent = (): JSX.Element => (
    <Box>
      <Typography variant="body1" gutterBottom>
        {t(
          "dialogs.about.description",
          "A powerful talent management tool for visualizing and managing employee performance using the 9-box grid methodology."
        )}
      </Typography>

      <Divider sx={{ my: 2 }} />

      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          {t("dialogs.about.version", "Version")}
        </Typography>
        <Typography variant="body1">{appVersion}</Typography>
      </Box>

      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          {t("dialogs.about.technology", "Technology")}
        </Typography>
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 1 }}>
          <Chip label="React 18" size="small" />
          <Chip label="TypeScript" size="small" />
          <Chip label="Material-UI" size="small" />
          <Chip label="Electron" size="small" />
        </Box>
      </Box>

      <Divider sx={{ my: 2 }} />

      <Box>
        <Typography variant="body2" color="text.secondary">
          {t("dialogs.about.copyright", "© 2024 9Boxer. All rights reserved.")}
        </Typography>
      </Box>
    </Box>
  );

  const renderCardsContent = (): JSX.Element => (
    <Box>
      <Typography
        variant="body1"
        gutterBottom
        sx={{ mb: 3, textAlign: "center" }}
      >
        {t(
          "dialogs.about.tagline",
          "Elevate your talent management with data-driven insights"
        )}
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Card
          variant="outlined"
          sx={{
            borderLeft: 4,
            borderLeftColor: theme.palette.primary.main,
          }}
        >
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <GridOnIcon color="primary" />
              <Typography variant="h6">
                {t("dialogs.about.features.grid.title", "9-Box Grid")}
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              {t(
                "dialogs.about.features.grid.description",
                "Intuitive drag-and-drop interface for employee placement and performance visualization"
              )}
            </Typography>
          </CardContent>
        </Card>

        <Card
          variant="outlined"
          sx={{
            borderLeft: 4,
            borderLeftColor: theme.palette.success.main,
          }}
        >
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <BusinessIcon color="success" />
              <Typography variant="h6">
                {t(
                  "dialogs.about.features.collaboration.title",
                  "Team Collaboration"
                )}
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              {t(
                "dialogs.about.features.collaboration.description",
                "Share insights and calibrate assessments across your organization"
              )}
            </Typography>
          </CardContent>
        </Card>

        <Card
          variant="outlined"
          sx={{
            borderLeft: 4,
            borderLeftColor: theme.palette.info.main,
          }}
        >
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <CodeIcon color="info" />
              <Typography variant="h6">
                {t("dialogs.about.features.tech.title", "Built With")}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 1 }}>
              <Chip label="React 18" size="small" color="primary" />
              <Chip label="TypeScript" size="small" color="primary" />
              <Chip label="Material-UI" size="small" color="primary" />
              <Chip label="Electron" size="small" color="primary" />
            </Box>
          </CardContent>
        </Card>
      </Box>

      <Box sx={{ mt: 3, textAlign: "center" }}>
        <Typography variant="caption" color="text.secondary">
          {t("dialogs.about.version", "Version")} {appVersion}
        </Typography>
      </Box>
    </Box>
  );

  const renderCompactContent = (): JSX.Element => (
    <Box sx={{ textAlign: "center" }}>
      <Box
        sx={{
          margin: "0 auto",
          mb: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Logo variant="gradient-bordered" size={64} />
      </Box>

      <Typography variant="h5" gutterBottom>
        {appName}
      </Typography>

      <Typography variant="body2" color="text.secondary" gutterBottom>
        {t("dialogs.about.version", "Version")} {appVersion}
      </Typography>

      <Typography variant="body2" sx={{ mt: 2, mb: 2 }}>
        {t(
          "dialogs.about.shortDescription",
          "Talent management through the 9-box grid"
        )}
      </Typography>

      {onUserGuideClick && (
        <Box sx={{ display: "flex", gap: 1, justifyContent: "center", mt: 2 }}>
          <Link
            component="button"
            underline="hover"
            onClick={() => {
              onUserGuideClick();
              onClose();
            }}
            data-testid="about-user-guide-link"
            sx={{ cursor: "pointer" }}
          >
            {t("dialogs.about.userGuide", "User Guide")}
          </Link>
        </Box>
      )}
    </Box>
  );

  const renderContent = (): JSX.Element => {
    switch (variant) {
      case "simple":
        return renderSimpleContent();
      case "detailed":
        return renderDetailedContent();
      case "cards":
        return renderCardsContent();
      case "compact":
        return renderCompactContent();
      default:
        return renderDetailedContent();
    }
  };

  const getMaxWidth = (): "xs" | "sm" | "md" => {
    if (variant === "compact") return "xs";
    if (variant === "cards") return "md";
    return "sm";
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={getMaxWidth()}
      fullWidth
      aria-labelledby={variant === "compact" ? undefined : "about-dialog-title"}
      aria-describedby="about-dialog-description"
      data-testid="about-dialog"
    >
      {variant !== "compact" && (
        <DialogTitle id="about-dialog-title">
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <InfoIcon color="primary" />
              <Typography variant="h6" component="span">
                {t("dialogs.about.title", `About ${appName}`)}
              </Typography>
            </Box>
            <IconButton
              aria-label={t("common.close", "Close")}
              onClick={onClose}
              size="small"
              data-testid="about-dialog-close-button"
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
      )}

      <DialogContent id="about-dialog-description">
        {renderContent()}
      </DialogContent>

      <DialogActions>
        <Button
          onClick={onClose}
          variant="contained"
          data-testid="about-dialog-close-action"
        >
          {t("common.close", "Close")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
