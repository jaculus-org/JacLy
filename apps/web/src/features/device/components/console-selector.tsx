import { Button } from '@/features/shared/components/ui/button';
import { useActiveProject } from '@/hooks/use-active-project';
import { ButtonGroup } from '@/features/shared/components/ui/button-group';
import { useEditor } from '@/features/project/provider/project-editor-provider';
import { CableIcon } from 'lucide-react';

interface ConsoleSelectorProps {}

export function ConsoleSelector({}: ConsoleSelectorProps) {
  const { device } = useActiveProject();
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
        Console
        {/* <Badge variant="secondary" className="ml-1">
          20+
        </Badge> */}
      </Button>
    </ButtonGroup>
  );
}
