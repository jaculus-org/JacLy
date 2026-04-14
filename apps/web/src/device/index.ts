export {
  Build,
  BuildFlash,
  ConnectedDevice,
  ConnectionSelector,
  ConsoleSelector,
} from './components/controls';
export { JacDeviceControlPanel } from './components/panels/device-control-panel';
export { DevicePanel } from './components/panels/device-panel';
export { DeviceDisconnected } from './components/panels/disconnected';
export { ControlSection } from './components/sections/control-section';
export { InfoSection } from './components/sections/info-section';
export { WifiModal } from './components/sections/wifi-modal';
export { WifiSection } from './components/sections/wifi-section';
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
} from './state/device-context';
export {
  type DeviceStatusInfo,
  type JacDeviceControlActions,
  type JacDeviceControlContextValue,
  type JacDeviceControlMeta,
  type JacDeviceControlState,
  useJacDeviceControl,
  type WifiModalMode,
} from './state/device-control-context';
export { JacDeviceControlProvider } from './state/device-control-provider';
export { JacDeviceProvider } from './state/device-provider';
export type { ConnectionStatus, ConnectionType } from './types/connection';
export type { JacStream } from './types/stream';

import { JacDeviceControlPanel } from './components/panels/device-control-panel';
import { ControlSection } from './components/sections/control-section';
import { InfoSection } from './components/sections/info-section';
import { WifiSection } from './components/sections/wifi-section';
import { JacDeviceControlProvider } from './state/device-control-provider';
import { JacDeviceProvider } from './state/device-provider';

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
