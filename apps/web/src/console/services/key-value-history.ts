import type { KeyValueHistoryMap } from '../types/key-value-types';

export function cloneHistoryMap(
  history: KeyValueHistoryMap
): KeyValueHistoryMap {
  return Object.fromEntries(
    Object.entries(history).map(([key, points]) => [key, [...points]])
  );
}
