import { type Duplex } from '@jaculus/link/stream';
import { type Logger } from '@jaculus/common';
import {
  MessagePortTransport,
  APIClient,
  type APIEvent,
  type SerialMonitorDataPayload,
} from '@wokwi/client';

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

interface JacStreamWokwiHandlers {
  handleReadDiagram: () => Promise<Uint8Array>;
  handleWriteDiagram: (data: Uint8Array) => Promise<void>;
  handleReadFirmware: () => Promise<Uint8Array>;
}

export class JacStreamWokwi implements Duplex {
  private callbacks: StreamCallbacks = {};
  public client: APIClient | null = null;
  private logger: Logger;
  private handlers: JacStreamWokwiHandlers;

  // bound message handler so we can add/remove the same function reference
  private boundHandleMessage?: (event: MessageEvent) => Promise<void>;

  constructor(logger: Logger, handlers: JacStreamWokwiHandlers) {
    this.logger = logger;
    this.handlers = handlers;
    this.boundHandleMessage = this.handleMessage.bind(this);
    window.addEventListener('message', this.boundHandleMessage);
  }

  private async handleMessage(event: MessageEvent): Promise<void> {
    if (event.origin !== 'https://wokwi.com') {
      return;
    }

    if (event.data && event.data.port) {
      console.log('Received MessagePort from iframe');

      const transport = new MessagePortTransport(event.data.port);
      this.client = new APIClient(transport);

      this.client.onConnected = async helloMessage => {
        if (!this.client) {
          throw new WebSerialError('Client is not connected');
        }
        console.log('Wokwi client connected', helloMessage);

        await this.client.fileUpload(
          'diagram.json',
          await this.handlers.handleReadDiagram()
        );

        await this.client.fileUpload(
          'jaculus.uf2',
          await this.handlers.handleReadFirmware()
        );
      };

      this.client.listen(
        'serial-monitor:data',
        (event: APIEvent<SerialMonitorDataPayload>) => {
          this.callbacks.data?.(new Uint8Array(event.payload.bytes));
        }
      );

      this.client.onError = error => {
        this.handleError(
          new WebSerialError(`Wokwi API error: ${error.message}`)
        );
      };

      this.client.listen('ui:clickStart', async () => {
        this.handleStart();
      });
    }
  }

  private async handleStart(): Promise<void> {
    if (!this.client) {
      throw new WebSerialError('Client is not connected');
    }

    const diagram = await this.client.fileDownload('diagram.json');
    if (diagram instanceof Uint8Array) {
      await this.handlers.handleWriteDiagram(diagram);
    } else {
      await this.handlers.handleWriteDiagram(new TextEncoder().encode(diagram));
    }

    console.log('Starting simulation');
    await this.client.simStart({
      firmware: 'jaculus.uf2',
    });
  }

  private handleError(error: Error): void {
    if (this.callbacks.error) {
      this.callbacks.error(error);
    } else {
      this.logger.error(`JacStreamSerial error: ${error.message}`);
    }
  }

  public async put(c: number): Promise<void> {
    if (!this.client) {
      throw new WebSerialError('Stream is destroyed');
    }

    try {
      await this.client.serialMonitorWrite([c]);
    } catch (error) {
      this.handleError(error as Error);
      throw error;
    }
  }

  public async write(buf: Uint8Array): Promise<void> {
    if (!this.client) {
      throw new WebSerialError('Stream is destroyed');
    }

    try {
      await this.client.serialMonitorWrite(buf);
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
    if (!this.client) {
      return;
    }

    try {
      if (this.boundHandleMessage) {
        window.removeEventListener('message', this.boundHandleMessage);
      }

      if (this.client) {
        this.client.close();
        this.client = null;
      }

      // Clear callbacks to prevent memory leaks
      this.callbacks = {};
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : 'unknown error';
      this.logger.error(`Error during JacStreamWokwi destruction: ${errMsg}`);
      throw error;
    }
  }
}
