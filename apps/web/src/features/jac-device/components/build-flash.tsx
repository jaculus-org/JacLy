import { m } from '@/paraglide/messages';
import { useActiveProject } from '@/features/project/provider/active-project-provider';
import { ButtonLoading } from '@/features/shared/components/custom/button-loading';
import { ButtonGroup } from '@/features/shared/components/ui/button-group';
import { SquareArrowRightIcon } from 'lucide-react';
import { enqueueSnackbar } from 'notistack';
import { useCallback, useState } from 'react';
import { compileProject } from '../lib/compilation';
import { useJacDevice } from '../provider/jac-device-provider';
import { useTerminal } from '@/features/terminal/provider/terminal-provider';
import { uploadCode } from '../lib/device';

export function BuildFlash() {
  const { projectPath, fs } = useActiveProject();
  const { addEntry } = useTerminal();
  const { device, jacProject, pkg, connectionStatus } = useJacDevice();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleBuildAndFlash = useCallback(async () => {
    setIsProcessing(true);
    if (!device) {
      enqueueSnackbar(m.device_error_no_device(), { variant: 'error' });
      return;
    }

    try {
      if (pkg?.jaculus?.projectType == 'code') {
        if (!(await compileProject(projectPath, fs, addEntry))) {
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
      enqueueSnackbar(
        error instanceof Error ? error.message : m.device_build_flash_failed(),
        { variant: 'error' }
      );
    } finally {
      setIsProcessing(false);
    }
  }, [device, pkg, projectPath, fs, addEntry, jacProject]);

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
