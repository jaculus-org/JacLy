import { type Duplex } from '@jaculus/link/stream';
import { type Logger } from '@jaculus/common';

class WebSerialError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WebSerialError';
  }
}

type StreamCallbacks = {
  data?: (data: Uint8Array) => void;
  error?: (err: Error) => void;
  end?: () => void;
};

export class JacStreamSerial implements Duplex {
  private callbacks: StreamCallbacks = {};
  private port: SerialPort;
  private reader: ReadableStreamDefaultReader<Uint8Array> | null = null;
  private writer: WritableStreamDefaultWriter<Uint8Array> | null = null;
  private isDestroyed = false;
  private readingPromise: Promise<void> | null = null;
  private logger: Logger;

  constructor(port: SerialPort, logger: Logger) {
    this.port = port;
    this.logger = logger;
    this.initializeStreams();
  }

  private async initializeStreams(): Promise<void> {
    try {
      const reader = this.port.readable?.getReader();
      if (!reader) {
        throw new WebSerialError('Cannot open reader');
      }

      const writer = this.port.writable?.getWriter();
      if (!writer) {
        throw new WebSerialError('Cannot open writer');
      }

      this.reader = reader;
      this.writer = writer;
      this.readingPromise = this.startReading();
    } catch (error) {
      this.handleError(error as Error);
    }
  }

  private async startReading(): Promise<void> {
    if (!this.reader || this.isDestroyed) return;

    try {
      while (!this.isDestroyed && this.reader) {
        const { value, done } = await this.reader.read();

        if (done) {
          this.handleEnd();
          break;
        }

        if (value) {
          if (this.callbacks.data) {
            this.callbacks.data(value);
          }
        }
      }
    } catch (error) {
      if (!this.isDestroyed) {
        this.handleError(error as Error);
      }
    }
  }

  private handleError(error: Error): void {
    if (this.callbacks.error) {
      this.callbacks.error(error);
    } else {
      this.logger.error(`JacStreamSerial error: ${error.message}`);
    }
  }

  private handleEnd(): void {
    if (this.callbacks.end) {
      this.callbacks.end();
    }
  }

  public async put(c: number): Promise<void> {
    if (this.isDestroyed || !this.writer) {
      throw new WebSerialError('Stream is destroyed');
    }

    try {
      const data = new Uint8Array([c]);
      await this.writer.write(data);
    } catch (error) {
      this.handleError(error as Error);
      throw error;
    }
  }

  public async write(buf: Uint8Array): Promise<void> {
    if (this.isDestroyed || !this.writer) {
      throw new WebSerialError('Stream is destroyed');
    }

    try {
      await this.writer.write(buf);
    } catch (error) {
      this.handleError(error as Error);
      throw error;
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

  public async destroy(): Promise<void> {
    if (this.isDestroyed) {
      return;
    }

    this.isDestroyed = true;

    try {
      // Cancel the reading operation
      if (this.reader) {
        await this.reader.cancel();
        this.reader.releaseLock();
        this.reader = null;
      }

      // Abort the writing operation
      if (this.writer) {
        await this.writer.abort();
        this.writer.releaseLock();
        this.writer = null;
      }

      // Wait for reading to complete
      if (this.readingPromise) {
        await this.readingPromise.catch(() => {}); // Ignore errors during cleanup
      }

      // Close the port
      if (this.port.readable || this.port.writable) {
        await this.port.close();
      }

      // Clear callbacks to prevent memory leaks
      this.callbacks = {};
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : 'unknown error';
      this.logger.error(`Error during JacStreamSerial destruction: ${errMsg}`);
      throw error;
    }
  }
}
