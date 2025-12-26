/**
 * TypeScript types for translation keys
 * Provides type safety and autocomplete for translation keys
 */

import type enTranslation from "./locales/en/translation.json";

/**
 * Extract all nested keys from translation object
 * This creates a type-safe string union of all valid translation keys
 */
export type TranslationKeys = RecursiveKeyOf<typeof enTranslation>;

/**
 * Helper type to get all nested keys from an object
 */
type RecursiveKeyOf<TObj extends object> = {
  [TKey in keyof TObj & (string | number)]: TObj[TKey] extends object
    ? `${TKey}` | `${TKey}.${RecursiveKeyOf<TObj[TKey]>}`
    : `${TKey}`;
}[keyof TObj & (string | number)];

/**
 * Translation function parameters type
 */
export interface TranslationOptions {
  count?: number;
  [key: string]: string | number | undefined;
}
