import { useEffect } from 'react';
import { useMonaco } from '@monaco-editor/react';
import { useActiveProject } from '@/project';
import { editorSyncService } from '../services/editor-sync-service';
import { MonacoProjectService } from '../lib/monaco-project-service';

/**
 * Renderless component that initializes MonacoProjectService for the active project.
 * Must be mounted inside ActiveProjectProvider.
 * Creates Monaco models for source files and extraLibs for type definitions,
 * then watches ZenFS for real-time changes.
 */
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
