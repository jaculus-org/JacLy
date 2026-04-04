import { CodeEditorReadOnly } from '@/editor';

export function GeneratedCode() {
  const filePath = 'build/index.js';
  return <CodeEditorReadOnly filePath={filePath} />;
}
