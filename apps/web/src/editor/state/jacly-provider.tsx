import { JaclyEngine } from '@jaculus/jacly/engine';
import type { JaclyBlocksData } from '@jaculus/project';
import { enqueueSnackbar } from 'notistack';
import { type ReactNode, useEffect, useRef, useState } from 'react';
import { m } from '@/core/paraglide/messages';
import { useJacDevice } from '@/device';
import { useActiveProject } from '@/project';
import { EditorJaclyContext } from './jacly-context';
import { ensureParentDir } from './jacly-files';
import { useJaclyProjectData } from './use-jacly-project-data';

export function EditorJaclyProvider({ children }: { children: ReactNode }) {
  const {
    state: { fs, fsp },
    actions: { getFileName },
  } = useActiveProject();
  const {
    state: { jacProject },
  } = useJacDevice();

  const [engine] = useState(() => new JaclyEngine());

  const { initialJson, jaclyBlocksData, setJaclyBlocksData } = useJaclyProjectData({
    engine,
    fs,
    fsp,
    getFileName,
    jacProject,
  });

  const jsonTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const codeTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    return () => {
      clearTimeout(jsonTimerRef.current);
      clearTimeout(codeTimerRef.current);
    };
  }, []);

  function handleJsonChange(json: object) {
    setJaclyBlocksData(json as JaclyBlocksData);
    clearTimeout(jsonTimerRef.current);
    jsonTimerRef.current = setTimeout(async () => {
      try {
        const filePath = getFileName('JACLY_INDEX');
        await ensureParentDir(fsp, filePath);
        await fsp.writeFile(filePath, JSON.stringify(json, null, 2), 'utf-8');
      } catch (error) {
        console.error('Failed to save JSON:', error);
        enqueueSnackbar(m.editor_jacly_save_json_error(), { variant: 'error' });
      }
    }, 300);
  }

  function handleGeneratedCode(code: string) {
    clearTimeout(codeTimerRef.current);
    codeTimerRef.current = setTimeout(async () => {
      try {
        const filePath = getFileName('GENERATED_CODE');
        await ensureParentDir(fsp, filePath);
        await fsp.writeFile(filePath, code, 'utf-8');
      } catch (error) {
        console.error('Failed to save generated code:', error);
        enqueueSnackbar(m.editor_jacly_save_code_error(), { variant: 'error' });
      }
    }, 150);
  }

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
