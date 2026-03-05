import { type ReactNode, useState, useEffect, useCallback } from 'react';
import { dirname } from 'path';
import { enqueueSnackbar } from 'notistack';

import { useActiveProject } from '@/features/project/active-project';
import { useJacDevice } from '@/features/jac-device';
import { getLocale } from '@/paraglide/runtime';
import { m } from '@/paraglide/messages';
import { editorSyncService } from '@/features/editor-code/lib/editor-sync-service';
import type { JaclyBlocksData } from '@jaculus/project';

import { EditorJaclyContext } from './editor-jacly-context';

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

async function writeFile(
  fsp: ReturnType<typeof useActiveProject>['state']['fsp'],
  path: string,
  content: string
) {
  await fsp.writeFile(path, content, 'utf-8');
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

  const handleJsonChange = useCallback(
    async (json: object) => {
      try {
        const filePath = getFileName('JACLY_INDEX');
        await ensureDir(fsp, dirname(filePath));
        await writeFile(fsp, filePath, JSON.stringify(json, null, 2));
      } catch (error) {
        console.error('Failed to save JSON:', error);
        enqueueSnackbar(m.editor_jacly_save_json_error(), { variant: 'error' });
      }
    },
    [fsp, getFileName]
  );

  const handleGeneratedCode = useCallback(
    async (code: string) => {
      try {
        const filePath = getFileName('GENERATED_CODE');
        await ensureDir(fsp, dirname(filePath));
        await writeFile(fsp, filePath, code);
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
