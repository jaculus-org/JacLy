import { type ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { LoggerContext, type LoggerContextValue } from './logger-context';
import type { LoggerBusService } from './logger-service';
import type { LoggerEntry } from './logger-types';

export interface LoggerProviderProps {
  loggerBusService: LoggerBusService;
  children: ReactNode;
}

export function LoggerProvider({ loggerBusService, children }: LoggerProviderProps) {
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
    [entries, clear],
  );

  return <LoggerContext.Provider value={value}>{children}</LoggerContext.Provider>;
}
