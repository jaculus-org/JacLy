import {
  type ReactNode,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import { dirname } from 'path';
import { enqueueSnackbar } from 'notistack';

import { useActiveProject } from '@/project';
import { useJacDevice } from '@/device';
import { getLocale } from '@/core/paraglide/runtime';
import { m } from '@/core/paraglide/messages';
import { packageEventsService } from '@/packages/services/package-events-service';
import { debounce } from '@jaculus/jacly/utils';
import type { JaclyBlocksData } from '@jaculus/project';
import { JaclyEngine } from '@jaculus/jacly/engine';

import { EditorJaclyContext } from './jacly-context';

async function ensureDir(
  fsp: ReturnType<typeof useActiveProject>['state']['fsp'],
  path: string
) {
  try {
    await fsp.mkdir(path, { recursive: true });
  } catch (e: unknown) {
    if ((e as { code?: string })?.code !== 'EEXIST') throw e;
  }
}

export function EditorJaclyProvider({ children }: { children: ReactNode }) {
  const {
    state: { fs, fsp },
    actions,
  } = useActiveProject();
  const { getFileName } = actions;
  const { state: jacState } = useJacDevice();
  const { jacProject } = jacState;

  const [engine] = useState(() => new JaclyEngine());
  const [initialJson, setInitialJson] = useState<object | null>(null);
  const [jaclyBlocksData, setJaclyBlocksData] =
    useState<JaclyBlocksData | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        if (!jacProject) return;

        const jaclyFile = getFileName('JACLY_INDEX');
        await ensureDir(fsp, dirname(jaclyFile));

        let jsonData: object;
        if (fs.existsSync(jaclyFile)) {
          jsonData = JSON.parse(fs.readFileSync(jaclyFile, 'utf-8'));
        } else {
          await fsp.writeFile(jaclyFile, '{}', 'utf-8');
          jsonData = {};
        }

        const jaclyData = await jacProject.getJaclyData(getLocale());

        if (cancelled) return;
        setInitialJson(jsonData);
        setJaclyBlocksData(jaclyData);
      } catch (error) {
        console.error('Failed to load editor data:', error);
        enqueueSnackbar(m.editor_jacly_load_error(), { variant: 'error' });
        if (!cancelled) {
          setInitialJson({});
          setJaclyBlocksData(null);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [fs, fsp, getFileName, jacProject]);

  useEffect(() => {
    return packageEventsService.onPackagesChanged(() => {
      if (!jacProject) return;
      (async () => {
        try {
          const jaclyData = await jacProject.getJaclyData(getLocale());
          engine.reloadBlockData(jaclyData);
          setJaclyBlocksData(jaclyData);
        } catch (error) {
          console.error(
            'Failed to reload block data after package change:',
            error
          );
          enqueueSnackbar(m.editor_jacly_load_error(), { variant: 'error' });
        }
      })();
    });
  }, [jacProject, engine]);

  const handleJsonChange = useMemo(
    () =>
      debounce(async (json: object) => {
        const content = JSON.stringify(json, null, 2);
        const filePath = getFileName('JACLY_INDEX');
        try {
          await ensureDir(fsp, dirname(filePath));
          await fsp.writeFile(filePath, content, 'utf-8');
        } catch (error) {
          console.error('Failed to save JSON:', error);
          enqueueSnackbar(m.editor_jacly_save_json_error(), {
            variant: 'error',
          });
        }
      }, 300),
    [fsp, getFileName]
  );

  const handleGeneratedCode = useCallback(
    async (code: string) => {
      try {
        const filePath = getFileName('GENERATED_CODE');
        await ensureDir(fsp, dirname(filePath));
        await fsp.writeFile(filePath, code, 'utf-8');
      } catch (error) {
        console.error('Failed to save generated code:', error);
        enqueueSnackbar(m.editor_jacly_save_code_error(), { variant: 'error' });
      }
    },
    [fsp, getFileName]
  );

  return (
    <EditorJaclyContext.Provider
      value={{
        state: { initialJson, jaclyBlocksData, engine },
        actions: { handleJsonChange, handleGeneratedCode },
      }}
    >
      {children}
    </EditorJaclyContext.Provider>
  );
}
