import { createContext, useContext } from 'react';
import type { KeyValueHistoryMap, KeyValueMap } from '../types/key-value-types';

export interface ConsolePlotterState {
  availableKeys: string[];
  history: KeyValueHistoryMap;
  latestEntries: KeyValueMap;
  paused: boolean;
  selectedKeys: string[];
}

export interface ConsolePlotterActions {
  clearConsole(): void;
  clearSelection(): void;
  selectAll(): void;
  togglePause(): void;
  toggleSeries(key: string): void;
}

export interface ConsolePlotterMeta {
  durationMs: number;
}

export interface ConsolePlotterContextValue {
  state: ConsolePlotterState;
  actions: ConsolePlotterActions;
  meta: ConsolePlotterMeta;
}

export const ConsolePlotterContext = createContext<ConsolePlotterContextValue | null>(null);

export function useConsolePlotter(): ConsolePlotterContextValue {
  const context = useContext(ConsolePlotterContext);
  if (!context) {
    throw new Error('ConsolePlotter.* components must be within ConsolePlotter.Provider');
  }
  return context;
}
