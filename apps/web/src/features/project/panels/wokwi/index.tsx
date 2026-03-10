import { WokwiSimulator } from '@/features/wokwi-simulator';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/features/shared/components/ui/resizable';
import { Console } from '@/features/console';

export function WokwiPanel() {
  return (
    <ResizablePanelGroup orientation="vertical">
      <ResizablePanel defaultSize="75%">
        <WokwiSimulator />
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize="25%">
        <Console.Console tooltipCollapsed={true} displayKeyValue={false} />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
