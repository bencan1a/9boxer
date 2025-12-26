/**
 * Custom hooks for i18n functionality
 */

import { useTranslation } from "react-i18next";
import type { TranslationKeys, TranslationOptions } from "./types";

/**
 * Type-safe wrapper around useTranslation hook
 */
export const useTypedTranslation = () => {
  const { t, i18n } = useTranslation();

  return {
    t: (key: TranslationKeys, options?: TranslationOptions) => t(key, options),
    i18n,
  };
};

/**
 * Hook for translating error messages
 * Handles error messages with optional error details
 */
export const useTranslatedError = () => {
  const { t } = useTypedTranslation();

  return {
    translateError: (key: TranslationKeys, errorDetails?: string) => {
      const message = t(key);
      return errorDetails ? `${message}: ${errorDetails}` : message;
    },
  };
};

/**
 * Hook for handling pluralization
 * Simplifies common pluralization patterns
 */
export const useTranslatedPlural = () => {
  const { t } = useTypedTranslation();

  return {
    translatePlural: (
      key: TranslationKeys,
      count: number,
      options?: TranslationOptions
    ) => {
      return t(key, { count, ...options });
    },
  };
};
