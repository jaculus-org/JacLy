import { type Duplex } from '@jaculus/link/stream';
import { type Logger } from '@jaculus/common';

export type StreamCallbacks = {
  data?: (data: Uint8Array) => void;
  error?: (err: Error) => void;
  end?: () => void;
};

export class JacStreamError extends Error {
  constructor(message: string, name = 'JacStreamError') {
    super(message);
    this.name = name;
  }
}

/**
 * Base class for JacStream implementations providing common callback handling
 */
export abstract class JacStreamBase implements Duplex {
  protected callbacks: StreamCallbacks = {};
  protected isDestroyed = false;
  protected logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  protected handleError(error: Error): void {
    if (this.callbacks.error) {
      this.callbacks.error(error);
    } else {
      this.logger.error(`${this.constructor.name} error: ${error.message}`);
    }
  }

  protected handleEnd(): void {
    if (this.callbacks.end) {
      this.callbacks.end();
    }
  }

  protected handleData(data: Uint8Array): void {
    if (this.callbacks.data) {
      this.callbacks.data(data);
    }
  }

  public onData(callback?: (data: Uint8Array) => void): void {
    this.callbacks.data = callback;
  }

  public onEnd(callback?: () => void): void {
    this.callbacks.end = callback;
  }

  public onError(callback?: (err: Error) => void): void {
    this.callbacks.error = callback;
  }

  public abstract put(c: number): Promise<void>;
  public abstract write(buf: Uint8Array): Promise<void>;
  public abstract destroy(): Promise<void>;
}
