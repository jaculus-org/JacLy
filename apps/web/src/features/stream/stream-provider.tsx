import type { StreamBusService } from '@/services/stream-bus-service';
import { StreamTelemetryService } from '@/features/stream/services/stream-telemetry-service';
import type { KeyValueMap } from '@/features/keyValue/lib/types';
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  type AddToStream,
  type StreamEntry,
  type StreamType,
  isConsoleStream,
  isLogStream,
} from './types';
import {
  streamLogKeys,
  StreamContext,
  type StreamContextValue,
} from './stream-context';

const defaultTelemetryService = new StreamTelemetryService();

export interface StreamProviderProps {
  channel: string;
  streamBusService: StreamBusService;
  telemetryService?: StreamTelemetryService;
  children: ReactNode;
}

export function StreamProvider({
  channel,
  streamBusService,
  telemetryService = defaultTelemetryService,
  children,
}: StreamProviderProps) {
  const [entries, setEntries] = useState<StreamEntry[]>([]);
  const [keyValueEntries, setKeyValueEntries] = useState<KeyValueMap>({});

  useEffect(() => {
    return streamBusService.subscribe(channel, channelEntries => {
      setEntries(channelEntries);
      setKeyValueEntries(telemetryService.extractKeyValuePairs(channelEntries));
    });
  }, [channel, streamBusService, telemetryService]);

  const addEntry = useCallback<AddToStream>(
    (type, content) => {
      streamBusService.append(channel, type, content);
    },
    [channel, streamBusService]
  );

  const clear = useCallback(() => {
    streamBusService.clear(channel);
  }, [channel, streamBusService]);

  const clearType = useCallback(
    (type: StreamType) => {
      const filtered = entries.filter(entry => entry.type !== type);
      streamBusService.clear(channel);
      for (const entry of filtered) {
        streamBusService.append(channel, entry.type, entry.content);
      }
    },
    [entries, channel, streamBusService]
  );

  const consoleEntries = useMemo(
    () => entries.filter(entry => isConsoleStream(entry.type)),
    [entries]
  );

  const logEntries = useMemo(
    () => entries.filter(entry => isLogStream(entry.type)),
    [entries]
  );

  const value = useMemo<StreamContextValue>(
    () => ({
      state: {
        consoleEntries,
        logEntries,
        keyValueEntries,
      },
      actions: {
        addEntry,
        clear,
        clearType,
      },
      meta: {
        channel,
        logKeys: streamLogKeys,
      },
    }),
    [
      consoleEntries,
      logEntries,
      keyValueEntries,
      addEntry,
      clear,
      clearType,
      channel,
    ]
  );

  return (
    <StreamContext.Provider value={value}>{children}</StreamContext.Provider>
  );
}
