/**
 * i18next configuration for internationalization
 *
 * Uses lazy loading for translations to reduce initial bundle size.
 * Only English is preloaded, other languages load on-demand.
 */

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

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

/**
 * Dynamically load translation file for a given language
 * This function uses dynamic imports to split translation files into separate chunks
 *
 * Falls back to English if the requested language fails to load.
 * If English also fails, returns empty object (i18next will use translation keys as display text)
 */
const loadLanguage = async (language: string) => {
  try {
    const translations = await import(`./locales/${language}/translation.json`);
    return translations.default || translations;
  } catch (error) {
    console.error(`Failed to load language: ${language}`, error);

    // Fallback to English if not already trying English
    if (language !== "en") {
      console.warn(`Falling back to English translations`);
      try {
        const enTranslations = await import(`./locales/en/translation.json`);
        return enTranslations.default || enTranslations;
      } catch (fallbackError) {
        console.error("Failed to load English fallback", fallbackError);
      }
    }

    // If English also failed or we were already loading English,
    // return empty object (i18next will use translation keys as display text)
    return {};
  }
};

/**
 * Custom i18next backend for lazy-loading translations
 * Implements the minimal backend interface needed by i18next
 */
const lazyLoadBackend = {
  type: "backend" as const,
  init: () => {
    // No initialization needed
  },
  read: (
    language: string,
    namespace: string,
    callback: (error: any, data: any) => void
  ) => {
    // Check if this language is already loaded
    if (i18n.hasResourceBundle(language, namespace)) {
      // Return existing bundle
      const bundle = i18n.getResourceBundle(language, namespace);
      callback(null, bundle);
      return;
    }

    // Load language dynamically
    loadLanguage(language)
      .then((resources) => {
        // Add to i18next resource bundles for caching
        i18n.addResourceBundle(language, namespace, resources, true, true);
        callback(null, resources);
      })
      .catch((error) => {
        console.error(
          `Backend failed to load ${language}/${namespace}:`,
          error
        );
        callback(error, null);
      });
  },
};

// Preload English translations for faster initial render
let englishPreloaded = false;
const preloadEnglish = async () => {
  if (!englishPreloaded) {
    try {
      const enTranslations = await loadLanguage("en");
      // Add English to resources immediately
      i18n.addResourceBundle("en", "translation", enTranslations, true, true);
      englishPreloaded = true;
    } catch (error) {
      console.error("Failed to preload English translations:", error);
    }
  }
};

// Configure i18next with lazy loading backend
i18n
  .use(lazyLoadBackend) // Use our custom lazy-load backend
  .use(LanguageDetector) // Detect user language
  .use(initReactI18next) // Pass i18n down to react-i18next
  .init({
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
      useSuspense: true, // Enable suspense for async loading
    },
    // Don't load resources synchronously - we'll load them on-demand
    resources: {},
  });

// Preload English immediately for faster initial render
preloadEnglish();

export default i18n;
