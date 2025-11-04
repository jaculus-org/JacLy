import { JacDevice } from '@jaculus/device';
import { Usb, Bluetooth, Monitor } from 'lucide-react';
import { JacStreamSerial } from './jac-stream';
import logger from '../logger';

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

export async function connectDevice(type: ConnectionType): Promise<JacDevice> {
  switch (type) {
    case 'serial':
      return connectDeviceWebSerial();
    case 'ble':
      return connectDeviceWebBLE();
    case 'wokwi':
      return connectDeviceWokwiSimulator();
    default:
      return Promise.reject(new Error(`Unknown connection type: ${type}`));
  }
}

// WEB SERIAL

export function isWebSerialAvailable(): boolean {
  return 'serial' in navigator;
}

export async function connectDeviceWebSerial(): Promise<JacDevice> {
  const port = await navigator.serial.requestPort();
  await port.open({ baudRate: 921600 });
  const stream = new JacStreamSerial(port, logger);
  return new JacDevice(stream, logger);
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
  return false;
}

export async function connectDeviceWokwiSimulator(): Promise<JacDevice> {
  return Promise.reject(new Error('Wokwi Simulator not implemented'));
}
