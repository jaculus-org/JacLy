import { useEffect } from 'react';
import { useMonaco } from '@monaco-editor/react';
import { useActiveProject } from '@/project';
import { editorSyncService } from '../services/editor-sync-service';
import { MonacoProjectService } from '../services/monaco-project-service';

export function MonacoProjectInitializer() {
  const monaco = useMonaco();
  const {
    state: { fs, fsp, projectPath },
  } = useActiveProject();

  useEffect(() => {
    if (!monaco) return;

    const service = new MonacoProjectService(
      monaco,
      projectPath,
      fs,
      fsp,
      editorSyncService
    );

    service
      .initialize()
      .then(() => service.watch())
      .catch((err: unknown) => {
        console.error('[MonacoProjectInitializer] Failed to initialize:', err);
      });

    return () => {
      service.dispose();
    };
  }, [monaco, projectPath, fs, fsp]);

  return null;
}
