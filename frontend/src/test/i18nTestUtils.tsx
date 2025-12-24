/**
 * Test utilities for components using i18n
 */

import React, { ReactElement } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from '../i18n/config';

/**
 * Wrapper component for testing components that use i18n
 * Use this to wrap components in tests
 */
export const I18nTestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
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
  await i18n.changeLanguage(language);
};

/**
 * Reset language to default (English) for testing
 */
export const resetTestLanguage = async (): Promise<void> => {
  await i18n.changeLanguage('en');
};
