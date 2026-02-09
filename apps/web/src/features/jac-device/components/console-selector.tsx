import { m } from '@/paraglide/messages';
import { Button } from '@/features/shared/components/ui/button';
import { ButtonGroup } from '@/features/shared/components/ui/button-group';
import { useEditor } from '@/features/project/provider/project-editor-provider';
import { CableIcon } from 'lucide-react';
import { useJacDevice } from '../provider/jac-device-provider';

export function ConsoleSelector() {
  const { device } = useJacDevice();
  const { controlPanel } = useEditor();

  if (!device) {
    return;
  }

  return (
    <ButtonGroup>
      <Button
        onClick={() => controlPanel('console', 'expand')}
        size="sm"
        className="gap-1 h-8"
      >
        <CableIcon className="h-4 w-4" />
        {m.device_btn_console()}
        {/* <Badge variant="secondary" className="ml-1">
          20+
        </Badge> */}
      </Button>
    </ButtonGroup>
  );
}
