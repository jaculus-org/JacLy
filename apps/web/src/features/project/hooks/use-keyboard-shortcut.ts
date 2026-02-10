import { useEffect } from 'react';

interface KeyboardShortcutOptions {
  key: string;
  ctrl?: boolean;
  meta?: boolean;
  shift?: boolean;
  alt?: boolean;
  enabled?: boolean;
}

/**
 * Hook to register keyboard shortcuts
 * @example
 * // Ctrl/Cmd + U
 * useKeyboardShortcut({ key: 'u', ctrl: true, meta: true }, handleUpload);
 *
 * // Ctrl/Cmd + Shift + S
 * useKeyboardShortcut({ key: 's', ctrl: true, meta: true, shift: true }, handleSave);
 */
export function useKeyboardShortcut(
  options: KeyboardShortcutOptions,
  callback: () => void
) {
  const {
    key,
    ctrl = false,
    meta = false,
    shift = false,
    alt = false,
    enabled = true,
  } = options;

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      const keyMatches = event.key.toLowerCase() === key.toLowerCase();

      // check modifier keys
      const modifierMatches =
        ((!ctrl && !meta) ||
          (ctrl && event.ctrlKey) ||
          (meta && event.metaKey)) &&
        shift === event.shiftKey &&
        alt === event.altKey;

      if (keyMatches && modifierMatches) {
        event.preventDefault();
        callback();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [key, ctrl, meta, shift, alt, enabled, callback]);
}
