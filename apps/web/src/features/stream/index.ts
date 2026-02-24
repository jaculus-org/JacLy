export { useStream, streamLogKeys } from './stream-context';
export type { StreamContextValue } from './stream-context';
export { StreamProvider } from './stream-provider';
export type { StreamProviderProps } from './stream-provider';
export {
  StreamConsole,
  StreamCreateNewLogs,
  StreamLogs,
  StreamOutput,
} from './components';
export type {
  AddToStream,
  StreamEntry,
  StreamInteractiveDirection,
  StreamInteractiveScope,
  StreamLogKey,
  StreamOutputDirection,
  StreamOutputScope,
  StreamPair,
  StreamScope,
  StreamType,
} from './types';
export {
  getStreamEntryColor,
  getStreamPair,
  getStreamScope,
  getStreamType,
  isConsoleStream,
  isLogStream,
} from './stream-utils';

import { StreamProvider } from './stream-provider';
import { StreamConsole, StreamCreateNewLogs, StreamLogs } from './components';

export const Stream = {
  Provider: StreamProvider,
  Console: StreamConsole,
  Logs: StreamLogs,
  CreateNewLogs: StreamCreateNewLogs,
};
