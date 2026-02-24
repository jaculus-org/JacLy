import { BluetoothIcon, MonitorIcon, UsbIcon } from 'lucide-react';
import type { ConnectionInfo, ConnectionType } from '../types/connection';
import { JacDevice } from '@jaculus/device';
import logger from './logger';
import { JacStreamSerial } from './jac-stream-serial';
import type { Duplex } from '@jaculus/link/stream';
import type { AddToStream } from '@/features/stream/types';
import { JacStreamWokwi } from './jac-stream-wokwi';
import { JacStreamBle } from './jac-stream-ble';
import { getDefaultDiagram } from '@/features/wokwi-simulator/lib/wowki';

export function getAvailableConnectionTypes(): ConnectionInfo[] {
  const types: ConnectionInfo[] = [];
  if (isWebSerialAvailable()) {
    types.push({ type: 'serial', name: 'Web Serial', icon: UsbIcon });
  }
  if (isWebBLEAvailable()) {
    types.push({ type: 'ble', name: 'Web Bluetooth', icon: BluetoothIcon });
  }
  if (isWokwiAvailable()) {
    types.push({ type: 'wokwi', name: 'Wokwi Simulator', icon: MonitorIcon });
  }
  return types;
}

// create custom Error class
export class UnknownConnectionTypeError extends Error {
  constructor(type: ConnectionType) {
    super(`Unknown connection type: ${type}`);
    this.name = 'UnknownConnectionTypeError';
  }
}

export async function connectDevice(
  type: ConnectionType,
  addToStream: AddToStream,
  onDisconnect: () => void,
  projectPath: string,
  fs: typeof import('fs')
): Promise<JacDevice> {
  switch (type) {
    case 'serial':
      return connectDeviceWebSerial(addToStream, onDisconnect);
    case 'ble':
      return connectDeviceWebBLE(addToStream, onDisconnect);
    case 'wokwi':
      return connectDeviceWokwiSimulator(
        addToStream,
        onDisconnect,
        projectPath,
        fs
      );
    default:
      return Promise.reject(new UnknownConnectionTypeError(type));
  }
}

function setupJacDevice(stream: Duplex, addToStream: AddToStream): JacDevice {
  const device = new JacDevice(stream, logger);

  device.programOutput.onData(data => {
    const msg = String.fromCharCode(...data);
    addToStream('console-out', msg);
  });

  device.programError.onData(data => {
    const msg = String.fromCharCode(...data);
    addToStream('console-err', msg);
  });

  return device;
}

export function sendToDevice(
  device: JacDevice,
  input: Uint8Array,
  addToStream: AddToStream
): void {
  addToStream('console-in', new TextDecoder().decode(input));
  device.programInput.write(input);
}

export function sendToDeviceStr(
  device: JacDevice,
  input: string,
  addToStream: AddToStream
): void {
  addToStream('console-in', input);
  device.programInput.write(new TextEncoder().encode(input));
}

// WEB SERIAL

export function isWebSerialAvailable(): boolean {
  return 'serial' in navigator;
}

export async function connectDeviceWebSerial(
  addToStream: AddToStream,
  onDisconnect: () => void
): Promise<JacDevice> {
  const port = await navigator.serial.requestPort();
  await port.open({ baudRate: 921600 });

  const stream = new JacStreamSerial(port, logger);
  const device = setupJacDevice(stream, addToStream);
  stream.onEnd(() => onDisconnect());

  return device;
}

// WEB BLE

export function isWebBLEAvailable(): boolean {
  return 'bluetooth' in navigator;
}

export async function connectDeviceWebBLE(
  addToStream: AddToStream,
  onDisconnect: () => void
): Promise<JacDevice> {
  const bleDevice = await navigator.bluetooth.requestDevice({
    filters: [
      {
        services: [0xffe0], // Jaculus BLE UART service
      },
    ],
    optionalServices: [],
  });

  const stream = new JacStreamBle(bleDevice, logger);
  const device = setupJacDevice(stream, addToStream);
  stream.onEnd(() => onDisconnect());

  return device;
}

// WOKWI SIMULATOR

export function isWokwiAvailable(): boolean {
  return true;
}

export async function connectDeviceWokwiSimulator(
  addToStream: AddToStream,
  onDisconnect: () => void,
  projectPath: string,
  fs: typeof import('fs')
): Promise<JacDevice> {
  const stream = new JacStreamWokwi(logger, {
    handleReadDiagram: async () => {
      const diagramPath = `${projectPath}/diagram.json`;
      try {
        const content = await fs.promises.readFile(diagramPath);
        return content.toString();
      } catch {
        return JSON.stringify(getDefaultDiagram());
      }
    },
    handleWriteDiagram: async (data: Uint8Array | string) => {
      const diagramPath = `${projectPath}/diagram.json`;
      await fs.promises.writeFile(diagramPath, data);
    },
    handleReadFirmware: async () => {
      const firmwareResponse = await fetch('/bin/jaculus-esp32s3-quad.uf2');
      return new Uint8Array(await firmwareResponse.arrayBuffer());
    },
  });

  const device = setupJacDevice(stream, addToStream);
  stream.onEnd(() => onDisconnect());

  return device;
}
