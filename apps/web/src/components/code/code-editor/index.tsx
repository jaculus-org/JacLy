import { useTheme } from '@/providers/theme-provider';
import Editor from '@monaco-editor/react';
import { editor } from 'monaco-editor';

interface CodeEditorProps {
  options?: editor.IStandaloneEditorConstructionOptions;
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
    contextmenu: true,
  };

  return (
    <Editor
      width="100%"
      height="100%"
      language={language}
      theme={themeNormalized === 'dark' ? 'vs-dark' : 'vs-light'}
      value={value}
      options={options}
    />
  );
}
