import { enqueueSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import { useConsole } from '@/console';
import { m } from '@/core/paraglide/messages';
import { jaclySaveCoordinator } from '@/editor/state/jacly-save-coordinator';
import { useActiveProject, useProjectEditor } from '@/project';
import { ButtonGroup } from '@/ui/components/button-group';
import { ButtonLoading } from '@/ui/components/custom/button-loading';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/components/select';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/ui/components/tooltip';
import {
  connectDevice,
  getAvailableConnectionTypes,
  UnknownConnectionTypeError,
} from '../../services/connection';
import { testConnection, uploadCode } from '../../services/device-operations';
import { useJacDevice } from '../../state/device-context';
import type { ConnectionInfo, ConnectionType } from '../../types/connection';

export function ConnectionSelector() {
  const [availableConnections, setAvailableConnections] = useState<ConnectionInfo[]>([]);
  const {
    actions: { addEntry },
  } = useConsole();
  const { state: jacState, actions: jacActions } = useJacDevice();
  const { connectionStatus, jacProject } = jacState;
  const { setDevice, setConnectionStatus } = jacActions;
  const {
    state: { projectPath, fs, monacoService },
  } = useActiveProject();
  const { actions } = useProjectEditor();
  const { controlPanel } = actions;

  const [selectedConnection, setSelectedConnection] = useState<ConnectionType | undefined>(
    undefined,
  );

  useEffect(() => {
    getAvailableConnectionTypes().then((connections) => {
      setAvailableConnections(connections);
      setSelectedConnection(connections[0].type);
    });
  }, []);

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
    if (!selectedConnection) return;
    try {
      const dev = await connectDevice(selectedConnection, addEntry, onDisconnect, projectPath, fs);

      await setDevice(dev, selectedConnection);

      if (selectedConnection === 'wokwi') {
        if (!projectPath) return;
        controlPanel('wokwi', 'expand');

        setTimeout(async () => {
          await monacoService?.flush();
          await jaclySaveCoordinator.flushPendingWrites();
          await uploadCode(await jacProject!.getFlashFiles(), dev);
        }, 10_000);
      } else {
        const connectionSuccess = await testConnection(dev, 5000);

        if (connectionSuccess) {
          if (connectionSuccess.esp32 >= '0.1.0') {
            controlPanel('console', 'expand');
            controlPanel('packages', 'collapse');
          } else {
            enqueueSnackbar(m.device_firmware_outdated({ requiredVersion: '0.1.0' }), {
              variant: 'warning',
            });
            controlPanel('installer', 'expand');
          }
        } else {
          if (selectedConnection !== 'serial') {
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

  if (availableConnections.length === 0) {
    return (
      <ButtonLoading size="sm" className="gap-1 h-8" disabled>
        {m.device_no_connection_options()}
      </ButtonLoading>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <ButtonGroup>
          <Select
            value={selectedConnection ?? undefined}
            onValueChange={(value) => setSelectedConnection(value as ConnectionType)}
            disabled={connectionStatus === 'connected' || connectionStatus === 'connecting'}
          >
            <SelectTrigger className=" h-8">
              <SelectValue placeholder={m.device_connection_placeholder()} />
            </SelectTrigger>
            <SelectContent>
              {availableConnections.map((connection) => {
                const Icon = connection.icon;
                return (
                  <SelectItem key={connection.type} value={connection.type}>
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      {connectionStatus !== 'connected' && <span>{connection.name}</span>}
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
            disabled={!selectedConnection}
            loading={connectionStatus === 'connecting'}
          >
            {connectionStatus === 'connected' ? m.device_btn_disconnect() : m.device_btn_connect()}
          </ButtonLoading>
        </ButtonGroup>
      </TooltipTrigger>
      <TooltipContent>
        <p>{m.device_connection_tooltip()}</p>
      </TooltipContent>
    </Tooltip>
  );
}
