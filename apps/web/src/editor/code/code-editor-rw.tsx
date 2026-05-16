import Editor from '@monaco-editor/react';
import { useEffect, useState } from 'react';
import { useTheme } from '@/core/components/theme';
import { m } from '@/core/paraglide/messages';
import { useActiveProject } from '@/project';
import { inferLanguageFromPath } from '../services/language';

interface CodeEditorRWProps {
  readonly filePath: string;
  readonly readOnly?: boolean;
}

export function CodeEditorRW({ filePath }: CodeEditorRWProps) {
  const {
    state: { projectPath, monacoService },
  } = useActiveProject();
  const { themeNormalized } = useTheme();
  const [loading, setLoading] = useState(true);

  const fullPath = `${projectPath}/${filePath}`;

  useEffect(() => {
    async function loadFile() {
      if (!monacoService) return;
      await monacoService.requestFile(filePath);
      setLoading(false);
    }

    loadFile();

    return () => {
      monacoService?.closeFile(filePath);
    };
  }, [fullPath]);

  function handleEditorChange(value: string | undefined) {
    if (value === undefined) return;
    monacoService?.updateFile(filePath, value);
  }

  if (loading) {
    return <div>{m.editor_loading()}</div>;
  }

  return (
    <Editor
      height="100%"
      path={fullPath}
      language={inferLanguageFromPath(filePath)}
      theme={themeNormalized === 'dark' ? 'vs-dark' : 'light'}
      options={{
        minimap: { enabled: false },
        automaticLayout: true,
        fixedOverflowWidgets: true,
      }}
      onChange={handleEditorChange}
    />
  );
}
