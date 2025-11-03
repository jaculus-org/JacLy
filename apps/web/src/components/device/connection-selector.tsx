import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { enqueueSnackbar } from 'notistack';
import { useJacProject } from '@/providers/jac-project-provider';
import {
  connectDevice,
  getAvailableConnectionTypes,
  type ConnectionType,
} from '@/lib/device/connection';

interface ConnectionSelectorProps {
  onConnect?: () => void;
  className?: string;
  oneLine?: boolean;
  defaultConnection?: ConnectionType;
}

export function ConnectionSelector({
  onConnect,
  className,
  oneLine = true,
  defaultConnection = 'serial',
}: ConnectionSelectorProps) {
  const { device, setDevice } = useJacProject();

  const availableConnections = getAvailableConnectionTypes();

  // Function to get connection from URL
  const getConnectionFromUrl = (): ConnectionType | undefined => {
    if (typeof window === 'undefined') return undefined;

    const urlParams = new URLSearchParams(window.location.search);
    const connectionFromUrl = urlParams.get('connection') as ConnectionType;

    // Validate that the connection from URL is available
    if (
      connectionFromUrl &&
      availableConnections.some(conn => conn.type === connectionFromUrl)
    ) {
      return connectionFromUrl;
    }

    return undefined;
  };

  // Function to save connection to URL
  const saveConnectionToUrl = (connection: ConnectionType | undefined) => {
    if (typeof window === 'undefined') return;

    const url = new URL(window.location.href);

    if (connection) {
      url.searchParams.set('connection', connection);
    } else {
      url.searchParams.delete('connection');
    }

    // Update URL without triggering a page reload
    window.history.replaceState({}, '', url.toString());
  };

  // Initialize selected connection with priority: URL > default > first available
  const initializeConnection = (): ConnectionType | undefined => {
    const urlConnection = getConnectionFromUrl();
    if (urlConnection) return urlConnection;

    if (
      defaultConnection &&
      availableConnections.some(conn => conn.type === defaultConnection)
    ) {
      return defaultConnection;
    }

    return availableConnections[0]?.type;
  };

  const [selectedConnection, setSelectedConnection] = useState<
    ConnectionType | undefined
  >(initializeConnection());
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Save to URL when selection changes
  useEffect(() => {
    saveConnectionToUrl(selectedConnection);
  }, [selectedConnection]);

  // Handle selection change
  const handleConnectionChange = (value: string) => {
    const connection = value as ConnectionType;
    setSelectedConnection(connection);
  };

  async function handleConnect() {
    if (!selectedConnection) return;

    setIsConnecting(true);
    setError(null);

    try {
      const newDevice = await connectDevice(selectedConnection);
      setDevice(newDevice);
      onConnect?.();
      enqueueSnackbar('Device connected successfully', { variant: 'success' });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to connect';
      setError(errorMessage);
      console.error('Connection failed:', error);
      enqueueSnackbar(`Connection failed`, { variant: 'error' });
    } finally {
      setIsConnecting(false);
    }
  }

  if (device) {
    return;
  }

  // No connections available
  if (availableConnections.length === 0) {
    return (
      <div
        className={cn(
          'flex items-center gap-2 text-sm text-destructive',
          className
        )}
      >
        <AlertCircle className="h-4 w-4" />
        <span>No connection methods available</span>
      </div>
    );
  }

  const selectElement = (
    <Select
      value={selectedConnection}
      onValueChange={handleConnectionChange}
      disabled={isConnecting}
    >
      <SelectTrigger className="w-[180px] h-8">
        <SelectValue placeholder="Select connection" />
      </SelectTrigger>
      <SelectContent>
        {availableConnections.map(connection => {
          const Icon = connection.icon;
          return (
            <SelectItem key={connection.type} value={connection.type}>
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4" />
                <span>{connection.name}</span>
              </div>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );

  const connectButton = (
    <Button
      onClick={handleConnect}
      disabled={!selectedConnection || isConnecting}
      size="sm"
      className="gap-2 h-8"
    >
      {isConnecting ? 'Connecting...' : 'Connect'}
    </Button>
  );

  const errorElement = error && (
    <div className="flex items-center gap-1 text-sm text-destructive">
      <AlertCircle className="h-3 w-3" />
      <span className="text-xs">{error}</span>
    </div>
  );

  if (oneLine) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        {selectElement}
        {connectButton}
      </div>
    );
  }

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex flex-col items-center gap-2">
        {selectElement}
        {connectButton}
        {errorElement}
      </div>
    </div>
  );
}
