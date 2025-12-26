/**
 * Translation helper for Playwright E2E tests
 *
 * This module provides i18n support for E2E tests by loading translation
 * files and providing a lookup function similar to the component test helper.
 */

import enTranslation from "../../src/i18n/locales/en/translation.json";
import esTranslation from "../../src/i18n/locales/es/translation.json";

type TranslationObject = Record<string, any>;

/**
 * Get a nested property from an object using dot notation
 * @param obj - The object to search
 * @param path - Dot-notated path (e.g., 'changes.noChangesYet')
 * @returns The value at the path, or the path itself if not found
 */
function getNestedProperty(obj: TranslationObject, path: string): string {
  const keys = path.split(".");
  let result: any = obj;

  for (const key of keys) {
    if (result && typeof result === "object" && key in result) {
      result = result[key];
    } else {
      // Return the path itself if not found (matches i18next behavior)
      return path;
    }
  }

  // If result is still an object, return the path (incomplete key)
  if (typeof result === "object") {
    return path;
  }

  return String(result);
}

/**
 * Handle pluralization (basic implementation)
 * Matches i18next pluralization rules for English/Spanish
 */
function handlePluralization(
  template: string,
  count: number | undefined
): string {
  if (count === undefined) {
    return template;
  }

  // For keys ending in _one, _other, use count to determine which form
  // This is a simplified version - real i18next is more complex
  if (count === 1) {
    return template.replace(/_one$/, "").replace(/_other$/, "");
  }

  return template;
}

/**
 * Interpolate variables into translation string
 * Supports {{variable}} syntax like i18next
 */
function interpolate(template: string, options?: Record<string, any>): string {
  if (!options) {
    return template;
  }

  let result = template;

  // Replace {{variable}} with values from options
  for (const [key, value] of Object.entries(options)) {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, "g");
    result = result.replace(regex, String(value));
  }

  return result;
}

/**
 * Get translated text for a given key
 *
 * This helper function provides i18n support for Playwright E2E tests.
 * It works similarly to the component test helper but loads translations
 * directly from JSON files since Playwright runs in Node.js context.
 *
 * @param key - Translation key (e.g., 'changes.noChangesYet')
 * @param options - Optional interpolation values (e.g., { count: 5 })
 * @param locale - Language code (default: 'en')
 * @returns Translated string
 *
 * @example
 * // Simple translation
 * await expect(page.getByText(t('changes.noChangesYet'))).toBeVisible();
 *
 * @example
 * // With interpolation
 * const text = t('grid.employeeCount', { count: 5 });
 * await expect(page.getByText(text)).toBeVisible();
 *
 * @example
 * // Spanish locale
 * const text = t('changes.title', {}, 'es');
 * await expect(page.getByText(text)).toBeVisible();
 */
export function t(
  key: string,
  options?: Record<string, any>,
  locale: string = "en"
): string {
  // Select translation object based on locale
  const translations: Record<string, TranslationObject> = {
    en: enTranslation,
    es: esTranslation,
  };

  const translationObj = translations[locale] || translations.en;

  // Get the translation template
  let template = getNestedProperty(translationObj, key);

  // Handle pluralization if count is provided
  if (options?.count !== undefined) {
    template = handlePluralization(template, options.count);
  }

  // Interpolate variables
  template = interpolate(template, options);

  return template;
}

/**
 * Get translated text for English (convenience function)
 * @param key - Translation key
 * @param options - Optional interpolation values
 * @returns Translated string in English
 */
export function tEn(key: string, options?: Record<string, any>): string {
  return t(key, options, "en");
}

/**
 * Get translated text for Spanish (convenience function)
 * @param key - Translation key
 * @param options - Optional interpolation values
 * @returns Translated string in Spanish
 */
export function tEs(key: string, options?: Record<string, any>): string {
  return t(key, options, "es");
}
