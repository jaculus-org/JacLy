import type { KeyValueMap } from '@/features/keyValue/lib/types';
import { createContext, use } from 'react';
import type {
  AddToStream,
  StreamEntry,
  StreamLogKey,
  StreamType,
} from './types';

export interface StreamState {
  consoleEntries: StreamEntry[];
  logEntries: StreamEntry[];
  keyValueEntries: KeyValueMap;
}

export interface StreamActions {
  addEntry: AddToStream;
  clear(): void;
  clearType(type: StreamType): void;
}

export interface StreamMeta {
  channel: string;
  logKeys: ReadonlyArray<StreamLogKey>;
}

export interface StreamContextValue {
  state: StreamState;
  actions: StreamActions;
  meta: StreamMeta;
}

export const StreamContext = createContext<StreamContextValue | null>(null);

export const streamLogKeys: ReadonlyArray<StreamLogKey> = [
  'compiler',
  'runtime',
];

export function useStream(): StreamContextValue {
  const context = use(StreamContext);
  if (!context) {
    throw new Error('Stream.* components must be within Stream.Provider');
  }
  return context;
}
