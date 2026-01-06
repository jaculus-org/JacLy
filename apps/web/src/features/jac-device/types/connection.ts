export type ConnectionType = 'serial' | 'ble' | 'wokwi';

export type ConnectionInfo = {
  type: ConnectionType;
  name: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
};
