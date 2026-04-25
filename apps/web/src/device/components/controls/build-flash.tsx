import { SquareArrowRightIcon } from 'lucide-react';
import { enqueueSnackbar } from 'notistack';
import { useCallback, useState } from 'react';
import { m } from '@/core/paraglide/messages';
import { useActiveProject, useProjectEditor } from '@/project';
import { ButtonLoading } from '@/ui/components/custom/button-loading';
import { compileProject } from '../../services/compilation';
import { uploadCode } from '../../services/device-operations';
import { useJacDevice } from '../../state/device-context';

export function BuildFlash() {
  const {
    state: { projectPath, fs, monacoService },
  } = useActiveProject();
  const {
    actions: { controlPanel },
  } = useProjectEditor();
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
      if (pkg?.jaculus?.projectType === 'code') {
        await monacoService?.flush();
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
  }, [device, pkg, projectPath, fs, jacProject, controlPanel, monacoService]);

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
