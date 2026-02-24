import { useActiveProject } from '@/features/project/active-project';
import { useTheme } from '@/features/theme/components/theme-provider';
import { JaclyEditor, JaclyLoading } from '@jaculus/jacly/editor';
import { enqueueSnackbar } from 'notistack';
import { useState, useEffect, useCallback } from 'react';
import { dirname } from 'path';
import { useJacDevice } from '@/features/jac-device/device';
import { getLocale } from '@/paraglide/runtime';
import { m } from '@/paraglide/messages';
import { editorSyncService } from '@/features/editor-code/lib/editor-sync-service';
import type { JaclyBlocksData } from '@jaculus/project';

export function JaclyEditorComponent() {
  const { themeNormalized } = useTheme();
  const {
    state: { fs, fsp },
    actions,
  } = useActiveProject();
  const { getFileName } = actions;
  const { state: jacState } = useJacDevice();
  const { jacProject, nodeModulesVersion } = jacState;

  const [initialJson, setInitialJson] = useState<object | null>(null);
  const [jaclyBlocksData, setJaclyBlocksData] =
    useState<JaclyBlocksData | null>(null);

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
        setJaclyBlocksData(jaclyData);

        console.log('Jacly editor data loaded successfully.');
      } catch (error) {
        console.error('Failed to load editor data:', error);
        enqueueSnackbar(m.editor_jacly_load_error(), { variant: 'error' });
        setInitialJson({});
        setJaclyBlocksData(null);
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
        editorSyncService.notifyExternalChange(filePath, code);
      } catch (error) {
        console.error('Failed to save generated code:', error);
        enqueueSnackbar(m.editor_jacly_save_code_error(), { variant: 'error' });
      }
    },
    [getFileName, ensureDirectory, writeFileWithRetry]
  );

  if (!initialJson || !jaclyBlocksData) {
    // TODO: replace it
    return <JaclyLoading />;
  }

  return (
    <JaclyEditor
      theme={themeNormalized}
      jaclyBlocksData={jaclyBlocksData}
      locale={getLocale()}
      initialJson={initialJson}
      onJsonChange={handleJsonChange}
      onGeneratedCode={handleGeneratedCode}
    />
  );
}
