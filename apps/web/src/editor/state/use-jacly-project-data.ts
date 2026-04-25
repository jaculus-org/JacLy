import type { JaclyBlocksData } from '@jaculus/project';
import { enqueueSnackbar } from 'notistack';
import type { Dispatch, SetStateAction } from 'react';
import { useEffect, useState } from 'react';
import { m } from '@/core/paraglide/messages';
import { getLocale } from '@/core/paraglide/runtime';
import type {
  ActiveProjectActions,
  ActiveProjectState,
} from '@/project/state/active-project-context';
import { readOrCreateJsonFile } from './jacly-files';

interface UseJaclyProjectDataOptions {
  fs: ActiveProjectState['fs'];
  fsp: ActiveProjectState['fsp'];
  getFileName: ActiveProjectActions['getFileName'];
  jacProject: { getJaclyData: (locale: string) => Promise<JaclyBlocksData> } | null;
}

interface JaclyProjectDataState {
  initialJson: object | null;
  jaclyBlocksData: JaclyBlocksData | null;
  setJaclyBlocksData: Dispatch<SetStateAction<JaclyBlocksData | null>>;
}

export function useJaclyProjectData({
  fs,
  fsp,
  getFileName,
  jacProject,
}: UseJaclyProjectDataOptions): JaclyProjectDataState {
  const [initialJson, setInitialJson] = useState<object | null>(null);
  const [jaclyBlocksData, setJaclyBlocksData] = useState<JaclyBlocksData | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadProjectData() {
      try {
        if (!jacProject) return;

        const jaclyFilePath = getFileName('JACLY_INDEX');
        const [jsonData, blockData] = await Promise.all([
          readOrCreateJsonFile(fs, fsp, jaclyFilePath),
          jacProject.getJaclyData(getLocale()),
        ]);

        if (cancelled) return;

        setInitialJson(jsonData);
        setJaclyBlocksData(blockData);
      } catch (error) {
        console.error('Failed to load editor data:', error);
        enqueueSnackbar(m.editor_jacly_load_error(), { variant: 'error' });

        if (cancelled) return;

        setInitialJson({});
        setJaclyBlocksData(null);
      }
    }

    void loadProjectData();

    return () => {
      cancelled = true;
    };
  }, [fs, fsp, getFileName, jacProject]);

  return {
    initialJson,
    jaclyBlocksData,
    setJaclyBlocksData,
  };
}
