import { CodeEditor } from '@/features/code-editor/components';

interface CodePanelProps {
  filePath: string;
}

export function CodePanel({ filePath }: CodePanelProps) {
  return <CodeEditor filePath={filePath} />;
}
