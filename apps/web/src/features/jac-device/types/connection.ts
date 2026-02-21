export type ConnectionType = 'serial' | 'ble' | 'wokwi';

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected';

export type ConnectionInfo = {
  type: ConnectionType;
  name: string;
  icon: React.ElementType;
};
