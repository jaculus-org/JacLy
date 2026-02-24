import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useJacDevice } from '@/features/jac-device';
import {
  addWifiNetwork,
  getCurrentWifiIp,
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
  version,
} from '@/features/jac-device/lib/device';
import {
  JacDeviceControlContext,
  type DeviceStatusInfo,
  type JacDeviceControlActions,
  type JacDeviceControlContextValue,
  type JacDeviceControlState,
  type WifiModalMode,
} from './jac-device-control-context';

interface JacDeviceControlProviderProps {
  children: ReactNode;
}

export function JacDeviceControlProvider({
  children,
}: JacDeviceControlProviderProps) {
  const {
    state: { device, connectionStatus },
  } = useJacDevice();

  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [wifiMode, setWifiModeState] = useState('');
  const [wifiApSsid, setWifiApSsidState] = useState('');
  const [wifiIp, setWifiIpState] = useState('');
  const [wifiModalOpen, setWifiModalOpen] = useState(false);
  const [wifiModalMode, setWifiModalMode] = useState<WifiModalMode>(null);
  const [newNetworkSsid, setNewNetworkSsid] = useState('');
  const [newNetworkPassword, setNewNetworkPassword] = useState('');
  const [apSsid, setApSsidState] = useState('');
  const [apPassword, setApPasswordState] = useState('');
  const [removeNetworkSsid, setRemoveNetworkSsid] = useState('');
  const [deviceStatus, setDeviceStatus] = useState<DeviceStatusInfo | null>(
    null
  );
  const [deviceVersion, setDeviceVersion] = useState<string[]>([]);
  const autoRefreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleLoading = useCallback(
    async (key: string, fn: () => Promise<void>) => {
      setLoading(prev => ({ ...prev, [key]: true }));
      try {
        await fn();
      } finally {
        setLoading(prev => ({ ...prev, [key]: false }));
      }
    },
    []
  );

  const handleGetWifiInfo = useCallback(async () => {
    await handleLoading('getWifiInfo', async () => {
      if (!device) return;
      const mode = await getWifiMode(device);
      const ssid = await getWifiApSsid(device);
      const ip = await getCurrentWifiIp(device);
      setWifiModeState(String(mode));
      setWifiApSsidState(ssid);
      setWifiIpState(ip);
    });
  }, [device, handleLoading]);

  const handleGetDeviceInfo = useCallback(async () => {
    await handleLoading('getDeviceInfo', async () => {
      if (!device) return;
      const [statusInfo, versionInfo] = await Promise.all([
        status(device),
        version(device),
      ]);
      setDeviceStatus(statusInfo);
      setDeviceVersion(versionInfo);
    });
  }, [device, handleLoading]);

  const startAutoRefresh = useCallback(() => {
    if (!device) return;

    if (autoRefreshIntervalRef.current) {
      clearInterval(autoRefreshIntervalRef.current);
    }

    let attempts = 0;
    setLoading(prev => ({ ...prev, getWifiInfo: true }));

    autoRefreshIntervalRef.current = setInterval(async () => {
      attempts++;

      if (attempts >= 8) {
        clearInterval(autoRefreshIntervalRef.current!);
        autoRefreshIntervalRef.current = null;
        setLoading(prev => ({ ...prev, getWifiInfo: false }));
        return;
      }

      try {
        const mode = await getWifiMode(device);
        const ssid = await getWifiApSsid(device);
        const ip = await getCurrentWifiIp(device);

        setWifiModeState(String(mode));
        setWifiApSsidState(ssid);
        setWifiIpState(ip);

        if (ip && ip.trim() !== '') {
          clearInterval(autoRefreshIntervalRef.current!);
          autoRefreshIntervalRef.current = null;
          setLoading(prev => ({ ...prev, getWifiInfo: false }));
        }
      } catch (error) {
        console.error('Auto-refresh error:', error);
      }
    }, 5000);
  }, [device]);

  const handleWifiModeChange = useCallback(
    (value: string) => {
      if (!device) return;
      void handleLoading('setWifiMode', async () => {
        await setWifiMode(device, parseInt(value));
        setWifiModeState(value);
        setWifiIpState('');
        startAutoRefresh();
      });
    },
    [device, handleLoading, startAutoRefresh]
  );

  const handleOpenWifiModal = useCallback(
    (mode: WifiModalMode) => {
      if (mode === 'ap') {
        setApSsidState(wifiApSsid);
      }
      setWifiModalMode(mode);
      setWifiModalOpen(true);
    },
    [wifiApSsid]
  );

  const handleCloseWifiModal = useCallback(() => {
    setWifiModalOpen(false);
    setWifiModalMode(null);
    setNewNetworkSsid('');
    setNewNetworkPassword('');
    setApSsidState('');
    setApPasswordState('');
    setRemoveNetworkSsid('');
  }, []);

  const handleAddNetwork = useCallback(async () => {
    if (!device || !newNetworkSsid || !newNetworkPassword) return;
    await handleLoading('addNetwork', async () => {
      await addWifiNetwork(device, newNetworkSsid, newNetworkPassword);
      setNewNetworkSsid('');
      setNewNetworkPassword('');
      setWifiModalOpen(false);
      setWifiModalMode(null);
    });
  }, [device, newNetworkPassword, newNetworkSsid, handleLoading]);

  const handleRemoveNetwork = useCallback(async () => {
    if (!device || !removeNetworkSsid) return;
    await handleLoading('removeNetwork', async () => {
      await removeWifiNetwork(device, removeNetworkSsid);
      setRemoveNetworkSsid('');
      setWifiModalOpen(false);
      setWifiModalMode(null);
    });
  }, [device, removeNetworkSsid, handleLoading]);

  const handleConfigureAp = useCallback(async () => {
    if (!device || !apSsid || !apPassword) return;
    await handleLoading('configureAp', async () => {
      await setWifiApSsid(device, apSsid);
      await setWifiApPassword(device, apPassword);
      setApSsidState('');
      setApPasswordState('');
      setWifiModalOpen(false);
      setWifiModalMode(null);
      await handleGetWifiInfo();
    });
  }, [device, apSsid, apPassword, handleLoading, handleGetWifiInfo]);

  const startProgram = useCallback(async () => {
    if (!device) return;
    await handleLoading('start', async () => {
      await start(device);
      await handleGetDeviceInfo();
    });
  }, [device, handleLoading, handleGetDeviceInfo]);

  const stopProgram = useCallback(async () => {
    if (!device) return;
    await handleLoading('stop', async () => {
      await stop(device);
      await handleGetDeviceInfo();
    });
  }, [device, handleLoading, handleGetDeviceInfo]);

  const restartProgram = useCallback(async () => {
    if (!device) return;
    await handleLoading('restart', async () => {
      await restart(device);
      await handleGetDeviceInfo();
    });
  }, [device, handleLoading, handleGetDeviceInfo]);

  useEffect(() => {
    if (device && connectionStatus === 'connected') {
      const timer = setTimeout(() => {
        void handleGetDeviceInfo();
        void handleGetWifiInfo();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [device, connectionStatus, handleGetDeviceInfo, handleGetWifiInfo]);

  useEffect(() => {
    return () => {
      if (autoRefreshIntervalRef.current) {
        clearInterval(autoRefreshIntervalRef.current);
      }
    };
  }, []);

  const state = useMemo<JacDeviceControlState>(
    () => ({
      device,
      connectionStatus,
      loading,
      wifiMode,
      wifiApSsid,
      wifiIp,
      wifiModalOpen,
      wifiModalMode,
      newNetworkSsid,
      newNetworkPassword,
      apSsid,
      apPassword,
      removeNetworkSsid,
      deviceStatus,
      deviceVersion,
    }),
    [
      device,
      connectionStatus,
      loading,
      wifiMode,
      wifiApSsid,
      wifiIp,
      wifiModalOpen,
      wifiModalMode,
      newNetworkSsid,
      newNetworkPassword,
      apSsid,
      apPassword,
      removeNetworkSsid,
      deviceStatus,
      deviceVersion,
    ]
  );

  const actions = useMemo<JacDeviceControlActions>(
    () => ({
      handleGetWifiInfo,
      handleGetDeviceInfo,
      handleWifiModeChange,
      handleOpenWifiModal,
      handleCloseWifiModal,
      handleAddNetwork,
      handleRemoveNetwork,
      handleConfigureAp,
      setNewNetworkSsid,
      setNewNetworkPassword,
      setApSsid: setApSsidState,
      setApPassword: setApPasswordState,
      setRemoveNetworkSsid,
      startProgram,
      stopProgram,
      restartProgram,
    }),
    [
      handleGetWifiInfo,
      handleGetDeviceInfo,
      handleWifiModeChange,
      handleOpenWifiModal,
      handleCloseWifiModal,
      handleAddNetwork,
      handleRemoveNetwork,
      handleConfigureAp,
      startProgram,
      stopProgram,
      restartProgram,
    ]
  );

  const value = useMemo<JacDeviceControlContextValue>(
    () => ({
      state,
      actions,
      meta: {
        isConnected: !!device && connectionStatus === 'connected',
      },
    }),
    [state, actions, device, connectionStatus]
  );

  return (
    <JacDeviceControlContext.Provider value={value}>
      {children}
    </JacDeviceControlContext.Provider>
  );
}
