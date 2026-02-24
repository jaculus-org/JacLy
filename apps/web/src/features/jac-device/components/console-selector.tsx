import { m } from '@/paraglide/messages';
import { Button } from '@/features/shared/components/ui/button';
import { ButtonGroup } from '@/features/shared/components/ui/button-group';
import { useProjectEditor } from '@/features/project/editor';
import { CableIcon } from 'lucide-react';
import { useJacDevice } from '../device';

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
      <Button
        onClick={() => controlPanel('console', 'expand')}
        size="sm"
        className="gap-1 h-8"
      >
        <CableIcon className="h-4 w-4" />
        {m.device_btn_console()}
      </Button>
    </ButtonGroup>
  );
}
