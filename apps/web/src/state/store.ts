import { create } from 'zustand';
import {
  createDeviceSlice,
  type DeviceSlice,
} from '@/state/slices/device-slice';

export type AppState = DeviceSlice;

export const useAppStore = create<AppState>()((...a) => ({
  ...createDeviceSlice(...a),
}));
