import { CableIcon } from 'lucide-react';
import { m } from '@/core/paraglide/messages';
import { useProjectEditor } from '@/project';
import { Button } from '@/ui/components/button';
import { ButtonGroup } from '@/ui/components/button-group';
import { useJacDevice } from '../../state/device-context';

export function ConsoleSelector() {
  const {
    state: { device },
  } = useJacDevice();
  const { actions } = useProjectEditor();
  const { controlPanel } = actions;

  if (!device) {
    return;
  }

  return (
    <ButtonGroup>
      <Button onClick={() => controlPanel('console', 'expand')} size="sm" className="gap-1 h-8">
        <CableIcon className="h-4 w-4" />
        {m.device_btn_console()}
      </Button>
    </ButtonGroup>
  );
}
