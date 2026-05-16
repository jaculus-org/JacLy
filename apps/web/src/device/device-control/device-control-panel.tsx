import { ScrollArea } from '@/ui/components/scroll-area';
import { DeviceDisconnected } from '../panels/disconnected';
import { ControlSection } from './control-section';
import { useJacDeviceControl } from './device-control-context';
import { InfoSection } from './info-section';
import { WifiSection } from './wifi-section';

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
