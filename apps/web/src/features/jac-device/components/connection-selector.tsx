import { m } from '@/paraglide/messages';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/features/shared/components/ui/select';
import { useState } from 'react';
import {
  connectDevice,
  getAvailableConnectionTypes,
  UnknownConnectionTypeError,
} from '../lib/connection';
import type { ConnectionType } from '../types/connection';
import { enqueueSnackbar } from 'notistack';
import { ButtonGroup } from '@/features/shared/components/ui/button-group';
import { useJacDevice } from '../provider/jac-device-provider';
import { useTerminal } from '@/features/terminal/provider/terminal-provider';
import { useActiveProject } from '@/features/project/provider/active-project-provider';
import { testConnection, uploadCode } from '../lib/device';
import { useEditor } from '@/features/project/provider/project-editor-provider';
import { ButtonLoading } from '@/features/shared/components/custom/button-loading';

export function ConnectionSelector() {
  const availableConnections = getAvailableConnectionTypes();
  const { addEntry } = useTerminal();
  const { setDevice, connectionStatus, setConnectionStatus } = useJacDevice();
  const { jacProject } = useJacDevice();
  const { projectPath, fs } = useActiveProject();
  const { controlPanel } = useEditor();

  const [selectedConnection, setSelectedConnection] = useState<ConnectionType>(
    availableConnections[0].type
  );

  async function handleConnection() {
    if (connectionStatus !== 'connected') {
      setConnectionStatus('connecting');
      await handleConnect();
    } else {
      await setDevice(null);
      setConnectionStatus('disconnected');
    }
  }

  async function onDisconnect() {
    await setDevice(null);
    setConnectionStatus('disconnected');
    enqueueSnackbar(m.device_disconnected(), { variant: 'warning' });
  }

  async function handleConnect() {
    try {
      const dev = await connectDevice(
        selectedConnection,
        addEntry,
        onDisconnect,
        projectPath,
        fs
      );

      await setDevice(dev, selectedConnection);

      if (selectedConnection === 'wokwi') {
        if (!projectPath) return;
        controlPanel('wokwi', 'expand');

        setTimeout(async () => {
          await uploadCode(await jacProject!.getFlashFiles(), dev);
        }, 8000);
      } else {
        const connectionStatus = await testConnection(dev);

        if (connectionStatus) {
          controlPanel('console', 'expand');
        } else {
          if (selectedConnection != 'serial') {
            enqueueSnackbar(m.installer_msg_serial_required(), {
              variant: 'info',
            });
            return;
          }

          onDisconnect();
          enqueueSnackbar(m.installer_msg_no_firmware(), { variant: 'error' });
          controlPanel('installer', 'expand');
        }
      }
    } catch (error) {
      console.error(error);
      if (error instanceof UnknownConnectionTypeError) {
        enqueueSnackbar(error.message, { variant: 'error' });
      } else {
        enqueueSnackbar(m.device_connect_failed(), { variant: 'error' });
      }
      return;
    } finally {
      setConnectionStatus('connected');
    }
  }

  return (
    <ButtonGroup>
      <Select
        value={selectedConnection}
        onValueChange={value => setSelectedConnection(value as ConnectionType)}
        disabled={
          connectionStatus === 'connected' || connectionStatus === 'connecting'
        }
      >
        <SelectTrigger className=" h-8">
          <SelectValue placeholder={m.device_connection_placeholder()} />
        </SelectTrigger>
        <SelectContent>
          {availableConnections.map(connection => {
            const Icon = connection.icon;
            return (
              <SelectItem key={connection.type} value={connection.type}>
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  {connectionStatus !== 'connected' && (
                    <span>{connection.name}</span>
                  )}
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>

      <ButtonLoading
        onClick={async () => await handleConnection()}
        size="sm"
        className="gap-1 h-8"
        loading={connectionStatus === 'connecting'}
      >
        {connectionStatus === 'connected'
          ? m.device_btn_disconnect()
          : m.device_btn_connect()}
      </ButtonLoading>
    </ButtonGroup>
  );
}
