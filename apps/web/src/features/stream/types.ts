export type StreamInteractiveScope = 'console';
export type StreamOutputScope = 'compiler' | 'runtime' | 'debug';
export type StreamScope = StreamInteractiveScope | StreamOutputScope;

export type StreamInteractiveDirection = 'in' | 'out' | 'err';
export type StreamOutputDirection = 'out' | 'err';

export type StreamType =
  | `${StreamInteractiveScope}-${StreamInteractiveDirection}`
  | `${StreamOutputScope}-${StreamOutputDirection}`;

export type StreamLogKey = StreamOutputScope;

export interface StreamEntry {
  timestamp: Date;
  type: StreamType;
  content: string;
}

export type AddToStream = (type: StreamType, content: string) => void;

export interface StreamPair {
  out: StreamType;
  err: StreamType;
}
