import { CodeEditor } from '@/features/editor/components';

export function GeneratedCode() {
  const filePath = 'build/index.js';
  return <CodeEditor filePath={filePath} readOnly={true} />;
}
