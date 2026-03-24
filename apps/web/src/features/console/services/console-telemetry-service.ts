import type {
  KeyValueHistoryMap,
  KeyValueMap,
  ParsedValue,
} from '@/features/keyValue';
import { parseKeyValue } from '@/features/keyValue';
import type { ConsoleEntry } from '@/features/console/types';

export interface ConsoleTelemetrySnapshot {
  historyEntries: KeyValueHistoryMap;
  latestEntries: KeyValueMap;
}

export class ConsoleTelemetryService {
  private readonly historyRetentionMs: number;

  constructor(historyRetentionMs = 5 * 60_000) {
    this.historyRetentionMs = historyRetentionMs;
  }

  private trimHistory(history: ParsedValue[], latestTimestamp: number): void {
    const minTimestamp = latestTimestamp - this.historyRetentionMs;
    let firstRetainedIndex = 0;

    while (
      firstRetainedIndex < history.length &&
      history[firstRetainedIndex].timestamp < minTimestamp
    ) {
      firstRetainedIndex += 1;
    }

    if (firstRetainedIndex > 0) {
      history.splice(0, firstRetainedIndex);
    }
  }

  extractTelemetry(entries: ConsoleEntry[]): ConsoleTelemetrySnapshot {
    const latestEntries: KeyValueMap = {};
    const historyEntries: KeyValueHistoryMap = {};

    for (const entry of entries) {
      if (entry.type !== 'out' && entry.type !== 'err') {
        continue;
      }

      const parsed = parseKeyValue(entry.content);
      const timestamp = entry.timestamp.getTime();

      for (const [key, value] of Object.entries(parsed)) {
        const normalizedValue: ParsedValue = {
          value: value.value,
          timestamp,
        };

        latestEntries[key] = normalizedValue;
        const history = historyEntries[key] ?? [];
        history.push(normalizedValue);
        this.trimHistory(history, timestamp);

        historyEntries[key] = history;
      }
    }

    return {
      historyEntries,
      latestEntries,
    };
  }

  extractKeyValuePairs(entries: ConsoleEntry[]): KeyValueMap {
    return this.extractTelemetry(entries).latestEntries;
  }

  extractKeyValueHistory(entries: ConsoleEntry[]): KeyValueHistoryMap {
    return this.extractTelemetry(entries).historyEntries;
  }
}
