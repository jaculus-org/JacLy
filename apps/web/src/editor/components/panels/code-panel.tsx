import type { CodePanelProps } from '@/project/types/flexlayout-type';
import { CodeEditorBasic } from '../code-editor';

export function CodePanel({ filePath }: CodePanelProps) {
  return <CodeEditorBasic filePath={filePath} ifNotExists="create" />;
}
