import type { CodePanelProps } from '@/project';
import { CodeEditor } from '../code/code-editor';

export function CodePanel({ filePath }: CodePanelProps) {
  return <CodeEditor filePath={filePath} />;
}
