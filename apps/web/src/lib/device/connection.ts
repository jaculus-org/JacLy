import { JacDevice } from '@jaculus/device';
import { Usb, Bluetooth, Monitor } from 'lucide-react';
import { JacSerialStream } from './jac-stream';
import logger from '../logger';
import type { AddToTerminal, TerminalStreamType } from '@/hooks/terminal-store';
import { Buffer } from 'buffer';
import type { JaclyProject } from '../projects/project-manager';

export type ConnectionType = 'serial' | 'ble' | 'wokwi';

export type ConnectionInfo = {
  type: ConnectionType;
  name: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
};

export function getAvailableConnectionTypes(): ConnectionInfo[] {
  const types: ConnectionInfo[] = [];
  if (isWebSerialAvailable()) {
    types.push({ type: 'serial', name: 'Web Serial', icon: Usb });
  }
  if (isWebBLEAvailable()) {
    types.push({ type: 'ble', name: 'Web Bluetooth', icon: Bluetooth });
  }
  if (isWokwiAvailable()) {
    types.push({ type: 'wokwi', name: 'Wokwi Simulator', icon: Monitor });
  }
  return types;
}

export async function connectDevice(
  type: ConnectionType,
  project: JaclyProject,
  addToTerminal: AddToTerminal
): Promise<JacDevice> {
  switch (type) {
    case 'serial':
      return connectDeviceWebSerial(addToTerminal);
    case 'ble':
      return connectDeviceWebBLE();
    case 'wokwi':
      return connectDeviceWokwiSimulator(project, addToTerminal);
    default:
      return Promise.reject(new Error(`Unknown connection type: ${type}`));
  }
}

// WEB SERIAL

export function isWebSerialAvailable(): boolean {
  return 'serial' in navigator;
}

// function convertDataToString(data: any): string {
//   try {
//     if (Buffer.isBuffer(data)) {
//       return data.toString('utf8');
//     }
//     if (data instanceof Uint8Array) {
//       return String.fromCharCode(...data);
//     }
//     if (Array.isArray(data)) {
//       return String.fromCharCode(...data);
//     }
//     if (typeof data === 'string') {
//       return data;
//     }
//     // Fallback: try to convert to Uint8Array first
//     return String.fromCharCode(...new Uint8Array(data));
//   } catch (error) {
//     logger.warn(`Failed to convert data to string: ${error}`);
//     return String(data);
//   }
// }

export function setupDeviceTerminalStreams(
  device: JacDevice,
  addToTerminal: (type: TerminalStreamType, content: string) => void
): void {
  // Connect program output to runtime stdout
  device.programOutput.onData(data => {
    console.log('Program output data:', data);
    addToTerminal('runtime-stdout', String.fromCharCode(...data));
  });

  // Connect program error to runtime stderr
  device.programError.onData(data => {
    console.log('Program error data:', data);
    addToTerminal('runtime-stderr', String.fromCharCode(...data));
  });

  // Connect error output to system
  device.errorOutput.onData(data => {
    addToTerminal('system', String.fromCharCode(...data));
  });

  // Connect log output to system
  device.logOutput.onData(data => {
    addToTerminal('system', String.fromCharCode(...data));
  });

  // Connect debug output to debug
  device.debugOutput.onData(data => {
    addToTerminal('debug', String.fromCharCode(...data));
  });
}

// Helper function to send input to device from terminal
export function sendToDevice(device: JacDevice, input: string): void {
  device.programInput.write(Buffer.from(input));
}

export async function connectDeviceWebSerial(
  addToTerminal: AddToTerminal
): Promise<JacDevice> {
  const port = await navigator.serial.requestPort();
  await port.open({ baudRate: 921600 });
  const stream = new JacSerialStream(port, logger);
  const device = new JacDevice(stream, logger);

  // Connect device streams to terminal if addToTerminal is provided
  if (addToTerminal) {
    setupDeviceTerminalStreams(device, addToTerminal);
  }

  return device;
}

// WEB BLE

export function isWebBLEAvailable(): boolean {
  return 'bluetooth' in navigator;
}

export async function connectDeviceWebBLE(): Promise<JacDevice> {
  return Promise.reject(new Error('BLE not implemented'));
}

// WOKWI SIMULATOR

export function isWokwiAvailable(): boolean {
  return true;
}

export async function connectDeviceWokwiSimulator(
  project: JaclyProject,
  addToTerminal: AddToTerminal
): Promise<JacDevice> {
  // Dynamically import to avoid bundling the module during build
  const { JacSerialWokwi } = await import('./jac-wokwi');
  const stream = new JacSerialWokwi(project, logger);
  const device = new JacDevice(stream, logger);

  // Connect device streams to terminal if addToTerminal is provided
  if (addToTerminal) {
    setupDeviceTerminalStreams(device, addToTerminal);
  }

  return device;
}
