import { BluetoothIcon, MonitorIcon, UsbIcon } from 'lucide-react';
import type { ConnectionInfo, ConnectionType } from '../types/connection';
import { JacDevice } from '@jaculus/device';
import logger from './logger';
import { JacStreamSerial } from './jac-stream-serial';
import type { Duplex } from '@jaculus/link/stream';
import type { AddToTerminal } from '@/features/terminal/provider/terminal-provider';
import { JacStreamWokwi } from './jac-stream-wokwi';

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
  addToTerminal: AddToTerminal,
  onDisconnect: () => void,
  projectPath: string,
  fs: typeof import('fs')
): Promise<JacDevice> {
  switch (type) {
    case 'serial':
      return connectDeviceWebSerial(addToTerminal, onDisconnect);
    // case 'ble':
    //   return connectDeviceWebBLE();
    case 'wokwi':
      return connectDeviceWokwiSimulator(
        addToTerminal,
        onDisconnect,
        projectPath,
        fs
      );
    default:
      return Promise.reject(new UnknownConnectionTypeError(type));
  }
}

function setupJacDevice(
  stream: Duplex,
  addToTerminal: AddToTerminal
): JacDevice {
  const device = new JacDevice(stream, logger);

  device.programOutput.onData(data => {
    const msg = String.fromCharCode(...data);
    addToTerminal('console-out', msg);
  });

  device.programError.onData(data => {
    const msg = String.fromCharCode(...data);
    addToTerminal('console-err', msg);
  });

  return device;
}

export function sendToDevice(
  device: JacDevice,
  input: Uint8Array,
  addToTerminal: AddToTerminal
): void {
  addToTerminal('console-in', new TextDecoder().decode(input));
  device.programInput.write(input);
}

export function sendToDeviceStr(
  device: JacDevice,
  input: string,
  addToTerminal: AddToTerminal
): void {
  addToTerminal('console-in', input);
  device.programInput.write(new TextEncoder().encode(input));
}

// WEB SERIAL

export function isWebSerialAvailable(): boolean {
  return 'serial' in navigator;
}

export async function connectDeviceWebSerial(
  addToTerminal: AddToTerminal,
  onDisconnect: () => void
): Promise<JacDevice> {
  const port = await navigator.serial.requestPort();
  await port.open({ baudRate: 921600 });
  const stream = new JacStreamSerial(port, logger);

  navigator.serial.addEventListener('disconnect', event => {
    if (event.target === port) {
      onDisconnect();
    }
  });

  return setupJacDevice(stream, addToTerminal);
}

// WEB BLE

export function isWebBLEAvailable(): boolean {
  return 'bluetooth' in navigator;
}

// WOKWI SIMULATOR

export function isWokwiAvailable(): boolean {
  return true;
}

export async function connectDeviceWokwiSimulator(
  addToTerminal: AddToTerminal,
  _onDisconnect: () => void,
  projectPath: string,
  fs: typeof import('fs')
): Promise<JacDevice> {
  const stream = new JacStreamWokwi(logger, {
    handleReadDiagram: async () => {
      const diagramPath = `${projectPath}/diagram.json`;
      return (
        (await fs.promises.readFile(diagramPath)) ||
        new Uint8Array('{}'.split('').map(c => c.charCodeAt(0)))
      );
    },
    handleWriteDiagram: async (data: Uint8Array) => {
      const diagramPath = `${projectPath}/diagram.json`;
      await fs.promises.writeFile(diagramPath, data);
    },
    handleReadFirmware: async () => {
      const firmwareResponse = await fetch('/bin/jaculus-esp32s3-quad.uf2');
      return new Uint8Array(await firmwareResponse.arrayBuffer());
    },
  });

  return setupJacDevice(stream, addToTerminal);
}
