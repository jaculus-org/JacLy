import { Writable } from 'node:stream';

export type JacStream = {
  name: string;
  enabled: boolean;
  outStream: Writable;
  errStream: Writable;
};

export type JacStreamType = 'console' | 'compiler' | 'upload' | 'project';

export interface JacStreamState {
  streams: Record<JacStreamType, JacStream>;
  clearStream: (type: JacStreamType) => void;
  addToStream: (type: JacStreamType, data: string) => void;
}
