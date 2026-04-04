export { useLogger } from './logger-context';
export type { LoggerContextValue } from './logger-context';
export { LoggerProvider } from './logger-provider';
export type { LoggerProviderProps } from './logger-provider';
export { LoggerLogs } from './components/logger';
export type { LogLevel, LoggerEntry } from './types';
export { LOG_LEVELS, LOG_LEVEL_ORDER, getLogLevelColor } from './types';

import { LoggerProvider } from './logger-provider';
import { LoggerLogs } from './components/logger';

export const Logger = {
  Provider: LoggerProvider,
  Logs: LoggerLogs,
};
