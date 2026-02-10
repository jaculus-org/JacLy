import { m } from '@/paraglide/messages';
import { ButtonLoading } from '@/features/shared/components/custom/button-loading';
import { ButtonGroup } from '@/features/shared/components/ui/button-group';
import { HammerIcon } from 'lucide-react';
import { enqueueSnackbar } from 'notistack';
import { compileProject } from '../lib/compilation';
import { useActiveProject } from '@/features/project/provider/active-project-provider';
import { useJacDevice } from '../provider/jac-device-provider';
import { useTerminal } from '@/features/terminal/provider/terminal-provider';
import { useState } from 'react';

export function Build() {
  const { projectPath, fs } = useActiveProject();
  const { jacProject, pkg } = useJacDevice();
  const { addEntry } = useTerminal();
  const [isBuilding, setIsBuilding] = useState(false);
  const { isWokwiInitializing } = useJacDevice();

  if (jacProject == null || pkg?.jaculus?.projectType != 'code') {
    return;
  }

  async function handleBuild() {
    setIsBuilding(true);
    try {
      const files = await jacProject!.getFlashFiles();
      console.log(`Files to flash: ${Object.keys(files).length}`);
      for (const [filePath, content] of Object.entries(files)) {
        console.log(`File: ${filePath}, Content: ${content.toString()}`);
      }
      if (!(await compileProject(projectPath, fs, addEntry))) {
        enqueueSnackbar(m.device_build_compile_failed(), { variant: 'error' });
        return;
      }
      enqueueSnackbar(m.device_build_success(), { variant: 'success' });
    } catch (error) {
      enqueueSnackbar(
        error instanceof Error ? error.message : m.device_build_flash_failed(),
        { variant: 'error' }
      );
    } finally {
      setIsBuilding(false);
    }
  }

  return (
    <ButtonGroup>
      <ButtonLoading
        onClick={async () => handleBuild()}
        size="sm"
        className="gap-1 h-8 bg-blue-800 hover:bg-blue-900 text-white"
        loading={isBuilding || isWokwiInitializing}
        icon={<HammerIcon className="h-4 w-4" />}
      >
        {m.device_btn_build()}
      </ButtonLoading>
    </ButtonGroup>
  );
}
