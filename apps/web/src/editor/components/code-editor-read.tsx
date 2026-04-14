import { CodeEditorBasic } from './code-editor';

interface CodeEditorReadOnlyProps {
  readonly filePath: string;
}

export function CodeEditorReadOnly({ filePath }: CodeEditorReadOnlyProps) {
  return <CodeEditorBasic filePath={filePath} readOnly={true} ifNotExists="error" />;
}
