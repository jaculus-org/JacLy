import { type ReactNode, useEffect } from 'react';
import { useProgramControl } from '../hooks/use-program-control';
import { useWifiControl } from '../hooks/use-wifi-control';
import { useJacDevice } from './device-context';
import {
  JacDeviceControlContext,
  type JacDeviceControlContextValue,
} from './device-control-context';

export function JacDeviceControlProvider({ children }: { children: ReactNode }) {
  const {
    state: { device, connectionStatus },
  } = useJacDevice();

  const wifi = useWifiControl(device);
  const program = useProgramControl(device);

  const { refreshDevice } = program.actions;
  const { refreshWifi } = wifi.actions;

  useEffect(() => {
    if (!device || connectionStatus !== 'connected') return;
    const timer = setTimeout(() => {
      void refreshDevice();
      void refreshWifi();
    }, 1000);
    return () => clearTimeout(timer);
  }, [device, connectionStatus, refreshDevice, refreshWifi]);

  const value: JacDeviceControlContextValue = {
    state: {
      device,
      connectionStatus,
      loading: { ...wifi.loading, ...program.loading },
      ...wifi.state,
      ...program.state,
    },
    actions: { ...wifi.actions, ...program.actions },
    meta: { isConnected: !!device && connectionStatus === 'connected' },
  };

  return (
    <JacDeviceControlContext.Provider value={value}>{children}</JacDeviceControlContext.Provider>
  );
}
