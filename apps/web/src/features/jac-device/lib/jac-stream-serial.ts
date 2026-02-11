import { type Duplex } from '@jaculus/link/stream';
import { type Logger } from '@jaculus/common';
import { JacStreamBase, JacStreamError } from './jac-stream-base';

export class JacStreamSerial extends JacStreamBase implements Duplex {
  private port: SerialPort;
  private reader: ReadableStreamDefaultReader<Uint8Array> | null = null;
  private writer: WritableStreamDefaultWriter<Uint8Array> | null = null;
  private readingPromise: Promise<void> | null = null;
  private disconnectHandler: ((event: Event) => void) | null = null;

  constructor(port: SerialPort, logger: Logger) {
    super(logger);
    this.port = port;
    this.setupDisconnectHandler();
    this.initializeStreams();
  }

  private setupDisconnectHandler(): void {
    this.disconnectHandler = (event: Event) => {
      if ((event as Event & { target: SerialPort }).target === this.port) {
        this.cleanupConnection('USB device removed');
      }
    };
    navigator.serial.addEventListener('disconnect', this.disconnectHandler);
  }

  private async initializeStreams(): Promise<void> {
    try {
      const reader = this.port.readable?.getReader();
      if (!reader) {
        throw new JacStreamError('Cannot open reader', 'WebSerialError');
      }

      const writer = this.port.writable?.getWriter();
      if (!writer) {
        throw new JacStreamError('Cannot open writer', 'WebSerialError');
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
          this.cleanupConnection('Serial port closed');
          break;
        }

        if (value) {
          this.handleData(value);
        }
      }
    } catch (error) {
      if (!this.isDestroyed) {
        this.handleError(error as Error);
      }
    }
  }

  private cleanupConnection(reason: string): void {
    if (this.isDestroyed) return;
    this.isDestroyed = true;

    this.logger.warn(`Serial connection ended: ${reason}`);

    if (this.disconnectHandler) {
      navigator.serial.removeEventListener(
        'disconnect',
        this.disconnectHandler
      );
      this.disconnectHandler = null;
    }

    this.handleEnd();
  }

  public async put(c: number): Promise<void> {
    if (this.isDestroyed || !this.writer) {
      throw new JacStreamError('Stream is destroyed', 'WebSerialError');
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
      throw new JacStreamError('Stream is destroyed', 'WebSerialError');
    }

    try {
      await this.writer.write(buf);
    } catch (error) {
      this.handleError(error as Error);
      throw error;
    }
  }

  public async destroy(): Promise<void> {
    if (this.isDestroyed) return;
    this.isDestroyed = true;

    if (this.disconnectHandler) {
      navigator.serial.removeEventListener(
        'disconnect',
        this.disconnectHandler
      );
      this.disconnectHandler = null;
    }

    try {
      if (this.reader) {
        await this.reader.cancel();
        this.reader.releaseLock();
        this.reader = null;
      }

      if (this.writer) {
        await this.writer.abort();
        this.writer.releaseLock();
        this.writer = null;
      }

      if (this.readingPromise) {
        await this.readingPromise.catch(() => {});
      }

      if (this.port.readable || this.port.writable) {
        await this.port.close();
      }
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : 'unknown error';
      this.logger.error(`Error during JacStreamSerial destruction: ${errMsg}`);
      throw error;
    }
  }
}
