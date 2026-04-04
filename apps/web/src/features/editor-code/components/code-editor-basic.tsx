import { m } from '@/paraglide/messages';
import { useActiveProject } from '@/features/project/active-project';
import { useTheme } from '@/features/theme';
import Editor, { useMonaco } from '@monaco-editor/react';
import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { inferLanguageFromPath } from '../lib/language';
import { editorSyncService } from '../lib/editor-sync-service';
import { debounce } from '@jaculus/jacly/utils';

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
  const monaco = useMonaco();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fileExists, setFileExists] = useState(true);
  const applyingExternalChangeRef = useRef(false);

  const fullPath = `${projectPath}/${filePath}`;
  const readOnlyInternal = filePath.startsWith('build/') ? true : readOnly;

  // Debounced save function that marks saves as editor-originated.
  // Debouncing prevents concurrent writes on every keystroke; holding the flag
  // for the full writeFile duration blocks the watcher from reading partial content.
  const saveToFile = useMemo(
    () =>
      debounce(async (path: string, content: string) => {
        editorSyncService.markEditorSaveStart(path);
        try {
          await fsp.writeFile(path, content, 'utf-8');
        } catch (error) {
          console.error('Error saving file:', error);
        } finally {
          editorSyncService.markEditorSaveEnd(path);
        }
      }, 300),
    [fsp]
  );

  // Handle editor content changes
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
    [fullPath, readOnlyInternal, saveToFile]
  );

  // Initial file load and model setup
  useEffect(() => {
    if (!monaco) return;

    // Capture monaco in local const for TypeScript null-safety
    const monacoInstance = monaco;

    async function initializeEditor() {
      try {
        setLoading(true);
        setError(null);

        const uri = monacoInstance.Uri.file(fullPath);

        // If MonacoProjectService already created the model, use it directly.
        // Re-reading from ZenFS and calling setValue would trigger onChange →
        // a redundant debounced save of the same content.
        if (monacoInstance.editor.getModel(uri)) {
          setFileExists(true);
          return;
        }

        // Model not yet available — fall back to reading from ZenFS.
        const content = (await fsp.readFile(fullPath, 'utf-8')) as string;
        setFileExists(true);
        monacoInstance.editor.createModel(
          content,
          inferLanguageFromPath(filePath),
          uri
        );
      } catch (err) {
        console.error('Error loading file:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setFileExists(false);

        // Handle ifNotExists logic
        if (ifNotExists === 'create') {
          editorSyncService.markEditorSaveStart(fullPath);
          try {
            await fsp.writeFile(fullPath, '', 'utf-8');
            setFileExists(true);

            // Create empty model
            const uri = monacoInstance.Uri.file(fullPath);
            const model = monacoInstance.editor.getModel(uri);
            if (!model) {
              monacoInstance.editor.createModel(
                '',
                inferLanguageFromPath(filePath),
                uri
              );
            }
          } catch (createErr) {
            console.error('Error creating file:', createErr);
          } finally {
            editorSyncService.markEditorSaveEnd(fullPath);
          }
        }
      } finally {
        setLoading(false);
      }
    }

    initializeEditor();
  }, [filePath, ifNotExists, fsp, fullPath, monaco]);

  // Keep model in sync with non-editor writes (e.g., Jacly regeneration)
  useEffect(() => {
    if (!monaco) return;

    const unsubscribe = editorSyncService.onExternalChange(
      (changedPath, content) => {
        if (changedPath !== fullPath) return;

        const uri = monaco.Uri.file(fullPath);
        const model = monaco.editor.getModel(uri);

        if (!model) {
          monaco.editor.createModel(
            content,
            inferLanguageFromPath(filePath),
            uri
          );
          return;
        }

        if (model.getValue() === content) return;

        // Use pushEditOperations instead of setValue to preserve the undo stack.
        // setValue nukes undo history; pushEditOperations treats the external
        // change as an undoable edit operation.
        applyingExternalChangeRef.current = true;
        model.pushEditOperations(
          [],
          [{ range: model.getFullModelRange(), text: content }],
          () => null
        );
        window.setTimeout(() => {
          applyingExternalChangeRef.current = false;
        }, 0);
      }
    );

    return unsubscribe;
  }, [filePath, fullPath, monaco]);

  // Show loading state
  if (loading || !monaco) {
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
