import { useActiveProject } from '@/hooks/use-active-project';
import Editor, { type OnMount, useMonaco } from '@monaco-editor/react';
import { debounce } from '@/lib/utils/debaunder';
import { useCallback, useEffect, useRef, useState } from 'react';
import { inferLanguageFromPath } from '../lib/project-indexer';

interface CodeEditorProps {
  readonly filePath?: string;
  readonly readOnly?: boolean;
  //   readonly ifNotExists: 'create' | 'loading' | 'error';
  //   readonly loadingMessage?: string;
}

export function CodeEditor({
  filePath,
  readOnly = false,
  //   ifNotExists,
  //   loadingMessage,
}: CodeEditorProps) {
  const { fsp, projectPath } = useActiveProject();
  const monaco = useMonaco();
  const [modelContent, setModelContent] = useState<string>('');
  const saveFile = useCallback(
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

  // Load content from existing Monaco model
  useEffect(() => {
    if (!monaco || !filePath) return;

    const uri = monaco.Uri.file(filePath);
    const model = monaco.editor.getModel(uri);

    console.log(
      'Loading content for file:',
      filePath,
      uri.toString(),
      model,
      monaco.editor.getModels()
    );

    if (model) {
      setModelContent(model.getValue());
    } else {
      setModelContent('');
    }
  }, [monaco, filePath]);

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
      defaultValue={modelContent}
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
