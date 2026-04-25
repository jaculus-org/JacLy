import type { JaclyEngine } from '@jaculus/jacly/engine';
import type { JaclyBlocksData } from '@jaculus/project';
import type { FSInterface, FSPromisesInterface } from '@jaculus/project/fs';
import { enqueueSnackbar } from 'notistack';
import type { Dispatch, SetStateAction } from 'react';
import { useEffect, useState } from 'react';
import { m } from '@/core/paraglide/messages';
import { getLocale } from '@/core/paraglide/runtime';
import { packageEventsService } from '@/packages/services/package-events-service';
import type { ActiveProjectActions } from '@/project/state/active-project-context';
import { readOrCreateJsonFile } from './jacly-files';

interface UseJaclyProjectDataOptions {
  engine: JaclyEngine;
  fs: FSInterface;
  fsp: FSPromisesInterface;
  getFileName: ActiveProjectActions['getFileName'];
  jacProject: { getJaclyData: (locale: string) => Promise<JaclyBlocksData> } | null;
}

interface JaclyProjectDataState {
  initialJson: object | null;
  jaclyBlocksData: JaclyBlocksData | null;
  setJaclyBlocksData: Dispatch<SetStateAction<JaclyBlocksData | null>>;
}

export function useJaclyProjectData({
  engine,
  fs,
  fsp,
  getFileName,
  jacProject,
}: UseJaclyProjectDataOptions): JaclyProjectDataState {
  const [initialJson, setInitialJson] = useState<object | null>(null);
  const [jaclyBlocksData, setJaclyBlocksData] = useState<JaclyBlocksData | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!jacProject) return;
      try {
        const [jsonData, blockData] = await Promise.all([
          readOrCreateJsonFile(fs, fsp, getFileName('JACLY_INDEX')),
          jacProject.getJaclyData(getLocale()),
        ]);
        if (cancelled) return;
        setInitialJson(jsonData);
        setJaclyBlocksData(blockData);
      } catch (error) {
        console.error('Failed to load editor data:', error);
        enqueueSnackbar(m.editor_jacly_load_error(), { variant: 'error' });
        if (!cancelled) setInitialJson({});
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [fs, fsp, getFileName, jacProject]);

  useEffect(() => {
    return packageEventsService.onPackagesChanged(async () => {
      if (!jacProject) return;
      try {
        const blockData = await jacProject.getJaclyData(getLocale());
        engine.reloadBlockData(blockData);
        setJaclyBlocksData(blockData);
      } catch (error) {
        console.error('Failed to reload block data after package change:', error);
        enqueueSnackbar(m.editor_jacly_load_error(), { variant: 'error' });
      }
    });
  }, [engine, jacProject]);

  return { initialJson, jaclyBlocksData, setJaclyBlocksData };
}
