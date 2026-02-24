import { CodeEditorReadOnly } from '@/features/editor-code';

export function GeneratedCode() {
  const filePath = 'build/index.js';
  return <CodeEditorReadOnly filePath={filePath} />;
}
