/**
 * Settings dialog component for application preferences
 */

import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  RadioGroup,
  FormControlLabel,
  Radio,
  IconButton,
  Typography,
  Box,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import SettingsBrightnessIcon from "@mui/icons-material/SettingsBrightness";
import LanguageIcon from "@mui/icons-material/Language";
import { useTranslation } from "react-i18next";
import { useUiStore, type ThemeMode } from "../../store/uiStore";
import { SUPPORTED_LANGUAGES, SupportedLanguage } from "../../i18n";

export interface SettingsDialogProps {
  open: boolean;
  onClose: () => void;
}

export const SettingsDialog: React.FC<SettingsDialogProps> = ({
  open,
  onClose,
}) => {
  const { t, i18n } = useTranslation();

  // Get theme state from store
  const themeMode = useUiStore((state) => state.themeMode);
  const effectiveTheme = useUiStore((state) => state.effectiveTheme);
  const setThemeMode = useUiStore((state) => state.setThemeMode);

  const handleThemeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newMode = event.target.value as ThemeMode;
    setThemeMode(newMode);
  };

  const handleLanguageChange = (
    event: React.ChangeEvent<{ value: unknown }>
  ) => {
    const newLanguage = event.target.value as SupportedLanguage;
    i18n.changeLanguage(newLanguage);
  };

  // Normalize language code to handle variants (e.g., 'en-US' -> 'en')
  const getCurrentLanguage = (): SupportedLanguage => {
    const baseLang = i18n.language.split("-")[0];
    return baseLang in SUPPORTED_LANGUAGES
      ? (baseLang as SupportedLanguage)
      : "en";
  };

  const themeOptions = [
    {
      value: "light" as ThemeMode,
      label: t("settings.theme.lightMode"),
      description: t("settings.theme.lightModeDesc"),
      icon: <LightModeIcon />,
    },
    {
      value: "dark" as ThemeMode,
      label: t("settings.theme.darkMode"),
      description: t("settings.theme.darkModeDesc"),
      icon: <DarkModeIcon />,
    },
    {
      value: "auto" as ThemeMode,
      label: t("settings.theme.auto"),
      description: t("settings.theme.autoDesc"),
      icon: <SettingsBrightnessIcon />,
    },
  ];

  const languageOptions = Object.entries(SUPPORTED_LANGUAGES).map(
    ([code, name]) => ({
      value: code as SupportedLanguage,
      label: name,
      icon: <LanguageIcon />,
    })
  );

  const currentLanguage = getCurrentLanguage();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          width: 400,
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          pb: 1,
        }}
      >
        <Typography variant="h6" component="span">
          {t("settings.title")}
        </Typography>
        <IconButton
          aria-label={t("settings.closeAriaLabel")}
          onClick={onClose}
          size="small"
          sx={{
            color: "text.secondary",
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ pt: 3, pb: 3 }}>
        {/* Theme Section */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 600,
              mb: 2,
              color: "text.primary",
            }}
          >
            {t("settings.appearance")}
          </Typography>

          <RadioGroup
            value={themeMode}
            onChange={handleThemeChange}
            aria-label="theme mode selection"
          >
            {themeOptions.map((option) => (
              <FormControlLabel
                key={option.value}
                value={option.value}
                control={<Radio />}
                label={
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      py: 0.5,
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        color: "text.secondary",
                      }}
                    >
                      {option.icon}
                    </Box>
                    <Box>
                      <Typography
                        variant="body1"
                        sx={{
                          fontWeight: 500,
                          color: "text.primary",
                        }}
                      >
                        {option.label}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: "text.secondary",
                          fontSize: "0.875rem",
                        }}
                      >
                        {option.description}
                      </Typography>
                    </Box>
                  </Box>
                }
                sx={{
                  mb: 1.5,
                  ml: 0,
                  mr: 0,
                  borderRadius: 1,
                  px: 1.5,
                  py: 1,
                  transition: "background-color 0.2s",
                  "&:hover": {
                    backgroundColor: "action.hover",
                  },
                }}
              />
            ))}
          </RadioGroup>

          {/* Current theme preview indicator */}
          <Box
            sx={{
              mt: 3,
              p: 2,
              borderRadius: 1,
              backgroundColor: "action.hover",
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color: "text.secondary",
                display: "block",
                mb: 0.5,
              }}
            >
              {t("settings.currentSelection")}
            </Typography>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                mb: 1,
              }}
            >
              {themeOptions.find((opt) => opt.value === themeMode)?.icon}
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  color: "text.primary",
                }}
              >
                {themeOptions.find((opt) => opt.value === themeMode)?.label}
              </Typography>
            </Box>
            {themeMode === "auto" && (
              <Typography
                variant="caption"
                sx={{
                  color: "text.secondary",
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                }}
              >
                {effectiveTheme === "light" ? (
                  <LightModeIcon fontSize="small" />
                ) : (
                  <DarkModeIcon fontSize="small" />
                )}
                {t("settings.currentTheme", { theme: effectiveTheme })}
              </Typography>
            )}
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Language Section */}
        <Box>
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 600,
              mb: 2,
              color: "text.primary",
            }}
          >
            {t("settings.language")}
          </Typography>

          <FormControl fullWidth>
            <InputLabel id="language-select-label">
              {t("settings.selectLanguage", "Select Language")}
            </InputLabel>
            <Select
              labelId="language-select-label"
              id="language-select"
              value={currentLanguage}
              label={t("settings.selectLanguage", "Select Language")}
              onChange={handleLanguageChange as any}
              data-testid="language-select"
              startAdornment={
                <LanguageIcon sx={{ mr: 1, color: "text.secondary" }} />
              }
            >
              {languageOptions.map((option) => (
                <MenuItem
                  key={option.value}
                  value={option.value}
                  data-testid={`language-option-${option.value}`}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {option.label}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </DialogContent>
    </Dialog>
  );
};
