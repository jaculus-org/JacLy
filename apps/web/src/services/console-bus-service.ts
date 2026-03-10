import type { ConsoleEntry, ConsoleType } from '@/features/console/types';

type ConsoleListener = (entries: ConsoleEntry[]) => void;

export class ConsoleBusService {
  private channels = new Map<string, ConsoleEntry[]>();
  private listeners = new Map<string, Set<ConsoleListener>>();
  private readonly maxEntriesPerChannel: number;

  constructor(maxEntriesPerChannel = 5000) {
    this.maxEntriesPerChannel = maxEntriesPerChannel;
  }

  append(channel: string, type: ConsoleType, content: string): void {
    const nextEntry: ConsoleEntry = {
      timestamp: new Date(),
      type,
      content,
    };

    const current = this.channels.get(channel) ?? [];
    const next = [...current, nextEntry];
    if (next.length > this.maxEntriesPerChannel) {
      next.splice(0, next.length - this.maxEntriesPerChannel);
    }
    this.channels.set(channel, next);
    this.emit(channel, next);
  }

  clear(channel: string): void {
    this.channels.set(channel, []);
    this.emit(channel, []);
  }

  removeLastEntry(channel: string): void {
    const current = this.channels.get(channel) ?? [];
    if (current.length === 0) return;
    const next = current.slice(0, -1);
    this.channels.set(channel, next);
    this.emit(channel, next);
  }

  subscribe(channel: string, listener: ConsoleListener): () => void {
    const listeners = this.listeners.get(channel) ?? new Set<ConsoleListener>();
    listeners.add(listener);
    this.listeners.set(channel, listeners);

    listener(this.channels.get(channel) ?? []);

    return () => {
      const channelListeners = this.listeners.get(channel);
      if (!channelListeners) return;
      channelListeners.delete(listener);
      if (channelListeners.size === 0) {
        this.listeners.delete(channel);
      }
    };
  }

  private emit(channel: string, entries: ConsoleEntry[]): void {
    const listeners = this.listeners.get(channel);
    if (!listeners) return;
    for (const listener of listeners) {
      listener(entries);
    }
  }
}
