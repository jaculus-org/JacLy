export { useStream, streamLogKeys } from './stream-context';
export type { StreamContextValue } from './stream-context';
export { StreamProvider } from './stream-provider';
export type { StreamProviderProps } from './stream-provider';
export { StreamConsole } from './stream-console';
export { StreamLogs } from './stream-logs';
export { StreamOutput } from './stream-output';
export { StreamCreateNewLogs } from './stream-create-new-logs';
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
} from './types';

import { StreamProvider } from './stream-provider';
import { StreamConsole } from './stream-console';
import { StreamLogs } from './stream-logs';
import { StreamCreateNewLogs } from './stream-create-new-logs';

export const Stream = {
  Provider: StreamProvider,
  Console: StreamConsole,
  Logs: StreamLogs,
  CreateNewLogs: StreamCreateNewLogs,
};
