import { CodeEditorReadOnly } from '@/features/code-editor/components/code-editor-read';

export function GeneratedCode() {
  const filePath = 'build/index.js';
  return <CodeEditorReadOnly filePath={filePath} />;
}
