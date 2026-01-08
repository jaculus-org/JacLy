import { Button } from '@/features/shared/components/ui/button';
import { ButtonGroup } from '@/features/shared/components/ui/button-group';
import { HammerIcon } from 'lucide-react';
import { enqueueSnackbar } from 'notistack';
import { compileProject } from '../lib/compilation';
import { useActiveProject } from '@/features/project/provider/active-project-provider';
import { useJacDevice } from '../provider/jac-device-provider';
import { useTerminal } from '@/features/terminal/provider/terminal-provider';

export function Build() {
  const { projectPath, fs } = useActiveProject();
  const { jacProject } = useJacDevice();
  const { addEntry } = useTerminal();

  if (jacProject == null) {
    return;
  }

  async function handleBuild() {
    try {
      const files = await jacProject!.getFlashFiles();
      console.log(`Files to flash: ${Object.keys(files).length}`);
      for (const [filePath, content] of Object.entries(files)) {
        console.log(`File: ${filePath}, Content: ${content.toString()}`);
      }
      if (!(await compileProject(projectPath, fs, addEntry))) {
        enqueueSnackbar('Compilation failed', { variant: 'error' });
        return;
      }
      enqueueSnackbar('Build succeeded', { variant: 'success' });
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
        onClick={async () => handleBuild()}
        size="sm"
        className="gap-1 h-8 bg-blue-800 hover:bg-blue-900 text-white"
      >
        <HammerIcon className="h-4 w-4" />
        Build
      </Button>
    </ButtonGroup>
  );
}
