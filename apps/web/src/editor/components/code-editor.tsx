import { m } from '@/core/paraglide/messages';
import { useActiveProject } from '@/features/project/active-project';
import { useTheme } from '@/core/components/theme';
import { editorSyncService } from '../services/editor-sync-service';
import Editor from '@monaco-editor/react';
import { useMemo, useCallback } from 'react';
import { inferLanguageFromPath } from '../services/language';
import { debounce } from '@jaculus/jacly/utils';
import { useMonacoModel } from '../hooks/use-monaco-model';

interface CodeEditorBasicProps {
  readonly filePath: string;
  readonly readOnly?: boolean;
  readonly ifNotExists: 'create' | 'loading' | 'error';
  readonly loadingMessage?: string;
}

export function CodeEditorBasic({
  filePath,
  readOnly = false,
  ifNotExists,
  loadingMessage,
}: CodeEditorBasicProps) {
  const {
    state: { fsp, projectPath },
  } = useActiveProject();
  const { themeNormalized } = useTheme();

  const fullPath = `${projectPath}/${filePath}`;
  const readOnlyInternal = filePath.startsWith('build/') ? true : readOnly;

  const { loading, fileExists, error, applyingExternalChangeRef } =
    useMonacoModel({
      fullPath,
      filePath,
      ifNotExists,
      fsp,
    });

  // Debounced save: holds the pending-save flag for the full writeFile duration
  // so the watcher never reads partially-written content.
  const saveToFile = useMemo(
    () =>
      debounce(async (path: string, content: string) => {
        editorSyncService.markEditorSaveStart(path);
        try {
          await fsp.writeFile(path, content, 'utf-8');
        } catch (err) {
          console.error('Error saving file:', err);
        } finally {
          editorSyncService.markEditorSaveEnd(path);
        }
      }, 300),
    [fsp]
  );

  const handleEditorChange = useCallback(
    (value: string | undefined) => {
      if (
        value !== undefined &&
        !readOnlyInternal &&
        !applyingExternalChangeRef.current
      ) {
        saveToFile(fullPath, value);
      }
    },
    [fullPath, readOnlyInternal, saveToFile, applyingExternalChangeRef]
  );

  if (loading) {
    return <div>{loadingMessage ?? m.editor_loading()}</div>;
  }

  if (!fileExists && ifNotExists === 'error') {
    return (
      <div className="h-full w-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 text-sm mb-2">
            {m.editor_error_title()}
          </p>
          <p className="text-slate-600 dark:text-slate-400 text-xs">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <Editor
      height="100%"
      path={fullPath}
      language={inferLanguageFromPath(filePath)}
      theme={themeNormalized === 'dark' ? 'vs-dark' : 'light'}
      options={{
        readOnly: readOnlyInternal,
        minimap: { enabled: false },
        automaticLayout: true,
      }}
      onChange={handleEditorChange}
    />
  );
}
