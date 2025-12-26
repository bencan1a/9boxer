/**
 * Utility functions for i18n
 */

import i18n from "./config";
import type { TranslationKeys, TranslationOptions } from "./types";

/**
 * Get translation without using hooks (useful in non-component contexts)
 */
export const translate = (
  key: TranslationKeys,
  options?: TranslationOptions
): string => {
  return i18n.t(key, options);
};

/**
 * Get current language
 */
export const getCurrentLanguage = (): string => {
  return i18n.language;
};

/**
 * Change language
 */
export const changeLanguage = async (language: string): Promise<void> => {
  await i18n.changeLanguage(language);
};

/**
 * Check if a language is supported
 */
export const isSupportedLanguage = (language: string): boolean => {
  return i18n.languages.includes(language);
};

/**
 * Escape special regex characters in a string
 */
const escapeRegExp = (str: string): string =>
  str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Format a string with interpolation
 * Useful for dynamic messages
 * Note: This duplicates i18next's built-in interpolation.
 * Prefer using i18next's t() function with variables when possible.
 */
export const interpolate = (
  template: string,
  values: Record<string, string | number>
): string => {
  return Object.entries(values).reduce(
    (result, [key, value]) =>
      result.replace(
        new RegExp(`{{${escapeRegExp(key)}}}`, "g"),
        String(value)
      ),
    template
  );
};
