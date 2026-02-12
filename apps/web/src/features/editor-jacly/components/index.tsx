import { useActiveProject } from '@/features/project/provider/active-project-provider';
import { useTheme } from '@/features/theme/components/theme-provider';
import { JaclyEditor, JaclyLoading } from '@jaculus/jacly/editor';
import { enqueueSnackbar } from 'notistack';
import { useState, useEffect, useCallback } from 'react';
import { dirname } from 'path';
import { useJacDevice } from '@/features/jac-device/provider/jac-device-provider';
import type { JaclyBlocksFiles } from '@jaculus/project';
import { getLocale } from '@/paraglide/runtime';
import { m } from '@/paraglide/messages';
import '../styles/toolbox.css';

export function JaclyEditorComponent() {
  const { themeNormalized } = useTheme();
  const { fs, fsp, getFileName } = useActiveProject();
  const { jacProject, nodeModulesVersion } = useJacDevice();

  const [initialJson, setInitialJson] = useState<object | null>(null);
  const [jaclyBlockFiles, setJaclyBlockFiles] =
    useState<JaclyBlocksFiles | null>(null);
  const [jaclyTranslations, setJaclyTranslations] = useState<
    Record<string, string> | undefined
  >(undefined);

  const ensureDirectory = useCallback(
    async (dirPath: string) => {
      try {
        await fsp.mkdir(dirPath, { recursive: true });
      } catch (error: unknown) {
        const err = error as { code?: string };
        if (err?.code !== 'EEXIST') {
          throw error;
        }
      }
    },
    [fsp]
  );

  const writeFileWithRetry = useCallback(
    async (filePath: string, content: string) => {
      try {
        await fsp.writeFile(filePath, content, 'utf-8');
      } catch (error: unknown) {
        const err = error as { code?: string };
        if (err?.code === 'EEXIST') {
          await fsp.writeFile(filePath, content, 'utf-8');
        } else {
          throw error;
        }
      }
    },
    [fsp]
  );

  useEffect(() => {
    (async () => {
      try {
        if (!jacProject) return;

        console.log('Loading Jacly editor data...');

        const jaclyFile = getFileName('JACLY_INDEX');
        await ensureDirectory(dirname(jaclyFile));

        let jsonData;
        if (fs.existsSync(jaclyFile)) {
          const data = fs.readFileSync(jaclyFile, 'utf-8');
          jsonData = JSON.parse(data);
        } else {
          await writeFileWithRetry(jaclyFile, JSON.stringify({}, null, 2));
          jsonData = {};
        }
        setInitialJson(jsonData);

        const jaclyData = await jacProject.getJaclyData(getLocale());
        setJaclyBlockFiles(jaclyData.blockFiles);
        setJaclyTranslations(jaclyData.translations);

        console.log('Jacly editor data loaded successfully.');
      } catch (error) {
        console.error('Failed to load editor data:', error);
        enqueueSnackbar(m.editor_jacly_load_error(), { variant: 'error' });
        setInitialJson({});
        setJaclyBlockFiles({});
      }
    })();
  }, [
    fs,
    getFileName,
    jacProject,
    nodeModulesVersion,
    ensureDirectory,
    writeFileWithRetry,
  ]);

  const handleJsonChange = useCallback(
    async (workspaceJson: object) => {
      try {
        const filePath = getFileName('JACLY_INDEX');
        await ensureDirectory(dirname(filePath));
        await writeFileWithRetry(
          filePath,
          JSON.stringify(workspaceJson, null, 2)
        );
      } catch (error) {
        console.error('Failed to save JSON:', error);
        enqueueSnackbar(m.editor_jacly_save_json_error(), { variant: 'error' });
      }
    },
    [getFileName, ensureDirectory, writeFileWithRetry]
  );

  const handleGeneratedCode = useCallback(
    async (code: string) => {
      console.log('Generated code received, saving to file...');
      try {
        const filePath = getFileName('GENERATED_CODE');
        await ensureDirectory(dirname(filePath));
        await writeFileWithRetry(filePath, code);
      } catch (error) {
        console.error('Failed to save generated code:', error);
        enqueueSnackbar(m.editor_jacly_save_code_error(), { variant: 'error' });
      }
    },
    [getFileName, ensureDirectory, writeFileWithRetry]
  );

  if (!initialJson || !jaclyBlockFiles || !jaclyTranslations) {
    return <JaclyLoading />;
  }

  return (
    <JaclyEditor
      theme={themeNormalized}
      jaclyBlockFiles={jaclyBlockFiles}
      locale={getLocale()}
      jaclyTranslations={jaclyTranslations}
      initialJson={initialJson}
      onJsonChange={handleJsonChange}
      onGeneratedCode={handleGeneratedCode}
    />
  );
}
