import { useActiveProject } from '@/features/project/provider/active-project-provider';
import { Button } from '@/features/shared/components/ui/button';
import { ButtonGroup } from '@/features/shared/components/ui/button-group';
import { SquareArrowRightIcon } from 'lucide-react';
import { enqueueSnackbar } from 'notistack';
import { compileProject } from '../lib/compilation';
import { flashProject } from '../lib/flash';
import { useJacDevice } from '../provider/jac-device-provider';
import { useTerminal } from '@/features/terminal/provider/terminal-provider';

export function BuildFlash() {
  const { projectPath, fs } = useActiveProject();
  const { addEntry } = useTerminal();
  const { device } = useJacDevice();

  if (!device) {
    return;
  }

  async function handleBuildAndFlash() {
    if (!device) {
      enqueueSnackbar('No device connected', { variant: 'error' });
      return;
    }

    try {
      if (!(await compileProject(projectPath, fs, addEntry))) {
        enqueueSnackbar('Compilation failed', { variant: 'error' });
        return;
      }
      await flashProject(projectPath, device, fs);
    } catch (error) {
      enqueueSnackbar(
        error instanceof Error ? error.message : 'Build & Flash failed',
        { variant: 'error' }
      );
    }
  }

  return (
    <ButtonGroup>
      <Button
        onClick={async () => handleBuildAndFlash()}
        size="sm"
        className="gap-1 h-8 bg-blue-800 hover:bg-blue-900 text-white"
      >
        <SquareArrowRightIcon className="h-4 w-4" />
        Build & Flash
      </Button>
    </ButtonGroup>
  );
}
