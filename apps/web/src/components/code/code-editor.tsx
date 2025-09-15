import MonacoEditor, { monaco } from 'react-monaco-editor';
import { useTheme } from '../theme-provider';

interface CodeEditorProps {
  options?: monaco.editor.IStandaloneEditorConstructionOptions;
  editable?: boolean;
  language?: string;
  value?: string;
}

export function CodeEditor({
  options,
  editable = true,
  language = 'javascript',
  value,
}: CodeEditorProps) {
  const { themeNormalized } = useTheme();
  options = {
    ...options,
    readOnly: !editable,
    minimap: { enabled: false },
    fontSize: 13,
    automaticLayout: true,
  };

  return (
    <MonacoEditor
      width="100%"
      height="100%"
      language={language}
      theme={themeNormalized === 'dark' ? 'vs-dark' : 'vs-light'}
      value={value}
      options={options}
    />
  );
}
