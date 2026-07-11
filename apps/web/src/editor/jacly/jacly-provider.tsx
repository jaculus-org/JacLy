import { JaclyEngine } from '@jaculus/jacly/engine';
import type { JaclyBlocksData } from '@jaculus/project';
import { enqueueSnackbar } from 'notistack';
import { type ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { m } from '@/core/paraglide/messages';
import { getLocale } from '@/core/paraglide/runtime';
import { useJacDevice } from '@/device';
import { packageEventsService } from '@/packages';
import { createLatestFileWriter, durableWriteFile, useActiveProject } from '@/project';
import {
  AUTOSAVE_INTERVAL_MS,
  preserveCorruptIndex,
  writeAutosaveBackup,
  writeStartupBackup,
} from './jacly-backup';
import { findNewestValidBackup, type JaclyBackupCandidate } from './jacly-backup-recovery';
import { EditorJaclyContext } from './jacly-context';
import { ensureParentDir, readOrCreateJsonFile } from './jacly-files';
import { JaclyRecoveryDialog } from './jacly-recovery-dialog';
import { jaclySaveCoordinator } from './jacly-save-coordinator';

export function EditorJaclyProvider({ children }: { children: ReactNode }) {
  const {
    state: { fs, fsp, projectPath },
    actions: { getFileName },
  } = useActiveProject();
  const {
    state: { jacProject },
  } = useJacDevice();

  const [engine] = useState(() => new JaclyEngine());
  const [initialJson, setInitialJson] = useState<object | null>(null);
  const [jaclyBlocksData, setJaclyBlocksData] = useState<JaclyBlocksData | null>(null);
  const [recoveryCandidate, setRecoveryCandidate] = useState<JaclyBackupCandidate | null>(null);
  const [corruptJsonContent, setCorruptJsonContent] = useState<string | null>(null);
  const [restoringBackup, setRestoringBackup] = useState(false);
  const latestJsonContentRef = useRef<string | null>(null);
  const jsonWriterRef = useRef<ReturnType<typeof createLatestFileWriter> | null>(null);
  const codeWriterRef = useRef<ReturnType<typeof createLatestFileWriter> | null>(null);

  useEffect(() => {
    const jsonPath = getFileName('JACLY_INDEX');
    const codePath = getFileName('GENERATED_CODE');

    jsonWriterRef.current = createLatestFileWriter({
      filePath: jsonPath,
      writeFile: async (filePath, content, encoding) => {
        await ensureParentDir(fsp, filePath);
        await durableWriteFile(fsp, filePath, content, encoding);
      },
      onError: (error) => {
        console.error('Failed to save Jacly JSON:', error);
        enqueueSnackbar(m.editor_jacly_save_json_error(), { variant: 'error' });
      },
    });

    codeWriterRef.current = createLatestFileWriter({
      filePath: codePath,
      writeFile: async (filePath, content, encoding) => {
        await ensureParentDir(fsp, filePath);
        await durableWriteFile(fsp, filePath, content, encoding);
      },
      onError: (error) => {
        console.error('Failed to save generated code:', error);
        enqueueSnackbar(m.editor_jacly_save_code_error(), { variant: 'error' });
      },
    });

    const unregisterFlush = jaclySaveCoordinator.registerFlushCallback(
      async () => {
        await Promise.all([
          jsonWriterRef.current?.flushPending(),
          codeWriterRef.current?.flushPending(),
        ]);
      },
      () => Boolean(jsonWriterRef.current?.isPending() || codeWriterRef.current?.isPending()),
    );

    return () => {
      unregisterFlush();
      const jsonWriter = jsonWriterRef.current;
      const codeWriter = codeWriterRef.current;
      jsonWriterRef.current = null;
      codeWriterRef.current = null;
      void jsonWriter?.dispose();
      void codeWriter?.dispose();
    };
  }, [fsp, getFileName]);

  useEffect(() => {
    let cancelled = false;
    const jsonPath = getFileName('JACLY_INDEX');

    async function load() {
      if (!jacProject) {
        if (!cancelled) {
          setInitialJson(null);
          setJaclyBlocksData(null);
        }
        return;
      }

      try {
        const blockData = await jacProject.getJaclyData(getLocale());
        let jsonData: object;
        try {
          jsonData = await readOrCreateJsonFile(fs, fsp, jsonPath, async (path, content) => {
            await durableWriteFile(fsp, path, content);
          });
        } catch (error) {
          const corruptContent = await fsp.readFile(jsonPath, 'utf-8');
          const candidate = await findNewestValidBackup(fsp, projectPath, jsonPath);
          if (!candidate) throw error;

          if (!cancelled) {
            setJaclyBlocksData(blockData);
            setCorruptJsonContent(corruptContent);
            setRecoveryCandidate(candidate);
          }
          return;
        }
        const serialized = JSON.stringify(jsonData, null, 2);
        latestJsonContentRef.current = serialized;
        if (cancelled) return;
        setInitialJson(jsonData);
        setJaclyBlocksData(blockData);
        void writeStartupBackup(fsp, projectPath, jsonPath, serialized).catch((err) =>
          console.error('Failed to create startup backup:', err),
        );
      } catch (error) {
        console.error('Failed to load editor data:', error);
        enqueueSnackbar(m.editor_jacly_load_error(), { variant: 'error' });
        if (!cancelled) {
          latestJsonContentRef.current = null;
          setInitialJson(null);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [fs, fsp, projectPath, getFileName, jacProject]);

  useEffect(() => {
    const jsonPath = getFileName('JACLY_INDEX');

    const intervalId = setInterval(() => {
      const content = latestJsonContentRef.current;
      if (!content) return;
      void writeAutosaveBackup(fsp, projectPath, jsonPath, content).catch((err) => {
        enqueueSnackbar(m.editor_jacly_autosave_error(), { variant: 'error' });
        console.error('Failed to create autosave backup:', err);
      });
    }, AUTOSAVE_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [fsp, projectPath, getFileName]);

  useEffect(() => {
    return packageEventsService.onPackagesChanged(async () => {
      if (!jacProject) return;
      try {
        const blockData = await jacProject.getJaclyData(getLocale());
        setJaclyBlocksData(blockData);
      } catch (error) {
        console.error('Failed to reload block data after package change:', error);
        enqueueSnackbar(m.editor_jacly_load_error(), { variant: 'error' });
      }
    });
  }, [jacProject]);

  const handleJsonChange = useCallback((json: object) => {
    try {
      const serialized = JSON.stringify(json, null, 2);
      latestJsonContentRef.current = serialized;
      jsonWriterRef.current?.schedule(serialized);
    } catch (error) {
      console.error('Failed to queue JSON save:', error);
      enqueueSnackbar(m.editor_jacly_save_json_error(), { variant: 'error' });
    }
  }, []);

  const handleGeneratedCode = useCallback((code: string) => {
    try {
      codeWriterRef.current?.schedule(code);
    } catch (error) {
      console.error('Failed to queue generated code save:', error);
      enqueueSnackbar(m.editor_jacly_save_code_error(), { variant: 'error' });
    }
  }, []);

  const handleRecoveryCancel = useCallback(() => {
    setRecoveryCandidate(null);
    enqueueSnackbar(m.editor_jacly_recovery_kept(), { variant: 'warning' });
  }, []);

  const handleRecoveryConfirm = useCallback(async () => {
    if (!recoveryCandidate || corruptJsonContent == null) return;
    const jsonPath = getFileName('JACLY_INDEX');
    setRestoringBackup(true);
    try {
      await preserveCorruptIndex(fsp, projectPath, jsonPath, corruptJsonContent);
      await durableWriteFile(fsp, jsonPath, recoveryCandidate.content);
      latestJsonContentRef.current = recoveryCandidate.content;
      setInitialJson(recoveryCandidate.json);
      setRecoveryCandidate(null);
      setCorruptJsonContent(null);
      enqueueSnackbar(m.editor_jacly_recovery_success(), { variant: 'success' });
    } catch (error) {
      console.error('Failed to restore Jacly backup:', error);
      enqueueSnackbar(m.editor_jacly_recovery_error(), { variant: 'error' });
    } finally {
      setRestoringBackup(false);
    }
  }, [corruptJsonContent, fsp, getFileName, projectPath, recoveryCandidate]);

  return (
    <EditorJaclyContext.Provider
      value={{
        state: { initialJson, jaclyBlocksData, engine },
        actions: { handleJsonChange, handleGeneratedCode },
      }}
    >
      {children}
      {recoveryCandidate ? (
        <JaclyRecoveryDialog
          backupName={recoveryCandidate.name}
          restoring={restoringBackup}
          onCancel={handleRecoveryCancel}
          onConfirm={() => void handleRecoveryConfirm()}
        />
      ) : null}
    </EditorJaclyContext.Provider>
  );
}
