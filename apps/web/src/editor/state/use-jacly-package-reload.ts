import type { JaclyEngine } from '@jaculus/jacly/engine';
import type { JaclyBlocksData } from '@jaculus/project';
import { enqueueSnackbar } from 'notistack';
import type { Dispatch, SetStateAction } from 'react';
import { useEffect } from 'react';
import { m } from '@/core/paraglide/messages';
import { getLocale } from '@/core/paraglide/runtime';
import { packageEventsService } from '@/packages/services/package-events-service';

interface UseJaclyPackageReloadOptions {
  engine: JaclyEngine;
  jacProject: { getJaclyData: (locale: string) => Promise<JaclyBlocksData> } | null;
  setJaclyBlocksData: Dispatch<SetStateAction<JaclyBlocksData | null>>;
}

export function useJaclyPackageReload({
  engine,
  jacProject,
  setJaclyBlocksData,
}: UseJaclyPackageReloadOptions): void {
  useEffect(() => {
    return packageEventsService.onPackagesChanged(() => {
      if (!jacProject) return;

      void (async () => {
        try {
          const jaclyData = await jacProject.getJaclyData(getLocale());
          engine.reloadBlockData(jaclyData);
          setJaclyBlocksData(jaclyData);
        } catch (error) {
          console.error('Failed to reload block data after package change:', error);
          enqueueSnackbar(m.editor_jacly_load_error(), { variant: 'error' });
        }
      })();
    });
  }, [engine, jacProject, setJaclyBlocksData]);
}
