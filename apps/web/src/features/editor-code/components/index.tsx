import Editor, { type OnMount } from '@monaco-editor/react';
import { debounce } from '@/lib/utils/debouncer';
import { useMemo, useRef } from 'react';
import { useActiveProject } from '@/features/project/active-project';
import { inferLanguageFromPath } from '../lib/language';

interface CodeEditorProps {
  readonly filePath?: string;
  readonly readOnly?: boolean;
}

export function CodeEditor({ filePath, readOnly = false }: CodeEditorProps) {
  const {
    state: { fsp, projectPath },
  } = useActiveProject();
  const saveFile = useMemo(
    () =>
      debounce(async (path: string, content: string) => {
        try {
          await fsp.writeFile(`${projectPath}/${path}`, content, 'utf-8');
          console.log(`File saved: ${path}`);
        } catch (error) {
          console.error('Error saving file:', error);
        }
      }, 500),
    [projectPath, fsp]
  );

  const editorRef = useRef<Parameters<OnMount>[0] | null>(null);

  function handleEditorChange(value: string | undefined) {
    if (value && filePath) {
      saveFile(filePath, value);
    }
  }

  const handleEditorMount: OnMount = editor => {
    editorRef.current = editor;
  };

  if (!filePath) {
    return <div>No file selected.</div>;
  }

  return (
    <Editor
      path={filePath}
      defaultLanguage="plaintext"
      language={inferLanguageFromPath(filePath)}
      theme="vs-dark"
      onChange={handleEditorChange}
      onMount={handleEditorMount}
      options={{
        minimap: { enabled: false },
        automaticLayout: true,
        formatOnPaste: true,
        formatOnType: true,
        readOnly: readOnly,
      }}
    />
  );
}
