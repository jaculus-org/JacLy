import { CodeEditorRead } from './code-editor-read';

export function GeneratedCode() {
  const filePath = 'build/index.js';
  return <CodeEditorRead filePath={filePath} />;
}