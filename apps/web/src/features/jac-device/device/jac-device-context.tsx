import { createContext, useContext } from 'react';
import type { Writable } from 'node:stream';
import type { JacDevice } from '@jaculus/device';
import type { Project } from '@jaculus/project';
import type { PackageJson } from '@jaculus/project/package';
import type { ConnectionStatus, ConnectionType } from '../types/connection';

export interface JacDeviceState {
  jacProject: Project | null;
  device: JacDevice | null;
  connectionType: ConnectionType | null;
  outStream?: Writable;
  errStream?: Writable;
  pkg: PackageJson | null;
  nodeModulesVersion: number;
  connectionStatus: ConnectionStatus;
}

export interface JacDeviceActions {
  setDevice: (
    device: JacDevice | null,
    connectionType?: ConnectionType
  ) => Promise<void>;
  reloadNodeModules: () => void;
  setConnectionStatus: (status: ConnectionStatus) => void;
}

export type JacDeviceMeta = Record<string, never>;

export interface JacDeviceContextValue {
  state: JacDeviceState;
  actions: JacDeviceActions;
  meta: JacDeviceMeta;
}

export const JacDeviceContext = createContext<
  JacDeviceContextValue | undefined
>(undefined);

export function useJacDevice(): JacDeviceContextValue {
  const context = useContext(JacDeviceContext);
  if (!context) {
    throw new Error('useJacDevice must be used within a JacDevice.Provider');
  }
  return context;
}
