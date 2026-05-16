import { HammerIcon } from 'lucide-react';
import { enqueueSnackbar } from 'notistack';
import { useState } from 'react';
import { m } from '@/core/paraglide/messages';
import { jaclySaveCoordinator } from '@/editor';
import { useActiveProject, useProjectEditor } from '@/project';
import { ButtonGroup } from '@/ui/components/button-group';
import { ButtonLoading } from '@/ui/components/custom/button-loading';
import { compileProject } from '../../services/compilation';
import { useJacDevice } from '../../state/device-context';

export function Build() {
  const {
    state: { projectPath, fs },
  } = useActiveProject();
  const { actions } = useProjectEditor();
  const { controlPanel } = actions;
  const { state: jacState } = useJacDevice();
  const { jacProject, pkg, connectionStatus } = jacState;
  const [isBuilding, setIsBuilding] = useState(false);

  if (jacProject == null || pkg?.jaculus?.projectType !== 'code') {
    return;
  }

  async function handleBuild() {
    setIsBuilding(true);
    try {
      await jaclySaveCoordinator.flushPendingWrites();
      const bundle = await jacProject!.getFlashFiles();
      console.log(`Files to flash: ${Object.keys(bundle.files).length}`);
      for (const [filePath, content] of Object.entries(bundle.files)) {
        console.log(`File: ${filePath}, Content: ${content.toString()}`);
      }
      if (!(await compileProject(projectPath, fs))) {
        enqueueSnackbar(m.device_build_compile_failed(), { variant: 'error' });
        return;
      }
      enqueueSnackbar(m.device_build_success(), { variant: 'success' });
    } catch (error) {
      controlPanel('logs', 'expand');
      enqueueSnackbar(error instanceof Error ? error.message : m.device_build_flash_failed(), {
        variant: 'error',
      });
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
        loading={isBuilding || connectionStatus === 'connecting'}
        icon={<HammerIcon className="h-4 w-4" />}
      >
        {m.device_btn_build()}
      </ButtonLoading>
    </ButtonGroup>
  );
}
