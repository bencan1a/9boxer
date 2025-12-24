/**
 * i18n module exports
 */

export { default as i18n, SUPPORTED_LANGUAGES } from './config';
export type { SupportedLanguage } from './config';
export type { TranslationKeys, TranslationOptions } from './types';
export { useTypedTranslation, useTranslatedError, useTranslatedPlural } from './hooks';
export { translate, getCurrentLanguage, changeLanguage, isSupportedLanguage, interpolate } from './utils';
