import { m } from '@/paraglide/messages';
import { useActiveProject } from '@/features/project/active-project';
import { ButtonLoading } from '@/features/shared/components/custom/button-loading';
import { ButtonGroup } from '@/features/shared/components/ui/button-group';
import { SquareArrowRightIcon } from 'lucide-react';
import { enqueueSnackbar } from 'notistack';
import { useCallback, useState } from 'react';
import { compileProject } from '../lib/compilation';
import { useJacDevice } from '../device';
import { useStream } from '@/features/stream';
import { uploadCode } from '../lib/device';
import { useProjectEditor } from '@/features/project/editor';
import { Route } from '@/routes/__root';

export function BuildFlash() {
  const { streamBusService } = Route.useRouteContext();
  const {
    state: { projectPath, fs },
  } = useActiveProject();
  const { actions } = useProjectEditor();
  const { controlPanel } = actions;
  const {
    meta: { channel },
  } = useStream();
  const { state: jacState } = useJacDevice();
  const { device, jacProject, pkg, connectionStatus } = jacState;
  const [isProcessing, setIsProcessing] = useState(false);

  const handleBuildAndFlash = useCallback(async () => {
    setIsProcessing(true);
    if (!device) {
      enqueueSnackbar(m.device_error_no_device(), { variant: 'error' });
      return;
    }

    try {
      if (pkg?.jaculus?.projectType == 'code') {
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
          enqueueSnackbar(m.device_build_compile_failed(), {
            variant: 'error',
          });
          return;
        }
      }

      const files = await jacProject!.getFlashFiles();
      console.log(`Files to flash: ${Object.keys(files).length}`);
      for (const [filePath, content] of Object.entries(files)) {
        console.log(`File: ${filePath}, Content: ${content.toString()}`);
      }
      await uploadCode(files, device);
    } catch (error) {
      controlPanel('logs', 'expand');
      enqueueSnackbar(
        error instanceof Error ? error.message : m.device_build_flash_failed(),
        { variant: 'error' }
      );
    } finally {
      setIsProcessing(false);
    }
  }, [
    device,
    pkg,
    projectPath,
    fs,
    streamBusService,
    channel,
    jacProject,
    controlPanel,
  ]);

  if (!device || !jacProject) {
    return;
  }

  return (
    <ButtonGroup>
      <ButtonLoading
        onClick={handleBuildAndFlash}
        size="sm"
        className="gap-1 h-8 bg-blue-800 hover:bg-blue-900 text-white"
        loading={isProcessing || connectionStatus === 'connecting'}
        icon={<SquareArrowRightIcon className="h-4 w-4" />}
      >
        {m.device_btn_build_flash()}
      </ButtonLoading>
    </ButtonGroup>
  );
}
