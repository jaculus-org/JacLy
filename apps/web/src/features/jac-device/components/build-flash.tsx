import { m } from '@/paraglide/messages';
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
  const { device, jacProject } = useJacDevice();

  if (!device || !jacProject) {
    return;
  }

  async function handleBuildAndFlash() {
    if (!device) {
      enqueueSnackbar(m.device_error_no_device(), { variant: 'error' });
      return;
    }

    try {
      if (!(await compileProject(projectPath, fs, addEntry))) {
        enqueueSnackbar(m.device_build_compile_failed(), { variant: 'error' });
        return;
      }
      const files = await jacProject!.getFlashFiles();
      console.log(`Files to flash: ${Object.keys(files).length}`);
      for (const [filePath, content] of Object.entries(files)) {
        console.log(`File: ${filePath}, Content: ${content.toString()}`);
      }
      await flashProject(files, device);
    } catch (error) {
      enqueueSnackbar(
        error instanceof Error ? error.message : m.device_build_flash_failed(),
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
        {m.device_btn_build_flash()}
      </Button>
    </ButtonGroup>
  );
}
