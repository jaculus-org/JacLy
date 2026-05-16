import type { CodePanelProps } from '@/project';
import { CodeEditor } from './code-editor';

export function CodePanel({ filePath }: CodePanelProps) {
  return <CodeEditor filePath={filePath} />;
}