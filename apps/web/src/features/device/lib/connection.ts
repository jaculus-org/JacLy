import { BluetoothIcon, MonitorIcon, UsbIcon } from 'lucide-react';
import type { ConnectionInfo, ConnectionType } from '../types/connection';
import { JacDevice } from '@jaculus/device';
import logger from './logger';
import { JacSerialStream } from './jac-stream';

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

export async function connectDevice(type: ConnectionType): Promise<JacDevice> {
  switch (type) {
    case 'serial':
      return connectDeviceWebSerial();
    // case 'ble':
    //   return connectDeviceWebBLE();
    // case 'wokwi':
    //   return connectDeviceWokwiSimulator(project, addToTerminal);
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
  const stream = new JacSerialStream(port, logger);
  const device = new JacDevice(stream, logger);
  return device;
}

// WEB BLE

export function isWebBLEAvailable(): boolean {
  return 'bluetooth' in navigator;
}

// WOKWI SIMULATOR

export function isWokwiAvailable(): boolean {
  return false;
}
