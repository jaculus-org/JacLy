import { useEffect, useRef, useState } from 'react';
import { useMonaco } from '@monaco-editor/react';
import { editorSyncService } from '../services/editor-sync-service';
import { inferLanguageFromPath } from '../services/language';

interface UseMonacoModelOptions {
  fullPath: string;
  filePath: string;
  ifNotExists: 'create' | 'loading' | 'error';
  fsp: typeof import('fs').promises;
}

interface UseMonacoModelResult {
  loading: boolean;
  fileExists: boolean;
  error: string | null;
  applyingExternalChangeRef: React.MutableRefObject<boolean>;
}

export function useMonacoModel({
  fullPath,
  filePath,
  ifNotExists,
  fsp,
}: UseMonacoModelOptions): UseMonacoModelResult {
  const monaco = useMonaco();
  const applyingExternalChangeRef = useRef(false);
  const [loading, setLoading] = useState(true);
  const [fileExists, setFileExists] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!monaco) return;

    async function initializeModel() {
      try {
        setLoading(true);
        setError(null);

        const uri = monaco!.Uri.file(fullPath);

        // Reuse if already created by MonacoProjectService — setValue would trigger a redundant save.
        if (monaco!.editor.getModel(uri)) {
          setFileExists(true);
          return;
        }

        const content = (await fsp.readFile(fullPath, 'utf-8')) as string;
        setFileExists(true);
        monaco!.editor.createModel(
          content,
          inferLanguageFromPath(filePath),
          uri
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setFileExists(false);

        if (ifNotExists === 'create') {
          const uri = monaco!.Uri.file(fullPath);
          editorSyncService.markEditorSaveStart(fullPath);
          try {
            await fsp.writeFile(fullPath, '', 'utf-8');
            setFileExists(true);
            if (!monaco!.editor.getModel(uri)) {
              monaco!.editor.createModel(
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

    initializeModel();
  }, [filePath, ifNotExists, fsp, fullPath, monaco]);

  // Keep model in sync with non-editor writes (e.g., Jacly code generator)
  useEffect(() => {
    if (!monaco) return;

    return editorSyncService.onExternalChange((changedPath, content) => {
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
      applyingExternalChangeRef.current = true;
      model.pushEditOperations(
        [],
        [{ range: model.getFullModelRange(), text: content }],
        () => null
      );
      window.setTimeout(() => {
        applyingExternalChangeRef.current = false;
      }, 0);
    });
  }, [filePath, fullPath, monaco]);

  return {
    loading: loading || !monaco,
    fileExists,
    error,
    applyingExternalChangeRef,
  };
}
