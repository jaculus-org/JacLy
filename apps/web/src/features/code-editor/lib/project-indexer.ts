import { useMonaco } from '@monaco-editor/react';
import { enqueueSnackbar } from 'notistack';

export function inferLanguageFromPath(path: string): string {
  if (!path) return 'plaintext';
  const extension = path.split('.').pop()?.toLowerCase();
  switch (extension) {
    case 'ts':
    case 'tsx':
      return 'typescript';
    case 'js':
    case 'jsx':
      return 'javascript';
    case 'json':
      return 'json';
    default:
      return 'plaintext';
  }
}

export async function indexMonacoFiles(
  monaco: ReturnType<typeof useMonaco>,
  projectPath: string,
  fsp: typeof import('fs').promises
) {
  // console.log(
  //   'Indexing Monaco files for project at:',
  //   projectPath,
  //   monaco,
  //   fsp
  // );

  if (!monaco || !projectPath || !fsp) return;

  // monaco.languages.typescript.typescriptDefaults.setCompilerOptions()

  monaco.languages.typescript.typescriptDefaults.setEagerModelSync(true);
  monaco.languages.typescript.javascriptDefaults.setEagerModelSync(true);

  try {
    const { loadProjectFiles } = await import(
      '@/features/code-editor/lib/loader'
    );
    const fileEntries = await loadProjectFiles(projectPath, fsp);

    fileEntries.forEach(({ path, content }) => {
      // create valid Monaco URI
      const uri = monaco.Uri.file(path);
      // console.log('Indexing file in Monaco:', path, uri.toString(), content);

      const existingModel = monaco.editor.getModel(uri);
      if (existingModel) {
        existingModel.setValue(content);
      } else {
        monaco.editor.createModel(content, inferLanguageFromPath(path), uri);
      }
    });
  } catch (error) {
    console.error('Error indexing project files:', error);
    enqueueSnackbar('Error indexing project files', { variant: 'error' });
  }
}
