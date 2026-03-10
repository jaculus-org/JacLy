import type { LoggerBusService } from '@/services/logger-service';
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { LoggerEntry } from './types';
import { LoggerContext, type LoggerContextValue } from './logger-context';

export interface LoggerProviderProps {
  loggerBusService: LoggerBusService;
  children: ReactNode;
}

export function LoggerProvider({
  loggerBusService,
  children,
}: LoggerProviderProps) {
  const [entries, setEntries] = useState<LoggerEntry[]>([]);

  useEffect(() => {
    return loggerBusService.subscribe(setEntries);
  }, [loggerBusService]);

  const clear = useCallback(() => {
    loggerBusService.clear();
  }, [loggerBusService]);

  const value = useMemo<LoggerContextValue>(
    () => ({
      state: { entries },
      actions: { clear },
    }),
    [entries, clear]
  );

  return (
    <LoggerContext.Provider value={value}>{children}</LoggerContext.Provider>
  );
}
