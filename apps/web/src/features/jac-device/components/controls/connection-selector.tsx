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
} from '@/features/jac-device/lib/connection';
import type { ConnectionType } from '@/features/jac-device/types/connection';
import { enqueueSnackbar } from 'notistack';
import { ButtonGroup } from '@/features/shared/components/ui/button-group';
import { useJacDevice } from '@/features/jac-device';
import { useStream } from '@/features/stream';
import { useActiveProject } from '@/features/project/active-project';
import { testConnection, uploadCode } from '@/features/jac-device/lib/device';
import { useProjectEditor } from '@/features/project/editor';
import { ButtonLoading } from '@/features/shared/components/custom/button-loading';

export function ConnectionSelector() {
  const availableConnections = getAvailableConnectionTypes();
  const {
    actions: { addEntry },
  } = useStream();
  const { state: jacState, actions: jacActions } = useJacDevice();
  const { connectionStatus, jacProject } = jacState;
  const { setDevice, setConnectionStatus } = jacActions;
  const {
    state: { projectPath, fs },
  } = useActiveProject();
  const { actions } = useProjectEditor();
  const { controlPanel } = actions;

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
        }, 10_000);
      } else {
        const connectionSuccess = await testConnection(dev, 3000);

        if (connectionSuccess) {
          controlPanel('console', 'expand');
          controlPanel('packages', 'collapse');
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
      if (
        error instanceof DOMException &&
        error.name === 'NotFoundError' &&
        error.message.includes('requestPort')
      ) {
        enqueueSnackbar(m.device_connect_cancelled(), { variant: 'info' });
      } else if (error instanceof UnknownConnectionTypeError) {
        enqueueSnackbar(error.message, { variant: 'error' });
      } else {
        enqueueSnackbar(m.device_connect_failed(), { variant: 'error' });
      }
      setConnectionStatus('disconnected');
      return;
    }
    setConnectionStatus('connected');
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
