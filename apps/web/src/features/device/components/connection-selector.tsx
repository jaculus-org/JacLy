import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/features/shared/components/ui/select';
import { useState } from 'react';
import { connectDevice, getAvailableConnectionTypes } from '../lib/connection';
import { Button } from '@/features/shared/components/ui/button';
import type { ConnectionType } from '../types/connection';
import { enqueueSnackbar } from 'notistack';
import { useActiveProject } from '@/hooks/use-active-project';
import { ButtonGroup } from '@/features/shared/components/ui/button-group';

interface ConnectionSelectorProps {}

export function ConnectionSelector({}: ConnectionSelectorProps) {
  const availableConnections = getAvailableConnectionTypes();
  const { setDevice } = useActiveProject();

  const [selectedConnection, setSelectedConnection] = useState<ConnectionType>(
    availableConnections[0].type
  );
  const [isConnected, setIsConnected] = useState<boolean>(false);

  async function handleConnection() {
    if (isConnected) {
      setDevice(null);
      setIsConnected(false);
      return;
    } else {
      await handleConnect();
    }
  }

  async function handleConnect() {
    try {
      setDevice(await connectDevice(selectedConnection));
    } catch (error) {
      console.error('Failed to connect device:', error);
      enqueueSnackbar('Failed to connect device.', { variant: 'error' });
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
          <SelectValue placeholder="Select connection" />
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
        {isConnected ? 'Disconnect' : 'Connect'}
      </Button>
    </ButtonGroup>
  );
}
