export { JacDeviceProvider } from './jac-device-provider';
export {
  useJacDevice,
  type JacDeviceActions,
  type JacDeviceContextValue,
  type JacDeviceMeta,
  type JacDeviceState,
} from './jac-device-context';

import { JacDeviceProvider } from './jac-device-provider';

export const JacDevice = {
  Provider: JacDeviceProvider,
};
