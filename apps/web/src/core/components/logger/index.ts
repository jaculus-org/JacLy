export type { LoggerContextValue } from '../../state/logger-context';
export { useLogger } from '../../state/logger-context';
export type { LoggerProviderProps } from '../../state/logger-provider';
export { LoggerProvider } from '../../state/logger-provider';
export { LoggerLogs } from './components/logger';
export type { LoggerEntry, LogLevel } from './types';
export { getLogLevelColor, LOG_LEVEL_ORDER, LOG_LEVELS } from './types';

import { LoggerProvider } from '../../state/logger-provider';
import { LoggerLogs } from './components/logger';

export const Logger = {
  Provider: LoggerProvider,
  Logs: LoggerLogs,
};
