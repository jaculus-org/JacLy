export { LoggerLogs } from './components/logger';
export type { LogLevel, LoggerEntry } from './types';
export { LOG_LEVELS, LOG_LEVEL_ORDER, getLogLevelColor } from './types';

export { useLogger } from '../../state/logger-context';
export type { LoggerContextValue } from '../../state/logger-context';
export { LoggerProvider } from '../../state/logger-provider';
export type { LoggerProviderProps } from '../../state/logger-provider';

import { LoggerProvider } from '../../state/logger-provider';
import { LoggerLogs } from './components/logger';

export const Logger = {
  Provider: LoggerProvider,
  Logs: LoggerLogs,
};
