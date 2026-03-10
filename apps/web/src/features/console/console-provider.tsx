import type { ConsoleBusService } from '@/services/console-bus-service';
import type { KeyValueMap } from '@/features/keyValue';
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  type AddToConsole,
  type ConsoleEntry,
  type ConsoleType,
} from './types';
import { ConsoleContext, type ConsoleContextValue } from './console-context';
import { ConsoleTelemetryService } from './services/console-telemetry-service';

const defaultTelemetryService = new ConsoleTelemetryService();

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

  useEffect(() => {
    return streamBusService.subscribe(channel, channelEntries => {
      setEntries(channelEntries);
      setKeyValueEntries(telemetryService.extractKeyValuePairs(channelEntries));
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
    [channel, streamBusService]
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
    [charMapCallback, streamBusService, channel]
  );

  const clear = useCallback(() => {
    streamBusService.clear(channel);
  }, [channel, streamBusService]);

  const clearType = useCallback(
    (type: ConsoleType) => {
      const filtered = entries.filter(entry => entry.type !== type);
      streamBusService.clear(channel);
      for (const entry of filtered) {
        streamBusService.append(channel, entry.type, entry.content);
      }
    },
    [entries, channel, streamBusService]
  );

  // TODO: do I need to memoize this? Is React compiler smart enough to not re-render it incorrectly?
  const value = useMemo<ConsoleContextValue>(
    () => ({
      state: {
        entries,
        keyValueEntries,
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
    [entries, keyValueEntries, addEntry, clear, clearType, channel]
  );

  return (
    <ConsoleContext.Provider value={value}>{children}</ConsoleContext.Provider>
  );
}
