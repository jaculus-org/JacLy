import type { FSInterface } from '@jaculus/project/fs';
import { Editor } from '@monaco-editor/react';
import { useEffect, useState } from 'react';
import { useTheme } from '@/core';
import { useActiveProject } from '@/project';
import { inferLanguageFromPath } from '../services/language';

interface CodeEditorReadProps {
  readonly filePath: string;
}

const FILE_RELOAD_DELAY_MS = 50;

function getFullPath(projectPath: string, filePath: string) {
  return `${projectPath}/${filePath}`;
}

function getErrorMessage(error: unknown, prefix: string) {
  return `${prefix}: ${error instanceof Error ? error.message : 'Unknown error'}`;
}

function useReadOnlyFileContent(projectPath: string, filePath: string, fs: FSInterface) {
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState('');

  useEffect(() => {
    if (!projectPath) {
      setCode('');
      setLoading(false);
      return;
    }

    const fullPath = getFullPath(projectPath, filePath);
    let disposed = false;
    let reloadTimer: ReturnType<typeof setTimeout> | undefined;
    let watcher: { close?: () => void } | undefined;

    const updateCode = (nextCode: string) => {
      if (!disposed) {
        setCode(nextCode);
      }
    };

    const clearReloadTimer = () => {
      if (reloadTimer) {
        clearTimeout(reloadTimer);
        reloadTimer = undefined;
      }
    };

    const reloadFile = async () => {
      try {
        const updatedContent = await fs.promises.readFile(fullPath, 'utf-8');
        updateCode(updatedContent);
      } catch (error) {
        updateCode(getErrorMessage(error, 'Error reloading file'));
      }
    };

    const scheduleReload = () => {
      clearReloadTimer();
      reloadTimer = setTimeout(() => {
        void reloadFile();
      }, FILE_RELOAD_DELAY_MS);
    };

    const startWatching = () => {
      watcher = fs.watch(fullPath, (eventType) => {
        if (disposed) {
          return;
        }

        if (eventType === 'rename') {
          updateCode('File was renamed or deleted.');
          return;
        }

        scheduleReload();
      });
    };

    const loadFile = async () => {
      setLoading(true);

      try {
        const content = await fs.promises.readFile(fullPath, 'utf-8');
        updateCode(content);
        startWatching();
      } catch (error) {
        updateCode(getErrorMessage(error, 'Error loading file'));
      } finally {
        if (!disposed) {
          setLoading(false);
        }
      }
    };

    void loadFile();

    return () => {
      disposed = true;
      clearReloadTimer();
      watcher?.close?.();
    };
  }, [projectPath, filePath, fs]);

  return { loading, code };
}

export function CodeEditorRead({ filePath }: CodeEditorReadProps) {
  const { themeNormalized } = useTheme();
  const {
    state: { projectPath, fs },
  } = useActiveProject();
  const { loading, code } = useReadOnlyFileContent(projectPath, filePath, fs);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Editor
      height="100%"
      value={code}
      language={inferLanguageFromPath(filePath)}
      theme={themeNormalized === 'dark' ? 'vs-dark' : 'light'}
      options={{
        readOnly: true,
        minimap: { enabled: false },
        automaticLayout: true,
      }}
    />
  );
}