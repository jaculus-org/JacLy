import type { KeyValueHistoryMap, KeyValueMap, ParsedValue } from '../types/key-value-types';
import type { ConsoleEntry } from '../types/types';
import { parseKeyValue } from './kv-parser';

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

  createSnapshot(): ConsoleTelemetrySnapshot {
    return {
      historyEntries: {},
      latestEntries: {},
    };
  }

  appendTelemetry(
    snapshot: ConsoleTelemetrySnapshot,
    entries: ConsoleEntry[],
  ): ConsoleTelemetrySnapshot {
    if (entries.length === 0) {
      return snapshot;
    }

    const latestEntries: KeyValueMap = { ...snapshot.latestEntries };
    const historyEntries: KeyValueHistoryMap = { ...snapshot.historyEntries };
    const mutableHistories = new Map<string, ParsedValue[]>();

    for (const entry of entries) {
      if (entry.type !== 'out' && entry.type !== 'err') {
        continue;
      }

      const parsed = parseKeyValue(entry.content);
      const timestamp = entry.timestamp.getTime();

      for (const [key, value] of Object.entries(parsed) as [string, ParsedValue][]) {
        const normalizedValue: ParsedValue = {
          value: value.value,
          timestamp,
        };

        latestEntries[key] = normalizedValue;

        let history = mutableHistories.get(key);
        if (!history) {
          history = [...(historyEntries[key] ?? [])];
          mutableHistories.set(key, history);
          historyEntries[key] = history;
        }

        history.push(normalizedValue);
        this.trimHistory(history, timestamp);
      }
    }

    return {
      historyEntries,
      latestEntries,
    };
  }

  extractTelemetry(entries: ConsoleEntry[]): ConsoleTelemetrySnapshot {
    return this.appendTelemetry(this.createSnapshot(), entries);
  }

  extractKeyValuePairs(entries: ConsoleEntry[]): KeyValueMap {
    return this.extractTelemetry(entries).latestEntries;
  }

  extractKeyValueHistory(entries: ConsoleEntry[]): KeyValueHistoryMap {
    return this.extractTelemetry(entries).historyEntries;
  }
}
