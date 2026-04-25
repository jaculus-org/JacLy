import { CodeEditorRead } from '../code/code-editor-read';

export function GeneratedCode() {
  const filePath = 'build/index.js';
  return <CodeEditorRead filePath={filePath} />;
}
