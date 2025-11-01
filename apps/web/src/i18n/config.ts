import i18next from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
import translationEn from './en/translation.json';
import translationCs from './cs/translation.json';

export const defaultNS = 'translation';
export const resources = {
  en: {
    translation: translationEn,
  },
  cs: {
    translation: translationCs,
  },
} as const;

i18next
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    supportedLngs: ['en', 'cs'],
    fallbackLng: 'en',
    debug: true,
    defaultNS,
    resources,
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'querystring', 'path', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
      // optional query parameter to change language via URL: ?lng=cs
      lookupQuerystring: 'lng',
    },
  });
