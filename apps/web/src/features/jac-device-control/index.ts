export {
  useJacDeviceControl,
  type DeviceStatusInfo,
  type JacDeviceControlActions,
  type JacDeviceControlContextValue,
  type JacDeviceControlMeta,
  type JacDeviceControlState,
  type WifiModalMode,
} from './jac-device-control-context';
export { JacDeviceControlProvider } from './jac-device-control-provider';
export { JacDeviceControlDisconnected } from './components/jac-device-control-disconnected';
export { JacDeviceControlPanel } from './components/jac-device-control-panel';
export { JacDeviceControlWifiModal } from './components/jac-device-control-wifi-modal';
export { JacDeviceControlSectionControl } from './components/sections/jac-device-control-section-control';
export { JacDeviceControlSectionInfo } from './components/sections/jac-device-control-section-info';
export { JacDeviceControlSectionWifi } from './components/sections/jac-device-control-section-wifi';

import { JacDeviceControlPanel } from './components/jac-device-control-panel';
import { JacDeviceControlProvider } from './jac-device-control-provider';
import { JacDeviceControlSectionControl } from './components/sections/jac-device-control-section-control';
import { JacDeviceControlSectionInfo } from './components/sections/jac-device-control-section-info';
import { JacDeviceControlSectionWifi } from './components/sections/jac-device-control-section-wifi';

export const JacDeviceControl = {
  Provider: JacDeviceControlProvider,
  Panel: JacDeviceControlPanel,
  ControlSection: JacDeviceControlSectionControl,
  WifiSection: JacDeviceControlSectionWifi,
  InfoSection: JacDeviceControlSectionInfo,
};
