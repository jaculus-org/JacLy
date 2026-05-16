export {
  Build,
  BuildFlash,
  ConnectedDevice,
  ConnectionSelector,
  ConsoleSelector,
  ControlSection,
  InfoSection,
  JacDeviceControlPanel,
  WifiModal,
  WifiSection,
} from './device-control';
export { type JacDeviceControlActions, type JacDeviceControlContextValue, type JacDeviceControlMeta, type JacDeviceControlState, useJacDeviceControl, type WifiModalMode } from './device-control';
export { JacDeviceControlProvider } from './device-control';
export { DevicePanel } from './panels/device-panel';
export { DeviceDisconnected } from './panels/disconnected';
export { compileProject } from './services/compilation';
export {
  connectDevice,
  connectDeviceWebBLE,
  connectDeviceWebSerial,
  connectDeviceWokwiSimulator,
  getAvailableConnectionTypes,
  isWebBLEAvailable,
  isWebSerialAvailable,
  isWokwiAvailable,
  sendToDevice,
  sendToDeviceStr,
  UnknownConnectionTypeError,
} from './services/connection';
export {
  addWifiNetwork,
  getCurrentWifiIp,
  getWifiApPassword,
  getWifiApSsid,
  getWifiMode,
  removeWifiNetwork,
  restart,
  setWifiApPassword,
  setWifiApSsid,
  setWifiMode,
  start,
  status,
  stop,
  testConnection,
  uploadCode,
  version,
} from './services/device-operations';
export {
  type JacDeviceActions,
  type JacDeviceContextValue,
  type JacDeviceMeta,
  type JacDeviceState,
  useJacDevice,
} from './device-context';
export { JacDeviceProvider } from './device-provider';
export type { ConnectionStatus, ConnectionType } from './types/connection';
export type { JacStream } from './types/stream';

import { JacDeviceControlPanel, ControlSection, InfoSection, WifiSection } from './device-control';
import { JacDeviceControlProvider } from './device-control';
import { JacDeviceProvider } from './device-provider';

export const JacDevice = {
  Provider: JacDeviceProvider,
};

export const DeviceControl = {
  Provider: JacDeviceControlProvider,
  Panel: JacDeviceControlPanel,
  ControlSection,
  InfoSection,
  WifiSection,
};