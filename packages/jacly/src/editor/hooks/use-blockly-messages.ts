import * as Blockly from 'blockly/core';
import { useEffect, useState } from 'react';

type MessageLoader = () => Promise<{ default: Record<string, string> }>;
type LoadedMessages = { default: Record<string, string> } | Record<string, string>;

const LOCALE_LOADERS: Record<string, MessageLoader> = {
  cs: () => import('blockly/msg/cs'),
  en: () => import('blockly/msg/en'),
};

const getLoader = (locale: string): MessageLoader => LOCALE_LOADERS[locale] ?? LOCALE_LOADERS.en;

export async function loadBlocklyMessages(
  locale: string,
  onLoaded: (messages: Record<string, string>, loadedLocale: string) => void,
  options?: {
    getLoader?: (locale: string) => MessageLoader;
    isCurrent?: () => boolean;
    onWarn?: (message: string) => void;
    onError?: (error: unknown) => void;
  },
): Promise<void> {
  const load = options?.getLoader ?? getLoader;
  const isCurrent = options?.isCurrent ?? (() => true);
  const onWarn = options?.onWarn ?? ((message: string) => console.warn(message));
  const onError = options?.onError ?? ((error: unknown) => console.error(error));

  try {
    let messages: LoadedMessages;

    try {
      messages = await load(locale)();
    } catch {
      onWarn(`Failed to load Blockly messages for locale "${locale}", falling back to English`);
      messages = await load('en')();
    }

    if (!isCurrent()) return;
    onLoaded(getLoadedMessageMap(messages), locale);
  } catch (error) {
    if (isCurrent()) {
      onError(error);
    }
  }
}

function getLoadedMessageMap(messages: LoadedMessages): Record<string, string> {
  const defaultExport = (messages as { default?: unknown }).default;
  return typeof defaultExport === 'object' && defaultExport !== null
    ? (defaultExport as Record<string, string>)
    : (messages as Record<string, string>);
}

// Loads Blockly UI messages for the given locale.
// Tracks the last successfully loaded locale so that a locale change
// immediately returns false (old locale !== new locale) without a
// synchronous setState inside the effect.
export function useBlocklyMessages(locale: string): boolean {
  const [loadedLocale, setLoadedLocale] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    void loadBlocklyMessages(
      locale,
      (messages, loadedLocale) => {
        Object.assign(Blockly.Msg, messages);
        setLoadedLocale(loadedLocale);
      },
      {
        isCurrent: () => active,
        onError: (error) => {
          console.error('Failed to load Blockly messages:', error);
        },
      },
    );

    return () => {
      active = false;
    };
  }, [locale]);

  return loadedLocale === locale;
}
