import { ScrollArea } from '@/ui/components/scroll-area';
import { useJacDeviceControl } from '../../state/device-control-context';
import { JacDeviceControlDisconnected } from '../device-disconnected';
import { JacDeviceControlSectionControl } from '../sections/device-control-section-control';
import { JacDeviceControlSectionInfo } from '../sections/device-control-section-info';
import { JacDeviceControlSectionWifi } from '../sections/device-control-section-wifi';

export function JacDeviceControlPanel() {
  const { meta } = useJacDeviceControl();

  if (!meta.isConnected) {
    return <JacDeviceControlDisconnected />;
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-2 space-y-2">
        <JacDeviceControlSectionControl />
        <JacDeviceControlSectionWifi />
        <JacDeviceControlSectionInfo />
      </div>
    </ScrollArea>
  );
}
