import type { Logger } from '@jaculus/common';
import type { Duplex } from '@jaculus/link/stream';
import {
  APIClient,
  type APIEvent,
  MessagePortTransport,
  type SerialMonitorDataPayload,
} from '@wokwi/client';

export interface JacStreamWokwiHandlers {
  handleReadDiagram: () => Promise<Uint8Array | string>;
  handleWriteDiagram: (data: Uint8Array | string) => Promise<void>;
  handleReadFirmware: () => Promise<Uint8Array>;
}

export class WokwiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WokwiError';
  }
}

export class JacStreamWokwi implements Duplex {
  public client: APIClient | null = null;
  private handlers: JacStreamWokwiHandlers;
  private logger: Logger;
  private isDestroyed = false;
  private boundHandleMessage: (event: MessageEvent) => Promise<void>;

  private dataCallback?: (data: Uint8Array) => void;
  private endCallback?: () => void;
  private errorCallback?: (err: Error) => void;

  constructor(logger: Logger, handlers: JacStreamWokwiHandlers) {
    this.logger = logger;
    this.handlers = handlers;
    this.boundHandleMessage = this.handleMessage.bind(this);
    window.addEventListener('message', this.boundHandleMessage);
  }

  public onData(callback?: (data: Uint8Array) => void): void {
    this.dataCallback = callback;
  }

  public onEnd(callback?: () => void): void {
    this.endCallback = callback;
  }

  public onError(callback?: (err: Error) => void): void {
    this.errorCallback = callback;
  }

  private emitData(data: Uint8Array): void {
    this.dataCallback?.(data);
  }

  private emitEnd(): void {
    this.endCallback?.();
  }

  private emitError(error: Error): void {
    if (this.errorCallback) {
      this.errorCallback(error);
    } else {
      this.logger.error(`JacStreamWokwi error: ${error.message}`);
    }
  }

  private async handleMessage(event: MessageEvent): Promise<void> {
    if (event.origin !== 'https://wokwi.com') {
      return;
    }

    if (event.data?.port) {
      this.logger.info('Received MessagePort from Wokwi iframe');

      const transport = new MessagePortTransport(event.data.port);
      this.client = new APIClient(transport);

      this.client.onConnected = async () => {
        if (!this.client) {
          throw new WokwiError('Client is not connected');
        }
        this.logger.info('Wokwi client connected');

        try {
          await this.client.fileUpload('diagram.json', await this.handlers.handleReadDiagram());
          await this.client.fileUpload('jaculus.uf2', await this.handlers.handleReadFirmware());
          await this.client.serialMonitorListen();

          this.client.listen('diagram:change', async (event) => {
            const eventTyp = event as unknown as {
              payload: { content: string };
            };
            await this.handlers.handleWriteDiagram(eventTyp.payload.content);
          });
          await this.client.sendCommand('diagram:listen');
          await this.handleStart();
        } catch (error) {
          this.emitError(
            new WokwiError(
              `Failed to upload files: ${error instanceof Error ? error.message : 'unknown error'}`,
            ),
          );
        }
      };

      this.client.listen('serial-monitor:data', (event: APIEvent<SerialMonitorDataPayload>) => {
        this.emitData(new Uint8Array(event.payload.bytes));
      });

      this.client.onError = (error) => {
        this.emitError(new WokwiError(`Wokwi API error: ${error.message}`));
        this.cleanupConnection();
      };

      this.client.listen('ui:clickStart', async () => {
        await this.handleStart();
      });
    }
  }

  private async handleStart(): Promise<void> {
    if (!this.client) {
      throw new WokwiError('Client is not connected');
    }

    this.logger.info('Starting Wokwi simulation');
    await this.client.simStart({
      firmware: 'jaculus.uf2',
    });
  }

  private cleanupConnection(): void {
    if (this.isDestroyed) return;
    this.isDestroyed = true;

    this.logger.warn('Wokwi connection ended');
    window.removeEventListener('message', this.boundHandleMessage);

    if (this.client) {
      this.client.close();
      this.client = null;
    }

    this.emitEnd();
  }

  public async put(c: number): Promise<void> {
    if (this.isDestroyed || !this.client) {
      throw new WokwiError('Stream is not initialized or destroyed');
    }

    try {
      await this.client.serialMonitorWrite([c]);
    } catch (error) {
      this.emitError(error as Error);
      throw error;
    }
  }

  public async write(buf: Uint8Array): Promise<void> {
    if (this.isDestroyed || !this.client) {
      throw new WokwiError('Stream is not initialized or destroyed');
    }

    try {
      await this.client.serialMonitorWrite(buf);
    } catch (error) {
      this.emitError(error as Error);
      throw error;
    }
  }

  public async destroy(): Promise<void> {
    this.cleanupConnection();
  }
}
