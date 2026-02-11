import { type Duplex } from '@jaculus/link/stream';
import { type Logger } from '@jaculus/common';
import {
  MessagePortTransport,
  APIClient,
  type APIEvent,
  type SerialMonitorDataPayload,
} from '@wokwi/client';
import { JacStreamBase, JacStreamError } from './jac-stream-base';

export interface JacStreamWokwiHandlers {
  handleReadDiagram: () => Promise<Uint8Array | string>;
  handleWriteDiagram: (data: Uint8Array | string) => Promise<void>;
  handleReadFirmware: () => Promise<Uint8Array>;
}

export class JacStreamWokwi extends JacStreamBase implements Duplex {
  public client: APIClient | null = null;
  private handlers: JacStreamWokwiHandlers;

  private boundHandleMessage: (event: MessageEvent) => Promise<void>;

  constructor(logger: Logger, handlers: JacStreamWokwiHandlers) {
    super(logger);
    this.handlers = handlers;
    this.boundHandleMessage = this.handleMessage.bind(this);
    window.addEventListener('message', this.boundHandleMessage);
  }

  private async handleMessage(event: MessageEvent): Promise<void> {
    if (event.origin !== 'https://wokwi.com') {
      return;
    }

    if (event.data && event.data.port) {
      this.logger.info('Received MessagePort from Wokwi iframe');

      const transport = new MessagePortTransport(event.data.port);
      this.client = new APIClient(transport);

      this.client.onConnected = async () => {
        if (!this.client) {
          throw new JacStreamError('Client is not connected', 'WokwiError');
        }
        this.logger.info('Wokwi client connected');

        try {
          await this.client.fileUpload(
            'diagram.json',
            await this.handlers.handleReadDiagram()
          );

          await this.client.fileUpload(
            'jaculus.uf2',
            await this.handlers.handleReadFirmware()
          );

          await this.client.serialMonitorListen();

          this.client.listen('diagram:change', async event => {
            const eventTyp = event as unknown as {
              payload: { content: string };
            };
            await this.handlers.handleWriteDiagram(eventTyp.payload.content);
          });
          await this.client.sendCommand('diagram:listen');
          await this.handleStart();
        } catch (error) {
          this.handleError(
            new JacStreamError(
              `Failed to upload files: ${error instanceof Error ? error.message : 'unknown error'}`,
              'WokwiError'
            )
          );
        }
      };

      this.client.listen(
        'serial-monitor:data',
        (event: APIEvent<SerialMonitorDataPayload>) => {
          this.handleData(new Uint8Array(event.payload.bytes));
        }
      );

      this.client.onError = error => {
        this.handleError(
          new JacStreamError(`Wokwi API error: ${error.message}`, 'WokwiError')
        );
        this.cleanupConnection();
      };

      this.client.listen('ui:clickStart', async () => {
        this.handleStart();
      });
    }
  }

  private async handleStart(): Promise<void> {
    if (!this.client) {
      throw new JacStreamError('Client is not connected', 'WokwiError');
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

    this.handleEnd();
  }

  public async put(c: number): Promise<void> {
    if (this.isDestroyed || !this.client) {
      throw new JacStreamError(
        'Stream is not initialized or destroyed',
        'WokwiError'
      );
    }

    try {
      await this.client.serialMonitorWrite([c]);
    } catch (error) {
      this.handleError(error as Error);
      throw error;
    }
  }

  public async write(buf: Uint8Array): Promise<void> {
    if (this.isDestroyed || !this.client) {
      throw new JacStreamError(
        'Stream is not initialized or destroyed',
        'WokwiError'
      );
    }

    try {
      await this.client.serialMonitorWrite(buf);
    } catch (error) {
      this.handleError(error as Error);
      throw error;
    }
  }

  public async destroy(): Promise<void> {
    this.cleanupConnection();
  }
}
