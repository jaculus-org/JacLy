import { fs } from '@zenfs/core';
import { useEffect, useState } from 'react';
import Editor from '@monaco-editor/react';

const fsp = fs.promises;

interface CodePanelProps {
  readonly filePath: string;
  readonly readOnly?: boolean;
  readonly ifNotExists: 'create' | 'loading' | 'error';
  readonly loadingMessage?: string;
}

function CodeLoadingSpinner({ loadingMessage }: { loadingMessage?: string }) {
  return (
    <div className="h-full w-full bg-slate-900 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        {/* Animated spinner */}
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-3 border-transparent border-t-blue-500 border-r-blue-400 animate-spin" />
          <div className="absolute inset-2 rounded-full border-3 border-transparent border-b-purple-500 border-l-purple-400 animate-spin-reverse" />
        </div>
        <p className="text-slate-300 text-sm">{loadingMessage}</p>
      </div>
    </div>
  );
}

export function CodePanel({
  filePath,
  readOnly = false,
  ifNotExists,
  loadingMessage = 'Loading file...',
}: CodePanelProps) {
  const [code, setCode] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadFile() {
      try {
        setLoading(true);
        setError(null);
        const data = await fsp.readFile(filePath, 'utf-8');
        setCode(data);
      } catch (error) {
        console.error('Error loading file:', error);
        setError(error instanceof Error ? error.message : 'Unknown error');

        // Handle ifNotExists logic
        if (ifNotExists === 'create') {
          setCode(''); // Create empty file
          await fsp.writeFile(filePath, '', 'utf-8').catch(err => {
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
        for await (const change of fsp.watch(filePath)) {
          if (change.eventType === 'change') {
            // File has changed, reload it
            const data = await fsp.readFile(filePath, 'utf-8');
            setCode(data);
          }
        }
      } catch (error) {
        console.error('Error watching file:', error);
      }
    }

    loadFile();
    watchFile();
  }, [filePath, ifNotExists]);

  async function handleEditorChange(value: string | undefined) {
    if (value !== undefined && !readOnly) {
      setCode(value);
      await fsp.writeFile(filePath, value, 'utf-8');
    }
  }

  // Show loading spinner when code is undefined or still loading
  if (code === undefined || loading) {
    return <CodeLoadingSpinner loadingMessage={loadingMessage} />;
  }

  // Show error state if there's an error and ifNotExists is 'error'
  if (error && ifNotExists === 'error') {
    return (
      <div className="h-full w-full bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-sm mb-2">Error loading file</p>
          <p className="text-slate-400 text-xs">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <Editor
      height="100%"
      language="typescript"
      theme="vs-dark"
      value={code}
      options={{
        readOnly: readOnly ?? false,
        renderValidationDecorations: 'off',
      }}
      onChange={handleEditorChange}
    />
  );
}
