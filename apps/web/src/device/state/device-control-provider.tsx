import { type ReactNode, useEffect, useMemo } from 'react';
import { useJacDevice } from './device-context';
import {
  JacDeviceControlContext,
  type JacDeviceControlContextValue,
} from './device-control-context';
import { useWifiControl } from '../hooks/use-wifi-control';
import { useProgramControl } from '../hooks/use-program-control';

export function JacDeviceControlProvider({
  children,
}: {
  children: ReactNode;
}) {
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

  const value = useMemo<JacDeviceControlContextValue>(
    () => ({
      state: {
        device,
        connectionStatus,
        loading: { ...wifi.loading, ...program.loading },
        ...wifi.state,
        ...program.state,
      },
      actions: { ...wifi.actions, ...program.actions },
      meta: { isConnected: !!device && connectionStatus === 'connected' },
    }),
    [
      device,
      connectionStatus,
      wifi.loading,
      wifi.state,
      wifi.actions,
      program.loading,
      program.state,
      program.actions,
    ]
  );

  return (
    <JacDeviceControlContext.Provider value={value}>
      {children}
    </JacDeviceControlContext.Provider>
  );
}
