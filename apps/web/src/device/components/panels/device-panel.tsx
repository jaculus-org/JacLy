import { DeviceControl } from '@/device';

export function DevicePanel() {
  return (
    <DeviceControl.Provider>
      <DeviceControl.Panel />
    </DeviceControl.Provider>
  );
}
