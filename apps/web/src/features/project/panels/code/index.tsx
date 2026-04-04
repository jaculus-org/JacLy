import { CodeEditorBasic } from '@/editor';
import type { CodePanelProps } from '@/features/project/types/flexlayout-type';

export function CodePanel({ filePath }: CodePanelProps) {
  return <CodeEditorBasic filePath={filePath} ifNotExists="create" />;
}
