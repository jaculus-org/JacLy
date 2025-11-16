import { type Duplex } from '@jaculus/link/stream';
import { type Logger } from '@jaculus/common';
import {
  APIClient,
  MessagePortTransport,
  type APIEvent,
  type SerialMonitorDataPayload,
} from 'wokwi-client-js';
import { fs } from '@zenfs/core';
import {
  getProjectFsRoot,
  type JaclyProject,
} from '../projects/project-manager';

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

const diagramDefault = `{
  "version": 1,
  "author": "Jakub Andrysek",
  "editor": "wokwi",
  "parts": [
    { "type": "board-esp32-s3-devkitc-1", "id": "esp", "top": 0, "left": 0, "attrs": {} },
    {
      "type": "wokwi-led",
      "id": "led1",
      "top": 102,
      "left": 119.4,
      "attrs": { "color": "red", "flip": "1", "builder": "esp-idf" }
    }
  ],
  "connections": [
    [ "esp:TX", "$serialMonitor:RX", "", [] ],
    [ "esp:RX", "$serialMonitor:TX", "", [] ],
    [ "esp:45", "led1:A", "green", [ "h0" ] ],
    [ "led1:C", "esp:GND.3", "green", [ "v0" ] ]
  ],
  "dependencies": {}
}
`;

// const defaultJsCode = `
// import * as gpio from 'gpio';

// gpio.pinMode(45, gpio.PinMode.OUTPUT);
// let on = true;

// setInterval(function() {
//   console.log(('Wokwi is running - ' + String(on)));
//   gpio.write(45, on);
//   on = !on;
// }, 1000);
// `;

export class JacSerialWokwi implements Duplex {
  private project: JaclyProject;
  private callbacks: StreamCallbacks = {};
  public client: APIClient | null = null;
  private isDestroyed = false;
  private logger: Logger;
  // bound message handler so we can add/remove the same function reference
  private boundHandleMessage?: (event: MessageEvent) => Promise<void>;

  constructor(project: JaclyProject, logger: Logger) {
    this.project = project;
    this.logger = logger;
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

      // await this.client.connected

      this.client.onConnected = async helloMessage => {
        console.log('Wokwi client connected', helloMessage);
        await this.loadDiagram();

        const firmwareResponse = await fetch('/bin/jaculus.uf2');
        const jaculusBinContent = await firmwareResponse.arrayBuffer();
        await this.client?.fileUpload(
          'jaculus.uf2',
          new Uint8Array(jaculusBinContent)
        );
      };

      this.client.listen(
        'serial-monitor:data',
        (event: APIEvent<SerialMonitorDataPayload>) => {
          const rawBytes = new Uint8Array(event.payload.bytes);
          const data = Buffer.from(rawBytes);
          if (this.callbacks['data']) {
            this.callbacks['data'](data);
          }
        }
      );

      this.client.listen('ui:clickStart', async () => {
        await this.loadDiagram();
        this.handleStart();
      });

      this.client.onEvent = event => {
        console.log('Wokwi event:', event);
      };

      this.client.onError = error => {
        console.error('Wokwi error:', error);
      };
    }
  }

  private async loadDiagram(): Promise<void> {
    if (!this.client) {
      throw new WebSerialError('Client is not connected');
    }

    const diagramPath = getProjectFsRoot(this.project.id) + '/diagram.json';
    if (!fs.existsSync(diagramPath)) {
      fs.writeFileSync(diagramPath, diagramDefault, 'utf-8');
    }
    const diagramFromFs = fs.readFileSync(diagramPath, 'utf-8');
    await this.client.fileUpload('diagram.json', diagramFromFs);
  }

  private async handleStart(): Promise<void> {
    if (!this.client) {
      throw new WebSerialError('Client is not connected');
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

  // private handleEnd(): void {
  //   if (this.callbacks.end) {
  //     this.callbacks.end();
  //   }
  // }

  public async put(c: number): Promise<void> {
    if (!this.client) {
      throw new WebSerialError('Client is not connected');
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
      throw new WebSerialError('Client is not connected');
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
    if (this.isDestroyed) {
      return;
    }

    this.isDestroyed = true;

    try {
      // remove the message listener we added in the constructor
      if (this.boundHandleMessage) {
        window.removeEventListener('message', this.boundHandleMessage);
      }
      // Close the port
      if (this.client) {
        this.client.close();
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
