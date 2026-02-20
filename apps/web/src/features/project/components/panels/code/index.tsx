import { CodeEditorBasic } from '@/features/editor-code/components/code-editor-basic';
import type { CodePanelProps } from '@/features/project/types/flexlayout-type';

export function CodePanel({ filePath }: CodePanelProps) {
  return <CodeEditorBasic filePath={filePath} ifNotExists="create" />;
}
