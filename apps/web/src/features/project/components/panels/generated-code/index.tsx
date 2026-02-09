import { CodeEditorReadOnly } from '@/features/editor-code/components/code-editor-read';

export function GeneratedCode() {
  const filePath = 'build/index.js';
  return <CodeEditorReadOnly filePath={filePath} />;
}
