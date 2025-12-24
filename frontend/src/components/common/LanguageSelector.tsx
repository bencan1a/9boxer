/**
 * Language selector component for switching between available languages
 */

import React from 'react';
import {
  MenuItem,
  Select,
  SelectChangeEvent,
  FormControl,
  Box,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES, SupportedLanguage } from '../../i18n';
import LanguageIcon from '@mui/icons-material/Language';

export const LanguageSelector: React.FC = () => {
  const { i18n } = useTranslation();
  
  const handleLanguageChange = (event: SelectChangeEvent<string>) => {
    const newLanguage = event.target.value as SupportedLanguage;
    i18n.changeLanguage(newLanguage);
  };

  // Normalize language code to handle variants (e.g., 'en-US' -> 'en')
  const getCurrentLanguage = (): SupportedLanguage => {
    const baseLang = i18n.language.split('-')[0];
    return (baseLang in SUPPORTED_LANGUAGES) ? baseLang as SupportedLanguage : 'en';
  };

  return (
    <FormControl size="small" sx={{ minWidth: 120 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <LanguageIcon fontSize="small" />
        <Select
          value={getCurrentLanguage()}
          onChange={handleLanguageChange}
          displayEmpty
          sx={{
            '& .MuiSelect-select': {
              py: 0.5,
            },
          }}
        >
          {Object.entries(SUPPORTED_LANGUAGES).map(([code, name]) => (
            <MenuItem key={code} value={code}>
              <Typography variant="body2">{name}</Typography>
            </MenuItem>
          ))}
        </Select>
      </Box>
    </FormControl>
  );
};
