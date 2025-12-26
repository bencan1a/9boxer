/**
 * i18next configuration for internationalization
 */

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import enTranslation from "./locales/en/translation.json";
import esTranslation from "./locales/es/translation.json";
import frTranslation from "./locales/fr/translation.json";
import deTranslation from "./locales/de/translation.json";
import csTranslation from "./locales/cs/translation.json";
import jaTranslation from "./locales/ja/translation.json";
import hiTranslation from "./locales/hi/translation.json";

// Define supported languages
export const SUPPORTED_LANGUAGES = {
  en: "English",
  es: "Español",
  fr: "Français",
  de: "Deutsch",
  cs: "Čeština",
  ja: "日本語",
  hi: "हिन्दी",
} as const;

export type SupportedLanguage = keyof typeof SUPPORTED_LANGUAGES;

// Configure i18next
i18n
  .use(LanguageDetector) // Detect user language
  .use(initReactI18next) // Pass i18n down to react-i18next
  .init({
    resources: {
      en: {
        translation: enTranslation,
      },
      es: {
        translation: esTranslation,
      },
      fr: {
        translation: frTranslation,
      },
      de: {
        translation: deTranslation,
      },
      cs: {
        translation: csTranslation,
      },
      ja: {
        translation: jaTranslation,
      },
      hi: {
        translation: hiTranslation,
      },
    },
    supportedLngs: ["en", "es", "fr", "de", "cs", "ja", "hi"], // Restrict to supported languages only
    fallbackLng: "en", // Use English if detected language is not available
    debug: import.meta.env.DEV, // Enable debug in development
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    detection: {
      // Order of language detection methods
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
      lookupLocalStorage: "9boxer-language",
    },
    react: {
      useSuspense: false, // Disable suspense since resources are loaded synchronously
    },
  });

export default i18n;
