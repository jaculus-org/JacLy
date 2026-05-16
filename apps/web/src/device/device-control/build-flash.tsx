import { SquareArrowRightIcon } from 'lucide-react';
import { enqueueSnackbar } from 'notistack';
import { useState } from 'react';
import { m } from '@/core/paraglide/messages';
import { jaclySaveCoordinator } from '@/editor';
import { useActiveProject, useProjectEditor } from '@/project';
import { ButtonLoading } from '@/ui/components/custom/button-loading';
import { useJacDevice } from '../device-context';
import { compileProject } from '../services/compilation';
import { uploadCode } from '../services/device-operations';

export function BuildFlash() {
  const {
    state: { projectPath, fs },
  } = useActiveProject();
  const {
    actions: { controlPanel },
  } = useProjectEditor();
  const { state: jacState } = useJacDevice();
  const { device, jacProject, pkg, connectionStatus } = jacState;
  const [isProcessing, setIsProcessing] = useState(false);

  async function handleBuildAndFlash() {
    setIsProcessing(true);
    if (!device) {
      enqueueSnackbar(m.device_error_no_device(), { variant: 'error' });
      return;
    }

    try {
      await jaclySaveCoordinator.flushPendingWrites();
      if (pkg?.jaculus?.projectType === 'code') {
        if (!(await compileProject(projectPath, fs))) {
          enqueueSnackbar(m.device_build_compile_failed(), {
            variant: 'error',
          });
          return;
        }
      }

      const bundle = await jacProject!.getFlashFiles();
      console.log(`Files to flash: ${Object.keys(bundle.files).length}`);
      for (const [filePath, content] of Object.entries(bundle.files)) {
        console.log(`File: ${filePath}, Content: ${content.toString()}`);
      }
      await uploadCode(bundle, device);
    } catch (error) {
      controlPanel('logs', 'expand');
      enqueueSnackbar(error instanceof Error ? error.message : m.device_build_flash_failed(), {
        variant: 'error',
      });
    } finally {
      setIsProcessing(false);
    }
  }

  if (!device || !jacProject) {
    return;
  }

  return (
    <ButtonLoading
      onClick={handleBuildAndFlash}
      size="sm"
      className="gap-1 h-8 bg-blue-800 hover:bg-blue-900 text-white"
      loading={isProcessing || connectionStatus === 'connecting'}
      icon={<SquareArrowRightIcon className="h-4 w-4" />}
    >
      {m.device_btn_build_flash()}
    </ButtonLoading>
  );
}
