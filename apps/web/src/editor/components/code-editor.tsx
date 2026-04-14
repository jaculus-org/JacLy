import {
  getService,
  IConfigurationService,
  ITextModelService,
} from '@codingame/monaco-vscode-api/services';
import * as monaco from 'monaco-editor';
import { useEffect, useRef, useState } from 'react';
import { useTheme } from '@/core/components/theme';
import { m } from '@/core/paraglide/messages';
import { inferLanguageFromPath } from '@/editor/services/language';
import { useActiveProject } from '@/project';

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

  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [_retryNonce, setRetryNonce] = useState(0);

  const fullPath = `${projectPath}/${filePath}`;
  const readOnlyInternal = filePath.startsWith('build/') ? true : readOnly;

  useEffect(() => {
    if (!containerRef.current) return;
    let disposed = false;
    let editor: monaco.editor.IStandaloneCodeEditor | null = null;
    let modelRef: {
      dispose(): void;
      object: { textEditorModel: unknown };
    } | null = null;
    let saveTimer: ReturnType<typeof setTimeout> | undefined;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;
    let pollTimer: ReturnType<typeof setInterval> | undefined;

    (async () => {
      try {
        setStatus('loading');
        setErrorMsg(null);

        if (ifNotExists === 'create') {
          try {
            await fsp.stat(fullPath);
          } catch {
            await fsp.writeFile(fullPath, '', 'utf-8');
          }
        }

        if (disposed) return;

        const textModelService = await getService(ITextModelService);
        const uri = monaco.Uri.file(fullPath);
        modelRef = await textModelService.createModelReference(uri);
        if (disposed) return;

        const model = modelRef.object.textEditorModel as monaco.editor.ITextModel | null;
        if (!model) {
          throw new Error(`Could not resolve editor model for ${fullPath}`);
        }

        const languageId = inferLanguageFromPath(filePath);
        if (model.getLanguageId() !== languageId) {
          monaco.editor.setModelLanguage(model, languageId);
        }
        editor = monaco.editor.create(containerRef.current!, {
          model,
          readOnly: readOnlyInternal,
          minimap: { enabled: false },
          automaticLayout: true,
        });

        // activateLanguageFeatures(languageId, uri, model);

        let lastUserEditTime = 0;
        if (!readOnlyInternal) {
          const saveNow = async () => {
            if (disposed) return;
            try {
              console.log('Saving now file:', fullPath);
              await fsp.writeFile(fullPath, model.getValue(), 'utf-8');
            } catch (err) {
              console.error('Error saving file:', err);
            }
          };
          const scheduleSave = () => {
            lastUserEditTime = Date.now();
            if (saveTimer !== undefined) clearTimeout(saveTimer);
            saveTimer = setTimeout(saveNow, 50);
          };
          editor.onDidChangeModelContent(scheduleSave);
          editor.onDidBlurEditorWidget(saveNow);
          editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, saveNow);
        }

        // poll for external changes
        pollTimer = setInterval(async () => {
          if (disposed || Date.now() - lastUserEditTime < 2000) return;
          try {
            const diskContent = await fsp.readFile(fullPath, 'utf-8');
            if (diskContent !== model.getValue()) {
              const pos = editor?.getPosition();
              model.pushEditOperations(
                [],
                [{ range: model.getFullModelRange(), text: diskContent }],
                () => null,
              );
              if (pos) editor?.setPosition(pos);
            }
          } catch {
            // file temporarily unavailable
          }
        }, 1000);

        setStatus('ready');
      } catch (err) {
        if (disposed) return;

        if (ifNotExists === 'loading') {
          retryTimer = setTimeout(() => setRetryNonce((value) => value + 1), 500);
          setStatus('loading');
          return;
        }

        setErrorMsg(err instanceof Error ? err.message : 'Unknown error');
        setStatus('error');
        throw err;
      }
    })();

    return () => {
      disposed = true;
      if (saveTimer !== undefined) clearTimeout(saveTimer);
      if (retryTimer !== undefined) clearTimeout(retryTimer);
      if (pollTimer !== undefined) clearInterval(pollTimer);
      editor?.dispose();
      modelRef?.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fullPath, readOnlyInternal, ifNotExists, fsp, filePath]);

  useEffect(() => {
    const fallbackTheme = themeNormalized === 'dark' ? 'vs-dark' : 'vs';
    const workbenchTheme = themeNormalized === 'dark' ? 'Dark Modern' : 'Light Modern';

    monaco.editor.setTheme(fallbackTheme);
    void getService(IConfigurationService).then((service) => {
      void service.updateValue('workbench.colorTheme', workbenchTheme);
    });
  }, [themeNormalized]);

  return (
    <div className="relative h-full w-full">
      <div ref={containerRef} className="h-full w-full" />

      {status === 'loading' ? (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 text-sm">
          {loadingMessage ?? m.editor_loading()}
        </div>
      ) : null}

      {status === 'error' ? (
        <div className="absolute inset-0 bg-slate-100 dark:bg-slate-900 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 dark:text-red-400 text-sm mb-2">{m.editor_error_title()}</p>
            <p className="text-slate-600 dark:text-slate-400 text-xs">{errorMsg}</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
