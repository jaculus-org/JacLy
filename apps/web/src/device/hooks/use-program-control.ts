import type { JacDevice } from '@jaculus/device';
import { useCallback, useState } from 'react';
import { restart, start, status, stop, version } from '../services/device-operations';
import type { DeviceStatusInfo } from '../state/device-control-context';
import { useLoadingState } from './use-loading';

export function useProgramControl(device: JacDevice | null) {
  const { loading, withLoading } = useLoadingState();
  const [deviceStatus, setDeviceStatus] = useState<DeviceStatusInfo | null>(null);
  const [deviceVersion, setDeviceVersion] = useState<{
    esp32: string;
    dcore: string;
  } | null>(null);

  const refreshDevice = useCallback(async () => {
    await withLoading('getDeviceInfo', async () => {
      if (!device) return;
      const [statusInfo, versionInfo] = await Promise.all([status(device), version(device)]);
      setDeviceStatus(statusInfo);
      setDeviceVersion(versionInfo);
    });
  }, [device, withLoading]);

  const startProgram = useCallback(async () => {
    if (!device) return;
    await withLoading('start', async () => {
      await start(device);
      await refreshDevice();
    });
  }, [device, withLoading, refreshDevice]);

  const stopProgram = useCallback(async () => {
    if (!device) return;
    await withLoading('stop', async () => {
      await stop(device);
      await refreshDevice();
    });
  }, [device, withLoading, refreshDevice]);

  const restartProgram = useCallback(async () => {
    if (!device) return;
    await withLoading('restart', async () => {
      await restart(device);
      await refreshDevice();
    });
  }, [device, withLoading, refreshDevice]);

  const state = { deviceStatus, deviceVersion };

  const actions = { refreshDevice, startProgram, stopProgram, restartProgram };

  return { loading, state, actions };
}
