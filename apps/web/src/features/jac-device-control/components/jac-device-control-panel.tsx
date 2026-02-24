import { ScrollArea } from '@/features/shared/components/ui/scroll-area';
import { useJacDeviceControl } from '../jac-device-control-context';
import { JacDeviceControlDisconnected } from './jac-device-control-disconnected';
import { JacDeviceControlSectionControl } from './sections/jac-device-control-section-control';
import { JacDeviceControlSectionInfo } from './sections/jac-device-control-section-info';
import { JacDeviceControlSectionWifi } from './sections/jac-device-control-section-wifi';

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
