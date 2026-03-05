import * as Blockly from 'blockly/core';
import { useEffect, useState } from 'react';

type MessageLoader = () => Promise<{ default: Record<string, string> }>;

const LOCALE_LOADERS: Record<string, MessageLoader> = {
  cs: () => import('blockly/msg/cs'),
  en: () => import('blockly/msg/en'),
};

const getLoader = (locale: string): MessageLoader =>
  LOCALE_LOADERS[locale] ?? LOCALE_LOADERS['en'];

// Loads Blockly UI messages for the given locale.
// Tracks the last successfully loaded locale so that a locale change
// immediately returns false (old locale !== new locale) without a
// synchronous setState inside the effect.
export function useBlocklyMessages(locale: string): boolean {
  const [loadedLocale, setLoadedLocale] = useState<string | null>(null);

  useEffect(() => {
    getLoader(locale)()
      .catch(() => {
        console.warn(
          `Failed to load Blockly messages for locale "${locale}", falling back to English`
        );
        return getLoader('en')();
      })
      .then(messages => {
        Object.assign(Blockly.Msg, messages.default ?? messages);
        setLoadedLocale(locale);
      })
      .catch(error => {
        console.error('Failed to load Blockly messages:', error);
      });
  }, [locale]);

  return loadedLocale === locale;
}
