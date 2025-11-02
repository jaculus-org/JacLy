import { Writable } from 'node:stream';
import logger from '@/lib/logger';
import type { TerminalStreamType } from '@/hooks/terminal-store';

// Factory function to create writable streams that output to both logger and terminal
export function createWritableStream(
  streamType: TerminalStreamType,
  addToTerminal: (type: TerminalStreamType, content: string) => void
): Writable {
  return new Writable({
    write(chunk, _encoding, callback) {
      const content = chunk.toString();

      // Log to console with appropriate level
      switch (streamType) {
        case 'compiler-stderr':
        case 'runtime-stderr':
          logger?.error(content);
          break;
        case 'debug':
          logger?.debug(content);
          break;
        case 'system':
          logger?.info(content);
          break;
        default:
          logger?.info(content);
          break;
      }

      // Add to terminal store
      addToTerminal(streamType, content);

      callback();
    },
  });
}

// Convenience functions for common stream types
export function createStdoutStream(
  addToTerminal: (type: TerminalStreamType, content: string) => void
) {
  return createWritableStream('runtime-stdout', addToTerminal);
}

export function createStderrStream(
  addToTerminal: (type: TerminalStreamType, content: string) => void
) {
  return createWritableStream('runtime-stderr', addToTerminal);
}

export function createCompilerOutStream(
  addToTerminal: (type: TerminalStreamType, content: string) => void
) {
  return createWritableStream('compiler-stdout', addToTerminal);
}

export function createCompilerErrStream(
  addToTerminal: (type: TerminalStreamType, content: string) => void
) {
  return createWritableStream('compiler-stderr', addToTerminal);
}

export function createSerialInStream(
  addToTerminal: (type: TerminalStreamType, content: string) => void
) {
  return createWritableStream('serial-in', addToTerminal);
}

export function createSerialOutStream(
  addToTerminal: (type: TerminalStreamType, content: string) => void
) {
  return createWritableStream('serial-out', addToTerminal);
}

export function createSystemStream(
  addToTerminal: (type: TerminalStreamType, content: string) => void
) {
  return createWritableStream('system', addToTerminal);
}

export function createDebugStream(
  addToTerminal: (type: TerminalStreamType, content: string) => void
) {
  return createWritableStream('debug', addToTerminal);
}
