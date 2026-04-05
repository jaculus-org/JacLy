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
import { editorSyncService } from '../services/editor-sync-service';
import { debounce } from '@jaculus/jacly/utils';
import type { JaclyBlocksData } from '@jaculus/project';

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
  const { jacProject, nodeModulesVersion } = jacState;

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

        const jsonData = fs.existsSync(jaclyFile)
          ? JSON.parse(fs.readFileSync(jaclyFile, 'utf-8'))
          : (() => {
              fsp.writeFile(jaclyFile, '{}', 'utf-8');
              return {};
            })();

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
  }, [fs, fsp, getFileName, jacProject, nodeModulesVersion]);

  const handleJsonChange = useMemo(
    () =>
      debounce(async (json: object) => {
        const content = JSON.stringify(json, null, 2);
        const filePath = getFileName('JACLY_INDEX');
        editorSyncService.markEditorSaveStart(filePath);
        try {
          await ensureDir(fsp, dirname(filePath));
          await fsp.writeFile(filePath, content, 'utf-8');
          editorSyncService.notifyExternalChange(filePath, content);
        } catch (error) {
          console.error('Failed to save JSON:', error);
          enqueueSnackbar(m.editor_jacly_save_json_error(), {
            variant: 'error',
          });
        } finally {
          editorSyncService.markEditorSaveEnd(filePath);
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
        editorSyncService.notifyExternalChange(filePath, code);
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
        state: { initialJson, jaclyBlocksData },
        actions: { handleJsonChange, handleGeneratedCode },
      }}
    >
      {children}
    </EditorJaclyContext.Provider>
  );
}
