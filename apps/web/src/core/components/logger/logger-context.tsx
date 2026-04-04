import { createContext, useContext } from 'react';
import type { LoggerEntry } from './types';

export interface LoggerState {
  entries: LoggerEntry[];
}

export interface LoggerActions {
  clear(): void;
}

export interface LoggerContextValue {
  state: LoggerState;
  actions: LoggerActions;
}

export const LoggerContext = createContext<LoggerContextValue | null>(null);

export function useLogger(): LoggerContextValue {
  const context = useContext(LoggerContext);
  if (!context) {
    throw new Error('Logger.* components must be within Logger.Provider');
  }
  return context;
}
