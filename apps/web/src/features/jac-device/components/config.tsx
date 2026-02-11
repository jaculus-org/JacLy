'use client';

import { m } from '@/paraglide/messages';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Power,
  RotateCw,
  Info,
  Wifi,
  Lock,
  Globe,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Loader2,
  Trash2,
  Unplug,
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/features/shared/components/ui/alert-dialog';
import { Button } from '@/features/shared/components/ui/button';
import { ButtonLoading } from '@/features/shared/components/custom/button-loading';
import { Input } from '@/features/shared/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/features/shared/components/ui/select';
import {
  start,
  stop,
  restart,
  version,
  status,
  addWifiNetwork,
  removeWifiNetwork,
  getWifiMode,
  setWifiMode,
  getWifiApSsid,
  setWifiApSsid,
  setWifiApPassword,
  getCurrentWifiIp,
} from '../lib/device';
import { useJacDevice } from '../provider/jac-device-provider';

type WifiModalMode = 'network' | 'ap' | 'remove' | null;

export function DeviceConfig() {
  const { device } = useJacDevice();
  const [expandedSections, setExpandedSections] = useState({
    info: true,
    control: true,
    wifi: true,
  });

  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [wifiMode, setWifiModeState] = useState<string>('');
  const [wifiApSsid, setWifiApSsidState] = useState<string>('');
  const [wifiIp, setWifiIpState] = useState<string>('');
  const [wifiModalOpen, setWifiModalOpen] = useState(false);
  const [wifiModalMode, setWifiModalMode] = useState<WifiModalMode>(null);
  const [newNetworkSsid, setNewNetworkSsid] = useState('');
  const [newNetworkPassword, setNewNetworkPassword] = useState('');
  const [apSsid, setApSsidState] = useState('');
  const [apPassword, setApPasswordState] = useState('');
  const [removeNetworkSsid, setRemoveNetworkSsid] = useState('');
  const autoRefreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [deviceStatus, setDeviceStatus] = useState<{
    running: boolean;
    exitCode?: number;
    status: string;
  } | null>(null);
  const [deviceVersion, setDeviceVersion] = useState<string[]>([]);

  const handleLoading = async (key: string, fn: () => Promise<void>) => {
    setLoading(prev => ({ ...prev, [key]: true }));
    try {
      await fn();
    } finally {
      setLoading(prev => ({ ...prev, [key]: false }));
    }
  };

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
  }, [device]);

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
  }, [device]);

  useEffect(() => {
    if (device) {
      setTimeout(() => {
        handleGetDeviceInfo();
        handleGetWifiInfo();
      }, 1000);
    }
  }, [device, handleGetDeviceInfo, handleGetWifiInfo]);

  useEffect(() => {
    return () => {
      if (autoRefreshIntervalRef.current) {
        clearInterval(autoRefreshIntervalRef.current);
      }
    };
  }, []);

  if (!device) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 bg-slate-100 dark:bg-gray-900 text-slate-900 dark:text-gray-100">
        <Unplug className="h-16 w-16 text-slate-400 dark:text-gray-600" />
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">{m.wokwi_no_device()}</h3>
          <p className="text-sm text-slate-600 dark:text-gray-400">
            {m.config_no_device()}
          </p>
        </div>
      </div>
    );
  }

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const startAutoRefresh = () => {
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
      } catch (err) {
        console.error('Auto-refresh error:', err);
      }
    }, 5000);
  };

  const handleAddNetwork = async () => {
    if (!newNetworkSsid || !newNetworkPassword) return;
    await handleLoading('addNetwork', async () => {
      await addWifiNetwork(device, newNetworkSsid, newNetworkPassword);
      setNewNetworkSsid('');
      setNewNetworkPassword('');
      setWifiModalOpen(false);
      setWifiModalMode(null);
    });
  };

  const handleRemoveNetwork = async () => {
    if (!removeNetworkSsid) return;
    await handleLoading('removeNetwork', async () => {
      await removeWifiNetwork(device, removeNetworkSsid);
      setRemoveNetworkSsid('');
      setWifiModalOpen(false);
      setWifiModalMode(null);
    });
  };

  const handleConfigureAp = async () => {
    if (!apSsid || !apPassword) return;
    await handleLoading('configureAp', async () => {
      await setWifiApSsid(device, apSsid);
      await setWifiApPassword(device, apPassword);
      setApSsidState('');
      setApPasswordState('');
      setWifiModalOpen(false);
      setWifiModalMode(null);
      await handleGetWifiInfo();
    });
  };

  const handleOpenWifiModal = (mode: WifiModalMode) => {
    if (mode === 'ap') {
      setApSsidState(wifiApSsid);
    }
    setWifiModalMode(mode);
    setWifiModalOpen(true);
  };

  const handleCloseWifiModal = () => {
    setWifiModalOpen(false);
    setWifiModalMode(null);
    setNewNetworkSsid('');
    setNewNetworkPassword('');
    setApSsidState('');
    setApPasswordState('');
    setRemoveNetworkSsid('');
  };

  const handleWifiModeChange = (value: string) => {
    handleLoading('setWifiMode', async () => {
      await setWifiMode(device, parseInt(value));
      setWifiModeState(value);
      setWifiIpState('');
      startAutoRefresh();
    });
  };

  return (
    <div className="flex flex-col gap-4 p-4 bg-background border-l w-full h-full">
      <h2 className="text-lg font-semibold">{m.config_title()}</h2>

      <div className="overflow-y-auto flex-1 space-y-3">
        {/* Device Control Section */}
        <div className="border rounded-lg">
          <button
            onClick={() => toggleSection('control')}
            className="w-full flex items-center justify-between p-3 hover:bg-accent transition-colors"
          >
            <div className="flex items-center gap-2">
              <Power className="w-4 h-4" />
              <span className="font-medium text-sm">
                {m.config_control_title()}
              </span>
            </div>
            {expandedSections.control ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>

          {expandedSections.control && (
            <div className="p-3 space-y-2 border-t bg-muted/30">
              <ButtonLoading
                size="sm"
                className="w-full justify-start"
                loading={loading['start']}
                icon={<Power className="w-4 h-4" />}
                onClick={async () => {
                  await handleLoading('start', () => start(device));
                  await handleGetDeviceInfo();
                }}
              >
                {m.config_start_program()}
              </ButtonLoading>

              <ButtonLoading
                size="sm"
                className="w-full justify-start"
                variant="secondary"
                loading={loading['stop']}
                icon={<Power className="w-4 h-4" />}
                onClick={async () => {
                  await handleLoading('stop', () => stop(device));
                  await handleGetDeviceInfo();
                }}
              >
                {m.config_stop_program()}
              </ButtonLoading>

              <ButtonLoading
                size="sm"
                className="w-full justify-start"
                variant="outline"
                loading={loading['restart']}
                icon={<RotateCw className="w-4 h-4" />}
                onClick={async () => {
                  await handleLoading('restart', () => restart(device));
                  await handleGetDeviceInfo();
                }}
              >
                {m.config_restart_program()}
              </ButtonLoading>
            </div>
          )}
        </div>

        {/* WiFi Configuration Section */}
        <div className="border rounded-lg">
          <button
            onClick={() => toggleSection('wifi')}
            className="w-full flex items-center justify-between p-3 hover:bg-accent transition-colors"
          >
            <div className="flex items-center gap-2">
              <Wifi className="w-4 h-4" />
              <span className="font-medium text-sm">
                {m.config_wifi_title()}
              </span>
              <button
                onClick={e => {
                  e.stopPropagation();
                  handleGetWifiInfo();
                }}
                className="ml-auto mr-8 p-1 hover:bg-muted rounded transition-colors"
                disabled={loading['getWifiInfo']}
              >
                <RefreshCw
                  className={`w-4 h-4 ${loading['getWifiInfo'] ? 'animate-spin' : ''}`}
                />
              </button>
            </div>
            {expandedSections.wifi ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>

          {expandedSections.wifi && (
            <div className="p-3 space-y-3 border-t bg-muted/30">
              {/* WiFi Mode Selection */}
              <div className="space-y-2">
                <label className="text-xs font-medium">
                  {m.config_wifi_mode_label()}
                </label>
                <Select value={wifiMode} onValueChange={handleWifiModeChange}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue
                      placeholder={m.config_wifi_mode_placeholder()}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">
                      {m.config_wifi_mode_disabled()}
                    </SelectItem>
                    <SelectItem value="1">
                      {m.config_wifi_mode_sta()}
                    </SelectItem>
                    <SelectItem value="2">{m.config_wifi_mode_ap()}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Current WiFi IP */}
              <div className="p-2 bg-accent/50 rounded text-xs space-y-1">
                <div className="flex items-center gap-2">
                  {loading['getWifiInfo'] ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Globe className="w-3 h-3" />
                  )}
                  <span className="font-medium">
                    {m.config_current_ip_label()}
                  </span>
                </div>
                <code className="break-all">
                  {loading['getWifiInfo'] && !wifiIp
                    ? m.config_fetching()
                    : wifiIp || m.config_no_ip()}
                </code>
              </div>

              {/* WiFi Network & AP Configuration Modal */}
              <AlertDialog
                open={wifiModalOpen}
                onOpenChange={handleCloseWifiModal}
              >
                <div className="space-y-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => handleOpenWifiModal('ap')}
                  >
                    <Lock className="w-4 h-4" />
                    {wifiApSsid
                      ? m.config_configure_ap_current({ ssid: wifiApSsid })
                      : 'Configure AP'}
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => handleOpenWifiModal('network')}
                  >
                    <Wifi className="w-4 h-4" />
                    {m.config_add_network_title()}
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => handleOpenWifiModal('remove')}
                  >
                    <Trash2 className="w-4 h-4" />
                    {m.config_remove_network_title()}
                  </Button>
                </div>

                <AlertDialogContent>
                  {wifiModalMode === 'ap' && (
                    <>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          {m.config_configure_ap_title()}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          {m.config_configure_ap_desc()}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <div className="space-y-3">
                        <Input
                          placeholder={m.config_ap_ssid_placeholder()}
                          value={apSsid}
                          onChange={e => setApSsidState(e.target.value)}
                        />
                        <Input
                          type="password"
                          placeholder={m.config_ap_password_placeholder()}
                          value={apPassword}
                          onChange={e => setApPasswordState(e.target.value)}
                        />
                      </div>
                      <AlertDialogFooter>
                        <AlertDialogCancel>
                          {m.config_btn_cancel()}
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleConfigureAp}
                          disabled={
                            loading['configureAp'] || !apSsid || !apPassword
                          }
                        >
                          {loading['configureAp']
                            ? m.config_btn_saving()
                            : m.config_btn_save()}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </>
                  )}

                  {wifiModalMode === 'network' && (
                    <>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          {m.config_add_network_title()}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          {m.config_add_network_desc()}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <div className="space-y-3">
                        <Input
                          placeholder={m.config_network_ssid_placeholder()}
                          value={newNetworkSsid}
                          onChange={e => setNewNetworkSsid(e.target.value)}
                        />
                        <Input
                          type="password"
                          placeholder={m.config_network_password_placeholder()}
                          value={newNetworkPassword}
                          onChange={e => setNewNetworkPassword(e.target.value)}
                        />
                      </div>
                      <AlertDialogFooter>
                        <AlertDialogCancel>
                          {m.config_btn_cancel()}
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleAddNetwork}
                          disabled={
                            loading['addNetwork'] ||
                            !newNetworkSsid ||
                            !newNetworkPassword
                          }
                        >
                          {loading['addNetwork']
                            ? m.config_btn_adding()
                            : m.config_btn_add_network()}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </>
                  )}

                  {wifiModalMode === 'remove' && (
                    <>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          {m.config_remove_network_title()}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          {m.config_remove_network_desc()}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <Input
                        placeholder={m.config_network_ssid_placeholder()}
                        value={removeNetworkSsid}
                        onChange={e => setRemoveNetworkSsid(e.target.value)}
                      />
                      <AlertDialogFooter>
                        <AlertDialogCancel>
                          {m.config_btn_cancel()}
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleRemoveNetwork}
                          disabled={
                            loading['removeNetwork'] || !removeNetworkSsid
                          }
                        >
                          {loading['removeNetwork']
                            ? m.config_btn_removing()
                            : m.config_btn_remove_network()}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </>
                  )}
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </div>

        {/* Device Info Section */}
        <div className="border rounded-lg">
          <button
            onClick={() => toggleSection('info')}
            className="w-full flex items-center justify-between p-3 hover:bg-accent transition-colors"
          >
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4" />
              <span className="font-medium text-sm">
                {m.config_device_info_title()}
              </span>
              <button
                onClick={e => {
                  e.stopPropagation();
                  handleGetDeviceInfo();
                }}
                className="ml-auto mr-8 p-1 hover:bg-muted rounded transition-colors"
                disabled={loading['getDeviceInfo']}
              >
                <RefreshCw
                  className={`w-4 h-4 ${loading['getDeviceInfo'] ? 'animate-spin' : ''}`}
                />
              </button>
            </div>
            {expandedSections.info ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>

          {expandedSections.info && (
            <div className="p-3 space-y-2 border-t bg-muted/30">
              <div className="space-y-2">
                <div className="p-3 bg-accent/50 rounded space-y-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Power className="w-3 h-3" />
                      <span className="text-xs font-medium">
                        {m.config_running_label()}
                      </span>
                    </div>
                    <code className="text-xs break-all block pl-5">
                      {loading['getDeviceInfo'] && !deviceStatus
                        ? m.config_fetching()
                        : deviceStatus?.running
                          ? m.config_running_yes()
                          : m.config_running_no()}
                    </code>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Info className="w-3 h-3" />
                      <span className="text-xs font-medium">
                        {m.config_status_label()}
                      </span>
                    </div>
                    <code className="text-xs break-all block pl-5">
                      {loading['getDeviceInfo'] && !deviceStatus
                        ? m.config_fetching()
                        : deviceStatus?.status || m.config_status_unknown()}
                    </code>
                  </div>
                  {deviceStatus?.exitCode !== undefined && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <RotateCw className="w-3 h-3" />
                        <span className="text-xs font-medium">
                          {m.config_exit_code_label()}
                        </span>
                      </div>
                      <code className="text-xs break-all block pl-5">
                        {deviceStatus.exitCode}
                      </code>
                    </div>
                  )}
                  <div className="space-y-1 pt-2 border-t">
                    <div className="flex items-center gap-2">
                      <Info className="w-3 h-3" />
                      <span className="text-xs font-medium">
                        {m.config_version_label()}
                      </span>
                    </div>
                    <code className="text-xs break-all block pl-5">
                      {loading['getDeviceInfo'] && !deviceVersion.length
                        ? m.config_fetching()
                        : deviceVersion.join(' • ') ||
                          m.config_status_unknown()}
                    </code>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
