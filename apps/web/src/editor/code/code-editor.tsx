import { JaclyFiles } from '@/project';
import { CodeEditorRead } from './code-editor-read';
import { CodeEditorRW } from './code-editor-rw';

interface CodeEditorProps {
  readonly filePath: string;
  readonly readOnly?: boolean;
}

export function CodeEditor({ filePath, readOnly = false }: CodeEditorProps) {
  const isManagedJaclyFile =
    filePath === JaclyFiles.JACLY_INDEX || filePath === JaclyFiles.GENERATED_CODE;
  const isReadOnly = readOnly || isManagedJaclyFile;

  if (isReadOnly) {
    return <CodeEditorRead filePath={filePath} />;
  }
  return <CodeEditorRW filePath={filePath} />;
}
