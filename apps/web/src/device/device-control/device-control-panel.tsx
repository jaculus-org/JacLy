import { ScrollArea } from '@/ui/components/scroll-area';
import { useJacDeviceControl } from './device-control-context';
import { ControlSection } from './control-section';
import { InfoSection } from './info-section';
import { WifiSection } from './wifi-section';
import { DeviceDisconnected } from '../panels/disconnected';

export function JacDeviceControlPanel() {
  const { meta } = useJacDeviceControl();

  if (!meta.isConnected) {
    return <DeviceDisconnected />;
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-2 space-y-2">
        <ControlSection />
        <WifiSection />
        <InfoSection />
      </div>
    </ScrollArea>
  );
}
