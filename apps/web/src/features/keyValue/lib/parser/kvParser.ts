import type { KeyValueMap } from '../types';

/**
 * Default parser
 * Format:
 *  key: value [; key: value]*
 *  key = a-zA-Z0-9_ (can be string or number, but starts with letter)
 *  value = number (can be float)
 *
 * Example inputs:
 *  temperature: 23.5; humidity: 60.2
 *    -> { key: "temperature", value: 23.5, timestamp: Date.now() }
 *    -> { key: "humidity", value: 60.2, timestamp: Date.now() }
 *
 * Parser:
 * - Tries to parse each line from the beginning
 * - Returns all valid entries, ignoring invalid lines
 * - If line contains multiple entries, splits by semicolon
 * - If line is partially valid, processes what it can from the left
 */

export function parseKeyValue(data: string): KeyValueMap {
  const entries: KeyValueMap = {};
  const timestamp = Date.now();

  // Split by lines and process each line
  const lines = data.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    try {
      // Split by semicolon to handle multiple entries
      const parts = trimmed.split(';').map(part => part.trim());
      for (const part of parts) {
        if (!part) continue;

        // Match key-value pairs (allow optional whitespace before/after key and colon)
        const match = part.match(
          /^\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*:\s*(-?\d+(\.\d*)?)\s*$/
        );
        if (match) {
          const [, key, valueStr] = match;
          const value = parseFloat(valueStr);

          if (!isNaN(value) && isFinite(value)) {
            entries[key] = { value, timestamp };
          }
        }
      }
    } catch (error) {
      console.warn('Failed to parse line:', line, error);
    }
  }
  return entries;
}
