import { ScrollArea } from '@/ui/components/scroll-area';
import { useJacDeviceControl } from '../../state/device-control-context';
import { ControlSection } from '../sections/control-section';
import { InfoSection } from '../sections/info-section';
import { WifiSection } from '../sections/wifi-section';
import { DeviceDisconnected } from './disconnected';

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
