import type { CodePanelProps } from '@/project/types/flexlayout-type';
import { CodeEditor } from '../code/code-editor';

export function CodePanel({ filePath }: CodePanelProps) {
  return <CodeEditor filePath={filePath} />;
}
