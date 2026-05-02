import { JaclyEngine } from '@jaculus/jacly/engine';
import type { JaclyBlocksData } from '@jaculus/project';
import { enqueueSnackbar } from 'notistack';
import { type ReactNode, useEffect, useRef, useState } from 'react';
import { m } from '@/core/paraglide/messages';
import { getLocale } from '@/core/paraglide/runtime';
import { useJacDevice } from '@/device';
import { packageEventsService } from '@/packages/services/package-events-service';
import { useActiveProject } from '@/project';
import { EditorJaclyContext } from './jacly-context';
import { ensureParentDir, readOrCreateJsonFile } from './jacly-files';
import { jaclySaveCoordinator } from './jacly-save-coordinator';
import { createLatestFileWriter } from './latest-file-writer';

const FILE_RELOAD_DELAY_MS = 50;

export function EditorJaclyProvider({ children }: { children: ReactNode }) {
  const {
    state: { fs, fsp },
    actions: { getFileName },
  } = useActiveProject();
  const {
    state: { jacProject },
  } = useJacDevice();

  const [engine] = useState(() => new JaclyEngine());
  const [initialJson, setInitialJson] = useState<object | null>(null);
  const [jaclyBlocksData, setJaclyBlocksData] = useState<JaclyBlocksData | null>(null);
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
        await fsp.writeFile(filePath, content, encoding);
      },
    });

    codeWriterRef.current = createLatestFileWriter({
      filePath: codePath,
      writeFile: async (filePath, content, encoding) => {
        await ensureParentDir(fsp, filePath);
        await fsp.writeFile(filePath, content, encoding);
      },
    });

    const unregisterFlush = jaclySaveCoordinator.registerFlushCallback(async () => {
      await Promise.all([
        jsonWriterRef.current?.flushPending(),
        codeWriterRef.current?.flushPending(),
      ]);
    });

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
    let reloadTimer: ReturnType<typeof setTimeout> | undefined;
    let watcher: ReturnType<typeof fs.watch> | undefined;
    const jsonPath = getFileName('JACLY_INDEX');

    const clearReloadTimer = () => {
      if (!reloadTimer) return;
      clearTimeout(reloadTimer);
      reloadTimer = undefined;
    };

    const reloadJsonFromDisk = async () => {
      try {
        const content = await fsp.readFile(jsonPath, 'utf-8');
        if (content === latestJsonContentRef.current) {
          return;
        }
        const parsed = JSON.parse(content) as object;
        latestJsonContentRef.current = JSON.stringify(parsed, null, 2);
        if (!cancelled) {
          setInitialJson(parsed);
        }
      } catch (error) {
        console.error('Failed to reload Jacly JSON from disk:', error);
        enqueueSnackbar(m.editor_jacly_load_error(), { variant: 'error' });
      }
    };

    const scheduleReload = () => {
      clearReloadTimer();
      reloadTimer = setTimeout(() => {
        void reloadJsonFromDisk();
      }, FILE_RELOAD_DELAY_MS);
    };

    async function load() {
      if (!jacProject) {
        if (!cancelled) {
          setInitialJson(null);
          setJaclyBlocksData(null);
        }
        return;
      }

      try {
        const [jsonData, blockData] = await Promise.all([
          readOrCreateJsonFile(fs, fsp, jsonPath),
          jacProject.getJaclyData(getLocale()),
        ]);
        latestJsonContentRef.current = JSON.stringify(jsonData, null, 2);
        if (cancelled) return;
        setInitialJson(jsonData);
        setJaclyBlocksData(blockData);
        watcher = fs.watch(jsonPath, (eventType) => {
          if (cancelled) return;
          if (eventType === 'rename' || eventType === 'change') {
            scheduleReload();
          }
        });
      } catch (error) {
        console.error('Failed to load editor data:', error);
        enqueueSnackbar(m.editor_jacly_load_error(), { variant: 'error' });
        if (!cancelled) {
          latestJsonContentRef.current = '{}';
          setInitialJson({});
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
      clearReloadTimer();
      watcher?.close();
    };
  }, [fs, fsp, getFileName, jacProject]);

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

  function handleJsonChange(json: object) {
    try {
      const serialized = JSON.stringify(json, null, 2);
      latestJsonContentRef.current = serialized;
      jsonWriterRef.current?.schedule(serialized);
    } catch (error) {
      console.error('Failed to queue JSON save:', error);
      enqueueSnackbar(m.editor_jacly_save_json_error(), { variant: 'error' });
    }
  }

  function handleGeneratedCode(code: string) {
    try {
      codeWriterRef.current?.schedule(code);
    } catch (error) {
      console.error('Failed to queue generated code save:', error);
      enqueueSnackbar(m.editor_jacly_save_code_error(), { variant: 'error' });
    }
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
