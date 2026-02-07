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
import { Button } from '@/features/shared/components/ui/button';
import type { ConnectionType } from '../types/connection';
import { enqueueSnackbar } from 'notistack';
import { ButtonGroup } from '@/features/shared/components/ui/button-group';
import { useJacDevice } from '../provider/jac-device-provider';
import { useTerminal } from '@/features/terminal/provider/terminal-provider';
import { useActiveProject } from '@/features/project/provider/active-project-provider';

export function ConnectionSelector() {
  const availableConnections = getAvailableConnectionTypes();
  const { addEntry } = useTerminal();
  const { setDevice } = useJacDevice();
  const { projectPath, fs } = useActiveProject();

  const [selectedConnection, setSelectedConnection] = useState<ConnectionType>(
    availableConnections[0].type
  );
  const [isConnected, setIsConnected] = useState<boolean>(false);

  async function handleConnection() {
    if (!isConnected) {
      await handleConnect();
    } else {
      setDevice(null);
      setIsConnected(false);
    }
  }

  function onDisconnect() {
    setDevice(null);
    setIsConnected(false);
    enqueueSnackbar(m.device_disconnected(), { variant: 'warning' });
  }

  async function handleConnect() {
    try {
      setDevice(
        await connectDevice(selectedConnection, addEntry, onDisconnect, projectPath, fs),
        selectedConnection
      );
    } catch (error) {
      if (error instanceof UnknownConnectionTypeError) {
        enqueueSnackbar(error.message, { variant: 'error' });
      } else {
        enqueueSnackbar(m.device_connect_failed(), { variant: 'error' });
      }
      return;
    }
    setIsConnected(true);
  }

  return (
    <ButtonGroup>
      <Select
        value={selectedConnection}
        onValueChange={value => setSelectedConnection(value as ConnectionType)}
        disabled={isConnected}
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
                  {!isConnected && <span>{connection.name}</span>}
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>

      <Button
        onClick={async () => await handleConnection()}
        size="sm"
        className="gap-1 h-8"
      >
        {isConnected ? m.device_btn_disconnect() : m.device_btn_connect()}
      </Button>
    </ButtonGroup>
  );
}
