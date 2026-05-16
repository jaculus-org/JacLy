export type { LoggerEntry, LogLevel } from './logger-types';
export { getLogLevelColor, LOG_LEVEL_ORDER, LOG_LEVELS } from './logger-types';
export { LoggerLogs } from './logger';
export { useLogger } from './logger-context';
export type { LoggerContextValue } from './logger-context';
export { LoggerProvider, type LoggerProviderProps } from './logger-provider';
export { LoggerBusService, logger } from './logger-service';

import { LoggerProvider } from './logger-provider';
import { LoggerLogs } from './logger';

export const Logger = {
  Provider: LoggerProvider,
  Logs: LoggerLogs,
};