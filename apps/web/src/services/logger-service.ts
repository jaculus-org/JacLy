import type { Logger } from '@jaculus/common';
import type { LogLevel, LoggerEntry } from '@/features/logger/types';

type LoggerListener = (entries: LoggerEntry[]) => void;

export class LoggerBusService implements Logger {
  private entries: LoggerEntry[] = [];
  private listeners = new Set<LoggerListener>();
  private readonly maxEntries: number;

  constructor(maxEntries = 5000) {
    this.maxEntries = maxEntries;
  }

  error(message?: string): void {
    this.append('error', message ?? '');
  }

  warn(message?: string): void {
    this.append('warn', message ?? '');
  }

  info(message?: string): void {
    this.append('info', message ?? '');
  }

  verbose(message?: string): void {
    this.append('verbose', message ?? '');
  }

  debug(message?: string): void {
    this.append('debug', message ?? '');
  }

  silly(message?: string): void {
    this.append('silly', message ?? '');
  }

  clear(): void {
    this.entries = [];
    this.emit();
  }

  subscribe(listener: LoggerListener): () => void {
    this.listeners.add(listener);
    listener(this.entries);

    return () => {
      this.listeners.delete(listener);
    };
  }

  private append(level: LogLevel, content: string): void {
    console.log(`[${level.toUpperCase()}] ${content}`);
    const entry: LoggerEntry = {
      timestamp: new Date(),
      level,
      content,
    };

    this.entries = [...this.entries, entry];
    if (this.entries.length > this.maxEntries) {
      this.entries = this.entries.slice(this.entries.length - this.maxEntries);
    }
    this.emit();
  }

  private emit(): void {
    for (const listener of this.listeners) {
      listener(this.entries);
    }
  }
}

export const logger = new LoggerBusService();
