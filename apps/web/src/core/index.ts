export { AppDB, db } from './db/db';
export { ProjectRepository } from './db/project-repository';
export { AppSettingsRepository } from './db/app-settings-repository';

export { LoggerBusService, logger } from './services/logger-service';
export { SettingsService } from './services/settings-service';

export { useBuildInfo } from './hooks/use-build-info';
export { useSettings } from './hooks/use-settings';

export type { IDbProject } from './types/project';
export type { ISettings } from './types/settings';
export { defaultSettings } from './types/settings';

export { useAppStore, type AppState } from './state/store';

export { LocaleSelector } from './components/locale';
export { ThemeProvider, ThemeToggle, useTheme } from './components/theme';
export {
  Logger,
  LoggerProvider,
  useLogger,
  LoggerLogs,
  LOG_LEVELS,
  LOG_LEVEL_ORDER,
  getLogLevelColor,
} from './components/logger';
export type { LoggerContextValue } from './components/logger';
export type {
  LogLevel,
  LoggerEntry,
  LoggerProviderProps,
} from './components/logger';
