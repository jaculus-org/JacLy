import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ConsoleBusService } from '../services/console-bus-service';
import { ConsoleTelemetryService } from '../services/console-telemetry-service';
import type { KeyValueHistoryMap, KeyValueMap } from '../types/key-value-types';
import type { AddToConsole, ConsoleEntry, ConsoleType } from '../types/types';
import { ConsoleContext, type ConsoleContextValue } from './console-context';

const defaultTelemetryService = new ConsoleTelemetryService();

function isAppendOnlyUpdate(previousEntries: ConsoleEntry[], nextEntries: ConsoleEntry[]): boolean {
  if (nextEntries.length < previousEntries.length) {
    return false;
  }

  if (nextEntries.length === previousEntries.length) {
    return false;
  }

  if (previousEntries.length === 0) {
    return true;
  }

  return (
    nextEntries[0] === previousEntries[0] &&
    nextEntries[previousEntries.length - 1] === previousEntries[previousEntries.length - 1]
  );
}

export interface ConsoleProviderProps {
  channel: string;
  streamBusService: ConsoleBusService;
  telemetryService?: ConsoleTelemetryService;
  children: ReactNode;
}

export function ConsoleProvider({
  channel,
  streamBusService,
  telemetryService = defaultTelemetryService,
  children,
}: ConsoleProviderProps) {
  const [entries, setEntries] = useState<ConsoleEntry[]>([]);
  const [keyValueEntries, setKeyValueEntries] = useState<KeyValueMap>({});
  const [keyValueHistory, setKeyValueHistory] = useState<KeyValueHistoryMap>({});
  const previousEntriesRef = useRef<ConsoleEntry[]>([]);
  const telemetryRef = useRef(telemetryService.createSnapshot());

  useEffect(() => {
    return streamBusService.subscribe(channel, (channelEntries) => {
      const previousEntries = previousEntriesRef.current;
      const telemetry =
        channelEntries.length === 0
          ? telemetryService.createSnapshot()
          : isAppendOnlyUpdate(previousEntries, channelEntries)
            ? telemetryService.appendTelemetry(
                telemetryRef.current,
                channelEntries.slice(previousEntries.length),
              )
            : telemetryService.extractTelemetry(channelEntries);

      previousEntriesRef.current = channelEntries;
      telemetryRef.current = telemetry;
      setEntries(channelEntries);
      setKeyValueEntries(telemetry.latestEntries);
      setKeyValueHistory(telemetry.historyEntries);
    });
  }, [channel, streamBusService, telemetryService]);

  const charMapCallback = useMemo<Record<string, () => void>>(
    () => ({
      '\r': () => streamBusService.removeLastEntry(channel),
      '\\r': () => streamBusService.removeLastEntry(channel),
      '\x1b[2J': () => streamBusService.clear(channel),
      '\\x1b[2J': () => streamBusService.clear(channel),
      '\f': () => streamBusService.clear(channel),
      '\\f': () => streamBusService.clear(channel),
    }),
    [channel, streamBusService],
  );

  const addEntry = useCallback<AddToConsole>(
    (type, content) => {
      const charMapEntry = charMapCallback[content.trim()];
      if (charMapEntry) {
        charMapEntry();
        return;
      }
      streamBusService.append(channel, type, content);
    },
    [charMapCallback, streamBusService, channel],
  );

  const clear = useCallback(() => {
    streamBusService.clear(channel);
  }, [channel, streamBusService]);

  const clearType = useCallback(
    (type: ConsoleType) => {
      const filtered = entries.filter((entry) => entry.type !== type);
      streamBusService.clear(channel);
      for (const entry of filtered) {
        streamBusService.append(channel, entry.type, entry.content);
      }
    },
    [entries, channel, streamBusService],
  );

  // TODO: do I need to memoize this? Is React compiler smart enough to not re-render it incorrectly?
  const value = useMemo<ConsoleContextValue>(
    () => ({
      state: {
        entries,
        keyValueEntries,
        keyValueHistory,
      },
      actions: {
        addEntry,
        clear,
        clearType,
      },
      meta: {
        channel,
      },
    }),
    [entries, keyValueEntries, keyValueHistory, addEntry, clear, clearType, channel],
  );

  return <ConsoleContext.Provider value={value}>{children}</ConsoleContext.Provider>;
}
