import type { StateCreator } from 'zustand';

export interface DeviceSlice {
  device: {
    transport: 'ble' | 'usb';
    status: 'disconnected' | 'connecting' | 'connected';
    lastError?: string;
  };
  deviceActions: {
    setTransport(t: DeviceSlice['device']['transport']): void;
    setStatus(s: DeviceSlice['device']['status']): void;
    setError(msg?: DeviceSlice['device']['lastError']): void;
  };
}

export const createDeviceSlice: StateCreator<
  DeviceSlice,
  [],
  [],
  DeviceSlice
> = set => ({
  device: { transport: 'usb', status: 'disconnected' },
  deviceActions: {
    setTransport: t => set(s => ({ device: { ...s.device, transport: t } })),
    setStatus: status => set(s => ({ device: { ...s.device, status } })),
    setError: lastError => set(s => ({ device: { ...s.device, lastError } })),
  },
});
