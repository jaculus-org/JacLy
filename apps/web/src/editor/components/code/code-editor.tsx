import { JaclyFiles } from '@/project/types/jacly-files';
import { CodeEditorRead } from './code-editor-read';
import { CodeEditorRW } from './code-editor-rw';

interface CodeEditorProps {
  readonly filePath: string;
  readonly readOnly?: boolean;
  // readonly ifNotExists: 'create' | 'loading' | 'error';
  // readonly loadingMessage?: string;
}

export function CodeEditor({ filePath, readOnly = false }: CodeEditorProps) {
  const isManagedJaclyFile =
    filePath === JaclyFiles.JACLY_INDEX || filePath === JaclyFiles.GENERATED_CODE;
  const isReadOnly = readOnly || isManagedJaclyFile;

  if (isReadOnly) {
    return <CodeEditorRead filePath={filePath} />;
  } else {
    return <CodeEditorRW filePath={filePath} />;
  }
}
