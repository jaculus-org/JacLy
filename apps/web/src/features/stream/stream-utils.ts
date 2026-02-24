import type {
  StreamInteractiveDirection,
  StreamInteractiveScope,
  StreamOutputDirection,
  StreamOutputScope,
  StreamPair,
  StreamScope,
  StreamType,
} from './types';

export function getStreamType(
  scope: StreamInteractiveScope,
  direction: StreamInteractiveDirection
): StreamType;
export function getStreamType(
  scope: StreamOutputScope,
  direction: StreamOutputDirection
): StreamType;
export function getStreamType(
  scope: StreamScope,
  direction: StreamInteractiveDirection | StreamOutputDirection
): StreamType {
  return `${scope}-${direction}` as StreamType;
}

export function getStreamPair(scope: StreamOutputScope): StreamPair {
  return {
    out: getStreamType(scope, 'out'),
    err: getStreamType(scope, 'err'),
  };
}

export function getStreamScope(type: StreamType): StreamScope {
  const [scope] = type.split('-');
  return scope as StreamScope;
}

export function isConsoleStream(type: StreamType): boolean {
  return getStreamScope(type) === 'console';
}

export function isLogStream(type: StreamType): boolean {
  return !isConsoleStream(type);
}

export function getStreamEntryColor(type: StreamType): string {
  switch (type) {
    case 'console-in':
    case 'console-out':
    case 'console-err':
      return 'text-foreground';
    case 'compiler-out':
      return 'text-blue-400';
    case 'compiler-err':
      return 'text-yellow-400';
    case 'runtime-out':
      return 'text-green-400';
    case 'runtime-err':
      return 'text-red-400';
    case 'debug-out':
      return 'text-cyan-400';
    case 'debug-err':
      return 'text-orange-400';
  }
}
