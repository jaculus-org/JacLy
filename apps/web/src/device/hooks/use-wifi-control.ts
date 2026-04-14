import type { JacDevice } from '@jaculus/device';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  addWifiNetwork,
  setWifiMode as applyWifiMode,
  getCurrentWifiIp,
  getWifiApSsid,
  getWifiMode,
  removeWifiNetwork,
  setWifiApPassword,
  setWifiApSsid,
} from '../services/device-operations';
import type { WifiModalMode } from '../state/device-control-context';
import { useLoadingState } from './use-loading';

export function useWifiControl(device: JacDevice | null) {
  const { loading, withLoading, setLoading } = useLoadingState();
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
  const autoRefreshRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (autoRefreshRef.current) clearInterval(autoRefreshRef.current);
    };
  }, []);

  const fetchWifiState = useCallback(async () => {
    if (!device) return;
    const mode = await getWifiMode(device);
    const ssid = await getWifiApSsid(device);
    const ip = await getCurrentWifiIp(device);
    setWifiModeState(String(mode));
    setWifiApSsidState(ssid);
    setWifiIpState(ip);
  }, [device]);

  // Polls until the device reports an IP (up to 8 attempts × 5 s).
  // Used after a wifi mode change to detect when the new mode is active.
  const startAutoRefresh = useCallback(() => {
    if (!device) return;
    if (autoRefreshRef.current) clearInterval(autoRefreshRef.current);

    let attempts = 0;
    setLoading((prev) => ({ ...prev, getWifiInfo: true }));

    autoRefreshRef.current = setInterval(async () => {
      attempts++;
      if (attempts >= 8) {
        clearInterval(autoRefreshRef.current!);
        autoRefreshRef.current = null;
        setLoading((prev) => ({ ...prev, getWifiInfo: false }));
        return;
      }
      try {
        const mode = await getWifiMode(device);
        const ssid = await getWifiApSsid(device);
        const ip = await getCurrentWifiIp(device);
        setWifiModeState(String(mode));
        setWifiApSsidState(ssid);
        setWifiIpState(ip);
        if (ip?.trim()) {
          clearInterval(autoRefreshRef.current!);
          autoRefreshRef.current = null;
          setLoading((prev) => ({ ...prev, getWifiInfo: false }));
        }
      } catch (error) {
        console.error('Auto-refresh error:', error);
      }
    }, 5000);
  }, [device, setLoading]);

  const refreshWifi = useCallback(async () => {
    await withLoading('getWifiInfo', fetchWifiState);
  }, [withLoading, fetchWifiState]);

  const setWifiMode = useCallback(
    (value: string) => {
      if (!device) return;
      void withLoading('setWifiMode', async () => {
        await applyWifiMode(device, parseInt(value, 10));
        setWifiModeState(value);
        setWifiIpState('');
        startAutoRefresh();
      });
    },
    [device, withLoading, startAutoRefresh],
  );

  const openWifiModal = useCallback(
    (mode: WifiModalMode) => {
      if (mode === 'ap') setApSsidState(wifiApSsid);
      setWifiModalMode(mode);
      setWifiModalOpen(true);
    },
    [wifiApSsid],
  );

  const closeWifiModal = useCallback(() => {
    setWifiModalOpen(false);
    setWifiModalMode(null);
    setNewNetworkSsid('');
    setNewNetworkPassword('');
    setApSsidState('');
    setApPasswordState('');
    setRemoveNetworkSsid('');
  }, []);

  const addNetwork = useCallback(async () => {
    if (!device || !newNetworkSsid || !newNetworkPassword) return;
    await withLoading('addNetwork', async () => {
      await addWifiNetwork(device, newNetworkSsid, newNetworkPassword);
      setNewNetworkSsid('');
      setNewNetworkPassword('');
      setWifiModalOpen(false);
      setWifiModalMode(null);
    });
  }, [device, newNetworkSsid, newNetworkPassword, withLoading]);

  const removeNetwork = useCallback(async () => {
    if (!device || !removeNetworkSsid) return;
    await withLoading('removeNetwork', async () => {
      await removeWifiNetwork(device, removeNetworkSsid);
      setRemoveNetworkSsid('');
      setWifiModalOpen(false);
      setWifiModalMode(null);
    });
  }, [device, removeNetworkSsid, withLoading]);

  const configureAp = useCallback(async () => {
    if (!device || !apSsid || !apPassword) return;
    await withLoading('configureAp', async () => {
      await setWifiApSsid(device, apSsid);
      await setWifiApPassword(device, apPassword);
      setApSsidState('');
      setApPasswordState('');
      setWifiModalOpen(false);
      setWifiModalMode(null);
      await fetchWifiState();
    });
  }, [device, apSsid, apPassword, withLoading, fetchWifiState]);

  const state = useMemo(
    () => ({
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
    }),
    [
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
    ],
  );

  const actions = useMemo(
    () => ({
      refreshWifi,
      setWifiMode,
      openWifiModal,
      closeWifiModal,
      addNetwork,
      removeNetwork,
      configureAp,
      setNewNetworkSsid,
      setNewNetworkPassword,
      setApSsid: setApSsidState,
      setApPassword: setApPasswordState,
      setRemoveNetworkSsid,
    }),
    [
      refreshWifi,
      setWifiMode,
      openWifiModal,
      closeWifiModal,
      addNetwork,
      removeNetwork,
      configureAp,
    ],
  );

  return { loading, state, actions };
}
