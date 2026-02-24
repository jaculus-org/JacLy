import { Writable } from 'node:stream';
import {
  type StreamEntry,
  type StreamOutputScope,
  type StreamType,
} from '@/features/stream/types';
import { getStreamPair, getStreamType } from '@/features/stream';

type StreamListener = (entries: StreamEntry[]) => void;

export class StreamBusService {
  private channels = new Map<string, StreamEntry[]>();
  private listeners = new Map<string, Set<StreamListener>>();
  private readonly maxEntriesPerChannel: number;

  constructor(maxEntriesPerChannel = 5000) {
    this.maxEntriesPerChannel = maxEntriesPerChannel;
  }

  append(channel: string, type: StreamType, content: string): void {
    const nextEntry: StreamEntry = {
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

  subscribe(channel: string, listener: StreamListener): () => void {
    const listeners = this.listeners.get(channel) ?? new Set<StreamListener>();
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

  createWritable(channel: string, type: StreamType): Writable {
    return new Writable({
      write: (chunk, _encoding, callback) => {
        this.append(channel, type, chunk.toString());
        callback();
      },
    });
  }

  createOutWritable(channel: string, scope: StreamOutputScope): Writable {
    return this.createWritable(channel, getStreamType(scope, 'out'));
  }

  createErrWritable(channel: string, scope: StreamOutputScope): Writable {
    return this.createWritable(channel, getStreamType(scope, 'err'));
  }

  createWritablePair(
    channel: string,
    scope: StreamOutputScope
  ): { out: Writable; err: Writable } {
    const pair = getStreamPair(scope);
    return {
      out: this.createWritable(channel, pair.out),
      err: this.createWritable(channel, pair.err),
    };
  }

  private emit(channel: string, entries: StreamEntry[]): void {
    const listeners = this.listeners.get(channel);
    if (!listeners) return;
    for (const listener of listeners) {
      listener(entries);
    }
  }
}
