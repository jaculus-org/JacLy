import { type Duplex } from '@jaculus/link/stream';
import { type Logger } from '@jaculus/common';
import { JacStreamBase, JacStreamError } from './jac-stream-base';

const SERVICE_UUID = 0xffe0;
const CHARACTERISTIC_UUID = 0xffe1;

export class JacStreamBle extends JacStreamBase implements Duplex {
  private device: BluetoothDevice;
  private server: BluetoothRemoteGATTServer | null = null;
  private service: BluetoothRemoteGATTService | null = null;
  private characteristic: BluetoothRemoteGATTCharacteristic | null = null;

  constructor(device: BluetoothDevice, logger: Logger) {
    super(logger);
    this.device = device;
    this.initializeStreams();
  }

  private async initializeStreams(): Promise<void> {
    try {
      this.device.addEventListener(
        'gattserverdisconnected',
        this.handleDisconnect.bind(this)
      );

      this.server = await this.device.gatt!.connect();
      this.logger.info(`Connected to BLE device: ${this.device.name}`);

      this.service = await this.server.getPrimaryService(SERVICE_UUID);
      this.characteristic =
        await this.service.getCharacteristic(CHARACTERISTIC_UUID);

      await this.characteristic.startNotifications();
      this.characteristic.addEventListener(
        'characteristicvaluechanged',
        this.onDataReceived.bind(this)
      );
    } catch (error) {
      this.isDestroyed = true;
      this.handleError(error as Error);
    }
  }

  private async cleanupConnection(): Promise<void> {
    if (this.isDestroyed) {
      return;
    }

    this.isDestroyed = true;
    this.logger.warn('BLE connection ended');

    try {
      if (this.characteristic) {
        await this.characteristic.stopNotifications();
      }
      if (this.server?.connected) {
        this.device.gatt?.disconnect();
      }
    } catch {
      // silently ignore cleanup errors
    }

    this.handleEnd();
  }

  private handleDisconnect(): void {
    this.cleanupConnection().catch(err =>
      this.logger.error(`handleDisconnect error: ${err}`)
    );
  }

  private onDataReceived(event: Event): void {
    const target = event.target as BluetoothRemoteGATTCharacteristic;
    const value = target.value;
    if (value) {
      const data = new Uint8Array(value.buffer);
      this.handleData(data);
    }
  }

  public async put(c: number): Promise<void> {
    if (this.isDestroyed || !this.characteristic) {
      throw new JacStreamError(
        'Stream is not initialized or destroyed',
        'WebBleError'
      );
    }

    try {
      const data = new Uint8Array([c]);
      await this.characteristic.writeValue(data);
    } catch (error) {
      this.handleError(error as Error);
      throw error;
    }
  }

  public async write(buf: Uint8Array): Promise<void> {
    if (this.isDestroyed || !this.characteristic) {
      throw new JacStreamError(
        'Stream is not initialized or destroyed',
        'WebBleError'
      );
    }

    try {
      await this.characteristic.writeValue(new Uint8Array(buf));
    } catch (error) {
      this.handleError(error as Error);
      throw error;
    }
  }

  public async destroy(): Promise<void> {
    await this.cleanupConnection().catch(err =>
      this.logger.error(`destroy cleanup error: ${err}`)
    );
  }
}
