import { createContext, useContext } from 'react';
import type { JacDevice } from '@jaculus/device';
import type { ConnectionStatus } from '../types/connection';

export type WifiModalMode = 'network' | 'ap' | 'remove' | null;

export interface DeviceStatusInfo {
  running: boolean;
  exitCode?: number;
  status: string;
}

export interface JacDeviceControlState {
  device: JacDevice | null;
  connectionStatus: ConnectionStatus;
  loading: Record<string, boolean>;
  wifiMode: string;
  wifiApSsid: string;
  wifiIp: string;
  wifiModalOpen: boolean;
  wifiModalMode: WifiModalMode;
  newNetworkSsid: string;
  newNetworkPassword: string;
  apSsid: string;
  apPassword: string;
  removeNetworkSsid: string;
  deviceStatus: DeviceStatusInfo | null;
  deviceVersion: { esp32: string; dcore: string } | null;
}

export interface JacDeviceControlActions {
  refreshWifi: () => Promise<void>;
  refreshDevice: () => Promise<void>;
  setWifiMode: (value: string) => void;
  openWifiModal: (mode: WifiModalMode) => void;
  closeWifiModal: () => void;
  addNetwork: () => Promise<void>;
  removeNetwork: () => Promise<void>;
  configureAp: () => Promise<void>;
  setNewNetworkSsid: (value: string) => void;
  setNewNetworkPassword: (value: string) => void;
  setApSsid: (value: string) => void;
  setApPassword: (value: string) => void;
  setRemoveNetworkSsid: (value: string) => void;
  startProgram: () => Promise<void>;
  stopProgram: () => Promise<void>;
  restartProgram: () => Promise<void>;
}

export interface JacDeviceControlMeta {
  isConnected: boolean;
}

export interface JacDeviceControlContextValue {
  state: JacDeviceControlState;
  actions: JacDeviceControlActions;
  meta: JacDeviceControlMeta;
}

export const JacDeviceControlContext = createContext<
  JacDeviceControlContextValue | undefined
>(undefined);

export function useJacDeviceControl(): JacDeviceControlContextValue {
  const context = useContext(JacDeviceControlContext);
  if (!context) {
    throw new Error(
      'useJacDeviceControl must be used within JacDeviceControl.Provider'
    );
  }
  return context;
}
