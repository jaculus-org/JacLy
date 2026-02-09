import type {
  AddToTerminal,
  TerminalStreamType,
} from '../provider/terminal-provider';
import { Writable } from 'node:stream';

export function createWritableStream(
  streamType: TerminalStreamType,
  addToTerminal: AddToTerminal
): Writable {
  return new Writable({
    write(chunk, _encoding, callback) {
      addToTerminal(streamType, chunk.toString());
      callback();
    },
  });
}
