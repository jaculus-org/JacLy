import { WokwiSimulator } from '@/simulator';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/ui/components/resizable';
import { Console } from '@/console';

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
