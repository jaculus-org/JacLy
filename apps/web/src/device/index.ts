export {
  useJacDevice,
  type JacDeviceActions,
  type JacDeviceContextValue,
  type JacDeviceMeta,
  type JacDeviceState,
} from './state/device-context';
export { JacDeviceProvider } from './state/device-provider';

export {
  useJacDeviceControl,
  type DeviceStatusInfo,
  type JacDeviceControlActions,
  type JacDeviceControlContextValue,
  type JacDeviceControlMeta,
  type JacDeviceControlState,
  type WifiModalMode,
} from './state/device-control-context';
export { JacDeviceControlProvider } from './state/device-control-provider';

export { createDeviceSlice, type DeviceSlice } from './state/device-slice';

export type { ConnectionStatus, ConnectionType } from './types/connection';
export type { JacStream } from './types/stream';
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
export { compileProject } from './services/compilation';
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
  Build,
  BuildFlash,
  ConnectionSelector,
  ConsoleSelector,
} from './components/controls';
export { ConnectedDevice } from './components/status/connected-device';

export { JacDeviceControlPanel } from './components/panels/device-control-panel';
export { JacDeviceControlDisconnected } from './components/device-disconnected';
export { JacDeviceControlWifiModal } from './components/wifi-modal';
export { JacDeviceControlSectionControl } from './components/sections/device-control-section-control';
export { JacDeviceControlSectionInfo } from './components/sections/device-control-section-info';
export { JacDeviceControlSectionWifi } from './components/sections/device-control-section-wifi';
export { DeviceControlPanelWrapper } from './components/panels/device-control-panel-wrapper';

import { JacDeviceProvider } from './state/device-provider';
import { JacDeviceControlProvider } from './state/device-control-provider';
import { JacDeviceControlPanel } from './components/panels/device-control-panel';
import { JacDeviceControlSectionControl } from './components/sections/device-control-section-control';
import { JacDeviceControlSectionInfo } from './components/sections/device-control-section-info';
import { JacDeviceControlSectionWifi } from './components/sections/device-control-section-wifi';

export const JacDevice = {
  Provider: JacDeviceProvider,
};

export const DeviceControl = {
  Provider: JacDeviceControlProvider,
  Panel: JacDeviceControlPanel,
  ControlSection: JacDeviceControlSectionControl,
  InfoSection: JacDeviceControlSectionInfo,
  WifiSection: JacDeviceControlSectionWifi,
};
