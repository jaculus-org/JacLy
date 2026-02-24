import { m } from '@/paraglide/messages';
import { useActiveProject } from '@/features/project/active-project';
import { useTheme } from '@/features/theme';
import Editor, { useMonaco } from '@monaco-editor/react';
import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { inferLanguageFromPath } from '../lib/language';
import { editorSyncService } from '../lib/editor-sync-service';
// import { debounce } from '@/lib/utils/debouncer';

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

  // Debounced save function that marks saves as editor-originated
  const saveToFile = useMemo(
    () => /*debounce(*/ async (path: string, content: string) => {
      try {
        editorSyncService.markEditorSave(path);
        await fsp.writeFile(path, content, 'utf-8');
      } catch (error) {
        console.error('Error saving file:', error);
      }
    } /*, 500),*/,
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

        // Try to read the file
        const content = await fsp.readFile(fullPath, 'utf-8');
        setFileExists(true);

        // Create or update the Monaco model
        const uri = monacoInstance.Uri.file(fullPath);
        let model = monacoInstance.editor.getModel(uri);

        if (model) {
          model.setValue(content);
        } else {
          model = monacoInstance.editor.createModel(
            content,
            inferLanguageFromPath(filePath),
            uri
          );
        }
      } catch (err) {
        console.error('Error loading file:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setFileExists(false);

        // Handle ifNotExists logic
        if (ifNotExists === 'create') {
          try {
            editorSyncService.markEditorSave(fullPath);
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

        applyingExternalChangeRef.current = true;
        model.setValue(content);
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
        renderValidationDecorations: 'off',
        minimap: { enabled: false },
        automaticLayout: true,
      }}
      onChange={handleEditorChange}
    />
  );
}
