import type { KeyValueMap } from '@/features/keyValue';
import { createContext, useContext } from 'react';
import type { AddToConsole, ConsoleEntry, ConsoleType } from './types';

export interface ConsoleState {
  entries: ConsoleEntry[];
  keyValueEntries: KeyValueMap;
}

export interface ConsoleActions {
  addEntry: AddToConsole;
  clear(): void;
  clearType(type: ConsoleType): void;
}

export interface ConsoleMeta {
  channel: string;
}

export interface ConsoleContextValue {
  state: ConsoleState;
  actions: ConsoleActions;
  meta: ConsoleMeta;
}

export const ConsoleContext = createContext<ConsoleContextValue | null>(null);

export function useConsole(): ConsoleContextValue {
  const context = useContext(ConsoleContext);
  if (!context) {
    throw new Error('Console.* components must be within Console.Provider');
  }
  return context;
}
