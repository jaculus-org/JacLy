export type LogLevel =
  | 'error'
  | 'warn'
  | 'info'
  | 'verbose'
  | 'debug'
  | 'silly'
  | 'installer';

export const LOG_LEVELS = [
  'error',
  'warn',
  'info',
  'verbose',
  'debug',
  'silly',
] as const;

export const LOG_LEVEL_ORDER: Record<LogLevel, number> = {
  error: 0,
  warn: 1,
  info: 2,
  verbose: 3,
  debug: 4,
  silly: 5,
  installer: 6,
};

export interface LoggerEntry {
  timestamp: Date;
  level: LogLevel;
  content: string;
}

export function getLogLevelColor(level: LogLevel): string {
  switch (level) {
    case 'error':
      return 'text-red-400';
    case 'warn':
      return 'text-yellow-400';
    case 'info':
      return 'text-blue-400';
    case 'verbose':
      return 'text-green-400';
    case 'debug':
      return 'text-cyan-400';
    case 'silly':
      return 'text-muted-foreground';
    case 'installer':
      return 'text-purple-400';
  }
}
