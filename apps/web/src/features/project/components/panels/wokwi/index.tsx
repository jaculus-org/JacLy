import { WokwiSimulator } from '@/features/wokwi-simulator/components';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/features/shared/components/ui/resizable';
import { TerminalConsole } from '@/features/terminal/components/terminal-console';

export function WokwiPanel() {
  return (
    <ResizablePanelGroup orientation="vertical">
      <ResizablePanel defaultSize="75%">
        <WokwiSimulator />
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize="25%">
        <TerminalConsole tooltipCollapsed={true} />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
