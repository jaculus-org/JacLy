import { JacDevice } from '@jaculus/device';
import { JacStreamSerial } from '@/jaculus/device/stream';
import logger from '@/jaculus/log/logger';
import { Usb, Bluetooth, Monitor } from 'lucide-react';

export type ConnectionType = 'serial' | 'ble' | 'wokwi';

export type ConnectionInfo = {
  type: ConnectionType;
  name: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
};

export function getAvailableConnectionTypes(): ConnectionInfo[] {
  const types: ConnectionInfo[] = [];
  if (isWebSerialSupported()) {
    types.push({ type: 'serial', name: 'Web Serial', icon: Usb });
  }
  if (isWebBLESupported()) {
    types.push({ type: 'ble', name: 'Web Bluetooth', icon: Bluetooth });
  }
  if (isWokwiSimulator()) {
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

export function isWebSerialSupported(): boolean {
  return 'serial' in navigator;
}

export async function connectDeviceWebSerial(): Promise<JacDevice> {
  const port = await navigator.serial.requestPort();
  await port.open({ baudRate: 921600 });
  const stream = new JacStreamSerial(port, logger);
  return new JacDevice(stream, logger);
}

// WEB BLE

export function isWebBLESupported(): boolean {
  return 'bluetooth' in navigator;
}

export async function connectDeviceWebBLE(): Promise<JacDevice> {
  return Promise.reject(new Error('BLE not implemented'));
}

// WOKWI SIMULATOR

export function isWokwiSimulator(): boolean {
  return false;
}

export async function connectDeviceWokwiSimulator(): Promise<JacDevice> {
  return Promise.reject(new Error('Wokwi Simulator not implemented'));
}
