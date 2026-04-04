import { create } from 'zustand';
import { createDeviceSlice, type DeviceSlice } from '@/device';

export type AppState = DeviceSlice;

export const useAppStore = create<AppState>()((...a) => ({
  ...createDeviceSlice(...a),
}));
