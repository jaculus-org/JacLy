import { CodeEditorBasic } from './code-editor-basic';

interface CodeEditorReadOnlyProps {
  readonly filePath: string;
}

export function CodeEditorReadOnly({ filePath }: CodeEditorReadOnlyProps) {
  return (
    <CodeEditorBasic filePath={filePath} readOnly={true} ifNotExists="error" />
  );
}
