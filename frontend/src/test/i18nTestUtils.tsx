/**
 * Test utilities for components using i18n
 */

import React, { ReactElement } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslation from '../i18n/locales/en/translation.json';
import esTranslation from '../i18n/locales/es/translation.json';

// Create a separate i18n instance for testing to avoid test pollution
const createTestI18n = () => {
  const testI18n = i18n.createInstance();
  testI18n
    .use(initReactI18next)
    .init({
      resources: {
        en: {
          translation: enTranslation,
        },
        es: {
          translation: esTranslation,
        },
      },
      lng: 'en',
      fallbackLng: 'en',
      interpolation: {
        escapeValue: false,
      },
    });
  return testI18n;
};

const testI18nInstance = createTestI18n();

/**
 * Wrapper component for testing components that use i18n
 * Use this to wrap components in tests
 */
export const I18nTestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <I18nextProvider i18n={testI18nInstance}>{children}</I18nextProvider>;
};

/**
 * Helper function to wrap a test component with i18n provider
 * @param ui - Component to wrap
 * @returns Wrapped component
 */
export const withI18n = (ui: ReactElement): ReactElement => {
  return <I18nTestWrapper>{ui}</I18nTestWrapper>;
};

/**
 * Change language for testing
 * @param language - Language code to switch to
 */
export const changeTestLanguage = async (language: string): Promise<void> => {
  await testI18nInstance.changeLanguage(language);
};

/**
 * Reset language to default (English) for testing
 */
export const resetTestLanguage = async (): Promise<void> => {
  await testI18nInstance.changeLanguage('en');
};

/**
 * Get translated text using a translation key
 * This helper function is designed for use in test assertions to get the translated
 * text for a given key. It uses the same i18n instance as the test components.
 * 
 * @param key - Translation key (e.g., 'dashboard.fileMenu.importData')
 * @param options - Optional interpolation values and other options
 * @returns Translated string
 * 
 * @example
 * // Simple translation
 * expect(screen.getByText(getTranslatedText('common.ok'))).toBeInTheDocument();
 * 
 * @example
 * // With interpolation
 * const text = getTranslatedText('dashboard.fileMenu.exportChanges', { count: 3 });
 * expect(screen.getByText(text)).toBeInTheDocument();
 * 
 * @example
 * // Test pluralization
 * expect(screen.getByText(getTranslatedText('grid.employeeCount.employee', { count: 1 }))).toBeInTheDocument();
 * expect(screen.getByText(getTranslatedText('grid.employeeCount.employee', { count: 5 }))).toBeInTheDocument();
 */
export const getTranslatedText = (key: string, options?: Record<string, any>): string => {
  return testI18nInstance.t(key, options);
};
