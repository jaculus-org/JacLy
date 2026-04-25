import { CodeEditorRead } from './code-editor-read';
import { CodeEditorRW } from './code-editor-rw';

interface CodeEditorProps {
  readonly filePath: string;
  readonly readOnly?: boolean;
  // readonly ifNotExists: 'create' | 'loading' | 'error';
  // readonly loadingMessage?: string;
}

export function CodeEditor({ filePath, readOnly = false }: CodeEditorProps) {
  // const readonlyPrefixes = ['build/', 'node_modules/'];
  // const readonlySuffixes = ['.jacly'];
  const isReadOnly = readOnly; // ||
  // readonlyPrefixes.some((prefix) => filePath.startsWith(prefix)) ||
  // readonlySuffixes.some((suffix) => filePath.endsWith(suffix));

  if (isReadOnly) {
    return <CodeEditorRead filePath={filePath} />;
  } else {
    return <CodeEditorRW filePath={filePath} />;
  }
}
