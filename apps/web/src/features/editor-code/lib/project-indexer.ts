import { useMonaco } from '@monaco-editor/react';
import { enqueueSnackbar } from 'notistack';
import { inferLanguageFromPath } from './language';

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
      '@/features/editor-code/lib/loader'
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

export function watchMonacoFiles(
  monaco: ReturnType<typeof useMonaco>,
  projectPath: string,
  fs: typeof import('fs')
): () => void {
  if (!monaco || !projectPath || !fs) {
    return () => {};
  }

  const watcher = fs.watch(
    projectPath,
    { recursive: true },
    async (eventType, filename) => {
      if (!filename) return;

      // Construct full path - handle both forward and backward slashes
      const fullPath = `${projectPath}/${filename}`.replace(/\\/g, '/');
      const uri = monaco.Uri.file(fullPath);

      try {
        if (eventType === 'change') {
          // File was modified - read and update content
          const content = await fs.promises.readFile(fullPath, 'utf-8');
          const existingModel = monaco.editor.getModel(uri);

          if (existingModel) {
            existingModel.setValue(content);
          } else {
            // File was created but model doesn't exist yet
            monaco.editor.createModel(
              content,
              inferLanguageFromPath(fullPath),
              uri
            );
          }
        } else if (eventType === 'rename') {
          // 'rename' event fires for both creation and deletion
          const exists = fs.existsSync(fullPath);

          if (exists) {
            // File was created or renamed to this path
            try {
              const content = await fs.promises.readFile(fullPath, 'utf-8');
              const existingModel = monaco.editor.getModel(uri);

              if (existingModel) {
                existingModel.setValue(content);
              } else {
                monaco.editor.createModel(
                  content,
                  inferLanguageFromPath(fullPath),
                  uri
                );
              }
            } catch {
              // File might be a directory or unreadable
              console.debug('Could not read file:', filename);
            }
          } else {
            // File was deleted or renamed away
            const existingModel = monaco.editor.getModel(uri);
            if (existingModel) {
              existingModel.dispose();
            }
          }
        }
      } catch (error) {
        console.error('Error updating Monaco model for file:', filename, error);
        enqueueSnackbar(`Error updating file: ${filename}`, {
          variant: 'error',
        });
      }
    }
  );

  // Return cleanup function to stop watching
  return () => {
    watcher.close();
  };
}
