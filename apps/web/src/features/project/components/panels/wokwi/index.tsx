import { WokwiSimulator } from '@/features/wokwi-simulator/components';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/features/shared/components/ui/resizable';
import { Stream } from '@/features/stream';

export function WokwiPanel() {
  return (
    <ResizablePanelGroup orientation="vertical">
      <ResizablePanel defaultSize="75%">
        <WokwiSimulator />
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize="25%">
        <Stream.Console tooltipCollapsed={true} />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
