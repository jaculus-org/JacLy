import Editor from '@monaco-editor/react';
import { useEffect, useState } from 'react';
import { useTheme } from '@/core/components/theme';
import { m } from '@/core/paraglide/messages';
import { useActiveProject } from '@/project';
import { inferLanguageFromPath } from '../services/language';

// import { debounce } from '@jaculus/jacly/utils';

interface CodeEditorBasicProps {
  readonly filePath: string;
  readonly readOnly?: boolean;
  readonly ifNotExists: 'create' | 'loading' | 'error';
  readonly loadingMessage?: string;
}

export function CodeEditorBasic({
  filePath,
  readOnly = false,
  loadingMessage,
}: CodeEditorBasicProps) {
  const {
    state: { projectPath, monacoService },
  } = useActiveProject();
  const { themeNormalized } = useTheme();
  const [loading, setLoading] = useState(true);

  const fullPath = `${projectPath}/${filePath}`;
  const readOnlyInternal = filePath.startsWith('build/') ? true : readOnly;

  useEffect(() => {
    async function loadFile() {
      if (!monacoService) return;
      await monacoService.requestFile(filePath);
      setLoading(false);
    }

    loadFile();

    return () => {
      monacoService?.closeFile(filePath);
    };
  }, [fullPath]);

  function handleEditorChange(value: string | undefined) {
    if (value === undefined) return;
    if (monacoService?.isExternalUpdate(filePath)) return;
    monacoService?.updateFile(filePath, value);
  }

  if (loading) {
    return <div>{loadingMessage ?? m.editor_loading()}</div>;
  }

  // if (!fileExists && ifNotExists === 'error') {
  //   return (
  //     <div className="h-full w-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center">
  //       <div className="text-center">
  //         <p className="text-red-600 dark:text-red-400 text-sm mb-2">
  //           {m.editor_error_title()}
  //         </p>
  //         <p className="text-slate-600 dark:text-slate-400 text-xs">{error}</p>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <Editor
      height="100%"
      path={fullPath}
      language={inferLanguageFromPath(filePath)}
      theme={themeNormalized === 'dark' ? 'vs-dark' : 'light'}
      options={{
        readOnly: readOnlyInternal,
        minimap: { enabled: false },
        automaticLayout: true,
      }}
      onChange={handleEditorChange}
    />
  );
}
