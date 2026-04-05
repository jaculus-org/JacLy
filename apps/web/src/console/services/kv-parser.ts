import type { KeyValueMap } from '../types/key-value-types';

// Default parser.
// Format:
//   key: value [; key: value]*
//   key = a-zA-Z0-9_ (can be string or number, but starts with a letter)
//   value = number (can be float)
//
// Example:
//   temperature: 23.5; humidity: 60.2
//
// Returns all valid entries it can recognize on each line and ignores the rest.

const KEY_VALUE_PAIR_PATTERN =
  /(?:^|;)\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*:\s*(-?\d+(?:\.\d*)?)\s*(?=;|$)/g;

export function parseKeyValue(data: string): KeyValueMap {
  const entries: KeyValueMap = {};
  const timestamp = Date.now();

  for (const rawLine of data.split('\n')) {
    const line = rawLine.trim();
    if (!line) continue;

    KEY_VALUE_PAIR_PATTERN.lastIndex = 0;

    let match: RegExpExecArray | null;
    while ((match = KEY_VALUE_PAIR_PATTERN.exec(line)) !== null) {
      const key = match[1];
      const value = Number(match[2]);

      if (Number.isFinite(value)) {
        entries[key] = { value, timestamp };
      }
    }
  }

  return entries;
}
