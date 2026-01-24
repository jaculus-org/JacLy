import { m } from '@/paraglide/messages';
import { useActiveProject } from '@/features/project/provider/active-project-provider';
import { useTheme } from '@/features/theme/components/theme-provider';
import Editor from '@monaco-editor/react';
import { useEffect, useState } from 'react';
import { inferLanguageFromPath } from '../lib/language';

interface CodeEditorReadOnlyProps {
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
}: CodeEditorReadOnlyProps) {
  const { fsp, projectPath } = useActiveProject();
  const { themeNormalized } = useTheme();

  const [code, setCode] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fullPath = `${projectPath}/${filePath}`;
  const readOnlyInternal = filePath.startsWith('build/') ? true : readOnly;

  useEffect(() => {
    async function loadFile() {
      try {
        setLoading(true);
        setError(null);
        const data = await fsp.readFile(fullPath, 'utf-8');
        setCode(data);
      } catch (error) {
        console.error('Error loading file:', error);
        setError(error instanceof Error ? error.message : 'Unknown error');

        // Handle ifNotExists logic
        if (ifNotExists === 'create') {
          setCode(''); // Create empty file
          await fsp.writeFile(fullPath, '', 'utf-8').catch(err => {
            console.error('Error creating file:', err);
          });
        } else if (ifNotExists === 'error') {
          setCode(undefined);
        }
      } finally {
        setLoading(false);
      }
    }

    async function watchFile() {
      try {
        for await (const change of fsp.watch(fullPath)) {
          if (change.eventType === 'change') {
            // File has changed, reload it
            const data = await fsp.readFile(fullPath, 'utf-8');
            setCode(data);
          }
        }
      } catch (error) {
        console.error('Error watching file:', error);
      }
    }

    loadFile();
    watchFile();
  }, [filePath, ifNotExists, fsp, fullPath]);

  async function handleEditorChange(value: string | undefined) {
    if (value !== undefined && !readOnlyInternal) {
      setCode(value);
      await fsp.writeFile(fullPath, value, 'utf-8');
    }
  }

  // Show loading spinner when code is undefined or still loading
  if (code === undefined || loading) {
    return <div>{loadingMessage ?? m.editor_loading()}</div>;
  }

  // Show error state if there's an error and ifNotExists is 'error'
  if (error && ifNotExists === 'error') {
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
      language={inferLanguageFromPath(filePath)}
      // theme="vs-dark"
      theme={themeNormalized === 'dark' ? 'vs-dark' : 'light'}
      value={code}
      options={{
        readOnly: readOnlyInternal,
        renderValidationDecorations: 'off',
        minimap: { enabled: false },
      }}
      onChange={handleEditorChange}
    />
  );
}
