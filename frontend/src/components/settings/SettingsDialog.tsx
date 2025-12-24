/**
 * Settings dialog component for application preferences
 */

import React from 'react';
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
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import SettingsBrightnessIcon from '@mui/icons-material/SettingsBrightness';
import { useTranslation } from 'react-i18next';
import { useUiStore, type ThemeMode } from '../../store/uiStore';

export interface SettingsDialogProps {
  open: boolean;
  onClose: () => void;
}

export const SettingsDialog: React.FC<SettingsDialogProps> = ({ open, onClose }) => {
  const { t } = useTranslation();
  // Get theme state from store
  const themeMode = useUiStore((state) => state.themeMode);
  const effectiveTheme = useUiStore((state) => state.effectiveTheme);
  const setThemeMode = useUiStore((state) => state.setThemeMode);

  const handleThemeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newMode = event.target.value as ThemeMode;
    setThemeMode(newMode);
  };

  const themeOptions = [
    {
      value: 'light' as ThemeMode,
      label: t('dialogs.settings.lightMode'),
      description: t('dialogs.settings.lightModeDescription'),
      icon: <LightModeIcon />,
    },
    {
      value: 'dark' as ThemeMode,
      label: t('dialogs.settings.darkMode'),
      description: t('dialogs.settings.darkModeDescription'),
      icon: <DarkModeIcon />,
    },
    {
      value: 'auto' as ThemeMode,
      label: t('dialogs.settings.autoMode'),
      description: t('dialogs.settings.autoModeDescription'),
      icon: <SettingsBrightnessIcon />,
    },
  ];

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
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pb: 1,
        }}
      >
        <Typography variant="h6" component="span">
          {t('dialogs.settings.title')}
        </Typography>
        <IconButton
          aria-label={t('dialogs.settings.closeAriaLabel')}
          onClick={onClose}
          size="small"
          sx={{
            color: 'text.secondary',
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ pt: 3, pb: 3 }}>
        <Box>
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 600,
              mb: 2,
              color: 'text.primary',
            }}
          >
            {t('dialogs.settings.appearance')}
          </Typography>

          <RadioGroup
            value={themeMode}
            onChange={handleThemeChange}
            aria-label={t('dialogs.settings.themeModeAriaLabel')}
          >
            {themeOptions.map((option) => (
              <FormControlLabel
                key={option.value}
                value={option.value}
                control={<Radio />}
                label={
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      py: 0.5,
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        color: 'text.secondary',
                      }}
                    >
                      {option.icon}
                    </Box>
                    <Box>
                      <Typography
                        variant="body1"
                        sx={{
                          fontWeight: 500,
                          color: 'text.primary',
                        }}
                      >
                        {option.label}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: 'text.secondary',
                          fontSize: '0.875rem',
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
                  transition: 'background-color 0.2s',
                  '&:hover': {
                    backgroundColor: 'action.hover',
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
              backgroundColor: 'action.hover',
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                display: 'block',
                mb: 0.5,
              }}
            >
              {t('dialogs.settings.currentSelection')}
            </Typography>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                mb: 1,
              }}
            >
              {themeOptions.find((opt) => opt.value === themeMode)?.icon}
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  color: 'text.primary',
                }}
              >
                {themeOptions.find((opt) => opt.value === themeMode)?.label}
              </Typography>
            </Box>
            {themeMode === 'auto' && (
              <Typography
                variant="caption"
                sx={{
                  color: 'text.secondary',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                }}
              >
                {effectiveTheme === 'light' ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
                {t('dialogs.settings.currentThemeStatus', { theme: t(`dialogs.settings.${effectiveTheme}`) })}
              </Typography>
            )}
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};
