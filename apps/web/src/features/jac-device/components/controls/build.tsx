import { m } from '@/paraglide/messages';
import { ButtonLoading } from '@/features/shared/components/custom/button-loading';
import { ButtonGroup } from '@/features/shared/components/ui/button-group';
import { HammerIcon } from 'lucide-react';
import { enqueueSnackbar } from 'notistack';
import { compileProject } from '@/features/jac-device/lib/compilation';
import { useActiveProject } from '@/features/project/active-project';
import { useJacDevice } from '@/features/jac-device';
import { useStream } from '@/features/stream';
import { useState } from 'react';
import { useProjectEditor } from '@/features/project/editor';
import { Route } from '@/routes/__root';

export function Build() {
  const { streamBusService } = Route.useRouteContext();
  const {
    state: { projectPath, fs },
  } = useActiveProject();
  const { actions } = useProjectEditor();
  const { controlPanel } = actions;
  const { state: jacState } = useJacDevice();
  const { jacProject, pkg, connectionStatus } = jacState;
  const {
    meta: { channel },
  } = useStream();
  const [isBuilding, setIsBuilding] = useState(false);

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
      const compilerStreams = streamBusService.createWritablePair(
        channel,
        'compiler'
      );
      if (
        !(await compileProject(
          projectPath,
          fs,
          compilerStreams.out,
          compilerStreams.err
        ))
      ) {
        enqueueSnackbar(m.device_build_compile_failed(), { variant: 'error' });
        return;
      }
      enqueueSnackbar(m.device_build_success(), { variant: 'success' });
    } catch (error) {
      controlPanel('logs', 'expand');
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
        loading={isBuilding || connectionStatus === 'connecting'}
        icon={<HammerIcon className="h-4 w-4" />}
      >
        {m.device_btn_build()}
      </ButtonLoading>
    </ButtonGroup>
  );
}
