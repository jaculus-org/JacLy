import { DeviceControl } from '@/device';

export function DeviceControlPanelWrapper() {
  return (
    <DeviceControl.Provider>
      <DeviceControl.Panel />
    </DeviceControl.Provider>
  );
}
