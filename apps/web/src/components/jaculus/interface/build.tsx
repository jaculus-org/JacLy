import { Button } from '@/components/ui/button';
import { useJac } from '@/jaculus/provider/jac-context';
import { Upload } from 'lucide-react';
import { compile } from '@jaculus/project/compiler';
import { enqueueSnackbar } from 'notistack';
import { logger } from '@/jaculus/log/logger';
import { jacErr } from '@/jaculus/log/std-temp';

export function JaculusBuild() {
  const { device, fs, activeProject } = useJac();

  async function compileHelper() {
    if (!device || !activeProject) {
      enqueueSnackbar('No device or project connected', { variant: 'error' });
      return;
    }
    if (!fs) {
      enqueueSnackbar('Filesystem not ready', { variant: 'error' });
      return;
    }

    const basePath = `/${activeProject.id}`;

    await compile(fs, basePath, 'build', jacErr, logger, '/tsLibs');

    enqueueSnackbar('Compilation finished', { variant: 'success' });
  }

  return (
    <Button
      variant="default"
      size="sm"
      className="gap-2"
      onClick={compileHelper}
    >
      <Upload className="h-4 w-4" />
      Build
    </Button>
  );
}
