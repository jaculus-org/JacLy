import { CodeEditorReadOnly } from '../code-editor-read';

export function GeneratedCode() {
  const filePath = 'build/index.js';
  return <CodeEditorReadOnly filePath={filePath} />;
}
