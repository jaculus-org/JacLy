import { CodeEditor } from '@/features/editor/components';

interface CodePanelProps {
  filePath: string;
}

export function CodePanel({ filePath }: CodePanelProps) {
  return <CodeEditor filePath={filePath} />;
}
