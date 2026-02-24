import { JacDeviceControl } from '@/features/jac-device-control';

export function JaculusPanel() {
  return (
    <JacDeviceControl.Provider>
      <JacDeviceControl.Panel />
    </JacDeviceControl.Provider>
  );
}
