import { useJacProject } from '@/providers/jac-project-provider';
import { useTheme } from '@/providers/theme-provider';
import { JaclyEditor } from '@jaculus/jacly/ui';
import { enqueueSnackbar } from 'notistack';
import { useEffect } from 'react';

export function BlocklyEditorPanel() {
  const { themeNormalized } = useTheme();
  const { projectInstance } = useJacProject();

  async function onCodeChange(code: string) {
    console.log('Blockly code changed:', code);
  }

  useEffect(() => {
    async function loadJaclyFiles() {
      enqueueSnackbar('Loading JacLy files into Blockly...', {
        variant: 'info',
      });
      try {
        await projectInstance.install();
        const jaclyFiles = await projectInstance.getJacLyFiles();
        console.log('Loading JacLy files into Blockly:', jaclyFiles);
      } catch (error) {
        console.error('Error loading JacLy files into Blockly:', error);
        enqueueSnackbar('Failed to load JacLy files into Blockly.', {
          variant: 'error',
        });
      }
    }
    setTimeout(() => {
      loadJaclyFiles();
    }, 1000);
  }, [projectInstance]);

  return (
    <JaclyEditor
      theme={themeNormalized}
      onCodeChange={async code => await onCodeChange(code)}
    />
  );
}
