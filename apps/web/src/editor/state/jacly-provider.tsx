import { JaclyEngine } from '@jaculus/jacly/engine';
import { enqueueSnackbar } from 'notistack';
import { type ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { m } from '@/core/paraglide/messages';
import { useJacDevice } from '@/device';
import { useActiveProject } from '@/project';
import { EditorJaclyContext } from './jacly-context';
import { useJaclyPackageReload } from './use-jacly-package-reload';
import { useJaclyProjectData } from './use-jacly-project-data';
import { usePendingEditorFile } from './use-pending-editor-file';

export function EditorJaclyProvider({ children }: { children: ReactNode }) {
  const {
    state: { fs, fsp, monacoService },
    actions: { getFileName },
  } = useActiveProject();
  const {
    state: { jacProject },
  } = useJacDevice();

  const [engine] = useState(() => new JaclyEngine());

  const { initialJson, jaclyBlocksData, setJaclyBlocksData } = useJaclyProjectData({
    fs,
    fsp,
    getFileName,
    jacProject,
  });

  useJaclyPackageReload({
    engine,
    jacProject,
    setJaclyBlocksData,
  });

  const handleJsonSaveError = useCallback((error: unknown) => {
    console.error('Failed to save JSON:', error);
    enqueueSnackbar(m.editor_jacly_save_json_error(), { variant: 'error' });
  }, []);

  const handleGeneratedCodeSaveError = useCallback((error: unknown) => {
    console.error('Failed to save generated code:', error);
    enqueueSnackbar(m.editor_jacly_save_code_error(), { variant: 'error' });
  }, []);

  const {
    flush: flushJsonFile,
    hasPendingChanges: hasPendingJsonChanges,
    schedule: scheduleJsonSave,
  } = usePendingEditorFile<object>({
    delayMs: 300,
    filePath: getFileName('JACLY_INDEX'),
    fsp,
    monacoService,
    onError: handleJsonSaveError,
    serialize: (json) => JSON.stringify(json, null, 2),
  });

  const {
    flush: flushGeneratedCodeFile,
    hasPendingChanges: hasPendingGeneratedCodeChanges,
    schedule: scheduleGeneratedCodeSave,
  } = usePendingEditorFile<string>({
    delayMs: 150,
    filePath: getFileName('GENERATED_CODE'),
    fsp,
    monacoService,
    onError: handleGeneratedCodeSaveError,
    serialize: (code) => code,
  });

  const handleJsonChange = useCallback(
    (json: object) => {
      scheduleJsonSave(json);
    },
    [scheduleJsonSave],
  );

  const handleGeneratedCode = useCallback(
    (code: string) => {
      scheduleGeneratedCodeSave(code);
    },
    [scheduleGeneratedCodeSave],
  );

  const flushPendingChanges = useCallback(async () => {
    await Promise.all([flushJsonFile(), flushGeneratedCodeFile()]);
  }, [flushGeneratedCodeFile, flushJsonFile]);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (hasPendingJsonChanges() || hasPendingGeneratedCodeChanges()) {
        event.preventDefault();
      }

      void flushPendingChanges();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [flushPendingChanges, hasPendingGeneratedCodeChanges, hasPendingJsonChanges]);

  const contextValue = useMemo(
    () => ({
      state: {
        initialJson,
        jaclyBlocksData,
        engine,
      },
      actions: {
        handleJsonChange,
        handleGeneratedCode,
        flushPendingChanges,
      },
    }),
    [
      engine,
      flushPendingChanges,
      handleGeneratedCode,
      handleJsonChange,
      initialJson,
      jaclyBlocksData,
    ],
  );

  return <EditorJaclyContext.Provider value={contextValue}>{children}</EditorJaclyContext.Provider>;
}
