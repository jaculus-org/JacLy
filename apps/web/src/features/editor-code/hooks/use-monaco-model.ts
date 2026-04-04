import { useEffect, useRef, useState } from 'react';
import { useMonaco } from '@monaco-editor/react';
import { editorSyncService } from '@/editor';
import { inferLanguageFromPath } from '../lib/language';

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
  /** True while an external change is being applied — suppresses the save-back loop. */
  applyingExternalChangeRef: React.MutableRefObject<boolean>;
}

/**
 * Manages the Monaco model lifecycle for a single file:
 * - Initializes the model on mount (reuses an existing model if MonacoProjectService
 *   already created it, otherwise falls back to reading from ZenFS).
 * - Subscribes to external file changes and applies them via pushEditOperations
 *   so that undo history is preserved.
 */
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

  // Initialize model on mount
  useEffect(() => {
    if (!monaco) return;

    async function initializeModel() {
      try {
        setLoading(true);
        setError(null);

        const uri = monaco!.Uri.file(fullPath);

        // If MonacoProjectService already created the model, reuse it directly.
        // Reading from ZenFS and calling setValue would trigger onChange →
        // a redundant debounced save of the same content.
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

  // Keep model in sync with non-editor writes (e.g., Blockly, compiler)
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
