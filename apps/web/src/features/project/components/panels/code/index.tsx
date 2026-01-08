import { CodeEditorBasic } from '@/features/code-editor/components/code-editor-basic';

interface CodePanelProps {
  filePath: string;
}

export function CodePanel({ filePath }: CodePanelProps) {
  return <CodeEditorBasic filePath={filePath} ifNotExists="create" />;
}
