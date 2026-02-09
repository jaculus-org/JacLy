import { useActiveProject } from '@/features/project/provider/active-project-provider';
import { useTheme } from '@/features/theme/components/theme-provider';
import { JaclyEditor, JaclyLoading } from '@jaculus/jacly/editor';
import { enqueueSnackbar } from 'notistack';
import { useState, useEffect } from 'react';
import { dirname } from 'path';
import { useJacDevice } from '@/features/jac-device/provider/jac-device-provider';
import type { JaclyBlocksFiles } from '@jaculus/project';
import { getLocale } from '@/paraglide/runtime';
import '../styles/toolbox.css';

export function JaclyEditorComponent() {
  const { themeNormalized } = useTheme();
  const { fs, fsp, getFileName } = useActiveProject();
  const { jacProject } = useJacDevice();

  const [initialJson, setInitialJson] = useState<object | null>(null);
  const [jaclyBlockFiles, setJaclyBlockFiles] =
    useState<JaclyBlocksFiles | null>(null);
  const [jaclyTranslations, setJaclyTranslations] = useState<
    Record<string, string> | undefined
  >(undefined);

  useEffect(() => {
    (async () => {
      try {
        if (!jacProject) {
          enqueueSnackbar('No Jacly project loaded.', { variant: 'error' });
          setInitialJson({});
          setJaclyBlockFiles({});
          return;
        }

        // Load initial JSON
        const jaclyFile = getFileName('JACLY_INDEX');
        const dirnamePath = dirname(jaclyFile);
        if (!fs.existsSync(dirnamePath)) {
          await fsp.mkdir(dirnamePath, { recursive: true });
        }

        let jsonData;
        if (fs.existsSync(jaclyFile)) {
          const data = fs.readFileSync(jaclyFile, 'utf-8');
          jsonData = JSON.parse(data);
        } else {
          await fsp.writeFile(jaclyFile, JSON.stringify({}, null, 2), 'utf-8');
          jsonData = {};
        }
        setInitialJson(jsonData);

        const jaclyData = await jacProject.getJaclyData(getLocale());
        setJaclyBlockFiles(jaclyData.blockFiles);
        setJaclyTranslations(jaclyData.translations);

        console.log('Jacly editor data loaded successfully.');
      } catch (error) {
        console.error('Failed to load editor data:', error);
        enqueueSnackbar('Failed to load editor data.', { variant: 'error' });
        setInitialJson({});
        setJaclyBlockFiles({});
      }
    })();
  }, [fs, fsp, getFileName, jacProject]);

  async function handleJsonChange(workspaceJson: object) {
    try {
      const filePath = getFileName('JACLY_INDEX');
      const dirnamePath = dirname(filePath);
      if (!fs.existsSync(dirnamePath)) {
        await fsp.mkdir(dirnamePath, { recursive: true });
      }

      await fsp.writeFile(
        filePath,
        JSON.stringify(workspaceJson, null, 2),
        'utf-8'
      );
    } catch (error) {
      enqueueSnackbar('Failed to save JSON.', { variant: 'error' });
      console.error('Failed to save JSON:', error);
    }
  }

  async function handleGeneratedCode(code: string) {
    try {
      const filePath = getFileName('GENERATED_CODE');
      const dirnamePath = dirname(filePath);
      if (!fs.existsSync(dirnamePath)) {
        await fsp.mkdir(dirnamePath, { recursive: true });
      }

      await fsp.writeFile(filePath, code, 'utf-8');
    } catch (error) {
      enqueueSnackbar('Failed to save generated code.', { variant: 'error' });
      console.error('Failed to save generated code:', error);
    }
  }

  if (!initialJson || !jaclyBlockFiles) {
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
